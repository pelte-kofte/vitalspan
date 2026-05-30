# Pitfalls Research: Vitalspan v2

**Domain:** Brownfield Expo ~54 iOS app — adding Supabase auth/sync, SVG icons, exercise screen, theme changes
**Researched:** 2026-05-30
**Confidence:** MEDIUM-HIGH (training data + direct codebase inspection; no external fetch available)

---

## 1. Supabase session not persisting between app restarts

- **Risk:** User logs in, closes the app, reopens it — session is gone. They are silently unauthenticated. Any Supabase RLS-gated query returns an empty result set (not an error), so data appears missing rather than the error being obvious.
- **Trigger:** `createClient()` called without the `storage` option pointing to an AsyncStorage adapter. The default storage in `@supabase/supabase-js` v2 is `localStorage` (a browser API). In React Native there is no `localStorage`; the client silently falls back to in-memory storage, which is lost on every restart.
- **Prevention:** Pass the AsyncStorage adapter explicitly when constructing the client:
  ```typescript
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { createClient } from '@supabase/supabase-js';

  export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,  // REQUIRED in React Native — no URL scheme interception
    },
  });
  ```
  `detectSessionInUrl: false` is mandatory. Without it the client tries to parse `window.location` on every mount, which throws in React Native.
- **Phase at risk:** Supabase auth integration phase (any phase that adds the `createClient` call).

---

## 2. JWT expiry silently breaks synced data fetches

- **Risk:** Supabase access tokens expire after 1 hour by default. If the user leaves the app open in background for >1 hour and then returns, the next Supabase call fails with a 401. With `autoRefreshToken: true` this is usually handled automatically — but only if `AppState` change events are wired up. Without wiring, the token is not refreshed when the app returns from background.
- **Trigger:** React Native apps do not run continuous JS execution in the background the way a browser tab does. The token refresh loop pauses. If the app returns from background after the token has expired but before the refresh has fired, the next query gets a 401 that the auto-refresh cannot recover from without a manual `supabase.auth.startAutoRefresh()` call on `AppState` change.
- **Prevention:**
  ```typescript
  import { AppState } from 'react-native';

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
  ```
  Add this in the Supabase client module (singleton, not inside a component) so it runs once on module load. This is documented in the official Supabase React Native guide and is a common omission.
- **Phase at risk:** Supabase auth integration phase; also any later phase that adds background data fetching.

---

## 3. RLS policies block anonymous/unauthenticated reads — reference data silently empty

- **Risk:** Supabase tables for biomarker reference ranges and the exercise library need to be readable by unauthenticated users (or at minimum, by the anon key). If RLS is enabled on those tables without a `SELECT` policy for `anon` role, every query returns `[]` with no error thrown. The app shows empty screens that look like a data problem, not a permissions problem.
- **Trigger:** Supabase enables RLS by default on new tables. The common mistake is to set up the table, write the query, get an empty array, and spend time debugging the client — when the actual fix is a one-line SQL policy.
- **Prevention:** For reference tables (biomarker ranges, exercise library) that are read-only public data, explicitly add the policy in the Supabase dashboard before writing any client query code:
  ```sql
  CREATE POLICY "public read" ON biomarker_reference FOR SELECT TO anon USING (true);
  CREATE POLICY "public read" ON exercise_library FOR SELECT TO anon USING (true);
  ```
  For user biomarker history: `USING (auth.uid() = user_id)` — ensure the row's `user_id` column is set to `auth.uid()` on insert, otherwise rows are inserted but immediately invisible on SELECT.
- **Phase at risk:** The phase that provisions Supabase tables and writes the first data-fetching hooks.

---

## 4. Metro bundler cannot resolve `@supabase/supabase-js` without a URL polyfill

