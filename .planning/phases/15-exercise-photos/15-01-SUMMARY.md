---
phase: 15-exercise-photos
plan: 01
subsystem: ui
tags: [exercise-photos, cdn, yuhonas, exercise-db, data-layer]

# Dependency graph
requires: []
provides:
  - Exercise interface with photoKey?: string optional field
  - 44 exercise objects with verified yuhonas/free-exercise-db photoKey values (73% coverage)
  - Data contract consumed by Plan 02 ExerciseDetailScreen conditional render
affects:
  - 15-exercise-photos plan 02 (ExerciseDetailScreen reads photoKey to show CDN photo vs SVG)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Optional photoKey field on Exercise interface drives photo vs SVG conditional in ExerciseDetailScreen"
    - "MEDIUM confidence mappings annotated with inline comments for reviewer inspection before shipping"

key-files:
  created: []
  modified:
    - src/data/exercises.ts

key-decisions:
  - "44 photoKey mappings implemented (38 HIGH + 6 MEDIUM), not 46 as stated in plan acceptance criteria — plan action section only lists 44 explicit entries; 73% coverage exceeds EXP-03 70% threshold"
  - "MEDIUM confidence entries annotated with inline comments (e.g. '// MEDIUM — seated version') for reviewer inspection"
  - "Scapula Push-Up (id 3021) correctly has no photoKey — Scapular_Pull-Up false-positive excluded"
  - "All 16 SKIP exercises verified to have no photoKey field"

patterns-established:
  - "photoKey?: string placed immediately after illustrationId?: string in Exercise interface for logical field ordering"
  - "MEDIUM confidence entries included with inline comment annotation for visual review before release"

requirements-completed: [EXP-03]

# Metrics
duration: 22min
completed: 2026-06-10
---

# Phase 15 Plan 01: Exercise Photos Data Layer Summary

**photoKey?: string added to Exercise interface with 44 yuhonas/free-exercise-db folder-name mappings (73% coverage, exceeds EXP-03 70% threshold), establishing the data contract ExerciseDetailScreen reads to load CDN photos**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-06-10T20:30:00Z
- **Completed:** 2026-06-10T20:52:45Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added `photoKey?: string` field to the Exercise interface after `illustrationId?: string`
- Populated 44 exercise objects with exact yuhonas/free-exercise-db folder names
- Coverage: 44/60 = 73.3% — exceeds the EXP-03 requirement of 70%
- All 16 SKIP exercises (including critical Scapula Push-Up false-positive) correctly have no photoKey field
- TypeScript strict mode (`tsc --noEmit`) passes with zero errors
- MEDIUM confidence entries annotated with inline `// MEDIUM` comments for reviewer inspection

## Task Commits

Each task was committed atomically:

1. **Task 1: Add photoKey field to Exercise interface and populate 44 mappings** - `2d683e2` (feat)

## Files Created/Modified
- `src/data/exercises.ts` - Added `photoKey?: string` to Exercise interface; added photoKey to 44 exercise objects across all 8 categories

## Decisions Made
- Implemented 44 explicit mappings from the plan's action section (38 HIGH + 6 MEDIUM confidence). The plan's acceptance criteria states 46, but the plan action section only explicitly lists 44 entries — the 2-entry discrepancy is in the plan document itself. 44/60 = 73.3% coverage exceeds the EXP-03 70% threshold, so this meets requirements.
- MEDIUM confidence entries included with reviewer-inspect comments rather than excluded, per plan intent for 15-01.
- Scapula Push-Up (id '3021') remains without photoKey — `Scapular_Pull-Up` maps to a pull-up bar exercise, not a floor push-up. Critical false-positive excluded.

## Deviations from Plan

### Plan Specification Discrepancy

**1. [Plan Doc] Stated count 46 vs implemented 44**
- **Found during:** Task 1 — counting explicit entries in the plan action section
- **Issue:** The plan's `must_haves.truths`, `acceptance_criteria`, and `done` criteria all state 46 mappings. However, exhaustive counting of all explicitly listed IDs in the plan action section yields 44 unique entries.
- **Fix:** Implemented all 44 explicitly listed entries as written. Added no unmapped speculative entries — D-05 prohibits guessing. 44/60 = 73.3% exceeds the EXP-03 70% threshold; all other acceptance criteria pass.
- **Files modified:** src/data/exercises.ts
- **Verification:** `grep -c 'photoKey:' src/data/exercises.ts` → 44; `tsc --noEmit` → 0 errors; `grep 'Scapular_Pull-Up'` → 0 matches
- **Note for Plan 02:** ExerciseDetailScreen will work correctly for all 44 mapped exercises; 16 exercises show SVG fallback as designed.

---

**Total deviations:** 1 plan specification note (not an auto-fix)
**Impact on plan:** Zero functional impact — 73% coverage exceeds 70% threshold, security and correctness unaffected.

## Issues Encountered
None — TypeScript compile passed on first attempt. All explicit mappings applied cleanly.

## User Setup Required
None - no external service configuration required for this plan. Plan 02 installs expo-image and wires the CDN URL.

## Next Phase Readiness
- `src/data/exercises.ts` is ready for Plan 02 to consume
- `exercise.photoKey` drives the conditional render in ExerciseDetailScreen
- CDN URL pattern: `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${exercise.photoKey}/0.jpg`
- Plan 02 needs to: install expo-image, add photoError state, replace illustration section with three-tier conditional, add s.illustrationCardPhoto style

## Known Stubs
None — no stub patterns. photoKey values are literal strings from verified yuhonas folder names; no placeholder or TODO values exist.

## Threat Flags
None — photoKey values are static hardcoded string literals in source code. No user input flows into this field. No new network endpoints or trust boundaries introduced in this plan.

---

## Self-Check

- [x] `src/data/exercises.ts` modified with photoKey field
- [x] Commit 2d683e2 exists in git log
- [x] tsc --noEmit passes (verified above)
- [x] Scapular_Pull-Up not present (0 matches)
- [x] All 16 SKIP exercises have no photoKey

## Self-Check: PASSED

*Phase: 15-exercise-photos*
*Completed: 2026-06-10*
