---
phase: 01-first-run-and-empty-states
reviewed: 2026-05-25T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/components/ExplanationCard.tsx
  - src/data/biomarkers.ts
  - src/data/firstRunContent.ts
  - src/navigation/AppNavigator.tsx
  - src/screens/BiomarkerDetailScreen.tsx
  - src/screens/BiomarkerEntryScreen.tsx
  - src/screens/DashboardScreen.tsx
  - src/screens/GuidedFirstRunScreen.tsx
  - src/screens/OnboardingScreen.tsx
  - src/screens/SettingsScreen.tsx
findings:
  critical: 4
  warning: 7
  info: 4
  total: 15
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-25
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Ten source files were reviewed spanning the guided first-run flow, biomarker entry and detail screens, dashboard, onboarding, settings, navigation, and supporting data/component files. The implementation is generally well-structured with consistent theme usage and good AsyncStorage key discipline.

Four blockers were found: one is a math inversion bug that will silently store wildly wrong HbA1c values whenever a user enters the mmol/mol unit; another is that "Clear all data" permanently misses the exercise log key, leaving stale data after a reset; a third is a hardcoded `const __DEV__ = true` that exposes developer tooling in production builds; and a fourth is that `BiomarkerDetailScreen` is registered as both a bottom-tab component and a named stack route, meaning the tab instance receives no `biomarkerId` parameter and always renders the list view — this makes `BiomarkerDetail` stack navigation dead on arrival.

Seven warnings cover a zero-value validation inconsistency, unsuppressed debug `console.log` in production, unguarded `JSON.parse` calls, a stale-closure risk in `handleStepAdvance`, empty-state rendering gap in the dashboard, type-unsafe `as never` navigation casts, and missing `@vitalspan_exercise_log` in the export payload.

---

## Critical Issues

### CR-01: HbA1c mmol/mol conversion factor inverted — stores garbage values

**File:** `src/screens/BiomarkerEntryScreen.tsx:26,33`

**Issue:** The `convertToNative` function multiplies the user's mmol/mol input by `10.929` to convert to `%`. The correct direction is division: `% = mmol/mol ÷ 10.929`. Multiplying produces a physically impossible result — e.g., an input of 42 mmol/mol (≈ 6%) is stored as 459 %, which is then silently persisted to AsyncStorage and used in downstream PhenoAge computation. The glucose conversion on line 25 is correct (multiply by 18.018), making this an easy mistake to miss visually.

```
Proof:
  42 mmol/mol (normal HbA1c) * 10.929 = 459  ← what code does (WRONG)
  42 mmol/mol / 10.929 = 3.84 %               ← correct NGSP value
```

**Fix:**
```typescript
// BiomarkerEntryScreen.tsx line 33 — divide, not multiply
return Math.round((val / conv.factor) * 100) / 100;
```
Also update the comment on line 26 to read `mmol/mol = % × 10.929` (i.e., the stored constant is the forward factor, and the conversion divides by it) to prevent future confusion.

---

### CR-02: `BiomarkerDetailScreen` registered as both a tab component and a named stack route — stack route is unreachable / wrong component

**File:** `src/navigation/AppNavigator.tsx:82,144`

**Issue:** `BiomarkerDetailScreen` is used as the component for the `Biomarkers` bottom tab (line 82) **and** as the component for the `BiomarkerDetail` stack screen (line 144). The tab instance is a standalone list/detail component that manages its own `selectedId` state; it never receives `route.params.biomarkerId`. The `BiomarkerDetail` stack screen on line 144 is meant to be navigated to with `{ biomarkerId: string }` from outside the tab (e.g., from the Dashboard `BiomarkerEntry` flow), but it renders the same `BiomarkerDetailScreen` component which does not read params — so the deep-link into a specific biomarker from outside the tab is silently broken.

The correct pattern for a named stack route that opens a specific biomarker is either:
1. Pass `biomarkerId` as a param and have `BiomarkerDetailScreen` read it via `useRoute`, or
2. Introduce a separate `BiomarkerDetailCardScreen` for the stack route.

