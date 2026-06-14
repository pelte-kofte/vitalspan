---
phase: 17-ai-advisor-backend
verified: 2026-06-14T10:00:00Z
status: human_needed
score: 10/10 must-haves verified
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Deploy Edge Function and call with valid Supabase JWT for action:'report'"
    expected: "Returns a valid LongevityReport JSON with all 5 sections (scoreSummary, priorityFindings, biomarkerAnalysis, supplementMedicationReview, recommendations)"
    why_human: "Requires a live Supabase project, a deployed Edge Function, and a real ANTHROPIC_API_KEY set via supabase secrets set — cannot run against deployed infrastructure programmatically"
  - test: "Send 6 report requests as the same authenticated user on the same UTC day"
    expected: "First 5 return 200 with report JSON; 6th returns 429 with body { error: \"You've reached your daily limit. Try again tomorrow.\" }"
    why_human: "Rate limit enforcement requires a live database with the ai_usage migration applied and real JWT tokens — cannot simulate in grep/static analysis"
  - test: "Apply supabase/migrations/ai_usage.sql to the Supabase project and verify table creation"
    expected: "SELECT table_name FROM information_schema.tables WHERE table_name = 'ai_usage' returns one row; INSERT as an authenticated client returns an RLS violation error (no INSERT policy)"
    why_human: "Requires a live Supabase project and supabase CLI linked to the project — SQL migration not yet confirmed applied to the live database"
  - test: "Inspect the context object sent in a real generateReport() invocation from the Expo app"
    expected: "Context payload contains ageBand (e.g. '35–39'), biomarker status categories (Optimal/Suboptimal/Critical), supplement and medication names — NO user name, NO raw numeric lab values, NO exact birthdate, NO Supabase user_id"
    why_human: "Requires running the app, logging through the network layer, and confirming zero-PII at runtime — static code analysis confirms the logic but not the runtime output"
---

# Phase 17: AI Advisor — Backend Verification Report

**Phase Goal:** The app assembles an anonymized health context from AsyncStorage and invokes a Supabase Edge Function that calls Claude API server-side, returning a structured longevity report — no raw lab values leave the device, no Anthropic API key exists in the Expo bundle, and per-user rate limits are enforced.

**Verified:** 2026-06-14T10:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All 10 must-have truths sourced from the merged set of ROADMAP.md success criteria and PLAN frontmatter must_haves.

| #  | Truth | Status | Evidence |
|----|-------|--------|---------|
| 1  | Calling the Edge Function with a valid JWT returns a structured longevity report JSON — no @anthropic-ai/sdk import exists in the Expo project source | VERIFIED | `grep -rn "@anthropic-ai" src/` returns zero matches. `supabase/functions/ai-advisor/index.ts` exists with full `serve()` handler that returns parsed JSON report. |
| 2  | The anonymized context payload contains no user name, no exact birthdate, no raw lab values with timestamps, no Supabase user ID — only bucketed age, biomarker status categories, supplement names, medication names | VERIFIED | `advisorContext.ts` applies `bucketAge()` (Math.floor(age/5)*5), maps biomarker values to Optimal/Suboptimal/Critical only (raw numeric value never in output), passes medications/supplements as name strings only. Grep confirms no PII patterns in code. |
| 3  | A user who triggers report generation 6 times in one day receives a 429 response with the D-15 message on the 6th attempt | VERIFIED (code) | Edge Function reads `ai_usage` table, compares current count to `REPORT_LIMIT = 5`, returns `429` with `"You've reached your daily limit. Try again tomorrow."` at line 65. Upsert increment occurs at line 82 BEFORE the Anthropic call at line 131. Needs human confirmation against live DB. |
| 4  | ai_usage migration defines the table with (user_id, date) composite PK and report_count/chat_count columns defaulting to 0 | VERIFIED | `supabase/migrations/ai_usage.sql` contains `CREATE TABLE IF NOT EXISTS public.ai_usage` with `user_id uuid NOT NULL`, `date date NOT NULL`, `report_count int NOT NULL DEFAULT 0`, `chat_count int NOT NULL DEFAULT 0`, `CONSTRAINT ai_usage_pkey PRIMARY KEY (user_id, date)`. |
| 5  | RLS enabled with SELECT-own policy; no client INSERT/UPDATE policy | VERIFIED | `ENABLE ROW LEVEL SECURITY` present, `CREATE POLICY "ai_usage_select_own" ON public.ai_usage FOR SELECT TO authenticated USING (auth.uid() = user_id)` present. Comment explicitly states no client write policies. |
| 6  | assembleAdvisorContext() reads all five AsyncStorage keys in parallel | VERIFIED | `Promise.all()` at line 148, reading `@vitalspan_user_profile`, `@vitalspan_biomarkers`, `@vitalspan_protocol`, `@vitalspan_health_data`, `@vitalspan_exercise_log` simultaneously. |
| 7  | generateReport() and sendChatMessage() return typed { data, error } objects and never throw; 429 maps to RATE_LIMITED | VERIFIED | Both functions wrapped in `try/catch`. `mapInvokeError()` maps `FunctionsHttpError` status 429 → `{ code: 'RATE_LIMITED', message: "You've reached your daily limit. Try again tomorrow." }`. All catch paths return `{ data: null, error: ... }`. |
| 8  | Anthropic API key read from Deno.env.get('ANTHROPIC_API_KEY') — never hardcoded | VERIFIED | Line 94: `const apiKey = Deno.env.get("ANTHROPIC_API_KEY")`. `grep -rn "sk-ant"` returns zero matches across entire project. |
| 9  | CORS headers present on every response so supabase.functions.invoke() succeeds | VERIFIED | `corsResponse()` helper at line 12 adds CORS headers to every response. All return paths use `corsResponse()`. OPTIONS preflight returns 200 with `CORS` at line 21. |
| 10 | ai_usage counter incremented before the Anthropic API call | VERIFIED | Upsert at lines 82–87, Anthropic fetch at line 131. Order confirmed: increment (line 82) < Anthropic call (line 131). Comment documents the D-13 design decision. |

