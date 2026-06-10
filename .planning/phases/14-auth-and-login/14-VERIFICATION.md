---
phase: 14-auth-and-login
verified: 2026-06-10T00:00:00Z
status: human_needed
score: 16/18 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Anonymous-to-email conversion cold-start routing (H1)"
    expected: "After a user calls convertAnonymousToEmail, closes the app, and cold-starts before clicking the email confirmation link, the app should show SignUpConfirmation or a 'check your inbox' screen — not send them back to Welcome with no explanation"
    why_human: "Requires a live Supabase project, a real device, and a staged test account in the pending-email-confirm state. The routing bug is confirmed by code inspection (is_anonymous stays true until link clicked; App.tsx routes to Welcome on is_anonymous=true) but the exact UX failure can only be confirmed at runtime."
  - test: "Non-anonymous user without onboarding routes to Main (H2)"
    expected: "A user who signs up via email, confirms their address, then cold-starts before completing onboarding should land on Onboarding — not Dashboard with an empty profile"
    why_human: "Requires a real account with confirmed email but no onboardingComplete flag. App.tsx:23 is confirmed in code to skip the onboardingComplete check for non-anonymous users."
  - test: "Loading spinner stuck after successful sign-up (M1)"
    expected: "After handleSignUp succeeds and navigates to SignUpConfirmation, pressing Back on iOS should show WelcomeScreen with a responsive 'Sign Up' button — not a permanently spinning submit button"
    why_human: "Requires device interaction. Code confirms setLoading(false) is absent on the success path (WelcomeScreen.tsx:78), but behavioural visibility requires navigation back from SignUpConfirmation."
  - test: "Verification banner appears and is dismissable (D-12)"
    expected: "For an authenticated non-anonymous user with no email_confirmed_at, the amber banner 'Please verify your email — check your inbox.' appears at the top of Dashboard; Resend sends the email; X hides the banner for the session"
    why_human: "Requires a live Supabase account in the unverified state and a device running the app."
  - test: "Verified toast appears once and AsyncStorage flag prevents replay (D-14)"
    expected: "After email confirmation, the next Dashboard load shows the 'Account verified!' green toast for ~3 seconds; subsequent reloads do not show the toast"
    why_human: "Requires a live Supabase account transition from unverified to verified; AsyncStorage flag logic is verified in code but the timing depends on Supabase JWT propagation."
  - test: "Guest card visible on ProfileScreen for anonymous users"
    expected: "A user who opened the app without signing up sees 'Your data is stored locally' card with 'Create Account' CTA at the top of the Profile tab"
    why_human: "Requires the Supabase anonymous sign-in to succeed; is_anonymous state loading verified in code but visual rendering needs device confirmation."
  - test: "Logout returns to Welcome with local data intact"
    expected: "Tapping 'Log Out' on ProfileScreen clears the Supabase session, navigates to WelcomeScreen, and all previously entered biomarkers/protocol data are accessible again after tapping 'Continue as guest'"
    why_human: "End-to-end session lifecycle with AsyncStorage data preservation requires a device with real session and logged data."
gaps:
  - truth: "AUTH-02 requirement specifies linkIdentity() but implementation uses updateUser()"
    status: partial
    reason: "REQUIREMENTS.md AUTH-02 says 'links it to the existing anonymous session via linkIdentity()'. Implementation uses supabase.auth.updateUser() per D-16 (documented design decision that linkIdentity is OAuth-only). The requirement text is stale — the implementation achieves the same outcome (data preserved, session promoted) via the correct API. This is a requirements-doc deviation, not a functional gap."
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "Line 49: 'links it to the existing anonymous session via linkIdentity()' — linkIdentity is OAuth-only; updateUser is the correct Supabase method for anonymous→email promotion"
    missing:
      - "Update REQUIREMENTS.md AUTH-02 description to reference updateUser instead of linkIdentity(), to match the D-16 design decision documented in 14-CONTEXT.md"
  - truth: "Cold-start routing skips onboardingComplete for non-anonymous users (H2 — CONFIRMED BUG)"
    status: failed
    reason: "App.tsx:23 routes non-anonymous users directly to Main without checking onboardingComplete. A fresh email signup user who confirms their email but hasn't completed onboarding will land on Dashboard with an empty profile. The onboardingComplete check exists only in WelcomeScreen handleLogin (line 94), not in App.tsx cold-start routing."
    artifacts:
      - path: "App.tsx"
        issue: "Lines 22-27: `if (user && !user.is_anonymous) { setInitialRoute('Main'); }` — no onboardingComplete check for non-anonymous users on cold start"
    missing:
      - "In App.tsx init(), after confirming user && !user.is_anonymous, also read @vitalspan_user_profile from AsyncStorage and check onboardingComplete — if false/null, setInitialRoute('Onboarding') instead of 'Main'"
