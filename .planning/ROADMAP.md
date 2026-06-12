# Roadmap: Vitalspan

## Milestones

- ✅ **v1.0 TestFlight** - Phases 1-3 (shipped 2026-05-25)
- ✅ **v2.0 Premium, Backend & Exercise** - Phases 4-9 (complete 2026-06-02)
- ✅ **v3.0 Intelligence & Growth** - Phases 10-14 (complete 2026-06-09)
- 🚧 **v4.0 Monetization & Intelligence** - Phases 15-18 (in progress)

## Overview

v3.0 shipped a complete intelligent longevity platform — live HealthKit data, PubMed articles, 60-exercise SVG library, expanded supplement/drug database, clinical design system, and full Supabase Auth. v4.0 turns Vitalspan into a sustainable business: exercise photos elevate the visual quality of the library with real CDN-hosted JPGs from a public-domain source, Adapty-powered subscriptions add a premium tier with in-app purchase and a trial timeline paywall, and the AI Longevity Advisor (Claude API via Supabase Edge Function) becomes the flagship premium feature — generating a structured 6-section longevity report and follow-up chat from anonymized health context.

---

<details>
<summary>✅ v1.0 TestFlight (Phases 1-3) — SHIPPED 2026-05-25</summary>

### Phase 1: First-Run & Empty States
**Goal**: New users arrive at a purposeful, guided experience — not a blank dashboard
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FIRST-01, FIRST-02, FIRST-03, FIRST-04, EMPTY-01, EMPTY-02
**Success Criteria** (what must be TRUE):
  1. User completing onboarding is immediately shown a guided flow prompting Glucose, HbA1c, and Cholesterol — not a blank dashboard
  2. Each biomarker step shows a plain-English card explaining why that value matters for longevity before the entry input
  3. User can skip the guided flow and re-trigger it from the Dashboard empty state CTA
  4. After completing the guided flow, Dashboard displays entered data and FutureSelf transitions to partial-progress state
  5. Biomarkers tab shows an explanatory empty state with "Start tracking" CTA when no entries exist
**Plans**: 3 plans in 2 waves

### Phase 2: App Assets & Store Polish
**Goal**: The app looks and reads like a credible, pharmacist-built product — not an Expo starter
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: ASSET-01, ASSET-02, STORE-01, STORE-02, STORE-03, STORE-04
**Success Criteria** (what must be TRUE):
  1. App icon on device home screen shows the custom Vitalspan brand mark
  2. Launch sequence shows the branded Vitalspan splash with app name and tagline
  3. About screen includes pharmacist credential section and always-visible mission statement
**Plans**: 2 plans in 1 wave

### Phase 3: UX Polish & TestFlight Prep
**Goal**: Every screen renders correctly on iPhone 15 Pro and iPhone 16 Plus — no layout breaks block the TestFlight submission
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: POLISH-01, POLISH-02, POLISH-03
**Success Criteria** (what must be TRUE):
  1. No screen has overflow, clipping, or layout breaks on iPhone 15 Pro or iPhone 16 Plus form factors
  2. Completing onboarding on a fresh install navigates reliably to Main tabs
  3. Protocol tab shows a meaningful empty state when no medications or supplements are added
**Plans**: 3 plans in 1 wave

</details>

---

<details>
<summary>✅ v2.0 Premium, Backend & Exercise (Phases 4-9) — COMPLETE 2026-06-02</summary>

### Phase 4: Supabase Foundation
**Goal**: The app initializes a Supabase session on first launch, the session persists across restarts, JWT never expires silently after backgrounding, and no secrets exist in source code
**Mode:** mvp
**Depends on**: Phase 3 (v1 complete)
**Requirements**: SUPA-01, SUPA-02, SUPA-03, SEC-01
**Success Criteria** (what must be TRUE):
  1. App opens and a Supabase anonymous session is created silently — user sees no auth prompt; the session UUID is stable across app restarts
  2. App foregrounded after 1+ hour in background reconnects to Supabase without 401 errors on subsequent sync calls
  3. A grep/audit of the entire source tree finds zero occurrences of the Supabase URL or anon key — all values read from `process.env.EXPO_PUBLIC_*`
  4. `src/lib/supabase.ts` singleton is importable by any service without re-initializing the client
