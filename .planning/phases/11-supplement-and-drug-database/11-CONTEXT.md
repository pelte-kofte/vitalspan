# Phase 11: Supplement & Drug Database - Context

**Gathered:** 2026-06-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Three connected workstreams:

1. **Supplement library expansion** — Grow `supplementTimings.ts` from ~25 to ~50 evidence-graded longevity supplements. Add `mechanismOfAction` and `longevityRelevance` fields to `SupplementInfo`. Add `rxLabel` field for custom Rx badge text. New entries include: Urolithin A, Spermidine, Luteolin, Pterostilbene, Astaxanthin, Iodine, Lithium orotate (microdose), Melatonin, Rhodiola, Lion's Mane, Bacopa, CBD, Artichoke extract, Milk thistle, Boron, Chromium, B12, Folate, B6, Vitamin C, Vitamin E, Iron, Collagen, Hyaluronic acid, Alpha-GPC, Phosphatidylserine, DHEA, Pregnenolone — plus Rapamycin and Metformin as prescription-only entries in `supplementTimings.ts` using `category: 'prescription_only'`.

2. **Drug class library** — Add the 5 longevity-relevant drug classes (Ibuprofen/NSAIDs, Aspirin, Statins, Levothyroxine, Metformin) as `SupplementInfo` entries in `supplementTimings.ts` with `category: 'prescription_only'`. These appear in both the ProtocolScreen library section (browsable) and as chips in InteractionChecker.

3. **Protocol screen library + interaction checker upgrade** — Add a categorized, searchable "Supplement Library" section to ProtocolScreen showing all ~50 supplements grouped by category (NAD+ Pathway, Mitochondrial, Senolytics, Adaptogens, Vitamins/Minerals, Prescription). Upgrade InteractionChecker to auto-populate from the user's saved ProtocolState on open. Expand the INTERACTIONS data to 50–80 pairs (up from ~20) covering the full longevity stack. Expand the "Safe combos" tab to ~10–15 synergistic pairs.

No new packages required. No new navigation routes or tabs. No new AsyncStorage keys beyond what already exists.

</domain>

<decisions>
## Implementation Decisions

### Data Model — SupplementInfo

- **D-01:** Add two new optional fields to `SupplementInfo` in `supplementTimings.ts`:
  - `mechanismOfAction?: string` — one sentence on HOW the supplement works
  - `longevityRelevance?: string` — one sentence on WHY it matters for longevity
  - Existing `shortDescription` remains and continues to serve as the primary display line (one-line summary). `mechanismOfAction` and `longevityRelevance` are shown in expanded detail view.

- **D-02:** Add `rxLabel?: string` field to `SupplementInfo` for custom Rx badge text (e.g., `'Rx Only'`, `'Off-label (longevity)'`). The existing `prescriptionOnly: true` + `rxNote` fields remain and serve their current purpose. `rxLabel` is the visual badge string displayed in the UI.

- **D-03:** Prescription-only items (Rapamycin, Metformin, and drug classes) behave identically to OTC supplements in the UI — they can be added to the user's protocol, browsed in the library, and checked in the interaction checker. The only difference is a visual Rx badge rendered using `rxLabel`. No functional restriction on adding Rx items.

### Supplement Database Expansion

- **D-04:** Expand `SUPPLEMENT_DATABASE` in `supplementTimings.ts` to ~50 entries. Existing ~25 entries are retained as-is (only adding `mechanismOfAction` and `longevityRelevance` fields where relevant). New entries to add: Urolithin A, Spermidine, Rapamycin, Luteolin, Pterostilbene, Astaxanthin, Iodine, Lithium orotate (microdose), Melatonin, Rhodiola rosea, Lion's Mane (Hericium erinaceus), Bacopa monnieri, CBD (Cannabidiol), Artichoke extract, Milk thistle (Silymarin), Boron, Chromium, Methylcobalamin (B12), Methylfolate (B9), Pyridoxal-5-phosphate (B6), Vitamin C (Ascorbic acid), Vitamin E (Tocotrienol complex), Iron bisglycinate, Collagen peptides, Hyaluronic acid, Alpha-GPC, Phosphatidylserine, DHEA, Pregnenolone. Note: Metformin already appears in the drug class list (D-05) — add as `prescriptionOnly: true`.

