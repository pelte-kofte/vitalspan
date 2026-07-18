# Phase 7.0C — Cardiometabolic Health Reference and Interpretation Standard

- **Document type:** Scientific review and production interpretation specification
- **Status:** Production Ready — Conditional
- **Standard version:** `CMH-RIS-1.0.0`
- **Evidence current through:** 18 July 2026
- **Governing inputs:** Phase 7.0A Scientific Evidence Review; Phase 7.0B Measurement Standard
- **Implementation status:** Documentation only; no calculations, code, diagnosis, treatment, score, or user-interface policy is authorized by this document

---

## 1. Executive Summary

Cardiometabolic measurements can support production interpretation only after Phase 7.0B has accepted the measurement identity, method, units, provenance, and required protocol metadata. Acceptance is necessary but not sufficient: each interpretation must also match a named, versioned authority by population, region, clinical context, method, and protocol. When that match fails, Vitalspan must preserve the accepted raw result and return **no scientific interpretation**, together with the missing or incompatible context.

This review authorizes a narrow version 1 interpretation layer:

- LDL-C may receive a source-labelled clinician-review notice for a verified marked elevation, without diagnosing familial hypercholesterolemia or assigning risk.
- Triglycerides may receive fasting-specific or non-fasting-specific published screening context and a clinician-review notice for marked elevations. A very severe result is a candidate safety boundary, not a pancreatitis diagnosis.
- Lipoprotein(a) may receive unit-specific published risk-enhancing context. Molar and mass identities remain separate and no conversion is permitted.
- HbA1c and fasting plasma glucose may receive region-specific published screening or diagnostic-supporting context, a repeat-confirmation notice, and clinician-review wording. They may not produce diabetes or prediabetes diagnoses.
- Valid repeated home blood pressure and repeated office blood pressure may receive protocol- and region-specific published context. A single reading cannot receive a hypertension category. Home, office, and automated-office identities are not interchangeable.
- Waist-to-height ratio may receive the named NICE adult central-adiposity screening context only when its eligibility and measurement lineage match. The 0.5 boundary is not adopted as a universal longevity or global diagnostic threshold.

ApoB, non-HDL-C, HDL-C, automated office blood pressure, and waist circumference remain raw-value and longitudinal-comparability measurements in version 1. Their scientifically important roles are preserved, but generally applicable numeric interpretation would require risk, treatment, population, or protocol context that the platform does not yet govern.

No percentile reference is activated. Laboratory flags may be retained as source metadata but cannot be presented as Vitalspan conclusions. No threshold is an “optimal longevity range.” No interpretation may create a parent Cardiometabolic Health score, individual event or lifespan prediction, diagnosis, treatment target, or medication recommendation.

The overall phase status is **Production Ready — Conditional**. Phase 7.0D must translate this specification into an independently reviewed implementation design, resolve localization and licensing, activate or reject candidate safety boundaries, and test exact-match failure behavior before any interpretation reaches production.

## 2. Scope

This standard governs reference matching and scientific interpretation after a measurement has passed Phase 7.0B. It covers the following independent identities:

| Family             | Phase 7.0B identity  | Measurement                                           |
| ------------------ | -------------------- | ----------------------------------------------------- |
| Atherogenic lipids | `CMH-MS-APOB-1`      | Apolipoprotein B                                      |
| Atherogenic lipids | `CMH-MS-LDLD-1`      | LDL-C, direct                                         |
| Atherogenic lipids | `CMH-MS-LDLC-1`      | LDL-C, calculated                                     |
| Atherogenic lipids | `CMH-MS-NHDL-1`      | Non-HDL-C                                             |
| Atherogenic lipids | `CMH-MS-HDLC-1`      | HDL-C, marker-only                                    |
| Atherogenic lipids | `CMH-MS-TG-1`        | Triglycerides                                         |
| Atherogenic lipids | `CMH-MS-LPA-MOLAR-1` | Lipoprotein(a), molar                                 |
| Atherogenic lipids | `CMH-MS-LPA-MASS-1`  | Lipoprotein(a), mass                                  |
| Glycemic status    | `CMH-MS-HBA1C-1`     | HbA1c                                                 |
| Glycemic status    | `CMH-MS-FPG-1`       | Fasting plasma glucose                                |
| Blood pressure     | `CMH-MS-HBPM-1`      | Repeated validated home BP                            |
| Blood pressure     | `CMH-MS-OBP-1`       | Office BP                                             |
| Blood pressure     | `CMH-MS-AOBP-1`      | Automated office BP                                   |
| Central adiposity  | `CMH-MS-WAIST-WHO-1` | WHO midpoint waist circumference                      |
| Central adiposity  | `CMH-MS-WHTR-WHO-1`  | Waist-to-height ratio with WHO-midpoint waist lineage |

In scope are scientific meanings of reference concepts, threshold eligibility, exact matching, authorized and blocked outputs, longitudinal comparability, candidate safety boundaries, documentation registries, and version governance.

Out of scope are production code, formulas, data ingestion, persistence, APIs, UI, Advisor behavior, risk engines, diagnosis engines, treatment logic, medication logic, scores, composite categories, and changes to Clinical PhenoAge, VO₂max, Functional Capacity, or any other scientific domain. This document does not authorize a calculation merely because it describes a published construct.

## 3. Governing Principles

1. **Science calculates; AI explains.** Explanatory language cannot create scientific authority absent from the registered policy.
2. **Unknown is preferable to unsupported.** Missing context yields no interpretation, not an estimated match.
3. **Fail closed.** Invalid provenance, method, protocol, population match, or reference version blocks the dependent output.
4. **Acceptance is not interpretation.** A Phase 7.0B-valid value can remain raw-only.
5. **Measurements remain independent.** No cross-marker ranking, merging, precedence score, or compensatory logic is authorized.
6. **Concepts remain distinct.** Reference intervals, screening thresholds, diagnostic thresholds, risk-enhancing thresholds, treatment targets, safety boundaries, and model inputs are not synonyms.
7. **Association is not causation.** Population associations cannot become personal prognosis.
8. **Methods remain distinct.** Direct and calculated LDL-C, Lp(a) molar and mass, and home, office, and automated-office BP retain separate identities.
9. **No silent fallback.** The system must not substitute age, sex, ethnicity, region, assay, unit, protocol, or measurement identity.
10. **Source transparency is mandatory.** Every interpretation names the authority, edition, intended population, interpretation type, and limitations.
11. **Laboratory metadata is not platform judgment.** A source laboratory flag is preserved as reported and clearly attributed.
12. **Clinical boundaries remain intact.** Scientific context does not establish diagnosis, prescribe treatment, or replace clinician assessment.
13. **Existing domains remain unchanged.** Biomarker overlap does not alter Clinical PhenoAge or any existing domain policy.

## 4. Reference Concept Taxonomy

| Concept                             | Scientific meaning                                                              | Version 1 authorized use                                                               | Prohibited misuse                                               | Minimum context                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| Population reference interval       | Distributional interval from a defined reference population and method          | Retain a laboratory-reported interval/flag as attributed metadata only                 | Calling it optimal, healthy, diagnostic, or a treatment target  | Laboratory, method, population, units, interval source                |
| Clinical diagnostic threshold       | Value used within a clinical diagnostic framework                               | Diagnostic-supporting context and confirmation notice only where explicitly authorized | Automatic diagnosis from one result                             | Authority, population, symptoms, exclusions, repeat rule              |
| Screening threshold                 | Boundary used to identify people for further assessment                         | Source-labelled informational screening context                                        | Diagnosis, prognosis, or treatment implication                  | Region, population, protocol, exclusions                              |
| Risk-enhancing threshold            | Factor that modifies clinical risk discussion or model use                      | Lp(a) unit-specific context; selected lipid context only                               | Individual event probability or standalone disease claim        | Authority, unit, population, clinical context                         |
| Treatment target                    | Goal selected for a clinical risk/treatment group                               | Not authorized                                                                         | General-user target or “optimal” range                          | Full clinical and treatment context; future program only              |
| Treatment-intensification threshold | Boundary used to consider changing therapy                                      | Not authorized                                                                         | Medication initiation, cessation, or dose advice                | Clinical pathway and clinician authority; future program only         |
| Safety or urgent-review threshold   | Boundary intended to trigger time-sensitive assessment, distinct from diagnosis | Candidate policy only until Phase 7.0D activation                                      | Disease diagnosis or automatic treatment                        | Verified result, repeat rule where safe, symptoms, escalation pathway |
| Prognostic-model input range        | Input validity range for a published prediction model                           | Not authorized in this domain                                                          | ASCVD, SCORE2, QRISK, lifespan, or event prediction             | Licensed validated model; separate program                            |
| Percentile                          | Position in a named reference distribution                                      | Not activated                                                                          | Invented percentile or category across datasets                 | Exact dataset, population, method, age/sex fields                     |
| Published category                  | Named grouping defined by an authority                                          | Only where a registered source and exact eligibility match                             | Blended or universal category                                   | Source, edition, region, population, protocol                         |
| Longitudinal change                 | Difference between comparable measurements over time                            | Raw chronological display plus comparability state                                     | Slope, percentage improvement, prognosis, or treatment response | Identity, method, units, context, correction history                  |
| Descriptive raw value               | Accepted measurement and canonical unit without inference                       | Authorized for all in-scope identities                                                 | Directional health judgment from the value alone                | Phase 7.0B acceptance and provenance                                  |

