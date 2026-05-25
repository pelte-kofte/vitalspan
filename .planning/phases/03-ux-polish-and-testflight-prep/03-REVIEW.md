---
phase: 03-ux-polish-and-testflight-prep
reviewed: 2026-05-25T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - App.tsx
  - src/navigation/AppNavigator.tsx
  - src/screens/LandingScreen.tsx
  - src/screens/OnboardingScreen.tsx
  - src/screens/ProtocolScreen.tsx
findings:
  critical: 3
  warning: 6
  info: 4
  total: 13
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-25T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files covering the app entry point, navigation, and three screens were reviewed. The most serious issues are a missing `SafeAreaProvider` wrapper (crashes `useSafeAreaInsets` on Android and in any standalone context), a `BiomarkerDetailScreen` registered as both a tab and a stack screen (navigation ambiguity), and an unguarded `finish()` in `OnboardingScreen` that can silently drop the profile write without the user knowing. Several project coding-rule violations are also present: hardcoded hex values and numeric literals that should use theme tokens, and a dead import (`SupplementRow` imported but never rendered).

---

## Critical Issues

### CR-01: `useSafeAreaInsets` called without `SafeAreaProvider` — crash risk on Android

**File:** `src/navigation/AppNavigator.tsx:51`
**Issue:** `MainTabs` calls `useSafeAreaInsets()` at line 51. `react-native-safe-area-context` requires a `SafeAreaProvider` ancestor in the React tree. `NavigationContainer` (used in `AppNavigator`) does NOT provide one. `App.tsx` does not wrap with `SafeAreaProvider` either — a full-project search confirmed there is no `SafeAreaProvider` anywhere in the codebase. On iOS the `SafeAreaView` components in individual screens may partially mask this, but the insets hook will return `{ top: 0, bottom: 0, left: 0, right: 0 }` silently on Android and on any device where the context is absent — making `paddingBottom: Math.max(insets.bottom, 8)` compute incorrectly, cutting off the tab bar content on Android. This is a crash-safe but silently broken layout on the largest non-iOS user segment, and the React Native docs classify missing `SafeAreaProvider` as an error.

**Fix:**
```tsx
// App.tsx — wrap everything in SafeAreaProvider
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  // ... existing logic ...
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator initialRoute={initialRoute} />
      <MedicalDisclaimer />
    </SafeAreaProvider>
  );
}
```

---

### CR-02: `BiomarkerDetailScreen` registered as both a tab screen and a stack screen

**File:** `src/navigation/AppNavigator.tsx:84` and `145`
**Issue:** `BiomarkerDetailScreen` appears twice in the navigator tree:
- Line 84: as the `Biomarkers` tab inside `MainTabs` (bottom tab)
- Line 145–147: as the `BiomarkerDetail` stack screen with `presentation: 'card'`

This means every time the `Biomarkers` tab is visible, `BiomarkerDetailScreen` is mounted in the tab navigator with no `biomarkerId` parameter (the param is `optional` in `RootStackParamList` but `BiomarkerDetailScreen` is intended to be navigated to with a specific ID). The tab will always show the screen in its "no ID" state. Any call to `navigation.navigate('BiomarkerDetail', { biomarkerId: '...' })` from within the tab will push a new stack screen rather than re-using the already-mounted tab. This creates a confusing duplicate — two concurrent instances of the same screen class, conflicting state, and broken back-navigation semantics. The intent described in `CLAUDE.md` is a `Biomarkers` tab that lists all biomarkers, not an individual detail view.

**Fix:** Replace the `Biomarkers` tab component with the correct list/overview screen (likely `BiomarkersScreen` or `BiomarkerListScreen`):
```tsx
// AppNavigator.tsx — Tab definition
<Tab.Screen
  name="Biomarkers"
  component={BiomarkersScreen}   // <-- the list/overview screen, not BiomarkerDetailScreen
  options={{
    tabBarLabel: 'Biomarkers',
    tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
  }}
/>
```
Keep `BiomarkerDetail` only in the stack for navigating to a single detail view.

---

### CR-03: `finish()` in `OnboardingScreen` has no error handling — silent data loss

**File:** `src/screens/OnboardingScreen.tsx:77–89`
**Issue:** `finish()` is an `async` function that calls `AsyncStorage.setItem(...)` at line 87 — the `await` is present, but there is no `try/catch` or `.catch()`. If the write fails (device storage full, AsyncStorage error), the error is swallowed by the unhandled promise. The function then calls `nav.reset(...)`, navigating the user to `GuidedFirstRun` as if onboarding completed successfully. When the user returns to the app, `App.tsx` reads the profile, finds nothing (or stale data), and routes back to `Landing`. The user loses their onboarding data with no error message.

**Fix:**
```tsx
async function finish() {
  const profile = {
    name: name.trim() || 'Friend',
    age,
    sex,
    goal: GOALS[goal ?? 0]?.title || '',
    conditions,
    medications: meds,
    onboardingComplete: true,
  };
  try {
    await AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(profile));
  } catch {
    Alert.alert('Save failed', 'Could not save your profile. Please try again.');
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  nav.reset({ index: 0, routes: [{ name: 'GuidedFirstRun' }] });
}
```

