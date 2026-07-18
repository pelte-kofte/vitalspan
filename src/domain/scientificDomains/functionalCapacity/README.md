# Functional Capacity scientific domain

This directory is the isolated Phase 6.0D implementation of the Functional Capacity standards approved in Phases 6.0A, 6.0B, and 6.0C. It is a pure, deterministic scientific-decision module. It has no UI, API, persistence, ingestion, device, or production-state integration.

## Boundary

The module governs eight separate measurements: hand-grip strength, usual gait speed, Four-Meter Walk, 30-Second Chair Stand, standalone Five Times Sit-to-Stand, Timed Up and Go, Six-Minute Walk Test, and the official Short Physical Performance Battery. It never merges, averages, substitutes, or ranks them. It does not modify Clinical PhenoAge or VO2max.

It cannot produce a Functional Capacity score, qualitative category, mortality threshold, lifespan estimate, biological or fitness age, frailty/sarcopenia/fall-risk/disease diagnosis, treatment or exercise recommendation, composite longevity score, 6MWT-derived VO2max, or a Vitalspan-modified SPPB total.

## Evaluation flow

1. The common validator checks identity, scalar or raw-component presence, finite positive values, authorized units, timestamps, source, protocol, provenance, completion, safety, supervision, attempts, duplicate lineage, and age derivation.
2. A test-specific validator checks only the named test protocol. Missing metadata is not inferred.
3. The source and confidence registries classify the record. Source identity cannot upgrade incomplete evidence.
4. Exact reference matching runs only for an accepted measurement with adequate confidence. It has no fallback path.
5. Interpretation preserves only an externally supplied, source-verified published percentile or an unchanged source-calculated official protocol output. The module contains no percentile tables or calculation logic.
6. The result includes ordered reason codes, authorized and blocked outputs, every scientific version, and a deterministic audit snapshot containing the original input.

## Reference behavior in version 1.0.0

- Hand grip: iGRIPS 2025 only for exact Southampton-compatible, hand-specific, calibrated-device and represented-population matches.
- Usual gait speed: no active reference. The ELSA candidate remains inactive.
- Four-Meter Walk: exact NIH Toolbox U.S. or CLSA Canadian protocol/population matching only.
- 30CST: exact Rikli–Jones U.S. older-adult protocol/population matching only.
- Standalone 5xSTS: raw measurement only; no normative interpretation.
- TUG: exact CLSA Canadian or Tromso Norwegian protocol/population matching only; mobility context only.
- 6MWT: exact supervised Casanova multicentre conditions only; never VO2max.
- SPPB: raw official components and an attested source-generated official output may be preserved; no Vitalspan normative interpretation or generated total.

An absent or mismatched reference leaves an otherwise valid measurement accepted with interpretation unavailable. There is no nearest-age, sex, country, region, health-population, equipment, course, protocol, or test fallback.

## Trend compatibility

Trend evaluation returns only `comparable`, `conditionally_comparable`, `not_comparable`, or `insufficient_data`. It compares the test, protocol/version, endpoint, canonical unit, completion, and applicable test-specific setup. It does not calculate change, slope, improvement, decline, or percentage.

## Versioning and governance

The domain, test, protocol, source, confidence, validation, eligibility, reference, reference-matching, interpretation, and trend policies are independently versioned in `versions.ts`. Registry integrity and prohibited-output invariants are auditable through `auditFunctionalCapacityGovernance()`.

Phase 6.0E must explicitly authorize any production integration. Importing this module from production screens, APIs, persistence, health ingestion, device integration, or production state is out of scope for this version.
