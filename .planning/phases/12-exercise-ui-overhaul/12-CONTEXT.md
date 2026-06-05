# Phase 12: Exercise UI Overhaul - Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Three connected workstreams:

1. **Per-exercise visual content** — Add neural-dot movement figure, neural-dot muscle map, form cue, and longevity-optimized sets/reps to each of the 60 exercises in the library. New optional fields added to the `Exercise` interface in `exercises.ts`.

2. **Exercise detail screen** — New `ExerciseDetailScreen` (stack nav) showing the full visual content per exercise. Tapping any exercise in the library navigates to this screen. Logging from the detail screen reuses the existing `QuickLogModal`.

3. **Library filtering + Dashboard summary** — ExerciseScreen gets a neural-dot body silhouette muscle map selector (front/back, 12–15 tappable muscle regions) alongside the existing category chips for dual filtering. Dashboard gets a weekly movement summary card (total sessions, total active minutes, most-trained muscle group).

No new packages required. No new AsyncStorage keys beyond `@vitalspan_exercise_log` (existing). No changes to Supabase schema — exercise content is static data in `exercises.ts`.

</domain>

<decisions>
## Implementation Decisions

### SVG Illustration Strategy

- **D-01:** Use **neural-dot movement figures** for exercise illustrations — simple stick/silhouette figures rendered in the existing NeuralGrid neural-dot aesthetic with directional arrows indicating movement path. Not traditional fitness-app illustrations, not archetype-shared assets. Builds directly on the `NeuralGrid` visual identity.

- **D-02:** **One unique figure per exercise (60 total).** Each exercise gets its own neural-dot SVG figure. The researcher generates SVG code (not artwork) — this is feasible because SVG is code, not pixel art.

- **D-03:** **Static figures** (no animation). NeuralGrid is already animated in the background — static exercise figures won't compete. Faster to generate and render well at card sizes.

- **D-04:** **Accent color (neural blue-green, `Colors.accent`)** for the neural-dot figure's dots and connecting lines. Rendered on the warm Beige card surface of `ExerciseDetailScreen`. Consistent with the neural aesthetic across LongevityScore and NeuralGrid.

### Exercise Detail Screen

- **D-05:** **New `ExerciseDetailScreen`** added to the stack navigator in `AppNavigator.tsx`. Tapping an exercise in the library (ExerciseScreen) navigates to this screen. Full-screen card — not a modal or inline expand.

- **D-06:** **Layout top-to-bottom on `ExerciseDetailScreen`:**
  1. Neural-dot movement figure (large, top)
  2. Neural-dot muscle map (primary muscles in accent, secondary in muted accent)
  3. Metadata chips (category, equipment)
  4. Form cue (1–2 sentences — distilled from instructions, not the full paragraph)
  5. Longevity sets/reps recommendation (e.g., "3 × 8–12 — emphasize time under tension")
  6. Longevity note (optional one-liner on why this exercise matters for longevity)
  7. "Log this exercise" CTA at bottom

- **D-07:** **"Log this exercise" CTA opens the existing `QuickLogModal`** bottom sheet. No duplication of the log UI — the modal already handles `ExerciseLogEntry` creation and AsyncStorage save.

### Muscle Map

- **D-08:** **Front + back silhouette with toggle button.** Two views (anterior and posterior) with a flip button to switch. Essential for posterior muscles (lats, traps, glutes, hamstrings) not visible on the front view.

- **D-09:** **Neural-dot grid overlaid on body silhouette.** Same dot-grid aesthetic as `NeuralGrid`. Highlighted regions: **primary muscles** in `Colors.accent`; **secondary muscles** in muted accent (e.g., `Colors.accentMuted` or low-opacity accent). Inactive regions in neutral Beige-surface tone. This component is used both on `ExerciseDetailScreen` (read-only highlight) and on `ExerciseScreen` library filter (tappable).

- **D-10:** **Muscle-level regions (~12–15 regions)** mapping to actual `muscleGroup` and `secondaryMuscles` values in `exercises.ts`. Approximate region list: chest, upper back/traps, lats, shoulders (anterior/posterior delts), biceps, triceps, forearms, abs/core, obliques, glutes, quads, hamstrings, calves. Tapping a region filters the exercise library to exercises where that muscle appears in `muscleGroup` OR `secondaryMuscles`.

- **D-11:** **Category chips (existing) + muscle map body selector COEXIST on ExerciseScreen** as dual filtering modes. Existing category chip row remains at the top. The muscle map selector is a separate collapsible panel or a filter icon that reveals the body map below the chips. Filtering by category and by muscle group are independent — the combined result is the intersection.

