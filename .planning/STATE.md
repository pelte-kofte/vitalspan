# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-30)

**Core value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.
**Current focus:** v3.0 — Intelligence & Growth (roadmap created, ready for Phase 10 planning)

## Current Position

Phase: 11 (executing — Wave 3 next)
Plan: 5 plans in 4 waves (2/5 complete)
Status: Wave 2 complete. Plan 11-02 done: INTERACTIONS expanded to 54 pairs (pharmacist-approved) + SAFE_COMBOS expanded to 11 entries. Wave 3 (UI parallel) next.
Last activity: 2026-06-04 — Plan 11-02 complete: 23 new interaction pairs (pharmacist reviewed + approved); SAFE_COMBOS 4→11 entries; tsc zero errors.

Progress: [████░░░░░░] 40% (v3.0 Phase 11 Wave 2 complete)

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
