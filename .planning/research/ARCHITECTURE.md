# Architecture Research — v4.0

**Researched:** 2026-06-10
**Confidence:** HIGH (Adapty — Context7/official SDK docs), HIGH (Claude API security — official SDK README), MEDIUM (exercise photos — web search + confirmed GitHub URL pattern)

---

## Adapty Integration

### Initialization location in App.tsx

Adapty's `activate()` must be called as early as possible in the app lifecycle, before any other SDK method. In the existing `App.tsx`, the `init()` async function inside `useEffect` already sequences Supabase first. Adapty goes **immediately after** `initSupabaseSession()`, inside the same `init()` block, before `setInitialRoute` is called.

Rationale: Supabase session must resolve first because the Supabase `user.id` is passed to `adapty.identify()`. You cannot identify the user to Adapty until you know the Supabase identity. The `activate()` call itself does not block on a user ID — it fires without `customerUserId`, then `identify()` is called after the user is known.

Recommended sequence in `init()`:

```typescript
// 1. Supabase session (existing — unchanged)
await initSupabaseSession();

// 2. Adapty activation — SDK key from env, does NOT need user ID yet
adapty.activate(process.env.EXPO_PUBLIC_ADAPTY_PUBLIC_KEY ?? '', {
  __ignoreActivationOnFastRefresh: true,
  logLevel: __DEV__ ? LogLevel.Verbose : LogLevel.Error,
});
// activate() is intentionally not awaited — the SDK queues
// subsequent calls made before activation completes internally.

// 3. Resolve Supabase user (existing logic)
const { data: { user } } = await supabase.auth.getUser();

// 4. Link Adapty profile to Supabase user ID — fire-and-forget
if (user && !user.is_anonymous) {
  adapty.identify(user.id).catch(() => null);
}

// 5. Existing route logic (unchanged)
if (user && !user.is_anonymous) { ... }
```

`EXPO_PUBLIC_ADAPTY_PUBLIC_KEY` is safe in `.env` because Adapty deliberately uses a **public** SDK key client-side — this is their architecture, not a security exception. Their server-side secret is never sent to clients.

### Paywall gating pattern

Use a React Context, not per-screen `getProfile()` calls. Create `src/contexts/SubscriptionContext.tsx`:

- Holds `isPremium: boolean` and `isLoadingSubscription: boolean`
- On mount, calls `adapty.getProfile()` and reads `profile.accessLevels['premium']?.isActive`
- Listens to `adapty.addEventListener('onLatestProfileLoad', ...)` for reactive updates when a purchase completes or subscription lapses
- Exposes a `showPaywall()` helper that navigates to the `Paywall` screen

Components and screens read `isPremium` from the context. No screen makes direct `getProfile()` calls. This prevents N redundant network hits on navigation.

```typescript
// src/contexts/SubscriptionContext.tsx
export type SubscriptionContextValue = {
  isPremium: boolean;
  isLoadingSubscription: boolean;
  showPaywall: () => void;
};
```

Gate a premium feature at the call site:

```typescript
const { isPremium, showPaywall } = useSubscription();

const handleAdvisorPress = () => {
  if (!isPremium) { showPaywall(); return; }
  navigation.navigate('AIAdvisor');
};
```

Do NOT add per-screen paywall checks in navigator route guards — the app uses a flat `initialRoute` prop pattern and premium gating is soft (feature-level), not route-level.

### Adapty user ID and Supabase user ID relationship

Adapty and Supabase have separate identity systems. The link is `adapty.identify(supabaseUserId)`. The Supabase `user.id` UUID satisfies Adapty's `userId` string requirement with no transformation.

Rules by auth state:

- **Anonymous Supabase user** (pre-auth): Call `activate()` with no `customerUserId`. Do NOT call `identify()` — Adapty creates an internal anonymous profile.
- **After Supabase email sign-up or login**: Call `adapty.identify(user.id)` immediately. Purchase history made while anonymous is merged.
- **When Supabase anonymous → email conversion** (`convertAnonymousToEmail`): Call `adapty.identify(user.id)` immediately after success in the same code path.

