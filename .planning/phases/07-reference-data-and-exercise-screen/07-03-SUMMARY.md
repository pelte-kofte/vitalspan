---
phase: 07-reference-data-and-exercise-screen
plan: 03
subsystem: exercise-screen
tags: [exercise, service-layer, calendar-week, intensity-colors, react-native]
dependency_graph:
  requires: [07-01]
  provides: [exercise-screen-service-wired, 3-section-log-display, intensity-color-coding]
  affects: [ExerciseScreen]
tech_stack:
  added: []
  patterns: [supabase-first-with-static-fallback, calendar-week-boundaries, per-intensity-theming]
key_files:
  created: []
  modified:
    - src/screens/ExerciseScreen.tsx
decisions:
  - "EXERCISES static import removed; exercises loaded via getExercises() on every focus event"
  - "loadLogs renamed to loadData; exercise library load joined into single Promise.all with AsyncStorage reads"
  - "getMondayStr and getYesterdayStr are module-level helpers (not inside component) — no component dependencies"
  - "historyStartStr computed inline as IIFE to stay co-located with other date strings"
  - "intensityChipActive and intensityTxtActive StyleSheet entries removed — replaced by inline dynamic styles using INTENSITY_COLORS map"
  - "Exercise library section wrapped in exercises.length > 0 guard — shows nothing during initial async load"
  - "Empty state CTA uses exercises[0] ?? null (safe if exercises array is empty during load)"
metrics:
  duration: "15 minutes"
  completed: "2026-05-31T21:15:19Z"
  tasks_completed: 2
  files_created: 0
  files_modified: 1
---

# Phase 07 Plan 03: ExerciseScreen Service Wiring and UI Rebuild Summary

ExerciseScreen rebuilt to load the exercise library from exerciseService (Supabase + static fallback), restructure the activity log into Today / This Week / History sections with calendar-week boundaries, and add per-intensity color coding to both the QuickLogModal intensity picker and log entry dots.

## What Was Built

### exerciseService Integration (EX-02)

Replaced direct `EXERCISES` array usage with async `getExercises()` call from `src/lib/exerciseService.ts`. The component now holds an `exercises` state (`useState<Exercise[]>([])`), populated on every focus event via `loadData()` — a `Promise.all` combining AsyncStorage log reads with the `getExercises()` call. If Supabase is unreachable, `getExercises()` silently returns the static `EXERCISES` array.

### Three-Section Log Display (EX-01)

Calendar-week helper functions (`getMondayStr`, `getYesterdayStr`) live at module scope (above the component). Date boundary strings (`todayStr`, `mondayStr`, `yesterdayStr`, `historyStartStr`) are computed on each render without `useMemo` (cheap string operations).

Three `useMemo` computations partition `logs[]`:
- `todayLogs`: entries where `date === todayStr`
- `thisWeekLogs`: entries where `mondayStr <= date <= yesterdayStr` (Monday through yesterday; hides on Monday when same as today)
- `historyLogs`: entries where `historyStartStr <= date < mondayStr` (14 days before current week start)

Each section is conditionally rendered only when its array is non-empty (`length > 0` guard). This Week and History sections show `log.date` in the meta line for temporal context.

### Per-Intensity Color Coding (EX-03)

Two module-level color maps were added:

`INTENSITY_DOT` maps `ExerciseIntensity` to a dot background color: easy=optimal(green), moderate=review(amber), hard=critical(coral).

`INTENSITY_COLORS` maps `ExerciseIntensity` to `{ bg, border, text }` using `Colors.status.*Bg/Border/Text` tokens.

Log entry dots in all three sections use `INTENSITY_DOT[log.intensity]` as an inline `backgroundColor` override when `intensity` is defined.

QuickLogModal intensity pills use `INTENSITY_COLORS[opt.key]` as inline dynamic `backgroundColor` + `borderColor` when the pill is active. The `intensityChipActive` and `intensityTxtActive` StyleSheet entries were removed as they are no longer referenced.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 + 2 | 5a38368 | feat(07-03): wire exerciseService, 3-section log display, intensity color coding |

Note: Tasks 1 and 2 were committed together since they both modify only `ExerciseScreen.tsx` and the changes are tightly coupled.

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` errors | 0 |
| `grep "from '../lib/exerciseService'"` | Confirmed on line 16 |
| `grep "EXERCISES"` in ExerciseScreen | No references (removed) |
| `grep "thisWeekLogs|historyLogs"` | Both section memos and JSX blocks present |
| `grep "INTENSITY_COLORS|INTENSITY_DOT"` | Both maps present |
| `grep "Colors.status.optimalBg|reviewBg|criticalBg"` | All three intensity colors use theme tokens |

## Deviations from Plan

### Context Differences

**1. [Context - Phase 6 warm UI already merged] File had additional Phase 6 changes**
- **Found during:** Initial file read (after git merge main)
- **Issue:** The worktree was behind main. After merging, ExerciseScreen.tsx had Phase 6 warm UI changes (Beige palette, Elevation tokens, empty state card, `setStatusBarStyle` import) not present in the plan's read_first expectation of 651 lines.
- **Fix:** Preserved all Phase 6 warm UI changes, applied plan modifications on top. All plan objectives achieved with no regressions.
- **Files modified:** None — the merge was additive.

## Known Stubs

None — `getExercises()` is fully implemented with Supabase query and static fallback. Log sections display real AsyncStorage data.

## Threat Flags

No new threat surface introduced. Calendar-week date logic uses device clock (pure JS), no external input. exerciseService trust boundary unchanged from Plan 07-01.

## Self-Check: PASSED

Files exist:
- FOUND: src/screens/ExerciseScreen.tsx
- FOUND: .planning/phases/07-reference-data-and-exercise-screen/07-03-SUMMARY.md

Commits exist:
- FOUND: 5a38368
