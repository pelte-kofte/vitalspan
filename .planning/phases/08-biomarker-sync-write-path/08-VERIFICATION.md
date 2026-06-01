---
phase: 08-biomarker-sync-write-path
verified: 2026-06-01T21:00:00Z
status: human_needed
score: 9/9 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Save a biomarker entry and confirm Supabase insert fires"
    expected: "A row appears in biomarker_entries table in Supabase dashboard within ~5 seconds of saving"
    why_human: "syncEntry is fire-and-forget with no UI feedback — only observable via Supabase dashboard or device logs"
  - test: "Fresh install migration — clear @vitalspan_migrated_v2 and @vitalspan_biomarkers, add test entries to AsyncStorage, then launch app"
    expected: "Rows appear in Supabase biomarker_entries table; @vitalspan_migrated_v2 is set to 'true'; second launch does not re-insert"
    why_human: "Migration runs silently with no UI feedback; idempotency gate only verifiable by inspecting AsyncStorage + Supabase table state"
  - test: "Dashboard Supabase pull on focus — verify Supabase rows populate the Dashboard biomarker cards"
    expected: "Biomarker cards show data fetched from Supabase, not just AsyncStorage; verified by clearing AsyncStorage while Supabase has rows"
    why_human: "Data source (Supabase vs AsyncStorage) is invisible to the user and cannot be verified by grep — requires runtime state inspection"
  - test: "Supabase pull failure fallback — simulate Supabase offline and confirm Dashboard falls back to AsyncStorage silently"
    expected: "Dashboard still shows last-known biomarker cards from AsyncStorage; no error dialog or blank screen"
    why_human: "Error path behavior requires simulating network failure at runtime"
---

# Phase 8: Biomarker Sync Write Path Verification Report

