---
phase: 14-auth-and-login
status: partially_fixed
reviewed_at: 2026-06-10
fixed_at: 2026-06-10
findings: 8
severity_critical: 0
severity_high: 2
severity_medium: 4
severity_low: 2
---

# Code Review — Phase 14: Auth & Login

## Summary

8 findings (2 high, 4 medium, 2 low). Two confirmed bugs, four plausible runtime failures, two confirmed usability/correctness issues. The most impactful is the anonymous→email conversion flow — `updateUser` triggers Supabase's email-confirmation flow, but the cold-start routing check reads `is_anonymous` which stays `true` until the link is clicked, routing the user back to Welcome before they can log in.

---

## Findings

### HIGH

**H1 — supabase.ts:187 — `updateUser` does not clear `is_anonymous` until email is confirmed**
- **File:** `src/lib/supabase.ts:187`
- **Severity:** High
- **Status:** PLAUSIBLE
- **Scenario:** `convertAnonymousToEmail` calls `supabase.auth.updateUser({ email, password })`. Supabase's email-change flow requires the user to click a confirmation link before `email_confirmed_at` is set and `is_anonymous` is cleared. On cold start, `App.tsx:23` checks `!user.is_anonymous` — since `is_anonymous` is still `true`, the user is re-routed to Welcome. `signInWithPassword` won't work until the email is confirmed (Supabase rejects unconfirmed credentials). The user is stuck: account created, data migrated, but no way to authenticate until the link is clicked — and there is no screen to instruct them to check email after a cold start re-route.
- **Fix:** After the WelcomeScreen navigates to SignUpConfirmation, also persist a flag (e.g. `@vitalspan_signup_pending: { email }`) that App.tsx checks on cold start — if set, route to SignUpConfirmation instead of Welcome so the "check your inbox" message remains visible.

---

**H2 — App.tsx:23 — Non-anonymous users without completed onboarding are routed to Main**
- **File:** `App.tsx:23`
- **Severity:** High
- **Status:** CONFIRMED
- **Scenario:** A user signs up via `signUpWithEmail` (not an anonymous conversion), confirms their email, then cold-starts before completing onboarding. `App.tsx:23` checks only `!user.is_anonymous` — the user is non-anonymous, so `initialRoute` is set to `'Main'`. Onboarding is skipped entirely. Dashboard shows an empty profile, `profile?.name` returns undefined, and PhenoAge computation returns null.
- **The old code** routed all users through `@vitalspan_user_profile.onboardingComplete`; the new code eliminates that check on the cold-start path but only restores it in `handleLogin` in WelcomeScreen (line 94).
- **Fix:** In `App.tsx` init(), after `!user.is_anonymous` check, also read `@vitalspan_user_profile.onboardingComplete` — if false/null, route to `'Onboarding'` instead of `'Main'`.

---

### MEDIUM

**M1 — WelcomeScreen.tsx:78 — `setLoading(false)` not called on sign-up success path**
- **File:** `src/screens/WelcomeScreen.tsx:78`
- **Severity:** Medium
- **Status:** CONFIRMED
- **Scenario:** `handleSignUp` success path: `closeSheet()` → `nav.navigate('SignUpConfirmation', { email })` — no `setLoading(false)`. `closeSheet()` does not reset `loading`. If the user navigates back from SignUpConfirmation to WelcomeScreen, `loading` is still `true`; `openSheet()` resets email/password/error but not `loading`. The "Create Account" button shows a spinner and is permanently disabled for the rest of the session.
- **Fix:** Add `setLoading(false)` before `closeSheet()` on the success path (line 78), or reset `loading` in `openSheet()`.

---

**M2 — WelcomeScreen.tsx:66 — Dual migration guards can both fire concurrently on first launch**
- **File:** `src/screens/WelcomeScreen.tsx:66`
- **Severity:** Medium
- **Status:** PLAUSIBLE
- **Scenario:** App.tsx's migration chain (line 34) uses `@vitalspan_migrated_v2` as its guard. WelcomeScreen's conversion path uses `@vitalspan_identity_linked`. Both keys are `null` on a fresh device. If the user converts their anonymous account during the same session as first launch (before App.tsx's fire-and-forget migration writes `@vitalspan_migrated_v2: 'true'`), both branches call `migrateHistory(entries)` concurrently, inserting the same biomarker rows twice into the append-only `biomarker_entries` table.
- **Fix:** Unify under one guard key, or have WelcomeScreen's path set both `@vitalspan_identity_linked` and `@vitalspan_migrated_v2` after a successful migration.

---

**M3 — DashboardScreen.tsx:106 — `supabase.auth.getUser()` called twice in one `loadData()` invocation**
- **File:** `src/screens/DashboardScreen.tsx:106`
- **Severity:** Medium
- **Status:** PLAUSIBLE
- **Scenario:** `loadData()` calls `getUser()` at line 68 for biomarker fetching and again at line 106 for the verification banner check. If the session expires or the network fails between the two calls, the second call throws (caught silently) and the verification banner state (`showVerificationBanner`, `userEmail`) is never set — the banner silently disappears. Additionally, two network round-trips per focus event doubles auth latency.
- **Fix:** Hoist one `const { data: { user } } = await supabase.auth.getUser()` before the biomarker block and reuse `user` for both branches.

---

**M4 — DashboardScreen.tsx:74 — Empty Supabase result (`length === 0`) falls back to local AsyncStorage**
- **File:** `src/screens/DashboardScreen.tsx:74`
- **Severity:** Medium
- **Status:** PLAUSIBLE
- **Scenario:** `if (!sbError && sbEntries && sbEntries.length > 0)` treats an authenticated user with zero remote entries identically to a fetch failure, falling through to local cache. A user who intentionally cleared their Supabase data will see stale local entries on every Dashboard load, with no indication they are viewing local copies rather than the remote state.
- **Fix:** Separate "fetch succeeded with empty array" from "fetch failed". On a successful empty result, call `setEntries([])` directly instead of falling through.

---

### LOW

**L1 — WelcomeScreen.tsx:165 — Email not forwarded to ForgotPassword navigation**
- **File:** `src/screens/WelcomeScreen.tsx:165`
- **Severity:** Low
- **Status:** CONFIRMED
- **Scenario:** The login sheet's "Forgot password?" footer calls `nav.navigate('ForgotPassword', {})`. `RootStackParamList` declares `ForgotPassword: { email?: string }` specifically to support pre-filling. The `email` state value the user typed in the login form is available but not passed. The user must retype their email on the reset screen.
- **Fix:** Change to `nav.navigate('ForgotPassword', { email })`.

---

**L2 — WelcomeScreen.tsx:102 — `handleGuest` and `handleLogin` success path duplicate AsyncStorage + nav.reset logic**
- **File:** `src/screens/WelcomeScreen.tsx:102`
- **Severity:** Low
- **Status:** CONFIRMED (cleanup)
- **Scenario:** Both handlers read `@vitalspan_user_profile`, parse it, check `onboardingComplete`, and call `nav.reset()` with either `'Main'` or `'Onboarding'`. If the routing rule changes (new onboarding step, key rename), both handlers must be updated in sync.
- **Fix:** Extract `navigateAfterAuth(nav)` helper.

---

## To fix

```
/gsd:code-review 14 --fix
```

Priority order: H2 (App.tsx cold-start routing) → H1 (updateUser confirmation flow) → M1 (loading state stuck) → L1 (email forward).
