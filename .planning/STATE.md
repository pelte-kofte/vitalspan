# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-30)

**Core value:** Users get their first clinically meaningful insight within minutes of opening the app — not after hours of data entry.
**Current focus:** Phase 6 — Warm UI Overhaul

## Current Position

Phase: 6 of 9 (Warm UI Overhaul — in progress)
Plan: 4 of 5 (Phase 6 in progress — Plans 01, 02, 03, 04 complete; Plan 05 remaining)
Status: Phase 6 in progress (2026-05-31) — 4/5 plans complete; Wave 2 done (ExerciseScreen migrated)
Last activity: 2026-05-31 — Plan 06-04 complete: ExerciseScreen migrated to Beige tokens (43 references), Elevation.sm cards, status bar dark on focus, motivating empty state (logs.length === 0) with 🏃 icon, "Move daily. Live longer." headline, "Log a Workout" CTA; tsc passes

Progress: [█████░░░░░] 48% (v1 complete; Phases 4-5 complete; Phase 6 in progress 4/5 plans)

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
Stopped at: Phase 6 Plan 04 complete — ExerciseScreen migrated to Beige tokens, Elevation.sm cards, empty state added. Wave 2 done. Plan 05 (ProfileScreen + SettingsScreen + AboutScreen) is next.
Resume file: None
