# Phase 16: Adapty Paywall & Subscriptions - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-12
**Phase:** 16-adapty-paywall-and-subscriptions
**Areas discussed:** Paywall visual design, AI Advisor entry point, Subscription SKU setup, Premium state model

---

## Paywall Visual Design

### Q1 — Overall visual theme

| Option | Description | Selected |
|--------|-------------|----------|
| Dark neural hero | Same immersive dark NeuralGrid as WelcomeScreen / LongevityScore | |
| Warm clinical (light) | White/beige surface like warm dashboard cards | |
| Hybrid — dark hero top, light card bottom | Dark NeuralGrid hero + white price card rising from bottom (mirrors Phase 14 auth bottom-sheet) | ✓ |

**User's choice:** Hybrid — dark hero top, light card bottom

---

### Q2 — Hero section content

| Option | Description | Selected |
|--------|-------------|----------|
| Logo + headline + 3 benefit bullets | Vitalspan logo, premium headline, 3 feature bullets | |
| Logo + headline only | Minimal brand + tagline | |
| Orbital / biomarker animation + headline | Reuse orbital animation from ProfileScreen/LongevityScore behind a headline | ✓ |

**User's choice:** Orbital/biomarker animation + headline

---

### Q3 — Bottom card content

| Option | Description | Selected |
|--------|-------------|----------|
| Price + trial timeline + Restore only | Exactly PAY-02 — nothing more | ✓ |
| Add feature list inside card | Price + timeline + 2–3 bullets + Subscribe + Restore | |
| Add reassurance line | Price + trial + Restore + "Cancel anytime" line | |

**User's choice:** Price + trial timeline + Restore only (PAY-02 exactly)

---

## AI Advisor Entry Point

### Q1 — When does the entry point appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Locked placeholder now (Recommended) | Phase 16 adds entry point; shows "Coming soon" for premium users | |
| Defer entirely to Phase 18 | Phase 16 only gates Articles; AI Advisor entry point first appears in Phase 18 | |
| Add entry point gated only — no "Coming soon" | Phase 16 adds entry point + gate; premium users see empty state | ✓ |

**User's choice:** Add entry point and gate in Phase 16; no "Coming soon" label for premium users — they see an empty stub screen. Phase 17/18 fills the content.

---

### Q2 — Dashboard placement

| Option | Description | Selected |
|--------|-------------|----------|
| Alongside Articles CTA (same row style) | Second uploadCard-style row matching Articles | |
| Separate "Intelligence" section above protocol | New section header grouping Articles + AI Advisor above Today's protocol | ✓ |
| You decide | Claude picks best placement | |

**User's choice:** New "Intelligence" section above the protocol section, grouping both cards together.

---

## Subscription SKU Setup

### Q1 — Number of plans

| Option | Description | Selected |
|--------|-------------|----------|
| Monthly only — single SKU | One plan, one price, simplest IAP setup | |
| Monthly + Annual — two SKUs, annual highlighted | Two plans, annual marked "Best Value" | ✓ |
| Annual only | Higher LTV, higher conversion risk | |

**User's choice:** Monthly + Annual, annual highlighted

---

### Q2 — Two-plan display layout

| Option | Description | Selected |
|--------|-------------|----------|
| Two tappable plan rows, annual pre-selected | Both shown as selectable rows; annual pre-selected | |
| Annual as primary CTA, monthly as secondary link | Annual Subscribe button + "Or try monthly at $Y/mo" smaller link below | ✓ |
| You decide | Claude picks best layout | |

**User's choice:** Annual as primary CTA, monthly as smaller secondary link below.

---

### Q3 — Product IDs

| Option | Description | Selected |
|--------|-------------|----------|
| Use placeholders now, configure in ASC later | com.vitalspan.app.premium.monthly + com.vitalspan.app.premium.annual | ✓ |
| I'll provide exact product IDs | User provides real App Store Connect IDs | |

**User's choice:** Placeholders — configure in App Store Connect when setting up products.

---

## Premium State Model

### Q1 — How to check premium status at gate points

| Option | Description | Selected |
|--------|-------------|----------|
| React context holding live Adapty status | PremiumContext initialized at startup; screens read isPremium from context | ✓ |
| Adapty SDK queried directly at each gate | Per-gate live Adapty.getCustomerInfo() call | |
| AsyncStorage cache | @vitalspan_is_premium flag; risk of stale cache | |

**User's choice:** React context (PremiumContext) — initialized at startup, refreshed on app focus.

---

### Q2 — Context location + Paywall navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Context in App.tsx, Paywall as fullScreenModal | PremiumContext wraps AppNavigator in App.tsx; Paywall is RootStack fullScreenModal | ✓ |
| Context inside AppNavigator, Paywall as tab-stack modal | Provider inside AppNavigator; more isolated but requires per-tab Paywall route | |
| You decide | Claude picks based on existing patterns | |

**User's choice:** PremiumContext in App.tsx wrapping AppNavigator; PaywallScreen as fullScreenModal in RootStack (same pattern as LongevityScore).

---

## Claude's Discretion

None — all areas had explicit user choices.

## Deferred Ideas

- **LIMIT-01 (30-day history gating for free tier)** — requirements.md marks explicitly as deferred to a follow-up phase after paywall ships
- **Adapty A/B paywall testing** — post-launch optimization, one fixed layout ships in Phase 16
- **Annual-only conversion** — considered, deferred in favor of showing both plans
- **Trial-end push notification** — requires expo-notifications (backlog Phase 6 item), out of Phase 16 scope
