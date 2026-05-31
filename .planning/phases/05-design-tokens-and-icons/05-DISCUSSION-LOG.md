# Phase 5: Design Tokens & Icons - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-30
**Phase:** 05-design-tokens-and-icons
**Areas discussed:** Icon visual style, Beige token scope, Tab bar styling

---

## Icon Visual Style

| Option | Description | Selected |
|--------|-------------|----------|
| SF Symbols style | Clean, precise, slightly rounded — native iOS feel | |
| Phosphor / Feather style | Thin 1.5–2px strokes, minimal, modern health-app | |
| Custom athletic / clinical | Longevity/health themed, not generic | |
| Claude decides | Match app's current aesthetic | |
| **User's own direction** | Neural dots — minimal, geometric, 1.5px strokes, connected-node vocabulary, biological and futuristic | ✓ |

**User's choice:** Free-text: "Neural dots style — minimal, geometric, inspired by the neural grid background on LongevityScore. Thin strokes (1.5px), connected nodes aesthetic. Not medical, not athletic — biological and futuristic. Same visual language as the green sphere + neural dots on the dark screen."

---

| Option | Description | Selected |
|--------|-------------|----------|
| Scatter nodes / circuit path | Biomarkers = data-plot nodes; Exercise = path with waypoints | |
| Vertical bars + dots / pulse wave | Biomarkers = bar peaks with nodes; Exercise = ECG pulse | |
| **DNA helix / figure-8 orbital** | Biomarkers = two strands of nodes diagonal; Exercise = two nodes in figure-8 | ✓ |
| Claude decides all 5 | Full creative latitude | |

**User's choice:** DNA double helix for Biomarkers, figure-8 orbital for Exercise.

---

| Option | Description | Selected |
|--------|-------------|----------|
| **Orbital ring / molecule chain / node-head** | Home = orbital sphere; Protocol = chained nodes; Profile = circle head + node arc | ✓ |
| Grid / clock-ring / concentric | Home = 3×3 grid; Protocol = clock ring; Profile = concentric rings | |
| Claude decides all 3 | Full creative latitude | |

**User's choice:** Orbital ring for Home, molecule chain for Protocol, node-head for Profile.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Color only | Active = Colors.primary; inactive = textMuted. Pure nav-system control | |
| **Color + filled center node** | Active: focal node filled. Inactive: all strokes only | ✓ |
| Color + scale-up | 1.1× transform — requires manual focus state | |

**User's choice:** Color + filled center node on active state.

---

## Beige Token Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal foundation | 5 core tokens: bg, card, border, text, textMuted | |
| **Complete semantic set** | All tokens Phase 6 needs, defined in Phase 5 | ✓ |
| Just bg + card | 2 tokens only, extend in Phase 6 | |

**User's choice:** Complete semantic set — avoid mid-Phase-6 token additions.

---

| Option | Description | Selected |
|--------|-------------|----------|
| **Reuse existing hex values** | Organize existing bg/border hex under Beige.* namespace | |
| Introduce warmer values | New hex tones, needs specific values | |
| **Mix — existing bg + new accent** | Existing hex for structure + 2 new warm accent tones | ✓ |

**User's choice:** Mix — reuse existing hex for bg/card/border/text tokens, add 2 new tones.

---

| Option | Description | Selected |
|--------|-------------|----------|
| **Section header backgrounds + dividers** | Beige.headerBg (#F5F0E8) for section headers; Beige.divider (#C8C0B0) for list dividers | ✓ |
| Card hover/pressed + highlights | For interactive card states | |
| User picks the hex values | Full spec control | |

**User's choice:** Section header backgrounds + dividers.

---

## Tab Bar Styling

| Option | Description | Selected |
|--------|-------------|----------|
| Icons only | Tab bar background/height/separator left for Phase 6 | |
| **Icons + tab bar background** | Explicitly set backgroundColor to Colors.Beige.bg now | ✓ |
| Icons + remove tab labels | Drop text labels for icon-only bar | |

**User's choice:** Icons + tab bar background — make Phase 6's intent explicit even though functionally identical to current Colors.bg.

---

## Claude's Discretion

- Icon viewport size: 24×24 (standard React Navigation tab icon size)
- Icon file: single `src/components/TabIcons.tsx` with 5 named exports (consistent with existing component pattern)
- Stroke weight: 1.5px consistently across all 5 icons
- Each icon has a "focal node" as the active-state fill target for cohesion

## Deferred Ideas

None — discussion stayed within phase scope.
