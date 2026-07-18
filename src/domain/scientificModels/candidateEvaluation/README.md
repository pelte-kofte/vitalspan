# Scientific candidate evaluation and prioritization

## Decision

No new candidate is currently authorized for production implementation.

A **named, versioned KDM calibration** is the highest-priority next age-model
program, but generic KDM is not a scientific model that Vitalspan may calculate.
The next work must select and audit one calibration; calculation implementation can
begin only after that calibration, its exact inputs, population, external
dependencies, incremental value, and overlap with Clinical PhenoAge are independently
reviewed.

Clinical PhenoAge v1.0.0 remains unchanged and is included only as the production
reference. No multimodal biological-age calculation exists.

## Method

Ten candidates were evaluated independently against 25 qualitative criteria. The
allowed findings are Excellent, Strong, Moderate, Limited, Insufficient, Unknown,
and Not Applicable. The evaluation has no numeric score, ranking total, coefficient,
or automatic decision threshold.

Every dossier includes:

- scientific construct and required inputs;
- strengths, limitations, validation history, controversies, and missing evidence;
- measurement burden, cost, and availability;
- complete qualitative rubric findings;
- compatibility with every scientific architecture boundary;
- twelve explicit risk categories and mitigations;
- implementation readiness and governance prerequisites; and
- evidence-based priority placement.

The typed source of truth is `SCIENTIFIC_CANDIDATE_DOSSIERS`. Validation requires
every candidate, rubric criterion, architecture area, and risk category to be
present. No candidate can bypass governance.

## Priority roadmap

### Reference only

**Clinical PhenoAge v1.0.0** remains the sole validated production model. It is
Blood-Based Phenotypic Age, not whole-person or multimodal age.

### Tier 1 — next formal candidate program

**Named, versioned KDM calibration**

KDM is the highest-value next age-model candidate because it has an explicit
age-in-years construct, peer-reviewed methodological evidence, and potentially
accessible clinical inputs. It is not ready to implement. KDM is a method, and
different biomarker panels and reference populations create different models.

Required before calculation work:

1. Select one named peer-reviewed calibration.
2. Freeze its biomarker panel, population, stratification, units, and dependencies.
3. Independently reproduce reference results.
4. Demonstrate incremental value beyond Clinical PhenoAge.
5. Complete biomarker, outcome, population, and correlation overlap review.
6. Approve a versioned registry record and input policy.

