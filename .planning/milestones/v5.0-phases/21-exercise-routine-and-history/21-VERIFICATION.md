---
phase: 21-exercise-routine-and-history
verified: 2026-06-17T00:00:00Z
status: human_needed
score: 18/18 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open ExerciseScreen on a populated routine; long-press a routine card's drag handle (⠿) and drag vertically to reorder"
    expected: "Card lifts (ScaleDecorator scale animation), can be dragged to new position, releases into reordered list; new order persists after app focus cycle"
    why_human: "DraggableFlatList long-press drag gesture cannot be verified by grep; visual feedback and ordering persistence requires device interaction"
  - test: "Open ExerciseScreen with an empty routine (Rutinim tab); verify empty state text and CTA"
    expected: "RunnerIcon shown, 'Build your routine' headline visible, 'Explore Exercises' CTA button switches to Keşfet tab when tapped"
    why_human: "Visual layout and tab-switching behavior require running the app on device/simulator"
  - test: "Add an exercise from Keşfet, then attempt to add 10 more"
    expected: "First 10 additions succeed; 11th addition shows Alert: 'Routine full' with message 'You can add up to 10 exercises to your routine. Remove one to add another.'"
    why_human: "Alert dialog behavior cannot be verified without running the app"
  - test: "Log a bodyweight-only exercise (no weightKg) for 2 or more different ISO weeks; open ExerciseDetailScreen for that exercise"
    expected: "Sparkline chart renders (not placeholder), showing rep-count trend across weeks instead of a flat zero line"
    why_human: "D-07 two-branch bodyweight rep-count logic requires end-to-end data flow through AsyncStorage and useFocusEffect; cannot be verified statically"
  - test: "Tap a log row in Today/This Week/History; verify EditLogSheet opens prefilled with correct data"
    expected: "EditLogSheet slides up showing exercise name + formatted date, Sets/Reps per set/Weight inputs pre-filled from the tapped log entry; saving updates the entry; deleting removes it"
    why_human: "Sheet opening, prefill correctness, and AsyncStorage round-trip after save/delete require interactive testing"
---

# Phase 21: Exercise Routine & History Verification Report

