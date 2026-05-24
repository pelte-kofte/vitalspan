# Testing Patterns

**Analysis Date:** 2026-05-24

## Test Framework

**Runner:** None — no test runner is installed or configured.

**Assertion Library:** None

**Test config:** No `jest.config.*`, `vitest.config.*`, or any test configuration file detected.

**devDependencies related to testing:** None. The `devDependencies` in `package.json` contain only:
- `@babel/core` ^7.20.0
- `typescript` ^5.1.3

**Run Commands:**
```bash
# No test commands exist — package.json scripts are:
# "start": "expo start"
# "ios": "expo run:ios"
# "android": "expo run:android"
```

## Test File Organization

**Test files:** Zero test files detected anywhere in the repository. No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files exist.

**`__tests__` directories:** None.

## Current State

**No automated tests exist.** This is a pre-testing codebase. The entire application — screens, components, lib functions, data modules, and hooks — is completely untested.

## Testable Units (High Priority)

The following units have pure logic that could be tested without a React or native environment:

**`src/lib/phenoAge.ts` — `computePhenoAge()`**
- Pure function: inputs → `PhenoAgeResult`
- Critical medical calculation (Levine PhenoAge formula)
- Has clearly defined confidence tiers: `'high' | 'medium' | 'low' | 'insufficient'`
- Returns `biologicalAge: null` when `missingCount > 5`
- Uses median substitution for partial inputs
- Testable edge cases: all fields provided, partial fields, zero fields, age=0, extreme values

**`src/screens/BiomarkerEntryScreen.tsx` — `getStatus()`**
- Pure function: `(val, optMin, optMax) → 'optimal' | 'suboptimal' | 'out_of_range'`
- Buffer zone logic: `buf = (optMax - optMin) * (2/3)`
- Trivially unit-testable

**`src/screens/BiomarkerEntryScreen.tsx` — `convertToNative()`**
- Pure conversion function: `(val, biomarkerId, inputUnit) → number`
- Handles `mmol/L` → `mg/dL` and `mmol/mol` → `%` conversions
- Conversion factors defined in `MMOL_CONVERTIBLE` constant

**`src/lib/healthkit.ts` — `deriveHealthState()`**
- Pure function: `(HealthData | null) → HealthState`
- Returns `'neutral' | 'good' | 'poor' | 'stressed'`
- Used to drive `NeuralGrid` tone reactively

**`src/lib/healthkit.ts` — `isHealthDataStale()`**
- Pure function: `(HealthData) → boolean`
- Time-based staleness check

**`src/components/FutureSelf.tsx` — `computeProjection()`**
- Pure function: `(bioAge, chronoAge, optimality) → { projectedAge, agingRate, gainYears, label }`
- Module-internal, would need export or test via component

**`src/screens/ProtocolScreen.tsx` — `parseDoseCount()`**
- Pure regex function: `(doseString) → number`
- Extracts `Nx daily` multiplier; clamps to 1–6

## Recommended Test Setup

To add testing, install and configure:

```bash
npx expo install jest-expo @testing-library/react-native @testing-library/jest-native
```

Minimal `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

## Mocking Approach (When Implemented)

**AsyncStorage:** Mock with `@react-native-async-storage/async-storage/jest/async-storage-mock`

**expo-haptics:** Mock with `jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(), impactAsync: jest.fn(), notificationAsync: jest.fn() }))`

**react-native-reanimated:** Use `react-native-reanimated/mock` (included in reanimated package)

**react-native-svg:** Mock SVG components as plain Views

**Navigation:** Mock `@react-navigation/native` with `{ useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }), useFocusEffect: jest.fn(), useRoute: () => ({ params: {} }) }`

## Coverage Gaps

Every area of the codebase is completely uncovered. Priority order for adding tests:

**Critical (medical safety):**
- `src/lib/phenoAge.ts` — `computePhenoAge()` — wrong biological age calculation is a patient safety issue
- `src/screens/BiomarkerEntryScreen.tsx` — `getStatus()` — drives optimal/suboptimal/out-of-range classification shown to users
- `src/screens/BiomarkerEntryScreen.tsx` — `convertToNative()` — unit conversion errors produce wrong stored values

**High (core business logic):**
- `src/lib/healthkit.ts` — `deriveHealthState()`, `isHealthDataStale()`
- `src/screens/ProtocolScreen.tsx` — `parseDoseCount()` — drives multi-dose timing display
- `src/components/FutureSelf.tsx` — `computeProjection()` — biological projection shown to users

**Medium (data integrity):**
- `src/data/biomarkers.ts` — validate all `BIOMARKERS` entries have `optMin < optMax`
- `src/data/supplementTimings.ts` — validate `SUPPLEMENT_DATABASE` entries have required fields

**Lower (UI behavior):**
- Screen render tests for loading/empty/data states
- Navigation flow tests (onboarding → main)

## What NOT to Mock

When tests are added:
- Do not mock `src/lib/phenoAge.ts` — test the real formula
- Do not mock `src/theme/index.ts` — it is pure data, no side effects
- Do not mock `src/data/biomarkers.ts` — it is pure data

## Test File Placement Convention (To Adopt)

Since no convention exists yet, the recommendation based on `CLAUDE.md` folder structure:

```
src/
  lib/
    phenoAge.ts
    phenoAge.test.ts     ← co-locate unit tests
  screens/
    BiomarkerEntryScreen.tsx
    BiomarkerEntryScreen.test.tsx
  components/
    RangeBar.tsx
    RangeBar.test.tsx
```

---

*Testing analysis: 2026-05-24*