**Fix (option A — read params in the screen):**
```typescript
// In BiomarkerDetailScreen.tsx, after the existing imports
import { useRoute, RouteProp } from '@react-navigation/native';

// Inside the component, before existing state declarations:
const route = useRoute<RouteProp<RootStackParamList, 'BiomarkerDetail'>>();
const [selectedId, setSelectedId] = useState<string | null>(
  route.params?.biomarkerId ?? null
);
```
This lets the stack route pre-select a biomarker while the tab starts at the list view.

---

### CR-03: `const __DEV__ = true` hardcoded — developer tools always visible in production

**File:** `src/screens/SettingsScreen.tsx:25`

**Issue:** The module-level constant `const __DEV__ = true;` overrides React Native's built-in `__DEV__` global with a hardcoded `true`, so the "Developer" settings section (including "Reset onboarding") is permanently visible to all users regardless of build type. The comment says "set false in production builds" but this is a manual step that will be forgotten. This exposes internal tooling to end-users and could allow arbitrary data manipulation.

**Fix:**
```typescript
// Remove this line entirely — React Native already provides a global __DEV__
// that is true in dev/Expo Go and false in production builds.
// const __DEV__ = true;   ← DELETE THIS LINE
```
Remove the declaration. The global `__DEV__` injected by Metro is correct for all build types.

---

### CR-04: `@vitalspan_exercise_log` missing from `ALL_STORAGE_KEYS` — "Clear all data" leaves stale exercise history

**File:** `src/screens/SettingsScreen.tsx:15-23`

**Issue:** `ALL_STORAGE_KEYS` governs both "Clear all data" (destructive delete) and "Export my data". The `@vitalspan_exercise_log` key, written by `ExerciseScreen.tsx` and read by `DashboardScreen.tsx`, is absent from this list. After the user taps "Delete everything", exercise logs survive. If the user re-onboards and creates a new profile, stale exercise entries from the previous identity will appear on the Dashboard's "Movement today" card.

**Fix:**
```typescript
const ALL_STORAGE_KEYS = [
  '@vitalspan_user_profile',
  '@vitalspan_biomarkers',
  '@vitalspan_protocol',
  '@vitalspan_protocol_today',
  '@vitalspan_health_data',
  '@vitalspan_health_permissions',
  '@vitalspan_first_run_complete',
  '@vitalspan_exercise_log',   // ← ADD THIS
];
```

---

## Warnings

### WR-01: Zero is an allowed value in `BiomarkerEntryScreen` but rejected in `GuidedFirstRunScreen` — inconsistent validation

**File:** `src/screens/BiomarkerEntryScreen.tsx:71` / `src/screens/GuidedFirstRunScreen.tsx:44`

**Issue:** `BiomarkerEntryScreen` uses `rawVal >= 0` as its validity check, meaning a value of exactly `0` passes validation and can be saved. `GuidedFirstRunScreen` correctly uses `parsed <= 0` (rejects zero). For all biomarkers in this app, a reading of zero is physiologically impossible and should be rejected. A user who accidentally types `0` in the full entry screen and taps Save will persist a zero reading that will then appear as the "latest" value in the detail screen and drive PhenoAge calculations wrong.

**Fix:**
```typescript
// BiomarkerEntryScreen.tsx line 71
const isValidValue = !isNaN(rawVal) && rawVal > 0;
```

---

### WR-02: Debug `console.log` left in Dashboard production path

**File:** `src/screens/DashboardScreen.tsx:113`

**Issue:** `console.log('[Dashboard] phenoAge entryMap keys:', ...)` runs on every render cycle where `entryMap` or `profile` changes. In production builds this emits verbose output to the native log bridge and has a minor performance cost. More importantly, it logs all tracked biomarker IDs, which — while not clinical data — does reveal what health conditions the user is tracking.

**Fix:** Remove the line entirely, or guard it:
```typescript
if (__DEV__) {
  console.log('[Dashboard] phenoAge entryMap keys:', Array.from(entryMap.keys()).join(','));
}
```

---

### WR-03: Unguarded `JSON.parse` calls throughout — corrupted storage crashes silently swallowed

**File:** `src/screens/DashboardScreen.tsx:53-60`, `src/screens/BiomarkerEntryScreen.tsx:98`, `src/screens/GuidedFirstRunScreen.tsx:50`

