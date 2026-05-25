---
phase: 01-first-run-and-empty-states
plan: 01
subsystem: first-run-flow
tags: [navigation, async-storage, biomarkers, onboarding, react-native]
dependency_graph:
  requires: []
  provides:
    - GuidedFirstRun route in RootStackParamList
    - ExplanationCard component
    - firstRunContent.ts data module
    - totalcholesterol biomarker entry
    - @vitalspan_first_run_complete AsyncStorage key
  affects:
    - src/screens/OnboardingScreen.tsx (nav target changed)
    - src/navigation/AppNavigator.tsx (new route registered)
tech_stack:
  added: []
  patterns:
    - Single-return step-machine with content derived from step index
    - BreathingCard-wrapped ExplanationCard extracted as standalone component
    - AsyncStorage read-push-write pattern for StoredEntry persistence
key_files:
  created:
    - src/data/firstRunContent.ts
    - src/components/ExplanationCard.tsx
    - src/screens/GuidedFirstRunScreen.tsx
  modified:
    - src/data/biomarkers.ts
    - src/navigation/AppNavigator.tsx
    - src/screens/OnboardingScreen.tsx
decisions:
  - Single-return pattern chosen over early-return per step to keep GuidedFirstRunScreen under 200 lines
  - ExplanationCard extracted as standalone component per CLAUDE.md 200-line limit
  - saveEntry() extracted as reusable async helper shared by handleStepAdvance and handleFinish
metrics:
  duration_minutes: 4
  completed_date: "2026-05-25T09:59:50Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 3
---

# Phase 01 Plan 01: Guided First-Run Flow — Data, Components, Navigation Summary

Thin end-to-end guided first-run flow: 3-step biomarker entry screen (Glucose, HbA1c, Cholesterol) with BreathingCard explanation cards, AsyncStorage persistence, and full navigation wiring from OnboardingScreen to Main.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add totalcholesterol biomarker + firstRunContent.ts | 3265c38 | src/data/biomarkers.ts, src/data/firstRunContent.ts |
| 2 | Create ExplanationCard + GuidedFirstRunScreen | d4ad030 | src/components/ExplanationCard.tsx, src/screens/GuidedFirstRunScreen.tsx |
| 3 | Register GuidedFirstRun route + wire OnboardingScreen | 5c95503 | src/navigation/AppNavigator.tsx, src/screens/OnboardingScreen.tsx |

## What Was Built

**firstRunContent.ts** — Static data module exporting `FirstRunContent` interface, `FIRST_RUN_CONTENT` array (3 entries), and `FIRST_RUN_CONTENT_MAP` for O(1) lookup. Body copy for all 3 biomarkers (fastingglucose, hba1c, totalcholesterol) copied verbatim from UI-SPEC §Copywriting Contract.

**ExplanationCard.tsx** — Self-contained BreathingCard-wrapped component (icon + headline + body) extracted to keep GuidedFirstRunScreen under the 200-line CLAUDE.md limit. Exports both `ExplanationCardProps` and the default component.

**GuidedFirstRunScreen.tsx** — 3-step guided biomarker entry screen (162 lines). Single-return architecture derives all content from step index. Key behaviors: step advance saves StoredEntry to `@vitalspan_biomarkers` with `source: 'Blood test'`; finish writes `@vitalspan_first_run_complete=true`; skip writes `@vitalspan_first_run_complete=true` without saving; both paths call `nav.reset` to Main. Input validation with inline error using `Colors.status.critical`. KeyboardAvoidingView footer floats above keyboard.

**totalcholesterol biomarker** — New entry in BIOMARKERS array (category: cardio, optMin: 150, optMax: 200, unit: mg/dL) per UI-SPEC longevity ranges.

**AppNavigator** — `GuidedFirstRun: undefined` added to `RootStackParamList`. New `Stack.Screen` with `presentation: 'fullScreenModal'`, `animation: 'fade_from_bottom'`, and `gestureEnabled: false` preventing accidental dismissal.

**OnboardingScreen** — `finish()` now resets to `GuidedFirstRun` instead of `Main`. End-to-end path: Landing → Onboarding → GuidedFirstRun → Main.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, or file access patterns introduced. All storage is local AsyncStorage. `@vitalspan_first_run_complete` is a local UX flag. Threat model T-01-01 (input validation) is mitigated: `parseFloat` + `isNaN(parsed) || parsed <= 0` check in `saveEntry()` rejects invalid input before any write.

## Known Stubs

None. All data flows are wired end-to-end.

## Requirements Satisfied

- FIRST-01: Guided flow after onboarding — OnboardingScreen.finish() resets to GuidedFirstRunScreen
- FIRST-02: Plain-English explanation card per step — ExplanationCard renders FIRST_RUN_CONTENT for each biomarker
- FIRST-03: Skip path — "I'll do this later" sets @vitalspan_first_run_complete=true and navigates to Main
- FIRST-04: Complete → Dashboard with data — final step persists third StoredEntry and resets to Main

## Self-Check: PASSED

Files verified:
- src/data/firstRunContent.ts: FOUND
- src/components/ExplanationCard.tsx: FOUND
- src/screens/GuidedFirstRunScreen.tsx: FOUND (162 lines, ≤200)
- src/data/biomarkers.ts: MODIFIED — totalcholesterol entry FOUND
- src/navigation/AppNavigator.tsx: MODIFIED — GuidedFirstRun route FOUND
- src/screens/OnboardingScreen.tsx: MODIFIED — GuidedFirstRun nav target FOUND

Commits verified:
- 3265c38: feat(01-01): add totalcholesterol biomarker + firstRunContent.ts data module
- d4ad030: feat(01-01): create ExplanationCard component + GuidedFirstRunScreen 3-step flow
- 5c95503: feat(01-01): register GuidedFirstRun route + wire OnboardingScreen handoff

TypeScript: npx tsc --noEmit — 0 errors
