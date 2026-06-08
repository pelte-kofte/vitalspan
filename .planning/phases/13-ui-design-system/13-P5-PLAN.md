---
phase: "13"
plan: "05"
type: execute
wave: 3
depends_on:
  - "13-01"
  - "13-02"
  - "13-03"
files_modified:
  - src/screens/ProtocolScreen.tsx
  - src/screens/ProfileScreen.tsx
  - src/screens/SettingsScreen.tsx
  - src/screens/AboutScreen.tsx
autonomous: true
requirements:
  - DS-01
  - DS-02
  - DS-05

must_haves:
  truths:
    - "ProtocolScreen.tsx has zero Colors.Beige.* references"
    - "ProtocolScreen.tsx empty-state 💊 emoji replaced with PillIcon SVG (D-09)"
    - "ProfileScreen.tsx has zero Colors.Beige.* references"
    - "ProfileScreen.tsx empty-state 👤 emoji replaced with PersonIcon SVG (D-09)"
    - "SettingsScreen.tsx has zero Colors.Beige.* references"
    - "SettingsScreen.tsx SettingsRow icon prop changed to React.ReactNode; all emoji string icon values replaced with SVG components (D-09)"
    - "AboutScreen.tsx has zero Colors.Beige.* references"
    - "AboutScreen.tsx EVIDENCE_GRADES grade 'C' entry no longer uses Colors.Beige.textMuted or Colors.Beige.bgShade — uses Colors.onSurfaceMuted and Colors.surfaceElevated instead"
    - "AboutScreen.tsx whyPoint icons 💊/🎯/🔬 replaced with PillIcon/TargetIcon/MicroscopeIcon SVGs (D-09)"
    - "Spacing sweep applied to all 4 files; hardcoded padding/margin numbers replaced with Spacing.* tokens; intentional exceptions (values 2, 3, 6) commented"
    - "tsc --noEmit exits 0 after all changes"
  artifacts:
    - path: "src/screens/ProtocolScreen.tsx"
      provides: "Protocol screen migrated to white/green tokens; 💊 emoji replaced"
      contains: "Colors.surface"
    - path: "src/screens/ProfileScreen.tsx"
      provides: "Profile screen migrated to white/green tokens; 👤 emoji replaced"
      contains: "Colors.surface"
    - path: "src/screens/SettingsScreen.tsx"
      provides: "Settings screen migrated to white/green tokens; SettingsRow icon prop accepts ReactNode; all emoji icon strings replaced with SVGs"
      contains: "Colors.surface"
    - path: "src/screens/AboutScreen.tsx"
      provides: "About screen migrated to white/green tokens; whyIcon emoji replaced with SVG components"
      contains: "Colors.surface"
  key_links:
    - from: "src/screens/ProtocolScreen.tsx"
      to: "src/theme/index.ts"
      via: "Colors.surface, Colors.brand"
      pattern: "Colors\\.surface"
    - from: "src/screens/SettingsScreen.tsx"
      to: "src/components/DesignSystemIcons.tsx"
      via: "PersonIcon, ShieldIcon, BellIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, ClipboardIcon, RefreshIcon, StarIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/screens/AboutScreen.tsx"
      to: "src/components/DesignSystemIcons.tsx"
      via: "PillIcon, TargetIcon, MicroscopeIcon"
      pattern: "import.*DesignSystemIcons"
---

<objective>
Migrate ProtocolScreen, ProfileScreen, SettingsScreen, and AboutScreen from Colors.Beige.* to the new clinical-premium white/green token system. Also replace all emoji in these screens with DesignSystemIcons SVG components (D-09: no exceptions) and apply spacing token sweeps (D-12/DS-05).

Purpose: Completes the screen-level token migration for the remaining 4 Beige screens after Plan 4 handles the 3 exercise/biomarker screens.
Output: 4 screen files fully migrated; zero Colors.Beige.* references; all emoji converted to SVG icons; spacing sweep applied.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/13-ui-design-system/13-CONTEXT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/codebase/CONVENTIONS.md

<interfaces>
<!-- Token substitution map — apply to ALL Colors.Beige.* in StyleSheet and JSX props -->
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

<!-- Special case: AboutScreen EVIDENCE_GRADES[2] (grade 'C') uses Colors.Beige.textMuted for color, Colors.Beige.bgShade for bg, Colors.Beige.border for border -->
<!-- Map color → Colors.onSurfaceMuted, bg → Colors.surfaceElevated, border → Colors.borderLight -->

