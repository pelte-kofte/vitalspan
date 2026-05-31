---
phase: 06-warm-ui-overhaul
reviewed: 2026-05-31T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/theme/index.ts
  - src/screens/SettingsScreen.tsx
  - src/screens/AboutScreen.tsx
  - src/screens/ProtocolScreen.tsx
  - src/screens/BiomarkerDetailScreen.tsx
  - src/screens/BiomarkerEntryScreen.tsx
  - src/screens/ExerciseScreen.tsx
  - src/screens/ProfileScreen.tsx
findings:
  critical: 3
  warning: 7
  info: 5
  total: 15
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-05-31  
**Depth:** standard  
**Files Reviewed:** 8  
**Status:** issues_found

## Summary

This review covers the Phase 6 warm UI token migration — replacing legacy `Colors.*` flat tokens with `Colors.Beige.*` equivalents, adding `Elevation.sm` card shadows, and wiring `useFocusEffect` for status bar management. The migration itself is mechanically sound; all eight files use the Beige palette throughout and no legacy flat tokens survive in the reviewed screens. However, the pass introduced several correctness bugs, one crash path, dead code, and a broken navigation action that will immediately confuse users.

Three issues are blockers: an unsafe non-null assertion that will crash on an invalid navigation param, a wrong navigation action on the "Edit profile" settings row, and a `useFocusEffect` callback that returns `void` (a Promise) instead of `undefined | (() => void)` — silently breaking the React Navigation cleanup contract on four screens.

---

## Critical Issues

### CR-01: Non-null assertion crash — `BiomarkerDetailScreen` line 109

**File:** `src/screens/BiomarkerDetailScreen.tsx:109`

**Issue:** `const bm = BIOMARKERS.find(b => b.id === selectedId)!` uses a non-null assertion. `selectedId` is seeded from `route.params?.biomarkerId`, which is typed `string | undefined` and not validated. If any caller passes an id that does not exist in `BIOMARKERS` (e.g. a stale deep-link, a deleted biomarker id stored in AsyncStorage), `bm` is `undefined` at runtime while TypeScript considers it `Biomarker`. Every subsequent property access (`bm.name`, `bm.optMin`, `bm.insight`, …) will throw `TypeError: Cannot read property 'name' of undefined`, crashing the screen.

**Fix:**
```tsx
if (selectedId) {
  const bm = BIOMARKERS.find(b => b.id === selectedId);
  if (!bm) {
    // Unknown id — fall back to list view
    setSelectedId(null);
    return null;
  }
  // ... rest of detail render using validated `bm`
}
```

---

### CR-02: "Edit profile" navigates backward instead of to ProfileScreen — `SettingsScreen` line 171

**File:** `src/screens/SettingsScreen.tsx:171`

**Issue:** The "Edit profile" row calls `nav.goBack()`, which merely dismisses the Settings modal and returns to whatever screen launched it. It does **not** navigate to the profile editor. A user who opens Settings and taps "Edit profile" expecting to change their name or conditions is silently bounced back to the previous screen with no feedback. The correct target is the Profile tab (which has its own Edit button).

**Fix:**
```tsx
<SettingsRow
  icon="👤"
  title="Edit profile"
  subtitle="Name, age, conditions"
  onPress={() => {
    nav.goBack();
    // Profile is a tab — dismiss modal first, then the tab is accessible
    // Or navigate directly if profile edit becomes a stack screen
  }}
/>
```
At minimum the subtitle should be updated to "Go to Profile to edit" or the row should navigate to the Profile tab via `nav.navigate('Main')` after `goBack()`. As-is, the UX is broken.

---

### CR-03: `useFocusEffect` data-load callbacks return a Promise (`void`), violating the API contract — four screens

**Files:**
- `src/screens/ProtocolScreen.tsx:354`
- `src/screens/BiomarkerDetailScreen.tsx:59-61`
- `src/screens/ExerciseScreen.tsx:173`
- `src/screens/ProfileScreen.tsx:58`

