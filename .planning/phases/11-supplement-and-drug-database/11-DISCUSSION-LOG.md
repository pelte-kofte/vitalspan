# Phase 11: Supplement & Drug Database - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-04
**Phase:** 11-supplement-and-drug-database
**Areas discussed:** Data model, Drug class library, Stack integration, Interaction pairs

---

## Data model

### Q1: shortDescription vs longevityRelevance field

| Option | Description | Selected |
|--------|-------------|----------|
| shortDescription is enough | No interface change. Just make sure the 3 new supplements have strong shortDescriptions. | ✓ (initial) |
| Add longevityRelevance field | Explicit field. Requires adding to all 25+ existing SupplementInfo entries. | (initial) |
| You decide | Claude picks | |

**User's choice:** "shortDescription is enough" — *later revised in Drug class library discussion*

**Notes:** User later specified wanting both `mechanismOfAction` AND `longevityRelevance` fields when describing the comprehensive database requirements. Final decision: add both fields as optional to `SupplementInfo`.

---

### Q2: Rx items behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Info-only, no 'Add to protocol' | Rx badge + hidden Add button | |
| Show in interaction checker only | Not in library, only in InteractionChecker | |
| Same as OTC, just add an Rx badge | No behavioral difference, visual Rx label only | ✓ |

**User's choice:** Same as OTC with Rx badge.
**Notes:** Rapamycin and Metformin fully functional in protocol and checker — just visually labeled.

---

### Q3: rxLabel field

| Option | Description | Selected |
|--------|-------------|----------|
| Use existing fields as-is | prescriptionOnly + rxNote sufficient | |
| Add a display label field too | New rxLabel field for custom badge text | ✓ |

**User's choice:** Add `rxLabel` field.
**Notes:** Rapamycin = `'Off-label (longevity)'`, standard drug classes = `'Rx Only'`.

---

## Drug class library

### Q1: Location of drug class entries

| Option | Description | Selected |
|--------|-------------|----------|
| Add to supplementTimings.ts | category: 'prescription_only', single source of truth | ✓ |
| New drugLibrary.ts file | Separate file, cleaner separation | |
| Enrich medications.ts in-place | Add longevity fields to MedicationEntry | |

**User's choice:** supplementTimings.ts.

---

### Q2: Drug class display location

| Option | Description | Selected |
|--------|-------------|----------|
| Protocol screen library section only | Collapsible section in ProtocolScreen | |
| InteractionChecker only | Chips only in checker | |
| Both: Protocol library + InteractionChecker chips | Both locations | ✓ |

**User's choice:** Both.

---

### Q3: Supplement library scope + layout

**Question asked:** Should the 8 longevity supplements appear in a new Longevity Library section?

**User's free-text response:** Expanded scope dramatically — specified a comprehensive ~50 supplement database with a specific list including NMN, NR, Urolithin A, Spermidine, Fisetin, Quercetin, Apigenin, Luteolin, Pterostilbene, Resveratrol, Berberine, Astaxanthin, CoQ10, PQQ, Alpha-lipoic acid, NAC, Glycine, Taurine, Creatine, Omega-3, Vitamin D3, Vitamin K2, Magnesium glycinate, Zinc, Selenium, Iodine, Lithium orotate, Melatonin, Ashwagandha, Rhodiola, Lion's Mane, Bacopa, CBD, Artichoke extract, Milk thistle, Curcumin, Boron, Chromium, B12, Folate, B6, Vitamin C, Vitamin E, Iron, Collagen, Hyaluronic acid, Alpha-GPC, Phosphatidylserine, DHEA, Pregnenolone, Rapamycin, Metformin. With fields: name, dose, timing, evidence grade, mechanism of action, longevity relevance, interactions.

**Notes:** This response also locked in the `mechanismOfAction` + `longevityRelevance` fields (revising earlier D-01 answer) and established the full database scope.

---

### Q4: Data model fields (revised)

| Option | Description | Selected |
|--------|-------------|----------|
| Add mechanismOfAction + longevityRelevance fields | Two new optional string fields | ✓ |
| shortDescription for longevity only + mechanismOfAction | Smaller interface change | |
| You decide | Claude picks | |

**User's choice:** Add both fields.

---

### Q5: Library display format

| Option | Description | Selected |
|--------|-------------|----------|
| Browsable library tab/section with search | Search bar, list by name | |
| Scrollable list grouped by category | No search, browsing only | |
| Categorized list with search | Groups + search bar | ✓ |

**User's choice:** Categorized list with search.

---

## Stack integration

### Q1: Auto-populate vs manual

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-populate on open | Pre-fills from ProtocolState + UserProfile | ✓ |
| 'Check my stack' CTA button | One-tap load | |
| Keep manual entry only | No change | |

**User's choice:** Auto-populate on open.

---

### Q2: Medication → drug class resolution

| Option | Description | Selected |
|--------|-------------|----------|
| Map via medications.ts category field | MedicationEntry.category → drug class name | ✓ |
| Keep exact-match, expand INTERACTIONS drug names | More entries, no resolution logic | |
| You decide | Claude picks | |

**User's choice:** Map via medications.ts category field.

---

## Interaction pairs

### Q1: Expansion scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimum: new supplements only | ~10–15 new pairs | |
| Full longevity stack expansion | 50–80 total pairs | ✓ |
| You decide the count | Researcher generates candidates | |

**User's choice:** Full longevity stack expansion (50–80 total pairs).

---

### Q2: Authorship

| Option | Description | Selected |
|--------|-------------|----------|
| Researcher generates candidates, I review | Research agent drafts, pharmacist reviews | ✓ |
| I write all pairs myself | Maximum clinical accuracy, manual | |
| Researcher writes, no review step | Fastest, least clinical oversight | |

**User's choice:** Researcher generates, pharmacist reviews.

---

### Q3: Safe combos expansion

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — expand to ~10–15 safe combos | Synergistic longevity pairs | ✓ |
| No — keep existing 4 | Out of scope | |
| You decide | Claude picks | |

**User's choice:** Expand to ~10–15 entries.

---

## Claude's Discretion

None — all decisions were made by user.

## Deferred Ideas

None — discussion stayed within phase scope.
