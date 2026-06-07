---
phase: 12-exercise-ui-overhaul
plan: "02"
subsystem: ui
tags: [react-native-svg, muscle-map, exercise, svgs, components]

requires:
  - phase: 06-warm-ui-overhaul
    provides: Colors.Beige.* tokens used for silhouette fill and inactive region color
  - phase: 12-context
    provides: D-08 (front/back toggle), D-09 (neural-dot accent overlay), D-10 (13 muscle regions)

provides:
  - MuscleMapView component with front/back SVG silhouette and neural-dot grid overlay
  - MUSCLE_REGIONS constant (13 anatomical regions with SVG ellipse coordinates)
  - MuscleRegion type exported for typed usage in ExerciseDetailScreen and ExerciseScreen
  - muscleMatches() helper with ALIASES normalizing exercises.ts muscleGroup/secondaryMuscles values to region ids

affects:
  - 12-03 (ExerciseDetailScreen — imports MuscleMapView in read-only mode)
  - 12-05 (ExerciseScreen filter panel — imports MuscleMapView in interactive mode)

tech-stack:
  added: []
  patterns:
    - "react-native-svg Ellipse elements for muscle region highlighting over SVG silhouette"
    - "TouchableOpacity overlays positioned absolutely over SVG regions for interactive mode"
    - "ALIASES map normalizing exercises.ts muscle name variants to canonical region ids"
    - "6x10 neural-dot grid (Circle r=2, fillOpacity=0.15) replicating NeuralGrid aesthetic"

key-files:
  created:
    - src/components/MuscleMapView.tsx
  modified: []

key-decisions:
  - "Rendered muscle regions as SVG Ellipses inside main Svg viewBox (not separate SVGs per region) to keep component under 200 lines while maintaining correct layering"
  - "Interactive tap overlays implemented as absolutely-positioned TouchableOpacity elements over the SVG (not SVG-native touch) to match React Native touch model"
  - "ALIASES map covers 5 exercises.ts anomalies: transverse abdominis, hip flexors → core; quadriceps → quads; trapezius, traps → upper back"
  - "SIL constant bundles silhouette fill/stroke to avoid repeating Colors references per element"

patterns-established:
  - "muscleMatches(exerciseMuscle, regionId): normalized alias lookup pattern for exercises.ts muscle name normalization — follow for any future muscle matching logic"
  - "MuscleMapView view prop controls which regions are visible; caller owns toggle state"

requirements-completed:
  - EX-02
  - EX-05

duration: 2min
completed: 2026-06-07
---

# Phase 12 Plan 02: MuscleMapView Component Summary

**SVG body silhouette muscle map with 13 named regions, neural-dot overlay, interactive/read-only modes, and exercises.ts alias normalization via muscleMatches()**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-07T18:19:10Z
- **Completed:** 2026-06-07T18:21:38Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `src/components/MuscleMapView.tsx` (137 lines, well under 200-line limit) with front/back SVG silhouette
- All 13 muscle regions defined with anatomical ellipse coordinates for both front and back views, matching exercises.ts muscleGroup and secondaryMuscles naming conventions
- Primary muscles highlight in Colors.accent at 75% opacity; secondary at 35%; inactive in Colors.Beige.bgShade
- Neural-dot grid (6x10, Circle r=2, fillOpacity=0.15) replicates the NeuralGrid background aesthetic on the body silhouette
- muscleMatches() helper with 5-entry ALIASES map covers all exercises.ts naming mismatches (transverse abdominis, hip flexors, quadriceps, trapezius, traps)
- Interactive mode uses absolutely-positioned TouchableOpacity overlays aligned to SVG ellipse bounding boxes
- tsc --noEmit passes with no errors; no hardcoded hex values

## Task Commits

1. **Task 1: Create MuscleMapView component** - `a4207a0` (feat)

**Plan metadata:** _(to be committed with SUMMARY)_

## Files Created/Modified

- `src/components/MuscleMapView.tsx` — Front/back neural-dot muscle map with 13 regions, interactive and read-only modes, muscleMatches helper, MUSCLE_REGIONS constant

## Decisions Made

- Rendered all muscle region Ellipses inside the main Svg viewBox (not separate SVG per region) for correct z-layering and to keep the file under 200 lines.
- Interactive taps use absolutely-positioned TouchableOpacity overlays rather than SVG-native onPress, because SVG touch areas are difficult to hit-test precisely on iOS.
- The ALIASES map is the single source of truth for exercises.ts muscle name normalization — no duplicate normalization logic in the consumers.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None — component renders correctly with any valid primaryMuscles/secondaryMuscles string arrays from exercises.ts.

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes. Component is pure UI, reads only from static prop arrays.

## Next Phase Readiness

- `MuscleMapView` is ready for import by Plan 12-03 (ExerciseDetailScreen) in read-only mode
- `MuscleMapView` is ready for import by Plan 12-05 (ExerciseScreen filter) in interactive mode with `onMusclePress`
- `muscleMatches()` is exported for use in ExerciseScreen filter logic to match exercises against tapped region ids

---
*Phase: 12-exercise-ui-overhaul*
*Completed: 2026-06-07*

## Self-Check: PASSED

- `src/components/MuscleMapView.tsx` exists on disk
- Commit `a4207a0` exists in git log
- All 11 acceptance criteria verified PASS (line count 137, 13 regions, tsc clean, no hex, Colors.* x9, interactive x3, onViewToggle x4, aliases present)
