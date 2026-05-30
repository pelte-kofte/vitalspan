# Phase 4: Supabase Foundation - Pattern Map

**Mapped:** 2026-05-30
**Files analyzed:** 5
**Analogs found:** 4 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/supabase.ts` | lib/singleton | request-response + event-driven | `src/lib/healthkit.ts` | role-match |
| `App.tsx` | entry point | request-response | `App.tsx` (existing) | exact (modify-in-place) |
| `package.json` | config | — | `package.json` (existing) | exact (modify-in-place) |
| `.env` | config/secrets | — | `.env` (existing, verified) | exact (verify-only) |
| `.env.example` | config/docs | — | none | no analog |

---

## Pattern Assignments

### `src/lib/supabase.ts` (lib/singleton, request-response + event-driven)

**Analog:** `src/lib/healthkit.ts`

**Imports pattern** (`src/lib/healthkit.ts` lines 16–18):
```typescript
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
```
Copy the AsyncStorage import verbatim. Add `AppState` instead of `Alert` from `react-native`. Add the polyfill as the absolute first import (project constraint).

**File-top comment block** (`src/lib/healthkit.ts` lines 1–14):
```typescript
/**
 * HealthKit integration layer.
 *
 * STATUS: Simulator/mock-first.
 * ...
 */
```
Replicate this JSDoc header style for `supabase.ts`. The comment block must explain what the file is, what packages it requires, and note the polyfill constraint.

**Storage constant pattern** (`src/lib/healthkit.ts` lines 19–20):
```typescript
const STORAGE_KEY = '@vitalspan_health_data';
const PERMISSIONS_KEY = '@vitalspan_health_permissions';
```
The supabase client does not need named storage keys (Supabase manages its own keys internally). Replicate the pattern of `const` declarations at module top for the URL and anon key:
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

**Typed async function signature** (`src/lib/healthkit.ts` lines 62–68, 175–176):
```typescript
export async function loadPermissionStatus(): Promise<PermissionStatus | null> {
  try {
    const raw = await AsyncStorage.getItem(PERMISSIONS_KEY);
    return raw ? (JSON.parse(raw) as PermissionStatus) : null;
  } catch {
    return null;
  }
}

export async function syncHealthData(): Promise<SyncResult> {
```
`initSupabaseSession()` follows this exact pattern: `export async function initSupabaseSession(): Promise<void>`. Return type is explicit, function is exported, try/catch wraps the async body.

**Error handling pattern** (`src/lib/healthkit.ts` lines 63–68, 182–184):
```typescript
try {
  const raw = await AsyncStorage.getItem(PERMISSIONS_KEY);
  return raw ? (JSON.parse(raw) as PermissionStatus) : null;
} catch {
  return null;
}
```
For `initSupabaseSession()` the catch block uses `console.warn` (non-fatal, app continues in offline mode). This matches the project's pattern of never throwing from lib functions — always absorb errors and return a safe fallback.

**Platform guard pattern** (`src/lib/healthkit.ts` lines 57–59):
```typescript
export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios';
}
```
The AppState listener in `supabase.ts` uses the same `Platform.OS` check but as an inline guard:
```typescript
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => { ... });
}
```

**Complete `src/lib/supabase.ts` (from RESEARCH.md Pattern 1 + Pattern 2, shaped to healthkit.ts conventions):**
```typescript
// FIRST IMPORT — must precede all other imports, including supabase-js
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

// Manage JWT refresh lifecycle with app foreground/background state.
// Native only — AppState is not available in web environments.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export async function initSupabaseSession(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return;
    }
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn('[Supabase] Anonymous sign-in failed:', error.message);
    }
  } catch (e) {
    console.warn('[Supabase] Session init error:', e);
  }
}
```

---

### `App.tsx` (entry point, request-response — modify in place)

**Analog:** `App.tsx` (the file being modified)

**Existing init pattern** (`App.tsx` lines 13–24):
```typescript
useEffect(() => {
  AsyncStorage.getItem('@vitalspan_user_profile')
    .then(raw => {
      if (raw) {
        const profile = JSON.parse(raw);
        setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
      } else {
        setInitialRoute('Landing');
      }
    })
    .catch(() => setInitialRoute('Landing'));
}, []);
```
This is a `.then()`-chained async call inside `useEffect`. The modification wraps it into an `async` inner function to allow `await` syntax alongside the new `initSupabaseSession()` call. The existing behavior must be preserved exactly — profile load determines `initialRoute`, Supabase init is fire-and-forget after that.

**Target pattern after modification** (modeled after RESEARCH.md Architecture Patterns, shaped to match App.tsx's own StyleSheet + Colors conventions):
```typescript
import { initSupabaseSession } from './src/lib/supabase';

