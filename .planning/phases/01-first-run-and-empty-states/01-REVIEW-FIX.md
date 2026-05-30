---
phase: 01-first-run-and-empty-states
fixed_at: 2026-05-25T00:00:00Z
review_path: .planning/phases/01-first-run-and-empty-states/01-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 11
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-05-25
**Source review:** .planning/phases/01-first-run-and-empty-states/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 11 (CR-01 through CR-04, WR-01 through WR-07)
- Fixed: 11 (WR-07 covered by the same change as CR-04)
- Skipped: 0

## Fixed Issues

### CR-01: HbA1c mmol/mol conversion factor inverted

**Files modified:** `src/screens/BiomarkerEntryScreen.tsx`
**Commit:** 9ca813c
**Applied fix:** Changed `Math.round(val * conv.factor * 100) / 100` to `Math.round((val / conv.factor) * 100) / 100` on line 33. Also updated the inline comment on the `hba1c` entry (line 26) to read "mmol/mol = % × 10.929 (divide mmol/mol by factor to get %)" to clarify the conversion direction.

---

### CR-02: BiomarkerDetailScreen not reading route.params when opened as stack route

**Files modified:** `src/screens/BiomarkerDetailScreen.tsx`, `src/navigation/AppNavigator.tsx`
**Commit:** 417c82e
**Applied fix:** Added `useRoute` and `RouteProp` to the import in `BiomarkerDetailScreen.tsx`. Initialised `selectedId` state from `route.params?.biomarkerId ?? null` so the stack route pre-selects the correct biomarker. Made `biomarkerId` optional in `RootStackParamList` (`{ biomarkerId?: string }`) so TypeScript stays valid when the same component is mounted as a tab (no params).

---

### CR-03: `const __DEV__ = true` hardcoded in SettingsScreen

**Files modified:** `src/screens/SettingsScreen.tsx`
**Commit:** e647ccc
**Applied fix:** Deleted the `const __DEV__ = true;` line entirely. The Metro-injected global `__DEV__` is now used, which is `true` in dev/Expo Go and `false` in production builds.

---

### CR-04: `@vitalspan_exercise_log` missing from ALL_STORAGE_KEYS (also covers WR-07)

**Files modified:** `src/screens/SettingsScreen.tsx`
**Commit:** 7c0420d
**Applied fix:** Added `'@vitalspan_exercise_log', // exercise history` as the 8th entry in `ALL_STORAGE_KEYS`. This fixes both "Clear all data" (CR-04) and "Export my data" (WR-07) in one change.

---

### WR-01: Zero biomarker values accepted in BiomarkerEntryScreen

**Files modified:** `src/screens/BiomarkerEntryScreen.tsx`
**Commit:** fcd6e71
**Applied fix:** Changed `rawVal >= 0` to `rawVal > 0` on line 71 so a value of exactly `0` is rejected, matching the `parsed <= 0` guard already in GuidedFirstRunScreen.

---

### WR-02: Debug console.log runs in production

**Files modified:** `src/screens/DashboardScreen.tsx`
**Commit:** 0f1822f
**Applied fix:** Wrapped `console.log('[Dashboard] phenoAge entryMap keys:', ...)` in `if (__DEV__) { ... }` so it only executes in development builds.

---

### WR-03: Unguarded JSON.parse / no user feedback on storage corruption

**Files modified:** `src/screens/DashboardScreen.tsx`
**Commit:** 5b7b337
**Applied fix:** Added `Alert` to the react-native import. Replaced `console.error(e)` in `loadData`'s catch block with `console.error('[loadData] parse error', e)` plus `Alert.alert('Data error', 'Some saved data could not be read. If this persists, use Settings → Clear all data to reset.')`. The `JSON.parse` sites in `BiomarkerEntryScreen` (line 98) and `GuidedFirstRunScreen` (line 50) were already guarded with `raw ? JSON.parse(raw) : []` ternaries — no changes needed there.

---

### WR-04: Double-tap race condition in GuidedFirstRunScreen CTA

**Files modified:** `src/screens/GuidedFirstRunScreen.tsx`
**Commit:** 8cd3375
**Applied fix:** Added `const [saving, setSaving] = useState(false)` state. Both `handleStepAdvance` and `handleFinish` now start with `if (saving) return; setSaving(true);` and call `setSaving(false)` in their error paths. The CTA `TouchableOpacity` now has `disabled={saving}` and `activeOpacity={saving ? 1 : 0.82}`, and the button label shows `'Saving…'` while in-flight.

---

### WR-05: Dashboard biomarker empty state hidden after first-run skip

**Files modified:** `src/screens/DashboardScreen.tsx`
**Commit:** 7101671
**Applied fix:** Simplified the ternary from `entries.length === 0 && !firstRunComplete ? ... : entries.length > 0 ? ... : null` to `entries.length === 0 ? ... : ...`. The empty state CTA now renders for any user with zero entries, regardless of whether they completed or skipped the guided first-run flow.

---

### WR-06: Type-unsafe `as never` navigation casts

**Files modified:** `src/screens/DashboardScreen.tsx`
**Commit:** d1691fa
**Applied fix:** Removed both `as never` casts from `nav.navigate('Main' as never)` calls (exercise card onPress and protocol empty-state CTA). `'Main'` is already a valid key in `RootStackParamList` (`Main: undefined`) so no cast is required.

---

### WR-07: Export data omits `@vitalspan_exercise_log`

**Files modified:** `src/screens/SettingsScreen.tsx`
**Commit:** 7c0420d (same commit as CR-04)
**Applied fix:** Covered by the CR-04 fix — adding `'@vitalspan_exercise_log'` to `ALL_STORAGE_KEYS` fixes both the clear-data and export-data paths.

---

## Skipped Issues

None — all in-scope findings were fixed.

---

_Fixed: 2026-05-25_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
