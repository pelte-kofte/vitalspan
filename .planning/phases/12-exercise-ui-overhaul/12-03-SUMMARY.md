---
phase: "12"
plan: "03"
subsystem: exercise-illustrations
tags: [svg, react-native-svg, exercise, illustrations, neural-dot]
dependency_graph:
  requires: []
  provides:
    - src/components/exercise-illustrations/index.ts
  affects:
    - src/data/exercises.ts (illustrationId field maps to exports)
    - ExerciseDetailScreen (Wave 2 consumer)
tech_stack:
  added: []
  patterns:
    - Neural-dot stick figure SVG components (dots + lines on transparent background)
    - Barrel export pattern (index.ts re-exports all 60 named exports)
key_files:
  created:
    - src/components/exercise-illustrations/index.ts
    - src/components/exercise-illustrations/sideToSideChin.tsx
    - src/components/exercise-illustrations/barbellShrug.tsx
    - src/components/exercise-illustrations/barbellBentArmPullover.tsx
    - src/components/exercise-illustrations/dumbbellOneArmBentOverRow.tsx
    - src/components/exercise-illustrations/dumbbellInclineRow.tsx
    - src/components/exercise-illustrations/dumbbellBentOverRow.tsx
    - src/components/exercise-illustrations/bodweightSquattingRowTowel.tsx
    - src/components/exercise-illustrations/barbellReverseGripInclineRow.tsx
    - src/components/exercise-illustrations/standingLateralStretch.tsx
    - src/components/exercise-illustrations/oneArmTowelRow.tsx
    - src/components/exercise-illustrations/barbellLateralLunge.tsx
    - src/components/exercise-illustrations/twistHipLift.tsx
    - src/components/exercise-illustrations/lyingSideQuadStretch.tsx
    - src/components/exercise-illustrations/barbellDeadlift.tsx
    - src/components/exercise-illustrations/barbellFrontSquat.tsx
    - src/components/exercise-illustrations/barbellLowBarSquat.tsx
    - src/components/exercise-illustrations/curtseySqat.tsx
    - src/components/exercise-illustrations/dumbbellDeadlift.tsx
    - src/components/exercise-illustrations/seatedWideAngleStretch.tsx
    - src/components/exercise-illustrations/barbellCleanAndPress.tsx
    - src/components/exercise-illustrations/inclinePushUpOnBox.tsx
    - src/components/exercise-illustrations/dumbbellDeclineBenchPress.tsx
    - src/components/exercise-illustrations/scapulaPushUp.tsx
    - src/components/exercise-illustrations/plyoPushUp.tsx
    - src/components/exercise-illustrations/raiseSingleArmPushUp.tsx
    - src/components/exercise-illustrations/dumbbellDeclineOneArmFly.tsx
    - src/components/exercise-illustrations/dumbbellOneArmFlyOnBall.tsx
    - src/components/exercise-illustrations/inclinePushUpDepthJump.tsx
    - src/components/exercise-illustrations/jandaSitUp.tsx
    - src/components/exercise-illustrations/obliqueCrunches.tsx
    - src/components/exercise-illustrations/frogCrunch.tsx
    - src/components/exercise-illustrations/vSit.tsx
    - src/components/exercise-illustrations/threeFourSitUp.tsx
    - src/components/exercise-illustrations/straddlePlanche.tsx
    - src/components/exercise-illustrations/captainsChairStraightLegRaise.tsx
    - src/components/exercise-illustrations/sideBridge.tsx
    - src/components/exercise-illustrations/plank.tsx
    - src/components/exercise-illustrations/dumbbellSeatedAlternateFrontRaise.tsx
    - src/components/exercise-illustrations/dumbbellOneArmUprightRow.tsx
    - src/components/exercise-illustrations/dumbbellRearDeltoidRaise.tsx
    - src/components/exercise-illustrations/dumbbellArnoldPress.tsx
    - src/components/exercise-illustrations/dumbbellInclineShoulderRaise.tsx
    - src/components/exercise-illustrations/barbellUprightRow.tsx
    - src/components/exercise-illustrations/standingBehindNeckPress.tsx
    - src/components/exercise-illustrations/barbellReversePreacherCurl.tsx
    - src/components/exercise-illustrations/dumbbellConcentrationCurlBall.tsx
    - src/components/exercise-illustrations/closeGripBehindNeckTricepsExtension.tsx
    - src/components/exercise-illustrations/dumbbellLyingSingleExtension.tsx
    - src/components/exercise-illustrations/dumbbellLyingElbowPress.tsx
    - src/components/exercise-illustrations/dumbbellReverseCurl.tsx
    - src/components/exercise-illustrations/jumpingJacks.tsx
    - src/components/exercise-illustrations/backAndForthStep.tsx
    - src/components/exercise-illustrations/semiSquatJump.tsx
    - src/components/exercise-illustrations/skaterJump.tsx
    - src/components/exercise-illustrations/burpee.tsx
    - src/components/exercise-illustrations/runningInPlace.tsx
    - src/components/exercise-illustrations/barbellSeatedCalfRaise.tsx
    - src/components/exercise-illustrations/dumbbellSingleLegCalfRaise.tsx
    - src/components/exercise-illustrations/calfWallStretch.tsx
    - src/components/exercise-illustrations/standingCalfRaiseStaircase.tsx
  modified: []
