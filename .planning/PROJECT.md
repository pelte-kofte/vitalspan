# Vitalspan

## What This Is

Vitalspan is a longevity tracking iOS app built by a licensed pharmacist. It lets users track biomarkers, manage a supplement/medication protocol, log and plan workouts with progressive overload tracking, and monitor their biological age via the Levine PhenoAge formula. Users receive push reminders for their protocol, trend charts on their biomarker history, and a premium AI Longevity Advisor powered by Claude. The target audience is longevity-curious individuals who want clinically credible guidance without a clinical background.

## Core Value

Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

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
- ✓ Supabase anonymous session, JWT refresh, zero secrets in source — Phase 4
- ✓ Clinical-premium design tokens + custom SVG tab icons — Phase 5
- ✓ Warm Beige UI on data/list screens; dark neural on LongevityScore — Phase 6
- ✓ Supabase-backed exercise library and biomarker definitions with static fallback — Phase 7
- ✓ Biomarker entries synced to Supabase with AsyncStorage fallback — Phase 8
- ✓ PhenoAge formula verified against Levine 2018 coefficients; tsc clean — Phase 9
- ✓ Live Apple HealthKit data in LongevityScore orbitals — Phase 10
- ✓ PubMed longevity articles personalized to biomarker profile — Phase 10
- ✓ 69 supplements + drug classes with evidence grades; 54+ interaction pairs — Phase 11
- ✓ 60-exercise SVG library with muscle maps, form cues, sets/reps — Phase 12
- ✓ Full clinical design system; consistent SVG icon set — Phase 13
- ✓ Supabase Auth (email/password + anonymous guest); anonymous→email promotion — Phase 14
- ✓ Exercise photos from yuhonas/free-exercise-db CDN; SVG fallback preserved — Phase 15
- ✓ Adapty paywall — free vs. premium tier, in-app purchase, 7-day trial timeline — Phase 16
- ✓ AI Advisor backend — Edge Function, zero-PII context assembler, rate limiting — Phase 17
- ✓ AI Advisor UI — 6-section report cards + follow-up chat interface — Phase 18
- ✓ Global UX fixes — keyboard, Dynamic Island, contrast, orbital CTAs, muscle diagram — Phase 19
- ✓ Protocol schema migration — type-correct supplements[]/medications[] sections; personal dose; edit/delete; "Custom" category removed — Phase 20
- ✓ Exercise Rutinim — Rutinim/Keşfet tab switch; drag-to-reorder personal routine (max 10); history edit/delete with full date; Sets/Reps/Weight capture; progressive overload sparkline — Phase 21
- ✓ Adherence streaks — current and all-time best on Protocol screen; daily evaluation — Phase 22
- ✓ Biomarker trend sparkline — 30/90/365-day toggle; optimal range band; 30-day free-tier cap + upgrade banner — Phase 22
- ✓ AI Advisor personal dose bucketing — supplementDetails with high/standard/low ratio; raw dose excluded — Phase 22
- ✓ Local push notifications — 4-slot AM/PM/Evening/Night reminders; time picker; permission request; daily reschedule — Phase 23
- ✓ Production EAS build — aps-environment: production; submitted to TestFlight; verified on device — Phase 23

### Active (v5.1+)

- [ ] Remote push notifications via Supabase push tokens (server-side lab reminders)
- [ ] Articles redesign — card/grid layout, search, AI personalization
- [ ] Multiple named exercise routines (Upper Body / Leg Day)
- [ ] Personal dose synced to Supabase
- [ ] AI-generated routine recommendations

### Out of Scope

- RevenueCat — switched to Adapty for better A/B paywall testing and analytics
- victory-native chart library — Skia peer conflict with Expo SDK 54; react-native-chart-kit sufficient
- date-fns / dayjs — built-in Date sufficient for all operations
- Raw dose string in AI Advisor context — pharmacist liability; bucketed values only
- Android support — iOS-only by architecture decision

## Context

**Current state (v5.0, 2026-06-19):** Vitalspan is a full-featured longevity iOS app on TestFlight with ~23,500 LOC TypeScript. Tech stack: React Native + Expo SDK 54, TypeScript strict, AsyncStorage + Supabase (anon + email auth), Adapty subscriptions, Claude API via Edge Function, expo-notifications, react-native-chart-kit, expo-health.

v5.0 shipped the first major personalization layer: a personal exercise routine with Sets/Reps/Weight logging and progressive overload sparklines, an editable protocol with adherence streaks and push notification reminders, biomarker trend charts with range-band overlays, 30-day free-tier data limits, and a production EAS build to TestFlight.

The app now has a viable business model (Adapty premium tier), a flagship AI feature (Claude-powered Longevity Advisor), and an active engagement loop (streaks + reminders). The next natural focus is retention (remote push, habit reinforcement) and growth (social proof, sharing, premium upsell optimization).

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
| Defer HealthKit to post-v1 | Mock layer already built; real entitlement complicates TestFlight submission | ✓ Good — real HealthKit shipped Phase 10 |
| AsyncStorage for v1 | No backend needed for single-device beta | ✓ Good — Supabase added as sync layer in v2 |
| Selective UI overhaul (not full redesign) | Preserve dark aesthetic on immersive screens; warm beige on data/list screens | ✓ Complete — Phase 6 |
| Supabase for reference data + user sync | Reference data (ranges, exercises) served from DB; user history synced with auth | ✓ Complete — ref data (Phase 7) + user biomarker sync (Phase 8) |
| exerciseService / biomarkerService Supabase-first with static fallback | Remote updates without app release; offline resilience | ✓ Phase 7 |
| Swipe-to-delete for exercise log (RNGH v2 Gesture.Pan) | Cleaner UX than long-press+Alert; no confirmation dialog needed for single-device local data | ✓ Phase 7 |
| Adapty over RevenueCat | Better A/B paywall testing, analytics dashboard, and more generous free tier | ✓ Good — Phase 16 |
| AI uses anonymized summary (not raw values) | Privacy-first: user health data stays local; only aggregated context sent to Claude API | ✓ Good — Phase 17 |
| Exercise photos: photos-where-available + SVG fallback | Avoids a full asset replacement; Phase 12 SVG work preserved for exercises without photo coverage | ✓ Good — Phase 15 |
| ProtocolItem unifies addedSupplements + customSupplements | Single source of truth for protocol; source discriminant ('db'|'manual') preserves origin | ✓ Good — Phase 20 |
| react-native-chart-kit for sparklines | Already installed; victory-native excluded due to Skia peer conflict with Expo SDK 54 | ✓ Good — Phase 21/22 |
| Personal dose AsyncStorage-only for v5.0 | Supabase sync deferred; raw dose string excluded from AI context for pharmacist liability | ✓ Good — Phase 20/22 |
| expo-notifications for local push (not remote) | Local reminders sufficient for v5.0 engagement loop; remote push deferred to v5.1+ | ✓ Good — Phase 23 |
| Biomarker history limits: 30-day cap for free users | Paywall proven first; then enforce limits to create upgrade incentive | ✓ Phase 22 |

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
*Last updated: 2026-06-19 after v5.0 milestone — all 31 v5.0 requirements validated and moved to Validated*