- **Risk:** Metro bundler throws a cryptic error like `Unable to resolve module 'url'` or `crypto.getRandomValues is not a function` when first importing `@supabase/supabase-js`. The app crashes on startup.
- **Trigger:** `@supabase/supabase-js` v2 depends on `cross-fetch` and the WHATWG `URL` API, neither of which exists natively in the Hermes JS engine used by React Native / Expo. Additionally, Supabase uses `crypto.getRandomValues` for generating session tokens.
- **Prevention:**
  1. Install `react-native-url-polyfill` (check Expo SDK 54 compat — it is compatible).
  2. Import it at the very top of your Supabase client file, before any Supabase import:
     ```typescript
     import 'react-native-url-polyfill/auto';
     import { createClient } from '@supabase/supabase-js';
     ```
  3. For `crypto.getRandomValues`: Expo SDK 54 with Hermes provides this via `expo-crypto`. If the polyfill import alone does not resolve it, add `import 'expo-crypto'` before Supabase imports.
  Note: `react-native-svg` 15.12.1 is already in `package.json`. Verify `react-native-url-polyfill` is not already present before adding it.
- **Phase at risk:** First phase that adds `@supabase/supabase-js` to the project.

---

## 5. .env variables accessible to client mean anon key is bundled into the binary

- **Risk:** Developer treats the `EXPO_PUBLIC_SUPABASE_ANON_KEY` as secret, believes it is hidden. In reality, any variable prefixed `EXPO_PUBLIC_` is inlined at build time into the JS bundle. The anon key is extractable from the IPA with `strings` or any bundle inspector. This creates a false sense of security — but it is the correct and only approach for Expo managed workflow with Supabase, as long as you understand what the anon key actually is.
- **Trigger:** Misunderstanding what "secret" means in this context. The `SUPABASE_SERVICE_ROLE_KEY` (the admin key that bypasses RLS) must NEVER be `EXPO_PUBLIC_`. Only the `anon` key (which has limited RLS-gated permissions) goes in the bundle.
- **Prevention:**
  - `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` — safe to bundle, intentionally public, RLS is the security layer.
  - `SUPABASE_SERVICE_ROLE_KEY` — never in the client at all. Server-side only (Edge Functions, CI, backend scripts).
  - Add `.env` and `.env.local` to `.gitignore` immediately.
  - In `app.json`/`app.config.js`, do not use `extra: { serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY }` — that path also ends up in the bundle via `expo-constants`.
  - Variable names without the `EXPO_PUBLIC_` prefix are stripped out of the bundle entirely and read as `undefined` on the client — they are not "hidden", they simply don't exist in the client bundle.
- **Phase at risk:** The phase that moves API keys from hardcoded values to `.env`.

---

## 6. Metro does not hot-reload .env changes — stale values confuse debugging

- **Risk:** Developer adds a new `EXPO_PUBLIC_` variable to `.env`, the running Metro instance does not pick it up, `process.env.EXPO_PUBLIC_SUPABASE_URL` is `undefined`, Supabase client is constructed with `undefined` URL, and all queries silently fail or throw.
- **Trigger:** Metro reads `.env` at startup, not on file change. Hot reload / Fast Refresh do not re-read `.env`.
- **Prevention:** Always restart the Metro bundler (`expo start --clear`) after any `.env` change. Never diagnose "Supabase isn't working" before confirming a full restart was done after the last `.env` edit.
- **Phase at risk:** Same as pitfall 5 — the env setup phase.

---

## 7. react-native-svg icon sizing in tab bar: icons appear clipped or oversized

- **Risk:** Custom SVG icons look correct in isolation but appear clipped, misaligned, or oversized inside the React Navigation `BottomTabNavigator` tab bar.
- **Trigger:** Two compounding issues:
  1. The SVG file's `viewBox` is not `"0 0 24 24"` (or whatever the logical design unit is). If `viewBox` is missing or set to the artboard pixel dimensions (e.g., `"0 0 512 512"`), then setting `width={24} height={24}` on the component renders the SVG at 24px but drawing a 512-unit viewport — everything is microscopic.
  2. React Navigation tab bar uses `tabBarIcon` with a `size` prop (usually 24). If the SVG component ignores the `size` prop and hardcodes its own dimensions, it will be the wrong size on different devices or when the user has large text enabled.
