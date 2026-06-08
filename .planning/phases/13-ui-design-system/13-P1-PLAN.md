---
phase: "13"
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - src/theme/index.ts
autonomous: true
requirements:
  - DS-01
  - DS-04

must_haves:
  truths:
    - "A developer opening src/theme/index.ts sees Colors.surface, Colors.surfaceElevated, Colors.brand, Colors.onSurface, Colors.onSurfaceMuted, Colors.borderLight, Colors.accentMuted, and Colors.semantic.{success,warning,danger,info}"
    - "Existing tokens (Colors.primary, Colors.accent, Colors.Beige.*, Colors.dark.*, Colors.status.*, Colors.viz.*) are ALL preserved exactly — no renames, no removals"
    - "Colors.Beige.* block remains present in this wave (removal happens in Wave 4 after all migrations are confirmed)"
    - "Colors.accentMuted is present as rgba(91, 157, 191, 0.25) — a muted/alpha version of the neural blue accent for subtle tint backgrounds"
    - "Typography.sizes already has h1/h2/h3/body/bodySmall/caption/captionSmall — executor confirms they exist and adds a single-line documentation comment above the display scale block"
    - "tsc --noEmit exits 0 after changes"
  artifacts:
    - path: "src/theme/index.ts"
      provides: "Extended token set with new clinical-premium tokens"
      contains: "Colors.surface"
    - path: "src/theme/index.ts"
      contains: "Colors.brand"
    - path: "src/theme/index.ts"
      contains: "Colors.accentMuted"
    - path: "src/theme/index.ts"
      contains: "Colors.semantic"
  key_links:
    - from: "src/theme/index.ts"
      to: "all screen StyleSheets"
      via: "import { Colors } from '../theme'"
      pattern: "Colors\\.surface|Colors\\.brand|Colors\\.semantic|Colors\\.accentMuted"
---

<objective>
Extend src/theme/index.ts with the new clinical-premium white/green token set. This is the foundation wave — every subsequent migration plan depends on these tokens existing.

Purpose: Screens cannot migrate from Colors.Beige.* to the new system until the new tokens exist. This plan unblocks all Wave 2+ plans.
Output: Extended src/theme/index.ts with Colors.surface, Colors.surfaceElevated, Colors.brand, Colors.onSurface, Colors.onSurfaceMuted, Colors.borderLight, Colors.accentMuted, Colors.semantic.{success,warning,danger,info} added as new entries.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/PROJECT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/ROADMAP.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/13-ui-design-system/13-CONTEXT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/codebase/CONVENTIONS.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add clinical-premium tokens to src/theme/index.ts</name>
  <files>src/theme/index.ts</files>
  <read_first>
    - src/theme/index.ts — read the FULL file before touching it to know exact current token set
    - .planning/phases/13-ui-design-system/13-CONTEXT.md — D-01 through D-07 for exact token values and design rationale
    - .planning/codebase/CONVENTIONS.md — StyleSheet rules, gradient hex exception
  </read_first>
  <action>
    Add the following new token groups to the Colors export object in src/theme/index.ts. Insert them between the existing "Warm Beige palette" comment block and the closing brace of Colors. Do NOT remove Colors.Beige.* — it must remain intact for Wave 2-3 migration passes.

    New token values to add (per D-01 and D-02):
    - Colors.surface = '#FFFFFF' — primary card and screen background for light screens
    - Colors.surfaceElevated = '#F9F9F9' — elevated card surfaces and headers
    - Colors.brand = '#1B4332' — deep forest green for CTAs, active states, key data labels
    - Colors.onSurface = '#1C1C1E' — Apple-native dark text on white/light screens
    - Colors.onSurfaceMuted = '#6B6B64' — muted text on light screens (matches former Beige.textMuted value exactly so screens using this after migration read correctly)
    - Colors.borderLight = '#E2DED6' — light borders on white surfaces
    - Colors.accentMuted = 'rgba(91, 157, 191, 0.25)' — muted/alpha version of the neural blue accent (#5B9DBF) for subtle tint backgrounds (per DS-01)

    Add a new Colors.semantic nested object (per DS-01 requirement):
    - Colors.semantic.success = '#34C759' — iOS green, success state
    - Colors.semantic.warning = '#FF9500' — iOS orange, warning state
    - Colors.semantic.danger = '#FF3B30' — iOS red, danger/error state
    - Colors.semantic.info = '#007AFF' — iOS blue, informational state

    Also add a documentation comment above the Typography.sizes display scale block: "// Semantic scale — use these for all screen typography". This satisfies DS-04 documentation requirement.

    Format new entries to match the existing style: one value per line, aligned comments, same indentation as neighboring blocks. Do NOT place fenced code blocks in this action — use the exact token names and hex values stated here.

    After editing: run tsc --noEmit to confirm zero TypeScript errors.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "Colors.surface" src/theme/index.ts && grep -c "Colors.brand" src/theme/index.ts && grep -c "Colors.semantic" src/theme/index.ts && grep -c "Colors.accentMuted" src/theme/index.ts && npx tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - src/theme/index.ts contains Colors.surface = '#FFFFFF'
    - src/theme/index.ts contains Colors.surfaceElevated = '#F9F9F9'
    - src/theme/index.ts contains Colors.brand = '#1B4332'
    - src/theme/index.ts contains Colors.onSurface = '#1C1C1E'
    - src/theme/index.ts contains Colors.onSurfaceMuted
    - src/theme/index.ts contains Colors.borderLight
    - src/theme/index.ts contains Colors.accentMuted = 'rgba(91, 157, 191, 0.25)'
    - src/theme/index.ts contains Colors.semantic with success, warning, danger, info fields
    - src/theme/index.ts still contains Colors.Beige (block not removed yet)
    - src/theme/index.ts still contains Colors.primary = '#2D6A4F' (preserved per D-04)
    - src/theme/index.ts still contains Colors.accent = '#5B9DBF' (preserved per D-03)
    - tsc --noEmit exits 0 (zero errors)
  </acceptance_criteria>
  <done>src/theme/index.ts exports all new clinical-premium tokens including Colors.accentMuted; all existing tokens intact; tsc passes</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| theme file → all screens | All color decisions flow from this single source; a wrong hex value propagates to every screen |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-13-01 | Tampering | src/theme/index.ts — accidental token removal | mitigate | acceptance_criteria explicitly checks Colors.primary, Colors.accent, Colors.Beige remain present after edit |
| T-13-02 | Tampering | TypeScript type breakage from new nested object | mitigate | tsc --noEmit gate in verify step; Colors.semantic must be typed as plain object literal, not typed constant |
</threat_model>

<verification>
After task completes:
1. Run: grep -E "Colors\.(surface|surfaceElevated|brand|onSurface|onSurfaceMuted|borderLight|accentMuted|semantic)" src/theme/index.ts
   Expected: 8+ matches across the new block
2. Run: grep "Colors.Beige" src/theme/index.ts
   Expected: Beige block still present (not removed yet)
3. Run: npx tsc --noEmit
   Expected: zero errors
</verification>

<success_criteria>
- All 11 new tokens (surface, surfaceElevated, brand, onSurface, onSurfaceMuted, borderLight, accentMuted, semantic.{success,warning,danger,info}) present in src/theme/index.ts
- All pre-existing tokens untouched
- tsc --noEmit exits with 0 errors
</success_criteria>

<output>
Create .planning/phases/13-ui-design-system/13-01-SUMMARY.md when done
</output>