Laboratory reference intervals explicitly do **not** equal optimal-health ranges, diagnostic thresholds, treatment targets, or longevity targets. A laboratory flag can differ between laboratories and remains metadata even when an authoritative guideline uses a numerically similar boundary.

## 5. Research Method

The review was conducted as a structured authority and repository audit:

1. The repository status and documentation boundaries were inspected before drafting.
2. Phase 7.0A and Phase 7.0B were read as governing domain documents.
3. The VO₂max and Functional Capacity reference standards were reviewed for exact-match, no-fallback, raw-value-preservation, provenance, and versioning conventions.
4. Current primary guidelines and official consensus publications were prioritized over summaries. Official corrections, update dates, and supersession statements were checked where discoverable.
5. Each proposed output was classified by reference concept, intended population, protocol, required context, and prohibited inference.
6. Conflicting regional positions were retained separately. No numeric consensus was manufactured.
7. Each measurement received an independent version 1 decision: active source-specific interpretation, raw/trend-only, or unavailable.
8. Safety candidates were separated from diagnostic thresholds and left inactive pending Phase 7.0D operational governance.

The evidence freeze date is 18 July 2026. Web content without a stable edition date is cited with its page update date where available. This is not a systematic review with pooled effect estimates and does not quantify individual risk.

## 6. Evidence Hierarchy

Evidence was ranked as follows:

1. Current national or international clinical-practice guidelines and laboratory/measurement standards from the issuing authority.
2. Official focused updates, scientific statements, and consensus documents with disclosed methods.
3. Reference-measurement, assay-standardization, and device-validation authorities.
4. High-quality systematic reviews and meta-analyses.
5. Large prospective cohorts and original validation studies.
6. Supporting implementation resources from authoritative organizations.

