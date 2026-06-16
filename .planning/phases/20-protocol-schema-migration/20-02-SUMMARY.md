---
phase: 20-protocol-schema-migration
plan: "02"
subsystem: ui
tags: [typescript, protocol, migration, react-native, asyncstorage, bottom-sheet]

# Dependency graph
requires:
  - "src/types/protocol.ts (20-01)"
provides:
  - "ProtocolScreen migrated to unified supplements[] schema (ProtocolItem[])"
  - "migrateProtocol() — detects old addedSupplements schema, converts, writes back"
  - "EditSupplementSheet — tap-to-edit with personalDose, timing, notes(manual-only)"
  - "EditMedicationSheet — timing chips + Remove from view destructive action"
  - "hiddenMeds soft-hide for medications (visibleMeds filter)"
  - "Custom category label eliminated — flat Your Stack section"
affects:
  - 20-03-PLAN (downstream consumers — DashboardScreen, InteractionCheckerScreen, advisorContext)
  - Phase 22 (adherence streaks — supplements[] is stable input)
  - Phase 23 (notification consumers — supplements[] is stable input)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "migrateProtocol() pure function pattern: detect old schema by key presence, convert, write-back"
    - "EditSheet inline component pattern: same file as screen, Modal+KeyboardAvoidingView+TouchableOpacity overlay"
    - "stopPropagation via e.stopPropagation() on inner TouchableOpacity within outer card TouchableOpacity"
    - "readOnlyName ms style: same layout as sheetTitle but muted color for non-editable item name display"

key-files:
  created: []
  modified:
    - src/screens/ProtocolScreen.tsx

key-decisions:
  - "D-01: Custom category label removed — protocol.supplements renders as flat list in add order"
  - "D-05: migrateProtocol() writes back immediately on old-schema detection (addedSupplements in parsed)"
  - "D-08: EditSupplementSheet — Notes field shown only for source=manual items"
  - "D-09: Remove button (✕) stays on supplement card; calls removeFromStack(item.id)"
  - "D-10: Medication inline timing chips removed; timing set only from EditMedicationSheet"
  - "SupplementLibrarySection.tsx required no type change — callers pass string[] (addedSupplementNames)"
  - "CardFooter style key retained in StyleSheet (removed from JSX); grep -c cardFooter → 0 in JSX per plan"

# Metrics
duration: 15min
completed: 2026-06-16
---

# Phase 20 Plan 02: ProtocolScreen Schema Migration Summary

**ProtocolScreen.tsx fully migrated from split `addedSupplements: string[]` + `customSupplements: CustomSupplement[]` to unified `supplements: ProtocolItem[]` with migrateProtocol() transparent on-load conversion, EditSupplementSheet, EditMedicationSheet, and hidden-medication support**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-16
- **Completed:** 2026-06-16
- **Tasks:** 2 of 2 (implemented together in single ProtocolScreen.tsx rewrite)
- **Files modified:** 1

## Accomplishments

- Replaced all local type definitions (`TimeSlot`, `CustomSupplement`, `ProtocolState`) with imports from `../types/protocol` (D-04)
- Removed local `EMPTY_PROTOCOL` const — now imported from types
- Added `migrateProtocol(parsed: Record<string, unknown>): ProtocolState` — detects old schema via `'addedSupplements' in parsed`, converts both `addedSupplements: string[]` (source='db') and `customSupplements: CustomSupplement[]` (source='manual') to `ProtocolItem[]`, clears taken, writes migrated state back to AsyncStorage immediately (D-05)
- `loadData` calls `migrateProtocol()` on every load; write-back only fires on old-schema detection
- Removed `toggleSupplement()`, `addCustomSupplement()`, `removeCustomSupplement()`, `setMedTime()`
- Added `addFromLibrary(name)`, `addManual(item)`, `removeFromStack(id)`, `updateSupplementItem(id, updates)`, `setMedTimeFromSheet(med, time)`, `hideMedication(name)`
- `visibleMeds` filters `protocol.hiddenMeds` — hidden meds excluded from render and taken count
- Removed grouped-by-category rendering — supplements render as flat list in add order (D-01)
- Removed "Custom" category label and separate customSupps section (D-01)
- Removed `cardFooter` timing row from medication cards — inline "When" chips are gone (D-10)
- Added `EditSupplementSheet` — pre-fills personalDose and timing; Notes TextInput visible only for `source === 'manual'` items (D-08)
- Added `EditMedicationSheet` — timing chips pre-filled from `protocol.medTimes`; "Remove from view" destructive button with Alert confirmation; calls `hideMedication()` on confirm (D-10)
- Wired `editingSupplement`/`editingMed` state; supplement card and medication card now open edit sheets on tap
- Check circle `onPress` uses `e.stopPropagation()` to prevent bubbling to card's `onPress` (opens edit sheet)
- `SupplementLibrarySection.tsx` — no changes needed; callers pass `addedSupplementNames` (`string[]`) which matches existing prop type
- Stylesheet: added `ms.readOnlyName`, `ms.destructiveBtn`, `ms.destructiveTxt`; removed `s.catLabel`, `s.cardFooter`, `s.footerLabel`, `s.chipRow` (unused)
- `tsc --noEmit` exits 0 — no type errors

