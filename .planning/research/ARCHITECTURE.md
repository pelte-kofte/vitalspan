# Architecture Research: Vitalspan v2

**Researched:** 2026-05-30
**Confidence:** HIGH — derived directly from reading the existing codebase files, not from external sources.

---

## New Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Single Supabase client instance; reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `process.env`. All other files import from here. |
| `src/services/biomarkerSync.ts` | Stateless async functions (`pushBiomarkerEntry`, `pullBiomarkerHistory`, `pushBulkHistory`) that move data between AsyncStorage and Supabase. Not a hook — plain functions called by hooks. |
| `src/services/exerciseSync.ts` | `fetchExerciseLibrary()` pulls exercise rows from Supabase `exercises` table. Returns typed `Exercise[]`. ExerciseScreen calls this instead of reading the local `src/data/exercises.ts` static array. |
| `src/services/biomarkerRefData.ts` | `fetchBiomarkerRanges()` pulls longevity-optimized ranges from Supabase `biomarker_ranges` table. Merges with local `src/data/biomarkers.ts` as fallback if network unavailable. |
| `src/hooks/useSupabaseAuth.ts` | Wraps `supabase.auth` — exposes `{ session, user, signInAnonymously, signOut, isLoading }`. Anonymous auth on first launch; upgrade path later. Consumed by `App.tsx`. |
| `src/hooks/useBiomarkerSync.ts` | Calls `biomarkerSync` service functions; manages loading/error state. Used by BiomarkerEntryScreen (push on save) and DashboardScreen (pull on mount when online). |
| `src/components/icons/HomeIcon.tsx` | SVG tab icon component. |
| `src/components/icons/BiomarkerIcon.tsx` | SVG tab icon component. |
| `src/components/icons/ProtocolIcon.tsx` | SVG tab icon component. |
| `src/components/icons/ExerciseIcon.tsx` | SVG tab icon component. |
| `src/components/icons/ProfileIcon.tsx` | SVG tab icon component. |
| `src/components/icons/index.ts` | Re-exports all icon components from a single path. |
| `.env` | Already exists with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. No changes needed — Expo SDK 49+ reads `EXPO_PUBLIC_*` vars automatically via `process.env`. |

---

## Modified Files

| File | What Changes | Why |
|------|-------------|-----|
| `App.tsx` | Add `useSupabaseAuth` call; pass `session` status into navigator or expose via context. Run `signInAnonymously()` on first load if no session. | Auth must initialize before any Supabase sync calls are made. |
| `src/navigation/AppNavigator.tsx` | Replace emoji `TabIcon` component with SVG icon imports from `src/components/icons/`. No structural changes to the navigator — only the `tabBarIcon` props swap. ExerciseScreen tab already exists (line 99-106). | SVG icons require the existing `react-native-svg` (v15.12.1, already installed). No new packages. |
| `src/theme/index.ts` | Append a new `Beige` export object at the bottom — do not modify any existing color constants. Screens explicitly importing `Beige.*` get warm tones; screens that never import it are unaffected. | Additive-only change; zero risk to dark screens. |
| `src/screens/ExerciseScreen.tsx` | Swap static `EXERCISES` import for `useExerciseLibrary()` hook (which calls `exerciseSync.fetchExerciseLibrary()`). Add loading state. Keep all existing UI. Supabase data is a drop-in replacement for the same `Exercise` type. | Preserves the existing screen structure; only the data source changes. |
| `src/screens/BiomarkerEntryScreen.tsx` | On successful save to AsyncStorage, call `useBiomarkerSync.push(entry)`. If auth session exists, sync; if not, skip silently (offline-first). | Entry is always saved locally first; Supabase push is fire-and-forget. |
| `src/screens/DashboardScreen.tsx` | On mount, call `useBiomarkerSync.pullIfStale()` — pulls remote history and merges with local AsyncStorage only if last sync was >15 min ago. | Prevents thrashing; AsyncStorage remains source of truth for rendering. |
| `src/data/biomarkers.ts` | No structural change. The local data remains the offline fallback. `biomarkerRefData.ts` merges remote ranges on top of local ones at runtime. | Preserving this as fallback is an explicit project constraint. |
| `app.json` | No changes required. `EXPO_PUBLIC_*` env vars are read directly by Expo without `extra` configuration. | Confirmed by Expo SDK 49+ behavior. |

