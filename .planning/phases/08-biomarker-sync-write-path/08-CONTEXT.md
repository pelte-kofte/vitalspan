# Phase 8: Biomarker Sync Write Path - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Three connected workstreams, all non-UI:

1. **Write path** — After every `AsyncStorage.setItem('@vitalspan_biomarkers', ...)` in `BiomarkerEntryScreen`, call `syncEntry(entry)` from a new `biomarkerWriteService.ts` as fire-and-forget. The write never blocks the UI and never changes app behavior on failure.

2. **One-time migration** — In `App.tsx`, after `initSupabaseSession()` resolves, call `migrateHistory()` from `biomarkerWriteService.ts`. It reads `@vitalspan_biomarkers`, bulk-inserts all entries into Supabase, then sets the `@vitalspan_migrated_v2` flag. Skipped if already migrated, if the array is empty, or if the insert fails (retry on next launch).

3. **Dashboard refresh** — `DashboardScreen` pulls raw `biomarker_entries` from Supabase on every mount. On success it replaces the in-memory entries (same `StoredEntry[]` shape). On failure it silently falls back to AsyncStorage data. PhenoAge computation and display logic are unchanged.

No screens other than `BiomarkerEntryScreen` and `DashboardScreen` are modified. `GuidedFirstRunScreen` entries are caught by the one-time migration, not by `syncEntry`.

</domain>

<decisions>
## Implementation Decisions

### Migration Trigger & Resilience
- **D-01:** Migration runs in `App.tsx` immediately after `initSupabaseSession()` resolves — fire-and-forget, never blocking the UI. Same pattern as the existing Supabase init.
- **D-02:** If migration fails (network error, Supabase unavailable), the `@vitalspan_migrated_v2` flag is **not** set. Next app launch retries. Only set the flag after a confirmed successful insert.
- **D-03:** If `@vitalspan_biomarkers` is empty or missing, skip the Supabase insert entirely. Set the flag immediately and return. No pointless network call.

### Dashboard Staleness Gate
- **D-04:** Dashboard always pulls from Supabase on every mount — no timestamp gate, no once-per-session logic. Simplest correct behavior.
- **D-05:** Dashboard fetches raw `biomarker_entries` rows (same shape as `StoredEntry[]`). The existing PhenoAge computation and all derived UI are unchanged — just the data source changes from AsyncStorage-only to Supabase-first with AsyncStorage fallback.
- **D-06:** On Supabase pull failure, Dashboard falls back to reading `@vitalspan_biomarkers` from AsyncStorage silently. No error UI.

### `biomarker_entries` Table Schema
- **D-07:** Table columns: `id` (text PK — same generated string as `StoredEntry.id`, e.g. `1748701234-abc12`), `user_id` (uuid, references `auth.users`), `biomarker_id` (text), `value` (numeric), `date` (text, ISO string), `source` (text), `notes` (text). Column names use snake_case per Supabase convention.
- **D-08:** RLS: `SELECT` and `INSERT` where `user_id = auth.uid()`. No `UPDATE` or `DELETE` from the client — data is append-only from the app. The anon role applies (anonymous auth session provides `auth.uid()`).
- **D-09:** The `id` column preserves the AsyncStorage-generated string — no UUID remapping during migration. Simplifies the migration: rows are inserted as-is with `user_id` added.

### Write Service Architecture
- **D-10:** New file `src/lib/biomarkerWriteService.ts`. Follows the Phase 7 service pattern (exerciseService, biomarkerService). Screens never call `supabase` directly.
- **D-11:** Exports two functions:
  - `syncEntry(entry: StoredEntry): void` — fire-and-forget, called by `BiomarkerEntryScreen` after `AsyncStorage.setItem`. Never throws, never awaited by caller.
  - `migrateHistory(entries: StoredEntry[]): Promise<void>` — bulk insert, called from `App.tsx`. Never throws — errors are caught and warned internally.