---

## Warnings

### WR-01: `SupplementRow` imported but never used in `ProtocolScreen`

**File:** `src/screens/ProtocolScreen.tsx:18`
**Issue:** `import SupplementRow from '../components/SupplementRow';` is present at line 18 but `SupplementRow` is never rendered anywhere in the file. The screen implements its own inline supplement row layout. The unused import is a dead code artifact, but more importantly it is a `type: 'nav'` import placed after a `type: 'code'` import (line 17 vs 18), violating the import ordering convention. With TypeScript strict mode on, this will cause a `no-unused-vars` / `@typescript-eslint/no-unused-vars` error on CI.

**Fix:** Remove line 18 entirely:
```tsx
// Delete this line:
import SupplementRow from '../components/SupplementRow';
```

---

### WR-02: `addedSupplements` not null-guarded after `JSON.parse` in `loadData`

**File:** `src/screens/ProtocolScreen.tsx:340–348`
**Issue:** When loading saved `ProtocolState` from AsyncStorage, the spread `...saved` at line 344 copies `saved.addedSupplements` directly without a null-guard. If a user upgrades from a version that didn't persist `addedSupplements` (or if the field was corrupted), `protocol.addedSupplements` will be `undefined` at runtime. Multiple downstream calls — `protocol.addedSupplements.includes(name)` (line 395), `protocol.addedSupplements.filter(...)` (line 397), and `protocol.addedSupplements.map(...)` (line 406) — will throw `TypeError: Cannot read properties of undefined`.

In contrast, `customSupplements` and `taken` are already null-guarded (lines 345–346). `addedSupplements` and `medTimes` are not.

**Fix:**
```tsx
setProtocol({
  ...EMPTY_PROTOCOL,
  ...saved,
  medTimes: saved.medTimes ?? {},
  addedSupplements: saved.addedSupplements ?? [],
  customSupplements: saved.customSupplements ?? [],
  taken: saved.takenDate === today ? (saved.taken ?? []) : [],
  takenDate: today,
});
```

---

### WR-03: Hardcoded hex colors violate project coding rules

**File:** `src/navigation/AppNavigator.tsx:57–58`, `src/screens/LandingScreen.tsx:128`, `src/screens/ProtocolScreen.tsx:761,871`
**Issue:** `CLAUDE.md` rule: "All colors from `src/theme/index.ts` — never hardcode hex values in screens." Multiple violations:
- `AppNavigator.tsx:57`: `backgroundColor: 'rgba(237, 232, 220, 0.94)'` — this is `Colors.bg` at 94% opacity
- `AppNavigator.tsx:58`: `borderTopColor: 'rgba(0, 0, 0, 0.06)'`
- `LandingScreen.tsx:128`: `shadowColor: '#000'`
- `ProtocolScreen.tsx:761`: `shadowColor: '#000'`
- `ProtocolScreen.tsx:871`: `backgroundColor: 'rgba(0,0,0,0.5)'`

Shadow and overlay colors are legitimate exceptions when they must be pure black, but the tab bar `backgroundColor` directly duplicates `Colors.bg` and will silently diverge if the theme is updated.

**Fix:** Replace `rgba(237, 232, 220, 0.94)` with `Colors.bg + 'F0'` hex alpha or define a semantic token `Colors.tabBarBg` in `theme/index.ts`.

---

### WR-04: `MedicalDisclaimer` blocks app while `initialRoute` is still loading

**File:** `App.tsx:34–40`
**Issue:** `MedicalDisclaimer` runs its own `AsyncStorage.getItem` in a `useEffect` independently of the `initialRoute` loading effect. Both read different keys simultaneously. If the disclaimer has never been accepted, the disclaimer modal renders over the loading spinner — the user sees the modal before knowing which screen to land on. More importantly, if the disclaimer `setVisible(true)` fires while `initialRoute` is still `null`, React renders the loading `<View>` with a `<Modal>` overlaid on it. After `initialRoute` resolves, the navigator mounts beneath the modal. This ordering is incidental and correct in practice, but the disclaimer `onAccepted` callback (which is not passed from `App.tsx`) will never fire, meaning any logic a future caller attaches to `onAccepted` will silently not execute.

**Fix:** Pass `onAccepted` from `App.tsx` if needed, and ensure both effects are coordinated — or render `MedicalDisclaimer` only after `initialRoute` is resolved:
```tsx
if (!initialRoute) {
  return (
    <View style={s.loading}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <MedicalDisclaimer />  {/* show disclaimer during load, before navigator mounts */}
    </View>
  );
}
return (
  <>
    <StatusBar style="auto" />
    <AppNavigator initialRoute={initialRoute} />
    <MedicalDisclaimer />
  </>
);
```

---

