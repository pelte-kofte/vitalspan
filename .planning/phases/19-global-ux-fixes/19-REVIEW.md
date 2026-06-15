---
phase: 19-global-ux-fixes
reviewed: 2026-06-15T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/components/OrbitalInfoModal.tsx
  - src/screens/ExerciseDetailScreen.tsx
  - src/screens/DashboardScreen.tsx
  - src/screens/LongevityScoreScreen.tsx
  - src/screens/ProtocolScreen.tsx
findings:
  critical: 3
  warning: 6
  info: 4
  total: 13
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-06-15
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files were reviewed covering the Phase 19 UX fixes: a new `OrbitalInfoModal` bottom-sheet component, safe-area header fix in `ExerciseDetailScreen`, a background color update in `DashboardScreen`, orbital CTA handlers in `LongevityScoreScreen`, and keyboard-avoidance improvements to the custom-supplement modal in `ProtocolScreen`.

The core feature logic is sound. Three blocker-level bugs were found: an SVG cross-element gradient reference that silently fails to render, an unguarded async function call that swallows `Linking` errors on every code path, and a `setTimeout` in `loadData` that fires `setState` after the screen can be unmounted. Six warnings cover quality and correctness issues, including a missing React import, duplicate import statements, and intent-mismatching behaviour in the `AddCustomSupplementModal` touch propagation. Four informational items note project-convention violations.

---

## Critical Issues

### CR-01: SVG `arcGrad` gradient defined in one `<Svg>` element, referenced in a sibling `<Svg>`

**File:** `src/screens/LongevityScoreScreen.tsx:625–651`

**Issue:** The `<Defs>` block containing `id="arcGrad"` lives inside the first `<Svg>` (lines 625–645). The `<Path stroke="url(#arcGrad)">` that consumes it sits inside a *different*, sibling `<Svg>` element wrapped in an `Animated.View` (lines 647–652). SVG `<Defs>` are scoped to their containing `<svg>` element; a gradient defined in one SVG document is invisible to a second SVG document rendered elsewhere in the React tree. At runtime, `url(#arcGrad)` resolves to nothing and the dashed orbit arc renders with no stroke at all (or a fallback colour depending on the SVG renderer).

`sphereGlow` is also defined in the first `<Svg>` and consumed in the same `<Svg>`, so it is unaffected.

**Fix:** Move the `<Defs>` block — or at minimum the `arcGrad` definition — into the second `<Svg>` element that actually uses it:

```tsx
<Animated.View style={[StyleSheet.absoluteFill, arcStyle]}>
  <Svg width={W} height={SVG_H} style={StyleSheet.absoluteFill}>
    <Defs>
      <SvgGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0%"   stopColor={Colors.viz.bioGreen} stopOpacity="0.8" />
        <Stop offset="50%"  stopColor={Colors.viz.cyan}     stopOpacity="0.6" />
        <Stop offset="100%" stopColor={Colors.viz.bioGreen} stopOpacity="0.1" />
      </SvgGradient>
    </Defs>
    <Path
      d={arcPath(SPHERE_R + 14)}
      fill="none"
      stroke="url(#arcGrad)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeDasharray="8 6"
    />
  </Svg>
</Animated.View>
```

---

### CR-02: `handleOpenSettings` promise rejection is unhandled on every call site

**File:** `src/screens/LongevityScoreScreen.tsx:366–367, 383–384, 394–395`

**Issue:** `handleOpenSettings` is declared `async` and awaits `Linking.openURL('app-settings:')`. On three call sites the returned promise is never awaited and no `.catch()` is chained:

- Line 384: `handleOpenSettings();` (inside the `'sleep'` / `'denied'` branch)
- Line 395: `() => { setOrbitalModal(null); handleOpenSettings(); }` (inside the closure stored as `ctaAction`)
- Line 554: `onPress={handleOpenSettings}` — React Native event handlers do call the async function, but any rejection is an unhandled promise rejection that crashes the JS thread on Hermes in development and silently fails in production

`Linking.openURL` can reject if the URL scheme is unrecognised or if the OS disallows it. On call sites 384 and 395 the rejection is completely silent.

