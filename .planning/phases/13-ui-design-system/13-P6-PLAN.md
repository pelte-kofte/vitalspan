---
phase: "13"
plan: "06"
type: execute
wave: 4
depends_on:
  - "13-02"
  - "13-03"
  - "13-04"
  - "13-05"
files_modified:
  - src/screens/BiomarkerEntryScreen.tsx
  - src/screens/InteractionCheckerScreen.tsx
  - src/screens/LandingScreen.tsx
  - src/screens/LabUploadScreen.tsx
  - src/screens/OnboardingScreen.tsx
  - src/screens/DashboardScreen.tsx
  - src/screens/ExerciseScreen.tsx
  - src/screens/PlaceholderScreens.tsx
  - src/components/SupplementRow.tsx
  - src/theme/index.ts
autonomous: false
requirements:
  - DS-01
  - DS-02
  - DS-03
  - DS-05

must_haves:
  truths:
    - "BiomarkerEntryScreen.tsx has zero Colors.Beige.* references; all 25 references replaced with new token set"
    - "InteractionCheckerScreen.tsx and LandingScreen.tsx have zero remaining hardcoded hex values in StyleSheet blocks (shadowColor: '#000' accepted as cross-platform shadow convention)"
    - "LabUploadScreen.tsx renders SearchIcon and SuccessCheckIcon SVGs instead of 🔍 and ✅ emoji; renders ClipboardIcon instead of 📋; renders CameraIcon instead of 📷"
    - "OnboardingScreen.tsx goal selection renders GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon SVGs instead of ⏳ ⚡ 🧬 📊 emoji strings"
    - "DashboardScreen.tsx renders RunnerIcon instead of 🏃; BellIcon instead of 🔔; DnaHelixIcon instead of 🧬; ClipboardIcon instead of 📋 and 📄; WarningIcon instead of ⚠️ at line ~311 (interaction alert card)"
    - "ExerciseScreen.tsx category chips render SVG icons instead of CATEGORY_EMOJI emoji strings; empty state renders RunnerIcon instead of 🏃"
    - "SupplementRow.tsx renders WarningIcon instead of ⚠️"
    - "PlaceholderScreens.tsx is deleted and no src/ file imports from it"
    - "grep -rn Colors.Beige src/ returns zero matches (full removal confirmed)"
    - "Colors.Beige.* block removed from src/theme/index.ts"
    - "npx expo start launches without errors in simulator; all SVG icons visible, no blank spaces"
    - "eas build --profile preview completes without build errors"
    - "tsc --noEmit exits 0 after all changes"
  artifacts:
    - path: "src/screens/BiomarkerEntryScreen.tsx"
      provides: "BiomarkerEntry migrated to white/green tokens"
      contains: "Colors.surface"
    - path: "src/screens/LabUploadScreen.tsx"
      provides: "All emoji replaced with SVG icon components"
      contains: "SearchIcon"
    - path: "src/screens/OnboardingScreen.tsx"
      provides: "Goal emoji replaced with SVG icon components"
      contains: "GoalSparkIcon"
    - path: "src/screens/DashboardScreen.tsx"
      provides: "All emoji replaced with SVG icons"
      contains: "RunnerIcon"
    - path: "src/screens/ExerciseScreen.tsx"
      provides: "Category chip emoji replaced with SVG icons; empty state emoji replaced"
      contains: "RunnerIcon"
    - path: "src/components/SupplementRow.tsx"
      provides: "⚠️ warning emoji replaced with WarningIcon SVG"
      contains: "WarningIcon"
    - path: "src/theme/index.ts"
      provides: "Colors.Beige.* block removed — full migration complete"
  key_links:
    - from: "src/screens/LabUploadScreen.tsx"
      to: "src/components/DesignSystemIcons.tsx"
      via: "import { SearchIcon, SuccessCheckIcon, ClipboardIcon, CameraIcon }"
      pattern: "DesignSystemIcons"
    - from: "src/screens/OnboardingScreen.tsx"
      to: "src/components/DesignSystemIcons.tsx"
      via: "import { GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon }"
      pattern: "DesignSystemIcons"
    - from: "src/screens/DashboardScreen.tsx"
      to: "src/components/DesignSystemIcons.tsx"
      via: "import { RunnerIcon, BellIcon, DnaHelixIcon, ClipboardIcon, WarningIcon }"
      pattern: "DesignSystemIcons"
    - from: "src/screens/ExerciseScreen.tsx"
      to: "src/components/DesignSystemIcons.tsx"
      via: "import { RunnerIcon, DnaIcon }"
      pattern: "DesignSystemIcons"
    - from: "src/components/SupplementRow.tsx"
      to: "src/components/DesignSystemIcons.tsx"
      via: "import { WarningIcon }"
      pattern: "DesignSystemIcons"
    - from: "src/theme/index.ts"
      to: "all screens"
      via: "Colors.Beige block removed — any remaining Beige ref would be a TypeScript error"
      pattern: "Colors\\.Beige"
