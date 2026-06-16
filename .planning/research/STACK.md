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

---

---

# Stack Research — v4.0 Additions

**Researched:** 2026-06-10
**Confidence:** HIGH (Adapty, free-exercise-db), HIGH with critical caveat (Claude API)

---

## Adapty SDK

**Package:** `react-native-adapty`
**Current version:** 3.17.1
**Peer dependency:** `react-native >= 0.73.0` — Expo SDK 54 ships RN 0.81.5, fully compatible.
**Confidence:** HIGH — verified via npm registry and Context7 docs (193 code snippets, high reputation source).

### Expo SDK 54 Compatibility

Compatible. Adapty ships an Expo config plugin (`app.plugin.js`) using `expo/config-plugins`. Add it to `app.json` alongside the existing HealthKit plugin.

**Critical constraint:** Requires a custom development build. Expo Go will not work — the SDK contains native StoreKit/IAP code. The project already runs `expo run:ios` and has EAS configured (`projectId: 4d42a8cb-bf83-4229-82a5-1b2273356a54`), so this is not a new constraint.

### Installation

```bash
npx expo install react-native-adapty
npx expo prebuild --clean          # regenerates native project with plugin
cd ios && pod install
```

### app.json plugin entry

```json
"plugins": [
  "expo-font",
  ["@kingstinct/react-native-healthkit", { ... }],
  ["react-native-adapty", { }]
]
```

### Initialization — app entry point (App.tsx or index.js)

Activate before any navigation renders. Link to the Supabase user UUID so subscription state is tied to the authenticated user:

```typescript
import { adapty, LogLevel } from 'react-native-adapty';

await adapty.activate('YOUR_PUBLIC_SDK_KEY', {
  customerUserId: supabaseUserId,          // link to existing Supabase auth user
  logLevel: LogLevel.Verbose,              // switch to LogLevel.Error in prod
  __ignoreActivationOnFastRefresh: true,   // prevents double-activation in dev
});
```

The Adapty public SDK key is safe to expose as `EXPO_PUBLIC_ADAPTY_PUBLIC_KEY` in `.env` — it is a public key by design.

### Core API for v4.0

| Method | Purpose |
|--------|---------|
| `adapty.getPaywall(placementId)` | Fetch paywall config from Adapty Dashboard |
| `adapty.getPaywallProducts(paywall)` | Get product list (price, period, trial) |
| `adapty.makePurchase(product)` | Trigger native App Store IAP sheet |
| `adapty.getProfile()` | Check `accessLevels['premium'].isActive` |
| `adapty.restorePurchases()` | Required by App Store Review Guidelines |

### Entitlement check

```typescript
const profile = await adapty.getProfile();
const isPremium = profile.accessLevels['premium']?.isActive ?? false;
```

### What to avoid

- Do not initialize Adapty inside a screen component — must activate once at app startup.
- Do not set `observerMode: true` unless you are handling StoreKit transactions yourself; default (false) gives Adapty full purchase handling.
- No Android setup needed (iOS-only project).

---

## Claude API (@anthropic-ai/sdk)

**Package:** `@anthropic-ai/sdk`
**Current version:** 0.104.1
**Confidence:** HIGH — verified via npm registry and official SDK README/MIGRATION.md via Context7.

### Critical Constraint: React Native is NOT a supported runtime

The official SDK documentation (README, Bedrock sub-package README, Vertex sub-package README) all contain this explicit statement:

> "Note that React Native is not supported at this time. If you are interested in other runtime environments, please open or upvote an issue on GitHub."

The SDK migrated to the built-in Web Fetch API with `ReadableStream`-based streaming. React Native 0.81 ships a global `fetch`, but the Hermes JS engine does not provide the full WHATWG `ReadableStream` API the SDK requires for streaming. The old `@anthropic-ai/sdk/shims/web` shim was removed (confirmed in MIGRATION.md).

This is not a version issue. It is a runtime environment issue. There is no version of `@anthropic-ai/sdk` that works correctly in React Native at time of research.

### Recommended Approach: Supabase Edge Function proxy

