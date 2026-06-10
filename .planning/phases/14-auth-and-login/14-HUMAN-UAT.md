---
status: partial
phase: 14-auth-and-login
source: [14-VERIFICATION.md, 14-REVIEW.md]
started: 2026-06-10T00:00:00Z
updated: 2026-06-10T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Anonymous→email conversion cold-start (H1 — architectural gap)
expected: After anonymous user converts to email account but hasn't clicked the confirmation link, closing and reopening the app should show a helpful "check your inbox" screen rather than landing silently on Welcome with no explanation
result: [pending]

### 2. Email verification banner
expected: Dashboard shows amber banner for authenticated non-anonymous users where email_confirmed_at is null. Banner is dismissable per-session. "Resend" action triggers another verification email.
result: [pending]

### 3. Verified toast one-time display
expected: After email is confirmed, Dashboard shows "Account verified!" toast exactly once (guarded by @vitalspan_email_verified_notified flag). Second app open does not show the toast.
result: [pending]

### 4. Guest mode card on ProfileScreen
expected: ProfileScreen shows "Sign up to sync" card with "Your data is stored locally" headline and "Create Account" CTA when user.is_anonymous=true
result: [pending]

### 5. Logout preserves local data
expected: Tapping Logout on ProfileScreen (non-anonymous user) calls signOutUser(), navigates to Welcome, and all biomarker entries remain intact in AsyncStorage
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
