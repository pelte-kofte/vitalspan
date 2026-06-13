---
phase: 16-adapty-paywall-and-subscriptions
plan: "05"
subsystem: paywall
tags: [adapty, premium, dashboard, navigation]
dependency_graph:
  requires: [16-01, 16-02]
  provides: [adapty-activation, premium-context-wired, intelligence-section]
  affects: [App.tsx, DashboardScreen]
tech_stack:
  added: []
  patterns: [await-activationPromise, fire-and-forget-identify, PremiumProvider-wrap, isPremium-ternary-gate]
key_files:
  modified:
    - App.tsx
    - src/screens/DashboardScreen.tsx
decisions:
  - "D-09: Adapty activate awaited before routing; identify is fire-and-forget after getUser resolves"
  - "D-05: Intelligence section replaces standalone Research CTA; both cards always render, gates are in onPress handlers"
  - "D-04: Free users routed to Paywall from both Research and AI Advisor cards; premium users navigate directly"
  - "isPremiumLoading intentionally NOT used to gate Intelligence section display — both cards always visible"
  - "aiAdvisorCard uses Colors.accentBg (blue-tinted) to visually differentiate from researchCard (Colors.primaryBg, green-tinted)"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-13"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 16 Plan 05: App.tsx Adapty Activation + Dashboard Intelligence Section Summary

Adapty SDK wired into App.tsx startup sequence with PremiumProvider wrapping AppNavigator. DashboardScreen's standalone Research CTA replaced with an "Intelligence" section containing two premium-gated cards (Longevity Research and AI Advisor).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire App.tsx — Adapty Activation + PremiumProvider | 7e7c4a2 | App.tsx |
| 2 | DashboardScreen Intelligence Section | 7e7c4a2 | src/screens/DashboardScreen.tsx |

## What Was Built

### Task 1: App.tsx Wiring

Three targeted changes to `App.tsx`:

1. **Imports added:** `activationPromise` and `identifyAdaptyUser` from `./src/lib/adapty`; `PremiumProvider` from `./src/context/PremiumContext`.

2. **init() sequence updated:** `await activationPromise` inserted between `initSupabaseSession()` and `supabase.auth.getUser()`. After `getUser()` resolves, `identifyAdaptyUser(user.id).catch(() => null)` is called fire-and-forget (mirrors the existing `pruneExpiredCache().catch(() => null)` pattern). A `user.id` guard ensures identify is only called when Supabase returns a real user.

3. **JSX updated:** `<PremiumProvider>` wraps `<AppNavigator initialRoute={initialRoute} />` only — `<MedicalDisclaimer />` remains outside the provider as it does not need premium context.

### Task 2: DashboardScreen Intelligence Section

Three changes to `src/screens/DashboardScreen.tsx`:

1. **Import added:** `usePremiumContext` from `../context/PremiumContext`.

2. **Hook call added:** `const { isPremium } = usePremiumContext()` at the top of the `DashboardScreen` component function, after `useNavigation`.

3. **Research CTA block replaced** (lines 543–559) with the Intelligence section:
   - `<View style={s.sectionHdr}><Text style={s.sectionTitle}>Intelligence</Text></View>` section header
   - Longevity Research card: same `uploadCard + researchCard` style, `ClipboardIcon`, onPress checks `isPremium` — routes to `Articles` or `Paywall`
   - AI Advisor card: new, `uploadCard + aiAdvisorCard` style, `DnaHelixIcon`, onPress checks `isPremium` — routes to `AIAdvisor` or `Paywall`

4. **Style added:** `aiAdvisorCard: { backgroundColor: Colors.accentBg }` — the accent blue-tinted background differentiates the AI Advisor card from the green-tinted Research card (`Colors.primaryBg`), both using theme tokens per CLAUDE.md.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Both cards navigate to real routes (`Paywall`, `Articles`, `AIAdvisor`) established in plan 16-02.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. The `isPremium` gate in onPress handlers is enforced client-side only, consistent with T-16-10 (PremiumContext.isPremium is derived from Adapty server-side state, not any client-writable value).

## Self-Check: PASSED

- App.tsx exists and contains `activationPromise`, `identifyAdaptyUser`, `PremiumProvider` — verified via grep
- DashboardScreen.tsx contains `Intelligence`, `usePremiumContext`, `aiAdvisorCard`, both `isPremium` ternary gates — verified via grep
- Commit 7e7c4a2 exists — verified
- `npx tsc --noEmit` exits 0 — verified
