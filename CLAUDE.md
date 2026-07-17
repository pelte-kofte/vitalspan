# Vitalspan — Claude Instructions

## Project Overview
Longevity tracking iOS app built with React Native (Expo). 
Built by a licensed pharmacist — science-backed, pharmacist-verified content.

## Tech Stack
- React Native + Expo (~51)
- TypeScript (strict)
- React Navigation (stack + bottom tabs)
- expo-linear-gradient, expo-haptics
- AsyncStorage for local state (Supabase later)

## Core Philosophy
- **Pharmacist-first**: Every interaction warning, biomarker range, and supplement recommendation is clinically reviewed
- **Longevity-optimized ranges**: We use longevity medicine ranges, NOT standard lab normals (e.g. ApoB <70, not <100)
- **Evidence grades**: Every recommendation gets a grade (A/B/C) based on evidence quality

## Folder Structure
```
src/
  screens/       # One file per screen
  components/    # Reusable UI (cards, buttons, charts)
  navigation/    # AppNavigator.tsx only
  data/          # biomarkers.ts, interactions.ts, protocols.ts
  theme/         # index.ts — colors, typography, spacing
  hooks/         # useStorage, useBiomarkers, useProtocol
assets/
  fonts/         # DM Sans, DM Serif Display
  icons/
```

## Coding Rules
- All colors from `src/theme/index.ts` — never hardcode hex values in screens
- All spacing from `Spacing.*` — never hardcode margin/padding numbers
- StyleSheet at bottom of every file, named `s`
- No inline styles except dynamic ones (e.g. `{ color: someVar }`)
- TypeScript strict — no `any`
- Components max 200 lines — split if longer

## Naming Conventions
- Screens: `PascalCaseScreen.tsx`
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Data files: `camelCase.ts`

## Data Rules
- Biomarker ranges are longevity-optimized (not standard lab normals)
- All interactions pharmacist-verified — add source comment when adding new ones
- Never show a drug/supplement interaction without a recommendation

## Current Screens
- LandingScreen → OnboardingScreen → Main (tabs)
- Main tabs: Dashboard, Biomarkers, Protocol, Profile
- Stack modals: LongevityScore (fullScreenModal), BiomarkerEntry, InteractionChecker, LabUpload
- Stack cards: BiomarkerDetail
- Settings + About (modal)

## Key Components
- `NeuralGrid` — animated SVG background. Props: `intensity`, `tone` ('calm'|'alert'|'vital')
- `BreathingCard` — scale+glow wrapper around cards
- `FutureSelf` — biological age projection card with neural overlay, aging rate badge, locked state
- `SupplementRow` — supplement with timing info, interaction warnings, evidence grade
- `RangeBar` — biomarker range visualization

## Key Libraries / Data
- `src/lib/clinicalPhenoAgePresentation.ts` — sole product-facing Clinical PhenoAge entry point and display adapter
- `src/lib/clinicalPhenoAgeProduct.ts` — eligibility-authorized measurement normalization and scientific execution boundary
- `src/domain/scientificModels/clinicalPhenoAge/` — locked Clinical PhenoAge v1.0.0 calculation engine
- `src/lib/healthkit.ts` — HealthKit mock: `connectAndSync()`, `loadHealthData()`, `deriveHealthState()`
- `src/data/medications.ts` — `MEDICATION_DATABASE` (200 drugs), `MedicationEntry` type
- `src/data/supplementTimings.ts` — `SUPPLEMENT_DATABASE` (20 supplements), `SupplementInfo` type
- `src/data/biomarkers.ts` — `BIOMARKERS`, `INTERACTIONS`

## AsyncStorage Keys
- `@vitalspan_user_profile` — UserProfile (name, age, sex, goal, conditions, medications)
- `@vitalspan_biomarkers` — StoredEntry[] (biomarker history)
- `@vitalspan_protocol` — ProtocolState (medTimes, addedSupplements, customSupplements, taken, takenDate)
- `@vitalspan_protocol_today` — { date, taken } (daily taken cache for Dashboard)
- `@vitalspan_health_data` — HealthData (HRV, sleep, glucose, recovery, isDemoMode, lastSynced)
- `@vitalspan_health_permissions` — PermissionStatus (granted, categories, requestedAt)

## ProtocolState schema
```typescript
interface ProtocolState {
  medTimes: Record<string, TimeSlot>;
  addedSupplements: string[];          // names from recommended list
  customSupplements: CustomSupplement[]; // user-added
  taken: string[];
  takenDate: string;
}
interface CustomSupplement {
  id: string; name: string; dose: string;
  timing?: TimeSlot; notes?: string; addedAt: string;
}
```

## What's Next (priority order)
1. Real Apple HealthKit — `npx expo install expo-health && npx expo run:ios` (mock ready in healthkit.ts)
2. BiomarkerDetail trend chart (react-native-chart-kit sparkline)
3. Protocol adherence chart (30-day SVG timeline)
4. Paywall — RevenueCat integration
5. Supabase backend
6. Push notifications — expo-notifications
7. TestFlight / EAS
