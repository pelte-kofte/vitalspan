# Phase 17: AI Advisor — Backend - Context

**Gathered:** 2026-06-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the server-side infrastructure that powers the AI Longevity Advisor:

1. **`src/lib/advisorContext.ts`** — Assembles an anonymized health context object from AsyncStorage and passes locally-computed PhenoAge to the Edge Function. No raw lab values, no PII, no Supabase user ID ever leave the device in identifiable form.
2. **Supabase Edge Function `supabase/functions/ai-advisor/index.ts`** — Single function with `action: 'report' | 'chat'` dispatch. Calls Claude API server-side and returns structured JSON. No `@anthropic-ai/sdk` in the Expo bundle.
3. **`supabase/migrations/ai_usage.sql`** — Rate limit table enforcing 5 reports/day and 20 chat messages/day per authenticated user.

Out of scope: AI Advisor UI (Phase 18), conversation history persistence beyond the session, Supabase project creation (already exists).

</domain>

<decisions>
## Implementation Decisions

### Report JSON Schema

- **D-01:** **6-section JSON schema designed now as a contract between phases.** The Edge Function enforces structure via the Claude system prompt. Phase 18 plans against a known shape — no schema negotiation across phases.
- **D-02:** **Evidence grades (A/B/C) are added app-side, not by Claude.** The Edge Function returns recommendation items without grades. The Expo app maps each recommendation to a grade using the existing supplement/drug database (`src/data/supplementTimings.ts`, `src/data/medications.ts`). This keeps pharmacist-verified grade data in the app where it belongs.
- **D-03:** **Score Summary (section 1) uses the locally-computed PhenoAge biological age.** `advisorContext.ts` passes `biologicalAge: number` (from `computePhenoAge()`) in the context payload. The Edge Function includes it verbatim in the report — Claude does not compute a separate score. Avoids two conflicting scores in the same app.
- **D-04:** **Report is ephemeral.** Not stored in AsyncStorage or Supabase. Phase 18 holds the report in React state for the duration of the session. Closing and reopening the screen starts fresh. Avoids stale report risk and storage schema complexity.

### Edge Function Architecture

- **D-05:** **Single `ai-advisor` Supabase Edge Function with `action: 'report' | 'chat'` dispatch.** Request body: `{ action, context?, messages?, reportSummary? }`. `report` path builds full prompt from anonymized context; `chat` path appends the user message to the conversation history array. One deploy surface, one rate limit check per call.
- **D-06:** **Stateless server — app sends full conversation history each turn.** Phase 18 holds `messages: {role: 'user'|'assistant', content: string}[]` in React state. Each chat request sends the full array plus the new user message. No server-side session state, no Supabase storage for chat history. Conversation is ephemeral (per Phase 18 requirements: "conversation history is ephemeral — not persisted across sessions").
- **D-07:** **claude-sonnet-4-6 for report generation; claude-haiku-4-5 for follow-up chat.** Report generation is the premium product moment — quality matters. Follow-up chat is conversational and lower stakes. Rate limits (5/20 per day) keep cost predictable at both tiers.

### Context Assembly Scope

- **D-08:** **Context includes: bucketed chronological age, locally-computed biological age (PhenoAge), biomarker status categories, supplement names, medication names, HealthKit aggregates (HRV, sleep score, recovery status), and exercise frequency summary.** All from AsyncStorage at call time — no network fetch required.
- **D-09:** **No PII.** The payload contains zero: user name, exact birthdate, raw lab values with timestamps, Supabase user ID, device ID, or any linkable identifier. Strictly enforced in `advisorContext.ts`.
- **D-10:** **Biomarker status: 3-tier — `Optimal` / `Suboptimal` / `Critical`.** Maps to the existing longevity-optimized ranges in `src/data/biomarkers.ts`. E.g., ApoB 65 → Optimal, ApoB 90 → Suboptimal, ApoB 130 → Critical. The exact value is NOT included — only the status category and the biomarker name.
- **D-11:** **Chronological age bucketed in 5-year bands** (e.g., `"35–39"`). Derived from `userProfile.age` stored in `@vitalspan_user_profile`. Never the exact year or birthdate.
- **D-12:** **HealthKit data excluded if `isDemoMode: true`** in `@vitalspan_health_data`. Demo-mode values are synthetic randomized data — including them would mislead the AI. When demo mode is active, the context omits HRV, sleep, and recovery fields entirely and includes a `healthDataAvailable: false` flag.

