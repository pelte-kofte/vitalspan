# Phase 20: Protocol Schema Migration - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate ProtocolState from its current split schema (`addedSupplements: string[]` + `customSupplements: CustomSupplement[]`) to a unified `supplements: ProtocolItem[]` array with optional personal dose per item. Remove the "Custom" category label. Add soft-hide for medications. Introduce an edit sheet (tap-to-edit) for supplements and medications. Move shared types to `src/types/protocol.ts`. The schema must be stable for Phase 21 (no dependencies), Phase 22 (adherence streaks + dose bucketing), and Phase 23 (notification consumers).

</domain>

<decisions>
## Implementation Decisions

### D-01: New ProtocolState Shape — Unified Supplements Array
- Replace `addedSupplements: string[]` and `customSupplements: CustomSupplement[]` with a single unified `supplements: ProtocolItem[]`.
- The "Custom" category label disappears — DB items and manually-added items appear in the same section, sorted by add order.

### D-02: ProtocolItem Type
```typescript
interface ProtocolItem {
  id: string;           // generated on add (e.g. `supp_${Date.now()}`)
  name: string;
  dose: string;         // DB default or user-entered at add time
  personalDose?: string; // user's override (shown in UI if set)
  timing?: TimeSlot;
  source: 'db' | 'manual';
  addedAt: string;      // ISO timestamp
}
```
- No `evidenceGrade` or `category` on the item — Phase 22/23 look those up from `SUPPLEMENT_DATABASE` by name if needed.
- `medTimes: Record<string, TimeSlot>` stays on ProtocolState — medications are not unified into ProtocolItem.

### D-03: Updated ProtocolState Shape
```typescript
interface ProtocolState {
  supplements: ProtocolItem[];          // replaces addedSupplements + customSupplements
  medTimes: Record<string, TimeSlot>;   // unchanged
  hiddenMeds: string[];                 // NEW: medication names hidden from protocol view
  taken: string[];
  takenDate: string;
}
```

### D-04: Types Location
- Create `src/types/protocol.ts` with `ProtocolItem`, `ProtocolState`, `TimeSlot`, `CustomSupplement` (keep for migration detection only). Export from there. `ProtocolScreen.tsx` imports from `src/types/protocol.ts`.
- Phase 22 and Phase 23 consumers also import from `src/types/protocol.ts` — no cross-screen type import.

### D-05: Eager AsyncStorage Migration
- On `ProtocolScreen` load, detect old schema by checking for presence of `addedSupplements` key in parsed JSON.
- If old schema detected: convert `addedSupplements: string[]` → `ProtocolItem[]` (source: 'db', dose from `SUPPLEMENT_DATABASE` lookup, id generated, addedAt = now); convert `customSupplements: CustomSupplement[]` → `ProtocolItem[]` (source: 'manual', preserve id/name/dose/timing/notes→ignored/addedAt).
- Write migrated state back to `@vitalspan_protocol` immediately.
- No new AsyncStorage key — detection is purely structural. Idempotent: if `supplements` key exists, skip migration.

### D-06: Personal Dose — Supplements Only
- `personalDose?: string` is added to `ProtocolItem` for supplements only.
- Medications are prescribed — no personal dose override. `medTimes` (timing) remains the only protocol-level field for medications.

### D-07: Medications — Soft-Hide
- New `hiddenMeds: string[]` field in ProtocolState. Stores medication names the user has hidden from the Protocol view.
- Hiding a medication: adds its name to `hiddenMeds`, persists, removes from taken count.
- Hidden medications are FULLY excluded from the UI: not rendered, not counted in `taken/total` progress pill.
- If a hidden medication is later removed from the user's profile (in ProfileScreen), it silently disappears from `hiddenMeds` on next load (no stale entry handling needed — hidden is filtered by intersection with active medications).

### D-08: Edit Sheet — Tap to Open
- Tapping anywhere on a supplement card opens a bottom-sheet edit modal (same style as existing `AddCustomSupplementModal`).
- Edit sheet fields: **Personal dose** (text input, pre-filled with `personalDose ?? dose`), **Timing** (AM/PM/Eve/Night chips, pre-filled with `timing`), **Notes** (text input — for manual items only; hidden for DB items). Name is NOT editable.
- Saving writes the updated `personalDose`, `timing` back to the `ProtocolItem` in the `supplements` array and persists.

### D-09: Remove Button Stays on Card
- The existing `✕` remove button remains on each supplement card (current pattern). No change to remove interaction.
- Remove from the card removes the item from `supplements[]` and clears any `taken` IDs associated with it.

### D-10: Medications — Tap to Edit Sheet
- Tapping a medication card opens an edit sheet with: **Timing** chips (AM/PM/Eve/Night, same as the current inline time chips) and a **"Remove from view"** destructive button (adds to `hiddenMeds`).
- The inline time chips on the medication card are REMOVED — timing is now set only from the edit sheet, same UX as supplements.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current Protocol Implementation (to migrate FROM)
- `src/screens/ProtocolScreen.tsx` — Full current schema: `ProtocolState`, `CustomSupplement`, `EMPTY_PROTOCOL`, `addCustomSupplement()`, `removeCustomSupplement()`, `toggleSupplement()`, `setMedTime()`, `AddCustomSupplementModal` component (lines 35–295)
- `src/screens/ProtocolScreen.tsx` — Current rendering: Medications section (~613–668), Your Stack (grouped by category, ~670–765), Custom section (~768–806), Supplement Library section (~808–814)

