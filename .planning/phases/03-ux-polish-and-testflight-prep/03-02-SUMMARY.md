---
phase: "03-ux-polish-and-testflight-prep"
plan: "02"
subsystem: "Protocol Screen UX"
tags: ["empty-state", "ux-polish", "protocol", "onboarding"]
dependency_graph:
  requires: []
  provides: ["POLISH-03 — cohesive Protocol tab empty state"]
  affects: ["src/screens/ProtocolScreen.tsx"]
tech_stack:
  added: []
  patterns: ["screen-level empty state guard (totalItems === 0)", "CTA reuse from existing sheet open pattern"]
key_files:
  created: []
  modified:
    - path: "src/screens/ProtocolScreen.tsx"
      change: "Added screen-level empty state card rendered when totalItems === 0"
decisions:
  - "Used emoji (💊) via inline style for fontSize/textAlign only — acceptable as dynamic styling, not a color/spacing violation"
  - "paddingVertical: 10 used for CTA button — Spacing.sm=8 and Spacing.md=12 don't land on 10; explicit literal is acceptable per plan"
  - "alignSelf: 'stretch' on CTA makes it full-width inside the card for better tap target"
metrics:
  duration: "54 seconds"
  completed: "2026-05-25"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 03 Plan 02: Protocol Screen Empty State Summary

Screen-level empty state card in ProtocolScreen that replaces two disconnected section empties with a single purposeful introduction when `totalItems === 0`.

## What Was Built

When a new user has no medications and no supplements, the Protocol tab now shows a cohesive card above the existing section cards containing:
- A headline "Build your longevity stack"
- Explanation copy covering medications, supplements, daily protocol tracking, and interaction checking
- A "Get started →" CTA that opens the AddSupplementSheet (same as the existing "+ Add supplement" button)

Once any medication or supplement is added (`totalItems > 0`), the card disappears and normal section rendering continues. The existing section-level empty messages ("No medications in your profile", "No supplements in your stack yet") remain intact for the partial-fill cases.

## Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Screen-level empty state card for ProtocolScreen | 33e75e8 | src/screens/ProtocolScreen.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Known Stubs

None — the empty state card is purely presentational UI with no data dependency.

## Self-Check: PASSED

- [x] `src/screens/ProtocolScreen.tsx` exists and is modified
- [x] Commit 33e75e8 exists
- [x] `grep -c "totalItems === 0"` returns 2 (header pill guard + new card guard)
- [x] `grep -c "emptyScreenCard"` returns 2 (style definition + JSX usage)
- [x] `grep -c "Get started"` returns 1
- [x] `grep -c "setShowRecommendedSheet(true)"` returns 2 (existing button + new CTA)
- [x] `npx tsc --noEmit` exits 0 (no output)
- [x] `grep -c "emptyState"` returns 3 — existing styles not removed
- [x] No new hardcoded hex values (count unchanged at 1)