### WR-05: Hardcoded magic numbers in `StyleSheet` violate spacing rules

**File:** `src/screens/LandingScreen.tsx:102,125,126`, `src/screens/OnboardingScreen.tsx:303,305,315,316,317,336`
**Issue:** `CLAUDE.md` rule: "All spacing from `Spacing.*` — never hardcode margin/padding numbers." Multiple raw numbers appear in `StyleSheet` definitions that are not dynamic values:
- `LandingScreen.tsx:102`: `fontSize: 56` — should be `Typography.sizes.display1` (56 exists in theme)
- `LandingScreen.tsx:125–126`: `borderRadius: 20`, `paddingVertical: 15` — should use `Radius.xl` and a `Spacing` token
- `OnboardingScreen.tsx:303`: `fontSize: 28`, `lineHeight: 34`, `marginBottom: 8`
- `OnboardingScreen.tsx:305`: `fontSize: 20`, `marginTop: 8`
- `OnboardingScreen.tsx:315`: `width: 40, height: 40, borderRadius: 20`
- `OnboardingScreen.tsx:317`: `fontSize: 36`
- `OnboardingScreen.tsx:336`: `paddingVertical: 15`

**Fix:** Map to existing theme tokens:
```ts
// LandingScreen
title: {
  fontFamily: Typography.serif,
  fontSize: Typography.sizes.display1,  // was 56
  ...
},
btnPrimary: {
  borderRadius: Radius.xl,              // was 20
  paddingVertical: Spacing.base - 1,    // or define Spacing.buttonV = 15
  ...
},
```

---

### WR-06: `type Nav` import placed after `import SupplementRow` — import order violation

**File:** `src/screens/ProtocolScreen.tsx:17–18`
**Issue:** Line 17 declares `type Nav = ...` as a type alias (not an import), then line 18 imports `SupplementRow`. The type alias should come after all imports, not sandwiched between them. TypeScript strict mode and common lint rules (`import/order`) flag this pattern. Beyond lint, it causes confusion about whether `Nav` is an import.

**Fix:** Move the `type Nav = ...` declaration below all import statements, just before the first constant/function definition.

---

## Info

### IN-01: `TabIcon` component uses inline `style` prop — minor rules violation

**File:** `src/navigation/AppNavigator.tsx:44–47`
**Issue:** `TabIcon` returns `<Text style={{ fontSize: 20, color: ... }}>` — an inline style object. `CLAUDE.md` permits inline styles only for *dynamic* values. The `fontSize: 20` is a static magic number, not dynamic. `color` varies by `focused`, which is dynamic and acceptable as inline. The fontSize should be extracted to a `StyleSheet` constant or `Typography.sizes.xl`.

**Fix:**
```tsx
// In StyleSheet
tabIcon: { fontSize: Typography.sizes.xl },

// In component
<Text style={[s.tabIcon, { color: focused ? Colors.primary : Colors.textMuted }]}>
```

---

### IN-02: `addCustomBtn` / `addCustomIcon` / `addCustomTxt` styles are dead code

**File:** `src/screens/ProtocolScreen.tsx:803–808`
**Issue:** Three style entries — `addCustomBtn`, `addCustomIcon`, `addCustomTxt` — are defined in `StyleSheet.create(s)` at lines 803–808 but are never referenced anywhere in the render tree. They were likely from a previous iteration of the "add custom" button that was replaced by `addStackBtn`.

**Fix:** Remove the three dead style entries:
```ts
// Delete these:
addCustomBtn: { ... },
addCustomIcon: { ... },
addCustomTxt: { ... },
```

---

### IN-03: `suppSectionHdr` / `suppSectionTitle` / `goalLbl` styles are dead code

**File:** `src/screens/ProtocolScreen.tsx:752–757`
**Issue:** `suppSectionHdr`, `suppSectionTitle`, and `goalLbl` style entries are defined but never applied in any JSX. Dead style objects increase bundle size and confuse readers.

**Fix:** Remove the three style entries.

---

### IN-04: `Profile` tab navigated via `as never` cast — type-unsafe

**File:** `src/screens/ProtocolScreen.tsx:568`
**Issue:** `nav.navigate('Profile' as never)` uses `as never` to suppress the TypeScript error. `'Profile'` is a tab screen name inside `MainTabs`, not a key in `RootStackParamList`, so it rightly does not type-check. This cast hides a valid architecture concern: you cannot type-safely navigate to a tab screen from a stack navigator's typed `navigate` function without explicitly nesting the params. This will cause a runtime navigation no-op or error depending on the React Navigation version.

**Fix:** Either expose the `Profile` tab as a stack screen (add it to `RootStackParamList` with `undefined` params), or navigate to `'Main'` and use a tab navigation ref, or use an untyped navigation call with a comment explaining why:
```tsx
// Navigate to Main tabs, then the Profile tab
nav.navigate('Main' as never);
// Better: use a navigation ref or a cross-navigator tab switch
```

---

_Reviewed: 2026-05-25T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
