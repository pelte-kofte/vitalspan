---
phase: 14-auth-and-login
plan: "05"
subsystem: auth-ux
tags: [auth, profile, dashboard, guest-mode, email-verification, toast]
dependency_graph:
  requires: [14-02, 14-03]
  provides: [guest-mode-card, logout-button, email-verification-banner, verified-toast]
  affects: [src/screens/ProfileScreen.tsx, src/screens/DashboardScreen.tsx]
tech_stack:
  added: []
  patterns: [supabase.auth.getUser-for-auth-state, AsyncStorage-one-time-flag-pattern, nav-reset-for-auth-transitions]
key_files:
  modified:
    - src/screens/ProfileScreen.tsx
    - src/screens/DashboardScreen.tsx
decisions:
  - nav.reset via unknown cast for composite nav type — CompositeNavigationProp<BottomTab, NativeStack> needs double cast (as unknown as NativeStackNavigationProp) for reset calls to RootStack routes
  - Verification banner placed outside ScrollView (between NeuralGrid and ScrollView) so it stays fixed at top, not scrollable
  - Guest CTA uses nav.reset (not nav.navigate) to cleanly replace stack history when going to Welcome
metrics:
  duration: 25m
  completed: "2026-06-09T20:10:03Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 14 Plan 05: Auth UX — Guest Card, Logout, Email Verification Banner Summary

Auth-state-aware UI added to ProfileScreen (guest mode card + logout button) and DashboardScreen (amber email verification banner + one-time verified toast). App.tsx confirmed clean of Landing references.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add guest mode card + logout to ProfileScreen | 9b3c4a4 | src/screens/ProfileScreen.tsx |
| 2 | Add email verification banner + verified toast to DashboardScreen + clean App.tsx | 94eafed | src/screens/DashboardScreen.tsx |

## What Was Built

### Task 1 — ProfileScreen guest mode card and logout

- Added `import { signOutUser, supabase } from '../lib/supabase'`
- Added `isAnonymous: boolean | null` state, populated from `supabase.auth.getUser()` inside `loadProfile()`
- Guest card renders when `isAnonymous === true` (strict equality — avoids null-truthy mismatch per TypeScript strict):
  - Headline: "Your data is stored locally"
  - Benefit list: sync across devices, cloud backup, new device access
  - "Create Account" CTA → `nav.reset({ index: 0, routes: [{ name: 'Welcome' }] })`
- `handleLogout()`: calls `signOutUser()`, resets stack to Welcome on success; shows `Alert` on error; does NOT touch AsyncStorage (D-08)
- Logout button renders when `isAnonymous === false`, below the About card
- Styled using `Colors.warningBg`, `Colors.brand`, `Colors.surface`, `Colors.semantic.danger` — zero hardcoded hex values

### Task 2 — DashboardScreen email verification banner and toast

- Added `import { resendVerificationEmail }` alongside existing `supabase` import
- New state: `bannerDismissed`, `showVerificationBanner`, `showVerifiedToast`, `userEmail`
- `loadData()` extension: after all data loads, calls `supabase.auth.getUser()` in a separate try/catch (non-blocking):
  - Non-anonymous user with `email` but no `email_confirmed_at` → `setShowVerificationBanner(true)`
  - Non-anonymous user with `email_confirmed_at` set and `@vitalspan_email_verified_notified` not in AsyncStorage → sets flag, shows toast for 3s
- Amber banner: text "Please verify your email — check your inbox.", Resend touchable, X dismiss touchable
- Resend calls `resendVerificationEmail(userEmail)` with haptic feedback
- Verified toast: absolutely positioned, green (`Colors.semantic.success`), auto-dismisses after 3s
- App.tsx: confirmed zero Landing references (already removed in Plan 14-01)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CompositeNavigationProp type incompatibility for nav.reset**
- **Found during:** Task 1
- **Issue:** `Nav = CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList>, NativeStackNavigationProp<RootStackParamList>>` resolves `nav.reset` against `MainTabParamList` first, rejecting `'Welcome'` as a valid route name. Direct cast to `NativeStackNavigationProp` fails with TS2352 due to `setParams` incompatibility.
- **Fix:** Used double cast `(nav as unknown as NativeStackNavigationProp<RootStackParamList>).reset(...)` for both `handleLogout` and guest card CTA. Both callers navigate to Welcome with a clean stack reset.
- **Files modified:** src/screens/ProfileScreen.tsx
- **Commit:** 9b3c4a4

## Known Stubs

None — all guest card and banner data is sourced from `supabase.auth.getUser()` at runtime. No hardcoded placeholder values flow to UI rendering.

## Threat Flags

No new trust boundaries or network surfaces beyond what the plan's threat model covers:
- `is_anonymous` and `email_confirmed_at` read from server-validated `supabase.auth.getUser()` (T-14-14, T-14-15 mitigated)
- `signOutUser()` clears JWT; navigation to Welcome enforced via nav.reset (T-14-16 mitigated)
- `@vitalspan_email_verified_notified` is a UI-only AsyncStorage flag with no security implication (T-14-17 accepted)

## AUTH-07 Scope Confirmation

Per plan scope: `migrateHistory()` (biomarker_entries sync under authenticated user_id) was triggered in WelcomeScreen (Plan 14-03) guarded by `@vitalspan_identity_linked`. This plan does not re-trigger migration. Protocol and exercise log Supabase sync deferred beyond Phase 14.

## Self-Check: PASSED

- `src/screens/ProfileScreen.tsx` — exists, has `is_anonymous`, `signOutUser`, guest card, logout button
- `src/screens/DashboardScreen.tsx` — exists, has `email_confirmed_at`, `@vitalspan_email_verified_notified`, banner, toast
- Commit 9b3c4a4 — confirmed in git log
- Commit 94eafed — confirmed in git log
- `npx tsc --noEmit` — zero errors
