---
phase: 06-warm-ui-overhaul
plan: 03
subsystem: ui
tags: [react-native, theme, colors, beige, status-bar, biomarkers, expo-status-bar]

# Dependency graph
requires:
  - phase: 06-01
    provides: Colors.Beige.textMuted corrected to #6B6B64; migration pattern established
provides:
  - BiomarkerDetailScreen fully migrated to Colors.Beige.* tokens with Elevation.sm and dark status bar
  - BiomarkerEntryScreen fully migrated to Colors.Beige.* tokens with Elevation.sm and dark status bar
  - useFocusEffect status bar wiring added to BiomarkerEntryScreen (was missing)
affects:
  - 06-04-PLAN
  - 06-05-PLAN

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useFocusEffect + setStatusBarStyle('dark') pattern applied to BiomarkerDetailScreen and BiomarkerEntryScreen"
    - "Elevation.sm spread replaces manual shadow props on card and emptyTabCard in BiomarkerDetailScreen"
    - "Elevation.sm added to valueCard in BiomarkerEntryScreen (was missing)"
    - "Colors.Beige.divider used for list row separators (rowBorder, pickRowBorder)"

key-files:
  created: []
  modified:
    - src/screens/BiomarkerDetailScreen.tsx
    - src/screens/BiomarkerEntryScreen.tsx

key-decisions:
  - "BiomarkerDetailScreen card: Radius.xl / borderWidth 0.5 / Elevation.sm spread — manual shadow props removed"
  - "emptyTabCard normalized: Radius.xl (was Radius.lg), borderWidth 0.5 (was 1), Elevation.sm added"
  - "rowBorder in BiomarkerDetailScreen uses Colors.Beige.divider (not Colors.Beige.border) — list separators are darker"
  - "BiomarkerEntryScreen cancel/back text: Colors.primaryLight -> Colors.primary per Navigation Header Spec (tint = Colors.primary)"
  - "insightCard shadowColor kept as Colors.status.optimalBg (semantic token) — plan says do NOT change status colors"
  - "pickRowBorder in BiomarkerEntryScreen uses Colors.Beige.divider for semantic correctness with list separator spec"

patterns-established:
  - "Warm screen status bar: useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); return () => {}; }, []))"
  - "Modal screens (BiomarkerEntry) need useFocusEffect just like tab screens — they present over dark Dashboard"

requirements-completed: [THEME-02, THEME-04, THEME-05]

# Metrics
duration: 8min
completed: 2026-05-31
---

# Phase 6 Plan 03: BiomarkerDetailScreen and BiomarkerEntryScreen Warm Token Migration Summary

**BiomarkerDetailScreen (43 Beige tokens) and BiomarkerEntryScreen (25 Beige tokens) fully migrated to Colors.Beige.* with Elevation.sm card shadows, dark status bar on focus, and zero hardcoded hex values**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-31T00:00:00Z
- **Completed:** 2026-05-31T00:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Migrated BiomarkerDetailScreen: 43 Beige token references, card spec normalized (Radius.xl / borderWidth 0.5 / Elevation.sm spread), emptyTabCard upgraded from Radius.lg/borderWidth 1/no-elevation to Radius.xl/borderWidth 0.5/Elevation.sm, dark status bar via new useFocusEffect call, zero hardcoded hex
- Migrated BiomarkerEntryScreen: 25 Beige token references, useFocusEffect + setStatusBarStyle('dark') added (was missing from this modal), valueCard upgraded with Radius.xl + Elevation.sm, cancel/back text updated to Colors.primary per Navigation Header Spec, zero hardcoded hex
- TypeScript check passes with zero errors across both files

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate BiomarkerDetailScreen to warm Beige tokens** - `887417b` (feat)
2. **Task 2: Migrate BiomarkerEntryScreen to warm Beige tokens + add status bar** - `89f93aa` (feat)

## Files Created/Modified

- `src/screens/BiomarkerDetailScreen.tsx` - Full Beige token migration, Elevation.sm on card and emptyTabCard, useFocusEffect status bar, listHeader/detailHeader get explicit Beige.bg background
- `src/screens/BiomarkerEntryScreen.tsx` - Full Beige token migration, new useFocusEffect status bar hook, Elevation.sm on valueCard, cancel text migrated to Colors.primary

## Decisions Made

- `rowBorder` and `pickRowBorder` separators use `Colors.Beige.divider` (not `Colors.Beige.border`) — list row separators are intentionally slightly darker than card borders per the Row Specification in UI-SPEC
- `emptyTabCard` normalized from `Radius.lg / borderWidth: 1 / no elevation` to full card spec (`Radius.xl / borderWidth: 0.5 / Elevation.sm`) to match the Card Specification in UI-SPEC
- `cancel` style in BiomarkerEntryScreen changed from `Colors.primaryLight` to `Colors.primary` per Navigation Header Spec: "Tint color (buttons, links): Colors.primary"
- `insightCard` shadow left as-is (uses `Colors.status.optimalBg` as shadowColor) — plan explicitly says do NOT change `Colors.status.*` tokens; shadow color has no visual impact at 0.04 opacity
- `listHeader` and `detailHeader` in BiomarkerDetailScreen given explicit `backgroundColor: Colors.Beige.bg` to prevent transparent header bleed when scrolling

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — both files migrated cleanly. TypeScript passed on first run.

## Known Stubs

None — this plan performs pure token migration with no data wiring or UI logic changes. No stub patterns introduced.

## Threat Flags

None — pure cosmetic token migration. No new network endpoints, auth paths, file access patterns, or schema changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Wave 2 biomarker screen migration complete
- Both BiomarkerDetailScreen and BiomarkerEntryScreen use Colors.Beige.* tokens throughout
- Pattern consistent with Plans 01 and 02 — remaining screens (ProtocolScreen, ExerciseScreen, ProfileScreen) can follow the same migration process

## Self-Check: PASSED

- `src/screens/BiomarkerDetailScreen.tsx` confirmed: 43 Beige tokens, no legacy tokens (Colors.bgCard/bgSecondary/textPrimary), no hardcoded hex, setStatusBarStyle('dark') present, Elevation.sm on card and emptyTabCard
- `src/screens/BiomarkerEntryScreen.tsx` confirmed: 25 Beige tokens, no legacy tokens, no hardcoded hex, setStatusBarStyle('dark') present, useFocusEffect present, Elevation.sm on valueCard
- Commits 887417b and 89f93aa exist in git log
- `tsc --noEmit` exits 0

---
*Phase: 06-warm-ui-overhaul*
*Completed: 2026-05-31*
