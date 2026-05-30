# Phase 4: Supabase Foundation - Research

**Researched:** 2026-05-30
**Domain:** Supabase JS v2, React Native session management, anonymous auth, Expo environment variables
**Confidence:** HIGH (core patterns verified against official Supabase docs and Expo docs)

---

<user_constraints>
## User Constraints (from STATE.md / Project Decisions)

### Locked Decisions
- Supabase anonymous auth only (no email/password UI) — email upgrade deferred to v3
- AsyncStorage keys preserved as offline fallback layer — Supabase is additive, not replacement
- API keys in `.env` only — `process.env.EXPO_PUBLIC_*` exclusively
- `react-native-url-polyfill` must be FIRST import in `src/lib/supabase.ts` — before any Supabase import
- Verify Supabase RLS anon read policy is set in dashboard before writing any client fetch code — silent `[]` returns if missing

### Claude's Discretion
- Where exactly to call `signInAnonymously()` — entry point vs. inside supabase.ts
- Whether to use `processLock` in the auth options
- TypeScript type strategy for the phase-4 scope (no generated DB types needed yet; no tables queried)

### Deferred Ideas (OUT OF SCOPE)
- Email/password auth (`linkIdentity()`) — v3
- RLS policies for user-owned tables (SUPA-04 through SUPA-07) — Phases 7-8
- Real-time subscriptions — out of scope for all v2 phases
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUPA-01 | Supabase client singleton (`src/lib/supabase.ts`) initialized with `storage: AsyncStorage`, `persistSession: true`, `detectSessionInUrl: false`, `autoRefreshToken: true` | Official createClient options confirmed; AsyncStorage import already in package.json |
| SUPA-02 | Anonymous auth initiated on first app launch; session UUID persists across restarts as stable `user_id` | `signInAnonymously()` creates a permanent anonymous user; persists via AsyncStorage storage option; must check session before calling |
| SUPA-03 | AppState listener calls `startAutoRefresh()` on `active` and `stopAutoRefresh()` on `background`/`inactive` to prevent JWT expiry after 1h backgrounding | Exact pattern documented and verified; known offline-start pitfall documented |
| SEC-01 | No Supabase URL or anon key exists in any source file — all read from `process.env.EXPO_PUBLIC_*`; confirmed by audit | `EXPO_PUBLIC_*` pattern confirmed; `.env` already has keys; no babel plugin needed in Expo 54 |
</phase_requirements>

---

## Summary

Phase 4 installs and configures the Supabase JS v2 client as a singleton for a React Native Expo app. The work is tightly scoped: install two packages, create one file (`src/lib/supabase.ts`), wire the AppState lifecycle listener, call `signInAnonymously()` on first launch, and verify no secrets appear in source. No database schema changes are in scope; this phase is purely client initialization and auth session management.

The core pattern is well-documented and stable. The `@supabase/supabase-js` v2 client supports React Native directly via an `auth.storage` option that accepts any AsyncStorage-compatible interface. The `react-native-url-polyfill` package (6+ years old, 1.2M weekly downloads) is the standard URL API polyfill required because React Native's JS engine lacks the browser `URL` global that Supabase internals depend on. It must be imported via `import 'react-native-url-polyfill/auto'` as the first line of `supabase.ts`.

The main non-obvious concern is an **offline-start bug**: if `startAutoRefresh()` is called while the device has no network, the failed refresh attempt can clear the persisted session, logging the user out silently. The safe mitigation is to guard the AppState listener on `NetInfo` or to only call `startAutoRefresh()` after confirming network availability — but for this phase's scope (MVP, iOS only, controlled env), the standard pattern from Supabase official docs is sufficient, with the pitfall documented for the verifier to check.

