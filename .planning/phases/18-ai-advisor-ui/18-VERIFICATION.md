---
phase: 18-ai-advisor-ui
verified: 2026-06-15T00:00:00Z
status: gaps_found
score: 2/3
overrides_applied: 0
re_verification: false
gaps:
  - truth: "A free user tapping AI Advisor sees the paywall — not an error, not a locked icon, not an empty screen"
    status: failed
    reason: "PremiumContext.tsx has isPremium hardcoded to true with TEMP-PHASE18-TEST markers and a bare 'return;' at the top of useEffect that disables all Adapty calls. Every user is treated as premium. The free-user paywall branch (nav.navigate('Paywall')) at DashboardScreen.tsx:575 can never be reached. This is an uncommitted working-tree modification — it was not reverted before the phase was declared complete."
    artifacts:
      - path: "src/context/PremiumContext.tsx"
        issue: "Line 42: useState(true) // TEMP-PHASE18-TEST; Line 43: useState(false) // TEMP-PHASE18-TEST; Line 52: return; // TEMP-PHASE18-TEST — Adapty listener and AppState subscription are dead code. Confirmed by git diff: these lines are modified from the Phase 16 baseline (useState(false) / useState(true)) and are uncommitted."
    missing:
      - "Revert PremiumContext.tsx to the Phase 16 shipped state: useState(false) for isPremium, useState(true) for isPremiumLoading, remove the bare 'return;' from useEffect so Adapty calls are live"
      - "Confirm git commit captures the revert so the change is auditable"
  - truth: "Edge Function improvements (4096 max_tokens, AbortController, stop_reason guard) are shipped"
    status: failed
    reason: "The supabase/functions/ai-advisor/index.ts improvements documented in the 18-03-SUMMARY.md (max_tokens 2000->4096, AbortController at 35s, stop_reason check) exist only as uncommitted working-tree changes. The file is in 'M' state per git status and has not been committed. The committed version of the file still has max_tokens:2000, no AbortController, and no stop_reason guard. These are not Expo-bundle artifacts — the Edge Function is deployed separately — but the lack of a commit means the source is not auditable and the deployed state cannot be verified from the repo."
    artifacts:
      - path: "supabase/functions/ai-advisor/index.ts"
        issue: "Uncommitted working-tree changes. git status shows 'M supabase/functions/ai-advisor/index.ts'. The max_tokens fix and AbortController that resolved the 502 EDGE_FUNCTION_ERROR during human verification are not committed to the repository."
    missing:
      - "Commit the supabase/functions/ai-advisor/index.ts changes so the fix is auditable and the source-of-truth repo matches what is deployed"
human_verification:
  - test: "Verify free-user paywall flow after PremiumContext revert"
    expected: "A user without an active Adapty subscription tapping AI Advisor on the Dashboard is redirected to the PaywallScreen — not to AIAdvisorScreen"
    why_human: "Requires a sandbox Apple ID without an active subscription or a device where no Adapty purchase has been made. The isPremium gate is programmatic but the Adapty SDK product resolution cannot be verified by grep."
  - test: "Full AI Advisor flow end-to-end after PremiumContext revert"
    expected: "Premium user (sandbox purchase active) can still reach AIAdvisorScreen, generate a report, and use the chat — the Adapty fix did not break the premium path"
    why_human: "Requires a sandbox Apple ID with an active Adapty subscription to confirm the premium path still works after the revert."
---

# Phase 18: AI Advisor — UI Verification Report

**Phase Goal:** Premium users can generate a longevity report from the Dashboard, read it as a 6-section card layout, and ask follow-up questions in a conversational chat interface scoped to that report — free users see the paywall when tapping the AI Advisor entry point.

**Verified:** 2026-06-15
**Status:** GAPS FOUND
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Premium user tapping AI Advisor triggers report generation; report renders as 6 labeled cards: Score Summary, Priority Findings, Biomarker Analysis, Supplement & Medication Review, Recommendations (A/B/C grades), and Follow-up Chat | VERIFIED | AIAdvisorScreen.tsx lines 106–112: ScoreSummaryCard + 4 ReportCard instances with exact titles + FOLLOW-UP CHAT header. ReportCard.lookupGrade() wired to SUPPLEMENT_DATABASE (returns real evidenceGrade) and MEDICATION_DATABASE (returns 'B'). GRADE_COLORS map covers A/B/C with Colors.status.* tokens. |
| 2 | User can type a follow-up question, receive a Claude response referencing the report; second question shows the thread; closing and reopening starts a fresh session | VERIFIED | handleSendChat() calls sendChatMessage(nextMessages, reportSummary) where reportSummary is derived from scoreSummary.headline + priorityFindings. Messages accumulate in useState. AIAdvisor route is fullScreenModal — React unmounts on goBack(), so useState initializes fresh on every open (no persistence). |
| 3 | A free user tapping AI Advisor sees the paywall — not an error, not a locked icon, not an empty screen | FAILED | PremiumContext.tsx has isPremium hardcoded to true with TEMP-PHASE18-TEST markers and a bare return; at line 52 that disables all Adapty SDK calls. The paywall branch (nav.navigate('Paywall') at DashboardScreen.tsx:575) can never be reached. This is an uncommitted working-tree modification not reverted before phase completion. |

