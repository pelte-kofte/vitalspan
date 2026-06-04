---
phase: 11-supplement-and-drug-database
plan: "01"
subsystem: data
tags: [supplements, database, typescript, pharmacist-data]
dependency_graph:
  requires: []
  provides: [extended-supplement-interface, expanded-supplement-database]
  affects: [src/data/supplementTimings.ts]
tech_stack:
  added: []
  patterns: [optional-interface-extension, pharmacist-verified-entries]
key_files:
  created: []
  modified:
    - src/data/supplementTimings.ts
decisions:
  - "Three new optional fields (mechanismOfAction, longevityRelevance, rxLabel) appended after rxNote in SupplementInfo — optional fields cause zero breaking changes to all 47 existing entries"
  - "dhea and pregnenolone placed in prescription_only category with rxLabel: 'Supervised use' — OTC in USA but supervised use strongly recommended per pharmacist guidance"
  - "hyaluronic_acid uses category: 'amino_acid' per research guidance (structural glycosaminoglycan, closest available category)"
  - "4 drug class entries (nsaids_class, aspirin_class) use prescriptionOnly: false to reflect OTC availability while remaining in prescription_only category for UI grouping"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-04T19:28:21Z"
  tasks_completed: 3
  files_modified: 1
---

# Phase 11 Plan 01: Supplement & Drug Database Expansion Summary

Extended SupplementInfo interface with three new optional fields and expanded SUPPLEMENT_DATABASE from 47 to 69 entries by adding 18 net-new OTC supplement entries and 4 drug class entries with full mechanismOfAction, longevityRelevance, and rxLabel population.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend SupplementInfo interface + backfill rxLabel | 2ef4937 | src/data/supplementTimings.ts |
| 2 | Add 18 net-new supplement entries | e6e50e7 | src/data/supplementTimings.ts |
| 3 | Add 4 drug class entries | c904579 | src/data/supplementTimings.ts |

## What Was Built

**Interface extension (Task 1):**
- Added `mechanismOfAction?: string` — molecular mechanism text for detail screens
- Added `longevityRelevance?: string` — longevity-specific rationale for Protocol Library
- Added `rxLabel?: string` — short UI badge label (e.g. "Rx Only", "Off-label (longevity)")
- Backfilled `rxLabel: 'Off-label (longevity)'` on metformin_rx and rapamycin_rx

**New supplement entries (Task 2, 18 entries):**
- Mitochondrial: urolithin_a (PINK1/Parkin mitophagy activator)
- Antioxidant: luteolin, astaxanthin
- Nootropic: lithium_orotate (microdose GSK-3β inhibitor)
- Sleep: melatonin (MT1/MT2 circadian entrainment)
- Adaptogen: cbd (cannabidiol)
- Metabolic: artichoke_extract, milk_thistle
- Mineral: chromium, iron_bisglycinate
- Amino acid: collagen_peptides, hyaluronic_acid
- Prescription-only prohormones: dhea, pregnenolone
- Vitamin: vitamin_e_tocotrienol, methylcobalamin_b12, methylfolate, p5p_b6

**Drug class entries (Task 3, 4 entries):**
- nsaids_class (COX-1/COX-2 inhibitors, OTC)
- aspirin_class (antiplatelet/anti-inflammatory, OTC/supervised)
- statins_class (HMG-CoA reductase inhibitors, Rx only, CoQ10 depletion warning)
- levothyroxine_class (synthetic T4, Rx only, strict separation requirements)

## Verification Results

- SUPPLEMENT_DATABASE entries: 69 (was 47, +22 = 18 OTC + 4 drug class)
- mechanismOfAction fields: 22 (18 new OTC + 4 drug classes)
- longevityRelevance fields: 22
- rxLabel fields: 8 (metformin_rx, rapamycin_rx, dhea, pregnenolone, nsaids_class, aspirin_class, statins_class, levothyroxine_class)
- `npx tsc --noEmit`: exit 0, zero errors
- No duplicate entry ids

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all entries have complete data fields. No UI rendering depends on empty/placeholder values.

## Threat Flags

None identified. All new surface is static TypeScript data — no new network endpoints, auth paths, or file access patterns introduced.

## Self-Check: PASSED

- [x] `src/data/supplementTimings.ts` exists and was modified
- [x] Commit 2ef4937 exists (Task 1)
- [x] Commit e6e50e7 exists (Task 2)
- [x] Commit c904579 exists (Task 3)
- [x] 69 database entries confirmed
- [x] tsc --noEmit exit 0 confirmed
