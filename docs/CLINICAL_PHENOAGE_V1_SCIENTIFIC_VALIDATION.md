# Clinical Phenotypic Age v1.0.0 scientific validation report

**Validation date:** 2026-07-17

**Scope:** Vitalspan `clinical-phenoage/1.0.0` calculation engine only

**Status:** Validated for deterministic implementation correctness on the tested
runtime matrix, with the production-integration requirements below still open.

## Scope and change control

This phase did not change the calculation formula, coefficients, normalization
contract, output contract, eligibility logic, UI, navigation, Living Sphere,
renderer, AI, recommendations, or any other biological-age model.

The following identities remained fixed:

| Identity | Locked value |
| --- | --- |
| Model | `clinical_phenoage` |
| Scientific version | `clinical-phenoage/1.0.0` |
| Coefficient version | `clinical-phenoage-coefficients/1.0.0` |
| Normalization version | `clinical-phenoage-canonical-units/1.0.0` |
| Implementation version | `vitalspan-clinical-phenoage/1.0.0` |
| Input policy | `clinical_phenoage_complete_visit` |
| Coefficient fingerprint | `26d3842b55885598405ae13ae1d058c6403f11a049063d1c565c031f3e5ac4dc` |

Source-file, fixture, and independent-evaluator SHA-256 values are frozen in
`fixtures/scientific/clinical-phenoage-v1-validation-manifest.json`. A change to any
locked artifact fails the scientific regression suite.

## Reference basis

