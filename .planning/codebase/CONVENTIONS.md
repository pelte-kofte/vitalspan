# Coding Conventions

**Analysis Date:** 2026-05-24

## Naming Patterns

**Files:**
- Screens: `PascalCaseScreen.tsx` — `DashboardScreen.tsx`, `BiomarkerEntryScreen.tsx`, `LongevityScoreScreen.tsx`
- Components: `PascalCase.tsx` — `NeuralGrid.tsx`, `BreathingCard.tsx`, `FutureSelf.tsx`, `SupplementRow.tsx`, `RangeBar.tsx`
- Hooks: `useCamelCase.ts` — `useBreathing.ts`
- Data files: `camelCase.ts` — `biomarkers.ts`, `medications.ts`, `supplementTimings.ts`
- Library/utility: `camelCase.ts` — `phenoAge.ts`, `healthkit.ts`, `labParser.ts`

**Functions:**
- Async event handlers: `camelCase` prefixed with action noun — `handleRefresh()`, `handleConnectHealth()`, `handleExportData()`
- Internal async data loaders: `loadData()`, `loadAll()`, `loadProfile()` — wrapped in `useCallback`
- Pure helpers: plain `camelCase` — `computePhenoAge()`, `deriveHealthState()`, `buildNodes()`, `buildLinks()`
- `async function` syntax (not arrow) for named functions inside components
- Arrow functions used only for `useCallback` wrappers and inline handlers

**Variables:**
- camelCase throughout — `entryMap`, `phenoResult`, `healthState`, `takenItems`
- Short navigation alias: `const nav = useNavigation<Nav>();` (always `nav`, not `navigation`)
- Short StyleSheet alias: always `const s = StyleSheet.create({...})` at bottom of file

**Types:**
- Interfaces for component props: named `Props` (local, not exported) — `interface Props { ... }`
- Exported interfaces for shared shapes: `export interface StoredEntry`, `export interface HealthData`
- Navigation types: `type Nav = NativeStackNavigationProp<RootStackParamList>`
- String union types for constrained values: `type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night'`
- Evidence grades: `'A' | 'B' | 'C'` as string literals, not enum
- Navigation param list: `export type RootStackParamList` in `src/navigation/AppNavigator.tsx`

**Constants:**
- SCREAMING_SNAKE_CASE for module-level data constants — `BIOMARKERS`, `INTERACTIONS`, `SUPPLEMENT_DATABASE`, `MEDICATION_DATABASE`, `BASE_SUPPLEMENTS`
- SCREAMING_SNAKE_CASE for config objects — `INTENSITY_CONFIG`, `EVIDENCE_STYLE`, `TONE_COLORS`, `MMOL_CONVERTIBLE`
- Upper-camel for exported type objects — `Colors`, `Spacing`, `Radius`, `Typography`, `Gradients`, `Motion`, `Elevation`

## Code Style

**Formatting:**
- No Prettier or ESLint config files detected — style is enforced by convention and code review
- TypeScript strict mode enabled: `"strict": true` in `tsconfig.json`
- Path alias: `@/*` maps to `src/*` (defined in `tsconfig.json`) — not widely used yet, relative imports are common
- Single quotes for string literals
- Semicolons used consistently

**Linting:**
- No ESLint config present — no automated rule enforcement
- TypeScript compiler (`tsc --strict`) is the only static analysis

**StyleSheet:**
- Always named `s`: `const s = StyleSheet.create({ ... })`
- Always placed at the bottom of the file, after the component export
- Never use inline styles except for dynamic values tied to runtime variables — `{ color: someVar }`, `{ left: markerLeft }`
- All colors from `Colors.*` — no hardcoded hex values in `StyleSheet.create()` blocks
- Exception: gradient color arrays use hex literals where required by `LinearGradient` type coercion (`'#0A1628'`)

## Import Organization

**Order (consistent across all files):**
1. React and React Native core — `import React, { useState, useMemo, useCallback } from 'react'` / `import { View, Text, ... } from 'react-native'`
2. Navigation packages — `@react-navigation/native`, `@react-navigation/native-stack`
3. Expo packages — `expo-linear-gradient`, `expo-haptics`, `@react-native-async-storage/async-storage`
4. Third-party (SVG, animation) — `react-native-svg`, `react-native-reanimated`
5. Internal theme — `import { Colors, Spacing, Radius, Typography } from '../theme'`
6. Internal data — `import { BIOMARKERS, INTERACTIONS } from '../data/biomarkers'`
7. Internal navigation types — `import { RootStackParamList } from '../navigation/AppNavigator'`
8. Internal screens (cross-imports) — `import { StoredEntry } from './BiomarkerEntryScreen'`
9. Internal components — `import NeuralGrid from '../components/NeuralGrid'`
10. Internal lib/hooks — `import { computePhenoAge } from '../lib/phenoAge'`

**Path Aliases:**
- `@/*` is configured but not used in practice — all imports use relative paths (`../theme`, `../data/biomarkers`, `../components/NeuralGrid`)

## Error Handling

