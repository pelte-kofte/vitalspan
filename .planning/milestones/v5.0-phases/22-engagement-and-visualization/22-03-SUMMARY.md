---
phase: 22-engagement-and-visualization
plan: "03"
subsystem: ai-advisor
tags: [advisor-context, dose-bucketing, privacy, prot-05]
dependency_graph:
  requires: [22-01]  # ProtocolState schema with personalDose field
  provides: [supplementDetails-in-advisor-context]
  affects: [supabase/functions/ai-advisor/index.ts]
tech_stack:
  added: []
  patterns: [dose-ratio-bucketing, additive-parallel-field, nan-guard]
key_files:
  modified:
    - src/lib/advisorContext.ts
decisions:
  - "supplementDetails added as parallel optional field — supplements: string[] kept unchanged for backward compat (Pitfall 6)"
  - "Raw personalDose string never included in output — only high/standard/low bucket (pharmacist-liability T-22-06)"
  - "NaN/zero guard (!isNaN(personal) && !isNaN(standard) && standard > 0) prevents non-numeric dose units from leaking as NaN (T-22-07)"
  - "No personal override → doseBucket: standard (DB default is by definition the reference dose)"
metrics:
  duration: "12 minutes"
  completed: "2026-06-18T11:26:01Z"
  tasks_completed: 1
  files_changed: 1
---

# Phase 22 Plan 03: advisorContext supplementDetails Dose Bucketing Summary

**One-liner:** Dose-bucketed supplement context (high/standard/low ratio vs DB default) added to AI Advisor as a parallel `supplementDetails` field, with NaN guard and raw dose omitted for pharmacist-liability compliance.

## What Was Built

Added `supplementDetails` to `AdvisorContext` in `src/lib/advisorContext.ts`. For each protocol supplement in the new schema (`protocolState.supplements[]`), the assembler now:

1. Looks up the supplement's `defaultDose` in `SUPPLEMENT_DATABASE`
2. If no `personalDose` is set → bucket is `'standard'` (user is on the DB default)
3. If `personalDose` is set and both values parse as valid numbers (with a `> 0` denominator guard):
   - ratio ≥ 1.25 → `'high'`
   - ratio ≤ 0.75 → `'low'`
   - otherwise → `'standard'`
4. If either value is non-numeric (e.g., `"as directed"`) → `doseBucket` is omitted from the entry entirely (no NaN or undefined leaks into the serialized context)
5. The legacy fallback branch (addedSupplements/customSupplements) maps entries to `{ name }` only — no dose data available there

The existing `supplements: string[]` field is untouched. `supplementDetails` is additive — the Edge Function serializes the whole context blob via `JSON.stringify`, so the new field is automatically included without any Edge Function changes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Dose bucketing + supplementDetails in advisorContext | ddff37e | src/lib/advisorContext.ts |

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Compliance

| Threat ID | Status |
|-----------|--------|
| T-22-06 (raw dose disclosure) | Mitigated — only doseBucket in output, never personalDose string |
| T-22-07 (NaN leak) | Mitigated — `!isNaN(personal) && !isNaN(standard) && standard > 0` guard |
| T-22-SC (no new installs) | Accepted — SUPPLEMENT_DATABASE is existing local data |

## Known Stubs

None — supplementDetails is fully wired from ProtocolState → dose ratio → context object.

## Self-Check: PASSED

- `src/lib/advisorContext.ts` modified: FOUND
- Commit ddff37e: FOUND (`git log --oneline -1` confirms)
- `npx tsc --noEmit` exits 0: CONFIRMED (no output = no errors)
- All acceptance criteria met:
  - `import { SUPPLEMENT_DATABASE }` present at line 21
  - `supplementDetails?:` with `doseBucket?: 'high' | 'standard' | 'low'` in AdvisorContext (lines 35–39)
  - `supplements: string[]` preserved at line 33
  - `ratio >= 1.25 ? 'high' : ratio <= 0.75 ? 'low' : 'standard'` at line 224
  - `!isNaN(personal) && !isNaN(standard) && standard > 0` at line 222
  - `supplementDetails,` in context assembly at line 272
  - `supplementDetails: []` in no-data fallback at line 305
