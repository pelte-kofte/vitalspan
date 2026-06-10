---
phase: 15-exercise-photos
plan: 02
subsystem: ui
tags: [exercise-photos, cdn, expo-image, ExerciseDetailScreen, photo-banner]

# Dependency graph
requires:
  - 15-01 (Exercise interface with photoKey?: string and 44 mapped exercises)
provides:
  - ExerciseDetailScreen with three-tier illustration conditional: CDN photo banner (220px) → SVG (160px) → neutral placeholder
  - expo-image installed at ~3.0.11 (SDK 54 compatible)
  - s.illustrationCardPhoto style (height 220, overflow hidden, borderRadius Radius.xl)
  - Silent photo-error fallback via photoError state
affects:
  - All 44 exercises with photoKey — now show 220px CDN photo banner in ExerciseDetailScreen
  - 16 SKIP exercises — unchanged, continue to show SVG illustration

# Tech tracking
tech-stack:
  added:
    - expo-image ~3.0.11 (official Expo SDK 54 package; disk caching, contentFit, transition, onError)
  patterns:
    - "Three-tier illustration conditional: photoUrl truthy → illustrationCardPhoto banner; photoUrl null → illustrationCard SVG/placeholder"
    - "photoError state reset via useEffect([exerciseId]) prevents stale error across exercise navigation"
    - "StyleSheet.absoluteFill fills Image inside fixed-height View container"

key-files:
  created: []
  modified:
    - src/screens/ExerciseDetailScreen.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "expo-image ~3.0.11 installed via `npx expo install` (not npm install) to get SDK 54 pinned version"
  - "photoUrl derived outside JSX (after IllustrationComponent lookup) — clean separation of data and render"
  - "useEffect([exerciseId]) resets photoError — chosen over resetting inside useFocusEffect to handle stack-cached screen exercise param changes (Pitfall 4 from RESEARCH.md)"
  - "CDN URL uses /exercises/{photoKey}/0.jpg with no /images/ subdirectory — RESEARCH.md critical correction applied"
  - "overflow: 'hidden' on container View (not Image) required for borderRadius to clip photo on iOS"

requirements-completed: [EXP-01, EXP-02]

# Metrics
duration: 2min
completed: 2026-06-11
---

# Phase 15 Plan 02: Exercise Photos Screen Integration Summary

**expo-image installed at ~3.0.11; ExerciseDetailScreen updated with three-tier illustration logic rendering a 220px CDN photo banner for 44 mapped exercises and preserving the existing 160px SVG fallback for unmapped exercises**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-10T20:58:21Z
- **Completed:** 2026-06-11T21:00:00Z
- **Tasks:** 2
- **Files modified:** 3 (ExerciseDetailScreen.tsx, package.json, package-lock.json)

## Accomplishments

- Installed expo-image ~3.0.11 via `npx expo install expo-image` (Expo SDK 54 compatible)
- Added `useEffect` and `Image` imports to ExerciseDetailScreen
- Added `photoError` state with `useEffect([exerciseId])` reset for navigation safety
- Constructed `photoUrl` from `exercise.photoKey` using the correct jsDelivr CDN URL (no `/images/` subdirectory)
- Replaced single `illustrationCard` block with three-tier conditional: photo banner → SVG → neutral placeholder
- Added `s.illustrationCardPhoto` style with `height: 220`, `overflow: 'hidden'`, matching border/shadow tokens as illustrationCard
- `onError` callback silently falls back to SVG by setting `photoError = true`
- TypeScript strict mode (`tsc --noEmit`) passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install expo-image** — `45b6739` (chore)
2. **Task 2: Rewrite ExerciseDetailScreen illustration section** — `71e3ebd` (feat)

## Files Created/Modified

- `src/screens/ExerciseDetailScreen.tsx` — Added Image import from expo-image, useEffect import, photoError state, useEffect reset, photoUrl derivation, three-tier illustration JSX conditional, s.illustrationCardPhoto style
- `package.json` — Added `"expo-image": "~3.0.11"`
- `package-lock.json` — Updated lockfile for expo-image

## Decisions Made

- expo-image ~3.0.11 is the SDK 54 compatible version; `npx expo install` used to prevent accidental SDK 56 version install
- The CDN URL does NOT include an `/images/` subdirectory: `exercises/{photoKey}/0.jpg` is correct (verified in RESEARCH.md critical correction section)
- `useEffect([exerciseId])` resets photoError rather than resetting inside `useFocusEffect` — handles React Navigation stack caching where the component stays mounted but exerciseId param changes
- `overflow: 'hidden'` is on the container `View` (s.illustrationCardPhoto), not on the `<Image>` tag — this is the iOS borderRadius clip requirement

## Deviations from Plan

None — plan executed exactly as written.

All 6 changes from the plan action section applied correctly:
- CHANGE 1 (imports): useEffect added to React import; Image from expo-image added
- CHANGE 2 (state): photoError useState added
- CHANGE 3 (useEffect reset): useEffect([exerciseId]) added after useFocusEffect block
- CHANGE 4 (photoUrl derivation): correct CDN URL with no /images/ subdir
- CHANGE 5 (illustration block): three-tier conditional replaces single illustrationCard View
- CHANGE 6 (stylesheet): illustrationCardPhoto added with height 220, overflow hidden

## Verification Results

- `illustrationCardPhoto` appears 2 times in ExerciseDetailScreen.tsx (JSX usage + style definition): PASS
- `overflow: 'hidden'` present in illustrationCardPhoto style: PASS
- `/images/0.jpg` pattern count: 0 (wrong CDN path absent): PASS
- `photoError` / `setPhotoError` occurrences: 4 (useState, useEffect, photoUrl derivation, onError): PASS
- `npx tsc --noEmit` exits with zero errors: PASS
- expo-image ~3.0.11 in package.json: PASS

## Known Stubs

None — all 44 mapped photoKey values load real CDN photos. Unmapped exercises show the existing SVG illustration, which is the intended design (EXP-02). No placeholder text or TODO patterns introduced.

## Threat Flags

None — CDN URL is constructed from static hardcoded strings in exercises.ts (no user input). expo-image uses iOS ATS enforcing HTTPS. This plan introduces no new trust boundaries beyond those documented in the PLAN.md threat model (T-15-02, T-15-03, T-15-04, T-15-SC — all accepted or mitigated per plan).

---

## Self-Check

- [x] `src/screens/ExerciseDetailScreen.tsx` modified with all 6 changes
- [x] `package.json` contains `"expo-image": "~3.0.11"`
- [x] Commit 45b6739 exists (Task 1 — chore: expo-image install)
- [x] Commit 71e3ebd exists (Task 2 — feat: ExerciseDetailScreen photo banner)
- [x] tsc --noEmit passes (zero errors)
- [x] No `/images/` subdirectory in CDN URL
- [x] illustrationCardPhoto has overflow: 'hidden' and height: 220
- [x] photoError resets on exerciseId change via useEffect

## Self-Check: PASSED

*Phase: 15-exercise-photos*
*Completed: 2026-06-11*