**Fix:** Add `.catch` to all call sites, or simplify the function to be synchronous and handle errors inline:

```tsx
function handleOpenSettings() {
  Linking.openURL('app-settings:').catch((e) =>
    console.warn('[LongevityScore] Could not open settings', e),
  );
}
```

Remove the `async` keyword and the `await`. All three call sites then work without modification.

---

### CR-03: `setTimeout` inside `loadData` can fire `setState` after screen unmount

**File:** `src/screens/DashboardScreen.tsx:137`

**Issue:** Inside `loadData` (called via `useFocusEffect` on every focus event), when the email is already verified, the code sets up a 3-second timer:

```ts
setTimeout(() => setShowVerifiedToast(false), 3000);
```

`useFocusEffect` does not clean up this timer if the user navigates away within 3 seconds. After 3 seconds, `setShowVerifiedToast(false)` fires on a component that may be unmounted or re-focused, causing either a React state-update-on-unmounted-component warning or an unexpected UI flash on the next focus.

Additionally, if the user navigates away and back within 3 seconds, `loadData` runs again, queuing a second timer. Both timers then fire, potentially causing a double render and missed state.

**Fix:** Return the cleanup from `useFocusEffect`, or capture the timer ID in a ref and clear it:

```ts
// Inside loadData — capture the ID
const id = setTimeout(() => setShowVerifiedToast(false), 3000);
// Store in a ref (declare at top of component):
toastTimerRef.current = id;

// In useFocusEffect cleanup:
useFocusEffect(
  useCallback(() => {
    loadData();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [loadData])
);
```

---

## Warnings

### WR-01: `OrbitalInfoModal` is missing the `React` import

**File:** `src/components/OrbitalInfoModal.tsx:1`

**Issue:** The file uses JSX (`<Modal>`, `<TouchableOpacity>`, etc.) but does not import `React`. With the new JSX transform (React 17+), this is safe only when the bundler is configured with `"jsx": "react-jsx"` in `tsconfig.json`. Expo SDK 51 enables this, so this is not a crash today — but the project CLAUDE.md requires TypeScript strict, and the omission is inconsistent with every other file in the codebase (all five other reviewed files import React). If the project is ever compiled with a classic transform, this file will break.

**Fix:**
```tsx
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
```

---

### WR-02: Duplicate `@react-navigation/native` import in `ExerciseDetailScreen`

**File:** `src/screens/ExerciseDetailScreen.tsx:6–7`

**Issue:** Two consecutive `import` statements pull from the same module path:

```ts
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';  // line 6
import { useFocusEffect } from '@react-navigation/native';                       // line 7
```

While bundlers typically deduplicate these, the split import is an error-prone pattern — any future edit that removes one line risks accidentally breaking the other, and it violates the project's implicit one-import-per-package convention present everywhere else.

**Fix:** Merge into a single import:
```ts
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
```

---

### WR-03: `AddCustomSupplementModal` outer `TouchableWithoutFeedback` dismisses on backdrop tap but inner absorber is a no-op, not a true stop-propagation

**File:** `src/screens/ProtocolScreen.tsx:188–291`

**Issue:** The modal structure is:

```
<TouchableWithoutFeedback onPress={dismiss+close}>   ← outer: closes on backdrop tap
  <View style={ms.overlay}>
    <KeyboardAvoidingView>
      <TouchableWithoutFeedback onPress={/* absorbs tap */}>   ← inner: should block close
        <View style={ms.sheet}>…</View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </View>
</TouchableWithoutFeedback>
```

The inner `TouchableWithoutFeedback` comment says it "prevents propagation to outer overlay." However, `TouchableWithoutFeedback` does not stop event propagation in React Native — it only consumes the touch at the `Touchable` level. Touch events in React Native propagate via the responder system, and the outer `TouchableWithoutFeedback` sitting above `View` (not above the inner `TouchableWithoutFeedback`) will also fire because both compete as gesture responders. In practice, tapping anywhere on the sheet — including form fields — closes the modal and resets the form, which defeats the keyboard-avoidance fix this change was meant to deliver.

The existing `AddSupplementSheet` below uses the correct pattern: the overlay is a plain `View` and only the outer backdrop responds.

