# Technology Stack

**Analysis Date:** 2026-05-24

## Languages

**Primary:**
- TypeScript 5.1+ (strict mode) - All source files in `src/`

**Secondary:**
- JavaScript - `babel.config.js` (build config only)

## Runtime

**Environment:**
- Node.js v25.9.0 (development tooling)
- iOS runtime (target platform — React Native, no Android support configured)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.1.0 - UI component model
- React Native 0.81.5 - Native iOS rendering
- Expo ~54.0.0 - Managed/bare workflow, build tooling, SDK access

**Navigation:**
- `@react-navigation/native` ^6.1.17 - Navigation container
- `@react-navigation/native-stack` ^6.9.26 - Stack navigator (screens/modals)
- `@react-navigation/bottom-tabs` ^6.5.20 - Bottom tab bar

**Animation:**
- `react-native-reanimated` ~4.1.1 - Worklet-based animations (breathing card, neural grid)
- `react-native-worklets` 0.5.1 - Worklet runtime for reanimated
- Reanimated plugin required in `babel.config.js`

**Build/Dev:**
- `babel-preset-expo` ~54.0.10 - Transpilation
- `@babel/core` ^7.20.0 - Babel compiler
- EAS CLI >= 18.12.3 - Build and submit via `eas.json`

## Key Dependencies

**Critical:**
- `@react-native-async-storage/async-storage` 2.2.0 - Only persistence layer; used in 11+ files directly (no abstraction hook)
- `expo-linear-gradient` ~15.0.8 - Gradient backgrounds on LandingScreen, DashboardScreen, LongevityScoreScreen
- `expo-haptics` ~15.0.8 - Haptic feedback on BiomarkerEntryScreen, DashboardScreen, LongevityScoreScreen, OnboardingScreen, ProfileScreen, ProtocolScreen, SettingsScreen
- `react-native-svg` 15.12.1 - SVG rendering for NeuralGrid (`src/components/NeuralGrid.tsx`)
- `expo-file-system` ~19.0.22 - PDF binary reading in `src/lib/labParser.ts`
- `expo-document-picker` ~14.0.8 - Lab PDF file picking (`src/screens/LabUploadScreen.tsx`)
- `expo-image-picker` ~17.0.11 - Lab image picking (`src/screens/LabUploadScreen.tsx`)

**Infrastructure:**
- `react-native-gesture-handler` ~2.28.0 - Touch gesture foundation (imported first in `App.tsx`)
- `react-native-screens` ~4.16.0 - Native screen containers for React Navigation
- `react-native-safe-area-context` ~5.6.0 - Safe area insets
- `react-native-chart-kit` ^6.12.0 - Installed but not yet used in any source file (planned for BiomarkerDetail trend chart)
- `@expo/vector-icons` ^15.0.3 - Icon set
- `expo-font` ~14.0.11 - Custom font loading (DM Sans, DM Serif Display); declared as plugin in `app.json`
- `expo-status-bar` ~3.0.9 - Status bar control

## Configuration

**TypeScript:**
- `tsconfig.json` extends `expo/tsconfig.base`
- `strict: true`
- Path alias: `@/*` maps to `src/*` (baseUrl `.`)

**Build:**
- `babel.config.js` — `babel-preset-expo` + `react-native-reanimated/plugin`
- `app.json` — Expo config: bundle ID `com.vitalspan.app`, portrait-only, no tablet, EAS project ID `4d42a8cb-bf83-4229-82a5-1b2273356a54`
- `eas.json` — three build profiles: development (internal), preview (internal), production (auto-increment)

**Environment:**
- No `.env` files present — no runtime environment variables consumed
- All configuration is hard-coded or stored in AsyncStorage

## Platform Requirements

**Development:**
- macOS + Xcode required (iOS only target)
- `expo start` for dev server
- `expo run:ios` for native build

**Production:**
- iOS only (`ios.supportsTablet: false`, no Android config in `app.json`)
- EAS Build for TestFlight/App Store distribution
- HealthKit entitlement declared: `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription` in `app.json` `infoPlist`
- `ITSAppUsesNonExemptEncryption: false` declared

---

*Stack analysis: 2026-05-24*
