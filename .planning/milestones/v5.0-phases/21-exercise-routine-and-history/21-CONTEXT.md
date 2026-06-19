# Phase 21: Exercise Routine & History - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the personal Rutinim tab within the existing Exercise screen: add/reorder/remove exercises (max 10), display routine cards with last-session load + trend badge, persist routine in AsyncStorage. Upgrade exercise log entries to capture per-set weightKg + repsPerSet. Add full-date display, edit, and delete for history entries. Show a weekly progressive overload sparkline on ExerciseDetailScreen. No new navigation screens required — all changes live within ExerciseScreen.tsx, ExerciseDetailScreen.tsx, QuickLogModal.tsx, and src/data/exercises.ts.

</domain>

<decisions>
## Implementation Decisions

### D-01: Rutinim/Keşfet Layout — Smart Default
- Open to **Rutinim** view if the user has exercises in their routine, **Keşfet** (library) if routine is empty.
- Toggle: **segmented control at top of screen** (two-segment pill: Rutinim | Keşfet), pinned below the header row — replaces or sits alongside the existing category filter chips area.
- When in Rutinim view, the category filter chips are hidden (they belong to Keşfet). When in Keşfet, show existing category chips as now.

### D-02: Rutinim Exercise Cards
- Each card shows: **exercise name** + **illustration thumbnail** (from existing `ExerciseIllustrations` or exercise photo) + **trend badge** (↑ improving / – stable / ↓ declining) + **last-session summary** (e.g. "80kg × 10 reps" or "10 reps" for bodyweight).
- Drag handle visible on the left edge for reordering.
- Tap the card → navigate to `ExerciseDetailScreen` for that exercise (existing nav pattern).
- No separate "add from library" button needed on the card — the Keşfet view handles adding.

### D-03: Adding to Routine from Keşfet
- In Keşfet view, each exercise card gets an **add-to-routine button** (e.g. "+" icon or "Add to Rutinim") that adds it to the routine if not already there (max 10 cap enforced with a user-facing message).
- If already in routine, button shows a filled/checkmark state or is disabled.

### D-04: Per-Set Data Model (extends src/data/exercises.ts)
- Add new type to `src/data/exercises.ts`:
  ```typescript
  export interface SetRecord {
    reps: number;
    weightKg?: number;  // omitted for bodyweight exercises
  }
  ```
- Extend `ExerciseLogEntry` with optional field:
  ```typescript
  setsData?: SetRecord[];
  ```
- All existing fields (`sets?`, `reps?`, `intensity?`, `durationMin?`, `caloriesEstimated?`) are PRESERVED for backward compatibility — old log entries render using the legacy fields; new entries use `setsData`.
- No AsyncStorage migration needed — `setsData` is additive.

### D-05: Logging UX — Targeted Edits to QuickLogModal
- Replace the `intensity` chip row (easy/moderate/hard) with three numeric inputs: **Sets**, **Reps per set**, **Weight (kg)** (weight is optional — left blank for bodyweight).
- On save: build `setsData = Array(sets).fill({ reps: repsPerSet, weightKg: weight || undefined })`.
- Keep existing modal structure (KeyboardAvoidingView, title, notes field, save/cancel buttons).
- The `intensity` field on `ExerciseLogEntry` can remain as a type but is no longer captured via UI in new logs.

### D-06: Editing Past Log Entries (HIST-02)
- Tapping a history row opens an edit sheet (bottom sheet modal, same style as existing modals).
- Editable fields: **Sets**, **Reps per set**, **Weight (kg)** — same three inputs as the log form.
- **Date is read-only** — when it was logged is a historical fact.
- On save, update the entry's `setsData[]` and persist to `@vitalspan_exercise_log`.
- The existing `SwipeableLogRow` gains an `onEdit` prop alongside `onDelete`.

### D-07: Progressive Overload Metric
- **Metric:** Max weight (heaviest single-set `weightKg`) across all sessions in a given week. For bodyweight exercises (all `setsData` entries lack `weightKg`), metric = max reps in a single set that week.
- **Weekly trend badge (OVLD-02):** Compare current week's max weight vs. previous week's max weight. `current > previous` → ↑ improving; `current === previous` → – stable; `current < previous` → ↓ declining. No data this week → badge hidden.
- **Sparkline (OVLD-03):** 8 weeks of history (most recent 8 ISO weeks). Uses `react-native-chart-kit` LineChart. Weeks with no logs show a 0 or null data point (gap in chart). Rendered on `ExerciseDetailScreen` below the exercise description.

### D-08: Routine Storage
- New AsyncStorage key: `@vitalspan_exercise_routine` — stores `string[]` of exercise IDs in display order.
- Max 10 exercises enforced on add; re-order updates the array in place.
- Remove: filters the ID out of the array.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current Exercise Implementation (to extend)
- `src/screens/ExerciseScreen.tsx` — Full current implementation: category filter, muscle map, Today/This Week/History log sections, `SwipeableLogRow`, `QuickLogModal`, `loadData`, `deleteLog`. The Rutinim/Keşfet toggle and Rutinim view are NEW additions within this file.
- `src/screens/ExerciseDetailScreen.tsx` — Exercise detail with photo, `QuickLogModal`. Phase 21 adds the overload sparkline below the exercise description.
- `src/components/QuickLogModal.tsx` — Current log entry modal (targeted edits only: replace intensity chips with Sets/Reps/Weight inputs).
- `src/components/SwipeableLogRow.tsx` — Current swipeable history row (add `onEdit` prop; tap row body opens edit sheet).

