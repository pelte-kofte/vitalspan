---
phase: "13"
plan: "02"
type: execute
wave: 2
depends_on:
  - "13-01"
files_modified:
  - src/components/DesignSystemIcons.tsx
autonomous: true
requirements:
  - DS-02

must_haves:
  truths:
    - "A single new file src/components/DesignSystemIcons.tsx exports named SVG neural-dot components for all icon needs across Phase 13: SearchIcon, SuccessCheckIcon, GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon, CheckmarkIcon, PillIcon, RunnerIcon, DnaIcon, BellIcon, DnaHelixIcon, ClipboardIcon, CameraIcon, TargetIcon, MicroscopeIcon, WarningIcon, PersonIcon, ShieldIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, RefreshIcon, StarIcon"
    - "All icons match the visual style of TabIcons.tsx: stroke-based, neural-dot aesthetic, Line + Circle + Path elements from react-native-svg, strokeWidth 1.5"
    - "All icons accept { color: string; size?: number } props (no focused prop needed — these are content icons not tab bar icons)"
    - "tsc --noEmit exits 0 after creation"
  artifacts:
    - path: "src/components/DesignSystemIcons.tsx"
      provides: "All new SVG icons for Phase 13 migration"
      exports: ["SearchIcon", "SuccessCheckIcon", "GoalTimerIcon", "GoalSparkIcon", "GoalDnaIcon", "GoalChartIcon", "CheckmarkIcon", "PillIcon", "RunnerIcon", "DnaIcon", "BellIcon", "DnaHelixIcon", "ClipboardIcon", "CameraIcon", "TargetIcon", "MicroscopeIcon", "WarningIcon", "PersonIcon", "ShieldIcon", "ChartBarIcon", "RulerIcon", "ShareIcon", "TrashIcon", "RefreshIcon", "StarIcon"]
  key_links:
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/screens/LabUploadScreen.tsx"
      via: "SearchIcon, SuccessCheckIcon, ClipboardIcon, CameraIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/screens/OnboardingScreen.tsx"
      via: "GoalTimerIcon, GoalSparkIcon, GoalDnaIcon, GoalChartIcon, CheckmarkIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/screens/AboutScreen.tsx"
      via: "PillIcon, TargetIcon, MicroscopeIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/screens/ProtocolScreen.tsx"
      via: "PillIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/screens/ProfileScreen.tsx"
      via: "PersonIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/screens/SettingsScreen.tsx"
      via: "PersonIcon, ShieldIcon, BellIcon, ChartBarIcon, RulerIcon, ShareIcon, TrashIcon, ClipboardIcon, RefreshIcon, StarIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/screens/DashboardScreen.tsx"
      via: "RunnerIcon, DnaIcon, BellIcon, DnaHelixIcon, ClipboardIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/screens/BiomarkerDetailScreen.tsx"
      via: "ClipboardIcon"
      pattern: "import.*DesignSystemIcons"
    - from: "src/components/DesignSystemIcons.tsx"
      to: "src/components/SupplementRow.tsx"
      via: "WarningIcon"
      pattern: "import.*DesignSystemIcons"
---

<objective>
Create src/components/DesignSystemIcons.tsx — a single barrel file containing all new SVG neural-dot icon components needed for Phase 13's emoji-to-SVG conversion. Creating this file in Wave 2 (before Wave 3 screen migrations) means screen migration plans have concrete import targets.

Purpose: Unblocks Wave 3 screen plans that replace emoji with SVG icons. Without this file, screen plan executors would need to create icons inline, causing inconsistency.
Output: src/components/DesignSystemIcons.tsx with ~25 named SVG icon exports covering all emoji replacements across ProtocolScreen, ProfileScreen, SettingsScreen, AboutScreen, BiomarkerDetailScreen, LabUploadScreen, DashboardScreen, and SupplementRow.
</objective>