### Rate Limit Storage

- **D-13:** **Supabase `ai_usage` table** with columns `(user_id uuid references auth.users, date date, report_count int default 0, chat_count int default 0, primary key (user_id, date))`. Edge Function reads the row for `(user_id, TODAY_UTC)`, checks count against limit, increments atomically before the Anthropic call, and returns 429 if limit exceeded.
- **D-14:** **UTC day resets.** The `date` column stores the current UTC date (`new Date().toISOString().slice(0,10)`). Counter resets automatically because a new date produces a new row.
- **D-15:** **429 message: `"You've reached your daily limit. Try again tomorrow."`** Plain-language, no count exposure. The Expo app surfaces this as an Alert or inline error — Phase 18 handles the UI treatment.
- **D-16:** **Authenticated users only.** Anonymous/guest users are blocked at the isPremium gate in Phase 16 (`DashboardScreen.tsx` line 575: `isPremium ? nav.navigate('AIAdvisor') : nav.navigate('Paywall')`). They never reach the Edge Function. Rate limit table uses `auth.users.id` as the key — anonymous session IDs are not used.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md §AI-01, AI-02, AI-03` — Authoritative requirements and acceptance criteria for this phase. MUST read before planning.

### Existing App Code
- `src/lib/supabase.ts` — Supabase client singleton. `supabase.functions.invoke('ai-advisor', { body })` is the call pattern. Read before writing `advisorContext.ts` invocation logic.
- `src/lib/phenoAge.ts` — `computePhenoAge()` function and `PHENO_AGE_BIOMARKER_MAP`. `advisorContext.ts` calls this to get `biologicalAge` for the context payload.
- `src/data/biomarkers.ts` — `BIOMARKERS` array with longevity-optimized range definitions. Used by `advisorContext.ts` to map raw biomarker values to Optimal/Suboptimal/Critical categories.
- `src/data/supplementTimings.ts` — `SUPPLEMENT_DATABASE` with evidence grades. Used app-side to map AI recommendations to A/B/C grades (D-02).
- `src/data/medications.ts` — `MEDICATION_DATABASE` with drug class info. Same app-side grade mapping purpose.
- `src/screens/AIAdvisorScreen.tsx` — Intentional stub from Phase 16. Phase 17 adds the `advisorService.ts` call; Phase 18 fills the UI. Read before touching this file.
- `App.tsx` — `init()` startup sequence (initSupabaseSession → identifyAdaptyUser). No changes needed for Phase 17 — context noted for awareness.

### AsyncStorage Keys (data sources for advisorContext.ts)
- `@vitalspan_user_profile` — UserProfile (age, sex, goal, conditions, medications). Source for bucketed age, medication list, user goal.
- `@vitalspan_biomarkers` — StoredEntry[]. Source for latest biomarker values → status categorization.
- `@vitalspan_protocol` — ProtocolState (addedSupplements, customSupplements). Source for supplement names.
- `@vitalspan_health_data` — HealthData (HRV, sleep, recovery, isDemoMode). Source for HealthKit aggregates — exclude if isDemoMode.

### Prior Phase Context
- `.planning/STATE.md §Decisions` — Key prior decisions on startup sequence, API key handling, and async patterns that must not be violated.
- `.planning/phases/16-adapty-paywall-and-subscriptions/16-CONTEXT.md` — D-04 (AI Advisor stub) and D-09 (no AsyncStorage for premium status) from Phase 16.

### Supabase Edge Functions
- Supabase Edge Functions Deno runtime docs — researcher must confirm: `Deno.env.get('ANTHROPIC_API_KEY')` for secret access, `serve()` handler pattern, CORS headers required for React Native `supabase.functions.invoke()` calls, and how to set function secrets via `supabase secrets set`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.ts` — `supabase.functions.invoke('ai-advisor', { body })` — already imported across the app; no new Supabase client setup needed in Phase 17.
- `src/lib/phenoAge.ts` — `computePhenoAge(biomarkers)` returns `{ biologicalAge, chronologicalAge, ... }`. `advisorContext.ts` calls this directly with the stored biomarker entries.
- `src/data/biomarkers.ts` — `BIOMARKERS[i].ranges` defines the longevity-optimized thresholds for Optimal/Suboptimal/Critical bucketing. No new range definitions needed.

