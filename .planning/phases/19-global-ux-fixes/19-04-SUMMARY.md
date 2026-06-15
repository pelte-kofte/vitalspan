---
phase: 19
plan: "19-04"
subsystem: screens
tags: [longevity-score, orbital, touchable, ux, healthkit]
dependency_graph:
  requires: [OrbitalInfoModal]
  provides: [LongevityScoreScreen orbital onPress routing]
  affects: [src/screens/LongevityScoreScreen.tsx]
tech_stack:
  added: []
  patterns: [conditional TouchableOpacity wrapping, permissionState-branched modal routing]
key_files:
  created: []
  modified:
    - src/screens/LongevityScoreScreen.tsx
key_decisions:
  - "dataOrb and metricCell wrapping is conditional: only sleep/hrv/fitness with val==null get TouchableOpacity; non-empty orbs and inflammation/glucose/recovery remain plain Views"
  - "sleep+denied routes directly to handleOpenSettings() — no modal — per plan spec D-04"
  - "hrv/fitness denied state routes to a modal that calls handleOpenSettings via onCta (consistent UX vs sleep)"
  - "Inner View inside TouchableOpacity wrapper retains s.dataOrb (position:absolute) for consistent visual sizing; outer TouchableOpacity carries absolute positioning"
metrics:
  duration: "3 min"
  started: "2026-06-15T20:09:35Z"
  completed: "2026-06-15T20:12:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 1
---

# Phase 19 Plan 04: Orbital onPress Handlers Summary

Wired interactive onPress routing to Sleep, HRV, and Fitness data orbs and metric grid cells in LongevityScoreScreen — empty-state taps now route to permission request, contextual info modal, or iOS Settings based on permissionState.

## Duration

3 min (2026-06-15T20:09:35Z → 2026-06-15T20:12:00Z)

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add OrbitalInfoModal state and handleOrbitalPress handler | c28bd65 | src/screens/LongevityScoreScreen.tsx |
| 2 | Wire onPress to dataOrb/metricCell; render OrbitalInfoModal | ec93663 | src/screens/LongevityScoreScreen.tsx |

## What Was Built

`src/screens/LongevityScoreScreen.tsx` modified to:

- Import `OrbitalInfoModal` from `../components/OrbitalInfoModal`
- Declare `orbitalModal` state (`{ title, body, ctaLabel?, onCta? } | null`) after existing useState declarations
- Define `handleOrbitalPress(metricKey: 'sleep' | 'hrv' | 'fitness')` function with three permission branches:
  - `pre-request`: fires haptic + `handleRequestPermission()`
  - `sleep + denied`: calls `handleOpenSettings()` directly (no modal)
  - `sleep + granted/no-data`: shows info modal with 3-night sleep instruction
  - `hrv/fitness + denied`: shows Watch modal with Connect Health CTA calling `handleOpenSettings()`
  - `hrv/fitness + granted/no-data`: shows Watch modal with Connect Health CTA calling `handleRequestPermission()`
- dataOrb map: sleep/hrv/fitness with `val==null` wrapped in `TouchableOpacity` (positioned absolutely); inflammation/glucose/recovery remain plain `View`s
- metricCell map: sleep/hrv/fitness with `val==null` wrapped in `TouchableOpacity`; other keys remain plain `View`s
- `OrbitalInfoModal` rendered inside `SafeAreaView` after `TransparencyModal`, gated on `orbitalModal !== null`

## Verification Results

- `npx tsc --noEmit` — exit 0, zero errors
- `grep -n "handleOrbitalPress\|OrbitalInfoModal\|orbitalModal" LongevityScoreScreen.tsx` — import (line 40), state (line 276), function (line 375), orb onPress (line 697), cell onPress (line 757), JSX render (lines 843–850)
- `grep -n "TouchableOpacity" LongevityScoreScreen.tsx` — new entries for dataOrb wrapper (line ~693) and metricCell wrapper (line ~753)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. The onPress routing is fully wired to real functions (`handleRequestPermission`, `handleOpenSettings`, `setOrbitalModal`). No placeholder data or hardcoded empty values.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes introduced. All changes are pure UI state routing to pre-existing `handleRequestPermission` and `handleOpenSettings` functions.

## Self-Check: PASSED

- [x] `src/screens/LongevityScoreScreen.tsx` modified on disk
- [x] Commit `c28bd65` exists: Task 1 — state and handler
- [x] Commit `ec93663` exists: Task 2 — onPress wiring and OrbitalInfoModal render
- [x] TypeScript clean (`npx tsc --noEmit` exits 0)
- [x] OrbitalInfoModal imported and rendered
- [x] handleOrbitalPress defined with correct permissionState branches
- [x] sleep/hrv/fitness orbs wrapped in TouchableOpacity when val==null
- [x] sleep/hrv/fitness metric cells wrapped in TouchableOpacity when val==null
- [x] inflammation/glucose/recovery unchanged
