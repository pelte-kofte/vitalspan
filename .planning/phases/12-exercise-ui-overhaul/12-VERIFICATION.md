---
phase: 12-exercise-ui-overhaul
verified: 2026-06-08T00:00:00Z
status: human_needed
score: 5/6 must-haves verified
overrides_applied: 0
gaps:
  - truth: "CR-02: exerciseService.mapRowToExercise omits illustrationId, formCue, setsReps, longevityNote — all four display-critical fields are silently dropped when Supabase exercises table is non-empty"
    status: failed
    reason: "ExerciseRow interface and mapRowToExercise in src/lib/exerciseService.ts only map the original 8 columns. The four new optional Exercise fields (illustrationId, formCue, setsReps, longevityNote) are never read from the Supabase response. The static EXERCISES fallback is only used when Supabase errors or returns zero rows. Once the exercises table is populated in production, every ExerciseDetailScreen visit will show 'No illustration', no Form Cue section, and no Longevity Prescription. The static-data path works in development, masking the regression."
    artifacts:
      - path: "src/lib/exerciseService.ts"
        issue: "ExerciseRow interface missing illustration_id, form_cue, sets_reps, longevity_note columns; mapRowToExercise does not map them"
    missing:
      - "Add illustration_id, form_cue, sets_reps, longevity_note to ExerciseRow interface"
      - "Map these four columns in mapRowToExercise with null-to-undefined coercion"
      - "Corresponding columns must exist in the Supabase exercises table or the static fallback remains the only safe path"
human_verification:
  - test: "Open any exercise in ExerciseScreen; tap the exercise row to navigate to ExerciseDetailScreen"
    expected: "SVG neural-dot illustration renders (not 'No illustration' placeholder); muscle map shows front body silhouette with a highlighted region; form cue text appears; 'LONGEVITY PRESCRIPTION' section shows sets/reps in accent color; warm Beige background; Log CTA at bottom"
    why_human: "Dynamic SVG lookup (IllustrationComponent = ExerciseIllustrations[exercise.illustrationId]) and MuscleMapView SVG rendering cannot be verified by grep; must be visually confirmed on device"
  - test: "On ExerciseDetailScreen, tap the 'Front / Back' toggle on the muscle map"
    expected: "Map switches from front silhouette to back silhouette; posterior muscles (lats, glutes, hamstrings) are now visible; primary muscles highlighted in accent color on the correct view"
    why_human: "View toggle state and SVG region visibility require interactive runtime verification"
  - test: "On ExerciseScreen, tap 'Muscle Group Filter'; tap a muscle region (e.g. chest); observe the exercise list; tap 'Clear filter'"
    expected: "Filter panel expands; list updates to show only exercises where muscleGroup or secondaryMuscles includes the tapped region; count label updates; 'Clear filter: Chest' button appears; tapping Clear restores full list"
    why_human: "Filter interaction and muscleMatches alias resolution must be verified live; grep cannot confirm end-to-end UX flow"
  - test: "Log one or more exercise sessions this week via 'Log this exercise' CTA on ExerciseDetailScreen; navigate to Dashboard"
    expected: "'THIS WEEK'S MOVEMENT' card appears below the 'Movement today' card; shows correct session count, total minutes, and top category; card is absent before any logs exist this week"
    why_human: "Requires saving real data to AsyncStorage and observing conditional card render; also validates CR-03 (silent save failure) fix status"
  - test: "Navigate to ExerciseDetailScreen for 'Curtsey Squat' (Legs category)"
    expected: "SVG illustration renders — not the 'No illustration' placeholder. (CR-01: data layer has illustrationId: 'curtseySquat' but barrel export is curtseySqat — will show placeholder until the typo is fixed)"
    why_human: "Confirms whether CR-01 has been fixed or is still a visible regression"
---

# Phase 12: Exercise UI Overhaul — Verification Report

