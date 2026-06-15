# Phase 19: Global UX Fixes - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix 6 cross-screen UX bugs found post-v4.0 in a single build: (1) keyboard overlaps inputs in ProtocolScreen custom supplement modal and AI Advisor chat, (2) Dynamic Island clips the ExerciseDetailScreen header and any other custom-header screens missing inset handling, (3) Dashboard "Movement Today" card has low-contrast subtitle text, (4) LongevityScore orbital cards for Sleep/HRV/Fitness have no onPress handler, (5) ExerciseDetailScreen muscle diagram removed. No new features — correctness and polish only.

</domain>

<decisions>
## Implementation Decisions

### D-01: Keyboard Overlap — Protocol AddCustomSupplementModal
- Wrap the modal sheet content in `KeyboardAvoidingView` (`behavior="padding"` on iOS, `undefined` on Android).
- Add `keyboardShouldPersistTaps="handled"` to any `ScrollView` inside the modal so taps on options don't dismiss keyboard unexpectedly.
- Tap on the overlay background (outside the sheet) should call `Keyboard.dismiss()` then `onClose()`.
- `AIAdvisorScreen` already has `KeyboardAvoidingView` — smoke-test only; do not restructure unless the test reveals a real regression.

### D-02: Dynamic Island / Safe Area — Audit Scope
- Audit **all** screens with custom headers: `ExerciseDetailScreen`, `SettingsScreen`, `AboutScreen`, `ProtocolScreen`, `BiomarkerDetailScreen`.
- `LabUploadScreen` and `BiomarkerEntryScreen` already use `SafeAreaView` — skip.
- Fix pattern: import `useSafeAreaInsets` from `react-native-safe-area-context`; add `paddingTop: insets.top` to the custom header `View` style (dynamic style, not StyleSheet — the value changes per device). Do NOT wrap the entire screen in `SafeAreaView` — the screens already have a root `View` with `flex: 1`.

### D-03: Dashboard "Movement Today" Contrast
- Change `exerciseCard` `backgroundColor` from `Colors.status.optimalBg` to `Colors.bgCard` (white).
- All other text and icon colors remain unchanged (`Colors.textPrimary` for title, `Colors.textMuted` for subtitle, `Colors.onSurface` for RunnerIcon).
- Result: Movement Today visually matches "Upload lab results", "Longevity Research", and "AI Advisor" cards.

### D-04: LongevityScore Orbital CTA — onPress Handlers
There are two orbital surfaces to fix: the floating `dataOrb` Views (around the sphere) and the `metricCell` Views in the metric grid below.

**Routing logic per metric:**
- **Inflammation / Glucose**: Already have `onPress` routing to `BiomarkerEntry` — leave unchanged.
- **Sleep** (CTA: "Connect Health"):
  - If `permissionState === 'pre-request'` → call `handleRequestPermission()`.
  - If `permissionState === 'granted'` but no sleep data (val == null) → show `OrbitalInfoModal` with message: "Open Apple Health, record sleep for at least 3 nights, then return here to see your score." Dismiss button only. No in-app sleep entry.
  - If `permissionState === 'denied'` → call `handleOpenSettings()`.
- **HRV / Fitness** (CTA: "Connect below" / "Connect Health"):
  - If `permissionState === 'pre-request'` → call `handleRequestPermission()`.
  - If `permissionState === 'granted'` but no data → show `OrbitalInfoModal` with message: "HRV and VO₂ max require Apple Watch paired to this iPhone. Ensure your Watch syncs with the Health app, then tap Resync below." + "Connect Health" button that calls `handleRequestPermission()`.
  - If `permissionState === 'denied'` → show same modal with `handleOpenSettings()` as the button action.

**OrbitalInfoModal component**: A single new small component (`src/components/OrbitalInfoModal.tsx`). Props: `visible`, `title`, `body`, `ctaLabel` (optional, defaults to "Got it"), `onCta` (optional), `onDismiss`. Styled consistently with the existing `ExplainerModal` in `LongevityScoreScreen`.

**Recovery / already-with-data orbitals**: If `val != null`, no onPress needed — leave as static display.

### D-05: Muscle Diagram Removal — ExerciseDetailScreen
- Remove the `{/* 2. Muscle Map */}` section (MuscleMapView card + MUSCLES label).
- Remove `import MuscleMapView from '../components/MuscleMapView'`.
- Remove `const [muscleView, setMuscleView] = useState<'front' | 'back'>('front')` state.
- The section numbering in comments (1. Illustration, 3. Metadata chips, etc.) can be renumbered or left as-is — planner's discretion.
- `MuscleMapView.tsx` itself is NOT deleted — it may be used elsewhere; just remove the import and usage from `ExerciseDetailScreen`.

