# Vitalspan

## What This Is

Vitalspan is a longevity tracking iOS app built by a licensed pharmacist. It lets users track biomarkers, manage a supplement/medication protocol, log workouts, and monitor their biological age via the Levine PhenoAge formula. The target audience is longevity-curious individuals who want clinically credible guidance without a clinical background.

## Core Value

Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

## Current Milestone: v3.0 — Intelligence & Growth

**Goal:** Elevate Vitalspan from a manual-entry tracker to an intelligent longevity platform — live Apple Health data, PubMed-powered longevity articles, a complete supplement/drug interaction database, fitness-app-quality exercise UI, a clinical design system, and full Supabase authentication.

**Target features:**
- Apple HealthKit integration — live HRV, sleep, recovery, glucose, fitness data replacing demo orbitals in LongevityScore
- PubMed NCBI article feed — longevity/PhenoAge/healthspan articles cached in Supabase, personalized by user biomarkers
- Expanded supplement + drug database — 8 longevity supplements, 5 drug classes, evidence grades, interaction checker
- Exercise UI overhaul — per-exercise SVG illustrations, muscle maps, form cues, longevity-optimized sets/reps
- Clinical design system — intentional color tokens, full SVG neural-dot icon system, typography audit
- Full Supabase Auth — sign up/login/reset/verify, session persistence, guest mode, profile linked to user ID

## Requirements

### Validated

- ✓ Biomarker tracking with longevity-optimized ranges (not standard lab normals) — v1
- ✓ Levine PhenoAge biological age calculation — v1
- ✓ Supplement/medication protocol with pharmacist-verified interaction checking — v1
- ✓ Exercise logging with intensity and calorie estimation — v1
- ✓ LongevityScore screen with orbital data visualization — v1
- ✓ Medical disclaimer wired at app launch (AsyncStorage-gated, accepts once) — v1
- ✓ About screen with pharmacist branding and citation list — v1
- ✓ Onboarding flow (name, age, sex, goal, conditions, medications) — v1
- ✓ EAS build configured, TestFlight-ready build pipeline — v1
- ✓ Guided first-run flow for Glucose, HbA1c, Cholesterol — Phase 1
- ✓ Motivating empty states on Dashboard and Biomarkers tab — Phase 1
- ✓ Custom Vitalspan app icon and branded splash screen — Phase 2
- ✓ About screen pharmacist credential section and mission statement — Phase 2
- ✓ UX polish pass — all screens verified on iPhone 15/16 form factors — Phase 3

### Active

- [ ] Selective UI/UX overhaul — warm beige/cream on list screens, cards, modals; dark preserved on LongevityScore and orbital dashboard
- ✓ Custom SVG tab bar icons replacing emoji placeholders — Phase 5
- [ ] Premium card layouts across all screens
- [ ] Motivating empty states on all remaining screens
- ✓ Supabase biomarker reference data table (longevity-optimized ranges served from DB) — Phase 7
- ✓ Supabase exercise database (exercise library with metadata, static fallback) — Phase 7
- ✓ New purpose-built exercise screen — daily log (Today/This Week/History), library, intensity visuals, swipe-to-delete — Phase 7
- ✓ User biomarker history synced to Supabase — syncEntry (fire-and-forget), migrateHistory (one-time, idempotent), Dashboard Supabase-first pull — Phase 8
- [ ] PhenoAge formula fix — correct calculation returning wrong biological age values
- [ ] Security — Supabase URL + anon key in `.env` file, not hardcoded in source
- [ ] Release quality — zero crashes, TypeScript strict, no `any` types

- ✓ Live Apple HealthKit data in LongevityScore orbitals (HRV, sleep, recovery, glucose, fitness) — Phase 10
- ✓ PubMed-powered longevity articles personalized to user biomarker profile — Phase 10
- ✓ Expanded supplement/drug database — 69 entries, mechanismOfAction/longevityRelevance fields, SupplementLibrarySection with search + collapsible categories — Phase 11
- ✓ 54 pharmacist-reviewed drug/supplement interaction pairs with actionable recommendations — Phase 11
- ✓ InteractionChecker auto-populate from user protocol stack + medication drug-class resolution — Phase 11
- ✓ Full Supabase Auth — WelcomeScreen (dark neural hero + bottom-sheet forms), sign up (anonymous→email promotion via updateUser), log in, forgot password, email verification banner + one-time toast, guest mode card, session-type cold-start routing, logout (AsyncStorage preserved) — Phase 14

### Out of Scope

- RevenueCat paywall — deferred until beta user traction
- Push notifications — deferred post-v2 TestFlight feedback
- Full AsyncStorage replacement — user data syncs to Supabase but AsyncStorage keys preserved as fallback/offline
- Trend charts (BiomarkerDetail sparklines) — deferred; not blocking v2
- Android support — iOS-only by architecture decision

## Context

v1 TestFlight shipped. The app is functional and credible but shows its prototype origins: no consistent design language, wrong biological age calculations, no real backend, and a workout screen that doesn't reflect the exercise database. v2 is the quality milestone — it should feel like a product, not a prototype.

The Supabase project is provisioned: `PROJECT-REF-REDACTED`. Integration scope for v2 is reference data (biomarker ranges, exercise DB) plus user biomarker history sync with auth. AsyncStorage keys are preserved for offline resilience.

The selective UI overhaul preserves the dark neural aesthetic on immersive/branded screens (LongevityScore orbital, dashboard cards) while introducing warm beige/cream on navigational and data-entry screens where readability matters more than atmosphere.

**Tech environment:** React Native + Expo ~54, TypeScript strict, AsyncStorage + Supabase, expo-haptics, expo-linear-gradient. iOS only. No Android.

## Constraints

- **Tech Stack**: Expo SDK ~54 — no new packages without checking Expo SDK 54 compatibility first
- **AsyncStorage Keys**: Must preserve existing `@vitalspan_*` keys — they are fallback/offline layer even as Supabase sync is added
- **iOS Only**: No Android support planned or configured
- **Pharmacist-first**: Every biomarker range, interaction warning, and recommendation must be clinically defensible
- **Supabase Project**: `PROJECT-REF-REDACTED` — use `@supabase/supabase-js` compatible with Expo SDK 54
- **Security**: No API keys or secrets in source — `.env` + `expo-constants` or `process.env`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Guided first-run for Glucose, HbA1c, Cholesterol | Most common annual checkup values — lay users are likely to have these | ✓ Good — shipped Phase 1 |
| Defer HealthKit to post-v1 | Mock layer already built; real entitlement complicates TestFlight submission | ✓ Good — still deferred |
| AsyncStorage for v1 | No backend needed for single-device beta | ✓ Good — now adding Supabase as sync layer in v2 |
| Selective UI overhaul (not full redesign) | Preserve dark aesthetic on immersive screens; warm beige on data/list screens | ✓ Complete — Phase 6 |
| Supabase for reference data + user sync | Reference data (ranges, exercises) served from DB; user history synced with auth | ✓ Complete — ref data (Phase 7) + user biomarker sync (Phase 8) |
| exerciseService / biomarkerService Supabase-first with static fallback | Remote updates without app release; offline resilience | ✓ Phase 7 |
| Swipe-to-delete for exercise log (RNGH v2 Gesture.Pan) | Cleaner UX than long-press+Alert; no confirmation dialog needed for single-device local data | ✓ Phase 7 |

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
*Last updated: 2026-06-08 after Phase 12 complete — Exercise UI Overhaul: 60 SVG illustrations, MuscleMapView, ExerciseDetailScreen with pharmacist-approved longevity content, muscle map filter, weekly movement summary on Dashboard.*
