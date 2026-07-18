# KDM calibration evidence review and selection

Status: **scientific decision only**. This package contains literature metadata,
qualitative assessments, governance decisions, and validation of the review itself.
It contains no KDM calculation, executable scientific parameters, biological-age
result, product integration, registry mutation, eligibility mutation, authorization
path, UI, recommendation engine, or model-combination behavior.

## Decision

**Recommendation: Proceed after prerequisites.**

The single future implementation candidate is:

> **KDM-Levine-NHANES-III-KDM1 v1.0.0**
>
> Levine 2013 NHANES III KDM1, using the same fixed ten-biomarker panel in
> sex-stratified calibrations.

This is not implementation approval. `implementationAuthorized` is permanently
`false` for this phase. The candidate remains unavailable until the independent
artifact, assay, population, repeatability, overlap, validation, and governance
prerequisites in `KDM_PRODUCTION_CALIBRATION_DECISION` are complete.

KDM1 is selected because it is the most mature fixed calibration identity in the
review: a named panel, long NHANES III mortality follow-up, peer-reviewed external
reuse, an independently testable “Levine Original” identity in later literature,
and less exact overlap with Clinical PhenoAge than the BioAge V2 or Mak 18-marker
alternatives. Selection is deliberately conditional because CMV optical density,
spirometry, historical assay compatibility, binary sex strata, and international
transport remain unresolved.

## What counts as a calibration

The literature frequently uses “KDM” for scientifically different objects. This
review uses these boundaries:

- A **method** describes how a KDM estimate can be constructed but supplies no
  fixed population, panel, units, preprocessing, or version.
- A **named calibration** fixes the reference cohort, panel, stratification, and
  preprocessing sufficiently to identify one scientific model.
- A **study-specific adaptation** creates a new model for available study data. It
  does not inherit validation from another panel merely because both use KDM.
- An **external reuse** evaluates an existing calibration and must not be counted
  as another independent model.
- An **implementation framework** can reproduce or create many calibrations; the
  software name is not a scientific calibration name.
- A **validation dataset role** tests a model. “NHANES IV” does not identify one
  calibration without a named panel, cycles, preprocessing, and reference cohort.

## Calibrations and implementations reviewed

| Record | Kind | Reference population | Panel | Exact external evidence | Decision |
| --- | --- | --- | --- | --- | --- |
| Klemera–Doubal 2006 | Method only | Simulated data | None | Not applicable | Rejected as a production identity |
| Levine NHANES III KDM1 | Named calibration | 9,389 US adults, 30–75 | Same 10 biomarkers, sex-stratified parameters | Dunedin reuse; NHANES IV/BioAge comparisons | **Selected after prerequisites** |
| Levine NHANES III KDM2 | Named calibration | Same NHANES III cohort | Different 7-marker panels by sex | Limited exact reuse | Research only |
| Dunedin 2015 | External reuse | Retains NHANES calibration | Published 10-marker panel | Midlife construct evidence | Not a distinct calibration |
| CALERIE 2017 | Study adaptation | NHANES-derived; projected to 220 trial participants | 10-marker study panel | Longitudinal CALERIE analysis | Research only |
| BioAge V2 2021 | Study adaptation/toolkit example | NHANES III training, NHANES IV test | 12-marker combined panel | CALERIE repeated measures | Research only |
| Zhong SLAS 2020 | Named calibration | 2,844 Chinese Singaporeans, 55–94 | Sex-specific 8/10-marker functional panels | Same-cohort 8-year outcomes | Research only |
| Liu CHNS 2020 | Named calibration | 8,119 Chinese adults, 20–79 | 12 biomarkers | CHARLS used an 8-marker adaptation | Research only |
| Chan UK Biobank 2021 | Named calibration | 141,254 healthy UK volunteers, 40–70 | 72 inputs represented by 51 components | No independent exact cohort | Research only |
| Mak NHANES III/UKB 2023 | Named calibration | 7,694 NHANES III reference participants | 18 biomarkers | NHANES IV test and UKB projection | Research only |
| NHANES IV role | Validation/framework role | Cycle dependent | No canonical panel | Outcome validation | Not a distinct calibration |