**Issue:** Multiple locations call `JSON.parse(raw)` on AsyncStorage values inside a `try/catch` that only runs `console.error(e)` and continues. If any stored JSON is corrupted (e.g., truncated during a low-storage write), `JSON.parse` throws, `setEntries` / `setProfile` are never called, and the UI silently shows empty/stale data. The user has no way to recover short of clearing app data.

**Fix:** Add explicit error feedback to the user at the screen level, at minimum in `DashboardScreen.loadData`:
```typescript
} catch (e) {
  console.error('[loadData] parse error', e);
  Alert.alert('Data error', 'Some saved data could not be read. If this persists, use Settings → Clear all data to reset.');
}
```
Also validate `raw` is non-empty before `JSON.parse` in the three entry-screen locations to guard against partially-written values.

---

### WR-04: `handleStepAdvance` captures stale `step` via `useMemo` — race condition if user double-taps

**File:** `src/screens/GuidedFirstRunScreen.tsx:62-71`

**Issue:** `handleStepAdvance` calls `saveEntry(step)` (capturing `step` by closure), then uses the functional updater `setStep(s => s + 1)`. If the user double-taps the button before the async `saveEntry` resolves (it awaits AsyncStorage), the second tap calls `handleStepAdvance` again with the same stale `step` value, causing the entry for that step to be saved twice and `step` to increment twice, which either renders `FIRST_RUN_CONTENT[step]` as `undefined` or skips a biomarker entirely. There is no loading/disabled guard on the CTA button.

**Fix:** Disable the button while saving:
```typescript
const [saving, setSaving] = useState(false);

async function handleStepAdvance() {
  if (saving) return;
  setSaving(true);
  try {
    await saveEntry(step);
  } catch {
    setSaving(false);
    return;
  }
  Haptics.selectionAsync().catch(() => null);
  setInputValue('');
  setStep(s => s + 1);
  setSaving(false);
}
```
Apply the same guard to `handleFinish`. Bind `disabled={saving}` on the CTA `TouchableOpacity`.

---

### WR-05: Dashboard biomarker section has a silent empty branch — content disappears after first-run completion with no entries

**File:** `src/screens/DashboardScreen.tsx:279-334`

**Issue:** The conditional rendering logic is:
```
entries.length === 0 && !firstRunComplete  → empty-state card
entries.length > 0                          → horizontal biomarker scroll
otherwise (entries.length === 0 && firstRunComplete) → null
```
A user who skips all three GuidedFirstRun steps (setting `firstRunComplete = true` with zero entries) and then lands on Dashboard sees **nothing** in the Biomarkers section — no CTA, no empty state, no scroll. The section header renders but the content block is invisible. This is a UX dead-end.

**Fix:**
```typescript
{entries.length === 0 ? (
  // Show empty state regardless of firstRunComplete
  <View style={s.emptyStateCard}>
    ...
  </View>
) : (
  <ScrollView horizontal ...>
    ...
  </ScrollView>
)}
```
The `firstRunComplete` flag can still be used to vary the copy ("Log your first result" vs "Continue where you left off") if desired.

---

### WR-06: Type-unsafe `as never` navigation calls in `DashboardScreen`

**File:** `src/screens/DashboardScreen.tsx:363,395`

**Issue:** Two calls use `nav.navigate('Main' as never)` to jump to the Exercise tab. `Main` is a nested tab route, not a typed param in `RootStackParamList`, so TypeScript's navigation type safety is suppressed. If the route name or structure changes, these calls will silently misdirect at runtime.

**Fix:** The correct pattern for navigating into a tab from a stack screen is to use the nested navigation API:
```typescript
// Navigate to the Exercise tab within Main
nav.navigate('Main');  // then tab navigation handles the rest
// OR, if deep-linking to a specific tab:
nav.navigate('Main', { screen: 'Exercise' });
```
Add `Main` with optional nested params to `RootStackParamList` if deep-tab navigation is needed, or navigate to `Main` without the cast and rely on tab state restoration.

---

### WR-07: Export data omits `@vitalspan_exercise_log`

**File:** `src/screens/SettingsScreen.tsx:115-128`

**Issue:** `handleExportData` iterates `ALL_STORAGE_KEYS`, which (per CR-04) does not include `@vitalspan_exercise_log`. A user exporting their data for backup or migration will lose all exercise history silently — the export JSON will not contain it. This is a data integrity issue separate from the clear-data bug.

