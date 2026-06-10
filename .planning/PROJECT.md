# Vitalspan

## What This Is

Vitalspan is a longevity tracking iOS app built by a licensed pharmacist. It lets users track biomarkers, manage a supplement/medication protocol, log workouts, and monitor their biological age via the Levine PhenoAge formula. The target audience is longevity-curious individuals who want clinically credible guidance without a clinical background.

## Core Value

Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.

## Current Milestone: v4.0 — Monetization & Intelligence

**Goal:** Turn Vitalspan into a sustainable business — ship Adapty-powered subscriptions, an AI Longevity Advisor backed by Claude API, and real exercise photography to elevate the visual quality of the exercise library.

**Target features:**
- Adapty paywall & subscription — free vs. premium tiers, in-app purchase, paywall screen soft-gating premium features
- AI Longevity Advisor (Claude API) — generated report analyzing biomarkers + supplement stack + medications, follow-up chat interface; premium-only
- Exercise photos — real photos from `yunohas/free-exercise-db` (public domain) where available; Phase 12 SVG illustrations remain as fallback

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

### Active (v4.0)

- [ ] Adapty paywall — free vs. premium tier, in-app purchase flow, paywall screen (PAY-01 through PAY-05)
- [ ] AI Longevity Advisor — Claude API report + follow-up chat, anonymized health context, premium-only (AI-01 through AI-05)
- [ ] Exercise photos — real photos from `yunohas/free-exercise-db` where available; Phase 12 SVG illustrations remain as fallback (EXP-01 through EXP-03)

### Out of Scope

- RevenueCat — switched to Adapty for better A/B paywall testing and analytics
- Push notifications — still deferred; not in v4.0 scope
- Biomarker history limits enforcement — paywall ships first; limits deferred to follow-up
- Full AsyncStorage replacement — user data syncs to Supabase but AsyncStorage keys preserved as fallback/offline
- Trend charts (BiomarkerDetail sparklines) — deferred
- Android support — iOS-only by architecture decision

## Context

v3.0 shipped a complete intelligent longevity platform: live HealthKit data, PubMed articles, 60-exercise SVG UI with muscle maps, expanded supplement/drug database (69 entries, 54 interactions), clinical design system, and full Supabase Auth. The app is now production-quality and ready to monetize.

v4.0 is the business milestone. Adapty replaces the originally planned RevenueCat — Adapty was chosen for its paywall A/B testing, better analytics dashboard, and more generous free tier. The AI Longevity Advisor is the flagship premium feature: it sends an anonymized summary of the user's health data (latest biomarker values aggregated, supplement stack, medications) to Claude API and returns a structured report with evidence-based recommendations, plus a follow-up conversational interface. Raw health values are NOT sent — privacy is preserved.

The exercise photo upgrade uses the `yunohas/free-exercise-db` GitHub repository (public domain MIT license), which provides GIF/photo assets for common exercises. SVG illustrations from Phase 12 are preserved as fallback wherever photos are unavailable.

**Tech environment:** React Native + Expo ~54, TypeScript strict, AsyncStorage + Supabase, Adapty SDK, Claude API (`@anthropic-ai/sdk`), expo-haptics, expo-linear-gradient. iOS only. No Android.

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
| Adapty over RevenueCat | Better A/B paywall testing, analytics dashboard, and more generous free tier | — Pending |
| AI uses anonymized summary (not raw values) | Privacy-first: user health data stays local; only aggregated context sent to Claude API | — Pending |
| Biomarker history limits deferred | Paywall ships first; enforce limits in a follow-up phase once subscription infra is proven | — Pending |
| Exercise photos: photos-where-available + SVG fallback | Avoids a full asset replacement; Phase 12 SVG work preserved for exercises without photo coverage | — Pending |

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
*Last updated: 2026-06-10 after milestone v4.0 start — Monetization & Intelligence: Adapty paywall, AI Longevity Advisor (Claude API), exercise photo upgrade.*