**Phase Goal:** Every exercise in the 60-exercise library displays an SVG illustration, a neural-dot muscle map with primary/secondary groups highlighted, a form cue, and longevity-optimized sets/reps; the library is filterable by muscle group; Dashboard shows a weekly movement summary
**Verified:** 2026-06-08T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | Opening any exercise detail shows SVG illustration, neural-dot muscle map with primary/secondary highlights, form cue, and longevity-optimized sets/reps | ? UNCERTAIN | All code paths exist and wire correctly; SVG dynamic lookup via `exercise.illustrationId` key into barrel; MuscleMapView imported and used with correct props; formCue/setsReps conditionally rendered. Cannot visually confirm render without device. CR-01 typo means Curtsey Squat always shows placeholder. CR-02 means Supabase path silently drops all four display fields. |
| SC-2 | User can tap a muscle region on the library's visual muscle map selector and see the list filtered; clearing restores full list | ✓ VERIFIED | `muscleMapOpen` state controls collapsible panel; `MuscleMapView interactive=true` with `onMusclePress` sets `selectedMuscle`; `filtered` useMemo uses `muscleMatches()` on both `muscleGroup` and `secondaryMuscles`; "Clear filter" button calls `setSelectedMuscle(null)`; tapping same region again clears. All wiring confirmed by grep. |
| SC-3 | Dashboard displays weekly movement summary card showing total sessions, total active minutes, most-trained muscle group | ✓ VERIFIED | `weeklyMovement` useMemo in DashboardScreen filters `exerciseLogs` to Mon–Sun window; card conditionally renders when non-null; shows `sessions`, `totalMin`, `topCat`; reads from `@vitalspan_exercise_log` which is already loaded in `loadData`. Confirmed by source inspection. |

**Score:** 2 of 3 roadmap success criteria fully verified; SC-1 is uncertain pending visual check and two confirmed bugs.

---