**Fix:** Use the same pattern as `AddSupplementSheet`:

```tsx
<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
  {/* Outer backdrop tap → dismiss */}
  <TouchableOpacity
    style={ms.overlay}
    activeOpacity={1}
    onPress={() => { Keyboard.dismiss(); onClose(); resetForm(); }}
  >
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Inner sheet tap → absorbed via TouchableOpacity with activeOpacity=1 */}
      <TouchableOpacity activeOpacity={1} onPress={() => {}}>
        <View style={ms.sheet}>
          {/* …form content… */}
        </View>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  </TouchableOpacity>
</Modal>
```

---

### WR-04: `OrbitalInfoModal` sheet `paddingBottom` ignores home indicator safe area

**File:** `src/components/OrbitalInfoModal.tsx:63`

**Issue:** The bottom sheet uses a hardcoded `paddingBottom: Spacing.xxl + Spacing.sm` (= 40 pt). On iPhone models with a home indicator (iPhone X and later, including all Dynamic Island devices), the home indicator is 34 pt. A fixed 40 pt provides no margin on top of the indicator, making the "Got it" CTA uncomfortably close to the bottom edge and potentially occluded. The `ExerciseDetailScreen` fix in this same phase explicitly adds `insets.top` — the same pattern is absent here at the bottom.