---

# Phase 14: Auth & Login Verification Report

**Phase Goal:** Unauthenticated users are greeted by a Welcome screen and can sign up, log in, or continue as guest; authenticated users have session persistence, email verification, and their data linked to their Supabase user_id with anonymous data migrated on account creation.

**Verified:** 2026-06-10
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Unauthenticated users land on WelcomeScreen with Sign Up, Log In, Continue as guest CTAs | VERIFIED | WelcomeScreen.tsx:135-144; AppNavigator.tsx routes Welcome as initialRoute for anonymous/no-session users |
| 2 | Anonymous or missing session routes to Welcome on launch | VERIFIED | App.tsx:25-26: `else { setInitialRoute('Welcome'); }`; initSupabaseSession() awaited first |
| 3 | Non-anonymous authenticated user routes to Main on launch | PARTIAL | App.tsx:22-24 routes `!user.is_anonymous` → Main, but skips onboardingComplete check (H2 — confirmed bug) |
| 4 | Sign Up bottom sheet slides up from WelcomeScreen over the NeuralGrid background | VERIFIED | WelcomeScreen.tsx:44-48 (openSheet), 155 (Animated.View with sheetAnim); NeuralGrid rendered at :120 |
| 5 | Log In bottom sheet slides up from WelcomeScreen over the NeuralGrid background | VERIFIED | Same animation mechanism; loginFields useMemo at :113-116; sheet='login' branch |
| 6 | Auth form errors display mapped messages via mapAuthError | VERIFIED | SheetForm.tsx:29 renders error prop; WelcomeScreen calls mapAuthError in catch blocks; supabase.ts mapAuthError implements all D-15 categories |
| 7 | Successful sign-up navigates to SignUpConfirmation with email address | VERIFIED | WelcomeScreen.tsx:78-79: `closeSheet(); nav.navigate('SignUpConfirmation', { email })` |
| 8 | Successful login routes to Main (onboardingComplete=true) or Onboarding (false) | VERIFIED | WelcomeScreen.tsx:92-94: reads @vitalspan_user_profile and checks profile.onboardingComplete |
| 9 | Continue as guest routes based on onboardingComplete | VERIFIED | WelcomeScreen.tsx:101-104: handleGuest reads onboardingComplete, nav.reset to Main or Onboarding |
| 10 | Logout calls signOutUser(), navigates to Welcome without wiping AsyncStorage | VERIFIED | ProfileScreen.tsx:85-93: handleLogout calls signOutUser(), nav.reset to Welcome; no AsyncStorage.clear or multiRemove in this function |
| 11 | Session persists across app restarts; anonymous sign-in on first launch | VERIFIED | supabase.ts:72-86: initSupabaseSession checks for existing session before calling signInAnonymously(); App.tsx awaits this |
| 12 | convertAnonymousToEmail uses updateUser (not linkIdentity) | VERIFIED | supabase.ts:187: `supabase.auth.updateUser({ email, password })`; linkIdentity appears only in JSDoc comment (:173) |
| 13 | @vitalspan_identity_linked idempotency flag guards migrateHistory | VERIFIED | WelcomeScreen.tsx:66-71: checks linked !== 'true' before calling migrateHistory, then sets flag to 'true' |
| 14 | ForgotPasswordScreen two-state render calls sendPasswordResetEmail | VERIFIED | ForgotPasswordScreen.tsx:24-41; submitted state gates form vs. success render |
| 15 | SignUpConfirmationScreen displays route.params.email with Open Mail App CTA | VERIFIED | SignUpConfirmationScreen.tsx:21, 49-50; Linking.openURL('message://').catch(() => Linking.openURL('mailto:')) at :34 |
| 16 | ProfileScreen guest card visible for anonymous users; logout for authenticated users | VERIFIED | ProfileScreen.tsx:279-291 (guest card, isAnonymous===true); 385-389 (logout, isAnonymous===false) |
| 17 | DashboardScreen amber verification banner with resend + dismiss | VERIFIED | DashboardScreen.tsx:255-269; showVerificationBanner && !bannerDismissed guard; handleResend at :141-145 |
| 18 | One-time 'Account verified!' toast with @vitalspan_email_verified_notified flag | VERIFIED | DashboardScreen.tsx:113-121; AsyncStorage.setItem('@vitalspan_email_verified_notified', 'true') before setShowVerifiedToast |

