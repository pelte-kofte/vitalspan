# Vitalspan Design System

> **Permanent source of truth for all visual design decisions.**
> Every new screen, feature, or phase involving UI must read and follow this file before making design choices.

---

## Identity Statement

Vitalspan is a precision longevity tracking app built by a licensed pharmacist. The visual identity is **dark, scientific, premium, gradient-driven** — "biological data visualization" made native to iOS.

The canonical reference for the entire app's look is **LongevityScoreScreen**: a near-black gradient background, a glowing BioAge sphere with an animated dashed orbital ring, constellation-node satellite data orbs, and bioGreen data accents on glassy dark surfaces. Every other screen should feel like it belongs to the same instrument cluster.

The target feel is **Apple Health × Oura × Apple Fitness** — refined, data-forward, deeply native to iOS. It must never feel like a dark-themed website pasted into a phone frame.

---

## Color Tokens

All tokens live in `src/theme/index.ts`. Reference `Colors.dark.*`, `Colors.viz.*`, and `Gradients.*` for dark-system work.

### Background Layers (iOS-style elevation on dark)

| Role | Token | Hex / Value |
|---|---|---|
| Screen base | `Colors.dark.bg` | `#0C0F0D` |
| App gradient (3-stop) | `Gradients.appBg` | `['#080D09', '#0C1410', '#0F1C14']` |
| First elevation (cards) | `Colors.dark.cardBg` | `rgba(255,255,255,0.04)` |
| Card border (subtle) | `Colors.dark.cardBorder` | `rgba(255,255,255,0.08)` |
| Second elevation (sheets, modals) | `Colors.dark.bgElevated` | `#1C2119` |
| Sheet border (stronger) | `Colors.dark.borderStrong` | `rgba(255,255,255,0.12)` |
| Input field background | `Colors.dark.inputBg` | `rgba(255,255,255,0.06)` |
| Input field border | `Colors.dark.inputBorder` | `rgba(255,255,255,0.12)` |

**Rule:** Never use `Colors.surface (#FFFFFF)`, `Colors.bg (#EDE8DC)`, or `Colors.bgCard (#FFFFFF)` as a screen background or card background on any dark-system screen. Those are legacy light-mode tokens only.

### Accent Colors

| Role | Token | Hex |
|---|---|---|
| Primary CTA (on dark bg) | `Colors.dark.ctaPrimary` | `#52B788` |
| Deep forest green (brand) | `Colors.brand` | `#1B4332` |
| Data green (optimal values) | `Colors.viz.bioGreen` | `#4ADE80` |
| Teal (secondary accent) | `Colors.viz.teal` | `#00B89C` |
| Cyan (orbital motif) | `Colors.viz.cyan` | `#00C4C4` |
| Amber (review/warn values) | `Colors.viz.amber` | `#F59E0B` |
| Coral (critical values) | `Colors.viz.coral` | `#F87171` |
| Purple (chart) | `Colors.viz.purple` | `#A78BFA` |

### Status / Biomarker State Colors (dark surfaces)

| State | Background | Border | Text |
|---|---|---|---|
| Optimal | `Colors.dark.statusOptimalBg` `rgba(74,222,128,0.12)` | `Colors.dark.statusOptimalBorder` `rgba(74,222,128,0.3)` | `Colors.viz.bioGreen` `#4ADE80` |
| Review / Suboptimal | `Colors.dark.statusWarnBg` `rgba(245,158,11,0.12)` | `Colors.dark.statusWarnBorder` `rgba(245,158,11,0.3)` | `Colors.viz.amber` `#F59E0B` |
| Critical / Out of range | `Colors.dark.statusCritBg` `rgba(248,113,113,0.12)` | `Colors.dark.statusCritBorder` `rgba(248,113,113,0.3)` | `Colors.viz.coral` `#F87171` |

### Text Colors (dark surfaces)

| Role | Token | Value |
|---|---|---|
| Primary body text | `Colors.dark.text` | `#E8F5EE` |
| Secondary / muted text | `Colors.dark.textMuted` | `rgba(232,245,238,0.5)` |
| Disabled / placeholder | — | `rgba(232,245,238,0.3)` |