The primary source is Levine ME, Lu AT, Quach A, et al., *An epigenetic biomarker of
aging for lifespan and healthspan*, DOI
[10.18632/aging.101414](https://doi.org/10.18632/aging.101414), PMCID
[PMC5940111](https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/). The paper documents
the clinical measure's nine biomarkers, chronological age, units, weights, NHANES
III derivation, and NHANES IV validation.

The publication does not provide person-level numeric calculation fixtures suitable
for a direct golden test. The audit therefore distinguishes:

1. **Published specification validation:** source identity, canonical input set,
   units, versions, and coefficient fingerprint.
2. **Independent numeric validation:** two fixed cases evaluated with GNU `bc` at
   60 decimal places.
3. **Independent JavaScript runtime validation:** a standalone probe executed in
   Node and Hermes, never imported by production code.
4. **Engine validation:** production audit stages compared with the independent
   decimal fixtures, not with another call to the engine.

## Tolerance policy

| Comparison | Absolute tolerance | Relative tolerance |
| --- | ---: | ---: |
| Engine vs. arbitrary-precision reference | `1e-10` | `1e-12` |
| Node vs. Hermes probe | `1e-12` | `1e-14` |
| Repeated execution in one runtime | Exact equality | Exact equality |

Tolerances apply only to verification comparisons. The engine continues to return
its unrounded IEEE-754 binary64 result and performs no tolerance-based adjustment.

## Reference agreement

| Case | Arbitrary-precision reference | Engine binary64 result | Absolute error | Relative error |
| --- | ---: | ---: | ---: | ---: |
| Complete adult reference | 31.51475435303909395… | 31.514754353039137 | `4.2633e-14` | `1.3528e-15` |
| Decimal-heavy reference | 74.45929007879300487… | 74.45929007879302 | `1.4211e-14` | `1.9085e-16` |

All audit stages—natural-log CRP, linear predictor, published mortality
transformation, transformed mortality, and final age—were inside the stated
tolerance. Both final errors were more than three orders of magnitude below the
absolute tolerance.

## Runtime reproducibility

Executed runtime matrix:

| Runtime | Environment | Result |
| --- | --- | --- |
| Node.js 25.9.0 | macOS 26.5 arm64 | Pass |
| Hermes for React Native 0.81.5, bytecode 96 | macOS 26.5 arm64 | Pass |
| GNU bc 7.0.3 | macOS 26.5 arm64 | Pass |

Node and Hermes each produced byte-identical output across repeated runs. One
cross-runtime difference was observed in `ln(0.42)` at approximately `1.1e-16`.
The final calculated age was identical in both JavaScript runtimes, and every audit
value remained inside the stricter cross-runtime tolerance.

Linux, Windows, physical-device iOS release builds, and physical-device Android
release builds were not available in this workspace and are explicitly recorded as
unverified rather than inferred from the macOS result.

## Numerical stability and boundaries

- CRP values of `1e-12 mg/dL` and `999 mg/dL` remained finite and calculable under
  the existing computational bounds. These are numerical tests, not claims of
  physiological or clinical validity.
- `Number.MIN_VALUE` passes the positive-value check but loses resolution in the
  published nested exponential transformation. The engine correctly returns
  `ComputationalDomainError` and no partial output.
- Decimal-heavy inputs and reversed input ordering produced identical results,
  ordered snapshots, and hashes.
- One thousand repeated, independently authorized executions produced deeply equal
  results and identical scientific-output hashes.
- A one-ULP-scale glucose change altered the evidence snapshot hash but did not alter
  the final age because its effect fell below binary64 output resolution. A larger
  `1e-5` perturbation produced a finite, proportionate response.

## Sensitivity observations

Directional tests verify the published equation, not health interpretation:

- Increasing a positive-coefficient input increased the output locally.
- Increasing albumin or lymphocyte percentage, which have negative coefficients,
  decreased the output locally.
- CRP was monotonic across `0.01` through `100 mg/dL` with all other inputs fixed.
- Doubling a small glucose perturbation approximately doubled the local output
  change to four decimal places in the response ratio.

No discontinuity, sign reversal, non-finite result, hidden clamp, or heuristic was
observed inside these tested neighborhoods. This does not establish clinical
causality, treatment response, or desirable biomarker direction.

## Regression and integrity protection

The validation suite freezes:

- coefficient and formula fingerprint;
- model, coefficient, normalization, implementation, and policy versions;
- production calculation, constants, and validation source hashes;
- arbitrary-precision evaluator, fixture, and runtime-probe hashes;
- ordered input snapshot hashes;
- scientific-output hashes excluding authorization time and calculation time;
- independent golden intermediates and final outputs;
- same-runtime determinism and cross-runtime tolerance;
- authorization clone, mutation, and expiry rejection.

A future scientific behavior change must not update these expectations in place.
It requires a new scientific version, evidence review, documentation, coefficient or
normalization version where applicable, and independently regenerated fixtures.

## Scientific confidence

**Implementation confidence: high within the tested matrix.** The engine agrees with
an arbitrary-precision implementation, preserves the published coefficient
directions, fails closed at numerical-domain boundaries, and shows exact
same-runtime reproducibility.

**Clinical interpretation confidence: unchanged and limited to the cited model's
evidence.** This audit validates software behavior; it does not independently
revalidate the model as a clinical instrument, establish individual benefit, or
expand the source population.

## Known scientific and population limitations

- The clinical model is population-derived and cross-sectional.
- A single visit cannot establish aging rate, trend, causality, or treatment effect.
- Transportability outside the NHANES-derived evidence base remains uncertain.
- Acute illness, assay differences, laboratory drift, and collection context can
  affect inputs without being distinguishable by the equation.
- Binary64 cannot represent every decimal input or arbitrarily small output change.
- The output is not a diagnosis, lifespan estimate, disease prediction, health
  score, recommendation, or whole-person assessment.

## Remaining production assurance requirements

1. Execute the frozen suite in Linux CI and retain the validation artifact.
2. Execute the engine in physical iOS and Android release builds, including Hermes
   and production compiler settings.
3. Obtain independent scientific/code review of the locked formula and validation
   evidence.
4. Confirm upstream measurement identifiers are immutable and numeric evidence
   cannot be reassigned under an authorized identifier.
5. Establish release governance requiring a new version for any scientific behavior
   or normalization change.

The Phase 3.4B cutover retired the pre-validation product calculator and made this
validated engine the single production calculation path. The assurance work above
remains necessary release governance; it must not be interpreted as permission to
change coefficients, normalization, or golden outputs in place.
