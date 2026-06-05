---
phase: 11-supplement-and-drug-database
reviewed: 2026-06-05T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/components/SupplementLibrarySection.tsx
  - src/data/biomarkers.ts
  - src/data/supplementTimings.ts
  - src/screens/InteractionCheckerScreen.tsx
  - src/screens/ProtocolScreen.tsx
findings:
  critical: 3
  warning: 5
  info: 4
  total: 12
status: partial_fix
fixed:
  - CR-01
  - CR-02
  - CR-03
  - WR-01
  - WR-02
  - WR-03
  - WR-04
  - WR-05
open:
  - IN-01
  - IN-02
  - IN-03
  - IN-04
fixed_at: 2026-06-05T00:00:00Z
---

# Phase 11: Code Review Report

**Reviewed:** 2026-06-05
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Phase 11 expanded the supplement and drug database significantly (SUPPLEMENT_DATABASE grew to ~70 entries, INTERACTIONS to ~50 entries) and added SupplementLibrarySection as a browsable UI. The data quality is high — pharmacist-verified interactions, well-sourced evidence grades, appropriate contraindication flags.

Three critical bugs were found that silently fail to surface safety information: (1) the interaction checker uses exact Array element matching so supplements added via the library chip UI never match their INTERACTIONS entries; (2) supplements added via SupplementLibrarySection never appear in "Your Stack" on ProtocolScreen because name strings differ between the two registries; (3) `melatonin` is entirely invisible in SupplementLibrarySection because its `sleep` category is missing from `CAT_ORDER`. All three produce silent data loss with no error or user feedback.

---

## Critical Issues

### CR-01: Interaction checker fails to match for all supplements added via chip UI

**File:** `src/screens/InteractionCheckerScreen.tsx:169`

**Issue:** The interaction lookup uses `Array.includes()` for exact element equality:

```typescript
const key = [inter.drug.toLowerCase(), inter.supplement.toLowerCase()];
return key.includes(item.name.toLowerCase()) && key.includes(item2.name.toLowerCase());
```

`key` is a 2-element array. `Array.includes()` checks for strict equality, not substring containment. When a user adds a supplement from the chip list (which calls `addItem(supp.name, 'supp')` with the full `SUPPLEMENT_DATABASE` name), the stored name is the long-form name from the database (e.g. `"NMN (Nicotinamide Mononucleotide)"`), but `INTERACTIONS` stores the short form (`"NMN"`). The lookup fails silently — no interaction is shown — even though one exists.

Confirmed failing pairs (supplement DB name vs INTERACTIONS name):
- `"NMN (Nicotinamide Mononucleotide)"` vs `"NMN"` → missed: NMN + Metformin, NMN + Rapamycin
- `"Omega-3 (EPA + DHA)"` vs `"Omega-3"` → missed: Omega-3 + Warfarin, Omega-3 + Aspirin
- `"CoQ10 (Ubiquinol)"` vs `"CoQ10"` → missed: CoQ10 + Statin, CoQ10 + Warfarin
- `"Vitamin D3"` vs `"Vitamin D"` → missed: Vitamin D + Thiazide
- `"Trans-Resveratrol"` vs `"Resveratrol"` → missed: Resveratrol + Warfarin
- `"Curcumin (with Piperine or Liposomal)"` vs `"Curcumin"` → missed: Curcumin + Warfarin
- `"Magnesium Glycinate"` vs `"Magnesium"` → missed: Magnesium + Levothyroxine
- `"Creatine Monohydrate"` vs `"Creatine"` → missed: Creatine + NSAIDs
- `"Vitamin C (Ascorbic Acid)"` vs `"Vitamin C"` → missed: Vitamin C + Warfarin
- `"Vitamin K2 (MK-7)"` vs `"Vitamin K2"` → missed: Vitamin K2 + Warfarin (HIGH severity)

This is a patient-safety issue: high-severity interactions (Vitamin K2 + Warfarin, Omega-3 + Warfarin) are silently suppressed.

