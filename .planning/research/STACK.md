# Stack Research: Vitalspan v2

**Project:** Vitalspan
**Researched:** 2026-05-30
**Base:** Expo SDK ~54 (expo 54.0.0, react-native 0.81.5, react 19.1.0)

---

## Audit: What Is Already Installed

Before listing what to add, here is what the v2 milestone needs that already exists in `package.json` and does NOT need to be installed:

| Need | Already Present | Version |
|------|----------------|---------|
| SVG icons throughout the app | `react-native-svg` | 15.12.1 |
| Read `.env` vars in JS code | `expo-constants` | ~18.0.13 |
| `.env` file with Supabase secrets | `.env` exists with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` | — |
| Reanimated (for animated UI) | `react-native-reanimated` | ~4.1.1 |

**Nothing needs to change** for SVG icons (already at the right version), environment variables (already using `EXPO_PUBLIC_` prefix, which is Expo's native zero-config env var system since SDK 49), or design tokens (pure TypeScript additions to `src/theme/index.ts`, no library).

---

## New Dependencies

### @supabase/supabase-js

- **Purpose:** Supabase client for database queries (biomarker reference data table, exercise database), user auth (email/password), and user biomarker history sync. This is the only new runtime package v2 needs.
- **Version:** `^2.49.0` — Supabase JS v2 is the current stable line. v2.x is the correct major for Expo React Native; v1.x is EOL. As of mid-2025, v2.49+ is the stable release. [MEDIUM confidence — confirmed from training data and Supabase's documented v2 stable track; could not verify the exact latest patch via live fetch due to tool restrictions. Use `npm install @supabase/supabase-js@latest` to get the most current v2 patch.]
- **Install:**
  ```
  npm install @supabase/supabase-js
  ```
- **Peer requirements for React Native:** Supabase JS v2 requires two polyfills that the browser provides natively but React Native does not:
  1. **`react-native-url-polyfill`** — polyfills the `URL` global, which `@supabase/supabase-js` calls internally for URL parsing. Without it, auth deep links and storage URLs silently fail.
  2. **`@react-native-async-storage/async-storage`** — already installed at `2.2.0`. Used as the storage adapter for the Supabase auth session so the JWT persists across app restarts.
- **Install all at once:**
  ```
  npm install @supabase/supabase-js react-native-url-polyfill
  ```
- **Config changes:**

  **1. Root entry file — import polyfill first**

  In `node_modules/expo/AppEntry.js` the actual entry is `App.tsx` (or wherever `registerRootComponent` is called). Add this as the **very first line** of your app's entry point (typically `App.tsx` or a dedicated `src/lib/supabase.ts` that is imported before anything else):

  ```typescript
  // Must be the first import — before @supabase/supabase-js
  import 'react-native-url-polyfill/auto';
  ```

  The `/auto` suffix installs the polyfill globally without any additional calls.

  **2. `src/lib/supabase.ts` — client singleton**

  Create this file:

  ```typescript
  import 'react-native-url-polyfill/auto';
  import { createClient } from '@supabase/supabase-js';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,  // required for React Native — no browser URL bar
    },
  });
  ```

  Import `supabase` from this file everywhere. Never call `createClient` more than once.

  **3. No metro.config.js changes needed.** The existing minimal config (`getDefaultConfig(__dirname)`) is sufficient. Supabase JS v2 does not require Metro resolver overrides for React Native.

  **4. No babel.config.js changes needed.** The existing `babel-preset-expo` + `react-native-reanimated/plugin` setup is unaffected.

  **5. No app.json changes needed.** `EXPO_PUBLIC_` vars do not require the `extra:` block or `expo-constants` lookup — see `.env Setup` section below.

- **Verified:** Supabase JS v2 + AsyncStorage adapter + `react-native-url-polyfill` is the documented React Native integration pattern from Supabase's official Expo tutorial. The `detectSessionInUrl: false` flag is required for all React Native targets (Supabase docs explicitly call this out). MEDIUM confidence — based on Supabase official documentation patterns known at training cutoff; live fetch was unavailable.

---

## What NOT to Add

### `@supabase/realtime-js` separately
Do not install this standalone. It ships inside `@supabase/supabase-js`. Adding it separately causes version mismatches between the realtime client and the main client.

### `babel-plugin-dotenv` or `react-native-dotenv`
Do not add these. The project already uses `EXPO_PUBLIC_` prefix, which is Expo's native zero-config environment variable system. These babel plugins are for projects not using the `EXPO_PUBLIC_` prefix system, and adding them alongside it creates double-processing and confusion about which system takes precedence.

### `react-native-svg-transformer`
Do not add this. The project uses `react-native-svg` components in TypeScript (`<Svg>`, `<Path>`, `<Circle>`, etc.), not raw `.svg` file imports. The transformer is only needed if you want to `import Icon from './icon.svg'` as a component. Since SVG icons for this app will be authored as TypeScript components (matching the existing codebase style), the transformer adds complexity with no benefit.

### `@supabase/postgrest-js` separately
Ships inside `@supabase/supabase-js`. Do not install separately.

### `graphql` as a direct dependency
The lock file already has `@0no-co/graphql.web` as a transitive peer. Do not add `graphql` directly. Supabase does not require it for the REST/realtime API used in this project.

### Any ORM (Prisma, Drizzle)
Supabase exposes a typed REST API via `@supabase/supabase-js`. Adding an ORM on top of Supabase from a React Native client adds zero benefit and significant bundle size.

---

## .env Setup for Expo

**How `EXPO_PUBLIC_` vars work in Expo SDK 49+:**

The `.env` file already exists and already has the correct keys:
```
EXPO_PUBLIC_SUPABASE_URL=https://PROJECT-REF-REDACTED.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Expo's bundler (Metro) reads `.env` automatically and injects any variable prefixed with `EXPO_PUBLIC_` into the JavaScript bundle as `process.env.EXPO_PUBLIC_*`. No plugin, no babel transform, no `expo-constants` lookup required.