**Primary recommendation:** Create `src/lib/supabase.ts` following the official Supabase React Native quickstart pattern with `AsyncStorage` storage, add the AppState listener at the module level, and call `signInAnonymously()` from `App.tsx` after checking `getSession()` returns null. No `metro.config.js` changes are needed for Expo 54.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Supabase client singleton | App lib layer (`src/lib/`) | — | Singleton module; any service imports it; no UI concern |
| Anonymous auth (sign-in) | App entry point (`App.tsx`) | `src/lib/supabase.ts` | Needs to run after React mounts and AsyncStorage resolves; App.tsx already handles init logic |
| Session persistence across restarts | Supabase client config | AsyncStorage | `storage: AsyncStorage` in createClient — Supabase reads/writes session automatically |
| JWT auto-refresh lifecycle | App lifecycle listener | Supabase client | AppState listener belongs near App entry; calls supabase.auth methods |
| Secret isolation | `.env` + Expo build system | — | `EXPO_PUBLIC_*` vars inlined at build time by Expo CLI — not accessible at runtime as env vars after bundling |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.106.2 (latest) | Supabase client: auth, DB, storage | Official JS client; maintained by Supabase; only supported client for supabase.io |
| `react-native-url-polyfill` | 3.0.0 (latest) | Polyfills `URL` and `URLSearchParams` globals | Required by supabase-js internals; 6yr-old package, 1.2M downloads/week; recommended in Supabase official React Native docs |
| `@react-native-async-storage/async-storage` | 2.2.0 (already installed) | Session storage backend for Supabase auth | Already in package.json; used as `auth.storage` in createClient |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-sqlite` localStorage shim | via `expo-sqlite` | Alternative session storage (SQLite-backed localStorage) | Supabase Expo quickstart uses this; only needed if migrating away from AsyncStorage |

**Note:** The Expo docs quickstart recently shifted to `expo-sqlite/localStorage/install` + `localStorage` as the storage backend. However, the Supabase React Native auth quickstart still uses `AsyncStorage`. Both are valid. For this project, **AsyncStorage is the correct choice** — it is already installed, the project uses it for all other state, and AsyncStorage is the offline fallback strategy for all Supabase data in this roadmap.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `AsyncStorage` session storage | `expo-sqlite` localStorage shim | expo-sqlite approach is newer and used in Expo quickstart, but requires additional install; AsyncStorage is already present and consistent with the project's offline strategy |
| `AsyncStorage` session storage | `expo-secure-store` (AES-256 encrypted) | More secure for token storage, but requires `aes-js` and `react-native-get-random-values`; overkill for anonymous session tokens with no sensitive PII |

**Installation:**
```bash
npx expo install @supabase/supabase-js react-native-url-polyfill
```
`@react-native-async-storage/async-storage` is already installed at 2.2.0.

**Version verification (run before install):**
```bash
npm view @supabase/supabase-js version   # → 2.106.2 (verified 2026-05-28)
npm view react-native-url-polyfill version  # → 3.0.0 (verified 2025-09-24)
```

---

## Package Legitimacy Audit

> slopcheck was unavailable at research time. All packages below are tagged [ASSUMED] for ecosystem/safety provenance. Registry existence is confirmed. Both packages are well-established; planner should treat as approved but may add a checkpoint:human-verify before the install task if preferred.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `@supabase/supabase-js` | npm | ~6 yrs (2020-01-17) | High (Supabase official) | github.com/supabase/supabase-js | unavailable | [ASSUMED] Approved — official Supabase client |
| `react-native-url-polyfill` | npm | ~6 yrs (2019-11-25) | 1.27M/week | github.com/charpeni/react-native-url-polyfill | unavailable | [ASSUMED] Approved — referenced in Supabase official docs |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*slopcheck was unavailable at research time. Both packages are confirmed on the npm registry and referenced in official documentation. They are tagged [ASSUMED] per the package name provenance rule.*

---

## Architecture Patterns

### System Architecture Diagram

```
App.tsx (entry point)
    │
    ├── reads AsyncStorage @vitalspan_user_profile (existing)
    │
    └── calls initSupabaseSession() after profile load
            │
            ▼
    src/lib/supabase.ts (new singleton)
            │
            ├── import 'react-native-url-polyfill/auto'   ← FIRST LINE
            ├── createClient(url, key, { auth: { storage: AsyncStorage, ... } })
            ├── AppState.addEventListener → startAutoRefresh / stopAutoRefresh
            └── export supabase (singleton)

    initSupabaseSession() flow:
            │
            ├── supabase.auth.getSession()
            │       ├── session exists? → done (stable UUID already set)
            │       └── no session? → supabase.auth.signInAnonymously()
            │                               └── session created, UUID stored in AsyncStorage
            │
            └── (future phases import supabase and use session.user.id as user_id)
