# Phase 18: AI Advisor — UI - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full `AIAdvisorScreen.tsx` UI on top of the Phase 17 backend:

1. **Report generation UX** — CTA entry, full-screen loading state, Regenerate button
2. **6-section report card layout** — ScrollView with Score Summary, Priority Findings, Biomarker Analysis, Supplement & Medication Review, Recommendations (with A/B/C badges), and Follow-up Chat entry
3. **Follow-up chat UI** — Conversation thread in ScrollView, input pinned to bottom of screen
4. **Evidence grade mapping** — App-side A/B/C assignment from supplement/drug DB per D-02 from Phase 17

Out of scope: free-user paywall gate (already in `DashboardScreen.tsx:575` — AI-06 is done), report persistence, report history, PDF export, streaming responses.

</domain>

<decisions>
## Implementation Decisions

### Generation UX

- **D-01:** **CTA button triggers generation** — AIAdvisorScreen opens with a dark hero state + prominent "Generate My Report" CTA. Report does NOT auto-generate on screen open. Explicit trigger makes the AI call intentional and communicates the wait to the user.
- **D-02:** **Loading state: full-screen NeuralGrid animation + text message.** During the 10–30s Claude call: dark screen, NeuralGrid component (already exists), rotating/pulsing indicator, and text "Analyzing your health snapshot…". Matches LongevityScoreScreen's loading aesthetic. NOT skeleton cards.
- **D-03:** **Regenerate button visible after report loads.** Placement: top bar (as an icon or text alongside the back button) or below the report. Tapping it re-triggers `generateReport()` — counts against the user's 5/day rate limit. If rate limited, surface D-15 error from Phase 17.

### Layout Structure

- **D-04:** **Single ScrollView containing all 6 report section cards + chat thread.** No tabs, no bottom sheet. All sections scroll vertically in one unified surface. Chat conversation thread appears below the last report card.
- **D-05:** **Chat text input pinned to bottom of screen.** Input bar stays fixed while ScrollView scrolls above. Keyboard-aware (KeyboardAvoidingView or similar). Standard chat pattern. NOT inline at end of ScrollView.
- **D-06:** **All 6 report sections always expanded.** No accordion collapse. Report is the premium deliverable — content should not be hidden behind extra taps after a 30s wait.

### Score Summary Card (Section 1)