**Score:** 10/10 truths verified (code-level). 4 behaviors require human confirmation against live infrastructure.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/ai_usage.sql` | Rate limit table DDL + RLS policies | VERIFIED | 39 lines, IF NOT EXISTS guards, composite PK, RLS SELECT-own policy, index |
| `src/lib/advisorContext.ts` | AdvisorContext type + assembleAdvisorContext() | VERIFIED | 263 lines; exports BiomarkerStatus, AdvisorContext, assembleAdvisorContext; full implementation with zero-PII logic |
| `supabase/functions/ai-advisor/index.ts` | Deno Edge Function with report + chat dispatch | VERIFIED | 164 lines; serve() handler, JWT auth, rate limit, Anthropic proxy, both action paths |
| `src/lib/advisorService.ts` | generateReport() and sendChatMessage() client wrappers | VERIFIED | 113 lines; exports LongevityReport, ChatMessage, AdvisorErrorCode, ReportResult, ChatResult, generateReport, sendChatMessage |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `supabase/migrations/ai_usage.sql` | `supabase/functions/ai-advisor/index.ts` | ai_usage table referenced in Edge Function upsert | VERIFIED | Edge Function references `"ai_usage"` at lines 57, 82 for SELECT and upsert operations |
| `src/lib/advisorContext.ts` | `src/lib/phenoAge.ts` | computePhenoAge() call | VERIFIED | `import { computePhenoAge, PHENO_AGE_BIOMARKER_MAP, PhenoAgeInputs }` at line 19; called at line 189 |
| `src/lib/advisorContext.ts` | `src/data/biomarkers.ts` | BIOMARKERS range lookup | VERIFIED | `import { BIOMARKERS }` at line 17; iterated at line 173 for status bucketing |
| `src/lib/advisorContext.ts` | `@vitalspan_exercise_log` AsyncStorage key | AsyncStorage.getItem('@vitalspan_exercise_log') | VERIFIED | `safeGetItem<ExerciseLogEntry[]>('@vitalspan_exercise_log')` at line 153 |
| `src/lib/advisorService.ts` | `src/lib/supabase.ts` | supabase.functions.invoke('ai-advisor') | VERIFIED | `import { supabase } from './supabase'` at line 2; `supabase.functions.invoke('ai-advisor', ...)` at lines 78 and 99 |
| `src/lib/advisorService.ts` | `src/lib/advisorContext.ts` | AdvisorContext type imported for generateReport() parameter | VERIFIED | `import type { AdvisorContext } from './advisorContext'` at line 3; used as parameter type for generateReport() |
| `supabase/functions/ai-advisor/index.ts` | `https://api.anthropic.com/v1/messages` | direct fetch — no SDK | VERIFIED | `fetch("https://api.anthropic.com/v1/messages", ...)` at line 131 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `advisorContext.ts` → `assembleAdvisorContext()` | `storedEntries`, `userProfile`, `protocolState`, `healthData`, `exerciseLog` | AsyncStorage parallel reads via `safeGetItem()` | Yes — reads live device AsyncStorage; returns null on failure (error resilient) | FLOWING |
| `advisorService.ts` → `generateReport()` | `data` returned from Edge Function | `supabase.functions.invoke('ai-advisor', ...)` | Yes — calls live Edge Function; `data as LongevityReport` cast | FLOWING |
| `advisorService.ts` → `sendChatMessage()` | `data.message` string | `supabase.functions.invoke('ai-advisor', ...)` | Yes — calls live Edge Function; extracts `message` string | FLOWING |
| `ai-advisor/index.ts` | `claudeResponse.content[0].text` | `fetch("https://api.anthropic.com/v1/messages", ...)` | Yes — calls live Anthropic API; null-safe access via `??` | FLOWING (requires live ANTHROPIC_API_KEY) |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — Edge Function runs on Deno/Supabase infrastructure; no local runnable entry point exists. The Expo app and Supabase Edge Function require active external services (Supabase project, ANTHROPIC_API_KEY secret) that cannot be invoked without network access and credentials.

