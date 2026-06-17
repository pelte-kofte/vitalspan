---
plan: 21-05
phase: 21-exercise-routine-and-history
status: complete
completed: "2026-06-17"
requirements:
  - OVLD-03
---

# Plan 21-05 — ExerciseDetailScreen Progressive Overload Sparkline

## What Was Built

Added an 8-week progressive overload LineChart to `ExerciseDetailScreen.tsx` using `react-native-chart-kit` (already installed). The chart appears below the Longevity Note section and shows weekly max-weight (or max-reps for bodyweight exercises) for the last 8 ISO weeks.

## Key Files

### Modified
- `src/screens/ExerciseDetailScreen.tsx` — added imports, helpers, state, useFocusEffect extension, chart JSX, new StyleSheet entry

## Implementation Details

**New imports:** `AsyncStorage`, `ExerciseLogEntry`, `LineChart` from `react-native-chart-kit`, `Dimensions`

**Local helpers (above component):**
- `MONTH_ABBR` — month abbreviations array
- `PRIMARY_RGBA(opacity)` — named rgba helper for Colors.primary (#2D6A4F → rgba(45, 106, 79, …))
- `SURFACE_MUTED_RGBA(opacity)` — named rgba helper for Colors.onSurfaceMuted (#6B6B64 → rgba(107, 107, 100, …))
- `getMondayStr(date)` — defined locally (not imported from ExerciseScreen)
- `computeWeeklyMaxes(logs, exerciseId)` — builds 8-element data+labels arrays with D-07 two-branch bodyweight logic

**D-07 two-branch logic in `computeWeeklyMaxes`:**
- Weight branch: if any entry in the week has `setsData[].weightKg` defined → use `Math.max(...weights)`
- Bodyweight branch: if all entries are bodyweight-only → use `Math.max(...reps)` so chart shows rep-count trend instead of flat zero

**Chart guard:** `nonZeroCount = overloadData.filter(v => v > 0).length` — LineChart renders only when `nonZeroCount >= 2`; otherwise shows placeholder text "Log this exercise in 2 or more weeks to see your progress trend."

**chartConfig** uses `PRIMARY_RGBA` and `SURFACE_MUTED_RGBA` helpers — no raw rgba literals.

**useFocusEffect extension:** Added fire-and-forget `AsyncStorage.getItem('@vitalspan_exercise_log')` chain after exercise load. Failure sets no state (chart shows placeholder).

## Self-Check

| Check | Result |
|-------|--------|
| `grep "LineChart" src/screens/ExerciseDetailScreen.tsx` | 2 matches (import + JSX) ✓ |
| `grep "computeWeeklyMaxes"` | matches ✓ |
| `grep "vitalspan_exercise_log"` | match in useFocusEffect ✓ |
| `grep "PROGRESSIVE OVERLOAD"` | match ✓ |
| `grep "Log this exercise in 2 or more weeks"` | match ✓ |
| `grep "PRIMARY_RGBA\|SURFACE_MUTED_RGBA"` | matches ✓ |
| `grep "hasWeight"` | match (bodyweight branch) ✓ |
| `npx tsc --noEmit` | exits 0 ✓ |
| No new packages installed | react-native-chart-kit was already present ✓ |

## Self-Check: PASSED
