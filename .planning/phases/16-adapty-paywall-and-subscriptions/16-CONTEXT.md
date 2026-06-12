# Phase 16: Adapty Paywall & Subscriptions - Context

**Gathered:** 2026-06-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship Adapty-powered in-app purchase with a compliant paywall screen, free/premium tier gating, and restore purchases.

Deliverables:
1. **PaywallScreen** — fullScreenModal with hybrid layout (dark NeuralGrid hero + white price card). Shows two subscription plans (annual primary CTA, monthly secondary link), Day 1–7 free / Day 8 billed visual timeline, and a Restore Purchases button.
2. **PremiumContext** — React context initialized in `App.tsx`, wrapping AppNavigator. Holds `isPremium: boolean` derived from Adapty; refreshed on app focus.
3. **Gate checks** — Articles tap and AI Advisor tap both check `isPremium` from context. Free users are redirected to PaywallScreen; premium users proceed directly.
4. **Dashboard Intelligence section** — A new "Intelligence" section header groups both the existing Articles CTA and a new AI Advisor CTA above the "Today's protocol" section. The AI Advisor CTA navigates to the paywall for free users; premium users see a stub screen (Phase 17/18 fills the content).
5. **Adapty SDK** — Installed and initialized; `getPaywall()`, `makePurchase()`, and `restorePurchases()` wired up.

Out of scope: actual AI Advisor report generation (Phase 17/18), push notifications, LIMIT-01 history gating.

</domain>

<decisions>
## Implementation Decisions

### Paywall Visual Design

- **D-01:** **Hybrid layout — dark NeuralGrid hero + white card bottom.** Top half: dark NeuralGrid background (same as WelcomeScreen/LongevityScore) with orbital/biomarker animation from the ProfileScreen orbital system + a premium headline. Bottom half: white/surface card that rises from the bottom with the price content (mirrors the Phase 14 bottom-sheet pattern). No full-screen warm clinical style.
- **D-02:** **Hero section contains orbital animation + headline only.** Reuse the orbital animation pattern from ProfileScreen/LongevityScore — a lightweight SVG/Reanimated animation that hints at what the app tracks. No feature bullet list in the hero; the orbital visual carries the brand moment.
- **D-03:** **Bottom price card contains exactly: price + trial timeline + Restore Purchases.** No feature bullets, no reassurance text inside the card. PAY-02 exactly — nothing more. The hero handles persuasion; the card handles conversion mechanics.

### AI Advisor Entry Point

- **D-04:** **Phase 16 adds an AI Advisor entry point on Dashboard.** Free users tap → paywall. Premium users tap → stub screen (empty; no "Coming soon" label). Phase 17 fills the backend, Phase 18 fills the UI — Phase 16 just establishes the route and gate.
- **D-05:** **New "Intelligence" section on Dashboard groups Articles + AI Advisor.** A new section header "Intelligence" replaces the standalone Articles CTA. Both cards (Longevity Research and AI Advisor) sit under this header, above the existing "Today's protocol" section. Layout and card style match the existing `uploadCard` / `researchCard` pattern.

### Subscription SKU Setup

- **D-06:** **Monthly + Annual — annual as primary CTA, monthly as secondary link.** The bottom card leads with "Subscribe Annually — $X/yr (7-day free trial)" as the main Subscribe button. A smaller tappable text below reads "Or try monthly at $Y/mo". No plan-toggle UI; annual is the default conversion path.
- **D-07:** **7-day free trial applies to the annual plan.** The visual timeline (Day 1–7 free → Day 8 billed) describes the annual plan's trial. Monthly plan does not display a trial timeline. Researcher must confirm if Adapty supports per-product trial configuration or if the trial is set at App Store Connect level.
- **D-08:** **Placeholder product IDs.** Planner uses `com.vitalspan.app.premium.annual` and `com.vitalspan.app.premium.monthly` as placeholder identifiers. Real IDs are configured in App Store Connect and Adapty dashboard before TestFlight submission — no code changes needed at that point if IDs are fetched from Adapty server config.

### Premium State Model

