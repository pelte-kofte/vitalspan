---
phase: 08-biomarker-sync-write-path
reviewed: 2026-06-01T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/db/create_biomarker_entries.sql
  - src/lib/biomarkerWriteService.ts
  - src/screens/BiomarkerEntryScreen.tsx
  - App.tsx
  - src/screens/DashboardScreen.tsx
findings:
  critical: 2
  warning: 3
  info: 3
  total: 8
status: issues_found
---

# Phase 08: Code Review Report

**Reviewed:** 2026-06-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Phase 8 wires a Supabase write path for biomarker entries on top of the existing AsyncStorage layer: a SQL schema with RLS, a write service (`syncEntry` / `migrateHistory`), a `syncEntry` call after every save in `BiomarkerEntryScreen`, and a Supabase-first read in `DashboardScreen`. The architecture is sound and the fire-and-forget pattern is implemented correctly at the service level.

Two blockers prevent the feature from working at all in production. First, the RLS policies grant access to the `anon` database role, but `signInAnonymously()` elevates callers to the `authenticated` role — so every read and write is silently denied. Second, the one-time migration in `App.tsx` races against `initSupabaseSession()`: because the session is not awaited before `migrateHistory` runs, `getUser()` always returns null on first launch, `migrateHistory` resolves early without pushing any data, and then `@vitalspan_migrated_v2` is immediately written to `'true'`, permanently preventing any future attempt.

---

## Critical Issues

### CR-01: RLS policies target the wrong database role — all reads and writes are denied

**File:** `src/db/create_biomarker_entries.sql:17-21`

**Issue:** Both policies are declared `TO anon`. In Supabase, the `anon` role is used only for completely unauthenticated requests (no session). After `signInAnonymously()` succeeds — which is the only auth path this app uses — the client JWT carries `role = authenticated`. The `anon` policy never applies to those requests. Additionally, `auth.uid()` always returns `null` for the `anon` role, so even the rare unauthenticated path could never satisfy `user_id = auth.uid()`. As written, no app user can ever read or insert a row.

**Fix:**
```sql
-- Replace both policies:

CREATE POLICY "users select own entries" ON biomarker_entries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users insert own entries" ON biomarker_entries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
```

---

### CR-02: Migration race condition permanently marks history as migrated before any data is pushed

**File:** `App.tsx:30-42`

**Issue:** `initSupabaseSession()` is called fire-and-forget (not awaited). Immediately after, the migration block reads `@vitalspan_migrated_v2` and calls `migrateHistory()`. When `migrateHistory` runs, `initSupabaseSession()` has not had time to establish a session, so `supabase.auth.getUser()` returns `{ user: null }`. `migrateHistory` warns and returns — it **resolves** (does not reject) on the no-user path. Because it resolves, the `.then(() => AsyncStorage.setItem('@vitalspan_migrated_v2', 'true'))` chain fires unconditionally. The migration flag is set to `'true'` even though zero rows were written. The migration can never run again.

**Fix:** Await `initSupabaseSession()` before starting the migration block so a session is guaranteed to be present when `migrateHistory` calls `getUser()`.

```typescript
// App.tsx — inside the init() async function, replace the concurrent block:

await initSupabaseSession().catch((err) =>
  console.warn('[App] initSupabaseSession unexpected error:', err)
);

const migrated = await AsyncStorage.getItem('@vitalspan_migrated_v2').catch(() => null);
if (!migrated) {
  const raw = await AsyncStorage.getItem('@vitalspan_biomarkers').catch(() => null);
  const entries: StoredEntry[] = raw ? JSON.parse(raw) : [];
  await migrateHistory(entries).catch(() => null);
  if (entries.length > 0) {
    // Only stamp the flag when data was actually attempted
    await AsyncStorage.setItem('@vitalspan_migrated_v2', 'true').catch(() => null);
  }
}
```

Note: the flag should also only be committed after a successful (non-empty) migration attempt so a retry is possible if the first attempt fails for reasons other than missing auth (network error, etc.). The current service swallows all errors and always resolves, so callers cannot distinguish "migrated" from "silently failed". Consider having `migrateHistory` return a boolean success indicator, or restructure so the stamp only happens when `migrateHistory` completes without an internal warn.

---

## Warnings

### WR-01: No UPDATE policy — upsert conflict path is silently denied (migrateHistory idempotency claim is false)

**File:** `src/db/create_biomarker_entries.sql:23`

**Issue:** The schema comment says "safe to retry: upsert with onConflict: 'id' is idempotent." In Supabase/PostgreSQL, an `INSERT ... ON CONFLICT DO UPDATE` requires both INSERT and UPDATE permission. There is no UPDATE policy. If `migrateHistory` is ever retried with the same entry IDs (e.g., if the migration flag race is fixed and a second attempt is made), Supabase will return a permission error on the conflict path. The upsert is not actually idempotent as documented.

