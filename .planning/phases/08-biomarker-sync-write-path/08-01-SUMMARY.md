---
phase: 08-biomarker-sync-write-path
plan: 01
subsystem: database
tags: [supabase, sql, rls, biomarkers, postgres]

# Dependency graph
requires:
  - phase: 04-supabase-foundation
    provides: Supabase project provisioned, anonymous auth session, supabase.ts singleton
provides:
  - SQL file to create biomarker_entries table with RLS in Supabase SQL editor
affects: [08-02, 08-03, biomarkerWriteService, BiomarkerEntryScreen, DashboardScreen]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SQL migration file per table: CREATE TABLE IF NOT EXISTS + ENABLE ROW LEVEL SECURITY + per-role policies in one idempotent file"

key-files:
  created:
    - src/db/create_biomarker_entries.sql
  modified: []

key-decisions:
  - "id column is text PK — preserves AsyncStorage-generated string IDs (e.g. 1748701234-abc12), no UUID remapping needed"
  - "Append-only table by design: SELECT + INSERT RLS policies only, no UPDATE or DELETE"
  - "anon role policies scope all reads and writes to auth.uid() — anonymous session provides the uid"

patterns-established:
  - "SQL DDL file format: 3-line header comment + CREATE TABLE IF NOT EXISTS + ENABLE ROW LEVEL SECURITY + named CREATE POLICY blocks"

requirements-completed: [SUPA-06, SUPA-07]

# Metrics
duration: 1min
completed: 2026-06-01
---

# Phase 8 Plan 01: Biomarker Entries Table Summary

**`biomarker_entries` SQL DDL with RLS — id-as-text PK preserving AsyncStorage strings, SELECT + INSERT policies scoped to auth.uid(), append-only by design**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-06-01T17:35:26Z
- **Completed:** 2026-06-01T17:36:04Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `src/db/create_biomarker_entries.sql` — runnable in Supabase SQL editor, safe to re-run (IF NOT EXISTS guard)
- Table schema maps directly to `StoredEntry` shape: id (text PK), user_id, biomarker_id, value, date, source, notes
- Two RLS policies covering SELECT and INSERT scoped to `auth.uid()` — blocks cross-user data access at the database level
- No UPDATE or DELETE policies — append-only per D-08; client cannot modify or remove rows

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/db/create_biomarker_entries.sql** - `f686ce1` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/db/create_biomarker_entries.sql` — CREATE TABLE IF NOT EXISTS biomarker_entries with RLS policies for anon SELECT + INSERT

## Decisions Made

- Followed D-07 (column list), D-08 (RLS rules), D-09 (id column is text PK) exactly as specified in 08-CONTEXT.md
- No new decisions made during execution — plan was fully specified

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Manual Supabase step required before Plans 02/03 can be tested end-to-end.**

Open the Supabase SQL editor for the Vitalspan project and run the contents of `src/db/create_biomarker_entries.sql`. The file is idempotent — safe to run multiple times.

## Next Phase Readiness

- `biomarker_entries` table schema and RLS policies are fully defined in `src/db/create_biomarker_entries.sql`
- Plan 08-02 (`biomarkerWriteService.ts`) can now be implemented — the table contract is established
- Plan 08-03 (BiomarkerEntryScreen + App.tsx + DashboardScreen wiring) depends on the service from 08-02

---
*Phase: 08-biomarker-sync-write-path*
*Completed: 2026-06-01*