`adapty.identify()` must be called in three places:
1. `App.tsx` init (when an existing non-anonymous user is found on cold start)
2. `WelcomeScreen` after successful sign-in
3. The sign-up / email promotion flow (wherever `convertAnonymousToEmail` is called)

### Paywall screen navigation placement

Add `Paywall` to `RootStackParamList` and register in the stack as `fullScreenModal` with `gestureEnabled: false`:

```typescript
// AppNavigator.tsx additions to RootStackParamList:
Paywall: { placement?: string };

// Stack.Screen:
<Stack.Screen
  name="Paywall"
  component={PaywallScreen}
  options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
/>
```

`gestureEnabled: false` prevents swipe-to-dismiss so Adapty's `onCloseButtonPress` handler fires correctly and analytics impression/dismiss events are logged. This matches the existing pattern for `LongevityScore` and `GuidedFirstRun`.

`PaywallScreen` renders `AdaptyPaywallView` from `react-native-adapty` filling the full screen. It handles `onPurchaseCompleted` by popping the modal and updating the context.

### New files

- `src/contexts/SubscriptionContext.tsx` — context + provider + event listener
- `src/hooks/useSubscription.ts` — convenience hook wrapping `useContext(SubscriptionContext)`
- `src/screens/PaywallScreen.tsx` — renders `AdaptyPaywallView`

### Modified files

- `App.tsx` — add `adapty.activate()` + `adapty.identify()` in `init()`; wrap with `AdaptyProvider` if Adapty requires a context root (check SDK docs — may just need `activate()` at top level)
- `src/navigation/AppNavigator.tsx` — add `Paywall` to `RootStackParamList` + `Stack.Screen`
- `.env` + `.env.example` — add `EXPO_PUBLIC_ADAPTY_PUBLIC_KEY`

### Expo prebuild requirement

`react-native-adapty` is a native module:

```
npx expo install react-native-adapty
npx expo prebuild
cd ios && pod install
```

Expo Go will not work after this. The project must run via `npx expo run:ios` or an EAS dev build. This is already the existing constraint — `react-native-gesture-handler` and `react-native-reanimated` are both native modules already in the project. No new workflow change is required — just run prebuild before testing.

**Audit `ios/` before running prebuild.** Any manual changes to native files (e.g., entitlement additions) must be represented as `app.json` config plugins first, or they will be overwritten. The existing `@kingstinct/react-native-healthkit` (in `package.json`) may already require a config plugin entry.

---

## Claude API Integration

### API key security — Supabase Edge Function is mandatory

`@anthropic-ai/sdk` **explicitly states React Native is not a supported runtime** (from the official SDK README on GitHub). This is not a workaround issue — the SDK depends on Node.js built-in modules that are not present in the React Native JS engine.

Beyond the runtime incompatibility: an `EXPO_PUBLIC_` key is bundled into the app binary and fully extractable by anyone who downloads the IPA from TestFlight or the App Store. A compromised Anthropic API key has no scope limitation — it allows unlimited spend.

**The mandatory approach is a Supabase Edge Function as a proxy.** The Edge Function runs in Deno (a supported `@anthropic-ai/sdk` runtime), reads `ANTHROPIC_API_KEY` from Supabase project secrets, and is never exposed to the client.

Architecture:
```
iOS app
  → supabase.functions.invoke('ai-advisor', { body: context })
    [authenticated via existing Supabase JWT]
  → Deno Edge Function
    → validates Supabase JWT
    → calls Anthropic API with server-side key
    → returns { report: string } or { message: string, role: 'assistant' }
  → iOS app renders response
```

The client invokes using the already-configured `supabase` client singleton:
```typescript
const { data, error } = await supabase.functions.invoke('ai-advisor', {
  body: { context: anonymizedHealthContext },
});
```

The Supabase JWT is automatically attached — no additional auth header is needed. Rate limiting can be enforced in the Edge Function by checking the user ID against a Supabase table (e.g., one report per day per user) without any client-side changes.