**Fix:** Same fix as CR-04 — add `@vitalspan_exercise_log` to `ALL_STORAGE_KEYS`.

---

## Info

### IN-01: `ExplanationCard` component is unused — logic inlined into `BiomarkerEntryScreen`

**File:** `src/screens/BiomarkerEntryScreen.tsx:168-175` / `src/components/ExplanationCard.tsx`

**Issue:** `ExplanationCard` was extracted as a reusable component and is correctly used in `GuidedFirstRunScreen`. However, `BiomarkerEntryScreen` imports `BreathingCard` directly and re-implements the same visual structure inline (lines 168-176) rather than using `ExplanationCard`. The inline styles `s.explanationWrapper`, `s.explanationInner`, `s.explanationIcon`, etc. duplicate `ExplanationCard`'s StyleSheet. This defeats the extraction and will cause the two surfaces to drift visually.

**Fix:** Replace the inline implementation in `BiomarkerEntryScreen` with the `ExplanationCard` component:
```typescript
import ExplanationCard from '../components/ExplanationCard';

// In JSX, replace the BreathingCard block with:
{selected !== null && FIRST_RUN_CONTENT_MAP[selected.id] !== undefined && (
  <ExplanationCard
    icon={FIRST_RUN_CONTENT_MAP[selected.id].icon}
    headline={FIRST_RUN_CONTENT_MAP[selected.id].headline}
    body={FIRST_RUN_CONTENT_MAP[selected.id].body}
    style={s.explanationWrapper}
  />
)}
```
Remove the duplicate `explanationWrapper/Inner/Icon/Headline/Body` styles from the screen's StyleSheet.

---

### IN-02: `InputUnit` type is `'native' | 'mmol/L'` but the HbA1c alternate unit is `mmol/mol`

**File:** `src/screens/BiomarkerEntryScreen.tsx:19`

**Issue:** The type `InputUnit = 'native' | 'mmol/L'` hard-codes the string `'mmol/L'` in the type even though `MMOL_CONVERTIBLE` uses `altUnit: 'mmol/mol'` for HbA1c. The chip row on line 192 renders the string literal `'mmol/L'` as the key regardless of the actual alternate unit. The displayed chip for HbA1c will show the unit label `mmol/mol` (from `altUnit`) but the `key` prop and `inputUnit` state value will be `'mmol/L'` — which works coincidentally but is misleading and fragile if a third biomarker is added with a different alternate unit.

**Fix:** Rename the type to `'native' | 'alternate'` and use `altUnit` consistently for display.

---

### IN-03: `BiomarkerDetailScreen` list view shows only BIOMARKERS array order, not user's most-recently-logged biomarkers first

**File:** `src/screens/BiomarkerDetailScreen.tsx:317-364`

**Issue:** The list view iterates all categories and renders all 50+ biomarkers in static order from the `BIOMARKERS` array. There is no visual differentiation between biomarkers the user has actually logged and the many they haven't. The existing `entryMap` data is used only for the inline badge, but biomarkers with data are not surfaced at the top. For users who return to the screen after logging a few values, finding their data requires scrolling through ~10 categories.

**Fix:** Sort `bms` within each category so entries in `entryMap` come first, or add a "Logged" section at the top above the category list. This is a UX improvement but is also listed here because the `entryMap` data is already computed and simply not used for ordering.

---

### IN-04: Hardcoded hex `#0A1628` in `DashboardScreen` gradient violates theme rules

**File:** `src/screens/DashboardScreen.tsx:193`

**Issue:** The gradient array `['#0A1628', Colors.primaryDark, Colors.primary]` contains a literal hex value that is not defined in `src/theme/index.ts`. Per `CLAUDE.md`: "All colors from `src/theme/index.ts` — never hardcode hex values in screens."

**Fix:** Add a constant to the theme and reference it:
```typescript
// In src/theme/index.ts, add to Colors:
bgDeep: '#0A1628',

// In DashboardScreen.tsx line 193:
colors={[Colors.bgDeep, Colors.primaryDark, Colors.primary]}
```

---

_Reviewed: 2026-05-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
