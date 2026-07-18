# Systematic review of production-ready blood-based biological-age models

## Status and decision

This document is a scientific review only. It contains no executable model,
formula, coefficient, calculator, model artifact, eligibility rule, authorization
path, registry mutation, UI behavior, recommendation logic, or production wiring.

**Final recommendation: Keep Clinical PhenoAge only.**

No reviewed second model is currently justified for production. Several newer
models improve prediction of selected outcomes in their development publications,
but none is scientifically superior to Clinical PhenoAge across construct clarity,
independent replication, exact reproducibility, population transportability,
version stability, routine measurement burden, and incremental information. The
historical KDM candidate also fails the exact-reproduction gate documented in the
Phase 4.0B reconstruction.

This decision does not claim that Clinical PhenoAge is a clinical diagnostic or a
complete measure of ageing. It means only that adding a second blood-derived age
today would create more scientific ambiguity than independently validated
information.

## Review protocol

### Review question

Among peer-reviewed models that derive an age-like or physiological-dysregulation
measure primarily from routine blood biomarkers, which model, if any, has enough
scientific validity, reproducibility, and operational stability to become
Vitalspan's second production biological-age implementation after Clinical
PhenoAge?

### Search date and sources

The search was updated through **17 July 2026**. Searches covered PubMed, PubMed
Central, Europe PMC, publisher full text, article supplements, and official
dataset documentation. Citation chaining was performed from the original Clinical
PhenoAge, KDM, homeostatic-dysregulation, BioAge, ENABL Age, PCAge/LinAge, GOLD
BioAge, CardioMetAge, Physiological Aging Index, and circulating-biomarker model
papers.

Search concepts combined terms for biological age, phenotypic age, physiological
age, blood chemistry, clinical biomarkers, mortality, morbidity, external
validation, reproducibility, KDM, homeostatic dysregulation, BioAge, ENABL Age,
PCAge, LinAge, GOLD BioAge, CardioMetAge, and blood-biochemistry clocks.

Only primary peer-reviewed publications and their official supplements were used
to establish model claims. Later primary validation studies were used for
replication claims. Reviews, blogs, calculators, and repositories were not used as
evidence of scientific validity.

### Inclusion criteria

A candidate was included in the main comparison when it:

- was peer reviewed;
- used routine blood chemistry or hematology as its primary physiological input;
- produced an age-like estimate or an explicitly defined physiological ageing
  construct;
- published enough methodology to identify its development strategy;
- evaluated mortality, morbidity, function, or transport beyond chronological-age
  fit alone; and
- was non-proprietary in scientific concept.

Models combining blood with a small number of routine clinical measurements were
screened as near-eligible and labeled clearly. They were not silently treated as
blood-only models.

### Exclusion criteria

The review excluded DNA methylation clocks, proteomic and metabolomic clocks that
require research-scale assays, imaging clocks, wearable-only clocks,
questionnaire-only clocks, non-peer-reviewed work, undocumented calculators, and
commercial or patent-dependent algorithms without an unrestricted immutable
scientific artifact.

