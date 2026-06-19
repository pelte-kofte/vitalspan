---
phase: 20-protocol-schema-migration
plan: "03"
subsystem: ui
tags: [typescript, protocol, migration, react-native, asyncstorage, interaction-checker, advisor]

# Dependency graph
requires:
  - "src/types/protocol.ts (20-01)"
  - "src/screens/ProtocolScreen.tsx migration (20-02)"
provides:
  - "InteractionCheckerScreen.tsx reads from supplements[] with backward-compat fallback"
  - "advisorContext.ts assembles supplement names from protocolState?.supplements?.map(s => s.name)"
  - "Phase 20 protocol schema migration complete — tsc exits 0 project-wide"
affects:
  - Phase 22 (adherence streaks — supplements[] is stable canonical input)
  - Phase 23 (notification consumers — supplements[] is stable canonical input)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Backward-compat fallback pattern: new schema ?? legacy fallback for migration window"
    - "Internal ProtocolState interface updated to mark legacy fields optional"

key-files:
  created: []
  modified:
    - src/screens/InteractionCheckerScreen.tsx
    - src/lib/advisorContext.ts

key-decisions:
  - "D-ICS: InteractionCheckerScreen fallback reads addedSupplements as name-only ProtocolItem[] to handle any edge case where migration hasn't run"
  - "D-ADV: advisorContext.ts internal ProtocolState retains legacy optional fields; CustomSupplement interface unchanged (needed for backward-compat fallback)"

# Metrics
duration: 2min
completed: 2026-06-16
---

# Phase 20 Plan 03: Downstream Consumers Schema Migration Summary

**Both downstream consumers of ProtocolState (InteractionCheckerScreen.tsx, advisorContext.ts) migrated from addedSupplements to unified supplements[] schema with backward-compatible fallback; full project-wide tsc audit exits 0**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-16T20:21:21Z
- **Completed:** 2026-06-16
- **Tasks:** 2 of 2
- **Files modified:** 2

## Accomplishments

### Task 1: InteractionCheckerScreen.tsx

- Added `import { ProtocolItem } from '../types/protocol'` at top of file
- Changed parse annotation to `{ supplements?: ProtocolItem[]; addedSupplements?: string[] }` — types both new and legacy schema simultaneously
- Replaced the `for..of` loop over `protocol.addedSupplements` with:
  ```ts
  const suppItems = protocol.supplements ?? (protocol.addedSupplements ?? []).map(name => ({ name } as ProtocolItem));
  for (const item of suppItems) { newItems.push({ name: item.name, type: 'supp' }); }
  ```
- Backward-compat fallback maps legacy string[] to name-only ProtocolItem objects so the loop body works uniformly
- All other logic (medication auto-populate, INTERACTIONS, SAFE_COMBOS, styles) unchanged

### Task 2: advisorContext.ts + full tsc audit

- Added `import { ProtocolItem } from '../types/protocol'` after existing imports
- Updated internal `ProtocolState` interface:
  - Added `supplements?: ProtocolItem[]`
  - Changed `addedSupplements` and `customSupplements` to optional (legacy fields for backward-compat)
  - Added `hiddenMeds?: string[]` for schema completeness
- Replaced three-line supplement assembly block with:
  ```ts
  const suppNames = protocolState?.supplements
    ? protocolState.supplements.map((s) => s.name)
    : [...(protocolState?.addedSupplements ?? []), ...(protocolState?.customSupplements ?? []).map((s) => s.name)];
  const supplements = Array.from(new Set(suppNames));
  ```
- `CustomSupplement` interface retained (unchanged) — needed for the backward-compat fallback path above
- Full project-wide `npx tsc --noEmit` exits 0 with zero errors — Phase 20 schema migration complete

## Task Commits

1. **Task 1: InteractionCheckerScreen migration** - `0e3d648` (feat)
2. **Task 2: advisorContext.ts migration + full tsc audit** - `6a00a2b` (feat)

## Files Created/Modified

- `src/screens/InteractionCheckerScreen.tsx` — ProtocolItem import; supplements[] read with fallback; 5 insertions / 3 deletions
- `src/lib/advisorContext.ts` — ProtocolItem import; updated internal ProtocolState; new supplement assembly block; 15 insertions / 6 deletions

## Decisions Made

- InteractionCheckerScreen fallback maps `addedSupplements: string[]` to `{ name } as ProtocolItem` objects so the downstream loop body reads `.name` uniformly from both schema versions
- `CustomSupplement` interface in advisorContext.ts is unchanged — it is still required for the backward-compat fallback path that reads `customSupplements?.map(s => s.name)` when the migration hasn't yet run
- `hiddenMeds?: string[]` added to internal ProtocolState interface in advisorContext.ts for schema alignment, though it is not yet consumed in that file (it belongs to the new ProtocolState shape)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. Both files read from live AsyncStorage data. No placeholder or hardcoded arrays flow to the UI.

## Threat Flags

None. No new network endpoints, auth paths, or trust boundary changes introduced.
- T-20-06 mitigated: outer try/catch in `assembleAdvisorContext()` unchanged — still returns minimal valid context on any error.
- T-20-SC: No new packages installed.

## Self-Check: PASSED

- [x] `src/screens/InteractionCheckerScreen.tsx` — modified (5 insertions, 3 deletions)
- [x] `src/lib/advisorContext.ts` — modified (15 insertions, 6 deletions)
- [x] Commit `0e3d648` exists in git log (Task 1)
- [x] Commit `6a00a2b` exists in git log (Task 2)
- [x] `grep -c "protocol.supplements" InteractionCheckerScreen.tsx` → 1
- [x] `grep -c "protocolState?.supplements" advisorContext.ts` → 1
- [x] `grep -c "addedSupplements" advisorContext.ts` → 3 (interface optional field, comment, fallback branch)
- [x] `grep -c "addedSupplements" InteractionCheckerScreen.tsx` → 2 (type annotation, fallback expression)
- [x] `npx tsc --noEmit` exits 0 — zero errors project-wide
- [x] Phase 20 schema migration complete and stable for Phase 22/23 consumers