- **D-09:** **PremiumContext in App.tsx wrapping AppNavigator.** `usePremiumContext()` hook provides `isPremium: boolean` and `refreshPremium()`. Context is initialized during `App.tsx` startup after `initSupabaseSession()` — call `Adapty.activate()` then `Adapty.getProfile()` to derive initial premium status. Context refreshed on AppState `active` events (same pattern as Supabase JWT refresh already in `supabase.ts`).
- **D-10:** **PaywallScreen is a `fullScreenModal` in RootStack.** Added to `RootStackParamList` as `Paywall: undefined`. Navigation pattern: `nav.navigate('Paywall')` from any screen. No tab-stack nesting; follows the same pattern as `LongevityScore`, `Settings`, and `About`.
- **D-11:** **No AsyncStorage cache for premium status.** Adapty SDK is the source of truth. On successful `makePurchase()` or `restorePurchases()`, call `Adapty.getProfile()` and update context immediately. No `@vitalspan_is_premium` key — avoids stale cache if subscription lapses.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dashboard & Navigation
- `src/screens/DashboardScreen.tsx` — Current Articles CTA (lines ~543–559, `uploadCard`/`researchCard` style). Phase 16 wraps both Articles and AI Advisor under a new "Intelligence" section header.
- `src/navigation/AppNavigator.tsx` — `RootStackParamList` and fullScreenModal pattern. Add `Paywall: undefined` and `AIAdvisor: undefined` routes. Reference existing `LongevityScore`, `Settings`, `About` for the fullScreenModal config.
- `App.tsx` — `init()` startup sequence (currently: `initSupabaseSession()` → `supabase.auth.getUser()` → routing). Phase 16 adds `Adapty.activate()` + `Adapty.getProfile()` call before routing, and wraps AppNavigator with PremiumContext provider.

### Visual Reference (Paywall Hero)
- `src/screens/LongevityScoreScreen.tsx` — Canonical dark hero fullScreenModal. Reference for dark NeuralGrid background, orbital animation, and fullScreenModal navigation setup.
- `src/screens/ProfileScreen.tsx` — Orbital animation implementation to reuse or adapt for the paywall hero section.
- `src/components/NeuralGrid.tsx` — Animated SVG background for dark hero. Props: `intensity`, `tone` ('calm'|'alert'|'vital').
- `src/screens/WelcomeScreen.tsx` — Reference for dark background + bottom-sheet card hybrid layout (Phase 14 pattern).

### Requirements
- `.planning/REQUIREMENTS.md §PAY-01, PAY-02, PAY-03, PAY-04, PAY-05` — Authoritative requirements and acceptance criteria for this phase. Must read before planning.
- `.planning/REQUIREMENTS.md §AI-06` — AI Advisor gate requirement (free user → paywall). Phase 16 must implement this gate even though AI Advisor UI is Phase 18.

### Adapty SDK
- Adapty React Native SDK documentation — researcher must fetch installation instructions, `Adapty.activate()` signature, `Adapty.getPaywall()`, `Adapty.makePurchase()`, `Adapty.restorePurchases()`, `Adapty.getProfile()` (for `accessLevels.premium.isActive` check), and Expo SDK 54 compatibility. Bundle ID for Adapty config: `com.vitalspan.app`.

### Prior Phase Decisions
- `.planning/STATE.md §Decisions` — Key prior decisions on Supabase init sequence, App.tsx routing, async startup patterns, and `@vitalspan_*` key naming conventions that Phase 16 must not violate.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `NeuralGrid` component (`src/components/NeuralGrid.tsx`): directly available for the paywall dark hero background. Use `intensity` and `tone` props.
- Orbital animation in `LongevityScoreScreen.tsx` / `ProfileScreen.tsx`: SVG/Reanimated orbital system. Phase 16 reuses the same animation as the paywall hero visual — lightweight, no new animation library needed.
- `BreathingCard` (`src/components/BreathingCard.tsx`): scale+glow wrapper. Can wrap the bottom price card for a premium entry feel.
- `Elevation.sm`, `Radius.xl`, `Colors.surface`, `Colors.brand`, `Spacing.*` from `src/theme/index.ts` — all tokens available for the white card.