**Score: 16/18 truths verified** (1 partial — H2 cold-start routing bug; 1 requirements-doc deviation — AUTH-02 linkIdentity vs updateUser)

---

### Deferred Items

No items are explicitly deferred to a later milestone phase. Protocol and exercise log Supabase sync is noted as out-of-scope for Phase 14 (AUTH-07 biomarker-only scope per 14-05-PLAN.md), which is the stated design decision, not a gap.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/navigation/AppNavigator.tsx` | Welcome route, no Landing, SignUpConfirmation + ForgotPassword routes, typed initialRoute | VERIFIED | Welcome, ForgotPassword, SignUpConfirmation all present; no Landing anywhere; initialRoute: 'Welcome' \| 'Main' |
| `App.tsx` | initSupabaseSession awaited, is_anonymous routing, no Landing refs | VERIFIED | Lines 21-27 match exactly; no Landing string anywhere |
| `src/lib/supabase.ts` | 7 auth exports + polyfill on line 1 | VERIFIED | All 7 exports confirmed; line 1 is `import 'react-native-url-polyfill/auto'` |
| `src/screens/WelcomeScreen.tsx` | Dark NeuralGrid hero, 3 CTAs, bottom sheet forms, under 200 lines | VERIFIED | 199 lines; NeuralGrid intensity="medium" tone="vital"; all 3 CTAs present |
| `src/components/auth/SheetForm.tsx` | SheetFormField + SheetFormProps interfaces, field rendering, error, loading | VERIFIED | 47 lines; both interfaces exported; field map, error, footerSlot, ActivityIndicator all present |
| `src/screens/ForgotPasswordScreen.tsx` | Two-state form/success, sendPasswordResetEmail, no hardcoded hex | VERIFIED | submitted state + success branch; sendPasswordResetEmail imported and used; all colors from theme |
| `src/screens/SignUpConfirmationScreen.tsx` | email from route params, Open Mail App, Continue routing | VERIFIED | useRoute params at :21; Linking.openURL at :34; handleContinue reads onboardingComplete |
| `src/screens/ProfileScreen.tsx` | isAnonymous state, guest card, logout button, signOutUser | VERIFIED | isAnonymous: boolean\|null at :50; guest card at :279; logout at :385; signOutUser imported at :16 |
| `src/screens/DashboardScreen.tsx` | email_confirmed_at check, banner, toast, @vitalspan_email_verified_notified | VERIFIED | All four present at lines 109, 255-269, 272-276, 115-118 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| App.tsx | src/lib/supabase.ts | `await initSupabaseSession()` + `supabase.auth.getUser()` | WIRED | App.tsx:7, 21-22 |
| App.tsx | src/navigation/AppNavigator.tsx | initialRoute prop 'Welcome'\|'Main' | WIRED | App.tsx:59; AppNavigator Props interface |
| WelcomeScreen.tsx | src/lib/supabase.ts | signUpWithEmail, signInWithEmail, convertAnonymousToEmail, mapAuthError, supabase | WIRED | WelcomeScreen.tsx:13; all 5 symbols used |
| WelcomeScreen.tsx | src/components/auth/SheetForm.tsx | SheetForm, SheetFormField | WIRED | WelcomeScreen.tsx:12, 159 |
| WelcomeScreen.tsx | src/components/NeuralGrid.tsx | NeuralGrid intensity="medium" tone="vital" | WIRED | WelcomeScreen.tsx:11, 120 |
| WelcomeScreen.tsx | src/navigation/AppNavigator.tsx | nav.navigate('SignUpConfirmation'), nav.navigate('ForgotPassword') | WIRED | WelcomeScreen.tsx:79, 165 |
| ForgotPasswordScreen.tsx | src/lib/supabase.ts | sendPasswordResetEmail | WIRED | ForgotPasswordScreen.tsx:13, 33 |
| ProfileScreen.tsx | src/lib/supabase.ts | signOutUser, supabase | WIRED | ProfileScreen.tsx:16, 65, 86 |
| DashboardScreen.tsx | src/lib/supabase.ts | resendVerificationEmail, supabase.auth.getUser() | WIRED | DashboardScreen.tsx:11, 106, 141-144 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| DashboardScreen.tsx | showVerificationBanner | `supabase.auth.getUser()` → `user.email_confirmed_at` | Yes — reads from Supabase server-validated JWT | FLOWING |
| DashboardScreen.tsx | showVerifiedToast | AsyncStorage `@vitalspan_email_verified_notified` + `email_confirmed_at` | Yes — one-time flag with real Supabase state | FLOWING |
| ProfileScreen.tsx | isAnonymous | `supabase.auth.getUser()` → `user.is_anonymous` | Yes — server-validated JWT claim | FLOWING |
| WelcomeScreen.tsx | metricValue | Animated.loop useEffect | Animated value only — no API call; visual preview only (by design, D-02) | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — no runnable entry point without a Supabase project configured. The app requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars and a native Expo build. All checks deferred to human verification on device.

---

### Probe Execution

Step 7c: No probes defined for this phase. Phase is a UI/auth phase with no probe scripts.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| AUTH-01 | 14-01, 14-03 | WelcomeScreen with Sign Up, Log In, Continue as guest | SATISFIED | WelcomeScreen.tsx:135-144; AppNavigator.tsx routes Welcome |
| AUTH-02 | 14-02, 14-03 | Sign up creates account, links to anonymous session (doc says linkIdentity, impl uses updateUser) | PARTIAL | WelcomeScreen.tsx handleSignUp; supabase.ts convertAnonymousToEmail uses updateUser per D-16. Functional outcome identical but REQUIREMENTS.md text is stale — requires doc update |
| AUTH-03 | 14-02, 14-03 | Login restores account; biomarker history synced from Supabase | SATISFIED | WelcomeScreen.tsx handleLogin; DashboardScreen.tsx pulls from biomarker_entries table on load |
| AUTH-04 | 14-02, 14-04 | Forgot password sends reset email; confirmation screen shown | SATISFIED | ForgotPasswordScreen.tsx two-state render; sendPasswordResetEmail wired |
| AUTH-05 | 14-04, 14-05 | Email verification UX; banner + verified state | SATISFIED | SignUpConfirmationScreen.tsx; DashboardScreen.tsx banner + toast |
| AUTH-06 | 14-01, 14-02 | Session persists; token refresh automatic; no unexpected logout | SATISFIED | initSupabaseSession() awaited; supabase client autoRefreshToken:true; AppState listener starts/stops refresh |
| AUTH-07 | 14-03, 14-05 | Biomarker data linked to user_id after sign-up migration | SATISFIED (biomarkers only) | migrateHistory() upserts rows with user_id from supabase.auth.getUser(); @vitalspan_identity_linked idempotency guard. Protocol/exercise sync explicitly deferred per plan scope. |
| AUTH-08 | 14-01, 14-05 | Logout clears session, returns to Welcome; AsyncStorage preserved | SATISFIED | signOutUser() has zero AsyncStorage calls; ProfileScreen handleLogout nav.reset to Welcome only |
| AUTH-09 | 14-02, 14-03+ | Auth errors surface actionable messages | SATISFIED | mapAuthError implements 5 D-15 categories; called in all screen error handlers |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/screens/WelcomeScreen.tsx | 78 | `setLoading(false)` absent on sign-up success path before `closeSheet()` | Warning | If user navigates back from SignUpConfirmation, loading spinner is stuck — submit button permanently disabled (M1 from 14-REVIEW.md) |
| src/screens/WelcomeScreen.tsx | 165 | `nav.navigate('ForgotPassword', {})` does not forward the typed email | Warning | User must retype email on ForgotPasswordScreen; email state is available (L1 from 14-REVIEW.md) |
| App.tsx | 22-27 | Non-anonymous routing skips onboardingComplete check | BLOCKER (for non-anonymous fresh accounts) | Fresh signup users who confirm email but haven't completed onboarding land on empty Dashboard (H2 from 14-REVIEW.md) |
| src/screens/DashboardScreen.tsx | 68, 106 | supabase.auth.getUser() called twice per loadData() | Warning | Double network round-trip per focus event; banner state can be stale if second call fails (M3 from 14-REVIEW.md) |

No `TBD`, `FIXME`, or `XXX` debt markers were found in any phase-14-modified file.

---

### Human Verification Required

The following items require device testing with a live Supabase project.

#### 1. Anonymous-to-Email Cold Start Routing (HIGH — confirmed code bug H1)

**Test:** On a device with a Supabase project configured: (a) launch app, skip onboarding, reach the anonymous state; (b) open WelcomeScreen, tap Sign Up, create an account; (c) dismiss SignUpConfirmation WITHOUT clicking the email link; (d) force-quit and cold-start the app.

**Expected:** App should show SignUpConfirmation or a "check your inbox" screen. Currently the code will route to Welcome (is_anonymous is still true until email confirmed), with no indication the user has a pending account. The user has no path forward except to re-sign-up (which may be rejected as duplicate email).

**Why human:** Requires live Supabase anonymous sign-in + email confirmation flow on a real device. Code path is confirmed: App.tsx:23 checks `!user.is_anonymous` — false for pending email confirm → routes to Welcome.

#### 2. Non-Anonymous User Without Onboarding Routes to Main (HIGH — confirmed code bug H2)

**Test:** Create a Supabase account via `signUpWithEmail` (not anonymous conversion), confirm the email link, then cold-start the app before completing onboarding.

**Expected:** App should route to Onboarding, not Dashboard. Currently App.tsx:22-27 routes any `!user.is_anonymous` user to Main with no onboardingComplete check.

**Why human:** Requires an email-confirmed non-anonymous Supabase account and a fresh device session without onboarding data.

#### 3. Stuck Loading Spinner After Sign-Up (MEDIUM — confirmed code gap M1)

**Test:** Complete the sign-up flow (WelcomeScreen → SignUpConfirmation), then press the iOS back gesture or system back to return to WelcomeScreen. Tap "Sign Up" again to open the form.

**Expected:** Submit button should be interactive with label "Create Account". Currently loading is never reset on success path, so the spinner shows permanently after a back-navigate.

**Why human:** Requires device navigation interaction; code confirms setLoading(false) is absent at WelcomeScreen.tsx:77-79.

#### 4. Email Verification Banner — Appearance and Resend (AUTH-05)

**Test:** Sign in with an authenticated Supabase account where email is not yet verified. Navigate to Dashboard tab.

**Expected:** Amber banner "Please verify your email — check your inbox." appears below the neural grid and above the scrollable content. Tapping "Resend" sends a new verification email. Tapping "X" dismisses the banner for the session (banner reappears on next app launch until verified).

**Why human:** Requires a Supabase account in unverified state and device runtime.

#### 5. Verified Toast One-Time Display (D-14)

**Test:** Starting from an unverified state, click the Supabase confirmation link to verify the email. Return to the app and navigate to Dashboard.

**Expected:** "Account verified!" green toast appears for ~3 seconds. Navigating away and back should not show the toast again (flag persists in AsyncStorage).

**Why human:** Requires live Supabase verification link click and JWT propagation timing.

#### 6. Guest Mode Card and Create Account CTA (D-10)

**Test:** Open app fresh (without signing in) and navigate to Profile tab.

**Expected:** "Your data is stored locally" card with three benefit bullets and "Create Account" button appears at the top of the Profile scroll. Tapping "Create Account" navigates to WelcomeScreen via stack reset.

**Why human:** Requires anonymous Supabase session (device + live project).

#### 7. Logout Preserves AsyncStorage Data (AUTH-08)

**Test:** As a logged-in user with biomarker entries, tap "Log Out" on ProfileScreen. After returning to WelcomeScreen, tap "Continue as guest".

**Expected:** Dashboard shows previously entered biomarker data (from local AsyncStorage fallback). No data loss occurs from logout.

**Why human:** Requires real session, logged data, and end-to-end logout + guest mode re-entry.

---

### Gaps Summary

**2 actionable gaps identified:**

**GAP 1 — AUTH-02 requirement text is stale (doc-only, not a code bug):**
REQUIREMENTS.md AUTH-02 references `linkIdentity()`. The implementation correctly uses `supabase.auth.updateUser()` per D-16 (linkIdentity is OAuth-only; updateUser is the Supabase-approved method for anonymous→email promotion). The functional behavior is correct. The doc needs updating.

**GAP 2 — H2 confirmed code bug in App.tsx cold-start routing:**
Non-anonymous users without completed onboarding are routed to Main, not Onboarding. This is a confirmed code bug (not a plausible scenario — it is the exact code path for any user who confirms their email before finishing onboarding). Fix: add `@vitalspan_user_profile.onboardingComplete` check inside the `user && !user.is_anonymous` branch in App.tsx:init().

**Note on H1 (pending email confirm cold-start):** H1 is a real UX problem but depends on Supabase's email-confirm timing for `is_anonymous` to clear. The code path is confirmed as broken; fixing it requires persisting a `@vitalspan_signup_pending` flag in WelcomeScreen after navigating to SignUpConfirmation, then checking it in App.tsx.

**The 7 human verification items are the primary gate.** Once device testing confirms the UX flows work (minus the two code gaps above which are pre-confirmed bugs), the phase goal is substantively achieved for the happy paths.

---

_Verified: 2026-06-10_
_Verifier: Claude (gsd-verifier)_
