# Phase 13: UI / Design System - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Three connected workstreams:

1. **Token system overhaul** — Complete redesign of `src/theme/index.ts` away from beige/warm palette to a clean white/near-white light mode with a deep forest green CTA accent. New tokens: `Colors.surface`, `Colors.surfaceElevated`, `Colors.brand`, `semantic.*` namespace. Additive approach: existing tokens preserved; `Colors.Beige.*` block removed. All screens migrated from the beige system to the new white/green system.

2. **Icon system completion** — Convert all remaining emoji placeholders to SVG neural-dot icons (LabUploadScreen, OnboardingScreen). Full audit of all screens for places where an icon should exist but currently doesn't. Delete `PlaceholderScreens.tsx` (unused dead code). Tab bar icons are already complete (Phase 5).

3. **Token compliance sweep** — While-we're-in-there rule: any screen touched for color migration also gets its hardcoded font sizes replaced with `Typography.sizes.*` and hardcoded padding/margin replaced with `Spacing.*`. Gradient hex literals in `LinearGradient` arrays are exempt per CONVENTIONS.md. EAS preview build verification at the end.

LongevityScore dark screen is intentionally untouched — it is the flagship immersive screen and the contrast with the new clean light screens is deliberate.

</domain>

<decisions>
## Implementation Decisions

### Token System Architecture

- **D-01:** **Additive token approach** — add `Colors.surface`, `Colors.surfaceElevated`, `Colors.brand`, and `Colors.semantic.*` as new entries in `src/theme/index.ts`. Existing `Colors.primary`, `Colors.accent`, and other existing tokens are preserved. No existing token is renamed or removed (except `Colors.Beige.*`).

- **D-02:** **New light-mode token values:**
  - `Colors.surface = '#FFFFFF'` — primary card/screen background
  - `Colors.surfaceElevated = '#F9F9F9'` — elevated card surfaces, headers
  - `Colors.brand = '#1B4332'` — deep forest green for CTAs, active states, key data labels
  - `Colors.semantic.success` — green success state
  - `Colors.semantic.warning` — warning state
  - `Colors.semantic.danger` — danger/error state
  - `Colors.semantic.info` — informational state
  - Text on light screens: `#1C1C1E` (Apple-native dark, to be expressed as `Colors.textPrimary` or a new `Colors.onSurface` token)

