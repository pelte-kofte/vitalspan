---
phase: 09-phenoage-fix-and-release-quality
reviewed: 2026-06-02T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/lib/phenoAge.ts
  - src/lib/phenoAge.test.ts
  - src/lib/phenoAge.verify.ts
  - src/screens/DashboardScreen.tsx
  - src/screens/LongevityScoreScreen.tsx
  - src/components/FutureSelf.tsx
  - src/screens/ProfileScreen.tsx
findings:
  critical: 2
  warning: 4
  info: 4
  total: 10
status: issues_found
---

# Phase 09: Code Review Report

**Reviewed:** 2026-06-02T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Seven files reviewed covering the corrected Levine PhenoAge formula, two dev-tool scripts, and four UI screens. The formula implementation itself is numerically correct (verified against the Levine 2018 paper; NHANES median test case produces phenoAge ≈ 53 for a 50-year-old, within the expected ±7 range). The null-on-any-missing logic is clean and consistently applied.

Two blockers were found: `ProfileScreen` displays a biological age that is permanently stale because `phenoResult` is never written back to `@vitalspan_user_profile`; and `LongevityScoreScreen.loadAll` has no error handling, silently leaving state partially updated on any JSON corruption. Four warnings cover dead code in the formula, an unsafe type assertion, in-render component definition, and missing error surface in `loadAll`. Four info items cover unused animated values, a dead confidence union variant, and duplicated inline computation.

---

## Critical Issues

### CR-01: ProfileScreen biological age is permanently stale

**File:** `src/screens/ProfileScreen.tsx:138`

**Issue:** `yearsDiff` and the "Biological age" row both read from `profile.biologicalAge`, which is written only during onboarding and is never updated afterward. `DashboardScreen` and `LongevityScoreScreen` compute `phenoResult` live from logged biomarkers but never persist `phenoResult.biologicalAge` back to `@vitalspan_user_profile`. The result is that `ProfileScreen` will display the wrong biological age (or no age at all) for any user who adds or updates biomarkers after onboarding. The "X years younger biologically" hero pill is driven by this same stale value.

**Fix:** After computing `phenoResult` in `DashboardScreen.loadData` (or in a dedicated effect), write the result back:

```ts
// DashboardScreen.tsx — add after phenoResult is computed in useMemo or effect
useEffect(() => {
  if (!phenoResult || phenoResult.biologicalAge == null || !profile) return;
  const updated = { ...profile, biologicalAge: phenoResult.biologicalAge };
  AsyncStorage.setItem('@vitalspan_user_profile', JSON.stringify(updated)).catch(
    (e) => console.error('[bioAge sync]', e),
  );
}, [phenoResult?.biologicalAge, profile]);
```

Alternatively, compute PhenoAge directly in `ProfileScreen.loadProfile` from the stored biomarker entries, as both sibling screens already do.

---

### CR-02: `LongevityScoreScreen.loadAll` silently corrupts UI state on parse failure

**File:** `src/screens/LongevityScoreScreen.tsx:125–136`

**Issue:** `loadAll` runs three `JSON.parse` calls sequentially with no try/catch. If any stored key contains corrupted JSON (partial write, storage migration, OS truncation), `JSON.parse` throws synchronously, bubbling past the later `setHealthData` / `setBiomarkerEntries` calls. The first state setter that already ran is not rolled back, leaving the component in a half-updated state. The error is caught only at `.catch(console.error)` at the call site, with no user feedback. On subsequent focus events the same corrupted state is loaded again.

Compare: `DashboardScreen.loadData` wraps the entire load in a try/catch and shows an `Alert` — `loadAll` is missing this protection.

**Fix:**

```ts
const loadAll = useCallback(async () => {
  try {
    const [pRaw, hRaw, bRaw, perms] = await Promise.all([
      AsyncStorage.getItem('@vitalspan_user_profile'),
      AsyncStorage.getItem('@vitalspan_health_data'),
      AsyncStorage.getItem('@vitalspan_biomarkers'),
      loadPermissionStatus(),
    ]);
    if (pRaw) setProfile(JSON.parse(pRaw));
    if (hRaw) setHealthData(JSON.parse(hRaw));
    if (bRaw) setBiomarkerEntries(JSON.parse(bRaw));
    setIsConnected(perms?.granted ?? false);
  } catch (e) {
    console.error('[LongevityScore loadAll]', e);
    Alert.alert(
      'Data error',
      'Some saved data could not be read. If this persists, use Settings → Clear all data.',
    );
  }
}, []);
```