<!-- Spacing sweep values: 4→Spacing.xs, 8→Spacing.sm, 12→Spacing.md, 16→Spacing.base, 20→Spacing.lg, 24→Spacing.xl, 32→Spacing.xxl -->
<!-- Values 2, 3, 6 have no Spacing.* match — leave as-is with: /* intentional — no Spacing.* equivalent */ -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Migrate ProtocolScreen.tsx and ProfileScreen.tsx; replace emoji</name>
  <files>src/screens/ProtocolScreen.tsx, src/screens/ProfileScreen.tsx</files>
  <read_first>
    - src/screens/ProtocolScreen.tsx — read the StyleSheet section (bottom ~lines 760-940) and any JSX with Colors.Beige.* inline; has ~15 Beige usages including safe, heading, date, sectionLbl, card, rowBorder, emptyTxt, fieldLabel, timeChipTxt, removeTxt, gradeBadge/gradeTxt inline JSX; also has `<Text style={{ fontSize: 40, ... }}>💊</Text>` at line ~564
    - src/screens/ProfileScreen.tsx — read the StyleSheet section (bottom ~lines 381-460) and JSX; has ~15 Beige usages including safe, headerBg, screenTitle, card, border, editBtnTxt, name, goalMuted, and various row/tag styles; also has `<Text style={s.emptyStateIcon}>👤</Text>` at line ~130
    - src/theme/index.ts — confirm new tokens present
    - src/components/DesignSystemIcons.tsx — confirm PillIcon and PersonIcon are exported (created by Plan 2)
    - .planning/phases/13-ui-design-system/13-CONTEXT.md — D-09 (no emoji exceptions), D-12, D-13
  </read_first>
  <action>
    ProtocolScreen.tsx — apply substitution map to all Colors.Beige.* in both the StyleSheet.create({}) block and any inline JSX style expressions. Notable location: line ~305-306 has inline JSX with Colors.Beige.bgShade and Colors.Beige.textMuted in gradeBadge/gradeTxt styles — apply mapping there too.

    ProtocolScreen.tsx emoji replacement (D-09):
    - Add import at top: import { PillIcon } from '../components/DesignSystemIcons';
    - Locate the empty-state at line ~564: `<Text style={{ fontSize: 40, textAlign: 'center', marginBottom: Spacing.md }}>💊</Text>`
    - Replace with: `<PillIcon color={Colors.onSurfaceMuted} size={40} />`
    - Remove or keep the surrounding View's marginBottom as a View-level style (not on the icon component)

    ProfileScreen.tsx — apply substitution map to all Colors.Beige.* in StyleSheet and any inline JSX. Notable: placeholderTextColor={Colors.Beige.textMuted} in TextInput at line ~173 must be changed to placeholderTextColor={Colors.onSurfaceMuted}.

    ProfileScreen.tsx emoji replacement (D-09):
    - Add import at top: import { PersonIcon } from '../components/DesignSystemIcons';
    - Locate the empty state at line ~130: `<Text style={s.emptyStateIcon}>👤</Text>`
    - Replace with: `<PersonIcon color={Colors.onSurfaceMuted} size={40} />`
    - The s.emptyStateIcon StyleSheet entry was likely fontSize-based — remove it or replace with a View wrapper if needed

    Apply D-12 to both files: replace hardcoded fontSize: 11 → Typography.sizes.xs in ProtocolScreen.tsx (appears in sectionLbl ~775, 781, fieldLabel ~917, timeChipTxt ~824, removeTxt ~832). Also replace fontSize: 9 (timeChipTxt) with Typography.sizes.xs as the nearest reasonable match (Typography.sizes has no 9 value).

    Apply D-12 spacing sweep to both files: scan StyleSheet.create({}) for hardcoded numbers in padding/margin properties not using Spacing.*. Replace values 4→Spacing.xs, 8→Spacing.sm, 12→Spacing.md, 16→Spacing.base, 20→Spacing.lg, 24→Spacing.xl, 32→Spacing.xxl. Values 2, 3, 6 (badge paddings) have no exact Spacing.* match — leave as-is and add inline comment: /* intentional — no Spacing.* equivalent */.

    Do not change business logic, modal code, supplement logic, or navigation.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "Colors\.Beige" src/screens/ProtocolScreen.tsx && grep -c "Colors\.Beige" src/screens/ProfileScreen.tsx && grep -c "PillIcon" src/screens/ProtocolScreen.tsx && grep -c "PersonIcon" src/screens/ProfileScreen.tsx && grep -E "padding[A-Za-z]*: [0-9]+" src/screens/ProtocolScreen.tsx | grep -v "Spacing\." | head -5 && npx tsc --noEmit 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - grep "Colors.Beige" src/screens/ProtocolScreen.tsx returns 0 matches
    - grep "Colors.Beige" src/screens/ProfileScreen.tsx returns 0 matches
    - grep "Colors.surface" src/screens/ProtocolScreen.tsx returns at least 2 matches
    - grep "Colors.surface" src/screens/ProfileScreen.tsx returns at least 2 matches
    - grep "placeholderTextColor" src/screens/ProfileScreen.tsx does not contain Colors.Beige
    - grep "PillIcon" src/screens/ProtocolScreen.tsx returns at least 1 match (import + usage)
    - grep "💊" src/screens/ProtocolScreen.tsx returns 0 matches
    - grep "PersonIcon" src/screens/ProfileScreen.tsx returns at least 1 match (import + usage)
    - grep "👤" src/screens/ProfileScreen.tsx returns 0 matches
    - grep -E "padding[A-Za-z]*: [0-9]+" src/screens/ProtocolScreen.tsx | grep -v "Spacing\." returns only intentional exceptions (with comment)
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>ProtocolScreen and ProfileScreen migrated; zero Beige references; emoji replaced with SVG icons; spacing sweep applied; tsc passes</done>
</task>