```

### Recommended Project Structure
```
src/
  lib/
    supabase.ts      # new — Supabase singleton (this phase)
    healthkit.ts     # existing
    phenoAge.ts      # existing
    labParser.ts     # existing
```

### Pattern 1: Supabase Singleton with AsyncStorage and AppState

**What:** A module-level singleton that initializes once and exports the client. The AppState listener is registered at module load time.

**When to use:** Always — singleton ensures no re-initialization across the app.

```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react-native (official)
// Note: react-native-url-polyfill MUST be the first import — project constraint

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Only register AppState listener on native — not web
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
```

**TypeScript note:** `AsyncStorage` from `@react-native-async-storage/async-storage` satisfies the `SupportedStorage` interface from supabase-js. No `as any` cast needed if the types align. If TS strict mode complains about the storage type, the cast `AsyncStorage as unknown as SupportedStorage` is acceptable (common community pattern).

**Note on `processLock`:** Some community examples pass `lock: processLock` in auth options. `processLock` is exported from `@supabase/supabase-js` and prevents concurrent auth operations in multi-process React Native environments. It is [ASSUMED] safe to include; omitting it is the official quickstart default. Recommend omitting for simplicity on this MVP phase.

### Pattern 2: Anonymous Sign-In — Check Before Create

**What:** Check for existing session before calling `signInAnonymously()`. Calling it unconditionally creates a new anonymous user on every cold start.

**When to use:** Always — called once from `App.tsx` during initialization.

```typescript
// Source: https://supabase.com/docs/guides/auth/auth-anonymous (official)
// + https://supabase.com/docs/reference/javascript/auth-signinanonymously

export async function initSupabaseSession(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Existing persisted session — stable UUID already set
    return;
  }
  // No session — create anonymous user (first launch)
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    // Non-fatal: app works offline via AsyncStorage fallback
    console.warn('[Supabase] Anonymous sign-in failed:', error.message);
  }
}
```

**Where to call it:** In `App.tsx`, alongside the existing `AsyncStorage.getItem('@vitalspan_user_profile')` init logic. Both can run in the same `useEffect`. Order: profile load first, then `initSupabaseSession()`. The session UUID is stored automatically by the Supabase client in AsyncStorage (under a supabase-specific key, separate from project keys).

### Pattern 3: Environment Variable Access

**What:** `EXPO_PUBLIC_*` vars are inlined at bundle time by Expo CLI. No special config needed in Expo 54.

```typescript
// Source: https://docs.expo.dev/guides/environment-variables/ (official)
// Works out of the box with babel-preset-expo in Expo 54 — no additional babel plugin needed

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

**The `.env` file (already exists):**
```
EXPO_PUBLIC_SUPABASE_URL=https://PROJECT-REF-REDACTED.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=REDACTED
```
Both keys are already present. `app.json` does NOT need an `extra` block for these vars — the `EXPO_PUBLIC_*` system is separate from `Constants.expoConfig.extra`. The existing `app.json` only has `extra.eas.projectId`, which is correct and unrelated.

