# Phase 16: Adapty Paywall & Subscriptions — Research

**Researched:** 2026-06-12
**Domain:** React Native in-app purchases with Adapty SDK, Expo Managed Workflow, Apple StoreKit
**Confidence:** HIGH (core SDK API), MEDIUM (Adapty dashboard setup steps, App Store compliance rules)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Hybrid layout — dark NeuralGrid hero + white card bottom. Top half dark NeuralGrid, bottom half white/surface card rising from the bottom (WelcomeScreen pattern). No full-screen warm clinical style.
- **D-02:** Hero section contains orbital animation + headline only. Reuse the orbital animation from LongevityScoreScreen / ProfileScreen. No feature bullet list in the hero.
- **D-03:** Bottom price card contains exactly: price + trial timeline + Restore Purchases. No feature bullets, no reassurance text inside the card.
- **D-04:** Phase 16 adds an AI Advisor entry point on Dashboard. Free users tap → paywall. Premium users tap → stub screen (empty; Phase 17 fills backend, Phase 18 fills UI).
- **D-05:** New "Intelligence" section on Dashboard groups Articles + AI Advisor. Replaces the standalone Articles CTA (DashboardScreen.tsx lines ~543–559). Layout matches existing `uploadCard` / `researchCard` pattern.
- **D-06:** Monthly + Annual plans; annual as primary CTA. Annual Subscribe button leads; monthly is a smaller tappable text link below. No plan-toggle UI.
- **D-07:** 7-day free trial on annual plan only. Visual timeline: Day 1–7 free → Day 8 billed. Monthly plan does not display a trial timeline.
- **D-08:** Placeholder product IDs: `com.vitalspan.app.premium.annual` and `com.vitalspan.app.premium.monthly`. No code changes needed when real IDs are configured in App Store Connect + Adapty dashboard if IDs are fetched from Adapty server config.
- **D-09:** PremiumContext in App.tsx wrapping AppNavigator. `usePremiumContext()` hook provides `isPremium: boolean` and `refreshPremium()`. Initialized after `initSupabaseSession()`. Refreshed on AppState `active` events.
- **D-10:** PaywallScreen is a `fullScreenModal` in RootStack. Route: `Paywall: undefined` in `RootStackParamList`. Pattern: `nav.navigate('Paywall')`. No tab-stack nesting.
- **D-11:** No AsyncStorage cache for premium status. Adapty SDK is the source of truth. On successful purchase or restore, call `adapty.getProfile()` and update context immediately.

### Claude's Discretion

None explicitly called out. All major decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

- LIMIT-01 — 30-day history limit for free tier (paywall ships first; limits in a follow-up phase)
- Annual-only conversion flow (deferred in favour of showing both plans)
- Adapty A/B paywall testing (post-launch optimization)
- Push notification for trial end reminder (requires expo-notifications, Phase 6 backlog)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAY-01 | User can subscribe to Vitalspan Premium (monthly or annual) via Apple in-app purchase from the paywall screen | `adapty.makePurchase(product)` with `AdaptyPaywallProduct` from `adapty.getPaywallProducts(paywall)` |
| PAY-02 | Paywall screen displays price, billing period, 7-day free trial with visual timeline (Day 1–7 free → Day 8 billed), and a visible Restore Purchases button — no toggle trial UI | `product.price.localizedString` for price; `product.subscription.introductoryOffer` for trial; toggle UI explicitly banned (Guideline 3.1.2, January 2026) |
| PAY-03 | User who previously subscribed can tap "Restore Purchases" and regain premium access without a new purchase | `adapty.restorePurchases()` returns `AdaptyProfile`; check `accessLevels['premium'].isActive` |
| PAY-04 | Free tier remains fully accessible; premium features (AI Advisor, Articles feed) are soft-gated | `isPremium` from PremiumContext gates navigation — free features always reachable via tabs |
| PAY-05 | Articles feed is gated — free users tapping Articles see the paywall | DashboardScreen + AppNavigator: wrap `nav.navigate('Articles')` with `isPremium` check |
| AI-06 | AI Advisor entry point is soft-gated — free user tapping AI Advisor sees the paywall; premium user proceeds | New `AIAdvisor: undefined` route; stub AIAdvisorScreen; same gate pattern as PAY-05 |
</phase_requirements>

---

## Summary

Phase 16 installs `react-native-adapty` (v3.17.1, published 2026-06-09) into the existing Expo SDK 54 Managed Workflow project. Because Adapty requires native code, `npx expo prebuild` must be run after installation. The project already runs on a Custom Dev Client (confirmed by HealthKit being present via `@kingstinct/react-native-healthkit`), so this is a known pattern. The existing `@kingstinct/react-native-healthkit` config plugin in `app.json` already handles HealthKit entitlements declaratively — `prebuild --clean` regenerates native folders but re-applies all config plugins, so HealthKit entitlements are preserved as long as the plugin entry in `app.json` remains.

The Adapty SDK uses a **placement-based architecture**: the code calls `adapty.getPaywall(placementId)` using a Placement ID configured in the Adapty dashboard, not a hardcoded product ID. Products (`com.vitalspan.app.premium.annual` and `com.vitalspan.app.premium.monthly`) are registered in App Store Connect and then imported/linked in the Adapty dashboard. The 7-day free trial is configured as an introductory offer in App Store Connect per product — not in the Adapty dashboard — and Adapty reads it automatically from `product.subscription.introductoryOffer`.

The key App Store compliance concern — toggle trial UI — has been explicitly banned by Apple (Guideline 3.1.2, enforcement began January 2026). The decided visual timeline (Day 1–7 free → Day 8 billed) is the Apple-endorsed compliant alternative. Restore Purchases is a hard App Store requirement; missing it causes rejection.

