# KDM-Levine-NHANES-III-KDM1 v1.0.0 historical reconstruction

## Status and scope

This is a research specification, not a biological-age implementation. It contains no equation, coefficient, executable model, interpolation, imputation, or user-facing output. It does not authorize calculation.

**Go / No-Go: NOT YET.** Vitalspan cannot faithfully implement the named calibration from the presently available authoritative artifacts.

The broad scientific design is well documented. The exact executable calibration is not. In particular, the public continuous CMV optical-density artifact is incompatible with the reported development population, the complete sex-specific parameter artifacts are unavailable, and preprocessing and survey-design choices are not disclosed. Substituting plausible choices would create a new, unsupported calibration.

## Evidence hierarchy

Claims in this specification trace to the following sources, in descending authority for the question they answer:

1. [Levine 2013 primary publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC3660119/) — development cohort, panel, broad method, sex handling, missingness, and mortality validation.
2. [Klemera and Doubal 2006](https://pubmed.ncbi.nlm.nih.gov/16318865/) — original method construct; it does not identify the later Levine calibration.
3. [NHANES III data-file inventory](https://wwwn.cdc.gov/nchs/nhanes/nhanes3/datafiles.aspx) — official file and release lineage.
4. [NHANES III laboratory codebook](https://wwwn.cdc.gov/nchs/data/nhanes3/1a/lab-acc.pdf) — variable definitions, units, archive ranges, flags, and later analytic notices.
5. [NHANES III examination codebook](https://wwwn.cdc.gov/nchs/data/nhanes3/1a/exam-acc.pdf) — age, sex, blood pressure, spirometry, and quality variables.
6. [NHANES III laboratory procedures](https://wwwn.cdc.gov/nchs/data/nhanes3/manuals/labman.pdf) — historical assay, instrumentation, specimen, and quality-control methods.
7. [NHANES III spirometry manual](https://wwwn.cdc.gov/nchs/data/nhanes3/manuals/spiro.pdf) and [blood-pressure manual](https://wwwn.cdc.gov/nchs/data/nhanes3/manuals/pressure.pdf) — examination protocols.
8. [NHANES III CMV status documentation](https://wwwn.cdc.gov/nchs/data/nhanes3/19a/CMV.htm) and [continuous optical-density documentation](https://wwwn.cdc.gov/nchs/data/nhanes3/21a/spscmvod.pdf) — the central CMV conflict.
9. [BioAge peer-reviewed toolkit](https://pmc.ncbi.nlm.nih.gov/articles/PMC8602613/) — later panel confirmation and reconstruction context. Its preprocessing is not treated as evidence of Levine's undisclosed 2013 choices.

Blogs, commercial calculators, undocumented implementations, and repository reproductions are excluded as scientific authorities.

## Reconstructed historical pipeline

### 1. Population

The source population was NHANES III, conducted in the United States from 1988 through 1994. The paper restricted the development sample to adults ages 30–75. It reports 12,517 age-eligible participants and a final analytic sample of 9,389.

The paper describes NHANES as nationally representative, but it does not say whether the calibration used survey weights, strata, clusters, or a particular subsample weight. National representativeness of the source survey must not be confused with proof that the fitted calibration was design-weighted.

### 2. Measurements

The study drew from interviews, laboratory data, and Mobile Examination Center measurements. The public archive has separate laboratory and examination files, plus later surplus-sera CMV releases. Participant linkage is possible with the sequence identifier. The original release snapshots, join program, and analytic variable list are not available with the publication.

The measurements are cross-sectional baseline observations. The paper does not define a maximum allowed interval among interview, laboratory collection, blood pressure, and spirometry; it also does not state a fasting or examination-session requirement for KDM1. CMV was measured later from stored serum. Exact temporal alignment is therefore only partially reconstructed.

### 3. Biomarker selection

The paper considered 21 markers across metabolic, cardiac, lung, kidney, liver, immune/inflammatory, and blood-count domains. Ten markers meeting its stated chronological-age correlation criterion entered KDM1:

- C-reactive protein
- Serum creatinine
- Glycated hemoglobin
- Systolic blood pressure
- Serum albumin
- Serum total cholesterol
- Cytomegalovirus optical density
- Serum alkaline phosphatase
- Forced expiratory volume
- Serum urea nitrogen

This selection process belongs to historical model development. It is not a runtime feature-selection rule.

### 4. Missing data

Participants missing one or more biomarker measurements were excluded. The paper reports no imputation. Roughly one quarter of the age-eligible population was excluded; excluded participants were older on average and more likely to die during follow-up. This is a material complete-case selection limitation.

### 5. Sex stratification

KDM1 used the same ten-marker panel in separately estimated male and female models. The full sex-specific parameter artifacts are not published. The paper does not document different preprocessing or different measurement eligibility between branches.

The mortality analyses were reported with sex control after biological-age estimates were generated separately. This is not equivalent to a complete external validation report for each branch.

The historical public variable has two recorded categories. A future system must not guess or allow manual selection of a branch. An unsupported sex context returns unavailable.

### 6. Parameterization

The paper describes using the KDM procedure, marker-to-age relationships, residual variation, chronological age, and a reported age-dependent treatment of a variance component. This document intentionally does not reproduce the mathematical form or the partial numerical summaries printed in the article.

The complete male and female artifacts, software, numerical settings, and input preprocessing are not available. Therefore the pipeline cannot be made executable without unsupported reconstruction.

### 7. Validation

The development cohort was linked to NHANES III mortality data through 2006, giving 12–18 years of follow-up. Deaths attributed to HIV, violence, or accidents were censored for the reported validation. The primary paper used the same source cohort rather than an independent external calibration-validation population.

## Measurement timing and laboratory requirements

The reference cohort is the 9,389-person complete-case NHANES III sample, partitioned into male and female calibration groups. Exact branch counts are not printed.

Historical laboratory requirements are recoverable at the assay-manual level, but the study-specific eligibility policy is not. A future faithful implementation would have to preserve specimen type and method provenance, the HbA1c method branch, creatinine representation, cholesterol lineage, and the authenticated continuous CMV scale. Modern laboratory equivalence remains unproven until a bridging study exists.

NHANES collected quality and context fields, including venipuncture exclusions and spirometry screening. The primary paper does not state which fields affected KDM1 inclusion beyond biomarker completeness. Consequently the study-level quality-control policy remains Unknown.

## Statistical assumptions and limitations

- KDM represents biomarkers as distinct age-related dimensions using marker-to-age relationships and residual variation.
- The primary paper reports low pairwise correlations among the ten markers, but does not establish complete functional independence. KDM1 retains all ten markers despite the original method's preference for functionally uncorrelated inputs.
- The calibration uses cross-sectional age differences to parameterize an ageing construct. The paper acknowledges cross-sectional design and mortality-selection limitations.
- Residual-distribution diagnostics, heteroscedasticity treatment, survey-design estimation, and numerical boundary behaviour are not documented.

These statements describe the published construct only. They do not supply an executable mathematical specification.

## Biomarker specification

Archive ranges below are observed public-file encodings. They are not clinical reference ranges and are not production eligibility bounds.

| Marker | Strongest public variable candidate | Published unit | Historical method | Reconstruction status |
|---|---|---:|---|---|
| C-reactive protein | `CRP` | mg/dL | Behring latex-enhanced nephelometry | Strong candidate; below-detection handling unknown |
| Creatinine | `CEP` | mg/dL | Kinetic Jaffe on Hitachi 737 | Strong candidate; corrected vs archived value unresolved |
| HbA1c | `GHP`, with `GHPMETH` | % | Bio-Rad Diamat HPLC or flagged affinity method | Strong candidate; method branch must be preserved |
| Systolic blood pressure | `PEPMNK1R` | mmHg | Candidate average of up to six household/MEC K1 readings | Exact variable unresolved |
| Albumin | `AMP` | g/dL | Bromcresol purple on Hitachi 737 | Strong candidate |
| Total cholesterol | `TCP` or `CHP` | mg/dL | Formal lipid method or biochemistry profile | Exact variable unresolved; CDC recommends TCP |
| CMV optical density | `CMPODgT`, `CMPODgV`, or unavailable source | Unknown | Quest Triturus and/or bioMérieux VIDAS | Blocking conflict |
| Alkaline phosphatase | `APPSI` | U/L | Kinetic p-nitrophenylphosphate method on Hitachi 737 | Strong candidate |
| FEV1 | `SPPFEV1`, with quality/device variables | mL | Largest acceptable maneuver | Strong candidate; device and QC inclusion unresolved |
| Blood urea nitrogen | `BUP` | mg/dL | Kinetic urease/GLDH on Hitachi 737 | Strong candidate |

### C-reactive protein

The historical assay reported serum CRP in mg/dL and encoded results below its reporting limit specially. The paper does not disclose whether that encoding was used directly, substituted, excluded, or transformed. Modern hs-CRP must not be accepted merely because it measures the same protein. Acute inflammatory context, method traceability, and below-detection semantics are required.

Clinical PhenoAge overlap: exact analyte overlap.

### Creatinine

NHANES III originally measured serum creatinine using a kinetic Jaffe alkaline-picrate method on a Roche/Hitachi 737. CDC later documented a material difference from an IDMS-traceable enzymatic reference and recommended correction. The 2013 paper does not state whether it used the archived or corrected representation.

This ambiguity is calibration-defining. Modern IDMS-traceable creatinine must not be projected onto an unknown historical representation.

Clinical PhenoAge overlap: exact analyte overlap.

### HbA1c

NHANES III used Bio-Rad Diamat ion-exchange HPLC standardized to the DCCT reference. Samples with specified abnormal chromatograms, hemoglobin variants, elevated fetal hemoglobin, or degradation were analyzed by a standardized affinity method. The public `GHPMETH` field preserves the branch.

A future input requires method and interference provenance. IFCC mmol/mol and percent may not be silently interchanged inside the scientific engine.

Clinical PhenoAge overlap: related glycemic information, not the same analyte; Clinical PhenoAge uses glucose.

### Systolic blood pressure

`PEPMNK1R` is the strongest archive candidate because it is the overall average K1 systolic pressure and combines up to three household and three MEC readings. The article does not name the variable. Its use is therefore not verified.

A single consumer-device reading is not equivalent to this candidate definition. Device, cuff, posture, protocol, rest, and reading count must be preserved.

Clinical PhenoAge overlap: none.

### Albumin

NHANES III measured serum albumin using bromcresol purple with a sample blank on the Hitachi 737. Bromcresol green cannot be treated as an automatic equivalent. Hydration and acute inflammatory context affect interpretation and reproducibility.

Clinical PhenoAge overlap: exact analyte overlap.

### Total cholesterol

The public laboratory file contains `TCP`, the formal lipid-program value, and `CHP`, the Hitachi 737 biochemistry-profile value. CDC recommends `TCP` for most analyses. The primary publication does not identify which it used, so the historically sensible choice remains only a strong inference, not a reconstructed fact.

Clinical PhenoAge overlap: none.

### CMV optical density

This is the principal blocking inconsistency.

The primary paper reports continuous CMV optical density in a 9,389-person sample containing both men and women ages 30–75, and it reports separate male and female KDM estimates. The official public continuous optical-density file, however, is explicitly limited to 6,076 women ages 12–49. It contains:

- `CMPODgT`: Quest Triturus IgG optical density in absorbance units, including an out-of-range code above the detectable range.
- `CMPODgV`: bioMérieux VIDAS IgG result in arbitrary units for a much smaller confirmation subset.

The public age-six-plus mixed-sex CMV file exposes categorical `CVP_IGG`, not continuous optical density. A categorical value cannot be converted into the continuous input, and neither continuous scale can be guessed.

No modern equivalent is authorized. Optical density is platform-, reagent-, dilution-, calibration-, and processing-dependent. Unless the original continuous artifact and its scale are authenticated, faithful reproduction is not realistic.

Clinical PhenoAge overlap: none.

### Alkaline phosphatase

The archive candidate `APPSI` reports serum total alkaline-phosphatase activity in U/L. NHANES used a kinetic p-nitrophenylphosphate method on the Hitachi 737. Enzyme activity depends on method and temperature; a modern IFCC-style result requires explicit bridging.

Clinical PhenoAge overlap: exact analyte overlap.

### FEV1

`SPPFEV1` is the largest FEV1 from acceptable forced vital-capacity maneuvers and is reported in mL. NHANES used customized Ohio dry rolling-seal volume spirometers in the MEC and three types of home flow spirometer. Not every home device supplied equivalent quality assessment.

The archive also contains device type, reliability review, reproducibility, acceptable-maneuver count, temperature, and acute respiratory screening. The paper does not say which quality or device exclusions it applied. A future implementation must not accept consumer-estimated lung function or ignore device and maneuver provenance.

Clinical PhenoAge overlap: none.

### Blood urea nitrogen

The archive candidate `BUP` reports serum blood urea nitrogen in mg/dL. The historical method was kinetic urease/glutamate dehydrogenase on the Hitachi 737. Many international laboratories report urea rather than nitrogen content; the two labels and units must never be conflated.

Clinical PhenoAge overlap: none.

## Preprocessing specification

| Operation | Historical status | Contract behaviour |
|---|---|---|
| Log transformation | Unknown | Block |
| Scaling | Unknown | Block |
| Winsorization | Unknown | Block |
| Normalization | Unknown | Block |
| Centering | Unknown | Block |
| Outlier removal | Unknown | Block |
| Below-detection handling | Unknown | Block |
| Unit conversion | Published units known; pipeline unknown | Block implicit conversion |
| Assay harmonization | Conflicted | Block |
| Missing data | Complete-case exclusion | Never impute |

Later peer-reviewed BioAge workflows describe their own preprocessing practices. Those choices are useful for comparison but cannot be retroactively assigned to the original 2013 calibration.

## NHANES reproduction specification

### Files and linkage

The likely public components are Laboratory 1A, Examination 1A, CMV 19A, CMV optical density 21A, and the mortality linkage through 2006. The source paper does not identify exact archive snapshots. The participant sequence identifier supports public-file joins, but the mixed-sex continuous CMV input cannot be produced from those public releases as documented.

### Variables

Most marker mappings are strong matches based on exact label and unit. They are deliberately classified as candidates because the paper supplies no code or variable list. Age, blood pressure, cholesterol, creatinine representation, and CMV remain material or blocking ambiguities.

### Exclusions and cleaning

The only explicit study exclusions are age outside 30–75 and missing one or more biomarkers. The paper does not report pregnancy exclusion, acute-illness exclusion, spirometry reliability exclusion, device restriction, laboratory quality-flag exclusion, or outlier cleaning.

Absence from the paper is not proof that an operation did not occur. Each undisclosed operation remains Unknown.

### Weighting and sampling

NHANES provides complex-survey weights and design variables. The publication does not say whether calibration correlations, regressions, or validation used them. No weighting strategy may be inferred from the phrase “nationally representative.”

### Restricted data

The named core and surplus-sera releases are public. Nevertheless, a faithful reproduction may require an author-held or non-public continuous CMV artifact because the public continuous dataset has incompatible age and sex coverage. Whether that artifact exists and can lawfully be obtained is Unknown.

## Non-executable implementation contract

Any future implementation of `KDM-Levine-NHANES-III-KDM1 v1.0.0` must satisfy all of the following before authorization:

- Authenticate complete male and female parameter artifacts.
- Resolve the exact public or author-held variable map.
- Authenticate the continuous CMV input, assay, unit, range semantics, and participant coverage.
- Resolve archived versus corrected creatinine.
- Resolve `TCP` versus `CHP`.
- Resolve the systolic-pressure construction.
- Resolve every preprocessing and quality-control operation.
- Resolve survey-weight and sample-design treatment.
- Establish assay and device compatibility through bridging evidence.
- Create independent locked reference fixtures and immutable artifact fingerprints.
- Complete external transportability and scientific-governance review.

Execution must fail closed for a missing input, incompatible unit, unverified assay, missing method provenance, unsupported sex context, parameter/version mismatch, or any unresolved operation. There is no fallback, imputation, interpolation, user-selected branch, or substitute model.

Required input provenance includes source laboratory/device, specimen, collection time and context, unit as received, assay and calibration traceability, quality flags, transformation history, sex-branch provenance, and exact model version.

## Open scientific questions

### Can resolve from literature

No blocking question is assumed resolvable merely by finding another secondary description. A previously undiscovered supplement or official methodological appendix could resolve preprocessing or variable identity, but none was identified in this audit.

### Requires NHANES investigation

- Exact age variable.
- Exact systolic-pressure variable and construction.
- `TCP` versus `CHP`.
- Archived versus corrected creatinine.
- CRP below-detection handling.
- Spirometry device and quality exclusions.
- Acute-illness, pregnancy, chemotherapy, and other context exclusions.
- Identity and lineage of the CMV continuous value.

### Requires statistical reconstruction

- Complex-survey handling.
- Exact reproduction of the sample flow and biomarker summaries from a locked archive snapshot.
- Independent confirmation that one and only one variable/preprocessing configuration matches the publication.

Statistical reconstruction may identify a candidate history. It may not estimate or invent missing production coefficients in this phase.

### Requires expert review

- Modern laboratory assay bridging.
- Modern spirometry-device bridging.
- Unsupported sex-context policy.
- International transportability.

### Cannot currently be resolved

- The compatible mixed-sex continuous CMV artifact.
- The complete authenticated sex-specific parameter artifacts.
- Undocumented transformations without original code, supplement, or author artifact.

## Scientific confidence

| Area | Confidence | Reason |
|---|---|---|
| Named cohort and age range | Very High | Explicit in the primary paper |
| Ten-marker panel and published units | Very High | Explicit table and methods |
| Complete-case policy | Very High | Explicit sample flow |
| Same panel, separate sex calibration | High | Explicit broad behaviour; complete artifacts absent |
| Historical assay descriptions | High | Official NHANES manuals |
| Exact NHANES variable map | Limited to Moderate | Paper supplies no variable list; several ambiguities remain |
| Preprocessing | Insufficient | Not disclosed |
| Weighting and sampling treatment | Insufficient | Not disclosed |
| CMV input identity | Insufficient | Authoritative artifacts conflict |
| Faithful executable reconstruction | Limited overall | Multiple independent blocking gaps |

## Final scientific decision

**NOT YET.**

Vitalspan can name and govern the candidate, but it cannot faithfully execute it. Proceeding now would require at least one of the following prohibited substitutions: inventing preprocessing, choosing unverified variables, applying or omitting creatinine correction without provenance, converting categorical CMV status into a continuous value, using a women-only CMV artifact for a mixed-sex cohort, or replacing the historical assay with a modern one.

The renderer, product UI, eligibility engine, authorization layer, Clinical PhenoAge, multimodal architecture, scientific registry, and recommendation systems remain untouched. This package is isolated research metadata and a fail-closed future contract.
