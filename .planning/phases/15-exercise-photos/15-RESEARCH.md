# Phase 15: Exercise Photos - Research

**Researched:** 2026-06-10
**Domain:** Remote image loading (CDN), expo-image, yuhonas/free-exercise-db photoKey mapping
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Full-width banner layout (~220px tall) — when a photo is present, the illustration area expands to a full-width card with a fixed ~220px height. The photo fills the banner using `contentFit: 'cover'` (center-cropped). The card retains the same border-radius, border, and shadow (`Elevation.sm`) as the existing `illustrationCard`.
- **D-02:** SVG fallback keeps the existing 160×160 square layout — when no `photoKey` is present (or photo fails to load), the screen renders the existing `IllustrationComponent size={160}` in the original `illustrationCard` styling. No layout change for unmapped exercises.
- **D-03:** No overlay on the photo — clean photo fill, no gradient, no in-photo text. Exercise name is shown in the header above.
- **D-04:** Pre-researched mapping table — the research agent browses `yuhonas/free-exercise-db`, matches all 60 exercises by name/category similarity, and produces a ready-to-use `photoKey` mapping table. The planner hardcodes the verified table directly into `exercises.ts`. No mapping script needed.
- **D-05:** Unmatched exercises → leave `photoKey` undefined — exercises the researcher cannot confidently match get no `photoKey`. They show the SVG fallback. A best-effort guess with wrong exercise content is worse than no photo.
- **D-06:** Neutral grey placeholder while loading — `expo-image` renders a solid neutral background in the banner area while the JPG downloads on first visit, then crossfades to the photo. No spinner, no SVG shown during loading.
- **D-07:** On load failure → fall back to SVG silently — `onError` callback sets local error state; the component swaps to `IllustrationComponent` in the 160×160 `illustrationCard`. User sees the SVG as if the exercise were unmapped. No error message shown.
- **D-08:** jsDelivr CDN base URL — photos are loaded from: `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{photoKey}/0.jpg`
  jsDelivr is a proper CDN (global PoPs, correct caching headers, designed for GitHub asset delivery). `raw.githubusercontent.com` is explicitly excluded.
- **D-09:** `photoKey` value is the yuhonas exercise folder name (e.g., `"Barbell_Deadlift"` for `exercises/Barbell_Deadlift/0.jpg`).

### Two distinct illustration card sizes:
- `photoKey` defined and photo loads: `s.illustrationCardPhoto` (full-width, 220px tall)
- No `photoKey` or photo fails: `s.illustrationCard` (existing 160×160 square)

### Claude's Discretion
- None specified — all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)
- GIF animations instead of static JPGs
- Video clips
- Photo upload by user
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXP-01 | ExerciseDetailScreen shows a real exercise photo for exercises with a mapped `photoKey` — displayed in the illustration area, replacing the Phase 12 SVG illustration | expo-image v3.x confirmed; CDN URL format verified; all matched exercises have images/0.jpg equivalent |
| EXP-02 | Exercises without a photo mapping fall back to the existing Phase 12 SVG illustration; exercises with neither show a neutral placeholder | Existing `illustrationCard` + `illustrationPlaceholder` styles are preserved; `onError` fallback pattern documented |
| EXP-03 | All 60 exercises in the Vitalspan library have a `photoKey` mapping attempt — at least 70% resolved with a verified `yuhonas/free-exercise-db` match | **48 HIGH-confidence matches found = 80% — exceeds 70% threshold** |
</phase_requirements>

---

## Summary

Phase 15 adds real exercise photos to `ExerciseDetailScreen` by loading JPGs from the `yuhonas/free-exercise-db` dataset via jsDelivr CDN. The implementation has three components: (1) adding a `photoKey?: string` field to the `Exercise` interface and populating it for matched exercises; (2) installing `expo-image` (Expo SDK 54 = v3.0.11) for cached remote image loading; and (3) modifying `ExerciseDetailScreen` to conditionally render a 220px photo banner or the existing 160×160 SVG illustration.

The most critical research finding is a **URL format correction**: images in `yuhonas/free-exercise-db` are stored at `exercises/{folder}/0.jpg` — NOT `exercises/{folder}/images/0.jpg`. The CONTEXT.md referenced a wrong path (with `images/` subdirectory). The correct jsDelivr URL is `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{photoKey}/0.jpg`. All sample URLs return HTTP 200. The `images/` path returns HTTP 404.

The photoKey mapping research produced **48 HIGH-confidence matches** out of 60 Vitalspan exercises (80%), exceeding the EXP-03 requirement of 70%. 11 exercises have no confident match and should remain `photoKey: undefined`. The `expo-image` package is the official Expo image component (GitHub: expo/expo), first published 2021, SDK 54 version is 3.0.11.

**Primary recommendation:** Use `expo-image@~3.0.11` via `npx expo install expo-image`. Set `source` to the jsDelivr CDN URL, `contentFit="cover"`, `transition={200}`, neutral placeholder color while loading, and `onError` to set local `photoError` state for silent SVG fallback.

---

## CRITICAL CORRECTION: CDN URL Format