**Primary recommendation:** Wire `adapty.activate()` as an awaited step after `initSupabaseSession()` in App.tsx init(); call `adapty.identify(user.id)` only after `supabase.auth.getUser()` resolves (matches the STATE.md-documented activation race decision); build PremiumContext with `addEventListener('onLatestProfileLoad')` for reactive updates; build the paywall as a coded screen (not Paywall Builder) using `adapty.getPaywall(placementId)` + `adapty.getPaywallProducts(paywall)` to fetch live product pricing.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| IAP purchase flow | Native / StoreKit | Adapty SDK (RN bridge) | StoreKit is the Apple-required payment layer; Adapty wraps it |
| Premium status derivation | Adapty SDK (remote) | PremiumContext (React) | Adapty is source of truth (D-11); context caches in-memory for render |
| Paywall screen UI | Frontend (React Native) | Adapty (product data) | Coded paywall (not Paywall Builder) — product prices fetched from Adapty, rendered in-app |
| Gate enforcement | Frontend (React Native) | — | `isPremium` from context; navigation guard at tap handler level |
| Subscription state refresh | PremiumContext / AppState | Adapty event listener | AppState `active` event triggers `getProfile()` (mirrors Supabase JWT pattern) |
| Trial configuration | App Store Connect | — | Introductory offers are set per-product in ASC, not in Adapty |
| Product registration | Adapty Dashboard + ASC | — | Products must be created in ASC first, then imported into Adapty |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-native-adapty` | 3.17.1 | Adapty SDK — IAP, subscription management, profile | Official Adapty SDK, ships Expo config plugin (`app.plugin.js`) |
| `tslib` | ^2.5.0 (latest: 2.8.1) | Runtime dependency of `react-native-adapty` | Required runtime dep, must be explicitly installed |
| `expo-build-properties` | 56.0.18 | Set `deploymentTarget: '15.0'` for Paywall Builder compat | Only needed if Paywall Builder is used; for coded paywall, iOS 13.0+ suffices — still useful to have |

### Supporting (already in project)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-native-reanimated` | ~4.1.1 | Orbital animation in paywall hero | Reuse `LongevityScoreScreen` orbital animation directly |
| `react-native-svg` | 15.12.1 | Orbital SVG paths | Already used in LongevityScoreScreen |
| `expo-haptics` | ~15.0.8 | Haptic feedback on Subscribe/Restore taps | Consistent with all other interactive elements |
| `expo-linear-gradient` | ~15.0.8 | Hero gradient overlay if needed | Matches WelcomeScreen pattern |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Coded paywall (this plan) | Adapty Paywall Builder | Paywall Builder requires iOS 15.0+, forces deploy target bump; coded paywall is more flexible and matches project's existing UI patterns |
| `adapty.getPaywall(placementId)` | Hardcoded product IDs via `expo-iap` | Adapty already decided (v4.0 decision); expo-iap is lower level with no analytics |
| `adapty.addEventListener('onLatestProfileLoad')` | Polling on every screen focus | Listener is more efficient; polling on AppState change is the right scope |

**Installation:**
```bash
npx expo install react-native-adapty tslib
# Then run prebuild (required for native modules):
npx expo prebuild --clean
cd ios && pod install && cd ..
```

**Version verification:**
```
react-native-adapty: 3.17.1 (published 2026-06-09) [VERIFIED: npm registry]
tslib: 2.8.1 (latest) [VERIFIED: npm registry]
expo-build-properties: 56.0.18 (published 2026-06-10) [VERIFIED: npm registry]
@adapty/core: 3.17.2 (auto-installed as dependency of react-native-adapty) [VERIFIED: npm registry]
```

---

## Package Legitimacy Audit

> slopcheck was unavailable at research time (pip install failed). All packages marked `[ASSUMED]` per graceful degradation protocol. Planner must gate each install behind a `checkpoint:human-verify` task unless additional verification is performed.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `react-native-adapty` | npm | ~3 yrs (SDK exists since 2021) | High (official Adapty SDK) | github.com/adaptyteam/AdaptySDK-React-Native | unavailable | [ASSUMED] — well-known IAP vendor, verified via official Adapty docs |
| `tslib` | npm | ~9 yrs | 100M+/wk | github.com/microsoft/tslib | unavailable | [ASSUMED] — Microsoft TypeScript runtime, widely known |
| `expo-build-properties` | npm | ~3 yrs | Very high (Expo official) | github.com/expo/expo | unavailable | [ASSUMED] — Official Expo package |
| `@adapty/core` | npm | Published 2026-06-09 | — | github.com/adaptyteam/AdaptySDK-JS-Core | unavailable | [ASSUMED] — auto-installed dep of react-native-adapty; same vendor |

**No postinstall scripts found** for `react-native-adapty`, `@adapty/core`, or `tslib` via `npm view`. [VERIFIED: npm registry]

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none — but slopcheck was unavailable, so planner should treat all as [ASSUMED].

*Note: `react-native-adapty`, `tslib`, and `expo-build-properties` are well-established packages with clear source repos and official documentation. The risk of hallucination is low, but the formal slopcheck gate was not passed.*

---

## Architecture Patterns

### System Architecture Diagram