### Established Patterns
- **fullScreenModal in RootStack**: `LongevityScoreScreen`, `SettingsScreen`, `AboutScreen` all use `presentation: 'modal'` or `presentation: 'fullScreenModal'` in AppNavigator. Paywall follows same config.
- **App.tsx startup sequence**: `init()` uses `await` for each step (Supabase, routing). Adapty activation inserts after `initSupabaseSession()` following the same `await` / `.catch(() => null)` resilience pattern.
- **AppState listener for refresh**: `supabase.ts` already uses `AppState.addEventListener('change', ...)` for JWT refresh. PremiumContext mirrors this for `refreshPremium()` on `active`.
- **StyleSheet named `s`** at bottom of each file; no inline styles except dynamic. PaywallScreen follows this.
- **`useFocusEffect` + `useCallback`**: existing pattern for re-fetching on screen focus. PremiumContext refresh on app focus (AppState) is the correct level — not per-screen `useFocusEffect`.

### Integration Points
- `DashboardScreen.tsx`: Replace the standalone Articles CTA block (lines ~543–559) with a new "Intelligence" section containing two CTA cards. Each card's `onPress` checks `isPremium` from `usePremiumContext()` before navigating.
- `AppNavigator.tsx` `RootStackParamList`: add `Paywall: undefined` and `AIAdvisor: undefined`. Wire up PaywallScreen and a stub AIAdvisorScreen (Phase 18 replaces the stub).
- `App.tsx`: add `Adapty.activate({ apiKey: EXPO_PUBLIC_ADAPTY_API_KEY })` in `init()`. Wrap `<AppNavigator>` with `<PremiumProvider>`.
- New files: `src/lib/adapty.ts` (Adapty activation + helper functions), `src/context/PremiumContext.tsx` (context + provider + hook), `src/screens/PaywallScreen.tsx`, `src/screens/AIAdvisorScreen.tsx` (stub).

</code_context>

<specifics>
## Specific Ideas

- Paywall hybrid layout mirrors the Phase 14 WelcomeScreen bottom-sheet aesthetic: dark NeuralGrid fills the top ~60% of the screen, the white price card occupies the bottom ~40% with a top border-radius matching `Radius.xl`. The card does not animate up on open — it's fixed in place as part of the screen layout (unlike the auth bottom sheet which animates in).
- The orbital animation in the dark hero is the exact same animation from LongevityScore/Profile — reused directly as a visual anchor for "this app tracks your biological age." Headline sits below the orbital (or centered over it with a gradient text overlay if legible).
- Annual plan primary CTA button uses `Colors.brand` fill (same as existing primary buttons). Monthly secondary link uses `Colors.textSecondary` / underlined text style below the Subscribe button.
- Adapty API key stored in `.env` as `EXPO_PUBLIC_ADAPTY_API_KEY` — follows the existing `process.env.EXPO_PUBLIC_*` pattern (Phase 4 decision).
- The Day 1–7 / Day 8+ trial timeline visual: a horizontal row of 8 labeled day markers, first 7 in a "free" color (green/brand), Day 8+ in a "billed" neutral. Text below: "7 days free, then $X/yr". Keep it simple — no complex SVG, just a styled `FlatList` or `ScrollView` row of `View` day markers.

</specifics>

<deferred>
## Deferred Ideas

- **LIMIT-01 — 30-day history limit for free tier**: Requirements.md marks this as deferred ("paywall ships first, limits enforced in a follow-up phase"). Do not implement history truncation in Phase 16.
- **Annual-only conversion flow**: Starting with annual-only was considered but deferred in favor of showing both plans. Could be revisited if conversion data shows monthly subscribers churn too fast.
- **Adapty A/B paywall testing**: Adapty supports server-side paywall A/B tests. Configuring experiments is a post-launch optimization — Phase 16 ships one fixed paywall layout.
- **Push notification for trial end reminder**: "Your free trial ends in 2 days" push notification. Requires expo-notifications (Phase 6 backlog item) — out of scope for Phase 16.

</deferred>

---

*Phase: 16-adapty-paywall-and-subscriptions*
*Context gathered: 2026-06-12*
