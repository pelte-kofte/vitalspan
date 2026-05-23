# Vitalspan — Production Readiness Progress

## Architecture decisions made before writing any code

### Stack confirmed
- React Native + Expo SDK 54
- react-native-reanimated 4.1.1 (Reanimated 4 API, worklets via react-native-worklets 0.5.1)
- react-native-svg 15.12.1
- babel plugin already configured: `react-native-reanimated/plugin`

### Animation strategy for NeuralGrid
NeuralGrid uses a single `useSharedValue` (Reanimated) driving an `Animated.View` wrapper.
Nodes are statically positioned (seeded pseudo-random for stability across renders).
Two staggered breathing groups create illusion of independent pulsing.
Lines are static, computed once from distance threshold.
This hits 60fps because the only animated prop is `opacity` on a native View — runs on UI thread.

### No new packages installed
- expo-health is NOT installed. healthkit.ts is a full design stub, ready to activate.
- All other dependencies already in package.json.

---

## Implementation Checklist

### Phase 1 — Foundation
- [x] PROGRESS.md (this file)
- [x] `src/theme/index.ts` — extended with Colors.dark, Colors.viz, Gradients, Motion, Elevation, refined Typography
- [x] `src/hooks/useBreathing.ts` — shared animation hook

### Phase 2 — New Components
- [x] `src/components/NeuralGrid.tsx` — animated SVG background
- [x] `src/components/BreathingCard.tsx` — scale + glow wrapper
- [x] `src/components/FutureSelf.tsx` — biological age projection

### Phase 3 — New Screen
- [x] `src/screens/LongevityScoreScreen.tsx` — full-screen sphere visualization
- [x] `src/navigation/AppNavigator.tsx` — add LongevityScore route

### Phase 4 — Dashboard Enhancement
- [x] `src/screens/DashboardScreen.tsx` — NeuralGrid bg, BreathingCard bio, FutureSelf, gradient bm cards

### Phase 5 — HealthKit (stub, ready to activate)
- [x] `src/lib/healthkit.ts` — permission request + sync design

---

## AUDIT — Bugs & Issues Found (Session 2: 2026-05-23)

### Critical Bugs

1. **Fake biological age** (`OnboardingScreen.tsx:71`)
   - `biologicalAge: age - Math.floor(Math.random() * 8 + 2)` — random value on every onboarding
   - Fix: Implement Levine PhenoAge formula; show CTA if biomarkers not logged yet

2. **MedicationSearch calls external RxNorm API** (`MedicationSearch.tsx:49`)
   - Makes live HTTP request to `rxnav.nlm.nih.gov` — breaks offline, unreliable in production
   - Fix: Replace with local `medications.ts` database + Levenshtein fuzzy search

3. **Navigation back-button to Landing/Onboarding**
   - No `gestureEnabled: false` on Landing/Onboarding stack screens
   - `nav.replace('Main')` in OnboardingScreen is correct but Landing/Onboarding accessible via swipe
   - Fix: Add `gestureEnabled: false` + wrap initialRoute determination in App.tsx

4. **"Already have an account" goes to Main unconditionally** (`LandingScreen.tsx:49`)
   - Navigates to Main even if no profile exists → blank Dashboard
   - Fix: Check AsyncStorage for profile first; if none, go to Onboarding

### Hardcoded Values (not using tokens)
- `LandingScreen.tsx:108` — `borderRadius: 16` (not using `Radius.lg`)
- `LandingScreen.tsx:111` — `shadowOffset: { width: 0, height: 4 }` (not using Elevation token)
- `BiomarkerDetailScreen.tsx:263` — `borderRadius: 16` (should be `Radius.lg`)
- `DashboardScreen.tsx:143,144` — `'#0A1628'` in LinearGradient colors array (acceptable — not a standalone hex in StyleSheet)
- `LongevityScoreScreen.tsx` — uses raw hex strings in SVG fills (SVG context; acceptable)

### Fake/Placeholder Data
- `biomarkers.ts` — All biomarkers have `history`, `defaultVal`, `prevVal` fields that are hardcoded demo data. BiomarkerDetailScreen shows only user-logged entries via AsyncStorage, so this data is unused (good). But the fields still exist in the type — could confuse future devs.
- `LongevityScoreScreen.tsx` — `projectedLifespan` is a rough calculation (`85 + yearsDiff`), not clinically validated. Acceptable as an estimate, but needs a disclaimer.

### Fake Calculations
- `biologicalAge` = random (see Critical Bugs above)
- `FutureSelf.tsx` — `projectedBio` = linear projection, not clinically validated. Acceptable estimate.

### Missing Screens / Features
- No **Settings screen** (notifications, units, language, sign out, clear data)
- No **About screen** (version, disclaimer, credits)
- No **Privacy Policy** screen
- No **edit mode** on ProfileScreen — all read-only
- ProfileScreen has no way to change medications/conditions post-onboarding

### Navigation Issues
- `gestureEnabled: false` missing on Landing + Onboarding
- "Already have an account" doesn't check if profile exists
- BiomarkerDetailScreen is a tab AND a stack screen (duplication in AppNavigator)

### UX Issues
- Dashboard has no **pull-to-refresh**
- Onboarding step 0 (name) allows continuing with empty name (no validation)
- Onboarding step 1 (goal) allows continuing without selecting a goal
- No haptic feedback on any button
- No loading skeleton states
- No error boundaries
- BiomarkerEntry has no unit conversion (mmol/L ↔ mg/dL)
- Protocol screen shows "Add medications in your profile" but no CTA button to Profile

### Empty States
- Dashboard protocol empty state has text but no actionable CTA button
- BiomarkerDetail shows "No entries logged yet" with no "+ Log" CTA in history section

### TODO Comments Found
- None found (clean)

---

## Session 2 — Production Readiness Fixes

### Completed
- [x] Audit (this section)
- [x] Navigation fix: gestureEnabled: false, "already have account" check
- [x] Medications database: 200 drugs, local fuzzy search
- [x] MedicationSearch: replaced RxNorm API with local search
- [x] PhenoAge formula: src/lib/phenoAge.ts
- [x] Biological age: Dashboard + LongevityScore use PhenoAge or show CTA
- [x] PhenoAge biomarkers added to biomarkers.ts
- [x] Pull-to-refresh on Dashboard
- [x] Form validation on Onboarding
- [x] Settings screen
- [x] About screen
- [x] Profile → Settings entry point
- [x] Haptic feedback on primary buttons
- [x] ProfileScreen edit mode

---

## Preserved / Untouched
- All existing AsyncStorage keys
- All business logic in src/data/
- All existing screen functionality
- AppNavigator structure (only added new routes + fixed gestures)
- Existing theme tokens (only added new ones)