Commercial laboratory pages, consumer-health articles, longevity-media claims, unsourced summaries, and device marketing were not accepted as interpretation authorities. A newer guideline supersedes an older source only within its stated scope; older sources remain visible when they govern a distinct population or concept. Current central authorities include the [2026 ACC/AHA multisociety dyslipidemia guideline](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423), [2025 ESC/EAS focused dyslipidaemia update](https://academic.oup.com/eurheartj/article/46/42/4359/8234482), [ADA Standards of Care in Diabetes—2026, Section 2](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes), [2025 AHA/ACC high-blood-pressure guideline](https://www.ahajournals.org/doi/10.1161/HYP.0000000000000249), [2024 ESC hypertension guideline](https://academic.oup.com/eurheartj/article/45/38/3912/7741010), and current NICE guidance.

## 7. Population and Context Matching

### 7.1 Exact-match rule

An interpretation is eligible only if every field marked required by its reference record is present, valid, and compatible. The interpretation result must bind the exact reference ID and policy version used. Unknown and incompatible are distinct audit states but both block interpretation.

### 7.2 Matching fields

| Field                       | Required when                                                          | Fail-closed consequence                                                        |
| --------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Age/date of birth           | Adult-only or age-bounded policy                                       | No category or threshold interpretation                                        |
| Source-recorded sex         | Sex-specific waist or source policy                                    | No sex-specific interpretation                                                 |
| Pregnancy status            | Glycemia and anthropometry; whenever pregnancy has a separate standard | No general adult interpretation                                                |
| Ethnicity/ancestry          | Waist or an explicitly stratified source                               | No threshold; no substitution                                                  |
| Country/region              | Regional guidelines disagree                                           | No regional category unless user policy is explicitly selected                 |
| Health population           | Source excludes or targets a disease group                             | No transfer to a different population                                          |
| ASCVD, diabetes, CKD status | Risk- or treatment-dependent lipid threshold                           | Threshold blocked when absent                                                  |
| Medication and timing       | Treatment-dependent or trend interpretation                            | Category may remain informational; treatment/trend inference blocked           |
| Fasting duration/status     | FPG and fasting-specific triglyceride context                          | FPG interpretation blocked; TG restricted to non-fasting context if documented |
| Acute illness status        | Glycemia, triglycerides, BP, trends                                    | Interpretation or comparability blocked/conditional                            |
| Assay identity/traceability | HbA1c, Lp(a), lipids where method-sensitive                            | Method-dependent interpretation blocked                                        |
| Measurement identity        | All                                                                    | No direct/derived or setting substitution                                      |
| BP setting and protocol     | All BP                                                                 | No home/office/AOBP category substitution                                      |
| Device validation           | BP                                                                     | Category blocked if validation unknown/failed                                  |
| Waist protocol and landmark | Waist and WtHR                                                         | Threshold/category blocked                                                     |
| Reference version           | All interpreted outputs                                                | No interpretation from an unversioned source                                   |

### 7.3 Explicitly prohibited fallbacks

There is no nearest-age, opposite-sex, generic-global, region, ethnicity, ancestry, assay, direct-to-calculated LDL-C, Lp(a)-unit, home-to-office BP, office-to-AOBP, or waist-protocol fallback. Missing clinical history may not be inferred from values. Country of residence may not be silently treated as ethnicity or ancestry.

### 7.4 Matching failure output

On failure, retain the Phase 7.0B-accepted value, canonical unit, timestamp, identity, method, provenance, and laboratory-supplied metadata. Set interpretation to unavailable; enumerate only the missing or incompatible fields; do not offer a substitute category. A failed interpretation does not invalidate an otherwise valid raw measurement.

## 8. ApoB Standard

### Scientific role

ApoB represents the concentration of circulating atherogenic lipoprotein particles because each relevant particle contains one ApoB molecule. It is a causal-burden measurement, especially informative when cholesterol content and particle number are discordant. Its scientific importance does not make a universal threshold appropriate.

### Reference review

The 2026 ACC/AHA guideline identifies ApoB as useful particularly in people with cardiometabolic disease, type 2 diabetes, or elevated triglycerides and in LDL-C discordance. ESC/EAS publishes ApoB treatment goals stratified by clinical risk category. These are clinical risk-management positions, not general-population reference ranges. The [2019 ESC/EAS guideline](https://academic.oup.com/eurheartj/article/41/1/111/5556353) remains the base guideline supplemented by the 2025 update.

### Version 1 decision

- **Authorized:** raw value, canonical unit, assay/provenance metadata, source laboratory flag as attributed metadata, marker explanation, and comparability-qualified trend.
- **Conditionally authorized:** a non-numeric explanation that ApoB reflects atherogenic particle burden and may add information when related lipid measures are discordant. It must not rank ApoB above or merge it with LDL-C or non-HDL-C.
- **Not authorized:** general concentration bands, a universal risk-enhancing cutoff, percentiles, treatment goals, individual-risk statements, or therapy advice.

Risk-category-specific thresholds require established disease, diabetes, CKD, medication, and clinical-risk context. Because version 1 has no validated risk program, these thresholds remain blocked. Status: **raw/trend-only**.

## 9. LDL-C Standard

### Identity and method boundary

Direct and calculated LDL-C remain separate measurement identities. They may share a published interpretation only when each method has passed its own Phase 7.0B validity rules and the cited guideline applies to both. Method name, calculation equation/version when applicable, triglyceride value, fasting status, and laboratory traceability must remain attached. An invalid or out-of-domain calculation cannot inherit direct-LDL interpretation.

### Threshold taxonomy

Most LDL-C goals and intensification thresholds are treatment decisions conditioned on absolute risk, established ASCVD, diabetes, CKD, age, and current therapy. They are not reference intervals or universally applicable categories. The 2026 ACC/AHA guideline treats LDL-C as a principal marker and separately addresses adults with LDL-C at or above 190 mg/dL (4.9 mmol/L). This boundary can identify need for clinical assessment but cannot diagnose familial hypercholesterolemia.

### Version 1 decision

- **Authorized:** raw value; method identity; canonical unit; attributed laboratory flag; comparable trend.
- **Conditionally authorized:** for a verified value at or above 190 mg/dL (4.9 mmol/L), the exact 2026 ACC/AHA adult context may produce: “This marked LDL-C elevation warrants clinician review.” The output must state that it is informational, does not diagnose familial hypercholesterolemia, does not estimate event risk, and does not set treatment.
- **Blocked:** “optimal” category; primary- or secondary-prevention goal; risk category; statin threshold; percent reduction; medication advice; direct/calculated substitution; FH diagnosis.

The source laboratory’s high/low flag remains laboratory metadata, not a Vitalspan conclusion. Status: **conditional source-specific interpretation** for both direct and calculated identities when method-valid; otherwise raw/trend-only.

## 10. Non-HDL-C Standard

Non-HDL-C represents cholesterol carried by all ApoB-containing lipoproteins. It may coexist independently with LDL-C and ApoB; the platform must not rank, average, or select a “winner.” Its clinical thresholds are generally secondary treatment goals or risk-dependent decision points. Canadian and European guidance can prefer non-HDL-C or ApoB in selected hypertriglyceridemic contexts, but those recommendations depend on clinical evaluation and do not define a universal reference category. See the [2021 Canadian Cardiovascular Society dyslipidemia guideline](https://ccs.ca/guideline/2021-lipids/).

- **Authorized:** raw value, canonical unit, direct/derived lineage, source laboratory flag as metadata, descriptive role, and comparable trend.
- **Blocked:** general bands, treatment goals, risk class, inference that it supersedes LDL-C or ApoB, and cross-marker discordance conclusions without a future governed policy.

Status: **raw/trend-only**.

## 11. HDL-C Standard

HDL-C is a risk marker, not an authorized causal treatment target. Low HDL-C is associated with cardiometabolic risk in populations, but a standalone value does not diagnose disease or quantify personal risk. Pharmacologically raising HDL-C has not established “higher is better” as a treatment principle. ESC/EAS also cautions that very high HDL-C is not linearly protective; the relationship can be non-linear and very high values should not be treated as universally beneficial.

- **Authorized:** raw value, canonical unit, attributed laboratory flag, marker-only explanation, and comparable trend.
- **Authorized wording constraint:** “HDL-C is an associated risk marker whose meaning depends on broader clinical context; higher is not always better.”
- **Blocked:** protective label, low-risk label, causal claim, HDL-raising advice, target, ratio inference, or personal prognosis.

No low or high numeric category is active in version 1 because such categories would be readily misread as an independent diagnosis or treatment target. Status: **raw/trend-only, marker-only**.

## 12. Triglyceride Standard

### Fasting boundary

Fasting and non-fasting measurements retain the same analyte identity but different interpretation context. Fasting status and duration must be recorded, not inferred. European laboratory consensus supports routine non-fasting lipid testing in many settings, while fasting confirmation is appropriate for selected marked or method-sensitive results; see the [EAS/EFLM joint consensus statement](https://pubmed.ncbi.nlm.nih.gov/27122601/).

### Published context

The 2026 ACC/AHA guideline and related current guidance distinguish modest elevation from marked/severe elevation. Version 1 may use the following only as explicitly named adult screening or review contexts:

| Context                              |                 Published boundary | Authorized output                                                                                 |
| ------------------------------------ | ---------------------------------: | ------------------------------------------------------------------------------------------------- |
| Fasting screening context            |    At least 150 mg/dL (1.7 mmol/L) | Source-labelled elevated screening context; consider repeat/clinical review based on completeness |
| Non-fasting screening context        |    At least 175 mg/dL (2.0 mmol/L) | Source-labelled elevated non-fasting context; do not relabel as fasting                           |
| Marked elevation                     |    At least 500 mg/dL (5.6 mmol/L) | Prompt clinician-review recommendation; verify fasting/acute/medication context                   |
| Very severe candidate safety context | At least 1,000 mg/dL (11.3 mmol/L) | Candidate time-sensitive safety review for Phase 7.0D; not active here                            |

These boundaries are not “normal/optimal” ranges. The [ADA 2026 cardiovascular risk-management section](https://diabetesjournals.org/care/article/49/Supplement_1/S216/163933/10-Cardiovascular-Disease-and-Risk-Management) similarly identifies marked fasting elevation for clinical evaluation.

### Version 1 decision

- **Authorized:** raw value, fasting metadata, published fasting/non-fasting screening context, repeat-fasting notice when source policy requires, clinician-review notice for marked elevation, and comparable trend.
- **Blocked:** pancreatitis diagnosis, causal attribution, medication/diet prescription, individual risk, treatment target, and conversion of unknown fasting status into a fasting category.

Acute illness, alcohol intake, recent food intake, strenuous exercise, pregnancy, diabetes status, and medication changes can make a trend conditional or uninterpretable. Status: **conditional source-specific interpretation**.

## 13. Lipoprotein(a) Standard

Lp(a) is a largely genetically determined atherogenic lipoprotein and causal ASCVD risk factor. Concentrations are often relatively stable, making at-least-once adult measurement scientifically useful, but inflammation, kidney disease, pregnancy, assay design, and apo(a) isoform sensitivity can affect interpretation.

### Unit and assay boundary

`CMH-MS-LPA-MOLAR-1` (nmol/L) and `CMH-MS-LPA-MASS-1` (mg/dL) are separate identities. A generic conversion is scientifically invalid because apo(a) isoform size changes the mass-to-particle relationship. An interpretation must use a threshold published in the same unit as the accepted result and must retain assay and isoform-sensitivity metadata where available.

The [2024 National Lipid Association focused update](https://www.lipid.org/sites/default/files/files/PIIS1933287424000333.pdf) provides unit-specific adult risk categories and recommends measurement at least once in every adult. Version 1 may reproduce these only as NLA-labelled **risk-enhancing context**:

| Identity |   Lower context |   Intermediate context |      Higher context |
| -------- | --------------: | ---------------------: | ------------------: |
| Molar    | below 75 nmol/L | 75 to below 125 nmol/L | at least 125 nmol/L |
| Mass     |  below 30 mg/dL |   30 to below 50 mg/dL |   at least 50 mg/dL |

The 2026 ACC/AHA guideline also uses 125 nmol/L or 50 mg/dL as a risk-enhancing boundary. These parallel unit-specific thresholds do not establish conversion equivalence.

### Version 1 decision

- **Authorized:** raw value; unit-specific NLA context; explanation of strong genetic influence and relative stability; once-in-adulthood context; clinician discussion for higher context; comparable trend only when assay and clinical context are compatible.
- **Blocked:** unit conversion, inherited-disease diagnosis, family-member recommendation, event probability, “lifetime risk” number, treatment target, or medication advice.

Status: **conditional unit-specific risk-enhancing interpretation**.

## 14. HbA1c Standard

HbA1c reflects glycation over the preceding red-cell lifespan and is standardized through IFCC/NGSP-aligned methods. It is not interchangeable with fasting plasma glucose and does not directly measure current glucose.

### Active source contexts

For nonpregnant adults with a valid standardized assay and no identified distortion, version 1 may expose a named jurisdictional context:

| Authority |                              Screening/increased-risk context |           Diagnostic-supporting test threshold | Required wording                                                                                                          |
| --------- | ------------------------------------------------------------: | ---------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------- |
| ADA 2026  |                              5.7% to 6.4% (39 to 47 mmol/mol) |                    At least 6.5% (48 mmol/mol) | “Published ADA test context; diagnosis requires clinical assessment and, absent unequivocal hyperglycemia, confirmation.” |
| NICE PH38 | 6.0% to 6.4% (42 to 47 mmol/mol) for high-risk identification | Not a general diagnostic engine in this policy | “Published NICE high-risk screening context.”                                                                             |

WHO or other regional criteria may be added only as separate registered references. Thresholds must not be blended; if region/policy selection is absent, return raw-only.

### Confounders and exclusions

Pregnancy uses separate timing- and pregnancy-specific standards and is excluded here. Hemoglobin variants, altered red-cell turnover, iron-deficiency or hemolytic anemia, recent transfusion or blood loss, erythropoietin therapy, advanced CKD, some liver disease, and assay interference can make HbA1c unreliable. The current [NGSP interference guidance](https://ngsp.org/factors.asp) must be consulted by assay identity. Known or unresolved material interference blocks categorical interpretation and can make trends not comparable.

### Version 1 decision

- **Authorized:** raw value in both accepted reporting systems; exact-source screening or diagnostic-supporting context; repeat-confirmation notice; confounder warning; clinician-review recommendation; comparable trend.
- **Blocked:** diabetes or prediabetes diagnosis, individualized target, treatment advice, estimated personal risk, universal “optimal glucose,” and substitution for FPG.

The [ADA 2026 diagnosis and classification standard](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes) requires confirmation in the absence of unequivocal hyperglycemia. A single threshold-crossing result can produce only an informational flag. Status: **conditional region-specific diagnostic-supporting interpretation**.

## 15. Fasting Plasma Glucose Standard

FPG is venous plasma glucose measured after a documented fasting interval accepted by the governing source. Unknown fasting status, capillary/consumer-device glucose, or non-plasma specimen cannot inherit this identity.

### Active source contexts

| Authority | Screening/increased-risk context |                 Diagnostic-supporting test threshold | Population boundary                                          |
| --------- | -------------------------------: | ---------------------------------------------------: | ------------------------------------------------------------ |
| ADA 2026  |   100–125 mg/dL (5.6–6.9 mmol/L) |                      At least 126 mg/dL (7.0 mmol/L) | Nonpregnant adults; confirm absent unequivocal hyperglycemia |
| WHO 2006  |   110–125 mg/dL (6.1–6.9 mmol/L) |                      At least 126 mg/dL (7.0 mmol/L) | Named WHO framework; no ADA substitution                     |
| NICE PH38 |                   5.5–6.9 mmol/L | High-risk screening pathway, not automatic diagnosis | Applicable UK prevention population                          |

The [WHO/IDF definition and diagnosis report](https://www.who.int/publications/i/item/definition-and-diagnosis-of-diabetes-mellitus-and-intermediate-hyperglycaemia) and [NICE PH38 glossary](https://www.nice.org.uk/guidance/PH38/chapter/glossary) illustrate material differences in screening boundaries. Version 1 must select the named jurisdictional policy or show no category.

### Version 1 decision

- **Authorized:** raw value, documented fasting metadata, exact-source screening/diagnostic-supporting context, repeat-confirmation notice, clinician-review recommendation, and compatible trend.
- **Blocked:** diabetes or prediabetes diagnosis, interpretation when fasting is unknown/insufficient, pregnancy interpretation, substitution with HbA1c or random glucose, treatment advice, or universal optimal range.

Acute illness, glucocorticoids and other medications, recent strenuous exercise, timing, and sample glycolysis can alter results. Discordance with HbA1c must remain explicit; one cannot invalidate or overwrite the other. Status: **conditional region-specific diagnostic-supporting interpretation**.

## 16. Home Blood Pressure Standard

Home BP has a distinct scientific identity and can reduce white-coat effects when obtained with a validated upper-arm cuff and a governed repeated protocol. It cannot be merged with clinic BP or cuffless estimates.

### Reference eligibility

For the NICE adult confirmation context, an eligible series contains two seated readings at least one minute apart, twice daily, for at least four days and ideally seven; day one is discarded and the remaining readings are averaged. NICE uses a home average of at least 135/85 mmHg in its diagnostic pathway, paired with clinic measurements. See [NICE NG136, updated 26 February 2026](https://www.nice.org.uk/guidance/ng136/chapter/recommendations). The 2024 ESC guideline likewise distinguishes home from office thresholds.

Version 1 does not operationalize averaging; it may interpret only a series whose Phase 7.0B lineage states that the governed series summary has been validly produced. Required metadata include validated device/model, cuff size, arm, posture, rest, dates/times, readings retained/excluded, medication timing where available, and protocol version.

### Version 1 decision

- **Authorized:** individual raw readings without category; a valid repeated-series summary; source-specific published context; repeated-measurement requirement; white-coat/masked-hypertension educational context; clinician-review notice; trend comparability between like series.
- **Blocked:** category from a single reading, hypertension diagnosis, office-threshold substitution, cuffless input, cardiovascular-risk calculation, or medication advice.

The NICE 135/85 boundary is diagnostic-supporting within a clinic-plus-out-of-office pathway; Vitalspan may describe the published context but must not output “hypertension.” Status: **conditional protocol- and region-specific interpretation**.

## 17. Office Blood Pressure Standard

Office BP is a standardized clinical-setting measurement. Interpretation requires a validated cuff device, correct cuff size, seated rest and positioning, no talking, repeated readings, and an identity distinct from AOBP. One visit or one reading is insufficient for diagnosis.

### Regional conflict

| Authority                | Published office framework                                                                                     | Version 1 handling                                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| AHA/ACC 2025             | Normal below 120/80; elevated 120–129 and below 80; stage 1 at 130–139 or 80–89; stage 2 at or above 140 or 90 | May be shown only as a named US guideline category from a valid repeated, multi-occasion office dataset; labels are informational, not diagnoses |
| ESC 2024                 | Elevated BP spans 120–139 systolic or 70–89 diastolic; office hypertension at or above 140/90                  | May be shown only as a named European context; do not blend with US stages                                                                       |
| NICE NG136 (2026 update) | Clinic at or above 140/90 initiates confirmation; diagnosis pathway uses ABPM/HBPM                             | May trigger a UK clinician/confirmation notice; no diagnosis                                                                                     |

The [2025 AHA/ACC guideline summary](https://professional.heart.org/en/science-news/2025-high-blood-pressure-guideline/top-things-to-know) and European/NICE standards disagree by design and population. Region and policy selection are mandatory.

### Version 1 decision

- **Authorized:** raw systolic/diastolic values, protocol validity, repeated multi-occasion source-specific context, confirmation requirement, clinician-review notice, and like-protocol trend.
- **Blocked:** categorical interpretation from a single reading or single inadequately governed session, hypertension diagnosis, home/AOBP substitution, medication advice, or individual cardiovascular-risk statement.

Status: **conditional region-specific interpretation after repeated valid measurement**.

## 18. Automated Office Blood Pressure Standard

AOBP uses an automated device to obtain multiple measurements in a standardized office setting, sometimes with the person unattended. Attended versus unattended protocols, rest duration, number and spacing of readings, device behavior, and averaging can materially change comparability. Published thresholds are not sufficiently uniform to authorize one universal AOBP category independent of the source protocol.

- **Required metadata:** validated device/model, attended status, room conditions, cuff and arm, rest, number/timing of readings, exclusions, session summary provenance, and medication/timing context.
- **Authorized:** raw readings, valid protocol identity, descriptive AOBP label, and trend only between compatible AOBP protocols.
- **Blocked:** office or home threshold transfer, single universal AOBP category, hypertension diagnosis, unattended/attended substitution, and medication advice.

Status: **raw/trend-only** pending a dedicated protocol-specific reference dataset and policy review.

## 19. Waist Circumference Standard

Waist circumference is a screening descriptor of central adiposity, not a direct measure of visceral fat and not a diagnosis. Reference thresholds vary by sex, ethnicity/ancestry, region, and anatomical landmark. WHO and IDF boundaries were developed for population and cardiometabolic screening contexts; IDF thresholds also participate in a composite metabolic-syndrome definition that Vitalspan does not authorize.

### Protocol eligibility

The accepted identity uses the WHO midpoint between the last palpable rib and top of the iliac crest, measured with a non-stretch tape, appropriate posture and minimal clothing, at the end of a normal expiration. Landmark, posture, breathing, tape, clothing, and observer metadata must match. Umbilical, iliac-crest-only, narrowest-waist, device-estimated, or self-described garment measurements cannot inherit WHO-midpoint references.

The [WHO waist circumference and waist–hip ratio report](https://www.who.int/publications/i/item/9789241501491) emphasizes sex- and population-specific interpretation. Evidence does not justify a single global threshold across all populations. Country cannot substitute for ancestry, and unsupported populations receive no threshold.

### Version 1 decision

- **Authorized:** raw value, protocol identity, descriptive central-adiposity role, and compatible trend.
- **Not activated:** sex/ethnicity-specific WHO or IDF threshold categories. Phase 7.0D may activate a bounded regional registry only if population fields, acceptable self-identification, language, and data governance are resolved.
- **Blocked:** obesity, metabolic-syndrome, or visceral-fat diagnosis; one global cutoff; protocol substitution; personal-risk estimate.

Status: **raw/trend-only**.

## 20. Waist-to-Height Ratio Standard

WtHR is a dimensionless central-adiposity screening measure whose validity depends on both waist and height lineage. A correct ratio cannot repair an invalid waist landmark, self-reported or stale height, mismatched units, pregnancy, or measurement error.

### Evidence and population limits

Prospective and systematic-review evidence supports WtHR as a useful cardiometabolic screening descriptor, including the pragmatic “waist less than half height” message. However, its association with population outcomes does not produce individual prognosis. Pediatric interpretation requires age-governed policies and is outside version 1. Pregnancy is excluded.

Current [NICE NG246, published 14 January 2025 and updated 8 January 2026](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity) defines for adults with BMI below 35 kg/m²:

- 0.40–0.49: NICE “healthy central adiposity” category;
- 0.50–0.59: NICE “increased central adiposity” category;
- at least 0.60: NICE “high central adiposity” category.

The NICE source applies across adult sexes and ethnicities in its stated population. Its labels are screening language, not diagnoses and not universal global categories. Values below 0.40 are not given a positive cardiometabolic interpretation by this standard.

### Version 1 decision

- **Conditionally authorized:** named NICE adult screening category only for a nonpregnant adult, BMI below 35 kg/m², current directly measured height, valid WHO-midpoint waist lineage, verified compatible units, and UK/NICE policy selection.
- **Authorized otherwise:** raw WtHR and compatible trend when lineage is valid.
- **Blocked:** universal 0.5 threshold, child interpretation, pregnancy interpretation, obesity/metabolic-syndrome/visceral-fat diagnosis, personal-risk prediction, and interpretation from self-reported height.

Status: **conditional NICE screening interpretation; otherwise raw/trend-only**.

## 21. Trend Comparability

Trend display never authorizes a slope, percentage improvement, prognosis, treatment response, or biological-age change. It may show accepted chronological raw values and one of four comparability states.

| State                    | Definition                                                                                             | Permitted presentation                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Comparable               | Same identity, compatible traceability/protocol, units, and material context; no unresolved correction | Raw chronological values plus “comparable”                         |
| Conditionally Comparable | A known context difference may influence change but does not fully invalidate comparison               | Raw values plus exact caveat; no directional health interpretation |
| Not Comparable           | Identity, assay, protocol, unit lineage, or clinical context is materially incompatible                | Values remain separate; no connecting interpretation               |
| Insufficient Data        | Required comparison metadata are absent or uncertain                                                   | Values remain visible; comparability unknown                       |

### Measurement-specific requirements

| Family            | Minimum comparability fields                                                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lipids            | Same analyte identity; assay/traceability compatible; direct versus calculated LDL preserved; Lp(a) same unit and assay compatibility; fasting compatibility for TG; acute illness and medication context |
| Glycemia          | Same analyte; HbA1c standardization/assay compatibility and no changed red-cell confounder; FPG fasting/specimen compatibility; illness and medication context                                            |
| Blood pressure    | Same setting identity; validated device class; cuff/arm/posture/rest compatible; comparable series protocol and time/medication context                                                                   |
| Central adiposity | Same waist landmark, tape/protocol, breathing/clothing conditions, observer context where known; WtHR has current valid height lineage                                                                    |

Unit conversion permitted by Phase 7.0B does not itself break comparability when conversion lineage and source precision are preserved. Lp(a) mass-to-molar conversion is never permitted. A historical correction creates a new audit event; the superseded value remains traceable and trends must record which version was used.

## 22. Safety and Clinical Boundaries

Scientific interpretation, diagnosis, urgent safety escalation, treatment decision, and routine monitoring are separate functions.

| Function                        | Meaning                                                                            | Phase 7.0C authority                                         |
| ------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Scientific interpretation       | Source-bound description of a valid measurement                                    | Authorized as registered                                     |
| Diagnostic assessment           | Clinician integrates history, symptoms, repeat testing, and differential diagnosis | Not authorized                                               |
| Urgent safety escalation        | Time-sensitive direction based on verified values and possibly symptoms            | Candidate boundaries only; activation deferred to Phase 7.0D |
| Treatment decision              | Individualized target or intervention                                              | Not authorized                                               |
| Routine longitudinal monitoring | Display comparable measurements over time                                          | Authorized without response/prognosis claim                  |

### Candidate safety boundaries for Phase 7.0D

1. **Blood pressure:** a verified repeat cuff measurement above 180 systolic and/or 120 diastolic mmHg requires a safety pathway that distinguishes acute warning symptoms from absence of symptoms. The [AHA severe-hypertension safety resource](https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/when-to-call-911-for-high-blood-pressure) supports symptom-sensitive escalation. This is not a hypertension diagnosis.
2. **Triglycerides:** a verified result at or above 1,000 mg/dL (11.3 mmol/L) is a candidate prompt for time-sensitive clinical review because population guidance recognizes substantially increased pancreatitis concern. It must not state that pancreatitis is present.
3. **Marked LDL-C:** at or above 190 mg/dL (4.9 mmol/L) supports clinician review, but not emergency messaging and not familial-hypercholesterolemia diagnosis.
4. **Glycemia:** no universal urgent boundary is activated here. Urgency can depend on symptoms, ketones, hydration, illness, pregnancy, and repeat specimen quality; a separate safety review is required.

Phase 7.0C does not define final messages, response times, emergency routing, symptom collection, localization, or UI. Until Phase 7.0D validates these components, candidate safety boundaries remain scientifically documented but operationally inactive.

## 23. Reference Registry

This registry is documentation-only. `Active-conditional` means eligible only through a registered interpretation policy and exact match; `Context-only` means citable but not numerically active.

| Reference ID                  | Measurement identity                      | Type                                | Authority/document                                                                                                                                                                                                | Edition/date                                                          | Target population and required match                                         | Authorized output                                           | Key blocked output/status                             |
| ----------------------------- | ----------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| `CMH-REF-LIPID-ACC-2026`      | ApoB, LDL-C, non-HDL-C, HDL-C, TG, Lp(a)  | Risk/treatment/screening guideline  | [ACC/AHA et al., _Guideline on Management of Dyslipidemia_](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423)                                                                                         | Published 13 Mar 2026; replaces 2018                                  | Adults; US context; analyte/method/unit; clinical-risk fields where relevant | Marked LDL review; TG context; Lp(a) risk-enhancing context | No treatment/risk output; active-conditional          |
| `CMH-REF-LIPID-ESC-2025`      | Lipid identities                          | Risk/treatment guideline update     | [ESC/EAS focused update](https://academic.oup.com/eurheartj/article/46/42/4359/8234482)                                                                                                                           | Published 29 Aug 2025; supplements 2019; evidence through 31 Mar 2025 | European populations; risk group required for targets                        | Scientific context only                                     | Numeric targets blocked; context-only                 |
| `CMH-REF-LIPID-ESC-2019`      | ApoB, LDL-C, non-HDL-C, HDL-C, TG         | Base guideline                      | [ESC/EAS dyslipidaemia guideline](https://academic.oup.com/eurheartj/article/41/1/111/5556353)                                                                                                                    | 2019 guideline, published 2019/2020 issue                             | European clinical-risk groups                                                | Marker-role evidence                                        | Treatment targets blocked; context-only               |
| `CMH-REF-LPA-NLA-2024`        | Lp(a) molar and mass                      | Risk-enhancing categories           | [NLA focused update](https://www.lipid.org/sites/default/files/files/PIIS1933287424000333.pdf)                                                                                                                    | 2024                                                                  | Adults; exact unit; assay metadata                                           | Unit-specific category; once-adult context                  | No conversion/individual risk; active-conditional     |
| `CMH-REF-LIPID-CCS-2021`      | ApoB, non-HDL-C, LDL-C                    | Risk/treatment guideline            | [Canadian Cardiovascular Society](https://ccs.ca/guideline/2021-lipids/)                                                                                                                                          | 2021                                                                  | Canadian clinical population; FRS/risk context                               | Role/context only                                           | Risk calculation and targets blocked; context-only    |
| `CMH-REF-LIPID-NICE-2023`     | LDL-C, non-HDL-C and lipid profile        | Risk/treatment guideline            | [NICE NG238](https://www.nice.org.uk/guidance/ng238)                                                                                                                                                              | Published 14 Dec 2023; reviewed 2 Sep 2025; replaces CG181            | UK adults; risk, disease, CKD, diabetes, and treatment context               | Scientific context only                                     | QRISK, targets, and treatment blocked; context-only   |
| `CMH-REF-LIPID-EAS-EFLM-2016` | TG and lipid profile                      | Pre-analytic consensus              | [EAS/EFLM joint consensus](https://pubmed.ncbi.nlm.nih.gov/27122601/)                                                                                                                                             | 2016                                                                  | Fasting status, lipid method                                                 | Fasting/non-fasting context                                 | No diagnosis; active-supporting                       |
| `CMH-REF-LIPID-CDC-2025`      | ApoB, HDL-C, LDL-C, TG and related lipids | Assay standardization               | [CDC CRMLN](https://www.cdc.gov/clinical-standardization-programs/php/cvd/improving-performance-crmln.html) and [LSP](https://www.cdc.gov/clinical-standardization-programs/php/cvd/monitoring-accuracy-lsp.html) | CRMLN page updated 2 Dec 2025; LSP page updated 24 Apr 2024           | Exact assay/laboratory traceability and certification                        | Reference eligibility and trend limitation                  | No clinical category; active-supporting               |
| `CMH-REF-GLY-ADA-2026`        | HbA1c, FPG                                | Screening and diagnostic-supporting | [ADA Standards, Section 2](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes)                                                                       | 2026 edition, published Dec 2025                                      | Nonpregnant; assay/specimen valid; region; confounders; confirmation context | Screening band, test threshold, repeat notice               | No diagnosis/targets; active-conditional              |
| `CMH-REF-GLY-WHO-2006`        | FPG                                       | Screening/diagnostic-supporting     | [WHO/IDF definition report](https://www.who.int/publications/i/item/definition-and-diagnosis-of-diabetes-mellitus-and-intermediate-hyperglycaemia)                                                                | 2006                                                                  | Named WHO policy; nonpregnant; fasting/specimen valid                        | WHO-specific context                                        | No ADA/NICE blending; active-conditional              |
| `CMH-REF-GLY-NICE-PH38`       | HbA1c, FPG                                | High-risk screening                 | [NICE PH38](https://www.nice.org.uk/guidance/PH38/chapter/glossary)                                                                                                                                               | Published 2012; current page checked 2026                             | Applicable UK prevention population; assay/fasting valid                     | NICE high-risk context                                      | No diagnosis; active-conditional                      |
| `CMH-REF-HBA1C-NGSP-2026`     | HbA1c                                     | Assay/interference                  | [NGSP, Factors that Interfere](https://ngsp.org/factors.asp)                                                                                                                                                      | Current page checked 18 Jul 2026                                      | Exact assay and confounder                                                   | Eligibility limitation                                      | No category; active-supporting                        |
| `CMH-REF-BP-AHA-2025`         | Office BP; safety support                 | Published category/safety           | [AHA/ACC high BP guideline](https://www.ahajournals.org/doi/10.1161/HYP.0000000000000249)                                                                                                                         | Published 14 Aug 2025                                                 | US adults; repeated valid office measurements; exact setting                 | Named category and confirmation notice                      | No single-reading diagnosis; active-conditional       |
| `CMH-REF-BP-ESC-2024`         | Office and home BP                        | Published category/threshold        | [ESC hypertension guideline](https://academic.oup.com/eurheartj/article/45/38/3912/7741010)                                                                                                                       | Published 30 Aug 2024                                                 | European adults; exact setting/protocol                                      | Region-specific context                                     | No setting substitution/diagnosis; active-conditional |
| `CMH-REF-BP-NICE-2026`        | Office and home BP                        | Diagnostic-supporting pathway       | [NICE NG136](https://www.nice.org.uk/guidance/ng136/chapter/recommendations)                                                                                                                                      | Published 2019; updated 26 Feb 2026                                   | UK adults; complete clinic/HBPM protocol                                     | Confirmation/clinician-review context                       | No diagnosis; active-conditional                      |
| `CMH-REF-BP-ISH-2020`         | Office and out-of-office BP               | Global practice guideline           | [International Society of Hypertension global guideline](https://journals.lww.com/jhypertension/fulltext/2020/06000/2020_international_society_of_hypertension_global.2.aspx)                                     | 2020                                                                  | Global clinical practice; exact setting and resource context                 | Conflict and global-context review                          | No blended threshold; context-only                    |
| `CMH-REF-BP-WHO-2021`         | Office BP                                 | Pharmacologic treatment guideline   | [WHO pharmacological treatment guideline](https://www.who.int/publications/i/item/9789240033986)                                                                                                                  | Published 24 Aug 2021                                                 | Adults with clinical treatment context                                       | Treatment-boundary distinction only                         | All medication thresholds/targets blocked             |
| `CMH-REF-WAIST-WHO-2011`      | WHO-midpoint waist                        | Screening/population guidance       | [WHO waist and waist–hip ratio report](https://www.who.int/publications/i/item/9789241501491)                                                                                                                     | Report published 2011                                                 | Sex/population/landmark exact                                                | Role and protocol context                                   | Thresholds not activated; context-only                |
| `CMH-REF-WAIST-IDF-2006`      | Waist circumference                       | Composite screening definition      | [IDF metabolic syndrome consensus](https://idf.org/news-and-resources/resources/idf-consensus-worldwide-definition-of-the-metabolic-syndrome/)                                                                    | 2006                                                                  | Sex- and ethnicity-specific clinical framework                               | Boundary and population review only                         | Metabolic-syndrome diagnosis blocked; context-only    |
| `CMH-REF-WHTR-SR-2010`        | WtHR                                      | Systematic review                   | [Browning, Hsieh, and Ashwell](https://pubmed.ncbi.nlm.nih.gov/20819243/)                                                                                                                                         | Published online 7 Sep 2010                                           | Heterogeneous adult screening populations                                    | Supports screening utility                                  | No universal activation or personal prediction        |
| `CMH-REF-WHTR-NICE-2026`      | WtHR with valid lineage                   | Published screening category        | [NICE NG246](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity)                                                                                   | Published 14 Jan 2025; updated 8 Jan 2026                             | UK/NICE policy; adult; nonpregnant; BMI below 35; valid waist/height         | Named central-adiposity category                            | No global/diagnostic use; active-conditional          |

Each registry entry inherits: no fallback; exact source disclosure; raw-value preservation; deactivation when superseded or materially corrected; and license review before reproducing restricted source content. ESC algorithm or software reuse requires separate permission review; citation here does not grant implementation rights.

## 24. Interpretation Policy Registry

All policies are version `1.0.0`. “None” under repeat means the policy does not create a repeat rule, not that repeat testing lacks clinical value.

| Policy ID             | Identity           | Allowed interpretation                                           | Required context / repeat rule                                                                                       | Safety status                        | Diagnostic/treatment boundary                        | Citation                                                                                                                                      |
| --------------------- | ------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `CMH-IP-APOB-001`     | ApoB               | Raw, role, comparable trend                                      | Valid assay/unit; clinical context for any future threshold; none                                                    | None                                 | No category, diagnosis, risk, or target              | [`CMH-REF-LIPID-ACC-2026`](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423)                                                      |
| `CMH-IP-LDLD-001`     | Direct LDL-C       | Raw/trend; marked-elevation review notice                        | Valid direct method; adult US context for ≥190 boundary; verify result per clinical process                          | Clinician review, not urgent         | No FH diagnosis, risk, or treatment                  | [`CMH-REF-LIPID-ACC-2026`](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423)                                                      |
| `CMH-IP-LDLC-001`     | Calculated LDL-C   | Same limited notice only when calculation valid                  | Equation/version and validity domain; no direct substitution                                                         | Clinician review, not urgent         | Same blocks as direct; method retained               | [`CMH-REF-LIPID-ACC-2026`](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423)                                                      |
| `CMH-IP-NHDL-001`     | Non-HDL-C          | Raw, role, comparable trend                                      | Valid derivation and component lineage; none                                                                         | None                                 | No treatment goal/risk class                         | [`CMH-REF-LIPID-ESC-2019`](https://academic.oup.com/eurheartj/article/41/1/111/5556353)                                                       |
| `CMH-IP-HDLC-001`     | HDL-C              | Raw, marker-only explanation, trend                              | Valid assay; none                                                                                                    | None                                 | No protective label/target; higher not always better | [`CMH-REF-LIPID-ESC-2019`](https://academic.oup.com/eurheartj/article/41/1/111/5556353)                                                       |
| `CMH-IP-TG-001`       | Triglycerides      | Fasting/non-fasting source context; marked-elevation review      | Known fasting state; acute/medication context; fasting repeat when source requires                                   | ≥1,000 candidate, inactive           | No pancreatitis diagnosis or treatment               | [`CMH-REF-LIPID-ACC-2026`](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423)                                                      |
| `CMH-IP-LPA-NMOL-001` | Lp(a), molar       | NLA unit-specific risk-enhancing context                         | nmol/L; assay identity/isoform sensitivity; repeat only if clinical context warrants                                 | None                                 | No conversion, diagnosis, risk probability, target   | [`CMH-REF-LPA-NLA-2024`](https://www.lipid.org/sites/default/files/files/PIIS1933287424000333.pdf)                                            |
| `CMH-IP-LPA-MASS-001` | Lp(a), mass        | NLA unit-specific risk-enhancing context                         | mg/dL; assay identity/isoform sensitivity; repeat only if warranted                                                  | None                                 | Same; no molar conversion                            | [`CMH-REF-LPA-NLA-2024`](https://www.lipid.org/sites/default/files/files/PIIS1933287424000333.pdf)                                            |
| `CMH-IP-HBA1C-001`    | HbA1c              | Region-specific screening/test context; confirmation notice      | Region; nonpregnant; standardized assay; no material RBC/assay confounder; confirm absent unequivocal hyperglycemia  | No urgent boundary active            | No diabetes/prediabetes diagnosis or target          | [`CMH-REF-GLY-ADA-2026`](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes)     |
| `CMH-IP-FPG-001`      | FPG                | Region-specific screening/test context; confirmation notice      | Region; venous plasma; documented fasting; nonpregnant; confirm absent unequivocal hyperglycemia                     | No urgent boundary active            | No diabetes/prediabetes diagnosis or target          | [`CMH-REF-GLY-ADA-2026`](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes)     |
| `CMH-IP-HBPM-001`     | Repeated home BP   | Valid series, named regional threshold context                   | Valid upper-arm device/cuff; complete source protocol; repeat series/clinical confirmation per source                | >180/120 candidate pathway, inactive | No hypertension diagnosis/treatment                  | [`CMH-REF-BP-NICE-2026`](https://www.nice.org.uk/guidance/ng136/chapter/recommendations)                                                      |
| `CMH-IP-OBP-001`      | Office BP          | Named regional category after repeated valid multi-occasion data | Region; valid cuff/device/protocol; ≥2 readings and occasions per chosen authority                                   | >180/120 candidate pathway, inactive | No single-reading category/diagnosis                 | [`CMH-REF-BP-AHA-2025`](https://www.ahajournals.org/doi/10.1161/HYP.0000000000000249)                                                         |
| `CMH-IP-AOBP-001`     | AOBP               | Raw and compatible trend                                         | Exact attended/unattended protocol and device; none                                                                  | Candidate BP boundary inactive       | No category or setting substitution                  | [AHA measurement statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409525/)                                                               |
| `CMH-IP-WAIST-001`    | WHO-midpoint waist | Raw, role, comparable trend                                      | Exact landmark/protocol; population fields required for future threshold; repeat for quality if protocol requires    | None                                 | No obesity/metabolic-syndrome/visceral-fat diagnosis | [`CMH-REF-WAIST-WHO-2011`](https://www.who.int/publications/i/item/9789241501491)                                                             |
| `CMH-IP-WHTR-001`     | WtHR               | Named NICE adult category or raw/trend                           | UK/NICE; adult; nonpregnant; BMI <35; valid current measured height and waist lineage; repeat if input quality fails | None                                 | No universal threshold or diagnosis                  | [`CMH-REF-WHTR-NICE-2026`](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity) |

Every policy has an absolute fallback prohibition. Any unavailable required field changes the output to raw-only/no interpretation and records the reason.

## 25. Validation Scenarios

The following are scientific acceptance scenarios for future testing; they are not implemented here.

### Lipids

| Scenario                                       | Expected scientific result                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ApoB with full assay and clinical-risk context | Raw/role/trend output; risk-dependent target still blocked because no risk/treatment policy is authorized |
| ApoB without clinical-risk context             | Raw-only plus role; no numeric category                                                                   |
| Same numerical direct and calculated LDL-C     | Preserve two identities and methods; do not deduplicate or silently transfer validity                     |
| Calculated LDL-C outside equation validity     | Raw source may remain auditable; derived interpretation blocked                                           |
| HDL-C high value                               | Raw marker value; no “protective” or “better” label                                                       |
| Fasting versus non-fasting TG                  | Apply only matching source context; never relabel one as the other                                        |
| TG ≥500 mg/dL                                  | Clinician-review notice; no pancreatitis diagnosis                                                        |
| TG ≥1,000 mg/dL before Phase 7.0D activation   | Raw plus marked-review context; candidate safety state logged but no final urgent workflow                |
| Lp(a) in nmol/L                                | Match only molar bands and molar policy                                                                   |
| Lp(a) in mg/dL                                 | Match only mass bands and mass policy                                                                     |
| Requested generic Lp(a) conversion             | Block; preserve source unit                                                                               |

### Glycemia

| Scenario                                    | Expected scientific result                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| Valid HbA1c, no confounder, region selected | Exact region-specific context and confirmation notice where applicable; no diagnosis |
| HbA1c with anemia/altered red-cell turnover | Categorical interpretation blocked; raw value retained with limitation               |
| Valid FPG with documented fasting           | Exact selected regional context; no diagnosis                                        |
| Plasma glucose without fasting confirmation | Cannot use FPG policy; no FPG category                                               |
| Single value crosses a test threshold       | Informational test-threshold context plus repeat/clinical notice; no diagnosis       |
| Repeat confirmation absent                  | Diagnostic conclusion remains blocked                                                |
| HbA1c and FPG discordant                    | Preserve both values and discordance; do not average, choose, or overwrite           |

### Blood pressure

| Scenario                                     | Expected scientific result                                                |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| Complete valid home series                   | Named protocol/region context; no diagnosis                               |
| Single home reading                          | Raw systolic/diastolic only; no category                                  |
| Repeated valid office measurements           | Selected region-specific category may be informational; no diagnosis      |
| Valid AOBP session                           | Raw/protocol identity only; no office category                            |
| Home value evaluated against office boundary | Block setting substitution                                                |
| Invalid cuff size                            | Interpretation blocked; raw record retained with failed-quality state     |
| Cuffless estimate                            | Unsupported for these identities; no cuff-based interpretation            |
| Repeat cuff value >180/120                   | Safety candidate recognized; Phase 7.0D pathway required; not a diagnosis |

### Central adiposity

| Scenario                                                | Expected scientific result                                  |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| WHO-midpoint waist with exact population fields         | Raw/trend only in v1; no threshold registry is active       |
| Waist measured at umbilicus                             | WHO-midpoint reference blocked                              |
| Ethnicity/region missing for a proposed waist threshold | No category and no global fallback                          |
| Valid WtHR lineage, eligible NICE adult                 | Named NICE screening category may be shown with limitations |
| Self-reported height                                    | Derived WtHR interpretation blocked                         |
| Pregnancy                                               | Waist and WtHR categorical interpretation blocked           |
| Non-UK user without selected matching authority         | Raw WtHR only; no global 0.5 fallback                       |

### General controls

- A missing match field never triggers a default population.
- No measurement contributes to a parent or traffic-light score.
- No output names a disease as diagnosed or recommends therapy.
- No output says “optimal longevity range.”
- Reference and policy IDs/versions are stored with every authorized interpretation.
- A superseded reference cannot silently remain active.
- A validated raw value remains available when interpretation fails.
- Duplicate reference and policy IDs fail registry validation.

## 26. Governance and Versioning

### Independent versioned artifacts

| Artifact                           | Initial version          | Change trigger                           |
| ---------------------------------- | ------------------------ | ---------------------------------------- |
| Cardiometabolic reference standard | `CMH-RIS-1.0.0`          | Scientific scope or authorization change |
| Reference registry                 | `CMH-RR-1.0.0`           | Source add/update/deprecation            |
| Interpretation policy registry     | `CMH-IPR-1.0.0`          | Output, context, or boundary change      |
| Population-matching policy         | `CMH-PMP-1.0.0`          | Matching field or fallback rule change   |
| Trend-comparability policy         | `CMH-TCP-1.0.0`          | Compatibility criteria change            |
| Safety-boundary policy             | `CMH-SBP-0.1.0-inactive` | Activation, rejection, or pathway change |

### Update cadence

- Check issuing authorities at least quarterly for corrections, focused updates, and supersession notices.
- Conduct a full scientific re-review at least annually and immediately when a major guideline changes an active threshold, population, assay rule, or safety boundary.
- Record publication date, online date, edition, correction date, evidence cutoff, retrieval date, and superseded document for each update.
- Emergency scientific corrections can deactivate an output immediately; reactivation requires review and version increment.

### Conflict resolution

1. Confirm whether apparently conflicting sources govern different populations, settings, methods, or purposes.
2. Prefer the most current primary authority for its own jurisdiction and scope.
3. Preserve multiple region-specific policies when disagreement remains scientifically legitimate.
4. Never average or blend thresholds.
5. If no justified policy selection exists, interpretation is unavailable.

### Version semantics and audit

A major version changes scientific meaning or compatibility; a minor version adds a backward-compatible source or bounded interpretation; a patch records clarification or non-semantic correction. Every output audit record must include measurement identity/version, reference ID/version, policy ID/version, matching fields, eligibility decision, missing/incompatible fields, output type, and timestamp. Deprecated references remain historically resolvable but cannot govern new interpretations after their effective deactivation date.

Licensing and copyright review is required before implementing source algorithms, tables, or protected wording. The reference record must distinguish scientific authority from implementation permission.

## 27. Remaining Limitations

1. Guideline thresholds are designed for screening, diagnosis support, or treatment pathways—not longevity optimization.
2. Regional disagreement remains substantial for glycemic screening, office BP categories, and waist thresholds.
3. ApoB and non-HDL-C are scientifically valuable, but their numeric goals require risk and treatment context absent from this domain.
4. LDL-C calculation equations and direct assays retain method-specific limitations; identical units do not ensure interchangeability.
5. Lp(a) assay isoform sensitivity and international harmonization remain imperfect; mass and molar values cannot be generically converted.
6. HbA1c interference metadata are often missing from imported health records.
7. Fasting status, acute illness, medication timing, and pregnancy status may be unavailable and therefore block otherwise familiar interpretations.
8. BP protocol and cuff/device metadata are frequently incomplete; AOBP lacks one universal interpretation policy.
9. Waist landmarks and population labels are heterogeneous, and ethnicity/ancestry categories are imperfect social and scientific proxies.
10. WtHR evidence supports screening utility but not individual prognosis; NICE eligibility is not a global reference.
11. No active percentile dataset met the exact-match and licensing requirements for version 1.
12. Safety thresholds require symptom-aware operational governance and cannot safely be reduced to isolated numeric alerts.

## 28. Phase 7.0D Requirements

Phase 7.0D must complete the following before production activation:

1. Translate every active reference and policy entry into a traceable, reviewed implementation specification without expanding scientific scope.
2. Define jurisdiction selection and user-region governance; prohibit location inference where it would misclassify the governing clinical framework.
3. Resolve licensing for guideline wording, categories, tables, algorithms, and any external terminology.
4. Define exact machine-readable eligibility fields, enumerations, null behavior, incompatibility reasons, and audit schema.
5. Verify canonical-unit boundary representations and rounding without changing Phase 7.0B measurement rules.
6. Specify repeat-confirmation state without creating diagnosis logic.
7. Review candidate BP and triglyceride safety boundaries with clinical, legal, localization, accessibility, and emergency-pathway governance; either activate them under a versioned `CMH-SBP` policy or leave them blocked.
8. Conduct a dedicated glycemic urgent-safety review before authorizing any urgent glucose output.
9. Decide whether to build region-specific waist references; until then waist remains raw/trend-only.
10. Select any AOBP protocol-specific reference only after attended/unattended and device/protocol validation.
11. Implement test fixtures for every Section 25 scenario, including missing metadata, conflicting region, supersession, and raw-value retention.
12. Perform independent scientific, clinical-safety, privacy, and software-quality review before release.
13. Confirm zero behavioral change to Clinical PhenoAge, VO₂max, Functional Capacity, and all existing domains.

Phase 7.0D may implement only what this standard explicitly authorizes. New thresholds, categories, calculations, scores, diagnoses, targets, or recommendations require a scientific amendment, not an engineering assumption.

## 29. Final Scientific Recommendation

### Overall phase status

Final status: **Production Ready — Conditional**

The scientific reference architecture is sufficiently defined to proceed to Phase 7.0D, but no interpretation is production-authorized until exact matching, licensing, auditability, safety review, and validation scenarios are implemented and independently approved.

### Version 1 authorization summary

| Measurement           | Version 1 authorization                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ApoB                  | Raw value, scientific role, and comparability-qualified trend only                                                             |
| LDL-C, direct         | Raw/trend; conditional 2026 ACC/AHA marked-elevation clinician-review context                                                  |
| LDL-C, calculated     | Same limited context only when equation/method validity is satisfied; identity retained                                        |
| Non-HDL-C             | Raw value, scientific role, and comparability-qualified trend only                                                             |
| HDL-C                 | Raw/trend and marker-only explanation; never universally protective                                                            |
| Triglycerides         | Fasting-specific/non-fasting-specific screening context; marked-elevation clinician review; candidate safety boundary inactive |
| Lp(a), molar          | Unit-specific NLA/ACC risk-enhancing context; no conversion                                                                    |
| Lp(a), mass           | Unit-specific NLA/ACC risk-enhancing context; no conversion                                                                    |
| HbA1c                 | Region-specific screening/diagnostic-supporting context, repeat notice, no diagnosis                                           |
| FPG                   | Region-specific screening/diagnostic-supporting context, repeat notice, no diagnosis                                           |
| Repeated home BP      | Protocol- and region-specific context from a complete valid series; no diagnosis                                               |
| Office BP             | Region-specific informational category only from repeated valid multi-occasion data; no diagnosis                              |
| Automated office BP   | Raw/protocol identity and compatible trend only                                                                                |
| Waist circumference   | Raw/protocol identity and compatible trend only                                                                                |
| Waist-to-height ratio | Conditional NICE adult screening category with exact eligibility; otherwise raw/trend-only                                     |

### Explicitly blocked outputs

The following remain blocked: parent Cardiometabolic Health score; optimal longevity range; biological-age or fitness-age adjustment; lifespan or individual event prediction; ASCVD, SCORE2, QRISK, or other model output; metabolic-syndrome, diabetes, prediabetes, hypertension, familial-hypercholesterolemia, obesity, visceral-adiposity, or pancreatitis diagnosis; medication initiation, cessation, or dose advice; individualized targets; treatment-intensification advice; “higher is always better” or “lower is always better”; cross-marker ranking; composite traffic lights; percentile invention; and silent normalization or fallback across populations, assays, units, methods, or protocols.

### Boundary and readiness conclusion

No scientific issue requires a research hold. The issues that prevent immediate production activation are operational governance issues assigned to Phase 7.0D: exact-match implementation, regional selection, licensing, safety-pathway activation, and validation. Kidney, liver, inflammation, clinical risk prediction, diagnosis, and medication management remain outside this independent measurement domain. Existing scientific domains must remain unchanged.

---

## Authoritative Source Index

- American College of Cardiology/American Heart Association et al. [2026 Guideline on the Management of Dyslipidemia](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423). Published 13 March 2026; replaces the 2018 cholesterol guideline.
- European Society of Cardiology/European Atherosclerosis Society. [2025 Focused Update of the 2019 ESC/EAS Guidelines for the Management of Dyslipidaemias](https://academic.oup.com/eurheartj/article/46/42/4359/8234482). Published 29 August 2025.
- European Society of Cardiology/European Atherosclerosis Society. [2019 Guidelines for the Management of Dyslipidaemias](https://academic.oup.com/eurheartj/article/41/1/111/5556353). European Heart Journal 2020 issue.
- National Lipid Association. [2024 Focused Update to the 2019 NLA Scientific Statement on Use of Lipoprotein(a)](https://www.lipid.org/sites/default/files/files/PIIS1933287424000333.pdf).
- European Atherosclerosis Society/European Federation of Clinical Chemistry and Laboratory Medicine. [Fasting is not routinely required for determination of a lipid profile](https://pubmed.ncbi.nlm.nih.gov/27122601/). 2016.
- Canadian Cardiovascular Society. [2021 Guidelines for the Management of Dyslipidemia](https://ccs.ca/guideline/2021-lipids/).
- National Institute for Health and Care Excellence. [NG238: Cardiovascular disease—risk assessment and reduction, including lipid modification](https://www.nice.org.uk/guidance/ng238). Published 14 December 2023; last reviewed 2 September 2025; replaces CG181.
- US Centers for Disease Control and Prevention. [Cholesterol Reference Method Laboratory Network](https://www.cdc.gov/clinical-standardization-programs/php/cvd/improving-performance-crmln.html), updated 2 December 2025, and [Lipids Standardization Program](https://www.cdc.gov/clinical-standardization-programs/php/cvd/monitoring-accuracy-lsp.html), updated 24 April 2024.
- American Diabetes Association. [Standards of Care in Diabetes—2026: Diagnosis and Classification of Diabetes](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes). 2026 edition.
- American Diabetes Association. [Standards of Care in Diabetes—2026: Cardiovascular Disease and Risk Management](https://diabetesjournals.org/care/article/49/Supplement_1/S216/163933/10-Cardiovascular-Disease-and-Risk-Management). 2026 edition.
- International Expert Committee. [Report on the Role of the A1C Assay in the Diagnosis of Diabetes](https://diabetesjournals.org/care/article/32/7/1327/27084/International-Expert-Committee-Report-on-the). 2009; retained as historical scientific support, not an active version 1 authority.
- American Diabetes Association/European Association for the Study of Diabetes. [Management of hyperglycaemia in type 2 diabetes, 2022](https://doi.org/10.1007/s00125-022-05787-2). Treatment consensus reviewed to preserve the treatment boundary; no target or therapy output is activated.
- World Health Organization/International Diabetes Federation. [Definition and Diagnosis of Diabetes Mellitus and Intermediate Hyperglycaemia](https://www.who.int/publications/i/item/definition-and-diagnosis-of-diabetes-mellitus-and-intermediate-hyperglycaemia). 2006.
- National Institute for Health and Care Excellence. [PH38 glossary: Preventing type 2 diabetes](https://www.nice.org.uk/guidance/PH38/chapter/glossary). Published 2012; current page reviewed 18 July 2026.
- NGSP. [Factors that Interfere with HbA1c Test Results](https://ngsp.org/factors.asp). Current page reviewed 18 July 2026.
- American Heart Association/American College of Cardiology et al. [2025 High Blood Pressure Guideline](https://www.ahajournals.org/doi/10.1161/HYP.0000000000000249). Published 14 August 2025.
- European Society of Cardiology. [2024 ESC Guidelines for the Management of Elevated Blood Pressure and Hypertension](https://academic.oup.com/eurheartj/article/45/38/3912/7741010). Published 30 August 2024.
- National Institute for Health and Care Excellence. [NG136: Hypertension in adults—recommendations](https://www.nice.org.uk/guidance/ng136/chapter/recommendations). Published 28 August 2019; updated 26 February 2026.
- International Society of Hypertension. [2020 ISH Global Hypertension Practice Guidelines](https://journals.lww.com/jhypertension/fulltext/2020/06000/2020_international_society_of_hypertension_global.2.aspx). Global practice context reviewed; no threshold blending.
- World Health Organization. [Guideline for the pharmacological treatment of hypertension in adults](https://www.who.int/publications/i/item/9789240033986). Published 24 August 2021; treatment thresholds and targets remain blocked.
- American Heart Association. [Measurement of Blood Pressure in Humans: A Scientific Statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409525/). Hypertension scientific statement.
- World Health Organization. [Waist Circumference and Waist–Hip Ratio: Report of a WHO Expert Consultation](https://www.who.int/publications/i/item/9789241501491). Published 2011; consultation held December 2008.
- International Diabetes Federation. [IDF Consensus Worldwide Definition of the Metabolic Syndrome](https://idf.org/news-and-resources/resources/idf-consensus-worldwide-definition-of-the-metabolic-syndrome/). 2006; ethnicity-specific waist criteria reviewed, while the composite diagnosis remains blocked.
- Browning, Hsieh, and Ashwell. [Systematic review of waist-to-height ratio as a screening tool](https://pubmed.ncbi.nlm.nih.gov/20819243/). Published online 7 September 2010; supports screening utility but does not authorize universal personal-risk interpretation.
- National Institute for Health and Care Excellence. [NG246: Identifying and assessing overweight, obesity and central adiposity](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity). Published 14 January 2025; updated 8 January 2026.

---

**Scientific governance conclusion:** Phase 7.0C authorizes only the source-bound, context-matched outputs enumerated above. All other interpretations fail closed. This dossier does not implement or modify production behavior.