**Plans**: 2 plans in 2 waves

Plans:

**Wave 1**
- [x] 04-P1-PLAN.md — Install packages + create supabase.ts singleton + .env.example (SUPA-01, SEC-01)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 04-P2-PLAN.md — Wire App.tsx anonymous auth init + AppState JWT refresh + human verification (SUPA-02, SUPA-03)

**UI hint**: no

### Phase 5: Design Tokens & Icons
**Goal**: The Beige color token block exists in the theme and five custom SVG icons replace emoji placeholders in the tab bar — the visual building blocks are in place before any screen is rethemed
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: ICON-01, ICON-02, THEME-01
**Success Criteria** (what must be TRUE):
  1. Tab bar displays five custom stroke-based SVG icons (Home, Biomarkers, Protocol, Exercise, Profile) — no emoji visible
  2. Active tab icon renders in the navigation accent color; inactive renders in muted color — no manual focused-state logic required
  3. `Colors.Beige.*` tokens are accessible from `src/theme/index.ts`; no existing `Colors.*` constant is renamed or removed; `tsc --noEmit` passes
**Plans**: 3 plans in 2 waves

Plans:

**Wave 1** *(run in parallel)*
- [x] 05-01-PLAN.md — Append Colors.Beige token block (11 tokens) to src/theme/index.ts (THEME-01)
- [x] 05-02-PLAN.md — Create src/components/TabIcons.tsx with 5 named SVG neural-dots icons (ICON-01, ICON-02)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 05-03-PLAN.md — Wire SVG icons into AppNavigator.tsx + switch tab bar backgroundColor to Colors.Beige.bg + human visual verification (ICON-01, ICON-02, THEME-01)

**UI hint**: yes

### Phase 6: Warm UI Overhaul
**Goal**: Biomarkers, Protocol, Exercise, Profile, Settings, and About screens use warm Beige tokens throughout; LongevityScore, Dashboard neural sections, and Landing remain dark; every warm screen has correct status bar style; motivating empty states exist on Exercise, Protocol, and Profile
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: THEME-02, THEME-03, THEME-04, THEME-05, THEME-06
**Success Criteria** (what must be TRUE):
  1. Biomarkers, Protocol, Exercise, Profile, Settings, and About screens render with warm cream/beige backgrounds and card surfaces — no dark backgrounds visible on these screens
  2. LongevityScore, Dashboard neural sections, and Landing screen retain their dark neural aesthetic — no beige bleed onto these screens
  3. Status bar text is dark (readable) on warm screens and light on dark screens, switching correctly when navigating between them
  4. Exercise, Protocol, and Profile screens each show a motivating empty state with an outcome-focused headline and a single CTA when the user has no data
  5. `tsc --noEmit` passes and no hardcoded hex values appear in modified screen files
**Plans**: 5 plans in 3 waves

Plans:

**Wave 1** *(run in parallel)*
- [x] 06-01-PLAN.md — Fix Colors.Beige.textMuted token + migrate SettingsScreen + AboutScreen (THEME-02, THEME-03, THEME-04, THEME-05)
- [x] 06-02-PLAN.md — Migrate ProtocolScreen + upgrade empty state (THEME-02, THEME-04, THEME-05, THEME-06)

**Wave 2** *(blocked on Wave 1 completion, run in parallel)*
- [x] 06-03-PLAN.md — Migrate BiomarkerDetailScreen + BiomarkerEntryScreen (THEME-02, THEME-04, THEME-05)
- [x] 06-04-PLAN.md — Migrate ExerciseScreen + add motivating empty state (THEME-02, THEME-04, THEME-05, THEME-06)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 06-05-PLAN.md — Migrate ProfileScreen + add motivating empty state + full phase audit + human visual checkpoint (THEME-02, THEME-03, THEME-04, THEME-05, THEME-06)