---

## Warnings

### WR-01: Dead `innerLog <= 0` guard — unreachable code path

**File:** `src/lib/phenoAge.ts:153–163`

**Issue:** After clamping `mortProb` to `[0.0001, 0.9999]`, `clampedProb` is always in `(0, 1)`. Therefore `1 - clampedProb` is always in `(0, 1)`, `Math.log(1 - clampedProb)` is always negative, and `innerLog = -0.00553 × (negative)` is always positive. The guard `if (innerLog <= 0)` can never be true after the clamping step on line 152, making the entire block dead code. This is confirmed numerically: `innerLog` evaluates to `≈5.5×10⁻⁷` at the low extreme and `≈0.051` at the high extreme — both positive.

The dead branch also returns `biologicalAge: null` with `confidence: 'insufficient'` and `missingCount: 0` and an empty `missingBiomarkers` array, which is an internally contradictory result (`insufficient` with nothing missing).

**Fix:** Remove the unreachable guard after the clamp:

```ts
const clampedProb = Math.max(0.0001, Math.min(0.9999, mortProb));
// innerLog is guaranteed positive after clamping — no guard needed
const innerLog = -0.00553 * Math.log(1 - clampedProb);
const phenoAge = 141.50225 + Math.log(innerLog) / 0.090165;
```

---

### WR-02: `as Record<string, number>` type assertion bypasses strict null safety

**File:** `src/screens/DashboardScreen.tsx:141` and `src/screens/LongevityScoreScreen.tsx:210`

**Issue:** Both screens use an identical pattern to populate `PhenoAgeInputs`:

```ts
(inputs as Record<string, number>)[inputKey] = entry.value;
```

The cast to `Record<string, number>` discards TypeScript's knowledge that `PhenoAgeInputs[inputKey]` accepts `number | undefined`. It also masks any future key-name mismatch between `PHENO_AGE_BIOMARKER_MAP` values and `PhenoAgeInputs` fields. If a map value is ever changed or if `entry.value` is unexpectedly `null` at runtime (e.g. from a Supabase row returning `null` for a missing column), the assertion prevents the compiler from catching it, and a `null` lands inside a field declared as `number | undefined`, which then passes the `val == null` guard in `computePhenoAge` and contributes a numeric `null` to the `xb` sum (producing `NaN`).

The project's coding rules state TypeScript strict — no `any`; this assertion effectively violates that spirit.

**Fix:** Assign through the proper field name directly, or use a typed helper:

```ts
for (const [biomarkerId, inputKey] of Object.entries(PHENO_AGE_BIOMARKER_MAP)) {
  const entry = entryMap.get(biomarkerId);
  if (entry != null && entry.value != null) {
    inputs[inputKey] = entry.value; // inputKey is keyof Omit<PhenoAgeInputs, 'age'>
  }
}
```

`PHENO_AGE_BIOMARKER_MAP` is typed as `Record<string, keyof Omit<PhenoAgeInputs, 'age'>>`, so `inputs[inputKey]` is valid without a cast.

---

### WR-03: Modal components defined inside the render function

**File:** `src/screens/LongevityScoreScreen.tsx:274` and `src/screens/LongevityScoreScreen.tsx:333`

**Issue:** `ExplainerModal` and `TransparencyModal` are arrow-function components declared inside the body of `LongevityScoreScreen`. On every re-render of the parent (state changes, focus events, haptic callbacks), React sees completely new component type references, unmounts the old modal tree, and mounts a fresh one. While these modals carry no internal state today, the pattern has two concrete consequences: (1) animated entrance transitions defined inside the modals would reset on every parent re-render; (2) any future state added to those modals (scroll position, text input) would be lost. The root cause is that function identity changes per render when components are defined inline.

**Fix:** Hoist both components to the module level, passing the minimal props they need:

```ts
// Outside LongevityScoreScreen
interface ExplainerModalProps {
  visible: boolean;
  onClose: () => void;
  onConnectHealth: () => void;
  nav: Nav;
}
function ExplainerModal({ visible, onClose, onConnectHealth, nav }: ExplainerModalProps) { ... }
```

---

### WR-04: `ringProgress` animated value is written but never read

**File:** `src/components/FutureSelf.tsx:101–108`