The KDM method paper explicitly noted the difficulty of comparing biological-age
methods without a precise construct, while the 2013 NHANES III implementation found
KDM useful for mortality-related aging research. Neither source creates a universal
KDM calibration. [Klemera–Doubal 2006](https://pubmed.ncbi.nlm.nih.gov/16318865/),
[Levine 2013](https://pubmed.ncbi.nlm.nih.gov/23213031/).

### Tier 2 — strong future candidates

**Direct measured VO₂max** should remain Normative Context. Direct CPET has strong
physiological, normative, and outcome evidence, but percentile or expected fitness
must not be converted into biological-age years. A future modifier role would
require independent validation of a complete composite, not a hand-authored age
conversion. [FRIEND reference standards](https://pubmed.ncbi.nlm.nih.gov/26455884/),
[cardiorespiratory fitness and mortality](https://pubmed.ncbi.nlm.nih.gov/30646252/).

**DNAm PhenoAge** is scientifically established research, but Vitalspan should not
consider implementation without validated methylation laboratory access, a locked
assay and preprocessing pipeline, licensing review, and independent end-to-end
verification. Its training target is related to clinical Phenotypic Age, so a
different modality does not guarantee an independent construct.
[Primary model](https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/).

### Tier 3 — interesting, lower priority

**CardioMetAge** is promising but very recent. Its NHANES and UK Biobank results are
development-team evidence, not independent replication. Blood and cardiometabolic
outcome overlap with Clinical PhenoAge is likely substantial. Reevaluate only after
independent replication, implementation audit, and version-stability evidence.
[Primary 2026 publication](https://pubmed.ncbi.nlm.nih.gov/41620721/).

**Frailty Index** is a valid and widely reproduced deficit-accumulation construct,
especially in older populations. It should remain separately reported frailty,
never be converted into years or allowed to alter an age estimate. A future product
module would need a population-appropriate, versioned deficit set.
[Standard construction procedure](https://pubmed.ncbi.nlm.nih.gov/18826625/).

### Research only

**DunedinPACE** must remain a Pace-of-Aging Measure. Its training target used
longitudinal organ-system change and it has meaningful research evidence, but pace
per biological year and age in years are distinct. Future presentation could show
them in parallel only after laboratory, population, licensing, and clinical review;
automatic conversion or combination remains prohibited.
[DunedinPACE primary study](https://pubmed.ncbi.nlm.nih.gov/35029144/).

**DNAm GrimAge** remains research-only. Strong mortality associations do not remove
the risks created by its mortality-surrogate meaning, embedded smoking signal,
methylation pipeline, and potential lifespan or disease interpretation.
[GrimAge primary study](https://pmc.ncbi.nlm.nih.gov/articles/PMC6366976/).

**Sleep-derived biological age** remains outside production. Sleep duration and
regularity have outcome associations, but no canonical independently validated
sleep-age construct exists. Emerging machine-learning models do not justify
converting consumer sleep data into age.
[sleep-duration evidence](https://pubmed.ncbi.nlm.nih.gov/20469800/),
[sleep-regularity cohort](https://pubmed.ncbi.nlm.nih.gov/37738616/).

### Rejected

**HRV-based biological age** should not enter Vitalspan. No canonical validated age
transformation exists, and device, posture, breathing, recording duration, artifact,
medication, rhythm, fitness, and population effects are material. HRV remains a
source-attributed Recovery monitoring signal.
[HRV normative-method review](https://pubmed.ncbi.nlm.nih.gov/20663071/),
[age and HRV cohort](https://pubmed.ncbi.nlm.nih.gov/34624048/).

## Special decisions

- **KDM next?** Next formal candidate program, yes; next production calculation,
  no. A named calibration and full governance are prerequisites.
- **VO₂max evolution?** Keep normative. It may become a validated modifier only as
  part of an independently validated future composite. Never convert percentiles to
  years.
- **DunedinPACE independent forever?** Its construct must always remain distinct.
  Parallel presentation may be possible; unit conversion is not.
- **Methylation without a laboratory?** No. Do not infer, manually enter, or proxy
  methylation evidence.
- **Wearable-derived age?** Exclude under current evidence. Keep HRV and sleep as
  domain monitoring and interpretation.
- **Frailty?** Keep separately reported and population-specific.

## Common blocking risks

- population and calibration transportability;
- age, risk, pace, frailty, and context being treated as interchangeable;
- shared biomarkers and outcome-level double counting;
- laboratory, device, preprocessing, and reference-version drift;
- intervention response inferred from cross-sectional change;
- clinical or lifespan interpretation without validation;
- unsupported whole-person or multimodal marketing claims; and
- implementation before independent reproduction.

## Open scientific questions

- Which named KDM calibration has sufficient transparency, accessibility,
  population fit, and independent validation?
- Does any KDM calibration add independent information beyond Clinical PhenoAge
  after shared biomarker and outcome review?
- What external evidence would justify direct VO₂max evolving beyond normative
  context?
- Can methylation laboratory pipelines be reproduced across vendors and platforms
  without altering scientific meaning?
- Which epigenetic outputs provide independent construct information rather than a
  correlated surrogate of existing production evidence?
- Can CardioMetAge be independently reproduced, and how much incremental value
  remains after Clinical PhenoAge comparison?
- What target population would justify a Vitalspan Frailty Index?
- What evidence threshold would justify reopening rejected wearable-age models?
- Who owns independent scientific review, calibration approval, claims governance,
  surveillance, and retirement for every future candidate?