### D-06: Keyboard Dismiss — Tap-Outside Behavior
- In `ProtocolScreen.AddCustomSupplementModal`: the overlay `View` at `ms.overlay` should become a `TouchableWithoutFeedback` that calls `Keyboard.dismiss()` on press. The inner sheet `View` should call `e.stopPropagation()` equivalent (`onStartShouldSetResponder={() => true}`).
- For screens with `ScrollView`, add `keyboardShouldPersistTaps="handled"` — allows tapping list items inside ScrollView without dismissing keyboard, while still dismissing on empty areas.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Screens Being Modified
- `src/screens/ProtocolScreen.tsx` — `AddCustomSupplementModal` (lines ~132–285); custom header (line ~570)
- `src/screens/AIAdvisorScreen.tsx` — existing `KeyboardAvoidingView` wrapper (line 104)
- `src/screens/ExerciseDetailScreen.tsx` — custom header (line ~79), MuscleMapView section (lines ~109–118), `muscleView` state (line 35)
- `src/screens/LongevityScoreScreen.tsx` — `METRIC_EMPTY` config (lines 71–78), `dataOrb` rendering (lines ~645–665), metric grid (lines ~687–710), `handleRequestPermission()` (line ~341), `handleOpenSettings()` (line ~362), `permissionState` (line 274)
- `src/screens/DashboardScreen.tsx` — `exerciseCard` StyleSheet entry (line ~696)
- `src/screens/SettingsScreen.tsx`, `src/screens/AboutScreen.tsx`, `src/screens/BiomarkerDetailScreen.tsx` — audit for missing `useSafeAreaInsets`

### Theme & Design System
- `src/theme/index.ts` — color tokens: `Colors.bgCard` (#FFFFFF), `Colors.status.optimalBg` (#E8F5EE), `Colors.textMuted` (#8A8A82), `Colors.textPrimary` (#1A1A18)

### Component to Create
- `src/components/OrbitalInfoModal.tsx` — new component; model after the existing `ExplainerModal` inline in `LongevityScoreScreen.tsx` (lines ~123–175) for style consistency

### Existing Patterns
- `src/screens/BiomarkerEntryScreen.tsx` — correct SafeAreaView pattern (line 136: `<SafeAreaView style={s.safe}>`)
- `src/screens/LabUploadScreen.tsx` — SafeAreaView wrapping custom header (correct reference)

No external specs or ADRs — all decisions captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LongevityScoreScreen.handleRequestPermission()` — triggers HealthKit permission flow + syncs data. Call this from orbital onPress instead of duplicating the logic.
- `LongevityScoreScreen.handleOpenSettings()` — opens iOS Settings app. Use for denied-state orbital taps.
- `LongevityScoreScreen.ExplainerModal` (inline component, lines ~123–175) — style reference for new `OrbitalInfoModal`. Match backdrop, sheet, typography.
- `METRIC_EMPTY` config object (lines 71–78) — already defines per-metric `reason` and `cta` strings; can be extended with `title`/`body` fields if the planner prefers.

### Established Patterns
- `useSafeAreaInsets` from `react-native-safe-area-context` — already imported in several screens; use `paddingTop: insets.top` on custom header `View`.
- `KeyboardAvoidingView` + `Platform.OS === 'ios' ? 'padding' : undefined` — standard pattern already used in `AIAdvisorScreen`; replicate in `ProtocolScreen` modal.
- `StyleSheet` at bottom of every file, named `s` (or `ms` for modal styles in ProtocolScreen) — follow existing convention.

### Integration Points
- `LongevityScoreScreen` orbital onPress needs `permissionState` in scope — `permissionState` is already a state variable, so orbital handlers defined inside the component have closure access.
- `AddCustomSupplementModal` is a separate function component within `ProtocolScreen.tsx` — `KeyboardAvoidingView` goes inside its JSX return, not in the parent `ProtocolScreen`.

</code_context>

<specifics>
## Specific Ideas

- **Sleep info modal body**: "Open Apple Health, record sleep for at least 3 nights, then return here to see your score." — one "Got it" dismiss button.
- **HRV/Fitness info modal body**: "HRV and VO₂ max require Apple Watch paired to this iPhone. Ensure your Watch syncs with the Health app, then tap Resync below." — "Connect Health" action button (calls `handleRequestPermission()` or `handleOpenSettings()` depending on `permissionState`).
- **Movement Today**: switch `exerciseCard.backgroundColor` to `Colors.bgCard` only. No other style changes.
- **Muscle diagram**: hard delete of section 2 only. `MuscleMapView` component file stays in `src/components/`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 19-Global UX Fixes*
*Context gathered: 2026-06-15*