### Content Authorship — Sets/Reps & Form Cues

- **D-12:** **Researcher agent generates all content** (form cues, sets/reps, longevity notes) for all 60 exercises from published longevity training literature. A **pharmacist review checkpoint** is included in the plan execution — researcher produces the populated data entries, user reviews and approves before they are committed to `exercises.ts`.

- **D-13:** **Peter Attia / Outlive framework** is the reference for longevity-optimized sets/reps. Principles: stability work, Zone 2 cardio targets, compound strength movements for the "Centenarian Decathlon" (functional strength at age 100). Typical prescriptions: compound strength 3–5 × 5–8 reps, hypertrophy/longevity 3 × 8–12, metabolic endurance 2–3 × 15–20, Zone 2 cardio by duration and perceived exertion.

- **D-14:** **New optional fields on `Exercise` interface** in `exercises.ts` (all optional for backward compatibility):
  - `illustrationId: string` — maps to the named SVG component in a new `src/components/exercise-illustrations/` directory
  - `formCue: string` — 1–2 sentence distillation of the most important technique cue
  - `setsReps: string` — longevity-optimized recommendation string (e.g., `"3 × 8–12 reps"`)
  - `longevityNote?: string` — optional one-liner on longevity relevance

### Dashboard Weekly Movement Summary

- **D-15:** Add a weekly movement summary card to `DashboardScreen.tsx` per ROADMAP SC-3: **total sessions this week, total active minutes, most-trained muscle group.** Card derives data from `@vitalspan_exercise_log` entries filtered to the current Mon–Sun week (use existing `getMondayStr()` date utility already in `ExerciseScreen.tsx`). Card placement: below the existing today's exercise card, above the Research CTA.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Exercise Data & Schema
- `src/data/exercises.ts` — `Exercise` interface (current fields: id, name, category, bodyPart, equipment, muscleGroup, secondaryMuscles, target, instructions), `EXERCISES` array (~60 entries), `ExerciseCategory`, `EXERCISE_CATEGORIES`, `CATEGORY_MET`. Phase 12 adds 4 new optional fields to `Exercise`. Read this FIRST before modifying.
- `src/data/exercises.ts` §EXERCISES — All existing entries must retain their current fields. New fields are added alongside existing `muscleGroup` + `secondaryMuscles` (these are the primary data sources for muscle map highlights and filter regions).

### Screen — Exercise
- `src/screens/ExerciseScreen.tsx` — Current exercise library + log UI. Contains: category chip filter, exercise library list, `QuickLogModal` (log bottom sheet), `SwipeableLogRow`, `CATEGORY_EMOJI`, `INTENSITY_COLORS`. The muscle map selector and updated library navigation flow to `ExerciseDetailScreen` connect here.

### Screen — Dashboard
- `src/screens/DashboardScreen.tsx` — Weekly movement summary card goes here. Uses `@vitalspan_exercise_log` AsyncStorage key. The existing `getMondayStr()` date utility is in `ExerciseScreen.tsx` — move to a shared util or copy pattern.

### Navigation
- `src/navigation/AppNavigator.tsx` — Add `ExerciseDetailScreen` to the root stack navigator (same pattern as `ArticlesScreen` was added in Phase 10).

### Visual Components & Theme
- `src/components/NeuralGrid.tsx` — Neural-dot SVG aesthetic reference. The muscle map silhouette and exercise figures follow this dot-grid visual language. Review this component for the SVG dot/line rendering pattern.
- `src/theme/index.ts` — `Colors.accent` (neural blue-green for figures and primary muscle highlights), `Colors.Beige.*` (warm surface for ExerciseDetailScreen), `Colors.accentMuted` or low-opacity accent for secondary muscle highlights, `Spacing.*`, `Radius.*`. All new files must use these tokens exclusively — no hardcoded hex values.

### Prior Context (decisions that apply)
- `.planning/phases/06-warm-ui-overhaul/06-CONTEXT.md` — Beige warm tokens for data/list screens. `ExerciseDetailScreen` is a data screen → warm Beige surface.
- `.planning/phases/10-apple-health-and-articles/10-CONTEXT.md` §D-09 — Stack nav pattern for new screens (ArticlesScreen added to root stack without new tab). Follow same pattern for `ExerciseDetailScreen`.