**Access pattern in code:**
```typescript
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;    // string | undefined
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // string | undefined
```

**Security model:** Variables prefixed `EXPO_PUBLIC_` are intentionally public — they are embedded in the JS bundle and visible to anyone who decompiles the app. This is correct and acceptable for the Supabase anon key. The anon key is designed to be public; Row Level Security (RLS) on Supabase tables is what controls what an anonymous caller can access. Never put the Supabase `service_role` key in `.env` — that key bypasses RLS and must stay server-side only.

**For EAS builds (TestFlight):** Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to EAS secrets via the Expo dashboard or `eas secret:create`. The `.env` file is for local development only and should remain in `.gitignore`.

**Do NOT use `expo-constants` for these vars.** The `expo-constants` + `app.config.js` `extra:` pattern is the older approach for non-`EXPO_PUBLIC_` vars. Since the project already uses `EXPO_PUBLIC_`, `expo-constants` is not needed for Supabase secrets. `expo-constants` remains useful for reading `extra.eas.projectId` and other EAS-specific metadata, which it already does.

**Do NOT convert app.json to app.config.js** just for this. The `app.json` + `EXPO_PUBLIC_` combination is complete and correct as-is.

---

## Migration Notes

**AsyncStorage remains the source of truth for offline resilience.** Per the PROJECT.md constraint: "AsyncStorage keys are preserved for offline resilience even as Supabase sync is added." This is the correct architecture.

**Dual-write pattern for biomarker history sync:**
```
Write to AsyncStorage first (fast, offline-safe)
  → then fire-and-forget write to Supabase
  → on app start, if Supabase auth session exists, pull latest from Supabase and merge into AsyncStorage
```
Never make UI updates wait on Supabase round-trips. AsyncStorage reads are synchronous-feeling; Supabase reads add network latency.

**Supabase auth and existing AsyncStorage user profile:**
The existing `@vitalspan_user_profile` key stores name, age, sex, goal, conditions, medications. When a user signs in with Supabase auth:
- The Supabase user UUID becomes the foreign key for their biomarker history in the database.
- The `@vitalspan_user_profile` data can optionally be synced to a `user_profiles` Supabase table, but this is not required for v2.
- Do not replace `@vitalspan_user_profile` with Supabase as the primary store — offline resilience requires AsyncStorage as the authoritative local layer.

**No schema migration risk.** Supabase tables (biomarker reference data, exercise database, user biomarker history) are additive — they do not alter any existing AsyncStorage keys or local data structures.

**TypeScript types for Supabase tables:** Generate with:
```
npx supabase gen types typescript --project-id PROJECT-REF-REDACTED > src/types/supabase.ts
```
This requires the Supabase CLI (`npm install -g supabase`). Do this after tables are created in the Supabase dashboard. The generated types feed into `createClient<Database>(url, key)` for fully typed query results.

**PhenoAge formula fix:** Zero new packages. This is a pure TypeScript math correction in `src/lib/phenoAge.ts`. No library installs, no config changes.

**Design tokens (warm beige/cream system):** Zero new packages. Pure additions to `src/theme/index.ts`. The existing theme structure (`Colors`, `Spacing`, `Typography`, `Radius`) is extended with new color constants. No library installs.

---

## Complete Install Command

The entire v2 stack addition is one install:

```
npm install @supabase/supabase-js react-native-url-polyfill
```

Everything else (`react-native-svg`, `expo-constants`, `.env`, design tokens, PhenoAge fix) already exists or requires no new packages.
