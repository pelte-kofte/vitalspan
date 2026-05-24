<!-- refreshed: 2026-05-24 -->
# Architecture

**Analysis Date:** 2026-05-24

## System Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                     App.tsx (Entry Point)                        │
│  Reads @vitalspan_user_profile → decides initialRoute           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│             AppNavigator  `src/navigation/AppNavigator.tsx`      │
│   Native Stack (Landing → Onboarding → Main → modals/cards)     │
│         └─ MainTabs (Bottom Tabs: Home │ Biomarkers │ Protocol │ Profile)
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼───────────────────┐
          ▼                ▼                   ▼
  ┌──────────────┐ ┌──────────────┐   ┌────────────────────┐
  │   Screens    │ │  Components  │   │   Lib / Data       │
  │`src/screens/`│ │`src/comps/`  │   │`src/lib/`          │
  │ (13 files)   │ │ (6 files)    │   │`src/data/`         │
  └──────┬───────┘ └──────┬───────┘   └────────┬───────────┘
         │                │                    │
         └────────────────┴──────────┬─────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │   AsyncStorage (persistence)  │
                     │   6 keys, all @vitalspan_*    │
                     └───────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| App.tsx | Bootstrap — reads onboarding state, renders navigator | `App.tsx` |
| AppNavigator | Defines full navigation graph (types + stack + tabs) | `src/navigation/AppNavigator.tsx` |
| DashboardScreen | Main home view: PhenoAge, health data, biomarker summary, protocol progress | `src/screens/DashboardScreen.tsx` |
| BiomarkerDetailScreen | Categorized biomarker list + per-biomarker history entries | `src/screens/BiomarkerDetailScreen.tsx` |
| BiomarkerEntryScreen | Form to log a new biomarker reading, with unit conversion | `src/screens/BiomarkerEntryScreen.tsx` |
| ProtocolScreen | Supplement + medication protocol management (add/remove/mark taken) | `src/screens/ProtocolScreen.tsx` |
| ProfileScreen | User profile edit + HealthKit connect + orbital longevity data viz | `src/screens/ProfileScreen.tsx` |
| LongevityScoreScreen | Full-screen biological age deep-dive with animated SVG scoring | `src/screens/LongevityScoreScreen.tsx` |
| InteractionCheckerScreen | Drug-supplement interaction checker using INTERACTIONS data | `src/screens/InteractionCheckerScreen.tsx` |
| LabUploadScreen | PDF lab report parsing → auto-populates biomarker entries | `src/screens/LabUploadScreen.tsx` |
| LandingScreen | Splash + feature overview + CTA to onboarding | `src/screens/LandingScreen.tsx` |
| OnboardingScreen | 5-step wizard: name, goal, age/sex, conditions, medications | `src/screens/OnboardingScreen.tsx` |
| SettingsScreen | App settings: data reset, debug, share | `src/screens/SettingsScreen.tsx` |
| AboutScreen | Pharmacist credentials, science references | `src/screens/AboutScreen.tsx` |
| NeuralGrid | Animated SVG neural network background overlay | `src/components/NeuralGrid.tsx` |
| BreathingCard | Animated scale+glow wrapper for cards (Reanimated) | `src/components/BreathingCard.tsx` |
| FutureSelf | Biological age projection card with aging-rate badge + locked state | `src/components/FutureSelf.tsx` |
| SupplementRow | Supplement entry with timing, evidence grade, interaction warnings | `src/components/SupplementRow.tsx` |
| RangeBar | Longevity target range visualization (5-zone color bar) | `src/components/RangeBar.tsx` |
| MedicationSearch | Typeahead search over MEDICATION_DATABASE with manual entry fallback | `src/components/MedicationSearch.tsx` |
| phenoAge.ts | Levine PhenoAge formula implementation, confidence tiers, biomarker map | `src/lib/phenoAge.ts` |
| healthkit.ts | HealthKit mock layer: permissions, sync, load, deriveHealthState | `src/lib/healthkit.ts` |
| labParser.ts | PDF binary text extraction + biomarker pattern matching for lab upload | `src/lib/labParser.ts` |
| biomarkers.ts | BIOMARKERS array (longevity-optimized ranges) + INTERACTIONS data | `src/data/biomarkers.ts` |
| supplementTimings.ts | SUPPLEMENT_DATABASE (20 entries) with timing, evidence, drug separations | `src/data/supplementTimings.ts` |
| medications.ts | MEDICATION_DATABASE (~200 drugs) + searchMedications() function | `src/data/medications.ts` |

