# Phase 5: Design Tokens & Icons - Context

**Gathered:** 2026-05-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Add `Colors.Beige.*` token block to `src/theme/index.ts` and replace all 5 emoji tab bar icons with custom SVG neural-dots icons in `AppNavigator.tsx` — the visual building blocks for Phase 6's warm UI overhaul. No screens are restyled in this phase.

</domain>

<decisions>
## Implementation Decisions

### Icon Visual Style
- **D-01:** Style = neural dots aesthetic — minimal, geometric, connected-node vocabulary. Thin **1.5px strokes**. Biological and futuristic. Same visual language as `NeuralGrid.tsx` and the LongevityScore orbital sphere. NOT medical (no pills/stethoscopes), NOT athletic (no running figures).
- **D-02:** **Home icon** — central node with 3–4 orbiting nodes (echoes the LongevityScore orbital sphere)
- **D-03:** **Biomarkers icon** — DNA double helix: two strands of nodes connected diagonally
- **D-04:** **Protocol icon** — molecule chain: 3–4 nodes linked in a straight or gentle-arc chain
- **D-05:** **Exercise icon** — figure-8 orbital: two orbiting nodes tracing a figure-8 path
- **D-06:** **Profile icon** — node-head: one circle node (head) + an arc of smaller nodes (shoulders)
- **D-07:** **Active state** — `Colors.primary` (#2D6A4F green) stroke color + the icon's central/focal node is **filled** (solid circle). Inactive: all strokes only, no fills. Driven by the `focused` prop React Navigation passes — no custom focus state management. The `color` prop from React Navigation carries the active/inactive color; `focused` prop controls the center-node fill.

### Beige Token Scope
- **D-08:** Add a **complete semantic set** — all tokens Phase 6 needs, defined in Phase 5. Phase 6 must not need to add tokens mid-execution.
- **D-09:** Strategy: existing hex values reused for structural tokens + 2 new warm accent tones that don't exist yet.
- **D-10:** Full `Colors.Beige.*` token list to add to `src/theme/index.ts`:
  ```
  Beige.bg          = '#EDE8DC'   // main warm background (same as Colors.bg)
  Beige.bgSecondary = '#EDE8DC'   // secondary background (same as Colors.bgSecondary)
  Beige.bgShade     = '#E4E0D4'   // slightly darker shade (same as Colors.bgShade)
  Beige.card        = '#FFFFFF'   // card surface (same as Colors.bgCard)
  Beige.border      = '#D4CFC4'   // standard border (same as Colors.border)
  Beige.borderLight = '#E2DED6'   // light border (same as Colors.borderLight)
  Beige.text        = '#1A1A18'   // primary text on warm backgrounds (same as Colors.textPrimary)
  Beige.textSecondary = '#4A4A45' // secondary text (same as Colors.textSecondary)
  Beige.textMuted   = '#8A8A82'   // muted text (same as Colors.textMuted)
  Beige.divider     = '#C8C0B0'   // NEW — warm tan dividers between list items
  Beige.headerBg    = '#F5F0E8'   // NEW — warm cream for section header backgrounds
  ```
- **D-11:** No existing `Colors.*` key is renamed or removed. `Colors.Beige` is added as a new nested object alongside existing top-level keys.

### Tab Bar Styling
- **D-12:** Phase 5 replaces emoji with SVG icons AND explicitly sets `tabBarStyle.backgroundColor` to `Colors.Beige.bg`. Functionally identical to current `Colors.bg` but makes Phase 6's intent clear.
- **D-13:** Tab labels (Home, Biomarkers, Protocol, Exercise, Profile) unchanged. No label removal.
- **D-14:** All other tab bar properties (height, padding, separator, label style, font) left for Phase 6.

### Icon Implementation Architecture
- **D-15:** Create a single `src/components/TabIcons.tsx` file with 5 named exports — `HomeIcon`, `BiomarkersIcon`, `ProtocolIcon`, `ExerciseIcon`, `ProfileIcon`. Each accepts `{ color: string; focused: boolean; size?: number }` props. Consistent with existing component pattern (single file per component group).
- **D-16:** Viewport size: **24×24** (standard React Navigation tab icon size). All 5 icons use the same bounding box.
- **D-17:** Implementation: inline SVG components using `react-native-svg` (`Svg`, `Circle`, `Line`, `Path`, `G` from the existing dependency — already used by `NeuralGrid.tsx`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Theme & Design Tokens
- `src/theme/index.ts` — file to modify; add `Colors.Beige` object. Must not rename or remove any existing key. `tsc --noEmit` must pass after changes.

### Navigation & Icon Registration
- `src/navigation/AppNavigator.tsx` — file to modify; replace `TabIcon` emoji component (lines 42–48) with SVG icon imports from `TabIcons.tsx`. Tab bar `tabBarStyle.backgroundColor` switches from `Colors.bg` to `Colors.Beige.bg`.

### Visual Reference
- `src/components/NeuralGrid.tsx` — **READ THIS** before designing SVG paths. This is the canonical visual reference for the neural dots aesthetic: how nodes (circles), lines (stroke-based), and the connected-node vocabulary are rendered using `react-native-svg`.

### Phase Roadmap
- `.planning/ROADMAP.md` §Phase 5 — success criteria and requirements (ICON-01, ICON-02, THEME-01) that MUST be satisfied. Success criteria are reproduced here for quick reference:
  1. Tab bar displays five custom stroke-based SVG icons — no emoji visible
  2. Active icon renders in navigation accent color; inactive in muted color — no manual focused-state logic required
  3. `Colors.Beige.*` tokens accessible from `src/theme/index.ts`; no existing `Colors.*` constant renamed or removed; `tsc --noEmit` passes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/NeuralGrid.tsx` — uses `react-native-svg` with `Circle`, `Line`, `Svg` from `react-native-svg`. Same dependency the tab icons will use. Read for SVG API patterns.
- `src/hooks/useBreathing.ts` — NOT needed for Phase 5 (icons are static, no animation in tab bar).

### Established Patterns
- All colors from `Colors.*` — never hardcode hex in StyleSheet or JSX props. Icon `color` prop value comes from React Navigation and is the exception (it's a runtime value, not a hardcoded hex).
- `react-native-svg` is already in `node_modules` — no new install needed.
- StyleSheet named `s` at bottom of file — applies to `TabIcons.tsx` if it has any styles.
- Import order in new files: React → React Native → Expo → third-party (react-native-svg) → internal theme.

### Integration Points
- `src/navigation/AppNavigator.tsx`: `MainTabs()` function, `Tab.Navigator` `screenOptions` block — this is where `tabBarActiveTintColor`, `tabBarInactiveTintColor`, and `tabBarStyle` live. The `tabBarIcon` prop on each `Tab.Screen` is where SVG icons are registered.
- `src/theme/index.ts`: Add `Beige` object at the end of the `Colors` const before the closing brace. Keep existing keys untouched.

</code_context>

<specifics>
## Specific Ideas

- **Visual reference the user named:** The LongevityScore screen's orbital sphere + `NeuralGrid.tsx` animated dots. The tab icons should feel like static single-frame captures of that aesthetic — same node-and-connection vocabulary, just simplified for 24×24.
- **Icon unifier:** Every icon should have a "focal node" — one primary circle that is the anchor point. In active state this node fills. In inactive state it's a stroke-only circle. This creates cohesion across all 5 icons.
- **Stroke weight:** 1.5px consistently across all 5 icons (not 1px — too thin at small size, not 2px — too heavy for the delicate neural aesthetic).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 5 — Design Tokens & Icons*
*Context gathered: 2026-05-30*
