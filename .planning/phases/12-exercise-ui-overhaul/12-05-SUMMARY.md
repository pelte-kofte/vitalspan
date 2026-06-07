---
phase: "12"
plan: "05"
subsystem: exercise-navigation-filter
tags: [exercise, navigation, muscle-map, filter, react-navigation, react-native]
dependency_graph:
  requires:
    - 12-02 (MuscleMapView component with muscleMatches + MUSCLE_REGIONS exports)
    - 12-04 (ExerciseDetailScreen created; QuickLogModal extracted to shared component)
  provides:
    - ExerciseDetail route in RootStackParamList (AppNavigator.tsx)
    - Exercise row navigation to ExerciseDetailScreen (ExerciseScreen.tsx)
    - Collapsible muscle map filter panel with AND-intersection category+muscle logic (ExerciseScreen.tsx)
  affects:
    - src/screens/ExerciseDetailScreen.tsx (LocalParamList workaround removed — uses real RootStackParamList type)
tech_stack:
  added: []
  patterns:
    - useNavigation<NativeStackNavigationProp<RootStackParamList>> for typed navigation from tab screen
    - AND-intersection filter: category chip filter + MuscleMapView interactive filter coexist
    - muscleMatches() helper for alias-aware muscle group matching (e.g. "quadriceps" → "quads")
    - Collapsible panel pattern: toggle button with chevron + conditionally rendered View
key_files:
  created: []
  modified:
    - src/navigation/AppNavigator.tsx
    - src/screens/ExerciseScreen.tsx
    - src/screens/ExerciseDetailScreen.tsx
decisions:
  - "ExerciseDetail added to RootStackParamList as { exerciseId: string } — same pattern as Articles route"
  - "presentation: card (not modal) matches Articles screen pattern per 12-CONTEXT D-05"
  - "LocalParamList workaround in ExerciseDetailScreen removed — RootStackParamList now has the real type"
  - "Muscle filter toggle button shows active muscle label when selected; chevron indicates open/close state"
  - "Tapping same muscle again in MuscleMapView clears filter (toggle behavior)"
  - "+ Log button kept in exercise library rows — direct log access without navigating to detail (D-07)"
  - "expandedId state and toggleExpand fully removed — detail screen replaces the expand/collapse UX"
  - "Row arrow changed from ▼/▲ chevron to → to indicate navigation rather than expansion"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-07T20:00:00Z"
  tasks_completed: 1
  files_created: 0
  files_modified: 3
---

# Phase 12 Plan 05: ExerciseDetail Navigation + Muscle Map Filter Summary

**One-liner:** Wired ExerciseDetailScreen into AppNavigator's RootStackParamList and updated ExerciseScreen with tap-to-navigate rows and a collapsible MuscleMapView filter panel with AND-intersection category + muscle filtering.

## What Was Built

### Task 1: AppNavigator wired + ExerciseScreen navigation + muscle map filter panel

**AppNavigator.tsx — three changes:**
1. Added `import ExerciseDetailScreen from '../screens/ExerciseDetailScreen'`
2. Added `ExerciseDetail: { exerciseId: string }` to `RootStackParamList` type
3. Added `<Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ presentation: 'card' }} />` after the Articles screen entry

**ExerciseDetailScreen.tsx — one change:**
- Removed `LocalParamList` type intersection workaround (was needed before this plan added the real route to `RootStackParamList`). Now uses `RouteProp<RootStackParamList, 'ExerciseDetail'>` directly.

**ExerciseScreen.tsx — multiple changes:**
- Added imports: `useNavigation`, `NativeStackNavigationProp`, `MuscleMapView`, `muscleMatches`, `MUSCLE_REGIONS`, `RootStackParamList`
- Added `type Nav = NativeStackNavigationProp<RootStackParamList>`
- Added state: `nav = useNavigation<Nav>()`, `selectedMuscle`, `muscleMapOpen`, `muscleMapView`
- Replaced `filtered` useMemo with AND-intersection logic: category filter first, then muscle filter via `muscleMatches()` on `muscleGroup` and `secondaryMuscles`
- Removed `expandedId` state, `toggleExpand` function, and all `isExpanded`/`expandedContent` rendering
- Added collapsible muscle map filter panel between category chips and main ScrollView:
  - Toggle button showing "Muscle Group Filter" (or active muscle name) with chevron
  - When open: `MuscleMapView` with `interactive=true`, front/back toggle, and `onMusclePress` that toggles `selectedMuscle`
  - "Clear filter: [muscle label]" button shown when a muscle is selected