- **Prevention:**
  - Export SVGs from Figma/design tool with `viewBox="0 0 24 24"` (or normalize in SVGR/manual edit).
  - Wire the `size` prop through to both `width` and `height` on the root `<Svg>` element:
    ```typescript
    const DashboardIcon = ({ size = 24, color }: { size?: number; color: string }) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        ...
      </Svg>
    );
    ```
  - In the navigator: `tabBarIcon: ({ color, size }) => <DashboardIcon size={size} color={color} />`
  - Do not set `width` and `height` as attributes in the raw SVG source file — let the component control sizing.
- **Phase at risk:** The SVG tab bar icon phase.

---

## 8. react-native-svg and expo-linear-gradient conflict in Expo managed workflow

- **Risk:** Adding `react-native-svg` (for custom tab icons) alongside the existing `expo-linear-gradient` causes a native module mismatch during build, or SVG renders as a blank white box in production builds but works in Expo Go.
- **Trigger:** `react-native-svg` 15.12.1 is already listed in `package.json` (confirmed), so it is already installed. The native module is already linked. This pitfall is mostly pre-empted. However: if the project currently uses Expo Go for development and has never run `expo run:ios`, `react-native-svg` may not have been linked in a dev build. SVG components work in a development build (via `expo-dev-client`) but not in Expo Go in SDK 54 because `react-native-svg` requires native linking that Expo Go does not include by default.
- **Prevention:** Ensure all development is done via `expo run:ios` (development build), not Expo Go. Since the project already has EAS configured (per PROJECT.md), this should already be the case. Double-check: if the team is using Expo Go for iteration, switch to `expo run:ios` before adding SVG tab bar icons.
- **Phase at risk:** SVG tab bar icon phase, particularly if Expo Go is being used for development.

---

## 9. Offline-first gap: Supabase user has no account, local AsyncStorage data cannot be migrated automatically

- **Risk:** Existing TestFlight users completed onboarding and have months of biomarker history stored under `@vitalspan_*` AsyncStorage keys. When auth is added, those users sign up for a Supabase account — but there is no automatic link between their local data and their new Supabase `user_id`. Their history effectively disappears from any synced view.
- **Trigger:** The app assumes Supabase `user_id` = data owner. But pre-auth data was stored with no user ID. On first sign-in, queries like `SELECT * FROM biomarker_history WHERE user_id = auth.uid()` return empty — because nothing was ever written with that UID.
- **Prevention:**
  1. On first successful Supabase sign-in, run a one-time migration: read all `@vitalspan_biomarkers` entries from AsyncStorage and `INSERT` them into `biomarker_history` with the new `auth.uid()`. Mark migration as complete with a flag: `@vitalspan_migrated_v2`.
  2. Check for `@vitalspan_migrated_v2` at app launch. If absent and user is authenticated, trigger migration.
  3. Keep AsyncStorage as the read/write source for offline mode. Supabase is additive sync, not replacement.
  4. Migration must be idempotent — guard against running twice (deduplicate by timestamp or a stable hash).
- **Phase at risk:** The phase that adds Supabase auth and the first user data sync.

---

## 10. Offline state: network errors from Supabase crash screens that expect data

- **Risk:** On airplane mode or poor connectivity, any screen that calls `supabase.from(...).select()` throws or returns an error. If the error is not handled, the screen renders blank or crashes.
- **Trigger:** Async fetch in `useEffect` without a try/catch, or component that renders `data.map(...)` where `data` is `null` after a failed fetch.
- **Prevention:**
  - Always fall back to AsyncStorage when Supabase fetch fails:
    ```typescript
    try {
      const { data, error } = await supabase.from('biomarker_history').select();
      if (error) throw error;
      setEntries(data);
    } catch {
      const local = await AsyncStorage.getItem('@vitalspan_biomarkers');
      setEntries(local ? JSON.parse(local) : []);
    }
    ```
  - This is consistent with the PROJECT.md architecture decision: "AsyncStorage keys preserved as fallback/offline layer."
  - Null-guard all rendered arrays: `(entries ?? []).map(...)` — existing practice confirmed by prior phase fixes (see git history: `fix(03-WR-02): null-guard addedSupplements and medTimes`).
