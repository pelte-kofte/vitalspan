---
phase: 05-design-tokens-and-icons
reviewed: 2026-05-30T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/theme/index.ts
  - src/components/TabIcons.tsx
  - src/navigation/AppNavigator.tsx
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-05-30
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 5 added a `Colors.Beige` token block to `src/theme/index.ts`, a new `src/components/TabIcons.tsx` file with five SVG icon components, and wired those icons into `src/navigation/AppNavigator.tsx`. The SVG geometry in `TabIcons.tsx` is broadly correct and the icons will render as intended. One critical structural bug exists in `AppNavigator.tsx`: `BiomarkerDetailScreen` is registered as both a tab screen and a stack screen simultaneously, causing a type contract mismatch and unintended dual registration. Beyond that, the navigator introduces several hardcoded values that violate CLAUDE.md conventions, and the `Colors.Beige` block is a near-complete duplication of existing top-level tokens.

---

## Critical Issues

### CR-01: `BiomarkerDetailScreen` registered as both a Tab screen and a Stack screen

**File:** `src/navigation/AppNavigator.tsx:76` and `src/navigation/AppNavigator.tsx:138`

**Issue:** `BiomarkerDetailScreen` is mounted as the `Biomarkers` tab component (line 76) and also registered as the `BiomarkerDetail` stack screen (line 138). This means:

1. The screen is active at all times when the user is on the Main tabs, not just when navigated to as a modal/card. Any `useFocusEffect` or `useRoute` hook inside it runs in both contexts.
2. `BiomarkerDetailScreen` calls `useRoute<RouteProp<RootStackParamList, 'BiomarkerDetail'>>()` at line 43 of `BiomarkerDetailScreen.tsx`. When the screen is mounted as a tab, the actual route object comes from the Bottom Tab navigator — its `name` is `"Biomarkers"` and it has no `params`. The typed `useRoute` call asserts a `RootStackParamList` route shape that does not exist in this context. While `route.params?.biomarkerId` is safely optional-chained (so it won't crash), the TypeScript type assertion is a lie and any future code that trusts `route.params` on the tab path will silently misbehave.
3. CLAUDE.md lists the intended tab screens as `Dashboard, Biomarkers, Protocol, Profile`. The apparent intent is that the `Biomarkers` tab should show a biomarker list/overview screen, not the detail screen. The detail screen is already correctly registered as `BiomarkerDetail` in the stack (line 138) for deep-linking and in-app navigation.

**Fix:** Replace `BiomarkerDetailScreen` in the tab registration with the correct list/overview component. If no dedicated biomarker list screen exists yet, use a placeholder or create a thin wrapper. The stack registration at line 138 is correct and should be kept.

```tsx
// Line 74-81 — replace component prop
<Tab.Screen
  name="Biomarkers"
  component={BiomarkersScreen}   // dedicated list screen, not the detail screen
  options={{
    tabBarLabel: 'Biomarkers',
    tabBarIcon: ({ color, focused }) => <BiomarkersIcon color={color} focused={focused} />,
  }}
/>
```

---

## Warnings

### WR-01: `size` prop from `tabBarIcon` callback ignored — icons always render at 24px

**File:** `src/navigation/AppNavigator.tsx:71,79,87,95,103`

**Issue:** React Navigation's Bottom Tab navigator calls `tabBarIcon` with `{ color, size, focused }`. The `size` value is set to `25` by the internal `TabBarIcon` renderer. All five `tabBarIcon` callbacks in `AppNavigator.tsx` destructure only `{ color, focused }` and discard `size`. Each icon component is rendered at its hardcoded default of `size=24` regardless of what the navigator requests. This creates a 1px discrepancy between the allocated icon box and the rendered SVG, which can cause icon clipping or misalignment if the tab bar height or icon slot size is ever adjusted by the navigator.

**Fix:** Forward `size` through each callback:

```tsx
tabBarIcon: ({ color, focused, size }) => (
  <HomeIcon color={color} focused={focused} size={size} />
),
```

Apply the same pattern to all five tab screens.

---

### WR-02: Hardcoded magic numbers in `tabBarStyle` violate CLAUDE.md spacing conventions

**File:** `src/navigation/AppNavigator.tsx:48-55`

**Issue:** The `tabBarStyle` object contains several hardcoded numeric literals that bypass the `Spacing.*` token system:

- `paddingBottom: Math.max(insets.bottom, 8)` — `8` is `Spacing.sm` but written raw
- `paddingTop: 8` — same, should be `Spacing.sm`
- `height: Math.max(insets.bottom, 0) + 56` — `56` is a magic number with no token; also the height formula double-counts `insets.bottom` since `paddingBottom` already absorbs it, meaning the content area shrinks on devices with a home indicator (see note below on the height bug)

The height formula is also functionally questionable: when `insets.bottom = 34` (iPhone with home indicator), `height = 90` and `paddingBottom = 34`, leaving `56px` for icon + label. That is correct. But when `insets.bottom = 0`, `height = 56` and `paddingBottom = 8`, leaving only `48px` for icon + label. The asymmetry means label rendering differs between device types.

**Fix:**

```tsx
tabBarStyle: {
  backgroundColor: Colors.Beige.bg,
  borderTopColor: 'rgba(0, 0, 0, 0.06)',
  borderTopWidth: 0.5,
  paddingBottom: Math.max(insets.bottom, Spacing.sm),
  paddingTop: Spacing.sm,
  height: Math.max(insets.bottom, 0) + 56,  // 56 should be extracted as a named constant
},
```

---

### WR-03: `borderTopColor` is a hardcoded `rgba` literal absent from the `Colors` token map

**File:** `src/navigation/AppNavigator.tsx:50`

**Issue:** `borderTopColor: 'rgba(0, 0, 0, 0.06)'` is a raw hex/rgba string not defined anywhere in `src/theme/index.ts`. CLAUDE.md explicitly states "All colors from `src/theme/index.ts` — never hardcode hex values in screens". The existing `Colors.dark.border` token (`rgba(255,255,255,0.08)`) shows that rgba values are welcome in the theme file.

**Fix:** Add a token to `Colors` (or `Colors.Beige`) in `src/theme/index.ts`:

```ts
// In Colors or Colors.Beige
tabBarBorder: 'rgba(0, 0, 0, 0.06)',
```

Then reference it:

```tsx
borderTopColor: Colors.Beige.tabBarBorder,
```

---

### WR-04: `tabBarLabelStyle` uses values outside `Typography` and `Spacing` token ranges

**File:** `src/navigation/AppNavigator.tsx:58-63`

**Issue:** Three values in `tabBarLabelStyle` are not represented by any token:

- `fontSize: 10` — `Typography.sizes` has `xs: 11` as the smallest entry; `10` is below the defined scale
- `marginTop: 2` — `Spacing` minimum is `xs: 4`; `2` is not a valid spacing unit
- `letterSpacing: 0.3` — `Typography.letterSpacing` has `normal: 0` and `wide: 0.5`; `0.3` is an interpolated value not in the scale

While navigator options cannot use `StyleSheet.create`, the numeric values themselves should still respect the token scale. Using out-of-scale values makes future theme changes miss the tab bar label.

**Fix:** Either add `tabLabel` size and `tight2` letter-spacing tokens to the theme, or snap to the nearest token:

```tsx
tabBarLabelStyle: {
  fontSize: Typography.sizes.xs,          // 11 — closest defined token
  fontWeight: '600',
  marginTop: 0,                           // remove sub-token value; adjust height instead
  letterSpacing: Typography.letterSpacing.normal,  // 0; or add a 'tabLabel: 0.3' token
},
```

---

## Info

### IN-01: `Colors.Beige` block duplicates 9 of 11 top-level `Colors` tokens verbatim

**File:** `src/theme/index.ts:92-105`

**Issue:** `Colors.Beige` contains 11 tokens. Of those, 9 are identical in value to existing top-level `Colors` properties:

| `Colors.Beige.*` | Value | Existing token |
|---|---|---|
| `bg` | `#EDE8DC` | `Colors.bg`, `Colors.bgSecondary` |
| `bgSecondary` | `#EDE8DC` | `Colors.bg`, `Colors.bgSecondary` |
| `bgShade` | `#E4E0D4` | `Colors.bgShade` |
| `card` | `#FFFFFF` | `Colors.bgCard` |
| `border` | `#D4CFC4` | `Colors.border` |
| `borderLight` | `#E2DED6` | `Colors.borderLight` |
| `text` | `#1A1A18` | `Colors.textPrimary` |
| `textSecondary` | `#4A4A45` | `Colors.textSecondary` |
| `textMuted` | `#8A8A82` | `Colors.textMuted` |

Only `divider` (`#C8C0B0`) and `headerBg` (`#F5F0E8`) are new values. This creates a maintenance hazard: if the base palette changes, the Beige namespace must be updated in lockstep or the values diverge silently.

**Suggestion:** Reference existing tokens instead of duplicating values, and only define the two genuinely new entries:

```ts
Beige: {
  bg:           Colors.bg,
  bgSecondary:  Colors.bgSecondary,
  bgShade:      Colors.bgShade,
  card:         Colors.bgCard,
  border:       Colors.border,
  borderLight:  Colors.borderLight,
  text:         Colors.textPrimary,
  textSecondary:Colors.textSecondary,
  textMuted:    Colors.textMuted,
  divider:      '#C8C0B0',   // new
  headerBg:     '#F5F0E8',  // new
},
```

Note: this requires `Beige` to be defined after the top-level fields in the same object literal, which is possible by splitting into a two-step construction, or defining both as separate `const` exports.

---

### IN-02: `Colors.Beige` block comment references wrong phase number

**File:** `src/theme/index.ts:92`

**Issue:** The comment reads `// Warm Beige palette — used by Phase 6 warm-screen redesign`. This token block was introduced in Phase 5, and Phase 6 does not exist yet. The mislabeled comment will mislead future contributors about when and why the tokens were introduced.

**Fix:**

```ts
// Warm Beige palette — introduced Phase 5; tab bar + future warm-screen usage
```

---

### IN-03: `ProfileIcon` has a 3-unit gap between neck line end and shoulder junction

**File:** `src/components/TabIcons.tsx:96-98`

**Issue:** The neck `Line` runs from `(12, 10)` to `(12, 15)`. The shoulder `Line` elements meet at `(12, 18)`. This leaves a 3-unit unconnected gap in the stick-figure body between `y=15` and `y=18`. At tab icon scale (`24-25px`), this gap is approximately 3px — visible as a disconnected torso on high-density displays.

This may be an intentional design choice (breathing room matching the neural-graph aesthetic of the other icons), but it is geometrically inconsistent: every other icon's lines connect to their nodes without gaps.

**Fix (if unintentional):** Extend the neck line to meet the shoulder junction:

```tsx
{/* Neck line — extended to meet shoulder junction */}
<Line x1={12} y1={10} x2={12} y2={18} stroke={color} strokeWidth={1.5} />
```

---

_Reviewed: 2026-05-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
