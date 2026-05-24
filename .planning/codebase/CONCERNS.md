# Codebase Concerns

**Analysis Date:** 2026-05-24

## Tech Debt

**HealthKit integration is entirely mocked:**
- Issue: `expo-health` is not installed. The entire HealthKit layer in `src/lib/healthkit.ts` generates random data and simulates permission dialogs via `Alert`. The `requestHealthKitPermissions()` function immediately resolves `granted: true` without ever calling a real native API. Users see a "Connected" state backed by `Math.random()`.
- Files: `src/lib/healthkit.ts`
- Impact: Any real HRV, sleep, or VO₂ max data path is untested. Switching to real HealthKit will require touching every screen that reads `isDemoMode`.
- Fix approach: `npx expo install expo-health && npx expo run:ios`, then replace the mock blocks in `healthkit.ts` with the commented-out real implementations already present in that file.

**`__DEV__` hardcoded to `true` in production-shipped code:**
- Issue: `src/screens/SettingsScreen.tsx` line 24 declares `const __DEV__ = true;` which permanently enables the developer-only "Dev Tools" section (Reset Onboarding, Export Data) for all users including App Store builds.
- Files: `src/screens/SettingsScreen.tsx:24`
- Impact: All users see internal debug controls in Settings. Could confuse users and creates a minor data-privacy surface (raw JSON export of all profile + biomarker data via iOS Share sheet with no authentication gate).
- Fix approach: Remove the local declaration; React Native provides `__DEV__` as a global that is `false` in release builds automatically.

**`UserProfile` interface defined independently in four screens:**
- Issue: Four screens each declare their own local `UserProfile` interface with different field sets. `LongevityScoreScreen.tsx:77` has `{ name?: string; age?: number }`. `ProfileScreen.tsx:15` has the full type with `sex`, `goal`, `conditions`, `medications`, `biologicalAge`, `onboardingComplete`. `DashboardScreen.tsx:23` and `ProtocolScreen.tsx:20` use intermediate variants.
- Files: `src/screens/LongevityScoreScreen.tsx:77`, `src/screens/ProfileScreen.tsx:15`, `src/screens/DashboardScreen.tsx:23`, `src/screens/ProtocolScreen.tsx:20`
- Impact: Any change to the stored profile shape must be replicated in 4 places. Screens that use the narrow type silently ignore fields like `conditions` that could affect UX logic.
- Fix approach: Extract a canonical `UserProfile` type to `src/types/index.ts` (or `src/data/profile.ts`) and import it everywhere.

**`StoredEntry` and `CustomSupplement` exported from screen files:**
- Issue: `StoredEntry` is defined in `src/screens/BiomarkerEntryScreen.tsx:34` and imported by `DashboardScreen`, `BiomarkerDetailScreen`, `LabUploadScreen`, and `LongevityScoreScreen`. `CustomSupplement` lives in `src/screens/ProtocolScreen.tsx:28`. Domain types that are used across the app should not live in screen files.
- Files: `src/screens/BiomarkerEntryScreen.tsx:34`, `src/screens/ProtocolScreen.tsx:28`
- Impact: Creates upward/lateral imports between screen files. Importing a full screen module to get a type pulls in all its side-effects and component code.
- Fix approach: Move `StoredEntry`, `CustomSupplement`, and related types to `src/types/` or `src/data/`.

**`react-native-chart-kit` installed but never used:**
- Issue: `package.json` lists `react-native-chart-kit: ^6.12.0` as a dependency but no import of it exists anywhere in `src/`.
- Files: `package.json:29`
- Impact: Adds bundle weight and a dependency update surface for zero benefit. The trend chart feature is marked "next" in CLAUDE.md.
- Fix approach: Remove until the trend chart feature is implemented.

**`Biomarker.history` uses hardcoded static data:**
- Issue: Every `Biomarker` in `src/data/biomarkers.ts` has a `history: { date: string; value: number }[]` field populated with hardcoded demo values (e.g. ApoB history from May 2025–Apr 2026). `BiomarkerDetailScreen` reads `AsyncStorage` for real entries but the `history` field on the type is never cleared or overridden. The `defaultVal` and `prevVal` fields are also static.
- Files: `src/data/biomarkers.ts`, `src/screens/BiomarkerDetailScreen.tsx`
- Impact: Static fields bloat the static data module. If any screen ever reads `.history` directly from the BIOMARKERS constant instead of `AsyncStorage`, it will show fabricated historical data as if real.
- Fix approach: Remove `history`, `defaultVal`, and `prevVal` from the `Biomarker` type; all historical data should come exclusively from `AsyncStorage`.

