---
phase: 14-auth-and-login
fixed_at: 2026-06-10
review_path: .planning/phases/14-auth-and-login/14-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 4
skipped: 2
status: partial
---

# Phase 14: Code Review Fix Report

**Fixed at:** 2026-06-10
**Source review:** .planning/phases/14-auth-and-login/14-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope (High + Medium + Low): 8 (H1 skipped per instructions, M2 skipped per instructions, 6 in scope)
- Fixed: 4
- Skipped: 2 (per explicit skip instructions)

## Fixed Issues

### H2: Non-anonymous users without completed onboarding routed to Main

**Files modified:** `App.tsx`, `src/navigation/AppNavigator.tsx`
**Commit:** 018c39d
**Applied fix:** After the `!user.is_anonymous` check in `App.tsx` init(), reads `@vitalspan_user_profile` from AsyncStorage and routes to `'Onboarding'` if `onboardingComplete` is false/null, otherwise `'Main'`. Updated `AppNavigator.tsx` Props interface to accept `'Onboarding'` as a valid `initialRoute` value (was only `'Welcome' | 'Main'`). State type in App.tsx updated to match.

---

### M1: `setLoading(false)` not called on sign-up success path

**Files modified:** `src/screens/WelcomeScreen.tsx`
**Commit:** 844c8cc
**Applied fix:** Added `setLoading(false)` on the success path in `handleSignUp`, immediately before `closeSheet()`. This prevents the "Create Account" button from being permanently stuck in spinner/disabled state if the user navigates back from SignUpConfirmation.

---

### M3: `supabase.auth.getUser()` called twice in one `loadData()` invocation

**Files modified:** `src/screens/DashboardScreen.tsx`
**Commit:** be07eb6
**Applied fix:** Hoisted a single `getUser()` call into a dedicated try/catch block before the biomarker fetch, storing the result in `currentUser`. Both the biomarker block (previously line 68) and the verification banner block (previously line 106) now reference `currentUser` directly, eliminating the second network round-trip and ensuring consistent user state across both branches within a single `loadData()` invocation.

---

### L1: Email not forwarded to ForgotPassword navigation

**Files modified:** `src/screens/WelcomeScreen.tsx`
**Commit:** b2504f4
**Applied fix:** Changed `nav.navigate('ForgotPassword', {})` to `nav.navigate('ForgotPassword', { email })` in the login sheet's "Forgot password?" footer. The `email` state value typed in the login form is now pre-filled on the reset screen.

---

## Skipped Issues

### H1: `updateUser` does not clear `is_anonymous` until email is confirmed

**File:** `src/lib/supabase.ts:187`
**Reason:** Skipped per instructions — architectural change requiring a persistent `@vitalspan_signup_pending` flag and new cold-start routing branch. Requires separate task.
**Original issue:** `convertAnonymousToEmail` calls `updateUser` which requires email confirmation before `is_anonymous` clears. Cold-start routes anonymous user back to Welcome with no indication to check email.

---

### M2: Dual migration guards can both fire concurrently on first launch

**File:** `src/screens/WelcomeScreen.tsx:66`
**Reason:** Skipped per instructions — requires deciding on a unified guard key strategy across App.tsx and WelcomeScreen. Requires separate task.
**Original issue:** `@vitalspan_migrated_v2` (App.tsx) and `@vitalspan_identity_linked` (WelcomeScreen) are both null on fresh device; concurrent migration calls may insert duplicate biomarker rows.

---

_Fixed: 2026-06-10_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