### Active / Selected State Tint (dark surfaces)

| Role | Token | Value |
|---|---|---|
| Selected card / chip background | `Colors.dark.accentBg` | `rgba(82,183,136,0.12)` |
| Selected card / chip border | `Colors.dark.accentBorder` | `rgba(82,183,136,0.3)` |

### Biomarker Card Gradients (dark system)

| State | Token | Value |
|---|---|---|
| Optimal data card | `Gradients.darkCardGood` | `['rgba(74,222,128,0.08)', 'rgba(74,222,128,0.04)']` |
| Review data card | `Gradients.darkCardWarn` | `['rgba(245,158,11,0.08)', 'rgba(245,158,11,0.04)']` |
| No-data card | `Gradients.darkCardNone` | `['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']` |

---

## Typography Rules

All sizes live in `Typography.sizes.*`, spacing in `Typography.letterSpacing.*`.

### Type Hierarchy

| Role | Size token | Weight | Usage |
|---|---|---|---|
| Display hero (sphere number) | `display2` (44) | 200 (ultra-light) | BioAge number in LongevityScore sphere |
| Large title | `h1` (28) / `xxl` (28) | 300 (light) | Screen-level titles (Protocol, Dashboard) |
| Headline | `h2` (22) | 300–500 | Card headings, section values |
| Subheadline | `h3` (18) | 600 | Modal/sheet titles, card section headers |
| Body | `body` (15) | 400 | Card body text, list item names |
| Body small | `bodySmall` (13) | 400 | Subtitles, secondary info |
| Caption / label | `caption` (12) | 400–600 | Timestamps, metadata |
| Micro | `captionSmall` (11) | 400–600 | Units, badge text |

### Eyebrow Label Convention

Section headers like "BIOMARKERS", "BIO AGE", "TODAY'S PROTOCOL", "YOUR STACK" use:
- `fontSize: Typography.sizes.captionSmall` (11) or `Typography.sizes.xs` (11)
- `fontWeight: '600'`
- `textTransform: 'uppercase'`
- `letterSpacing: Typography.letterSpacing.widest` (3) or 1.5
- `color: Colors.dark.textMuted`

**Never** use a plain sentence-case section header for top-level sections. Always eyebrow style.

---

## Layout & Component Rules

### Corner Radius Values

| Usage | Token | Value |
|---|---|---|
| Pill buttons, full-round chips | `Radius.full` | 999 |
| Large cards, modals, main CTAs | `Radius.xl` | 20 |
| Cards, panels | `Radius.lg` | 16 |
| Inputs, chips | `Radius.md` | 12 |
| Small badges | `Radius.sm` | 10 |

**iOS standard:** Main cards use `Radius.xl` (20). Inputs and chips use `Radius.md` (12). Pill buttons use `Radius.full` (999).

### Card / Surface Elevation Pattern