- **Phase at risk:** All phases that add Supabase data-fetching hooks.

---

## 11. Adding a new tab breaks existing navigation state on device upgrade

- **Risk:** A user who had the previous version installed (4 tabs) upgrades to the new version (5 tabs). React Navigation's persisted navigation state (if `@react-navigation/native` persistence is enabled) references tab index positions. Adding a tab shifts indices. The app may open on the wrong tab or throw a navigation state hydration error.
- **Trigger:** `@react-navigation/native` state persistence is opt-in via `initialState` prop. Vitalspan does not appear to use navigation state persistence (not visible in the codebase reading), but this should be confirmed. If persistence is NOT used (likely), this pitfall does not apply at runtime. However, adding a fifth tab still has a secondary risk: the `tabBarIcon` and `name` of the new tab must not conflict with any existing `name` prop used in `navigation.navigate('...')` calls throughout the codebase.
- **Prevention:**
  1. Confirm navigation persistence is not enabled (search for `initialState` or `linking` with `state` in `AppNavigator.tsx`).
  2. When adding the Exercise tab, audit all `navigation.navigate()` calls to ensure no existing call accidentally navigates to the new tab's name.
  3. Name the new tab consistently with the existing naming convention (check `AppNavigator.tsx` for current tab names before picking the new one).
- **Phase at risk:** The exercise screen / new tab addition phase.

---

## 12. Theme regression: adding new Colors keys or renaming existing ones breaks dark-mode screens

- **Risk:** The `Colors` object in `src/theme/index.ts` has two tiers: light (`bg`, `bgCard`, etc.) and dark (`Colors.dark.*`). The dark screens (LongevityScore orbital, dashboard dark cards) reference `Colors.dark.bg`, `Colors.dark.bgCard`, etc. Any refactor that renames or restructures the `dark` sub-object silently produces `undefined` color values — elements render transparent or default to black, which is hard to notice on a dark background.
- **Trigger:** Developer adds new keys to `Colors`, reorganizes the object for consistency with the new warm-beige scheme, or renames an existing key. TypeScript strict mode will catch direct property access on a renamed key — but only if the consuming code uses `Colors.dark.bgCard` (caught) vs. a spread or dynamic access (not caught).
- **Prevention:**
  1. Never remove or rename existing keys — only add new ones. The existing key names are effectively a public API for all existing screens.
  2. Additive-only rule: new warm-beige tokens go under new names (`bgWarm`, `bgCream`, etc.), not replacing `bg` or `bgCard`.
  3. After any theme change, run a TypeScript strict compile (`tsc --noEmit`) before committing. TypeScript will catch property access errors on renamed keys.
  4. Visually verify the LongevityScore and Dashboard screens (dark surfaces) after every theme change — they are the highest-risk consumers of `Colors.dark.*` and `Gradients.*`.
- **Phase at risk:** The UI/UX overhaul phase that introduces warm beige/cream colors.

---

## 13. Hardcoded hex values introduced during UI overhaul escape the theme system

- **Risk:** During rapid UI iteration, developers inline hex colors directly in StyleSheets (e.g., `backgroundColor: '#F5F0E8'`) rather than adding a token to `theme/index.ts`. The screen compiles and looks correct. Six weeks later, the token is needed in three other places — but the hardcoded value in the first screen is inconsistent with the token value that eventually gets added (even a 1-digit hex difference). Dark mode or brand color changes require hunting down all hardcoded values.
- **Trigger:** Speed of iteration during the UI overhaul. CLAUDE.md explicitly prohibits this (`All colors from src/theme/index.ts — never hardcode hex values in screens`), but the temptation is highest during design exploration.
- **Prevention:**
  1. Add all new warm-beige tokens to `theme/index.ts` first, before touching any screen. Agree on the names (`Colors.bgWarm`, `Colors.bgCream`, `Colors.cardSurface`) before writing screen code.
  2. Use the TypeScript compiler as a lint: every color should be `Colors.something`, never a string literal. A simple grep at PR review: `grep -r "'#" src/screens/ src/components/` catches violations.
- **Phase at risk:** UI/UX overhaul phase.

