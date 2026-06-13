---
phase: 17-ai-advisor-backend
plan: "03"
subsystem: ai-advisor
tags: [edge-function, deno, jwt, rate-limiting, anthropic, cors]
dependency_graph:
  requires:
    - supabase/migrations/ai_usage.sql  # rate limit table (17-01)
    - Deno.env ANTHROPIC_API_KEY        # set via supabase secrets set
    - Deno.env SUPABASE_URL             # auto-injected by Supabase
    - Deno.env SUPABASE_SERVICE_ROLE_KEY # auto-injected by Supabase
  provides:
    - supabase/functions/ai-advisor/index.ts
  affects:
    - src/lib/advisorService.ts  # client wrapper (17-04) calls this function
key_files:
  created:
    - supabase/functions/ai-advisor/index.ts
  modified: []
decisions:
  - "Rate limit counter incremented BEFORE Anthropic call per D-13 — failed AI calls still consume quota to prevent retry abuse"
  - "claude-haiku-4-5-20251001 used (versioned form of claude-haiku-4-5 alias) for production stability per D-07"
  - "reportSummary injected into system prompt only for chat path — full messages array passed unchanged per D-06 stateless design"
  - "CORS headers returned on every response including OPTIONS preflight"
  - "service_role client used for both JWT verification and ai_usage upsert (bypasses RLS)"
metrics:
  duration: "inline"
  completed: "2026-06-14"
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
  files_modified: 0
---

# Phase 17 Plan 03: AI Advisor Edge Function Summary

## One-liner

Deno Edge Function that verifies JWT, enforces per-user daily rate limits, and proxies anonymized health context to the Claude API server-side — Anthropic API key never leaves the function.

## What Was Built

**`supabase/functions/ai-advisor/index.ts`** — The security boundary between the Expo app and the Anthropic API.

### Handler flow

1. **OPTIONS preflight** → immediate 200 + CORS headers (no auth required)
2. **JWT verification** → `serviceClient.auth.getUser(token)` → 401 on failure
3. **Body parsing** → `{ action, context?, messages?, reportSummary? }`
4. **Action validation** → 400 if not `'report'` or `'chat'`
5. **Rate limit check** → SELECT current `(user_id, date)` row from `ai_usage`; 429 + D-15 message if at limit
6. **Counter increment** → UPSERT `report_count` or `chat_count` BEFORE Anthropic call (D-13)
7. **API key guard** → 500 if `ANTHROPIC_API_KEY` missing
8. **Anthropic call** → `POST https://api.anthropic.com/v1/messages`
   - Report: `claude-sonnet-4-6`, `max_tokens: 2000`, structured JSON system prompt
   - Chat: `claude-haiku-4-5-20251001`, `max_tokens: 500`, reportSummary in system prompt, full messages array unchanged
9. **Response** → 200 with parsed `LongevityReport` JSON (report) or `{ message }` (chat); 502 on parse failure
10. **Global try/catch** → 500 on any unhandled exception

### Key contracts met

- Anthropic API key: `Deno.env.get('ANTHROPIC_API_KEY')` only — never hardcoded (T-17-11)
- 429 message: `"You've reached your daily limit. Try again tomorrow."` (D-15 exact)
- Rate limit: 5 reports/day, 20 chats/day per user (D-07)
- Chat stateless: full `messages` array passed through unchanged; `reportSummary` in system prompt only (D-06)
- CORS: `Access-Control-Allow-Origin: *` on every response

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 4541b01 | feat | create ai-advisor Deno Edge Function — JWT auth, rate limiting, Claude API proxy |

## Deviations from Plan

None — all must_haves implemented as specified.

## Deployment Instructions

Before deploying, set the Anthropic API key as a Supabase secret:

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy ai-advisor
```

Also apply the ai_usage migration (17-01) before the first function invocation:

```bash
supabase db push
```

## Verification Checklist

- [x] `serve(` handler present
- [x] `ANTHROPIC_API_KEY` read via `Deno.env.get()` only — not hardcoded
- [x] `claude-sonnet-4-6` used for report path
- [x] `claude-haiku-4-5-20251001` used for chat path (versioned form of D-07 alias)
- [x] 429 with D-15 exact message returned when rate limit exceeded
- [x] `Access-Control-Allow-Origin: *` present
- [x] `getUser()` JWT verification present
- [x] Upsert (line 84) before Anthropic fetch (line 127) — correct D-13 ordering
- [x] No hardcoded `sk-ant` string

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| supabase/functions/ai-advisor/index.ts exists | FOUND |
| serve() handler | ✓ |
| JWT verification | ✓ |
| Rate limit 429 with D-15 message | ✓ |
| Increment before Anthropic call | ✓ (line 84 < line 127) |
| No hardcoded API key | ✓ |
| CORS on all responses | ✓ |
| Both models present | ✓ |
