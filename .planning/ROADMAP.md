# Roadmap: Vitalspan v2.0 — Premium, Backend & Exercise

## Milestones

- ✅ **v1.0 TestFlight** - Phases 1-3 (shipped 2026-05-25)
- 🚧 **v2.0 Premium, Backend & Exercise** - Phases 4-9 (in progress)

## Overview

v1 shipped a functional, credible prototype to TestFlight. v2 transforms it into a product: a secure Supabase-backed foundation is laid first (auth + secrets), then the visual layer is upgraded in two steps (token foundation, then warm-screen application), then the exercise screen and reference data tables are built on top of those foundations, then the biomarker write/sync path is added, and finally the PhenoAge formula is corrected and release quality is verified. Each phase delivers a coherent capability that the next phase can build on. The order eliminates rework — you never apply theme tokens before they exist, and you never write sync code before the auth layer is stable.

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

## Phases

**Phase Numbering:**
- Integer phases (4, 5, 6...): Planned milestone work
- Decimal phases (4.1, 4.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 4: Supabase Foundation** - Establish secure Supabase client, anonymous auth, and JWT lifecycle management (P1 complete; P2 complete)
- [x] **Phase 5: Design Tokens & Icons** - Add the Beige token block and custom SVG tab bar icons as visual building blocks for the UI overhaul (complete 2026-05-30)
- [x] **Phase 6: Warm UI Overhaul** - Apply Beige tokens to all list/data screens and add motivating empty states, preserving the dark neural aesthetic on immersive screens (complete 2026-05-31)
- [x] **Phase 7: Reference Data & Exercise Screen** - Seed Supabase reference tables and rebuild the exercise screen with library, log grouping, and intensity visuals (complete 2026-06-01)
- [x] **Phase 8: Biomarker Sync Write Path** - Add fire-and-forget Supabase sync for new biomarker entries and one-time migration of existing AsyncStorage history (complete 2026-06-01)
- [ ] **Phase 9: PhenoAge Fix & Release Quality** - Correct the biological age calculation and verify zero crashes and zero TypeScript errors before v2 submission

## Phase Details

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

**Cross-cutting constraints:**
- `react-native-url-polyfill/auto` must be first import in supabase.ts (P1 + P2 both reference this file)
- No Supabase URL or anon key in any source file — `process.env.EXPO_PUBLIC_*` only (P1, P2)

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
- [ ] 06-01-PLAN.md — Fix Colors.Beige.textMuted token + migrate SettingsScreen + AboutScreen (THEME-02, THEME-03, THEME-04, THEME-05)
- [ ] 06-02-PLAN.md — Migrate ProtocolScreen + upgrade empty state (THEME-02, THEME-04, THEME-05, THEME-06)

**Wave 2** *(blocked on Wave 1 completion, run in parallel)*
- [x] 06-03-PLAN.md — Migrate BiomarkerDetailScreen + BiomarkerEntryScreen (THEME-02, THEME-04, THEME-05)
- [x] 06-04-PLAN.md — Migrate ExerciseScreen + add motivating empty state (THEME-02, THEME-04, THEME-05, THEME-06)

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 06-05-PLAN.md — Migrate ProfileScreen + add motivating empty state + full phase audit + human visual checkpoint (THEME-02, THEME-03, THEME-04, THEME-05, THEME-06)

**Cross-cutting constraints:**
- Colors.Beige.textMuted must be fixed to '#6B6B64' (Plan 01) before any screen is verified
- Dark screens (DashboardScreen, LandingScreen, LongevityScoreScreen) must not be touched in any plan
- Every warm screen must have useFocusEffect + setStatusBarStyle('dark')

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

**Wave 2** *(blocked on Wave 1 — table contract must exist before service is written)*
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
- [ ] 09-P3-PLAN.md — Update 4 UI consumers for null biologicalAge + full flow iOS simulator verification + EAS preview build (QUAL-02)

**Cross-cutting constraints:**
- phenoAge.verify.ts is dev-only — not imported by any app code
- No new packages installed in any plan
- No AsyncStorage key changes

**UI hint**: no

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5 → 6 → 7 → 8 → 9
(Note: Phase 8 depends on Phase 4, not Phase 7 — can run in parallel with Phase 7 if needed)

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
| 9. PhenoAge Fix & Release Quality | v2.0 | 0/3 | Not started | - |