**UI hint**: yes

### Phase 7: Reference Data & Exercise Screen
**Goal**: The exercise library and biomarker definitions are served from Supabase with static fallback; the exercise screen is rebuilt with Today/This Week/History log grouping, Supabase-backed library, intensity pills, and color-coded log entries
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: SUPA-04, SUPA-05, EX-01, EX-02, EX-03, EX-04
**Success Criteria** (what must be TRUE):
  1. App online: biomarker definitions and exercise library load from Supabase; app offline: both fall back to static data arrays without error
  2. Exercise screen shows today's logged sessions at the top, then this week, then the last 14 days of history — sections are empty-state-aware
  3. User can browse the exercise library filtered by category; selecting an exercise shows its metadata (loaded from Supabase or static fallback)
  4. Logging an exercise shows Easy/Moderate/Hard intensity pills with green/amber/coral color coding and haptic feedback on selection
  5. Log entries are color-coded by intensity; swiping a log entry left reveals a delete action that removes it
**Plans**: 4 plans in 3 waves

Plans:

**Wave 1**
- [x] 07-01-PLAN.md — SQL seed files + exerciseService + biomarkerService with Supabase-first + static fallback (SUPA-04, SUPA-05)

**Wave 2** *(blocked on Wave 1 completion, run in parallel)*
- [x] 07-02-PLAN.md — Wire biomarkerService into BiomarkerDetailScreen + BiomarkerEntryScreen (SUPA-04)
- [x] 07-03-PLAN.md — Rebuild ExerciseScreen: exerciseService + 3-section log + intensity colors (EX-01, EX-02, EX-03)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 07-04-PLAN.md — Swipe-to-delete: GestureHandlerRootView + SwipeableLogRow + ExerciseScreen wire-up (EX-04)

**UI hint**: yes

### Phase 8: Biomarker Sync Write Path
**Goal**: New biomarker entries are written to Supabase after AsyncStorage save; existing AsyncStorage history is migrated to Supabase once on first authenticated session; Dashboard pulls fresh data on mount
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: SUPA-06, SUPA-07
**Success Criteria** (what must be TRUE):
  1. User enters a biomarker value: it saves to AsyncStorage immediately (as before), then a fire-and-forget Supabase write is attempted — app behavior is unchanged if Supabase write fails
  2. On first authenticated session after upgrade, all existing `@vitalspan_biomarkers` entries appear in the Supabase `biomarker_entries` table; the migration does not run again on subsequent launches (idempotency flag `@vitalspan_migrated_v2` is set)
  3. Dashboard pulls biomarker entries from Supabase on mount when the cached data is stale; stale pull errors fall back to AsyncStorage silently
**Plans**: 3 plans in 3 waves

Plans:

**Wave 1**
- [x] 08-01-PLAN.md — Create src/db/create_biomarker_entries.sql — table schema + RLS policies (SUPA-06, SUPA-07)

**Wave 2** *(blocked on Wave 1)*
- [x] 08-02-PLAN.md — Create src/lib/biomarkerWriteService.ts — syncEntry + migrateHistory (SUPA-06, SUPA-07)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 08-03-PLAN.md — Wire BiomarkerEntryScreen + App.tsx + DashboardScreen + tsc verification (SUPA-06, SUPA-07)

**UI hint**: no

### Phase 9: PhenoAge Fix & Release Quality
**Goal**: The Levine PhenoAge formula returns correct biological age values verified against published coefficients; TypeScript compiles clean with zero errors; all key user flows are crash-free on device
**Mode:** mvp
**Depends on**: Phase 8
**Requirements**: PHENO-01, QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
  1. A user with known biomarker values (e.g. published reference set) sees a biological age output from PhenoAge that matches the expected value from the Levine 2018 paper coefficients
  2. `tsc --noEmit` exits with zero errors — no `any` types, no missing type annotations
  3. The full key flow — onboarding → biomarker entry → protocol → exercise log → LongevityScore — completes without crash on iOS simulator or device
  4. Source audit (grep) confirms zero occurrences of Supabase URL or anon key in any source file
