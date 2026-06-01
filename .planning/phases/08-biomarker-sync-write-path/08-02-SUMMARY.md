---
phase: 08-biomarker-sync-write-path
plan: 02
subsystem: service
tags: [supabase, biomarkers, write-path, fire-and-forget, migration]

# Dependency graph
requires:
  - phase: 08-biomarker-sync-write-path
    plan: 01
    provides: biomarker_entries table DDL + RLS policies
provides:
  - syncEntry(entry: StoredEntry): void — fire-and-forget upsert for BiomarkerEntryScreen
  - migrateHistory(entries: StoredEntry[]): Promise<void> — bulk upsert for App.tsx migration
affects: [08-03, BiomarkerEntryScreen, App.tsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "fire-and-forget via void-returning function wrapping async IIFE + .catch() — explicit no-await contract at call site"
    - "error-safe service functions: try/catch around full body, console.warn with [serviceName] prefix, never rethrow"
    - "upsert with onConflict: 'id' for idempotent bulk inserts safe against partial-failure retries"

key-files:
  created:
    - src/lib/biomarkerWriteService.ts
  modified: []

key-decisions:
  - "syncEntry return type is void (not Promise<void>) — explicit fire-and-forget signal; callers cannot accidentally await it (D-11)"
  - "user_id sourced from supabase.auth.getUser() at call time in both functions — never hardcoded or cached (T-08-04 mitigation)"
  - "upsert with onConflict: 'id' used in both syncEntry and migrateHistory — idempotent, safe to retry after partial failure (D-08, D-09)"
  - "migrateHistory short-circuits on empty entries array — no network call when nothing to migrate (D-03)"

requirements-completed: [SUPA-06, SUPA-07]

# Metrics
duration: ~43s
completed: 2026-06-01
---

# Phase 8 Plan 02: Biomarker Write Service Summary

**`src/lib/biomarkerWriteService.ts` — fire-and-forget syncEntry (void return) and bulk-upsert migrateHistory (Promise<void>), both error-safe with user_id from getUser(), compiles clean under tsc --noEmit**

## Performance

- **Duration:** ~43s
- **Started:** 2026-06-01T17:38:52Z
- **Completed:** 2026-06-01T17:39:35Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `src/lib/biomarkerWriteService.ts` with two named exports: `syncEntry` and `migrateHistory`
- `syncEntry(entry: StoredEntry): void` — explicit void return enforces fire-and-forget contract; async IIFE runs the upsert without blocking caller; unhandled rejections caught via `.catch()`
- `migrateHistory(entries: StoredEntry[]): Promise<void>` — bulk upsert with `onConflict: 'id'` for idempotent retry safety; short-circuits on empty array
- Both functions source `user_id` from `supabase.auth.getUser()` at call time — mitigates T-08-04 (spoofing via client-supplied user_id)
- Both functions are fully error-safe: try/catch wraps entire body, `console.warn` with `[biomarkerWriteService]` prefix, never rethrow
- Column mapping: `biomarkerId` → `biomarker_id` (snake_case per D-07)
- Follows exact import and error-handling pattern from `src/lib/biomarkerService.ts`
- `npx tsc --noEmit` passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/lib/biomarkerWriteService.ts** — `48bd2c4` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/lib/biomarkerWriteService.ts` — new; exports `syncEntry` (void) and `migrateHistory` (Promise<void>)

## Decisions Made

- Followed D-10 (new service file), D-11 (exact function signatures), D-09 (id as-is, no remapping), D-08 (upsert onConflict: 'id'), D-03 (short-circuit on empty) exactly as specified in 08-CONTEXT.md
- Applied T-08-04 threat mitigation: user_id always from `supabase.auth.getUser()`, never from StoredEntry payload
- No new decisions needed — plan was fully specified

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — both functions are fully implemented with real Supabase upsert logic. No placeholder data.

## Threat Flags

No new security surface introduced beyond what was planned. T-08-04 and T-08-05 mitigations are implemented as specified.

## Self-Check: PASSED

- `src/lib/biomarkerWriteService.ts` exists: FOUND
- Commit `48bd2c4` exists: FOUND
- `npx tsc --noEmit` exits 0: PASSED

---
*Phase: 08-biomarker-sync-write-path*
*Completed: 2026-06-01*