**No centralized AsyncStorage key registry:**
- Issue: Storage key strings (`@vitalspan_user_profile`, `@vitalspan_biomarkers`, etc.) are hard-coded as raw string literals in 7+ files. `SettingsScreen.tsx:15` has its own `ALL_STORAGE_KEYS` array that could drift from the actual keys used elsewhere.
- Files: `src/screens/DashboardScreen.tsx`, `src/screens/ProtocolScreen.tsx`, `src/screens/LongevityScoreScreen.tsx`, `src/screens/BiomarkerEntryScreen.tsx`, `src/screens/SettingsScreen.tsx`, `src/lib/healthkit.ts`
- Impact: A typo in any key string causes silent data loss (AsyncStorage returns null for unknown keys). Renaming a key requires a grep-and-replace across the whole codebase.
- Fix approach: Create `src/data/storageKeys.ts` with exported constants; import everywhere.

**Photo OCR stub in LabUploadScreen:**
- Issue: `src/screens/LabUploadScreen.tsx:57` accepts image selection from the photo library, then immediately shows an alert: "Text recognition from photos is coming soon." The feature is visually present and fully navigable but does nothing.
- Files: `src/screens/LabUploadScreen.tsx:52-63`
- Impact: Users who tap "Upload photo" get a dead-end UX that just dismisses back. If not removed, it must be labelled as "coming soon" more visibly, or the button should be hidden.
- Fix approach: Either hide the photo upload button until OCR is implemented, or replace the flow with a clear "Coming soon" disabled state rather than a functional-looking button.

## Known Bugs

**`inflammation` orbital metric is always empty:**
- Symptoms: The Longevity Score orbital visualization has an "Inflam." node that always shows empty, even when the user has logged hsCRP.
- Files: `src/screens/LongevityScoreScreen.tsx:104-105`, `dataValue()` function
- Trigger: `dataValue()` returns `null` unconditionally for `'inflammation'` with a comment "derived from biomarkers, handled elsewhere" — but no other code path populates it. The `METRIC_EMPTY` map shows "Log hsCRP" as the CTA even when hsCRP is logged.
- Workaround: None. hsCRP from AsyncStorage is never mapped to the inflammation orbital.

**PhenoAge computation duplicated between Dashboard and LongevityScore:**
- Symptoms: `DashboardScreen` and `LongevityScoreScreen` each independently re-run the `entryMap` build loop and `computePhenoAge()` call. Both also fire `console.log` debug statements on every render cycle of the screen.
- Files: `src/screens/DashboardScreen.tsx:87-108`, `src/screens/LongevityScoreScreen.tsx:203-217`
- Trigger: Any re-render of either screen, or `useFocusEffect` re-fire.
- Impact: Two `console.log('[PhenoAge]...')` and two `console.log('[LongevityScore/Dashboard]...')` calls run every time these screens are visited, polluting the log in production. Computation is duplicated rather than shared via a hook.

**`ProtocolScreen` `loadData` drops all errors silently:**
- Symptoms: If AsyncStorage fails during `loadData`, the catch is `.catch(console.error)` — the UI stays in whatever previous state it was, with no user-facing error.
- Files: `src/screens/ProtocolScreen.tsx:291`, `src/screens/ProtocolScreen.tsx:295`
- Trigger: Storage corruption or low-memory device.

**`LongevityScoreScreen` animation `useEffect` has empty dependency array but references shared values:**
- Symptoms: Animation shared values (`rotation`, `spherePulse`, etc.) are started in a `useEffect([], [])`. In Reanimated 4 with strict mode, accessing a shared value created outside the effect inside an effect with empty deps may produce stale-closure warnings.
- Files: `src/screens/LongevityScoreScreen.tsx:177-190`
- Impact: Low risk in practice because shared values are stable references, but this pattern violates the rules enforced by react-hooks/exhaustive-deps linting (if it were configured).

**`LabUploadScreen.save()` calls `JSON.parse` outside try-catch:**
- Symptoms: Line 73-74 calls `JSON.parse((await AsyncStorage.getItem(...)) ?? '[]')` without a surrounding try-catch. If storage returns malformed JSON, the function throws an unhandled rejection.
- Files: `src/screens/LabUploadScreen.tsx:73-74`
- Trigger: Corrupted AsyncStorage entry for `@vitalspan_biomarkers`.

## Security Considerations

**Raw health data export with no authentication gate:**
- Risk: `SettingsScreen.handleExportData()` reads all AsyncStorage keys including full profile (name, age, sex, conditions, medications) and all biomarker readings, then passes the JSON blob to `Share.share()`. No biometric or password confirmation is required.
- Files: `src/screens/SettingsScreen.tsx:114-128`
- Current mitigation: None. The developer section (`__DEV__ = true`) exposes this to all users.
- Recommendations: Guard the export behind Face ID / device passcode using `expo-local-authentication`. At minimum, require a confirmation step explaining what is being shared.

