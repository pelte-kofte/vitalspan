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

## Session 1 — Cinematic UI

### Phase 1 — Foundation
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

## Session 2 — Production Readiness (2026-05-23)

### Audit completed — bugs found and fixed:

**Critical bugs fixed:**
1. `biologicalAge = Math.random()` → Replaced with Levine PhenoAge formula
2. `MedicationSearch` → Replaced external RxNorm API with 200-drug local database + Levenshtein fuzzy search
3. Navigation back-swipe → `gestureEnabled: false` on Landing/Onboarding; `nav.reset()` after onboarding
4. "Already have account" → Now checks AsyncStorage for profile before navigating

**Hardcoded values cleaned up:**
- `borderRadius: 16` → `Radius.lg` in LandingScreen
- Biomarkers array syntax error in biomarkers.ts fixed

### Features implemented:

#### Navigation (App.tsx, AppNavigator.tsx)
- App.tsx checks AsyncStorage on launch → routes directly to Main if onboarding complete
- `gestureEnabled: false` on Landing, Onboarding, Main stack screens
- `nav.reset()` used after onboarding complete
- `nav.reset()` in SettingsScreen sign-out and clear-data flows

#### Medications (src/data/medications.ts, MedicationSearch.tsx)
- 200-drug pharmacist-curated database: statins, cardiovascular, anticoagulants, diabetes, thyroid, psychiatric, antibiotics, NSAIDs, PPIs, respiratory, hormonal, osteoporosis, immunosuppressants, neurological, misc
- TR/US/UK brand names included (Glucophage, Coumadin, Glifor, etc.)
- Levenshtein distance fuzzy search with typo tolerance (threshold: 1 for short queries, 2 for long)
- Shows drug class as subtitle in dropdown
- Fully offline — no network requests
- "+ Add manually" fallback preserved

#### Biological Age (src/lib/phenoAge.ts)
- Full Levine PhenoAge formula (Aging Cell, 2018 — DOI: 10.1111/acel.12748)
- 9 required biomarkers: albumin, creatinine, glucose, hsCRP, lymphocyte %, MCV, RDW, ALP, WBC
- Confidence tiers: high (all 9 logged), medium (7-8), low (4-6), insufficient (<4)
- Dashboard bio age card: shows real PhenoAge OR shows missing biomarkers CTA
- LongevityScore sphere shows real PhenoAge
- Profile screen no longer shows fake stored biologicalAge — computed live
- Confidence indicator shown on Dashboard when medium confidence

#### 7 New Biomarkers (src/data/biomarkers.ts)
All required for PhenoAge: albumin, creatinine, lymphocyte %, MCV, RDW, alkaline phosphatase, WBC
- Full longevity descriptions and howToImprove sections
- Added `cbc` and `metabolicPanel` categories
- BiomarkerDetailScreen updated to show these new categories

#### Onboarding (OnboardingScreen.tsx)
- Form validation: name required on step 0 (Alert), goal required on step 1 (Alert)
- Button disabled state for steps with required fields
- Haptic feedback (selectionAsync) on every option select, age +/-, sex toggle
- Success haptic on completion
- `nav.reset()` instead of `nav.replace()` — clears full stack

#### Dashboard (DashboardScreen.tsx)
- Pull-to-refresh (RefreshControl)
- Haptics on bio age card tap, interaction checker tap, + Log tap
- Empty protocol state: "Go to Protocol →" CTA button
- Bio age: shows PhenoAge OR shows "Log {biomarkers} to unlock" CTA
- Confidence note when PhenoAge computed with missing biomarkers

#### New Screens
- `src/screens/SettingsScreen.tsx`: notifications toggles, metric/imperial unit switch, About navigation, sign out (with confirmation), clear all data (destructive alert), pharmacist disclaimer
- `src/screens/AboutScreen.tsx`: version, PhenoAge citation, longevity vs standard ranges table, evidence grading system, medical disclaimer

#### Profile (ProfileScreen.tsx)
- Edit mode: name, age, sex, conditions — all editable in-app
- Edit saved to AsyncStorage with success haptic
- Settings + About shortcut cards at bottom of profile
- ⚙️ settings button in header
- Medications empty state: "go to Protocol to add" CTA

#### Polish
- BiomarkerEntryScreen: unit conversion (mmol/L ↔ mg/dL for glucose, mmol/mol ↔ % for HbA1c), haptic on save
- BiomarkerDetailScreen: empty history CTA "+ Log first entry", haptic on Log button
- ProtocolScreen: empty medications CTA "Go to Profile →", haptic on taken toggles

---

## Preserved / Untouched
- All existing AsyncStorage keys: `@vitalspan_user_profile`, `@vitalspan_biomarkers`, `@vitalspan_protocol`, `@vitalspan_protocol_today`, `@vitalspan_health_data`
- All business logic in src/data/
- All existing screen functionality
- All existing theme tokens (only added new ones)
- NeuralGrid, BreathingCard, FutureSelf, SupplementRow, RangeBar components
- LongevityScoreScreen dark theme
- All navigation paths (only added Settings, About routes + fixed gestures)

---

## What's still pending (next session)

- [ ] Paywall — RevenueCat integration
- [ ] Supabase backend (auth + sync)
- [ ] Apple HealthKit — `expo-health` (stub exists at `src/lib/healthkit.ts`)
- [ ] Push notifications — `expo-notifications`
- [ ] Protocol weekly adherence chart with react-native-svg
- [ ] BiomarkerDetail trend chart (react-native-chart-kit or SVG)
- [ ] TestFlight build + EAS configuration review
- [ ] App Store screenshots

---

## TypeScript status
✅ `npx tsc --noEmit` passes with 0 errors (verified 2026-05-23)

## Commits in this session
- `3b53ddc` feat: production readiness — navigation, PhenoAge, local meds, settings
- `79ac416` feat: polish screens — haptics, unit conversion, empty states, protocol