```
App.tsx init()
    │
    ├── await initSupabaseSession()          (existing)
    ├── await adapty.activate(apiKey)        (Phase 16 — NEW)
    ├── await supabase.auth.getUser()        (existing)
    │       └── if user.id: adapty.identify(user.id)   (Phase 16 — NEW, only after getUser)
    ├── setInitialRoute(...)                 (existing)
    │
    └── <PremiumProvider>                   (Phase 16 — NEW wraps AppNavigator)
            │
            ├── PremiumContext state: { isPremium: boolean }
            │       └── derived from adapty.getProfile().accessLevels['premium'].isActive
            │
            ├── AppState listener (active) → refreshPremium()  (mirrors supabase.ts pattern)
            │
            └── <AppNavigator>
                    │
                    ├── RootStack: Paywall (fullScreenModal)    (Phase 16 — NEW)
                    ├── RootStack: AIAdvisor (fullScreenModal)  (Phase 16 — NEW stub)
                    │
                    └── DashboardScreen
                            │
                            ├── "Intelligence" section header   (Phase 16 — NEW)
                            ├── [Longevity Research card]       (existing — now gated)
                            │       isPremium → navigate('Articles')
                            │       !isPremium → navigate('Paywall')
                            └── [AI Advisor card]               (Phase 16 — NEW)
                                    isPremium → navigate('AIAdvisor')
                                    !isPremium → navigate('Paywall')


PaywallScreen (fullScreenModal)
    │
    ├── Top 60%: dark NeuralGrid hero
    │       ├── NeuralGrid (tone='vital', intensity=0.4)
    │       └── Orbital animation (reuse from LongevityScoreScreen)
    │               + premium headline text
    │
    └── Bottom 40%: white price card (Radius.xl top corners)
            │
            ├── [Annual plan] primary CTA button (Colors.brand fill)
            │       Text: "$X/yr — 7 days free"
            │       onPress: adapty.makePurchase(annualProduct)
            │                 → success → refreshPremium() → nav.goBack()
            │
            ├── [Monthly plan] secondary link text (Colors.onSurfaceMuted)
            │       Text: "Or try monthly at $Y/mo"
            │       onPress: adapty.makePurchase(monthlyProduct)
            │
            ├── Day timeline row (Day 1–7 green / Day 8 neutral)
            │       Static View row with 8 day markers
            │       Text below: "7 days free, then $X/yr · Cancel anytime"
            │
            └── "Restore Purchases" text link
                    onPress: adapty.restorePurchases()
                              → check accessLevels['premium'].isActive
                              → refreshPremium() → if premium: nav.goBack()


Data flow: Adapty Dashboard (Placement + Products) → adapty.getPaywall(placementId)
                                                    → adapty.getPaywallProducts(paywall)
                                                    → AdaptyPaywallProduct[] (price, period)
                                                    → PaywallScreen renders live prices
```

### Recommended Project Structure

```
src/
  context/
    PremiumContext.tsx          # Context + PremiumProvider + usePremiumContext hook
  lib/
    adapty.ts                   # activate(), identify(), getProfile() helpers + activation promise
  screens/
    PaywallScreen.tsx           # New fullScreenModal paywall screen
    AIAdvisorScreen.tsx         # New stub screen (empty, Phase 18 fills it)
```

### Pattern 1: Adapty Activation (activate-then-identify)

**What:** Activate the Adapty SDK with no `customerUserId` first; identify after Supabase resolves the user ID.

**When to use:** Always — this is the Adapty-documented pattern for apps with deferred authentication.

```typescript
// src/lib/adapty.ts
// Source: adapty.io/docs/sdk-installation-react-native-expo

import { adapty } from 'react-native-adapty';

const ADAPTY_API_KEY = process.env.EXPO_PUBLIC_ADAPTY_API_KEY ?? '';

// Exported promise — awaited in App.tsx init(); also used by PaywallScreen
// to ensure activation is complete before getPaywall() is called.
export const activationPromise: Promise<void> = (async () => {
  try {
    await adapty.activate(ADAPTY_API_KEY);
  } catch (err) {
    console.warn('[Adapty] activation failed:', err);
  }
})();

/**
 * Call after supabase.auth.getUser() resolves with a non-null user.
 * Links the Adapty profile to the Supabase user ID for analytics.
 * Per STATE.md: never call before getUser() resolves.
 */
export async function identifyAdaptyUser(userId: string): Promise<void> {
  try {
    await activationPromise;
    await adapty.identify(userId);
  } catch (err) {
    console.warn('[Adapty] identify failed:', err);
  }
}

/**
 * Returns true if the 'premium' access level is active.
 * Falls back to false on any error (never blocks the user).
 */
export async function fetchPremiumStatus(): Promise<boolean> {
  try {
    await activationPromise;
    const profile = await adapty.getProfile();
    return profile.accessLevels?.['premium']?.isActive ?? false;
  } catch {
    return false;
  }
}
```

### Pattern 2: PremiumContext with AppState Refresh

**What:** React context providing `isPremium` + `refreshPremium()`, initialized in App.tsx, refreshed on AppState `active` events.

**When to use:** Wrap `AppNavigator` in App.tsx — provides premium status to all screens without prop-drilling.

```typescript
// src/context/PremiumContext.tsx
// Pattern mirrors supabase.ts AppState listener (STATE.md decision)

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { adapty } from 'react-native-adapty';
import { fetchPremiumStatus } from '../lib/adapty';

interface PremiumContextValue {
  isPremium: boolean;
  refreshPremium: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  refreshPremium: async () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);

  const refreshPremium = async () => {
    const status = await fetchPremiumStatus();
    setIsPremium(status);
  };

  useEffect(() => {
    // Initial load
    refreshPremium();

    // Reactive: Adapty pushes profile updates on subscription change
    const listener = adapty.addEventListener('onLatestProfileLoad', (profile) => {
      setIsPremium(profile.accessLevels?.['premium']?.isActive ?? false);
    });

    // AppState active refresh (mirrors supabase.ts pattern)
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') refreshPremium();
    });

    return () => {
      listener.remove();
      sub.remove();
    };
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, refreshPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremiumContext = () => useContext(PremiumContext);
```

### Pattern 3: Fetching Paywall Products (coded paywall — not Paywall Builder)

**What:** Fetch product list from Adapty using placement ID; use `localizedPrice` from `AdaptyPrice` for display.