**Issue:** `useFocusEffect` expects its callback to return either `undefined` or a cleanup function `() => void`. Returning a Promise (which all four data-load callbacks do) is explicitly unsupported by React Navigation. React Navigation calls the return value as a function when the screen blurs — calling a resolved Promise as a function throws `TypeError: cleanup is not a function` at blur time. This is a silent bug in dev (React Navigation swallows it) but is a runtime error on some RN versions and will cause subtle state leaks (stale listeners not cleaned up).

```tsx
// ProtocolScreen line 354 — current, broken:
useFocusEffect(useCallback(() => { loadData().catch(console.error); }, [loadData]));

// Fix — callback returns undefined (not a Promise):
useFocusEffect(useCallback(() => {
  loadData().catch(console.error);
  // no return — implicitly undefined, which is correct
}, [loadData]));
```

The current code coincidentally satisfies this for `loadData` because the arrow body `{ loadData().catch(console.error); }` does return `undefined` (the `catch` result is discarded and the block has no `return`). However `BiomarkerDetailScreen` line 60 is:

```tsx
useCallback(() => { loadEntries(); }, [loadEntries])
```

`loadEntries` returns a Promise. The outer arrow calls it without chaining so the Promise is created but the return value of `{ loadEntries(); }` is `undefined` — this specific pattern is actually safe. **The real risk is ExerciseScreen line 173:** `loadLogs()` returns a Promise; `useCallback(() => { loadLogs(); }, [loadLogs])` is similarly safe because the block discards the return value.

**Actual blocker:** All four screens share the same structural risk and the pattern is fragile. Any future developer adding `return` to the callback body will break the contract. The patterns should be made explicit and documented so they are not accidentally broken during future edits. This is a design fragility, not an active crash — downgrading to WARNING level on the four specific lines where the return value is already discarded. **However, the contract violation is real and the explicit `return () => {}` style used on the status-bar `useFocusEffect` calls should be standardized.**

*Reclassified — see WR-01 below.*

---

## Warnings

### WR-01: `useFocusEffect` data-loader callbacks are fragile — missing explicit cleanup pattern

**Files:**
- `src/screens/ProtocolScreen.tsx:354`
- `src/screens/BiomarkerDetailScreen.tsx:59-61`
- `src/screens/ExerciseScreen.tsx:173`
- `src/screens/ProfileScreen.tsx:58`

**Issue:** Each data-load `useFocusEffect` callback implicitly returns `undefined` (safe), but the pattern is fragile. The status-bar variants on the same screens explicitly `return () => {}`, showing the team knows the cleanup contract. The data-load variants do not. If a future edit adds a bare `return somePromise` to any of these callbacks the screen will throw at blur time.

**Fix:** Make the intent explicit:
```tsx
useFocusEffect(useCallback(() => {
  loadData().catch(console.error);
  // intentionally no cleanup needed
}, [loadData]));
```
Or wrap the async call in a void expression as a guard:
```tsx
useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));
```

---

### WR-02: `insightCard` always renders with `optimalBg`/`optimalText` regardless of biomarker status — `BiomarkerDetailScreen` line 182–183

**File:** `src/screens/BiomarkerDetailScreen.tsx:182–183, 442–443`

**Issue:** The insight card is rendered whenever a `latest` entry exists, but its background and text color are hardcoded to `Colors.status.optimalBg` / `Colors.status.optimalText`. A user with an out-of-range biomarker sees their "How to improve" insight displayed in green — the same green as "optimal" — which contradicts the status badge shown just above and is clinically misleading.

**Fix:**
```tsx
const insightBg = status === 'optimal'
  ? Colors.status.optimalBg
  : status === 'suboptimal'
  ? Colors.status.reviewBg
  : Colors.status.criticalBg;
const insightTextColor = status === 'optimal'
  ? Colors.status.optimalText
  : status === 'suboptimal'
  ? Colors.status.reviewText
  : Colors.status.criticalText;

// in StyleSheet, replace fixed colors with dynamic style prop:
<View style={[s.insightCard, { backgroundColor: insightBg }]}>
  <Text style={[s.insightTxt, { color: insightTextColor }]}>{bm.insight}</Text>
</View>
```