### Planning
- `.planning/ROADMAP.md` §Phase 12 — Requirements EX-01–EX-06 and success criteria (authoritative scope reference). SC-1 (detail screen), SC-2 (muscle map selector), SC-3 (Dashboard summary).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `QuickLogModal` in `ExerciseScreen.tsx` — existing log bottom sheet with sets/reps/duration/intensity inputs. D-07 specifies this is reused from `ExerciseDetailScreen` via a callback/navigation param. Extract as a separate component or pass via ref/navigation.
- `SwipeableLogRow` (`src/components/SwipeableLogRow.tsx`) — already built for exercise log swipe-to-delete. No changes needed.
- `getMondayStr()` utility function in `ExerciseScreen.tsx` — date math for week boundary. Move or re-export for `DashboardScreen` weekly summary (D-15).
- `INTENSITY_COLORS` in `ExerciseScreen.tsx` — `easy/moderate/hard` → color config. Reuse in detail screen if log CTA shows last-logged intensity.
- `exerciseService.ts` (`src/lib/exerciseService.ts`) — `getExercises()` with Supabase-first + static fallback. `ExerciseDetailScreen` calls this to load the exercise (or receives it as navigation param to avoid re-fetch).

### Established Patterns
- StyleSheet named `s` at bottom of every file; all colors from `Colors.*`; all spacing from `Spacing.*`; no hardcoded hex values.
- AsyncStorage key `@vitalspan_exercise_log` stores `ExerciseLogEntry[]` — existing key, Dashboard summary reads from it.
- Navigation params: stack screens receive typed params via the `RootStackParamList` in `AppNavigator.tsx`.
- `useFocusEffect` pattern for refreshing data on screen focus — used in ExerciseScreen and DashboardScreen; use same pattern in `ExerciseDetailScreen` if stale-data concerns arise.

### Integration Points
- `AppNavigator.tsx` `RootStackParamList` — Add `ExerciseDetail: { exerciseId: string }` param type; add `<Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />`.
- `ExerciseScreen.tsx` — Exercise row `onPress` currently opens `QuickLogModal`. Change to navigate to `ExerciseDetailScreen` with `exerciseId`. The modal is invoked from the detail screen instead.
- `DashboardScreen.tsx` — Load `@vitalspan_exercise_log` entries and filter to current Mon–Sun week. Compute: session count, total active minutes (sum of `durationMin`), most-trained muscle group (tallied from `ExerciseLogEntry.category` or a new `muscleGroup` field on log entries).
- `src/components/exercise-illustrations/` — New directory for the 60 neural-dot SVG exercise figure components. Each is a React component returning an SVG. `illustrationId` in `Exercise` maps to the component name exported from this directory.

</code_context>

<specifics>
## Specific Ideas

- **Neural-dot figure generation:** The researcher generates 60 SVG components as React Native SVG code (using `react-native-svg` which is already in Expo SDK 54 — no new install needed). Each figure is a simple line-art human silhouette made of dots connected by thin strokes, showing the exercise position with a movement arrow. Keep each SVG under ~1KB — simple geometry, not detailed anatomy.
- **Muscle map component design:** A single `MuscleMapView` component accepting props: `primaryMuscles: string[]`, `secondaryMuscles: string[]`, `interactive?: boolean`, `onMusclePress?: (muscle: string) => void`. When `interactive` is true (library filter mode), regions are tappable. When false (detail screen mode), they are read-only highlights.
- **Pharmacist review checkpoint format:** The plan should include a dedicated checkpoint step where the researcher outputs all 60 sets of `(formCue, setsReps, longevityNote)` as a readable summary — not buried in code. The user reviews this list before the data is written to `exercises.ts`. This matches the pharmacist review pattern used for interaction pairs in Phase 11.
- **ExerciseDetailScreen warm Beige surface:** Background `Colors.Beige.bg`, card surfaces `Colors.Beige.card`. Status bar dark (same pattern as Phase 6 warm screens). Neural-dot figure uses `Colors.accent` on this surface for maximum contrast.
- **ROADMAP EX-01–EX-06 mapping note:** The existing requirements (EX-01: sections, EX-02: library, EX-03: intensity, EX-04: swipe-delete) were defined in Phase 7 and are ALREADY COMPLETE. Phase 12 introduces NEW requirements (EX-05, EX-06 likely) for the visual content, muscle map, and summary. The researcher must check what EX-05 and EX-06 are defined as in REQUIREMENTS.md — or treat the ROADMAP Phase 12 success criteria as authoritative if REQUIREMENTS.md hasn't been updated.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 12-Exercise UI Overhaul*
*Context gathered: 2026-06-05*