### Requirement Coverage (EX-01 through EX-06)

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| EX-01 | Each of the 60 exercises displays an SVG illustration | ✓ VERIFIED (code) / CR-01 gap | 60 `.tsx` illustration components exist; `index.ts` has 60 barrel exports; `ExerciseDetailScreen` does dynamic lookup via `exercise.illustrationId`. One exercise (Curtsey Squat) will always show placeholder due to `illustrationId: 'curtseySquat'` not matching barrel key `curtseySqat`. |
| EX-02 | Each exercise displays a muscle map highlighting primary/secondary groups using neural-dot language | ✓ VERIFIED | `MuscleMapView` imported and rendered in `ExerciseDetailScreen` with `primaryMuscles=[exercise.muscleGroup]` and `secondaryMuscles=exercise.secondaryMuscles`. 13 regions, neural-dot grid, front/back toggle all present. |
| EX-03 | Each exercise displays a verbal form cue (1–2 sentences) | ✓ VERIFIED | `grep -c "formCue:" src/data/exercises.ts` = 60. Conditional section "FORM CUE" renders `exercise.formCue` in `ExerciseDetailScreen`. |
| EX-04 | Each exercise displays a longevity-optimized sets/reps recommendation | ✓ VERIFIED | `grep -c "setsReps:" src/data/exercises.ts` = 60. Conditional section "LONGEVITY PRESCRIPTION" renders in `Colors.accent` bold. |
| EX-05 | Exercise library supports filtering by muscle group via visual map selector | ✓ VERIFIED | Collapsible MuscleMapView filter panel in ExerciseScreen; `muscleMatches()` with ALIASES applied in `filtered` useMemo; AND-intersection with category chip filter; clear button functional. |
| EX-06 | Dashboard shows weekly movement summary (sessions, active minutes, most-trained group) | ✓ VERIFIED | `weeklyMovement` useMemo and `weeklyCard` JSX confirmed in DashboardScreen. Colors.dark.cardBg/cardBorder tokens added to theme. Card absent when no logs. |

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/exercises.ts` | Extended Exercise interface + 60 entries with 4 fields | ✓ VERIFIED | Interface has `illustrationId?`, `formCue?`, `setsReps?`, `longevityNote?`. All 60 entries have `illustrationId`, `formCue`, `setsReps`. 56/60 have `longevityNote` (4 mobility stretches intentionally omit it). |
| `src/components/MuscleMapView.tsx` | Front/back neural-dot muscle map; 13 regions; muscleMatches; interactive mode | ✓ VERIFIED | 137 lines (under 200 limit). 13 MUSCLE_REGIONS. `muscleMatches()` exported with ALIASES for 5 normalization cases. Interactive tap overlays. Front/back toggle. No hardcoded hex. |
| `src/components/exercise-illustrations/index.ts` | Barrel export of 60 SVG components | ✓ VERIFIED | `grep -c "export { default as" index.ts` = 60. All 60 `.tsx` files exist. No hardcoded hex in any illustration file. |
| `src/components/QuickLogModal.tsx` | Shared modal; self-contained AsyncStorage write | ✓ VERIFIED (with CR-03 caveat) | Exists. Exports `default QuickLogModal`, `QuickLogModalProps`, `INTENSITY_OPTIONS`, `INTENSITY_COLORS`, `estimateCalories`. Loads `userWeightKg` from `@vitalspan_user_profile` on mount. **CR-03**: `AsyncStorage.setItem` error swallowed via `.catch(() => null)` — failed save silently closes modal as success with haptic feedback. |
| `src/screens/ExerciseDetailScreen.tsx` | Full detail view; 6 sections; warm Beige surface; under 200 lines | ✓ VERIFIED | 173 lines. `Colors.Beige.bg` root background. All 6 sections present: illustration, muscle map, metadata chips, form cue, sets/reps, log CTA. QuickLogModal imported from shared component. No hardcoded hex. |
| `src/screens/ExerciseScreen.tsx` | Muscle map filter panel; navigation to detail; expandedId removed | ✓ VERIFIED | `expandedId` and `toggleExpand` confirmed absent (count = 0). `nav.navigate('ExerciseDetail', { exerciseId: ex.id })` on row press. Muscle map filter panel with collapsible toggle. QuickLogModal imported from shared component. |
| `src/navigation/AppNavigator.tsx` | ExerciseDetail in RootStackParamList + Stack.Screen | ✓ VERIFIED | `ExerciseDetail: { exerciseId: string }` in type; `import ExerciseDetailScreen`; `<Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ presentation: 'card' }} />`. 4 references confirmed. |
| `src/screens/DashboardScreen.tsx` | Weekly movement summary card | ✓ VERIFIED | `weeklyMovement` useMemo present. Card renders `{weeklyMovement && ...}`. Uses `Colors.dark.cardBg` and `Colors.dark.cardBorder`. `exerciseLogs` loaded from `@vitalspan_exercise_log`. |
| `src/theme/index.ts` | `Colors.dark.cardBg` and `Colors.dark.cardBorder` added | ✓ VERIFIED | Both tokens present at lines 81–82. |
| `src/lib/exerciseService.ts` | Maps all 4 new Exercise fields from Supabase | ✗ FAILED | `ExerciseRow` interface has only the original 8 columns; `mapRowToExercise` does not map `illustration_id`, `form_cue`, `sets_reps`, `longevity_note`. Static fallback masks the gap in development. **CR-02 — BLOCKER** |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `ExerciseDetailScreen.tsx` | `exercise-illustrations/index.ts` | `exercise.illustrationId` dynamic key lookup | ✓ WIRED | `ExerciseIllustrations[exercise.illustrationId]` cast to `Record<string, ComponentType>`. Note: CR-01 means `curtseySquat` key resolves to `undefined`. |
| `ExerciseDetailScreen.tsx` | `MuscleMapView.tsx` | `primaryMuscles`/`secondaryMuscles` props | ✓ WIRED | Props pass `[exercise.muscleGroup]` and `exercise.secondaryMuscles` directly. |
| `ExerciseDetailScreen.tsx` | `exerciseService.ts` | `getExercises()` filtered by `exerciseId` | ✓ WIRED | `useFocusEffect` calls `getExercises()` then finds exercise by id. |
| `ExerciseDetailScreen.tsx` | `QuickLogModal.tsx` | Import + `<QuickLogModal exercise={exercise} ...>` | ✓ WIRED | Imported from `../components/QuickLogModal`; rendered in JSX. |
| `ExerciseScreen.tsx` | `AppNavigator.tsx` | `nav.navigate('ExerciseDetail', { exerciseId: ex.id })` | ✓ WIRED | Confirmed at line 329 of ExerciseScreen.tsx. |
| `ExerciseScreen.tsx` | `MuscleMapView.tsx` | `MuscleMapView interactive=true` in filter panel | ✓ WIRED | Imported with `muscleMatches` and `MUSCLE_REGIONS`; rendered in filter panel with `onMusclePress`. |
| `DashboardScreen.tsx` | `@vitalspan_exercise_log` | `exerciseLogs` state loaded via `AsyncStorage.getItem` | ✓ WIRED | `loadData` fetches `@vitalspan_exercise_log`; `weeklyMovement` memo consumes `exerciseLogs`. |
| `exerciseService.ts` | `EXERCISES` (static fallback) | `mapRowToExercise` → `EXERCISES` fallback on error/empty | PARTIAL | Static fallback works. Supabase path drops 4 fields. **CR-02** |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ExerciseDetailScreen.tsx` | `exercise` | `getExercises()` → `EXERCISES` static array (or Supabase path) | Yes (static path) / No for 4 display fields (Supabase path) | PARTIAL — static fallback flows correctly; Supabase path silently omits display fields (CR-02) |
| `DashboardScreen.tsx` | `weeklyMovement` | `exerciseLogs` loaded from `@vitalspan_exercise_log` → `useMemo` filter | Yes | ✓ FLOWING |
| `ExerciseScreen.tsx` | `filtered` | `exercises` from `getExercises()` + `selectedMuscle` + `selectedCat` | Yes | ✓ FLOWING |