- **D-12:** Only `BiomarkerEntryScreen` calls `syncEntry`. `GuidedFirstRunScreen` entries are handled by the one-time migration, not live sync.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/ROADMAP.md` §Phase 8 — goal, success criteria, and requirements (SUPA-06, SUPA-07). Success criteria are the acceptance gates.
- `.planning/REQUIREMENTS.md` §Supabase Infrastructure — full requirement text for SUPA-06 and SUPA-07.

### Existing Code to Modify
- `src/screens/BiomarkerEntryScreen.tsx` — add `syncEntry(entry)` call after `AsyncStorage.setItem` in the `save()` function (lines ~113-124). The `StoredEntry` interface is exported from this file.
- `src/screens/DashboardScreen.tsx` — add Supabase pull on mount alongside the existing AsyncStorage reads (lines ~44-50). Replace the in-memory entries on success; fall back silently on error.
- `src/App.tsx` — add `migrateHistory(entries)` call after `initSupabaseSession()` resolves, guarded by `@vitalspan_migrated_v2` flag check.

### New Files to Create
- `src/lib/biomarkerWriteService.ts` — new; exports `syncEntry(entry: StoredEntry): void` and `migrateHistory(entries: StoredEntry[]): Promise<void>`

### Supabase & Auth
- `src/lib/supabase.ts` — Supabase client singleton. Import `supabase` from here — never re-initialize. Use `supabase.auth.getUser()` to get the current `user_id` for insert operations.

### AsyncStorage Keys
- `@vitalspan_biomarkers` — `StoredEntry[]` — read by migration, written by BiomarkerEntryScreen, read by Dashboard as fallback
- `@vitalspan_migrated_v2` — migration idempotency flag; set to `'true'` string after successful migration

### Prior Phase Decisions
- `.planning/phases/04-supabase-foundation/04-P1-PLAN.md` — Supabase singleton constraints (polyfill on line 1, singleton pattern).
- `.planning/phases/07-reference-data-and-exercise-screen/07-CONTEXT.md` — Service file pattern (exerciseService, biomarkerService) that biomarkerWriteService follows.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.ts` `supabase` singleton — import for all Supabase operations. `initSupabaseSession()` is already called in App.tsx; migration runs after it resolves.
- `StoredEntry` interface (exported from `src/screens/BiomarkerEntryScreen.tsx`) — this is the canonical type for both local and Supabase entries.

### Established Patterns
- Fire-and-forget with silent catch: `initSupabaseSession()` in `supabase.ts` is the reference — wrap write calls in `try/catch`, log `console.warn` on error, never rethrow.
- Service layer: `src/lib/exerciseService.ts` and `src/lib/biomarkerService.ts` — each exports one or two async functions, imports `supabase` from the singleton, never initializes its own client.
- AsyncStorage fallback: `getBiomarkers()` in `biomarkerService.ts` tries Supabase first and falls back to static data on error. Dashboard read should use the same pattern with `@vitalspan_biomarkers` as fallback.

### Integration Points
- `App.tsx` — already calls `initSupabaseSession()` and handles AppState JWT refresh. Migration goes here, chained after `initSupabaseSession()`.
- `BiomarkerEntryScreen.save()` — AsyncStorage write is at line 123. `syncEntry(entry)` is called immediately after (fire-and-forget, no `await`).
- `DashboardScreen` mount — parallel `AsyncStorage.getItem` calls at lines 45-50. Add a Supabase fetch here; on success, use the result instead of AsyncStorage entries for biomarkers.

</code_context>

<specifics>
## Specific Ideas

- `syncEntry` is intentionally `void`-returning (not `Promise<void>`) to make the fire-and-forget contract explicit at the call site — caller cannot accidentally `await` it.
- `migrateHistory` bulk-inserts using Supabase `upsert` with `onConflict: 'id'` to be safe against partial retries — if migration runs twice (flag not set due to prior failure), it won't create duplicate rows.

</specifics>

<deferred>
## Deferred Ideas

- **Delete sync** — Removing a biomarker entry from AsyncStorage is not synced to Supabase (RLS has no DELETE). Deferred post-v2; data is append-only for now.
- **Multi-device sync** — The anonymous auth model gives each device its own UUID. True cross-device sync (same user, multiple devices) requires account linking. Out of scope for v2.
- **GuidedFirstRunScreen live sync** — Guided onboarding entries are not synced live via `syncEntry`. Migration catches them on first launch. Live sync could be added later if needed.

</deferred>

---

*Phase: 8-Biomarker Sync Write Path*
*Context gathered: 2026-06-01*