### Anti-Patterns to Avoid
- **Calling `signInAnonymously()` unconditionally on every launch:** Creates a new anonymous user each time. Check `getSession()` first.
- **Importing anything from `@supabase/supabase-js` before `react-native-url-polyfill/auto`:** Supabase internals use `URL` on import; polyfill must load first.
- **Hardcoding Supabase URL or anon key in source:** Violates SEC-01. Use `process.env.EXPO_PUBLIC_*` exclusively.
- **Putting Supabase keys in `app.json` extra block:** Unnecessary and exposes them in a second location. `EXPO_PUBLIC_*` from `.env` is sufficient.
- **Re-initializing supabase client in multiple files:** Import the singleton from `src/lib/supabase.ts`; never call `createClient()` more than once.
- **Calling `startAutoRefresh()` without the `Platform.OS !== 'web'` guard:** Not an issue for this iOS-only app, but a best practice from official docs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token refresh after background | Custom timer / polling | `supabase.auth.startAutoRefresh()` + AppState listener | Handles JWT expiry, network recovery, token rotation — all edge cases handled |
| Session persistence across restarts | Custom AsyncStorage read/write for auth tokens | `auth.storage: AsyncStorage` in createClient | Supabase manages its own session storage keys; no manual serialization needed |
| Anonymous user creation | Custom UUID generation + local storage | `signInAnonymously()` | Generates server-side user, issues JWT, handles refresh tokens, enables future `linkIdentity()` for v3 email upgrade |
| URL parsing polyfill | Custom URL class | `react-native-url-polyfill` | WHATWG-spec implementation; 1.2M downloads/week; single import patches global |

**Key insight:** The Supabase JS client handles every auth lifecycle concern internally once configured correctly. The entire implementation is ~30 lines of code plus a function call in App.tsx. Resist the urge to build wrapper layers.

---

## Runtime State Inventory

> This is a greenfield installation (new singleton, new packages). No rename or migration is in scope. Omitted per instructions.

---

## Common Pitfalls

### Pitfall 1: signInAnonymously Creates Duplicate Users on Every Restart
**What goes wrong:** Every cold start creates a new anonymous user in Supabase Auth, so the user_id changes between sessions. Later phases that use user_id to scope data (SUPA-06, SUPA-07) will get empty results.
**Why it happens:** Developer calls `signInAnonymously()` in `useEffect` without checking if a session already exists. The persisted session is in AsyncStorage but ignored.
**How to avoid:** Always call `supabase.auth.getSession()` first. Only call `signInAnonymously()` if `session` is null.
**Warning signs:** Check Supabase dashboard Auth > Users — if you see many `Anonymous` users being created rapidly, this bug is present.

### Pitfall 2: URL Not Defined Error (Missing Polyfill)
**What goes wrong:** `TypeError: URL is not a constructor` or `ReferenceError: URL is not defined` at runtime when supabase-js initializes.
**Why it happens:** React Native's Hermes/JSC engine does not provide a global `URL`. Supabase-js uses it internally on module load.
**How to avoid:** `import 'react-native-url-polyfill/auto'` must be the ABSOLUTE FIRST import in `supabase.ts`. No other import can precede it.
**Warning signs:** Error appears on first import of supabase.ts, not on any specific operation.

### Pitfall 3: Session Lost When App Starts Offline
**What goes wrong:** User opens app without network. The persisted session exists in AsyncStorage but `startAutoRefresh()` triggers immediately, fails (no network), and the Supabase auth state machine interprets the failed refresh as an expired session, clearing it. User is effectively signed out.
**Why it happens:** The AppState listener fires on app launch with state `active`, triggering `startAutoRefresh()` before any network is confirmed available. Known open issue in Supabase auth-js.
**How to avoid:** For MVP Phase 4 scope (dev/TestFlight with consistent network), the standard pattern is acceptable. For production hardening: wrap `startAutoRefresh()` in a network reachability check using `@react-native-community/netinfo`. Document this as a known limitation for Phase 4 to revisit before public release.
**Warning signs:** User reports being signed out after opening app in airplane mode.

