---
phase: 17-ai-advisor-backend
plan: 01
subsystem: database
tags: [supabase, postgres, rls, sql, migration, rate-limiting]

# Dependency graph
requires:
  - phase: 04-supabase-foundation
    provides: auth.users table and Supabase project setup
provides:
  - public.ai_usage table DDL + RLS for per-user daily AI usage counters
affects: [17-03-edge-function, 18-ai-advisor-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "IF NOT EXISTS guards for idempotent migrations (safe to re-run)"
    - "RLS SELECT-own policy; service_role sole writer (no client INSERT/UPDATE)"
    - "UTC date column as natural counter reset — new date row = new daily quota"

key-files:
  created:
    - supabase/migrations/ai_usage.sql
  modified: []

key-decisions:
  - "No client INSERT/UPDATE RLS policies — the ai-advisor Edge Function (service_role) is the sole writer; this prevents counter manipulation from the client (T-17-02)"
  - "PRIMARY KEY (user_id, date) is the natural rate-limit key — no separate sequence or trigger needed; a new UTC date produces a new row automatically (D-14)"
  - "uuid-ossp extension included via IF NOT EXISTS — safe no-op on projects that already have it"

patterns-established:
  - "Migration pattern: CREATE TABLE IF NOT EXISTS + ENABLE ROW LEVEL SECURITY + named POLICY — mirrors existing src/db/*.sql migrations"
  - "RLS: authenticated SELECT-own via auth.uid() = user_id; no client write grants"

requirements-completed:
  - AI-03

# Metrics
duration: 1min
completed: 2026-06-13
---

# Phase 17 Plan 01: AI Usage Rate-Limit Table Summary

**Supabase SQL migration defining the `ai_usage` table with composite PK (user_id, date), idempotent DDL, RLS enabled, and a SELECT-own policy — no client write grants; Edge Function (service_role) is sole counter writer**

## Performance

- **Duration:** 1 min
- **Started:** 2026-06-13T21:16:24Z
- **Completed:** 2026-06-13T21:17:10Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `supabase/migrations/ai_usage.sql` with exact D-13 column spec: (user_id uuid, date date, report_count int DEFAULT 0, chat_count int DEFAULT 0, PRIMARY KEY (user_id, date))
- RLS enabled with `ai_usage_select_own` SELECT policy — authenticated users can read only their own row
- No client INSERT/UPDATE policies — enforces T-17-02 tamper mitigation; service_role Edge Function is sole writer
- Index `ai_usage_user_date_idx` on (user_id, date DESC) for fast per-user quota lookups
- Migration is idempotent (IF NOT EXISTS guards) — safe to apply to Supabase via `supabase db push` or Dashboard SQL editor

## Task Commits

1. **Task 1: Create supabase directory structure and write ai_usage migration** - `4eb60a3` (feat)

**Plan metadata:** _(final docs commit below)_

## Files Created/Modified

- `supabase/migrations/ai_usage.sql` - ai_usage table DDL, RLS, SELECT-own policy, and performance index

## Decisions Made

- No client write policies: the Edge Function runs as service_role and bypasses RLS; giving clients INSERT/UPDATE access would allow counter manipulation — RLS SELECT-only is the correct security posture (T-17-02).
- PRIMARY KEY (user_id, date) serves as the natural daily rate-limit key; no trigger or sequence needed — a new UTC date produces a new row and a fresh quota counter (D-14).
- uuid-ossp extension included with IF NOT EXISTS — safe no-op on projects already enabling it; required on some fresh Supabase projects.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

The migration must be applied to the Supabase project before Phase 17 Plan 3 (Edge Function) can upsert usage rows. Apply via one of:

1. `supabase db push` (if Supabase CLI is linked to the project), or
2. Open Supabase Dashboard → SQL Editor → paste contents of `supabase/migrations/ai_usage.sql` → Run

Verify with:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'ai_usage';
```
Expected: one row returned.

## Next Phase Readiness

- `supabase/migrations/ai_usage.sql` is committed and ready to apply
- The `ai_usage` table contract matches the D-13 spec consumed by Plan 17-03 (Edge Function upsert logic)
- Plan 17-02 (`advisorContext.ts`) does not depend on this table — it can proceed in parallel in Wave 1

---

## Self-Check

- `supabase/migrations/ai_usage.sql` exists: FOUND
- Commit `4eb60a3` exists in git log: verified above

## Self-Check: PASSED

---

*Phase: 17-ai-advisor-backend*
*Completed: 2026-06-13*
