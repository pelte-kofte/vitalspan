---
phase: 17-ai-advisor-backend
reviewed: 2026-06-14T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - supabase/migrations/ai_usage.sql
  - src/lib/advisorContext.ts
  - src/lib/advisorContext.test.ts
  - supabase/functions/ai-advisor/index.ts
  - src/lib/advisorService.ts
  - tsconfig.json
findings:
  critical: 2
  warning: 4
  info: 3
  total: 9
status: issues_found
---

# Phase 17: Code Review Report

**Reviewed:** 2026-06-14T00:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Phase 17 delivers the AI Advisor backend: a Deno Edge Function proxying Claude, a client wrapper, an AsyncStorage-to-context assembler, and the `ai_usage` rate-limit migration. The core security invariants hold — the Anthropic API key never enters the Expo bundle, and `advisorContext.ts` correctly strips PII (no exact age, no raw biomarker values, no conditions). The SQL migration RLS design is sound.

Two blockers require fixing before shipping: the rate-limit counter upsert result is silently discarded, meaning a DB hiccup lets unlimited Anthropic calls through; and the Haiku model string is a non-existent model ID that will cause every chat call to fail at runtime. Four warnings cover input-validation gaps that produce confusing error responses, the CORS wildcard, and the dead mock call in the test file.

---

## Critical Issues

### CR-01: Rate-limit counter upsert result is never checked — DB failure silently bypasses the rate limit

**File:** `supabase/functions/ai-advisor/index.ts:82–87`

**Issue:** The `upsert()` call returns a `Promise<PostgrestResponse>` — the Supabase JS client does **not** throw on database errors; it returns `{ data, error }`. The current code `await`s the call but never destructures or inspects the result. If the upsert fails for any reason (constraint violation, connection blip, row-lock timeout), the error is silently discarded and execution falls through to the Anthropic call. The rate limit is then entirely bypassed for that request. An attacker who can induce transient DB errors (or who simply gets unlucky timing) will exhaust quota without the counter moving.

**Fix:**
```typescript
const { error: upsertError } = await serviceClient
  .from("ai_usage")
  .upsert(
    { user_id: userId, date: todayUTC, report_count: newReportCount, chat_count: newChatCount },
    { onConflict: "user_id,date" }
  );

if (upsertError) {
  console.error("Rate limit upsert failed:", upsertError.message);
  return corsResponse({ error: "Service temporarily unavailable" }, 503);
}
```

Failing closed (returning 503) is the correct posture when the rate-limit store is unreachable — it prevents unbounded Anthropic spend.

---

### CR-02: Chat model ID `"claude-haiku-4-5-20251001"` does not exist — every chat call fails at runtime

**File:** `supabase/functions/ai-advisor/index.ts:117`

**Issue:** The string `"claude-haiku-4-5-20251001"` is not a valid Anthropic model identifier. The comment claims it is "the versioned form of the claude-haiku-4-5 rolling alias," but Anthropic's versioned model IDs follow the pattern `claude-<family>-<major>-<minor>-<YYYYMMDD>` (e.g., `claude-3-haiku-20240307`, `claude-haiku-3-5-20241022`). The string used here has a non-existent date stamp format and an unrecognized family path for the `4.x` generation. Anthropic will return a 400/404 for every chat request, which the Edge Function surfaces as a 502 to the client.

**Fix:** Use the correct, verified model ID. At the time this code was written the available Haiku-tier model for Claude 4.x generation is `claude-haiku-4-5` (rolling alias) or its confirmed dated snapshot. Verify against `https://api.anthropic.com/v1/models` in the Supabase secret environment and use the confirmed string:

```typescript
// Use the rolling alias until a dated snapshot is confirmed in Anthropic's model list
model = "claude-haiku-4-5";
```

If production stability requires a pinned snapshot, confirm the exact date string via the Anthropic API before deploying.

---

## Warnings

### WR-01: Missing input validation for `context` (report action) and `messages` (chat action) — malformed requests produce misleading 502s

**File:** `supabase/functions/ai-advisor/index.ts:39–44, 114, 124`

**Issue:** Neither branch validates that the expected payload fields are present before using them.

- **Report path (line 114):** `JSON.stringify(context, null, 2)` where `context` is `undefined` returns the JS value `undefined` (not the string). The message object becomes `{ role: "user", content: undefined }`. When serialized for the Anthropic request body, the `content` key is dropped entirely, producing an invalid messages array. Anthropic returns a 400; the Edge Function surfaces a 502.
- **Chat path (line 124):** `messages ?? []` passes an empty array when `messages` is absent. Anthropic requires at least one message and returns a 400, again surfaced as 502.

Both cases attribute a client error (missing field) to the "AI service" — wrong status and misleading diagnostics.

**Fix:**
```typescript
// After the action check, before the counter read:
if (action === "report" && !context) {
  return corsResponse({ error: "Missing required field: context" }, 400);
}
if (action === "chat" && (!messages || messages.length === 0)) {
  return corsResponse({ error: "Missing required field: messages" }, 400);
}
```

---

### WR-02: Malformed request body (non-JSON) returns 500 instead of 400

**File:** `supabase/functions/ai-advisor/index.ts:38`

**Issue:** `await req.json()` throws a `SyntaxError` when the request body is not valid JSON. This exception propagates to the outer `catch` block (line 156), which returns a 500 ("Internal server error"). A client sending a malformed body should receive a 400. This also pollutes server error logs with client mistakes.

