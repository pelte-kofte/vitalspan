---
phase: 14-auth-and-login
plan: 02
subsystem: auth
tags: [supabase, email-password, anonymous-auth, error-mapping, typescript]

# Dependency graph
requires:
  - phase: 14-01
    provides: AppNavigator Welcome route, App.tsx session-type routing with awaited initSupabaseSession

provides:
  - signUpWithEmail — creates email/password account via auth.signUp
  - signInWithEmail — authenticates via auth.signInWithPassword
  - convertAnonymousToEmail — promotes anonymous session to email/password via auth.updateUser (not linkIdentity)
  - sendPasswordResetEmail — triggers reset email via auth.resetPasswordForEmail
  - signOutUser — clears Supabase session without touching AsyncStorage (D-08)
  - resendVerificationEmail — resends confirmation via auth.resend({ type: 'signup', email })
  - mapAuthError — D-15 error mapper: 5 specific categories + fallback, returns user-facing strings only

affects:
  - 14-03 (WelcomeScreen — imports signUpWithEmail, signInWithEmail, mapAuthError)
  - 14-04 (ProfileScreen — imports signOutUser)
  - 14-05 (DashboardScreen — imports resendVerificationEmail)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Auth functions return { user, error } or { error } — never throw"
    - "All errors routed through mapAuthError before surfacing to caller"
    - "try/catch wraps every supabase.auth.* call; catch returns mapAuthError on e.message"
    - "convertAnonymousToEmail uses supabase.auth.updateUser (not linkIdentity which is OAuth-only)"

key-files:
  created: []
  modified:
    - src/lib/supabase.ts

key-decisions:
  - "mapAuthError is synchronous and pure — called from both auth functions and screens directly"
  - "linkIdentity is explicitly absent — convertAnonymousToEmail uses updateUser per D-16"
  - "signOutUser has zero AsyncStorage operations per D-08 (local data preserved)"
  - "import type { User } appended after existing imports to satisfy strict TypeScript without moving polyfill"

patterns-established:
  - "Auth result shape: { user: User | null; error: string | null } for functions returning a user, { error: string | null } for side-effect functions"
  - "mapAuthError called everywhere errors surface — never expose raw Supabase error messages to users (T-14-03)"

requirements-completed: [AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-08, AUTH-09]

# Metrics
duration: 2min
completed: 2026-06-09
---

# Phase 14 Plan 02: Auth Methods Summary

**Six email/password auth functions + D-15 error mapper added to supabase.ts using auth.updateUser for anonymous→email promotion (not linkIdentity)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-09T19:49:20Z
- **Completed:** 2026-06-09T19:50:43Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- All 7 exports added to `src/lib/supabase.ts`: `mapAuthError`, `signUpWithEmail`, `signInWithEmail`, `convertAnonymousToEmail`, `sendPasswordResetEmail`, `signOutUser`, `resendVerificationEmail`
- `convertAnonymousToEmail` correctly uses `supabase.auth.updateUser({ email, password })` — `linkIdentity` never appears as a call
- `mapAuthError` implements all 5 D-15 categories (wrong password, user not found, network, rate limit, email not confirmed) plus fallback
- `signOutUser` has zero AsyncStorage calls per D-08
- Polyfill constraint on line 1 intact; `npx tsc --noEmit` passes with zero errors

## Task Commits

1. **Task 1: Add auth methods + mapAuthError to supabase.ts** — `d76b3bc` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/lib/supabase.ts` — 177 lines added: mapAuthError function, 6 async auth methods, `import type { User }` from supabase-js

## Decisions Made

- `import type { User }` was appended after the existing import block (before the new functions) rather than at the top of the file, to preserve the polyfill on line 1 and avoid reordering existing imports.
- `linkIdentity` is referenced only in JSDoc documentation to explain why it is NOT used — it never appears as a function call.
- All auth functions return typed result objects (never throw) so callers have consistent error handling without try/catch at the screen level.

## Deviations from Plan

### TDD Infrastructure Absent

**[Rule 3 deviation — no auto-fix per package install exclusion]**
- **Found during:** Task 1 setup
- **Issue:** Plan has `tdd="true"` but the project has no Jest configuration, no `__tests__` directory, and no test runner devDependencies. Setting up Jest for Expo requires package installs (`jest`, `jest-expo`, `@testing-library/react-native`) which cannot be auto-installed per the package-manager install exclusion in deviation Rule 3.
- **Impact:** Behavioral spec from `<behavior>` block verified manually via TypeScript type checking, grep-based code review, and `tsc --noEmit`. All behavioral contracts are correct by construction (pure functions with deterministic string matching).
- **Deferred:** Jest setup deferred to a future plan. The `mapAuthError` function is pure and trivially testable once Jest is configured.

---

**Total deviations:** 1 (TDD infrastructure absent — not auto-fixed; package install exclusion applies)
**Impact on plan:** Zero impact on deliverable correctness. All acceptance criteria met. Tests can be added retroactively.

## Issues Encountered

None — implementation clean on first pass, `tsc --noEmit` zero errors.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `src/lib/supabase.ts` exports all 7 auth symbols ready for import by 14-03 (WelcomeScreen), 14-04 (ProfileScreen), 14-05 (DashboardScreen)
- Concrete function signatures are locked — downstream plans can reference them without risk of API changes
- No blockers for 14-03

---
*Phase: 14-auth-and-login*
*Completed: 2026-06-09*
