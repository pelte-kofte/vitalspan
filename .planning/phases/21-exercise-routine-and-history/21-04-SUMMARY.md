---
plan: 21-04
phase: 21-exercise-routine-and-history
status: complete
completed: "2026-06-17"
requirements:
  - ROUT-01
  - ROUT-02
  - ROUT-03
  - ROUT-04
  - ROUT-05
  - HIST-01
  - HIST-02
  - HIST-03
  - OVLD-01
  - OVLD-02
---

# Plan 21-04 — ExerciseScreen Routine/Discover Rebuild

## What Was Built

Rebuilt `ExerciseScreen.tsx` with the Rutinim/Keşfet segmented control, full routine management (add/reorder/remove), drag-to-reorder via DraggableFlatList, routine cards with last-session summary and trend badges, add-to-routine button in Keşfet view, edit-log bottom sheet, and onEdit wired to all SwipeableLogRow callsites.

## Key Files

### Created
- `src/components/RoutineCard.tsx` — exercise card showing thumbnail, name, last-session, trend badge, remove button, and drag handle slot
- `src/components/EditLogSheet.tsx` — bottom sheet Modal for editing a log entry's Sets/Reps/Weight; includes Save, Delete, Cancel

### Modified
- `src/screens/ExerciseScreen.tsx` — all state, helpers, CRUD functions, and JSX added

## Implementation Details

**Drag-to-reorder:** `react-native-draggable-flatlist` installed in Plan 21-01. Used `DraggableFlatList` + `ScaleDecorator` from `react-native-draggable-flatlist`. Drag handle is a `TouchableOpacity onLongPress={drag}` with "⠿" character.

**State added:** `activeTab`, `routine`, `editingLog`, `editSets`, `editRepsPerSet`, `editWeightKg`

**loadData extended:** reads `@vitalspan_exercise_routine` → sets `routine` + smart default tab (Rutinim if items, Keşfet if empty)

**Pure helpers added above component:**
- `getWeeklyMaxWeight` — D-07 two-branch: max weightKg for weighted; max reps for bodyweight
- `getTrendBadge` — returns ↑/–/↓/null
- `getTrendColor` — maps badge to Colors.status.optimal/critical/onSurfaceMuted
- `getLastSessionSummary` — formats "3×10 @ 80kg", "3×10 reps", or "3×12" legacy

**Routine CRUD:** addToRoutine (max 10 + Alert), removeFromRoutine, reorderRoutine — all write @vitalspan_exercise_routine

**Edit log:** openEditSheet, saveEditLog (Math.min 20 sets cap), deleteAndCloseSheet

**JSX structure:**
- Segmented control: below topBar, above activityCard
- Category chips + muscle map: conditionally shown only when activeTab === 'kesset'
- Rutinim empty state: RunnerIcon + "Build your routine" + "Explore Exercises" CTA → switches to Keşfet
- Rutinim cards: DraggableFlatList in a card container; each card uses RoutineCard with drag handle
- Keşfet library: existing exercise rows + "+" button (→ "✓" when in routine, disabled)
- Log sections (Today/This Week/History): always shown in both tabs; all 3 wired onEdit={openEditSheet}
- EditLogSheet: rendered before QuickLogModal at bottom of return

**Component extraction:** RoutineCard.tsx (141 lines) and EditLogSheet.tsx (192 lines) extracted per plan requirement (file > 200 lines rule)

## Self-Check

| Check | Result |
|-------|--------|
| `grep "vitalspan_exercise_routine"` | 3+ matches ✓ |
| `grep "activeTab"` | matches ✓ |
| `grep "onEdit={openEditSheet}"` | 3 matches (Today/ThisWeek/History) ✓ |
| `grep "routineThumb\|RoutineCard"` | matches ✓ |
| `grep "Build your routine\|Explore Exercises"` | matches ✓ |
| `grep "addToRoutineBtn\|addToRoutine("` | matches ✓ |
| `grep "DraggableFlatList"` | matches (drag-to-reorder) ✓ |
| `npx tsc --noEmit` | exits 0 ✓ |
| Components extracted | RoutineCard.tsx + EditLogSheet.tsx ✓ |

## Self-Check: PASSED
