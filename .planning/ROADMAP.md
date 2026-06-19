# Roadmap: Vitalspan

## Milestones

- ✅ **v1.0 TestFlight** - Phases 1-3 (shipped 2026-05-25)
- ✅ **v2.0 Premium, Backend & Exercise** - Phases 4-9 (complete 2026-06-02)
- ✅ **v3.0 Intelligence & Growth** - Phases 10-14 (complete 2026-06-09)
- ✅ **v4.0 Monetization & Intelligence** - Phases 15-18 (complete 2026-06-15)
- ✅ **v4.1 UX Quality Pass** - Phase 19 (complete 2026-06-15)
- ✅ **v5.0 Personalization & Production** - Phases 20-23 (complete 2026-06-19)

## Overview

v5.0 turned Vitalspan users from passive data viewers into active longevity managers: personal exercise routine with progressive overload tracking, editable protocol with adherence streaks and push notification reminders, biomarker trend sparklines, free-tier data limits, and a production EAS build to TestFlight.

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

**Plans**: 6 plans
**UI hint**: yes

### Phase 14: Auth & Login

**Goal**: Unauthenticated users are greeted by a Welcome screen and can sign up, log in, or continue as guest; authenticated users have session persistence, email verification, and their data linked to their Supabase `user_id` with anonymous data migrated on account creation
**Mode:** standard
**Depends on**: Phase 13
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09

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

<details>
<summary>✅ v4.0 Monetization & Intelligence (Phases 15-18) — COMPLETE 2026-06-15</summary>

**Milestone Goal:** Turn Vitalspan into a sustainable business — real exercise photography elevates the visual library, Adapty-powered subscriptions add a premium tier with Apple in-app purchase, and the AI Longevity Advisor (Claude API via Supabase Edge Function) becomes the flagship premium feature generating a structured health report and follow-up chat from anonymized context.

- [x] **Phase 15: Exercise Photos** - Add real CDN-hosted exercise photos to ExerciseDetailScreen with SVG fallback for unmapped exercises
- [x] **Phase 16: Adapty Paywall & Subscriptions** - Ship Adapty-powered in-app purchase with a compliant paywall screen, free/premium tier gating, and restore purchases
- [x] **Phase 17: AI Advisor — Backend** - Build the Supabase Edge Function, anonymized context assembler, and per-user rate limiting that powers the AI Longevity Advisor (completed 2026-06-14)
- [x] **Phase 18: AI Advisor — UI** - Deliver the AI Advisor premium screen with a 6-section report layout, follow-up chat, and subscription soft gate (completed 2026-06-15)

### Phase 15: Exercise Photos

**Goal**: ExerciseDetailScreen displays real JPG photos for exercises with a mapped photoKey, loaded from the yuhonas/free-exercise-db CDN — SVG illustrations remain as fallback for unmapped exercises and a neutral placeholder covers any remaining gaps
**Mode:** standard
**Depends on**: Phase 14
**Requirements**: EXP-01, EXP-02, EXP-03

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

**Plans**: 6 plans in 4 waves

Plans:

**Wave 1**

- [x] 16-01-PLAN.md — Package legitimacy checkpoint + install react-native-adapty + adapty.ts singleton (PAY-01)

**Wave 2** *(run in parallel)*

- [x] 16-02-PLAN.md — PremiumContext.tsx + AppNavigator Paywall/AIAdvisor routes + AIAdvisorScreen stub (PAY-04, AI-06)
- [x] 16-03-PLAN.md — Adapty dashboard + App Store Connect setup + sandbox Apple ID (PAY-01, PAY-02, PAY-03) [human action]

**Wave 3** *(run in parallel, blocked on Wave 2)*

- [x] 16-04-PLAN.md — PaywallScreen.tsx hybrid dark hero + white price card + purchase/restore wiring (PAY-01, PAY-02, PAY-03)
- [x] 16-05-PLAN.md — App.tsx Adapty activation + PremiumProvider + DashboardScreen Intelligence section (PAY-04, PAY-05, AI-06)

