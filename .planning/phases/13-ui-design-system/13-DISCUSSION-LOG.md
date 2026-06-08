# Phase 13: UI / Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 13-UI / Design System
**Areas discussed:** Token expansion shape, Emoji icon scope, Hardcoded value migration priority, EAS build verification scope

---

## Token Expansion Shape

### Q1: Add new tokens alongside existing, or reorganize?

| Option | Description | Selected |
|--------|-------------|----------|
| Additive — new tokens only | Add new entries, keep existing Colors.primary, Colors.accent. No screen imports break. | ✓ |
| Reorganize — clean token hierarchy | Restructure into semantic namespaces. Broader blast radius. | |
| Hybrid — add new + deprecate old | Add new, mark old for removal, don't remove in this phase. | |

**User's choice:** Additive — new tokens only
**Notes:** None

---

### Q2: What design direction for surface tokens?

| Option | Description | Selected |
|--------|-------------|----------|
| Map to Beige values | surface=Beige.card, surfaceElevated=Beige.headerBg | |
| Map to dark-mode values | surface=dark.bgCard, surfaceElevated=dark.bgElevated | |
| Two sets — light and dark | surface.warm / surface.dark paired tokens | |

**User's choice:** (freeform — complete redesign direction)
**Notes:** Complete redesign away from beige. New direction: clean white/near-white light mode (#FFFFFF background, #F9F9F9 card surfaces, #1C1C1E text — Apple-native feel). Accent color: deep forest green (#1B4332) used boldly for CTAs, active states, and key data. LongevityScore dark screen stays as-is. The contrast between clean light everyday screens and the dark LongevityScore is intentional and premium. No beige anywhere. Typography: confident — larger headers, clear hierarchy.

---

### Q3: Does "no beige" mean replacing Phase 6 warm Beige screens?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — full replacement, beige is gone | All Colors.Beige.* screens migrated in Phase 13. Colors.Beige.* removed. | ✓ |
| Yes — but phase this | Migrate screens, keep Colors.Beige.* in theme until end of phase. | |
| Partial — update tokens, leave Phase 6 screens | Phase 13 adds tokens only; full re-skin deferred. | |

**User's choice:** Yes — full replacement, beige is gone
**Notes:** None

---

### Q4: What happens to the blue accent system (#5B9DBF)?

| Option | Description | Selected |
|--------|-------------|----------|
| Blue accent is gone — everything becomes green | Colors.accent → forest green. Blue dropped. | |
| Green for CTAs/actions, blue for data viz | Two-accent system: forest green interactive, blue neural/data. | ✓ |
| Let me describe the exact palette | Freeform input | |

**User's choice:** Green for CTAs/actions, blue for data viz (neural aesthetic)
**Notes:** None

---

### Q5: How to name the new forest green CTA token?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace Colors.primary with new value | Colors.primary = '#1B4332'. All existing Colors.primary usages pick up new value. | |
| Add new tokens, Colors.primary stays | Colors.brand = '#1B4332' (new). Colors.primary (#2D6A4F) stays for softer usage. | ✓ |
| More questions | Continue exploring | |

**User's choice:** Add new tokens, Colors.primary stays
**Notes:** Colors.surface = '#FFFFFF', Colors.surfaceElevated = '#F9F9F9', Colors.brand = '#1B4332'

---

## Emoji Icon Scope

### Q1: Convert LabUploadScreen emoji to SVG?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — convert all emoji to SVG neural-dot | Per DS-02: replace 🔍 and ✅ with neural-dot SVGs. | ✓ |
| Only functional icons, not illustration emoji | Large decorative emoji stay as-is. | |
| Convert lab upload screen only, not onboarding | LabUploadScreen gets SVG; onboarding emoji stay. | |

**User's choice:** Yes — convert all emoji to SVG neural-dot
**Notes:** None

---

### Q2: PlaceholderScreens.tsx — what to do?

| Option | Description | Selected |
|--------|-------------|----------|
| Skip PlaceholderScreens — unused code | Not user-facing; not worth converting. | |
| Delete PlaceholderScreens.tsx entirely | Dead code — remove it. | ✓ |
| Convert it too | Even unused code should be consistent. | |

**User's choice:** Delete PlaceholderScreens.tsx entirely
**Notes:** None

---

### Q3: New icons beyond emoji replacement?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace existing emoji only | Phase 13 converts placeholders only. | |
| Audit all screens for missing icons | Full icon audit — add icons where none exist but should. | ✓ |
| There are specific screens I have in mind | Freeform | |

**User's choice:** Audit all screens for missing icons that should exist
**Notes:** None

---

## Hardcoded Value Migration Priority

### Q1: Migration approach given full color redesign?

| Option | Description | Selected |
|--------|-------------|----------|
| While-we're-in-there rule | Any screen touched for colors also gets hardcoded font sizes + spacing fixed in same pass. | ✓ |
| Separate passes — color first, then font/spacing | Two distinct sub-tasks. Safer review scope. | |
| Colors only, typography/spacing in follow-up | DS-04/DS-05 deferred to a future pass. | |

**User's choice:** While-we're-in-there rule
**Notes:** Efficient: one pass per screen. Color migration + font/spacing cleanup happen together.

---

### Q2: Honor gradient hex exception?

| Option | Description | Selected |
|--------|-------------|----------|
| Honor the gradient hex exception | Keep hex in LinearGradient arrays; fix only StyleSheet.create() violations. | ✓ |
| Move gradients to Gradients.* tokens too | Add new Gradients.* entries for any new gradients. | |

**User's choice:** Honor the gradient hex exception — only fix non-gradient hardcoded values
**Notes:** CONVENTIONS.md explicitly allows this; LongevityScore and Dashboard gradient arrays stay as-is.

---

## EAS Build Verification Scope

### Q1: Build type for DS-03 verification?

| Option | Description | Selected |
|--------|-------------|----------|
| EAS preview build | eas build --profile preview. Internal distribution, fully compiled. Fast, doesn't touch TestFlight. | ✓ |
| Full EAS production build | eas build --profile production. Auto-increments, goes through App Store pipeline. | |
| Development build + expo run:ios | Fastest but least representative. | |

**User's choice:** EAS preview build
**Notes:** eas.json already has preview profile configured.

---

## Claude's Discretion

- Exact `Colors.semantic.*` values (success, warning, danger, info) — will align with existing `Colors.status.*` pattern (optimal=green, review=amber, critical=red) for semantic consistency.
- Whether to use gradient on light screen headers (e.g., `['#F0F7F3', '#FFFFFF']`) — researcher can explore as an option.
- Exact icon design for LabUploadScreen search/success icons — match TabIcons.tsx neural-dot stroke aesthetic.

## Deferred Ideas

None — discussion stayed within phase scope.
