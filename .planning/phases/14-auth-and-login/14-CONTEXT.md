# Phase 14: Auth & Login - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Three connected workstreams:

1. **WelcomeScreen** — A new dark neural full-screen entry point (replacing LandingScreen) shown to unauthenticated users. Displays animated longevity metric preview, logo, tagline, and three CTAs: Sign Up, Log In, Continue as guest. Auth forms (Sign Up / Login) slide up as bottom sheets over the dark background.

2. **Auth flows** — Sign Up (email + password + `linkIdentity()` migration), Login (email + password), Forgot Password (reset email flow), and an email verification confirmation screen. All errors surface as specific messages per AUTH-09.

3. **Auth state management** — `App.tsx` routing updated to check Supabase session type (anonymous vs. authenticated). Guest mode surfaced explicitly in ProfileScreen with a 'Sign up to sync' card. Email verification reminder banner on Dashboard until verified.

The existing `LandingScreen` is retired. `OnboardingScreen` is preserved for first-time users (both guest and sign-up paths). Session persistence is already handled by `supabase.ts` — Phase 14 builds auth screens on top of the existing foundation.

</domain>

<decisions>
## Implementation Decisions

### Welcome Screen Visual Direction

- **D-01:** **Full-screen dark NeuralGrid hero** — WelcomeScreen uses the same immersive dark neural aesthetic as LandingScreen (NeuralGrid background, dark backdrop, light text). No hybrid layout; the entire screen is the dark brand moment.

- **D-02:** **Hero content:** Vitalspan logo + longevity tagline + **animated longevity metric preview** — subtle animated biomarker numbers or orbital indicator animation behind the CTAs, hinting at what the app does. Same NeuralGrid `intensity` and `tone` props available.

- **D-03:** **Three CTAs visible directly on the dark background:** "Sign Up", "Log In", "Continue as guest". No intermediate "Get Started" tap — choices are immediate.

- **D-04:** **Auth forms as bottom sheets** — tapping Sign Up or Log In slides a form sheet up from the bottom. The dark NeuralGrid background remains visible behind the sheet. No navigation push to separate screens; the form is a modal layer over WelcomeScreen.

### Navigation Architecture

- **D-05:** **WelcomeScreen replaces LandingScreen** as the new app entry point. `LandingScreen` is retired. `RootStackParamList` gains a `Welcome` route; `Landing` is removed. `AppNavigator` receives `initialRoute: 'Welcome' | 'Main'`.

- **D-06:** **Routing condition uses Supabase session type.** `App.tsx` `init()` calls `supabase.auth.getUser()` after `initSupabaseSession()`. If the user has a real email/password account (non-anonymous) → `initialRoute = 'Main'`. If anonymous session or no session → `initialRoute = 'Welcome'`. This replaces the sole reliance on `@vitalspan_user_profile.onboardingComplete` for first-launch routing (though onboarding check still governs Welcome → Onboarding → Main within guest flow).

- **D-07:** **Post-signup navigation is context-aware:**
  - Fresh install sign-up (no `@vitalspan_user_profile` or `onboardingComplete` is false) → Onboarding → Main
  - Prior guest usage (onboardingComplete is true) → Main directly, skipping onboarding

- **D-08:** **Logout preserves local data.** `signOut()` clears the Supabase session and navigates to WelcomeScreen. AsyncStorage is NOT wiped. Tapping "Continue as guest" after logout shows existing local data. No "Keep or clear data?" prompt.

### Guest Mode Scope

- **D-09:** **No feature restrictions in guest mode.** All app features (biomarker tracking, protocol, exercise, longevity score, articles) work fully for guest users. The only difference is data is not synced to the cloud or accessible on other devices.

- **D-10:** **ProfileScreen shows a 'Sign up to sync' card in guest mode.** The card includes:
  - Headline: "Your data is stored locally"
  - Benefit list: sync across devices, cloud backup, new device access
  - Single CTA: "Create Account" → navigates to WelcomeScreen (Sign Up bottom sheet)
  - The card is visible at the top of ProfileScreen's account section whenever `supabase.auth.getUser()` returns an anonymous session.

- **D-11:** **"Continue as guest" routing:** checks `@vitalspan_user_profile.onboardingComplete`. True → Main directly. False (first-time guest) → Onboarding → Main.

### Email Verification UX

- **D-12:** **Verification reminder banner on Dashboard only.** Amber/yellow dismissable banner immediately below the Dashboard header. Text: "Please verify your email — check your inbox." Includes a "Resend" action. Visible on every app open until `supabase.auth.getUser()` confirms `email_confirmed_at` is set. Banner is dismissed per-session (not permanently) until verified.

- **D-13:** **Post-signup confirmation screen.** After successful sign-up, navigate to a `SignUpConfirmationScreen` (or inline state in the bottom sheet) showing: "We sent a verification email to [address]. Check your inbox, then come back." with an "Open Mail App" CTA. After tapping (or after a short delay), navigate to Main. This screen is shown before the Dashboard verification banner.

- **D-14:** **Verification completion UX:** when user returns to the app after clicking the email link and `email_confirmed_at` is set:
  - Dashboard verification banner disappears
  - A one-time `'Account verified!'` success toast/snackbar is shown (stored in a `@vitalspan_email_verified_notified` AsyncStorage flag to prevent repeat toasts)

### Auth Error Handling

- **D-15:** All auth errors surface actionable messages (per AUTH-09). Mapping required:
  - Wrong password → "Incorrect password"
  - User not found → "No account found with that email"
  - Network error → "No internet connection — please try again"
  - Too many requests → "Too many attempts — please wait a few minutes"
  - Email not confirmed → "Please verify your email first"
  - Generic Supabase error → "Something went wrong — try again"
  No generic "Something went wrong" without a more specific category check first.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Auth Foundation
