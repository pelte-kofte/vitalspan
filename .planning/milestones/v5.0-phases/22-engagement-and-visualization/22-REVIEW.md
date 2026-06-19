# Phase 22 Code Review

**Depth:** Standard
**Reviewed:** 2026-06-18
**Files:** 7
**Findings:** 1 Critical, 3 Warning, 3 Info

---

## Summary

Phase 22 delivered streak tracking (22-01), a BiomarkerDetail trend chart with SVG range-band overlay and premium gate (22-02), and advisor dose bucketing via `supplementDetails` (22-03). The streak logic and dose-bucketing logic are structurally sound. However, one critical bug was found in `advisorContext.ts`: the internal `StoredEntry` type declares `type: string` instead of `biomarkerId: string`, which causes every biomarker lookup to silently resolve `undefined`, making `biomarkerStatusList` and the `biologicalAge` computation always return empty/null. This bug predates Phase 22 but must be fixed before the Advisor feature ships.

---

## Findings

### CRITICAL

#### CR-01: `advisorContext.ts` internal `StoredEntry.type` field name mismatch — all biomarker context silently empty

**File:** `src/lib/advisorContext.ts:53-56` and `:174-176`

**Issue:**
The internal `StoredEntry` interface at line 53 declares `type: string` as the field used to key biomarker entries. However, the actual persisted data written by `BiomarkerEntryScreen.tsx` (line 118) stores entries with field name `biomarkerId`, not `type`. The `latestEntries` map at line 174 builds entries using `entry.type`, which will always be `undefined` at runtime because no entry has a `type` field. As a result:

1. `latestEntries` is always an empty map (or keyed on `undefined`).
2. `biomarkerStatusList` is always `[]` — the advisor receives no biomarker statuses.
3. `phenoInputs` is never populated from stored data — `biologicalAge` is always `null`.
4. The `PHENO_AGE_BIOMARKER_MAP` lookups at line 194 always miss because the map is empty.

This is a silent failure — no error is thrown, `assembleAdvisorContext` returns a context that looks plausible but contains no actual health data. The test suite does not cover biomarker-status assembly, so no test catches this.

**Evidence:** `BiomarkerEntryScreen.tsx:39-46` defines `StoredEntry` with `biomarkerId: string`. `advisorContext.ts:55` declares `type: string`. `ArticlesScreen.tsx:18` and `articleService.ts:21` both correctly use `biomarkerId`.

**Fix:**
```typescript
// src/lib/advisorContext.ts line 53-59 — change:
interface StoredEntry {
  id: string;
  type: string;   // WRONG — actual field name is biomarkerId
  value: number;
  unit: string;
  date: string;
}

// To:
interface StoredEntry {
  id: string;
  biomarkerId: string;  // matches BiomarkerEntryScreen.tsx StoredEntry
  value: number;
  date: string;
  source: string;
  notes: string;
}
```

Then update all usages of `entry.type` to `entry.biomarkerId`:
```typescript
// lines 174-176:
const existing = latestEntries.get(entry.biomarkerId);
if (!existing || entry.date > existing.date) {
  latestEntries.set(entry.biomarkerId, entry);
}
```

---

### WARNING

#### WR-01: Streak evaluation uses `visibleItemIds` but single-dose check includes only `s.id`, not legacy `doseId(s.name, 0)` — inconsistency with `singleTaken` display logic

**File:** `src/screens/ProtocolScreen.tsx:605-619` vs `:966-967`

**Issue:**
The streak evaluation at line 610 generates the ID for a single-dose supplement as `s.id`. The `singleTaken` display check at line 966-967 accepts **either** `item.id` **or** `doseId(item.name, 0)` for the same item. This means if a user's `taken[]` array ever contains `doseId(item.name, 0)` instead of `item.id` (e.g., from a multi-dose item that was later edited to a single dose), the streak evaluator will classify the day as "not completed" even though the UI shows the item as taken. The streak will incorrectly reset.

The direct source of `doseId(item.name, 0)` in `taken[]` for single-dose items is the toggle at line 985, which only ever stores `item.id`. So this is currently latent, but the display's defensive OR creates a maintenance trap — if toggle logic ever changes, the streak logic will silently disagree.

**Fix:** Align the streak's ID generation to exactly mirror the toggle logic (use `s.id` for single-dose, which is what the toggle writes). Remove the `|| protocol.taken.includes(doseId(item.name, 0))` fallback from `singleTaken` or document explicitly why it exists, so a future developer does not extend it in a way that diverges from the streak evaluator.

---

#### WR-02: `setSelectedId(null)` called during render in `BiomarkerDetailScreen` — React state-update-during-render anti-pattern

**File:** `src/screens/BiomarkerDetailScreen.tsx:135-138`

**Issue:**
When `selectedId` is set but `biomarkers` is still loading (empty array), `biomarkers.find(...)` returns `undefined` and `setSelectedId(null)` is called synchronously inside the render function. This is a React violation: calling a state setter during render triggers a "Cannot update during an existing state transition" warning in development, may loop if `biomarkers` stays empty, and can cause unpredictable behavior under React 18 concurrent rendering. The most common real scenario: user navigates to `BiomarkerDetail` via deep link with a `biomarkerId`, the component mounts with `biomarkers: []` (before `getBiomarkers()` resolves), hits this code path, calls `setSelectedId(null)`, and drops back to the list — even though the biomarker exists and would load in milliseconds.