- **D-05:** Add 5 drug class entries to `supplementTimings.ts` under `category: 'prescription_only'`:
  - NSAIDs (Ibuprofen class) — mechanism: COX-1/COX-2 inhibition
  - Aspirin — mechanism: irreversible COX-1 acetylation + antiplatelet
  - Statins — mechanism: HMG-CoA reductase inhibition
  - Levothyroxine — mechanism: synthetic T4 thyroid hormone replacement
  - Metformin — mechanism: AMPK activation, Complex I inhibition

### Protocol Screen — Supplement Library Section

- **D-06:** Add a "Supplement Library" section to ProtocolScreen below the user's active protocol. Layout: categorized list with a search bar at the top. Categories: NAD+ Pathway, Mitochondrial, Senolytics, Adaptogens/Nootropics, Vitamins & Minerals, Prescription/Rx. Each row shows: name + evidence grade badge + shortDescription. Tap expands inline (or opens a detail modal) showing dose, timing, mechanismOfAction, longevityRelevance, and an "Add to protocol" button. Drug class entries shown in a separate "Drug Classes" subsection within the same library view.

- **D-07:** The existing `BASE_SUPPLEMENTS` and `GOAL_SUPPLEMENTS` arrays in ProtocolScreen continue to function as the user's personal protocol. The new Library section is purely a reference/discovery layer — it does NOT replace the existing protocol recommendation logic.

### Interaction Checker — Stack Integration

- **D-08:** InteractionChecker auto-populates on open from two sources:
  1. `ProtocolState.addedSupplements` → supplement names → pre-filled as `type: 'supp'` items
  2. `UserProfile.medications` → medication names → resolved to drug class via `MedicationEntry.category` in `medications.ts` → pre-filled as `type: 'drug'` items
  - User can still add/remove items after auto-population.

- **D-09:** Medication → drug class resolution: look up each medication name in `MEDICATION_DATABASE` by `genericName` (case-insensitive). Use `MedicationEntry.category` to map to the class name used in `INTERACTIONS`. Mapping table (category → INTERACTIONS drug name): `'statin'` → `'Statin'`, `'nsaid'` → `'Ibuprofen'`, `'thyroid'` → `'Levothyroxine'`, `'diabetes'` → `'Metformin'`, `'anticoagulant'` → `'Warfarin'`. Unrecognized medications fall back to the raw medication name (exact-match behavior).

- **D-10:** The `SUPPLEMENTS` constant in `InteractionCheckerScreen.tsx` (currently hardcoded to 8 supplement names) is replaced with chip list derived from `SUPPLEMENT_DATABASE` names. Since ~50 chips won't fit in a flat chip row, group chips by category with expandable category headers, or show top-20 most clinically relevant supplements as chips with a "+ More" option.

### Interaction Pairs Expansion