## Pattern Overview

**Overall:** Flat screen-centric React Native app with a shared data layer

**Key Characteristics:**
- No global state management (Redux, Zustand, Context) — each screen reads its own AsyncStorage keys on focus via `useFocusEffect`
- Navigation is the only architectural coupling between screens; screens are otherwise standalone
- Business logic lives in `src/lib/` (pure functions); all clinical data in `src/data/` (static arrays)
- UI polish is centralized in `src/components/` (animated primitives) and `src/theme/` (design tokens)
- TypeScript interfaces defined locally in each screen — `StoredEntry` and `CustomSupplement` are exceptions, exported from their defining screen files

## Layers

**Entry / Bootstrap:**
- Purpose: Read persisted auth state, route to correct initial screen
- Location: `App.tsx`
- Contains: AsyncStorage read, `initialRoute` state, navigator render
- Depends on: `src/navigation/AppNavigator.tsx`
- Used by: Expo runtime

**Navigation:**
- Purpose: Define all routes, stack configurations, tab layout
- Location: `src/navigation/AppNavigator.tsx`
- Contains: `RootStackParamList` type, `MainTabs` bottom tab navigator, `AppNavigator` root stack
- Depends on: All screen components, `src/theme/`
- Used by: `App.tsx`, all screens via `useNavigation<Nav>()`

**Screens:**
- Purpose: Feature-level views; own their UI state and storage I/O
- Location: `src/screens/`
- Contains: State, AsyncStorage CRUD, component composition, navigation triggers
- Depends on: `src/components/`, `src/data/`, `src/lib/`, `src/theme/`
- Used by: `AppNavigator.tsx`

**Components:**
- Purpose: Reusable, stateless or animation-only UI primitives
- Location: `src/components/`
- Contains: Animated wrappers, data display widgets, search inputs
- Depends on: `src/theme/`, `src/data/` (SupplementRow reads supplementTimings), `src/lib/phenoAge` (FutureSelf)
- Used by: Screens

**Lib:**
- Purpose: Pure business logic — calculations, external integrations
- Location: `src/lib/`
- Contains: `phenoAge.ts` (PhenoAge formula), `healthkit.ts` (HealthKit mock), `labParser.ts` (PDF parsing)
- Depends on: React Native platform APIs (Alert), AsyncStorage
- Used by: Screens (primarily DashboardScreen, ProfileScreen, LongevityScoreScreen, LabUploadScreen)

**Data:**
- Purpose: Static clinical datasets — longevity-optimized ranges, drug database, supplement database, interactions
- Location: `src/data/`
- Contains: `BIOMARKERS[]`, `INTERACTIONS[]`, `MEDICATION_DATABASE`, `SUPPLEMENT_DATABASE`, `searchMedications()`
- Depends on: `src/theme/` (biomarkers.ts uses Colors for chart color assignment)
- Used by: Screens, components

**Theme:**
- Purpose: Design token source of truth
- Location: `src/theme/index.ts`
- Contains: `Colors`, `Typography`, `Spacing`, `Radius`, `Gradients`, `Motion`, `Elevation`
- Depends on: Nothing
- Used by: All layers

## Data Flow

### App Bootstrap

