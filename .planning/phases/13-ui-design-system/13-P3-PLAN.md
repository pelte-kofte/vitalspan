---
phase: "13"
plan: "03"
type: execute
wave: 2
depends_on:
  - "13-01"
files_modified:
  - src/navigation/AppNavigator.tsx
  - src/components/ArticleCard.tsx
  - src/components/MuscleMapView.tsx
  - src/components/QuickLogModal.tsx
  - src/components/SupplementLibrarySection.tsx
  - src/components/SwipeableLogRow.tsx
autonomous: true
requirements:
  - DS-01
  - DS-05

must_haves:
  truths:
    - "AppNavigator.tsx tab bar uses Colors.surface as backgroundColor (was Colors.Beige.bg)"
    - "All 5 component files have zero Colors.Beige.* references after migration"
    - "All replaced Beige tokens map to the correct new token: Beige.bg→surface, Beige.card→surface, Beige.headerBg→surfaceElevated, Beige.text→onSurface, Beige.textMuted→onSurfaceMuted, Beige.textSecondary→textSecondary, Beige.border→borderLight, Beige.borderLight→borderLight, Beige.bgShade→surfaceElevated, Beige.divider→borderLight"
    - "Spacing sweep applied in all 5 component files; hardcoded padding/margin numbers replaced with Spacing.* tokens; intentional exceptions (values 2, 3, 6) commented"
    - "tsc --noEmit exits 0 after all changes"
  artifacts:
    - path: "src/navigation/AppNavigator.tsx"
      provides: "Tab bar migrated to white/green tokens"
      contains: "Colors.surface"
    - path: "src/components/ArticleCard.tsx"
      provides: "Article card migrated to white/green tokens"
    - path: "src/components/MuscleMapView.tsx"
      provides: "Muscle map migrated to white/green tokens"
    - path: "src/components/QuickLogModal.tsx"
      provides: "Quick log modal migrated to white/green tokens"
    - path: "src/components/SupplementLibrarySection.tsx"
      provides: "Supplement library section migrated to white/green tokens"
    - path: "src/components/SwipeableLogRow.tsx"
      provides: "Swipeable log row migrated to white/green tokens"
  key_links:
    - from: "src/navigation/AppNavigator.tsx"
      to: "src/theme/index.ts"
      via: "Colors.surface"
      pattern: "Colors\\.surface"
---

<objective>
Migrate AppNavigator.tsx and all 5 component files from Colors.Beige.* to the new white/green clinical-premium token system. This plan runs in Wave 2 parallel with Plan 2 (icon creation) since these files have no dependency on DesignSystemIcons.tsx.

Purpose: AppNavigator and shared components are used across every screen. Migrating them early means all Wave 3 screen executions see consistent token usage in the shared layer.
Output: 6 files fully migrated; zero Colors.Beige.* references remain in these files; spacing sweep applied.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/13-ui-design-system/13-CONTEXT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/codebase/CONVENTIONS.md

<interfaces>
<!-- Token mapping reference — exact substitutions to apply -->
<!-- Beige.bg          → Colors.surface          ('#FFFFFF') -->
<!-- Beige.bgSecondary → Colors.surface           ('#FFFFFF') -->
<!-- Beige.bgShade     → Colors.surfaceElevated   ('#F9F9F9') -->
<!-- Beige.card        → Colors.surface           ('#FFFFFF') -->
<!-- Beige.headerBg    → Colors.surfaceElevated   ('#F9F9F9') -->
<!-- Beige.border      → Colors.borderLight       ('#E2DED6') -->
<!-- Beige.borderLight → Colors.borderLight       ('#E2DED6') -->
<!-- Beige.divider     → Colors.borderLight       ('#E2DED6') -->
<!-- Beige.text        → Colors.onSurface         ('#1C1C1E') -->
<!-- Beige.textSecondary → Colors.textSecondary   (keep existing Colors.textSecondary = '#4A4A45') -->
<!-- Beige.textMuted   → Colors.onSurfaceMuted    ('#6B6B64') -->