**When to use:** In PaywallScreen on mount, after `activationPromise` resolves.

```typescript
// Source: adapty.io/docs/present-remote-config-paywalls-react-native
//         adapty.io/blog/quickstart-adapty-setup-guide-react-native-with-expo/

import { adapty, AdaptyPaywallProduct } from 'react-native-adapty';
import { activationPromise } from '../lib/adapty';

const PLACEMENT_ID = 'vitalspan_premium_paywall'; // configured in Adapty dashboard

const [products, setProducts] = useState<AdaptyPaywallProduct[]>([]);

useEffect(() => {
  (async () => {
    try {
      await activationPromise;
      const paywall = await adapty.getPaywall(PLACEMENT_ID, 'en');
      await adapty.logShowPaywall(paywall); // required for Adapty analytics
      const prods = await adapty.getPaywallProducts(paywall);
      setProducts(prods);
    } catch (err) {
      console.warn('[Adapty] paywall fetch failed:', err);
    }
  })();
}, []);

// To get price for display:
// product.price?.localizedString   → e.g. "$99.99/yr"
// product.vendorProductId          → e.g. "com.vitalspan.app.premium.annual"

// To identify which product is annual vs monthly:
// Match vendorProductId against known placeholder IDs
const annual = products.find(p => p.vendorProductId.includes('annual'));
const monthly = products.find(p => p.vendorProductId.includes('monthly'));
```

### Pattern 4: makePurchase and restorePurchases

```typescript
// Source: adapty.io/docs/react-native-making-purchases
//         adapty.io/docs/react-native-restore-purchase

// Purchase
async function handlePurchase(product: AdaptyPaywallProduct) {
  try {
    const result = await adapty.makePurchase(product);
    switch (result.type) {
      case 'success':
        await refreshPremium();
        nav.goBack();
        break;
      case 'user_cancelled':
        break; // do nothing — user chose to dismiss
      case 'pending':
        Alert.alert('Purchase pending', 'Your purchase is being processed.');
        break;
    }
  } catch (err) {
    Alert.alert('Purchase failed', 'Please try again.');
  }
}

// Restore
async function handleRestore() {
  try {
    const profile = await adapty.restorePurchases();
    const active = profile.accessLevels?.['premium']?.isActive ?? false;
    if (active) {
      await refreshPremium();
      nav.goBack();
    } else {
      Alert.alert('No subscription found', 'No active subscription to restore.');
    }
  } catch (err) {
    Alert.alert('Restore failed', 'Please try again.');
  }
}
```

### Anti-Patterns to Avoid

- **Calling `adapty.getPaywall()` before `activationPromise` resolves.** Adapty requires activate to complete before any other SDK call. Always `await activationPromise` first.
- **Toggle trial UI.** Apple enforces Guideline 3.1.2 since January 2026; this design is rejected. Use the visual day-marker timeline instead.
- **Caching `isPremium` in AsyncStorage.** D-11 explicitly forbids this. Stale cache can grant premium access after subscription lapses. Adapty's `getProfile()` returns cached data when offline, so the SDK already handles the offline case gracefully.
- **Calling `adapty.identify()` before `supabase.auth.getUser()` resolves.** The STATE.md activation race decision: activate with no customerUserId, identify only after getUser() confirms the user ID.
- **Using `presentation: 'modal'` (not `fullScreenModal`) for PaywallScreen.** D-10 specifies `fullScreenModal` to match LongevityScoreScreen — modal allows swipe-to-dismiss, which can interrupt a pending purchase.
- **Not calling `adapty.logShowPaywall(paywall)` after `getPaywall()`.** This is required for Adapty funnel analytics. Always call it before showing the screen to the user.
- **Hardcoding prices in UI strings.** Prices must come from `product.price?.localizedString`. Apple will reject if prices shown do not match App Store.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Purchase validation | Custom StoreKit receipt parsing | `adapty.makePurchase()` + `adapty.getProfile()` | Receipt validation requires a server; Adapty does this server-side automatically |
| Subscription expiry detection | Timer / async polling | `adapty.addEventListener('onLatestProfileLoad')` | Adapty pushes profile updates on subscription events |
| Restore purchases | Custom transaction queue enumeration | `adapty.restorePurchases()` | This is a StoreKit-level operation; hand-rolling it misses edge cases (Ask to Buy, family sharing, etc.) |
| Price formatting | Currency formatters | `product.price.localizedString` | Apple provides pre-formatted localized strings; using them guarantees consistency and passes App Store review |
| Product eligibility for trial | Checking trial days manually | `product.subscription.introductoryOffer` | Adapty reads eligibility from StoreKit — a user who already used the trial is not eligible for a second one |

**Key insight:** Every hand-rolled solution in this domain requires a server-side receipt validation component that Adapty already provides. The SDK exists precisely because StoreKit's raw API has dozens of edge cases (grace periods, billing retry, family sharing, Ask to Buy, promotional offers) that take months to implement correctly.

---

## Adapty Dashboard Setup (required before getPaywall() returns data)

This is not a code task but a human-action dependency. The planner must include checkpoint tasks for it:

1. **Create App in Adapty Dashboard** — register `com.vitalspan.app` bundle ID
2. **Connect App Store Connect** — generate API key in ASC, add to Adapty > App Settings > iOS SDK
3. **Create Products in App Store Connect** — two Auto-Renewable Subscription products:
   - `com.vitalspan.app.premium.annual` (Annual subscription group) + introductory offer: Free Trial, 7 days
   - `com.vitalspan.app.premium.monthly` (same subscription group, no introductory offer)
