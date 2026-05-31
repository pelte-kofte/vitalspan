---
phase: 07-reference-data-and-exercise-screen
plan: 01
subsystem: data-layer
tags: [supabase, reference-data, exercises, biomarkers, service-layer, sql]
dependency_graph:
  requires: [04-supabase-foundation]
  provides: [exercise-library-service, biomarker-definitions-service]
  affects: [ExerciseScreen, BiomarkersScreen, BiomarkerDetail]
tech_stack:
  added: []
  patterns: [supabase-first-with-static-fallback, field-by-field-merge, snake-to-camel-mapping]
key_files:
  created:
    - src/db/seed_exercises.sql
    - src/db/seed_biomarker_definitions.sql
    - src/lib/exerciseService.ts
    - src/lib/biomarkerService.ts
  modified: []
decisions:
  - "Exercise count is 60 (actual EXERCISES array) — plan stated 59 but src/data/exercises.ts has 60 entries; seed reflects actual data"
  - "biomarkerService merges Supabase rows field-by-field into static array by id; UI-only fields (color, howToImprove, defaultVal, prevVal, insight, history, categoryLabel) always from static"
  - "exerciseService maps snake_case DB columns to camelCase Exercise interface at call time; no runtime shape mismatch"
metrics:
  duration: "8 minutes"
  completed: "2026-05-31T21:07:33Z"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 07 Plan 01: Reference Data Seed Files and Service Layer Summary

Supabase SQL seed files and TypeScript service layer that fetches reference data (exercises + biomarker definitions) from Supabase with automatic fallback to the static TypeScript arrays.

## What Was Built

### SQL Seed Files (`src/db/`)

Two PostgreSQL seed files designed for one-time execution via the Supabase SQL editor:

**`seed_exercises.sql`** — Populates the `exercises` table with all 60 exercises from `src/data/exercises.ts`. Includes:
- `CREATE TABLE IF NOT EXISTS exercises` with columns matching the Exercise interface (snake_case)
- RLS enabled with `anon` SELECT-only policy
- 60 `INSERT ... ON CONFLICT (id) DO NOTHING` statements

**`seed_biomarker_definitions.sql`** — Populates the `biomarker_definitions` table with all 51 biomarkers from `src/data/biomarkers.ts`. Includes:
- `CREATE TABLE IF NOT EXISTS biomarker_definitions` with server-side fields only
- RLS enabled with `anon` SELECT-only policy
- 51 `INSERT ... ON CONFLICT (id) DO NOTHING` statements
- UI-only fields (color, howToImprove, defaultVal, prevVal, insight, history, categoryLabel) intentionally excluded

### Service Files (`src/lib/`)

**`exerciseService.ts`** — Exports `getExercises(): Promise<Exercise[]>`:
- Queries `supabase.from('exercises').select('*')`
- Maps snake_case columns to camelCase: `body_part → bodyPart`, `muscle_group → muscleGroup`, `secondary_muscles → secondaryMuscles`
- Returns `EXERCISES` static array on error, empty result, or exception
- No `any` types; TypeScript strict clean

**`biomarkerService.ts`** — Exports `getBiomarkers(): Promise<Biomarker[]>`:
- Queries `supabase.from('biomarker_definitions').select('id, name, unit, opt_min, opt_max, category, target, description')`
- Builds an id-keyed Map from Supabase rows, then merges field-by-field into `BIOMARKERS`: overrides name, unit, optMin, optMax, category, target, description per matching row
- UI-only fields (color, howToImprove, defaultVal, prevVal, insight, history, categoryLabel) always taken from static array
- Returns `BIOMARKERS` unchanged on error, empty result, or exception
- No `any` types; TypeScript strict clean

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 5d000ee | feat(07-01): create SQL seed files for exercises and biomarker_definitions tables |
| 2 | 4a61cc7 | feat(07-01): add exerciseService and biomarkerService with Supabase-first + static fallback |

## Verification Results

| Check | Result |
|-------|--------|
| `grep -c "INSERT INTO exercises"` | 60 |
| `grep -c "INSERT INTO biomarker_definitions"` | 51 |
| `npx tsc --noEmit` errors in service files | 0 |
| `any` types in service files | None |
| Both files import `{ supabase }` from `'./supabase'` | Confirmed |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Data count correction] Exercise count is 60 not 59**
- **Found during:** Task 1 verification
- **Issue:** Plan stated 59 exercises but `src/data/exercises.ts` contains 60 entries in the EXERCISES array. The file header comment says "59 exercises" but the actual array has 60 objects.
- **Fix:** Seed file contains 60 INSERT rows matching the actual data. Service returns all 60 from Supabase. The plan's "59" was a stale count in documentation.
- **Files modified:** `src/db/seed_exercises.sql` (60 rows, not 59)
- **Commit:** 5d000ee

## Known Stubs

None — both service functions are fully implemented with real Supabase queries and field mapping. The static fallback is intentional behavior, not a stub.

## Threat Flags

No new threat surface introduced beyond the plan's threat model. RLS policies are `SELECT TO anon USING (true)` only — no INSERT/UPDATE/DELETE policies created, satisfying T-07-02 and T-07-03 mitigations.

## Self-Check: PASSED

Files exist:
- FOUND: src/db/seed_exercises.sql
- FOUND: src/db/seed_biomarker_definitions.sql
- FOUND: src/lib/exerciseService.ts
- FOUND: src/lib/biomarkerService.ts

Commits exist:
- FOUND: 5d000ee
- FOUND: 4a61cc7
