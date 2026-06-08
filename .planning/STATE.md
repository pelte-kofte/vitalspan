# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-30)

**Core value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.
**Current focus:** v3.0 — Intelligence & Growth (roadmap created, ready for Phase 10 planning)

## Current Position

Phase: 13 (Not started — Phase 12 complete 2026-06-08)
Plan: Phase 13 not yet planned.
Status: Phase 12 complete. Ready for Phase 13 (UI / Design System).
Last activity: 2026-06-08 — Phase 12 complete: Exercise UI Overhaul — 60 SVG illustrations, MuscleMapView, ExerciseDetailScreen, muscle map filter, weekly movement summary. 3 code review bugs fixed (exerciseService field mapping, illustrationId typo, QuickLogModal error handling). 6/6 requirements verified (EX-01–EX-06). Visual approved.

Progress: [██████████] 100% Phase 12 planned → ready to execute

## Performance Metrics

**Velocity:**
- Total plans completed: 8 (v1 phases 1-3)
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 (v1) | 3/3 | - | - |
| 2 (v1) | 2/2 | - | - |
| 3 (v1) | 3/3 | - | - |

**Recent Trend:**
- Last 5 plans: v1 execution (all complete)
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v2.0: Supabase anonymous auth only (no email/password UI) — email upgrade deferred to v3
- v2.0: AsyncStorage keys preserved as offline fallback layer — Supabase is additive, not replacement
- v2.0: Selective UI overhaul — warm beige on list/data screens, dark neural untouched on LongevityScore + orbital
- v2.0: API keys in `.env` only — `process.env.EXPO_PUBLIC_*` exclusively
- 04-P1: JSDoc header placed after polyfill import (line 2+) — polyfill must be absolute line 1; takes precedence over "JSDoc before first import" style note
- 04-P1: Anonymous-only auth for v2 — initSupabaseSession() uses signInAnonymously() guarded by prior getSession() check to avoid clobbering returning users' sessions
- 04-P2: initSupabaseSession() is fire-and-forget (.catch(() => null)) — session establishment must never block the loading spinner resolving
- 04-P2: Route determination (setInitialRoute) runs before initSupabaseSession() — AsyncStorage profile check is the gating dependency, Supabase is non-blocking
- 08-P1: biomarker_entries id column is text PK — preserves AsyncStorage-generated string IDs, no UUID remapping
- 08-P1: biomarker_entries is append-only — SELECT + INSERT RLS policies only, no UPDATE or DELETE from client
- v3.0: HealthKit mock layer already in src/lib/healthkit.ts — Phase 10 upgrades the mock to real expo-health entitlement
- v3.0: Articles cached in Supabase articles table — avoid repeat PubMed API calls; 24-hour background refresh ceiling
- v3.0: Auth uses linkIdentity() for anonymous-to-authenticated migration — existing local data preserved on account creation
- 10-03: permissionState derived from hasRequestedHealthKit flag on every focus — ensures ProfileScreen disconnect reflects on next LongevityScore open
- 10-03: handleDismissPrompt sets permissionState to 'granted' (not a separate dismissed state) — empty orbitals with no prompt is user's chosen state
- 10-03: iOS empty HRV probe heuristic used to detect denial — iOS privacy design prevents direct denial status reporting
- 10-04: onPress callback passed to ArticleCard from ArticlesScreen — WebBrowser import stays in ArticlesScreen, not in ArticleCard
- 10-04: cancelled flag in ArticlesScreen useEffect prevents state updates after unmount
- 10-04: Research CTA uses style composition [s.uploadCard, s.researchCard] — researchCard only overrides backgroundColor

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 10: expo-health package requires HealthKit entitlement in app.json — verify Expo SDK 54 compatibility before install
- Phase 10: PubMed NCBI API is free / no key required — confirm rate limits before caching strategy is finalized
- Phase 14: linkIdentity() behavior with existing anonymous session must be tested — confirm Supabase JS client version supports it

## Deferred Items

Items carried forward to future milestone:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Monetization | RevenueCat paywall | v4+ | v1 init |
| Notifications | Protocol + labs reminders | v4+ | v1 init |
| Biomarkers | Trend charts / sparklines | v4+ | v1 init |

## Session Continuity

Last session: 2026-06-03
Stopped at: Phase 10 Plan 04 complete. ArticleCard + ArticlesScreen + AppNavigator Articles route + DashboardScreen Research CTA. Wave 3 next (10-05: source audits + Supabase checkpoint + EAS preview build).
Resume file: .planning/STATE.md