**Fix:** Change the matcher to use substring matching in both directions:

```typescript
const interaction = INTERACTIONS.find(inter => {
  const drugKey = inter.drug.toLowerCase();
  const suppKey = inter.supplement.toLowerCase();
  const nameA = item.name.toLowerCase();
  const nameB = item2.name.toLowerCase();
  const matchA = (nameA.includes(drugKey) || drugKey.includes(nameA)) &&
                 (nameB.includes(suppKey) || suppKey.includes(nameB));
  const matchB = (nameA.includes(suppKey) || suppKey.includes(nameA)) &&
                 (nameB.includes(drugKey) || drugKey.includes(nameB));
  return matchA || matchB;
});
```

Or, the cleaner long-term fix: normalize `INTERACTIONS` supplement names to exactly match `SUPPLEMENT_DATABASE` names, and have `SUPPLEMENT_DATABASE` serve as the canonical name registry.

---

### CR-02: SupplementLibrarySection-added supplements silently vanish from "Your Stack"

**File:** `src/screens/ProtocolScreen.tsx:504`

**Issue:** `addedSupps` is computed by filtering the hard-coded `recommended` list (7 items) against `protocol.addedSupplements`:

```typescript
const addedSupps = recommended.filter(s => protocol.addedSupplements.includes(s.name));
```

When a user taps "+ Add to protocol" in `SupplementLibrarySection`, `onToggle` calls `toggleSupplement(info.name)` which saves the full DB name (e.g. `"Urolithin A"`) to `protocol.addedSupplements`. But `recommended` only contains 7 items with short names (`"NMN"`, `"Resveratrol"`, etc.). Any supplement from the library that is not in `recommended` — which is the majority of the ~70-item library — is stored in `addedSupplements` but never surfaces in the "Your Stack" UI section, never shown in the progress counter, and never shown in a checkoff row.

Additionally there is a name-case mismatch even within the recommended set: `BASE_SUPPLEMENTS` has `'Magnesium glycinate'` (lowercase `g`) while `SUPPLEMENT_DATABASE` has `'Magnesium Glycinate'` (capital `G`). A user adding from the library gets `'Magnesium Glycinate'` stored, and `recommended.filter(s => protocol.addedSupplements.includes('Magnesium glycinate'))` returns false.

**Fix:** "Your Stack" must render all `protocol.addedSupplements` entries, not only those in the `recommended` list. Resolve display info (dose, evidence) by looking up each name against `SUPPLEMENT_DATABASE`:

```typescript
const addedSupps = protocol.addedSupplements.map(name => {
  const dbEntry = SUPPLEMENT_DATABASE.find(
    s => s.name.toLowerCase() === name.toLowerCase()
  );
  return dbEntry
    ? { name: dbEntry.name, dose: dbEntry.defaultDose, evidence: dbEntry.evidenceGrade, dbId: dbEntry.id }
    : { name, dose: '—', evidence: 'C' as const, dbId: undefined };
});
```

Also normalize `BASE_SUPPLEMENTS[1].name` from `'Magnesium glycinate'` to `'Magnesium Glycinate'` to match the DB.

---

### CR-03: `melatonin` (category `'sleep'`) is permanently invisible in SupplementLibrarySection

**File:** `src/components/SupplementLibrarySection.tsx:9`

**Issue:** `CAT_ORDER` does not include `'sleep'`:

```typescript
const CAT_ORDER: SupplementInfo['category'][] = [
  'nad', 'mitochondrial', 'senolytic', 'adaptogen', 'nootropic',
  'vitamin', 'mineral', 'antioxidant', 'amino_acid', 'metabolic',
  'cardiovascular', 'prescription_only',
  // 'sleep' is missing
];
```

The `grouped` memo iterates only over `CAT_ORDER`:

```typescript
for (const cat of CAT_ORDER) {
  const items = filtered.filter(s => s.category === cat);
  if (items.length) map.set(cat, items);
}
```