### Pitfall 4: Supabase Anonymous Auth Not Enabled in Dashboard
**What goes wrong:** `signInAnonymously()` returns an error: "Anonymous sign-ins are disabled." The call fails silently if error handling is not in place.
**Why it happens:** Anonymous sign-ins require explicit activation in the Supabase dashboard: Authentication > Settings > User Signups > Enable Anonymous Sign-Ins.
**How to avoid:** Enable the setting before running the app. This is a **prerequisite step** for this phase that requires manual action in the Supabase dashboard.
**Warning signs:** `signInAnonymously()` returns `error.message` containing "disabled" or "not enabled".

### Pitfall 5: RLS Blocks All Reads (Future Phases)
**What goes wrong:** `supabase.from('table').select('*')` returns `[]` with no error. Developer assumes table is empty.
**Why it happens:** Row Level Security is enabled by default on all Supabase tables. If no RLS policy permits `anon` role reads, all queries return empty silently.
**How to avoid:** For Phase 4, no table reads are in scope. Document for Phase 7 (SUPA-04): create `SELECT` RLS policy for `anon` role on `biomarker_definitions` and `exercises` before writing any query code.
**Warning signs:** Empty array returned when table has seed data; no error object.

### Pitfall 6: process.env.EXPO_PUBLIC_* is undefined at Runtime After Build
**What goes wrong:** App works in dev but crashes in production EAS build because `process.env.EXPO_PUBLIC_SUPABASE_URL` is `undefined`.
**Why it happens:** EAS builds read `.env` files only during local dev (via Expo CLI). For production builds, environment variables must be set as EAS Secrets via `eas secret:create`.
**How to avoid:** For Phase 4 (dev/simulator only), `.env` file is sufficient. Add defensive `!` assertion or runtime check in `supabase.ts`. Document for EAS/TestFlight: set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as EAS build secrets before any production build.
**Warning signs:** `createClient(undefined, undefined, ...)` — supabase client throws on initialization.

---

## Code Examples

### Complete src/lib/supabase.ts (verified pattern)
```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react-native (official)
// Source: https://supabase.com/blog/react-native-authentication (official Supabase blog)
// Project constraint: react-native-url-polyfill MUST be first import

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Manage token refresh lifecycle with app foreground/background state
// Only on native — not needed (or available) on web
if (Platform.OS !== 'web') {
  // Register once at module load time
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
```

### initSupabaseSession helper (called from App.tsx)
```typescript
// Check existing session before creating anonymous user
// Prevents duplicate anonymous users on every cold start
export async function initSupabaseSession(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Session persisted across restart — user_id is stable
      return;
    }
    // First launch — create anonymous user
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      // Non-fatal: app continues in offline/AsyncStorage-only mode
      console.warn('[Supabase] Anonymous sign-in failed:', error.message);
    }
  } catch (e) {
    // Network unavailable on first launch — acceptable, retry on next foreground
    console.warn('[Supabase] Session init error:', e);
  }
}
```

### App.tsx integration point
```typescript
// Add alongside existing AsyncStorage.getItem('@vitalspan_user_profile') in useEffect
useEffect(() => {
  const init = async () => {
    // Existing: load user profile
    const raw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
    if (raw) {
      const profile = JSON.parse(raw);
      setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
    } else {
      setInitialRoute('Landing');
    }
    // New: init Supabase session (fire and continue — non-blocking for UI)
    initSupabaseSession().catch(() => null);
  };
  init();
}, []);
```

