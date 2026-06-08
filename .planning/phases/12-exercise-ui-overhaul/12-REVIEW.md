---
phase: 12-exercise-ui-overhaul
reviewed: 2026-06-08T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/components/MuscleMapView.tsx
  - src/components/QuickLogModal.tsx
  - src/components/exercise-illustrations/index.ts
  - src/data/exercises.ts
  - src/navigation/AppNavigator.tsx
  - src/screens/DashboardScreen.tsx
  - src/screens/ExerciseDetailScreen.tsx
  - src/screens/ExerciseScreen.tsx
  - src/theme/index.ts
findings:
  critical: 3
  warning: 6
  info: 4
  total: 13
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-06-08
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Phase 12 introduces an exercise library with a muscle-map filter, per-exercise detail screen, quick-log modal, and exercise history integrated into the Dashboard. The implementation is largely functional, but three blockers were found: an illustration ID typo that silently breaks one exercise's illustration on both the static data path and Supabase path, a Supabase service that strips all display-critical optional fields (formCue, setsReps, longevityNote, illustrationId) when the remote table is active, and a silent data-loss path in QuickLogModal where a failed AsyncStorage write closes the modal as if it succeeded. Six warnings cover logic edge cases (Monday "This Week" empty, stale date variables, duplicate utility functions, unused state) and one deprecated API call on RN 0.81.

---

## Critical Issues

### CR-01: Illustration ID typo — Curtsey Squat always shows "No illustration"

**File:** `src/data/exercises.ts:312` / `src/components/exercise-illustrations/index.ts:17`

**Issue:** The exercise entry uses `illustrationId: 'curtseySquat'` (capital "S"), but the illustration barrel exports the key `curtseySqat` (missing the "u"). Because `ExerciseIllustrations['curtseySquat']` is `undefined`, `IllustrationComponent` is always `null` for this exercise and the placeholder renders instead. TypeScript misses this because the illustration map is cast to `Record<string, React.ComponentType>` at the call site.

**Fix:**
```typescript
// src/data/exercises.ts, line 312 — change:
illustrationId: 'curtseySquat',
// to:
illustrationId: 'curtseySqat',
```
(The barrel file filename and export are both `curtseySqat`, so the data file must match.)

---

### CR-02: `exerciseService.mapRowToExercise` silently drops all display-critical fields when Supabase path is active

**File:** `src/lib/exerciseService.ts:16-28`

**Issue:** `mapRowToExercise` maps only the eight columns present in `ExerciseRow`. The fields `illustrationId`, `formCue`, `setsReps`, and `longevityNote` are not declared in `ExerciseRow` and are not mapped, so when Supabase returns a non-empty table, every exercise rendered through `ExerciseDetailScreen` shows:
- "No illustration" placeholder (illustrationId is undefined)
- no Form Cue section
- no Longevity Prescription section
- no longevity note

The static fallback (`EXERCISES`) is only used when Supabase errors or returns zero rows — once the table is populated this silently degrades the entire detail screen. The fallback behaviour masks the regression in development.

**Fix:**
```typescript
// Add to ExerciseRow interface:
interface ExerciseRow {
  // ... existing fields ...
  illustration_id: string | null;
  form_cue: string | null;
  sets_reps: string | null;
  longevity_note: string | null;
}

// Add to mapRowToExercise:
function mapRowToExercise(row: ExerciseRow): Exercise {
  return {
    // ... existing fields ...
    illustrationId: row.illustration_id ?? undefined,
    formCue: row.form_cue ?? undefined,
    setsReps: row.sets_reps ?? undefined,
    longevityNote: row.longevity_note ?? undefined,
  };
}
```
The Supabase `exercises` table schema must also include these columns or the fallback strategy is the only safe path until they are added.

---

### CR-03: Silent data-loss in `QuickLogModal.handleSave` — failed write closes modal as success

**File:** `src/components/QuickLogModal.tsx:81-85`

**Issue:** Both the read and write to `@vitalspan_exercise_log` swallow errors silently via `.catch(() => null)`. If `AsyncStorage.setItem` fails (disk full, storage quota exceeded, serialisation error), `onClose()` is still called, the haptic success feedback fires, and the user believes the log was saved. The entry is permanently lost with no user notification.