// ... (existing imports unchanged) ...

useEffect(() => {
  const init = async () => {
    // Existing: load user profile and determine initial route
    const raw = await AsyncStorage.getItem('@vitalspan_user_profile').catch(() => null);
    if (raw) {
      const profile = JSON.parse(raw);
      setInitialRoute(profile.onboardingComplete ? 'Main' : 'Landing');
    } else {
      setInitialRoute('Landing');
    }
    // New: init Supabase session — fire and continue, non-blocking for UI
    initSupabaseSession().catch(() => null);
  };
  init();
}, []);
```
Note: `initSupabaseSession().catch(() => null)` is intentional — failure is non-fatal and must never block the UI initialization path.

**StyleSheet convention** (`App.tsx` lines 43–50 — unchanged):
```typescript
const s = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});
```
The `s` name and bottom-of-file placement must be preserved. No new styles are needed for this phase.

---

### `package.json` (config — modify in place)

**Analog:** `package.json` (existing)

**Existing async-storage entry** (confirms the install target):
```json
"@react-native-async-storage/async-storage": "2.2.0"
```
This is already installed. The install command adds two new entries:
```bash
npx expo install @supabase/supabase-js react-native-url-polyfill
```
No manual `package.json` editing is needed — `npx expo install` writes the correct Expo-compatible versions automatically.

---

### `.env` (config/secrets — verify only, no edits)

Both keys are already present and confirmed:
```
EXPO_PUBLIC_SUPABASE_URL=https://PROJECT-REF-REDACTED.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=REDACTED
```
The planner must include a verify-only task (not a write task) for `.env`. The SEC-01 audit command to confirm no keys appear in source:
```bash
grep -rn "PROJECT-REF-REDACTED\|sb_publishable_" src/ App.tsx --include="*.ts" --include="*.tsx"
```
Expected output: zero matches.

---

### `.env.example` (config/docs — new file, no analog)

No analog exists. Create with placeholder values mirroring `.env` key names:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Shared Patterns

### AsyncStorage import
**Source:** `src/lib/healthkit.ts` line 17
**Apply to:** `src/lib/supabase.ts`
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
```

### Non-fatal error handling (console.warn + safe return)
**Source:** `src/lib/healthkit.ts` lines 63–68 and lines 117–119
**Apply to:** `initSupabaseSession()` in `src/lib/supabase.ts`
```typescript
// Pattern: catch silently, return safe fallback or void, never throw from lib functions
} catch {
  return null;
}
// Or for console.warn variant:
if (error) {
  console.warn('[Vitalspan] ...:', error.message);
}
```

### Platform guard
**Source:** `src/lib/healthkit.ts` lines 57–59
**Apply to:** AppState listener block in `src/lib/supabase.ts`
```typescript
if (Platform.OS !== 'web') {
  // native-only code
}
```

### useEffect async inner function
**Source:** `App.tsx` lines 13–24 (pattern to evolve to)
**Apply to:** Modified `App.tsx` useEffect
```typescript
useEffect(() => {
  const init = async () => {
    // ... await calls ...
  };
  init();
}, []);
```
This is the standard pattern for async work inside `useEffect` — avoids returning a Promise from the effect callback.

### Exported typed async function
**Source:** `src/lib/healthkit.ts` lines 62, 175, 196, 207
**Apply to:** `initSupabaseSession()` in `src/lib/supabase.ts`
```typescript
export async function functionName(): Promise<ReturnType> {
```
All public lib functions are exported and have explicit return types. No `any`. No implicit `Promise<any>`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `.env.example` | config/docs | — | No `.env.example` exists in the project; planner should create with placeholder values |

---

## Metadata

**Analog search scope:** `src/lib/`, `App.tsx`, project root config files
**Files scanned:** `src/lib/healthkit.ts`, `src/lib/phenoAge.ts`, `src/lib/labParser.ts`, `App.tsx`, `package.json`, `.env`
**AppState usage in existing codebase:** Zero occurrences — `supabase.ts` will be the first file to use it
**Pattern extraction date:** 2026-05-30