### Established Patterns
- **Supabase call pattern**: `supabase.functions.invoke('ai-advisor', { body: { action, ... } })` — returns `{ data, error }`. Follows the same `never-throws` pattern as `src/lib/adapty.ts`.
- **AsyncStorage read pattern**: direct `AsyncStorage.getItem(key)` + JSON.parse — used throughout. `advisorContext.ts` follows the same pattern, reads all keys in parallel with `Promise.all`.
- **ENV secrets**: `process.env.EXPO_PUBLIC_*` for Expo; `Deno.env.get('...')` for Edge Function secrets. Anthropic API key is Edge Function secret only — never in Expo env.
- **Error resilience**: `.catch(() => null)` fire-and-forget for non-blocking calls (established in App.tsx). `advisorService.ts` invocation is NOT fire-and-forget — it awaits the result and surfaces errors to Phase 18 UI.

### Integration Points
- **`src/screens/AIAdvisorScreen.tsx`** — Phase 17 creates `src/lib/advisorService.ts` which Phase 18 calls from this screen. Phase 17 may add the function call stub to AIAdvisorScreen to verify the contract, but full UI rendering is Phase 18.
- **`supabase/functions/ai-advisor/`** — New directory. Supabase CLI bootstraps the Deno function. Secret `ANTHROPIC_API_KEY` set via `supabase secrets set`.
- **`supabase/migrations/`** — New directory. SQL migration for `ai_usage` table (rate limit counters).

</code_context>

<specifics>
## Specific Ideas

- **System prompt framing**: Claude should be instructed as a "pharmacist-trained longevity advisor reviewing an anonymized patient health snapshot." This aligns with the app's core identity (pharmacist-first, evidence-backed) and guides the tone of the generated report.
- **Report JSON shape (contract for Phase 18)**: The Edge Function must return a typed structure matching these 5 content sections (section 6 "Follow-up Chat" is a UI entry point in Phase 18, not an Edge Function output):
  ```
  {
    scoreSummary: { biologicalAge: number, ageBand: string, headline: string, trend: string },
    priorityFindings: Array<{ finding: string, priority: 'high'|'medium'|'low' }>,
    biomarkerAnalysis: Array<{ name: string, status: 'Optimal'|'Suboptimal'|'Critical', insight: string }>,
    supplementMedicationReview: Array<{ name: string, type: 'supplement'|'medication', assessment: string }>,
    recommendations: Array<{ action: string, category: string, timeframe: string }>
  }
  ```
  Evidence grades mapped app-side from supplement/drug database by matching `name` to `SUPPLEMENT_DATABASE` / `MEDICATION_DATABASE`.
- **Rate limit atomicity**: Edge Function must read-then-increment in a single Supabase `upsert` call (not read then write separately) to avoid race conditions if two requests arrive simultaneously.
- **Spend protection**: The researcher/planner should include setting a `supabase secrets set ANTHROPIC_API_KEY=...` and a max_tokens cap in the Claude call as a cost guardrail. The rate limits (5/20 per day) are the primary spend protection.

</specifics>

<deferred>
## Deferred Ideas

- **Report history / past reports**: Persisting generated reports in Supabase for a "past reports" view. Better suited for v5.0 when user has accumulated multiple months of data.
- **Report sharing / PDF export**: Out of scope — Phase 17/18 is read-only ephemeral.
- **Adaptive rate limits by subscription tier**: Different limits for different Adapty access levels. Phase 17 uses fixed limits (5/20). Can be made dynamic in a later phase with Adapty webhook integration.
- **Streaming Claude responses**: Streaming the report as it generates (progressive reveal). Requires SSE handling in Supabase Edge Function and streaming-aware UI in Phase 18. Deferred — start with non-streaming for simplicity.
- **PhenoAge computation server-side**: Moving PhenoAge formula to the Edge Function. Currently client-side in phenoAge.ts. No reason to move it — client computation is correct and fast.

</deferred>

---

*Phase: 17-ai-advisor-backend*
*Context gathered: 2026-06-13*
