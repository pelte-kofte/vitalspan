# Phase 7: Reference Data & Exercise Screen - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Two parallel workstreams:

1. **Supabase reference tables** — Create and seed `biomarker_definitions` (ranges + display strings) and `exercises` (all 59 + extensible) tables with public-read RLS. Wire a service layer (`src/lib/biomarkerService.ts`, `src/lib/exerciseService.ts`) that fetches from Supabase and falls back to static arrays on error/offline. All biomarker-consuming screens switch to `biomarkerService`; `ExerciseScreen` switches to `exerciseService`.

2. **Exercise screen rebuild** — Restructure the log display into Today / This Week / History sections (calendar-week boundaries, empty sections hidden). Add intensity pill color coding (green/amber/coral for Easy/Moderate/Hard). Implement swipe-to-delete via Reanimated + PanGestureHandler with immediate delete on full swipe. Remove the existing long-press delete.

No screens other than the biomarker-consuming ones and `ExerciseScreen` are modified. Phase 8 handles the user biomarker *write* path (fire-and-forget Supabase sync for new entries).

</domain>

<decisions>
## Implementation Decisions

### Data Layer Architecture
- **D-01:** Service files pattern — `src/lib/exerciseService.ts` + `src/lib/biomarkerService.ts`. Each exports a single async function that tries Supabase first, falls back to the static array on any error. Screens call the service function; they do not call `supabase` directly for these resources.
- **D-02:** All biomarker consumers use `biomarkerService` — `BiomarkersScreen`, `BiomarkerDetailScreen`, `BiomarkerEntryScreen`, and `LongevityScoreScreen` all fetch via the service. Dashboard can continue using the static array if it only reads summary counts (not detailed ranges).
- **D-03:** SQL seed files committed to repo at `src/db/seed_exercises.sql` + `src/db/seed_biomarker_definitions.sql`. Run once via Supabase dashboard SQL editor. Files are version-controlled and reproducible.

### biomarker_definitions Table Schema
- **D-04:** Table fields: `id` (text PK matching static `Biomarker.id`), `name`, `unit`, `opt_min` (numeric), `opt_max` (numeric), `category`, `target`, `description`. This is "ranges + display strings" — the subset that clinicians may need to update without an app release.
- **D-05:** Merge strategy: Supabase values override static field-by-field on matching `id`. UI-only fields not in the table (`color`, `howToImprove`, `insight`, `defaultVal`, `prevVal`, `history`) are preserved from the static `BIOMARKERS` array. Result is a merged `Biomarker[]` identical in shape to the existing type.
- **D-06:** RLS: public `anon` role gets `SELECT`. No insert/update/delete from the client.

### exercises Table Schema
- **D-07:** Seed all 59 exercises from `src/data/exercises.ts`. Table schema mirrors the `Exercise` interface: `id`, `name`, `category`, `body_part`, `equipment`, `muscle_group`, `secondary_muscles` (text[]), `target`, `instructions`. Schema is forward-compatible — new exercises can be added directly in Supabase without an app update.
- **D-08:** RLS: public `anon` role gets `SELECT` only.

### Exercise Log Section Grouping (EX-01)
- **D-09:** **Today** = entries where `date === today` (YYYY-MM-DD ISO string, same format already used in `ExerciseLogEntry.date`).
- **D-10:** **This Week** = entries from Monday of the current calendar week through yesterday (exclusive of today). If today is Monday, "This Week" shows nothing — the section is hidden entirely.
- **D-11:** **History** = entries from the 14 days immediately before the start of the current week (i.e., covering up to 2+ full prior weeks). Entries older than that are not shown in the UI but remain in AsyncStorage.
- **D-12:** Empty sections are **hidden entirely** — no section header or empty-state message rendered when a section has zero entries.

### Intensity Pill Color Coding (EX-03)
- **D-13:** Easy = green (`Colors.status.optimal` / `Colors.status.optimalBg`). Moderate = amber (use `Colors.status.elevated` / `Colors.status.elevatedBg` or equivalent — check theme for correct token). Hard = coral/red (`Colors.status.critical` / `Colors.status.criticalBg`). All tokens must come from `Colors.*` — no hardcoded hex values.
- **D-14:** Color coding applies to both the intensity picker pills in `QuickLogModal` AND the rendered log entries in the history sections.

