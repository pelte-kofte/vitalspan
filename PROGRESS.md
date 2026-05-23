# Vitalspan — Cinematic UI Implementation Progress

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

## Preserved / Untouched
- All existing AsyncStorage keys
- All business logic in src/data/
- All existing screen functionality
- AppNavigator structure (only added a new route)
- Existing theme tokens (only added new ones)