**Plans**: 3 plans in 2 waves

Plans:

**Wave 1** *(run in parallel)*
- [x] 09-P1-PLAN.md — Fix phenoAge.ts formula (remove LAMBDA + MEDIANS, correct Gompertz mortality) + write phenoAge.verify.ts (PHENO-01)
- [x] 09-P2-PLAN.md — Strip console.log from src/, run tsc --noEmit + fix errors, security grep audit (QUAL-01, QUAL-03)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 09-P3-PLAN.md — Update 4 UI consumers for null biologicalAge + full flow iOS simulator verification + EAS preview build (QUAL-02)

**UI hint**: no

</details>

---

<details>
<summary>✅ v3.0 Intelligence & Growth (Phases 10-14) — COMPLETE 2026-06-09</summary>

### Phase 10: Apple Health + Articles
**Goal**: LongevityScore orbitals show live Apple Health data (HRV, sleep, recovery, glucose, fitness) instead of demo values, and users can read PubMed longevity articles personalized to their current biomarker profile
**Mode:** standard
**Depends on**: Phase 9
**Requirements**: HK-01, HK-02, HK-03, HK-04, ART-01, ART-02, ART-03, ART-04
**Success Criteria** (what must be TRUE):
  1. On first launch after install, the app requests HealthKit read permissions; granting them causes LongevityScore orbitals to display real values instead of demo placeholders within the same session
  2. When HealthKit permissions are denied, the LongevityScore screen shows a "Connect Health" prompt with a CTA — not stale demo numbers — and tapping it navigates to Profile/Settings where the user can connect Apple Health
  3. User can open the Articles section and see a list of longevity-relevant PubMed articles (title, journal, date, abstract summary); articles load from cache on subsequent opens without waiting for a network request
  4. Article recommendations visibly reflect the user's biomarker profile — a user with elevated CRP sees inflammation-focused articles surface higher than metabolic articles
**Plans**: 5 plans in 3 waves

Plans:

**Wave 1** *(run in parallel)*
- [x] 10-01-PLAN.md — Install react-native-health + app.json HealthKit entitlement + upgrade healthkit.ts to real reads (HK-01, HK-02)
- [x] 10-02-PLAN.md — Create Supabase articles table SQL + create articleService.ts with NCBI fetch + ranking (ART-01, ART-03, ART-04)

**Wave 2** *(blocked on Wave 1 completion, run in parallel)*
- [x] 10-03-PLAN.md — Upgrade LongevityScoreScreen three-state permission flow + ProfileScreen disconnect row (HK-01, HK-02, HK-03, HK-04)
- [x] 10-04-PLAN.md — Create ArticlesScreen + ArticleCard + wire AppNavigator + Dashboard Research CTA (ART-02, ART-03)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 10-05-PLAN.md — Source audits + Supabase table creation checkpoint + EAS preview build + UI verification (HK-01–HK-04, ART-01–ART-04)

**UI hint**: yes

### Phase 11: Supplement & Drug Database
**Goal**: The protocol screen surfaces 8 evidence-graded longevity supplements and 5 drug classes with mechanism summaries, and the interaction checker evaluates the user's entire current stack with color-coded flags and plain-language recommendations
**Mode:** standard
**Depends on**: Phase 10
**Requirements**: SUPP-01, SUPP-02, SUPP-03, SUPP-04
**Success Criteria** (what must be TRUE):
  1. User browsing the supplement library sees all 8 longevity supplements (Urolithin A, NMN, NR, Spermidine, Fisetin, Quercetin, Rapamycin, Metformin) with dose, timing, evidence grade (A/B/C), and a one-line longevity relevance summary
  2. User browsing the drug database sees all 5 drug classes (Ibuprofen, Aspirin, Statins, Levothyroxine, Metformin) with the same field structure
  3. User running the interaction checker on a multi-item stack sees results grouped by severity (red/yellow/green flags) with a plain-language explanation and a specific recommendation for each flagged pair
  4. Every interaction flag shown to the user includes an actionable recommendation — no flag is displayed without a "what to do" instruction
