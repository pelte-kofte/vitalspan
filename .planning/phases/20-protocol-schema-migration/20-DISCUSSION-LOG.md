# Phase 20: Protocol Schema Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 20-protocol-schema-migration
**Areas discussed:** New schema shape, Medications handling, Edit/delete UX

---

## New Schema Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Unified array (Recommended) | One `supplements: ProtocolItem[]` list. Each item has id, name, dose, personalDose?, timing?, source: 'db'\|'manual'. Custom label disappears. | ✓ |
| Keep two arrays, merge display | Keep `addedSupplements: string[]` + `customSupplements: CustomSupplement[]`. Add `personalDoses: Record<string, string>` for overrides. Visual merge only. | |
| You decide | Claude picks the cleanest migration path. | |

**User's choice:** Unified array (Recommended)
**Notes:** Cleanest model for downstream phases.

---

| Option | Description | Selected |
|--------|-------------|----------|
| id, name, dose, personalDose?, timing?, source (Recommended) | Core fields only. Phase 22/23 look up evidenceGrade/category from SUPPLEMENT_DATABASE by name. | ✓ |
| Add evidenceGrade and category too | Denormalize more fields onto item to avoid DB lookups downstream. | |
| Minimal: name + personalDose only | Keep most metadata in DB lookups. | |

**User's choice:** id, name, dose, personalDose?, timing?, source (Recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Eager migration on load (Recommended) | Detect old shape structurally, convert inline, write back. No migration flag needed. | ✓ |
| Lazy migration with version flag | schemaVersion field + dedicated AsyncStorage migration key. | |
| No migration — start fresh | Clear old data on schema change. Destructive. | |

**User's choice:** Eager migration on load (Recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Keep in ProtocolScreen.tsx (Recommended) | Same as current CustomSupplement location. | |
| Move to src/types/protocol.ts | Dedicated types file for multi-phase consumers. | ✓ |
| You decide | Claude picks type home based on existing shared types patterns. | |

**User's choice:** Move to src/types/protocol.ts

---

## Medications Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Soft-hide in ProtocolState (Recommended) | `hiddenMeds: string[]` — med stays in profile, hidden from protocol view. | ✓ |
| Navigate to Profile to remove | No remove button on protocol; 'Manage in Profile →' link instead. | |
| Medications also move to ProtocolState | Large migration; breaks ProfileScreen. Out of scope. | |

**User's choice:** Soft-hide in ProtocolState (Recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Both supplements and medications (Recommended) | `medPersonalDoses: Record<string, string>` for medications too. | |
| Supplements only | Medications are prescribed — no dose override. | ✓ |
| You decide | Claude picks based on clinical reasoning. | |

**User's choice:** Supplements only — medications are prescribed; personal dose override doesn't apply.

---

| Option | Description | Selected |
|--------|-------------|----------|
| No — hidden means hidden from all counts (Recommended) | Excluded from taken/total progress pill. | ✓ |
| Yes — still tracked but not shown | Hidden meds still contribute to count. Could be confusing. | |

**User's choice:** No — hidden means fully hidden from UI and counts.

---

## Edit/Delete UX

| Option | Description | Selected |
|--------|-------------|----------|
| Swipe-to-reveal edit + delete (Recommended) | Swipe left reveals Edit + Delete. Reuses RNGH v2 from ExerciseScreen. | |
| Tap to open edit sheet | Tapping card opens bottom-sheet form. Same style as AddCustomSupplementModal. | ✓ |
| Long-press context menu | Long-press → Alert with Edit/Remove. Less discoverable. | |

**User's choice:** Tap to open edit sheet

---

| Option | Description | Selected |
|--------|-------------|----------|
| Personal dose + timing + notes (Recommended) | Three fields. Name not editable. | ✓ |
| Personal dose only | Just dose field. Timing stays inline. Notes dropped. | |
| All fields including name | Name editable for manual items. | |

**User's choice:** Personal dose + timing + notes (Recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Remove button inside the edit sheet (Recommended) | 'Remove from stack' at bottom of sheet. Card surface clean. | |
| Keep the ✕ button on the card | Existing small ✕ remove button stays. Tap = edit, ✕ = remove. | ✓ |
| Long-press for remove, tap for edit | Splits discovery across two gestures. | |

**User's choice:** Keep ✕ on card. Two separate interactions: tap card for edit sheet, tap ✕ to remove.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Meds also tap-to-edit (Recommended) | Tap medication card → edit sheet with timing + 'Remove from view' action. | ✓ |
| Meds stay as-is (inline time chips only) | Time chips stay inline. No tap-to-edit. Remove goes to Profile. | |

**User's choice:** Meds also tap-to-edit (Recommended) — consistent behavior across sections.

---

## Claude's Discretion

None — all gray areas were resolved by user selection.

## Deferred Ideas

- **Medications fully in ProtocolState** — considered but too large for Phase 20; affects ProfileScreen, OnboardingScreen, advisorContext. Deferred to v6.0+.
- **Swipe-to-delete/edit** — RNGH v2 swipe from ExerciseScreen considered but user preferred tap-to-edit. Could revisit in a UX polish phase.
- **Notes on DB-sourced supplements** — notes field hidden for DB items in edit sheet; could be exposed later.