**Phase Goal:** Exercise Routine & History — users can build a personal routine, reorder it, view last-session summaries and trend badges, log exercises with per-set weight/reps, edit/delete log entries, and see a progressive overload sparkline on each exercise detail screen.
**Verified:** 2026-06-17
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SetRecord interface exported from exercises.ts with reps + optional weightKg | VERIFIED | Line 34 of exercises.ts: `export interface SetRecord { reps: number; weightKg?: number; }` |
| 2 | ExerciseLogEntry.setsData?: SetRecord[] is additive and all 13 legacy fields preserved | VERIFIED | Line 51 of exercises.ts: `setsData?: SetRecord[];` — all legacy fields (id, exerciseId, exerciseName, category, date, sets, reps, durationMin, intensity, caloriesEstimated, notes, loggedAt) present |
| 3 | Drag-to-reorder dependency resolved (react-native-draggable-flatlist installed) | VERIFIED | package.json line 36: `"react-native-draggable-flatlist": "^4.0.3"` |
| 4 | QuickLogModal shows Sets, Reps/set, Weight (kg) inputs; setsData written on save | VERIFIED | QuickLogModal.tsx: `repsPerSet` state (line 43), `weightKg` state (line 44), `setsData: SetRecord[] = Array(setsNum).fill(...)` in handleSave (line 78), cardio guard `isCardio ? undefined : setsData` (line 92) |
| 5 | INTENSITY_OPTIONS and INTENSITY_COLORS still exported from QuickLogModal | VERIFIED | Lines 18–28 of QuickLogModal.tsx: both constants exported; `estimateCalories` also preserved |
| 6 | SwipeableLogRow shows full date (day + month + year) on every log row | VERIFIED | `formatLogDate` helper at line 22 with `T00:00:00` UTC-safe parsing; `toLocaleDateString('en-GB', ...)` for "16 Jun 2026" format; rendered at line 86 |
| 7 | SwipeableLogRow onEdit prop is optional and wired to row body tap | VERIFIED | Props interface at line 27–32: `onEdit?: (log: ExerciseLogEntry) => void`; TouchableOpacity at line 78 calls `onEdit(log)` when prop is provided |
| 8 | SwipeableLogRow setsData-aware meta display (weighted, bodyweight, legacy) | VERIFIED | Lines 65–67: three-branch meta: setsData with weightKg → "3×10 @ 80kg"; setsData no weightKg → "3×10"; legacy sets/reps → "3×12" |
| 9 | Rutinim/Kesfet segmented control appears in ExerciseScreen | VERIFIED | Lines 232–245 of ExerciseScreen.tsx: two TouchableOpacity segments with style toggling via `activeTab` state |
| 10 | Smart default: Rutinim when routine has items, Kesfet when empty | VERIFIED | Line 120: `setActiveTab(parsedRoutine.length > 0 ? 'rutinim' : 'kesset')` in loadData |
| 11 | DraggableFlatList reorder implemented in Rutinim view | VERIFIED | ExerciseScreen.tsx line 379: `<DraggableFlatList>` with `onDragEnd={({ data }) => reorderRoutine(data)}` and `ScaleDecorator` wrapper; `reorderRoutine` persists to `@vitalspan_exercise_routine` |
| 12 | Routine cards show drag handle, thumbnail, last-session, trend badge, remove button | VERIFIED | RoutineCard.tsx (141 lines): drag handle slot (line 38), 44×44 thumb with photo/SVG/placeholder (lines 45–53), lastSession text (lines 59–61), trendBadge (lines 66–68), remove TouchableOpacity (lines 69–75) |
| 13 | Kesfet add-to-routine button; "✓" when in routine; Alert on max 10 | VERIFIED | ExerciseScreen.tsx lines 527–536: `addToRoutineBtn` with `disabled={routine.includes(ex.id)}`, `{routine.includes(ex.id) ? '✓' : '+'}`, Alert in `addToRoutine` at line 142 |
| 14 | Rutinim empty state with "Build your routine" and "Explore Exercises" CTA | VERIFIED | ExerciseScreen.tsx lines 356–371: RunnerIcon + "Build your routine" headline + CTA switches to 'kesset' |
| 15 | Edit log sheet opens from all three SwipeableLogRow callsites | VERIFIED | ExerciseScreen.tsx lines 444, 462, 480: `onEdit={openEditSheet}` on Today, This Week, and History section rows |
| 16 | EditLogSheet allows changing Sets/Reps/Weight and saves/deletes via AsyncStorage | VERIFIED | EditLogSheet.tsx: 192-line component with Sets/Reps per set/Weight inputs, Save Changes, Delete Entry, Cancel buttons; ExerciseScreen.tsx `saveEditLog` writes updated setsData to `@vitalspan_exercise_log` |
| 17 | ExerciseDetailScreen shows 8-week progressive overload sparkline (LineChart) | VERIFIED | ExerciseDetailScreen.tsx: LineChart import (line 9), `computeWeeklyMaxes` function (line 34–70) with D-07 two-branch logic, `hasWeight` branch in both weight and bodyweight paths, `nonZeroCount >= 2` guard (line 204), "PROGRESSIVE OVERLOAD — 8 WEEKS" label (line 203), placeholder text (lines 225–227) |
| 18 | tsc --noEmit exits 0 across all modified files | VERIFIED | `npx tsc --noEmit; echo "EXIT:$?"` → `EXIT:0` |