---

<objective>
Wave 4 is the final convergence pass: migrate the remaining screens that no prior plan touched (BiomarkerEntryScreen, InteractionCheckerScreen, LandingScreen), complete all emoji-to-SVG icon conversions (LabUploadScreen, OnboardingScreen, DashboardScreen, ExerciseScreen, SupplementRow), delete the dead PlaceholderScreens.tsx file, perform the final Beige audit, remove Colors.Beige.* from theme, and verify the full build passes.

Purpose: After all Wave 2 and 3 plans have migrated the bulk of the codebase, this plan closes every remaining gap — Beige references, emoji, dead code — and produces the verified build artifact that proves the design system overhaul is complete.
Output: Zero Colors.Beige.* references anywhere in src/; all emoji replaced with DesignSystemIcons SVGs; SupplementRow ⚠️ replaced with WarningIcon; PlaceholderScreens.tsx deleted; Colors.Beige.* block removed from theme; EAS preview build passes.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/13-ui-design-system/13-CONTEXT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/codebase/CONVENTIONS.md

<interfaces>
<!-- Token substitution map — identical to prior migration plans -->
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

<!-- Typography.sizes reference: xs=11, sm=12, base=14, md=15, lg=16, xl=20, xxl=28, h1=28, h2=22, h3=18, body=15, bodySmall=13, caption=12, captionSmall=11 -->
<!-- Spacing reference: xs=4, sm=8, md=12, base=16, lg=20, xl=24, xxl=32 -->
<!-- Gradient hex in LinearGradient arrays: EXEMPT per D-13 -->
<!-- shadowColor: '#000' — accepted iOS/Android shadow convention, not a Colors.* violation -->

