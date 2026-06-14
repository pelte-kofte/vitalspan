---
phase: 18-ai-advisor-ui
plan: "01"
subsystem: ui-components
tags: [advisor, components, presentation, dark-theme]
dependency_graph:
  requires:
    - src/lib/advisorService.ts
    - src/data/supplementTimings.ts
    - src/data/medications.ts
    - src/theme/index.ts
  provides:
    - src/components/advisor/ScoreSummaryCard.tsx
    - src/components/advisor/ReportCard.tsx
    - src/components/advisor/ChatThread.tsx
  affects:
    - src/screens/AIAdvisorScreen.tsx (Plan 02 will compose these)
tech_stack:
  added: []
  patterns:
    - Stateless presenter components — all data via props, no internal state
    - Union discriminant type (ReportItem.kind) for multi-section rendering
    - App-side DB name matching for evidence grade assignment
key_files:
  created:
    - src/components/advisor/ScoreSummaryCard.tsx
    - src/components/advisor/ReportCard.tsx
    - src/components/advisor/ChatThread.tsx
  modified: []
decisions:
  - "lookupGrade() uses case-insensitive partial match (includes) against both SUPPLEMENT_DATABASE.name and MEDICATION_DATABASE.genericName + brandNames — returns null when no match, no badge rendered"
  - "Medications return grade 'B' by convention per D-09 — pharmacist-reviewed drug class info"
  - "ReportItem union exported as named export so Plan 02 can import it for type-safe mapping"
  - "ChatThread uses messages.map (not FlatList) to be safely embedded in parent ScrollView"
  - "ReportCard renderItem() extracted as a standalone function to keep JSX block readable"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-15"
  tasks_completed: 3
  files_created: 3
  files_modified: 0
requirements_satisfied:
  - AI-04
  - AI-05
---

# Phase 18 Plan 01: AI Advisor Sub-Components Summary

Three stateless presenter components for the AI Advisor UI — built first so Plan 02 (AIAdvisorScreen) can stay under 200 lines by composing them.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ScoreSummaryCard component | 3673994 | src/components/advisor/ScoreSummaryCard.tsx |
| 2 | ReportCard with evidence grade badge logic | c76f96a | src/components/advisor/ReportCard.tsx |
| 3 | ChatThread component | f94f9f2 | src/components/advisor/ChatThread.tsx |

## What Was Built

**ScoreSummaryCard** — Dark neural card displaying biological age as a large centered number (44px / display2), ageBand, headline, and trend. When `biologicalAge` is null renders "—" with the caption "Add more biomarkers for your biological age". All sizing from `Typography.sizes.*`, all colors from `Colors.dark.*`.

**ReportCard** — Generic section card that renders any of the four LongevityReport array sections via the `ReportItem` union discriminant type (`kind: 'finding' | 'biomarker' | 'supplement' | 'recommendation'`). Contains the `lookupGrade()` function (private, not exported) that does case-insensitive partial name matching against `SUPPLEMENT_DATABASE` (returns the supplement's actual evidenceGrade) and `MEDICATION_DATABASE` (returns 'B' as default). Returns null when no match — no badge rendered. A/B/C badge colors mirror the exercise intensity pill colors (optimalBg/reviewBg/criticalBg from `Colors.status.*`).

**ChatThread** — Message bubble renderer using `messages.map()` (not FlatList). User bubbles align right with `Colors.primary` background; assistant bubbles align left with `Colors.dark.cardBg + border`. `isThinking=true` appends a typing indicator bubble ("• • •" in `Colors.dark.textMuted`). Empty + not thinking shows a centered follow-up prompt.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced hardcoded hex with Colors.dark.text in ChatThread**
- **Found during:** Post-task review of Task 3
- **Issue:** The plan spec said user bubble text color was "'#E8F5EE'" — this was typed as a literal hex string in the initial implementation, violating the CLAUDE.md "all colors from theme tokens" rule
- **Fix:** Replaced `'#E8F5EE'` with `Colors.dark.text` (same value, now via theme token)
- **Files modified:** src/components/advisor/ChatThread.tsx
- **Commit:** 934b5d5

### Infrastructure

**Worktree merge required:** The worktree was created from Phase 4 (commit f3ebd7f) and lacked `src/lib/advisorService.ts` (created in Phase 17). Ran `git merge main --no-edit` to bring the worktree up to the full codebase state before implementing Phase 18 components. This is expected behavior for worktrees spawned before phase dependencies were committed.

## Known Stubs

None — these are pure presentation components. They render whatever data is passed in; no data is stubbed or hardcoded.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. All three components are stateless UI renderers with no side effects. `lookupGrade()` performs read-only lookups against bundled local arrays — no external calls, no write paths. Matches the T-18-01-01 threat register entry (disposition: accept).

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| ScoreSummaryCard.tsx exists | FOUND |
| ReportCard.tsx exists | FOUND |
| ChatThread.tsx exists | FOUND |
| Commit 3673994 (Task 1) | FOUND |
| Commit c76f96a (Task 2) | FOUND |
| Commit f94f9f2 (Task 3) | FOUND |
| Commit 934b5d5 (Fix) | FOUND |
| tsc --noEmit errors in advisor/ | 0 |