---

## Data Flow Changes

### Current Flow (v1 — pure AsyncStorage)

```
User action → Screen → AsyncStorage.setItem → AsyncStorage.getItem → Screen render
```

All data is local. No network calls for user data.

### v2 Flow — Online Path

```
User action
  → Screen
  → AsyncStorage.setItem (always first — offline safety)
  → useBiomarkerSync.push()
    → supabase.from('biomarker_entries').insert(entry)
      [fire-and-forget — screen does not await this]
```

### v2 Flow — Read / Hydration Path

```
Screen mount
  → AsyncStorage.getItem (render immediately with cached data)
  → useBiomarkerSync.pullIfStale() [background]
    → supabase.from('biomarker_entries').select() where user_id = session.user.id
    → merge: remote entries that are missing from local → AsyncStorage.setItem
    → trigger re-render with merged data
```

### v2 Flow — Reference Data (biomarker ranges, exercise library)

```
Screen mount
  → local data/exercises.ts (instant render with static data)
  → exerciseSync.fetchExerciseLibrary() [background]
    → supabase.from('exercises').select('*')
    → replace static array in state
    → re-render with richer remote data
```

This "local-first, remote-enriches" pattern means the app is fully functional with zero network. Supabase enriches; it never blocks.

### AsyncStorage Keys — Unchanged

All `@vitalspan_*` keys are preserved exactly. They serve as the offline cache and primary rendering source. Supabase is the sync destination, not the rendering source.

---

## Auth + Onboarding Integration

### The Constraint

`App.tsx` already checks `@vitalspan_user_profile` → `onboardingComplete` to decide `initialRoute`. This logic must not change.

### How Auth Layers In

**Anonymous auth is the right approach for v2.** Supabase supports `signInAnonymously()` — it creates a real `user.id` with no email/password friction. This lets biomarker rows be scoped to a real user ID immediately, without touching the onboarding flow.

**Initialization sequence in `App.tsx`:**

1. Check `@vitalspan_user_profile` → set `initialRoute` (existing code, unchanged)
2. Call `supabase.auth.getSession()` — if session exists, do nothing
3. If no session → call `supabase.auth.signInAnonymously()` — runs once silently in background
4. Store session; subsequent Supabase calls are now authenticated

**Onboarding does not change.** It still writes to `@vitalspan_user_profile`. After onboarding completes and the user lands in `Main`, the anonymous Supabase session is already active and biomarker syncs can begin.

**No new screens, no new navigation routes, no new onboarding steps.** Auth is entirely invisible to the user in v2.

### User Identity Mapping

`@vitalspan_user_profile` holds the user's clinical data (name, age, sex, conditions, medications). The Supabase `user.id` (UUID) is the row owner on biomarker tables. These two are linked at the time of first sync — `biomarkerSync.ts` uses `supabase.auth.getUser()` to get the UUID and attaches it to every inserted row. No explicit mapping table is needed in v2.

### Future Upgrade Path (out of scope for v2)

When a real email/password auth is added later, `supabase.auth.linkIdentity()` can upgrade the anonymous session without losing data. That's a v3 concern.

---

## Theme Extension Strategy

### The Problem to Avoid

Modifying existing color constants would touch every screen that imports them — including dark immersive screens like `LongevityScoreScreen`. That is the wrong approach.

### The Solution: Additive Export

Append a `Beige` namespace to `src/theme/index.ts` without modifying any existing constant:

```typescript
// APPEND to the bottom of src/theme/index.ts — do not modify above
export const Beige = {
  // Page backgrounds
  bg:         '#F5F0E8',   // warm white — list screens, modals
  bgCard:     '#FDFAF5',   // near-white cards on warm background
  bgShade:    '#EDE6D8',   // section dividers, pressed states

  // Text on warm backgrounds
  text:       '#2C2417',   // dark warm brown — primary text
  textSub:    '#6B5D4F',   // secondary text
  textMuted:  '#9C8E82',   // captions, placeholders

  // Borders
  border:     '#D9D0C3',   // card outlines
  borderLight:'#EBE4D8',   // subtle dividers

  // Warm accents (complement, not replace, Colors.primary)
  cream:      '#FDF6EC',   // notification banners, highlights
  sand:       '#C9B99A',   // decorative lines, icons
  terracotta: '#C17F5A',   // warm CTA alternative (use sparingly)
} as const;
```