**Score:** 18/18 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/exercises.ts` | SetRecord interface + setsData field on ExerciseLogEntry | VERIFIED | SetRecord at line 34; setsData at line 51; all legacy fields preserved |
| `package.json` | react-native-draggable-flatlist installed | VERIFIED | `"react-native-draggable-flatlist": "^4.0.3"` at line 36 |
| `src/components/QuickLogModal.tsx` | Sets/Reps/Weight log form; setsData written on save | VERIFIED | repsPerSet state, weightKg state, setsData in handleSave; INTENSITY_OPTIONS/INTENSITY_COLORS still exported |
| `src/components/SwipeableLogRow.tsx` | onEdit prop + full-date display + setsData-aware meta | VERIFIED | formatLogDate helper, onEdit?: prop, TouchableOpacity body tap, three-branch meta line |
| `src/screens/ExerciseScreen.tsx` | Rutinim/Kesfet toggle, routine CRUD, DraggableFlatList, edit sheet wiring | VERIFIED | All state, helpers, CRUD functions, JSX segments present; onEdit wired to all 3 log sections |
| `src/components/RoutineCard.tsx` | Exercise card with thumbnail, last-session, trend badge, drag handle slot, remove | VERIFIED | 141 lines; all required elements rendered |
| `src/components/EditLogSheet.tsx` | Bottom sheet for editing log entry's Sets/Reps/Weight; Save/Delete/Cancel | VERIFIED | 192 lines; all buttons and inputs present; formatLogDate used for subtitle |
| `src/screens/ExerciseDetailScreen.tsx` | 8-week LineChart sparkline with D-07 two-branch logic and chart guard | VERIFIED | LineChart, computeWeeklyMaxes, PRIMARY_RGBA/SURFACE_MUTED_RGBA helpers, nonZeroCount guard, placeholder text |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| ExerciseLogEntry | SetRecord[] | `setsData?: SetRecord[]` optional field | WIRED | Pattern `setsData\?:\s*SetRecord\[\]` matches exercises.ts line 51 |
| QuickLogModal handleSave | ExerciseLogEntry.setsData | `Array(setsNum).fill({ reps: repsNum, weightKg: weightNum })` | WIRED | Line 78 of QuickLogModal.tsx |
| SwipeableLogRow row body | onEdit(log) | TouchableOpacity wrapping Animated.View content | WIRED | Lines 78–93 of SwipeableLogRow.tsx; onPress calls `onEdit(log)` when prop provided |
| ExerciseScreen Rutinim tab | @vitalspan_exercise_routine | loadData reads; addToRoutine/removeFromRoutine/reorderRoutine write | WIRED | 4 matches for `vitalspan_exercise_routine` in ExerciseScreen.tsx (lines 114, 147, 153, 158) |
| SwipeableLogRow onEdit | openEditSheet | `onEdit={openEditSheet}` at all 3 log section callsites | WIRED | Lines 444, 462, 480 of ExerciseScreen.tsx |
| ExerciseDetailScreen useFocusEffect | @vitalspan_exercise_log | AsyncStorage.getItem fires in useFocusEffect callback | WIRED | Line 101 of ExerciseDetailScreen.tsx |
| LineChart data | weekly max weight per ISO week | computeWeeklyMaxes(logs, exerciseId) called and results set to overloadData/overloadLabels | WIRED | Lines 103–106 of ExerciseDetailScreen.tsx |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| ExerciseScreen.tsx (routine cards) | `routine: string[]` | `AsyncStorage.getItem('@vitalspan_exercise_routine')` in loadData | Yes — JSON.parse of stored IDs | FLOWING |
| ExerciseScreen.tsx (log sections) | `logs: ExerciseLogEntry[]` | `AsyncStorage.getItem('@vitalspan_exercise_log')` in loadData | Yes — JSON.parse of stored entries | FLOWING |
| ExerciseScreen.tsx (trend badge) | `currMax`, `prevMax` via `getWeeklyMaxWeight` | Filters `logs` state by exerciseId + date range | Yes — derives from real log data | FLOWING |
| ExerciseDetailScreen.tsx (sparkline) | `overloadData: number[]` | `AsyncStorage.getItem('@vitalspan_exercise_log')` in useFocusEffect → `computeWeeklyMaxes` | Yes — queries real stored entries | FLOWING |
| EditLogSheet.tsx | `editSets`, `editRepsPerSet`, `editWeightKg` | Prefilled by `openEditSheet(log)` from tapped log entry | Yes — read from real ExerciseLogEntry | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: Not run — this is a React Native / Expo iOS app; no runnable API endpoints or CLI entry points can be exercised without a running simulator or device. Behavioral verification deferred to human testing items.

---

### Probe Execution

Step 7c: No probe scripts found for Phase 21 (`find scripts -path '*/tests/probe-*.sh'` returned no results). No probes declared in PLAN files. SKIPPED.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| ROUT-01 | 21-04 | User can toggle between Rutinim and Keşfet views | SATISFIED | Segmented control at ExerciseScreen.tsx lines 232–245; activeTab state controls view gating |
| ROUT-02 | 21-04 | User can add exercise to routine (max 10) | SATISFIED | `addToRoutine` function with `routine.length >= 10` Alert guard; "+" button in Kesfet view |
| ROUT-03 | 21-04 | User can reorder exercises via drag-to-reorder | SATISFIED | DraggableFlatList + ScaleDecorator; onDragEnd calls reorderRoutine; ROUT-03 explicitly requires drag (no arrow-button substitution) — actual drag satisfied |
| ROUT-04 | 21-04 | User can remove an exercise from their routine | SATISFIED | `removeFromRoutine` function; "×" button in RoutineCard triggers removal |
| ROUT-05 | 21-04 | Rutinim empty state with "Add exercises" CTA | SATISFIED | "Build your routine" + "Explore Exercises" CTA at lines 356–371 of ExerciseScreen.tsx |
| HIST-01 | 21-03 | Past log entries display full date (day + month + year) | SATISFIED | `formatLogDate` helper renders "16 Jun 2026" format in SwipeableLogRow.tsx |
| HIST-02 | 21-04 | User can edit a past exercise log entry | SATISFIED | `openEditSheet` → EditLogSheet → `saveEditLog` writes updated setsData to AsyncStorage |
| HIST-03 | 21-04 | User can delete a past exercise log entry | SATISFIED | `deleteAndCloseSheet` calls existing `deleteLog(id)`; Delete Entry button in EditLogSheet |
| HIST-04 | 21-01/02 | Log entries capture weightKg and repsPerSet per set | SATISFIED | SetRecord interface; QuickLogModal builds `setsData: SetRecord[]` on save |
| OVLD-01 | 21-04 | Routine cards display last-session weight and reps | SATISFIED | `getLastSessionSummary` formats "3×10 @ 80kg" or "3×10 reps"; rendered in RoutineCard |
| OVLD-02 | 21-04 | Routine cards show weekly trend indicator (↑/–/↓) | SATISFIED | `getWeeklyMaxWeight` + `getTrendBadge` compute badge; rendered in RoutineCard with trendColor |
| OVLD-03 | 21-05 | ExerciseDetailScreen shows progressive overload sparkline | SATISFIED | LineChart with 8-week data; `computeWeeklyMaxes` with D-07 two-branch bodyweight logic |

**All 12 Phase 21 requirements: SATISFIED by code evidence.**

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/screens/ExerciseScreen.tsx | — | File is 785 lines; CLAUDE.md limits components to 200 lines | Warning | RoutineCard.tsx (141 lines) and EditLogSheet.tsx (192 lines) were extracted per plan requirement. ExerciseScreen is a screen orchestrator (not a reusable component), and the plan's acceptance criteria was "file under 200 lines OR components extracted." Extraction condition was satisfied. Remaining size is a screen-level orchestration concern, not a component blocker. |

No TBD, FIXME, or XXX markers found in any phase-modified file.
No stub return patterns found (no `return null` in render paths, no empty `return {}` or `return []` in data handlers).

---

### Human Verification Required

#### 1. Drag-to-Reorder Interaction

**Test:** Open ExerciseScreen with 2+ exercises in the Rutinim. Long-press (hold) the drag handle "⠿" on a routine card and drag vertically to change its position, then release.
**Expected:** ScaleDecorator scale animation activates on the dragging card; dragging moves it visually; on release the card snaps into new position in the list; new order persists after navigating away and returning.
**Why human:** DraggableFlatList gesture behavior (long-press threshold, drag animation, onDragEnd) requires physical touch interaction on device or simulator. Grep confirms DraggableFlatList is wired but cannot verify gesture feel.

#### 2. Rutinim Empty State Visual and CTA Navigation

**Test:** Ensure no exercises are in routine (or clear AsyncStorage key). Open Exercise tab.
**Expected:** Rutinim tab is selected (or defaults to Kesfet if truly empty), empty state card shows RunnerIcon, "Build your routine" headline, descriptive body, and "Explore Exercises" button. Tapping "Explore Exercises" switches to Kesfet tab.
**Why human:** Layout rendering and tab-switch animation require runtime observation.

#### 3. Max-10 Routine Alert

**Test:** Add 10 exercises to the routine, then attempt to add an 11th from Kesfet.
**Expected:** Alert.alert fires with title "Routine full" and message "You can add up to 10 exercises to your routine. Remove one to add another."
**Why human:** Alert.alert call is in the code but dialog display requires a running app.

#### 4. Bodyweight Exercise Sparkline (D-07 Two-Branch)

**Test:** Log a bodyweight-only exercise (e.g., push-ups, no weightKg entered) in QuickLogModal across 2+ different ISO weeks. Open that exercise's ExerciseDetailScreen.
**Expected:** Sparkline chart renders (not the placeholder), showing rep-count values per week as the Y-axis — not a flat zero line.
**Why human:** End-to-end data flow through setsData (bodyweight branch: weightKg undefined → reps used as metric) requires AsyncStorage writes and useFocusEffect reload.

#### 5. Edit Log Sheet Round-Trip

**Test:** Tap a log entry row in the Today, This Week, or History sections. Verify EditLogSheet opens. Change the Sets/Reps per set/Weight values. Tap "Save Changes". Tap the log row again.
**Expected:** Sheet opens pre-filled with the entry's current data. After saving, re-opening shows the updated values. Deleting via "Delete Entry" removes the row from the list.
**Why human:** prefill correctness, Modal animation, and AsyncStorage persistence after edits require interactive testing.

---

### Gaps Summary

No gaps found. All 18 must-have truths from all 5 plan files are satisfied in the codebase. All 12 requirements (ROUT-01 through ROUT-05, HIST-01 through HIST-04, OVLD-01 through OVLD-03) have implementation evidence. No blocker anti-patterns or unresolved debt markers detected. TypeScript exits clean (exit code 0).

Status is `human_needed` because 5 interactive behaviors require device/simulator testing that cannot be verified statically.

---

_Verified: 2026-06-17_
_Verifier: Claude (gsd-verifier)_