---

### Behavioral Spot-Checks

Step 7b: Not run — no runnable entry points without starting the Expo dev server. Visual behavior deferred to human verification.

---

### Probe Execution

Step 7c: No probe scripts found in `scripts/*/tests/probe-*.sh`. No probes declared in any PLAN file for Phase 12.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/data/exercises.ts` | ~312 | `illustrationId: 'curtseySquat'` — key mismatch with barrel export `curtseySqat` | BLOCKER (CR-01) | Curtsey Squat always shows "No illustration" placeholder; TypeScript does not catch this because the lookup is via `Record<string, ComponentType>` cast |
| `src/lib/exerciseService.ts` | 4–27 | `ExerciseRow` and `mapRowToExercise` omit 4 required display fields | BLOCKER (CR-02) | When Supabase exercises table is non-empty, every ExerciseDetailScreen call returns exercises with `illustrationId`, `formCue`, `setsReps`, `longevityNote` all `undefined`; entire Phase 12 visual content silently disappears on production Supabase path |
| `src/components/QuickLogModal.tsx` | 81–85 | `AsyncStorage.setItem(...).catch(() => null)` swallows write errors | BLOCKER (CR-03) | Failed exercise log writes are silent; user receives success haptic and modal closes; log entry is permanently lost with no error notification |
| `src/components/MuscleMapView.tsx` | 102 | `<View ... pointerEvents="box-none">` — deprecated prop form on RN 0.81 | WARNING (WR-04) | Yellow-box warning in development; potential behavioral regression in future RN versions |
| `src/screens/ExerciseScreen.tsx` | 115 | `thisWeekLogs` uses `l.date <= yesterdayStr` — inverted range on Mondays | WARNING (WR-01) | "This Week" exercise history section shows empty every Monday even when user exercised earlier in the week |
| `src/components/QuickLogModal.tsx` | 41–45 | Form fields (`sets`, `reps`, `duration`, `intensity`, `notes`) never reset between exercises | WARNING (WR-03) | When logging Exercise B after Exercise A, all fields retain Exercise A's values |

---

### Bugs from Code Review — Blocker Assessment

**CR-01: `illustrationId: 'curtseySquat'` in exercises.ts vs `curtseySqat` in barrel index**
- Impact: One exercise (Curtsey Squat) always renders "No illustration" placeholder.
- Blocker status: BLOCKER for EX-01 completeness. 59/60 exercises work; 1 is broken.
- Fix complexity: One-line change in `src/data/exercises.ts` line ~312: `'curtseySquat'` → `'curtseySqat'`.

**CR-02: `exerciseService.mapRowToExercise` drops `illustrationId`, `formCue`, `setsReps`, `longevityNote`**
- Impact: When Supabase `exercises` table is non-empty, 100% of exercises rendered via the Supabase path lose all Phase 12 visual content. The static fallback masks this in development.
- Blocker status: BLOCKER. This is a latent production regression — the static path is the only safe path until fixed. The entire Phase 12 goal is defeated on the Supabase path.
- Fix: Add 4 columns to `ExerciseRow`; map them in `mapRowToExercise`. Also requires the Supabase table to have these columns (or the static fallback is the intentional sole path, which should be documented).

**CR-03: Silent save failure in `QuickLogModal.handleSave`**
- Impact: AsyncStorage write errors are swallowed; user believes log was saved when it was not; data is permanently lost.
- Blocker status: BLOCKER for data integrity. The save path (lines 81–85) must surface errors.
- Fix: Replace `.catch(() => null)` on `setItem` with a `try/catch` that calls `Alert.alert('Save failed', ...)`.

**Classification for gap-closure decision:**
- CR-01 and CR-03 are single-file targeted fixes that can be resolved in one plan.
- CR-02 requires coordinated changes to `exerciseService.ts` (and optionally the Supabase schema). It is the most significant blocker because it silently degrades the entire Phase 12 feature set in production.

---

### Human Verification Required

#### 1. ExerciseDetailScreen visual render

**Test:** Navigate to Exercise tab, tap any exercise row (not Curtsey Squat)
**Expected:** SVG neural-dot illustration appears at top; muscle map shows body silhouette with highlighted regions; form cue text present; "LONGEVITY PRESCRIPTION" in accent bold; warm cream background; "Log this exercise" CTA at bottom
**Why human:** Dynamic SVG component lookup and react-native-svg rendering cannot be verified by static analysis

#### 2. Front/Back muscle map toggle

**Test:** On ExerciseDetailScreen, tap "Front / Back" toggle on the muscle map
**Expected:** Silhouette switches views; back-only muscles (lats, glutes, hamstrings) appear on back view; primary muscles remain highlighted on correct view
**Why human:** Requires runtime state change and SVG re-render verification

#### 3. Muscle group filter end-to-end

**Test:** Open ExerciseScreen; tap "Muscle Group Filter"; tap a muscle region; verify list updates; tap "Clear filter"
**Expected:** Panel expands; list narrows to exercises targeting that muscle; label shows active muscle; clear restores full list; category chips still work independently
**Why human:** Interactive filter chain with muscleMatches alias resolution needs live verification

#### 4. Dashboard weekly card conditional render

**Test:** Log an exercise this week via "Log this exercise" CTA; navigate to Dashboard
**Expected:** "THIS WEEK'S MOVEMENT" card appears below "Movement today" card; shows correct session count, minutes, and top category; absent before any weekly logs
**Why human:** Requires AsyncStorage write and conditional render verification; also validates CR-03 fix status

#### 5. CR-01 Curtsey Squat illustration (regression check)

**Test:** Find "Curtsey Squat" in Legs category; tap to open detail screen
**Expected:** If CR-01 has been fixed, SVG illustration renders. If not yet fixed, "No illustration" placeholder will appear.
**Why human:** Confirms whether the one-character illustrationId typo has been corrected

---

### Gaps Summary

Three code bugs from the code review (12-REVIEW.md) map directly to phase goal integrity:

**CR-02** is the most critical gap. `exerciseService.ts` was not updated to map the four new Exercise display fields (`illustrationId`, `formCue`, `setsReps`, `longevityNote`) from Supabase rows. This means the entire Phase 12 visual content layer is invisible when Supabase's `exercises` table has data. The static fallback in development makes this regression invisible until production. This must be resolved before Phase 12 can be marked complete.

**CR-01** breaks EX-01 for one exercise (Curtsey Squat) due to a one-character mismatch between the `illustrationId` value in `exercises.ts` (`curtseySquat`) and the barrel export key (`curtseySqat`). TypeScript cannot catch this because the lookup is cast to a generic record. Fix is a one-line change.

**CR-03** is a data integrity issue: failed AsyncStorage writes in `QuickLogModal.handleSave` are silently swallowed, causing permanent data loss with a false success signal (haptic + modal close). This affects both ExerciseDetailScreen and ExerciseScreen log flows.

All three bugs were identified in the code review (12-REVIEW.md). They do not require new architecture — each is a targeted fix. Recommending a single gap-closure plan to address all three before Phase 12 is marked complete.

The remaining five requirements (EX-02 through EX-06) are fully implemented and wired correctly in the static data path. Human visual verification is needed to confirm render quality on device.

---

_Verified: 2026-06-08T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
