# Codebase Structure

**Analysis Date:** 2026-05-24

## Directory Layout

```
vitalspan/
├── App.tsx                    # Root component — bootstrap, route decision
├── app.json                   # Expo config (name, slug, bundleId, icons)
├── babel.config.js            # Babel preset (expo)
├── tsconfig.json              # TypeScript config (strict)
├── eas.json                   # EAS Build config (development/production profiles)
├── package.json               # Dependencies
├── CLAUDE.md                  # Project instructions for Claude
├── assets/
│   └── fonts/                 # DM Sans, DM Serif Display (not yet loaded via expo-font)
└── src/
    ├── navigation/
    │   └── AppNavigator.tsx   # Complete navigation graph + RootStackParamList type
    ├── screens/               # One file per screen (13 files)
    │   ├── LandingScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── BiomarkerDetailScreen.tsx
    │   ├── BiomarkerEntryScreen.tsx
    │   ├── ProtocolScreen.tsx
    │   ├── ProfileScreen.tsx
    │   ├── LongevityScoreScreen.tsx
    │   ├── InteractionCheckerScreen.tsx
    │   ├── LabUploadScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── AboutScreen.tsx
    │   └── PlaceholderScreens.tsx  # Unused stubs
    ├── components/            # Reusable UI primitives (6 files)
    │   ├── NeuralGrid.tsx     # Animated SVG background (nodes + links)
    │   ├── BreathingCard.tsx  # Reanimated scale+glow card wrapper
    │   ├── FutureSelf.tsx     # Biological age projection card
    │   ├── SupplementRow.tsx  # Supplement with timing, evidence, warnings
    │   ├── RangeBar.tsx       # 5-zone longevity target bar
    │   └── MedicationSearch.tsx  # Typeahead medication search
    ├── lib/                   # Pure business logic / external integrations
    │   ├── phenoAge.ts        # Levine PhenoAge formula + PHENO_AGE_BIOMARKER_MAP
    │   ├── healthkit.ts       # HealthKit mock layer (permissions, sync, load)
    │   └── labParser.ts       # PDF text extraction + biomarker pattern matching
    ├── data/                  # Static clinical datasets
    │   ├── biomarkers.ts      # BIOMARKERS[] (longevity ranges) + INTERACTIONS[]
    │   ├── supplementTimings.ts  # SUPPLEMENT_DATABASE (20 supplements)
    │   └── medications.ts     # MEDICATION_DATABASE (~200 drugs) + searchMedications()
    ├── hooks/
    │   └── useBreathing.ts    # Shared Reanimated oscillation hook (0→1→0)
    └── theme/
        └── index.ts           # Colors, Typography, Spacing, Radius, Gradients, Motion, Elevation
```

## Directory Purposes

**`src/navigation/`:**
- Purpose: Navigation graph — the only place route names and params are defined
- Contains: `AppNavigator.tsx` with `RootStackParamList`, `MainTabs` (bottom tabs), root stack
- Key files: `src/navigation/AppNavigator.tsx`

**`src/screens/`:**
- Purpose: One file per distinct screen. Each screen owns its UI state and AsyncStorage I/O.
- Contains: Screen components, local TypeScript interfaces, screen-specific utility functions
- Key files: `DashboardScreen.tsx`, `ProtocolScreen.tsx`, `LongevityScoreScreen.tsx`

**`src/components/`:**
- Purpose: Shared UI building blocks used by multiple screens
- Contains: Animated primitives, data display widgets, search components
- Key files: `NeuralGrid.tsx`, `FutureSelf.tsx`, `SupplementRow.tsx`

**`src/lib/`:**
- Purpose: Pure functions and integration adapters — no JSX, no UI
- Contains: Clinical calculations (`phenoAge.ts`), HealthKit abstraction (`healthkit.ts`), lab report parsing (`labParser.ts`)
- Key files: `src/lib/phenoAge.ts`, `src/lib/healthkit.ts`

**`src/data/`:**
- Purpose: Static, pharmacist-reviewed clinical datasets loaded at module level
- Contains: Biomarker definitions with longevity-optimized ranges, drug-supplement interactions, supplement timing rules, medication search index
- Key files: `src/data/biomarkers.ts`, `src/data/supplementTimings.ts`, `src/data/medications.ts`

**`src/hooks/`:**
- Purpose: Shared React hooks that encapsulate animation or storage logic
- Contains: `useBreathing.ts` — returns a `SharedValue` oscillating 0→1→0 via `react-native-reanimated`
- Key files: `src/hooks/useBreathing.ts`

**`src/theme/`:**
- Purpose: Single source of truth for all design tokens; never hardcode values in screens
- Contains: `Colors`, `Typography` (sizes, letterSpacing), `Spacing`, `Radius`, `Gradients`, `Motion`, `Elevation`
- Key files: `src/theme/index.ts`

**`assets/`:**
- Purpose: Static assets (fonts, icons)
- Generated: No
- Committed: Yes

## Key File Locations