- **D-11:** Expand `INTERACTIONS` array in `biomarkers.ts` from ~20 to 50–80 total pairs. Research agent generates candidates from peer-reviewed literature (Stockley's Drug Interactions, PubMed, NIH); pharmacist user reviews all proposed pairs before they are committed. Each pair must have: `id`, `drug`, `supplement`, `severity` (`'high' | 'moderate' | 'low' | 'beneficial'`), `title`, `body`, `recommendation`. Every `recommendation` field is mandatory — no flag without a "what to do" instruction.

- **D-12:** Expand the "Safe combos" tab from 4 to ~10–15 entries. Research agent proposes synergistic longevity pairs (e.g., Urolithin A + NMN, Spermidine + autophagy-supporting supplements, NMN + Apigenin for CD38 inhibition). Pharmacist reviews and approves final list.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Supplement & Drug Data
- `src/data/supplementTimings.ts` — `SUPPLEMENT_DATABASE` (existing ~25 entries), `SupplementInfo` interface. Phase 11 adds ~25 new entries and 3 new optional fields. Read this FIRST to understand current structure before adding.
- `src/data/medications.ts` — `MEDICATION_DATABASE` (200 drugs), `MedicationEntry` type with `category` field. Used for medication → drug class resolution (D-09).
- `src/data/biomarkers.ts` lines ~968–end — `INTERACTIONS` array (existing ~20 pairs). Phase 11 expands to 50–80 pairs. Read this before adding new interaction entries.

### Interaction Checker Screen
- `src/screens/InteractionCheckerScreen.tsx` — Existing full-featured interaction checker. Phase 11: (1) replace hardcoded `SUPPLEMENTS` const with `SUPPLEMENT_DATABASE`-derived chips, (2) add auto-population from ProtocolState + UserProfile on mount, (3) expand `SAFE_COMBOS` to ~15 entries.

### Protocol Screen
- `src/screens/ProtocolScreen.tsx` — Existing protocol screen with `BASE_SUPPLEMENTS`, `GOAL_SUPPLEMENTS`, and `ProtocolState` management. Phase 11 adds a "Supplement Library" section. Read the existing `ProtocolState` shape and `addedSupplements` array before implementing auto-populate logic.

### Theme & Patterns
- `src/theme/index.ts` — All color tokens. New library section must use `Colors.*` exclusively.
- `.planning/phases/10-apple-health-and-articles/10-CONTEXT.md` D-12 area — Service pattern: data logic in `src/data/` or `src/lib/`, screens import. Follow for any new data service functions.
- `.planning/phases/04-supabase-foundation/04-CONTEXT.md` — Supabase singleton pattern (if any Supabase writes needed for supplement sync in future, follow this pattern).

### Planning
- `.planning/ROADMAP.md` §Phase 11 — Requirements SUPP-01–SUPP-04 and success criteria (authoritative scope reference).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SupplementInfo` interface in `supplementTimings.ts` — already has `prescriptionOnly?: boolean` and `rxNote?: string`. Adding `mechanismOfAction?`, `longevityRelevance?`, and `rxLabel?` fields is additive and backward-compatible (all optional).
- `SEVERITY_CONFIG` in `InteractionCheckerScreen.tsx` — existing severity → color/label map. Works as-is for new interaction pairs.
- `MedicationSearch` component (`src/components/MedicationSearch.tsx`) — already imported in InteractionChecker for drug search. Reuse for auto-populate fallback UI.
- `SUPPLEMENT_DATABASE` already has `category` field with values including `'nad'`, `'mitochondrial'`, `'cardiovascular'`, `'senolytic'`, `'adaptogen'`, `'amino_acid'`, `'prescription_only'`. These become the grouping categories for the new Library section.

### Established Patterns
- StyleSheet named `s` at bottom of every file; all colors from `Colors.*`; no hardcoded hex values.
- `AsyncStorage` key `@vitalspan_protocol` stores `ProtocolState` including `addedSupplements: string[]`. Auto-populate reads this key.
- `AsyncStorage` key `@vitalspan_user_profile` stores `UserProfile` including `medications: string[]`. Auto-populate reads this key.
- Evidence grade badges (`'A' | 'B' | 'C'`) already exist in `SupplementInfo.evidenceGrade` — reuse in Library section display.

### Integration Points
- `InteractionCheckerScreen.tsx` → reads `INTERACTIONS` from `biomarkers.ts` and `SUPPLEMENT_DATABASE` (currently not imported — needs to be added). Auto-populate: `useFocusEffect` or `useEffect on mount` to load ProtocolState + UserProfile from AsyncStorage.
- `ProtocolScreen.tsx` → already imports `SUPPLEMENT_DATABASE`. New Library section renders from `SUPPLEMENT_DATABASE` filtered/grouped by `category`. No new imports needed.
- `AppNavigator.tsx` → No changes required. InteractionChecker is already a stack modal. ProtocolScreen is already a tab.

</code_context>

<specifics>
## Specific Ideas

- The user (a licensed pharmacist) specified the exact supplement list for the library. The researcher must generate `mechanismOfAction`, `longevityRelevance`, and interaction pair data based on published literature (Stockley's Drug Interactions, Medscape, PubMed). All proposed interaction pairs are marked as "pharmacist review required" before committing to `biomarkers.ts`.
- For the InteractionChecker chip overflow (D-10): grouping chips by category with expandable sections is preferred over a flat "+ More" button. The existing `category` field in `SupplementInfo` drives this grouping.
- The ROADMAP success criteria specifically names 8 supplements in SC-1 (Urolithin A, NMN, NR, Spermidine, Fisetin, Quercetin, Rapamycin, Metformin). The user expanded this to ~50 during discussion. The 8 are the minimum; the full database is the actual deliverable.
- Rapamycin: `rxLabel: 'Off-label (longevity)'`. Metformin as longevity agent: `rxLabel: 'Off-label (longevity)'`. Standard drug classes: `rxLabel: 'Rx Only'`.
- Spermidine note for researcher: naturally present in wheat germ, aged cheese. Supplement form ~1–5mg/day. Evidence grade B. Key mechanism: autophagy induction via inhibition of EP300 acetyltransferase.
- Urolithin A note for researcher: gut microbiome metabolite of ellagic acid (pomegranate). Mitophagy enhancer. Evidence grade B (human trials 2022). Available as Mitopure supplement (Timeline brand).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 11-Supplement & Drug Database*
*Context gathered: 2026-06-04*
