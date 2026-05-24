# Session 4 — Bug Fix Complete

6 bugs fixed. `npx tsc` passes with zero errors.

---

## Bug 1 — PhenoAge Formula Returns "1" (CRITICAL)
**File:** `src/lib/phenoAge.ts`

Root cause: Levine 2018 coefficients are calibrated for US lab units (albumin g/dL, creatinine mg/dL, glucose mg/dL). The code was converting to SI units (×10, ×88.42, ×0.0555) before applying them, causing `xb ≈ −10.7` → `mortProb ≈ 0` → `Math.log(0) = −Infinity` → clamped to 1.

Fix: removed the three unit conversions. Also added:
- Explicit `crpRaw <= 0` guard (returns `null`)
- `mortProb` and `innerLog` validity checks before `Math.log()`
- Range clamp: PhenoAge < 15 or > 95 returns `null` instead of garbage
- `console.log` of every intermediate term for debugging

**Commit:** `ffb05fb`

---

## Bug 2 — Full-Width "Demo Data" Banner on LongevityScoreScreen
**File:** `src/screens/LongevityScoreScreen.tsx`

Removed the amber full-width banner. Replaced with a tiny amber "demo" chip rendered inline inside each data orbital and metric grid cell when `healthData.isDemoMode` is true and the value is non-null. Chip is 7–8px, `rgba(245,158,11,0.6)` — visible but unobtrusive.

**Commit:** `283ab63`

---

## Bug 3 — Duplicate Supplements in Protocol Stack
**File:** `src/screens/ProtocolScreen.tsx`

`addCustomSupplement` now builds a combined name list from both `protocol.addedSupplements` and `protocol.customSupplements`, does a case-insensitive `.includes()` check on the trimmed name, and shows `Alert.alert('Already in your stack', ...)` with an early return before any state mutation.

**Commit:** `afa38f2`

---

## Bug 4 — No Way to Edit Biomarker History Entries
**File:** `src/screens/BiomarkerDetailScreen.tsx`

Each history row now has a pencil button (✎). Tapping it switches the row into inline edit mode: a `TextInput` pre-filled with the current value, a unit label, and Save/Cancel buttons. On save:
1. Parses and validates the new value (must be > 0)
2. Maps over the full `StoredEntry[]` array, updating the matched entry's value
3. Persists to `@vitalspan_biomarkers` via AsyncStorage
4. Triggers `Haptics.notificationAsync(SUCCESS)`

PhenoAge recalculates automatically on next focus via the existing `useFocusEffect`.

**Commit:** `b58662c`

---

## Bug 5 — No Daily Workout Tracking
**Files:** `src/data/exercises.ts`, `src/screens/ExerciseScreen.tsx`, `src/screens/DashboardScreen.tsx`

### Data layer
- Added `ExerciseIntensity = 'easy' | 'moderate' | 'hard'`
- Added `intensity?` and `caloriesEstimated?` fields to `ExerciseLogEntry`
- Added `CATEGORY_MET` record (Cardio 4.5, compound lifts 5.0, Core 3.5, Arms 4.0)

### ExerciseScreen
- Duration field added to all exercise types (was cardio-only)
- Intensity picker: Easy / Moderate / Hard chips (MET multipliers 0.8 / 1.0 / 1.3)
- Live calorie estimate: `MET × met_mult × weightKg × (durationMin / 60)` shown in modal
- Weight pulled from `@vitalspan_user_profile`; defaults to 75 kg if absent
- "Today's Activity" summary card at top: exercise count / total minutes / total kcal

### DashboardScreen
- "Movement today" subtitle now shows `{count} exercise(s) · {totalMin} min · ~{totalCal} kcal`
- Icon updated to 🏃

**Commit:** `9f61cbe`

---

## Bug 6 — Clinic-Vibe White Screens & Inconsistent Styles
**Files:** `src/screens/SettingsScreen.tsx`, `src/screens/InteractionCheckerScreen.tsx`, `src/screens/BiomarkerDetailScreen.tsx`, `src/navigation/AppNavigator.tsx`

### SettingsScreen
- `card`: removed `borderWidth: 0.5`; `borderRadius: Radius.lg` → `20`; added shadow `0.05/12/elevation 2`

### InteractionCheckerScreen
- `sectionLbl`: `fontWeight '500'` → `'600'`, `letterSpacing 0.7` → `1.5`
- `interCard`, `safeCard`, `pharmCard`: `borderRadius 16` → `20`; removed `borderWidth: 1`; `shadowOpacity 0.03` → `0.05`, `shadowRadius 8` → `12`, `elevation 1` → `2`

### BiomarkerDetailScreen
- `sectionLabel`: `fontWeight '500'` → `'600'`

### AppNavigator
- Protocol tab: 🧬 → 💊 (pill — matches screen purpose)
- Exercise tab: 🏋️ → 🏃 (figure running)

All backgrounds (`Colors.bg = '#EDE8DC'`) were already correct on LandingScreen, OnboardingScreen, DashboardScreen, ProfileScreen. LongevityScoreScreen dark theme untouched.

**Commit:** `0d83bbd`

---

## TypeScript
`npx tsc --noEmit` → zero errors after all fixes.

---

## Commit Log
```
0d83bbd  fix: remove clinic-vibe borders, unify card shadows, fix section labels
9f61cbe  feat: exercise daily tracking with intensity + calorie estimate
b58662c  feat: inline edit for biomarker history entries
afa38f2  fix: prevent duplicate supplements in protocol stack
283ab63  fix: replace demo banner with subtle per-card chip
ffb05fb  fix: correct PhenoAge unit conversion (critical)
```