<!-- DesignSystemIcons.tsx exports (created by Plan 2 / P2):               -->
<!--   SearchIcon         — replaces 🔍 in LabUploadScreen                 -->
<!--   SuccessCheckIcon   — replaces ✅ in LabUploadScreen                  -->
<!--   ClipboardIcon      — replaces 📋 in LabUploadScreen, DashboardScreen -->
<!--   CameraIcon         — replaces 📷 in LabUploadScreen                 -->
<!--   GoalTimerIcon      — replaces ⏳ (Extend lifespan goal)             -->
<!--   GoalSparkIcon      — replaces ⚡ (Optimize healthspan goal)         -->
<!--   GoalDnaIcon        — replaces 🧬 (Slow biological aging goal)       -->
<!--   GoalChartIcon      — replaces 📊 (Track & understand goal)          -->
<!--   CheckmarkIcon      — replaces ✓ inline checkmark                    -->
<!--   RunnerIcon         — replaces 🏃 in Dashboard, ExerciseScreen       -->
<!--   DnaIcon/DnaHelixIcon — replaces 🧬 in Dashboard emptyState         -->
<!--   BellIcon           — replaces 🔔 in DashboardScreen                 -->
<!--   WarningIcon        — replaces ⚠️ in SupplementRow                   -->
<!--   All icons accept: color (string), size (number) props               -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Migrate BiomarkerEntryScreen.tsx and audit InteractionCheckerScreen + LandingScreen</name>
  <files>src/screens/BiomarkerEntryScreen.tsx, src/screens/InteractionCheckerScreen.tsx, src/screens/LandingScreen.tsx</files>
  <read_first>
    - src/screens/BiomarkerEntryScreen.tsx — read in full; confirmed 25 Colors.Beige.* references including placeholderTextColor props (lines ~149, 202, 271, 294) and StyleSheet entries. Note: fontSize: 44 in valueInput is a hero entry size — leave as-is per D-12 (no matching Typography.sizes token).
    - src/screens/InteractionCheckerScreen.tsx — read in full; hardcoded hex values are shadowColor: '#000' at lines ~397, 424, 448, 463 — these are accepted iOS shadow convention and do NOT need replacement.
    - src/screens/LandingScreen.tsx — read in full; hardcoded hex values are shadowColor: '#000' at line ~128 — accepted shadow convention. Confirm no other non-gradient hex literals exist.
    - src/theme/index.ts — confirm new tokens present before applying substitution
    - .planning/phases/13-ui-design-system/13-CONTEXT.md — D-12 rule, D-13 gradient exception, D-08 (LandingScreen dark sections stay dark)
  </read_first>
  <action>
    BiomarkerEntryScreen.tsx — apply the Beige substitution map to all 25 Colors.Beige.* references. Key locations confirmed in grep output:
    - placeholderTextColor={Colors.Beige.textMuted} at lines ~149, 202, 271, 294 → Colors.onSurfaceMuted
    - safe.backgroundColor → Colors.surface
    - headerTitle color → Colors.onSurface
    - searchInput: backgroundColor → Colors.surface, color → Colors.onSurface, borderColor → Colors.borderLight
    - pickRow.backgroundColor → Colors.surface; pickRowBorder.borderBottomColor → Colors.borderLight
    - pickName color → Colors.onSurface; pickUnit color → Colors.onSurfaceMuted
    - valueCard: backgroundColor → Colors.surface, borderColor → Colors.borderLight
    - valueInput color → Colors.onSurface (fontSize: 44 hero size — leave as-is per D-12)
    - valueUnit color → Colors.onSurfaceMuted
    - fieldLabel color → Colors.onSurfaceMuted
    - chip: borderColor → Colors.borderLight, backgroundColor → Colors.surface
    - chipTxt color → Colors.textSecondary (Beige.textSecondary → Colors.textSecondary)
    - customDateInput and notesInput: backgroundColor → Colors.surface, color → Colors.onSurface, borderColor → Colors.borderLight
    - unitConvertLabel color → Colors.onSurfaceMuted
    - unitChip: borderColor → Colors.borderLight, backgroundColor → Colors.surface
    - unitChipTxt color → Colors.textSecondary
    - explanationInner: backgroundColor → Colors.surface, borderColor → Colors.borderLight
    - explanationHeadline color → Colors.onSurface
    - explanationBody color → Colors.textSecondary

    Also apply D-12 for any remaining hardcoded font sizes in BiomarkerEntryScreen that are not the 44px hero entry size.

    InteractionCheckerScreen.tsx — verify that the ONLY non-token hex values are shadowColor: '#000' occurrences (4 total). These are iOS/Android shadow convention and are intentionally exempt — do NOT replace them. If there are any other hardcoded hex values (non-shadow, non-gradient), replace with the appropriate Colors.* token. Run grep to confirm after.

    LandingScreen.tsx — same audit: shadowColor: '#000' at ~line 128 is exempt. LandingScreen uses dark Colors.dark.* for its dark neural aesthetic per D-08 — do NOT convert dark sections to light tokens. Only fix any non-shadow, non-gradient, non-dark hardcoded hex. If the only hex is the shadow, no StyleSheet changes are needed.

    Run tsc --noEmit after all three files are edited.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "Colors\.Beige" src/screens/BiomarkerEntryScreen.tsx && grep -v "shadowColor" src/screens/InteractionCheckerScreen.tsx | grep -c "#[0-9a-fA-F]\{3,6\}" && grep -v "shadowColor\|LinearGradient\|gradient" src/screens/LandingScreen.tsx | grep -c "#[0-9a-fA-F]\{3,6\}" && npx tsc --noEmit 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - grep "Colors.Beige" src/screens/BiomarkerEntryScreen.tsx returns 0 matches
    - grep "Colors.surface" src/screens/BiomarkerEntryScreen.tsx returns at least 5 matches
    - InteractionCheckerScreen.tsx has no hardcoded hex outside shadowColor and LinearGradient
    - LandingScreen.tsx has no hardcoded hex outside shadowColor and LinearGradient
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>BiomarkerEntryScreen, InteractionCheckerScreen, LandingScreen: zero outstanding Beige or unwarranted hex references; tsc passes</done>
</task>