**Fix:**
```typescript
async function handleSave() {
  if (!exercise) return;
  const entry: ExerciseLogEntry = { /* ... */ };
  try {
    const raw = await AsyncStorage.getItem('@vitalspan_exercise_log');
    const existing: ExerciseLogEntry[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(
      '@vitalspan_exercise_log',
      JSON.stringify([entry, ...existing])
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    onClose();
  } catch (err) {
    console.error('[QuickLogModal] save failed', err);
    Alert.alert('Save failed', 'Could not save your workout. Please try again.');
  }
}
```

---

## Warnings

### WR-01: "This Week" section is always empty when today is Monday

**File:** `src/screens/ExerciseScreen.tsx:115`

**Issue:** `thisWeekLogs` is filtered as `date >= mondayStr && date <= yesterdayStr`. On Mondays, `mondayStr` equals `todayStr` and `yesterdayStr` is the previous Sunday, which is before the current Monday. The range is inverted (`mondayStr > yesterdayStr`), so no logs ever match and the "This Week" section is invisible every Monday, even if the user trained every day of the current week before today.

**Fix:**
```typescript
// Use todayStr as the upper bound exclusive, not yesterdayStr:
const thisWeekLogs = useMemo(
  () => logs.filter(l => l.date >= mondayStr && l.date < todayStr),
  [logs, mondayStr, todayStr]
);
```

---

### WR-02: Date-boundary variables computed in render body, not memoised

**File:** `src/screens/ExerciseScreen.tsx:108-116`

**Issue:** `now`, `todayStr`, `mondayStr`, `yesterdayStr`, and `historyStartStr` are computed unconditionally in the render function body, then used as `useMemo` dependencies. They are recreated on every render, which means the memo comparisons always see new primitive values that happen to be equal — but this works purely by accident of string equality. More critically, if any parent re-renders at 23:59 and the component re-renders at 00:00 during the same React batch, the date values used by the memos diverge mid-render. The correct pattern is to produce stable date strings via their own `useMemo` or derive them inside the `useMemo` that needs them.

**Fix:**
```typescript
const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
const mondayStr = useMemo(() => getMondayStr(new Date()), []);
// etc.
```

---

### WR-03: `QuickLogModal` does not reset form state between exercises

**File:** `src/components/QuickLogModal.tsx:41-45`

**Issue:** `sets`, `reps`, `duration`, `intensity`, and `notes` are initialised once and never reset. If the user logs Exercise A (sets=5, reps=3), dismisses the modal, then opens it for Exercise B, all fields retain Exercise A's values. There is no `useEffect` to reset when `exercise` changes.

**Fix:**
```typescript
useEffect(() => {
  if (exercise) {
    setSets('3');
    setReps('12');
    setDuration('30');
    setIntensity('moderate');
    setNotes('');
  }
}, [exercise?.id]);
```

---

### WR-04: Deprecated `pointerEvents` prop on `View` — generates warnings on RN 0.81

**File:** `src/components/MuscleMapView.tsx:102`

**Issue:** `<View style={StyleSheet.absoluteFill} pointerEvents="box-none">` uses the prop-form of `pointerEvents`, which was deprecated in React Native 0.71 and removed as a prop in later versions. The project runs RN 0.81.5. This produces a yellow-box warning in development and may behave incorrectly on newer Hermes versions.

**Fix:**
```tsx
// Move pointerEvents into the style object:
<View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
```

---

### WR-05: `firstRunComplete` state loaded but never read

**File:** `src/screens/DashboardScreen.tsx:48, 94`

**Issue:** `firstRunComplete` is declared, loaded from AsyncStorage, and set in state, but it is never referenced anywhere in the component's JSX or logic. This is dead state that wastes a re-render cycle on mount and creates confusion about whether some conditional rendering was accidentally omitted.

**Fix:** Remove the state variable and the corresponding `AsyncStorage.getItem('@vitalspan_first_run_complete')` call from `loadData`, or wire it to the intended guard (e.g., conditionally showing the `GuidedFirstRun` CTA).

