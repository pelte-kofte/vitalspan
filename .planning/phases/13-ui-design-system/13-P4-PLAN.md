---
phase: "13"
plan: "04"
type: execute
wave: 3
depends_on:
  - "13-01"
  - "13-02"
  - "13-03"
files_modified:
  - src/screens/ExerciseScreen.tsx
  - src/screens/ExerciseDetailScreen.tsx
  - src/screens/BiomarkerDetailScreen.tsx
autonomous: true
requirements:
  - DS-01
  - DS-02
  - DS-05

must_haves:
  truths:
    - "ExerciseScreen.tsx has zero Colors.Beige.* references; uses Colors.surface, Colors.onSurface, Colors.onSurfaceMuted, Colors.borderLight, Colors.surfaceElevated"
    - "ExerciseDetailScreen.tsx has zero Colors.Beige.* references; uses the same new token set"
    - "BiomarkerDetailScreen.tsx has zero Colors.Beige.* references; uses the same new token set"
    - "BiomarkerDetailScreen.tsx upload button renders ClipboardIcon instead of 📋 emoji (D-09)"
    - "Category emoji map CATEGORY_EMOJI in ExerciseScreen is NOT removed in this plan — emoji-to-SVG conversion for ExerciseScreen category chips is handled in Plan 6"
    - "tsc --noEmit exits 0 after all changes"
  artifacts:
    - path: "src/screens/ExerciseScreen.tsx"
      provides: "Exercise screen migrated to white/green tokens"
      contains: "Colors.surface"
    - path: "src/screens/ExerciseDetailScreen.tsx"
      provides: "Exercise detail screen migrated to white/green tokens"
      contains: "Colors.surface"
    - path: "src/screens/BiomarkerDetailScreen.tsx"
      provides: "Biomarker detail screen migrated to white/green tokens; ClipboardIcon replaces 📋"
      contains: "Colors.surface"
  key_links:
    - from: "src/screens/ExerciseScreen.tsx"
      to: "src/theme/index.ts"
      via: "Colors.surface, Colors.brand"
      pattern: "Colors\\.surface"
    - from: "src/screens/BiomarkerDetailScreen.tsx"
      to: "src/components/DesignSystemIcons.tsx"
      via: "ClipboardIcon"
      pattern: "import.*DesignSystemIcons"
---

<objective>
Migrate ExerciseScreen.tsx, ExerciseDetailScreen.tsx, and BiomarkerDetailScreen.tsx from Colors.Beige.* to the new clinical-premium white/green token system. Also replace the 📋 emoji in BiomarkerDetailScreen's upload button with ClipboardIcon (D-09: no emoji exceptions).

Purpose: These screens are the heart of the exercise and biomarker workflows; migrating them in Wave 3 (after tokens exist and shared components are clean) ensures they render correctly.
Output: 3 screen files fully migrated; all Colors.Beige.* references replaced; hardcoded font sizes and spacing replaced with Typography.sizes.* and Spacing.* tokens; 📋 emoji replaced with ClipboardIcon.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/13-ui-design-system/13-CONTEXT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/codebase/CONVENTIONS.md

<interfaces>
<!-- Token substitution map — identical across all migration plans -->
<!-- Beige.bg          → Colors.surface          -->
<!-- Beige.bgSecondary → Colors.surface          -->
<!-- Beige.bgShade     → Colors.surfaceElevated  -->
<!-- Beige.card        → Colors.surface          -->
<!-- Beige.headerBg    → Colors.surfaceElevated  -->
<!-- Beige.border      → Colors.borderLight      -->
<!-- Beige.borderLight → Colors.borderLight      -->
<!-- Beige.divider     → Colors.borderLight      -->
<!-- Beige.text        → Colors.onSurface        -->
<!-- Beige.textSecondary → Colors.textSecondary  -->
<!-- Beige.textMuted   → Colors.onSurfaceMuted   -->

<!-- Typography.sizes reference (for hardcoded font size replacement): -->
<!-- xs=11, sm=12, base=14, md=15, lg=16, xl=20, xxl=28, h1=28, h2=22, h3=18, body=15, bodySmall=13, caption=12, captionSmall=11 -->

<!-- Spacing reference: xs=4, sm=8, md=12, base=16, lg=20, xl=24, xxl=32 -->