<task type="auto">
  <name>Task 2: Emoji-to-SVG conversions — LabUploadScreen, OnboardingScreen, DashboardScreen, ExerciseScreen, SupplementRow; delete PlaceholderScreens.tsx</name>
  <files>src/screens/LabUploadScreen.tsx, src/screens/OnboardingScreen.tsx, src/screens/DashboardScreen.tsx, src/screens/ExerciseScreen.tsx, src/components/SupplementRow.tsx, src/screens/PlaceholderScreens.tsx</files>
  <read_first>
    - src/screens/LabUploadScreen.tsx — confirmed: `{fontSize: 48}>🔍</Text>` at line 149 (noResults state), `{fontSize: 56}>✅</Text>` at line 168 (success state), `<Text style={s.uploadIcon}>📋</Text>` at line 105 (upload icon), `<Text style={s.photoBtnIcon}>📷</Text>` at line 120 (photo button icon). All four must be converted.
    - src/screens/OnboardingScreen.tsx — confirmed: GOALS array at line ~17-21 has { icon: '⏳'/'⚡'/'🧬'/'📊' }; rendered at line ~146 as `<Text style={{ fontSize: 18 }}>{g.icon}</Text>` inside optionIcon view. Also has `<Text style={{ color: Colors.primary, fontSize: 18 }}>✓</Text>` selected-state checkmark at line ~152.
    - src/screens/DashboardScreen.tsx — confirmed: `<Text style={{ fontSize: 18 }}>🔔</Text>` at line ~240 (notification button), `<Text style={s.emptyStateIcon}>🧬</Text>` at line ~337 (biomarker empty state), `<Text style={s.uploadCardIcon}>📋</Text>` at line ~399 (upload card icon), `<Text style={s.researchIcon}>📄</Text>` at line ~477 (research CTA icon). Also has `<Text style={s.exerciseCardIcon}>🏃</Text>` at line ~422.
    - src/screens/ExerciseScreen.tsx — confirmed: CATEGORY_EMOJI map at lines 23-32 used in tab chips at line ~180 as `{CATEGORY_EMOJI[cat]} {cat}` inside Text. Also empty state 🏃 at line ~241 in `<Text style={s.emptyStateIcon}>🏃</Text>`.
    - src/components/SupplementRow.tsx — confirmed: `<Text style={s.warnTxt}>⚠️ {c}</Text>` at line ~109.
    - src/screens/PlaceholderScreens.tsx — confirmed to exist; grep shows no src/ file imports it.
    - src/components/DesignSystemIcons.tsx — this file is created by Plan 2 (P2); read it to confirm exact component names and prop signatures before importing.
  </read_first>
  <action>
    LabUploadScreen.tsx:
    - Add import at top: import { SearchIcon, SuccessCheckIcon, ClipboardIcon, CameraIcon } from '../components/DesignSystemIcons';
    - Line ~149: Replace `<Text style={{ fontSize: 48 }}>🔍</Text>` with `<SearchIcon color={Colors.brand} size={48} />`
    - Line ~168: Replace `<Text style={{ fontSize: 56 }}>✅</Text>` with `<SuccessCheckIcon color={Colors.semantic.success} size={48} />`
    - Line ~105: Replace `<Text style={s.uploadIcon}>📋</Text>` with `<ClipboardIcon color={Colors.onSurfaceMuted} size={32} />` (read file to confirm exact size and color from surrounding context)
    - Line ~120: Replace `<Text style={s.photoBtnIcon}>📷</Text>` with `<CameraIcon color={Colors.onSurfaceMuted} size={24} />` (read file to confirm appropriate size)
    - Remove or update the s.uploadIcon and s.photoBtnIcon StyleSheet entries (they were fontSize-based for Text emoji — remove if unused after the SVG swap)

    OnboardingScreen.tsx:
    - Add import: import { GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon, CheckmarkIcon } from '../components/DesignSystemIcons';
    - The GOALS array currently stores icon as emoji string. Change the rendering approach: instead of `<Text style={{ fontSize: 18 }}>{g.icon}</Text>`, render a goal icon component inline based on array index (index 0 = GoalTimerIcon, 1 = GoalSparkIcon, 2 = GoalDnaIcon, 3 = GoalChartIcon).
    - Implementation: Replace `<Text style={{ fontSize: 18 }}>{g.icon}</Text>` with a helper or inline conditional: `{[<GoalTimerIcon />, <GoalSparkIcon />, <GoalDnaIcon />, <GoalChartIcon />][i]}` where `i` is the map index. Use `color={goal === i ? Colors.brand : Colors.onSurfaceMuted}` and `size={18}` on each icon.
    - Replace `<Text style={{ color: Colors.primary, fontSize: 18 }}>✓</Text>` selected checkmark at line ~152 with `<CheckmarkIcon color={Colors.brand} size={18} />`
    - Remove the icon property from each GOALS object entry (or leave as dead field — removing is cleaner).

    DashboardScreen.tsx:
    - Add import: import { RunnerIcon, BellIcon, DnaHelixIcon, ClipboardIcon, WarningIcon } from '../components/DesignSystemIcons';
    - Line ~240: Replace `<Text style={{ fontSize: 18 }}>🔔</Text>` with `<BellIcon color={Colors.onSurface} size={20} />`
    - Line ~311: Replace `<Text style={{ fontSize: 14 }}>⚠️</Text>` (interaction alert card warning indicator) with `<WarningIcon color={Colors.semantic.warning} size={14} />`
    - Line ~337: Replace `<Text style={s.emptyStateIcon}>🧬</Text>` with `<DnaHelixIcon color={Colors.onSurfaceMuted} size={40} />`; remove or repurpose the s.emptyStateIcon StyleSheet entry (it was fontSize-based)
    - Line ~399: Replace `<Text style={s.uploadCardIcon}>📋</Text>` with `<ClipboardIcon color={Colors.onSurface} size={20} />`; remove or repurpose s.uploadCardIcon StyleSheet entry
    - Line ~422: Replace `<Text style={s.exerciseCardIcon}>🏃</Text>` with `<RunnerIcon color={Colors.onSurface} size={20} />`; remove or repurpose s.exerciseCardIcon StyleSheet entry
    - Line ~477: Replace `<Text style={s.researchIcon}>📄</Text>` with `<ClipboardIcon color={Colors.onSurface} size={20} />` (no DocumentIcon exists — ClipboardIcon is the closest available document-reference icon); remove or repurpose s.researchIcon StyleSheet entry
    - Do NOT change any other part of DashboardScreen — dark neural sections, NeuralGrid, gradients stay untouched per D-08.

    ExerciseScreen.tsx:
    - Add import: import { RunnerIcon } from '../components/DesignSystemIcons';
    - Category chip emoji (line ~180): The current render is `<Text ...>{CATEGORY_EMOJI[cat]} {cat}</Text>` inside the tab TouchableOpacity. Replace this with a View containing [RunnerIcon or appropriate icon] + Text for category name. Since DesignSystemIcons only exports RunnerIcon for exercise-domain icons (not per-category icons), use RunnerIcon for all category chips OR simply remove the emoji prefix and render only the category Text. Read DesignSystemIcons.tsx to see if per-category icons exist before deciding. If only RunnerIcon and DnaIcon exist, remove the emoji prefix and render `<Text ...>{cat}</Text>` for all non-All tabs. The CATEGORY_EMOJI constant can then be removed.
    - Empty state icon (line ~241): Replace `<Text style={s.emptyStateIcon}>🏃</Text>` with `<RunnerIcon color={Colors.onSurfaceMuted} size={48} />`
    - Remove or update the s.emptyStateIcon StyleSheet entry (it was a fontSize style — replace with appropriate sizing if RunnerIcon accepts a style prop, or just rely on the size prop).

    SupplementRow.tsx:
    - Read src/components/SupplementRow.tsx to confirm the exact JSX at line ~109: `<Text style={s.warnTxt}>⚠️ {c}</Text>`
    - Add import at top: import { WarningIcon } from '../components/DesignSystemIcons';
    - Replace the ⚠️ emoji in the warning Text with an inline icon: change the `<Text style={s.warnTxt}>⚠️ {c}</Text>` to a View row with `<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><WarningIcon color={Colors.semantic.warning} size={14} /><Text style={s.warnTxt}>{c}</Text></View>`. Adjust size/color based on the actual s.warnTxt font size you see when reading the file.
    - Verify grep for ⚠️ in the file returns 0 after the change.

    PlaceholderScreens.tsx deletion:
    - Confirm no imports: `grep -rn "PlaceholderScreens" src/` must return zero results before deleting.
    - Delete the file: use the Bash tool to run `rm /Users/bekircemkusdemir/Downloads/vitalspan/src/screens/PlaceholderScreens.tsx`

    Run tsc --noEmit after all changes.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "SearchIcon\|SuccessCheckIcon\|ClipboardIcon\|CameraIcon" src/screens/LabUploadScreen.tsx && grep -c "GoalSparkIcon\|GoalTimerIcon" src/screens/OnboardingScreen.tsx && grep -c "RunnerIcon\|BellIcon\|DnaHelixIcon" src/screens/DashboardScreen.tsx && grep -c "RunnerIcon" src/screens/ExerciseScreen.tsx && grep -c "WarningIcon" src/components/SupplementRow.tsx && ls src/screens/PlaceholderScreens.tsx 2>&1 && npx tsc --noEmit 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - LabUploadScreen.tsx imports SearchIcon, SuccessCheckIcon, ClipboardIcon, CameraIcon from DesignSystemIcons
    - LabUploadScreen.tsx has no remaining 🔍, ✅, 📋, 📷 emoji in JSX
    - grep -rn "[^\x00-\x7F]" src/screens/LabUploadScreen.tsx | grep -v "string\|comment" returns 0 emoji
    - OnboardingScreen.tsx imports GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon
    - OnboardingScreen.tsx renders SVG icon components for goal selection, not emoji strings
    - DashboardScreen.tsx imports RunnerIcon, BellIcon, DnaHelixIcon, ClipboardIcon
    - DashboardScreen.tsx has no remaining 🔔, 🧬, 📋, 📄, 🏃, ⚠️ emoji in JSX
    - ExerciseScreen.tsx imports RunnerIcon; renders it in empty state; category chip emoji removed
    - SupplementRow.tsx imports WarningIcon; grep "⚠" src/components/SupplementRow.tsx returns 0 matches
    - src/screens/PlaceholderScreens.tsx does not exist (ls returns "No such file")
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>All emoji converted to SVG icons across LabUploadScreen, OnboardingScreen, DashboardScreen, ExerciseScreen, SupplementRow; PlaceholderScreens.tsx deleted; tsc passes</done>
</task>