---

### Probe Execution

No `probe-*.sh` files declared or found for Phase 17. Phase is a backend/library phase with no conventional probe scripts. SKIPPED.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| AI-01 | 17-02-PLAN.md | App assembles anonymized health context — no raw lab values, no exact birthdate, no Supabase user ID, no name | SATISFIED | `advisorContext.ts` implements all exclusions: exact age → 5-year band, biomarker values → status category, no name/birthdate/user_id in output interface |
| AI-02 | 17-03-PLAN.md, 17-04-PLAN.md | App invokes ai-advisor Edge Function via supabase.functions.invoke(); Claude called server-side; no @anthropic-ai/sdk in Expo project | SATISFIED | `advisorService.ts` uses `supabase.functions.invoke()` only. `grep -rn "@anthropic-ai" src/` returns zero matches. Edge Function calls Anthropic directly via `fetch()` |
| AI-03 | 17-01-PLAN.md, 17-03-PLAN.md | Edge Function enforces 5 report/20 chat daily limits; returns 429 with user-readable message when exceeded | SATISFIED (code) | `REPORT_LIMIT = 5`, `CHAT_LIMIT = 20` constants. Rate limit SELECT at line 57, 429 response at line 65. D-15 exact message: `"You've reached your daily limit. Try again tomorrow."` Requires live DB for end-to-end verification. |

All 3 phase requirement IDs (AI-01, AI-02, AI-03) are accounted for. No orphaned requirements found for Phase 17 in REQUIREMENTS.md.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | All four Phase 17 files are clean: no TBD/FIXME/XXX markers, no TODO/HACK/PLACEHOLDER, no empty return stubs, no console.log (only console.warn and console.error used appropriately) |

`AIAdvisorScreen.tsx` is a stub from Phase 16 (by design) but is NOT a Phase 17 artifact — its stub state is expected and intentional as Phase 18 fills it in.

---

### Human Verification Required

#### 1. Edge Function Live Invocation

**Test:** Deploy `supabase/functions/ai-advisor/` via `supabase functions deploy ai-advisor`, set `ANTHROPIC_API_KEY` via `supabase secrets set`, then call the function with a valid Supabase JWT and `action: 'report'`.

**Expected:** Response status 200 with a valid `LongevityReport` JSON body containing all 5 sections (scoreSummary, priorityFindings, biomarkerAnalysis, supplementMedicationReview, recommendations).

**Why human:** Requires live Supabase project, deployed function, and real Anthropic API key — cannot run programmatically without credentials.

---

#### 2. Rate Limit Enforcement (Live)

**Test:** Using a single authenticated user, trigger `generateReport()` 6 times within a single UTC day.

**Expected:** First 5 calls return 200 with report data. 6th call returns a response with `error.code === 'RATE_LIMITED'` and `error.message === "You've reached your daily limit. Try again tomorrow."` in the Expo app.

**Why human:** Requires live database with ai_usage migration applied and real JWT tokens; counter state requires actual DB writes.

---

#### 3. ai_usage Migration Applied to Live Supabase Project

**Test:** Apply `supabase/migrations/ai_usage.sql` to the Supabase project. Run `SELECT table_name FROM information_schema.tables WHERE table_name = 'ai_usage'` as the postgres/service role. Attempt `INSERT INTO public.ai_usage VALUES (auth.uid(), CURRENT_DATE, 0, 0)` as an authenticated client.

**Expected:** SELECT returns one row. INSERT returns a Postgres RLS violation (no INSERT policy for the `authenticated` role).

**Why human:** SQL migration is committed to the repo but confirmation it has been applied to the live Supabase project is required.

---

#### 4. Zero-PII Runtime Confirmation

**Test:** Add a network logger (or inspect Supabase Function logs) to capture the exact `context` object sent from `advisorService.ts` → `supabase.functions.invoke()` during a real `generateReport()` call on device.

**Expected:** The logged context contains `ageBand` (e.g. "35–39"), `biomarkers[].status` (not numeric values), `supplements[]` (names only), `medications[]` (names only). Does NOT contain: user name, exact age integer, raw biomarker numeric values, Supabase `user_id`, birthdate.

**Why human:** Static analysis confirms the exclusion logic is correct, but runtime confirmation ensures no accidental PII leak through edge cases (e.g. biomarker with id not in BIOMARKERS array, empty profile).

---

### Gaps Summary

No gaps identified. All 10 observable truths are verified at the code level. All 4 artifacts are substantive (not stubs) and wired. All 3 requirement IDs are fully covered. No debt markers present.

The 4 human verification items are infrastructure confirmation tasks requiring a live Supabase deployment — they do not indicate code defects. The phase goal is achievable with the implemented code; the human items confirm the deployment configuration is in place.

---

_Verified: 2026-06-14T10:00:00Z_
_Verifier: Claude (gsd-verifier)_