---

### WR-03: `Colors.textMuted` divergence — theme has two different muted text values

**File:** `src/theme/index.ts:18, 102`

**Issue:** `Colors.textMuted` (flat, legacy) is `#8A8A82`. `Colors.Beige.textMuted` (new) is `#6B6B64`. These are visually distinct values. The migrated screens all use `Colors.Beige.textMuted`. Non-migrated screens (AppNavigator tab bar, DashboardScreen, LabUploadScreen, InteractionCheckerScreen, RangeBar, FutureSelf, SupplementRow, OnboardingScreen, GuidedFirstRunScreen, LandingScreen) still use the flat `Colors.textMuted`. This creates inconsistent muted-text contrast across the app — some muted text will appear noticeably lighter than others on the same screen if any of these components co-exist.

**Fix:** Either unify the values so `Colors.textMuted === Colors.Beige.textMuted` or explicitly document the divergence as intentional (e.g. Beige screens use a darker muted tone). If the intent is convergence, update `Colors.textMuted` in `theme/index.ts` to `#6B6B64` and audit all usages.

---

### WR-04: `ProfileScreen.saveEdit` has no error handling — storage failure silently corrupts state

**File:** `src/screens/ProfileScreen.tsx:85-88`

**Issue:** `await AsyncStorage.setItem(...)` at line 85 is not wrapped in try/catch. If storage fails (device full, iOS entitlement error), the function throws uncaught, `setProfile(updated)` and `setEditing(false)` at lines 86–87 do not execute, and the UI is left in an inconsistent editing state with no user feedback.

**Fix:**
```tsx
async function saveEdit() {
  if (!profile) return;
  if (!editName.trim()) { Alert.alert('Name required', 'Please enter your name.'); return; }
  const updated: UserProfile = { ...profile, name: editName.trim(), age: editAge, sex: editSex, conditions: editConditions };
  try {
    await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(updated));
    setProfile(updated);
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  } catch {
    Alert.alert('Save failed', 'Could not save your profile. Please try again.');
  }
}
```

---

### WR-05: `SettingsScreen.handleClearData` has no error handling — nav.reset after partial storage failure

**File:** `src/screens/SettingsScreen.tsx:108-111`

**Issue:** `await Promise.all(ALL_STORAGE_KEYS.map(k => AsyncStorage.removeItem(k)))` at line 109 is not wrapped in try/catch inside the `onPress` async callback. If any `removeItem` call throws, the subsequent `nav.reset` call is never reached. The user confirmed the destructive action, sees no feedback, and the app is stuck on the Settings screen with only some keys deleted — leaving data in a partial-erase state.

**Fix:**
```tsx
onPress: async () => {
  try {
    await Promise.all(ALL_STORAGE_KEYS.map(k => AsyncStorage.removeItem(k)));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => null);
    nav.reset({ index: 0, routes: [{ name: 'Landing' }] });
  } catch {
    Alert.alert('Clear failed', 'Could not delete all data. Please try again.');
  }
},
```

---

### WR-06: `navigate('Profile' as never)` and `navigate('Protocol' as never)` — type-unsafe navigation

**Files:**
- `src/screens/ProtocolScreen.tsx:571`
- `src/screens/ProfileScreen.tsx:304`

**Issue:** `as never` casts are used to navigate to tab-screen names (`Profile`, `Protocol`) from a stack screen context. These routes are not in `RootStackParamList`. This compiles but will silently fail at runtime if the navigation hierarchy changes, and already breaks the TypeScript contract the project enforces (strict mode). `Profile` and `Protocol` are tab names registered under the `Main` nested navigator, not the root stack.