<execution_context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/phases/13-ui-design-system/13-CONTEXT.md
@/Users/bekircemkusdemir/Downloads/vitalspan/.planning/codebase/CONVENTIONS.md

<interfaces>
<!-- From src/components/TabIcons.tsx — visual style reference. All new icons must match. -->
<!-- Key pattern: Svg wrapper, Line + Circle + Path from react-native-svg, strokeWidth={1.5}, stroke-only circles (fill="none"), focal/active node uses filled circle -->

interface TabIconProps {
  color: string;
  focused: boolean;
  size?: number;
}

// Example HomeIcon pattern:
// - Connection lines: Line elements from center to orbit nodes
// - Orbit nodes: Circle with fill="none" stroke={color} strokeWidth={1.5}
// - Focal node: Circle with fill={focused ? color : 'none'} stroke={color} strokeWidth={1.5}

// New icon interface (no 'focused' needed for content icons):
interface IconProps {
  color: string;
  size?: number;
}
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create src/components/DesignSystemIcons.tsx with all ~25 SVG icons</name>
  <files>src/components/DesignSystemIcons.tsx</files>
  <read_first>
    - src/components/TabIcons.tsx — read in full; this is the MANDATORY visual reference; all new icons must replicate this aesthetic: stroke-based, Line + Circle + Path, strokeWidth 1.5, no fills except focal nodes
    - .planning/phases/13-ui-design-system/13-CONTEXT.md — D-09 and D-10 for icon requirements
    - .planning/phases/05-design-tokens-and-icons/05-CONTEXT.md — tab bar icon style history
  </read_first>
  <action>
    Create src/components/DesignSystemIcons.tsx with the following named SVG icon exports. All use the same props interface: { color: string; size?: number } with size defaulting to 24. All use react-native-svg primitives (Svg, Line, Circle, Path, Ellipse) imported from 'react-native-svg'. All render in a 24x24 viewBox. All are stroke-based with strokeWidth={1.5} — no solid fills except for small focal dot elements (r=1 to r=1.5, fill={color}).

    File structure: single import block at top (React, Svg + primitives from react-native-svg), shared interface IconProps, then each function component exported by name. No default export — named exports only (matching conventions).

    --- GROUP 1: Original 10 (unchanged from original spec) ---

    SearchIcon — magnifier icon. Circle for lens (cx=10, cy=10, r=6, fill="none"), Line for handle (x1=14.5 y1=14.5 x2=20 y2=20), 3 small neural dots on the lens circle at r=1 fill={color}.

    SuccessCheckIcon — checkmark in a circle. Circle for outer ring (cx=12, cy=12, r=9, fill="none"), Path for checkmark stroke (M7.5 12 L10.5 15 L16.5 9), Circle neural dot at checkmark apex r=1 fill={color}.

    GoalTimerIcon — hourglass-inspired (replaces ⏳). Lines for top/bottom horizontal bars, Lines connecting in hourglass shape, Circle neural dots at pinch point and corners.

    GoalSparkIcon — energy bolt / spark (replaces ⚡). Path for zigzag bolt shape, Circle neural dots at each bend point (r=1, fill={color}).

    GoalDnaIcon — DNA helix (replaces 🧬). Same structure as BiomarkersIcon from TabIcons.tsx — already a DNA helix. Size proportionally for 24x24 viewBox.

    GoalChartIcon — bar chart rising (replaces 📊). 3 vertical Line elements of increasing height (left short, center medium, right tall), Circle neural dot at top of each bar (r=1.2, fill={color}), Line for baseline.

    CheckmarkIcon — simple check stroke (for inline selected state, replacing ✓ text). Path: M5 12 L10 17 L19 7, strokeWidth=2, stroke={color}, fill="none". No circles needed.

    PillIcon — capsule shape (replaces 💊). Path for capsule outline (rounded rectangle), Line down the center, Circle neural dots at each end (r=1.5).

    RunnerIcon — figure in motion (replaces 🏃). Circle for head (cx=14, cy=5, r=2, fill="none"), Lines for torso and legs suggesting forward motion, Circle neural dots at joints (r=1).

    DnaIcon — re-export of GoalDnaIcon: export const DnaIcon = GoalDnaIcon; (backward compat alias — both names must exist).

    --- GROUP 2: New icons for emoji sweeps in P4, P5, P6 ---

    BellIcon — notification bell (replaces 🔔). Path for bell shape (arc top + flat bottom), small Circle for clapper dot at bottom center (r=1.5, fill={color}), neural dot at top of arc (r=1, fill={color}).

    DnaHelixIcon — re-export of GoalDnaIcon: export const DnaHelixIcon = GoalDnaIcon; (replaces 🧬 in DashboardScreen emptyState context — same visual as GoalDnaIcon).

    ClipboardIcon — clipboard (replaces 📋). Rectangle Path for clipboard body (rx=2), small rounded Rect or Path for the top clip, horizontal Lines inside for "content lines" (y=10, y=14, y=18), Circle neural dot (r=1, fill={color}).

    CameraIcon — camera body (replaces 📷). Rounded rectangle Path for body, Circle for lens (cx=12, cy=13, r=4, fill="none"), small Circle for shutter indicator (cx=17, cy=9, r=1, fill={color}), neural dot at lens rim (r=1, fill={color}).

    TargetIcon — target/crosshair (replaces 🎯). Three concentric circles: outer (r=9, fill="none"), middle (r=5, fill="none"), inner filled dot (r=1.5, fill={color}). All cx=12 cy=12. Stroke-based, strokeWidth=1.5.

    MicroscopeIcon — simplified microscope (replaces 🔬). Vertical Line for stand (x1=12 y1=4 x2=12 y2=14), angled Line for arm, Circle at eyepiece (cx=12, cy=4, r=2, fill="none"), Circle at objective (cx=12, cy=14, r=1.5, fill={color}), horizontal Line at base.

    WarningIcon — triangle warning (replaces ⚠️). Path for triangle outline (M12 3 L22 21 L2 21 Z, fill="none", strokeLinejoin="round"), vertical Line for exclamation body (x1=12 y1=10 x2=12 y2=15), Circle for exclamation dot at bottom (cx=12, cy=18, r=1, fill={color}).

    PersonIcon — person silhouette (replaces 👤). Circle for head (cx=12, cy=7, r=4, fill="none"), Path for shoulders/body arc (M4 21 Q4 14 12 14 Q20 14 20 21), neural dot at crown (r=1, fill={color}).

    --- GROUP 3: SettingsScreen row icons (functional/UI icons, simple stroke-based SVG) ---

    ShieldIcon — shield outline (replaces 🔒/🔏). Path for shield shape (M12 3 L19 6 L19 12 Q19 17 12 21 Q5 17 5 12 L5 6 Z, fill="none"), small neural dot at top (r=1, fill={color}).

    ChartBarIcon — bar chart (replaces 📊 in SettingsScreen — same visual as GoalChartIcon; export const ChartBarIcon = GoalChartIcon).

    RulerIcon — ruler (replaces 📏). Diagonal Path for ruler body (M3 21 L21 3), short perpendicular tick Lines at even intervals along the ruler, neural dot at one end (r=1, fill={color}).

    ShareIcon — share/upload arrow (replaces 📤). Path for upward arrow from a base platform (M12 3 L12 15, M8 7 L12 3 L16 7, M5 17 L5 21 L19 21 L19 17), neural dots at arrowhead corners (r=1, fill={color}).

    TrashIcon — trash/delete (replaces 🗑). Rectangle Path for body (rx=1), horizontal Line for lid top, vertical Line for lid handle, 2 vertical Lines inside body for "slots", neural dot on lid (r=1, fill={color}).

    RefreshIcon — circular refresh arrows (replaces 🔄). Two arc Paths forming a circle with arrows at the ends, Circle neural dot at each arrow tip (r=1, fill={color}).

    StarIcon — 5-point star (replaces ⭐). Path for 5-point star outline (M12 2 L15.1 8.3 L22 9.3 L17 14.1 L18.2 21 L12 17.8 L5.8 21 L7 14.1 L2 9.3 L8.9 8.3 Z, fill="none"), neural dot at top point (r=1, fill={color}).
  </action>
  <verify>
    <automated>cd /Users/bekircemkusdemir/Downloads/vitalspan && grep -c "export function\|export const" src/components/DesignSystemIcons.tsx && npx tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - File src/components/DesignSystemIcons.tsx exists
    - grep "export function SearchIcon\|export const SearchIcon" src/components/DesignSystemIcons.tsx returns 1 result
    - grep "export function SuccessCheckIcon\|export const SuccessCheckIcon" returns 1 result
    - grep "export function PillIcon\|export const PillIcon" returns 1 result
    - grep "export function RunnerIcon\|export const RunnerIcon" returns 1 result
    - grep "export.*DnaIcon" returns at least 1 result
    - grep "export.*BellIcon" returns 1 result
    - grep "export.*DnaHelixIcon" returns 1 result
    - grep "export.*ClipboardIcon" returns 1 result
    - grep "export.*CameraIcon" returns 1 result
    - grep "export.*TargetIcon" returns 1 result
    - grep "export.*MicroscopeIcon" returns 1 result
    - grep "export.*WarningIcon" returns 1 result
    - grep "export.*PersonIcon" returns 1 result
    - grep "export.*ShieldIcon" returns 1 result
    - grep "export.*ChartBarIcon" returns 1 result
    - grep "export.*RulerIcon" returns 1 result
    - grep "export.*ShareIcon" returns 1 result
    - grep "export.*TrashIcon" returns 1 result
    - grep "export.*RefreshIcon" returns 1 result
    - grep "export.*StarIcon" returns 1 result
    - grep "export.*GoalTimerIcon" returns 1 result
    - grep "export.*GoalSparkIcon" returns 1 result
    - grep "export.*GoalDnaIcon" returns 1 result
    - grep "export.*GoalChartIcon" returns 1 result
    - grep "export.*CheckmarkIcon" returns 1 result
    - grep "import.*react-native-svg" src/components/DesignSystemIcons.tsx returns 1 result
    - tsc --noEmit exits 0
  </acceptance_criteria>
  <done>All ~25 SVG icon components exported from src/components/DesignSystemIcons.tsx; tsc passes</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| SVG primitives → react-native renderer | react-native-svg must be importable; wrong import path causes runtime blank |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-13-03 | Information Disclosure | SVG rendering — blank boxes on device | mitigate | tsc --noEmit catches import errors; EAS build in Plan 7 is final device verification |
| T-13-04 | Tampering | Icon file missing exports — Wave 3 screens import non-existent names | mitigate | acceptance_criteria checks each named export individually via grep |
</threat_model>

<verification>
After task completes:
1. Run: grep -c "export function\|export const" src/components/DesignSystemIcons.tsx
   Expected: ~25 (one per icon or alias)
2. Run: grep "react-native-svg" src/components/DesignSystemIcons.tsx
   Expected: import line present
3. Run: npx tsc --noEmit
   Expected: zero errors
</verification>

<success_criteria>
- src/components/DesignSystemIcons.tsx exists with all ~25 named icon exports
- All icons for ProtocolScreen, ProfileScreen, SettingsScreen, AboutScreen, BiomarkerDetailScreen, LabUploadScreen, DashboardScreen, and SupplementRow are covered
- Visual style matches TabIcons.tsx: stroke-based, neural-dot, strokeWidth 1.5
- tsc --noEmit exits 0
</success_criteria>

<output>
Create .planning/phases/13-ui-design-system/13-02-SUMMARY.md when done
</output>