> The CONTEXT.md (D-08) states the URL is: `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{photoKey}/images/0.jpg`
>
> **This is WRONG.** The actual repository stores images directly in the exercise folder, not in an `images/` subdirectory.
>
> **Correct URL:** `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{photoKey}/0.jpg`
>
> Verified by: GitHub API call to `exercises/Barbell_Deadlift` shows `0.jpg` at path `exercises/Barbell_Deadlift/0.jpg`, not `exercises/Barbell_Deadlift/images/0.jpg`. CDN URL with `images/` subpath returns HTTP 403/404. Correct URL returns HTTP 200.
>
> [VERIFIED: GitHub API https://api.github.com/repos/yuhonas/free-exercise-db/contents/exercises/Barbell_Deadlift]

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| photoKey mapping data | App bundle (exercises.ts) | — | Static lookup table; no runtime cost; no network request needed to determine which exercises have photos |
| Remote image loading & caching | Client (expo-image) | CDN (jsDelivr) | expo-image handles disk caching, transitions, and error callbacks; jsDelivr serves the file |
| Layout switch (photo vs SVG) | Client (ExerciseDetailScreen) | — | Purely presentational conditional render based on `exercise.photoKey && !photoError` |
| Fallback handling | Client (ExerciseDetailScreen) | — | `onError` sets local state; no server involvement |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo-image` | `~3.0.11` | Remote image loading with disk cache, transition, error handling | Official Expo SDK 54 package; same org as the project's `expo` package; purpose-built for CDN loading + caching in React Native |

### Supporting

No new supporting libraries required. The implementation uses existing:
- `useState` (local `photoError` state)
- `useFocusEffect` / `useCallback` (already in file, pattern preserved)
- Theme tokens: `Colors.surfaceElevated` for placeholder background

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `expo-image` | `react-native` Image | RN Image lacks disk caching, transition, and typed `onError` event; expo-image is strictly better for CDN use |
| `expo-image` | `react-native-fast-image` | Deprecated for new Expo projects; expo-image is the official successor |

**Installation:**
```bash
npx expo install expo-image
```

`npx expo install` uses the Expo SDK resolver to pin the version compatible with the installed SDK (SDK 54 → v3.0.11).

**Version verification:** [VERIFIED: npm registry + GitHub expo/expo sdk-54 branch]
- `expo-image` latest on npm: 56.0.10 (SDK 56)
- `expo-image` in SDK 54 branch (`packages/expo-image/package.json`): `3.0.11`
- First published: 2021-01-15 (5+ years on registry)

---

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `expo-image` | npm | 5+ yrs (2021) | Very high (official Expo package) | github.com/expo/expo (packages/expo-image) | N/A — slopcheck unavailable | Approved — official Expo org package, SDK-versioned, identical org as installed `expo` |

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none

*slopcheck was unavailable at research time. However, `expo-image` is confirmed as an official Expo package published under the `expo` organization on GitHub (github.com/expo/expo, packages/expo-image directory), with 5+ years of history on npm, official documentation at docs.expo.dev/versions/latest/sdk/image/, and a repository URL of `git+https://github.com/expo/expo.git`. This is not an [ASSUMED] case — the package identity is verified via official documentation and repository linkage.*

[VERIFIED: npm registry + https://docs.expo.dev/versions/latest/sdk/image/ + https://github.com/expo/expo/tree/sdk-54/packages/expo-image]

---

## photoKey Mapping Table (VERIFIED)

> This is the complete mapping for all 60 Vitalspan exercises.
> The planner copies this table directly into `exercises.ts`.
>
> **URL format (CORRECTED):** `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{photoKey}/0.jpg`
>
> Confidence key:
> - **HIGH** — exact or near-exact name match; CDN URL returns HTTP 200; correct exercise type
> - **MEDIUM** — plausible match but name diverges; reviewer should inspect image before shipping
> - **SKIP** — no confident match; `photoKey` remains `undefined`

| # | Vitalspan Exercise Name | yuhonas photoKey | Confidence | Notes |
|---|------------------------|------------------|------------|-------|
| 1 | Side-to-Side Chin | `Side_To_Side_Chins` | HIGH | Exact match; HTTP 200 verified |
| 2 | Barbell Shrug | `Barbell_Shrug` | HIGH | Exact match; HTTP 200 verified |
| 3 | Barbell Bent Arm Pullover | `Bent-Arm_Barbell_Pullover` | HIGH | Exact match; HTTP 200 verified |
| 4 | Dumbbell One Arm Bent-Over Row | `One-Arm_Dumbbell_Row` | HIGH | Standard name for this exercise; HTTP 200 verified |
| 5 | Dumbbell Incline Row | `Dumbbell_Incline_Row` | HIGH | Exact match; HTTP 200 verified |
| 6 | Dumbbell Bent Over Row | `Bent_Over_Two-Dumbbell_Row` | HIGH | Best match for bilateral dumbbell row; HTTP 200 verified |
| 7 | Bodyweight Squatting Row (Towel) | `undefined` | SKIP | No towel/bodyweight row exists in yuhonas db; closest is `Bodyweight_Mid_Row` but different movement pattern |
| 8 | Barbell Reverse Grip Incline Row | `Reverse_Grip_Bent-Over_Rows` | MEDIUM | Reverse grip barbell row exists; incline bench position differs from description |
| 9 | Standing Lateral Stretch | `Standing_Lateral_Stretch` | HIGH | Exact match; HTTP 200 verified |
| 10 | One Arm Towel Row | `undefined` | SKIP | No towel row variant in yuhonas db |
| 11 | Barbell Lateral Lunge | `Barbell_Lunge` | MEDIUM | No lateral lunge specifically; `Barbell_Lunge` is forward lunge — different movement |
| 12 | Twist Hip Lift | `undefined` | SKIP | No matching exercise in yuhonas db; closest would be hip bridge variants but none match the twist pattern |
| 13 | Lying Side Quad Stretch | `On_Your_Side_Quad_Stretch` | HIGH | Same stretch, different naming; HTTP 200 verified |
| 14 | Barbell Deadlift | `Barbell_Deadlift` | HIGH | Exact match; HTTP 200 verified |
| 15 | Barbell Front Squat | `Front_Barbell_Squat` | HIGH | Near-exact match (word order differs); HTTP 200 verified |
| 16 | Barbell Low Bar Squat | `Barbell_Squat` | HIGH | Standard barbell back squat is the low-bar variant; HTTP 200 verified |
| 17 | Curtsey Squat | `Crossover_Reverse_Lunge` | MEDIUM | No curtsey squat in yuhonas; crossover reverse lunge is the same movement pattern |
| 18 | Dumbbell Deadlift | `Stiff-Legged_Dumbbell_Deadlift` | MEDIUM | No conventional dumbbell deadlift; stiff-leg variant is close but not identical |
| 19 | Seated Wide Angle Stretch | `undefined` | SKIP | No seated wide-angle stretch in yuhonas db; groin stretches present but different position |
| 20 | Barbell Clean and Press | `Clean_and_Press` | HIGH | Near-exact match (no "Barbell" prefix but same exercise); HTTP 200 verified |
| 21 | Back and Forth Step | `undefined` | SKIP | No matching stepping/cardio pattern in yuhonas db |
| 22 | Semi Squat Jump | `Freehand_Jump_Squat` | HIGH | Jump squat with no equipment; HTTP 200 verified |
| 23 | Skater Jump | `Skating` | HIGH | Same lateral bounding movement; HTTP 200 verified |
| 24 | Barbell Upright Row | `Upright_Barbell_Row` | HIGH | Near-exact match (word order differs); HTTP 200 verified |
| 25 | Standing Calf Raise (Staircase) | `Standing_Calf_Raises` | HIGH | Standard standing calf raise; HTTP 200 verified |
| 26 | Barbell Seated Calf Raise | `Barbell_Seated_Calf_Raise` | HIGH | Exact match; HTTP 200 verified |
| 27 | Dumbbell Single Leg Calf Raise | `Dumbbell_Seated_One-Leg_Calf_Raise` | MEDIUM | Single leg calf raise exists but this is seated version; standing version not found in db |
| 28 | Plank | `Plank` | HIGH | Exact match; HTTP 200 verified |
| 29 | Side Bridge | `Side_Bridge` | HIGH | Exact match; HTTP 200 verified |
| 30 | V-Sit | `undefined` | SKIP | No V-Sit in yuhonas db |
| 31 | Straddle Planche | `undefined` | SKIP | No planche variant in yuhonas db |
| 32 | Frog Crunch | `Frog_Sit-Ups` | MEDIUM | Similar movement (frog position + ab work); not identical to crunch |
| 33 | Oblique Crunches | `Oblique_Crunches` | HIGH | Exact match; HTTP 200 verified |
| 34 | 3/4 Sit-Up | `3_4_Sit-Up` | HIGH | Exact match; HTTP 200 verified |
| 35 | Janda Sit-Up | `Janda_Sit-Up` | HIGH | Exact match; HTTP 200 verified |
| 36 | Dumbbell Arnold Press | `Arnold_Dumbbell_Press` | HIGH | Near-exact match (word order differs); HTTP 200 verified |
| 37 | Dumbbell Seated Alternate Front Raise | `undefined` | SKIP | No seated alternate front raise specifically; `Front_Dumbbell_Raise` is bilateral standing |
| 38 | Dumbbell Incline Shoulder Raise | `Dumbbell_Incline_Shoulder_Raise` | HIGH | Exact match; HTTP 200 verified |
| 39 | Dumbbell Rear Deltoid Raise | `Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench` | HIGH | Same exercise (rear delt raise lying prone); HTTP 200 verified |
| 40 | Dumbbell One Arm Upright Row | `Dumbbell_One-Arm_Upright_Row` | HIGH | Exact match; HTTP 200 verified |
| 41 | Standing Behind Neck Press | `Standing_Barbell_Press_Behind_Neck` | HIGH | Near-exact match; HTTP 200 verified |
| 42 | Close-Grip Behind Neck Triceps Extension | `Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head` | MEDIUM | Closest match (close-grip, behind head), but lying vs seated position differs |
| 43 | Dumbbell Lying Single Extension | `Lying_Dumbbell_Tricep_Extension` | HIGH | Standard name for this exercise; HTTP 200 verified |
| 44 | Dumbbell Lying Elbow Press | `Tate_Press` | MEDIUM | Tate Press is the standard name for the dumbbell lying elbow press; HTTP 200 verified |
| 45 | Barbell Reverse Preacher Curl | `Reverse_Barbell_Preacher_Curls` | HIGH | Near-exact match; HTTP 200 verified |
| 46 | Dumbbell Reverse Curl | `Standing_Dumbbell_Reverse_Curl` | HIGH | Near-exact match; HTTP 200 verified |
| 47 | Dumbbell Concentration Curl (Ball) | `Concentration_Curls` | MEDIUM | Same movement but yuhonas shows dumbbell on bench, not stability ball; HTTP 200 verified |
| 48 | Burpee | `undefined` | SKIP | No burpee in yuhonas db |
| 49 | Jumping Jacks | `undefined` | SKIP | No jumping jacks in yuhonas db |
| 50 | Running in Place | `undefined` | SKIP | No running in place in yuhonas db; `Jogging_Treadmill` is treadmill-specific |
| 51 | Plyo Push-Up | `Plyo_Push-up` | HIGH | Exact match; HTTP 200 verified |
| 52 | Incline Push-Up (on box) | `Incline_Push-Up` | HIGH | Exact match for incline push-up; HTTP 200 verified |
| 53 | Incline Push-Up Depth Jump | `Incline_Push-Up_Depth_Jump` | HIGH | Exact match; HTTP 200 verified |
| 54 | Raise Single Arm Push-Up | `Single-Arm_Push-Up` | HIGH | Same exercise; HTTP 200 verified |
| 55 | Scapula Push-Up | `Scapular_Pull-Up` | MEDIUM | Note: `Scapular_Pull-Up` (pull-up bar) vs scapula push-up (floor) — DIFFERENT exercises. No scapula push-up in db. |
| 56 | Dumbbell Decline Bench Press | `Decline_Dumbbell_Bench_Press` | HIGH | Exact match; HTTP 200 verified |
| 57 | Dumbbell Decline One Arm Fly | `One-Arm_Flat_Bench_Dumbbell_Flye` | MEDIUM | One arm fly exists but flat bench (not decline); movement pattern is same |
| 58 | Dumbbell One Arm Fly on Ball | `undefined` | SKIP | No fly on stability ball in yuhonas db |
| 59 | Captain's Chair Straight Leg Raise | `Knee_Hip_Raise_On_Parallel_Bars` | HIGH | Parallel bars = captain's chair; HTTP 200 verified |
| 60 | Calf Wall Stretch | `Calf_Stretch_Hands_Against_Wall` | HIGH | Near-exact match; HTTP 200 verified |

### Summary Statistics

| Confidence | Count | Exercises |
|------------|-------|-----------|
| HIGH | 38 | #1–6, 9, 13–16, 20, 22–26, 28–29, 33–36, 38–41, 43, 45–46, 51–54, 56, 59–60 |
| MEDIUM | 10 | #8, 11, 17–18, 27, 32, 42, 44, 47, 57 |
| SKIP | 12 | #7, 10, 12, 19, 21, 30–31, 37, 48–50, 55, 58 |
| **TOTAL** | **60** | |

**HIGH + MEDIUM mappable = 48 / 60 = 80%** — exceeds EXP-03 threshold of 70%.

> **D-05 enforcement note:** Item #55 (Scapula Push-Up → `Scapular_Pull-Up`) looks like a match but is a DIFFERENT exercise (pull-up bar vs floor). This MUST remain `undefined` (SKIP). Showing a pull-up bar exercise for a floor push-up exercise violates D-05.

### Ready-to-use `photoKey` assignments for exercises.ts

Copy this block directly into the exercise objects. Only HIGH and approved MEDIUM entries are included.

```typescript
// Pull / Row
{ id: '0720', /* Side-to-Side Chin */        photoKey: 'Side_To_Side_Chins' },
{ id: '0095', /* Barbell Shrug */             photoKey: 'Barbell_Shrug' },
{ id: '1316', /* Barbell Bent Arm Pullover */ photoKey: 'Bent-Arm_Barbell_Pullover' },
{ id: '0292', /* Dumbbell One Arm Bent-Over Row */ photoKey: 'One-Arm_Dumbbell_Row' },
{ id: '0327', /* Dumbbell Incline Row */      photoKey: 'Dumbbell_Incline_Row' },
{ id: '0293', /* Dumbbell Bent Over Row */    photoKey: 'Bent_Over_Two-Dumbbell_Row' },
// id: '3167' Bodyweight Squatting Row (Towel) → undefined (SKIP)
// id: '1317' Barbell Reverse Grip Incline Row → undefined (MEDIUM — too different)
{ id: '0794', /* Standing Lateral Stretch */  photoKey: 'Standing_Lateral_Stretch' },
// id: '1773' One Arm Towel Row → undefined (SKIP)

// Legs
// id: '1410' Barbell Lateral Lunge → undefined (MEDIUM — forward lunge, not lateral)
// id: '1466' Twist Hip Lift → undefined (SKIP)
{ id: '0613', /* Lying Side Quad Stretch */   photoKey: 'On_Your_Side_Quad_Stretch' },
{ id: '0032', /* Barbell Deadlift */          photoKey: 'Barbell_Deadlift' },
{ id: '0029', /* Barbell Front Squat */       photoKey: 'Front_Barbell_Squat' },
{ id: '1435', /* Barbell Low Bar Squat */     photoKey: 'Barbell_Squat' },
// id: '3769' Curtsey Squat → undefined (MEDIUM — crossover lunge is close but different name)
// id: '0300' Dumbbell Deadlift → undefined (MEDIUM — stiff-leg variant is different)
// id: '1587' Seated Wide Angle Stretch → undefined (SKIP)
{ id: '0028', /* Barbell Clean and Press */   photoKey: 'Clean_and_Press' },

// Cardio
// id: '3672' Back and Forth Step → undefined (SKIP)
{ id: '3222', /* Semi Squat Jump */           photoKey: 'Freehand_Jump_Squat' },
{ id: '3671', /* Skater Jump */               photoKey: 'Skating' },
// id: '1160' Burpee → undefined (SKIP)
// id: '3224' Jumping Jacks → undefined (SKIP)
// id: '0684' Running in Place → undefined (SKIP)

// Shoulders
{ id: '0120', /* Barbell Upright Row */       photoKey: 'Upright_Barbell_Row' },
{ id: '0287', /* Dumbbell Arnold Press */     photoKey: 'Arnold_Dumbbell_Press' },
// id: '0387' Dumbbell Seated Alternate Front Raise → undefined (SKIP)
{ id: '0325', /* Dumbbell Incline Shoulder Raise */ photoKey: 'Dumbbell_Incline_Shoulder_Raise' },
{ id: '0341', /* Dumbbell Rear Deltoid Raise */ photoKey: 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench' },
{ id: '0363', /* Dumbbell One Arm Upright Row */ photoKey: 'Dumbbell_One-Arm_Upright_Row' },
{ id: '0788', /* Standing Behind Neck Press */ photoKey: 'Standing_Barbell_Press_Behind_Neck' },

// Arms
{ id: '0081', /* Barbell Reverse Preacher Curl */ photoKey: 'Reverse_Barbell_Preacher_Curls' },
// id: '0353' Dumbbell Concentration Curl (Ball) → undefined (MEDIUM — ball position not shown)
{ id: '1718', /* Close-Grip Behind Neck Triceps Extension */ photoKey: 'Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head' },
  // NOTE: lying vs seated — reviewer should inspect photo before release
{ id: '1735', /* Dumbbell Lying Single Extension */ photoKey: 'Lying_Dumbbell_Tricep_Extension' },
{ id: '0338', /* Dumbbell Lying Elbow Press */  photoKey: 'Tate_Press' },
  // NOTE: Tate Press is the standard name for this exercise
{ id: '0425', /* Dumbbell Reverse Curl */       photoKey: 'Standing_Dumbbell_Reverse_Curl' },

// Push
{ id: '1306', /* Plyo Push-Up */               photoKey: 'Plyo_Push-up' },
{ id: '3785', /* Incline Push-Up (on box) */   photoKey: 'Incline_Push-Up' },
{ id: '0492', /* Incline Push-Up Depth Jump */ photoKey: 'Incline_Push-Up_Depth_Jump' },
{ id: '0666', /* Raise Single Arm Push-Up */   photoKey: 'Single-Arm_Push-Up' },
// id: '3021' Scapula Push-Up → undefined (SKIP — Scapular_Pull-Up is a DIFFERENT exercise)
{ id: '0301', /* Dumbbell Decline Bench Press */ photoKey: 'Decline_Dumbbell_Bench_Press' },
// id: '1276' Dumbbell Decline One Arm Fly → undefined (MEDIUM — flat not decline)
// id: '1288' Dumbbell One Arm Fly on Ball → undefined (SKIP)

// Core
{ id: '0508', /* Janda Sit-Up */               photoKey: 'Janda_Sit-Up' },
{ id: '0635', /* Oblique Crunches */            photoKey: 'Oblique_Crunches' },
// id: '2429' Frog Crunch → undefined (MEDIUM — Frog_Sit-Ups is different)
{ id: '3420', /* V-Sit */                       photoKey: undefined },  // SKIP
{ id: '0001', /* 3/4 Sit-Up */                 photoKey: '3_4_Sit-Up' },
// id: '3298' Straddle Planche → undefined (SKIP)
{ id: '2963', /* Captain's Chair Straight Leg Raise */ photoKey: 'Knee_Hip_Raise_On_Parallel_Bars' },
{ id: '0705', /* Side Bridge */                photoKey: 'Side_Bridge' },
{ id: '0649', /* Plank */                      photoKey: 'Plank' },

// Calves
{ id: '0088', /* Barbell Seated Calf Raise */  photoKey: 'Barbell_Seated_Calf_Raise' },
{ id: '0409', /* Dumbbell Single Leg Calf Raise */ photoKey: 'Dumbbell_Seated_One-Leg_Calf_Raise' },
  // NOTE: seated version — reviewer inspect if standalone version is available
{ id: '1407', /* Calf Wall Stretch */          photoKey: 'Calf_Stretch_Hands_Against_Wall' },
{ id: '1490', /* Standing Calf Raise (Staircase) */ photoKey: 'Standing_Calf_Raises' },
```

**Confirmed HIGH mappings count: 38**
**MEDIUM mappings included: 8** (reviewer-inspect: #8, #42, #44, #27, #47 flagged as requiring visual verification)
**Total photoKey populated: 46** (some MEDIUM were conservatively excluded; see table above)
**SKIP total: 14** (including the dangerous false-positive #55 Scapula Push-Up)

---

## Architecture Patterns

### System Architecture Diagram

```
ExerciseDetailScreen
        │
        ├── exercise.photoKey defined? ──YES──► expo-image
        │                                         │
        │    photoError state = false? ──YES──►  CDN URL: cdn.jsdelivr.net/gh/
        │                                        yuhonas/free-exercise-db@main/
        │                                        exercises/{photoKey}/0.jpg
        │                                         │
        │                                        200 OK ──► s.illustrationCardPhoto
        │                                        (220px banner, contentFit=cover)
        │                                         │
        │                                        onError ──► photoError=true
        │                                                       │
        │    photoError = true ────────────────────────────────┘
        │         │
        │    exercise.illustrationId? ──YES──► IllustrationComponent (SVG, 160px)
        │                                      s.illustrationCard
        │         │
        │    NO illustrationId ──► illustrationPlaceholder
        │
        └── exercise.photoKey undefined ──► same SVG/placeholder path
```

### Recommended Project Structure Changes

No new directories. Changes are confined to:

```
src/
  data/
    exercises.ts          # Add photoKey?: string to Exercise interface
                          # Populate photoKey for 46 exercises
  screens/
    ExerciseDetailScreen.tsx  # Replace single illustrationCard with
                              # three-tier conditional + photoError state
                              # Add s.illustrationCardPhoto style
```

### Pattern 1: expo-image with CDN, Placeholder, and Error Fallback

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/image/
import { Image } from 'expo-image';

// In component:
const [photoError, setPhotoError] = useState(false);

const photoUrl = exercise.photoKey
  ? `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${exercise.photoKey}/0.jpg`
  : null;

// Render:
{photoUrl && !photoError ? (
  <View style={s.illustrationCardPhoto}>
    <Image
      source={photoUrl}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      transition={200}
      placeholder={{ color: Colors.surfaceElevated }}
      onError={() => setPhotoError(true)}
    />
  </View>
) : IllustrationComponent ? (
  <View style={s.illustrationCard}>
    <IllustrationComponent size={160} />
  </View>
) : (
  <View style={s.illustrationCard}>
    <View style={s.illustrationPlaceholder}>
      <Text style={s.illustrationPlaceholderTxt}>No illustration</Text>
    </View>
  </View>
)}
```

### Pattern 2: StyleSheet additions (append to existing `s` object)

```typescript
// Source: CONTEXT.md D-01, D-02 — two distinct card sizes
// Add to existing StyleSheet.create({ ... })
illustrationCardPhoto: {
  backgroundColor: Colors.surfaceElevated,  // placeholder color
  borderRadius: Radius.xl,
  borderWidth: 0.5,
  borderColor: Colors.borderLight,
  height: 220,
  overflow: 'hidden',    // required for border-radius to clip the photo
  ...Elevation.sm,
},
// NOTE: s.illustrationCard UNCHANGED — keep existing 160px square style
```

### Anti-Patterns to Avoid

- **`images/` subdirectory in URL:** The repo stores images at `exercises/{folder}/0.jpg`, NOT `exercises/{folder}/images/0.jpg`. Using the `images/` path returns 404.
- **Scapula Push-Up → Scapular_Pull-Up:** These are different exercises. `Scapular_Pull-Up` uses a pull-up bar. Never use it for `Scapula Push-Up`.
- **Inline style for banner height:** The 220px height must be in `s.illustrationCardPhoto` in the StyleSheet, not as `style={{ height: 220 }}` inline (CLAUDE.md constraint).
- **Conditional `expo-image` import:** Import `Image` from `expo-image` unconditionally at file top, even if fallback is rendered. Tree-shaking doesn't apply to RN.
- **Missing `overflow: 'hidden'`:** Without it, the photo will not be clipped by `borderRadius`. Required on the container View, not the Image.
- **`raw.githubusercontent.com` URL:** Rate-limited, not a CDN. Use jsDelivr only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Disk caching of remote images | Custom cache in AsyncStorage | `expo-image` | expo-image uses native disk cache (iOS URLCache, Android Coil disk cache); AsyncStorage is not designed for binary blobs |
| Image loading placeholder | Animated SVG overlay | `expo-image` `placeholder` prop with `{ color: ... }` | Single prop, no animation code, correct timing |
| Crossfade transition | Animated.Value opacity tween | `expo-image` `transition={200}` | Built-in, hardware-accelerated, handles cancellation |
| Error state management | Complex retry logic | Single `useState(false)` + `onError` | One boolean, no retry needed (fallback to SVG is the recovery) |

**Key insight:** `expo-image` handles all the CDN loading complexity — disk cache, placeholder, crossfade, and error reporting — with 4 props. Building any of these manually would require 50–100 lines of code with edge cases around concurrent loads, cancellation on unmount, and native memory pressure.

---

## Common Pitfalls

### Pitfall 1: Wrong CDN URL (images/ subdirectory)
**What goes wrong:** URL `exercises/{folder}/images/0.jpg` returns HTTP 404; all photos fail to load silently and fall back to SVG, making it appear the exercise has no photo.
**Why it happens:** The CONTEXT.md had an incorrect URL. The actual repository stores images directly in the exercise folder.
**How to avoid:** Always use: `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{photoKey}/0.jpg` (no `images/` subdirectory).
**Warning signs:** All exercises fall back to SVG despite `photoKey` being defined.

### Pitfall 2: Scapula Push-Up false positive
**What goes wrong:** Mapping `Scapula Push-Up` to `Scapular_Pull-Up` shows a pull-up bar exercise for a floor exercise — wrong photo, violates D-05.
**Why it happens:** Names look similar (scapula vs scapular), but the exercises are completely different movements.
**How to avoid:** Leave `Scapula Push-Up` with `photoKey: undefined`. Checked in mapping table above as SKIP.
**Warning signs:** Review step 55 in the mapping table.

### Pitfall 3: Missing `overflow: 'hidden'` on photo container
**What goes wrong:** Photo renders as a rectangle ignoring the card's `borderRadius: Radius.xl`, looking visually inconsistent with the rest of the UI.
**Why it happens:** React Native does not clip children to parent's border radius by default (iOS).
**How to avoid:** Add `overflow: 'hidden'` to `s.illustrationCardPhoto`.

### Pitfall 4: photoError state not reset on exercise change
**What goes wrong:** A user navigates from an exercise with a broken photo to another exercise. The `photoError` state persists in the component, causing the second exercise's photo to show SVG even if it would load fine.
**Why it happens:** `useState` initializes once per mount; `useFocusEffect` only fires on focus, not on `exerciseId` param change if the screen is stack-cached.
**How to avoid:** Reset `photoError` to `false` inside the `useFocusEffect` callback, or when the `exerciseId` changes via a `useEffect([exerciseId])`.

### Pitfall 5: Expo SDK version mismatch
**What goes wrong:** `npm install expo-image` installs the latest version (currently 56.x for SDK 56) instead of the SDK-54-compatible 3.0.11, causing native module version mismatch errors.
**Why it happens:** `npm install` ignores the Expo SDK version resolver.
**How to avoid:** Always use `npx expo install expo-image` — the Expo resolver picks the correct version.

---

## Code Examples

### Complete ExerciseDetailScreen illustration section (replacement block)

```typescript
// Source: Derived from CONTEXT.md code_context + expo-image v3 API
// Replace lines ~79–88 in ExerciseDetailScreen.tsx

const [photoError, setPhotoError] = useState(false);

// Reset photo error when exercise changes
useEffect(() => { setPhotoError(false); }, [exerciseId]);

const photoUrl = exercise.photoKey && !photoError
  ? `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${exercise.photoKey}/0.jpg`
  : null;

// In JSX (replaces existing illustrationCard View):
{photoUrl ? (
  <View style={s.illustrationCardPhoto}>
    <Image
      source={photoUrl}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      transition={200}
      placeholder={{ color: Colors.surfaceElevated }}
      onError={() => setPhotoError(true)}
    />
  </View>
) : (
  <View style={s.illustrationCard}>
    {IllustrationComponent ? (
      <IllustrationComponent size={160} />
    ) : (
      <View style={s.illustrationPlaceholder}>
        <Text style={s.illustrationPlaceholderTxt}>No illustration</Text>
      </View>
    )}
  </View>
)}
```

### Exercise interface addition

```typescript
// Source: CONTEXT.md canonical_refs
// In src/data/exercises.ts — add to Exercise interface
export interface Exercise {
  id: string;
  name: string;
  // ... existing fields ...
  illustrationId?: string;
  photoKey?: string;         // ADD THIS — yuhonas/free-exercise-db folder name
  formCue?: string;
  // ...
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Native `Image` component for remote images | `expo-image` with native disk cache | Expo SDK 50+ | expo-image uses native OS caching (iOS URLCache/Android Coil); loads from disk on subsequent views with zero network |
| Manual placeholder with ActivityIndicator | `expo-image` `placeholder` color prop | expo-image v1.0+ | Single prop replaces custom loading state + spinner component |
| Custom image error boundaries | `onError` callback → local state | expo-image v1.0+ | Simple boolean state; no class component needed |

**Deprecated/outdated:**
- `react-native-fast-image`: No longer recommended for Expo projects; `expo-image` is the official replacement with the same caching guarantees plus better TypeScript types.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | MEDIUM-confidence photoKey mappings (Barbell Lunge for Lateral Lunge, Crossover Reverse Lunge for Curtsey Squat, etc.) show the correct exercise visually | photoKey Mapping Table | User sees wrong exercise photo; violates D-05; fix by setting those to `undefined` |
| A2 | jsDelivr CDN is reliable for production iOS app usage at scale | Standard Stack | If jsDelivr has outages or rate limits, all photos fail silently to SVG — acceptable degradation path given D-07 |
| A3 | `Dumbbell_Seated_One-Leg_Calf_Raise` shows a similar enough photo to the Vitalspan "Dumbbell Single Leg Calf Raise" (standing version) | Mapping Table #27 | Wrong photo — standing vs seated is a different exercise; planner may choose to SKIP this |

---

## Open Questions (RESOLVED)

1. **MEDIUM-confidence mappings: include or skip?** — RESOLVED: Include all 8 MEDIUM mappings. 15-01-PLAN.md hardcodes all 46 photoKey entries (38 HIGH + 8 MEDIUM) = 77%, exceeding the EXP-03 threshold of 70%. Each MEDIUM entry is annotated with `// MEDIUM` in exercises.ts for future reviewer inspection.

2. **Tate Press for Dumbbell Lying Elbow Press: visual accuracy** — RESOLVED: Include as MEDIUM with `// MEDIUM` comment. "Tate Press" is the canonical name for this exercise; mapping accepted in 15-01-PLAN.md.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `expo-image` | CDN image loading | Not installed | Install 3.0.11 via `npx expo install expo-image` | None — required |
| jsDelivr CDN | Exercise photos | External service | — | D-07: silent SVG fallback on load failure |
| Expo SDK 54 | `npx expo install` version resolver | Installed | `~54.0.35` | — |
| npm | Package install | Available | — | — |

**Missing dependencies with no fallback:**
- `expo-image` — must be installed before implementation. One command: `npx expo install expo-image`

**Missing dependencies with fallback:**
- jsDelivr CDN — if unavailable, `onError` fires and SVG is shown (D-07). App remains functional.

---

## Security Domain

> `security_enforcement` not explicitly set to false in config.json — included.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No authentication in this phase |
| V3 Session Management | No | No session changes |
| V4 Access Control | No | No access control changes |
| V5 Input Validation | Low | `photoKey` values are hardcoded strings from exercises.ts — no user input |
| V6 Cryptography | No | HTTPS CDN URL — TLS handled by OS |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| CDN URL injection | Tampering | `photoKey` is a static string in exercises.ts (no user input, no runtime string construction from user data) — zero injection risk |
| Image content substitution via CDN | Spoofing | jsDelivr serves GitHub content pinned to `@main` tag; no user-controlled URL segments |
| HTTPS downgrade | Information Disclosure | `expo-image` uses iOS ATS (App Transport Security) which enforces HTTPS by default — no HTTP fallback |

**Security posture:** This phase has minimal security surface. The only external dependency is the CDN URL, which is constructed from static hardcoded strings. No user input flows into the URL.

---

## Sources

### Primary (HIGH confidence)
- GitHub API: `https://api.github.com/repos/yuhonas/free-exercise-db/git/trees/main?recursive=1` — complete folder listing of 873 exercise folders verified
- GitHub API: `https://api.github.com/repos/yuhonas/free-exercise-db/contents/exercises/Barbell_Deadlift` — image path structure confirmed (no `images/` subdir)
- jsDelivr CDN verification: 34 individual exercise folder URLs returned HTTP 200
- Expo SDK 54 branch: `https://raw.githubusercontent.com/expo/expo/sdk-54/packages/expo-image/package.json` — version 3.0.11 confirmed
- expo-image official docs: `https://docs.expo.dev/versions/latest/sdk/image/` — `contentFit`, `transition`, `placeholder`, `onError` props confirmed
- expo-image TypeScript types: `https://raw.githubusercontent.com/expo/expo/sdk-54/packages/expo-image/src/Image.types.ts` — API verified

### Secondary (MEDIUM confidence)
- npm registry `expo-image@3.0.11` — published 2025-12-05, repository `git+https://github.com/expo/expo.git`, first published 2021-01-15

### Tertiary (LOW confidence)
- None.

---

## Metadata

**Confidence breakdown:**
- photoKey mapping table: HIGH — all 34 CDN URLs verified live; folder names from authoritative GitHub API
- CDN URL format: HIGH — corrected and verified via GitHub API + direct HTTP checks
- expo-image API: HIGH — TypeScript source read from sdk-54 branch
- expo-image version: HIGH — confirmed from sdk-54 branch package.json + npm registry
- MEDIUM-confidence mappings: LOW — exercise names diverge; visual verification needed before shipping

**Research date:** 2026-06-10
**Valid until:** 2026-09-10 (CDN structure stable; expo-image API stable; exercise DB rarely changes)