**Issue:** `ringProgress` is a `useSharedValue` initialized to `CIRC`. In the `useEffect`, it is animated toward `dashOffset` via `withDelay(400, withTiming(...))`. However, `ringProgress` is never referenced in any `useAnimatedStyle` or passed to any SVG prop. The SVG `strokeDashoffset` prop on line 231 reads the static JavaScript value `dashOffset` directly, not `ringProgress.value`. The intended animation (a progressive ring draw-on) does not execute in the UI. The repeat animation on `ringGlow` (lines 111–119) has the same problem — it is computed but never consumed in any animated style.

**Fix:** Either wire the shared values into animated styles:

```ts
const ringStyle = useAnimatedStyle(() => ({
  // Can't directly animate SVG strokeDashoffset via Reanimated; 
  // use a workaround: drive opacity of the ring circle
  opacity: interpolate(ringProgress.value, [CIRC, dashOffset], [0, 1]),
}));
```

Or remove the dead animated values if the intent was a static ring:

```ts
// Remove: ringProgress, ringGlow, their useEffects, and the associated useSharedValue calls
```

---

## Info

### IN-01: `PhenoAgeResult.confidence` union type includes unreturnable variants

**File:** `src/lib/phenoAge.ts:28`

**Issue:** The `confidence` field is typed as `'high' | 'medium' | 'low' | 'insufficient'`. The implementation only ever returns `'high'` (all 9 biomarkers present and valid) or `'insufficient'` (any missing/invalid). `'medium'` and `'low'` are never returned. Any downstream `switch` or conditional on `confidence` that handles `'medium'` or `'low'` branches is dead code.

**Fix:** Narrow the union to reflect what the function actually produces:

```ts
export interface PhenoAgeResult {
  confidence: 'high' | 'insufficient';
  // ...
}
```

If partial-input confidence tiers are planned for a future iteration, document that explicitly with a `TODO`.

---

### IN-02: `loggedBiomarkerIds.filter(...)` computed twice inline in FutureSelf

**File:** `src/components/FutureSelf.tsx:174–176`

**Issue:** The expression `loggedBiomarkerIds.filter(id => PHENO_BIOMARKER_LIST.some(b => b.id === id)).length` is evaluated twice in adjacent lines of JSX — once for the conditional render guard and once for the arithmetic inside the note text. This is an O(n²) filter-over-every-logged-id pattern computed twice per render, though with at most 9 items in `PHENO_BIOMARKER_LIST` it has no runtime impact. It is a readability and maintenance issue.

**Fix:** Compute once above the JSX:

```ts
const loggedPhenoIds = loggedBiomarkerIds.filter(
  id => PHENO_BIOMARKER_LIST.some(b => b.id === id),
);
const loggedPhenoCount = loggedPhenoIds.length;
const remainingCount = PHENO_BIOMARKER_LIST.length - loggedPhenoCount;
```

---

### IN-03: `loadAll` in `LongevityScoreScreen` duplicates the `entryMap` computation already done in `phenoResult` memo

**File:** `src/screens/LongevityScoreScreen.tsx:243–250`

**Issue:** Lines 243–250 build `entryMap` from `biomarkerEntries` (latest-per-biomarker dedup), and lines 200–213 build an identical anonymous map inside the `phenoResult` memo. The same O(n) dedup pass runs twice per render cycle.

**Fix:** Extract a single `entryMap` memo and share it between `phenoResult` and the transparency checklist:

```ts
const entryMap = React.useMemo(() => {
  const m = new Map<string, StoredEntry>();
  for (const e of biomarkerEntries) {
    const ex = m.get(e.biomarkerId);
    if (!ex || e.date > ex.date) m.set(e.biomarkerId, e);
  }
  return m;
}, [biomarkerEntries]);
```

---

### IN-04: `phenoAge.test.ts` top-level code executes at import time

**File:** `src/lib/phenoAge.test.ts:22–96`

**Issue:** `computePhenoAge(...)` is called at the module's top level (lines 22–33, 39, 45, etc.), outside any function. This means the test cases execute the moment the file is imported. While this is intentional for a `ts-node` CLI script, it also means any accidental `import` of this file from app code (or from a bundler that picks it up during tree-shaking) would run all assertions at startup and call `process.exit`. The file has no export guard or `if (require.main === module)` check.

**Fix:** Wrap execution in a main-check guard:

```ts
if (require.main === module) {
  // all test code here
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}
```

Or restructure as a function `runTests()` called explicitly. The same applies to `phenoAge.verify.ts`.

---

_Reviewed: 2026-06-02T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