- **D-03:** **Two-accent system preserved** — `Colors.brand` (#1B4332, forest green) for CTAs and interactive elements; `Colors.accent` (#5B9DBF, neural blue) for data visualization, NeuralGrid nodes, and orbital indicators. Both coexist.

- **D-04:** **`Colors.primary` (#2D6A4F, medium green) stays** for softer green usage (borders, muted states, secondary actions). `Colors.brand` is the new bold primary CTA.

- **D-05:** **Full beige replacement** — all screens currently using `Colors.Beige.*` (Biomarkers, Protocol, Exercise, Profile, Settings, About + any other warm screens) are migrated to the new white/green token system. `Colors.Beige.*` block is removed from `src/theme/index.ts` after migration.

### Design Direction

- **D-06:** **Clean Apple-native feel with green identity** — white backgrounds, near-white card surfaces, `#1C1C1E` text, and `Colors.brand` (#1B4332) used boldly for CTAs, active states, and key data. Not beige/warm. Not cold/clinical. Premium health app that feels at home on iOS with its own identity through the green accent system.

- **D-07:** **Typography: confident hierarchy** — larger headers, clear visual weight difference between heading and body. Typography scale already documented in `src/theme/index.ts` (h1/h2/h3, body, caption scales). Screens should use `Typography.sizes.h1/h2/h3` for headers rather than hardcoded numbers.

- **D-08:** **LongevityScore dark screen stays untouched** — intentional premium contrast. Entering LongevityScore should feel like entering a different space. The split between clean light everyday screens and the dark immersive flagship screen is a design decision, not a gap.

### Icon System

- **D-09:** **All emoji converted to SVG neural-dot** — no exceptions. LabUploadScreen (🔍 search illustration, ✅ success state), OnboardingScreen (goal selection emoji, ✓ checkmarks), any other emoji found during the full audit — all replaced with SVG neural-dot icons matching the existing tab bar icon style.

- **D-10:** **Full icon audit** — beyond replacing existing emoji, audit every screen, modal, and empty state for places where an SVG icon should exist but currently doesn't. Create any missing icons needed for visual completeness.

- **D-11:** **Delete `PlaceholderScreens.tsx`** — dead/unused code. No conversion needed, just deletion.

### Hardcoded Value Sweep

- **D-12:** **While-we're-in-there rule** — any screen touched for the color migration also gets its hardcoded font sizes replaced with `Typography.sizes.*` and hardcoded margin/padding replaced with `Spacing.*` tokens in the same pass. No separate pass needed.

- **D-13:** **Gradient hex exception honored** — hex literals inside `LinearGradient` color arrays are explicitly exempt per CONVENTIONS.md. Only fix hardcoded values in `StyleSheet.create()` blocks that should reference `Colors.*`, `Typography.sizes.*`, or `Spacing.*`.

### Build Verification

- **D-14:** **EAS preview build** — `eas build --profile preview` for SVG rendering verification. The project's `eas.json` already has a preview profile (internal distribution). Fast, fully compiled native bundle without touching the production TestFlight track.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System Source Files
- `src/theme/index.ts` — current token set (Colors, Typography, Spacing, Radius, Gradients, Motion, Elevation). The file to extend with new tokens. Read current values before adding to avoid collisions.
- `src/components/TabIcons.tsx` — existing SVG neural-dot tab bar icons (Phase 5). The visual style reference for all new SVG icons being created in this phase.

### Screen Files to Migrate
- `src/screens/BiomarkersScreen.tsx` — warm Beige screen, full migration to white/green
- `src/screens/ProtocolScreen.tsx` — warm Beige screen, full migration
- `src/screens/ExerciseScreen.tsx` — warm Beige screen, full migration
- `src/screens/ExerciseDetailScreen.tsx` — warm Beige screen, full migration
- `src/screens/ProfileScreen.tsx` — warm Beige screen, full migration
- `src/screens/SettingsScreen.tsx` — warm Beige screen, full migration
- `src/screens/AboutScreen.tsx` — warm Beige screen, full migration
- `src/screens/LandingScreen.tsx` — has hardcoded hex values, audit and migrate
- `src/screens/InteractionCheckerScreen.tsx` — has hardcoded hex values, audit and migrate
- `src/screens/LabUploadScreen.tsx` — has emoji icons (🔍, ✅) + hardcoded font sizes, convert both
- `src/screens/OnboardingScreen.tsx` — has emoji as goal icons + hardcoded font sizes
- `src/screens/LongevityScoreScreen.tsx` — dark screen, DO NOT migrate to light; gradient hex exception applies
- `src/screens/DashboardScreen.tsx` — dark neural sections stay; gradient hex exception applies

### Files to Delete
- `src/screens/PlaceholderScreens.tsx` — unused stubs, delete entirely

### Requirements & Planning
- `.planning/REQUIREMENTS.md §DS-01 through DS-05` — the 5 design system requirements; authoritative acceptance criteria
- `.planning/ROADMAP.md §Phase 13` — success criteria (3 checkpoints): token set documented, all icons SVG, EAS preview build passes

### Conventions & Patterns
- `.planning/codebase/CONVENTIONS.md §Theme Usage` — the StyleSheet/token rules (all colors from Colors.*, Spacing.*, gradient hex exception). Authoritative during the sweep.
- `.planning/codebase/CONVENTIONS.md §StyleSheet` — StyleSheet named `s`, placed at bottom of file

### Prior Phase Context
- `.planning/phases/06-warm-ui-overhaul/06-CONTEXT.md` — Phase 6 introduced Colors.Beige.*. Phase 13 replaces this entire system; this doc is useful for understanding what was built, not for preserving it.
- `.planning/phases/05-design-tokens-and-icons/05-CONTEXT.md` — tab bar icon style established; new SVG icons must match this aesthetic.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/TabIcons.tsx` — 5 named SVG neural-dot components (Home, Biomarkers, Protocol, Exercise, Profile). Visual style reference: stroke-based, neural-dot aesthetic. New icons for LabUploadScreen (search, success) and OnboardingScreen (goal icons, checkmark) must match this style.
- `src/theme/index.ts` `Typography.sizes` — already has a documented scale (`h1/h2/h3`, `body/bodySmall`, `caption/captionSmall`, plus legacy `xs/sm/base/md/lg/xl/xxl`). Screens need to reference these instead of hardcoded numbers.
- `src/theme/index.ts` `Spacing.*` — `xs:4, sm:8, md:12, base:16, lg:20, xl:24, xxl:32`. All hardcoded margin/padding values should map to one of these.

### Established Patterns
- StyleSheet named `s` at bottom of every file; all colors from `Colors.*`; all spacing from `Spacing.*` — the rule exists. This phase enforces it.
- Gradient hex exception: `LinearGradient` color arrays may contain hex literals — CONVENTIONS.md explicitly exempts these.
- Dark screens (LongevityScore, DashboardScreen neural sections, LandingScreen) use `Colors.dark.*` and `Gradients.*` — these are intentionally kept dark. Do not migrate to light system.
- `StatusBar` style: dark on warm/light screens, light on dark screens — after migration, former Beige screens switch to `barStyle="dark-content"` (which they already had); ensure it maps correctly to the new white backgrounds.

### Integration Points
- `src/theme/index.ts` — all new tokens added here; all screen files import from `'../theme'`. No new files needed for the token system.
- `src/components/` — new SVG icon components created here (search icon, success icon, goal icons, etc.). Follow naming: `PascalCase.tsx`.
- Each screen's `StyleSheet.create({ ... })` at the bottom — this is where the hardcoded values live and need to be replaced.
- `Colors.Beige.*` usages: do a `grep -rn "Colors.Beige" src/` after migration to confirm all references are gone before removing the block from theme.

</code_context>

<specifics>
## Specific Ideas

- **New token name `Colors.brand`** for the deep forest green (`#1B4332`). The name `brand` clearly signals "this is the primary brand CTA color" distinct from `Colors.primary` (#2D6A4F, the softer medium green for secondary usage).
- **`#1C1C1E` for text on white screens** — this is the standard Apple-native dark text color, familiar to iOS users, high contrast on white backgrounds.
- **Forest green boldly** — use `Colors.brand` on buttons, active tab indicators, section headers, CTA labels. Not used sparingly — it's the identity color on light screens.
- **Gradient background** on key header areas of light screens may look good with `Colors.brand` as a subtle gradient anchor (e.g., `['#F0F7F3', '#FFFFFF']`) — researcher can explore this as an option.
- **SVG icons for LabUploadScreen**: search magnifier icon (replaces 🔍) and checkmark/check-circle icon (replaces ✅). Should be `Colors.brand` colored or `Colors.accent` depending on context.
- **EAS preview build**: `eas build --profile preview` — the `eas.json` preview profile uses internal distribution. After build completes, install on device and verify: all tab bar SVGs render, all new SVG icons render, no blank spaces or question marks anywhere.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-UI / Design System*
*Context gathered: 2026-06-08*