<task type="auto">
  <name>Task 2: Migrate SettingsScreen.tsx and AboutScreen.tsx; replace all emoji</name>
  <files>src/screens/SettingsScreen.tsx, src/screens/AboutScreen.tsx</files>
  <read_first>
    - src/screens/SettingsScreen.tsx — read full file; SettingsRow interface at lines ~29-37 has `icon: string`; render at line ~47 is `<Text style={s.rowIcon}>{icon}</Text>`; emoji strings passed to SettingsRow at lines ~175, 176, 183, 195, 209, 231, 232, 238, 239, 240, 241, 249; also has Switch trackColor/thumbColor inline using Colors.Beige.border and Colors.Beige.textMuted at lines ~190-191, ~204-205; StyleSheet section lines ~268-320
    - src/screens/AboutScreen.tsx — read full file; EVIDENCE_GRADES constant at lines ~17-21 has grade 'C' entry with Beige tokens; whyPoint icons at lines ~118, ~122, ~126 use emoji strings ('💊', '🎯', '🔬') in `<Text style={s.whyIcon}>` wrapper; StyleSheet ~lines 249-346
    - src/theme/index.ts — confirm new tokens present
    - src/components/DesignSystemIcons.tsx — confirm PersonIcon, ShieldIcon, BellIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, ClipboardIcon, RefreshIcon, StarIcon, PillIcon, TargetIcon, MicroscopeIcon are all exported (created by Plan 2)
  </read_first>
  <action>
    SettingsScreen.tsx — Beige token migration:
    Apply substitution map. Key location: Switch components at lines ~190-191 and ~204-205 use Colors.Beige.border and Colors.Beige.textMuted as trackColor/thumbColor props — these are JSX props, not StyleSheet. Apply mapping: Colors.Beige.border → Colors.borderLight, Colors.Beige.textMuted → Colors.onSurfaceMuted.

    Also apply hardcoded font sizes: fontSize: 11 (sectionLbl ~279) → Typography.sizes.xs, fontSize: 16 (rowIcon) → Typography.sizes.lg, fontSize: 18 (rowArrow) → Typography.sizes.h3, fontSize: 10 (versionTxt ~319) → Typography.sizes.xs.

    Apply D-12 spacing sweep: scan StyleSheet.create({}) for hardcoded numbers in padding/margin properties not using Spacing.*. Replace values 4→Spacing.xs, 8→Spacing.sm, 12→Spacing.md, 16→Spacing.base, 20→Spacing.lg, 24→Spacing.xl, 32→Spacing.xxl. Values 2, 3, 6 have no Spacing.* match — leave as-is with /* intentional — no Spacing.* equivalent */ comment.

    SettingsScreen.tsx — SettingsRow emoji replacement (D-09):
    - Update the RowProps interface: change `icon: string` to `icon: React.ReactNode`. Update the render in SettingsRow from `<Text style={s.rowIcon}>{icon}</Text>` to `{typeof icon === 'string' ? <Text style={s.rowIcon}>{icon}</Text> : icon}` — this provides backward compatibility for any string that might remain, while allowing ReactNode (SVG components) to be passed directly.
    - Add import at top of file: import { PersonIcon, ShieldIcon, BellIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, ClipboardIcon, RefreshIcon, StarIcon } from '../components/DesignSystemIcons';
    - Update every SettingsRow invocation to pass SVG components instead of emoji strings:
      - icon="👤" → icon={<PersonIcon color={Colors.onSurface} size={20} />}
      - icon="🔒" → icon={<ShieldIcon color={Colors.onSurface} size={20} />}
      - icon="🔔" → icon={<BellIcon color={Colors.onSurface} size={20} />}
      - icon="📊" → icon={<ChartBarIcon color={Colors.onSurface} size={20} />}
      - icon="📏" → icon={<RulerIcon color={Colors.onSurface} size={20} />}
      - icon="📤" → icon={<ShareIcon color={Colors.onSurface} size={20} />}
      - icon="🗑" → icon={<TrashIcon color={Colors.danger} size={20} />} (danger row — use Colors.danger color to match the row title)
      - icon="ℹ" → use ShieldIcon or leave as text — ℹ is informational; use `<Text style={s.rowIcon}>ℹ</Text>` if no InfoIcon exists (no D-09 listed target for this specific glyph; use ShieldIcon as a reasonable substitute OR keep as string since ℹ is not one of the canonical D-09 targets — read D-09 in CONTEXT.md to confirm)
      - icon="🔏" → icon={<ShieldIcon color={Colors.onSurface} size={20} />}
      - icon="📋" → icon={<ClipboardIcon color={Colors.onSurface} size={20} />}
      - icon="⭐" → icon={<StarIcon color={Colors.onSurface} size={20} />}
      - icon="🔄" → icon={<RefreshIcon color={Colors.onSurface} size={20} />}
    - Note: s.rowIcon style had fontSize: 16 — after the change to ReactNode, string-fallback still uses it; SVG components use their own size prop. Keep the style for the string fallback path.

    AboutScreen.tsx — Beige token migration:
    Apply substitution map throughout:
    1. EVIDENCE_GRADES constant (line ~20): grade 'C' entry uses Colors.Beige.textMuted (color), Colors.Beige.bgShade (bg), Colors.Beige.border (border) → map to Colors.onSurfaceMuted, Colors.surfaceElevated, Colors.borderLight
    2. Inline JSX at lines ~153-155: Colors.Beige.text → Colors.onSurface, Colors.Beige.textMuted → Colors.onSurfaceMuted
    3. StyleSheet block: all Beige usages → mapped values

    Apply hardcoded font size replacements in AboutScreen.tsx: fontSize: 36 (heroTitle) → Typography.sizes.display3 (=36 exactly, direct match), fontSize: 10 (citationText, citationItemText) → Typography.sizes.xs (=11, nearest; acceptable rounding).

    Apply D-12 spacing sweep: same rules as above — replace numeric padding/margin with Spacing.* tokens; comment intentional exceptions.

    AboutScreen.tsx — whyIcon emoji replacement (D-09):
    - The s.whyIcon style is `{ fontSize: 16, width: 22 }` applied to a Text element containing the emoji.
    - Add import at top: import { PillIcon, TargetIcon, MicroscopeIcon } from '../components/DesignSystemIcons';
    - Locate the three whyPoint sections (lines ~117-128):
      - `<Text style={s.whyIcon}>💊</Text>` → `<View style={s.whyIconWrap}><PillIcon color={Colors.onSurface} size={16} /></View>`
      - `<Text style={s.whyIcon}>🎯</Text>` → `<View style={s.whyIconWrap}><TargetIcon color={Colors.onSurface} size={16} /></View>`
      - `<Text style={s.whyIcon}>🔬</Text>` → `<View style={s.whyIconWrap}><MicroscopeIcon color={Colors.onSurface} size={16} /></View>`
    - Add to StyleSheet: `whyIconWrap: { width: 22, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 /* intentional — no Spacing.* equivalent */ }` — this replaces s.whyIcon for the icon container.
    - The s.whyIcon style can be removed or left (it will be unused after the change; removing is cleaner).

    Do not alter the citations content, pharmacist text, or legal disclaimer logic.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "Colors\.Beige" src/screens/SettingsScreen.tsx && grep -c "Colors\.Beige" src/screens/AboutScreen.tsx && grep -c "PillIcon\|TargetIcon\|MicroscopeIcon" src/screens/AboutScreen.tsx && grep -c "PersonIcon\|ShieldIcon\|BellIcon" src/screens/SettingsScreen.tsx && grep -E "padding[A-Za-z]*: [0-9]+" src/screens/SettingsScreen.tsx | grep -v "Spacing\." | head -5 && npx tsc --noEmit 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - grep "Colors.Beige" src/screens/SettingsScreen.tsx returns 0 matches
    - grep "Colors.Beige" src/screens/AboutScreen.tsx returns 0 matches
    - grep "Colors.surface" src/screens/SettingsScreen.tsx returns at least 1 match
    - grep "Colors.surface\|Colors.surfaceElevated" src/screens/AboutScreen.tsx returns at least 3 matches
    - grep "EVIDENCE_GRADES" src/screens/AboutScreen.tsx does NOT contain "Colors.Beige"
    - SettingsRow interface in SettingsScreen.tsx has icon prop typed as React.ReactNode (not string)
    - grep "icon={<PersonIcon" src/screens/SettingsScreen.tsx returns at least 1 match
    - grep "icon={<BellIcon" src/screens/SettingsScreen.tsx returns at least 1 match
    - grep "icon={<ShieldIcon" src/screens/SettingsScreen.tsx returns at least 1 match
    - grep "icon={<ClipboardIcon" src/screens/SettingsScreen.tsx returns at least 1 match
    - grep "💊\|🎯\|🔬" src/screens/AboutScreen.tsx returns 0 matches in whyPoint sections
    - grep "PillIcon\|TargetIcon\|MicroscopeIcon" src/screens/AboutScreen.tsx returns at least 3 matches
    - grep -E "padding[A-Za-z]*: [0-9]+" src/screens/SettingsScreen.tsx | grep -v "Spacing\." returns only intentional exceptions (with comment)
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>SettingsScreen and AboutScreen migrated; zero Beige references; EVIDENCE_GRADES uses new tokens; SettingsRow icon prop is ReactNode; all emoji icons replaced with SVGs; spacing sweep applied; tsc passes</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Colors.Beige.* in JSX props → new tokens | Inline JSX usages (Switch trackColor, placeholderTextColor) can be missed if only StyleSheet is scanned |
| SettingsRow icon prop type change → existing callers | Changing icon: string to React.ReactNode is a breaking change if any caller passes non-ReactNode; backward-compat render guard in SettingsRow prevents runtime errors |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-13-09 | Tampering | JSX prop Beige usage missed (Switch trackColor) | mitigate | action explicitly names the line numbers; grep -c "Colors.Beige" covers JSX and StyleSheet |
| T-13-10 | Tampering | EVIDENCE_GRADES const-level Beige usage missed | mitigate | action explicitly names the const; acceptance_criteria checks EVIDENCE_GRADES does not contain Colors.Beige |
| T-13-11 | Tampering | SettingsRow icon prop change breaks TypeScript (existing callers pass string) | mitigate | icon typed as React.ReactNode (string IS assignable to ReactNode); render guard handles both; tsc gate catches any type error |
| T-13-12 | Tampering | whyIcon emoji survive if only StyleSheet scanned | mitigate | action explicitly targets the JSX Text elements at lines ~117-128; acceptance_criteria greps for emoji absence |
</threat_model>