**Plans**: 5 plans in 4 waves

Plans:

**Wave 1**
- [x] 11-01-PLAN.md — Extend SupplementInfo interface + add 18 supplements + 4 drug classes (SUPP-01, SUPP-02)

**Wave 2** *(blocked on Wave 1)*
- [x] 11-02-PLAN.md — Expand INTERACTIONS to 50+ pharmacist-reviewed pairs + SAFE_COMBOS to 11 [checkpoint] (SUPP-03, SUPP-04)

**Wave 3** *(blocked on Wave 2, run in parallel)*
- [x] 11-03-PLAN.md — ProtocolScreen Supplement Library section + SupplementLibrarySection.tsx (SUPP-01, SUPP-02)
- [x] 11-04-PLAN.md — InteractionChecker auto-populate + categorized chip sections (SUPP-03, SUPP-04)

**Wave 4** *(blocked on Wave 3)*
- [x] 11-05-PLAN.md — tsc + source audit + on-device UI checkpoint (SUPP-01, SUPP-02, SUPP-03, SUPP-04)

**UI hint**: no

### Phase 12: Exercise UI Overhaul
**Goal**: Every exercise in the 60-exercise library displays an SVG illustration, a neural-dot muscle map with primary/secondary groups highlighted, a form cue, and longevity-optimized sets/reps; the library is filterable by muscle group; Dashboard shows a weekly movement summary
**Mode:** standard
**Depends on**: Phase 11
**Requirements**: EX-01, EX-02, EX-03, EX-04, EX-05, EX-06
**Success Criteria** (what must be TRUE):
  1. Opening any exercise detail shows an SVG movement illustration, a neural-dot muscle map with primary muscles in accent color and secondary muscles in muted color, a 1–2 sentence form cue, and a longevity-optimized sets/reps recommendation
  2. User can tap a muscle region on the exercise library's visual muscle map selector and see the list filtered to exercises targeting that group; clearing the filter restores the full list
  3. Dashboard displays a weekly movement summary card showing total sessions, total active minutes, and the most-trained muscle group for the current week
**Plans**: 7 plans in 4 waves

Plans:

**Wave 1** *(run in parallel)*
- [x] 12-01-PLAN.md — Extend Exercise interface + pharmacist-reviewed content (formCue, setsReps, longevityNote) for all 60 exercises [checkpoint] (EX-01, EX-02, EX-03, EX-04)
- [x] 12-02-PLAN.md — Create MuscleMapView component (front/back silhouette, neural-dot grid, interactive/read-only) (EX-02, EX-05)
- [x] 12-03-PLAN.md — Create 60 SVG neural-dot exercise illustration components + barrel index (EX-01)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 12-04-PLAN.md — Create ExerciseDetailScreen (illustration, muscle map, form cue, sets/reps, log CTA) (EX-01, EX-02, EX-03, EX-04)

**Wave 3** *(blocked on Wave 2 completion, run in parallel)*
- [x] 12-05-PLAN.md — Wire AppNavigator + update ExerciseScreen (navigate to detail, muscle map filter panel) (EX-05)
- [x] 12-06-PLAN.md — Add weekly movement summary card to DashboardScreen (EX-06)

**Wave 4** *(blocked on Wave 3 completion)*
- [x] 12-07-PLAN.md — tsc + source audit + human visual checkpoint (EX-01, EX-02, EX-03, EX-04, EX-05, EX-06)

**UI hint**: yes