**Patterns:**
- AsyncStorage reads wrapped in `try/catch` with `console.error(e)` in the catch block
- Haptics calls always fire-and-forget: `Haptics.selectionAsync().catch(() => null)` — errors silently discarded
- Async data persistence: `.catch(console.error)` chained on Promise — no user-visible error UI
- No `Alert.alert()` for errors — only used for user confirmation dialogs (e.g., data deletion in `SettingsScreen.tsx`)
- Error state is not surfaced to UI — screens show empty/loading states silently on failure
- `saving` boolean flag guards repeated submission: `if (!selected || !isValidValue || saving) return;`

**Example pattern (primary data load):**
```typescript
const loadData = useCallback(async () => {
  try {
    const [profileRaw, entriesRaw] = await Promise.all([
      AsyncStorage.getItem('@vitalspan_user_profile'),
      AsyncStorage.getItem('@vitalspan_biomarkers'),
    ]);
    if (profileRaw) setProfile(JSON.parse(profileRaw));
    if (entriesRaw) setEntries(JSON.parse(entriesRaw));
  } catch (e) {
    console.error(e);
  }
}, []);
```

## Logging

**Framework:** `console.log` / `console.error` — no structured logging library

**Patterns:**
- Debug logs use bracketed prefix format: `console.log('[Dashboard] phenoAge entryMap keys:', ...)`
- Prefixes: `[Dashboard]`, `[PhenoAge]`, `[LongevityScore]` — component/module names
- `console.error(e)` for caught exceptions — not removed from production code
- Debug `console.log` calls left in `src/lib/phenoAge.ts:76` and `src/screens/DashboardScreen.tsx:106` — not stripped

## Comments

**When to Comment:**
- JSDoc-style block comments for lib functions with non-obvious logic — `src/lib/phenoAge.ts` has full citation header
- Inline section dividers using `// ── Section name ──────` pattern for multi-step screens
- Inline comments for algorithm choices — `// Two staggered breathing phases create the illusion...`
- Status/intent comments at module top for mock/placeholder code — `src/lib/healthkit.ts` STATUS block

**JSDoc:**
- Used on exported lib functions when behavior is non-obvious: `useBreathing`, `isHealthKitAvailable`
- Not used on component props — `interface Props` is self-documenting by convention
- Scientific sources cited in file headers for medical algorithms

## Function Design

**Size:** Screen components commonly exceed 200-line limit (as defined in `CLAUDE.md`) — `LongevityScoreScreen.tsx` is 790 lines, `ProtocolScreen.tsx` is 785 lines. Sub-components are sometimes extracted inline (e.g., `AddCustomSupplementModal` inside `ProtocolScreen.tsx`).

**Parameters:** Component props via destructuring in function signature: `function BreathingCard({ children, style, glowColor = '#1C3B2A', period = Motion.breath }: Props)`

**Return Values:**
- Screens use `return (<SafeAreaView>...)` as single JSX block
- Multi-step screens use early-return pattern for step switching: `if (!selected) { return <StepOneUI /> }`
- Lib functions return typed result objects: `PhenoAgeResult`, `SyncResult`, `PermissionStatus`

## Module Design

**Exports:**
- Screens: single `export default function ScreenName()`
- Components: single `export default function ComponentName()` (or `React.memo` wrapped)
- Data files: named exports — `export const BIOMARKERS`, `export interface Biomarker`
- Lib files: named exports for all functions and interfaces — no default exports
- Hooks: named exports — `export function useBreathing()`

**Barrel Files:** Not used — no `index.ts` aggregators in `src/components/` or `src/screens/`

## Memoization Pattern

`useMemo` is used extensively for derived data computed from AsyncStorage state:
```typescript
const entryMap = useMemo(() => {
  const map = new Map<string, StoredEntry>();
  for (const e of entries) {
    const existing = map.get(e.biomarkerId);
    if (!existing || e.date > existing.date) map.set(e.biomarkerId, e);
  }
  return map;
}, [entries]);
```

`useCallback` is used for data loaders passed to `useFocusEffect`:
```typescript
const loadData = useCallback(async () => { ... }, []);
useFocusEffect(useCallback(() => { loadData(); }, [loadData]));
```

`React.memo` used on `BreathingCard` only — other components are not memoized.

## AsyncStorage Keys

All storage keys are string constants prefixed with `@vitalspan_`:
- `@vitalspan_user_profile`
- `@vitalspan_biomarkers`
- `@vitalspan_protocol`
- `@vitalspan_protocol_today`
- `@vitalspan_health_data`
- `@vitalspan_health_permissions`

Keys are written inline as string literals — no shared constants file for storage keys.

## Theme Usage

All spacing, colors, radius, and typography MUST come from `src/theme/index.ts`:
- `Colors.*` — all color values
- `Spacing.*` — all margin/padding (xs=4, sm=8, md=12, base=16, lg=20, xl=24, xxl=32)
- `Radius.*` — all borderRadius (sm=10, md=12, lg=16, xl=20, xxl=28, full=999)
- `Typography.sizes.*` — all fontSize values (xs=11, sm=12, base=14, md=15, lg=16, xl=20)
- `Motion.*` — animation durations (slow=800, medium=400, fast=200, breath=4000)
- `Elevation.*` — shadow presets (sm, md, lg)
- `Gradients.*` — gradient color tuples

---

*Convention analysis: 2026-05-24*