1. Expo launches `App.tsx`
2. `AsyncStorage.getItem('@vitalspan_user_profile')` determines route
3. `AppNavigator` renders with `initialRoute: 'Landing'` or `'Main'`
4. If `'Landing'` → user completes `OnboardingScreen` → saves profile → navigates to `'Main'`

### Biomarker Entry → Dashboard Update

1. User presses "Log biomarker" from `DashboardScreen` or `BiomarkerDetailScreen`
2. Navigation pushes `BiomarkerEntryScreen` (modal) with optional `biomarkerId` param
3. User inputs value → `BiomarkerEntryScreen` appends a `StoredEntry` to `@vitalspan_biomarkers`
4. On return, `DashboardScreen` re-fires `useFocusEffect` → re-reads `@vitalspan_biomarkers`
5. `computePhenoAge()` recalculates from latest entries → `FutureSelf` re-renders

### Lab PDF Upload → Biomarker Entries

1. `LabUploadScreen` reads a PDF file via `expo-file-system`
2. `parseLabPDF()` in `src/lib/labParser.ts` extracts text and pattern-matches biomarker names/values
3. Matched results shown for user confirmation
4. Confirmed entries appended to `@vitalspan_biomarkers`

### Protocol Taken State

1. `ProtocolScreen` reads `@vitalspan_protocol` (full protocol state)
2. User marks supplement taken → state written to both `@vitalspan_protocol` and `@vitalspan_protocol_today`
3. `DashboardScreen` reads only `@vitalspan_protocol_today` (lightweight daily cache) to show adherence summary

### Health Data Flow

1. User taps "Connect Health" in `ProfileScreen`
2. `connectAndSync()` from `src/lib/healthkit.ts` shows permission Alert (mock)
3. On grant, `generateMockData()` creates realistic HealthKit values
4. Data persisted to `@vitalspan_health_data`
5. `DashboardScreen` calls `loadHealthData()` on focus, then `deriveHealthState()` to determine `NeuralGrid` tone

**State Management:**
- No global store. All state is local `useState` + AsyncStorage as the persistence layer.
- `useFocusEffect` is the universal pattern for re-reading storage when a screen regains focus.

## Key Abstractions

**StoredEntry:**
- Purpose: Represents a single biomarker measurement log entry
- Defined in: `src/screens/BiomarkerEntryScreen.tsx` (exported)
- Consumed by: `DashboardScreen`, `BiomarkerDetailScreen`, `LabUploadScreen`
- Fields: `id`, `biomarkerId`, `value`, `date`, `source`, `notes`

**ProtocolState:**
- Purpose: Persisted supplement/medication protocol including daily taken state
- Defined in: `src/screens/ProtocolScreen.tsx` (local interface)
- Persisted at: `@vitalspan_protocol`
- Sub-type `CustomSupplement` is exported for reuse

**PhenoAgeInputs / PhenoAgeResult:**
- Purpose: Input/output contract for the Levine PhenoAge calculation
- Defined in: `src/lib/phenoAge.ts`
- Used by: `DashboardScreen`, `LongevityScoreScreen`, `ProfileScreen`

**HealthData / PermissionStatus:**
- Purpose: HealthKit data shape and permission state
- Defined in: `src/lib/healthkit.ts`
- Used by: `DashboardScreen`, `ProfileScreen`

**RootStackParamList:**
- Purpose: TypeScript-typed navigation route map, ensures type-safe navigation
- Defined in: `src/navigation/AppNavigator.tsx`
- Used by: All screens that call `useNavigation<Nav>()`

**NeuralTone:**
- Purpose: `'calm' | 'alert' | 'vital'` — drives NeuralGrid color (cyan / amber / bioGreen)
- Defined in: `src/components/NeuralGrid.tsx`
- Used by: `DashboardScreen`, `LongevityScoreScreen`, `ProfileScreen`, `FutureSelf`

## Entry Points

**App bootstrap:**
- Location: `App.tsx`
- Triggers: Expo runtime on device launch
- Responsibilities: Route resolution based on stored onboarding state