### Phase 13: UI / Design System
**Goal**: The entire app is rendered using intentional clinical-premium color tokens from `src/theme/index.ts`, all icons are consistent SVG neural-dot style with verified production rendering, typography uses a documented scale with no hardcoded sizes, and all spacing uses `Spacing.*` tokens
**Mode:** standard
**Depends on**: Phase 12
**Requirements**: DS-01, DS-02, DS-03, DS-04, DS-05
**Success Criteria** (what must be TRUE):
  1. A developer opening `src/theme/index.ts` sees the full clinical-premium token set (`primary`, `surface`, `surfaceElevated`, `accent`, `accentMuted`, `semantic.*`) and the documented typography scale; no screen file outside dynamic styles contains hardcoded hex values, font sizes, or margin/padding numbers
  2. Every icon in the app — across all screens, modals, and empty states — renders as a consistent SVG neural-dot style with no placeholder icons, question marks, or emoji remaining
  3. An EAS production build installs and runs with all SVG icons rendering correctly on device — no blank spaces, missing glyphs, or native module errors
**Plans**: 6 plans
**UI hint**: yes

### Phase 14: Auth & Login
**Goal**: Unauthenticated users are greeted by a Welcome screen and can sign up, log in, or continue as guest; authenticated users have session persistence, email verification, and their data linked to their Supabase `user_id` with anonymous data migrated on account creation
**Mode:** standard
**Depends on**: Phase 13
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09
**Success Criteria** (what must be TRUE):
  1. A new user on first launch sees a Welcome screen with "Sign up", "Log in", and "Continue as guest" options; signing up creates a Supabase account, promotes the existing anonymous session via `supabase.auth.updateUser()`, and all previously entered data remains intact after account creation
  2. A returning user logging in with correct credentials is taken directly to the main app with their biomarker history visible; a user logging in with wrong credentials sees a specific error message ("Incorrect password" not "Something went wrong")
  3. User who forgets password can trigger a reset email from the Login screen and sees a confirmation screen; after clicking the reset link, they can set a new password and log in successfully
  4. After backgrounding the app for any duration and reopening it, the user remains logged in without re-entering credentials; logging out clears the session, returns to the Welcome screen, and local AsyncStorage data is still accessible in guest mode
**Plans**: 5 plans in 4 waves

Plans:

**Wave 1**
- [x] 14-01-PLAN.md — Navigation & Routing Foundation: Replace Landing with Welcome in AppNavigator + session-type routing in App.tsx (AUTH-01, AUTH-06, AUTH-08)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 14-02-PLAN.md — Supabase Auth Methods: signUpWithEmail, signInWithEmail, convertAnonymousToEmail, sendPasswordResetEmail, signOutUser, resendVerificationEmail, mapAuthError (AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-08, AUTH-09)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 14-03-PLAN.md — WelcomeScreen + SheetForm component + bottom sheet auth forms: dark NeuralGrid hero, animated metric preview, Sign Up / Log In sheets (AUTH-01, AUTH-02, AUTH-03, AUTH-09)

**Wave 4** *(blocked on Wave 3 completion, run in parallel)*
- [x] 14-04-PLAN.md — ForgotPassword + SignUpConfirmation screens (AUTH-04, AUTH-05)
- [x] 14-05-PLAN.md — ProfileScreen guest card + logout + DashboardScreen verification banner + verified toast + App.tsx cleanup (AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09)

**UI hint**: yes

</details>

---

## Phases — v4.0 Monetization & Intelligence

**Milestone Goal:** Turn Vitalspan into a sustainable business — real exercise photography elevates the visual library, Adapty-powered subscriptions add a premium tier with Apple in-app purchase, and the AI Longevity Advisor (Claude API via Supabase Edge Function) becomes the flagship premium feature generating a structured health report and follow-up chat from anonymized context.

