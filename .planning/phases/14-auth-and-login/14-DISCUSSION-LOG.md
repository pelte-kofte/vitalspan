# Phase 14: Auth & Login - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-09
**Phase:** 14-auth-and-login
**Areas discussed:** Welcome screen visual direction, Navigation architecture, Guest mode scope, Email verification UX

---

## Welcome Screen Visual Direction

| Option | Description | Selected |
|--------|-------------|----------|
| Dark neural (premium entry) | Full NeuralGrid dark aesthetic like LandingScreen | |
| Clean white/green (design system) | White surfaces + Colors.brand green per Phase 13 system | |
| Hybrid: dark header, white form area | NeuralGrid hero at top, white card area below | ✓ (then further refined) |

**Q1 — Visual tone:** Hybrid selected, then further refined via follow-up questions.

| Option | Description | Selected |
|--------|-------------|----------|
| Top ~40% — logo + tagline only | Compact hero, CTAs in white area | |
| Top ~60% — logo, tagline, value prop | More room for brand before form | |
| Full-screen splash, then transitions to form | Full dark NeuralGrid, form slides up as bottom sheet | ✓ |

**Q2 — Hero proportion:** Full-screen splash with form as bottom sheet transition.

| Option | Description | Selected |
|--------|-------------|----------|
| Logo + tagline + 3 CTAs directly | All three CTAs visible immediately | |
| Logo + tagline only, single "Get Started" CTA | Minimal hero, secondary tap reveals options | |
| Logo + tagline + animated longevity metric preview | Subtle animated biomarker/orbital preview, then 3 CTAs | ✓ |

**Q3 — Hero content:** Animated longevity metric preview behind logo and CTAs.

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom sheet slides up over dark background | Form rises as sheet, NeuralGrid stays visible | ✓ |
| Navigate to dedicated full-screen Sign Up / Login screens | Standard navigation push to separate screens | |

**Q4 — Form presentation:** Bottom sheet over dark background.

**Notes:** User ultimately wants a full-screen dark NeuralGrid WelcomeScreen with an animated biomarker/orbital preview. Three CTAs (Sign Up, Log In, Continue as guest) are visible on the dark background. Tapping Sign Up or Log In brings up auth form as a bottom sheet that slides over the dark screen.

---

## Navigation Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Welcome replaces Landing as new entry point | LandingScreen retired; cleaner long-term structure | ✓ |
| Welcome added before Landing (keeps Landing intact) | More routes, more complexity | |
| Auth check wraps whole navigator (Context-based gate) | React Context AuthContext, most flexible | |

**Q1 — Integration approach:** Welcome replaces Landing; Landing is retired.

| Option | Description | Selected |
|--------|-------------|----------|
| Onboarding complete flag (existing logic) | Keep current AsyncStorage check, no new keys | |
| Supabase session type: anonymous vs. authenticated | Check getUser(); authenticated → Main, anonymous → Welcome | ✓ |

**Q2 — Routing condition:** Supabase session type (non-anonymous = authenticated user).

| Option | Description | Selected |
|--------|-------------|----------|
| Straight to Main (skip onboarding) | Authenticated goes directly to tabs | |
| Onboarding first, then Main | Always collect profile data first | |
| Depends on prior guest data | If onboardingComplete → Main; if fresh → Onboarding | ✓ |

**Q3 — Post-signup navigation:** Context-aware based on prior guest data (onboardingComplete flag).

| Option | Description | Selected |
|--------|-------------|----------|
| Local data preserved, return to Welcome (guest mode intact) | signOut() clears session, not AsyncStorage; AUTH-08 compliant | ✓ |
| Prompt: "Keep or clear data?" before logging out | More control but more UX complexity | |

**Q4 — Logout behavior:** Local data preserved, navigate to WelcomeScreen.

---

## Guest Mode Scope

| Option | Description | Selected |
|--------|-------------|----------|
| No feature restrictions — full app, just no cloud sync | All features work; no gating | |
| Cloud sync locked, visible prompt to upgrade on Profile | Full features; ProfileScreen shows "Sign up to sync" card | ✓ |

**Q1 — Feature restrictions:** No restrictions; ProfileScreen shows upgrade prompt for cloud sync.

| Option | Description | Selected |
|--------|-------------|----------|
| Onboarding (first-time guests), Main (returning guests) | Check onboardingComplete flag | ✓ |
| Always straight to Main | Skip onboarding entirely for guest mode | |

**Q2 — "Continue as guest" destination:** Onboarding-aware routing (same as prior app logic).

| Option | Description | Selected |
|--------|-------------|----------|
| Simple card: headline + "Create Account" button | Minimal one-card prompt | |
| Card + list of benefits: sync, backup, new device access | Richer card with 2-3 bullet points | ✓ |

**Q3 — "Sign up to sync" card content:** Benefit-list card (sync, backup, new device access) with "Create Account" CTA.

---

## Email Verification UX

| Option | Description | Selected |
|--------|-------------|----------|
| Top of Dashboard only | Dismissable amber banner below Dashboard header | ✓ |
| Top of every main tab screen | Persistent across all 5 tabs | |
| Only on ProfileScreen (account section) | Unobtrusive badge, no interruption | |

**Q1 — Banner location:** Dashboard only.

| Option | Description | Selected |
|--------|-------------|----------|
| Confirmation screen: "Check your inbox" then go to Main | Brief SignUpConfirmationScreen before Main | ✓ |
| Go straight to Main with the dashboard banner | Faster; no intermediate screen | |

**Q2 — Post-signup experience:** Confirmation screen first, then Main.

| Option | Description | Selected |
|--------|-------------|----------|
| Banner disappears, no other changes | Verification is silent cleanup | |
| Banner disappears + one-time "Account verified!" success toast | Toast confirmation on return after verification | ✓ |

**Q3 — Verification completion:** Banner disappears + one-time success toast (idempotency flag prevents repeat).

---

## Claude's Discretion

- Auth error message mapping specifics (D-15) — user affirmed the list of specific error messages; exact copy TBD by implementer per brand voice.
- Bottom sheet implementation technique (Animated.Value vs. library) — deferred to researcher/planner based on existing codebase patterns.
- `@vitalspan_email_verified_notified` and `@vitalspan_identity_linked` AsyncStorage flag names — conventions suggested; implementer can adjust if needed.

## Deferred Ideas

- Social login (Google / Apple Sign In) — v4+; requires OAuth config + Apple Developer entitlements.
- Biometric authentication (FaceID) — v4+; requires `expo-local-authentication`.
- Multi-device sync UI (synced devices list, last-sync timestamp on Profile) — v4+ enhancement.