**Main Tab Shell:**
- Location: `src/navigation/AppNavigator.tsx` — `MainTabs` function
- Triggers: Stack navigation to `'Main'`
- Responsibilities: Renders 4-tab layout (Home, Biomarkers, Protocol, Profile)

**Onboarding entry:**
- Location: `src/screens/LandingScreen.tsx`
- Triggers: First app launch (no stored profile)
- Responsibilities: CTA to `OnboardingScreen`, back-door to `'Main'` for returning users

## Architectural Constraints

- **Threading:** Single-threaded React Native JS thread. Heavy computation (PhenoAge, PDF parse) runs synchronously on main thread — no workers used.
- **Global state:** No global state. Module-level caches exist in `NeuralGrid.tsx` (`NODES_CACHE`, `LINKS_CACHE`) for stable SVG geometry across renders.
- **Circular imports:** `BiomarkerDetailScreen` and `LabUploadScreen` both import `StoredEntry` from `BiomarkerEntryScreen.tsx`. This is a screen-to-screen import — an architectural smell where a type is owned by a screen rather than a shared types file.
- **No barrel exports:** Each module imported directly by path. No `index.ts` barrel files in `screens/`, `components/`, or `lib/`.
- **HealthKit:** Currently mock-only. The real `expo-health` SDK requires a native build (`npx expo run:ios`). All real HealthKit calls are commented out in `src/lib/healthkit.ts`.

## Anti-Patterns

### Screen-to-screen type imports

**What happens:** `DashboardScreen`, `BiomarkerDetailScreen`, and `LabUploadScreen` all import `StoredEntry` and `getStatus` from `BiomarkerEntryScreen.tsx`.
**Why it's wrong:** Couples unrelated screens; importing a "screen" to get a type creates false dependencies and makes refactoring fragile.
**Do this instead:** Move `StoredEntry`, `getStatus`, and `CustomSupplement` to `src/types/storage.ts` or `src/data/types.ts` and import from there.

### Interfaces duplicated across screens

**What happens:** `UserProfile` interface is defined locally (and slightly differently) in `DashboardScreen`, `ProfileScreen`, and `OnboardingScreen`.
**Why it's wrong:** Schema drift — if a field is added to the stored profile, all three need updating independently.
**Do this instead:** Define `UserProfile` once in `src/types/user.ts` and export it to all consumers.

### Screens exceeding 200-line limit

**What happens:** `LongevityScoreScreen.tsx` (790 lines), `ProtocolScreen.tsx` (785 lines), `ProfileScreen.tsx` (460 lines), `DashboardScreen.tsx` (436 lines) all exceed the documented 200-line component limit.
**Why it's wrong:** Makes the files hard to navigate, test, or split into sub-components.
**Do this instead:** Extract sub-sections into dedicated components (e.g., `ProtocolDaySummary`, `LongevityScoreCard`, `ProfileHealthOrbit`) placed in `src/components/`.

## Error Handling

**Strategy:** Permissive — most failures are swallowed silently with fallback to empty/null state.

**Patterns:**
- AsyncStorage reads wrapped in `.catch(() => null)` or `try/catch` with `console.error(e)`
- `computePhenoAge()` returns `confidence: 'insufficient'` when too many inputs are missing, never throws
- `labParser.ts` returns `[]` on any parse failure
- HealthKit errors return `{ success: false, error: string }` (never throw)

## Cross-Cutting Concerns

**Logging:** `console.error` for storage errors; `console.log` in `phenoAge.ts` for debug tracing. No structured logging library.
**Validation:** Input validation is local to each screen — no shared validator utilities.
**Authentication:** None. App is fully local; "authentication" is simply checking for a stored `UserProfile` with `onboardingComplete: true`.
**Haptics:** `expo-haptics` called on interactive feedback (mark taken, toggle supplements, button presses). Pattern: `Haptics.selectionAsync().catch(() => null)`.

---

*Architecture analysis: 2026-05-24*
