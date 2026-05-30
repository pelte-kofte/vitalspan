# Feature Research: Vitalspan v2

**Domain:** Longevity tracking iOS app (React Native + Expo 54, Supabase, pharmacist-authored)
**Researched:** 2026-05-30
**Confidence note:** External web access was restricted during this research session. All findings are
from training knowledge (cutoff Aug 2025) + direct codebase inspection. Confidence levels reflect
source quality honestly.

---

## Supabase Auth & Sync

### Table Stakes

These behaviors are expected by any user who has used a modern mobile app with accounts. Missing
any of these makes the auth feel broken.

| Behavior | Why Expected | Notes for Vitalspan |
|---|---|---|
| Email + password sign-up | Universal account baseline | Simplest flow, no OAuth dependency |
| Email verification | Prevents junk accounts | Supabase sends by default; handle unverified state |
| Persistent session across app restarts | Apps must not log users out on reopen | Requires AsyncStorage session adapter |
| Sign-in with existing account | Obviously required | Same form, different action |
| "Forgot password" email reset | Users forget passwords | Supabase magic link / reset flow |
| Graceful first-launch (no account) | Most users on first open have no account | Must not crash or block; offer "Continue without account" |
| Loading / auth-checking state | App needs to know auth state before routing | Short splash or skeleton while session loads |
| Error messages in plain English | Auth errors are cryptic by default | Map Supabase error codes to user-facing strings |

### Differentiators

| Behavior | Value | Notes for Vitalspan |
|---|---|---|
| "Continue without account" (guest mode) | Removes sign-up friction for curious users | Vitalspan v1 is AsyncStorage-only; guest mode IS the current behavior |
| Deferred sign-up prompt | Let user see value first, prompt later | Show auth prompt after first biomarker entry or protocol interaction |
| Auto-merge local data on sign-up | User filled onboarding, then made account | After sign-up, upload local AsyncStorage data to Supabase immediately |
| Biometric auth for re-entry | FaceID to unlock instead of password | expo-local-authentication; add post-v2 |
| "Your data is yours" messaging | Trust signal for health data | Small copy tweak, high trust impact for medical app |

### UX Patterns — Auth Flow

**Confidence: HIGH** — these patterns are stable Supabase JS v2 + Expo conventions.

**Session persistence in Expo requires a custom storage adapter.** Supabase JS v2's `createClient`
accepts a `storage` option. Pass `AsyncStorage` from `@react-native-async-storage/async-storage`
directly. Without this, sessions live only in memory and are lost on app restart.

```
createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,           // persists session token
    autoRefreshToken: true,          // refreshes before expiry
    persistSession: true,
    detectSessionInUrl: false,       // must be false for RN (no URL bar)
  },
})
```

**First-launch routing (no account) — recommended pattern:**

```
App starts
  → supabase.auth.getSession()
      └─ session exists → route to Main (restore user)
      └─ no session → route to Landing (sign in / sign up / continue as guest)
```

The existing `initialRoute: 'Landing' | 'Main'` prop on `AppNavigator` maps exactly to this
pattern. The check should happen in `App.tsx` (or wherever `AppNavigator` is mounted), resolving
before the navigator renders to avoid a flash.

**Handling email verification:**
- Supabase sends a confirmation email by default.
- Until confirmed, `session.user.email_confirmed_at` is null.
- For Vitalspan's scope, the simplest approach is to skip enforcement — unverified users can still
  use the app. Enforce verification only if paywall or data sharing features are added post-v2.

**onAuthStateChange listener:**

```
supabase.auth.onAuthStateChange((event, session) => {
  // events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY
  // Keep a global auth context so any screen can react
})
```

Mount this listener once at the root level (App.tsx), store session in a React context or Zustand
atom, and derive routing from it. Do not put auth logic inside individual screens.

**Error code mapping (Supabase → human-readable):**

| Supabase error | User-facing string |
|---|---|
| `invalid_credentials` | "Email or password is incorrect" |
| `email_not_confirmed` | "Please check your email to verify your account" |
| `user_already_exists` | "An account with this email already exists" |
| `weak_password` | "Password must be at least 8 characters" |
| Network error | "No internet connection. Your data is saved locally." |