**Phase Numbering:**
- Integer phases (15, 16, 17, 18): Planned milestone work
- Decimal phases (15.1, 15.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 15: Exercise Photos** - Add real CDN-hosted exercise photos to ExerciseDetailScreen with SVG fallback for unmapped exercises
- [ ] **Phase 16: Adapty Paywall & Subscriptions** - Ship Adapty-powered in-app purchase with a compliant paywall screen, free/premium tier gating, and restore purchases
- [ ] **Phase 17: AI Advisor — Backend** - Build the Supabase Edge Function, anonymized context assembler, and per-user rate limiting that powers the AI Longevity Advisor
- [ ] **Phase 18: AI Advisor — UI** - Deliver the AI Advisor premium screen with a 6-section report layout, follow-up chat, and subscription soft gate

## Phase Details

### Phase 15: Exercise Photos
**Goal**: ExerciseDetailScreen displays real JPG photos for exercises with a mapped photoKey, loaded from the yuhonas/free-exercise-db CDN — SVG illustrations remain as fallback for unmapped exercises and a neutral placeholder covers any remaining gaps
**Mode:** standard
**Depends on**: Phase 14
**Requirements**: EXP-01, EXP-02, EXP-03
**Success Criteria** (what must be TRUE):
  1. Opening an exercise with a mapped photoKey shows a real JPG photo (start position) in the illustration area — the photo loads progressively and is disk-cached by expo-image for offline revisits
  2. Opening an exercise without a photoKey mapping shows the existing Phase 12 SVG illustration unchanged — no visible regression for unmapped exercises
  3. At least 42 of the 60 exercises (70%) have a verified photoKey that resolves to a valid yuhonas/free-exercise-db JPG URL
**Plans**: 2 plans in 2 waves

Plans:

**Wave 1**
- [x] 15-01-PLAN.md — Add photoKey?: string to Exercise interface + populate 46 verified mappings (EXP-03)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 15-02-PLAN.md — Install expo-image + rewrite ExerciseDetailScreen illustration section with CDN photo banner + SVG fallback (EXP-01, EXP-02)

**UI hint**: yes

### Phase 16: Adapty Paywall & Subscriptions
**Goal**: Users can subscribe to Vitalspan Premium via Apple in-app purchase from a compliant paywall screen; the paywall shows price, billing period, a visual 7-day trial timeline, and a Restore Purchases button; premium status gates the AI Advisor and Articles features
**Mode:** standard
**Depends on**: Phase 15
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05
**Success Criteria** (what must be TRUE):
  1. User tapping "Get Premium" sees a paywall screen that displays the subscription price, billing period, and a Day 1–7 free / Day 8 billed visual timeline — no toggle UI; tapping Subscribe initiates Apple in-app purchase and grants premium access on success
  2. User who previously subscribed taps "Restore Purchases" and regains premium access without initiating a new purchase; if no subscription is found, a plain-language message is shown
  3. Free user tapping the Articles entry point or AI Advisor entry point is redirected to the paywall; a premium user tapping the same entry points proceeds directly without seeing the paywall
  4. Closing and reopening the app preserves subscription status — premium access does not require re-purchase or re-restore after an app restart
**Plans**: 6 plans in 4 waves

Plans:

**Wave 1**
- [x] 16-01-PLAN.md — Package legitimacy checkpoint + install react-native-adapty + adapty.ts singleton (PAY-01)

**Wave 2** *(run in parallel)*
- [x] 16-02-PLAN.md — PremiumContext.tsx + AppNavigator Paywall/AIAdvisor routes + AIAdvisorScreen stub (PAY-04, AI-06)
- [ ] 16-03-PLAN.md — Adapty dashboard + App Store Connect setup + sandbox Apple ID (PAY-01, PAY-02, PAY-03) [human action]

**Wave 3** *(run in parallel, blocked on Wave 2)*
- [ ] 16-04-PLAN.md — PaywallScreen.tsx hybrid dark hero + white price card + purchase/restore wiring (PAY-01, PAY-02, PAY-03)
- [ ] 16-05-PLAN.md — App.tsx Adapty activation + PremiumProvider + DashboardScreen Intelligence section (PAY-04, PAY-05, AI-06)

**Wave 4** *(blocked on Wave 3)*
- [ ] 16-06-PLAN.md — tsc audit + security grep + on-device integration verification (PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, AI-06)

**UI hint**: yes

### Phase 17: AI Advisor — Backend
**Goal**: The app assembles an anonymized health context from AsyncStorage and invokes a Supabase Edge Function that calls Claude API server-side, returning a structured longevity report — no raw lab values leave the device, no Anthropic API key exists in the Expo bundle, and per-user rate limits are enforced
**Mode:** standard
**Depends on**: Phase 16
**Requirements**: AI-01, AI-02, AI-03
**Success Criteria** (what must be TRUE):
  1. Calling the Edge Function with a valid Supabase JWT returns a structured longevity report JSON — no `@anthropic-ai/sdk` import exists anywhere in the Expo project source
  2. The anonymized context payload assembled by `advisorContext.ts` contains no user name, no exact birthdate, no raw lab values with timestamps, and no Supabase user ID — only bucketed age, biomarker status categories, supplement names, and medication names
  3. A user who triggers report generation 6 times in one day receives a 429 response with a plain-language message on the sixth attempt; the first 5 succeed normally
**Plans**: TBD
**UI hint**: no

### Phase 18: AI Advisor — UI
**Goal**: Premium users can generate a longevity report from the Dashboard, read it as a 6-section card layout, and ask follow-up questions in a conversational chat interface scoped to that report — free users see the paywall when tapping the AI Advisor entry point
**Mode:** standard
**Depends on**: Phase 17
**Requirements**: AI-04, AI-05, AI-06
**Success Criteria** (what must be TRUE):
  1. A premium user tapping "AI Advisor" on the Dashboard triggers report generation; the completed report renders as 6 labeled cards: Score Summary, Priority Findings, Biomarker Analysis, Supplement & Medication Review, Recommendations (with evidence grades A/B/C), and a Follow-up Chat entry
  2. User can type a follow-up question in the chat interface and receive a response from Claude that references the generated report; sending a second question in the same session shows the conversation thread; closing and reopening the screen starts a fresh session with no prior messages
  3. A free user tapping "AI Advisor" sees the paywall — not an error, not a locked icon, not an empty screen
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 15 → 16 → 17 → 18

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. First-Run & Empty States | v1.0 | 3/3 | Complete | 2026-05-25 |
| 2. App Assets & Store Polish | v1.0 | 2/2 | Complete | 2026-05-25 |
| 3. UX Polish & TestFlight Prep | v1.0 | 3/3 | Complete | 2026-05-25 |
| 4. Supabase Foundation | v2.0 | 2/2 | Complete | 2026-05-30 |
| 5. Design Tokens & Icons | v2.0 | 3/3 | Complete | 2026-05-30 |
| 6. Warm UI Overhaul | v2.0 | 5/5 | Complete | 2026-05-31 |
| 7. Reference Data & Exercise Screen | v2.0 | 4/4 | Complete | 2026-06-01 |
| 8. Biomarker Sync Write Path | v2.0 | 3/3 | Complete | 2026-06-01 |
| 9. PhenoAge Fix & Release Quality | v2.0 | 3/3 | Complete | 2026-06-02 |
| 10. Apple Health + Articles | v3.0 | 5/5 | Complete | 2026-06-09 |
| 11. Supplement & Drug Database | v3.0 | 5/5 | Complete | 2026-06-09 |
| 12. Exercise UI Overhaul | v3.0 | 7/7 | Complete | 2026-06-08 |
| 13. UI / Design System | v3.0 | 6/6 | Complete | 2026-06-09 |
| 14. Auth & Login | v3.0 | 5/5 | Complete | 2026-06-09 |
| 15. Exercise Photos | v4.0 | 0/2 | Planned | - |
| 16. Adapty Paywall & Subscriptions | v4.0 | 2/6 | Executing | PremiumContext, routes, AIAdvisorScreen stub done |
| 17. AI Advisor — Backend | v4.0 | 0/TBD | Not started | - |
| 18. AI Advisor — UI | v4.0 | 0/TBD | Not started | - |
