---
phase: 16-adapty-paywall-and-subscriptions
plan: "02"
subsystem: premium-state
tags: [context, navigation, adapty, paywall]
dependency_graph:
  requires: [16-01]
  provides: [PremiumContext, AIAdvisor route, Paywall route]
  affects: [DashboardScreen, PaywallScreen (16-04), any premium-gated screen]
tech_stack:
  added: []
  patterns: [React Context provider pattern, AppState listener cleanup, Adapty event listener]
key_files:
  created:
    - src/context/PremiumContext.tsx
    - src/screens/AIAdvisorScreen.tsx
  modified:
    - src/navigation/AppNavigator.tsx
decisions:
  - PremiumProvider default isPremium=false (T-16-02 threat mitigation — no user starts premium without Adapty confirmation)
  - No AsyncStorage persistence for isPremium (T-16-03 threat mitigation — app restart always calls getProfile() fresh)
  - Paywall Stack.Screen temporarily uses AIAdvisorScreen component until 16-04 creates PaywallScreen
  - isPremiumLoading guard defaults to true so gated UI does not flash unlocked content on cold start
metrics:
  duration: "~15 minutes"
  completed: "2026-06-12"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 16 Plan 02: PremiumContext + AppNavigator Routes + AIAdvisorScreen Stub Summary

**One-liner:** In-memory Adapty premium state provider with AppState refresh listener, two fullScreenModal routes in AppNavigator, and AIAdvisorScreen stub shell.

## What Was Built

### Task 1 — PremiumContext.tsx (new file)

Created `src/context/PremiumContext.tsx` — the first React Context in the project.

- `PremiumContextValue` interface: `isPremium: boolean`, `isPremiumLoading: boolean`, `refreshPremium: () => Promise<void>`
- `PremiumProvider` component manages three sync paths:
  1. Mount: `refreshPremium()` → `fetchPremiumStatus()` from `src/lib/adapty.ts`
  2. `adapty.addEventListener('onLatestProfileLoad', callback)` fires on every profile push (purchases, restores, server-side grants)
  3. `AppState.addEventListener('change', handler)` → `refreshPremium()` when state becomes `'active'`
- Both listeners cleaned up in `useEffect` return: `listener.remove(); sub.remove()`
- Context default: `isPremium: false`, `isPremiumLoading: true` (prevents locked-UI flash on cold start)
- Named exports: `PremiumProvider`, `usePremiumContext`

### Task 2a — AIAdvisorScreen.tsx (new file)

Minimal `fullScreenModal` stub at `src/screens/AIAdvisorScreen.tsx`:

- `LinearGradient colors={['#080D09', '#0C1410', '#0F1C14']}` background (matches LongevityScoreScreen pattern)
- `SafeAreaView` wraps all content
- `topBar` with back button (`nav.goBack()`), centered "AI ADVISOR" title, width-38 spacer
- No body content — Phase 18 fills the screen
- All colors from `Colors.dark.*`, spacing from `Spacing.*`, font sizes from `Typography.sizes.*`
- StyleSheet named `s` at bottom of file

### Task 2b — AppNavigator.tsx (modified)

- Added `import AIAdvisorScreen from '../screens/AIAdvisorScreen'`
- Comment placed for PaywallScreen import (added in 16-04)
- `RootStackParamList` extended:
  ```typescript
  Paywall: undefined;
  AIAdvisor: undefined;
  ```
- Two `Stack.Screen` entries added after `ExerciseDetail`:
  - `name="Paywall"`: `presentation: 'fullScreenModal'`, `animation: 'fade_from_bottom'` (component: AIAdvisorScreen temporarily)
  - `name="AIAdvisor"`: `presentation: 'fullScreenModal'`, `animation: 'fade_from_bottom'`

## Commits

| Hash | Message |
|------|---------|
| 972e5f6 | feat(16-02): create PremiumContext with isPremium, isPremiumLoading, refreshPremium |
| fc5a0c7 | feat(16-02): AIAdvisorScreen stub + Paywall/AIAdvisor routes in AppNavigator |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| File | Description |
|------|-------------|
| `src/screens/AIAdvisorScreen.tsx` | Intentional stub — no body content. Phase 18 fills AI advisor functionality. |
| `src/navigation/AppNavigator.tsx` | Paywall route uses AIAdvisorScreen as placeholder — Phase 16-04 replaces with PaywallScreen. |

Both stubs are explicitly intentional per plan D-04 and the 16-04 dependency.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced.

`PremiumContext` handles the two threat mitigations documented in the plan:
- **T-16-02 Tampering (isPremium default):** Default is `false` — verified in `createContext` default and `useState(false)`.
- **T-16-03 Tampering (AsyncStorage cache):** No `AsyncStorage` import or usage anywhere in `PremiumContext.tsx`.

## Self-Check: PASSED

- `src/context/PremiumContext.tsx` exists — FOUND
- `src/screens/AIAdvisorScreen.tsx` exists — FOUND
- `PremiumProvider` named export — FOUND
- `usePremiumContext` named export — FOUND
- `isPremiumLoading` field — FOUND
- `Paywall: undefined` in RootStackParamList — FOUND
- `AIAdvisor: undefined` in RootStackParamList — FOUND
- `fullScreenModal` presentation on both routes — FOUND
- Commits 972e5f6 and fc5a0c7 — FOUND
- `npx tsc --noEmit` — PASSED (exit 0, no errors)