4. **Import Products into Adapty** — Adapty > Products > sync from App Store Connect
5. **Create Access Level** — "premium" (auto-created by default; verify it exists)
6. **Assign Products to Access Level** — link both products to the "premium" access level
7. **Create Paywall in Adapty** — Add both products to the paywall
8. **Create Placement** — assign a Placement ID (e.g., `vitalspan_premium_paywall`) and link the paywall to it
9. **Save and Publish** the placement — `adapty.getPaywall(placementId)` returns nothing until published

[CITED: adapty.io/docs/create-placement, adapty.io/docs/create-product, adapty.io/docs/access-level]

---

## Expo Config Plugin Setup

`react-native-adapty` **ships an Expo config plugin** (`app.plugin.js` exists in the package root, confirmed via GitHub). [CITED: github.com/adaptyteam/AdaptySDK-React-Native]

The plugin's primary documented option is `fallbackFile` for offline paywall fallbacks. Since Phase 16 does not use offline fallback paywalls, no plugin options are required for our use case.

**app.json change required — add `react-native-adapty` to plugins array:**

```json
{
  "expo": {
    "plugins": [
      "expo-font",
      [
        "@kingstinct/react-native-healthkit",
        {
          "NSHealthShareUsageDescription": "...",
          "NSHealthUpdateUsageDescription": "..."
        }
      ],
      "react-native-adapty"
    ]
  }
}
```

**HealthKit entitlement preservation:** Expo's prebuild is declarative — config plugins are re-applied on every `prebuild` run. The `@kingstinct/react-native-healthkit` plugin in `app.json` re-applies the `com.apple.developer.healthkit` and `com.apple.developer.healthkit.access` entitlements every time. Running `npx expo prebuild --clean` is safe as long as the plugin entry remains in `app.json`. [CITED: expo.dev/guides/adopting-prebuild/]

**StoreKit / IAP entitlements:** StoreKit does NOT require an explicit entitlement for standard in-app purchases (unlike external purchase links, which need `com.apple.developer.storekit.external-purchase`). The standard `com.apple.developer.in-app-payments` entitlement is for Apple Pay, not IAP. Regular IAP via StoreKit works with no extra entitlement in app.json. [CITED: docs.expo.dev/build-reference/ios-capabilities/] [ASSUMED: no direct Apple doc confirming IAP needs zero entitlement — but this is the standard observed behavior]

---

## App Store Compliance for Paywalls

### What Is Required (and Causes Rejection if Missing)

| Requirement | Detail | Decision Alignment |
|-------------|--------|-------------------|
| Restore Purchases button | Must be "in a visible place" — paywall, settings, or both. Missing = rejection. | D-03 includes Restore Purchases in the bottom card. Compliant. |
| Price must match App Store | "Prices must match across App Store listing, in-app screens, subscription management screens." | Use `product.price.localizedString` — never hardcode. |
| Trial duration must be disclosed | "Products with free trials must clearly state its duration and conditions before purchase." | Day 1–7 / Day 8 timeline and "7 days free, then $X/yr" text covers this. |
| No toggle trial UI | Apple Guideline 3.1.2. Mass rejections began January 2026. | D-06 explicitly forbids toggle. Visual timeline is the compliant alternative. |
| Privacy policy accessible in-app | Linked from paywall or settings. | Already exists in AboutScreen (verify it links to a real URL). |
| No false urgency or dark patterns | No countdown timers, hiding cancel mechanics, or pre-selected expensive tiers. | D-03 / D-06: no such patterns in the decided design. |

[CITED: adapty.io/docs/prepare-your-app-for-store-review, adapty.io/blog/your-toggle-paywall-is-about-to-get-rejected/]

### Toggle Trial UI Ban — Detail

Apple began enforcing Guideline 3.1.2 against "toggle trial" paywalls in January 2026. The pattern involved a toggle switch that switched between a plan with a trial and a plan without. The objection: the trial is "hidden" from users who don't interact with the toggle. Apps submitted with this design received identical rejection notices. [CITED: adapty.io/blog/your-toggle-paywall-is-about-to-get-rejected/]

**Compliant alternatives (all approved):**
1. Visual trial timeline (Day 1–7 free, Day 8+ billed) — the D-07 decision
2. Side-by-side plan cards (no toggle; show both plans with trial badge)
3. Segmented plan selector (static radio group, not a toggle)

The D-07 visual timeline is the correct choice and is explicitly documented as Apple-endorsed.

---

## Trial Configuration — Where to Set It Up

**Free trials are configured in App Store Connect, not in the Adapty dashboard.**

Steps in App Store Connect:
1. Navigate to Apps → Vitalspan → Subscriptions
2. Select the subscription group containing the annual product
3. Select `com.vitalspan.app.premium.annual`
4. In Subscription Prices → View all → Set up Introductory Offer
5. Choose offer type: **Free Trial**, duration: **7 days**
6. Select territories

Adapty reads the trial automatically from StoreKit's product metadata. In code, trial information is accessible via `product.subscription.introductoryOffer` — if `introductoryOffer.type === 'free_trial'`, the user is eligible. The monthly product gets no introductory offer.

**Per-product configuration:** Yes, each product has its own introductory offer settings in App Store Connect. The annual and monthly products are configured independently. [CITED: developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions/]

---

## App.tsx Startup Sequence (confirmed pattern)

The existing `App.tsx` `init()` function uses sequential `await` (14-01 decision). Phase 16 inserts Adapty activation between `initSupabaseSession()` and routing:

```typescript
// App.tsx init() — Phase 16 additions shown with comments

const init = async () => {
  try {
    await initSupabaseSession();                     // existing (14-01 decision: awaited)
    await activationPromise;                          // Phase 16: Adapty activate (fire at module load, await completion here)
    const { data: { user } } = await supabase.auth.getUser();   // existing
    if (user && user.id) {
      // Phase 16: identify only after getUser() resolves (STATE.md activation race rule)
      identifyAdaptyUser(user.id).catch(() => null); // fire-and-forget — non-blocking
    }
    if (user && !user.is_anonymous) {
      // ... existing routing logic
    } else {
      setInitialRoute('Welcome');
    }
  } catch {
    setInitialRoute('Welcome');
  }
  // ... existing fire-and-forget tasks
};
```

