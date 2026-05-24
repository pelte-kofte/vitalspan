# Vitalspan

## What This Is

Vitalspan is a longevity tracking iOS app built by a licensed pharmacist. It lets users track biomarkers, manage a supplement/medication protocol, log workouts, and monitor their biological age via the Levine PhenoAge formula. The target audience is longevity-curious individuals who want clinically credible guidance without a clinical background.

## Core Value

Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

## Requirements

### Validated

- ✓ Biomarker tracking with longevity-optimized ranges (not standard lab normals)
- ✓ Levine PhenoAge biological age calculation
- ✓ Supplement/medication protocol with pharmacist-verified interaction checking
- ✓ Exercise logging with intensity and calorie estimation
- ✓ LongevityScore screen with orbital data visualization
- ✓ Medical disclaimer wired at app launch (AsyncStorage-gated, accepts once)
- ✓ About screen with pharmacist branding and citation list
- ✓ Onboarding flow (name, age, sex, goal, conditions, medications)
- ✓ EAS build configured, TestFlight-ready build pipeline

### Active

- [ ] Guided first-run: after onboarding, walk user through entering Glucose, HbA1c, Cholesterol with per-biomarker explanation cards
- [ ] Custom app icon: Vitalspan-branded icon replacing Expo default
- [ ] Custom splash screen: branded splash image, replacing solid-color fallback
- [ ] Empty state improvements: meaningful empty state UI on Dashboard and Biomarkers when no data is entered
- [ ] About screen polish: pharmacist credential section with more detail, app mission statement
- [ ] General UX polish pass: verify all screens render correctly on iPhone 15 / 16 form factors, fix any layout overflows

### Out of Scope

- Real Apple HealthKit integration — deferred post-v1 (mock layer ready, just not wired to native)
- RevenueCat paywall — deferred until app has traction with beta users
- Push notifications — deferred post-v1 TestFlight feedback
- Supabase backend — deferred; AsyncStorage is sufficient for v1 beta
- Trend charts (BiomarkerDetail sparklines) — deferred; useful but not blocking TestFlight

## Context

This is a subsequent milestone — the core app is built and functional. The v1 TestFlight milestone is a quality and onboarding milestone, not a feature milestone. The gap is that non-clinical lay users (longevity-curious friends/family) open the app, see empty state everywhere, and don't know what to do or why any of it matters.

The guided first-run is the highest-leverage item: it turns a confusing empty dashboard into a purposeful first interaction. The pharmacist credibility signal (About screen, branding) matters for this audience because they'll ask "who made this and why should I trust the ranges?"

EAS build is already working. The bottleneck is app readiness, not build infrastructure.

**Tech environment:** React Native + Expo ~54, TypeScript strict, AsyncStorage, expo-haptics, expo-linear-gradient. iOS only. No Android.

## Constraints

- **Tech Stack**: Expo SDK ~54 — no new packages without checking Expo SDK 54 compatibility first
- **AsyncStorage Keys**: Must preserve existing keys (`@vitalspan_*`) — changing them would break existing installations
- **iOS Only**: No Android support planned or configured
- **Pharmacist-first**: Every biomarker range, interaction warning, and recommendation must be clinically defensible

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Guided first-run for Glucose, HbA1c, Cholesterol | Most common annual checkup values — lay users are likely to have these | — Pending |
| Defer HealthKit to post-v1 | Mock layer already built; adding real HealthKit entitlement complicates first TestFlight submission | — Pending |
| AsyncStorage for v1 | No backend needed for single-device beta testing; reduces surface area | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-25 after initialization*