<task type="auto">
  <name>Task 3: Final Beige audit and Colors.Beige.* removal from theme</name>
  <files>src/theme/index.ts</files>
  <read_first>
    - src/theme/index.ts — read the full file to locate the exact Colors.Beige.* block boundaries before removing it
  </read_first>
  <action>
    Run the final Beige audit to confirm all prior plans have completed their migrations:
    `grep -rn "Colors.Beige" src/`
    This MUST return zero matches. If any matches remain, stop and fix them before proceeding to removal. Do not remove the Beige block if any screen still references it — that would cause TypeScript errors and runtime failures.

    Once the grep confirms zero remaining Beige references:
    - Open src/theme/index.ts
    - Locate the Colors.Beige nested object block (the "Warm Beige palette" comment + entire Beige: { ... } object)
    - Remove the entire block including its leading comment
    - Also remove any TypeScript type annotation line that specifically types Colors.Beige if one exists
    - Save the file

    Run tsc --noEmit to confirm zero TypeScript errors after removal. The absence of Colors.Beige.* from the type means any accidental remaining reference in a screen file would now surface as a TypeScript error — this is the intended safety net.
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -rn "Colors\.Beige" src/ | wc -l && npx tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - grep -rn "Colors.Beige" src/ returns 0 lines (confirmed zero references anywhere in src/)
    - src/theme/index.ts no longer contains the Beige block or "Warm Beige palette" comment
    - tsc --noEmit exits 0 (no TypeScript errors caused by removal)
  </acceptance_criteria>
  <done>Colors.Beige.* fully removed from codebase; DS-01 and D-05 satisfied; tsc passes</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    All emoji converted to SVG icons across LabUploadScreen, OnboardingScreen, DashboardScreen, ExerciseScreen, SupplementRow. PlaceholderScreens.tsx deleted. Colors.Beige.* removed. Run `npx expo start` to open the iOS simulator and visually verify all changes.
  </what-built>
  <how-to-verify>
    1. Run: `cd /Users/bekircemkusdemir/Downloads/vitalspan && npx expo start` — open in iOS simulator (press 'i')
    2. Navigate to Lab Upload (Biomarkers tab → Upload): confirm the "no results" state shows a vector search icon (not 🔍 emoji), success state shows vector check icon (not ✅), upload area shows ClipboardIcon (not 📋), photo button shows CameraIcon (not 📷)
    3. Navigate to Onboarding (sign out or reset storage): confirm goal selection shows 4 distinct SVG icons instead of ⏳ ⚡ 🧬 📊 emoji; selected state shows vector checkmark not ✓ text
    4. Navigate to Dashboard tab: confirm the notification button shows BellIcon (not 🔔), biomarker empty state shows DnaHelixIcon (not 🧬), upload card shows ClipboardIcon (not 📋), exercise card shows RunnerIcon (not 🏃), research card shows ClipboardIcon (not 📄)
    5. Navigate to Exercise tab: confirm category filter chips show either RunnerIcon or text-only labels (no emoji characters); empty state (if no logs) shows RunnerIcon not 🏃 emoji
    6. Navigate to Protocol tab: expand a supplement row with interactions — confirm warning indicator shows WarningIcon SVG (not ⚠️ emoji)
    7. Navigate to Biomarker Entry (enter a value): confirm white/green styling with no visual regressions
    8. Confirm overall: no blank white squares, no "?" placeholder icons, no visible emoji anywhere in the above flows
  </how-to-verify>
  <resume-signal>Type "approved" if all icons render correctly, or describe any specific screen/state that shows a regression</resume-signal>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <what-built>
    Simulator visual verification passed. Now run the EAS preview build to confirm the fully compiled native bundle renders all SVG icons correctly on device (DS-03, D-14).
  </what-built>
  <how-to-verify>
    1. Ensure you are logged in to EAS: `eas whoami` — if not logged in, run `eas login`
    2. Run: `cd /Users/bekircemkusdemir/Downloads/vitalspan && eas build --profile preview --platform ios`
    3. Wait for the build to complete (typically 10-20 minutes on EAS servers)
    4. Install the resulting .ipa on a physical device or simulator via the EAS dashboard link
    5. Verify: all tab bar icons render (Home, Biomarkers, Protocol, Exercise, Profile — SVG neural-dot style)
    6. Verify: LabUploadScreen shows SVG SearchIcon, SuccessCheckIcon, ClipboardIcon, CameraIcon
    7. Verify: Onboarding goal selection shows SVG icons
    8. Verify: no blank spaces, missing icons, or JavaScript errors in console
  </how-to-verify>
  <resume-signal>Type "build-passed" when the EAS build completes successfully and device verification passes, or describe any build error or runtime issue</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Colors.Beige removal → all screens | Removing the block before confirming zero grep matches would break any remaining Beige reference at runtime |
