---
phase: "06-warm-ui-overhaul"
plan: "05"
subsystem: "ProfileScreen + Phase 6 audit"
status: "awaiting-checkpoint"
tags: ["warm-ui", "beige-tokens", "empty-state", "status-bar", "profile", "phase-audit"]
dependency_graph:
  requires: ["06-03", "06-04"]
  provides: ["warm-profile-screen", "profile-empty-state", "phase-6-audit-passed"]
  affects: ["src/screens/ProfileScreen.tsx"]
tech_stack:
  added: []
  patterns:
    - "useFocusEffect + setStatusBarStyle('dark') — final warm screen (ProfileScreen)"
    - "Elevation.sm spread replacing manual shadow props (card, settingsCard, aboutCard)"
    - "Motivating empty state anatomy: icon + headline + body + CTA card"
key_files:
  created: []
  modified:
    - "src/screens/ProfileScreen.tsx"
key_decisions:
  - "Empty state uses nav.navigate('Onboarding') — existing RootStackParamList route, no new param injection"
  - "Two useFocusEffect calls in ProfileScreen: one for data loading (existing), one for status bar (new) — independent hooks, no interference"
  - "card rowBorder uses Colors.Beige.divider (not Colors.Beige.border) — list separators darker per Row Spec"
  - "ageBtn/sexBtn migrated to Colors.Beige.bgShade (form field background) not Colors.Beige.bg — matches supplementary token table (inactive chip bg = bgShade)"
  - "Task 2 verification committed as empty commit — no code changes, audit confirms all 7 screens clean"
requirements:
  - THEME-02
  - THEME-03
  - THEME-04
  - THEME-05
  - THEME-06
metrics:
  duration: "~8 minutes"
  completed: "2026-05-31T15:52:56Z"
  tasks_completed: 2
  tasks_total: 3
  files_modified: 1
---

# Phase 06 Plan 05: ProfileScreen Migration + Phase 6 Audit Summary

ProfileScreen fully migrated to Beige tokens (43 references) with motivating empty state showing "Your health story starts here.", dark status bar on focus, and Elevation.sm cards. Full phase audit confirms all 7 warm screens pass: zero legacy tokens, zero hardcoded hex, dark screens untouched, tsc exits 0. Awaiting human visual checkpoint.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Migrate ProfileScreen stylesheet and replace empty state | d637da1 | src/screens/ProfileScreen.tsx |
| 2 | Full phase verification — tsc + grep audit across all 7 screens | 960e649 | (verification only — no file changes) |

## Task 3: Awaiting Human Checkpoint

Task 3 is a `checkpoint:human-verify` gate — human visual confirmation of all 7 warm screens on iOS simulator/device is required before this plan can be marked complete.

## What Was Built

**Task 1 — ProfileScreen Migration:**
- All legacy `Colors.bg`, `Colors.bgCard`, `Colors.bgSecondary`, `Colors.textPrimary`, `Colors.textSecondary`, `Colors.textMuted`, `Colors.border` references replaced with `Colors.Beige.*` equivalents — 43 total Beige token references
- `Elevation` imported from theme; `card`, `settingsCard`, `aboutCard` now use `...Elevation.sm` with `borderWidth: 0.5` / `borderColor: Colors.Beige.border`
- Two-line empty state ("No profile found." / "Complete onboarding...") replaced with full motivating anatomy:
  - `👤` icon at `fontSize: 40`
  - Headline: "Your health story starts here." (`fontSize: 18`, `fontWeight: '600'`, `lineHeight: 24`)
  - Body: "Complete your profile so Vitalspan can personalise your biomarker targets and flag relevant drug interactions." (`fontSize: 14`, `lineHeight: 22`)
  - CTA: "Complete Onboarding" button (`Colors.primary` fill, `Radius.xl`, `minHeight: 44`) navigating to `'Onboarding'`
- Empty state shows topBar with "Profile" title (consistent with read view)
- `setStatusBarStyle('dark')` added via second `useFocusEffect` call
- `topBar` and `editHeader` given explicit `backgroundColor: Colors.Beige.bg`
- Old `s.empty`, `s.emptyTxt`, `s.emptySub` styles removed; `emptyStateCard`, `emptyStateIcon`, `emptyStateHeadline`, `emptyStateBody`, `emptyStateCta`, `emptyStateCtaTxt` styles added
- `ageBtn` and `sexBtn` migrated to `Colors.Beige.bgShade`/`Colors.Beige.border` (form field pattern)
- `condBtn` and `editNote` migrated to `Colors.Beige.card`/`Colors.Beige.border`
- Zero hardcoded hex values in file

**Task 2 — Phase 6 Full Audit:**

| Screen | Beige Refs | Legacy Tokens | Hardcoded Hex |
|--------|-----------|---------------|---------------|
| SettingsScreen.tsx | 21 | 0 | 0 |
| AboutScreen.tsx | 32 | 0 | 0 |
| ProtocolScreen.tsx | 52 | 0 | 0 |
| ExerciseScreen.tsx | 43 | 0 | 0 |
| ProfileScreen.tsx | 43 | 0 | 0 |
| BiomarkerDetailScreen.tsx | 43 | 0 | 0 |
| BiomarkerEntryScreen.tsx | 25 | 0 | 0 |

Dark screen integrity:
- `DashboardScreen.tsx`: 0 Beige refs — dark neural untouched
- `LongevityScoreScreen.tsx`: 0 Beige refs — dark neural untouched

TypeScript: `tsc --noEmit` exits 0 — zero errors across entire project.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. ProfileScreen reads from AsyncStorage (`@vitalspan_user_profile`) — the empty state correctly triggers on `!profile` reflecting real persisted data. No hardcoded empty values.

## Threat Flags

None. Pure cosmetic token migration plus empty state wiring. The empty state CTA uses `nav.navigate('Onboarding')` — an existing pre-registered route in `RootStackParamList`. No new network endpoints, auth paths, file access patterns, or schema changes.

## Checkpoint Details (Task 3)

**What to verify on iOS simulator or device:**

1. Dashboard tab — dark neural aesthetic, no beige elements
2. Biomarkers tab — warm cream/beige background, white card surfaces
3. Protocol tab — warm beige background; if empty, shows 💊 "Build your longevity stack." empty state
4. Exercise tab — warm beige background; if empty, shows 🏃 "Move daily. Live longer." empty state
5. Profile tab — if no profile: 👤 "Your health story starts here." with "Complete Onboarding" CTA; if profile exists: warm beige background, white cards
6. Settings modal (from Profile gear) — warm beige background, white cards
7. About modal (from Settings) — warm beige background, white section cards
8. Return to Dashboard — dark neural aesthetic restored, status bar light
9. LongevityScore modal (tap score card on Dashboard) — dark immersive modal (not beige)

**Resume signal:** Type "approved" if all screens look correct, or describe issues found.

## Self-Check: PASSED

- [x] src/screens/ProfileScreen.tsx exists with 43 Beige token references
- [x] Commit d637da1 exists in git log
- [x] Commit 960e649 exists in git log
- [x] All acceptance criteria verified (Beige tokens, no legacy tokens, no hex, motivating empty state, status bar, navigate('Onboarding'))
- [x] Phase 6 audit: all 7 warm screens pass, both dark screens untouched
- [x] tsc --noEmit exits 0

---
*Phase: 06-warm-ui-overhaul*
*Plan status: awaiting-checkpoint (Task 3 human-verify gate)*
*Completed tasks: 2/3*