`ANTHROPIC_API_KEY` is set exclusively via:
```
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```
Never committed to source. Never in `.env`. Never in any `EXPO_PUBLIC_` variable.

### Anonymized context object shape

The context object sent to the Edge Function must never include raw personal identifiers. The Edge Function receives this, builds the Claude prompt, and returns a structured response.

```typescript
// src/lib/advisorContext.ts
export interface AdvisorContext {
  // Demographic — non-identifying
  ageGroup: '18-30' | '31-45' | '46-60' | '61-75' | '75+';
  sex: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  primaryGoal: string; // e.g. "longevity", "performance"

  // Biomarkers — latest classification + value, no timestamps
  biomarkers: Array<{
    name: string;       // e.g. "ApoB", "HbA1c"
    status: 'optimal' | 'suboptimal' | 'concerning' | 'no_data';
    value?: number;     // included only when status !== 'no_data'
    unit?: string;
  }>;

  // PhenoAge — derived score only, no raw Levine component values
  phenoAge?: {
    biologicalAge: number;
    chronologicalAge: number;
    agingRate: 'slower' | 'average' | 'faster';
  };

  // Protocol — names only, no doses or schedule
  supplements: string[];    // e.g. ["Vitamin D3", "Magnesium Glycinate"]
  medications: string[];    // e.g. ["Metformin", "Atorvastatin"]

  // Exercise — aggregate metrics only
  exerciseSummary?: {
    weeklySessionCount: number;
    dominantCategory: string; // e.g. "Strength", "Cardio"
    avgIntensity: 'easy' | 'moderate' | 'hard';
  };

  // Request type
  requestType: 'full_report' | 'chat_followup';
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}
```

Privacy rules enforced by `advisorContext.ts`:
- No name field. No exact birthdate — only age group bucket.
- Biomarker values included only when present (not inferred/default). No timestamps.
- No raw PhenoAge Levine component values (albumin, creatinine, etc.) — only the derived biological age and classification.
- `chatHistory` is ephemeral — assembled in component state, not persisted to AsyncStorage or Supabase. Each session is stateless.

`advisorContext.ts` reads from `@vitalspan_user_profile`, `@vitalspan_biomarkers`, and `@vitalspan_protocol` AsyncStorage keys to assemble the context. It is a pure function with no side effects.

### AI Advisor screen navigation placement

A new tab is wrong. Five tabs is already the maximum for legible tab bar text at 10pt. The AI Advisor is a premium feature — presenting it as a modal preserves the "unlock reveal" experience and avoids showing a locked tab icon to free users.

**Placement: stack modal from Dashboard**, triggered by a prominent entry card on `DashboardScreen`. This follows the existing pattern for `LongevityScore` (fullScreenModal from Dashboard). The AI Advisor card on Dashboard should be premium-gated — tapping it calls `showPaywall()` for free users, or `navigation.navigate('AIAdvisor')` for premium users.

Add to `RootStackParamList`:
```typescript
AIAdvisor: undefined;
```

```typescript
<Stack.Screen
  name="AIAdvisor"
  component={AIAdvisorScreen}
  options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
/>
```

`AIAdvisorScreen` contains two sub-views managed by local state, not separate stack screens:
1. **Report view** — generated on first open via `supabase.functions.invoke`; shows structured longevity report sections
2. **Chat view** — scrollable message thread for follow-up questions; subsequent invocations include `chatHistory`

Keeping report and chat in one screen avoids navigation state complexity and lets the user reference the report while chatting.

### New files

- `supabase/functions/ai-advisor/index.ts` — Deno Edge Function (new)
- `src/screens/AIAdvisorScreen.tsx` — report + chat UI with loading state (new)
- `src/lib/advisorContext.ts` — assembles `AdvisorContext` from AsyncStorage (new)
- `src/components/AdvisorReportCard.tsx` — renders a single report section (new)
- `src/components/ChatBubble.tsx` — renders a single chat message (new)