### Data Types (to extend)
- `src/data/exercises.ts` — `ExerciseLogEntry`, `ExerciseIntensity`, `Exercise`, `ExerciseCategory`, `EXERCISE_CATEGORIES`. Add `SetRecord` interface and `setsData?: SetRecord[]` to `ExerciseLogEntry` here.

### Drag-to-Reorder
- Package already installed: `react-native-gesture-handler` (~2.28.0) + `react-native-reanimated` (~4.1.1). Use `react-native-draggable-flatlist` or a RNGH-based custom drag implementation. Verify if `react-native-draggable-flatlist` is already in package.json before installing — if not, it requires adding (compatible with current RNGH/Reanimated versions).

### Charts
- Package already installed: `react-native-chart-kit` (^6.12.0) + `react-native-svg` (15.12.1). Use `LineChart` from `react-native-chart-kit` for the 8-week sparkline.

### AsyncStorage Keys
- `@vitalspan_exercise_log` — `ExerciseLogEntry[]` — PRESERVED; `setsData` is additive
- `@vitalspan_exercise_routine` — NEW `string[]` of exercise IDs in routine order

### Theme & Design System
- `src/theme/index.ts` — all colors, spacing, typography tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SwipeableLogRow` (`src/components/SwipeableLogRow.tsx`) — swipe-left-to-delete pattern using RNGH. Add `onEdit` prop; tap on row body calls `onEdit(log)`.
- `QuickLogModal` (`src/components/QuickLogModal.tsx`) — targeted edits only; keep structure, replace intensity row with Sets/Reps/Weight inputs.
- `ExerciseIllustrations` (`src/components/exercise-illustrations/`) — already imported in `ExerciseDetailScreen`; import in Rutinim card for thumbnail.
- `getExercises()` (`src/lib/exerciseService.ts`) — async exercise lookup; use to resolve exercise names/photos from routine IDs.
- `RunnerIcon`, `DesignSystemIcons` — empty state icon pattern already in `ExerciseScreen`.

### Established Patterns
- `useFocusEffect` + `loadData` pattern for refresh on screen focus — keep for Rutinim and Keşfet view data.
- `StyleSheet` named `s` at bottom of file — follow existing convention.
- Bottom-sheet modal pattern (Modal + KeyboardAvoidingView + TouchableOpacity overlay) — use for edit-log sheet.
- `getMondayStr(date)` — already in `ExerciseScreen`; use for weekly bucketing in overload computation.

### Integration Points
- `SwipeableLogRow` needs `onEdit` prop to open the edit-log sheet; `onDelete` behavior unchanged.
- `ExerciseDetailScreen` needs a new section below exercise description for the sparkline — reads `@vitalspan_exercise_log` on focus and filters by `exerciseId`.
- Rutinim view reads `@vitalspan_exercise_routine` (new key) and `@vitalspan_exercise_log` to derive last-session data and trend badges.

</code_context>

<specifics>
## Specific Ideas

- **Segmented control style:** Follow the existing tab/pill patterns in the app (e.g., the Longevity Score tab row). Two equal segments: "Rutinim" and "Keşfet".
- **Trend badge:** Simple text badge — green ↑ / grey – / red ↓. No icon library needed. Can use Unicode arrows.
- **Last-session summary on Rutinim card:** Derive from the most recent `ExerciseLogEntry` for that exercise ID. Show `setsData[0].weightKg × setsData[0].reps` if `setsData` exists; fall back to `${sets} × ${reps}` from legacy fields.
- **Per-set repeater deferred:** User chose the simple form. Per-set repeater (where each set is logged individually) is deferred.

</specifics>

<deferred>
## Deferred Ideas

- **Multiple named routines** (e.g., "Upper Body Day", "Leg Day") — REQUIREMENTS.md already marks `ROUT-MULTI` as deferred. Phase 21 is a single personal routine only.
- **AI-generated routine recommendations** — marked as `ROUT-AI` deferred in REQUIREMENTS.md.
- **Per-set repeater logging** — logging each set one at a time during a workout. Considered but user chose the simpler "summary form" approach (3 inputs for all sets).
- **Backdating log entries** — editing the date of a past entry. Out of scope; date is read-only in the edit sheet (D-06).
- **Cardio-specific duration/calorie path** — no separate cardio vs. strength split in Phase 21; `durationMin` and `caloriesEstimated` remain on `ExerciseLogEntry` but new UI focuses on sets/reps/weight.

</deferred>

---

*Phase: 21-Exercise Routine & History*
*Context gathered: 2026-06-16*