<!-- Gradient hex in LinearGradient arrays: EXEMPT per D-13 -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Migrate ExerciseScreen.tsx and ExerciseDetailScreen.tsx</name>
  <files>src/screens/ExerciseScreen.tsx, src/screens/ExerciseDetailScreen.tsx</files>
  <read_first>
    - src/screens/ExerciseScreen.tsx — read in full; has ~35 Colors.Beige.* usages in StyleSheet at bottom; also has hardcoded fontSize: 11, fontSize: 10, fontSize: 24, fontSize: 40, fontSize: 18 in StyleSheet
    - src/screens/ExerciseDetailScreen.tsx — read in full; has ~14 Colors.Beige.* usages plus fontSize: 11 hardcoded
    - src/theme/index.ts — confirm new tokens present
    - .planning/phases/13-ui-design-system/13-CONTEXT.md — D-12 while-we're-in-there rule, D-13 gradient exception
  </read_first>
  <action>
    ExerciseScreen.tsx — apply substitution map to all Colors.Beige.* in the StyleSheet.create({}) block (lines ~371-560). The file has extensive Beige usage including safe, title, subtitle, activityCard, activityLabel, activityStatVal, exName, equipChip, muscleFilterToggle, and logSection styles.

    Also apply D-12 hardcoded font size replacement in ExerciseScreen.tsx:
    - fontSize: 11 → Typography.sizes.xs (appears in activityLabel at ~504, equipChipTxt at ~444, logBtnTxt at ~453, muscleFilterChevron at ~470)
    - fontSize: 10 → Typography.sizes.xs (appears in equipChipTxt)
    - fontSize: 24 → Typography.sizes.xl (activityStatVal at ~507)
    - fontSize: 40 → not in Typography.sizes — keep as-is (this is a hero display size, closest is Typography.sizes.display3=36 but 40 does not map cleanly; leave it OR use display3 if it does not break layout)
    - fontSize: 18 → Typography.sizes.lg (or h3=18, same value)

    Also apply D-12 spacing sweep: scan StyleSheet.create({}) for hardcoded numbers in padding/margin properties not using Spacing.*. Replace values 4→Spacing.xs, 8→Spacing.sm, 12→Spacing.md, 16→Spacing.base, 20→Spacing.lg, 24→Spacing.xl, 32→Spacing.xxl. Values like 6, 3, 2 (badge paddings) have no exact Spacing.* match — leave them as-is and add an inline comment: /* intentional — no Spacing.* equivalent */.

    ExerciseDetailScreen.tsx — apply substitution map to all Colors.Beige.* in the StyleSheet (lines ~149-170). Apply D-12:
    - fontSize: 11 (sectionLabel) → Typography.sizes.xs
    - Apply spacing sweep as above.

    Do NOT touch CATEGORY_EMOJI object, the Exercise interface imports, the navigation logic, or the muscle map color logic. Token migration only.

    IMPORTANT: ExerciseDetailScreen uses Colors.Beige.headerBg — map to Colors.surfaceElevated. It uses Colors.Beige.bg — map to Colors.surface. The root and centerState styles both use Colors.Beige.bg for their backgrounds.

    After both files are edited, run tsc --noEmit.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "Colors\.Beige" src/screens/ExerciseScreen.tsx && grep -c "Colors\.Beige" src/screens/ExerciseDetailScreen.tsx && npx tsc --noEmit 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - grep "Colors.Beige" src/screens/ExerciseScreen.tsx returns 0 matches
    - grep "Colors.Beige" src/screens/ExerciseDetailScreen.tsx returns 0 matches
    - grep "Colors.surface" src/screens/ExerciseScreen.tsx returns at least 3 matches
    - grep "Colors.surface" src/screens/ExerciseDetailScreen.tsx returns at least 2 matches
    - grep -E "padding[A-Za-z]*: [0-9]+" src/screens/ExerciseScreen.tsx | grep -v "Spacing\." returns only intentional exceptions (with comment)
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>ExerciseScreen.tsx and ExerciseDetailScreen.tsx migrated; zero Beige references; spacing sweep applied; tsc passes</done>
</task>