The search also screened recent small or narrowly scoped variants, including a
healthy Beijing Han Chinese model, disease-specific adaptations, deep multi-omic
KDM applications, abbreviated Health ABC panels, and later UK Biobank reuse
studies. They do not displace the shortlisted calibrations: they are newer, less
independently replicated, study-specific, panel-incomplete in accessible primary
artifacts, or not intended as routine clinical production models. Non-peer-reviewed
calculators, blogs, undocumented commercial models, and GitHub reproductions were
excluded as evidence.

## Scientific dossiers

### Klemera–Doubal 2006

The original paper is the authoritative method publication. Its validation uses
simulation rather than a human reference cohort, so it supplies no production
panel, units, laboratory context, population, or stable result identity. It is the
foundation for all later records and is **rejected** as a production calibration.
Implementing it as “generic KDM” would invent the missing science.

Primary source: [Klemera and Doubal 2006](https://pubmed.ncbi.nlm.nih.gov/16318865/).

### Levine NHANES III KDM1 — selected conditionally

- **Publication:** Morgan E. Levine, 2013.
- **Population:** 9,389 complete-case NHANES III participants aged 30–75 in the
  United States; mortality follow-up extended up to 18 years with 1,843 deaths.
- **Sex handling:** parameters were estimated separately for men and women; KDM1
  retains the same ten biomarkers in both strata.
- **Panel:** CRP, creatinine, HbA1c, albumin, total cholesterol, CMV antibody optical
  density, blood urea nitrogen, alkaline phosphatase, FEV1, and systolic blood
  pressure, plus chronological age where specified by the published variant.
- **Units:** historical NHANES definitions include mg/dL for CRP, creatinine,
  cholesterol, and blood urea nitrogen; percent for HbA1c; g/dL for albumin; U/L
  for alkaline phosphatase; mL for FEV1; mmHg for systolic pressure; and an
  assay-specific optical-density result for CMV.
- **Validation:** direct mortality comparison in NHANES III; the published
  ten-marker age was reused in the Dunedin birth cohort; later BioAge work retained
  it as the “Levine Original” comparator and evaluated it in NHANES IV.
- **Strengths:** stable panel identity, multisystem coverage, mortality relevance,
  understandable inputs, peer-reviewed reuse, and lower overlap with Clinical
  PhenoAge than most modern blood-only KDM adaptations.
- **Limitations:** complete-case selection, historical US assays, CMV result
  nonstandardization, spirometry protocol dependence, binary sex strata, no direct
  international production validation, and no evidence that one cross-sectional
  estimate measures pace or treatment response.
- **Production readiness:** **Proceed after prerequisites**, never proceed now.

Primary and supporting sources: [Levine 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3660119/),
[Dunedin reuse](https://pmc.ncbi.nlm.nih.gov/articles/PMC4522793/),
[BioAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC8602613/), and
[NHANES IV comparison](https://pmc.ncbi.nlm.nih.gov/articles/PMC6599717/).

### Levine NHANES III KDM2

KDM2 used principal-component selection to create different seven-marker panels
for men and women. It performed best in the source mortality comparison, but this
is chiefly internal evidence. Exact external reuse is thinner than for KDM1, panel
membership changes by sex, the male panel retains CMV optical density, and both
panels retain spirometry. It is **research only**. A favorable result in the source
study does not compensate for weaker version stability and production governance.

### Belsky/Dunedin 2015

Dunedin applied the published ten-marker NHANES age to 954 members of a 1972–1973
New Zealand birth cohort assessed at age 38 and compared it with longitudinal
physiological change and functional evidence. This supports external construct
validity for Levine KDM1. It is **not a new calibration** and must never be counted
as an independent KDM component.

### CALERIE 2017

The CALERIE study applied a ten-marker NHANES-derived adaptation to 220 healthy,
non-obese trial volunteers across baseline, 12 months, and 24 months. The panel used
albumin, alkaline phosphatase, CRP, total cholesterol, creatinine, HbA1c, systolic
pressure, blood urea nitrogen, uric acid, and white-cell count. Trial HbA1c was
inferred from serum glucose and some missing visit values were imputed. Those
choices conflict with Vitalspan’s fail-closed evidence policy. The almost entirely
White, selected intervention cohort also cannot calibrate an international consumer
population. This adaptation is **research only**.

Source: [CALERIE Biobank analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC5861848/).

### BioAge V2 2021

BioAge is a peer-reviewed toolkit, not one universal model. Its V2 demonstration
trained a 12-marker panel in NHANES III, tested it in NHANES IV, and projected it
into CALERIE. The panel is operationally attractive because it uses laboratory
measurements, but eight inputs exactly overlap Clinical PhenoAge: albumin,
alkaline phosphatase, creatinine, CRP, white-cell count, lymphocyte percentage,
mean cell volume, and red-cell distribution width. That creates the review’s
highest double-counting risk and weakens its value as an independent multimodal
component. The toolkit’s ability to create custom models is scientifically useful
but makes its name unsuitable as a frozen calibration identity. V2 is **research
only**.

### Zhong Singapore Longitudinal Aging Study 2020

This calibration used 68 candidate physiological measures in 2,844 Chinese
Singaporeans aged 55–94, selecting different final panels for men and women and
following frailty and mortality for eight years. Core inputs include renal,
pulmonary, cognitive, strength, gait, and other functional evidence. It is important
Asian-population evidence, but the restricted older age range, one population,
same-resource validation, protocol-sensitive functional tests, and unresolved
authoritative panel artifact make it **research only** for Vitalspan.

Source: [Zhong et al. 2020](https://pubmed.ncbi.nlm.nih.gov/31179487/).

### Liu CHNS 2020

The CHNS calibration used 12 markers in 8,119 Chinese adults aged 20–79: total
cholesterol, triglycerides, HbA1c, urea, creatinine, albumin, high-sensitivity CRP,
red-cell count, platelet count, ferritin, transferrin, and systolic pressure. It was
associated with mortality and disease counts. A 9,304-person CHARLS replication
was valuable population evidence, but CHARLS lacked four development inputs and
therefore evaluated an eight-marker adaptation, not the exact 12-marker model.
This is a strong China-specific research program but has no non-Chinese transport
evidence. It is **research only** for an international product.

Source: [Liu et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC8521780/).

### Chan UK Biobank 2021

Chan and colleagues created sex-specific ages in 141,254 healthy participants from
UK Biobank. Seventy-two quality-controlled biomarkers were represented by 51
principal components. The paper also evaluated a smaller practical panel centered
on lung function, reaction time, IGF-1, cystatin C, grip strength, and blood
pressure, with additional sex-specific inputs. Prospective mortality and hospital
admission evidence is valuable, but the healthy-volunteer selection, 40–70 age
range, high-dimensional transform, sex-specific structure, and absence of an
independent exact-cohort replication produce very high maintenance burden and low
international portability. It is **research only**.

Source: [Chan et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8202154/).

### Mak NHANES III 18-marker KDM 2023

This program selected 18 cross-cohort-compatible clinical measurements, trained
KDM in 7,694 NHANES III participants, tested mortality association in 3,849 NHANES
IV participants, and projected the model into 308,156 UK Biobank participants for
cancer-incidence analyses. The design separates training, general outcome testing,
and projection cohorts, a genuine strength. It remains recent, exact independent
replication is limited, the panel is burdensome, many inputs overlap Clinical
PhenoAge, and glycemic inputs materially affected an unexpected prostate-cancer
association. It is **research only** pending broader replication.

Source: [Mak et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10307789/).

### NHANES IV and later recalibrations

No single canonical peer-reviewed “NHANES IV KDM” calibration was identified in
the reviewed evidence. NHANES IV is primarily used to test NHANES III-trained
models or as data from which researchers construct a newly named custom model.
Cycle-specific assay corrections and panel availability vary. Vitalspan must not
turn a dataset generation label into a model version.

## Biomarker comparison and Clinical PhenoAge overlap

| Panel | Routine accessibility | Specialty/protocol burden | Exact Clinical PhenoAge overlap | Main standardization risk |
| --- | --- | --- | --- | --- |
| Levine KDM1 | Mixed | CMV optical density, FEV1, blood pressure | Albumin, creatinine, CRP, alkaline phosphatase | Historical assays, spirometry, CMV optical density |
| Levine KDM2 | Mixed | Sex-specific panels, FEV1, CMV in men | Panel dependent | Different input identity by sex |
| CALERIE 2017 | Mostly routine | Blood pressure | Albumin, creatinine, CRP, alkaline phosphatase, WBC | Inferred HbA1c and study imputation |
| BioAge V2 | Routine blood | NHANES harmonization | 8 of 9 PhenoAge blood measurements | Very high double counting |
| Zhong SLAS | Mixed | Cognitive, gait, strength, spirometry | Little direct blood overlap | Test protocol and older-population calibration |
| Liu CHNS | Mostly routine | Ferritin/transferrin context | Albumin, creatinine, CRP | China-specific assay and population transport |
| Chan UKB | Research-scale | 72 inputs, principal components, functional testing | Panel dependent | Transform and UK Biobank protocol lock-in |
| Mak 18 | Mixed | FEV1, waist, blood pressure | Albumin, creatinine, glucose, CRP, lymphocytes, MCV, RDW, alkaline phosphatase | Cross-cohort unit and protocol matching |

No overlap count is treated as a score. Shared inputs create dependence risk; unique
inputs do not automatically create scientific independence. Acute illness can
materially alter CRP, albumin, white-cell measures, renal markers, blood pressure,
and lung function. Eligibility must therefore govern collection context rather
than interpret every compatible number as stable aging evidence.

## Population comparison

- **NHANES III:** broad US population sampling and long mortality follow-up, but
  historical assays, complete-case selection, and incomplete international
  transport evidence.
- **Dunedin:** excellent same-age midlife construct evidence, but one birth cohort
  and not a calibration population.
- **CALERIE:** randomized repeated measures, but selected healthy non-obese trial
  volunteers, approximately 95% White, short follow-up, and study-specific inputs.
- **SLAS:** important Chinese Singaporean older-adult evidence, but no younger
  calibration range and no external population validation.
- **CHNS/CHARLS:** strong mainland Chinese coverage across many provinces; the
  exact 12-marker calibration was not reproduced in CHARLS.
- **UK Biobank:** very large prospective cohorts, but healthy-volunteer and
  predominantly White selection limit general-population and international claims.

One calibration cannot be declared universally fair merely because its source
cohort contains more than one demographic group. Unsupported users must receive an
unavailable result, not a guessed country or ethnicity branch.

## Qualitative scientific rubric

The machine-readable dossier evaluates every record without numeric scoring on:
evidence quality, replication, clinical adoption, external validation, longevity
relevance, construct clarity, interpretability, biomarker quality, calibration and
population robustness, generalizability, scientific maturity, maintenance burden,
version stability, implementation complexity, future-proofing, double-counting
risk, Clinical PhenoAge compatibility, consumer-health suitability, and
scientific-platform suitability.

The central comparison is qualitative:

- **Levine KDM1:** strongest combination of fixed identity, maturity, reuse, and
  manageable independence; limited by assay age and transport.
- **Levine KDM2:** strong internal mortality performance; weaker exact replication
  and more complex sex-specific input identity.
- **BioAge V2:** strongest routine-lab feasibility; unacceptable overlap risk for
  use as an independent companion to Clinical PhenoAge without new evidence.
- **Liu CHNS:** strongest population-specific mainland Chinese program; insufficient
  international transport and no exact full-panel external replication.
- **Chan UKB:** strongest sample size and breadth; weakest routine feasibility and
  one of the highest maintenance burdens.
- **Mak 18:** strongest explicit train/test/projection separation among newer
  adaptations; too recent, burdensome, overlapping, and thinly replicated.
- **Zhong SLAS:** strong mortality/frailty relevance in older Asian adults; narrow
  age/population scope and protocol-heavy panel.

## Architectural compatibility

The selected calibration fits the existing scientific architecture only after a
later authorized implementation program:

```text
Named immutable calibration
        ↓
Calibration-specific registry version
        ↓
Exact panel, unit, assay, population, and sex-stratum eligibility
        ↓
Integrity-bound authorization for that version only
        ↓
Independently validated calculation engine
        ↓
Model-specific typed result and immutable provenance
```

- **Registry and versioning:** compatible with a new explicit model/version record;
  the generic KDM placeholder may never execute.
- **Eligibility:** compatible with fail-closed required inputs, units, assay,
  population, and calibration identity checks.
- **Authorization:** currently blocked and unchanged.
- **Validation:** currently blocked until independent reference fixtures and
  scientific verification exist.
- **Component contracts:** compatible as an independent age estimate only after
  scientific approval; selection does not make it combinable.
- **Temporal policy:** requires a frozen measurement context and a new lineage for
  any successor version. No cross-version trend may be inferred.
- **Uncertainty:** assay, population, acute-illness, missing-input, and overlap
  uncertainty remain separate and fail closed.
- **Combination safety:** blocked until incremental independence from Clinical
  PhenoAge is demonstrated. No averaging, weighting, or multimodal age is approved.

## Calibration governance answers

1. **Exactly one calibration?** Yes—one active immutable version per result lineage.
2. **Automatic country change?** No. Country is not a scientifically valid silent
   selector.
3. **Different by ethnicity?** Not automatically and never by inference. Only a
   named, directly validated subgroup branch may use such a requirement.
4. **Different by sex?** Only where the published calibration explicitly requires
   validated sex-specific parameters. Unsupported context fails closed.
5. **Different by laboratory?** No silent recalibration. Laboratory compatibility
   is eligibility evidence; a local refit is a new model version.
6. **Manual user choice?** Never. Calibration is scientific governance, not a user
   preference.
7. **Multiple calibrations and longitudinal consistency?** They damage consistency
   if spliced. Separate versions require separate lineages.
8. **Future recalibration?** Treat it as a new model with full evidence, validation,
   eligibility, authorization, overlap, and migration review.
9. **Freeze permanently?** Every released version is immutable forever. Governance
   may approve a separately named successor, not mutate the old version.
10. **Migration?** Preserve old results and provenance, establish an explicit
    effective date, run internal parallel validation, and begin a new series unless
    a bridging study supports comparison.

## Prerequisites before implementation

- Independently obtain and audit the complete sex-specific scientific artifacts.
- Freeze input identity, units, specimen, assay, CMV, spirometry, blood-pressure,
  outlier, and collection-context requirements.
- Establish lawful, durable access to every calibration artifact.
- Validate transport in Vitalspan target populations and define unsupported states.
- Establish repeatability and acute-illness exclusion policies.
- Measure correlation and incremental evidence relative to Clinical PhenoAge
  without combining outputs.
- Produce independent reference fixtures, runtime validation, and immutable
  scientific fingerprints in a separately authorized phase.
- Complete statistical, clinical, laboratory, regulatory, and governance review.

## Open scientific uncertainties and remaining risks

- Historical CMV optical density may not be reproducible across modern assays.
- Spirometry and blood-pressure protocols may create larger longitudinal variation
  than the biological change of interest.
- NHANES III relationships may not transport to current international populations.
- Binary sex-specific calibration leaves an unsupported scientific state that must
  be handled without guessing.
- KDM1’s incremental value beyond Clinical PhenoAge is not established.
- Cross-sectional KDM change is not validated as pace of aging or treatment effect.
- Acute illness and medication changes can affect multiple panel inputs.
- A future successor can break longitudinal comparability even if it appears more
  accurate cross-sectionally.

## Quality-gate interpretation

Scientific consistency requires every reviewed object to retain its true role:
method, calibration, adaptation, reuse, toolkit, or validation dataset. Repository
terminology must use the full recommended version name and must not use “generic
KDM,” “NHANES IV KDM,” “Dunedin KDM,” or “BioAge KDM” as if those labels alone
identified a production calibration. Documentation and typed-data validation ensure
that exactly one conditional candidate is selected and that no implementation is
authorized.