**`__DEV__` hard-coded means all users see dev controls:**
- Risk: All App Store users can tap "Reset Onboarding" and "Export Data" in Settings.
- Files: `src/screens/SettingsScreen.tsx:24`
- Recommendations: Remove local `__DEV__` override (see Tech Debt section).

## Performance Bottlenecks

**`NeuralGrid` SVG rendered on every screen:**
- Problem: `src/components/NeuralGrid.tsx` generates a dense animated SVG grid rendered behind every primary screen. At `intensity="high"` (used on LongevityScoreScreen), this involves many animated `Line` elements running with `withRepeat`/`withSequence`. On older devices this may drop frames when combined with the sphere rotation and pulse animations also on LongevityScoreScreen.
- Files: `src/components/NeuralGrid.tsx`, `src/screens/LongevityScoreScreen.tsx:382`
- Cause: Multiple heavy Reanimated animations layered on a single screen.
- Improvement path: Memoize the static SVG layer; only animate opacity/color, not geometry. Consider reducing grid density on non-flagship devices via `Platform` + device capability check.

**`Dimensions.get('window')` called at module load time in three files:**
- Problem: `NeuralGrid.tsx:15`, `FutureSelf.tsx:31`, and `LongevityScoreScreen.tsx:51` compute `W`/`H` at module initialization. These values won't update if the device rotates or if the app runs on a foldable.
- Files: `src/components/NeuralGrid.tsx:15`, `src/components/FutureSelf.tsx:31`, `src/screens/LongevityScoreScreen.tsx:51`
- Cause: Module-level `const` instead of `useWindowDimensions()` hook.
- Improvement path: Replace with `useWindowDimensions()` inside the component function, or add a `Dimensions.addEventListener('change', ...)` listener.

**All biomarker entries stored as a flat unsorted array:**
- Problem: `@vitalspan_biomarkers` is a single flat `StoredEntry[]`. Every screen that needs the latest reading per biomarker does its own full O(n) scan with a `Map` build. With many entries over time this degrades linearly.
- Files: `src/screens/DashboardScreen.tsx:87-94`, `src/screens/BiomarkerDetailScreen.tsx:59-70`, `src/screens/LongevityScoreScreen.tsx:205-208`
- Cause: No normalized data layer; raw array directly from AsyncStorage.
- Improvement path: Acceptable for current scale (personal health data, unlikely to exceed a few hundred entries). Will need addressing before Supabase migration.

## Fragile Areas

**`labParser.ts` PDF extraction is a naive byte-string scan:**
- Files: `src/lib/labParser.ts`
- Why fragile: `extractTextFromPDF()` converts the raw PDF byte array to a string via `String.fromCharCode` then regex-matches parenthesis-enclosed strings. This only works for unencrypted, uncompressed PDFs where text streams are stored as literal parenthesis-delimited strings. Modern PDFs (PDF 1.5+) use compressed object streams, and this approach will extract nothing or garbage. The function silently returns an empty array if no patterns match, which the UI treats as "no results" rather than a parsing failure.
- Safe modification: Any improvement to lab PDF parsing requires a real PDF parsing library (e.g., `pdf-parse` or a WASM-based parser). The current implementation cannot be incrementally improved.
- Test coverage: None.

**`ProtocolScreen` interaction detection uses partial string matching:**
- Files: `src/screens/ProtocolScreen.tsx:372-416`
- Why fragile: `medInteractionMap` checks whether `med.toLowerCase().includes(inter.drug.toLowerCase())`. This means a medication named "Aspirin Cardio" matches "Aspirin" but also means any drug name that is a substring of another will false-match. Drug class matching (`inter.drug.toLowerCase() === drugEntry.drugClass.toLowerCase()`) requires an exact class-name string match between `INTERACTIONS` entries and `MEDICATION_DATABASE` entries, which are maintained independently with no schema enforcement.
- Safe modification: Any new interaction entry must use drug names and class names that exactly match the strings already in `MEDICATION_DATABASE`. A mismatch causes silent miss (no warning shown).
- Test coverage: None.

**`OnboardingScreen.finish()` has no try-catch:**
- Files: `src/screens/OnboardingScreen.tsx:76-89`
- Why fragile: If `AsyncStorage.setItem` throws, the user sees a crash rather than a graceful error. The navigation reset to `Main` happens immediately after the write, so a partial save would leave the user in the main app with no profile.
- Safe modification: Wrap in try-catch and show `Alert.alert` on failure.