decisions:
  - "Used Ellipse from react-native-svg for ball/stability-ball exercises (dumbbellOneArmFlyOnBall, dumbbellConcentrationCurlBall)"
  - "Each component follows single-file pattern: React import, Svg+primitives import, Colors import, Props interface, default export"
  - "Movement direction arrows use 3 Line elements (shaft + 2 arrowhead lines) at opacity 0.8"
  - "Lying exercises (bench press, fly, plank, extension) orient head-left feet-right for spatial clarity"
metrics:
  duration: "~35 minutes"
  completed: "2026-06-07T18:37:47Z"
  tasks_completed: 2
  files_created: 61
  files_modified: 0
---

# Phase 12 Plan 03: Exercise Illustrations Summary

**One-liner:** 60 neural-dot SVG movement figure components with barrel index using react-native-svg Circle/Line primitives and Colors.accent on transparent background.

## What Was Built

Created the complete `src/components/exercise-illustrations/` directory with 60 exercise illustration components and one barrel index file (61 files total).

Each component renders a recognizable movement figure for its named exercise using:
- `Circle` elements for body joints/dots (head, neck, shoulders, hips, knees, ankles, hands)
- `Line` elements connecting adjacent joints to form limbs
- Optional `Ellipse` for stability-ball exercises (2 components)
- Movement arrows (2-3 Line elements forming an arrowhead) indicating the direction of motion
- All geometry uses `Colors.accent` (`#5B9DBF`) — no hardcoded hex values

**Category breakdown:**
- Pull / Row (10 components): chinup, shrug, pullover, bent-over rows, incline rows, lateral stretch, towel row
- Legs (10 components): lateral lunge, hip lift, quad stretch, deadlift variations, squat variations, clean & press
- Push (8 components): incline push-up variants, decline bench press, scapula push-up, plyo, single-arm, fly variants
- Core (8 components): janda sit-up, oblique crunches, frog crunch, V-sit, 3/4 sit-up, straddle planche, captain's chair, side bridge, plank
- Shoulders (7 components): front raise, upright row, rear delt raise, Arnold press, incline raise, barbell upright row, behind-neck press
- Arms (6 components): reverse preacher curl, concentration curl, triceps extensions (3 variations), reverse curl
- Cardio (6 components): jumping jacks, back-forth step, semi-squat jump, skater jump, burpee, running in place
- Calves (4 components): seated calf raise, single-leg calf raise, calf wall stretch, staircase calf raise

The `index.ts` barrel exports all 60 components by their camelCase `illustrationId` name (matching the `illustrationId` field added to `Exercise` in Plan 12-01), enabling Wave 2's `ExerciseDetailScreen` to do:
```ts
import { barbellDeadlift as BarbellDeadlift } from '../components/exercise-illustrations';
```

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Pull/Row + Legs + Push + Core (30 files) | f2efd40 | 30 .tsx files |
| 2 | Core + Shoulders + Arms + Cardio + Calves (30 files) + index | 6fc0e1b | 30 .tsx + index.ts |

## Verification Results

- `ls src/components/exercise-illustrations/*.tsx | wc -l` → **60**
- `grep -c "export { default as" src/components/exercise-illustrations/index.ts` → **60**
- `grep -rl "#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]" *.tsx` → **empty (no hex values)**
- `grep -rL "Colors.accent" *.tsx` → **empty (all 60 use Colors.accent)**
- `wc -l plank.tsx` → **38 lines (within 40-line budget)**
- `npx tsc --noEmit` → **passes with no errors**

## Deviations from Plan

None — plan executed exactly as written.

The only minor adaptation: two components (`dumbbellOneArmFlyOnBall` and `dumbbellConcentrationCurlBall`) import `Ellipse` from react-native-svg in addition to `Circle` and `Line` to represent the stability ball. This is consistent with the plan's note "import Svg, { Circle, Line, Path, Ellipse } from 'react-native-svg'" — Ellipse was listed as optional.

## Known Stubs

None. These are pure static SVG illustration components with no data dependencies. Each component renders completely with its default `size={120}` prop.

## Threat Flags

No new threat surface. All 61 files are pure static SVG geometry components with no network calls, no user input processing, and no file system access.

## Self-Check: PASSED

- FOUND: src/components/exercise-illustrations/index.ts
- FOUND: src/components/exercise-illustrations/barbellDeadlift.tsx
- FOUND: src/components/exercise-illustrations/plank.tsx
- FOUND: src/components/exercise-illustrations/burpee.tsx
- FOUND commit f2efd40 (Task 1)
- FOUND commit 6fc0e1b (Task 2)
- TSX count: 60 confirmed
