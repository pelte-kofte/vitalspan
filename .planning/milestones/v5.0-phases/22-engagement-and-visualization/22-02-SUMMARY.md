---
phase: 22-engagement-and-visualization
plan: 02
subsystem: ui
tags: [react-native-chart-kit, react-native-svg, LineChart, premium-gate, biomarkers, trend-visualization]

# Dependency graph
requires:
  - phase: 22-engagement-and-visualization
    provides: PremiumContext with usePremiumContext/isPremium, existing BiomarkerDetailScreen with historyFor and StoredEntry
provides:
  - Biomarker trend sparkline chart (30/90/365-day segmented toggle)
  - SVG optimal-range band overlaid behind LineChart
  - Placeholder text for fewer than 2 data points
  - Free-tier 30-day history cap (chart + list)
  - Upgrade banner with hidden count routing to Paywall
affects: [phase-23, paywall, biomarker-detail]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Premium-first filter: apply isPremium cap before time-window filter, never reversed"
    - "SVG absoluteFill overlay: Svg with StyleSheet.absoluteFill sits beneath LineChart in a relative-positioned View"
    - "Chart-kit surface match: all three background keys set to Colors.surface to avoid obscuring SVG layer"
    - "IIFE chart block: inline IIFE inside JSX for complex conditional chart vs. placeholder rendering"

key-files:
  created: []
  modified:
    - src/screens/BiomarkerDetailScreen.tsx

key-decisions:
  - "Default time window is 90D — covers typical quarterly lab cycle (D-05 discretion call)"
  - "Premium cap applied before time-window filter — filter order enforced by RESEARCH anti-pattern note"
  - "rgba helper functions used for chart-kit color callbacks instead of hex tokens — chart-kit requires rgba functions, not hex"
  - "fillOpacity 0.15 for range band — subtle enough not to obscure line, visible against Colors.surface"

patterns-established:
  - "Premium gate derivation: premiumFilteredHistory = isPremium ? history : history.filter(e => e.date >= cutoff30ISO)"
  - "Chart coordinate math: plotH = CHART_HEIGHT - CHART_TOP_PAD - CHART_BOTTOM_PAD; yTop/yBot computed from clamped opt range relative to data range"

requirements-completed: [TRND-01, TRND-02, TRND-03, DLIM-01, DLIM-02]

# Metrics
duration: 35min
completed: 2026-06-18
---

# Phase 22 Plan 02: Biomarker Trend Chart Summary

**Sparkline LineChart with 30/90/365-day toggle, SVG optimal-range band, 30-day free-tier cap, and upgrade banner added to BiomarkerDetailScreen**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-18T00:00:00Z
- **Completed:** 2026-06-18T00:35:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added premium-gated 30-day history cap to both chart and history list — non-premium users see only the last 30 days, premium users see full history
- Rendered react-native-chart-kit LineChart with 30/90/365-day segmented pill toggle and <2-point placeholder guard
- Overlaid SVG Rect optimal-range band (translucent green at 15% opacity) behind the chart using coordinate math clamped to visible data range
- Added conditional upgrade banner displaying hidden entry count and navigating to Paywall for non-premium users with capped history

## Task Commits

Each task was committed atomically:

1. **Task 1: Premium gate + time-window state + filtered/charted history derivation** - `6a8bddf` (feat)
2. **Task 2: Segmented pill + LineChart with SVG range band + placeholder + upgrade banner** - `83594f0` (feat)

**Plan metadata:** _(this commit)_ (docs: execution summary)

## Files Created/Modified
- `src/screens/BiomarkerDetailScreen.tsx` - Added usePremiumContext hook, TimeWindow state, premiumFilteredHistory derivation, chartHistory/chartValues/chartLabels, segmented pill, LineChart with SVG range band, placeholder, upgrade banner, and new StyleSheet entries

## Decisions Made
- Default time window set to 90D (covers a typical quarterly lab cycle — D-05 discretion)
- Premium filter applied before time-window filter to prevent window from leaking hidden data
- rgba helper functions (PRIMARY_RGBA, SURFACE_MUTED_RGBA) defined as module-level constants because chart-kit color callbacks require rgba functions, not hex theme tokens
- Range band fillOpacity at 0.15 for visual subtlety without obscuring the line

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TRND-01/02/03 and DLIM-01/02 requirements are closed
- BiomarkerDetailScreen now has a fully working chart + premium gate; ready for Phase 22 plan 03 (adherence chart) or paywall integration work
- No blockers

## Known Stubs
None — chart renders real AsyncStorage biomarker history, premium gate reads from PremiumContext (Adapty-backed), upgrade banner navigates to real Paywall route.

## Threat Flags
None — no new network endpoints, auth paths, or schema changes introduced. Data stays on-device. PremiumContext is the sole source of truth for isPremium (T-22-03 mitigated as planned).

## Self-Check: PASSED
- `src/screens/BiomarkerDetailScreen.tsx` modified (verified via commits `6a8bddf` and `83594f0`)
- Commit `6a8bddf` confirmed: `feat(22-02): add premium gate, time-window state, and filtered history derivation`
- Commit `83594f0` confirmed: `feat(22-02): segmented pill + LineChart + SVG range band + upgrade banner`

---
*Phase: 22-engagement-and-visualization*
*Completed: 2026-06-18*