### SEC-01 Audit Command
```bash
# Run from project root — should return zero matches
grep -rn "PROJECT-REF-REDACTED\|sb_publishable_" src/ App.tsx --include="*.ts" --include="*.tsx"
# Also check for any literal supabase URL pattern
grep -rn "supabase\.co" src/ App.tsx --include="*.ts" --include="*.tsx"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `anon` / `service_role` key names | `sb_publishable_xxx` / `sb_secret_xxx` key names | Supabase 2024-2025 | New format recommended; old format works until end of 2026; existing `.env` already uses new format |
| `expo-sqlite/localStorage/install` for session storage | Still valid; `AsyncStorage` also valid | Expo 2025 quickstart update | Expo's own guide shifted to expo-sqlite; Supabase's guide still shows AsyncStorage. Both work. |
| `react-native-url-polyfill` imported in entry `index.js` | Imported as first line in `supabase.ts` | Community convergence | Keeps polyfill co-located with the code that needs it; project constraint aligns with this |

**Deprecated/outdated:**
- `babel-plugin-transform-inline-environment-variables`: Replaced by Expo's built-in `EXPO_PUBLIC_*` system. Do not add.
- `@expo/config` + `Constants.manifest.extra`: Older pattern for env vars. `EXPO_PUBLIC_*` + `process.env` is the current approach.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `processLock` from `@supabase/supabase-js` is optional for single-process React Native apps | Standard Stack / Code Examples | If required, omitting it could cause rare race conditions in auth operations. Low risk for MVP. |
| A2 | `AsyncStorage` type satisfies `SupportedStorage` interface in supabase-js 2.106.x without a cast | Code Examples | If types diverge, TS strict build fails. Fix: add `as unknown as SupportedStorage` cast. |
| A3 | Both packages (`@supabase/supabase-js`, `react-native-url-polyfill`) are legitimate (slopcheck unavailable) | Package Legitimacy Audit | Both are 6+ years old with millions of downloads and official documentation references. Risk is negligible. |

**If this table is empty:** Not applicable — three low-risk assumptions documented above.

---

## Open Questions (RESOLVED)

1. **Anonymous sign-in dashboard toggle state**
   - What we know: Anonymous sign-ins must be enabled in Supabase dashboard (Auth > Settings > User Signups).
   - What's unclear: Whether it is already enabled for project `PROJECT-REF-REDACTED`.
   - Recommendation: Make enabling this a prerequisite task in Wave 0 of the plan. If not enabled, `signInAnonymously()` returns an error immediately.
   - RESOLVED: Made a blocking `checkpoint:human-verify` task in P2 Task 2 Step 1 — executor must confirm toggle is enabled before verifying session persistence.

2. **TypeScript type for the Supabase client**
   - What we know: `createClient<Database>()` requires a generated `Database` type from `supabase gen types`. No tables are queried in Phase 4.
   - What's unclear: Whether to add the generic now (as `createClient<never>()` or a placeholder) or wait for Phase 7 when tables are seeded.
   - Recommendation: Omit the Database generic in Phase 4. Add it in Phase 7 alongside `supabase gen types`. Strict TS will still pass without the generic.
   - RESOLVED: Omit Database generic in Phase 4; add in Phase 7 with `supabase gen types`.

3. **AppState listener cleanup**
   - What we know: `AppState.addEventListener` in React Native returns a subscription object that should be removed on cleanup.
   - What's unclear: Module-level listeners (outside React components) cannot be cleaned up. Official Supabase examples register it at module level without cleanup.
   - Recommendation: Follow the official pattern (module-level, no cleanup). This is a singleton and the listener lives for the app's lifetime.
   - RESOLVED: Follow official pattern — module-level, no cleanup, singleton lifetime.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@react-native-async-storage/async-storage` | Supabase session storage | Yes (in package.json) | 2.2.0 | — |
| `node` / `npm` | Package install | Yes | n/a | — |
| Supabase project + `.env` keys | Client initialization | Yes (`.env` exists with both keys) | — | — |
| Supabase dashboard access | Enable anonymous auth | Requires manual step | — | Cannot sign in anonymously without it |
| Expo CLI | Build / start | Yes (expo ~54.0.0) | ~54.0.0 | — |

**Missing dependencies with no fallback:**
- Anonymous sign-ins must be enabled in the Supabase project dashboard before the feature works. This is a manual prerequisite, not installable.

