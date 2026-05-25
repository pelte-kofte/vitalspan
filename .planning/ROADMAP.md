# Roadmap: Vitalspan v1 TestFlight

## Overview

The core app is built. This milestone closes the gap between a working prototype and a TestFlight-ready product. Three phases: wire the guided first-run so new users get immediate clinical value, replace placeholder assets with branded ones, then verify every screen renders correctly on current iPhone form factors. When all three phases complete, the build ships to TestFlight.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: First-Run & Empty States** - Guide new users to their first clinical insight immediately after onboarding
- [ ] **Phase 2: App Assets & Store Polish** - Replace placeholder assets with branded ones and strengthen pharmacist credibility signals
- [ ] **Phase 3: UX Polish & TestFlight Prep** - Verify all screens on current iPhone form factors and eliminate blocking layout issues

## Phase Details

### Phase 1: First-Run & Empty States
**Goal**: New users arrive at a purposeful, guided experience — not a blank dashboard
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FIRST-01, FIRST-02, FIRST-03, FIRST-04, EMPTY-01, EMPTY-02
**Success Criteria** (what must be TRUE):
  1. User completing onboarding is immediately shown a guided flow prompting Glucose, HbA1c, and Cholesterol — not a blank dashboard
  2. Each biomarker step shows a plain-English card explaining why that value matters for longevity before the entry input
  3. User can skip the guided flow and re-trigger it from the Dashboard empty state CTA
  4. After completing the guided flow, Dashboard displays entered data and FutureSelf transitions to partial-progress state (checklist with logged items checked; full biological age unlocks once 5+ PhenoAge biomarkers are logged)
  5. Biomarkers tab shows an explanatory empty state with "Start tracking" CTA when no entries exist
**Plans**: 3 plans in 2 waves
**UI hint**: yes

Plans:

**Wave 1**
- [x] 01-01-PLAN.md — Data + GuidedFirstRunScreen + navigation wiring (FIRST-01, FIRST-02, FIRST-03, FIRST-04)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02-PLAN.md — Dashboard and Biomarkers tab empty states (EMPTY-01, EMPTY-02, FIRST-03 re-trigger)
- [x] 01-03-PLAN.md — BiomarkerEntry explanation card + SettingsScreen key registration (FIRST-02, FIRST-03)

**Cross-cutting constraints:**
- All files use `Colors.*` tokens — no hardcoded hex values
- All spacing from `Spacing.*` — no hardcoded margin/padding numbers
- `@vitalspan_first_run_complete` written as string `'true'`, read with `=== 'true'` comparison

### Phase 2: App Assets & Store Polish
**Goal**: The app looks and reads like a credible, pharmacist-built product — not an Expo starter
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: ASSET-01, ASSET-02, STORE-01, STORE-02, STORE-03, STORE-04
**Success Criteria** (what must be TRUE):
  1. App icon on device home screen shows the custom Vitalspan brand mark (green palette, no Expo default)
  2. Launch sequence shows the branded Vitalspan splash with app name and tagline — not a solid-color fallback
  3. About screen includes pharmacist name placeholder, PharmD designation, and practice focus statement
  4. About screen shows a visible "Why we built this" mission statement without requiring any expand action
  5. About screen shows medical disclaimer acceptance date and app version matching app.json
**Plans**: 2 plans in 1 wave

Plans:

**Wave 1** *(both plans are independent — run in parallel)*
- [x] 02-01-PLAN.md — App icon + splash screen generation scripts + app.json splash config (ASSET-01, ASSET-02)
- [x] 02-02-PLAN.md — AboutScreen: dynamic version, credential expansion, always-visible Why section, Legal card (STORE-01, STORE-02, STORE-03, STORE-04)

### Phase 3: UX Polish & TestFlight Prep
**Goal**: Every screen renders correctly on iPhone 15 Pro and iPhone 16 Plus — no layout breaks block the TestFlight submission
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: POLISH-01, POLISH-02, POLISH-03
**Success Criteria** (what must be TRUE):
  1. No screen has overflow, clipping, or layout breaks on iPhone 15 Pro (6.1") or iPhone 16 Plus (6.7") form factors
  2. Completing onboarding on a fresh install navigates reliably to Main tabs — no stuck loading state
  3. Protocol tab shows a meaningful empty state message when no medications or supplements are added
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. First-Run & Empty States | 3/3 | Complete ✓ | 2026-05-25 |
| 2. App Assets & Store Polish | 2/2 | Complete ✓ | 2026-05-25 |
| 3. UX Polish & TestFlight Prep | 0/TBD | Not started | - |