The project already uses Supabase. Use a Supabase Edge Function as a thin proxy. The mobile app calls the Edge Function; the function holds the Anthropic API key server-side and calls Claude. Supabase Edge Functions run on Deno, which is an officially supported `@anthropic-ai/sdk` runtime ("Deno v1.28.0 or higher").

**Architecture:**

```
Expo app
  └── supabase.functions.invoke('ai-advisor', { body: anonymizedContext })
            └── Supabase Edge Function (Deno runtime)
                      └── @anthropic-ai/sdk  (fully supported)
                                └── Claude API
```

**Edge Function (Deno, `supabase/functions/ai-advisor/index.ts`):**

```typescript
import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

Deno.serve(async (req) => {
  const { context, messages } = await req.json();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages,
  });
  return Response.json({ content: response.content[0].text });
});
```

**Mobile call (existing supabase client):**

```typescript
const { data, error } = await supabase.functions.invoke('ai-advisor', {
  body: { context: anonymizedSummary, messages: conversationHistory },
});
```

**API key placement — Supabase Secrets only:**

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

This key never touches the Expo project, never appears in `.env`, and is never bundled into the app binary.

### Streaming

Streaming from a Supabase Edge Function to React Native is technically possible via SSE, but adds substantial complexity. For the v4.0 AI report feature (structured report generation), non-streaming is the correct starting point — the round-trip is under 5 seconds for a 2k-token report. Add streaming only if follow-up chat UX demands it. The Edge Function can use `@anthropic-ai/sdk` stream API server-side and forward SSE if needed in a future phase.

### What NOT to do

- Do NOT install `@anthropic-ai/sdk` in the Expo project and call Claude directly from the app. It will fail at the streaming layer and may cause import-time crashes on Hermes.
- Do NOT put the Anthropic API key in `EXPO_PUBLIC_*` environment variables — `EXPO_PUBLIC_` variables are bundled into the JS bundle and visible in the app binary.
- Do NOT use any third-party "React Native Anthropic" wrapper library — none have significant adoption or maintenance.

---

## free-exercise-db Assets

**Repository:** `yuhonas/free-exercise-db` (note: PROJECT.md spells the owner as `yunohas` — this is a typo; the correct GitHub username is `yuhonas`)
**License:** Unlicense (public domain)
**Stars:** 1,455
**Confidence:** HIGH — verified directly from GitHub API and raw file contents.

### Asset inventory (verified)

| Metric | Value |
|--------|-------|
| Total exercises in combined JSON | 873 |
| Exercises with images | 873 (100%) |
| Image format | JPG only — no GIFs, no WebP |
| Images per exercise | Always exactly 2 (start + end position) |
| Total images | ~1,746 JPGs |
| Repo size | ~97 MB (full repo including all images) |
| Combined JSON | `dist/exercises.json` — ~1 MB, one file, 873 exercises |

PROJECT.md references "GIF/photo assets" — there are no GIFs in this repository. All assets are static JPGs.

### Schema (verified against live data)

```json
{
  "id": "Barbell_Deadlift",
  "name": "Barbell Deadlift",
  "category": "strength",
  "equipment": "barbell",
  "primaryMuscles": ["hamstrings"],
  "images": ["Barbell_Deadlift/0.jpg", "Barbell_Deadlift/1.jpg"]
}
```

### Exercise categories in the database

| Category | Count |
|----------|-------|
| strength | 581 |
| stretching | 123 |
| plyometrics | 61 |
| powerlifting | 38 |
| olympic weightlifting | 35 |
| strongman | 21 |
| cardio | 14 |

### Overlap with Vitalspan's exercise database

Vitalspan has ~60 exercises with longevity notes, form cues, and muscle maps. Spot-check of 17 Vitalspan exercise names against free-exercise-db found 5 exact name matches: Barbell Shrug, Dumbbell Incline Row, Barbell Deadlift, Plyo Push-Up, Janda Sit-Up. The databases use different naming conventions (Vitalspan uses descriptive names, free-exercise-db uses more standardized names). A fuzzy/manual name-to-ID mapping layer is required — direct string equality will miss most matches.