| PlaceholderScreens deletion → navigation | If any navigator imported from PlaceholderScreens, deletion would crash the app |
| emoji → SVG swap → JSX type system | Replacing Text emoji with SVG components must be TypeScript-valid; wrong prop types cause build failure |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-13-P6-01 | Tampering | Premature Colors.Beige removal (Task 3 runs before all screens are clean) | mitigate | Task 3 action requires grep -rn "Colors.Beige" src/ = 0 before touching theme; wave ordering (Wave 4 depends on Wave 2+3 plans) enforces prior migration completion |
| T-13-P6-02 | Tampering | PlaceholderScreens.tsx has a live import not found by grep | mitigate | grep -rn "PlaceholderScreens" src/ must return 0 before deletion in Task 2 action |
| T-13-P6-03 | Denial of Service | EAS build fails due to SVG icon component missing a required prop | mitigate | tsc --noEmit gate in Task 2 catches type errors before build; simulator checkpoint verifies render |
| T-13-P6-04 | Tampering | 📋 and 📷 in LabUploadScreen survive because deferral clause removed too late | mitigate | acceptance_criteria greps for both ClipboardIcon/CameraIcon presence AND emoji absence in LabUploadScreen |
| T-13-P6-SC | Tampering | npm/pip/cargo installs | accept | No new package installs in this plan; DesignSystemIcons.tsx uses React Native SVG (already in package.json from Phase 5) |
</threat_model>

