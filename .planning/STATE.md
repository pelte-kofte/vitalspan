# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-10)

**Core value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.
**Current focus:** v4.1 — Global UX Fixes (Phase 19 in progress)

## Current Position

Phase: 19 (Global UX Fixes) — In Progress
Plan: 1/6
Status: Phase 19 executing — Wave 1 complete, Wave 2 starting
Last activity: 2026-06-15 — 19-01 complete: OrbitalInfoModal component created and tsc-clean

Progress: [██░░░░░░░░] 17% Phase 19

## Performance Metrics

**Velocity:**
- Total plans completed: 8 (v1 phases 1-3)
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 (v1) | 3/3 | - | - |
| 2 (v1) | 2/2 | - | - |
| 3 (v1) | 3/3 | - | - |

**Recent Trend:**
- Last 5 plans: v1 execution (all complete)
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v2.0: Supabase anonymous auth only (no email/password UI) — email upgrade deferred to v3
- v2.0: AsyncStorage keys preserved as offline fallback layer — Supabase is additive, not replacement
- v2.0: Selective UI overhaul — warm beige on list/data screens, dark neural untouched on LongevityScore + orbital
- v2.0: API keys in `.env` only — `process.env.EXPO_PUBLIC_*` exclusively
- 04-P1: JSDoc header placed after polyfill import (line 2+) — polyfill must be absolute line 1; takes precedence over "JSDoc before first import" style note
- 04-P1: Anonymous-only auth for v2 — initSupabaseSession() uses signInAnonymously() guarded by prior getSession() check to avoid clobbering returning users' sessions
- 04-P2: initSupabaseSession() is fire-and-forget (.catch(() => null)) — session establishment must never block the loading spinner resolving
- 04-P2: Route determination (setInitialRoute) runs before initSupabaseSession() — AsyncStorage profile check is the gating dependency, Supabase is non-blocking
- 08-P1: biomarker_entries id column is text PK — preserves AsyncStorage-generated string IDs, no UUID remapping
- 08-P1: biomarker_entries is append-only — SELECT + INSERT RLS policies only, no UPDATE or DELETE from client
- v3.0: HealthKit mock layer already in src/lib/healthkit.ts — Phase 10 upgrades the mock to real expo-health entitlement
- v3.0: Articles cached in Supabase articles table — avoid repeat PubMed API calls; 24-hour background refresh ceiling
- v3.0: Auth uses supabase.auth.updateUser({ email, password }) for anonymous→email promotion (NOT linkIdentity, which is OAuth-only) — existing local data preserved on account creation via migrateHistory() guarded by @vitalspan_identity_linked flag
- 10-03: permissionState derived from hasRequestedHealthKit flag on every focus — ensures ProfileScreen disconnect reflects on next LongevityScore open
- 10-03: handleDismissPrompt sets permissionState to 'granted' (not a separate dismissed state) — empty orbitals with no prompt is user's chosen state
- 10-03: iOS empty HRV probe heuristic used to detect denial — iOS privacy design prevents direct denial status reporting
- 10-04: onPress callback passed to ArticleCard from ArticlesScreen — WebBrowser import stays in ArticlesScreen, not in ArticleCard
- 10-04: cancelled flag in ArticlesScreen useEffect prevents state updates after unmount
- 10-04: Research CTA uses style composition [s.uploadCard, s.researchCard] — researchCard only overrides backgroundColor
- 14-01: initSupabaseSession() is now AWAITED in App.tsx init() (not fire-and-forget) — session must be established before routing determination (D-06)
- 14-01: App.tsx routing uses supabase.auth.getUser() is_anonymous check: non-anonymous -> Main, anonymous/no-session -> Welcome; onboardingComplete check removed from App.tsx (D-06, D-11)
- 14-01: SettingsScreen nav.reset calls updated from Landing to Welcome (Landing route retired)
- 14-02: mapAuthError is synchronous and pure — called from both auth functions and screens directly (D-15)
- 14-02: convertAnonymousToEmail uses supabase.auth.updateUser({ email, password }) — linkIdentity explicitly excluded (D-16, OAuth-only)
- 14-02: signOutUser has zero AsyncStorage operations — local data preserved on logout (D-08)
- 14-02: All auth functions return typed result objects (never throw) — try/catch at function level, not screen level
- 14-03: nav.navigate('ForgotPassword', {}) requires empty object arg — TypeScript overload for optional-param routes rejects zero-arg call
- 14-03: WelcomeScreen bottom sheet uses Animated.Value(SCREEN_H) → animate to 0 on open, animate back to SCREEN_H on close
- 14-03: SheetForm stateless field-array pattern — parent (WelcomeScreen) owns all state, passes field configs to SheetForm
- 14-04: RouteProp imported from @react-navigation/native (not @react-navigation/native-stack) — native-stack only exports NativeStackNavigationProp
- 14-04: ForgotPasswordScreen always shows success state on sendPasswordResetEmail success — T-14-11 anti-enumeration (don't reveal whether email exists)
- 14-04: SignUpConfirmationScreen handleContinue reads @vitalspan_user_profile.onboardingComplete to route to Main or Onboarding
- 14-05: CompositeNavigationProp nav.reset requires double cast (as unknown as NativeStackNavigationProp) for RootStack routes — TypeScript strict rejects direct cast due to setParams incompatibility
- 14-05: Verification banner placed outside ScrollView (between NeuralGrid and ScrollView) for fixed positioning at top
- 14-05: Guest CTA uses nav.reset (not nav.navigate) to cleanly replace stack history when going to Welcome
- v4.0: Adapty chosen over RevenueCat — better A/B paywall testing, analytics dashboard, more generous free tier
- v4.0: AI Advisor uses anonymized context (bucketed age, status categories, supplement/med names) — no raw lab values, no exact birthdate, no Supabase user ID
- v4.0: Claude API proxied through Supabase Edge Function — never install @anthropic-ai/sdk in Expo project (unsupported Hermes runtime + API key security)
- v4.0: Exercise photos loaded from yuhonas/free-exercise-db CDN via expo-image disk cache — no local bundling (97 MB repo)
- v4.0: photoKey field added to Exercise interface — holds free-exercise-db name string (e.g. "Barbell_Deadlift"), not Vitalspan numeric ID
- v4.0: SubscriptionContext.isPremium — do NOT persist in AsyncStorage; Adapty owns subscription state
- v4.0: Adapty activation race — activate with no customerUserId; call adapty.identify(user.id) only after Supabase getUser() resolves

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 17: Anthropic API key must NEVER appear in Expo project source — Edge Function only; set spend alert in Anthropic Console before launch
- Phase 17: Per-user rate limiting must be enforced before every Anthropic call — 5 reports/day, 20 chat messages/day
- Phase 16 deferred QA: Sandbox purchase flow (Scenario 3) and restore after reinstall (Scenario 4) deferred to pre-TestFlight QA

## Deferred Items

Items carried forward to future milestone:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Notifications | Protocol + labs reminders | v5+ | v1 init |
| Biomarkers | Trend charts / sparklines | v5+ | v1 init |
| Data Limits | Free tier 30-day history limit | v5+ | v4.0 — paywall ships first |

## Session Continuity

Last session: 2026-06-15
Stopped at: Phase 18 complete — all 4 v4.0 phases shipped. v4.0 milestone (Monetization & Intelligence) is done. Next milestone: v5.0 (notifications, biomarker trend charts, data limits, TestFlight / EAS).
Resume file: .planning/STATE.md