**Usage contract:** Only screens that are part of the warm redesign import `Beige`. Dark screens (`LongevityScoreScreen`, `DashboardScreen` neural overlay sections) never import `Beige` and are untouched. This is enforced by convention, not by a build rule — it just requires discipline during implementation.

**Screens that receive `Beige`:** BiomarkerDetailScreen (list), BiomarkerEntryScreen (form), ProtocolScreen (supplement list), ProfileScreen, SettingsScreen, AboutScreen, ExerciseScreen (library browser).

**Screens that stay dark:** LongevityScoreScreen, the neural overlay sections of DashboardScreen, LandingScreen.

---

## SVG Icon Architecture

### Foundation

`react-native-svg` is already installed at v15.12.1. No new packages are needed.

### File Location

All icon components live in `src/components/icons/`. This is a sub-folder of the existing `src/components/` directory — no new top-level folders.

```
src/components/icons/
  HomeIcon.tsx
  BiomarkerIcon.tsx
  ProtocolIcon.tsx
  ExerciseIcon.tsx
  ProfileIcon.tsx
  index.ts          ← re-exports all icons
```

### Component Shape

Each icon is a pure functional component with this consistent interface:

```typescript
// Example: src/components/icons/HomeIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  color: string;   // passed by tab navigator (active = Colors.primary, inactive = Colors.textMuted)
  size?: number;   // defaults to 24
}

export function HomeIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="..." stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
```

Using `stroke={color}` (not `fill`) is the correct approach for outline-style icons — the tab navigator passes `color` directly, so active/inactive state is handled automatically.

### Wiring Into AppNavigator

Replace the existing `TabIcon` function in `AppNavigator.tsx`:

```typescript
// BEFORE
tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />

// AFTER
import { HomeIcon } from '../components/icons';
tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />
```

The `color` prop from React Navigation already maps to `tabBarActiveTintColor` / `tabBarInactiveTintColor`, so no manual focused-state logic is needed. The existing `TabIcon` function is deleted entirely.

### Why Not @expo/vector-icons

`@expo/vector-icons` is already in package.json but uses rasterized icon fonts — not suitable for custom brand shapes. SVG gives pixel-perfect control at any size and matches the premium aesthetic goal. `react-native-svg` is already available, so this is zero-cost.

---

## Suggested Build Order

Dependencies drive this order. Each phase produces artifacts consumed by the next.

### Phase 1: Foundation — Supabase Client + Auth

**Produces:** `src/lib/supabase.ts`, `src/hooks/useSupabaseAuth.ts`, `App.tsx` auth init, `.env` validated.

**Rationale:** Everything else depends on having a working Supabase client and an authenticated session. No sync hook, no reference data fetch, no exercise library fetch can work without this. Build and verify the client can connect and `signInAnonymously()` succeeds before writing any data-layer code.

**Verification gate:** `supabase.auth.getSession()` returns a valid session in the Metro console. Supabase project ID `PROJECT-REF-REDACTED` is confirmed reachable.

### Phase 2: SVG Icons + Theme Extension

**Produces:** `src/components/icons/` directory (5 icons + index), `Beige` token block in `src/theme/index.ts`.

**Rationale:** These are pure UI changes with zero dependencies on Phase 1. They can be built in parallel with Phase 1 but should be completed before the screen redesign phases (3+) so redesigned screens can reference the correct tokens. Theme and icons have no inter-dependency — they can be done in either order within this phase.

**Verification gate:** Tab bar renders SVG icons. No dark screen visually changes.

### Phase 3: Reference Data from Supabase

**Produces:** `src/services/biomarkerRefData.ts`, `src/services/exerciseSync.ts`.

**Rationale:** These are read-only fetches that enrich existing static data. They require the Supabase client (Phase 1) but are simpler than two-way sync. Building them here validates the client, table schemas, and RLS policies before writing more complex sync logic.