**Guest mode (no account) — critical for Vitalspan:**
Because v1 is entirely AsyncStorage-based, existing users have data on-device with no account.
The auth layer must not break them. Recommended: when `initialRoute` resolves to Landing, show
three options: "Sign In", "Create Account", and "Continue without account (data stays on device)".
The third option routes directly to Main. AsyncStorage keys continue working identically.

**Data migration on sign-up:**
When a guest creates an account, trigger a one-time upload: read all `@vitalspan_*` keys, write
them to Supabase as the initial dataset for that user. This is the moment local-first becomes
cloud-backed. After success, mark `@vitalspan_auth_migrated: 'true'` so it only runs once.

**Dependencies on existing Vitalspan features:**
- The existing `initialRoute` prop in AppNavigator is the right hook — expand the logic that
  sets this prop to also check `supabase.auth.getSession()`.
- All existing AsyncStorage keys (`@vitalspan_*`) must remain as-is — they are the offline
  fallback layer.
- The existing onboarding profile (`@vitalspan_user_profile`) should be upserted to Supabase
  `user_profiles` table on first sign-in.

---

## Reference Data (Supabase Tables)

### Biomarker Ranges Table Design

**Confidence: HIGH** — Supabase PostgREST + RLS patterns are stable.

**Purpose:** Replace hardcoded ranges in `src/data/biomarkers.ts` with DB-served values.
This lets the pharmacist update longevity ranges without an app release.

**Recommended schema:**

```sql
CREATE TABLE biomarker_definitions (
  id              TEXT PRIMARY KEY,          -- matches existing Biomarker.id ('apob', 'hscrp', etc.)
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  category_label  TEXT NOT NULL,
  unit            TEXT NOT NULL,
  opt_min         FLOAT NOT NULL,
  opt_max         FLOAT NOT NULL,
  target_label    TEXT NOT NULL,
  description     TEXT NOT NULL,
  how_to_improve  TEXT NOT NULL,
  default_val     FLOAT,
  evidence_grade  TEXT CHECK (evidence_grade IN ('A','B','C')),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Row-level security: anyone can read, only service role can write
ALTER TABLE biomarker_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON biomarker_definitions FOR SELECT USING (true);
```

**Seeding strategy:**
- Convert `src/data/biomarkers.ts` `BIOMARKERS` array directly into INSERT statements.
- Use a seed SQL file (`supabase/seed.sql`) committed to the repo — Supabase CLI runs it on
  `supabase db reset`.
- The pharmacist edits ranges in the Supabase dashboard; the app fetches on launch.

**Querying from app:**
- Fetch once on app init, store in React context (not AsyncStorage — this is read-only reference).
- Fall back to the static `BIOMARKERS` array from `biomarkers.ts` if the fetch fails.
- Do not add offline caching of reference data in v2 — the static fallback IS the cache.

**User biomarker history table:**

```sql
CREATE TABLE biomarker_entries (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  biomarker_id TEXT NOT NULL,
  value        FLOAT NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL,
  synced_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE biomarker_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns entries"
  ON biomarker_entries FOR ALL
  USING (auth.uid() = user_id);
```

**Sync strategy (AsyncStorage-first, Supabase as secondary):**
- Write to AsyncStorage first (existing behavior preserved).
- Then async-upsert to Supabase if session exists.
- On app open with session, compare local `@vitalspan_biomarkers` with Supabase entries by
  `recorded_at` — take whichever has more recent data. No merge conflict needed in v2 (single
  device).

### Exercise Library Table Design

**Confidence: HIGH** — straightforward read-only reference table.

**Purpose:** Serve the exercise database from Supabase so exercises can be added/updated
without an app release.

**Recommended schema:**