<verification>
After all tasks complete:
1. Run: grep -rn "Colors.Beige" src/
   Expected: zero matches
2. Run: grep -rn "🔍\|✅\|🏃\|⏳\|⚡\|🧬\|📊\|🔔\|📋\|📷\|📄\|⚠️" src/screens/LabUploadScreen.tsx src/screens/OnboardingScreen.tsx src/screens/DashboardScreen.tsx src/screens/ExerciseScreen.tsx src/components/SupplementRow.tsx
   Expected: zero emoji matches in those files (includes ⚠️ in DashboardScreen line ~311 and SupplementRow)
3. Run: ls src/screens/PlaceholderScreens.tsx
   Expected: "No such file or directory"
4. Run: npx tsc --noEmit
   Expected: zero errors
5. Human: iOS simulator shows all SVG icons; EAS preview build passes
</verification>

<success_criteria>
- BiomarkerEntryScreen.tsx: zero Colors.Beige.* references; migrated to white/green token set
- InteractionCheckerScreen.tsx and LandingScreen.tsx: only shadowColor '#000' hex (accepted); no other non-token hex in StyleSheets
- LabUploadScreen.tsx: all four emoji (🔍 ✅ 📋 📷) converted to DesignSystemIcons SVGs
- OnboardingScreen.tsx, DashboardScreen.tsx, ExerciseScreen.tsx: all emoji converted to DesignSystemIcons SVGs
- SupplementRow.tsx: ⚠️ replaced with WarningIcon SVG
- PlaceholderScreens.tsx deleted; confirmed no imports exist
- Colors.Beige.* block removed from src/theme/index.ts
- grep -rn "Colors.Beige" src/ returns 0
- tsc --noEmit exits 0
- npx expo start: simulator shows all icons with no regressions (DS-03)
- eas build --profile preview: build passes, device install verifies SVG icons render (DS-03, D-14)
</success_criteria>

<output>
Create .planning/phases/13-ui-design-system/13-06-SUMMARY.md when done
</output>
