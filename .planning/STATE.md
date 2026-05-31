# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-30)

**Core value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.
**Current focus:** Phase 7 — Reference Data & Exercise Screen

## Current Position

Phase: 7 of 9 (Reference Data & Exercise Screen — in progress)
Plan: 1/4
Status: Phase 7 executing (2026-06-01); Wave 1 complete
Last activity: 2026-06-01 — 07-01 complete: SQL seed files (exercises 60 rows, biomarker_definitions 51 rows) + exerciseService.ts + biomarkerService.ts with Supabase-first + static fallback.

Progress: [██████░░░░] 55% (v1 complete; Phases 4-6 complete)

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

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 5: No blockers identified yet — plan-phase 5 is the next step
- Phase 4 (resolved): Supabase RLS anon read policy — verify in dashboard before client fetch code in Phase 7
- Phase 4 (resolved): polyfill ordering constraint — enforced in supabase.ts line 1

## Deferred Items

Items carried forward to future milestone:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| HealthKit | Real HK integration | v3+ | v1 init |
| Monetization | RevenueCat paywall | v3+ | v1 init |
| Notifications | Protocol + labs reminders | v3+ | v1 init |
| Biomarkers | Trend charts / sparklines | v3+ | v1 init |
| Auth | Email/password + linkIdentity() | v3 | v2 planning |

## Session Continuity

Last session: 2026-05-31
Stopped at: Phase 7 context gathered. Ready for /gsd:plan-phase 7.
Resume file: .planning/phases/07-reference-data-and-exercise-screen/07-CONTEXT.md
