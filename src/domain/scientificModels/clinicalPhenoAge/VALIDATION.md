# Clinical Phenotypic Age v1.0.0 validation specification

## Scientific identity

- Model: Clinical Phenotypic Age (the clinical biomarker precursor used in the
  Levine DNAm PhenoAge work)
- Vitalspan model id: `clinical_phenoage`
- Scientific version: `clinical-phenoage/1.0.0`
- Coefficient version: `clinical-phenoage-coefficients/1.0.0`
- Normalization contract: `clinical-phenoage-canonical-units/1.0.0`
- Implementation version: `vitalspan-clinical-phenoage/1.0.0`
- Primary source: Levine ME, Lu AT, Quach A, et al. *An epigenetic biomarker of
  aging for lifespan and healthspan*. Aging. 2018;10(4):573–591.
  DOI: [10.18632/aging.101414](https://doi.org/10.18632/aging.101414),
  PMCID: [PMC5940111](https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/)

This implementation is the published clinical equation. It is not DNAm PhenoAge,
KDM, a multimodal model, a trend model, or a locally refitted equation.

## Mandatory dependency

The engine accepts only a live `ScientificExecutionAuthorization` produced by the
eligibility engine for the exact model, version, input policy, and ten measurement
identifiers. Chronological age must also equal the value evaluated for population
eligibility. Authorizations are integrity-bound and valid for five minutes from the
eligibility assessment. Cloned, altered, forged, expired, conditional, denied,
research-only, unsupported, and retired results fail closed.

The eligibility layer evaluates scientific context; the calculation layer validates
the numeric payload. Neither layer can bypass the other.

## Canonical input contract

| Input | Canonical unit | Transformation |
| --- | --- | --- |
| Chronological age at specimen collection | years | none |
| Albumin | g/L | none |
| Creatinine | μmol/L | none |
| Glucose | mmol/L | none |
| C-reactive protein | mg/dL | natural logarithm |
| Lymphocyte percentage | % | none |
| Mean cell volume | fL | none |
| Red cell distribution width | % | none |
| Alkaline phosphatase | U/L | none |
| White blood cell count | 10^3/μL | none |

Inputs must already have been normalized under the exact normalization contract.
The engine does not parse localized numeric strings, infer units, convert units,
substitute markers, estimate missing values, or accept additional inputs.

## Exact formula

With inputs in the units above:

```text
xb = -19.9067
     - 0.0336 × albumin
     + 0.0095 × creatinine
     + 0.1953 × glucose
     + 0.0954 × ln(CRP)
     - 0.0120 × lymphocyte percentage
     + 0.0268 × mean cell volume
     + 0.3306 × red cell distribution width
     + 0.00188 × alkaline phosphatase
     + 0.0554 × white blood cell count
     + 0.0804 × chronological age

gamma = 0.0076927
M = 1 - exp(-exp(xb) × (exp(120 × gamma) - 1) / gamma)
Clinical Phenotypic Age = 141.50225 + ln(-0.00553 × ln(1 - M)) / 0.090165
```

`M` is retained only in the audit-only pipeline and is not part of the product
result. The implementation preserves the published operation order and performs no
intermediate rounding, algebraic replacement, coefficient simplification, output
clamping, or local recalibration.

## Precision and reproducibility

Runtime arithmetic is IEEE-754 binary64. The unrounded result and age difference are
stored. Presentation rounding is explicitly outside this engine. Tests use an
absolute tolerance of `1e-10` and relative tolerance of `1e-12` where a tolerance is
required.

The exact decimal coefficient definition has SHA-256 fingerprint:

```text
26d3842b55885598405ae13ae1d058c6403f11a049063d1c565c031f3e5ac4dc
```

Changing a coefficient, transform constant, or canonical formula definition breaks
startup calculation integrity. Such a change requires a new scientific version,
coefficient version, implementation version, documentation review, and golden
fixtures.

Each successful result captures the ordered numeric input snapshot and a stable
SHA-256 hash over the model version, normalization version, measurement identifiers,
values, and units. It also snapshots the authorization reference, evidence citation,
versions, coefficient fingerprint, warnings, limitations, and precision policy so a
later registry edit cannot silently change the meaning of a stored result.

## Computational safety boundaries

The machine-readable bounds in `constants.ts` reject negative-impossible values,
zero where a positive logarithmic or measurement domain is required, non-finite
values, and extremely large numeric payloads. These bounds are intentionally broad
computational protections. They are not laboratory reference intervals, diagnostic
thresholds, claims of physiological plausibility, or health-quality categories.
Values are rejected rather than clamped.

Even a value inside the safety bounds can cause the nested exponential/logarithmic
formula to leave its representable domain. That produces `ComputationalDomainError`
and no partial age.

## Reference validation

Golden cases live in
`fixtures/scientific/clinical-phenoage-v1-reference.json`. Expected intermediates
and outputs were evaluated independently with GNU `bc` arbitrary-precision decimal
math at scale 60 from the published equation. Production tests consume the fixed
outputs and do not reimplement the formula.

The separately executable
`fixtures/scientific/clinical-phenoage-v1-reference.bc` reproduces the final golden
ages and is never imported by production code or Jest.

The suite separately covers all missing inputs, all wrong units, non-finite and
localized payloads, negative-impossible values, extreme valid inputs, input-set and
measurement-id mismatches, authorization denial/expiry/tampering, formula integrity,
snapshot hashing, exact repeatability, and computational-domain failure.

## Population and interpretation limits

The registered eligibility version applies to source-attributed adult evidence from
age 20. No unregistered upper scientific range is invented; the age-130 ceiling is
only a computational guard. Population transportability, laboratory and assay
comparability, acute illness, and cross-sectional variability remain material
limitations. One complete visit can authorize a cross-sectional calculation but
cannot establish direction, persistence, pace of aging, or treatment effect.

This is not a whole-person model. It intentionally excludes symptoms, diagnoses,
medications, supplements, peptides, therapies, genetics, nutrition, sleep,
recovery, fitness, lifestyle, wearable measurements, imaging, clinical judgment,
and every other health domain. It does not estimate lifespan or mortality, predict
disease, diagnose, recommend treatment, express health quality, or produce years
gained/lost. The result must retain these limitations wherever it is stored or
audited.