<!-- Spacing sweep values: 4→Spacing.xs, 8→Spacing.sm, 12→Spacing.md, 16→Spacing.base, 20→Spacing.lg, 24→Spacing.xl, 32→Spacing.xxl -->
<!-- Values 2, 3, 6 have no Spacing.* match — leave as-is with: /* intentional — no Spacing.* equivalent */ -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Migrate AppNavigator.tsx tab bar tokens</name>
  <files>src/navigation/AppNavigator.tsx</files>
  <read_first>
    - src/navigation/AppNavigator.tsx — read the full file to see current token usages (tabBarStyle backgroundColor = Colors.Beige.bg)
    - src/theme/index.ts — confirm Colors.surface exists after Plan 1 completes
    - .planning/phases/13-ui-design-system/13-CONTEXT.md — D-06 design direction
  </read_first>
  <action>
    In AppNavigator.tsx, locate the MainTabs component's Tab.Navigator screenOptions block. Change the tabBarStyle.backgroundColor value from Colors.Beige.bg to Colors.surface.

    Also update tabBarActiveTintColor to Colors.brand (was Colors.primary) to reflect the new deep forest green CTA accent (per D-03: Colors.brand is the bold primary CTA color on light screens).

    Keep tabBarInactiveTintColor = Colors.textMuted (unchanged — this is a dark-screen legacy token that also works fine on light backgrounds as muted text).

    Do NOT change any structural code, routing logic, or screen imports. This is a token-only change to the tab bar styling.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "Colors\.Beige" src/navigation/AppNavigator.tsx && npx tsc --noEmit 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - grep "Colors.Beige" src/navigation/AppNavigator.tsx returns 0 matches
    - grep "Colors.surface" src/navigation/AppNavigator.tsx returns at least 1 match
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>AppNavigator.tsx tab bar uses Colors.surface; zero Colors.Beige references remain</done>
</task>