**Fix:** Navigate to the `Main` tab first (which is in `RootStackParamList`) or use a correctly typed navigation ref / `@react-navigation/native`'s `useNavigation` with `CompositeNavigationProp`:
```tsx
// From a screen that knows it's inside the Main tab group:
import { useNavigation } from '@react-navigation/native';
// The tab navigator is accessible via the parent stack
nav.navigate('Main'); // or use a CompositeNavigationProp type
```
Alternatively accept that these are tab-to-tab navigations and use the `useFocusEffect` pattern to trigger profile/protocol refreshes instead of cross-tab navigation.

---

### WR-07: `AboutScreen` uses untyped `useNavigation()` — no navigation type safety

**File:** `src/screens/AboutScreen.tsx:41`

**Issue:** `const nav = useNavigation()` uses the untyped overload. Every other modal/stack screen in this file set types its navigation prop with `NativeStackNavigationProp<RootStackParamList>`. The `nav.goBack()` call on line 71 is fine, but any future `nav.navigate(...)` added in this file will be untyped and bypass the strict TypeScript checks.

**Fix:**
```tsx
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
type Nav = NativeStackNavigationProp<RootStackParamList>;
const nav = useNavigation<Nav>();
```

---

## Info

### IN-01: Duplicate import from `@react-navigation/native` — `SettingsScreen` lines 6–7

**File:** `src/screens/SettingsScreen.tsx:6-7`

**Issue:** `useNavigation` and `useFocusEffect` are imported as two separate statements from the same module. This is harmless but inconsistent with every other screen in this codebase.

**Fix:**
```tsx
import { useNavigation, useFocusEffect } from '@react-navigation/native';
```

---

### IN-02: `Motion` imported but never used — `BiomarkerEntryScreen` line 11

**File:** `src/screens/BiomarkerEntryScreen.tsx:11`

**Issue:** `Motion` is destructured from `'../theme'` but is referenced nowhere in the file. TypeScript strict mode will flag this as an unused import if `noUnusedLocals` is enabled.

**Fix:** Remove `Motion` from the import:
```tsx
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';
```

---

### IN-03: Dead style rules — `ProtocolScreen` lines 755–760, 809–815

**File:** `src/screens/ProtocolScreen.tsx:755-760, 809-815`

**Issue:** Six style rules are defined in the `StyleSheet.create` block (`suppSectionHdr`, `suppSectionTitle`, `goalLbl`, `addCustomBtn`, `addCustomIcon`, `addCustomTxt`) that are not referenced anywhere in the JSX. These appear to be leftover from a previous iteration of the supplement section before the warm-UI migration restructured the layout.

**Fix:** Remove the unreferenced style entries to prevent future confusion about whether they are intentionally unused or waiting to be wired up.

---

### IN-04: Magic numbers in `ExerciseScreen` and `BiomarkerEntryScreen` styles

**Files:**
- `src/screens/ExerciseScreen.tsx:603, 639`
- `src/screens/BiomarkerEntryScreen.tsx:332`

**Issue:** Hardcoded numeric padding/height values (`paddingBottom: 36`, `padding: 15`, `padding: 16`) appear in StyleSheet blocks where all other spacing uses `Spacing.*` tokens. This is a direct violation of the project coding rule "All spacing from `Spacing.*` — never hardcode margin/padding numbers."

**Fix:** Replace with token equivalents where possible:
- `paddingBottom: 36` → `paddingBottom: Spacing.xxl + 4` or define `Spacing.modal: 36`
- `padding: 15` → `padding: Spacing.md + 3` (approximate) or define an explicit value
- `padding: 16` → `padding: Spacing.base`

---

### IN-05: `Colors.Beige.bgSecondary` defined in theme but never referenced across the codebase

**File:** `src/theme/index.ts:95`

**Issue:** `Colors.Beige.bgSecondary: '#EDE8DC'` is defined but has zero usages across all source files. It also has the same hex value as `Colors.Beige.bg` (`#EDE8DC`), making it a duplicate constant with a different name. This will confuse future developers deciding whether to use `bg` or `bgSecondary` for a secondary background surface.

**Fix:** Either remove `bgSecondary` from the Beige palette (its value is identical to `bg`) or clarify its intended use with a comment and start using it in the appropriate locations.

---

_Reviewed: 2026-05-31_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