### Recommended consumption: Remote CDN via raw.githubusercontent.com

The README explicitly documents this pattern:

```
https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{ImagePath}
```

Example: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg`

**Why remote, not bundled:**
- 97 MB of JPGs bundled into the binary exceeds App Store OTA download limits and inflates install size unacceptably
- Only ~60 exercises in Vitalspan need photos — approximately 120 JPGs at ~38 KB average = ~5 MB, loaded lazily and cached on first view
- Remote is the pattern the free-exercise-db README documents and the pattern used by its own reference frontend

**Recommended image component:** `expo-image` (not React Native's built-in `<Image>`) — persistent disk cache, `cachePolicy="disk"`, progressive loading, WebP transcoding if needed. Install with `npx expo install expo-image`.

### Integration pattern

1. Fix the typo in PROJECT.md: `yunohas` → `yuhonas`
2. Add `photoBaseUrl?: string` (or derive it from a mapped free-exercise-db ID) to the `Exercise` type in `src/data/exercises.ts`
3. Build a one-time mapping script or static JSON: normalize Vitalspan exercise names to free-exercise-db IDs (handle casing and naming variation), output a map of `vitalspan_id → free_exercise_db_id`
4. On exercise detail/card, render `<Image source={{ uri: freeExerciseDbUrl }} />` with SVG illustration fallback where no match exists
5. Do NOT download `dist/exercises.json` at runtime — use the pre-built static mapping; the 1 MB JSON is unnecessary overhead if only ~60 exercises are needed

### CDN reliability note

`raw.githubusercontent.com` is rate-limited (no SLA) and has occasional availability issues. For MVP this is acceptable. If exercise photos become a critical UX path, mirror the ~120 JPGs to Supabase Storage or a CDN in a follow-up phase. The architecture (URL in data layer, component rendering from URL) makes this swap trivial.

---

## v4.0 Install Summary

### Install these

```bash
npx expo install react-native-adapty      # Adapty SDK — IAP/subscriptions
npx expo install expo-image               # Better image caching for remote exercise photos
npx expo prebuild --clean                 # Regenerate native project with Adapty plugin
cd ios && pod install
```

### Do NOT install

| Package | Reason |
|---------|--------|
| `@anthropic-ai/sdk` (in Expo project) | React Native explicitly unsupported — use Supabase Edge Function proxy instead |
| Any RN Anthropic wrapper | No production-grade options exist |
| RevenueCat | Replaced by Adapty per PROJECT.md decision |

### New environment variables

| Variable | Where | Value |
|----------|-------|-------|
| `EXPO_PUBLIC_ADAPTY_PUBLIC_KEY` | `.env` + EAS Secrets | Adapty public SDK key (safe to expose) |
| `ANTHROPIC_API_KEY` | Supabase Secrets only | Never in Expo `.env` |

### Phase ordering constraint

The Supabase Edge Function for Claude must be deployed and tested before the AI Advisor screen can be built. Adapty and exercise photos are independent and can be built in any order relative to each other and to the Edge Function.

---

---

# Stack Research — v5.0 Additions

**Researched:** 2026-06-16
**Confidence:** HIGH (expo-notifications, chart decision), MEDIUM (drag-to-reorder), HIGH (date utilities)
**Base:** Confirmed from live package.json — expo ~54.0.35, react-native 0.81.5, react-native-reanimated ~4.1.1, react-native-gesture-handler ~2.28.0, react-native-svg 15.12.1, react-native-chart-kit ^6.12.0 already installed.

---

## Audit: What Is Already Installed for v5.0

| v5.0 Need | Already Present | Version | Action |
|-----------|----------------|---------|--------|
| Chart rendering for sparklines | `react-native-chart-kit` | ^6.12.0 | USE — already there, no install needed |
| SVG canvas for custom charts | `react-native-svg` | 15.12.1 | USE — peer dep for chart-kit |
| Gesture recognition for drag | `react-native-gesture-handler` | ~2.28.0 | USE — already there |
| Animation engine for drag/charts | `react-native-reanimated` | ~4.1.1 | USE — already there |
| Worklets for reanimated 4 | `react-native-worklets` | 0.5.1 | USE — required peer for reanimated 4 |

**The chart library question is already answered by what's installed.** `react-native-chart-kit` is in the project. Victory-native would require adding `@shopify/react-native-skia` (~2.2.x) as a new native dependency, which requires a full prebuild cycle. Do not add Skia just for charts when chart-kit already covers the sparkline use case with the existing `react-native-svg` stack.

---

## Decision: Chart Library — Use react-native-chart-kit (Already Installed)

**Recommendation: Do not add victory-native. Use react-native-chart-kit for all v5.0 chart needs.**

### Why chart-kit over victory-native for this project

victory-native (v41.x) requires `@shopify/react-native-skia` (~2.2.x) as a mandatory native peer dependency. This means:
- One additional native module requiring `npx expo prebuild --clean` + `pod install`
- `@shopify/react-native-skia` is a GPU-canvas renderer — significant binary size addition (~8 MB) for charts that are a secondary feature, not the app's core
- A reported peer dependency conflict between victory-native@41 and @shopify/react-native-skia v2.x was open as recently as mid-2025 (GitHub issue #616, FormidableLabs/victory-native-xl). The peer range `>=1.2.3 <3.0.0` technically allows v2.2.x but real-world issues surfaced at that boundary.
- Reanimated 4.1.1 (already installed) is compatible with victory-native's peer dep, but the Skia version mismatch risk adds fragility to a project that has a stable native build chain.

`react-native-chart-kit` 6.12.x is already installed, actively maintained (last published April 2026 per npm), builds on `react-native-svg` 15.x (already installed), and works entirely in JS with no native bridging beyond what svg already provides. Zero additional install or prebuild.

### What chart-kit provides for v5.0

| Chart Need | chart-kit Component | Notes |
|------------|--------------------|----|
| Biomarker trend line (30/90/365 day) | `LineChart` with `bezier` prop | Responsive via `Dimensions.get('window').width` |
| Progressive overload trend (weight/reps per week) | `LineChart` | Two datasets for weight + reps overlay |
| Sparkline (compact inline trend) | `LineChart` with reduced `height` (80–100px) and `withDots={false}` | Standard chart-kit trick for sparklines |
| Protocol adherence heatmap | `ContributionGraph` | Heatmap-style calendar, ideal for streak visualization |

**No separate sparkline library needed.** chart-kit's `LineChart` with `height={80}`, `withDots={false}`, `withXLabels={false}`, `withYLabels={false}`, and `transparent` background renders as a clean sparkline. This pattern is well-documented in the chart-kit community.

### Shared chart component

Both biomarker trends and exercise progressive overload trends use the same visual pattern: a line chart with time on X, value on Y, 30/90/365 day time range selector. Build one shared component `src/components/TrendChart.tsx` parameterized by data + range selector. Do not build two separate chart implementations.

### chart-kit known limitation

`react-native-chart-kit` does not support interactive tooltips with gesture tracking (no pinch-to-zoom, no crosshair on tap). For v5.0 this is acceptable — these are trend overview charts, not analytical tools. If interactive gesture-driven charts become a requirement in a future milestone, that is when adding victory-native makes sense.

---

## expo-notifications — Local Push Scheduling

**Recommendation: Install expo-notifications. It is NOT bundled by default — requires explicit install.**

**Package:** `expo-notifications`
**SDK 54 version:** `~0.32.x` (confirmed: expo-notifications 0.32.16 was documented against SDK 54.0.33)
**Status:** Separate package, must be installed explicitly.
**Confidence:** HIGH — confirmed from Expo docs page (written against SDK 54.0.33/expo-notifications 0.32.16) and SDK 54 changelog.

### Install

```bash
npx expo install expo-notifications
```

`npx expo install` (not `npm install`) ensures the Expo dependency resolver pins the correct `~0.32.x` version compatible with SDK 54. Using `npm install expo-notifications@latest` risks pulling a version pinned to SDK 55.

### iOS config plugin (required for standalone/EAS builds)

Add to `app.json` plugins array:

```json
"plugins": [
  ["expo-notifications", {
    "icon": "./assets/notification-icon.png",
    "color": "#ffffff",
    "sounds": []
  }]
]
```

The `icon` and `color` fields are optional but required for Android (iOS-only project can omit them). The `sounds` array is for custom notification sounds; leave empty for default.

After adding the plugin:
```bash
npx expo prebuild --clean
cd ios && pod install
```

The plugin automatically adds `UNUserNotificationCenter` entitlements and background modes to the iOS project.

### iOS permission request (runtime — call on first use)

```typescript
import * as Notifications from 'expo-notifications';

