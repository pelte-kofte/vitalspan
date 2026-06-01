---
phase: 09-phenoage-fix-and-release-quality
plan: P3
subsystem: ui
tags: [null-state, pheno-age, missing-biomarkers, longevity-score, dashboard, future-self, profile]

dependency_graph:
  requires:
    - phase: 09-P1
      provides: corrected-pheno-age-formula returning null when any biomarker missing, missingBiomarkers list in PhenoAgeResult
    - phase: 09-P2
      provides: console.log stripped, tsc clean
  provides:
    - D-06: all 4 UI screens show missingBiomarkers list when biologicalAge is null
    - null-safe biological age rendering across LongevityScore, Dashboard, FutureSelf, ProfileScreen
  affects:
    - EAS preview build (Task 2 pending human verification)
    - QUAL-02 requirement (full key flow crash-free)

tech-stack:
  added: []
  patterns:
    - "null-state UI: show named missing biomarker list (not count) when biologicalAge is null"
    - "dynamic list length via PHENO_BIOMARKER_LIST.length — avoids hardcoded 5 or 9 constants"

key-files:
  created: []
  modified:
    - src/screens/DashboardScreen.tsx
    - src/screens/LongevityScoreScreen.tsx
    - src/components/FutureSelf.tsx
    - src/screens/ProfileScreen.tsx

key-decisions:
  - "Remove dead 'medium' confidence branch from DashboardScreen (confidence tier removed in P1)"
  - "LongevityScoreScreen sphere shows 'Missing: [name1], [name2] +N' pattern — named list, not count"
  - "FutureSelf footer note uses PHENO_BIOMARKER_LIST.length dynamically — no hardcoded 9"
  - "ProfileScreen null-biologicalAge hint uses static string '9' (no extra import) per plan guidance"
  - "projectedLifespan references first missing biomarker name (missingBiomarkers[0]) for specificity"

patterns-established:
  - "null-state UI pattern: always show what is missing by name, never just a count"
  - "dynamic checklist length: use PHENO_BIOMARKER_LIST.length, not hardcoded integer"

requirements-completed:
  - QUAL-02

duration: ~10min
completed: 2026-06-01
---

# Phase 09 Plan P3: Null Biological Age UI — Summary

**Four UI screens updated to show named missing-biomarker lists when biologicalAge is null — users see exactly which biomarkers to enter next, completing D-06 from the Phase 9 context.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-01
- **Completed:** 2026-06-01
- **Tasks:** 1 of 2 complete (Task 2 awaiting human verification)
- **Files modified:** 4

## Accomplishments

- DashboardScreen: removed dead 'medium' confidence branch (this confidence tier was eliminated in P1; leaving it was dead code)
- LongevityScoreScreen: sphere null state now shows "Missing: Albumin, Creatinine +7" format instead of raw count; projectedLifespan references first missing biomarker name
- FutureSelf: locked checklist shows all 9 items (removed `.slice(0, 5)` limit); footer note updated dynamically via `PHENO_BIOMARKER_LIST.length`
- ProfileScreen: null/undefined `biologicalAge` now shows "Log 9 PhenoAge biomarkers to compute" as a tappable CTA navigating to BiomarkerEntry

## Task Commits

1. **Task 1: Update 4 UI consumers for null biologicalAge (per D-06)** - `57e2757` (feat)
2. **Task 2: Full key flow verification + UAT checklist + EAS preview build** - *awaiting human verification*

## Files Created/Modified

- `src/screens/DashboardScreen.tsx` — Removed `phenoResult?.confidence === 'medium'` dead code block
- `src/screens/LongevityScoreScreen.tsx` — Sphere null branch shows named missing biomarkers list; projectedLifespan references `missingBiomarkers[0]`
- `src/components/FutureSelf.tsx` — Locked state checklist shows all 9 PHENO_BIOMARKER_LIST items; footer uses `PHENO_BIOMARKER_LIST.length` dynamically
- `src/screens/ProfileScreen.tsx` — Null biologicalAge shows CTA hint with BiomarkerEntry navigation

## Decisions Made

- Dead 'medium' confidence branch in DashboardScreen was removed cleanly rather than left as a no-op (after P1 fix, only 'high' and 'insufficient' are returned — 'medium' branch can never fire)
- ProfileScreen uses static string "9" for the hint text rather than importing PHENO_BIOMARKER_LIST — avoids an unnecessary import in ProfileScreen per plan guidance
- FutureSelf footer uses `PHENO_BIOMARKER_LIST.length` constant expression for future-proofing — if list ever changes, the UI updates automatically

## Deviations from Plan

None — plan executed exactly as written. All 4 targeted edits matched plan action descriptions precisely.

## Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | 0 lines — PASS |
| `grep "confidence === 'medium'" DashboardScreen.tsx` | 0 matches — PASS |
| `grep "slice(0, 5)" FutureSelf.tsx` | 0 matches — PASS |
| `grep "missingBiomarkers" LongevityScoreScreen.tsx` | 2 matches — PASS |
| `grep "Log 9 PhenoAge" ProfileScreen.tsx` | 1 match — PASS |
| No hardcoded hex values introduced | 0 matches — PASS |

## Known Stubs

None — all 4 screens now correctly render null biologicalAge state with specific missing biomarker information.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. All changes are purely UI null-state rendering. Threat T-09P3-01 (null biologicalAge DoS) fully mitigated — all 4 consumers handle null explicitly with no unguarded `.toFixed()` or arithmetic.

## Checkpoint: Awaiting Human Verification (Task 2)

Task 2 requires the developer to:
1. Run the full key flow on iOS simulator (onboarding → biomarker entry → protocol → exercise → LongevityScore)
2. Confirm UAT checklist (10 items — see plan Task 2 for full list)
3. Run `eas build --platform ios --profile preview` and confirm build success (D-13)

Phase 9 is not marked complete until the EAS preview build succeeds.

## Next Phase Readiness

- P3 Task 1 complete: all 4 screens handle null biologicalAge correctly
- P1 (formula fix) + P2 (console.log cleanup + tsc audit) + P3 Task 1 (null UI) all shipped
- Remaining: developer runs simulator flow verification and EAS build to close Phase 9

---
*Phase: 09-phenoage-fix-and-release-quality*
*Completed: 2026-06-01 (Task 1 only; Task 2 pending human verification)*