The 2026 Blood Biochemistry Age Clock was screened because it is peer reviewed,
but excluded from production candidacy because the publication reports company
employment, share interests, and a related patent application. It is also only
days old at the review cutoff and has no independent replication.
[Primary publication](https://pubmed.ncbi.nlm.nih.gov/42437599/).

### Meaning of “scientifically superior”

Higher discrimination in one publication is not sufficient. A model is superior
for production only if it has evidence at least as strong as the reference across:

1. a clearly defined, appropriate ageing construct;
2. prospectively relevant validation;
3. independent external replication of the exact model;
4. a complete and reproducible scientific artifact;
5. stable panel, units, preprocessing, reference population, and version identity;
6. transport across laboratories and target populations;
7. practical, source-attributed measurements without guessed or imputed inputs;
8. interpretable failure and uncertainty boundaries;
9. evidence independent enough from Clinical PhenoAge to justify a second result;
   and
10. maintenance and governance burden proportionate to incremental value.

No numeric score or pooled meta-analysis was used. Reported discrimination values
cannot be compared naively because studies differ in populations, age ranges,
outcomes, follow-up, covariates, missing-data policies, and whether chronological
age is included in both the model and comparator.

## Models reviewed

| Model or family | Construct | Inputs | Validation and replication | Reproducibility | Clinical PhenoAge overlap | Production finding |
| --- | --- | --- | --- | --- | --- | --- |
| Clinical PhenoAge | Mortality-equivalent phenotypic age | Age plus 9 routine blood markers | NHANES development and independent-cycle, cohort, disease, and mortality reuse | Complete fixed public specification; independently verified in Vitalspan | Reference | **Production reference** |
| Levine NHANES III KDM1 | Age at which a reference population has similar multisystem physiology | Age, 8 blood markers, blood pressure, FEV1, CMV optical density | Mortality association and later research reuse | Exact historical artifact cannot be reconstructed | 4 exact markers plus related glycaemia | **Not production-ready** |
| Other KDM calibrations | Population-specific physiological age | Panel and population dependent | Many cohort associations; few exact cross-population reuses | “KDM” is a method, not a stable model identity | Variable, usually moderate to high | **Research only** |
| Homeostatic Dysregulation | Distance from a young or reference physiological state | Flexible multisystem blood panel | Cross-population mortality and health evidence | Open method, but no canonical panel or age-in-years output | Common published panel shares 8 of 9 markers | **Do not use as second age** |
| BioAge V2 | NHANES-parametrized KDM/PhenoAge/HD research implementation | Age plus 12 routine clinical markers | NHANES testing and CALERIE analysis | Open toolkit; model customization weakens immutable identity | 8 of 9 markers | **Research only** |
| Deep blood/hematological clocks | Chronological-age prediction from blood | 21–41 routine blood variables depending on version | Multinational age-prediction studies; limited exact outcome replication | Network/version artifacts are not a stable open clinical standard | Broad routine-panel overlap | **Rejected for production** |
| Bortz Full ENC, 2023 | Mortality risk converted to same-sex age | Age, sex, 25 selected UK Biobank blood markers | Geographic UK Biobank holdout only | Published method and supplement; relies on broad panel or imputation | All but one PhenoAge blood signal retained directly or by cell subtype | **Research only** |
| ENABL Age-L, 2023 | Explainable nonlinear mortality risk converted to age | CBC, metabolic, lipid, and leukocyte-differential panels | UK Biobank, NHANES, and cross-dataset transfer in the primary study | Code is reported available; multiple dataset/outcome-specific models complicate identity | Extensive | **Watchlist; not production-ready** |
| Physiological Aging Index, 2024 | Nonlinear mortality-derived physiological age | Age, 17 features including blood, BMI, and systolic pressure | Chinese development/testing and UK Biobank external validation | Detailed supplement, but source data are request-only and exact independent reproduction is absent | 7 exact markers | **Near-eligible research only** |
| PCAge/LinAge/LinAge2, 2024–2025 | Mortality-derived age using principal clinical components | 60–165 laboratory, physiological, and record features by version | NHANES wave split and NHANES III validation for LinAge; later benchmarking | Open parameters/code, but high-dimensional and not blood-only | Extensive | **Outside blood-only scope** |
| GOLD BioAge, 2025 | Gompertz mortality-equivalent age | Age plus 9 routine blood markers; Light version uses 3 | NHANES/UK Biobank plus three Chinese cohorts for Light | Open linear specification and code; no independent team replication yet | Full model shares 8 of 9 markers | **Closest routine-lab watchlist; not production-ready** |
| CardioMetAge, 2026 | Cardiometabolic-mortality-equivalent age | Age plus 12 routine blood, pressure, and pulse measures | NHANES training/testing, UK Biobank validation, CALERIE substitute model | Transparent published specification; no independent replication | 6 exact markers plus related glycaemia | **Domain-specific research only** |
| Blood Biochemistry Age Clock, 2026 | Biomarker-specific mortality-risk contributions expressed in years | 11 routine blood markers | UK Biobank and NHANES analyses in one publication | Patent and commercial conflicts; no replication | Material but not fully independently auditable | **Excluded** |

### Operational comparison

| Model | Primary publication | Accessibility | Interpretability | Open methodology and artifact | Version stability | Implementation feasibility | Maintenance burden | Clinical adoption |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Clinical PhenoAge | Levine/Liu, 2018 | Mostly routine | High at input and output level | Complete fixed specification | High for named v1 | High with strict eligibility | Moderate | High research reuse; no diagnostic-guideline status established |
| Levine KDM1 | Levine, 2013 | Mixed | Moderate | Broad method open; exact artifact incomplete | Historical identity stable, executable identity incomplete | Blocked | Very high | Research use only |
| Other KDM variants | Multiple cohort papers | Panel dependent | Moderate | Method open; calibration artifacts variable | Low unless one calibration is named | Low | High | Research use only |
| Homeostatic Dysregulation | Cohen, 2013 | Mostly routine | Moderate as distance; low as age | Method open; reference and panel must be fitted | Low across custom panels | Moderate as research distance, inappropriate as age | High | Research use only |
| BioAge V2 | Kwon/Belsky, 2021 | Mostly routine | High at marker level | Open research toolkit | Low as a universal model; moderate for frozen study artifact | Technically feasible, scientifically duplicative | High | Research toolkit use |
| Deep blood clocks | Putin, 2016; Mamoshina, 2018 | Broad routine panels | Low to moderate | Architecture published; stable unrestricted weights/version not established | Low | Low | Very high | Research and commercial use; no guideline status |
| Bortz Full ENC | Bortz, 2023 | Low for full panel | Moderate | Method and supplement open | Moderate for full artifact | Moderate only with all 25 markers | High | No established clinical adoption |
| ENABL Age-L | Qiu, 2023 | Moderate | Moderate to high through local attribution | Study code reported open; exact model family has multiple artifacts | Low to moderate | Moderate after artifact selection | Very high | No established clinical adoption |
| PAI | Zhu, 2024 | High for blood; requires vitals | High at feature level | Detailed supplement; development data by request | Moderate for published model | Moderate, but outside blood-only scope | High | No established clinical adoption |
| PCAge/LinAge2 | Fong, 2024/2025 | Low due to feature count | Moderate through components | Parameters and code available | Moderate, with explicit version changes already published | Low for routine product use | Very high | Reported clinic interest, no guideline status established |
| GOLD BioAge | Hao, 2025 | High | High | Fixed linear artifact and code are open | Moderate but very recent | High technically | Moderate | No established clinical adoption |
| CardioMetAge | Li, 2026 | High, with standardized vitals | High | Fixed transparent publication artifact | Low because newly published and substitute variant exists | High technically, limited scientifically | Moderate to high | No established clinical adoption |
| Blood Biochemistry Age Clock | Šelb, 2026 | High | High by stated design | Patent-linked; unrestricted production artifact not established | Insufficient | Excluded | Unknown/high licensing burden | None established |

## Scientific dossiers

### Clinical PhenoAge — production reference

**Construct.** Clinical PhenoAge is an all-cause-mortality-derived phenotypic age.
It maps the joint mortality information from chronological age and nine clinical
measurements to an age scale. It is not a diagnosis, lifespan prediction, treatment
response measure, or whole-person biological truth.

**Publication and evidence.** The fixed clinical model was developed in NHANES III
and tested across NHANES IV subpopulations and health outcomes. Its primary
validation reported morbidity and mortality associations across age, sex,
race/ethnicity, socioeconomic, and health-status groups.
[Primary cohort publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC6312200/).

**Required biomarkers.** Albumin, alkaline phosphatase, creatinine, C-reactive
protein, glucose, lymphocyte percentage, mean corpuscular volume, red-cell
distribution width, and white-cell count, plus chronological age.

**Accessibility and adoption.** The panel is mostly routine, although CRP and a
complete differential/CBC are not present in every laboratory encounter. Research
adoption is high. Formal adoption as a clinical diagnostic or treatment-selection
instrument is not established.

**Interpretability and reproducibility.** Inputs and the fixed version are
interpretable; the calculation is fully specified and stable. Vitalspan has already
subjected its version to eligibility, authorization, independent reference,
coefficient-integrity, and regression verification. Presentation can preserve the
scientific output without changing it.

**Limitations.** It is a cross-sectional mortality-risk transformation. Acute
illness can alter several inputs. Linear terms do not represent every clinically
important nonlinear or bidirectional association. NHANES-era assay and population
transport still require eligibility governance. The result should not be used to
infer intervention effectiveness from short-term movement.

**Production suitability.** Retain as the sole blood-derived production age. Its
advantage over newer candidates is not that it always predicts every outcome best;
it is the combination of a fixed identity, long reuse history, exact
reproducibility, manageable routine panel, and completed internal scientific
verification.

### Levine NHANES III KDM1 and other KDM variants

**Construct.** KDM estimates the chronological age at which an individual's
physiological profile would be expected in a named reference population. Each
panel, reference cohort, preprocessing strategy, and stratification creates a
different scientific calibration. Generic KDM is not a model.

**Publication and validation.** The original method supplied the construct but no
production panel. Levine's 2013 KDM1 used a ten-marker multisystem panel in 9,389
NHANES III adults aged 30–75 and reported mortality relevance. Later studies reused
or recalibrated KDM in NHANES, Dunedin, CALERIE, Chinese cohorts, Singapore, and UK
Biobank, but these are not interchangeable exact models.
[Original method](https://pubmed.ncbi.nlm.nih.gov/16318865/),
[Levine calibration](https://pmc.ncbi.nlm.nih.gov/articles/PMC3660119/).

**Required biomarkers.** Levine KDM1 used CRP, creatinine, HbA1c, systolic blood
pressure, albumin, total cholesterol, CMV optical density, alkaline phosphatase,
FEV1, and blood urea nitrogen, plus chronological age and sex-specific calibration.

**Accessibility.** Most blood inputs are clinically accessible. Faithful CMV
optical density is assay-specific, FEV1 is protocol-dependent, and blood pressure
is not a blood measurement. The historical panel is therefore less accessible and
less portable than it first appears.

**Reproducibility and version stability.** Phase 4.0B found that the public
continuous CMV artifact is incompatible with the reported mixed-sex age range,
complete sex-specific parameter artifacts are unavailable, and variable,
preprocessing, weighting, and numerical choices are unresolved. A named panel is
not enough to recreate the exact model.

**Overlap.** Albumin, alkaline phosphatase, creatinine, and CRP overlap exactly
with Clinical PhenoAge; HbA1c supplies related glycaemic evidence. Its potentially
independent pulmonary, pressure, CMV, and renal signals are the very inputs that
create the largest reproduction burden.

**Production suitability.** KDM is no longer the best actionable implementation
candidate. It remains an important research comparator, but its historical
maturity cannot compensate for an unresolvable production artifact. No other KDM
variant reviewed in Phase 4.0A has enough exact independent replication and
transportability to replace it.

### Homeostatic Dysregulation

**Construct.** Homeostatic Dysregulation uses multivariate statistical distance to
measure how unusual a biomarker profile is relative to a reference population. It
is a dysregulation magnitude, not intrinsically an age in years. Higher distance
does not identify which process is causal or whether change is ageing-specific.

**Publication and validation.** The original work used common blood biomarkers and
linked statistical distance to age and mortality. Cross-population studies in
WHAS and InCHIANTI found that the signal was reasonably robust to panel changes,
while also showing that different populations would select different marker sets.
[Original study](https://pubmed.ncbi.nlm.nih.gov/23376244/),
[cross-population validation](https://pmc.ncbi.nlm.nih.gov/articles/PMC4428144/),
[biomarker/reference sensitivity](https://pmc.ncbi.nlm.nih.gov/articles/PMC4395377/).

**Required biomarkers.** There is no universal panel. One widely reused NHANES
implementation used albumin, alkaline phosphatase, BUN, creatinine, CRP, HbA1c,
uric acid, WBC, lymphocyte percentage, MCV, RDW, and systolic pressure.
[NHANES comparison](https://pmc.ncbi.nlm.nih.gov/articles/PMC6599717/).

**Interpretability and reproducibility.** The mathematical construct is open, but
the output depends on biomarker selection, covariance estimation, reference
population, transformations, and regularization. Re-estimating these for a new
population creates a new measure. A high value says “multivariately unusual,” not
“older by a validated number of years.”

**Overlap.** The common 12-marker implementation shares eight of the nine Clinical
PhenoAge blood measurements and related glycaemic evidence, so it is not an
independent companion model.

**Production suitability.** Do not convert HD into a second biological age. It may
remain a research-only dysregulation construct if a future question specifically
requires statistical distance, but it should not be labeled or displayed as age.

### BioAge toolkit and BioAge V2

**Construct.** BioAge is a peer-reviewed software framework that implements KDM,
PhenoAge, and HD and permits custom parametrization. It is not itself one
biological-age model. Its flexibility is valuable for research and hazardous for
production identity.

**Publication and validation.** The V2 demonstration parametrized a combined
12-marker panel in NHANES III, tested it in NHANES IV, and projected it into the
CALERIE trial. This supports research reproducibility and intervention studies, not
one universally validated production version.
[Primary toolkit publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC8602613/).

**Required biomarkers.** Albumin, alkaline phosphatase, BUN, creatinine, CRP,
HbA1c, total cholesterol, uric acid, WBC, lymphocyte percentage, MCV, and RDW,
plus chronological age. Parameters are sex specific in the demonstrated KDM
workflow.

**Accessibility and reproducibility.** The blood panel is largely routine and the
research code is open. However, historical-to-modern assay harmonization,
sex-specific reference fitting, transformations, and panel customization are
scientific version dependencies. Open software does not make every custom output a
validated model.

**Overlap.** Eight of nine Clinical PhenoAge biomarkers overlap exactly. This is
the highest overlap among named routine-panel candidates and provides little
justification for a second production result.

**Production suitability.** Research only. BioAge is the preferred reproduction
toolkit for cohort research, not a second production model identity.

### Deep blood and hematological age clocks

**Construct.** Early deep blood clocks trained neural networks to predict
chronological age from routine chemistry and cell-count data. Later work showed
that blood-age patterns and accuracy vary across South Korean, Canadian, Eastern
European, and NHANES populations.
[Initial model](https://pmc.ncbi.nlm.nih.gov/articles/PMC4931851/),
[population-specific study](https://pmc.ncbi.nlm.nih.gov/articles/PMC6175034/).

**Required biomarkers.** Versions use approximately 21–41 blood chemistry and
hematology measurements. Important inputs commonly include albumin, glucose,
alkaline phosphatase, urea, and erythrocyte measurements, but model and panel
identity vary.

**Validation.** Large datasets and international age-prediction comparisons are
strengths. Predicting chronological age accurately is not the same as predicting
healthspan, mortality, or biological deterioration. A model can improve calendar
age fit while suppressing meaningful same-age health variation.

**Interpretability, openness, and stability.** Neural-network weights, training
laboratory effects, preprocessing, and calculator versions are not established as
one immutable, independently replicated clinical artifact. Company involvement
and later commercial use further reduce suitability under this review's exclusion
policy.

**Production suitability.** Rejected. These models answer “how old does this blood
panel look?” more directly than “what mortality- or health-relevant physiological
state is present?” and offer no stable advantage over Clinical PhenoAge.

### Bortz 2023 Full Elastic-Net Cox blood age

**Construct.** This model selected 25 circulating biomarkers from UK Biobank and
converted all-cause mortality risk to the age of a same-sex reference population.
It is a transparent penalized survival model rather than a chronological-age
clock.

**Publication and validation.** Development used England and Wales participants;
testing used a Scottish UK Biobank subset. The reported C-index exceeded the
Clinical PhenoAge result in that Scottish test set. This is geographic holdout
validation within one biobank, not independent international or independent-team
replication.
[Primary publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC10603148/).

**Required biomarkers.** The full artifact uses age, sex, and 25 selected
biochemistry, hematology, renal, inflammatory, endocrine, and cell-count markers.
Cystatin C and RDW were important. The selected set retains the Clinical PhenoAge
signals except that total WBC is represented through individual leukocyte
components.

**Accessibility.** A 25-marker complete panel is not a standard routine panel.
The paper explored smaller common panels by imputing unmeasured biomarkers from a
reference dataset. That approach conflicts with Vitalspan's prohibition on
estimating missing scientific inputs.

**Reproducibility and limitations.** The method and supplement are open, but the
training sample was about 95% White, healthy-volunteer selection is material,
assays came from a standardized single biobank, and no external cohort was used.
The authors explicitly note that PhenoAge faced a harder geographic transport
comparison and that real-world imputation may perform worse.

**Overlap and production suitability.** Overlap is very high, and the incremental
performance is likely driven partly by additional renal and hematologic evidence
rather than an independent ageing construct. Research only.

### ENABL Age-L

**Construct.** ENABL Age trains gradient-boosted survival models on all-cause or
cause-specific mortality and maps predicted risk to an age scale. Explainable-AI
decomposition attributes years to observed inputs. ENABL Age-L restricts inputs to
laboratory features from common blood panels.

**Publication and validation.** The primary paper developed models in UK Biobank
and NHANES, used geographic holdouts, and performed a UK-Biobank-to-NHANES transfer
test for ENABL Age-L. Reported mortality discrimination generally exceeded
PhenoAge and BioAge, although the ENABL Age-L versus PhenoAge difference in NHANES
was not statistically significant at the conventional threshold reported by the
authors.
[Primary publication](https://www.sciencedirect.com/science/article/pii/S2666756823001897).

**Required biomarkers.** ENABL Age-L draws from CBC, comprehensive metabolic,
lipid, and leukocyte-differential panels. The exact usable feature set depends on
the dataset-compatible trained artifact. This is a broad panel family rather than
one small universal input list.

**Accessibility and interpretability.** Routine panels are accessible, and the
paper reports study code and an interactive implementation. Individual
attributions improve local explanation, but an explanation of a gradient-boosted
prediction is not equivalent to a simple immutable scientific model. Tree-library,
model-file, feature-schema, missing-value, and explanation-library versions all
become integrity dependencies.

**Replication and stability.** Cross-dataset transfer within the primary study is
a meaningful strength. Independent investigators have not yet established a
locked, assay-governed ENABL Age-L production version across diverse laboratories.
The family includes all-cause, multiple cause-specific, questionnaire, top-feature,
full-feature, UK Biobank, and NHANES models. A production identity would have to
select exactly one artifact rather than implement “ENABL Age” generically.

**Overlap.** The four broad blood panels contain nearly all Clinical PhenoAge
inputs plus correlated renal, hepatic, lipid, and hematologic signals. Incremental
prediction does not establish construct independence.

**Production suitability.** Strong watchlist candidate, not production-ready. It
is the strongest nonlinear mortality framework reviewed, but it currently carries
more version, artifact, and laboratory-transport risk than a second result can
justify.

### Physiological Aging Index

**Construct.** PAI models all-cause mortality while preserving nonlinear,
including U-shaped, biomarker relationships. It then expresses the selected
physiological risk information on an age-related scale.

**Publication and validation.** The model was trained in 12,769 retired Chinese
workers, tested in a separate 15,904-person sample, and externally applied to
296,931 UK Biobank participants. It modestly exceeded PhenoAge discrimination in
both resources and predicted several incident diseases.
[Primary publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC11583456/).

**Required features.** The 17 selected features are fasting glucose, AST,
creatinine, alkaline phosphatase, RDW, WBC, monocyte percentage, systolic pressure,
BMI, lymphocyte percentage, direct bilirubin, ALT, total cholesterol, BUN, RBC,
MCV, and mean corpuscular hemoglobin, plus chronological age.

**Accessibility and methodology.** Most measurements are routine. Systolic
pressure and BMI make PAI a clinical multimodal model rather than a strictly
blood-only model. Development used multiple imputation, extreme-value handling,
nonlinear cut points, and transformations that must be frozen with the artifact.

**Reproducibility and limitations.** The publication and supplement are detailed,
but the Chinese source data require author access, independent reproduction of the
exact artifact has not been shown, and the development population consisted of
older retired workers. UK Biobank transport is encouraging but remains evidence
from the development team.

**Overlap.** Seven Clinical PhenoAge markers overlap exactly. Nonlinear handling
may correct a real limitation of linear clocks, but it does not create an
independent physiological modality.

**Production suitability.** Near-eligible research only. It deserves external
reproduction, but does not satisfy the blood-only scope or independent-replication
gate.

### PCAge, LinAge, and LinAge2

**Construct.** PCAge compresses high-dimensional clinical data into principal
components and links them to mortality. LinAge and LinAge2 provide reduced,
interpretable versions with direct parameter and component artifacts.

**Publication and validation.** PCAge/LinAge were trained in NHANES 1999–2000,
tested in NHANES 2001–2002, and LinAge was applied to NHANES III with explicit
batch adjustments. LinAge2 reduced and revised the feature set and reported strong
mortality and health-function benchmarking.
[PCAge/LinAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC11333290/),
[LinAge2](https://pmc.ncbi.nlm.nih.gov/articles/PMC12019333/).

**Required features.** Depending on version, 60–165 laboratory, physiological,
health-record, smoking, morbidity, and healthcare-use inputs are required. LinAge2
still uses 60 parameters and sex-specific normalization and components.

**Reproducibility and feasibility.** Public parameters and calculation code are
strengths. High feature burden, sex-specific component transforms, outlier caps,
normalization, batch sensitivity, and permitted zero-substitution for missing
values create substantial governance costs. LinAge's NHANES III validation also
set one unavailable marker's weight to zero and adjusted specific batch effects.

**Production suitability.** Outside the blood-only question and too burdensome as
a second blood age. It remains an important comparator because it challenges the
assumption that a small panel must predict mortality best.

### GOLD BioAge and Light BioAge

**Construct.** GOLD BioAge maps a proportional mortality-hazard model to an age
scale using a simple linear clinical panel. Light BioAge reduces the panel to three
measurements plus chronological age.

**Publication and validation.** GOLD was developed from NHANES 1999–2018 and
evaluated in NHANES and UK Biobank. Light BioAge was additionally evaluated by the
same research team in CHARLS, CLHLS, and RuLAS, providing valuable Chinese
population evidence. The paper is recent and exact independent-team replication
is not yet available.
[Primary publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC12407260/).

**Required biomarkers.** Full GOLD uses creatinine, glucose, MCV, RDW, albumin,
alkaline phosphatase, lymphocyte percentage, WBC, and gamma-glutamyl transferase,
plus chronological age. Light uses creatinine, glucose, and CRP plus age.

**Accessibility, openness, and interpretability.** Inputs are routine, the model
is linear and inspectable, and study code is public. This is the most immediately
reproducible newer routine-blood candidate. Full GOLD nonetheless depends on
source-specific selection, transformations, units, and reference values; the
publication acknowledges that alternate feature-selection methods can produce
different panels.

**Validation limitations.** Much of full-model benchmarking remains within
NHANES/UK Biobank analyses by the development team. The three additional Chinese
cohorts validate Light rather than the exact nine-marker full model, and are
predominantly middle-aged or older. The paper calls for additional validation of
the full model and omics versions.

**Overlap.** Full GOLD shares eight of nine Clinical PhenoAge biomarkers; only GGT
is new while CRP is absent. Light shares three. The full version is largely a
reweighted Clinical PhenoAge panel, while the light version has less physiological
breadth and is strongly dominated by chronological age.

**Production suitability.** This is the closest routine-lab watchlist candidate,
but it does not justify a second production output. Required prerequisites are
independent exact-artifact reproduction, prospective laboratory transport,
age/sex/population calibration analysis, repeatability testing, and proof of
incremental value after accounting for Clinical PhenoAge.

### CardioMetAge

**Construct.** CardioMetAge converts predicted ten-year mortality from heart
disease, cerebrovascular disease, and diabetes into a cardiometabolic age. It is a
domain-specific risk-equivalent age, not a general blood biological age.

**Publication and validation.** The model was trained in 13,262 NHANES III
participants, tested in 31,745 continuous-NHANES participants, and externally
evaluated in 418,118 UK Biobank participants. A substitute model with a different
panel was used in CALERIE because two original inputs were unavailable. The exact
model reported stronger associations than PhenoAge for cardiometabolic outcomes
and estimated moderate repeat-measure stability in a UK Biobank subset.
[Primary publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC12947333/).

**Required measurements.** HbA1c, RDW, systolic blood pressure, creatinine,
lymphocyte percentage, MCV, pulse rate, pulse pressure, uric acid, CRP, waist
circumference, and BUN, plus chronological age.

**Accessibility and interpretation.** Inputs are relatively accessible and the
linear artifact is transparent. It requires standardized anthropometry, pressure,
and pulse context in addition to blood. Its interpretation is clearer if retained
as cardiometabolic state rather than marketed as whole-person age.

**Limitations.** Publication occurred in 2026, there is no independent-team exact
replication, non-Western validation is absent, and technical assay replicates were
unavailable. The stronger comparison with PhenoAge is expected in part because the
model was trained specifically on cardiometabolic mortality. It does not establish
superiority for all-cause ageing or other organ systems. CALERIE tested a different
substitute model and therefore cannot validate longitudinal response of the
production candidate.

**Overlap.** Six Clinical PhenoAge biomarkers overlap exactly, with HbA1c providing
related glycaemic evidence. Unique pressure, pulse, waist, uric-acid, and BUN
signals support domain specificity rather than an independent global age.

**Production suitability.** Research only. CardioMetAge is promising future
cardiometabolic context, but should not replace KDM as a global second blood model
and should never be combined with Clinical PhenoAge without explicit dependence
analysis.

### Blood Biochemistry Age Clock

**Construct and publication.** BBAC assigns year-scale contributions based on
biomarker-specific all-cause mortality relationships. The July 2026 paper reports
11 routine blood biomarkers, UK Biobank and NHANES comparisons, and mixed results
versus PhenoAge, PCAge, and LinAge.
[Primary publication](https://pubmed.ncbi.nlm.nih.gov/42437599/).

**Exclusion.** Most authors are employees of the associated company, some may hold
shares or options, and a patent application related to the work is disclosed. The
article had no citations or independent replication at the review cutoff. Under
the pre-specified proprietary-commercial exclusion, BBAC cannot be a Vitalspan
candidate regardless of its reported performance.

## Biomarker accessibility and overlap

| Candidate | Routine accessibility | Non-routine or non-blood burden | Exact overlap with Clinical PhenoAge | Main scientific consequence |
| --- | --- | --- | --- | --- |
| Levine KDM1 | Mixed | CMV optical density, FEV1, standardized pressure | 4 of 9 | Lower overlap, but unique inputs make faithful reproduction fail |
| Common HD implementation | Mostly routine | Reference-cohort covariance and pressure | 8 of 9 | Largely the same evidence expressed as statistical distance |
| BioAge V2 | Mostly routine | Historical NHANES harmonization | 8 of 9 | Very high double-counting risk |
| Bortz Full ENC | Broad specialty/routine mix | Cystatin C and complete 25-marker panel or imputation | 8 of 9 plus WBC subtypes | Incremental prediction is not an independent modality |
| ENABL Age-L | Broad routine panels | Versioned ML artifact and complete feature schema | Extensive | Nonlinear reuse of substantially overlapping evidence |
| PAI | Mostly routine | BMI and standardized systolic pressure | 7 of 9 | Better nonlinear handling, but not blood-only or independent |
| LinAge2 | High burden | 60 clinical and record parameters | Extensive | Different model structure, not different evidence modality |
| GOLD BioAge | Routine | None beyond standard panels | 8 of 9 | Operationally attractive but largely reweights PhenoAge evidence |
| Light BioAge | Routine | None | 3 of 9 | Low burden with reduced physiological breadth |
| CardioMetAge | Mostly routine | Pressure, pulse, and waist protocol | 6 of 9 plus HbA1c | Cardiometabolic context, not global independent age |

Overlap counts are descriptive, not scores. Sharing inputs creates dependence;
unique inputs do not automatically prove independence. A candidate must show that
its additional signal remains meaningful after Clinical PhenoAge and individual
biomarkers are considered together in an external population.

## Validation comparison

### Strongest evidence by question

- **Longest fixed-model reuse:** Clinical PhenoAge.
- **Most mature alternative method family:** KDM, but no faithfully executable
  selected historical artifact.
- **Strongest nonlinear mortality framework:** ENABL Age-L, with substantial model
  version and transport burden.
- **Strongest newer routine-lab feasibility:** GOLD BioAge, with very high overlap
  and no independent exact replication.
- **Strongest recent cross-population clinical model:** PAI, but it is not
  blood-only and uses imputation and one development team's artifact.
- **Strongest cardiometabolic-specific evidence:** CardioMetAge, but only for its
  narrower outcome construct.
- **Strongest reference-free dysregulation concept:** HD, but its output is not age
  and still depends on a reference covariance structure.

### Why published “outperformance” does not settle production choice

- Bortz Full ENC compared a UK-trained expanded panel with PhenoAge transported
  from NHANES, within one predominantly White biobank.
- ENABL uses nonlinear models, broader feature spaces, and in some comparisons
  re-estimated comparator models; the gain is scientifically interesting but does
  not identify an immutable production artifact.
- PAI incorporates nonlinear thresholds and two non-blood risk measurements; its
  gain does not isolate a superior blood-age construct.
- GOLD and CardioMetAge were trained on mortality targets closely aligned with
  their reported advantages and have not yet received independent-team exact
  validation.
- CardioMetAge's cardiometabolic advantage is not evidence of superiority for
  cancer, respiratory, neurodegenerative, or all-cause ageing.
- LinAge/PCAge use far larger mixed clinical feature spaces, so they answer a
  different product and evidence question.

## Clinical adoption and implementation readiness

No reviewed alternative has established adoption as a guideline-endorsed clinical
diagnostic, treatment-selection test, or validated surrogate endpoint. Research
use, availability of an online calculator, and use by longevity clinics are not
clinical adoption.

Clinical PhenoAge is production-suitable within Vitalspan only because its use is
strictly bounded: fixed scientific version, complete source-attributed inputs,
eligibility gate, execution authorization, deterministic engine, no diagnosis, and
no treatment inference. The same engineering controls cannot repair missing
scientific validation in another model.

## Can any candidate replace KDM as the future second model?

**No.**

KDM should not proceed to implementation because the selected historical
calibration cannot be reconstructed faithfully. None of the newer candidates
should simply inherit KDM's place in the roadmap:

- HD is not an age-in-years construct and has no canonical panel.
- BioAge V2 is a toolkit demonstration with near-total PhenoAge overlap.
- Deep blood clocks primarily predict chronological age and lack a stable open
  production artifact.
- Bortz Full ENC depends on 25 markers or prohibited imputation and lacks external
  population validation.
- ENABL Age-L has promising cross-dataset evidence but no single independently
  reproduced, assay-governed production version.
- PAI is not blood-only and has no independent exact reproduction.
- PCAge/LinAge are high-dimensional mixed-clinical models outside this scope.
- GOLD BioAge is reproducible and practical but very recent, shares eight of nine
  PhenoAge markers, and has no proof that a second displayed age adds independent
  value.
- CardioMetAge is a cardiometabolic outcome model, not a replacement global age,
  and is too new for production.
- BBAC is excluded as patent-linked commercial work and is unreplicated.

Replacing KDM immediately would repeat the original error: selecting a model before
proving that its exact scientific artifact is independently reproducible and adds
meaningfully independent information.

## Final recommendation

### Keep Clinical PhenoAge only

Do not implement KDM and do not substitute another second model at this time.
Retain newer models as research records, not production promises.

The next decision should be reopened only when one named immutable candidate has:

1. independent reproduction of its exact output from published artifacts;
2. independent external validation across multiple countries, laboratories, sexes,
   age ranges, and major population groups;
3. prospective repeatability and laboratory/assay transport evidence;
4. a complete missing-data policy that does not estimate unavailable inputs;
5. an explicit supported population and unavailable-state policy;
6. stable versioning, licensing, and maintenance ownership;
7. evidence that it adds information beyond Clinical PhenoAge rather than merely
   reweighting the same biomarkers; and
8. a user interpretation that cannot be mistaken for diagnosis, lifespan,
   treatment efficacy, or whole-person certainty.

## Research watchlist

1. **GOLD BioAge:** highest priority for independent exact replication because it
   is simple, open, and routine-lab compatible. Independence from Clinical
   PhenoAge is the central unresolved question.
2. **ENABL Age-L:** highest priority for locked-artifact and laboratory-transport
   evaluation. Model/version proliferation is the central governance risk.
3. **CardioMetAge:** monitor as cardiometabolic domain research, not as a global
   second age. Independent replication and non-Western validation are required.
4. **PAI:** monitor nonlinear biomarker handling and external reproductions. It
   belongs to a future mixed-clinical review unless a blood-only fixed version is
   independently developed and validated.
5. **LinAge2:** retain as a high-dimensional clinical-clock comparator, outside the
   routine blood model roadmap.

## Review limitations

- This is a product-oriented systematic evidence review, not a registered clinical
  systematic review or quantitative meta-analysis.
- Heterogeneous outcomes and reporting prevent defensible pooled performance
  estimates.
- “Independent validation” is reserved for validation not performed solely by the
  development team; many papers use an external dataset but not an independent
  investigator.
- Publication recency means CardioMetAge and BBAC have had very little time to
  accumulate replication.
- Absence of identified replication is not proof that no replication exists; it is
  a reason to withhold production until traceable evidence is supplied.
- Clinical adoption was assessed from peer-reviewed model literature; no model was
  treated as clinically adopted merely because a calculator or clinic uses it.

## Primary evidence index

- [Clinical PhenoAge, NHANES validation](https://pmc.ncbi.nlm.nih.gov/articles/PMC6312200/)
- [Original KDM method](https://pubmed.ncbi.nlm.nih.gov/16318865/)
- [Levine NHANES III KDM](https://pmc.ncbi.nlm.nih.gov/articles/PMC3660119/)
- [Original Homeostatic Dysregulation study](https://pubmed.ncbi.nlm.nih.gov/23376244/)
- [HD cross-population validation](https://pmc.ncbi.nlm.nih.gov/articles/PMC4428144/)
- [NHANES comparison of KDM, HD, and PhenoAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC6599717/)
- [BioAge toolkit](https://pmc.ncbi.nlm.nih.gov/articles/PMC8602613/)
- [Deep blood age model](https://pmc.ncbi.nlm.nih.gov/articles/PMC4931851/)
- [Population-specific deep blood clocks](https://pmc.ncbi.nlm.nih.gov/articles/PMC6175034/)
- [Bortz Full ENC blood age](https://pmc.ncbi.nlm.nih.gov/articles/PMC10603148/)
- [ENABL Age](https://www.sciencedirect.com/science/article/pii/S2666756823001897)
- [Physiological Aging Index](https://pmc.ncbi.nlm.nih.gov/articles/PMC11583456/)
- [PCAge and LinAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC11333290/)
- [LinAge2](https://pmc.ncbi.nlm.nih.gov/articles/PMC12019333/)
- [GOLD BioAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC12407260/)
- [CardioMetAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC12947333/)
- [Blood Biochemistry Age Clock](https://pubmed.ncbi.nlm.nih.gov/42437599/)