Dark surfaces stack like this (bottom → top):
1. **Screen**: `Colors.dark.bg` (#0C0F0D) or `Gradients.appBg` LinearGradient
2. **First card layer**: `rgba(255,255,255,0.04)` bg + `rgba(255,255,255,0.08)` border (0.5px) + `Radius.xl`
3. **Second card layer / inline sections**: `rgba(255,255,255,0.06)` bg + `rgba(255,255,255,0.12)` border (0.5px) + `Radius.md`
4. **Modal / bottom sheet**: `Colors.dark.bgElevated` (#1C2119) with `rgba(255,255,255,0.08)` border
5. **Input fields (inside modals)**: `rgba(255,255,255,0.06)` bg + `rgba(255,255,255,0.12)` border (1px) + `Radius.md`

### Icon Style Rule

All icons use `DesignSystemIcons` or custom SVG. They are **simple, thin-stroke, single-color line icons** using the current context text or accent color — no filled solid icons, no colored square/circle background containers behind icons.

The only exception is status indicators (check circles) where the filled circle is the interactive state itself.

### Constellation / NeuralGrid Motif Rule

`NeuralGrid` (the animated constellation background) is the signature motif of the app. It appears on **exactly 2 screens**:
1. **WelcomeScreen** — hero screen, `intensity="medium"`, `tone="vital"` (creates first impression)
2. **LongevityScoreScreen** — canonical reference screen, `intensity="high"`, `tone="vital"`

**Do not add NeuralGrid to any other screen.** It will feel templated and lose its distinctiveness. All other screens use `Colors.dark.bg` or `Gradients.appBg` as plain dark backgrounds.

### On-Brand Checklist

Before shipping any new screen or component, verify all of the following:

- [ ] **Background**: uses `Colors.dark.bg` or `Gradients.appBg` — not white, not cream, not any `Colors.bg`/`Colors.surface`/`Colors.bgCard`
- [ ] **Cards**: use `rgba(255,255,255,0.04)` background and `rgba(255,255,255,0.08)` border at 0.5px — not `Colors.surface` or solid dark
- [ ] **Text**: primary text is `Colors.dark.text (#E8F5EE)`, secondary is `Colors.dark.textMuted` — not `Colors.textPrimary (#1A1A18)` or black
- [ ] **Status badges**: use the dark status tints from `Colors.dark.statusOptimal*` / `statusWarn*` / `statusCrit*` — not the light `Colors.status.*` tokens
- [ ] **Feels native iOS**: is every touchable control minimum 44pt tall? Do chips/buttons use Radius.full or Radius.xl? Does it look like it belongs next to Apple Health?
- [ ] **Contrast sufficient**: all body text passes WCAG AA (4.5:1) on its card background — use the rgba glass values, not a darker solid that kills contrast

---

## Anti-Patterns (Never Do These)

1. **Flat light cream/white backgrounds**: `Colors.bg (#EDE8DC)`, `Colors.bgCard (#FFFFFF)`, `Colors.surface (#FFFFFF)` must never appear as a screen or card background. These are legacy light-mode tokens that conflict with the dark identity.

2. **Colored square icon containers**: No `width: 32 / height: 32 / borderRadius: Radius.md / backgroundColor: Colors.primaryBg` icon wrapper squares. Icons are inline, single-color line art — no background pill/square behind them.

3. **Low-contrast text on dark cards**: Avoid `color: Colors.dark.text` on `Colors.dark.bgElevated` for dense body text without checking contrast. Use `Colors.dark.textMuted` for secondary info to maintain clear visual hierarchy — not the same color for everything.

4. **Non-English strings**: All user-facing copy must be in English. Any Turkish or other language strings left from development must be found and replaced before shipping.

5. **Inconsistent spacing between sibling cards**: Every card of the same type (e.g. protocol item cards, biomarker rows) must have identical `marginBottom` values. Do not mix `Spacing.sm`, `Spacing.md`, and 10 for similar elements in the same list.

---

## Screens Reference

| Screen | Background | NeuralGrid | Notes |
|---|---|---|---|
| WelcomeScreen | `Colors.dark.bg` | ✓ medium/vital | Hero entry — canonical dark |
| LandingScreen | `Gradients.appBg` | ✗ | Pre-auth landing, dark gradient |
| OnboardingScreen | `Colors.dark.bg` | ✗ | Multi-step form, dark |
| DashboardScreen | `Colors.dark.bg` | ✗ | Main tab — dark, no NeuralGrid |
| LongevityScoreScreen | `Gradients.appBg` | ✓ high/vital | Canonical reference |
| ProtocolScreen | `Colors.dark.bg` | ✗ | Protocol list, dark |
| BiomarkerEntryScreen | `Colors.dark.bg` | ✗ | Log form, dark |
| BiomarkerDetailScreen | `Colors.dark.bg` | ✗ | Detail + chart, dark |
| ExerciseScreen | `Colors.dark.bg` | ✗ | Exercise list, dark |
| AIAdvisorScreen | `Gradients.appBg` | ✗ | AI chat, dark gradient |