### Types Destination (to create)
- `src/types/protocol.ts` — NEW file; will contain `ProtocolItem`, `ProtocolState`, `TimeSlot` — all consumers must import from here

### Downstream Phase Consumers (schema must be stable for these)
- `src/screens/DashboardScreen.tsx` — reads `@vitalspan_protocol_today` (date + taken); verify it still works after schema change
- `src/screens/InteractionCheckerScreen.tsx` — reads protocol supplements for interaction checking; update to read from `supplements[]` instead of `addedSupplements + customSupplements`
- `src/lib/advisorContext.ts` — reads protocol for AI advisor context (Phase 22 adds dose bucketing here; Phase 20 just ensures the new schema is readable)

### Data Sources
- `src/data/supplementTimings.ts` — `SUPPLEMENT_DATABASE`, `SupplementInfo` type — used for DB lookups during migration and for display
- `src/data/medications.ts` — `MEDICATION_DATABASE`, `MedicationEntry` type — used for drug class lookups on medication cards
- `src/data/biomarkers.ts` — `INTERACTIONS` — used for medication interaction map (unchanged)

### AsyncStorage Keys (must be preserved)
- `@vitalspan_protocol` — schema changes in place; key preserved
- `@vitalspan_protocol_today` — `{ date: string, taken: string[] }` — unchanged
- `@vitalspan_user_profile` — medications sourced from here; Phase 20 does NOT modify this key

### Theme & Design System
- `src/theme/index.ts` — all colors, spacing, typography tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AddCustomSupplementModal` (ProtocolScreen.tsx, lines 126–295) — bottom-sheet modal with KeyboardAvoidingView, field inputs, timing chips. The edit sheet for Phase 20 follows the same style but pre-fills values from the existing ProtocolItem.
- `SUPPLEMENT_DATABASE` (src/data/supplementTimings.ts) — lookup source during migration: `find(s => s.name.toLowerCase() === name.toLowerCase())` to get `defaultDose` and `id` for migrating old `addedSupplements` string names.
- `taken` ID scheme — supplement items use `doseId(name, n)` for multi-dose or item `id` for single-dose. After migration, supplement items use `ProtocolItem.id` directly (simplifies tracking).

### Established Patterns
- `persist(next: ProtocolState)` — writes to `@vitalspan_protocol` + `@vitalspan_protocol_today`; keep this function, update its type signature to the new ProtocolState.
- `StyleSheet` named `s`, modal stylesheet named `ms` — follow existing convention.
- `useFocusEffect` + `loadData` pattern for screen refresh — unchanged.
- `EMPTY_PROTOCOL` constant — update to new ProtocolState shape.

### Integration Points
- `InteractionCheckerScreen` reads `addedSupplements` and `customSupplements` from stored protocol — must be updated to read `supplements[]`.
- `DashboardScreen` reads `@vitalspan_protocol_today` (taken IDs only) — no change needed if taken IDs remain strings.
- `advisorContext.ts` reads protocol for AI context — update to read from `supplements[]`.

</code_context>

<specifics>
## Specific Ideas

- **Migration detection pattern:** `if ('addedSupplements' in parsed)` — simple key-existence check. No version number needed.
- **Generated supplement IDs during migration:** `supp_migrated_${Date.now()}_${index}` — ensures uniqueness without collision risk.
- **Taken ID migration:** Old taken IDs use supplement names (e.g., `"Vitamin D3"`) or `doseId("Vitamin D3", 0)`. After migration, supplement `taken` IDs should use `ProtocolItem.id`. The migration must remap existing `taken` name-based IDs to the new generated IDs — or clear `taken` (simpler, acceptable UX tradeoff since taken resets daily anyway).
- **Edit sheet reuse:** Phase 20 can extract `AddCustomSupplementModal` into a more general `EditSupplementSheet` component with an `initialValues` prop for edit mode and `mode: 'add' | 'edit'` prop to conditionally show the Name field.

</specifics>

<deferred>
## Deferred Ideas

- **Medications in ProtocolState fully** — migrating medications out of the user profile into ProtocolState would be a large migration affecting ProfileScreen, OnboardingScreen, and advisorContext. Deferred to v6.0+.
- **Swipe-to-delete/edit** — the RNGH v2 swipe gesture pattern used in ExerciseScreen was considered but user chose tap-to-edit for supplements. If swipe is preferred later, ExerciseScreen's SwipeableLogRow is the pattern to follow.
- **Notes field on DB-sourced items** — currently planned to hide notes in edit sheet for DB items. Could be added later if users want to annotate standard supplements.

</deferred>

---

*Phase: 20-Protocol Schema Migration*
*Context gathered: 2026-06-16*