async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return status === 'granted';
}
```

Call this before scheduling any notifications. iOS will only show the system permission dialog once. If the user denies, redirect them to Settings.

### Scheduling AM/PM/Evening/Night protocol reminders

For Vitalspan's four protocol time slots, use `DailyTriggerInput` (repeating daily at a fixed hour/minute). This is simpler and more reliable than `CalendarNotificationTrigger` for this use case.

```typescript
import * as Notifications from 'expo-notifications';

// Schedule a daily repeating notification for a given slot
async function scheduleProtocolReminder(
  slotId: string,          // 'AM' | 'PM' | 'Evening' | 'Night'
  hour: number,            // 0–23 (user-configurable)
  minute: number,          // 0–59
  title: string,
  body: string,
): Promise<string> {
  // Cancel previous schedule for this slot before rescheduling
  await Notifications.cancelScheduledNotificationAsync(slotId);

  const id = await Notifications.scheduleNotificationAsync({
    identifier: slotId,     // stable ID so we can cancel/replace by slot
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

// Cancel a slot reminder
async function cancelProtocolReminder(slotId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(slotId);
}
```

**Use stable `identifier` values** ('AM', 'PM', 'Evening', 'Night') — this lets you cancel and reschedule a specific slot without tracking a dynamically generated UUID.

### Key API constraints for iOS local notifications

| Constraint | Detail |
|------------|--------|
| Max scheduled notifications | 64 on iOS (system limit) — 4 daily reminders is well within bounds |
| DAILY trigger minimum interval | No minimum for daily triggers (unlike TIME_INTERVAL which requires 60s on iOS) |
| CALENDAR trigger on iOS | Works but requires all fields (hour, minute, weekday etc.) — overkill for daily repeating reminders |
| Background delivery | iOS delivers scheduled notifications when app is backgrounded or killed — no additional entitlement needed for local notifications |
| Expo Go | Local notifications do NOT work in Expo Go on iOS — requires a development build (`npx expo run:ios`) |
| SDK 54 breaking change | Deprecated function exports were removed in SDK 54. Use `Notifications.scheduleNotificationAsync` (not the old `Notifications.schedule*` deprecated aliases). |

### Notification handler (set at app startup)

```typescript
// In App.tsx before navigation renders
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

Without this, notifications received while the app is foregrounded are silently dropped on iOS.

### AsyncStorage key for notification state

Store user's enabled slots and times in a new key `@vitalspan_notification_settings`:

```typescript
interface NotificationSettings {
  slots: {
    AM: { enabled: boolean; hour: number; minute: number };
    PM: { enabled: boolean; hour: number; minute: number };
    Evening: { enabled: boolean; hour: number; minute: number };
    Night: { enabled: boolean; hour: number; minute: number };
  };
}
```

On app launch, re-hydrate settings and re-schedule any enabled slots (iOS clears scheduled notifications on app update, so always reschedule on startup).

---

## Drag-to-Reorder for Exercise Routine (5–10 Items)

**Recommendation: Use `react-native-draggable-flatlist` (existing community standard). Do NOT add a new DnD framework.**

**Package:** `react-native-draggable-flatlist`
**Current version:** 4.0.1 (stable, released 2025)
**Peer dependencies:** `react-native-gesture-handler >=2.0.0`, `react-native-reanimated >=2.8.0` — both already installed at compatible versions (RNGH ~2.28.0, Reanimated ~4.1.1).
**Confidence:** MEDIUM — peer dependency compatibility verified from npm registry data. Reanimated 4 is technically within `>=2.8.0` but the library was written against Reanimated 2/3. Real-world reports confirm it works with Reanimated 4 in most cases, but use with caution and test immediately on install.

### Install

```bash
npx expo install react-native-draggable-flatlist
```

No additional native config, no prebuild needed — it uses the already-installed RNGH and Reanimated native modules.

### Why not react-native-reanimated-dnd

`react-native-reanimated-dnd` (entropyconquers) is built explicitly for Reanimated 4 and is documented against Expo SDK 55 (not 54). It requires the New Architecture to be fully enabled. Expo SDK 54 has New Architecture enabled by default but SDK 54 is the last SDK where it can be disabled — meaning edge cases in the new arch may exist in SDK 54 that are fixed in SDK 55. Using a library built for SDK 55+ on SDK 54 adds risk. Additionally, the library is younger and less battle-tested for the specific "sortable list" use case.

`react-native-draggable-flatlist` has been the de-facto standard for drag-to-reorder FlatLists since 2020, has an official Expo Snack example, and the "5–10 item routine" use case is exactly what it was designed for.

### Usage pattern

```typescript
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Wrap your screen (or app root) with GestureHandlerRootView if not already done
// The project likely already has this via react-navigation setup

type RoutineItem = { id: string; name: string; /* ... */ };

function RoutineList({ items, onReorder }: { items: RoutineItem[]; onReorder: (items: RoutineItem[]) => void }) {
  const renderItem = ({ item, drag, isActive }: RenderItemParams<RoutineItem>) => (
    <ScaleDecorator>
      <TouchableOpacity onLongPress={drag} disabled={isActive}>
        {/* your item UI */}
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <DraggableFlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onDragEnd={({ data }) => onReorder(data)}
    />
  );
}
```

**GestureHandlerRootView:** The project uses React Navigation which already wraps the app in `GestureHandlerRootView`. If the routine screen is inside the navigation stack, no additional wrapper is needed.

### Reanimated 4 compatibility note

If draggable-flatlist shows animation issues with Reanimated 4.1.1 (such as items not animating during drag), add `"react-native-reanimated/plugin"` to `babel.config.js` plugins if not already present — this is likely already there given the existing Reanimated setup. No other workaround should be needed. If issues persist, the fallback is implementing drag-to-reorder manually using RNGH `Gesture.Pan()` + Reanimated `useSharedValue` — feasible for 10 items, but adds ~100 lines of animation code.

---

## Date/Time Utilities

**Recommendation: Use JavaScript's built-in `Date` object. Do NOT add date-fns or dayjs.**

### What v5.0 date operations actually require

| Operation | Needed For | Built-in Solution |
|-----------|------------|-------------------|
| Display full date (e.g. "June 14, 2026") | Exercise history edit/delete | `date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })` |
| Display relative time ("3 days ago") | Not in scope for v5.0 | N/A |
| Group history entries by week | Progressive overload weekly trend | `date.getFullYear()` + `getWeek()` helper (10 lines) |
| Calculate streak (consecutive days) | Protocol adherence streak | `differenceInDays` is 3 lines of arithmetic: `Math.floor((a - b) / 86400000)` |
| Store/retrieve ISO dates | AsyncStorage | `new Date().toISOString()` — already used throughout the codebase |
| Daily notification trigger times | expo-notifications | hour/minute integers — no date library needed |

None of these require a date library. The "full date display" for exercise history is a single `toLocaleDateString` call. The streak calculation is integer arithmetic on timestamps. The weekly grouping for progressive overload is a simple ISO week number helper (10 lines of TypeScript, no dependency).

**Adding date-fns adds ~14KB to the bundle** (even with tree-shaking, locale data pulls in additional chunks). dayjs adds ~2KB but still introduces a dependency to maintain. Neither provides enough value over built-in `Date` for the v5.0 operations listed above.

If a future milestone adds calendar UI, date range pickers, or complex timezone-aware scheduling, reconsider date-fns at that point.

---

## v5.0 Complete Install Summary

### New packages to install

```bash
# 1. Local push notifications (new)
npx expo install expo-notifications

# 2. Drag-to-reorder (new)
npx expo install react-native-draggable-flatlist

# After installs — required because expo-notifications has a config plugin
npx expo prebuild --clean
cd ios && pod install
```

### Packages already installed — no action needed

| Package | Why It Covers v5.0 | Version |
|---------|--------------------|---------|
| `react-native-chart-kit` | Sparklines, line trends, adherence heatmap | ^6.12.0 |
| `react-native-svg` | Peer dep for chart-kit, already at correct version | 15.12.1 |
| `react-native-reanimated` | Animations for drag-to-reorder | ~4.1.1 |
| `react-native-gesture-handler` | Gesture capture for drag-to-reorder | ~2.28.0 |
| `react-native-worklets` | Reanimated 4 peer dep | 0.5.1 |

### No install needed — built-in solutions

| v5.0 Need | Solution |
|-----------|----------|
| Date formatting ("June 14, 2026") | `Date.toLocaleDateString()` built-in |
| Protocol streak calculation | Integer arithmetic on ISO timestamps |
| Weekly overload grouping | 10-line ISO week helper in TypeScript |

### Do NOT add

| Package | Why Not |
|---------|---------|
| `victory-native` | Requires `@shopify/react-native-skia` (heavy native dep, v2 compatibility issues); chart-kit already installed covers all v5.0 chart needs |
| `@shopify/react-native-skia` | Not needed unless you switch to victory-native (don't) |
| `react-native-reanimated-dnd` | Built for SDK 55/Reanimated 4 + New Arch; draggable-flatlist is the proven choice for a simple 10-item sortable list on SDK 54 |
| `date-fns` | +14KB bundle for operations that require 1–3 lines of built-in `Date` calls |
| `dayjs` | Same argument; v5.0 has no complex date formatting, timezone, or locale needs |
| `react-native-chart-kit` (re-install) | Already installed — do not duplicate or change version |
| Any "sparkline" micro-library | chart-kit's LineChart renders as a sparkline with `height={80} withDots={false} withXLabels={false} withYLabels={false}` |

---

## Version Compatibility Matrix (v5.0 additions vs existing stack)

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `expo-notifications` | ~0.32.x | Expo SDK 54, RN 0.81.5, Hermes | Requires `npx expo install` to get SDK-pinned version; uses new `SchedulableTriggerInputTypes` API (deprecated aliases removed in SDK 54) |
| `react-native-draggable-flatlist` | ^4.0.1 | RNGH >=2.0.0, Reanimated >=2.8.0 | Compatible with installed RNGH ~2.28.0 and Reanimated ~4.1.1; test drag animation immediately after install |
| `react-native-chart-kit` | ^6.12.0 | react-native-svg 15.x | Already installed and working — no version change needed |

---

## Sources

- Expo SDK 54 changelog — `expo-notifications` deprecated function exports removed, ~0.32.x confirmed for SDK 54 [HIGH confidence]
- Expo notifications docs (SDK 54.0.33, expo-notifications 0.32.16) — scheduling API, DAILY trigger, iOS constraints [HIGH confidence]
- npm registry — `react-native-draggable-flatlist` 4.0.1 peer deps: RNGH >=2.0.0, Reanimated >=2.8.0 [HIGH confidence]
- npm registry — `victory-native` 41.26.0 peer: `@shopify/react-native-skia >=1.2.3 <3.0.0` [HIGH confidence]
- GitHub FormidableLabs/victory-native-xl issue #616 — Skia v2 peer dependency conflict [HIGH confidence — live source]
- WebSearch — Expo SDK 54 ships react-native-reanimated ~4.1.0, react-native-gesture-handler ~2.28.0, @shopify/react-native-skia ~2.2.x [MEDIUM — search result, not official changelog]
- package.json audit (live file read) — confirmed exact installed versions [HIGH confidence]