<task type="auto">
  <name>Task 2: Migrate BiomarkerDetailScreen.tsx and replace 📋 with ClipboardIcon</name>
  <files>src/screens/BiomarkerDetailScreen.tsx</files>
  <read_first>
    - src/screens/BiomarkerDetailScreen.tsx — read in full; has ~18 Colors.Beige.* usages including safe, listHeader, heading, headingSub, uploadBtn, catLabel, card, rowBorder, bmName, bmTarget, bmVal, bmUnit, detailHeader, detailName, detailCat, detailVal, emptyState, and bmUnit/noBmData; also has `<Text style={s.uploadBtnTxt}>📋 Upload</Text>` at line ~146
    - src/theme/index.ts — confirm new tokens present
    - src/components/DesignSystemIcons.tsx — confirm ClipboardIcon is exported (created by Plan 2)
  </read_first>
  <action>
    Apply the Beige substitution map to BiomarkerDetailScreen.tsx StyleSheet. Key mappings for this file:
    - safe.backgroundColor: Colors.Beige.bg → Colors.surface
    - listHeader.backgroundColor: Colors.Beige.bg → Colors.surface
    - heading color: Colors.Beige.text → Colors.onSurface
    - headingSub color: Colors.Beige.textMuted → Colors.onSurfaceMuted
    - uploadBtn.backgroundColor: Colors.Beige.card → Colors.surface
    - uploadBtn.borderColor: Colors.Beige.border → Colors.borderLight
    - catLabel color: Colors.Beige.textMuted → Colors.onSurfaceMuted
    - card.backgroundColor: Colors.Beige.card → Colors.surface
    - card.borderColor: Colors.Beige.border → Colors.borderLight
    - rowBorder.borderBottomColor: Colors.Beige.divider → Colors.borderLight
    - bmName, bmVal colors: Colors.Beige.text → Colors.onSurface
    - bmTarget, bmUnit, noBmData colors: Colors.Beige.textMuted → Colors.onSurfaceMuted
    - detailHeader.backgroundColor: Colors.Beige.bg → Colors.surface
    - detailName: Colors.Beige.text → Colors.onSurface
    - detailCat: Colors.Beige.textMuted → Colors.onSurfaceMuted
    - detailVal: Colors.Beige.text → Colors.onSurface
    - emptyState.backgroundColor: Colors.Beige.bgShade → Colors.surfaceElevated

    Also apply D-12: hardcoded fontSize: 11 → Typography.sizes.xs, fontSize: 18 → Typography.sizes.h3 or lg, fontSize: 44 (detailVal hero size) → leave as-is (hero display, no matching Typography.sizes token), fontSize: 10 → Typography.sizes.xs.

    Also apply D-12 spacing sweep: scan StyleSheet.create({}) for hardcoded numbers in padding/margin properties not using Spacing.*. Replace values 4→Spacing.xs, 8→Spacing.sm, 12→Spacing.md, 16→Spacing.base, 20→Spacing.lg, 24→Spacing.xl, 32→Spacing.xxl. Values like 6, 3, 2 have no exact Spacing.* match — leave as-is with /* intentional — no Spacing.* equivalent */ comment.

    Emoji replacement (D-09 — no exceptions):
    - Add import at top of file: import { ClipboardIcon } from '../components/DesignSystemIcons';
    - Locate the upload button JSX at line ~146: `<Text style={s.uploadBtnTxt}>📋 Upload</Text>`
    - Replace with a View row: `<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><ClipboardIcon color={Colors.onSurface} size={16} /><Text style={s.uploadBtnTxt}>Upload</Text></View>`
    - Remove the uploadBtnTxt fontSize if it was set as emoji text size (keep other style props)

    Run tsc --noEmit after editing.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "Colors\.Beige" src/screens/BiomarkerDetailScreen.tsx && grep -c "ClipboardIcon" src/screens/BiomarkerDetailScreen.tsx && npx tsc --noEmit 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - grep "Colors.Beige" src/screens/BiomarkerDetailScreen.tsx returns 0 matches
    - grep "Colors.surface" src/screens/BiomarkerDetailScreen.tsx returns at least 3 matches
    - grep "ClipboardIcon" src/screens/BiomarkerDetailScreen.tsx returns at least 1 match (import + usage)
    - grep "📋" src/screens/BiomarkerDetailScreen.tsx returns 0 matches
    - grep -E "padding[A-Za-z]*: [0-9]+" src/screens/BiomarkerDetailScreen.tsx | grep -v "Spacing\." returns only intentional exceptions
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>BiomarkerDetailScreen.tsx migrated; zero Beige references; 📋 replaced with ClipboardIcon; spacing sweep applied; tsc passes</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Colors.Beige.* → new tokens | Incorrect mapping results in wrong colors at runtime |
| emoji → SVG swap → JSX type system | ClipboardIcon must be TypeScript-valid; wrong prop types cause build failure |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-13-07 | Tampering | Missing a Beige reference (grep misses JSX prop usage) | mitigate | grep -c check in verify returns 0; also covers both StyleSheet and JSX inline usages |
| T-13-08 | Tampering | Hero font size (fontSize: 44 in detailVal) changed when it should be preserved | mitigate | action explicitly states fontSize: 44 is exempt from D-12 replacement |
| T-13-09 | Tampering | ClipboardIcon import missing — 📋 emoji survives | mitigate | acceptance_criteria greps for both ClipboardIcon presence AND 📋 absence |
</threat_model>

<verification>
After all tasks complete:
1. Run: grep -rn "Colors.Beige" src/screens/ExerciseScreen.tsx src/screens/ExerciseDetailScreen.tsx src/screens/BiomarkerDetailScreen.tsx
   Expected: zero matches
2. Run: grep "ClipboardIcon" src/screens/BiomarkerDetailScreen.tsx
   Expected: import line + usage present
3. Run: grep "📋" src/screens/BiomarkerDetailScreen.tsx
   Expected: zero matches
4. Run: npx tsc --noEmit
   Expected: zero errors
</verification>

<success_criteria>
- ExerciseScreen.tsx, ExerciseDetailScreen.tsx, BiomarkerDetailScreen.tsx: zero Colors.Beige.* references
- All screens use Colors.surface for backgrounds, Colors.onSurface for text
- BiomarkerDetailScreen.tsx: 📋 replaced with ClipboardIcon per D-09
- Spacing sweep applied in all three files; intentional exceptions commented
- tsc --noEmit exits 0
</success_criteria>

<output>
Create .planning/phases/13-ui-design-system/13-04-SUMMARY.md when done
</output>