**Fix:** Add an UPDATE policy, or acknowledge and document that retries with conflicting IDs will produce a warning-level error that is absorbed by the service. If entries are truly append-only and IDs are always fresh, an alternative is to switch from `upsert` to `insert` with `ignoreDuplicates: true`:

```sql
-- Option A: add UPDATE policy to honour the idempotency claim
CREATE POLICY "users update own entries" ON biomarker_entries
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
```

```typescript
// Option B: in migrateHistory, use insert with ignoreDuplicates
const { error } = await supabase
  .from('biomarker_entries')
  .insert(rows, { ignoreDuplicates: true });
```

---

### WR-02: `saving` state is never reset to `false` on the success path — button can be stranded disabled

**File:** `src/screens/BiomarkerEntryScreen.tsx:112-129`

**Issue:** `setSaving(true)` is set on line 112. On success, `nav.goBack()` is called on line 126 without first resetting `setSaving(false)`. On the error path (line 129), `setSaving(false)` is called correctly. For a modal screen that unmounts on `goBack()` this is harmless in normal use, but if `goBack()` throws or the navigation stack keeps the screen mounted (e.g., a future refactor to push navigation), the Save button becomes permanently disabled with no user-visible error.

**Fix:**
```typescript
async function save() {
  if (!selected || !isValidValue || saving) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
  setSaving(true);
  try {
    // ...existing logic...
    syncEntry(entries[entries.length - 1]);
    setSaving(false);   // reset before navigating
    nav.goBack();
  } catch (e) {
    console.error(e);
    setSaving(false);
  }
}
```

---

### WR-03: `variable shadowing` — inner `raw` shadows outer `raw` in `App.tsx`

**File:** `App.tsx:19,35`

**Issue:** `raw` is declared with `const` on line 19 (profile data). A nested `.then()` callback on line 35 redeclares a parameter also named `raw` for biomarker data. TypeScript strict mode does not error on this because the inner `raw` is a callback parameter in a different scope, but it is confusing and error-prone. If the nesting were accidentally flattened in a refactor, the outer `raw` would be read as biomarker data.

**Fix:** Rename the inner variable:
```typescript
AsyncStorage.getItem('@vitalspan_biomarkers').then((biomarkersRaw) => {
  const entries: StoredEntry[] = biomarkersRaw ? JSON.parse(biomarkersRaw) : [];
  // ...
})
```

---

## Info

### IN-01: HbA1c unit toggle label is `'mmol/L'` but the correct unit is `'mmol/mol'`

**File:** `src/screens/BiomarkerEntryScreen.tsx:22,29,210`

**Issue:** `InputUnit` is typed as `'native' | 'mmol/L'`. For HbA1c the alternate unit is `'mmol/mol'` (IFCC units, stored in `altUnit`). The chip display correctly shows `'mmol/mol'` (via `altUnit`), but the internal state value is `'mmol/L'` — a medically incorrect label for what is being stored. The conversion math works because it branches on `inputUnit !== 'native'`, but the type name is misleading and the label mismatch could cause confusion during future maintenance.

**Fix:** Widen the type or use a more generic name:
```typescript
type InputUnit = 'native' | 'alt';
```
Then update the chip key and any display logic that currently uses `'mmol/L'` as a literal.

---

### IN-02: Static inline styles violate project convention (`CLAUDE.md`: no inline styles except dynamic ones)

**File:** `src/screens/DashboardScreen.tsx:212,288`

**Issue:** Two `<Text>` elements use static inline style objects — `style={{ fontSize: 18 }}` (notification bell) and `style={{ fontSize: 14 }}` (alert icon). Per `CLAUDE.md`, inline styles are only allowed for dynamic values. These should be named entries in the `s` StyleSheet at the bottom of the file.

**Fix:**
```typescript
// In s = StyleSheet.create({...}):
notifIcon: { fontSize: 18 },
alertIconText: { fontSize: 14 },
```

---

### IN-03: Supabase-first fallback in `DashboardScreen` silently serves stale local data when authenticated user has zero Supabase entries

**File:** `src/screens/DashboardScreen.tsx:64-82`

**Issue:** The condition `sbEntries.length > 0` means a successfully authenticated user with an empty Supabase table (e.g., after migration failed due to CR-02) falls back to AsyncStorage. This is the correct graceful-degradation behavior, but there is no observability — no log, no user signal — distinguishing "authenticated + 0 remote rows, using local" from "not authenticated, using local." Once CR-02 is fixed and migration works, there will be a window between migration flag set and rows being queryable where the Dashboard silently shows local data. This is a low-severity observability gap, not a data loss risk.

**Fix:** Add a `console.warn` when an authenticated user receives an empty Supabase result and falls back:
```typescript
if (!sbError && sbEntries && sbEntries.length > 0) {
  setEntries(sbEntries.map(...));
} else {
  if (user && (sbError || sbEntries?.length === 0)) {
    console.warn('[Dashboard] Supabase returned no entries for authenticated user, using local fallback');
  }
  if (entriesRaw) setEntries(JSON.parse(entriesRaw));
}
```

---

_Reviewed: 2026-06-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