**Missing dependencies with fallback:**
- None — all required packages are either installable or already present.

---

## Validation Architecture

> `workflow.nyquist_validation` is `false` in `.planning/config.json`. This section is omitted per config.

---

## Security Domain

> `security_enforcement` is not set to false — including this section.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Supabase anonymous auth (`signInAnonymously()`); token stored in AsyncStorage |
| V3 Session Management | Yes | Supabase handles JWT issuance and refresh; `persistSession: true`; AppState lifecycle listener |
| V4 Access Control | Partial | RLS not configured in Phase 4 scope; no table reads in this phase |
| V5 Input Validation | No | No user input in this phase |
| V6 Cryptography | No | Supabase handles JWT cryptography server-side; no hand-rolled crypto |

### Known Threat Patterns for Supabase + React Native

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Hardcoded API key in source | Information Disclosure | `process.env.EXPO_PUBLIC_*` exclusively; `grep` audit as SEC-01 verification |
| Leaked anon key in git history | Information Disclosure | `.env` in `.gitignore`; audit `git log` for accidental commits |
| Anonymous user enumeration / abuse | Spoofing | Supabase IP-rate-limits anonymous sign-ins at 30/hour; acceptable for MVP |
| Session not cleared on sign-out | Elevation of Privilege | Not applicable — anonymous sessions have no privileged data in Phase 4 |
| JWT silently expired after background | Denial of Service | AppState listener with `startAutoRefresh()`/`stopAutoRefresh()` pattern |

**Note on anon key security:** The Supabase anon/publishable key is intentionally public-safe — its access is governed by Row Level Security, not key secrecy. Supabase's own docs state "these variables are safe to expose in your Expo app since Supabase has Row Level Security enabled." The `EXPO_PUBLIC_*` requirement (SEC-01) prevents the key from appearing in source control, not from appearing in the bundle — this is the intended security model.

---

## Sources

### Primary (HIGH confidence)
- [Supabase React Native Auth Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native) — createClient options, AppState pattern, package list
- [Supabase Expo React Native Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) — npm install command, supabase.ts template
- [Supabase Anonymous Sign-Ins Guide](https://supabase.com/docs/guides/auth/auth-anonymous) — signInAnonymously() API, dashboard enable requirement
- [Expo Environment Variables Guide](https://docs.expo.dev/guides/environment-variables/) — EXPO_PUBLIC_* mechanics, no babel plugin needed
- [Supabase React Native Authentication Blog](https://supabase.com/blog/react-native-authentication) — AsyncStorage pattern confirmation
- [Supabase Build User Management with Expo](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native) — LargeSecureStore alternative, confirmed AsyncStorage approach

### Secondary (MEDIUM confidence)
- [Supabase JS Issues #1203 — AppState/iOS background](https://github.com/supabase/supabase-js/issues/1203) — offline-start bug root cause
- [Supabase Discussion #36906 — Session lost offline](https://github.com/orgs/supabase/discussions/36906) — confirms offline-start pitfall
- `npm view @supabase/supabase-js version` → 2.106.2 (verified 2026-05-30)
- `npm view react-native-url-polyfill version` → 3.0.0 (verified 2026-05-30)
- [react-native-url-polyfill GitHub](https://github.com/charpeni/react-native-url-polyfill) — maintainer, downloads, description

### Tertiary (LOW confidence)
- Community examples showing `processLock` option — not in official docs; flagged as [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — packages verified on npm registry; official docs confirm exact install command and createClient options
- Architecture: HIGH — singleton pattern and AppState listener are the official Supabase React Native pattern
- Pitfalls: HIGH (most) / MEDIUM (offline-start bug) — offline-start pitfall confirmed by open GitHub issue with root cause analysis

**Research date:** 2026-05-30
**Valid until:** 2026-06-30 (supabase-js v2 is stable; no breaking changes expected within 30 days)
