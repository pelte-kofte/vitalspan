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

### Weights & Line Heights

`Typography.weights.*` and `Typography.lineHeights.*` formalize the Type Hierarchy table above — pair the size role with the matching weight/line-height token instead of hardcoding raw `fontWeight`/`lineHeight` values:

| Token | Value | Pair with |
|---|---|---|
| `Typography.weights.displayHero` | `'200'` | `sizes.display2` (sphere number) |
| `Typography.weights.title` | `'300'` | `sizes.h1` |
| `Typography.weights.headline` | `'400'` (use `'500'` for emphasis) | `sizes.h2` |
| `Typography.weights.subheadline` | `'600'` | `sizes.h3` |
| `Typography.weights.body` | `'400'` | `sizes.body` |
| `Typography.weights.label` | `'600'` | eyebrow labels, badges |

| Token | Value |
|---|---|
| `Typography.lineHeights.display1/2/3` | 60 / 50 / 42 |
| `Typography.lineHeights.h1/h2/h3` | 34 / 28 / 24 |
| `Typography.lineHeights.body` | 21 |
| `Typography.lineHeights.bodySmall` | 18 |
| `Typography.lineHeights.caption` / `captionSmall` | 16 / 14 |

### Editorial Display Serif (Issue Headlines Only)

`Typography.displaySerif` (`src/theme/index.ts`) — `Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' })`.

This is the **one** display serif in the app, and it is scoped to exactly one use: the cover-story headline on "The Vitalspan Brief" front page (`ArticlesScreen.tsx` / `IssueHeroCard`). It is a distinct token from the generic `Typography.serif` (`'serif'`) already used on `WelcomeScreen`/`LandingScreen` hero titles — those stay as they are. Pair `displaySerif` with a heading size (`Typography.sizes.h1`/`display2`) and `Typography.weights.title` or lighter; never bold. Do **not** use `displaySerif` for brief-card titles, the pharmacist's note, article-reader titles, or any other screen — everything else in the app stays SF (system sans).

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

(Premium Polish pass note: `FutureSelf.tsx` previously rendered a low-opacity `NeuralGrid` overlay behind its card content on the Dashboard — a violation of this rule. Removed; the card now uses a plain dark card background like every other Dashboard card.)

### Motion System

`Motion.*` (in `src/theme/index.ts`) holds the micro-interaction constants — do not hardcode press-scale, spring, or entrance timing values inline:

| Token | Value | Usage |
|---|---|---|
| `Motion.pressScale` | `0.97` | Scale target for button/card press feedback |
| `Motion.pressSpring` | `{ damping: 16, stiffness: 260 }` | Spring config for the press-release bounce-back |
| `Motion.entranceDuration` | `220` | Card/list-item fade+slide-in duration — no overshoot |
| `Motion.entranceStagger` | `50` | ms delay added per list index when staggering entrance |
| `Motion.entranceOffset` | `10` | px the entrance animation slides up from |

**Shared components — use these instead of hand-rolling animations:**

- **`AnimatedPressable`** (`src/components/AnimatedPressable.tsx`) — drop-in `TouchableOpacity` replacement for primary/secondary CTAs. Scales to `Motion.pressScale` on press with a spring back, fires a light (or `medium`) haptic via `expo-haptics`. Runs on the UI thread (Reanimated worklets) — never blocks JS.
- **`StaggerIn`** (`src/components/StaggerIn.tsx`) — wraps a card/list-item with a fade + slide-up mount animation via Reanimated's `FadeInUp`, staggered by an `index` prop (`index * Motion.entranceStagger` delay). Used for the cascading on-mount reveal on Dashboard, Protocol, and Exercise.
- **`Skeleton.tsx`** (`SkeletonPulse`, `SkeletonBlock`, `SkeletonCard`) — generalized loading-shimmer primitives (an opacity-pulse `Animated.Value` looped 0.3↔0.6, plus placeholder blocks tinted `Colors.dark.bgElevated`). Compose a screen-specific skeleton around these rather than duplicating the animation loop (see `ArticleSkeletonLoader.tsx`, or the `DashboardSkeleton`/`ProtocolSkeleton`/`ExerciseSkeleton` components local to those screens). Every data-driven screen should gate its first paint on a `initialLoading` flag (set once via a `hasLoadedOnceRef`, so the skeleton only shows on cold mount — never on a tab-focus refetch) rather than flashing an empty/placeholder state.
- **`BioAgeSpherePreview`** (`src/components/BioAgeSpherePreview.tsx`) — a small (default 64px), non-canonical riff on the BioAge sphere motif for compact contexts: the Dashboard's empty BioAge card and the boot loading screen (`BootLoadingScreen.tsx`). Takes a `dimmed` prop for the "not enough data yet" state. This does **not** replace or import from `LongevityScoreScreen.tsx`, which remains the one full canonical sphere instance (orbit rings, data orbs, entrance/pulse animation) — see the Constellation/NeuralGrid Motif Rule below for why duplicating that complexity elsewhere is deliberately avoided.