**Phase Goal:** New biomarker entries are written to Supabase after AsyncStorage save; existing AsyncStorage history is migrated to Supabase once on first authenticated session; Dashboard pulls fresh data on mount
**Verified:** 2026-06-01T21:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | syncEntry fires after AsyncStorage.setItem in BiomarkerEntryScreen.save() without blocking caller | VERIFIED | `BiomarkerEntryScreen.tsx:124-125` — `await AsyncStorage.setItem(...)` then `syncEntry(entries[entries.length - 1])` with no await; line comment confirms intent |
| 2 | App.tsx triggers migrateHistory after initSupabaseSession() resolves, guarded by @vitalspan_migrated_v2; flag set only on success | VERIFIED | `App.tsx:30-44` — migration block is inside `initSupabaseSession().then(...)` chain; flag stamped in `.then()` after `migrateHistory()` resolves; entire block is fire-and-forget |
| 3 | DashboardScreen pulls biomarker_entries from Supabase on every useFocusEffect mount | VERIFIED | `DashboardScreen.tsx:100-102` — `useFocusEffect(useCallback(() => { loadData(); }, [loadData]))` triggers on every screen focus; `loadData()` contains Supabase pull at lines 57-83 |
| 4 | Supabase pull failure falls back to AsyncStorage silently | VERIFIED | `DashboardScreen.tsx:75-82` — `else` and `catch` blocks both execute `if (entriesRaw) setEntries(JSON.parse(entriesRaw))` — no error UI raised |
| 5 | RLS ensures each user can only SELECT and INSERT their own rows (user_id = auth.uid()) using authenticated role | VERIFIED | `create_biomarker_entries.sql:17-21` — both policies are `TO authenticated USING/WITH CHECK (user_id = auth.uid())`; fix commit d518da3 corrected original `TO anon` |
| 6 | biomarkerWriteService never throws to callers — all errors absorbed via console.warn | VERIFIED | `biomarkerWriteService.ts:55-64` (syncEntry) and `107-110` (migrateHistory) — try/catch wraps full body; `err instanceof Error` pattern; no rethrow |
| 7 | upsert with onConflict: 'id' is used in both syncEntry and migrateHistory | VERIFIED | `biomarkerWriteService.ts:49` and `102` — `{ onConflict: 'id' }` present in both upsert calls |
| 8 | user_id is populated from supabase.auth.getUser() — not hardcoded | VERIFIED | `biomarkerWriteService.ts:30` and `83` — `const { data: { user } } = await supabase.auth.getUser()` in both functions; user.id used for user_id |
| 9 | tsc --noEmit passes with zero errors | VERIFIED | `npx tsc --noEmit` exits 0 (confirmed in verification run) |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/db/create_biomarker_entries.sql` | CREATE TABLE + RLS policies for biomarker_entries | VERIFIED | Exists, 23 lines, CREATE TABLE IF NOT EXISTS, ENABLE ROW LEVEL SECURITY, 2 RLS policies TO authenticated |
| `src/lib/biomarkerWriteService.ts` | syncEntry + migrateHistory service functions | VERIFIED | Exists, 112 lines, exports both functions, substantive implementation with real upsert logic |
| `src/screens/BiomarkerEntryScreen.tsx` | syncEntry call after AsyncStorage.setItem in save() | VERIFIED | Line 14 import, line 125 call, fire-and-forget without await |
| `App.tsx` | migration trigger after initSupabaseSession() + @vitalspan_migrated_v2 guard | VERIFIED | Lines 30-44, migration inside `.then()`, flag at line 37 in success path only |
| `src/screens/DashboardScreen.tsx` | Supabase pull on mount, AsyncStorage fallback | VERIFIED | Lines 57-83, supabase import line 11, biomarker_entries query, biomarker_id mapping line 68 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| BiomarkerEntryScreen.save() | biomarkerWriteService.syncEntry | `import { syncEntry } from '../lib/biomarkerWriteService'` | WIRED | Import line 14, call line 125 |
| App.tsx init() | biomarkerWriteService.migrateHistory | `import { migrateHistory } from './src/lib/biomarkerWriteService'` | WIRED | Import line 8, call line 36 |
| biomarkerWriteService | supabase singleton | `import { supabase } from './supabase'` | WIRED | Line 1, used in both functions |
| biomarkerWriteService | StoredEntry type | `import { StoredEntry } from '../screens/BiomarkerEntryScreen'` | WIRED | Line 2, used in both function signatures |
| DashboardScreen.loadData() | supabase.from('biomarker_entries') | `import { supabase } from '../lib/supabase'` | WIRED | Import line 11, query lines 60-63 |
| App.tsx | StoredEntry type | `import { StoredEntry } from './src/screens/BiomarkerEntryScreen'` | WIRED | Line 9, used in migration block line 35 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| DashboardScreen.tsx | `entries` (state) | `supabase.from('biomarker_entries').select(...)` with user_id filter | Yes — real Supabase query with authenticated user filter; fallback to AsyncStorage parse | FLOWING |
| biomarkerWriteService.syncEntry | upsert payload | `entry: StoredEntry` from BiomarkerEntryScreen.save() — real user input | Yes — upsert to biomarker_entries table | FLOWING |
| biomarkerWriteService.migrateHistory | rows array | `entries.map(e => {...})` from AsyncStorage @vitalspan_biomarkers parse | Yes — maps all historic StoredEntry records | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED (requires running app to observe Supabase network calls and database state — not testable via static analysis)

---

### Probe Execution

No probe files found at `scripts/*/tests/probe-*.sh`. No probes declared in phase PLAN files. SKIPPED.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SUPA-06 | 08-01, 08-02, 08-03 | User biomarker entries written to Supabase after AsyncStorage save; Dashboard pulls on mount with staleness gate | SATISFIED | syncEntry wired in BiomarkerEntryScreen; Dashboard pulls on every useFocusEffect; "always pull on mount" was the explicit user decision (see 08-DISCUSSION-LOG.md) superseding REQUIREMENTS.md "staleness gate" wording |
| SUPA-07 | 08-01, 08-02, 08-03 | One-time migration on first authenticated session; guarded by @vitalspan_migrated_v2 | SATISFIED | App.tsx migration block inside initSupabaseSession().then(); flag set only on confirmed success; fix commit d518da3 resolved the race condition that would have set flag before session existed |

**Note on SUPA-06 "staleness gate" wording:** REQUIREMENTS.md says "Dashboard pulls on mount with staleness gate." The implementation always pulls on every mount (no time-based gate). This deviation is intentional — the user explicitly chose "Always pull on mount" in 08-DISCUSSION-LOG.md, and 08-CONTEXT.md D-04 documents it as a deliberate design decision. The implementation satisfies the intent of SUPA-06.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/screens/DashboardScreen.tsx` | 212 | `style={{ fontSize: 18 }}` inline static style | Info | Violates CLAUDE.md convention (inline styles only for dynamic values) — pre-existing, not introduced by this phase |
| `src/screens/DashboardScreen.tsx` | 288 | `style={{ fontSize: 14 }}` inline static style | Info | Same as above — pre-existing |

No TBD/FIXME/XXX markers found in any of the 5 phase-modified files.

No `any` types introduced in phase files (tsc --noEmit exits 0; grep confirms no `any` in phase files).

**WR-01 open from code review (not a blocker):** No UPDATE RLS policy exists. Supabase upsert with `onConflict: 'id'` technically requires UPDATE permission for the conflict branch. The code review flagged this as WR-01. In practice, because `@vitalspan_migrated_v2` prevents re-migration and syncEntry always inserts new entries with unique time-based IDs, the conflict path should never trigger in normal operation. However, if it does (e.g., clock skew, partial failure), the upsert conflict would silently fail with a permission error absorbed by the service catch. This is a latent correctness risk, not an observable failure in normal use.

---

### Human Verification Required

The automated checks all pass. Four behaviors require runtime verification because they depend on Supabase network calls, database state, and silent fallback paths that cannot be observed statically.

#### 1. Biomarker entry Supabase write

**Test:** Save a biomarker value in BiomarkerEntryScreen and immediately check the Supabase dashboard `biomarker_entries` table.
**Expected:** A row appears with the correct `id`, `biomarker_id`, `value`, `date`, `source`, `notes`, and `user_id` matching the anonymous session UUID within ~5 seconds.
**Why human:** syncEntry is fire-and-forget with no UI feedback. The write is invisible to the user and cannot be verified by static analysis. Only observable via Supabase dashboard or device console logs.

#### 2. One-time migration on first authenticated session

**Test:** Clear `@vitalspan_migrated_v2` flag from AsyncStorage (via Settings → Clear all data, or manually via device file inspector). Pre-populate `@vitalspan_biomarkers` with 2-3 test entries. Launch the app and wait ~3 seconds, then check Supabase `biomarker_entries` table.
**Expected:** All pre-populated entries appear in Supabase with correct user_id. `@vitalspan_migrated_v2` is set to `'true'`. Killing and re-launching the app does NOT add duplicate rows.
**Why human:** Migration runs silently with no UI confirmation. Idempotency can only be verified by inspecting both AsyncStorage and Supabase table state at runtime.

#### 3. Dashboard reads from Supabase on mount

**Test:** Clear `@vitalspan_biomarkers` AsyncStorage key while Supabase has existing rows for the current user. Navigate away from Dashboard and back (triggering useFocusEffect).
**Expected:** Dashboard biomarker cards show data from Supabase despite empty AsyncStorage, confirming the Supabase-first pull path is active.
**Why human:** The data source (Supabase vs AsyncStorage) produces identical StoredEntry objects — source is invisible in the UI. Requires runtime state manipulation to isolate.

#### 4. Silent fallback on Supabase error

**Test:** Simulate Supabase being unavailable (toggle airplane mode or point to invalid URL temporarily). Open Dashboard.
**Expected:** Dashboard shows last-known biomarker data from AsyncStorage. No error dialog, no crash, no blank biomarker section.
**Why human:** Error path requires triggering a runtime network failure.

---

### Gaps Summary

No gaps found. All 9 must-have truths are VERIFIED. All artifacts exist and are substantive. All key links are wired. tsc passes. The two critical issues identified in 08-REVIEW.md (CR-01: wrong RLS role, CR-02: migration race condition) were both fixed in commit `d518da3` before this verification was run — the current codebase reflects the corrected implementation.

One open warning from the code review (WR-01: no UPDATE RLS policy for upsert conflict path) remains unaddressed but is not a blocker — normal operation never triggers the conflict branch.

---

_Verified: 2026-06-01T21:00:00Z_
_Verifier: Claude (gsd-verifier)_
