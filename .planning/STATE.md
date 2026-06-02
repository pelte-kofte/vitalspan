# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-30)

**Core value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.
**Current focus:** v3.0 — Intelligence & Growth (roadmap created, ready for Phase 10 planning)

## Current Position

Phase: 10 (not started)
Plan: —
Status: Roadmap created — ready for /gsd:plan-phase 10
Last activity: 2026-06-02 — v3.0 roadmap created. 5 phases (10–14): Apple Health + Articles, Supplement/Drug DB, Exercise UI Overhaul, Design System, Auth & Login. 29 requirements mapped, coverage 100%.

Progress: [░░░░░░░░░░] 0% (v3.0 starting)

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

Last session: 2026-06-02
Stopped at: v3.0 roadmap created. Phases 10-14 defined. Ready for /gsd:plan-phase 10 (Apple Health + Articles).
Resume file: .planning/STATE.md