**Fix:**
```typescript
let body: Record<string, unknown>;
try {
  body = await req.json();
} catch {
  return corsResponse({ error: "Request body must be valid JSON" }, 400);
}
const { action, context, messages, reportSummary } = body as { ... };
```

---

### WR-03: CORS wildcard `Access-Control-Allow-Origin: *` on a JWT-authenticated endpoint

**File:** `supabase/functions/ai-advisor/index.ts:8`

**Issue:** `"Access-Control-Allow-Origin": "*"` permits cross-origin requests from any domain. While the JWT requirement mitigates most real-world abuse (a third-party site cannot obtain the user's Supabase JWT without XSS), the wildcard is unnecessary for a mobile-only app and violates the principle of least privilege. If a web client is ever added (or the Supabase anon key leaks and anonymous sessions are created by scripts), this broadens the attack surface. The Supabase documentation recommends restricting to known origins for production.

**Fix:** Restrict to the known origin(s). For a mobile-only app that calls Edge Functions from `supabase.functions.invoke`, the origin header is typically absent or set to `null` — so either lock to your web domain or use a `null` / absent check:

```typescript
const CORS = {
  "Access-Control-Allow-Origin": "https://your-web-app.example.com", // or omit for mobile-only
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

If the function is truly mobile-only and no browser client is planned, document the rationale for the wildcard so a future web integration triggers a deliberate reassessment.

---

### WR-04: `jest_mockRequire()` call on line 12 is a dead no-op that creates a false impression of mock setup

**File:** `src/lib/advisorContext.test.ts:12–16`

**Issue:** `jest_mockRequire()` is called on line 12 before `Module._load` is overridden (lines 34–47). The function body is literally `void mod; void impl;` — it does nothing. The actual AsyncStorage mock is set up exclusively by the `Module._load` override below it. The call on line 12 exists from an earlier iteration and now misleads future readers into thinking mock registration happens via `jest_mockRequire`. The fake call could also confuse linters or future contributors who add real Jest infrastructure.

**Fix:** Remove the dead `jest_mockRequire()` invocation on lines 12–16 and the no-op function definition on lines 26–30. The `Module._load` override is the sole mechanism and should stand alone with a comment:

```typescript
// Override Module._load to intercept AsyncStorage before advisorContext is required
const Module = require('module');
const _originalLoad = Module._load.bind(Module);
Module._load = function (request: string, parent: unknown, isMain: boolean): unknown {
  if (request === '@react-native-async-storage/async-storage') {
    return { default: { getItem, setItem, removeItem } };
  }
  return _originalLoad(request, parent, isMain);
};
```

---

## Info

### IN-01: `bucketBiomarkerStatus` has no guard for `optMax === 0` — division by zero if a biomarker is ever defined with `optMax:0`

**File:** `src/lib/advisorContext.ts:109`

**Issue:** When `optMin === 0` and `optMax === 0`, line 109 evaluates `value <= optMax * 1.5` → `value <= 0`, and anything above 0 falls through to `'Critical'`. More importantly, the two-sided branch at line 117 computes `(value - optMax) / optMax` where `optMax` could be 0 — producing `Infinity` or `NaN`. No current biomarker has `optMax:0`, so this is not a live bug, but it is a silent landmine for future data additions.

**Fix:** Add a guard or assertion at the top of the function:
```typescript
function bucketBiomarkerStatus(value: number, optMin: number, optMax: number): BiomarkerStatus {
  if (optMax <= 0) {
    // Defensive: malformed biomarker definition — treat any value as Critical
    console.warn(`[advisorContext] optMax=${optMax} is invalid for biomarker bucketing`);
    return 'Critical';
  }
  // ... rest of function
}
```

---

### IN-02: `ageBand` defaults to `'0–4'` when profile is missing — misleads the AI model

**File:** `src/lib/advisorContext.ts:157–158`

**Issue:** When `userProfile` is `null` (empty storage), `age` defaults to `0` and `ageBand` becomes `'0–4'`. The fallback context returned on error (lines 251–260) also hardcodes `ageBand: '0–4'`. Claude receives a report implying the user is an infant, which produces nonsensical longevity recommendations. The user experience is degraded without any indication that profile data is missing.

**Fix:** Surface the missing-profile state explicitly:
```typescript
const ageBand = (age > 0) ? bucketAge(age) : 'unknown';
```
And in the catch-block fallback:
```typescript
ageBand: 'unknown',
```
The system prompt can then instruct Claude to note that age data is unavailable rather than fabricating age-appropriate advice.

---

### IN-03: `console.warn` in `advisorService.ts` logs full error message to device console in production

**File:** `src/lib/advisorService.ts:89, 110`

**Issue:** `console.warn('[advisorService] generateReport error:', ...)` and the equivalent for `sendChatMessage` will appear in production Expo/Metro logs and potentially in crash-reporting tools. Error messages from the Supabase client or network layer can contain internal detail (URLs, header fragments). This is a low-severity information-disclosure concern. Per CLAUDE.md, no existing pattern prohibits `console.warn` in service files, but it should be gated on `__DEV__` for production hygiene.

**Fix:**
```typescript
if (__DEV__) {
  console.warn('[advisorService] generateReport error:', e instanceof Error ? e.message : String(e));
}
```

---

_Reviewed: 2026-06-14T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
