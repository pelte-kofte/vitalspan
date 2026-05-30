# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-30)

**Core value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.
**Current focus:** Phase 4 — Supabase Foundation

## Current Position

Phase: 4 of 9 (Supabase Foundation)
Plan: 2 of 2 in current phase (phase complete)
Status: Phase 4 complete — ready for Phase 5 (Design Tokens & Icons)
Last activity: 2026-05-30 — 04-P2 executed: App.tsx wired with initSupabaseSession() fire-and-forget call

Progress: [████░░░░░░] 40% (v1 complete; Phase 4 complete; 5 v2 phases ahead)

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

- Phase 4: Verify Supabase RLS anon read policy is set in dashboard before writing any client fetch code — silent `[]` returns if missing
- Phase 4: `react-native-url-polyfill` must be first import in `src/lib/supabase.ts` — before any Supabase import

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

Last session: 2026-05-30
Stopped at: 04-P2 complete — App.tsx wired with initSupabaseSession() fire-and-forget; Phase 4 all plans done; Phase 5 is next
Resume file: None