---

## 14. Supabase anon key in Expo Constants (extra field) vs. process.env — inconsistent access pattern

- **Risk:** Developer uses `Constants.expoConfig.extra.supabaseUrl` (the `app.config.js` `extra` pattern) in one file and `process.env.EXPO_PUBLIC_SUPABASE_URL` in another. Both work, but they read from different sources. If the `.env` file is missing (e.g., on a new dev machine or in CI), the `process.env` path returns `undefined` while the `extra` path might still have a hardcoded fallback. The inconsistency means debugging a misconfigured environment is confusing.
- **Trigger:** Two valid patterns exist and both look reasonable. Without a team convention, they get mixed.
- **Prevention:** Pick one pattern and use it everywhere. For Expo SDK 54 with `@supabase/supabase-js`, prefer `process.env.EXPO_PUBLIC_*` directly — it is simpler, requires no `app.config.js` changes, and has first-class Metro support in SDK 49+. Document the choice in the Supabase client file with a comment. Throw an error at module initialization if the values are missing:
  ```typescript
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase env vars — check .env file and restart Metro');
  }
  ```
  This surfaces the misconfiguration immediately instead of after a confusing runtime failure.
- **Phase at risk:** The env setup / Supabase client initialization phase.

---

## 15. Exercise screen navigation: replacing vs. adding — deep link and back-stack confusion

- **Risk:** If the existing workout/exercise tab is being replaced (not just redesigned), the old screen's name in `AppNavigator.tsx` may be referenced in other screens via `navigation.navigate('Exercise')` or similar. Renaming the screen breaks those calls silently (no TypeScript error unless typed navigation is used).
- **Trigger:** The existing screen name is used as a string literal in multiple places. React Navigation does not provide compile-time checking of screen names unless the `RootStackParamList` (or `BottomTabParamList`) type is declared and used via typed navigation hooks.
- **Prevention:**
  1. Before renaming any screen, grep for its current name: `grep -r "navigate('Exercise" src/` (adjust for actual name).
  2. Use typed navigation (`useNavigation<BottomTabNavigationProp<TabParamList>>()`) on new screens added in v2. Existing screens do not need to be migrated immediately, but new ones should use typed navigation from the start.
  3. The `TabParamList` type should be the single source of truth for screen names.
- **Phase at risk:** The exercise screen redesign / new exercise tab phase.

---

## Phase Risk Summary

| Phase Topic | Highest-Risk Pitfall | Mitigation Priority |
|-------------|---------------------|---------------------|
| Supabase client setup | AsyncStorage adapter missing (#1), URL polyfill missing (#4), env vars pattern (#14) | Must fix before any auth code |
| Auth integration | JWT expiry without AppState (#2), RLS silent empty (#3), anonymous user migration (#9) | Address in auth phase spec |
| .env / secrets | Anon key bundled — by design (#5), Metro stale env (#6) | Document in phase notes, not bugs |
| SVG tab bar icons | viewBox / size not wired through (#7), Expo Go vs dev build (#8) | Verify dev build is in use first |
| Offline data | Network error crashes (#10) | Null-guard + AsyncStorage fallback on every fetch |
| Exercise screen | Navigation name conflicts (#15), new tab index (#11) | Grep before renaming |
| Theme overhaul | Dark screen regression (#12), hardcoded hex escape (#13) | Add tokens first, screen code second |

---

**Confidence notes:**
- Pitfalls 1, 2, 5, 7, 12, 13 are HIGH confidence — well-established, documented patterns in the Supabase React Native guide and React Navigation docs, consistent with the codebase structure observed.
- Pitfalls 3, 4, 9, 10, 14 are MEDIUM-HIGH confidence — consistent with common brownfield integration issues; specific Supabase SDK version behavior may vary.
- Pitfall 11 is MEDIUM confidence — depends on whether navigation state persistence is used (not confirmed from codebase reading).
- Pitfall 8 is MEDIUM confidence — `react-native-svg` is already in `package.json` (15.12.1), suggesting it may already be linked. The Expo Go vs dev build distinction is the real risk, not the install.