### Swipe-to-Delete (EX-04)
- **D-15:** Implementation: Reanimated + `PanGestureHandler` from `react-native-gesture-handler`. Both are already installed — no new dependencies.
- **D-16:** Gesture: swipe left reveals a red delete zone. Full swipe (past a threshold, e.g. 80px) triggers immediate delete with `Haptics.notificationAsync(NotificationFeedbackType.Error)`. No confirmation dialog.
- **D-17:** Long-press delete is **removed**. Swipe is the sole delete interaction.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/ROADMAP.md` §Phase 7 — goal, success criteria, and requirements (SUPA-04, SUPA-05, EX-01, EX-02, EX-03, EX-04). Success criteria are the acceptance gates.
- `.planning/REQUIREMENTS.md` §Supabase Infrastructure + §Exercise Screen — full requirement text for SUPA-04, SUPA-05, EX-01 through EX-04.

### Existing Code to Modify
- `src/screens/ExerciseScreen.tsx` — current exercise screen; has warm Beige theme (Phase 6 complete), category filter, `QuickLogModal`, today's log section, and long-press delete. This file will be significantly restructured for Phase 7.
- `src/data/exercises.ts` — static `EXERCISES` array (59 entries), `Exercise` interface, `ExerciseIntensity`, `ExerciseLogEntry`, `EXERCISE_CATEGORIES`, `CATEGORY_MET`. The Supabase table schema mirrors `Exercise`. This file becomes the offline fallback.
- `src/data/biomarkers.ts` — static `BIOMARKERS` array and `Biomarker` interface. The `biomarkerService` merges Supabase data into this array's shape. This file is the offline fallback.
- `src/lib/supabase.ts` — Supabase client singleton. Import `supabase` from here in service files. Do not re-initialize.

### New Files to Create
- `src/lib/exerciseService.ts` — new; exports `getExercises(): Promise<Exercise[]>`
- `src/lib/biomarkerService.ts` — new; exports `getBiomarkers(): Promise<Biomarker[]>`
- `src/db/seed_exercises.sql` — new; seeds all 59 exercises into `exercises` table
- `src/db/seed_biomarker_definitions.sql` — new; seeds biomarker definitions into `biomarker_definitions` table

### Theme & Styling
- `src/theme/index.ts` — `Colors.status.*` tokens for intensity pill colors (check `optimal`, `elevated`, `critical` variants). `Colors.Beige.*` for all warm screen backgrounds. `Spacing.*`, `Radius.*`, `Elevation.*` for layout.

### Prior Phase Decisions
- `.planning/phases/04-supabase-foundation/04-CONTEXT.md` — Supabase anonymous auth, `initSupabaseSession()` fire-and-forget pattern, polyfill constraint (line 1 of supabase.ts).
- `.planning/phases/05-design-tokens-and-icons/05-CONTEXT.md` — `Colors.Beige.*` token definitions.

### Animation Reference
- `src/components/NeuralGrid.tsx` — Reanimated usage patterns in the codebase. Read before implementing swipe animation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.ts` — `supabase` client export; import directly in service files.
- `src/components/NeuralGrid.tsx` — shows Reanimated `useSharedValue`, `useAnimatedStyle`, `withSpring` patterns already used in the app.
- `src/screens/ExerciseScreen.tsx` — `QuickLogModal` component, `estimateCalories()`, `INTENSITY_OPTIONS` array, `EQUIPMENT_SHORT` map — these can be preserved in the rebuilt screen.
- `expo-haptics` — already used in ExerciseScreen; use `Haptics.notificationAsync(NotificationFeedbackType.Error)` for delete confirmation haptic.

### Established Patterns
- AsyncStorage key for exercise logs: `@vitalspan_exercise_log` (not in CLAUDE.md yet — stores `ExerciseLogEntry[]`). Must be preserved.
- Service layer pattern (new in Phase 7): `src/lib/` files export async functions. Screens call the function, not `supabase` directly.
- StyleSheet named `s` at the bottom of every screen file.
- All colors from `Colors.*`; all spacing from `Spacing.*`. No hardcoded hex.
- `useFocusEffect` + `setStatusBarStyle('dark')` required on ExerciseScreen (already present; preserve it).
- `tsc --noEmit` must pass — strict TypeScript throughout.

### Integration Points
- `BiomarkersScreen.tsx`, `BiomarkerDetailScreen.tsx`, `BiomarkerEntryScreen.tsx`, `LongevityScoreScreen.tsx` — these call `BIOMARKERS` from `src/data/biomarkers.ts` today. Phase 7 replaces that with a call to `getBiomarkers()` from `biomarkerService`.
- `ExerciseScreen.tsx` calls `EXERCISES` from `src/data/exercises.ts`. Phase 7 replaces that with `getExercises()` from `exerciseService`.
- `react-native-gesture-handler` is already registered in `App.tsx` (wraps everything in `GestureHandlerRootView`). `PanGestureHandler` can be used in ExerciseScreen without additional setup.

</code_context>

<specifics>
## Specific Ideas

- **Intensity colors must come from `Colors.status.*`** — the theme already has status colors for optimal/elevated/critical states. Map Easy → optimal (green), Moderate → elevated (amber), Hard → critical (coral). Verify exact token names in `src/theme/index.ts` before using.
- **Swipe threshold**: 80px left to trigger immediate delete. Show red background behind the row as the user swipes to signal the delete zone.
- **Log section headers** should match the existing `sectionLabel` style already in ExerciseScreen (uppercase, muted, letter-spaced) for visual consistency.
- **`@vitalspan_exercise_log` AsyncStorage key** is the source of truth for the log sections — no Supabase write in Phase 7 (that comes in Phase 8).

</specifics>

<deferred>
## Deferred Ideas

- **Biomarker history write path** (Supabase sync for new entries, one-time migration) — Phase 8 (SUPA-06, SUPA-07).
- **Trend charts** (30-day sparklines on BiomarkerDetail) — v3+, deferred since v1.
- **Exercise history beyond 14 days** — only last 14 days shown in UI; full history stays in AsyncStorage for a future history tab or export feature.

</deferred>

---

*Phase: 7 — Reference Data & Exercise Screen*
*Context gathered: 2026-05-31*