**Verification gate:** `fetchExerciseLibrary()` returns rows. `fetchBiomarkerRanges()` returns rows. Both fall back gracefully to local data when offline.

### Phase 4: Biomarker Sync (Write Path)

**Produces:** `src/services/biomarkerSync.ts`, `src/hooks/useBiomarkerSync.ts`, modifications to `BiomarkerEntryScreen` and `DashboardScreen`.

**Rationale:** Requires Phase 1 (auth session for user_id) and a stable data model (Phase 3 validates the Supabase table setup). The write path is higher risk than reads — it modifies user data — so it comes after the simpler read path is proven.

**Verification gate:** Saving a biomarker entry in BiomarkerEntryScreen creates a row in the Supabase `biomarker_entries` table with the correct `user_id`. AsyncStorage key is still updated correctly. Pull sync on DashboardScreen mount retrieves the row.

### Phase 5: Exercise Screen Redesign

**Produces:** Updated `ExerciseScreen.tsx` using remote exercise library, new daily log UI, intensity visuals, history view. Uses `Beige` tokens.

**Rationale:** Requires Phase 2 (Beige tokens) and Phase 3 (remote exercise library). The screen receives a substantial UI overhaul alongside the data source change — combining them into one phase avoids touching the file twice.

**Verification gate:** Exercise library loads from Supabase. Screen renders with warm beige backgrounds. Logging a workout saves to AsyncStorage under the existing exercise log key.

### Phase 6: Selective UI Overhaul (Remaining Screens)

**Produces:** Warm beige redesign applied to BiomarkerDetailScreen, BiomarkerEntryScreen, ProtocolScreen, ProfileScreen, SettingsScreen, AboutScreen. Premium card layouts. Motivating empty states.

**Rationale:** Last because it is the largest surface area of UI changes but has the fewest technical dependencies. Beige tokens (Phase 2) are the only prerequisite. Doing this last means design polish does not block any backend work.

**Verification gate:** All redesigned screens render correctly on iPhone 15/16 form factors. Dark screens (LongevityScore, Dashboard neural sections) are visually unchanged.

### Phase 7: PhenoAge Formula Fix + Strict TypeScript Cleanup

**Produces:** Corrected `computePhenoAge()` in `src/lib/phenoAge.ts`. Zero TypeScript `any` types. Zero strict mode violations.

**Rationale:** The formula fix is isolated to one file but is high-stakes — incorrect values are currently shipped. Doing it in a dedicated phase after all structural changes are landed ensures the fix is not accidentally overwritten by concurrent changes. TypeScript cleanup is also easiest at the end when the full v2 surface is stable.

**Verification gate:** `computePhenoAge()` output matches the Levine 2018 reference values for the published test inputs. `tsc --noEmit` exits with zero errors.

---

## Key Constraints Confirmed from Codebase Audit

1. **`EXPO_PUBLIC_*` env vars work as-is.** `.env` already exists with correct prefix. Expo SDK 49+ reads these via `process.env.EXPO_PUBLIC_SUPABASE_URL` with no `app.json` changes needed. `expo-constants` is not required for this pattern.

2. **ExerciseScreen tab already exists.** `AppNavigator.tsx` line 99-106 already registers ExerciseScreen as a tab. No navigation structural change is needed — only the icon swap and the screen content update.

3. **`react-native-svg` already installed.** v15.12.1 in `package.json`. SVG icons require zero new packages.

4. **Theme already has warm beige base.** `Colors.bg` is already `#EDE8DC` (warm sand). The `Beige` extension fills in the gaps (cards, text on warm backgrounds, fine-grained token coverage) without contradicting existing values.

5. **No `useStorage` hook exists.** The codebase searches showed only `useBreathing.ts` in hooks. Screens call `AsyncStorage` directly. The `useBiomarkerSync` hook should follow the same direct-AsyncStorage pattern for reads, calling `biomarkerSync` service functions for the Supabase half.

6. **Supabase anonymous auth is appropriate.** No email/password flow is in scope. Anonymous auth creates a stable `user_id` UUID with no user friction, enabling per-user row scoping in Supabase tables.