**`BiomarkerEntryScreen` ID generation not guaranteed unique:**
- Files: `src/screens/BiomarkerEntryScreen.tsx:98`
- Why fragile: `id: \`${Date.now()}-${Math.random().toString(36).slice(2, 7)}\`` — if two entries are saved in rapid succession (or in the same millisecond), `Date.now()` is identical and the 5-char random suffix has a 1-in-36^5 collision chance. Not critical for a personal health app but creates untestable IDs.

## Scaling Limits

**AsyncStorage as sole persistence layer:**
- Current capacity: Handles personal-scale data (a few hundred biomarker entries, one user profile).
- Limit: AsyncStorage is not designed as a database. Full-scan reads on every screen focus event will degrade as history grows. No indexing, no query capability.
- Scaling path: Supabase integration (listed as priority 5 in CLAUDE.md). The flat JSON schemas are straightforward to migrate.

**No pagination on biomarker history:**
- Current capacity: `BiomarkerDetailScreen` loads all `StoredEntry[]` from storage and renders every history row for the selected biomarker.
- Limit: A user with years of daily readings for a biomarker will have an unbounded list with no virtualization.
- Scaling path: Add `FlatList` with pagination when implementing the trend chart (priority 2).

## Dependencies at Risk

**No ESLint or Prettier configuration:**
- Risk: Zero static analysis beyond TypeScript `strict` mode. No enforcement of the coding rules in CLAUDE.md (no inline styles, no hardcoded colors, etc.). The one `any` usage in `PlaceholderScreens.tsx` and multiple hardcoded hex colors in `LongevityScoreScreen.tsx` and `FutureSelf.tsx` would be caught by `@typescript-eslint/no-explicit-any` and a custom no-hardcoded-colors rule.
- Impact: Convention drift will compound as more features are added.
- Migration plan: Add `eslint`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `prettier`. The CLAUDE.md conventions are already well-defined and translate directly to ESLint rules.

**`react-native-worklets 0.5.1` paired with `react-native-reanimated ~4.1.1`:**
- Risk: `react-native-worklets` is a peer dependency of Reanimated. Pinning to `0.5.1` while using a `~` range for Reanimated (`~4.1.1`) risks a minor version mismatch if Reanimated bumps its worklets peer requirement.
- Impact: Animation breakage in production builds; errors typically only surface on `expo run:ios`, not in Expo Go.
- Migration plan: Keep worklets version in sync with whatever Reanimated specifies as its peer. Check on each Reanimated upgrade.

**`expo ~54.0.0` with `react 19.1.0`:**
- Risk: Expo 54 officially supports React 18. React 19 is ahead of the stable Expo SDK support matrix. This combination may cause issues with Expo module compatibility, particularly for modules that use internal React APIs.
- Impact: May produce warnings or subtle bugs in modules that check `React.version`. TestFlight / EAS builds may flag this.
- Migration plan: Monitor Expo SDK 55 release (expected mid-2026) which will formally support React 19.

## Missing Critical Features

**No push notifications implementation:**
- Problem: Protocol reminders, biomarker logging nudges, and weekly report notifications are surfaced in the Settings UI (toggles for notifications and weekly report exist in `SettingsScreen`) but `expo-notifications` is not installed and the toggles are stateful but non-functional.
- Files: `src/screens/SettingsScreen.tsx:59-70`
- Blocks: The medication adherence tracking use case — the core clinical value proposition depends on timely reminders.

**Unit system toggle is non-functional:**
- Problem: `SettingsScreen` has a `unitSystem` state toggle between `'metric'` and `'imperial'` with haptic feedback, but the value is never persisted to AsyncStorage and never read by any biomarker display screen.
- Files: `src/screens/SettingsScreen.tsx:61`, `src/screens/SettingsScreen.tsx:73-76`
- Blocks: Users in the US cannot enter biomarker values in familiar units (the mmol/L conversion exists for glucose/HbA1c in `BiomarkerEntryScreen`, but this is independent of the settings toggle).

## Test Coverage Gaps

**Zero test files exist:**
- What's not tested: The entire codebase — all screens, all hooks, all library functions including the Levine PhenoAge formula, the lab PDF parser, the interaction checker logic, and all AsyncStorage read/write flows.
- Files: All of `src/`
- Risk: The PhenoAge formula (`src/lib/phenoAge.ts`) implements a published clinical formula with specific coefficients. A transcription error would silently produce wrong biological age numbers for users. The interaction checker (`src/screens/ProtocolScreen.tsx:372-416`) is pharmacist-verified clinical content — a matching bug could fail to warn users about dangerous drug-supplement combinations.
- Priority: High for `src/lib/phenoAge.ts` (pure function, easily unit-tested) and `src/lib/labParser.ts` (regex matching, high false-negative risk). Medium for `src/screens/ProtocolScreen.tsx` interaction logic.

---

*Concerns audit: 2026-05-24*