### On-Brand Checklist

Before shipping any new screen or component, verify all of the following:

- [ ] **Background**: uses `Colors.dark.bg` or `Gradients.appBg` — not white, not cream, not any `Colors.bg`/`Colors.surface`/`Colors.bgCard`
- [ ] **Cards**: use `rgba(255,255,255,0.04)` background and `rgba(255,255,255,0.08)` border at 0.5px — not `Colors.surface` or solid dark
- [ ] **Text**: primary text is `Colors.dark.text (#E8F5EE)`, secondary is `Colors.dark.textMuted` — not `Colors.textPrimary (#1A1A18)` or black
- [ ] **Status badges**: use the dark status tints from `Colors.dark.statusOptimal*` / `statusWarn*` / `statusCrit*` — not the light `Colors.status.*` tokens
- [ ] **Feels native iOS**: is every touchable control minimum 44pt tall? Do chips/buttons use Radius.full or Radius.xl? Does it look like it belongs next to Apple Health?
- [ ] **Contrast sufficient**: all body text passes WCAG AA (4.5:1) on its card background — use the rgba glass values, not a darker solid that kills contrast

---

## Editorial Rules (De-Slop Pass)

> Added by the "De-Slop" edit pass. Oura is the north star: quiet surfaces, typography-led hierarchy, one hero per screen. These rules are permanent — every future screen or component must be checked against them, not just the two screens named below.

1. **One hero per screen.** Every screen has exactly one visually dominant element. Everything else is subordinate — smaller, dimmer, tighter. If two elements are competing for attention (e.g. BioAge card and Future Self card), shrink the secondary one until there's no contest.

2. **No decorative gradients.** Gradients are banned everywhere except the BioAge sphere itself (`LongevityScoreScreen`, `PaywallHero`, `BioAgeSpherePreview` — the sphere motif family). Cards are flat dark surfaces (`Colors.dark.cardBg` / `bgElevated`) differentiated by a 1px hairline border (`Colors.dark.cardBorder`, white at 6–8% opacity) — no glows, no colored card backgrounds. Status/severity is carried by border color, icon color, and text color — never by tinting the whole card fill.

3. **One CTA per card.** A card may have exactly one action. Don't pair a full-card `onPress` with a second inline button doing something else, and don't duplicate the same action as both a button and a text link.

4. **Copy is human and specific.** Brand voice is a calm pharmacist: precise, warm, unhurried. Banned words anywhere in user-facing copy: "unlock" / "unlocked", "journey", "supercharge", "elevate" (as a verb/marketing flourish — clinical "elevated biomarker" is fine), "seamless", "empower", "personalized to you" as filler, "science-backed" as filler. No exclamation marks in UI copy. No emoji in UI chrome (icons, badges, buttons) — emoji are fine only in genuinely conversational contexts, never as a icon replacement. Microcopy states quantities and actions concretely ("Log 9 biomarkers", not "Complete your profile to unlock insights").

5. **Numbers are the decoration.** This is a data product — big, beautiful numerals (tabular figures, generous size, light weight) do the visual work that gradients used to do. The single largest piece of text in the app is the unlocked biological-age numeral on the Dashboard (`Typography.sizes.heroNumeral`, 68pt, weight 200).

6. **Exactly two corner radii app-wide.** `Radius.card` (12) for cards, inputs, chips, badges. `Radius.sheet` (24) for bottom sheets, modals, and large pill-shaped CTAs. `Radius.full` (999) remains separate — it's a computed stadium/circle shape (height ÷ 2), not a fixed radius value, and is still used for true pills and circular buttons. The old `sm`/`md`/`lg`/`xl`/`xxl` names in `src/theme/index.ts` are kept as aliases so existing call sites don't need a rename, but they now all resolve to one of these two numbers (see the Corner Radius table above, which is superseded by this rule).

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
| PaywallScreen | `Colors.dark.bg` + `Gradients` hero | ✓ medium/vital (in `PaywallHero`) | Dark hero + dark elevated price sheet (`Colors.dark.bgElevated`) — previously a white `Colors.surface` bottom sheet, converted for consistency |
| ProfileScreen | `Colors.dark.bg` | ✗ | Converted from legacy `Colors.surface` light tokens (Premium Polish pass) |
| SettingsScreen | `Colors.dark.bg` | ✗ | Converted from legacy `Colors.surface` light tokens (Premium Polish pass) |
| ArticlesScreen ("The Vitalspan Brief") | `Colors.dark.bg` | ✗ | Weekly editorial front page — one serif hero (cover story), flat brief cards, pharmacist's note, past-issues archive. See Editorial Display Serif above |
| ArticleDetailScreen | `Colors.dark.bg` | ✗ | Reading view — no hero gradient, ~70ch measure, tappable PMID citation footer |

**Not yet converted:** `AboutScreen.tsx` still uses the legacy light `Colors.surface`/`Colors.onSurface` token set — out of scope for the Premium Polish pass (not named in the brief); convert it next using ProfileScreen/SettingsScreen as the reference pattern.
