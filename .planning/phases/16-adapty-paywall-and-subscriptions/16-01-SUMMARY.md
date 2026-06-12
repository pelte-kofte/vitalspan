---
phase: 16-adapty-paywall-and-subscriptions
plan: 01
subsystem: payments
tags: [adapty, react-native-adapty, paywall, subscriptions, in-app-purchase]

# Dependency graph
requires:
  - phase: 15-auth-and-login
    provides: "Supabase auth userId available for adapty.identify()"
provides:
  - "react-native-adapty SDK installed and registered as Expo config plugin"
  - "src/lib/adapty.ts singleton with activationPromise, identifyAdaptyUser, fetchPremiumStatus"
  - "EXPO_PUBLIC_ADAPTY_API_KEY documented in .env.example"
affects: [PremiumContext.tsx, PaywallScreen, App.tsx, all premium-gated features]

# Tech tracking
tech-stack:
  added: [react-native-adapty@^3.17.1, tslib@^2.8.1]
  patterns:
    - "Module-level activation promise (IIFE) — SDK readiness without AppState coupling"
    - "Never-throws async helpers — try/catch + console.warn + safe fallback return"
    - "EXPO_PUBLIC_* env var guard — console.error on missing key, fallback to empty string"

key-files:
  created:
    - src/lib/adapty.ts
  modified:
    - app.json
    - .env.example
    - package.json
    - package-lock.json

key-decisions:
  - "Used npx expo install (not npm install) for Expo SDK compatibility resolution"
  - "Activation promise is module-level IIFE — callers await it, no AppState listener in this file"
  - "fetchPremiumStatus returns false on all errors — defaults to free experience, never locks users out"
  - "No AdaptyPaywallProduct import needed in singleton — product types used in PaywallScreen only"

patterns-established:
  - "activationPromise pattern: all Adapty helpers await activationPromise before SDK calls"
  - "Never-throws SDK calls: all catch blocks log with console.warn and return safe fallback"

requirements-completed: [PAY-01]

# Metrics
duration: 8min
completed: 2026-06-12
---

# Phase 16 Plan 01: Install react-native-adapty + Singleton Summary

**react-native-adapty SDK installed via expo install, registered as Expo config plugin, and adapty.ts singleton created with module-level activation promise and three strictly-typed helper exports**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-12T16:51:00Z
- **Completed:** 2026-06-12T16:59:43Z
- **Tasks:** 1 (Task 1 was pre-approved; Task 2 executed)
- **Files modified:** 5

## Accomplishments
- Installed `react-native-adapty@^3.17.1` and `tslib@^2.8.1` via `npx expo install` for SDK-compatible versions
- `expo install` automatically detected and added `"react-native-adapty"` to the `plugins` array in app.json; HealthKit entry unchanged
- Documented `EXPO_PUBLIC_ADAPTY_API_KEY` in `.env.example` with descriptive placeholder
- Created `src/lib/adapty.ts` mirroring the `supabase.ts` singleton pattern exactly: env var guard, IIFE activation promise, two never-throws async helpers, strict TypeScript with no `any` types

## Task Commits

Each task was committed atomically:

1. **Task 2: Install Packages + Config Plugin + Singleton** - `e331eec` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `src/lib/adapty.ts` — Adapty singleton: `activationPromise`, `identifyAdaptyUser(userId)`, `fetchPremiumStatus()` — all strictly typed, no AppState listener
- `app.json` — plugins array now: `["expo-font", ["@kingstinct/react-native-healthkit", {...}], "react-native-adapty"]`
- `.env.example` — Added `EXPO_PUBLIC_ADAPTY_API_KEY=your_adapty_public_sdk_key_here`
- `package.json` — Added `"react-native-adapty": "^3.17.1"`, `"tslib": "^2.8.1"`
- `package-lock.json` — Lockfile updated

## Decisions Made
- `npx expo install` used instead of `npm install` — Expo resolves compatible React Native version constraints
- The activation IIFE is module-level so callers don't need to orchestrate SDK readiness; they simply `await activationPromise`
- No AppState listener placed in adapty.ts — that pattern belongs in PremiumContext.tsx (mirrors plan spec and supabase.ts pattern split)
- `fetchPremiumStatus` returns `false` on any SDK error — safe default ensures users see free experience rather than crashes or access denials

## Deviations from Plan

None — plan executed exactly as written.

Note: `expo install` auto-added the plugin to app.json as part of its install flow. The plan's Step 2 (manually add plugin) was already accomplished by Step 1. This is correct behavior, not a deviation — the end state matches the plan spec exactly.

## Issues Encountered

None. TypeScript compilation (`npx tsc --noEmit`) exits 0 with no errors.

## User Setup Required

Before building the dev client, the developer must:

1. Add the actual Adapty Public SDK key to the local `.env` file:
   ```
   EXPO_PUBLIC_ADAPTY_API_KEY=public_live_xxxxxxxxxxxxx
   ```
   Obtain from: Adapty dashboard → App Settings → API Keys → **Public SDK key** (not the secret admin key)

2. Run `npx expo prebuild --clean` locally (clears `ios/` and regenerates native project with the new config plugin registered)

3. Run `cd ios && pod install && cd ..` to install the Adapty native CocoaPod

4. Rebuild the dev client: `npx expo run:ios`

## Next Phase Readiness
- `src/lib/adapty.ts` singleton is ready for import in Plan 16-02 (PremiumContext.tsx) and Plan 16-03 (PaywallScreen.tsx)
- `activationPromise` is the entry point for App.tsx startup integration (Plan 16-04)
- No blockers — all acceptance criteria met and TypeScript compiles clean

---
*Phase: 16-adapty-paywall-and-subscriptions*
*Completed: 2026-06-12*
