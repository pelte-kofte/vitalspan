# Vitalspan 🌿

> Science-backed longevity tracking. Built by a pharmacist.

## Stack
- **React Native** (Expo) — iOS & Android
- **TypeScript**
- **React Navigation** — stack + tab navigation
- **Expo Linear Gradient, Haptics**

## Screens
- `LandingScreen` — marketing landing
- `OnboardingScreen` — 5-step onboarding (goal, age/sex, conditions, medications, success)
- `DashboardScreen` — biological age, biomarkers, protocol tracker
- `InteractionCheckerScreen` — pharmacist-verified drug-supplement interactions
- `BiomarkerDetailScreen` — trend charts, history, learn tab
- `BiomarkerEntryScreen` — manual biomarker logging

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
```

## Project Structure

```
src/
  screens/        # All app screens
  components/     # Reusable UI components
  navigation/     # React Navigation setup
  data/           # Biomarkers + interactions database
  theme/          # Colors, typography, spacing
  hooks/          # Custom React hooks
assets/           # Images, icons, fonts
```

## Data

All biomarker reference ranges are longevity-optimized (not standard lab normals).
All drug-supplement interactions are pharmacist-verified.

Update `src/data/biomarkers.ts` to add new biomarkers or interactions.

## Next Steps
- [ ] Connect to real backend (Supabase recommended)
- [ ] Apple HealthKit integration (`expo-health`)
- [ ] Push notifications for protocol reminders
- [ ] Protocol Builder screen
- [ ] Paywall / Stripe integration
- [ ] DrugBank API for expanded interaction database
