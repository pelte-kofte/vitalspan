# Vitalspan 🌿

> Science-backed longevity tracking. Built by a licensed pharmacist.

## Stack
- **React Native** (Expo SDK 54) — iOS & Android
- **TypeScript** (strict mode, 0 errors)
- **React Navigation** — stack + tab navigation
- **Expo Linear Gradient, Haptics**
- **react-native-svg 15** — NeuralGrid animations, orbit visualization
- **react-native-reanimated 4** — breathing card, entrance animations

## Screens
- `LandingScreen` — marketing landing with pharmacist badge
- `OnboardingScreen` — 5-step onboarding (goal, age/sex, conditions, medications, success)
- `DashboardScreen` — biological age (PhenoAge), biomarkers, protocol tracker, pull-to-refresh
- `LongevityScoreScreen` — cinematic dark sphere, animated orbit, PhenoAge calculation
- `BiomarkerDetailScreen` — all biomarkers by category, history log, about + how-to-improve
- `BiomarkerEntryScreen` — manual biomarker logging with unit conversion (mmol/L ↔ mg/dL)
- `InteractionCheckerScreen` — pharmacist-verified drug-supplement interactions
- `ProtocolScreen` — medication tracking + evidence-graded supplement recommendations
- `ProfileScreen` — read + edit mode, conditions, medications
- `SettingsScreen` — notifications, units, sign out, clear data
- `AboutScreen` — version, PhenoAge citation, longevity ranges, evidence grades, disclaimer
- `LabUploadScreen` — import biomarkers from PDF

## Key features

### Biological Age (Levine PhenoAge)
Biological age is computed using the validated PhenoAge formula (Levine et al., Aging Cell 2018).
Requires 9 standard blood markers: albumin, creatinine, glucose, hsCRP, lymphocyte %, MCV, RDW, ALP, WBC.
- `high` confidence: all 9 logged
- `medium` confidence: 7-8 logged (uses medians for missing)
- `low` confidence: 4-6 logged
- `insufficient`: <4 logged — shows CTA to log more

### Medication Search
200-drug local database with Levenshtein fuzzy search.
- Includes TR/US/UK brand names (Glucophage, Coumadin, Glifor, etc.)
- Works fully offline — no network requests
- Drug class shown as subtitle

### Navigation (production-safe)
- App checks `@vitalspan_user_profile` on launch → routes to Main if onboarding complete
- Landing/Onboarding screens: `gestureEnabled: false` — no back-swipe
- `nav.reset()` after onboarding — clears full navigation stack

### Data (local-first)
All data stored in AsyncStorage. No auth, no backend required for v1.

```
@vitalspan_user_profile     — profile, conditions, medications, goal
@vitalspan_biomarkers       — all logged biomarker entries (array)
@vitalspan_protocol         — supplement selections + timing assignments
@vitalspan_protocol_today   — today's taken state
@vitalspan_health_data      — HealthKit snapshot (stub)
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Expo dev server
npx expo start

# 3. Run on iOS simulator (requires Xcode)
npx expo run:ios

# 4. Run on physical iPhone
# Install Expo Go from App Store, scan QR code

# 5. Type check
npx tsc --noEmit
```

## Project Structure

```
src/
  screens/        # All app screens
  components/     # NeuralGrid, BreathingCard, FutureSelf, SupplementRow, RangeBar, MedicationSearch
  navigation/     # AppNavigator.tsx
  data/           # biomarkers.ts (19 biomarkers incl. PhenoAge set), medications.ts (200 drugs), supplementTimings.ts
  theme/          # Colors, Typography, Spacing, Radius, Gradients, Motion, Elevation
  hooks/          # useBreathing.ts
  lib/            # phenoAge.ts (Levine formula), healthkit.ts (stub), labParser.ts
assets/           # Icons, fonts (DM Sans, DM Serif Display)
```

## Biomarker ranges

All ranges are **longevity-optimized**, not standard lab normals.

| Biomarker | Longevity target | Standard lab |
|-----------|------------------|--------------|
| ApoB | <70 mg/dL | <100 mg/dL |
| Fasting Glucose | <90 mg/dL | <100 mg/dL |
| hsCRP | <1.0 mg/L | <3.0 mg/L |
| HbA1c | <5.3% | <5.7% |
| Vitamin D | 50-80 ng/mL | 30-100 ng/mL |

## References

- Levine ME et al. "An epigenetic biomarker of aging for lifespan and healthspan." *Aging Cell*. 2018;17(4):e12748. DOI: 10.1111/acel.12748

## Next Steps
- [ ] RevenueCat paywall integration
- [ ] Supabase backend (auth + cloud sync)
- [ ] Apple HealthKit — `expo-health` (stub at `src/lib/healthkit.ts`)
- [ ] Push notifications — `expo-notifications`
- [ ] Protocol adherence chart (weekly, react-native-svg)
- [ ] BiomarkerDetail trend chart
- [ ] TestFlight build via EAS
