# Requirements: Vitalspan v3.0 — Intelligence & Growth

**Defined:** 2026-06-02
**Core Value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

## v3 Requirements

### Apple HealthKit

- [ ] **HK-01**: On first launch after install, app requests HealthKit read permissions for HRV, sleep (asleep duration), step count, resting heart rate, and active energy burned; permission request is non-blocking — user can deny and still use the app
- [ ] **HK-02**: When permissions are granted, LongevityScore orbital values (Sleep, HRV, Recovery, Glucose, Fitness, Inflammation) are sourced from live HealthKit data instead of demo/mock values
- [ ] **HK-03**: When HealthKit permissions are denied or unavailable, LongevityScore orbitals show a "Connect Health" prompt with clear CTA rather than stale demo values
- [ ] **HK-04**: User can connect or disconnect Apple Health from Profile/Settings; disconnecting reverts orbitals to manual-entry or placeholder state

### Longevity Articles

- [ ] **ART-01**: App fetches longevity articles from PubMed NCBI API (free, no key required) using query terms: longevity, biological aging, PhenoAge, healthspan; results cached in Supabase `articles` table to avoid repeat API calls
- [ ] **ART-02**: Articles screen is accessible as a new tab or prominent section in the app, showing article title, journal, publication date, and abstract summary
- [ ] **ART-03**: Article recommendations are personalized based on the user's current biomarker values — elevated CRP surfaces inflammation articles, elevated glucose surfaces metabolic health articles, low HRV surfaces recovery/stress articles
- [ ] **ART-04**: Articles cache refreshes in background on app open (max once per 24 hours); stale cached articles are shown while refresh is in progress

### Supplement & Drug Database

- [ ] **SUPP-01**: Protocol supplement database expanded with evidence-based longevity supplements: Urolithin A, NMN, NR, Spermidine, Fisetin, Quercetin, Rapamycin, Metformin; each entry includes name, typical dose, timing, evidence grade (A/B/C), mechanism of action, and longevity relevance summary
- [ ] **SUPP-02**: Protocol drug database expanded with common OTC and prescription drugs: Ibuprofen, Aspirin, Statins (as a class), Levothyroxine, Metformin; same field structure as supplements
- [ ] **SUPP-03**: Interaction checker evaluates the user's current supplement + medication stack and surfaces: dangerous combinations (red flag), beneficial synergies (green flag), and monitoring-required pairs (yellow flag)
- [ ] **SUPP-04**: Every interaction flag includes a plain-language explanation and a recommendation (e.g., "Take at least 2 hours apart", "Consider dose reduction", "Monitor blood glucose")

### Exercise UI Overhaul

- [ ] **EX-01**: Each of the 60 exercises in the exercise library displays an SVG illustration showing the movement (bodyweight or equipment)
- [ ] **EX-02**: Each exercise displays a muscle map highlighting primary and secondary muscle groups using the neural-dot visual language; primary muscles use accent color, secondary muscles use muted color
- [ ] **EX-03**: Each exercise displays a verbal form cue (1–2 sentences) describing correct technique for longevity-safe execution
- [ ] **EX-04**: Each exercise displays a longevity-optimized sets/reps recommendation (e.g., "3 × 10–15 reps, focus on controlled eccentric") rather than hypertrophy-oriented guidance
- [ ] **EX-05**: Exercise library supports filtering by muscle group via a visual muscle map selector; tapping a muscle region filters the list to exercises targeting that group
- [ ] **EX-06**: Dashboard shows a weekly movement summary — total sessions, total active minutes, most-trained muscle group this week

### UI / Design System

- [ ] **DS-01**: Color token system in `src/theme/index.ts` extended with intentional clinical-premium palette: `primary`, `surface`, `surfaceElevated`, `accent`, `accentMuted`, `semantic.success`, `semantic.warning`, `semantic.danger`, `semantic.info`; beige-default usage replaced with appropriate semantic or surface tokens
- [ ] **DS-02**: All icons across the entire app converted to consistent SVG neural-dot style matching the existing tab bar icon system; no placeholder icons, question marks, or emoji remain anywhere in the app
- [ ] **DS-03**: Icon rendering verified working in both iOS simulator and production EAS builds; any known rendering issues (SVG import, native module) resolved
- [ ] **DS-04**: Typography scale reviewed and documented in `src/theme/index.ts` — heading, subheading, body, caption, label sizes defined; no hardcoded font sizes outside the scale remain
- [ ] **DS-05**: Spacing and layout consistency audit — all screens use `Spacing.*` tokens; no hardcoded margin/padding numbers outside of dynamic styles

