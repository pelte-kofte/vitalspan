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
- Modals: BiomarkerDetail, BiomarkerEntry, InteractionChecker

## What's Next (priority order)
1. BiomarkerDetailScreen — charts with react-native-chart-kit
2. BiomarkerEntryScreen — manual log
3. ProtocolScreen — supplement stack builder
4. Paywall — RevenueCat integration
5. Supabase backend
6. Apple HealthKit — expo-health
7. Push notifications — expo-notifications
