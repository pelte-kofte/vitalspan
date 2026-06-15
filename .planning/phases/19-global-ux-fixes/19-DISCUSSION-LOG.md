# Phase 19 Discussion Log

**Date:** 2026-06-15
**Phase:** 19 — Global UX Fixes
**Duration:** Single session

---

## Areas Discussed

### 1. Sleep CTA Tap Behavior
**Question:** When Sleep orbital is tapped and HealthKit IS connected but has <3 nights data — what should happen?

**Options presented:**
- Simple modal: "Open Health app, sleep 3 nights, return here"
- Quick sleep log modal (hours only)
- Connect Health (same as disconnected state)

**Selection:** Simple modal: "Open Health app, sleep 3 nights, return here"

**Notes:** No biomarker for sleep hours exists in the app's clinical lab system. In-app sleep entry would be new scope. Info modal is the clean, zero-scope-creep path.

---

### 2. HRV/Fitness CTA Pattern
**Question:** What UI pattern for the "Apple Watch required" message when HRV or Fitness orbital is tapped?

**Options presented:**
- Reuse same info modal pattern (like Sleep)
- Inline Alert (simpler, no custom UI)
- Scroll to existing Connect Health card

**Selection:** Reuse same info modal pattern (like Sleep)

**Notes:** One `OrbitalInfoModal` component covers all 3 empty orbital types (Sleep, HRV, Fitness) with configurable title/body/CTA. Consistent UX.

---

### 3. Movement Today Contrast Fix
**Question:** exerciseCard background is light green (#E8F5EE), subtitle is muted grey (#8A8A82) — fails AA contrast. Which fix?

**Options presented:**
- White background (like other action cards)
- Keep green, darken subtitle to textPrimary
- Keep green, subtitle to onSurface (#1C1C1E)

**Selection:** White background (like other action cards)

**Notes:** Makes Movement Today visually consistent with Upload lab results, Longevity Research, and AI Advisor cards. RunnerIcon (`Colors.onSurface`) still signals the exercise category.

---

### 4. Dynamic Island Audit Scope
**Question:** ExerciseDetailScreen clearly needs SafeAreaView. Scope for other custom-header screens?

**Options presented:**
- Audit all custom-header screens, fix anything broken
- ExerciseDetailScreen only (as written)
- ExerciseDetailScreen + any screen without SafeAreaView

**Selection:** Audit all custom-header screens, fix anything broken

**Notes:** Screens to audit: ExerciseDetailScreen, SettingsScreen, AboutScreen, ProtocolScreen, BiomarkerDetailScreen. LabUploadScreen and BiomarkerEntryScreen already correct.

---

## Claude's Discretion Items

- `OrbitalInfoModal` component location: `src/components/OrbitalInfoModal.tsx` — follows existing component naming and folder structure.
- Keyboard dismiss on overlay tap in ProtocolScreen modal: `TouchableWithoutFeedback` on overlay + `onStartShouldSetResponder` on inner sheet — standard RN pattern.
- `useSafeAreaInsets` (not `SafeAreaView` wrapper) for the custom-header fix — preserves the existing root View structure.
- Section comment renumbering in ExerciseDetailScreen after muscle diagram removal: planner's discretion.

---

## Deferred Ideas

None surfaced during discussion.
