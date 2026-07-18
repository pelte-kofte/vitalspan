# Phase 5.0D — VO₂max Eligibility, Validation & Governance

**Document type:** Implementation and validation report  
**Scientific platform:** Vitalspan  
**Date:** 18 July 2026  
**Status:** Complete  
**Phase 5.0E recommendation:** **Ready for isolated integration planning, not yet production-wired**

## 1. Outcome

Phase 5.0D converts the approved Phase 5.0A evidence review, Phase 5.0B
measurement standard, and Phase 5.0C reference standard into a deterministic,
versioned, fail-closed Cardiorespiratory Fitness domain.

The implementation is isolated under
`src/domain/scientificDomains/vo2max/`. It is not exported by an existing
production domain index and is not imported by screens, API routes, persistence,
Apple Health ingestion, production state, or Clinical PhenoAge.

## 2. Implemented statuses

- `eligible`
- `conditionally_eligible`
- `measurement_accepted_no_reference`
- `research_only`
- `unsupported`
- `invalid`
- `insufficient_data`

Each result contains ordered reason codes, explanations, measurement confidence,
source provenance, canonical and original measurement data, reference and
percentile decisions, authorized and blocked outputs, all scientific versions,
and a deterministic audit snapshot.

## 3. Version registry

| Scientific boundary | Version |
| --- | --- |
| VO₂max domain specification | `vo2max-domain/1.0.0` |
| Measurement source registry | `vo2max-source-registry/1.0.0` |
| Confidence registry | `vo2max-confidence-registry/1.0.0` |
| Eligibility and validation policy | `vo2max-eligibility-policy/1.0.0` |
| Reference registry | `vo2max-reference-registry/1.0.0` |
| Percentile interpretation policy | `vo2max-percentile-policy/1.0.0` |
| Active FRIEND reference identity | `friend-2022-us-adults/1.0.0` |

## 4. Source decisions

- Valid maximal direct-gas CPET: Gold Standard.
- Symptom-limited direct CPET: Clinical Grade VO₂peak.
- Apple Watch, supported Garmin, Polar Running Index, and qualifying
  Fitbit/Google estimates: Moderate Confidence estimates without direct-CPET
  percentiles.
- Polar resting Fitness Test: Low Confidence estimate without a direct-CPET
  percentile.
- COROS EvoLab and WHOOP 5.0/MG: Research Only.
- Unverified HealthKit, clinician, and manual user values: Unsupported.
- Verified clinician transcription: at most Clinical Grade as an entry route and
  ineligible for the active direct-CPET percentile policy.
- User transcription with an attached but unverified report: conditional and
  percentile-ineligible.

HealthKit is an ingestion container. It neither supplies a measurement method nor
upgrades the originating source confidence.

## 5. Reference decision

The active reference registry contains only the updated 2022 FRIEND U.S. adult
reference. Eligibility requires an exact match for:

- age 20–89 at measurement;
- source-recorded female or male reference stratum;
- United States population;
- treadmill or cycle modality;
- VO₂max endpoint;
- apparently healthy health population;
- direct-gas measurement nature;
- Gold Standard confidence; and
- active reference identifier and version when explicitly requested.

There is no global, nearest-region, sex, modality, wearable-to-CPET, age-extrapolation,
or silent percentile fallback.

The engine authorizes a publication-exact percentile lookup after a match but does
not contain or calculate FRIEND percentile values. The percentile value remains
`null` in Phase 5.0D.

## 6. Authorized and blocked outputs

Depending on status, the domain may authorize the canonical value, measurement type,
confidence, provenance summary, data-quality limitations, interpretation availability,
reference identity, and source-bound percentile lookup. Research sources may authorize
only a segregated research record and audit metadata.

Every result blocks:

- qualitative fitness categories;
- mortality threshold labels or predictions;
- fitness age;
- biological age or adjustment;
- universal risk claims;
- diagnosis;
- treatment recommendations;
- claims that an estimate replaces CPET; and
- composite longevity scores.

## 7. Fixture and test coverage

The fixture registry covers:

- matching and nonmatching direct CPET;
- VO₂peak separation;
- Apple Watch, Garmin, both Polar methods, Fitbit/Google, COROS, and WHOOP;
- verified and unverified clinician entry;
- provisional and unsupported user entry;
- unverified HealthKit;
- missing source and timestamp;
- unsupported units and invalid values;
- age, sex, region, modality, endpoint, method, and reference mismatch;
- direct-gas, calibration, quality, and maximality provenance;
- exact duplicates, probable duplicates, and source corrections;
- extreme-value quarantine;
- deterministic reevaluation and reason ordering;
- full version and audit exposure; and
- prohibited-output and production-isolation boundaries.

Validation results on 18 July 2026:

- Phase 5.0D suite: **63 tests passed**.
- Clinical PhenoAge calculation, scientific validation, and product cutover:
  **88 tests passed**.
- Full repository: **31 suites and 534 tests passed**.
- TypeScript: `npx tsc --noEmit` passed.

The Watchman recrawl warning emitted during Jest execution is an environment warning
and did not affect test results.

## 8. Production-reference audit

The production audit found no import of the VO₂max scientific-domain module outside
its dedicated test. The module itself imports only sibling files. No Phase 5.0D
change was made to Clinical PhenoAge, Dashboard, Health Overview, Today, Advisor,
Living Sphere, API routes, persistence, HealthKit ingestion, or production state.

## 9. Remaining scientific limitations

- FRIEND is authorized only for its matched U.S. adult direct-CPET population.
- No global or additional regional reference is active.
- Current published reference strata do not support automatic interpretation for
  unrepresented sex data.
- Ethnicity is not used as a biological correction.
- Wearable algorithms remain model- and version-dependent estimates.
- An eligible result authorizes percentile lookup but no FRIEND percentile table is
  implemented in this phase.
- The module does not provide clinical CPET interpretation, diagnosis, treatment,
  longitudinal change thresholds, or mortality risk.

## 10. Phase 5.0E readiness

The isolated scientific contract is ready for Phase 5.0E integration planning.
Phase 5.0E must retain the domain's full result and audit contract, introduce no
fallbacks, preserve source identity, and keep percentile lookup publication-exact and
separately validated. Production wiring remains unauthorized until that phase is
reviewed and approved.