**Score:** 2/3 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/screens/AIAdvisorScreen.tsx` | Main screen — 3 states, 6 sections, chat | VERIFIED | 161 lines. Three rendering states (isLoading, !report, report) correctly branched. All 6 sections present. Chat input pinned below ScrollView. Regenerate button in topBar when report !== null. |
| `src/components/advisor/ScoreSummaryCard.tsx` | Score summary with biological age | VERIFIED | Renders biologicalAge (or "—"), ageBand, headline, trend. Null-safe. Theme tokens throughout. |
| `src/components/advisor/ReportCard.tsx` | Section card with A/B/C grade badges | VERIFIED | Union discriminant type (ReportItem.kind) handles all 4 section types. lookupGrade() returns real EvidenceGrade from SUPPLEMENT_DATABASE or 'B' for medications, null when no match. Grade badge rendered only when grade is non-null. |
| `src/components/advisor/ChatThread.tsx` | Chat bubble renderer | VERIFIED | user/assistant bubble styling. Typing indicator ("• • •") when isThinking=true. Empty+!isThinking shows prompt text. Messages rendered via .map() — safe inside parent ScrollView. |
| `src/lib/advisorService.ts` | generateReport and sendChatMessage client wrappers | VERIFIED | Both functions call supabase.functions.invoke('ai-advisor'). Error mapping covers 429/401/500/502. Result-object pattern (data + error). No @anthropic-ai/sdk import. |
| `src/lib/advisorContext.ts` | Anonymized context assembler | VERIFIED | Reads 5 AsyncStorage keys in parallel. Age bucketed to 5-year bands. Biomarker values mapped to status categories (no raw values). No name, no exact birthdate, no Supabase user ID in output. |
| `src/screens/DashboardScreen.tsx` | AI Advisor entry point with isPremium gate | PARTIAL | Gate code is correct at line 575: isPremium ? nav.navigate('AIAdvisor') : nav.navigate('Paywall'). BUT: isPremium is always true because PremiumContext.tsx has a TEMP-PHASE18-TEST override that disables Adapty. The gate exists but the value it evaluates is permanently true. |
| `supabase/functions/ai-advisor/index.ts` | Edge Function — JWT auth + rate limiting + Claude proxy | PARTIAL | Core function logic is correct and deployed. However, the critical fixes from 18-03 (max_tokens 4096, AbortController, stop_reason guard) are uncommitted working-tree changes. The committed version in the repo still has max_tokens:2000 and no AbortController. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| DashboardScreen.tsx:575 | AIAdvisor route or Paywall | `isPremium ? nav.navigate('AIAdvisor') : nav.navigate('Paywall')` | PARTIAL | Code is correct. Gate value (isPremium) is permanently true — the branch to Paywall is unreachable. |
| AIAdvisorScreen → advisorService | generateReport, sendChatMessage | import at line 16; handleGenerate() calls generateReport(); handleSendChat() calls sendChatMessage() | VERIFIED | Both functions called with correct arguments. Error handling propagates to inline error text. |
| AIAdvisorScreen → advisorContext | assembleAdvisorContext | import at line 15; called at handleGenerate() line 37 | VERIFIED | Context assembled before generateReport() call. Result passed directly. |
| AIAdvisorScreen → ScoreSummaryCard | scoreSummary prop | line 106: `<ScoreSummaryCard scoreSummary={report.scoreSummary} />` | VERIFIED | Prop type matches LongevityReport['scoreSummary']. |
| AIAdvisorScreen → ReportCard (x4) | items prop | lines 107–110: 4 ReportCard instances | VERIFIED | findingsItems, biomarkerItems, suppItems, recItems derived from report state via map(). Correct kind discriminants assigned. |
| AIAdvisorScreen → ChatThread | messages + isThinking | line 112: `<ChatThread messages={messages} isThinking={isChatLoading} />` | VERIFIED | messages state and isChatLoading flag both wired. |
| PremiumContext → DashboardScreen | isPremium value | usePremiumContext() at DashboardScreen line 44 | FAILED | isPremium is permanently true — TEMP-PHASE18-TEST override in PremiumContext.tsx. |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| AIAdvisorScreen | report | generateReport(context) → supabase.functions.invoke('ai-advisor') | Yes — real Supabase Edge Function call to Claude API | FLOWING |
| AIAdvisorScreen | messages | useState([]) + setMessages in handleSendChat | Yes — user input + sendChatMessage() response from Claude | FLOWING |
| AIAdvisorScreen | reportSummary | useMemo from report.scoreSummary.headline + priorityFindings | Derived from real report data | FLOWING |
| ScoreSummaryCard | scoreSummary | prop from AIAdvisorScreen's report state | Real LongevityReport data | FLOWING |
| ChatThread | messages | prop from AIAdvisorScreen | Real user/assistant messages | FLOWING |
| PremiumContext | isPremium | TEMP-PHASE18-TEST: hardcoded true | No — static value, Adapty SDK bypassed | HOLLOW_PROP |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — no runnable entry points without starting the Expo dev server. The app is a React Native / Expo project with no standalone runnable entry points accessible without a simulator or device.

---

### Probe Execution

Step 7c: No probe scripts declared in PLAN files and no `scripts/*/tests/probe-*.sh` found. SKIPPED.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| AI-04 | 18-01, 18-02, 18-03 | 6-section report rendering in AIAdvisorScreen | SATISFIED | All 6 sections rendered: ScoreSummaryCard + 4 ReportCard instances + FOLLOW-UP CHAT |
| AI-05 | 18-01, 18-02, 18-03 | Follow-up chat with conversation thread | SATISFIED | ChatThread renders message history; handleSendChat sends full history to sendChatMessage(); fresh on reopen |
| AI-06 | 18-01, 18-02, 18-03 | Free user premium gate to paywall | BLOCKED | Gate code exists at DashboardScreen.tsx:575 but isPremium is permanently true — paywall branch unreachable |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/context/PremiumContext.tsx` | 42 | `useState(true) // TEMP-PHASE18-TEST` | BLOCKER | Hardcoded premium=true defeats the free-user paywall gate (AI-06, SC-3) |
| `src/context/PremiumContext.tsx` | 43 | `useState(false) // TEMP-PHASE18-TEST` | BLOCKER | isPremiumLoading=false prevents loading state — superficially fine but paired with the above |
| `src/context/PremiumContext.tsx` | 52 | `return; // TEMP-PHASE18-TEST` — bare return at top of useEffect | BLOCKER | Disables all Adapty SDK calls: initial fetch, profile listener, and AppState subscription are dead code. Adapty is never contacted. |

**Debt marker gate assessment:** The `TEMP-PHASE18-TEST` comments are not `TBD`, `FIXME`, or `XXX` and do not trigger the formal debt-marker gate. However, they are unreferenced testing overrides that directly cause Success Criterion 3 (free user → paywall) to fail. Classified as BLOCKER under the artifact-stub rule: the gate code exists but the value it evaluates is permanently misconfigured.

The `supabase/functions/ai-advisor/index.ts` changes are also uncommitted. These are not Expo source files (Edge Functions deploy separately) but the lack of a commit means the source repo is not auditable for the fix that unblocked human verification.

---

### Human Verification Required

#### 1. Free-user paywall flow (after PremiumContext revert)

**Test:** Revert PremiumContext.tsx to the Phase 16 baseline (isPremium=false default, isPremiumLoading=true, remove the bare `return;`). Run the app with a sandbox Apple ID that has no active Adapty subscription. Tap "AI Advisor" on the Dashboard.

**Expected:** PaywallScreen opens — not AIAdvisorScreen. The "Intelligence" section shows no premium indicator or lock icon when Adapty confirms no subscription.

**Why human:** Requires a real or sandbox device with Adapty integration. isPremium state after revert depends on the Adapty SDK returning the correct profile for the test account, which cannot be verified by static analysis.

#### 2. Premium flow still works after PremiumContext revert

**Test:** With the same revert applied, use a sandbox Apple ID that has an active Adapty premium subscription. Tap "AI Advisor" on the Dashboard.

**Expected:** AIAdvisorScreen opens, report generates, chat works end-to-end — identical behavior to the human verification approved in Plan 03.

**Why human:** Confirms the revert did not introduce a regression for premium users. Adapty SDK profile resolution must succeed for isPremium=true.

---

### Gaps Summary

**Two gaps block phase completion:**

**Gap 1 (root cause): TEMP-PHASE18-TEST in PremiumContext.tsx was not reverted before phase completion.** The developer hardcoded `isPremium = true` and short-circuited `useEffect` to bypass Adapty during local UI testing. This is a standard testing technique but the override was left in place when the phase was declared done. The result: Success Criterion 3 ("free user sees paywall") is structurally impossible — the paywall branch at DashboardScreen.tsx:575 can never be reached. Fix: revert lines 42–43 and line 52 of PremiumContext.tsx to the Phase 16 state.

**Gap 2 (audit gap): Edge Function changes are uncommitted.** The 18-03-SUMMARY.md documents critical fixes (max_tokens 4096, AbortController, stop_reason guard) that resolved a 502 EDGE_FUNCTION_ERROR during human verification. These changes exist as working-tree modifications but have not been committed. `git status` confirms `M supabase/functions/ai-advisor/index.ts`. Fix: commit the changes so the repository reflects deployed state.

Both gaps have clear, minimal fixes. Gaps 1 and 2 are independent — fixing either one does not affect the other.

---

_Verified: 2026-06-15_
_Verifier: Claude (gsd-verifier)_