**Entry Points:**
- `App.tsx`: Root component — reads onboarding state, renders `AppNavigator`
- `src/navigation/AppNavigator.tsx`: Full navigation graph definition

**Configuration:**
- `src/theme/index.ts`: All design tokens (Colors, Spacing, etc.)
- `app.json`: Expo app configuration
- `tsconfig.json`: TypeScript strict mode config
- `babel.config.js`: Babel preset (`babel-preset-expo`)
- `eas.json`: EAS Build profiles

**Core Logic:**
- `src/lib/phenoAge.ts`: `computePhenoAge()`, `PHENO_AGE_BIOMARKER_MAP`, `PHENO_BIOMARKER_LIST`
- `src/lib/healthkit.ts`: `connectAndSync()`, `loadHealthData()`, `deriveHealthState()`
- `src/lib/labParser.ts`: `parseLabPDF()`, `ParsedBiomarker` type

**Clinical Data:**
- `src/data/biomarkers.ts`: `BIOMARKERS: Biomarker[]`, `INTERACTIONS: Interaction[]`
- `src/data/supplementTimings.ts`: `SUPPLEMENT_DATABASE: SupplementInfo[]`, `getSupplementInfo()`
- `src/data/medications.ts`: `MEDICATION_DATABASE`, `searchMedications(query, limit)`

**Shared Types (currently co-located in screens — see ARCHITECTURE.md concerns):**
- `StoredEntry`: defined and exported from `src/screens/BiomarkerEntryScreen.tsx`
- `getStatus()`: exported from `src/screens/BiomarkerEntryScreen.tsx`
- `CustomSupplement`: defined in `src/screens/ProtocolScreen.tsx`

**Testing:**
- No test files present. `src/lib/` pure functions are the best candidates for unit tests.

## Naming Conventions

**Files:**
- Screens: `PascalCaseScreen.tsx` — e.g., `DashboardScreen.tsx`, `BiomarkerEntryScreen.tsx`
- Components: `PascalCase.tsx` — e.g., `NeuralGrid.tsx`, `SupplementRow.tsx`
- Hooks: `useCamelCase.ts` — e.g., `useBreathing.ts`
- Data files: `camelCase.ts` — e.g., `biomarkers.ts`, `supplementTimings.ts`
- Lib files: `camelCase.ts` — e.g., `phenoAge.ts`, `healthkit.ts`, `labParser.ts`

**Directories:**
- All lowercase: `screens/`, `components/`, `hooks/`, `data/`, `lib/`, `theme/`, `navigation/`

**StyleSheet:**
- Always named `s` and placed at the bottom of every file: `const s = StyleSheet.create({ ... })`

**Navigation type alias:**
- Local to each screen: `type Nav = NativeStackNavigationProp<RootStackParamList>`

**Export:**
- Default export for every screen and component
- Named exports for types, constants, and utility functions within `lib/` and `data/`

## Where to Add New Code

**New Screen:**
- Implementation: `src/screens/NewFeatureScreen.tsx` (default export)
- Register route: Add to `RootStackParamList` in `src/navigation/AppNavigator.tsx`
- Add `Stack.Screen` in `AppNavigator` with appropriate `presentation` option
- If it's a tab: Add `Tab.Screen` inside `MainTabs()` in `AppNavigator.tsx`

**New Reusable Component:**
- Implementation: `src/components/NewComponent.tsx`
- Must read all colors from `src/theme/index.ts`, spacing from `Spacing.*`
- StyleSheet named `s` at bottom of file

**New Hook:**
- Implementation: `src/hooks/useNewHook.ts`

**New Clinical Data (biomarkers, interactions):**
- Biomarkers: Add entry to `BIOMARKERS` array in `src/data/biomarkers.ts` following the `Biomarker` interface
- Interactions: Add to `INTERACTIONS` array in `src/data/biomarkers.ts`
- Supplements: Add to `SUPPLEMENT_DATABASE` in `src/data/supplementTimings.ts` following `SupplementInfo`
- Medications: Add to `MEDICATION_DATABASE` in `src/data/medications.ts`

**New Business Logic / Calculation:**
- Implementation: `src/lib/newModule.ts` (pure functions, no JSX)

**New Shared Type:**
- Preferred location: `src/data/types.ts` (does not yet exist — create it when extracting `StoredEntry`, `UserProfile`, `CustomSupplement` from screens)
- Interim: place in the most logical `data/` or `lib/` file

**New AsyncStorage key:**
- Document in `src/screens/SettingsScreen.tsx` → `ALL_STORAGE_KEYS` array (used for data reset)
- Follow naming convention: `@vitalspan_<noun>` in snake_case

## Special Directories

**`.planning/`:**
- Purpose: GSD planning documents (phases, codebase maps)
- Generated: By GSD commands
- Committed: Yes (planning artifacts)

**`.claude/`:**
- Purpose: Claude Code agent configuration, custom commands, skills
- Generated: By Claude Code tooling
- Committed: Yes

**`.expo/`:**
- Purpose: Expo local dev server cache
- Generated: Yes
- Committed: No

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-05-24*
