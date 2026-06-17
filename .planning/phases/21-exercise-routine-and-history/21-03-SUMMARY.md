---
phase: 21-exercise-routine-and-history
plan: "03"
subsystem: components
tags: [exercise, history, ui, swipeable-row, date-display, tap-to-edit]
dependency_graph:
  requires: [21-01]
  provides: [SwipeableLogRow-onEdit-prop, full-date-display, tap-to-edit-entry-point]
  affects: [ExerciseScreen]
tech_stack:
  added: []
  patterns: [TouchableOpacity-inside-GestureDetector, locale-date-formatting]
key_files:
  modified:
    - src/components/SwipeableLogRow.tsx
decisions:
  - "Used 'T00:00:00' suffix on date string before Date() parse to prevent UTC timezone offset shifting the displayed day"
  - "Moved padding/gap/flexDirection from outer Animated.View (s.row) to inner TouchableOpacity (s.rowInner) so tap target is full-width without double-spacing"
  - "onEdit prop is optional (?:) so all existing SwipeableLogRow callers in ExerciseScreen.tsx continue to compile without modification"
  - "setsData[0]?.reps uses optional chaining and ?? '' fallback to guard against unexpected empty setsData array (T-21-05 threat mitigation)"
metrics:
  duration: 72s
  completed: "2026-06-17"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 21 Plan 03: SwipeableLogRow — onEdit Prop, Full-Date Display, Tap-to-Edit Summary

Full-date rendering ("16 Jun 2026") and optional `onEdit` tap-to-edit prop added to SwipeableLogRow, with setsData-aware meta line and UTC-safe date parsing.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add onEdit prop, full-date display, and tap-to-edit to SwipeableLogRow | 6760ec5 | src/components/SwipeableLogRow.tsx |

## What Was Built

`SwipeableLogRow` component was updated with three coordinated changes:

1. **Full-date display** — A `formatLogDate(dateStr: string): string` helper was added above the component. It parses `dateStr + 'T00:00:00'` with `new Date()` (preventing UTC offset from shifting the day for users west of UTC) and returns a human-readable string such as "16 Jun 2026" using `toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`. The formatted date is rendered as the first element of the meta line on every log row.

2. **setsData-aware meta line** — The secondary information line now checks `log.setsData` (the new structured per-set data from Plan 21-01) before falling back to legacy `log.sets`/`log.reps`. Weighted entries display "3×10 @ 80kg", bodyweight entries display "3×10", and legacy entries (no setsData) display "3×12". The `setsData[0]?.reps ?? ''` pattern guards against empty arrays per the T-21-05 threat mitigation.

3. **onEdit prop and tap-to-edit** — `onEdit?: (log: ExerciseLogEntry) => void` was added as an optional prop to `SwipeableLogRowProps`. The row body content was wrapped in a `TouchableOpacity` (`s.rowInner`) with `activeOpacity={0.75}` that calls `onEdit(log)` when pressed and the prop is provided. The outer `Animated.View` (`s.row`) retains only `backgroundColor` for the swipe-reveal visual; padding and layout properties moved to the inner `TouchableOpacity` to keep the tap target full-width without double-spacing.

The swipe-left-to-delete pan gesture (`Gesture.Pan()`, `SWIPE_THRESHOLD`, `triggerDelete`, `deleteOpacity`) is entirely unchanged.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

No new security-relevant surface introduced. T-21-05 (setsData[0] access on empty array) mitigated as planned via `log.setsData && log.setsData.length > 0` guard before array access.

## Known Stubs

None — no stub data or placeholder values introduced.

## Self-Check: PASSED

- [x] `src/components/SwipeableLogRow.tsx` exists and was modified
- [x] Commit `6760ec5` exists in git log
- [x] `grep "onEdit"` returns 3 matches (prop definition, component signature, onPress invocation)
- [x] `grep "formatLogDate"` returns matches (helper definition + call site)
- [x] `grep "T00:00:00"` returns a match
- [x] `grep "setsData"` returns matches
- [x] `npx tsc --noEmit` exits 0