---

### WR-06: `nav.navigate('Main')` from within a `Main` tab is a no-op navigation call

**File:** `src/screens/DashboardScreen.tsx:422, 499`

**Issue:** Both the "Movement today" card tap and the "Go to Protocol →" empty-state button call `nav.navigate('Main')`. `DashboardScreen` is already rendered inside the `Main` tab navigator, so navigating to `Main` re-mounts the stack's `Main` screen but does not switch to the Exercise or Protocol tab. Users tapping these affordances expect to be taken to a specific tab; instead the navigation is a functional no-op (or briefly re-renders the same screen).

**Fix:** Use the typed tab navigator to switch to the correct tab:
```typescript
// For the exercise card:
nav.navigate('Main'); // replace with a typed tab navigation reset or pass tab name
// Preferred pattern using a shared navigation ref or passing nav prop down:
// nav.getParent()?.navigate('Exercise');
```
This requires a cast or a shared navigation reference since `DashboardScreen` uses the root stack navigator type. At minimum, document that these taps are intentionally inert or implement proper tab switching.

---

## Info

### IN-01: `getMondayStr` and `equipShort` duplicated across screen files

**File:** `src/screens/DashboardScreen.tsx:25-30` / `src/screens/ExerciseScreen.tsx:47-53, 43-45` / `src/screens/ExerciseDetailScreen.tsx:23-25`

**Issue:** `getMondayStr` is defined identically in both `DashboardScreen.tsx` and `ExerciseScreen.tsx`. `equipShort` (with identical logic and the same `EQUIPMENT_SHORT` lookup table) is defined in both `ExerciseScreen.tsx` and `ExerciseDetailScreen.tsx`. This violates DRY and means future changes must be applied in multiple places.

**Fix:** Extract to `src/lib/dateUtils.ts` and `src/lib/exerciseUtils.ts` (or add to an existing utils file) and import from both screens.

---

### IN-02: `exerciseService` `console.warn` calls will appear in production builds

**File:** `src/lib/exerciseService.ts:43, 48, 54`

**Issue:** Three `console.warn` calls log Supabase fallback reasons. While not a security issue, these produce console output in production (Expo does not strip `console` calls by default in bare/managed workflow builds). They would be appropriate as debug-only logs.

**Fix:** Guard with `__DEV__`:
```typescript
if (__DEV__) console.warn('[exerciseService] Supabase fetch failed, using static fallback:', error.message);
```

---

### IN-03: `ExerciseDetailScreen` imports `setStatusBarStyle` but applies it unconditionally on every focus

**File:** `src/screens/ExerciseDetailScreen.tsx:7, 37`

**Issue:** `setStatusBarStyle('dark')` is called inside `useFocusEffect` without a cleanup to restore the prior style when the screen blurs. If another screen in the stack uses a light status bar, navigating back from `ExerciseDetail` would leave the status bar in `'dark'` mode incorrectly. `ExerciseScreen` has the same pattern but at least returns `() => {}`. Neither restores state.

**Fix:** Return a cleanup function that restores the prior style:
```typescript
useFocusEffect(useCallback(() => {
  setStatusBarStyle('dark');
  return () => setStatusBarStyle('light'); // or whatever the parent screen uses
}, []));
```

---

### IN-04: Magic number `paddingBottom: 36` in `QuickLogModal` sheet style

**File:** `src/components/QuickLogModal.tsx:176`

**Issue:** `paddingBottom: 36` is a hardcoded number in the `sheet` style, violating the project's rule that all spacing must come from `Spacing.*`. The intent is likely to clear the home indicator on notched devices, but this is not safe-area aware.

**Fix:** Use `useSafeAreaInsets` to derive the actual bottom inset and add it to a `Spacing.*` value:
```typescript
// At top of component:
const insets = useSafeAreaInsets();
// In sheet style (must be inline since it's dynamic):
paddingBottom: Math.max(insets.bottom, Spacing.base),
```

---

_Reviewed: 2026-06-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