`melatonin` (the only `category: 'sleep'` entry in the DB) is therefore never rendered. The supplement is completely unreachable from the library, despite being in the database with full mechanismOfAction and longevityRelevance data. `CAT_LABELS` already has the `sleep: 'Sleep'` entry, confirming this was intended.

**Fix:**

```typescript
const CAT_ORDER: SupplementInfo['category'][] = [
  'nad', 'mitochondrial', 'senolytic', 'adaptogen', 'nootropic',
  'vitamin', 'mineral', 'antioxidant', 'amino_acid', 'metabolic',
  'cardiovascular', 'sleep', 'prescription_only',
];
```

---

## Warnings

### WR-01: `autoPopulate` in InteractionCheckerScreen swallows `JSON.parse` exceptions

**File:** `src/screens/InteractionCheckerScreen.tsx:86`

**Issue:** `autoPopulate` calls `JSON.parse(protocolRaw)` and `JSON.parse(profileRaw)` with no try/catch. If either value in AsyncStorage is corrupted, the unhandled exception propagates out of the `async function autoPopulate()`, is swallowed by `void autoPopulate()`, and `setAutoPopulated(true)` is never called. The function will retry on every focus event, silently failing each time.

**Fix:**

```typescript
async function autoPopulate() {
  try {
    const [protocolRaw, profileRaw] = await Promise.all([...]);
    // ... existing logic
    setAutoPopulated(true);
  } catch {
    setAutoPopulated(true); // prevent infinite retry on bad storage
  }
}
```

---

### WR-02: `loadData` in ProtocolScreen has no error boundary; corrupted storage crashes silently

**File:** `src/screens/ProtocolScreen.tsx:338`

**Issue:** `loadData` calls `JSON.parse(profileRaw)` and `JSON.parse(protocolRaw)` without try/catch. It is invoked via `void loadData()` in `useFocusEffect`, so any thrown exception is silently discarded. If the stored protocol or profile JSON is malformed, the screen renders with stale/empty state and the user has no feedback. `handleRefresh` wraps it in `.catch(console.error)` but the focus-triggered load does not.

**Fix:**

```typescript
const loadData = useCallback(async () => {
  try {
    const [profileRaw, protocolRaw] = await Promise.all([...]);
    if (profileRaw) setProfile(JSON.parse(profileRaw));
    if (protocolRaw) {
      // ... existing spread
    }
  } catch (e) {
    console.error('ProtocolScreen loadData failed:', e);
    // Optionally: show an Alert or reset to EMPTY_PROTOCOL
  }
}, []);
```

---

### WR-03: `autoPopulated` flag is never reset — stale drug list after profile changes

**File:** `src/screens/InteractionCheckerScreen.tsx:82`

**Issue:** `autoPopulated` is set to `true` on first run and never reset. If the user navigates away, updates their medications in the Profile screen, then returns to InteractionChecker, the auto-population logic skips because `if (autoPopulated) return`. The drug list shown is stale. The `useFocusEffect` dependency `[autoPopulated]` means once true, the effect becomes a no-op.

**Fix:** Remove `autoPopulated` from the dependency array and instead track populated state using a `useRef` that is reset on focus:

```typescript
const hasPopulatedRef = useRef(false);
useFocusEffect(useCallback(() => {
  hasPopulatedRef.current = false; // reset on each focus
  let active = true;
  async function autoPopulate() {
    if (hasPopulatedRef.current) return;
    // ... populate logic
    hasPopulatedRef.current = true;
  }
  void autoPopulate();
  return () => { active = false; };
}, [])); // empty dep array — runs fresh on every focus
```

---

### WR-04: `RxNavInteraction` interface is dead code and structurally incorrect

**File:** `src/services/rxnav.ts:11`