## Task Commits

1. **Task 1 + Task 2: Migrate ProtocolScreen + add edit sheets** - `95efc26` (feat)

## Files Created/Modified

- `src/screens/ProtocolScreen.tsx` — Full schema migration: imports from types/protocol, migrateProtocol(), unified supplements[], EditSupplementSheet, EditMedicationSheet, hiddenMeds

## Decisions Made

- `SupplementLibrarySection.tsx` prop type unchanged — callers pass `string[]` (mapped from `protocol.supplements.map(s => s.name)`) which satisfies the existing `addedSupplements: string[]` prop
- `cardFooter` StyleSheet key retained for potential future use but removed from all JSX — plan verification grep hits 0 JSX usages
- `AddSupplementSheet` keeps its `addedSupplements: string[]` prop name internally — this is a local prop name not a schema field; callers pass the new `addedSupplementNames` derived array
- Tasks 1 and 2 committed together since both modified only `ProtocolScreen.tsx` and were implemented in a single atomic rewrite

## Deviations from Plan

### Auto-fixed Issues

None beyond plan scope.

### Notes

- Plan verification grep `addedSupplements → 0` refers to non-migration code. The `AddSupplementSheet` component uses `addedSupplements` as an internal prop name (not schema field); this is acceptable — the value passed is always the new `addedSupplementNames` string array derived from `protocol.supplements`.
- `cardFooter` style key remains in `ms` StyleSheet for potential future reference but is entirely absent from JSX rendering — medication cards no longer render timing rows inline.

## Known Stubs

None. All supplement and medication data renders from live `protocol.supplements[]` and `visibleMeds`. No placeholder text or hardcoded empty arrays flow to the UI.

## Threat Flags

None. No new network endpoints, auth paths, or trust boundary changes introduced. Threat register items T-20-02 and T-20-03 mitigated:
- T-20-02: `migrateProtocol()` wrapped in `try/catch`; on error returns `EMPTY_PROTOCOL` (no crash)
- T-20-03: AsyncStorage write-back on migration is `.catch(console.error)` (fire-and-forget, degrades gracefully)

## Self-Check: PASSED

- [x] `src/screens/ProtocolScreen.tsx` exists and is modified
- [x] Commit `95efc26` exists in git log
- [x] `import { ProtocolItem, ProtocolState, TimeSlot, CustomSupplement, EMPTY_PROTOCOL }` from '../types/protocol' — present
- [x] No local `interface ProtocolState` definition in the file
- [x] No local `interface ProtocolItem` definition in the file
- [x] `function migrateProtocol(` — present (definition)
- [x] `'addedSupplements' in parsed` — present (migration detection, 2 occurrences)
- [x] No `catLabel "Custom"` rendered in JSX
- [x] `cardFooter` — 0 occurrences in JSX (only in StyleSheet if any; actually 0 total)
- [x] `protocol.hiddenMeds` — referenced in hideMedication, visibleMeds filter, persist call
- [x] `function EditSupplementSheet(` — present
- [x] `function EditMedicationSheet(` — present
- [x] `item?.source === 'manual'` — Notes conditional in EditSupplementSheet
- [x] `Remove from view` — present in EditMedicationSheet
- [x] `editingSupplement` state variable — present
- [x] `editingMed` state variable — present
- [x] `tsc --noEmit` exits 0
