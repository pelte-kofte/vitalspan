# Multimodal Biological Age scientific architecture

## Current product truth

Vitalspan currently has exactly one validated production age model: Clinical
PhenoAge v1.0.0. Its product output is **Blood-Based Phenotypic Age**. It is not a
whole-person age and must not be labeled Multimodal Biological Age.

No multimodal calculation, weighting, conversion, modifier contribution, or
composite output exists in this package. Sleep, Recovery, Fitness, Lifestyle,
Nutrition, Medication, Supplement, Peptide, and Therapy evidence remains domain
interpretation and does not alter Clinical PhenoAge.

## Architecture boundary

```text
Scientific model registry
        ↓
Component role and output construct
        ↓
Versioned component eligibility and execution authorization
        ↓
Model-specific result retained independently
        ↓
Overlap + temporal + population + validation compatibility review
        ↓
Explicit combination eligibility and authorization metadata
```

This boundary stops at eligibility metadata. It contains no operation that merges
values or produces a composite age.

## Component roles

| Role | Permitted scientific use | Age-in-years output | Combination behavior |
| --- | --- | --- | --- |
| Primary Age Estimate | Report its own validated age construct | Yes | Requires another independently validated model and explicit review |
| Independent Age Estimate | Report a separately validated age construct | Yes | Requires explicit independence, overlap, and compatibility review |
| Pace-of-Aging Measure | Report pace in its native construct | No | Cannot combine with age by conversion |
| Validated Risk Modifier | Retain a validated risk construct | No | May enter review only for a separately validated composite; cannot add/subtract years |
| Normative Context | Report percentile or deviation separately | No | Ineligible for age combination |
| Interpretive Context | Explain source-attributed evidence | No | Ineligible for age combination |
| Monitoring Signal | Preserve an observation in its native meaning | No | Ineligible for age combination |
| Research Only | Retain evidence for audit | No production output | Cannot execute or combine |
| Rejected | Preserve rejection rationale | No | Cannot execute or combine |

The machine-readable policy is `SCIENTIFIC_COMPONENT_ROLE_POLICIES`.

## Current registry mapping

- Clinical PhenoAge v1.0.0 is the Primary Age Estimate and the sole production
  model. Its current combination status is ineligible because one model is not
  multimodal.
- KDM is a future Independent Age Estimate only after a named calibration,
  biomarker panel, population, version, and independent validation exist. The
  generic KDM registry entry is unavailable.
- Direct measured, protocol-compatible VO2max is Normative Context. It is not an
  age conversion and currently remains research-only.
- DunedinPACE retains its Pace-of-Aging construct and remains research-only.
- Frailty can remain a separately reported context construct and cannot alter age.
- Sleep, HRV, resting heart rate, smoking, alcohol, nutrition, and intervention
  domains remain interpretation or monitoring context.
- Research-only, context, and rejected registry entries cannot enter a composite.

Every registry entry has exactly one conservative role mapping in
`SCIENTIFIC_MODEL_COMPONENT_MAPPINGS`. Non-model domain signals are governed by
`DOMAIN_CONTEXT_ROLE_MAPPINGS`.

## Construct compatibility

Age in years, pace per biological year, percentile, probability, normative
deviation, proportion, and context are distinct constructs. Unit compatibility
cannot make different constructs scientifically interchangeable. A pace output can
never masquerade as age; a percentile cannot be converted to years; a risk estimate
cannot be relabeled biological age.

Pairwise review fails closed unless all of the following are explicit and approved:

- exact model and component versions;
- construct and unit compatibility;
- shared biomarker, training-population, outcome, correlation, and double-counting
  review;
- current, model-governed temporal alignment;
- supported and compatible populations;
- independent validation and calibration availability;
- a never-impute missing-data policy;
- scientific-review approval; and
- an explicit combination authorization reference.

Passing compatibility permits only an authorized research relationship. It does
not define a composite calculation.

## Overlap and double counting

Clinical PhenoAge explicitly records chronological age, albumin, creatinine,
glucose, CRP, lymphocyte percentage, MCV, RDW, alkaline phosphatase, and WBC. Its
correlation groups include inflammation, metabolic, hematologic, and renal evidence.

Any future inflammation, cardiometabolic, renal, or hematologic component sharing
those inputs must receive explicit overlap, correlation, and double-counting review.
Unknown overlap metadata blocks combination. Correlation groups are governance
labels only; they are never coefficients or weights.

## Temporal alignment

Laboratory collections, point assessments, rolling wearable windows, and current
behavior questionnaires retain separate time semantics. This architecture defines
no universal maximum alignment duration. Model-specific review must supply it.

Unknown timestamps, stale components, a missing alignment policy, or evidence
outside an approved alignment window blocks compatibility. No asynchronous evidence
is treated as one synchronized biological state by default.

## Uncertainty

Every component preserves eight separate categories:

- model uncertainty;
- measurement uncertainty;
- population uncertainty;
- temporal uncertainty;
- device or assay uncertainty;
- combination uncertainty;
- missing evidence; and
- conflicting evidence.

Each category retains its own status, explanation, and provenance. They are not
collapsed into an overall scientific score. Component confidence remains evidence
confidence and does not replace these records.

## Availability states

The architecture can describe:

- Single Validated Model Available;
- Multiple Compatible Models Available;
- Multiple Incompatible Models Available;
- Context Available Without Additional Model;
- Insufficient Scientific Evidence; and
- Research Preview Only.

One validated model always returns Single Validated Model Available with
`multimodalAgeAvailable: false`.

## Governance lifecycle

Combination candidates must complete every stage in order:

1. Registry Entry
2. Evidence Audit
3. Internal Rubric Review
4. Versioned Input Policy
5. Eligibility Implementation
6. Calculation Implementation
7. Independent Verification
8. Compatibility Review
9. Combination Authorization
10. Production Approval

Stages cannot be skipped. Retirement requires a scientific reason; supersession
requires the replacement component identifier. A scientific reviewer can reject a
component at any point, regardless of rubric completeness.

The component review references the existing unscored scientific rubric and adds
construct compatibility, overlap risk, and independent replication review. It does
not calculate a score, threshold, total, or automatic approval.

## Open scientific questions

- Which named KDM calibration is sufficiently transportable and reproducible?
- Can two age-in-years models be shown together without implying that agreement
  validates either model or disagreement identifies a winner?
- What prospective evidence would validate a combined construct rather than only
  its individual components?
- Which population-specific calibration and subgroup rules are necessary?
- What model-specific temporal windows are scientifically defensible?
- How should acute illness, laboratory drift, device change, and repeat testing
  affect compatibility?
- What independent governance body owns combination authorization, surveillance,
  retirement, and revalidation?