- `src/lib/supabase.ts` — Supabase client singleton + `initSupabaseSession()`. Phase 14 adds email/password methods (`signUp`, `signInWithPassword`, `resetPasswordForEmail`, `linkIdentity`). The polyfill constraint (line 1 import order) is documented here — do not move it.
- `App.tsx` — Current `init()` routing logic checks `@vitalspan_user_profile.onboardingComplete`. Phase 14 extends this with Supabase session type check. Session persistence already configured; do not change `supabase.ts` auth storage config.

### Navigation
- `src/navigation/AppNavigator.tsx` — Existing stack navigator + `RootStackParamList`. Phase 14 adds `Welcome` route, removes `Landing`, and adds auth-related screens/sheets. `initialRoute` prop already typed as `'Landing' | 'Main'` — update to `'Welcome' | 'Main'`.

### Visual Reference
- `src/screens/LandingScreen.tsx` — Closest visual analog to WelcomeScreen. Same NeuralGrid dark aesthetic, same dark background + light text pattern. Reference for implementing WelcomeScreen hero.
- `src/components/NeuralGrid.tsx` — Animated SVG background used on WelcomeScreen. Props: `intensity`, `tone` ('calm' | 'alert' | 'vital').
- `src/theme/index.ts` — Token set. WelcomeScreen uses dark tokens (same as LandingScreen / LongevityScore); auth bottom sheet card uses `Colors.surface`, `Colors.brand`, `Colors.textPrimary`.

### Requirements
- `.planning/REQUIREMENTS.md §AUTH-01 through AUTH-09` — The 9 auth requirements; authoritative acceptance criteria for this phase.

### Session & Data Architecture
- `src/lib/biomarkerWriteService.ts` — Contains `migrateHistory()` (anonymous → authenticated data migration). Phase 14 triggers this after `linkIdentity()` on sign-up.
- `App.tsx` — `@vitalspan_migrated_v2` flag logic for migration idempotency; Phase 14 may need a new `@vitalspan_identity_linked` flag for `linkIdentity()` idempotency.

### State Decisions
- `.planning/STATE.md §Decisions` — Key prior decisions: `linkIdentity()` is the migration strategy; AsyncStorage keys preserved as offline fallback; `initSupabaseSession()` is fire-and-forget and must never block routing.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `supabase` singleton (`src/lib/supabase.ts`): already configured with AsyncStorage session persistence + AppState JWT refresh. Extend with email/password auth methods — do not re-initialize the client.
- `NeuralGrid` component: use directly for WelcomeScreen hero background. Accepts `intensity` and `tone` props for the animated SVG effect.
- `BreathingCard`: scale+glow wrapper — usable for the bottom sheet card surfaces on Sign Up / Login forms.
- `initSupabaseSession()`: already handles anonymous sign-in + session restoration. Phase 14 must ensure email/password login replaces (not duplicates) the anonymous session.

### Established Patterns
- `presentation: 'modal'` stack screens in `AppNavigator` — however, auth bottom sheets should NOT be separate navigation routes (they slide over WelcomeScreen). Use `Animated.Value` slide-up animation or an existing bottom sheet pattern within WelcomeScreen state.
- `StyleSheet` named `s` at bottom of each file; no inline styles except dynamic ones.
- AsyncStorage idempotency flags (`@vitalspan_migrated_v2`) — use same pattern for `@vitalspan_email_verified_notified` and any `linkIdentity()` idempotency flag.
- `.catch(() => null)` pattern for resilient AsyncStorage reads throughout the codebase.

### Integration Points
- `App.tsx` `init()`: current routing checks `@vitalspan_user_profile.onboardingComplete`. Phase 14 adds `supabase.auth.getUser()` check. The routing sequence: (1) check session type → (2) if authenticated → Main; (3) if anonymous/none → check onboardingComplete → Welcome or Onboarding. `initSupabaseSession()` must complete before session type check.
- `src/screens/ProfileScreen.tsx`: add guest mode detection + 'Sign up to sync' card at the top of the account section. Check `user.is_anonymous` from `supabase.auth.getUser()`.
- `src/screens/DashboardScreen.tsx`: add email verification banner (amber, dismissable) that checks `user.email_confirmed_at` on every focus event.
- `RootStackParamList` in `AppNavigator.tsx`: add `Welcome`, remove `Landing`; add `SignUpConfirmation` if implemented as a separate screen.

</code_context>

<specifics>
## Specific Ideas

- WelcomeScreen animated preview: subtle animated biomarker numbers or orbital indicator animation in the background (behind the CTAs) hinting at what the app tracks — same layer as NeuralGrid dots. This should be lightweight (SVG animation, not heavy computation).
- Bottom sheet auth forms: the dark NeuralGrid background stays visible while the form slides up. The visual effect is an overlay, not a navigation transition. The white/surface form card rises from the bottom of the screen.
- "Continue as guest" is a smaller, less prominent CTA compared to Sign Up and Log In — it's available but not the primary conversion path.
- ProfileScreen 'Sign up to sync' card: visible at the top of the screen whenever `is_anonymous` is true. Disappears permanently after account creation (session becomes non-anonymous).

</specifics>

<deferred>
## Deferred Ideas

- **Social login (Google / Apple Sign In)** — not in scope for v3. Would require additional Supabase OAuth configuration and Apple Developer entitlements.
- **Biometric authentication (FaceID for app unlock)** — future phase; adds `expo-local-authentication` dependency.
- **Multi-device sync UI** — showing a "synced devices" list or last-sync timestamp on ProfileScreen is a v4 enhancement.

</deferred>

---

*Phase: 14-auth-and-login*
*Context gathered: 2026-06-09*
