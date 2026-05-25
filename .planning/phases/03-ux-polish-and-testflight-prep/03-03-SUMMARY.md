---
phase: "03-ux-polish-and-testflight-prep"
plan: "03"
subsystem: "layout/navigation"
tags: ["safe-area", "keyboard-avoiding", "scroll-view", "tab-bar", "layout-polish"]
dependency_graph:
  requires: []
  provides: ["POLISH-01"]
  affects: ["src/navigation/AppNavigator.tsx", "src/screens/LandingScreen.tsx", "src/screens/OnboardingScreen.tsx"]
tech_stack:
  added: []
  patterns: ["useSafeAreaInsets", "KeyboardAvoidingView", "ScrollView with flexGrow"]
key_files:
  created: []
  modified:
    - src/navigation/AppNavigator.tsx
    - src/screens/LandingScreen.tsx
    - src/screens/OnboardingScreen.tsx
decisions:
  - "Tab bar height uses Math.max(insets.bottom,0)+56 to provide fixed 56px visible area plus safe area inset"
  - "LandingScreen footer stays outside ScrollView so it remains pinned at bottom while hero/features/CTA scroll"
  - "KeyboardAvoidingView applied to all 5 OnboardingScreen steps, not just steps with TextInput, for consistent pattern"
metrics:
  duration: "2 minutes"
  completed: "2026-05-25"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 03 Plan 03: Form-Factor Layout Fixes Summary

Three targeted, non-breaking layout fixes for POLISH-01: dynamic safe area insets for tab bar, ScrollView overflow protection for LandingScreen, and KeyboardAvoidingView for all OnboardingScreen steps.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Fix tab bar safe area inset in AppNavigator | 7afcdc3 | src/navigation/AppNavigator.tsx |
| 2 | Fix LandingScreen overflow and OnboardingScreen keyboard layout | e03d01c | src/screens/LandingScreen.tsx, src/screens/OnboardingScreen.tsx |

## What Was Built

**Task 1 — AppNavigator tab bar safe area:**
- Added `useSafeAreaInsets` import from `@react-navigation/native`
- Called `useSafeAreaInsets()` inside `MainTabs()` before the return
- Replaced `paddingBottom: 8` with `paddingBottom: Math.max(insets.bottom, 8)`
- Replaced `height: 72` with `height: Math.max(insets.bottom, 0) + 56`
- Result: tab bar height and padding adapt to device safe area on both iPhone 15 Pro and iPhone 16 Plus

**Task 2 — LandingScreen overflow:**
- Added `ScrollView` to react-native imports
- Replaced `<View style={s.inner}>` with `<ScrollView style={{ flex: 1 }} contentContainerStyle={s.inner}>`
- Changed `s.inner` from `flex: 1` to `flexGrow: 1` — centers content when it fits, scrolls when it overflows
- Footer pharmacist badge remains outside ScrollView as a direct child of SafeAreaView (pinned at bottom)

**Task 2 — OnboardingScreen keyboard avoiding:**
- Added `KeyboardAvoidingView` and `Platform` to react-native imports
- Wrapped all 5 step return bodies (step 0–4) in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>` inside SafeAreaView
- CTA buttons now remain visible above keyboard on all steps including step 0 (autoFocus name input) and step 4 (MedicationSearch)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — these are layout-only changes with no data dependencies.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes introduced.

## Verification

TypeScript: `npx tsc --noEmit` exits 0 (verified after each task commit).

Acceptance criteria met:
- `useSafeAreaInsets` appears 2 times in AppNavigator.tsx (import + usage)
- No hardcoded `paddingBottom: 8` remains in AppNavigator.tsx
- `insets.bottom` appears 2 times in AppNavigator.tsx (paddingBottom + height)
- `ScrollView` appears 3 times in LandingScreen.tsx (import + JSX open + JSX close)
- `flexGrow: 1` present in LandingScreen.tsx s.inner
- No `flex: 1` in LandingScreen.tsx s.inner
- `KeyboardAvoidingView` appears 11 times in OnboardingScreen.tsx (1 import + 5 open + 5 close)
- `Platform.OS` appears 5 times in OnboardingScreen.tsx (one per step)
- Platform import appears exactly 1 time (not duplicated)

## Self-Check: PASSED

Files exist:
- src/navigation/AppNavigator.tsx: FOUND
- src/screens/LandingScreen.tsx: FOUND
- src/screens/OnboardingScreen.tsx: FOUND

Commits exist:
- 7afcdc3: FOUND (fix(03-03): tab bar paddingBottom/height adapts to device safe area)
- e03d01c: FOUND (fix(03-03): LandingScreen ScrollView overflow + OnboardingScreen KeyboardAvoidingView)
