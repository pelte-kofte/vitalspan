---
phase: 20-protocol-schema-migration
plan: "01"
subsystem: ui
tags: [typescript, protocol, types, asyncstorage, react-native]

# Dependency graph
requires: []
provides:
  - "src/types/protocol.ts — canonical home for ProtocolItem, ProtocolState, TimeSlot, CustomSupplement, EMPTY_PROTOCOL"
  - "TimeSlot type: 'morning' | 'afternoon' | 'evening' | 'night'"
  - "ProtocolItem with unified supplement schema (id, name, dose, personalDose?, timing?, source, addedAt)"
  - "ProtocolState with supplements[], medTimes, hiddenMeds[], taken[], takenDate"
  - "EMPTY_PROTOCOL zero-value constant"
affects:
  - 20-02-PLAN (ProtocolScreen overhaul — imports from here)
  - 20-03-PLAN (downstream consumers — imports from here)
  - Phase 22 (adherence streaks, dose bucketing — imports ProtocolItem, ProtocolState)
  - Phase 23 (notification consumers — imports ProtocolState)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Centralized types file pattern: all protocol types in src/types/protocol.ts, no cross-screen type imports"
    - "Migration-detection-only legacy type: CustomSupplement kept for old-schema detection, not new usage"

key-files:
  created:
    - src/types/protocol.ts
  modified: []

key-decisions:
  - "D-04: All protocol types centralised in src/types/protocol.ts — no imports from ProtocolScreen.tsx for Phase 22/23 consumers"
  - "D-02: ProtocolItem unifies addedSupplements + customSupplements with source discriminant ('db' | 'manual')"
  - "D-06: personalDose?: string on ProtocolItem for supplements-only override; medications use medTimes only"
  - "D-07: hiddenMeds: string[] on ProtocolState for soft-hide of medications from protocol view"
  - "D-05: CustomSupplement retained as migration-detection-only type — new code must use ProtocolItem"

patterns-established:
  - "src/types/ directory created — canonical location for shared app types in Vitalspan"
  - "Pure types files: no imports, no runtime logic, single const (EMPTY_PROTOCOL) only"

requirements-completed:
  - PROT-01
  - PROT-04

# Metrics
duration: 2min
completed: 2026-06-16
---

# Phase 20 Plan 01: Protocol Schema Migration — Types Foundation Summary

**`src/types/protocol.ts` created with unified ProtocolItem + updated ProtocolState schema, replacing the split `addedSupplements: string[]` + `customSupplements: CustomSupplement[]` design**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-16T08:48:56Z
- **Completed:** 2026-06-16T08:51:43Z
- **Tasks:** 1 of 1
- **Files modified:** 1 (created)

## Accomplishments
- Created `src/types/` directory (new) and `src/types/protocol.ts` as the canonical types file for all protocol-related types
- Exported `TimeSlot`, `ProtocolItem`, `ProtocolState`, `CustomSupplement` (migration-detection legacy), and `EMPTY_PROTOCOL`
- `ProtocolItem` adds `personalDose?: string` (D-06) and `source: 'db' | 'manual'` discriminant to support the unified supplement array
- `ProtocolState` gains `hiddenMeds: string[]` (D-07) for soft-hiding medications from the protocol view
- `tsc --noEmit` exits 0 — no type errors introduced

## Task Commits

1. **Task 1: Create src/types/protocol.ts** - `dc1036f` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `src/types/protocol.ts` — Canonical types file: TimeSlot, ProtocolItem, ProtocolState, CustomSupplement, EMPTY_PROTOCOL

## Decisions Made
Followed plan decisions D-01 through D-07 as specified. No additional decisions needed at this stage.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None. The `src/types/` directory did not yet exist and was created as part of this task (expected for a new file).

## Known Stubs

None. This is a pure types file — no runtime data flows through it.

## Threat Flags

None. The types file introduces no new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries. All threat register items accepted (T-20-01, T-20-SC).

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- `src/types/protocol.ts` is ready for import by Plan 02 (ProtocolScreen overhaul) and Plan 03 (downstream consumers)
- Import path: `import { ProtocolItem, ProtocolState, TimeSlot, CustomSupplement, EMPTY_PROTOCOL } from '../types/protocol'`
- No blockers — tsc passes cleanly

## Self-Check: PASSED

- [x] `src/types/protocol.ts` exists
- [x] Commit `dc1036f` exists in git log
- [x] `export type TimeSlot` — 1 occurrence
- [x] `export interface ProtocolItem` — 1 occurrence
- [x] `export interface ProtocolState` — 1 occurrence
- [x] `hiddenMeds` — 2 occurrences (interface + EMPTY_PROTOCOL)
- [x] `personalDose` — 1 occurrence
- [x] `source: 'db' | 'manual'` — 1 occurrence
- [x] `export interface CustomSupplement` — 1 occurrence
- [x] `export const EMPTY_PROTOCOL` — 1 occurrence
- [x] `tsc --noEmit` exits 0

---
*Phase: 20-protocol-schema-migration*
*Completed: 2026-06-16*