**Fix:**
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function OrbitalInfoModal(…) {
  const insets = useSafeAreaInsets();
  // ...
  // In the sheet style, use dynamic paddingBottom:
  <View style={[s.sheet, { paddingBottom: Spacing.xxl + insets.bottom }]}>
```

Remove the static `paddingBottom` from the StyleSheet `sheet` entry.

---

### WR-05: HRV/Fitness orbital modal CTA label is "Connect Health" but `permissionState === 'granted'` routes to `handleRequestPermission`

**File:** `src/screens/LongevityScoreScreen.tsx:393–402`

**Issue:** When `permissionState === 'granted'` (Health is already connected but no Apple Watch is paired), the `ctaAction` stored is:

```ts
() => { setOrbitalModal(null); handleRequestPermission(); }
```

And the `ctaLabel` shown to the user is `'Connect Health'`. But if the user already granted Health access, tapping "Connect Health" will call `handleRequestPermission()` again — which calls `connectAndSync()` internally — doing a redundant re-sync that gives no helpful outcome. The correct action when health is already granted but watch data is absent is to surface a different message (e.g. "Make sure Apple Watch is paired") rather than re-requesting a permission that is already granted.

**Fix:** Distinguish the two sub-cases:
```ts
const isGranted = permissionState === 'granted';
const ctaAction = permissionState === 'denied'
  ? () => { setOrbitalModal(null); handleOpenSettings(); }
  : undefined; // no CTA when already connected — the body text is sufficient
setOrbitalModal({
  title: metricKey === 'hrv' ? 'HRV Score Unavailable' : 'Fitness Score Unavailable',
  body: isGranted
    ? 'HRV and VO₂ max require an Apple Watch paired to this iPhone and synced with Apple Health.'
    : 'Connect Apple Health to see live HRV and VO₂ max data from your Apple Watch.',
  ctaLabel: isGranted ? undefined : 'Connect Health',
  onCta: ctaAction,
});
```

---

### WR-06: `LongevityScoreScreen` computes `entryMap` twice from the same source data

**File:** `src/screens/LongevityScoreScreen.tsx:439–452, 482–489`

**Issue:** A local `entryMap` variable is built inside the `phenoResult` `useMemo` callback (lines 441–445) for the PhenoAge computation. Then a second, identically-structured `entryMap` is built in a separate top-level `useMemo` (lines 482–489) for the confidence and transparency UI. Both iterate over `biomarkerEntries` with the same deduplication logic. This means `biomarkerEntries` is iterated twice on every render that changes biomarker data.

Beyond the wasted work, maintaining two copies creates a risk that they diverge if one is updated and the other is not.

**Fix:** Hoist `entryMap` into a single top-level `useMemo` declared before `phenoResult`, and pass it into the PhenoAge computation instead of rebuilding it:

```tsx
const entryMap = React.useMemo(() => {
  const m = new Map<string, StoredEntry>();
  for (const e of biomarkerEntries) {
    const ex = m.get(e.biomarkerId);
    if (!ex || e.date > ex.date) m.set(e.biomarkerId, e);
  }
  return m;
}, [biomarkerEntries]);

const phenoResult = React.useMemo(() => {
  if (!profile?.age || profile.age <= 0) return null;
  const inputs: PhenoAgeInputs = { age: profile.age };
  for (const [biomarkerId, inputKey] of Object.entries(PHENO_AGE_BIOMARKER_MAP)) {
    const entry = entryMap.get(biomarkerId);
    if (entry != null && entry.value != null) inputs[inputKey] = entry.value;
  }
  return computePhenoAge(inputs);
}, [entryMap, profile]);
```

---

## Info

### IN-01: `ExerciseDetailScreen` — hardcoded `padding: 15` on CTA button

**File:** `src/screens/ExerciseDetailScreen.tsx:179`

**Issue:** The `ctaBtn` style has `padding: 15`, which violates the project rule "All spacing from `Spacing.*` — never hardcode margin/padding numbers." `Spacing.md` (12) or `Spacing.base` (16) are the closest tokens.

**Fix:** Replace `padding: 15` with `paddingVertical: Spacing.md, paddingHorizontal: Spacing.base` or choose the closest Spacing token.

---

### IN-02: `LongevityScoreScreen` — hardcoded hex colour values in `healthScoreColor` and `LinearGradient`

**File:** `src/screens/LongevityScoreScreen.tsx:89–93, 590`

**Issue:** The `healthScoreColor` function returns bare hex strings (`'#1C3B2A'`, `'#2D6A4F'`, `'#0D2B22'`, etc.) and the root `LinearGradient` uses `['#080D09', '#0C1410', '#0F1C14']`. The CLAUDE.md rule states: "All colors from `src/theme/index.ts` — never hardcode hex values in screens."

**Fix:** Add dark-background gradient constants to the `Gradients` export in `src/theme/index.ts` (e.g., `Gradients.longevityScreen`, `Gradients.bioAgeGood`, etc.) and reference them here.

---

### IN-03: `DashboardScreen` — `weeklyCard` styles mix `Colors.dark.*` tokens onto a light-mode screen

**File:** `src/screens/DashboardScreen.tsx:703–731`

**Issue:** The weekly movement card uses `Colors.dark.cardBg`, `Colors.dark.cardBorder`, `Colors.dark.textMuted`, and `Colors.dark.text` — all defined for the dark-background LongevityScore screen. The Dashboard is a light-surface screen (background `Colors.surface = '#FFFFFF'`). The rendered card will appear very dark against the white background, causing an inconsistent visual appearance.

This may be intentional (a contrast "feature card"), but if so the style comment should say so explicitly. If unintentional, light-mode equivalents (`Colors.bgCard`, `Colors.borderLight`, `Colors.textMuted`, `Colors.textPrimary`) should be used.

**Fix:** Use light-mode tokens consistently:
```ts
weeklyCard: {
  marginHorizontal: Spacing.base,
  marginBottom: Spacing.sm,
  backgroundColor: Colors.bgCard,
  borderRadius: Radius.xl,
  borderWidth: 0.5,
  borderColor: Colors.borderLight,
  padding: Spacing.md,
},
```

---

### IN-04: `ExerciseDetailScreen` — no safe-area inset on the bottom CTA container

**File:** `src/screens/ExerciseDetailScreen.tsx:178`

**Issue:** The phase added `insets.top` to the header, which is correct. The bottom CTA container uses `paddingBottom: Spacing.lg` (20 pt) but has no `insets.bottom` applied. On devices with a home indicator (34 pt), the "Log this exercise" button sits too close to the physical edge. Since `insets` is already imported and used at line 79, extending it to the bottom requires one line.

**Fix:**
```tsx
// In the component return, change:
<View style={s.ctaContainer}>
// to:
<View style={[s.ctaContainer, { paddingBottom: Spacing.lg + insets.bottom }]}>
```

---

_Reviewed: 2026-06-15_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
