---
phase: 11-supplement-and-drug-database
fixed_at: 2026-06-05T00:00:00Z
review_path: .planning/phases/11-supplement-and-drug-database/11-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 11: Code Review Fix Report

**Fixed at:** 2026-06-05
**Source review:** `.planning/phases/11-supplement-and-drug-database/11-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (CR-01, CR-02, CR-03, WR-01, WR-02, WR-03, WR-04, WR-05)
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CR-01: Interaction checker fails to match for all supplements added via chip UI

**Files modified:** `src/screens/InteractionCheckerScreen.tsx`
**Commit:** d174287
**Applied fix:** Replaced the `Array.includes()` exact-match lookup with bidirectional substring matching. The new matcher checks `nameA.includes(drugKey) || drugKey.includes(nameA)` in both directions for both drug and supplement slots, so long-form names like `"NMN (Nicotinamide Mononucleotide)"` correctly match the `"NMN"` key in INTERACTIONS. This resolves all 10 silently-missed pairs documented in the review, including the patient-safety cases (Vitamin K2 + Warfarin, Omega-3 + Warfarin).

---

### CR-02: SupplementLibrarySection-added supplements silently vanish from "Your Stack"

**Files modified:** `src/screens/ProtocolScreen.tsx`
**Commit:** 6f8c6c0
**Applied fix:** Changed `addedSupps` from a filter of the 7-entry `recommended` list to a map over all `protocol.addedSupplements`. Each entry is now resolved against `SUPPLEMENT_DATABASE` for display info (dose, evidenceGrade); entries not found in the DB fall back to dose `'—'` and grade `C` so they always render. Also fixed `BASE_SUPPLEMENTS[1].name` from `'Magnesium glycinate'` to `'Magnesium Glycinate'` to match the canonical DB name and resolve the case-mismatch toggle bug.

---

### CR-03: `melatonin` (category `'sleep'`) is permanently invisible in SupplementLibrarySection

**Files modified:** `src/components/SupplementLibrarySection.tsx`
**Commit:** 100ba8a
**Applied fix:** Added `'sleep'` to `CAT_ORDER` between `'cardiovascular'` and `'prescription_only'`. The `grouped` memo now includes the sleep category so Melatonin (and any future sleep-category entries) are rendered in the library.

---

### WR-01: `autoPopulate` in InteractionCheckerScreen swallows `JSON.parse` exceptions

**Files modified:** `src/screens/InteractionCheckerScreen.tsx`
**Commit:** 1592c08 (committed together with WR-03)
**Applied fix:** Wrapped the entire autoPopulate body in a try/catch. The `finally` block always sets `hasPopulatedRef.current = true` regardless of success or failure, preventing infinite silent retry loops on corrupted storage. Errors are logged to console.

---

### WR-02: `loadData` in ProtocolScreen has no error boundary

**Files modified:** `src/screens/ProtocolScreen.tsx`
**Commit:** 68eceaf
**Applied fix:** Wrapped the entire `loadData` async body in a try/catch. The catch block logs the error with `console.error('ProtocolScreen loadData failed:', e)` so the failure is visible in dev tools. Previously the exception was silently swallowed by `void loadData()` in `useFocusEffect`.

---

### WR-03: `autoPopulated` flag is never reset — stale drug list after profile changes

**Files modified:** `src/screens/InteractionCheckerScreen.tsx`
**Commit:** 1592c08 (committed together with WR-01)
**Applied fix:** Replaced `autoPopulated` state with `hasPopulatedRef = useRef(false)`. The ref is reset to `false` at the top of the `useFocusEffect` callback (i.e. on every focus event), so the drug/supplement list is re-populated whenever the user returns from Profile after changing their medications. The `useFocusEffect` dependency array is now `[]` so it runs fresh on every focus without causing extra re-renders. Also removed the redundant `(b: string)` annotation on `brandNames.some()` as part of this refactor.

---

### WR-04: `RxNavInteraction` interface is dead code and structurally incorrect

**Files modified:** `src/services/rxnav.ts`
**Commit:** b0610b0
**Applied fix:** Replaced the incorrect `RxNavInteraction` interface (which described a shape that did not match what `fetchInteractions` actually accesses) with `RxNavInteractionPair`, whose shape matches the actual `inter.interactionConcept[n].minConceptItem` access path used in the implementation. The interface is exported in case consumers want to type-check against the API response.

---

### WR-05: `pruneExpiredCache` is exported but never called — AsyncStorage cache grows unboundedly

**Files modified:** `App.tsx`
**Commit:** 322d711
**Applied fix:** Added `import { pruneExpiredCache } from './src/services/rxnav'` and called `pruneExpiredCache().catch(() => null)` inside the `init()` function at app startup. This runs once per app launch, removing cache entries older than 30 days before any drug lookups occur. The `.catch(() => null)` ensures a storage read error does not block the startup flow.

---

## Skipped Issues

None — all 8 in-scope findings were fixed successfully.

---

_Fixed: 2026-06-05_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