This bug predates Phase 22 but Phase 22 added the detail view's time-window filter, making this view more likely to be a deep-link entry point.

**Fix:**
```typescript
// Replace the state-setter-in-render with a useEffect guard:
if (selectedId) {
  const bm = biomarkers.find(b => b.id === selectedId);
  if (!bm) {
    // Biomarkers not yet loaded OR stale ID — show loading state, not null
    if (biomarkers.length > 0) {
      // Biomarkers loaded but ID not found: fall back to list safely via effect
      // (cannot call setSelectedId here — it's inside render)
    }
    return null; // safe early return without state mutation
  }
  // ...rest of detail view
}
```

Proper fix via `useEffect`:
```typescript
useEffect(() => {
  if (selectedId && biomarkers.length > 0 && !biomarkers.find(b => b.id === selectedId)) {
    setSelectedId(null);
  }
}, [selectedId, biomarkers]);
```

---

#### WR-03: Streak state not preserved in old-schema migration path — streak resets on first post-migration load

**File:** `src/screens/ProtocolScreen.tsx:127-134`

**Issue:**
The `migrateProtocol` function's old-schema branch (the `if ('addedSupplements' in parsed)` path at line 103) returns a new `ProtocolState` without `currentStreak`, `bestStreak`, or `lastCompleteDate` fields. This is fine for genuinely old data (users who never had a streak), but the problem is timing: if a user has already been using Phase 22 for some days building a streak, then another code path that re-triggers the old-schema branch would wipe their streak. While this is unlikely given Phase 22 migrates immediately on first load (line 585-587), if migration write fails silently (`.catch(console.error)` swallows the error at line 586), the next app launch re-runs migration and loses the streak.

**Fix:** Add streak fields to the old-schema migration return value by reading them from `parsed` if present:
```typescript
return {
  supplements: [...convertedDb, ...convertedCustom],
  medTimes: (parsed.medTimes as Record<string, TimeSlot>) ?? {},
  hiddenMeds: [],
  taken: [],
  takenDate: '',
  // Preserve any streak data if it somehow exists on old schema
  currentStreak: (parsed.currentStreak as number | undefined),
  bestStreak: (parsed.bestStreak as number | undefined),
  lastCompleteDate: (parsed.lastCompleteDate as string | undefined),
};
```

---

### INFO

#### IN-01: `advisorContext.ts` test suite does not cover biomarker status assembly

**File:** `src/__tests__/advisorContext.test.ts`

**Issue:**
All six tests exclusively cover `supplementDetails` dose bucketing. There is no test that seeds `@vitalspan_biomarkers` in `mockStorage` and asserts that `ctx.biomarkers` is populated with correct status values, nor any test for `biologicalAge` computation. The critical bug in CR-01 was not caught by tests precisely because biomarker assembly is entirely untested. Given the PII-sensitivity of this module (it's the privacy boundary before data leaves the device), this test gap is significant.

**Fix:** Add test cases that seed biomarker entries in `mockStorage['@vitalspan_biomarkers']` and assert on `ctx.biomarkers` shape and `ctx.biologicalAge`.

---

#### IN-02: `src/__mocks__/theme.ts` incomplete — missing `Colors` tokens used by tested dependencies

**File:** `src/__mocks__/theme.ts`

**Issue:**
The mock exports only 8 color tokens. The `supplementTimings.ts` module (which `advisorContext.ts` imports transitively) uses `Colors` from theme; if `supplementTimings.ts` or any future imported module references tokens not in the mock (e.g., `Colors.warning`, `Colors.danger`, `Colors.textSecondary`), tests will fail with `undefined` values being used in comparisons. The mock is currently sufficient for passing tests, but it is fragile.

**Fix:** Either import the real theme (if it has no React Native dependencies) or expand the mock to cover all tokens exported from `src/theme/index.ts`. Add a comment enumerating which tokens are intentionally omitted and why.

---

#### IN-03: Magic numbers in chart Y-coordinate math not tied to `react-native-chart-kit` documented layout

**File:** `src/screens/BiomarkerDetailScreen.tsx:25-27, 277-285`

**Issue:**
`CHART_TOP_PAD = 16` and `CHART_BOTTOM_PAD = 32` are used to calculate SVG overlay coordinates that must exactly match the internal layout of `react-native-chart-kit`'s `LineChart`. These values are not derived from the library's documented API — they are empirically determined magic numbers. If the library version is upgraded and internal padding changes, the SVG range band will silently misalign with the plotted line without any compile-time or runtime error.

**Fix:** Add a comment citing the specific chart-kit version these constants were calibrated against and link to the relevant chart-kit source or issue. Consider adding a development-only assertion that the computed yTop/yBot values remain within `[0, CHART_HEIGHT]` bounds.

---

## Verdict

PASS_WITH_NOTES

**CR-01 FIXED** (commit `5a95cef`): `StoredEntry.type` → `StoredEntry.biomarkerId` in local interface + both usages; TypeScript clean, 8/8 tests pass.

**Open warnings (WR-01–03) and info notes (IN-01–03) are not blockers** — WR-02 predates Phase 22, WR-01 is currently latent, and WR-03 is a low-probability edge case. Tracked for follow-up.