- Updated exercise row `onPress` from `toggleExpand()` to `nav.navigate('ExerciseDetail', { exerciseId: ex.id })` with haptic feedback
- Row "chevron" changed from ▼/▲ to → (navigation indicator)
- Section label updated to show muscle in count: e.g. "Push · Chest · 5" when both filters active
- Added StyleSheet entries: `muscleFilterToggle`, `muscleFilterToggleTxt`, `muscleFilterChevron`, `muscleFilterPanel`, `clearFilterBtn`, `clearFilterTxt`
- Removed StyleSheet entries: `expandedContent`, `musclesTxt`, `instructionsTxt`

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire ExerciseDetail nav + muscle map filter panel | 50d8d7a | src/navigation/AppNavigator.tsx, src/screens/ExerciseScreen.tsx, src/screens/ExerciseDetailScreen.tsx |

## Verification Results

- `grep -c "ExerciseDetail" src/navigation/AppNavigator.tsx` → 4 (import name, type key, Stack.Screen name attr, component usage) ≥ 3
- `grep -c "ExerciseDetailScreen" src/navigation/AppNavigator.tsx` → 2 (import + component prop) ≥ 2
- `grep -c "ExerciseDetail" src/screens/ExerciseScreen.tsx` → 1 (navigate call)
- `grep -c "MuscleMapView" src/screens/ExerciseScreen.tsx` → 4 (import, interactive usage, 2 prop references)
- `grep -c "muscleMatches" src/screens/ExerciseScreen.tsx` → 3 (import + 2 filter calls)
- `grep -c "selectedMuscle" src/screens/ExerciseScreen.tsx` → 12 (declaration + filter + toggle button label + panel + MuscleMapView prop + clear button)
- `grep -c "muscleMapOpen" src/screens/ExerciseScreen.tsx` → 3 (declaration + toggle panel render + chevron direction)
- `grep -c "expandedId" src/screens/ExerciseScreen.tsx` → 0
- `grep -c "expandedContent" src/screens/ExerciseScreen.tsx` → 0
- Hardcoded hex in ExerciseScreen: 0
- `tsc --noEmit` → PASSED (no errors)
- `src/components/QuickLogModal.tsx` exists (created by Plan 04)

## Deviations from Plan

None — plan executed exactly as written.

The `LocalParamList` workaround removal from `ExerciseDetailScreen.tsx` was explicitly mentioned in the plan as expected cleanup once the real route type was in place.

## Known Stubs

None. All navigation paths use real route params from static `EXERCISES` data. The muscle filter uses the real `muscleMatches()` helper and real `MUSCLE_REGIONS` data. No placeholder text or empty data flows to UI rendering.

## Threat Flags

No new threat surface. `exerciseId` is an internal static string from the `EXERCISES` array — not user-editable, not from an external deep-link. No new network endpoints, auth paths, or file access patterns introduced.

## Self-Check: PASSED

- FOUND commit 50d8d7a (Task 1)
- FOUND: src/navigation/AppNavigator.tsx (modified)
- FOUND: src/screens/ExerciseScreen.tsx (modified)
- FOUND: src/screens/ExerciseDetailScreen.tsx (modified)
- FOUND: src/components/QuickLogModal.tsx (dependency from Plan 04)
- TSC: clean (0 errors)
- expandedId: 0 occurrences in ExerciseScreen (fully removed)
- expandedContent: 0 occurrences in ExerciseScreen (fully removed)
- ExerciseDetail in RootStackParamList: confirmed
- No hardcoded hex values in modified files