<verification>
After all tasks complete:
1. Run: grep -rn "Colors.Beige" src/screens/ProtocolScreen.tsx src/screens/ProfileScreen.tsx src/screens/SettingsScreen.tsx src/screens/AboutScreen.tsx
   Expected: zero matches
2. Run: grep -n "💊\|👤\|🎯\|🔬" src/screens/ProtocolScreen.tsx src/screens/ProfileScreen.tsx src/screens/AboutScreen.tsx
   Expected: zero emoji matches in those files
3. Run: grep "React.ReactNode" src/screens/SettingsScreen.tsx
   Expected: RowProps interface shows icon: React.ReactNode
4. Run: npx tsc --noEmit
   Expected: zero errors
</verification>

<success_criteria>
- All 4 screens: zero Colors.Beige.* references (StyleSheet and JSX)
- AboutScreen EVIDENCE_GRADES grade 'C' uses Colors.onSurfaceMuted, Colors.surfaceElevated, Colors.borderLight
- AboutScreen whyPoint icons: PillIcon/TargetIcon/MicroscopeIcon SVGs, not emoji
- SettingsScreen: SettingsRow icon prop is React.ReactNode; all emoji icon strings replaced with SVG components
- ProtocolScreen empty state: PillIcon SVG, not 💊
- ProfileScreen empty state: PersonIcon SVG, not 👤
- Spacing sweep applied to all 4 files; intentional exceptions commented
- tsc --noEmit exits 0
</success_criteria>

<output>
Create .planning/phases/13-ui-design-system/13-05-SUMMARY.md when done
</output>