### Modified files

- `src/navigation/AppNavigator.tsx` — add `AIAdvisor` to `RootStackParamList` + `Stack.Screen`
- `src/screens/DashboardScreen.tsx` — add AI Advisor entry card (premium-gated via `useSubscription`)

---

## Exercise Photos Integration

### Asset strategy: remote CDN URLs, do not bundle locally

The `yuhohas/free-exercise-db` repository provides images at a deterministic raw.githubusercontent.com URL:

```
https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{ExerciseName}/0.jpg
```

Where `{ExerciseName}` is the exercise name with spaces replaced by underscores, capitalized as it appears in the repo (e.g., `Barbell_Deadlift`, `Dumbbell_Bent_Over_Row`, `Air_Bike`).

Do NOT bundle as local `require()` assets. The free-exercise-db has 800+ exercises with multiple images each — bundling a subset would add tens of megabytes to the IPA, slowing EAS builds and increasing download size for all users. The raw.githubusercontent.com CDN is stable and served globally via Fastly.

Fallback logic when the remote image fails: fall back to the existing `IllustrationComponent` SVG. If no SVG exists either, fall back to the existing placeholder view. This is a two-level graceful fallback using existing UI — no new placeholder components needed.

### Data model change

Add an optional `photoKey` field to the `Exercise` interface:

```typescript
// src/data/exercises.ts
export interface Exercise {
  // ...existing fields unchanged...
  illustrationId?: string;  // keep — SVG fallback layer
  photoKey?: string;        // new — free-exercise-db name key
}
```

A helper converts `photoKey` to a URL:

```typescript
// src/lib/exercisePhotos.ts
export function exercisePhotoUrl(photoKey: string): string {
  return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${photoKey}/0.jpg`;
}
```

**Critical ID mismatch:** Vitalspan's `Exercise.id` values (`'0720'`, `'0095'`, etc.) come from `hasaneyldrm/exercises-dataset`, which is a completely different dataset from `yuhohas/free-exercise-db`. There is no numeric ID overlap between the two repos. Mapping must be done manually by exercise name. The `photoKey` field holds the free-exercise-db name string (e.g., `"Barbell_Deadlift"`), not a shared numeric ID. This is a one-time manual mapping effort performed when populating `exercises.ts` entries. Exercises with no match in free-exercise-db simply leave `photoKey` undefined, activating the SVG fallback.

### ExerciseDetailScreen changes

The `illustrationCard` section (lines 80–90) is replaced with a priority-ordered media section. The container `View` and its style stay identical — only the inner content is conditional:

```typescript
// State addition:
const [photoFailed, setPhotoFailed] = useState(false);

