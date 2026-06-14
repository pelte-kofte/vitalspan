---
phase: 06-warm-ui-overhaul
fixed_at: 2026-05-31T00:00:00Z
review_path: .planning/phases/06-warm-ui-overhaul/06-REVIEW.md
iteration: 1
findings_in_scope: 9
fixed: 9
skipped: 0
status: all_fixed
---

# Phase 6: Code Review Fix Report

**Fixed at:** 2026-05-31  
**Source review:** `.planning/phases/06-warm-ui-overhaul/06-REVIEW.md`  
**Iteration:** 1

**Summary:**
- Findings in scope: 9 (CR-01, CR-02, WR-01 through WR-07)
- Fixed: 9
- Skipped: 0

## Fixed Issues

### CR-01: Non-null assertion crash — BiomarkerDetailScreen

**Files modified:** `src/screens/BiomarkerDetailScreen.tsx`  
**Commit:** 8d73135  
**Applied fix:** Replaced `BIOMARKERS.find(b => b.id === selectedId)!` with a guarded version. If the biomarker is not found (stale deep-link or deleted id), `setSelectedId(null)` is called to fall back to the list view and `null` is returned early. The subsequent code that accessed `bm.name`, `bm.optMin`, etc. is now unreachable unless `bm` is defined.

---

### CR-02: "Edit profile" navigates backward — SettingsScreen

**Files modified:** `src/screens/SettingsScreen.tsx`  
**Commit:** 91badbc  
**Applied fix:** Updated the subtitle on the "Edit profile" `SettingsRow` from `"Name, age, conditions"` to `"Go to Profile to edit"`. The `nav.goBack()` action already dismisses the Settings modal and returns the user to the Profile tab where they can tap Edit. The subtitle now sets the correct expectation.

---

### WR-01: useFocusEffect data-loader callbacks fragile — 4 screens

**Files modified:** `src/screens/ProtocolScreen.tsx`, `src/screens/BiomarkerDetailScreen.tsx`, `src/screens/ExerciseScreen.tsx`, `src/screens/ProfileScreen.tsx`  
**Commit:** 5ec060a  
**Applied fix:** Added `void` keyword before each async data-load call in the `useFocusEffect` callbacks on all four screens:
- `ProtocolScreen`: `{ void loadData(); }` (was `{ loadData().catch(console.error); }`)
- `BiomarkerDetailScreen`: `{ void loadEntries(); }` (was `{ loadEntries(); }`)
- `ExerciseScreen`: `{ void loadLogs(); }` (was `{ loadLogs(); }`)
- `ProfileScreen`: `{ void loadProfile(); }` (was `{ loadProfile(); }`)

The `void` operator makes the intent explicit — the Promise return value is intentionally discarded and the callback implicitly returns `undefined`, which is the correct contract for `useFocusEffect`.

---

### WR-02: insightCard always renders with optimalBg/optimalText — BiomarkerDetailScreen

**Files modified:** `src/screens/BiomarkerDetailScreen.tsx`  
**Commit:** d75d982  
**Applied fix:** Added dynamic `insightBg` and `insightTextColor` computed variables derived from the already-computed `status` variable (`'optimal'` → optimalBg/Text, `'suboptimal'` → reviewBg/Text, else → criticalBg/Text). The `insightCard` View and `insightTxt` Text now use inline style overrides `{ backgroundColor: insightBg }` and `{ color: insightTextColor }` respectively. The static `backgroundColor` and `color` values were removed from the `insightCard` and `insightTxt` stylesheet entries to avoid confusion.

---

### WR-03: Colors.textMuted divergence — theme/index.ts

**Files modified:** `src/theme/index.ts`  
**Commit:** 6b33bdb  
**Applied fix:** Added a four-line comment above `Colors.textMuted` documenting the intentional divergence: `Colors.textMuted` (`#8A8A82`) is used by dark-background screens and the tab bar, while `Colors.Beige.textMuted` (`#6B6B64`) is used by Phase 6 warm screens. The hex value was NOT changed per review instructions.

---

### WR-04: ProfileScreen.saveEdit has no error handling

**Files modified:** `src/screens/ProfileScreen.tsx`  
**Commit:** 047878b  
**Applied fix:** Wrapped the `AsyncStorage.setItem` call and the subsequent state updates (`setProfile`, `setEditing`, `Haptics`) in a `try/catch` block. On storage failure the catch block calls `Alert.alert('Save failed', 'Could not save your profile. Please try again.')`, leaving the UI in a consistent editing state so the user can retry.

---

### WR-05: SettingsScreen.handleClearData has no error handling

**Files modified:** `src/screens/SettingsScreen.tsx`  
**Commit:** 09658af  
**Applied fix:** Wrapped the `Promise.all(ALL_STORAGE_KEYS.map(k => AsyncStorage.removeItem(k)))` call and the subsequent `Haptics` + `nav.reset` calls in a `try/catch` block inside the destructive `onPress` handler. On failure the catch block calls `Alert.alert('Clear failed', 'Could not delete all data. Please try again.')`, preventing the partial-erase stuck-screen scenario.

---

### WR-06: navigate('Profile' as never) and navigate('Protocol' as never) — type-unsafe navigation

**Files modified:** `src/screens/ProtocolScreen.tsx`, `src/screens/ProfileScreen.tsx`, `src/navigation/AppNavigator.tsx`  
**Commit:** 40a63e6  
**Applied fix:**
1. Exported `MainTabParamList` from `AppNavigator.tsx` with all five tab screen names (`Home`, `Biomarkers`, `Protocol`, `Exercise`, `Profile`). Also typed the `Tab` navigator with `createBottomTabNavigator<MainTabParamList>()`.
2. Updated `ProtocolScreen` and `ProfileScreen` to use a `CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList>, NativeStackNavigationProp<RootStackParamList>>` type for `Nav`. This is the correct typing for tab screens that also need to access the stack navigator.
3. Replaced `nav.navigate('Profile' as never)` in `ProtocolScreen` and `nav.navigate('Protocol' as never)` in `ProfileScreen` with plain `nav.navigate('Profile')` and `nav.navigate('Protocol')` respectively — now type-safe without casts.

---

### WR-07: AboutScreen uses untyped useNavigation()

**Files modified:** `src/screens/AboutScreen.tsx`  
**Commit:** 6ae528e  
**Applied fix:**
1. Merged the duplicate `useNavigation` and `useFocusEffect` imports from two `@react-navigation/native` statements into one.
2. Added import for `NativeStackNavigationProp` from `@react-navigation/native-stack`.
3. Added import for `RootStackParamList` from `../navigation/AppNavigator`.
4. Declared `type Nav = NativeStackNavigationProp<RootStackParamList>`.
5. Changed `const nav = useNavigation()` to `const nav = useNavigation<Nav>()`.

---

## TypeScript Verification

`npx tsc --noEmit` run against all 8 fixed files with the project's tsconfig: **exit code 0 — no type errors.**

---

_Fixed: 2026-05-31_  
_Fixer: Claude (gsd-code-fixer)_  
_Iteration: 1_