### Authentication

- [ ] **AUTH-01**: App includes a Welcome/splash screen shown to unauthenticated users on first launch with "Sign up" and "Log in" CTAs and a "Continue as guest" option
- [ ] **AUTH-02**: Sign up screen accepts email and password; on success creates a Supabase Auth account and links it to the existing anonymous session via `linkIdentity()` so existing data is preserved
- [ ] **AUTH-03**: Login screen accepts email and password; on success restores the user's account and syncs their biomarker history from Supabase
- [ ] **AUTH-04**: Forgot password flow sends a Supabase password reset email; user sees confirmation screen after submission
- [ ] **AUTH-05**: Email verification — after sign up, user is prompted to verify their email; app handles the verified/unverified state gracefully (verified users get full sync; unverified users see a reminder banner)
- [ ] **AUTH-06**: Session persists across app restarts; token refresh is handled automatically; user is not logged out unexpectedly after backgrounding
- [ ] **AUTH-07**: User profile (biomarkers, protocol, exercise logs) is linked to their authenticated Supabase `user_id`; data is accessible after logging in on a new device
- [ ] **AUTH-08**: Logout flow clears the session, resets to anonymous mode, and returns user to the Welcome screen; local AsyncStorage data is preserved so guest mode is still functional after logout
- [ ] **AUTH-09**: Auth errors surface actionable messages to the user — wrong password, network error, unverified email, rate limit — never generic "something went wrong"

## v4 Requirements (Deferred)

### Monetization

- **PAY-01**: Premium features gated behind RevenueCat subscription paywall
- **PAY-02**: Free tier: biomarker tracking (up to 5), no protocol or score
- **PAY-03**: Premium tier: full access, interaction checker, longevity score

### Push Notifications

- **NOTIF-01**: Daily protocol reminder at user-configured time
- **NOTIF-02**: Weekly "update your labs" nudge if no biomarkers entered in 30 days

### Trend Charts

- **CHART-01**: BiomarkerDetail screen shows 30-day sparkline trend chart
- **CHART-02**: Protocol adherence 30-day SVG timeline

### Wearables & Third-Party

- **WEAR-01**: Garmin / Whoop integration via Apple Health as intermediary
- **WEAR-02**: Third-party CGM integration for continuous glucose data

## Out of Scope

| Feature | Reason |
|---------|--------|
| Android support | iOS-only by architecture decision; React Native navigation and HealthKit entitlements are iOS-specific |
| Real-time Supabase subscriptions | Batch pull sufficient for v3; real-time adds complexity without clear v3 user value |
| Social / sharing features | Not core to longevity tracking; adds moderation complexity |
| RevenueCat paywall | Deferred until post-v3 user traction metrics are available |
| Video exercise demos | Storage/bandwidth cost; SVG illustrations deliver sufficient instruction value |
| Android HealthKit equivalent (Google Fit / Health Connect) | Out of scope until Android support is added |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HK-01 | Phase 10 | Pending |
| HK-02 | Phase 10 | Pending |
| HK-03 | Phase 10 | Pending |
| HK-04 | Phase 10 | Pending |
| ART-01 | Phase 10 | Pending |
| ART-02 | Phase 10 | Pending |
| ART-03 | Phase 10 | Pending |
| ART-04 | Phase 10 | Pending |
| SUPP-01 | Phase 11 | Pending |
| SUPP-02 | Phase 11 | Pending |
| SUPP-03 | Phase 11 | Pending |
| SUPP-04 | Phase 11 | Pending |
| EX-01 | Phase 12 | Pending |
| EX-02 | Phase 12 | Pending |
| EX-03 | Phase 12 | Pending |
| EX-04 | Phase 12 | Pending |
| EX-05 | Phase 12 | Pending |
| EX-06 | Phase 12 | Pending |
| DS-01 | Phase 13 | Pending |
| DS-02 | Phase 13 | Pending |
| DS-03 | Phase 13 | Pending |
| DS-04 | Phase 13 | Pending |
| DS-05 | Phase 13 | Pending |
| AUTH-01 | Phase 14 | Pending |
| AUTH-02 | Phase 14 | Pending |
| AUTH-03 | Phase 14 | Pending |
| AUTH-04 | Phase 14 | Pending |
| AUTH-05 | Phase 14 | Pending |
| AUTH-06 | Phase 14 | Pending |
| AUTH-07 | Phase 14 | Pending |
| AUTH-08 | Phase 14 | Pending |
| AUTH-09 | Phase 14 | Pending |

**Coverage:**
- v3 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-02*
*Last updated: 2026-06-02 after v3.0 milestone start*
