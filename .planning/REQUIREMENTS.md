# Requirements: Vitalspan v1 TestFlight

**Defined:** 2026-05-25
**Core Value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

## v1 Requirements

### First-Run Experience

- [ ] **FIRST-01**: After onboarding completes, user is shown a guided "Enter your first labs" flow prompting Glucose, HbA1c, and Cholesterol in sequence
- [ ] **FIRST-02**: Each biomarker in the guided flow shows a plain-English explanation card ("Why this matters for longevity") before the entry input
- [ ] **FIRST-03**: Guided flow can be skipped ("Do this later") and re-triggered from Dashboard empty state
- [ ] **FIRST-04**: Completing the guided flow navigates user to Dashboard with data visible and Longevity Score card unlocked

### App Assets

- [ ] **ASSET-01**: App icon (icon.png) replaced with custom Vitalspan-branded icon (green palette, `#2D6A4F` primary)
- [ ] **ASSET-02**: Splash screen replaced with branded Vitalspan splash (app name, tagline "Track your biological age", `Colors.bg` background)

### Empty States

- [ ] **EMPTY-01**: Dashboard shows a purposeful empty state card when no biomarker data exists — prompt with "Add your first biomarker" CTA navigating to the guided first-run flow
- [ ] **EMPTY-02**: Biomarkers tab shows an empty state with brief explanation and "Start tracking" CTA when no entries exist

### App Store Polish

- [ ] **STORE-01**: About screen includes expanded pharmacist credential section: name placeholder, PharmD designation, practice focus statement
- [ ] **STORE-02**: About screen includes a concise app mission statement ("Why we built this") section visible without expanding
- [ ] **STORE-03**: Medical disclaimer version and acceptance date shown in About screen under a "Legal" section
- [ ] **STORE-04**: App version in About screen matches `app.json` version field

### UX Polish

- [ ] **POLISH-01**: All screens render correctly on iPhone 15 Pro (6.1") and iPhone 16 Plus (6.7") form factors — no overflow, clipping, or layout breaks
- [ ] **POLISH-02**: Onboarding completion reliably navigates to Main tabs (no stuck loading state on first launch)
- [ ] **POLISH-03**: Protocol tab shows appropriate empty state message when no medications or supplements are added

## v2 Requirements (Deferred)

### Apple HealthKit

- **HK-01**: User can connect Apple Health to pull HRV, sleep, steps automatically
- **HK-02**: HealthKit data populates LongevityScore orbitals without manual entry
- **HK-03**: User can disconnect HealthKit and revert to manual-only mode

### Monetization

- **PAY-01**: Premium features gated behind RevenueCat subscription paywall
- **PAY-02**: Free tier: biomarker tracking (up to 5), no protocol or score
- **PAY-03**: Premium tier: full access, interaction checker, longevity score

### Notifications

- **NOTIF-01**: Daily protocol reminder at user-configured time
- **NOTIF-02**: Weekly "update your labs" nudge if no biomarkers entered in 30 days

### Backend

- **SUPA-01**: User account creation and authentication via Supabase
- **SUPA-02**: Biomarker history synced to Supabase (replaces AsyncStorage)
- **SUPA-03**: Protocol synced across devices

## Out of Scope

| Feature | Reason |
|---------|--------|
| Android support | iOS-only by architecture decision |
| Real-time data sync | No backend in v1; AsyncStorage is sufficient for single-device beta |
| Social / sharing features | Not core to longevity tracking use case |
| Wearable integrations (Garmin, Whoop) | High complexity; Apple Health is the natural integration point |
| In-app AI chat / advice | Regulatory risk; pharmacist-reviewed static content only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIRST-01 | Phase 1 | Pending |
| FIRST-02 | Phase 1 | Pending |
| FIRST-03 | Phase 1 | Pending |
| FIRST-04 | Phase 1 | Pending |
| ASSET-01 | Phase 2 | Pending |
| ASSET-02 | Phase 2 | Pending |
| EMPTY-01 | Phase 1 | Pending |
| EMPTY-02 | Phase 1 | Pending |
| STORE-01 | Phase 2 | Pending |
| STORE-02 | Phase 2 | Pending |
| STORE-03 | Phase 2 | Pending |
| STORE-04 | Phase 2 | Pending |
| POLISH-01 | Phase 3 | Pending |
| POLISH-02 | Phase 3 | Pending |
| POLISH-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-25*
*Last updated: 2026-05-25 — roadmap created, all 15 requirements mapped*
