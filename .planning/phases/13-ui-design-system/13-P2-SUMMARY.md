---
phase: 13-ui-design-system
plan: "02"
subsystem: ui
tags: [react-native-svg, svg-icons, design-system, neural-dot]

# Dependency graph
requires:
  - phase: 13-01
    provides: Design token extensions (Colors.surface, Colors.brand, Colors.semantic) established in src/theme/index.ts
provides:
  - src/components/DesignSystemIcons.tsx with 25 named SVG neural-dot icon exports
  - Named exports cover all emoji replacements across Phase 13 Wave 3 screen migrations
  - Alias exports: DnaIcon = GoalDnaIcon, DnaHelixIcon = GoalDnaIcon, ChartBarIcon = GoalChartIcon
affects:
  - 13-P3 (ProtocolScreen migration — imports PillIcon)
  - 13-P4 (OnboardingScreen, AboutScreen, LabUploadScreen migration)
  - 13-P5 (ProfileScreen, SettingsScreen migration)
  - 13-P6 (DashboardScreen, BiomarkerDetailScreen, SupplementRow migration)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DesignSystemIcons.tsx barrel pattern: all content icons in one file, named exports only, no default export"
    - "Neural-dot icon style: stroke-based, strokeWidth 1.5, small filled Circle (r=1 to r=1.5) as neural dots at focal/key points, matches TabIcons.tsx aesthetic"
    - "Icon props interface: { color: string; size?: number } with size defaulting to 24, 24x24 viewBox"
    - "Alias pattern: export const AliasIcon = CanonicalIcon for backward-compat names"

key-files:
  created:
    - src/components/DesignSystemIcons.tsx
  modified: []

key-decisions:
  - "25 named exports in single barrel file — screen plans can import exactly what they need; no icon sprawl into individual files"
  - "GoalDnaIcon serves three alias exports (DnaIcon, DnaHelixIcon) — avoids duplicated SVG code for the same DNA helix visual"
  - "GoalChartIcon aliases to ChartBarIcon — consistent bar chart visual across contexts (goal selection and settings)"
  - "No default export — consistent with CLAUDE.md named-export convention and prevents ambiguous imports"

patterns-established:
  - "IconProps interface: { color: string; size?: number } — all content icons (non-tab-bar) use this, not TabIconProps"
  - "Neural dots: small filled Circle (r=1 to r=1.5, fill={color}) at focal/key geometric points — carries the neural-dot identity"
  - "strokeWidth 1.5 universal — all strokes, matching TabIcons.tsx"

requirements-completed:
  - DS-02

# Metrics
duration: 2min
completed: 2026-06-09
---

# Phase 13 Plan 02: DesignSystemIcons SVG Barrel Summary

**25-icon SVG neural-dot barrel (DesignSystemIcons.tsx) created as Wave 2 unblocking artifact — all Phase 13 screen migration plans now have concrete import targets for emoji-to-SVG conversion**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-09T08:53:42Z
- **Completed:** 2026-06-09T08:55:47Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `src/components/DesignSystemIcons.tsx` with all 25 named SVG neural-dot icon exports
- All icons match the TabIcons.tsx visual style: stroke-based, Line + Circle + Path primitives, strokeWidth 1.5, small filled Circle neural dots at focal/key points
- All icons use `{ color: string; size?: number }` props (no `focused` prop — these are content icons, not tab bar icons)
- Three alias exports added: `DnaIcon = GoalDnaIcon`, `DnaHelixIcon = GoalDnaIcon`, `ChartBarIcon = GoalChartIcon`
- TypeScript strict check (`tsc --noEmit`) exits 0

## Task Commits

1. **Task 1: Create DesignSystemIcons.tsx with all 25 SVG icons** - `9668797` (feat)

## Files Created/Modified

- `src/components/DesignSystemIcons.tsx` - Single barrel file: 25 named SVG neural-dot icon exports (SearchIcon, SuccessCheckIcon, GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon, CheckmarkIcon, PillIcon, RunnerIcon, DnaIcon, BellIcon, DnaHelixIcon, ClipboardIcon, CameraIcon, TargetIcon, MicroscopeIcon, WarningIcon, PersonIcon, ShieldIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, RefreshIcon, StarIcon)

## Decisions Made

- Used single barrel file approach — all 25 icons in one `DesignSystemIcons.tsx` so screen plans have a single, predictable import target.
- GoalDnaIcon is the canonical DNA helix; `DnaIcon` and `DnaHelixIcon` are both aliases for it — avoids duplicated SVG markup for the same visual.
- GoalChartIcon aliases as `ChartBarIcon` — same bar chart needed in both goal-selection and settings-row contexts.
- No default export — consistent with project naming conventions and prevents ambiguous `import X from '...'` usage.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The worktree's `.planning/phases/` only contained phases 01-04, so the `13-ui-design-system` directory was created in the worktree for the SUMMARY. The `react-native-svg` package was already installed in the project (used by TabIcons.tsx).

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. SVG rendering is a client-side rendering concern — `tsc --noEmit` passing confirms import paths are valid.

## Known Stubs

None - DesignSystemIcons.tsx is a complete implementation of all 25 icons with no placeholder content or unimplemented exports.

## Next Phase Readiness

- `src/components/DesignSystemIcons.tsx` is ready for import by all Wave 3 screen migration plans
- Plans 13-P3 through 13-P6 can now import their required icons directly from `'../components/DesignSystemIcons'`
- Icon coverage by consuming plan:
  - P3 (ProtocolScreen): `PillIcon`
  - P4 (LabUploadScreen, OnboardingScreen, AboutScreen): `SearchIcon, SuccessCheckIcon, ClipboardIcon, CameraIcon, GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon, CheckmarkIcon, PillIcon, TargetIcon, MicroscopeIcon`
  - P5 (ProfileScreen, SettingsScreen): `PersonIcon, ShieldIcon, BellIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, ClipboardIcon, RefreshIcon, StarIcon`
  - P6 (DashboardScreen, BiomarkerDetailScreen, SupplementRow): `RunnerIcon, DnaIcon, BellIcon, DnaHelixIcon, ClipboardIcon, WarningIcon`

---
*Phase: 13-ui-design-system*
*Completed: 2026-06-09*