// Render — replaces the existing IllustrationComponent block:
{exercise.photoKey && !photoFailed ? (
  <Image
    source={{ uri: exercisePhotoUrl(exercise.photoKey) }}
    style={s.exercisePhoto}
    onError={() => setPhotoFailed(true)}
  />
) : IllustrationComponent ? (
  <IllustrationComponent size={160} />
) : (
  <View style={s.illustrationPlaceholder}>
    <Text style={s.illustrationPlaceholderTxt}>No illustration</Text>
  </View>
)}
```

Add to `StyleSheet`:
```typescript
exercisePhoto: {
  width: '100%',
  height: 200,
  borderRadius: Radius.lg,
  resizeMode: 'cover',
},
```

`Image` from `react-native` with `onError` is sufficient. `expo-image` would provide better disk caching but requires `npx expo install expo-image` — worth adding if network performance is a concern, but not strictly required for the feature to work.

### New files

- `src/lib/exercisePhotos.ts` — `exercisePhotoUrl(photoKey: string): string` helper

### Modified files

- `src/data/exercises.ts` — add `photoKey?: string` to `Exercise` interface; populate `photoKey` on all exercises that have a match in free-exercise-db
- `src/screens/ExerciseDetailScreen.tsx` — add `photoFailed` state; replace illustration block with priority-ordered photo/SVG/placeholder render

---

## Build Order

### Recommended phase sequence

**Phase 1: Exercise Photos**
Build first. Zero dependencies on Adapty or the AI Advisor. Entirely additive: one new field on a TypeScript interface, one utility function, one modified render block in one screen. No new native modules, no new backend infrastructure, no new secrets. Completing it first provides a fast visual win and confirms the EAS build pipeline is healthy before native module changes arrive in Phase 2.

**Phase 2: Adapty (subscriptions)**
Build second. No dependency on Phase 1 or the AI Advisor. Must come before the AI Advisor because `SubscriptionContext.isPremium` is the gate for the AI Advisor feature. Building Adapty second also flushes out the `expo prebuild` requirement and validates EAS builds with a native module change before the additional Edge Function complexity of Phase 3. Completing Phase 2 makes `useSubscription` available for Phase 3.

**Phase 3: Claude API / AI Advisor**
Build last. Depends on:
- `SubscriptionContext` + `useSubscription` hook (Phase 2) for the premium gate
- `supabase.functions.invoke` (already available via existing Supabase client)
- `advisorContext.ts` reading existing `@vitalspan_*` AsyncStorage keys

Phase 3 can be parallelized internally into two workstreams once Phase 2 is complete:
- Workstream A: Supabase Edge Function (`supabase/functions/ai-advisor/index.ts`) + set `ANTHROPIC_API_KEY` secret + deploy
- Workstream B: `AIAdvisorScreen` UI shell + `advisorContext.ts` + component scaffolding

Both workstreams converge when the screen calls `supabase.functions.invoke`.

### Dependency table

| Before building | What must exist first |
|----------------|----------------------|
| `AIAdvisorScreen` premium gate | `SubscriptionContext` + `useSubscription` (Phase 2) |
| `PaywallScreen` rendering | `react-native-adapty` installed + `expo prebuild` run |
| Edge Function calling Anthropic | `ANTHROPIC_API_KEY` set in Supabase project secrets |
| `photoKey` in `exercises.ts` | Manual name-matching against free-exercise-db exercise list (one-time work, must precede ExerciseDetailScreen changes) |
| `adapty.identify()` in sign-in flows | `react-native-adapty` installed (not just imported) |

---

## Cross-Cutting Concerns

### expo prebuild audit

Before running `npx expo prebuild` for Adapty, audit what is currently in `ios/` that would be overwritten. Specifically: `@kingstinct/react-native-healthkit` is already in `package.json` — confirm its config plugin entry in `app.json`'s `plugins` array. Any entitlements (HealthKit, Sign In with Apple) must be declared via config plugins before prebuild runs, or they will be lost.

### Environment variable summary

```
# .env additions for v4.0
EXPO_PUBLIC_ADAPTY_PUBLIC_KEY=public_live_...

# Supabase project secrets (set via CLI, never in .env)
# supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### Subscription state — do not duplicate in AsyncStorage

`adapty.getProfile()` falls back to the SDK's internal cache when offline. Do NOT persist `isPremium` in `@vitalspan_*` AsyncStorage keys. Duplicating this state creates a desync vector when subscriptions lapse or are refunded. Let Adapty own subscription state entirely.

---

## Sources

- Adapty React Native SDK initialization, identify, getProfile, paywall presentation: Context7 `/adaptyteam/adaptysdk-react-native` — HIGH confidence
- Adapty installation with Expo prebuild: Context7 `/adaptyteam/adaptysdk-react-native` README — HIGH confidence
- `@anthropic-ai/sdk` React Native not supported: official SDK README via Context7 `/anthropics/anthropic-sdk-typescript` — HIGH confidence
- Supabase Edge Functions `invoke` pattern: Context7 `/supabase/supabase` — HIGH confidence
- free-exercise-db URL structure `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{name}/0.jpg`: confirmed via web search result citing GitHub repo README — MEDIUM confidence (URL pattern verified from search result, not direct file read)
- free-exercise-db GitHub: https://github.com/yuhonas/free-exercise-db