```sql
CREATE TABLE exercises (
  id                TEXT PRIMARY KEY,    -- matches existing Exercise.id ('0720', '0095', etc.)
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  body_part         TEXT NOT NULL,
  equipment         TEXT NOT NULL,
  muscle_group      TEXT NOT NULL,
  secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
  target            TEXT NOT NULL,
  instructions      TEXT NOT NULL,
  -- longevity metadata (pharmacist-curated additions)
  longevity_benefit TEXT,               -- e.g. "Zone 2 cardio — VO2max"
  evidence_grade    TEXT CHECK (evidence_grade IN ('A','B','C')),
  is_featured       BOOLEAN DEFAULT false,
  updated_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON exercises FOR SELECT USING (true);
```

**Seeding strategy:**
- Convert `EXERCISES` array in `src/data/exercises.ts` directly into INSERT statements.
- 59 exercises currently in the array — straightforward one-time migration.
- The static array in `exercises.ts` becomes the fallback. In v2, do not delete it.

**Querying from app:**
- Fetch all exercises on ExerciseScreen mount (59 rows is trivial payload).
- Fall back to static `EXERCISES` array if fetch fails.
- Filter/search client-side (59 items, no need for server-side search).
- Future: if exercise library grows to 500+, add `ilike` server-side filter.

**Exercise log table (user data):**

```sql
CREATE TABLE exercise_logs (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id         TEXT NOT NULL,
  exercise_name       TEXT NOT NULL,
  category            TEXT NOT NULL,
  logged_date         DATE NOT NULL,
  sets                INT,
  reps                INT,
  duration_min        FLOAT,
  intensity           TEXT CHECK (intensity IN ('easy','moderate','hard')),
  calories_estimated  FLOAT,
  notes               TEXT,
  logged_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns logs"
  ON exercise_logs FOR ALL
  USING (auth.uid() = user_id);
```

**Existing `ExerciseLogEntry` type maps directly to this schema.** The `id` field is a
`string` (timestamp-based) in the current code — convert to UUID on insertion.

**Environment variable pattern:**
Per the PROJECT.md security constraint, never hardcode Supabase credentials:

```ts
// src/lib/supabase.ts
import Constants from 'expo-constants';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
```