- **D-07:** **Large centered biological age number + supporting text.** Layout: large `biologicalAge` number centered in the card, `ageBand` (e.g., "35–39") below in smaller text, Claude-generated `headline` as a 2-line text block below that. `trend` field used as a secondary text line. NO SVG orbital animation — that lives in LongevityScoreScreen. Simpler card keeps Phase 18 focused on content, not animation.
- **D-08:** **Dark neural theme throughout.** Dark green-black background (#080D09 → #0F1C14, same as AIAdvisorScreen stub gradient). Section cards use `Colors.dark.surface` or equivalent elevated dark token to differentiate cards from background. No beige/warm tokens on this screen.

### Evidence Grade Badges

- **D-09:** **A/B/C badge colors match existing exercise intensity pills.** A = green (same as "Easy"), B = amber ("Moderate"), C = coral ("Hard"). Reuses established color semantics from ExerciseScreen — no new color tokens needed.
- **D-10:** **No badge when recommendation doesn't match supplement/drug DB.** App-side matching uses supplement name against `SUPPLEMENT_DATABASE` (src/data/supplementTimings.ts) and `MEDICATION_DATABASE` (src/data/medications.ts). Unmatched items render without a grade badge — no fallback grade assigned, no made-up grades.

### Carrying Forward from Phase 17

- **D-11 (from P17-D-04):** Report is ephemeral — held in React state only. Closing the screen drops the report. No AsyncStorage, no Supabase persistence.
- **D-12 (from P17-D-06):** Chat is stateless server-side. `AIAdvisorScreen` holds `messages: ChatMessage[]` in React state. Each `sendChatMessage()` call sends the full history array. Conversation is lost on screen close.
- **D-13 (from P17-D-02):** Evidence grades are assigned app-side AFTER receiving the report. Claude returns `recommendations[]` without grades. Phase 18 maps `item.action` and `item.category` strings against DB names to assign A/B/C.
- **D-14 (from P17-D-15):** 429 rate limit error message is fixed: "You've reached your daily limit. Try again tomorrow." Surface this as a visible inline error or Alert — NOT silently ignored.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 17 Backend (the API this phase calls)
- `src/lib/advisorService.ts` — `generateReport(context)` and `sendChatMessage(messages, reportSummary)`. Read the full return types (`ReportResult`, `ChatResult`, `LongevityReport`, `ChatMessage`) before building the UI — these are the data shapes Phase 18 renders.
- `src/lib/advisorContext.ts` — `assembleAdvisorContext()`. Phase 18 calls this first, then passes the result to `generateReport()`.
- `.planning/phases/17-ai-advisor-backend/17-CONTEXT.md` — Full Phase 17 decisions (D-01 through D-16). Read especially D-01 (JSON schema contract), D-02 (app-side grades), D-04 (ephemeral report), D-06 (stateless chat), D-07 (model choice), D-15 (429 message).

### Requirements
- `.planning/REQUIREMENTS.md §AI-04, AI-05, AI-06` — Authoritative acceptance criteria for Phase 18. MUST read before planning.

### Existing UI Shell
- `src/screens/AIAdvisorScreen.tsx` — The stub this phase replaces. Has topBar, LinearGradient, back navigation pattern. Extend this file — do NOT create a new screen.
- `src/screens/LongevityScoreScreen.tsx` — Reference for dark modal pattern: NeuralGrid usage, topBar layout, ScrollView inside SafeAreaView, dark surface card styles.

### Data / Grade Mapping
- `src/data/supplementTimings.ts` — `SUPPLEMENT_DATABASE` with evidence grades. Used to map `recommendations[].action` / category strings → A/B/C grade (D-13).
- `src/data/medications.ts` — `MEDICATION_DATABASE`. Same app-side grade mapping purpose.

### Premium Gate (already implemented — for awareness only)
- `src/screens/DashboardScreen.tsx:575` — `isPremium ? nav.navigate('AIAdvisor') : nav.navigate('Paywall')`. AI-06 free-user redirect is DONE. Phase 18 does NOT need to re-implement this.
- `src/context/PremiumContext.tsx` — `usePremiumContext()` hook for `isPremium`. Available if Phase 18 needs to check premium status inside the screen (e.g., for defensive gating).

### Theme / Components
- `src/theme/index.ts` — `Colors.dark.*`, `Spacing.*`, `Typography.*`. Dark neural tokens for this screen.
- `src/components/NeuralGrid.tsx` — Used for the loading state animation (D-02). Props: `intensity`, `tone`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AIAdvisorScreen.tsx` — Stub with LinearGradient dark gradient + topBar + SafeAreaView skeleton. Extend in place — the route declaration and navigation pattern are already correct.
- `NeuralGrid` component — Used for loading state (D-02). Already imported in multiple screens. Pass `tone='vital'` for the AI advisor context.
- `usePremiumContext()` — Available if defensive premium check is needed inside the screen.
- `generateReport()` / `sendChatMessage()` — Fully implemented in `advisorService.ts`. Return typed result objects — handle `.error` before accessing `.data`.
- `assembleAdvisorContext()` — Call this first before `generateReport()`. Returns `AdvisorContext`.

### Established Patterns
- **Dark modal pattern**: `LongevityScoreScreen.tsx` — LinearGradient wrapping SafeAreaView + ScrollView inside, topBar at top, back button left / title center / spacer right.
- **ScrollView with pinned bottom input**: Not yet in the codebase — standard React Native pattern using `KeyboardAvoidingView` + `behavior='padding'` + `ScrollView` + fixed `View` for input row.
- **Result object handling**: `advisorService.ts` never throws — always returns `{ data, error }`. Check `error` first: surface to user, then check `data`.
- **Error display**: Existing screens use `Alert.alert()` for one-shot errors. For rate limit (429), inline error under the CTA is friendlier than an Alert.
- **Evidence grade pills**: `ExerciseScreen.tsx` — the intensity pill style (green/amber/coral) is the visual reference for A/B/C badges.

### Integration Points
- **`advisorService.ts`** → called from `AIAdvisorScreen.tsx`. No other files need to change for the core integration.
- **`AppNavigator.tsx`** — `AIAdvisor` route already declared (from Phase 16). No navigator changes needed.
- **`DashboardScreen.tsx`** — Entry point already wired (line 575). No changes needed.

</code_context>

<specifics>
## Specific Ideas

- **Loading copy**: "Analyzing your health snapshot…" — the text shown during the 30s generation wait. Communicates that something meaningful is happening, not just "Loading…"
- **Section 6 (Follow-up Chat) as UI heading**: The 6th "card" in the report is really a section header + chat thread + input — it's a UI convention, not a separate JSON field from the Edge Function (Phase 17's JSON has 5 data sections; chat is Phase 18's UI addition per the roadmap).
- **Chat input send action**: Standard pattern — text input row with a send icon button. Disable send button while `sendChatMessage()` is in flight. Show a typing indicator (3 dots or spinner) in the chat thread while waiting for assistant response.
- **reportSummary for chat context**: `sendChatMessage()` requires a `reportSummary: string` param. Phase 18 should derive this from the rendered report (e.g., stringify `scoreSummary.headline + priorityFindings[0..2]`) — keeps chat responses scoped to the user's specific report.
- **Biological age null handling**: `LongevityReport.scoreSummary.biologicalAge` is `number | null`. If null (insufficient biomarker data for PhenoAge), show "—" in the large number slot with a note "Add more biomarkers for your biological age".

</specifics>

<deferred>
## Deferred Ideas

- **Report history / past reports**: View previously generated reports. Better suited for v5.0 when users have accumulated months of data. (Carried from Phase 17 deferred list.)
- **Streaming Claude responses**: Progressive report reveal as Claude generates. Requires SSE in Edge Function + streaming-aware UI. Deferred — Phase 17/18 uses non-streaming. (Carried from Phase 17 deferred list.)
- **Share / PDF export**: Out of scope for Phase 18. (Carried from Phase 17 deferred list.)
- **Adaptive rate limits by subscription tier**: Different limits per Adapty access level. Phase 17 uses fixed 5/20 limits. Future phase with Adapty webhook integration.

</deferred>

---

*Phase: 18-ai-advisor-ui*
*Context gathered: 2026-06-15*
