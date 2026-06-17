---
phase: 21-exercise-routine-and-history
plan: "02"
subsystem: ui-component
tags: [exercise, log, sets, reps, weight, setsData, QuickLogModal]
dependency_graph:
  requires:
    - SetRecord interface from src/data/exercises.ts (Plan 21-01)
    - setsData?: SetRecord[] on ExerciseLogEntry (Plan 21-01)
  provides:
    - QuickLogModal writes setsData on every new strength log entry
  affects:
    - src/screens/ExerciseScreen.tsx (consumer of QuickLogModal)
    - Plans 21-03/04/05 (progressive overload computation consumers of setsData)
tech_stack:
  added: []
  patterns:
    - Numeric TextInput rows inside logFields group for structured strength data capture
    - Array(n).fill() pattern with Math.min cap for DoS-safe setsData construction
key_files:
  created: []
  modified:
    - src/components/QuickLogModal.tsx
decisions:
  - "Kept INTENSITY_OPTIONS, INTENSITY_COLORS, and estimateCalories exported — downstream callers (ExerciseScreen) may import these; removing would be a breaking change"
  - "intensity field set to undefined on new entries (backward compat — old entries still have intensity populated)"
  - "setsData not written for Cardio exercises (isCardio guard) — cardio has no sets/reps concept"
  - "Math.min(setsNum, 20) cap applied per threat model T-21-03 mitigation"
  - "Dead style entries removed (intensityLabel, intensityRow, intensityChip, intensityTxt, calEstimate) to keep StyleSheet clean"
metrics:
  duration: "~12 minutes"
  completed: "2026-06-17"
  tasks_completed: 1
  files_changed: 1
requirements:
  - HIST-04
---

# Phase 21 Plan 02: QuickLogModal Sets/Reps/Weight Inputs Summary

**One-liner:** QuickLogModal updated to capture per-set reps and weight via three numeric inputs; setsData: SetRecord[] written to ExerciseLogEntry on save, replacing the intensity chip row.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace intensity chips with Sets/Reps/Weight inputs | d145c58 | src/components/QuickLogModal.tsx |

## What Was Built

### Task 1: Sets/Reps/Weight inputs replacing intensity chips (d145c58)

Replaced the intensity chip UI section in `QuickLogModal.tsx` with three new fields inside the existing `logFields` group:

**State changes:**
- Added `repsPerSet` (string, default `'10'`) — per-set rep count for the new structured capture
- Added `weightKg` (string, default `''`) — empty string represents bodyweight (no weight)
- Removed `intensity` state variable (`ExerciseIntensity`) — no longer drives UI; kept as `undefined` in saved entries for backward compat
- Kept `reps` state for backward compat with legacy entry fields

**UI changes (strength exercises only, `!isCardio` guard):**
- "Reps / set" row: `TextInput` bound to `repsPerSet`, `keyboardType="decimal-pad"`, `selectTextOnFocus`
- "Weight (kg)" row: `TextInput` bound to `weightKg`, `keyboardType="decimal-pad"`, `placeholder="optional"`, optional input for bodyweight exercises
- Both rows use existing `s.fieldRow` + `s.fieldRowBorder` style tokens — no new styles needed
- Removed intensity chip row (`<Text intensityLabel>` + `<View intensityRow>`) and calorie estimate display

**Save logic (`handleSave`):**
```typescript
const setsNum = Math.min(parseInt(sets) || 1, 20);   // T-21-03: cap at 20 sets
const repsNum = parseInt(repsPerSet) || 0;
const weightNum = parseFloat(weightKg) || undefined;  // empty/NaN → undefined (bodyweight)
const setsData: SetRecord[] = Array(setsNum).fill({ reps: repsNum, weightKg: weightNum });
```
`setsData` is written to `ExerciseLogEntry` for strength exercises; `undefined` for cardio.

**Exports preserved:** `INTENSITY_OPTIONS`, `INTENSITY_COLORS`, `estimateCalories` remain exported so existing consumers are not broken.

## Verification

- `grep "setsData" src/components/QuickLogModal.tsx` — matches (handleSave construction + entry field)
- `grep "repsPerSet" src/components/QuickLogModal.tsx` — matches (state variable, handleSave, TextInput)
- `grep "weightKg" src/components/QuickLogModal.tsx` — matches (state, handleSave, TextInput)
- `grep "intensityRow\|intensityChip\|intensityLabel" src/components/QuickLogModal.tsx` — no matches (good)
- `export const INTENSITY_OPTIONS` — present
- `export const INTENSITY_COLORS` — present
- `npx tsc --noEmit` — exits 0

## Deviations from Plan

**1. [Rule 2 - Missing Critical Functionality] DoS cap on setsData array size**
- **Found during:** Task 1
- **Issue:** Threat model T-21-03 required explicit cap on setsNum to prevent large Array construction
- **Fix:** Applied `Math.min(parseInt(sets) || 1, 20)` as specified in the plan's `<threat_model>` T-21-03 mitigation
- **Files modified:** src/components/QuickLogModal.tsx
- **Commit:** d145c58

## Known Stubs

None. The new inputs are fully wired: `repsPerSet` and `weightKg` state → `handleSave` → `setsData` on `ExerciseLogEntry` → `AsyncStorage.setItem('@vitalspan_exercise_log')`.

## Threat Surface Scan

No new network endpoints, auth paths, or file access patterns introduced. All user input goes through `parseInt`/`parseFloat` with `|| fallback` guards — NaN/empty input maps to safe defaults per T-21-02. T-21-03 mitigated with `Math.min(setsNum, 20)` cap.

## Self-Check: PASSED

- src/components/QuickLogModal.tsx modified — FOUND
- Commit d145c58 — FOUND (git rev-parse --short HEAD)
- `grep "setsData"` — matches
- `grep "repsPerSet"` — matches
- `grep "INTENSITY_OPTIONS"` and `grep "INTENSITY_COLORS"` exports — present
- `npx tsc --noEmit` — exits 0 (confirmed)
