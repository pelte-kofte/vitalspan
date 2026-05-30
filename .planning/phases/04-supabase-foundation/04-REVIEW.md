---
phase: 04-supabase-foundation
reviewed: 2026-05-30T19:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/lib/supabase.ts
  - App.tsx
  - package.json
  - .env.example
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-05-30T19:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

This phase introduces the Supabase client singleton, anonymous auth initialization, two new package dependencies, and the `.env.example` template. The source files themselves (`src/lib/supabase.ts`, `App.tsx`) are clean of hardcoded credentials and follow the project's TypeScript conventions. However, two critical issues were found: the real Supabase anon key has been committed to the git repository inside planning documents, and the `AppState` listener leaks a subscription that is never removed. Three warnings cover a missing runtime guard for absent env vars, a bare `JSON.parse` that can crash the app splash screen, and the fire-and-forget suppression of all session init errors in production.

---

## Critical Issues

### CR-01: Real Supabase anon key committed to git history in planning documents

**File:** `.planning/phases/04-supabase-foundation/04-PATTERNS.md` (committed in `952e4a9`) and `.planning/phases/04-supabase-foundation/04-RESEARCH.md` (committed in `376f33d`)

**Issue:** The actual Supabase anon key `REDACTED` and the project ref `PROJECT-REF-REDACTED` appear verbatim in two planning documents that are tracked in git history. The `.env` file itself is correctly gitignored, but the same credential was pasted into planning artifacts which were then committed. SEC-01 requires zero hardcoded credentials in any source file; git-tracked planning files are part of the repository and expose the same risk. Any clone of this repository contains the key in full.

**Fix:** This requires two actions:

1. **Rotate the key immediately.** Log into `https://supabase.com/dashboard/project/PROJECT-REF-REDACTED/settings/api` and regenerate the anon key. The current key is now compromised regardless of further git operations.

2. **Remove the key from git history.** Use `git filter-repo` (preferred over `git filter-branch`) to rewrite the commits that introduced the credential:
   ```bash
   pip install git-filter-repo
   git filter-repo --path .planning/phases/04-supabase-foundation/04-PATTERNS.md --invert-paths
   git filter-repo --path .planning/phases/04-supabase-foundation/04-RESEARCH.md --invert-paths
   ```
   Or scrub only the credential string while preserving the files:
   ```bash
   git filter-repo --replace-text <(echo "REDACTED==>REDACTED")
   ```
   After rewriting history, force-push all branches and ensure any existing clones are discarded or updated.

3. **Going forward**, planning documents must never contain real credentials. Use placeholder values like `sb_publishable_...` (the truncated form already used in `STACK.md` is correct).

---

### CR-02: AppState listener is registered without storing the subscription — listener leaks on module reload

**File:** `src/lib/supabase.ts:36-43`

**Issue:** `AppState.addEventListener` in React Native >= 0.65 returns a `NativeEventSubscription` that must be stored and its `.remove()` method called to deregister it. The current code discards the return value:

```typescript
// current — subscription returned value is discarded
AppState.addEventListener('change', (nextAppState) => { ... })
```

In Expo Go / Fast Refresh / hot reload scenarios, the module is re-evaluated and a second (third, fourth…) listener is silently added each time. Every active listener calls `startAutoRefresh()` or `stopAutoRefresh()` on every app-state change. While `stopAutoRefresh()` is idempotent, redundant `startAutoRefresh()` calls on an already-refreshing client are undefined in behavior and can produce spurious token refreshes or log noise. More critically, there is no mechanism to ever clean this up during the module's lifetime.

**Fix:** Store the subscription at module scope so it can be cleaned up if needed, and guard against double-registration:

```typescript
// src/lib/supabase.ts — replace the AppState block with:
let _appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null

if (Platform.OS !== 'web' && !_appStateSubscription) {
  _appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}
```

The `!_appStateSubscription` guard prevents duplicate registration across Fast Refresh cycles. Storing the reference also enables cleanup in tests.

---

## Warnings

### WR-01: Non-null assertion on env vars gives a misleading TypeScript guarantee — crashes at runtime if .env is absent

