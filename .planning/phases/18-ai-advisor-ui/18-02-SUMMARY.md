---
phase: 18-ai-advisor-ui
plan: "02"
subsystem: screens
tags: [advisor, screen, report-generation, chat, dark-theme]
dependency_graph:
  requires:
    - src/lib/advisorService.ts
    - src/lib/advisorContext.ts
    - src/components/advisor/ScoreSummaryCard.tsx
    - src/components/advisor/ReportCard.tsx
    - src/components/advisor/ChatThread.tsx
    - src/theme/index.ts
    - src/components/NeuralGrid.tsx
  provides:
    - src/screens/AIAdvisorScreen.tsx
  affects:
    - src/navigation/AppNavigator.tsx (AIAdvisor route — already registered, no changes)
tech_stack:
  added: []
  patterns:
    - Three-state rendering: loading / CTA / report (isLoading + report null-check)
    - KeyboardAvoidingView with pinned bottom input row outside ScrollView
    - useMemo for reportSummary derivation from report state
    - Result-object pattern from advisorService (check .error before .data)
    - Inline error display (not Alert) for 429 rate limit and other errors
key_files:
  created: []
  modified:
    - src/screens/AIAdvisorScreen.tsx
decisions:
  - "Regenerate button placed in topBar right slot (replaces spacer View) — visible only when report !== null, matching D-03"
  - "reportSummary derived via useMemo from scoreSummary.headline + priorityFindings[0..2].map(f=>f.finding).join(' ') — matches plan spec for chat context"
  - "sendDisabled local const captures isChatLoading || trim().length===0 — referenced twice (disabled prop + opacity) without duplication"
  - "StyleSheet compact style — one-liner style definitions to stay under the 200-line ceiling per CLAUDE.md rule"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-15"
  tasks_completed: 1
  files_created: 0
  files_modified: 1
requirements_satisfied:
  - AI-04
  - AI-05
  - AI-06
---

# Phase 18 Plan 02: AI Advisor Screen Summary

Full AIAdvisorScreen.tsx wiring the Plan 01 presenter components (ScoreSummaryCard, ReportCard, ChatThread) with the Phase 17 service layer (assembleAdvisorContext, generateReport, sendChatMessage) into a complete 161-line screen.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite AIAdvisorScreen with report generation flow and loading state | ecc83e9 | src/screens/AIAdvisorScreen.tsx |

## What Was Built

**AIAdvisorScreen** — Full-screen dark modal with three rendering states:

1. **Loading state** — Full-screen NeuralGrid (`intensity="high" tone="vital" animate`) with centered "Analyzing your health snapshot..." text and ActivityIndicator. Shown while `isLoading=true`.

2. **CTA state** — NeuralGrid (`intensity="low"`) with hero text, subtitle, and "Generate My Report" TouchableOpacity. `generationError` renders inline in `Colors.viz.coral` below the CTA button when non-null. Shown when `isLoading=false` and `report=null`.

3. **Report state** — KeyboardAvoidingView (`behavior='padding'` on iOS) wrapping a ScrollView with 6 sections: ScoreSummaryCard, four ReportCard instances (PRIORITY FINDINGS, BIOMARKER ANALYSIS, SUPPLEMENT & MEDICATION REVIEW, RECOMMENDATIONS), and ChatThread with section header. Chat input row pinned below ScrollView with TextInput + send button (disabled + opacity 0.4 when input empty or in-flight). Regenerate button replaces the right spacer in topBar. Shown when `isLoading=false` and `report !== null`.

## Deviations from Plan

None — plan executed exactly as written. The worktree required a `git merge main` to pull in Phase 17/18 dependencies (same infrastructure deviation as Plan 01 — expected for worktrees spawned before phase dependencies were committed).

## Known Stubs

None — the screen renders real data from advisorService / advisorContext. No hardcoded placeholders or empty-state stubs that affect the plan's goal.

## Threat Surface Scan

No new network endpoints introduced. All API calls go through `advisorService.ts` (existing Supabase Edge Function boundary). `chatInput` user text is sent to the Edge Function, consistent with T-18-02-03 threat register entry (disposition: mitigate — rate limit 20 msgs/day, no client-side persistence). No new trust boundary surface beyond what was declared in the 18-02 threat model.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| AIAdvisorScreen.tsx exists | FOUND |
| Commit ecc83e9 (Task 1) | FOUND |
| tsc --noEmit errors | 0 |
| Line count <= 200 | 161 lines |
| Colors.dark.* used (no hardcoded hex except gradient bg) | PASS |
| Inline error text for 429 (not Alert) | PASS |
| Regenerate button visible only when report !== null | PASS |
| Send button disabled when empty or isChatLoading | PASS |