Use `EXPO_PUBLIC_` prefix so Expo's build system injects them into the bundle. Store in `.env`
at project root (already gitignored by Expo's default `.gitignore`).

---

## SVG Icon System

### Tab Bar Icon Patterns

**Confidence: HIGH** — `react-native-svg` v15.12.1 is already installed in the project.

**Current state:** The tab bar uses emoji via the `TabIcon` component in `AppNavigator.tsx`.
Five tabs: Home (🏠), Biomarkers (📊), Protocol (💊), Exercise (🏃), Profile (👤).

**The standard React Navigation pattern for SVG tab icons:**

```tsx
// src/components/icons/TabIcons.tsx
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

export function HomeIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22V12h6v10"
        stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
```

**Tab bar integration:**

```tsx
// In AppNavigator.tsx, replace TabIcon
<Tab.Screen
  name="Home"
  component={DashboardScreen}
  options={{
    tabBarLabel: 'Home',
    tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
  }}
/>
```

React Navigation passes `color` (active/inactive tint from `tabBarActiveTintColor` /
`tabBarInactiveTintColor`) and `size` automatically. The SVG component just receives and uses
these props — no custom focused state needed.

**Table stakes for tab icons:**
- Stroke-based (not filled) icons at 24px look more refined on iOS at all display densities.
- Active state = primary color (`Colors.primary = '#2D6A4F'`), inactive = muted.
- Consistent stroke width across all icons (1.5px or 1.75px, pick one and hold it).
- All icons same visual weight — a bold "Protocol" icon next to a thin "Home" icon looks broken.
- Size consistency: viewBox="0 0 24 24" for all, actual render size controlled by React Navigation.

**Differentiator: subtle active fill for longevity theme:**
Instead of only changing stroke color on active, add a very faint fill (`opacity: 0.12`) of the
primary color in the active state. This reads as premium without being flashy.

### Custom Icon Component Patterns

**Confidence: HIGH** — standard React Native SVG patterns.

**Recommended folder structure:**

```
src/
  components/
    icons/
      index.ts           ← exports all icon components
      TabIcons.tsx        ← HomeIcon, BiomarkersIcon, ProtocolIcon, ExerciseIcon, ProfileIcon
      UIIcons.tsx         ← ChevronRight, Plus, Check, Warning, Trending, etc.
      BiomarkerIcons.tsx  ← category-specific icons (heart, flask, etc.)
```

**Icon naming convention:**
- All named `[Name]Icon` — e.g. `ChevronRightIcon`, `PlusIcon`, `HeartIcon`.
- One file per icon family, not one file per icon.
- Export from `index.ts` so imports are `import { HomeIcon, PlusIcon } from '../components/icons'`.

**Anti-patterns to avoid:**
- One giant `icons.tsx` file with 40+ icons — becomes unmaintainable.
- Inline SVG paths in screen files — impossible to maintain and update.
- Using `@expo/vector-icons` for custom icons — it ships with icon fonts (Ionicons, Feather, etc.)
  which are fine for generic icons but can't express the custom longevity-aesthetic icons Vitalspan
  needs. For tab bar replacements, purpose-built SVG is the right call.

**When to use `@expo/vector-icons` vs custom SVG:**
- Generic utility icons (back arrow, settings gear, share) → `@expo/vector-icons` Ionicons is fine.
- App-specific brand icons (the tab bar set, biomarker category icons) → custom SVG.

---

## Exercise Screen UX

### Daily Log Patterns

**Confidence: HIGH** — synthesized from iOS fitness app conventions (Apple Fitness, Strong,
Hevy, Whoop, MyFitnessPal workout logging) which are well-documented patterns.

**Table stakes behaviors:**

| Pattern | Why Expected | Notes |
|---|---|---|
| Today's workouts displayed first, prominently | The most important thing is "what did I do today" | Show date, exercise name, sets/reps/duration, intensity chip |
| Inline swipe-to-delete on log entries | Universal iOS list pattern | `react-native-gesture-handler` Swipeable — already installed |
| Real-time calorie total for the day | Instant feedback, motivating | Sum `caloriesEstimated` for today's logs |
| Workout count this week | 7-day streak gives context | Simple filter on `date` within last 7 days |
| "Log a workout" CTA when empty | Log is empty on first use | Empty state CTA, not just blank space |
| Confirmation haptic on save | Physical feedback that it worked | Already used in existing ExerciseScreen via expo-haptics |

**Differentiators for Vitalspan specifically:**
- Show a "longevity note" per session: "3 sessions this week — meeting the 150 min/week target."
  This connects exercise logging to the PhenoAge/longevity mission, which competitors don't do.
- Weekly adherence ring or bar (SVG, matches dark aesthetic on dashboard) — not just a number.
- Color-code log entries by intensity: Easy = `Colors.status.optimal` green, Moderate = amber,
  Hard = coral/red. Gives the log a quick visual scan quality.

**Layout recommendation:**

```
[Section: Today — Tuesday, May 30]
  [Log entry card × N]            ← date, exercise name, intensity chip, kcal, swipe-delete
  [+ Log Exercise]                ← sticky FAB or inline CTA if no entries today

[Section: This Week]
  [Log entry cards × N]           ← same card, grouped by date header
  [Weekly summary: 3 sessions, ~850 kcal]

[Section: History]
  [Load more / see all link]      ← truncate to last 14 days, paginate
```

**Not recommended:** A flat undifferentiated list of all entries. Grouping by day is table stakes
for fitness apps. Users scan by "did I work out yesterday?" not "what is entry #14?".

### Exercise Library Browser Patterns

**Confidence: HIGH** — standard fitness app library UX.

**Table stakes:**

| Pattern | Why Expected | Notes |
|---|---|---|
| Category filter chips | Primary navigation mechanism | Already exists in ExerciseScreen (`EXERCISE_CATEGORIES`) |
| Search bar | "I know what I want" user path | TextInput filter on exercise name, client-side |
| Equipment badge on each row | Gym vs home distinction | Already in ExerciseScreen (`equipShort()`) |
| Expand to see instructions | Progressive disclosure | Already in ExerciseScreen (`expandedId`) |
| "Log this exercise" action inline | One tap from browse to log | Already wired via `logModal` |

**What the current ExerciseScreen already does well:**
The existing screen covers category filtering, expand-for-instructions, and the QuickLogModal.
The v2 rebuild should preserve this logic but improve the visual treatment:

- Replace category emoji chips with labeled pill chips that use `Colors.primary` active state.
- The expand/collapse of instructions should animate (height animation via Reanimated, already
  installed at ~4.1.1).
- Replace flat list with section headers per category when "All" is selected.

**Differentiator — longevity tagging:**
The exercise library should surface longevity context that generic fitness apps don't have:
- Tag exercises with longevity benefits: "Zone 2 cardio", "Muscle hypertrophy", "Mobility",
  "VO2max". These come from the Supabase `longevity_benefit` column.
- Show evidence grade (A/B/C) for exercise categories — e.g. Zone 2 cardio for longevity = Grade A.

**What to defer:**
- Exercise demonstration GIFs/videos — high complexity, not in scope for v2.
- Custom exercise creation — the existing `CustomSupplement`-style pattern could be adapted,
  but defer to v3. The 59-exercise library is sufficient for v2.

### Intensity Visual Patterns

**Confidence: HIGH** — synthesized from Whoop, Apple Fitness, Oura conventions.

**Current state:** Three chips (Easy / Moderate / Hard) with a color toggle. Functional but flat.

**Table stakes:** The intensity selector must be tactile — users are logging mid-workout or
immediately after; they don't read labels carefully. Color + size + haptic = correct.

**Recommended visual:**

```
Three pills side by side:
  Easy     → filled with Colors.status.optimal (green), light weight text
  Moderate → filled with Colors.warning (amber), medium weight text
  Hard     → filled with Colors.status.critical (coral/red), bold text
```

Active state: filled pill with white text. Inactive: outline pill with muted text.
Selection: `Haptics.selectionAsync()` — already used in existing screen.

**Differentiator — strain score:**
After selecting intensity + duration, show a "strain contribution" number (1–21 scale, similar
to Whoop's concept) rather than just calories. Frame it as "this session added 8 recovery units
to today's load." This is a pure UX/copy change — compute from MET × duration × intensity
multiplier, scale to 1–21. High differentiation, zero implementation complexity.

**What not to build:**
- A real-time heart rate zone display — HealthKit not in scope for v2.
- RPE (Rate of Perceived Exertion) slider — adds friction; the Easy/Moderate/Hard picker is
  already the right cognitive level for this user.

---

## Empty State Design

### What Makes Empty States Motivating

**Confidence: HIGH** — well-studied UX pattern.

**The core principle:** An empty state is a first-impression moment. Users who see "No data yet"
feel the app is broken or pointless. Users who see an action-oriented state with context feel
pulled toward their goal.

**The anatomy of a motivating health-app empty state:**

1. **Icon or illustration** — not a generic file-with-X icon. Something specific to the context.
   For exercise: a figure in motion. For biomarkers: a flask or waveform. Use SVG (no extra
   assets needed). Keep it simple — 2–3 paths max.

2. **Headline that names the outcome, not the absence.** Bad: "No workouts logged yet."
   Good: "Your longevity training starts here." The user doesn't feel the absence — they feel
   the possibility.

3. **One-line sub-copy that gives context.** "Exercise is the single highest-ROI intervention
   for biological age. Log your first session to start tracking." This is where the pharmacist
   voice adds differentiating authority.

4. **Single primary CTA button.** One action only — "Log a Workout" or "Add First Biomarker."
   No secondary options. No links to settings. Friction-free path forward.

5. **No guilt, no urgency.** "Start your streak!" creates anxiety. "Your first session" is
   neutral and welcoming.

### Patterns That Work in Health Apps

**Confidence: HIGH** — observed across Apple Health, Whoop, Oura, MyFitnessPal.

| Screen | Icon idea | Headline | Sub-copy | CTA |
|---|---|---|---|---|
| Exercise log (no entries) | Activity waveform SVG | "Your longevity training starts here" | "Studies show 150 min/week of moderate exercise can add 7+ years to healthspan." | "Log First Workout" |
| Exercise log (today empty, history exists) | Calendar with checkmark outline | "Ready for today's session?" | "You worked out 3 times this week. Keep it going." | "Log Today's Workout" |
| Biomarkers (no entries) | Flask / molecule SVG | "Know your numbers" | "Your pharmacist-verified targets are ready. Add your first lab result to see where you stand." | "Add Biomarker" |
| Protocol (no supplements added) | Pill outline SVG | "Build your protocol" | "Add supplements and medications to get pharmacist-verified timing and interaction checks." | "Add First Item" |

**Anti-patterns that feel patronizing in health apps:**

| Anti-pattern | Why it fails |
|---|---|
| Confetti / celebration for first entry | Feels juvenile for a clinical-credibility app |
| "You're doing great!" with no data | Empty praise before action is hollow |
| Multiple CTAs in one empty state | Paradox of choice, users do nothing |
| Generic illustration unrelated to the feature | Breaks context, makes the state feel templated |
| Empty state that disappears instantly on first data | Should transition, not snap |

**Empty state transition animation:**
When the first item is added, animate the empty state out (fade + slide up) and the content list
in (fade + slide up). Use `Animated.timing` or `Reanimated` `FadeIn` preset. Duration 250ms.
This makes the state transition feel intentional, not abrupt.

**Dependency on existing Vitalspan work:**
PROJECT.md notes that "Motivating empty states on Dashboard and Biomarkers tab" were completed
in Phase 1. The v2 task is the remaining screens: Exercise daily log, Protocol (when no
supplements added), and any Supabase-backed screens that can be empty on first sync.

---

## Selective Theme System

### Light/Warm Screens vs Dark/Immersive Screens — Pattern for Coexistence

**Confidence: HIGH** — based on existing theme structure (fully inspected) + standard RN theming.

**The existing theme already supports this.** Looking at `src/theme/index.ts`:
- Light/warm palette: `Colors.bg = '#EDE8DC'` (warm beige), `Colors.bgCard = '#FFFFFF'`,
  `Colors.textPrimary = '#1A1A18'` — these are the day-mode list screen colors.
- Dark/immersive palette: `Colors.dark.*` object (`bg: '#0C0F0D'`, `bgCard: '#141916'`,
  `bgElevated: '#1C2119'`, `text: '#E8F5EE'`) — these are the LongevityScore / neural screens.
- Gradients: `Gradients.neural`, `Gradients.longevity`, `Gradients.darkSurface` for dark screens.

**The pattern: screen-level theme declaration, not app-level dark mode.**

Do not use React Native's system dark/light mode (i.e. `useColorScheme`). This is not a system
dark mode app — it's a selective dual-aesthetic app. The LongevityScore is always dark. The
exercise list is always warm. These are design decisions, not system preferences.

**Implementation pattern:**

```ts
// In each screen, use the correct color set directly:

// List/data screen (Exercise, Protocol, Biomarkers, Profile)
backgroundColor: Colors.bg               // '#EDE8DC' warm beige
cardBackground: Colors.bgCard            // '#FFFFFF'
text: Colors.textPrimary                 // '#1A1A18'
border: Colors.border                    // '#D4CFC4'

// Immersive/orbital screen (LongevityScore, Dashboard dark cards)
backgroundColor: Colors.dark.bg          // '#0C0F0D'
cardBackground: Colors.dark.bgCard       // '#141916'
text: Colors.dark.text                   // '#E8F5EE'
border: Colors.dark.border               // 'rgba(255,255,255,0.08)'
```

**The tab bar is the boundary between aesthetics.**

The tab bar itself uses `Colors.bg` (warm beige) as its background — this is already set in
AppNavigator. This is correct: the tab bar should match the warm list screens, because most
tabs are light. The LongevityScore is a fullScreenModal (no tab bar visible), so the transition
is clean.

**Table stakes for selective theming:**

| Screen | Background | Card | Text style | Status bar |
|---|---|---|---|---|
| Dashboard | `Colors.dark.bg` or `Colors.bg` depending on card | Dark for FutureSelf/neural cards, warm for quick-action cards | Dark on dark, dark on warm | Light content (white) |
| Biomarkers | `Colors.bg` warm beige | `Colors.bgCard` white | `Colors.textPrimary` | Dark content |
| Protocol | `Colors.bg` warm beige | `Colors.bgCard` white | `Colors.textPrimary` | Dark content |
| Exercise | `Colors.bg` warm beige | `Colors.bgCard` white | `Colors.textPrimary` | Dark content |
| Profile | `Colors.bg` warm beige | `Colors.bgCard` white | `Colors.textPrimary` | Dark content |
| LongevityScore | `Colors.dark.bg` deep dark | `Colors.dark.bgCard` | `Colors.dark.text` | Light content |

**Status bar handling:**
Expo's `expo-status-bar` can set per-screen status bar style. Warm screens need `style="dark"`
(dark icons on light bg). Dark screens need `style="light"` (white icons on dark bg). In a
React Navigation setup, use `useFocusEffect` to change status bar on screen focus, or set it in
`screenOptions` per navigator.

**Differentiator — the transition moment:**
When navigating from a warm tab (Exercise) to LongevityScore (dark, fullScreenModal with
`fade_from_bottom` animation), the aesthetic shift should feel intentional. The fade animation
already helps. Consider briefly fading the tab bar out as the modal rises — this is achieved
via React Navigation's modal presentation and requires no custom code.

**What NOT to do:**
- Do not add a `ThemeContext` with `isDark` toggle — that's app-level dark mode, which this is
  not. Each screen knows its own aesthetic from the design spec.
- Do not mix warm and dark colors on the same screen (e.g. a white card on a dark neural bg in
  the Exercise screen). The aesthetics are screen-level, not component-level, except on Dashboard
  which deliberately mixes (FutureSelf dark card on potentially warm scroll area).

---

## Complexity Notes & Dependencies

| Feature | Complexity | Primary Dependency |
|---|---|---|
| Supabase auth (sign-up/sign-in/guest) | Medium | `@supabase/supabase-js`, AsyncStorage adapter, .env setup |
| Supabase session persistence | Low | Storage adapter config at client init |
| Guest → account data migration | Medium | One-time upload function, migration flag in AsyncStorage |
| Biomarker reference data from Supabase | Low | Seed SQL, client-side fetch + static fallback |
| User biomarker history sync | Medium | Auth session gate, upsert logic, conflict resolution |
| Exercise library from Supabase | Low | Seed SQL, client-side fetch + static fallback |
| Exercise log sync | Medium | Same as biomarker history sync |
| SVG tab bar icons | Low | react-native-svg already installed; 5 icons to draw |
| Custom SVG icon system | Low | Folder structure + props pattern |
| Exercise screen daily log section | Medium | New section layout in ExerciseScreen; reuse existing log logic |
| Exercise library visual polish | Low | CSS/style changes to existing ExerciseScreen |
| Intensity visual upgrade | Low | Style changes to QuickLogModal intensity picker |
| Empty states (remaining screens) | Low | SVG icon + copy + CTA; no logic change |
| Selective theme (list screens) | Low | Screen-level color token usage, already in theme |
| Status bar per-screen | Low | `expo-status-bar` useFocusEffect pattern |

**Critical path:** Supabase auth must be in place before biomarker history sync and exercise log
sync. Reference data tables (biomarker_definitions, exercises) have no auth dependency — they
use public read RLS policy and can be implemented in parallel with auth.

**Existing code preservation:**
- `@vitalspan_exercise_log` AsyncStorage key must be preserved — it is the offline fallback.
- `EXERCISES` array in `exercises.ts` must be preserved — it is the fallback if Supabase is
  unavailable.
- `BIOMARKERS` array in `biomarkers.ts` must be preserved — same reason.
- The `ExerciseLogEntry` type is already designed correctly and maps to the Supabase schema.

---

*Research complete. Sources: direct codebase inspection + training knowledge (Supabase JS v2,
Expo 54, react-native-svg, React Navigation v6, iOS fitness app UX conventions).*