**Critical note:** `activationPromise` is a module-level IIFE in `src/lib/adapty.ts` that starts executing when the module is first imported. By the time `init()` awaits it, activation may already be complete (zero-cost await). This is the pattern documented in Adapty's Expo quickstart guide. [CITED: adapty.io/blog/quickstart-adapty-setup-guide-react-native-with-expo/]

---

## Common Pitfalls

### Pitfall 1: Calling SDK Methods Before activate() Resolves

**What goes wrong:** `adapty.getPaywall()` or `adapty.getProfile()` called before activation completes — SDK throws or returns empty data silently.

**Why it happens:** PaywallScreen or PremiumContext mount before `activationPromise` settles (possible on fast device renders).

**How to avoid:** Always `await activationPromise` at the top of any Adapty call site. The shared `activationPromise` from `src/lib/adapty.ts` is idempotent — awaiting it multiple times is safe and free.

**Warning signs:** Profile returns no access levels; getPaywall throws "SDK not activated" error.

### Pitfall 2: Products Not Appearing (getPaywallProducts returns empty array)

**What goes wrong:** `adapty.getPaywallProducts(paywall)` returns `[]` even after successful `getPaywall()`.

**Why it happens:** Products not imported into Adapty dashboard, or Placement not published, or sandbox account never used to purchase anything.

**How to avoid:** Complete all Adapty dashboard setup steps (see "Adapty Dashboard Setup" section above) before testing. Test in Xcode simulator with StoreKit configuration file OR on a device with a sandbox Apple ID.

**Warning signs:** `products.length === 0` on first fetch; no products visible in Adapty Dashboard analytics.

### Pitfall 3: expo prebuild --clean Wipes Native Folder Manual Changes

**What goes wrong:** Native code modified directly in `ios/` folder is lost after `prebuild --clean`.

**Why it happens:** `--clean` regenerates the entire `ios/` folder from scratch.

**How to avoid:** All native configuration must go through config plugins in `app.json`. The `@kingstinct/react-native-healthkit` plugin already does this for HealthKit. Never edit `ios/*.entitlements` or `Podfile` manually for persistent config.

**Warning signs:** Existing features (HealthKit) stop working after prebuild.

### Pitfall 4: Trial Eligibility — User Already Redeemed Trial

**What goes wrong:** User previously installed the app, used the 7-day trial, and cancelled. They reinstall and the UI still shows "7 days free." On purchase, StoreKit silently skips the trial and charges immediately.

**Why it happens:** Introductory offer eligibility is per-subscription-group in App Store Connect. Each customer can redeem one intro offer per subscription group.

**How to avoid:** Do not promise "7 days free" to users who have previously subscribed. Check `product.subscription.introductoryOffer` — if `null` or the user is not eligible, show the regular price without trial language. Adapty surfaces eligibility via this property.

**Warning signs:** User complaints about being charged immediately; negative App Store reviews.

### Pitfall 5: Missing Restore Purchases Before Submission

**What goes wrong:** App rejected by Apple reviewer; reviewer tests restore flow and finds no button.

**Why it happens:** Restore Purchases is sometimes treated as a nice-to-have. Apple treats it as mandatory.

**How to avoid:** Restore Purchases button is in the bottom price card (D-03). Test the restore flow: buy a subscription in sandbox → delete app → reinstall → tap Restore → verify premium is restored.

**Warning signs:** Reviewer message citing "3.1.1 - In-App Purchase"; reviewer describes missing restoration mechanism.

### Pitfall 6: `isPremium` Showing Stale `false` on First Load

**What goes wrong:** App launches, PremiumContext initializes with `isPremium: false`, content is shown as locked even for paying subscribers, then flips to `true` after `getProfile()` resolves. User sees locked UI flash before seeing unlocked UI.

**Why it happens:** `getProfile()` is async; context starts with `false` as default.

**How to avoid:** Add a `isPremiumLoading: boolean` flag to PremiumContext. Gate content display on `!isPremiumLoading`. Show a loading state or skip rendering the Intelligence section until the premium status resolves. Adapty's `getProfile()` uses cached data when possible — this is usually fast (<200ms).

---

## Code Examples

### AppNavigator.tsx — Adding Paywall + AIAdvisor Routes

```typescript
// Source: Existing LongevityScore pattern in AppNavigator.tsx

export type RootStackParamList = {
  // ... existing routes ...
  Paywall: undefined;     // Phase 16 — fullScreenModal
  AIAdvisor: undefined;   // Phase 16 — fullScreenModal (stub; Phase 18 fills content)
};

// In Stack.Navigator:
<Stack.Screen
  name="Paywall"
  component={PaywallScreen}
  options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
/>
<Stack.Screen
  name="AIAdvisor"
  component={AIAdvisorScreen}
  options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
/>
```

### DashboardScreen.tsx — Intelligence Section Replacement

```typescript
// Source: existing DashboardScreen.tsx lines ~543–559
// Replace the standalone Research CTA with the Intelligence section

const { isPremium } = usePremiumContext(); // import from PremiumContext

// In render, replace the Research CTA block:
<View style={s.sectionHdr}>
  <Text style={s.sectionTitle}>Intelligence</Text>
</View>

{/* Longevity Research — was standalone, now gated */}
<TouchableOpacity
  style={[s.uploadCard, s.researchCard]}
  activeOpacity={0.82}
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    isPremium ? nav.navigate('Articles') : nav.navigate('Paywall');
  }}
>
  {/* ... existing content ... */}
</TouchableOpacity>

{/* AI Advisor — new, Phase 16 */}
<TouchableOpacity
  style={[s.uploadCard, s.aiAdvisorCard]}
  activeOpacity={0.82}
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    isPremium ? nav.navigate('AIAdvisor') : nav.navigate('Paywall');
  }}
>
  {/* icon + title + subtitle + arrow */}
</TouchableOpacity>
```