**Wave 4** *(blocked on Wave 3)*

- [x] 16-06-PLAN.md — tsc audit + security grep + on-device integration verification (PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, AI-06)

**UI hint**: yes

### Phase 17: AI Advisor — Backend

**Goal**: The app assembles an anonymized health context from AsyncStorage and invokes a Supabase Edge Function that calls Claude API server-side, returning a structured longevity report — no raw lab values leave the device, no Anthropic API key exists in the Expo bundle, and per-user rate limits are enforced
**Mode:** standard
**Depends on**: Phase 16
**Requirements**: AI-01, AI-02, AI-03

**Plans**: 4 plans in 2 waves

Plans:

**Wave 1** *(run in parallel)*

- [x] 17-01-PLAN.md — Supabase ai_usage migration (rate limit table + RLS) (AI-03)
- [x] 17-02-PLAN.md — advisorContext.ts: anonymized health context assembler (AI-01)

**Wave 2** *(blocked on Wave 1, run in parallel)*

- [x] 17-03-PLAN.md — ai-advisor Edge Function: JWT auth + rate limiting + Claude API proxy (AI-02, AI-03)
- [x] 17-04-PLAN.md — advisorService.ts: client wrappers + tsc audit (AI-02)

**UI hint**: no

### Phase 18: AI Advisor — UI

**Goal**: Premium users can generate a longevity report from the Dashboard, read it as a 6-section card layout, and ask follow-up questions in a conversational chat interface scoped to that report — free users see the paywall when tapping the AI Advisor entry point
**Mode:** standard
**Depends on**: Phase 17
**Requirements**: AI-04, AI-05, AI-06

**Plans**: 3 plans in 3 waves

Plans:

**Wave 1**

- [x] 18-01-PLAN.md — Create ScoreSummaryCard, ReportCard (with A/B/C grade badge logic), and ChatThread sub-components (AI-04, AI-05)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 18-02-PLAN.md — Rewrite AIAdvisorScreen: report generation flow, loading state, 6-section report layout, chat integration (AI-04, AI-05, AI-06)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 18-03-PLAN.md — TypeScript audit + source code quality checks + human visual verification of full flow (AI-04, AI-05, AI-06)

**UI hint**: yes

</details>

---

<details>
<summary>✅ v4.1 UX Quality Pass (Phase 19) — COMPLETE 2026-06-15</summary>

**Milestone Goal:** Ship a single-build bundle of cross-screen UX fixes identified post-v4.0 — keyboard overlap, Dynamic Island layout bugs, contrast issues, and missing interaction handlers — so the app feels polished before TestFlight submission.

- [x] **Phase 19: Global UX Fixes** - Fix 5 cross-screen UX bugs: keyboard overlap, Dynamic Island header, Dashboard contrast, LongevityScore orbital CTAs, and Exercise Detail muscle diagram removal

### Phase 19: Global UX Fixes

**Goal**: All identified post-v4.0 UX bugs are fixed in a single build — keyboard no longer obscures inputs, Dynamic Island no longer clips headers, "Movement Today" is readable, LongevityScore orbital CTAs are tappable with appropriate destination routing, and the low-quality muscle diagram is removed from ExerciseDetailScreen
**Mode:** standard
**Depends on**: Phase 18
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05

**Plans**: 6 plans in 3 waves

Plans:

**Wave 1**

- [x] 19-01-PLAN.md — Create OrbitalInfoModal component (UX-04)

**Wave 2** *(run in parallel, Wave 1 must complete first for 19-04)*