**Issue:** The exported `RxNavInteraction` interface is never used anywhere in the codebase. More critically, it describes a shape that does not match what `fetchInteractions` actually accesses from the API response. The interface defines `interactionConcept[].interactionItem` but the implementation accesses `inter.interactionConcept?.[1]?.minConceptItem`. The mismatch means if anyone tried to use the interface for type-checking, they would get incorrect types.

**Fix:** Remove the unused `RxNavInteraction` interface, or correct it to match the actual API shape consumed by `fetchInteractions`. The correct inner access path for the NLM RxNav API is:

```typescript
// Actual structure used:
interface RxNavInteractionPair {
  interactionConcept: Array<{
    minConceptItem: { rxcui: string; name: string };
    sourceDisclaimer?: string;
  }>;
  description: string;
  severity: string;
}
```

---

### WR-05: `pruneExpiredCache` is exported but never called — AsyncStorage cache grows unboundedly

**File:** `src/services/rxnav.ts:167`

**Issue:** Every `fetchRxCUI` call reads and writes the entire cache object from AsyncStorage. Since `pruneExpiredCache` is never invoked, the cache accumulates entries for every drug name ever looked up, with no upper bound. Over time this causes increasingly slow serialization on every interaction check and risks hitting AsyncStorage storage limits (typically 6 MB on iOS).

**Fix:** Call `pruneExpiredCache()` at app startup (e.g. in `App.tsx`):

```typescript
// In App.tsx or a startup hook:
import { pruneExpiredCache } from './src/services/rxnav';
useEffect(() => { void pruneExpiredCache(); }, []);
```

---

## Info

### IN-01: `Spacing.sm + 2` magic arithmetic in StyleSheet

**File:** `src/components/SupplementLibrarySection.tsx:115`

**Issue:** `paddingVertical: Spacing.sm + 2` uses arithmetic on a theme token. Per project conventions, all spacing comes from `Spacing.*` tokens without modification. This hardcodes `2` as a magic number.

**Fix:** Add a dedicated spacing token (e.g. `Spacing.smPlus`) or use the nearest available token.

---

### IN-02: Hardcoded `'rgba(0,0,0,0.5)'` and `'#000'` color values

**File:** `src/screens/ProtocolScreen.tsx:896`, `src/screens/InteractionCheckerScreen.tsx:383,410,434,449`

**Issue:** Per CLAUDE.md, all colors must come from `src/theme/index.ts`. `'rgba(0,0,0,0.5)'` (modal overlay) and `'#000'` (shadow color) are hardcoded. There are 5 total instances across the two files.

**Fix:** Add `Colors.shadowBlack = '#000'` and `Colors.modalOverlay = 'rgba(0,0,0,0.5)'` to the theme, then reference them.

---

### IN-03: Both screens exceed the 200-line component limit

**File:** `src/screens/ProtocolScreen.tsx` (952 lines), `src/screens/InteractionCheckerScreen.tsx` (478 lines)

**Issue:** CLAUDE.md specifies "Components max 200 lines — split if longer." `ProtocolScreen` contains three embedded components (`AddCustomSupplementModal`, `AddSupplementSheet`, and the main screen), each of which is itself over 200 lines. `InteractionCheckerScreen` is 478 lines.

**Fix:** Extract `AddCustomSupplementModal` and `AddSupplementSheet` into `src/components/AddCustomSupplementModal.tsx` and `src/components/AddSupplementSheet.tsx` respectively.

---

### IN-04: `b: string` type annotation on `brandNames.some()` is redundant under strict mode

**File:** `src/screens/InteractionCheckerScreen.tsx:107`

**Issue:** `m.brandNames.some((b: string) => ...)` — if `MEDICATION_DATABASE` is typed (which it is, via `MedicationEntry`), the `b: string` annotation is redundant and suggests the type was unknown at point of writing.

**Fix:** Remove the inline annotation: `m.brandNames.some(b => b.toLowerCase() === medName.toLowerCase())`.

---

_Reviewed: 2026-06-05_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