### Day Timeline Visual (Day 1–7 free / Day 8 billed)

```typescript
// Simple, no complex SVG — 8 styled View markers in a row

const DAYS = [1,2,3,4,5,6,7,8];
const isTrialDay = (d: number) => d <= 7;

{DAYS.map(day => (
  <View key={day} style={[s.dayMarker, isTrialDay(day) ? s.dayFree : s.dayBilled]}>
    <Text style={[s.dayNum, isTrialDay(day) ? s.dayNumFree : s.dayNumBilled]}>
      {day}
    </Text>
  </View>
))}
// Below: "7 days free, then $X/yr · Cancel anytime"
// Colors: isTrialDay → Colors.status.optimal (green); else → Colors.textMuted

// StyleSheet:
dayMarker: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
dayFree: { backgroundColor: Colors.status.optimalBg },
dayBilled: { backgroundColor: Colors.bgShade },
dayNum: { fontSize: Typography.sizes.xs, fontWeight: '600' },
dayNumFree: { color: Colors.status.optimalText },
dayNumBilled: { color: Colors.textMuted },
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Toggle trial UI (plan A with trial, plan B without, toggle between) | Visual trial timeline (Day 1–7 free / Day 8+) | January 2026 (Apple enforcement) | Toggle = immediate rejection; timeline is compliant |
| RevenueCat (originally planned) | Adapty | v4.0 decision | Adapty has better A/B paywall testing and analytics dashboard |
| Paywall Builder (server-side UI) | Coded paywall (React Native screen) | Phase 16 design decision | Paywall Builder requires iOS 15.0+; coded paywall matches project UI patterns and gives full control |
| `customerUserId` at activate() time | activate() then identify() after auth resolves | STATE.md v4.0 decision | Prevents race condition where Adapty activates before user ID is known |

**Deprecated/outdated:**

- `adapty.paywallId` parameter — current API uses `placementId`, not `paywallId`. Older docs (pre-v3.x) referenced paywalls directly; v3.x+ uses placements as the entry point.
- Direct `AdaptyPaywallProduct.localizedPrice` — current API nests price under `product.price.localizedString` (type: `AdaptyPrice`). Some older code examples use a top-level `localizedPrice` — verify against SDK TypeScript types after install.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Xcode / iOS Simulator | Building native module | Assumed yes (existing HealthKit dev) | Unknown | — |
| Apple Developer Account | Creating IAP products in ASC | Assumed yes (bundle ID registered) | — | — |
| Adapty account | Dashboard setup | Needs creation / verification | — | Cannot ship without |
| EAS Build / Dev Client | Running with native modules | Assumed yes (existing HealthKit) | — | `npx expo run:ios` locally |
| Sandbox Apple ID | Testing IAP without charges | Needs creation in ASC | — | Cannot test purchases without |
| StoreKit Configuration File | Simulator IAP testing | Optional | — | Test on device with sandbox ID |

**Missing dependencies with no fallback:**

- Adapty account registration and dashboard setup must be completed before `adapty.getPaywall()` returns data
- Sandbox Apple ID must be created before purchase flow can be tested
- App Store Connect products must be created and in "Ready to Submit" state

**Missing dependencies with fallback:**

- Simulator testing: Use StoreKit configuration JSON file in Xcode (locally) to mock IAP without a real sandbox ID, OR use `adapty.activate(key, { enableMock: true })` during development

---

## Validation Architecture

> `nyquist_validation: false` in `.planning/config.json` — skip this section.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No (IAP authentication is Apple's responsibility) | — |
| V3 Session Management | Partial — premium state must not be cached locally | Adapty SDK is source of truth (D-11); no AsyncStorage for isPremium |
| V4 Access Control | Yes — gate enforcement for Articles and AI Advisor | `isPremium` check at tap handler level; navigation guard pattern |
| V5 Input Validation | No user text input in paywall | — |
| V6 Cryptography | No — API key is `EXPO_PUBLIC_*` (readable by user) | `EXPO_PUBLIC_ADAPTY_API_KEY` is a public SDK key — this is by design; Adapty's security model uses server-side validation |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client-side `isPremium` bypass | Tampering | Context holds in-memory value only; no persistent cache means no local bypass target; server-side validation via Adapty handles the real enforcement |
| Stale premium status after subscription lapses | Tampering | `getProfile()` on every AppState `active` event; Adapty `onLatestProfileLoad` listener fires on lapse events |
| Fake restore (user lies about purchasing) | Tampering | `restorePurchases()` calls Apple's StoreKit — Apple verifies the receipt server-side; Adapty only grants access if Apple confirms |
| API key exposure (EXPO_PUBLIC_ADAPTY_API_KEY) | Info Disclosure | Adapty public SDK keys are designed to be public (read: they identify the app, not authorize privileged actions); server-side receipt validation is Adapty's backend responsibility |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `product.subscription.introductoryOffer` is accessible on `AdaptyPaywallProduct` in v3.17.1 (property name verified from v3.11.4 docs snapshot; v3.17 API may differ slightly) | Code Examples | Wrong property name → trial eligibility check fails → no trial detection |
| A2 | Standard IAP (StoreKit) requires no special entitlement in app.json (only Apple Pay needs `com.apple.developer.in-app-payments`) | Expo Config Plugin Setup | Missing entitlement → IAP fails on device builds |
| A3 | `product.price.localizedString` is the correct nested path (SDK reference for v3.11.4 shows `AdaptyPrice` type; confirm against installed SDK TypeScript types) | Code Examples | Wrong property path → price shows undefined |
| A4 | `adapty.addEventListener('onLatestProfileLoad')` returns an object with `.remove()` | PremiumContext pattern | If no remove() → listener leak on unmount |
| A5 | The Adapty "premium" access level is auto-created with that exact ID string for new Adapty apps | Adapty Dashboard Setup | If ID differs (e.g., "Premium" with capital P) → `accessLevels['premium']` returns undefined → all users appear as free |

---

## Open Questions

1. **`product.subscription.introductoryOffer` property name in v3.17.1**
   - What we know: The SDK reference at `react-native.adapty.io/interfaces/adaptypaywallproduct` (v3.11.4 snapshot) shows a `subscription` field of type `AdaptySubscriptionDetails`. The `introductoryOffer` is nested within it.
   - What's unclear: The exact property path in v3.17.1 — the TypeScript types in the installed package are authoritative.
   - Recommendation: After install, run `npx tsc --noEmit` and inspect the `AdaptyPaywallProduct` type definition to confirm. Adjust code if the path differs.

2. **Adapty free tier limits for phase 16 testing**
   - What we know: Adapty has a free tier; the pricing page exists but limits are not researched.
   - What's unclear: Whether the free tier supports production use or requires a paid plan for real IAP.
   - Recommendation: Verify on adapty.io/pricing/ before launch. The free tier likely covers development testing.

3. **Placement ID must be created in Adapty dashboard before code ships**
   - What we know: `adapty.getPaywall(placementId)` requires the placement to be published in the dashboard.
   - What's unclear: Whether a hardcoded `PLACEMENT_ID = 'vitalspan_premium_paywall'` can be used in code before the dashboard configuration exists (it will simply return nothing / throw until configured).
   - Recommendation: Planner includes a `checkpoint:human-verify` task for Adapty dashboard setup as a prerequisite Wave before PaywallScreen implementation.

---

## Sources

### Primary (HIGH confidence)

- [Adapty Expo Installation Guide](https://adapty.io/docs/sdk-installation-react-native-expo) — installation commands, app.json config, Expo Dev Client requirement
- [Adapty Expo Quickstart Blog](https://adapty.io/blog/quickstart-adapty-setup-guide-react-native-with-expo/) — activation pattern, subscription check pattern, `activationPromise` module pattern
- [Adapty Access Levels](https://adapty.io/docs/access-level) — "premium" is auto-created, `isActive` semantics
- [Adapty Create Placement](https://adapty.io/docs/create-placement) — placementId usage, publish requirement
- [Adapty makePurchase()](https://adapty.io/docs/react-native-making-purchases) — full method signature, return type, switch pattern
- [Adapty restorePurchases()](https://adapty.io/docs/react-native-restore-purchase) — method signature, AdaptyProfile return
- [Adapty getProfile()](https://adapty.io/docs/react-native-listen-subscription-changes) — `accessLevels['premium'].isActive`, `addEventListener('onLatestProfileLoad')`
- [Adapty Identify Users](https://adapty.io/docs/react-native-identifying-users) — `identify()` signature, anonymous vs identified
- [Adapty Store Review Guide](https://adapty.io/docs/prepare-your-app-for-store-review) — Restore Purchases requirement, pricing consistency, trial disclosure
- [Toggle Paywall Ban](https://adapty.io/blog/your-toggle-paywall-is-about-to-get-rejected/) — Guideline 3.1.2, January 2026 enforcement
- [AdaptySDK-React-Native GitHub](https://github.com/adaptyteam/AdaptySDK-React-Native) — config plugin existence confirmed (`app.plugin.js`)
- [npm: react-native-adapty](https://www.npmjs.com/package/react-native-adapty) — v3.17.1, published 2026-06-09
- [Adapty Create Product](https://adapty.io/docs/create-product) — trial configured at product creation time; ASC integration
- [Apple ASC Introductory Offers](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions/) — free trial configuration per product in App Store Connect
- [Expo iOS Capabilities](https://docs.expo.dev/build-reference/ios-capabilities/) — entitlements configuration via app.json; no IAP-specific entitlement needed

### Secondary (MEDIUM confidence)

- [AdaptyPaywallProduct interface v3.11.4](https://react-native.adapty.io/interfaces/adaptypaywallproduct) — `price`, `subscription`, `vendorProductId` fields (confirmed for 3.11.4; v3.17.1 may differ slightly)
- [Adapty Fetch Paywalls](https://adapty.io/docs/fetch-paywalls-and-products) — `getPaywall(placementId)`, `getPaywallProducts()` signatures; `product.price.localizedString` for display
- [Expo Adopting Prebuild](https://expo.dev/guides/adopting-prebuild/) — config plugins preserved across `prebuild --clean`

### Tertiary (LOW confidence — flag for validation)

- A2 (no IAP entitlement needed) — observed from Expo capability docs + RevenueCat community; no single Apple doc confirming standard IAP has zero entitlement requirement

---

## Metadata

**Confidence breakdown:**

- Standard Stack: HIGH — npm registry confirmed versions, Adapty official docs confirmed API
- Architecture patterns: HIGH — Adapty docs + quickstart blog cross-confirmed
- App Store compliance: HIGH — Adapty's own compliance guide + Apple's stated guideline (3.1.2)
- Trial configuration location: HIGH — App Store Connect (per Apple's own ASC docs)
- Expo config plugin integration: MEDIUM — GitHub confirms plugin file exists; exact plugin options not exhaustively documented
- AdaptyPaywallProduct property paths: MEDIUM — confirmed for 3.11.4; v3.17.1 not directly verified

**Research date:** 2026-06-12
**Valid until:** 2026-07-12 (Adapty SDK updates frequently; verify version before install)