**File:** `src/lib/supabase.ts:20-21`

**Issue:** The `!` non-null assertion tells the TypeScript compiler the values are definitely strings, but if the `.env` file is missing (e.g., a fresh clone without `.env`, a CI environment, or an EAS build without secrets configured), `process.env.EXPO_PUBLIC_SUPABASE_URL` is `undefined` at runtime. `createClient(undefined!, undefined!, ...)` will throw deep inside the Supabase library with an opaque error rather than a clear developer message. Strict mode does not prevent this because `process.env.*` is typed as `string | undefined` and `!` silences the compiler without inserting a runtime check.

```typescript
// current — silent undefined crash
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
```

**Fix:** Add explicit runtime guards with actionable error messages:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Vitalspan] Missing Supabase env vars. ' +
    'Copy .env.example to .env and fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, { ... })
```

This surfaces the real problem immediately on startup instead of an obscure internal Supabase error.

---

### WR-02: `JSON.parse(raw)` in App.tsx is not wrapped in try/catch — a corrupt profile crashes the loading screen

**File:** `App.tsx:18`

**Issue:** `raw` is the string stored in `@vitalspan_user_profile`. If the stored value is corrupted (truncated write, manual edit, AsyncStorage migration), `JSON.parse(raw)` throws a `SyntaxError`. The outer `init` async function has no `try/catch`, so the thrown error is an unhandled promise rejection and `setInitialRoute` is never called. The app stays on the loading spinner (`ActivityIndicator`) indefinitely — a complete hang with no recovery path for the user.

```typescript
// App.tsx:15-25 — no error handling around JSON.parse
const init = async () => {
  const raw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
  if (raw) {
    const profile = JSON.parse(raw);   // <-- can throw SyntaxError
    setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
  } else {
    setInitialRoute('Landing');
  }
  initSupabaseSession().catch(() => null);
};
```

**Fix:** Wrap the parse in a try/catch and fall back to `'Landing'` on corruption:

```typescript
const init = async () => {
  try {
    const raw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
    if (raw) {
      const profile = JSON.parse(raw) as { onboardingComplete?: boolean };
      setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
    } else {
      setInitialRoute('Landing');
    }
  } catch {
    // Corrupt profile — treat as new user
    setInitialRoute('Landing');
  }
  initSupabaseSession().catch(() => null);
};
```

---

### WR-03: `initSupabaseSession().catch(() => null)` silently discards errors in production

**File:** `App.tsx:23`

**Issue:** The `.catch(() => null)` swallows all errors from `initSupabaseSession` without any logging. `initSupabaseSession` itself already catches and `console.warn`s internal errors, but if the function throws for an unexpected reason outside its own try/catch boundary, the error is discarded entirely in production with no trace. Combined with the app proceeding to render immediately (the call is fire-and-forget — `setInitialRoute` has already been called before `initSupabaseSession` is invoked), a silent session failure means the user runs the entire app without a Supabase session and no diagnostic is available.

This is acceptable as a design choice for resilience, but the swallowing should at minimum log a warning to aid debugging:

```typescript
// App.tsx:23
initSupabaseSession().catch((err) => {
  console.warn('[App] initSupabaseSession unexpected error:', err)
})
```

---

## Info

### IN-01: `package.json` uses caret ranges for security-critical dependencies

**File:** `package.json:17,37`

**Issue:** Both `@supabase/supabase-js` (`^2.106.2`) and `react-native-url-polyfill` (`^3.0.0`) use caret (`^`) version ranges, which allow automatic minor and patch upgrades. For a security-sensitive library like the Supabase auth client that handles user sessions and tokens, an upstream patch release with a breaking behavioral change or a supply-chain compromise would be pulled in automatically on the next `npm install` in a clean environment. The project already uses exact pinning for several Expo packages (`react-native-svg: 15.12.1`, `react-native-worklets: 0.5.1`).

**Fix:** Pin to exact versions once validated, consistent with other security-sensitive dependencies in the project:

```json
"@supabase/supabase-js": "2.106.2",
"react-native-url-polyfill": "3.0.0",
```

---

_Reviewed: 2026-05-30T19:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