- [x] 19-02-PLAN.md — ExerciseDetailScreen: Dynamic Island header fix + muscle diagram removal (UX-02, UX-05)
- [x] 19-03-PLAN.md — DashboardScreen: Movement Today card contrast fix (UX-03)
- [x] 19-04-PLAN.md — LongevityScoreScreen: Sleep/HRV/Fitness orbital CTA handlers (UX-04)
- [x] 19-05-PLAN.md — ProtocolScreen: keyboard overlap fix + tap-outside dismiss (UX-01)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 19-06-PLAN.md — TypeScript audit + AIAdvisorScreen smoke-test + human visual verification (UX-01, UX-02, UX-03, UX-04, UX-05)

**UI hint**: yes

</details>

---

<details>
<summary>✅ v5.0 Personalization & Production (Phases 20-23) — COMPLETE 2026-06-19</summary>

**Milestone Goal:** Turn users from passive data viewers into active longevity managers — personal exercise routine with progressive overload tracking, editable protocol with adherence streaks and push notification reminders, biomarker trend sparklines, free-tier data limits, and a production EAS build to TestFlight.

- [x] **Phase 20: Protocol Schema Migration** - Migrate ProtocolState schema to type-correct sections, add personal dose fields, and remove the Custom category — the load-bearing change that unblocks all downstream v5.0 work (completed 2026-06-16)
- [x] **Phase 21: Exercise Routine & History** - Deliver the personal Rutinim tab with add/reorder/remove, full-date history, edit/delete log entries, weightKg/reps data model, and per-exercise progressive overload sparklines (completed 2026-06-17)
- [x] **Phase 22: Engagement & Visualization** - Ship adherence streak counters, biomarker trend charts with range bands, free-tier data limits, and personal dose bucketing in AI Advisor context (completed 2026-06-18)
- [x] **Phase 23: Notifications & Production Build** - Configure push notification entitlements, implement AM/PM/Evening/Night local reminders with per-slot toggle and time picker, and produce the EAS production build for TestFlight submission (completed 2026-06-19)

### Phase 20: Protocol Schema Migration

**Goal**: ProtocolState stores supplements and medications in type-correct sections with optional personal dose per item — the Custom category is gone and the schema is stable for all Phase 22-23 consumers
**Depends on**: Phase 19
**Requirements**: PROT-04, PROT-01, PROT-02, PROT-03

**Plans**: 3 plans in 3 waves

Plans:

**Wave 1**

- [x] 20-01-PLAN.md — Create src/types/protocol.ts with ProtocolItem, ProtocolState, TimeSlot, EMPTY_PROTOCOL (PROT-01, PROT-04)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 20-02-PLAN.md — Migrate ProtocolScreen to new schema: migrateProtocol(), EditSupplementSheet, EditMedicationSheet, remove Custom category, remove inline med timing chips (PROT-01, PROT-02, PROT-03, PROT-04)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 20-03-PLAN.md — Update InteractionCheckerScreen + advisorContext.ts to read from supplements[]; full tsc audit (PROT-02, PROT-03)

**UI hint**: yes

### Phase 21: Exercise Routine & History

**Goal**: Users have a personal Rutinim tab with up to 10 exercises they can add, order, and remove; history entries show full dates with weight/reps captured per set; users can edit and delete past entries; exercise cards in the routine show last-session load and a weekly overload trend sparkline
**Depends on**: Phase 20
**Requirements**: ROUT-01, ROUT-02, ROUT-03, ROUT-04, ROUT-05, HIST-01, HIST-02, HIST-03, HIST-04, OVLD-01, OVLD-02, OVLD-03

**Plans**: 5 plans in 3 waves

Plans:

**Wave 1**

- [x] 21-01-PLAN.md — SetRecord interface + setsData on ExerciseLogEntry + drag-to-reorder dependency (HIST-04)

**Wave 2** *(blocked on Wave 1, run in parallel)*

- [x] 21-02-PLAN.md — QuickLogModal: replace intensity chips with Sets/Reps/Weight inputs + write setsData on save (HIST-04)
- [x] 21-03-PLAN.md — SwipeableLogRow: full-date display + onEdit prop + tap-to-edit (HIST-01, HIST-02, HIST-03)