<task type="auto">
  <name>Task 2: Migrate 5 component files from Colors.Beige.* to new tokens; apply spacing sweep</name>
  <files>src/components/ArticleCard.tsx, src/components/MuscleMapView.tsx, src/components/QuickLogModal.tsx, src/components/SupplementLibrarySection.tsx, src/components/SwipeableLogRow.tsx</files>
  <read_first>
    - src/components/ArticleCard.tsx — read full file; has Colors.Beige.textMuted at lines ~77, 84
    - src/components/MuscleMapView.tsx — read full file; has Colors.Beige.bgShade, Colors.Beige.border, Colors.Beige.textMuted
    - src/components/QuickLogModal.tsx — read full file; has Colors.Beige.textMuted, Colors.Beige.card
    - src/components/SupplementLibrarySection.tsx — read full file; has multiple Colors.Beige.* usages
    - src/components/SwipeableLogRow.tsx — read full file; has Colors.Beige.card, Colors.Beige.divider, Colors.Beige.text, Colors.Beige.textMuted
    - src/theme/index.ts — confirm all new tokens exist (surface, surfaceElevated, onSurface, onSurfaceMuted, borderLight) after Plan 1
  </read_first>
  <action>
    For each of the 5 component files, apply the Beige-to-new-token substitution map. Apply each substitution in the StyleSheet.create({}) block at the bottom of each file. Also apply to any inline JSX references where Colors.Beige.* appears as a prop value.

    Substitution map (apply exactly — no deviations):
    - Colors.Beige.bg → Colors.surface
    - Colors.Beige.bgSecondary → Colors.surface
    - Colors.Beige.bgShade → Colors.surfaceElevated
    - Colors.Beige.card → Colors.surface
    - Colors.Beige.headerBg → Colors.surfaceElevated
    - Colors.Beige.border → Colors.borderLight
    - Colors.Beige.borderLight → Colors.borderLight
    - Colors.Beige.divider → Colors.borderLight
    - Colors.Beige.text → Colors.onSurface
    - Colors.Beige.textSecondary → Colors.textSecondary
    - Colors.Beige.textMuted → Colors.onSurfaceMuted

    After applying substitutions, also apply D-12 (while-we're-in-there rule): replace any hardcoded font size numbers in StyleSheet.create({}) blocks with their Typography.sizes.* equivalents (xs=11, sm=12, base=14, md=15, lg=16, xl=20, xxl=28). Gradient hex literals inside LinearGradient arrays are EXEMPT per D-13.

    Also apply D-12 spacing sweep (DS-05): scan each StyleSheet.create({}) for hardcoded numbers in padding and margin properties that are not using Spacing.*. Replace the following values: 4→Spacing.xs, 8→Spacing.sm, 12→Spacing.md, 16→Spacing.base, 20→Spacing.lg, 24→Spacing.xl, 32→Spacing.xxl. Values 2, 3, 6 (badge paddings, small gaps) have no exact Spacing.* match — leave them as-is and add an inline comment on that line: /* intentional — no Spacing.* equivalent */.

    Do not change component logic, props, or non-StyleSheet code.

    After all 5 files are edited, run tsc --noEmit to confirm zero errors.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -rn "Colors\.Beige" src/components/ArticleCard.tsx src/components/MuscleMapView.tsx src/components/QuickLogModal.tsx src/components/SupplementLibrarySection.tsx src/components/SwipeableLogRow.tsx && grep -E "padding[A-Za-z]*: [0-9]+" src/components/SwipeableLogRow.tsx | grep -v "Spacing\." | head -5 && npx tsc --noEmit 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - grep "Colors.Beige" src/components/ArticleCard.tsx returns 0 matches
    - grep "Colors.Beige" src/components/MuscleMapView.tsx returns 0 matches
    - grep "Colors.Beige" src/components/QuickLogModal.tsx returns 0 matches
    - grep "Colors.Beige" src/components/SupplementLibrarySection.tsx returns 0 matches
    - grep "Colors.Beige" src/components/SwipeableLogRow.tsx returns 0 matches
    - grep "Colors.surface\|Colors.onSurface\|Colors.borderLight" src/components/SwipeableLogRow.tsx returns at least 3 matches
    - grep -E "padding[A-Za-z]*: [0-9]+" src/components/SwipeableLogRow.tsx | grep -v "Spacing\." returns only intentional exceptions (with comment)
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>All 5 component files migrated; zero Colors.Beige references remain; spacing sweep applied; tsc passes</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| token substitution map → screen rendering | Wrong token mapping causes incorrect colors on-device |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-13-05 | Tampering | Incorrect Beige token mapping (e.g. Beige.card mapped to wrong new token) | mitigate | acceptance_criteria checks all 5 files have zero Colors.Beige.* remaining; EAS build visual check in Plan 7 |
| T-13-06 | Tampering | TypeScript error from Colors.surface/onSurface not existing (if Plan 1 not complete) | mitigate | depends_on: 13-01 ensures Plan 1 runs first; tsc gate catches any leftover errors |
</threat_model>

<verification>
After all tasks complete:
1. Run: grep -rn "Colors.Beige" src/navigation/AppNavigator.tsx src/components/
   Expected: zero matches across all files
2. Run: npx tsc --noEmit
   Expected: zero errors
3. Run: grep -c "Colors.surface\|Colors.onSurface\|Colors.borderLight\|Colors.surfaceElevated" src/components/SwipeableLogRow.tsx
   Expected: 3 or more matches
4. Run: grep -E "padding[A-Za-z]*: [0-9]+" src/components/SwipeableLogRow.tsx | grep -v "Spacing\."
   Expected: only lines with /* intentional — no Spacing.* equivalent */ comment
</verification>

<success_criteria>
- AppNavigator.tsx: Colors.surface as tab bar background, Colors.brand as active tint
- All 5 component files: zero Colors.Beige.* references
- Spacing sweep applied; hardcoded padding/margin values replaced with Spacing.* tokens; intentional exceptions (2, 3, 6) commented
- tsc --noEmit exits 0
</success_criteria>

<output>
Create .planning/phases/13-ui-design-system/13-03-SUMMARY.md when done
</output>
