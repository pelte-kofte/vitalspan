---
phase: 17-ai-advisor-backend
plan: "04"
subsystem: ai-advisor
tags: [client-service, supabase-functions, never-throws, rate-limited, typescript]
dependency_graph:
  requires:
    - src/lib/supabase.ts          # supabase singleton
    - src/lib/advisorContext.ts    # AdvisorContext type (17-02)
    - supabase/functions/ai-advisor # Edge Function to invoke (17-03)
  provides:
    - src/lib/advisorService.ts
  affects:
    - src/screens/AIAdvisorScreen.tsx  # Phase 18 imports generateReport() + sendChatMessage()
key_files:
  created:
    - src/lib/advisorService.ts
  modified:
    - tsconfig.json  # added exclude: ["supabase/functions"] to prevent Deno URL import errors in tsc
decisions:
  - "FunctionsHttpError.context.status used for 429 detection — matches Supabase JS SDK v2 error shape"
  - "Both functions never throw — all error paths return { data: null, error: { code, message } }"
  - "tsconfig.json exclude: supabase/functions added to prevent Deno URL import noise from blocking tsc"
  - "AdvisorErrorCode exported as named type (not inline union) so Phase 18 can narrow error codes"
metrics:
  duration: "inline"
  completed: "2026-06-14"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 17 Plan 04: Advisor Service Client Summary

## One-liner

Never-throws client wrapper for the `ai-advisor` Edge Function — `generateReport()` and `sendChatMessage()` return typed `{ data, error }` objects with 429 mapped to `RATE_LIMITED` and the D-15 user-facing message.

## What Was Built

**`src/lib/advisorService.ts`** — The Expo-side bridge to the `ai-advisor` Edge Function.

### Exported types

| Export | Type | Purpose |
|--------|------|---------|
| `LongevityReport` | interface | D-01 5-section report schema (Phase 18 renders this) |
| `ChatMessage` | interface | `{ role: 'user'|'assistant', content: string }` |
| `AdvisorErrorCode` | type | `'RATE_LIMITED' \| 'UNAUTHORIZED' \| 'NETWORK_ERROR' \| 'AI_ERROR' \| 'UNKNOWN'` |
| `ReportResult` | interface | `{ data: LongevityReport \| null; error: { code, message } \| null }` |
| `ChatResult` | interface | `{ data: string \| null; error: { code, message } \| null }` |
| `generateReport` | function | Calls `action: 'report'`, returns `ReportResult` |
| `sendChatMessage` | function | Calls `action: 'chat'`, returns `ChatResult` |

### Error mapping

`mapInvokeError()` centralizes all error classification:
- `FunctionsHttpError` status 429 → `RATE_LIMITED` + D-15 message
- `FunctionsHttpError` status 401 → `UNAUTHORIZED`
- `FunctionsHttpError` status 500/502 → `AI_ERROR`
- Network/fetch errors → `NETWORK_ERROR`
- Anything else → `UNKNOWN`

### tsconfig.json fix

Added `"exclude": ["supabase/functions"]` to prevent Deno URL-style imports from causing TS2307 errors. The Edge Function is Deno-only and must not be type-checked by Node's tsc.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 1b68ad6 | feat | create advisorService.ts — generateReport() and sendChatMessage() client wrappers; exclude Deno functions from tsc |

## Deviations from Plan

None — all must_haves and exports implemented as specified.

## Verification Checklist

- [x] `npx tsc --noEmit` exits 0 with no errors in advisorService.ts or advisorContext.ts
- [x] `grep -rn "@anthropic-ai" src/` → zero matches
- [x] All 6 exports present: LongevityReport, ChatMessage, ReportResult, ChatResult, generateReport, sendChatMessage
- [x] `functions.invoke` called exactly twice (line 78, line 99)
- [x] RATE_LIMITED + D-15 message "You've reached your daily limit. Try again tomorrow." present

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| src/lib/advisorService.ts exists | FOUND |
| tsc --noEmit exit 0 | PASSED |
| No @anthropic-ai imports in src/ | CONFIRMED |
| 6 exports present | CONFIRMED |
| Never-throws pattern | CONFIRMED |
| 429 → RATE_LIMITED mapping | CONFIRMED |