**Wave 3** *(blocked on Wave 2, run in parallel)*

- [x] 21-04-PLAN.md — ExerciseScreen: Rutinim/Kesfet toggle, routine CRUD, Rutinim cards, Kesfet add button, edit-log sheet (ROUT-01 to ROUT-05, HIST-01, HIST-02, HIST-03, OVLD-01, OVLD-02)
- [x] 21-05-PLAN.md — ExerciseDetailScreen: 8-week progressive overload sparkline (LineChart) (OVLD-03)

**UI hint**: yes

### Phase 22: Engagement & Visualization

**Goal**: Users see their adherence streak on the Protocol screen, biomarker trends as sparkline charts with range band overlays on BiomarkerDetailScreen, and non-premium users see a 30-day data limit enforced with an upgrade banner; AI Advisor context includes personal dose bucketing
**Depends on**: Phase 20
**Requirements**: STRK-01, STRK-02, STRK-03, TRND-01, TRND-02, TRND-03, DLIM-01, DLIM-02, PROT-05

**Plans**: 3 plans in 1 wave

Plans:

**Wave 1** *(run in parallel — zero file overlap)*

- [x] 22-01-PLAN.md — ProtocolState streak fields + ProtocolScreen streak evaluation & stat row (STRK-01, STRK-02, STRK-03)
- [x] 22-02-PLAN.md — BiomarkerDetailScreen trend chart + SVG range band + 30/90/365 toggle + 30-day free-tier cap & upgrade banner (TRND-01, TRND-02, TRND-03, DLIM-01, DLIM-02)
- [x] 22-03-PLAN.md — advisorContext.ts personal dose bucketing (supplementDetails) (PROT-05)

**UI hint**: yes

### Phase 23: Notifications & Production Build

**Goal**: Users can independently toggle and time AM/PM/Evening/Night push reminders for their protocol; the app requests notification permission gracefully on first toggle; scheduled notifications repeat daily and survive app updates; app.json includes the production push entitlement; an EAS production build is submitted to TestFlight
**Depends on**: Phase 22
**Requirements**: PROD-01, NTFY-01, NTFY-02, NTFY-03, NTFY-04, PROD-02

**Plans**: 4 plans in 3 waves

Plans:

**Wave 1**

- [x] 23-01-PLAN.md — Install expo-notifications + configure app.json (aps-environment: production + expo-notifications plugin) + create src/lib/notifications.ts (PROD-01)

**Wave 2** *(blocked on Wave 1, run in parallel)*

- [x] 23-02-PLAN.md — Wire App.tsx: module-scope setNotificationHandler + reschedule useEffect (NTFY-04)
- [x] 23-03-PLAN.md — ProtocolScreen Reminders section: 4-slot toggle + time picker + permission flow (NTFY-01, NTFY-02, NTFY-03)

**Wave 3** *(blocked on Wave 2)*

- [x] 23-04-PLAN.md — Pre-build audit + EAS production build + TestFlight submission + device verification (PROD-02)

**UI hint**: yes

</details>

---

## Progress

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
| 15. Exercise Photos | v4.0 | 2/2 | Complete | 2026-06-13 |
| 16. Adapty Paywall & Subscriptions | v4.0 | 6/6 | Complete | 2026-06-13 |
| 17. AI Advisor — Backend | v4.0 | 4/4 | Complete | 2026-06-14 |
| 18. AI Advisor — UI | v4.0 | 3/3 | Complete | 2026-06-15 |
| 19. Global UX Fixes | v4.1 | 6/6 | Complete | 2026-06-15 |
| 20. Protocol Schema Migration | v5.0 | 3/3 | Complete | 2026-06-16 |
| 21. Exercise Routine & History | v5.0 | 5/5 | Complete | 2026-06-17 |
| 22. Engagement & Visualization | v5.0 | 3/3 | Complete | 2026-06-18 |
| 23. Notifications & Production Build | v5.0 | 4/4 | Complete | 2026-06-19 |
