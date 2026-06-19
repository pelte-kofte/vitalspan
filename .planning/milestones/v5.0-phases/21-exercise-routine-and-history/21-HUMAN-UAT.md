---
status: partial
phase: 21-exercise-routine-and-history
source: [21-VERIFICATION.md]
started: "2026-06-17T00:00:00.000Z"
updated: "2026-06-17T00:00:00.000Z"
---

## Current Test

[awaiting human testing]

## Tests

### 1. Drag-to-reorder interaction
expected: Long-press on a Rutinim card's ⠿ handle enters drag mode; releasing at a new position reorders the routine and persists to @vitalspan_exercise_routine
result: [pending]

### 2. Rutinim empty state visual
expected: With empty @vitalspan_exercise_routine, opening ExerciseScreen shows Rutinim tab with RunnerIcon + "Build your routine" headline + "Explore Exercises" CTA button; tapping CTA switches to Keşfet tab
result: [pending]

### 3. Max-10 Alert dialog
expected: After adding 10 exercises to routine, tapping "+" on an 11th exercise shows Alert.alert with "Routine full" title and message about removing one first
result: [pending]

### 4. Bodyweight sparkline (D-07 two-branch)
expected: For an exercise logged without weight (bodyweight only), ExerciseDetailScreen sparkline shows rep-count trend over 8 weeks instead of a flat zero line; chart renders when 2+ weeks have non-zero reps
result: [pending]

### 5. EditLogSheet round-trip
expected: Tapping a log row opens EditLogSheet with Sets/Reps/Weight prefilled from stored setsData (or legacy sets/reps fallback); saving updates the entry in @vitalspan_exercise_log; deleting removes it
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
