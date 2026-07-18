# VO₂max scientific domain — Phase 5.0D

This directory is the isolated, deterministic scientific policy boundary for the
Vitalspan Cardiorespiratory Fitness domain. Its governing sources are:

- `docs/PHASE_5_0A_VO2MAX_SCIENTIFIC_EVIDENCE_REVIEW.md`
- `docs/PHASE_5_0B_VO2MAX_MEASUREMENT_STANDARD.md`
- `docs/PHASE_5_0C_VO2MAX_REFERENCE_STANDARD.md`

## What the module does

- preserves typed raw measurement, provider, timestamp, provenance, duplicate,
  population, and reference-request data;
- normalizes only explicitly supported mass-normalized units while retaining the
  original value and unit;
- assigns the approved source-specific confidence without brand-based upgrading;
- distinguishes direct gas measurement, exercise estimate, resting estimate, and
  transcription;
- distinguishes VO₂max from VO₂peak and treadmill from cycle;
- evaluates exact 2022 FRIEND eligibility for apparently healthy U.S. adults aged
  20–89 with Gold Standard direct maximal CPET;
- authorizes a source-bound percentile lookup only after an exact reference match;
- returns deterministic reason ordering, authorized outputs, blocked outputs, and
  complete registry versions; and
- retains unsupported, invalid, insufficient, conditional, and research decisions
  as auditable outcomes.

The engine does not contain or calculate FRIEND percentile tables. In this phase,
`percentile` means that a separately governed, publication-exact lookup is
scientifically authorized. `percentileEligibility.value` remains `null`.

## Fail-closed rules

There is no global, nearest-region, sex, modality, wearable-to-CPET, or age-band
fallback. Missing provenance is not inferred. HealthKit is modeled as an ingestion
container and cannot upgrade the originating method. Exact re-import duplicates do
not become a second active measurement.

All results block qualitative fitness categories, mortality labels or predictions,
fitness age, biological age or adjustment, universal risk claims, diagnosis,
treatment recommendations, CPET-replacement claims, and composite longevity scores.

## Version boundary

The following identifiers are independent and exposed on every result:

- `vo2max-domain/1.0.0`
- `vo2max-source-registry/1.0.0`
- `vo2max-confidence-registry/1.0.0`
- `vo2max-eligibility-policy/1.0.0`
- `vo2max-reference-registry/1.0.0`
- `vo2max-percentile-policy/1.0.0`

The FRIEND dataset reference has its own identity:
`friend-2022-us-adults/1.0.0`.

## Isolation boundary

This module is intentionally not exported from existing production domain indexes
and is not imported by screens, API routes, persistence, health ingestion, or
production state. Phase 5.0D does not authorize integration. It has no dependency on
Clinical PhenoAge and cannot modify or combine with a biological-age result.

