# Phase 7.0A — Cardiometabolic Health scientific evidence review

<!-- markdownlint-disable MD013 -->

| Document field | Value |
| --- | --- |
| Document type | Official scientific evidence dossier |
| Scientific platform | Vitalspan |
| Review date | 18 July 2026 |
| Evidence cut-off | 18 July 2026 |
| Review type | Rapid structured evidence review and repository audit |
| Scope | Scientific foundation, domain boundary, candidate selection, and future production candidacy only |
| Final scientific recommendation | **Production Ready — Conditional** |

## 1. Executive Summary

Cardiometabolic Health is a scientifically defensible independent Vitalspan domain
when it is defined as a governed collection of independent measurements describing
atherogenic lipoprotein burden, glycemic status, blood pressure, and central
adiposity. These systems share causes and outcomes, but they are not interchangeable
and must not be mathematically merged without a separately validated published
model.

The domain is **Production Ready — Conditional** at the construct and candidate
selection level. The condition is not uncertainty about whether cardiometabolic
health matters. It is the requirement that Phase 7.0B establish source-specific
measurement identities, mandatory context, provenance, repeatability, eligibility,
and fail-closed rules before any candidate is implemented. A later Phase 7.0C must
govern references and interpretation before categories or threshold-based language
can be used.

Version 1 should organize, but never score, four subdomains:

1. **Atherogenic Lipids**
2. **Glycemic Status** rather than “Glycemic Regulation,” because the eligible
   measurements observe glycemic exposure or concentration and do not directly
   measure regulatory physiology
3. **Blood Pressure**
4. **Central Adiposity**

“Cardiometabolic Inflammation” is not approved as a version-1 subdomain. High-
sensitivity C-reactive protein (hs-CRP) is a nonspecific, variable cardiovascular
risk marker with limited incremental value and no established causal role for CRP
itself. It may be retained as context for a future authorized cardiovascular-risk
model or governed later in a separate Inflammation domain.

Kidney measurements are not core cardiometabolic measurements. Serum creatinine,
estimated glomerular filtration rate (eGFR), urine albumin-to-creatinine ratio
(UACR), and cystatin C are important cardiovascular and metabolic context, but
together constitute a separately governed Kidney Health domain. ALT, AST, and GGT
similarly belong to a future Liver Health domain. Overlap does not transfer
interpretation authority.

The strongest version-1 candidates are ApoB, LDL-C, non-HDL-C, HDL-C as a risk
marker only, HbA1c, and repeated validated cuff-based home blood pressure. Eligible
with material conditions are triglycerides, lipoprotein(a), fasting plasma glucose,
standardized office or automated-office blood pressure, waist circumference, and
waist-to-height ratio.

This review does not diagnose disease, authorize treatment targets, create a risk
engine, or alter Clinical PhenoAge, VO₂max, or Functional Capacity. Population
associations are not individual predictions. No candidate may be translated into
lifespan, biological age, “metabolic age,” or a universal optimal longevity range.

## 2. Scope and Scientific Definition

### 2.1 Official Vitalspan definition

**Cardiometabolic Health is the independently observed state of atherogenic
lipoprotein exposure, glycemic status, arterial blood pressure, and central
adiposity on stated dates, measured under known methods and interpreted only within
the authority of each measurement.**

The parent domain is organizational. It does not imply a latent common score or
that one favorable measurement offsets another unfavorable measurement.

### 2.2 Why the domain is independent and longevity relevant

The domain is justified independently because:

- ApoB-containing lipoproteins and sustained elevated blood pressure have strong
  convergent causal evidence for atherosclerotic cardiovascular disease (ASCVD).
- Dysglycemia is central to diabetes screening and monitoring and is associated
  with microvascular disease, cardiovascular disease, kidney disease, disability,
  and mortality.
- Central adiposity is a practical exposure and risk marker associated with
  diabetes, cardiovascular disease, and mortality, while remaining distinct from a
  complete body-composition assessment.
- These measurements are internationally adopted, longitudinally measurable, and
  clinically actionable in settings outside Vitalspan.
- Their shared outcome relevance does not erase their different biology,
  measurement error, clinical roles, or interpretation requirements.

The domain is longevity relevant because its components are associated with major
causes of morbidity, disability, and premature mortality. It does not measure
longevity directly and cannot predict an individual's lifespan.

### 2.3 Scientific roles used in this dossier

| Role | Meaning |
| --- | --- |
| Screening variable | Helps identify who may need formal assessment; does not itself authorize diagnosis |
| Diagnostic variable | Appears in an external clinical diagnostic framework; Vitalspan does not exercise that authority in this phase |
| Causal risk factor | Convergent genetic, mechanistic, epidemiological, and/or randomized evidence supports a causal pathway |
| Risk marker | Predicts or associates with outcomes but is not established as the causal agent represented by the measured value |
| Treatment target | Used by guidelines to direct clinical therapy; no treatment target is operationalized here |
| Monitoring variable | Can describe comparable longitudinal measurements without attributing cause or treatment effect |
| Contextual descriptor | Helps interpret another measurement but is not independently interpreted within the core domain |

One candidate may have several roles. A clinical role does not grant Vitalspan
diagnostic or treatment authority.

## 3. Domain Boundary

| Adjacent domain or activity | Boundary decision |
| --- | --- |
| Clinical Biological Age | Cardiometabolic measurements remain native measurements. They do not modify Clinical PhenoAge, create age acceleration, or inherit the PhenoAge model's authority. Biomarker overlap requires a separate candidate ID, scientific role, provenance, and interpretation version. |
| Cardiorespiratory Fitness | VO₂max and VO₂peak measure maximal or peak aerobic capacity. Cardiometabolic biomarkers may influence fitness but cannot estimate, replace, or adjust VO₂max. |
| Functional Capacity | Task performance remains independent. Cardiometabolic measurements cannot infer grip, gait, balance, transfers, or walking capacity. |
| Frailty | Frailty is a multidimensional vulnerability construct. No lipid, glucose, blood-pressure, or anthropometric value diagnoses frailty. |
| Recovery and Resilience | Resting heart rate, acute glucose, CRP, blood pressure, and body weight can change with stress or recovery, but that does not move them into a recovery construct or authorize a readiness score. |
| Kidney Health | Creatinine, eGFR, UACR, and cystatin C belong to a future Kidney Health domain. They may be contextual dependencies for glycemic, blood-pressure, lipid, and published-risk-model interpretation. |
| Liver Health | ALT, AST, and GGT belong to a future Liver Health domain. Metabolic associations do not make them core cardiometabolic measures. |
| General Inflammation | hs-CRP and standard CRP are governed outside the core. hs-CRP may be cardiovascular-risk context; standard CRP is primarily an acute inflammatory marker. |
| Body Composition | Total fat, lean mass, regional fat, and device-estimated visceral fat belong to Body Composition. Only simple central anthropometry is retained in the cardiometabolic core. |
| Clinical cardiovascular risk prediction | PREVENT, SCORE2/SCORE2-OP, QRISK, Framingham, and similar equations belong to a future Risk Prediction program. Their inputs may also exist as independent measurements. |
| Disease diagnosis | External diagnostic frameworks may use the same measurements. Vitalspan must not diagnose diabetes, hypertension, dyslipidemia, obesity, CKD, liver disease, or metabolic syndrome from this domain. |
| Medication management | Medication exposure is required context. Initiation, cessation, selection, dose, targets, and treatment response attribution remain clinician responsibilities. |

### 3.1 Kidney and inflammation decisions

**Kidney function is a contextual dependency and a separate future domain.** KDIGO
classifies CKD using both GFR and albuminuria and requires chronicity; it explicitly
warns against assuming chronicity from one abnormal eGFR or ACR. Importing kidney
markers into a broad cardiometabolic score would obscure that framework.

**Inflammation is not a version-1 core subdomain.** hs-CRP is associated with
cardiovascular and mortality outcomes, but acute infection, injury, inflammatory
disease, adiposity, smoking, pregnancy, exercise, and medication can change it.
Mendelian-randomization evidence does not establish CRP itself as a causal target.
Standard CRP lacks the low-concentration performance and intended role of hs-CRP
for cardiovascular-risk assessment.

### 3.2 Overlap policy

A measurement may appear in multiple scientific programs only when all of the
following remain independent:

- stable candidate and measurement identity;
- scientific purpose and interpretation authority;
- source and specimen provenance;
- unit and method normalization;
- eligibility and context requirements;
- scientific and interpretation versions; and
- prohibited claims.

No existing Clinical PhenoAge, VO₂max, or Functional Capacity calculation,
eligibility rule, reference, output, or documentation is changed by this review.

## 4. Research Method

This is a rapid structured evidence review updated through 18 July 2026. Searches
covered official organization sites, PubMed, PubMed Central, guideline publisher
pages, original model publications, laboratory-standardization publications, major
systematic reviews, meta-analyses, and citation chaining.

Priority was given to the latest authoritative version available at review time:

- 2026 ACC/AHA multisociety dyslipidaemia guideline, originally published
  13 March 2026, which replaces the 2018 US cholesterol guideline;
- 2025 focused update of the 2019 ESC/EAS dyslipidaemia guideline, published
  29 August 2025, which supplements rather than replaces the 2019 full guideline;
- ADA Standards of Care in Diabetes—2026, published 8 December 2025;
- 2025 AHA/ACC adult high-blood-pressure guideline and 2024 ESC elevated-blood-
  pressure and hypertension guideline;
- NICE NG246, published 14 January 2025, for obesity and central adiposity;
- KDIGO 2024 CKD guideline, published 13 March 2024;
- current laboratory guidance and standardization statements; and
- original publications for PREVENT, SCORE2/SCORE2-OP, QRISK3, Framingham, and
  Life's Essential 8.

Searches were not prospectively registered, dual-screened, or exhaustive at the
study level. This dossier is suitable for domain and candidate selection, not for a
claim that every cohort, subgroup, assay, device, or specialty use has been
enumerated.

### 4.1 Version and correction audit

Publisher landing pages, journal records, and available correction indicators were
checked on 18 July 2026. No material correction changing the scientific decisions
in this dossier was identified. “No material correction identified” is not a
guarantee that none will be issued later. Evidence surveillance remains mandatory.

The KDIGO 2026 Diabetes and CKD document located during review was a public-review
draft, not a final guideline, and was not used to supersede KDIGO 2024 or ADA 2026.
The 2021 USPSTF hypertension-screening recommendation and 2018 nontraditional CVD-
risk-factor recommendation remain the latest final USPSTF statements located for
their respective questions.

## 5. Evidence Hierarchy

Greater weight was given, in order, to:

1. International clinical-practice guidelines and technical standards with formal
   evidence review.
2. Laboratory reference-method, traceability, and assay-standardization
   publications.
3. Systematic reviews, meta-analyses, and individual-participant pooled analyses.
4. Large prospective cohorts and original externally validated model studies.
5. Randomized trials for causal treatment effects, without assuming that a
   biomarker change mediates the full clinical effect.
6. Mendelian-randomization and genetic evidence, interpreted alongside biology and
   trials.
7. Specialty consensus and narrative review for context not resolved above.
8. Manufacturer evidence only for device-specific operating claims, never as the
   sole basis for general clinical interpretation.

Evidence language:

- **High:** mature measurement plus concordant guidelines and replicated outcomes
  or strong causal evidence.
- **Moderate:** consistent evidence with material protocol, population,
  standardization, transportability, or observational limitations.
- **Low:** sparse, heterogeneous, proprietary, poorly standardized, or
  insufficiently validated for individual interpretation.
- **Not established:** evidence does not authorize the proposed claim.

Candidate status classifies scientific readiness, not a person's health:

| Status | Meaning |
| --- | --- |
| Production Eligible | Mature independent measurement suitable for a later governed standard |
| Conditionally Production Eligible | Suitable only with the stated method, metadata, population, or repeat requirements |
| Research Only | Scientifically interesting but not sufficiently standardized or governed for general production interpretation |
| Clinical Specialty | Established for a defined clinical pathway, not general platform interpretation |
| Context Only | May inform interpretation but is not independently classified in the core domain |
| Deferred | Plausible but awaiting a resolved method, standard, reference, or governance decision |
| Unsupported | Current evidence or technology is insufficient for the proposed use |
| Excluded | Outside this domain or duplicative without sufficient independent value |

## 6. Candidate Measurement Registry

The following is the official Phase 7.0A dossier registry. It is not a production
code registry.

### 6.1 Lipid and atherogenic burden

| Stable ID | Display name | Scientific role | Direct / derived | Required context | Evidence | Status | Principal limitation and boundary | Future phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CM-LIP-APOB | Apolipoprotein B | Causal atherogenic-particle exposure proxy; risk marker; external treatment target | Direct immunoassay | Assay, unit, medication, pregnancy, acute illness; interpret discordance explicitly | High | **Production Eligible** | One ApoB molecule represents each circulating atherogenic particle, but concentration is not a plaque image or personal event probability | 7.0B method/provenance; 7.0C references and decision thresholds |
| CM-LIP-LDLC | LDL cholesterol | Causal atherogenic exposure marker; screening; external treatment target | Direct or calculated method must be distinguished | Calculation/direct method, triglycerides, fasting state, medication, assay | High | **Production Eligible** | Cholesterol mass is not particle count; method disagreement rises at low LDL-C and high triglycerides | 7.0B method identities; 7.0C thresholds/targets |
| CM-LIP-NHDLC | Non-HDL cholesterol | Atherogenic-cholesterol marker; screening; external treatment target | Derived from measured total and HDL cholesterol | Source analytes, same specimen, units, medication | High | **Production Eligible** | Counts cholesterol mass across ApoB particles, not their number; duplicates source information if presented as a new independent signal | 7.0B derivation provenance; 7.0C interpretation |
| CM-LIP-HDLC | HDL cholesterol | Cardiovascular risk marker and risk-model input | Direct homogeneous assay or stated method | Assay, triglycerides, alcohol, medication, acute illness, sex/pregnancy context | High for association; not causal as a target | **Production Eligible** | Must never be called protective in isolation or treated as “higher is always better”; not a therapeutic target | 7.0B assay; 7.0C marker-only policy |
| CM-LIP-TG | Triglycerides | Screening and monitoring marker of triglyceride-rich lipoprotein metabolism; external risk-enhancing/treatment context | Direct enzymatic assay | Fasting duration, time since meal, alcohol, acute illness, pregnancy, diabetes, medication | High for clinical adoption; moderate for independent causal interpretation | **Conditionally Production Eligible** | Large biological and postprandial variability; triglyceride mass is not the causal particle count | 7.0B fasting and repeat rules; 7.0C thresholds |
| CM-LIP-LPA | Lipoprotein(a) | Genetically influenced causal ASCVD and aortic-stenosis risk factor; risk modifier | Direct immunoassay | Assay, isoform sensitivity, original unit, kidney/inflammatory state, pregnancy; medication | High | **Conditionally Production Eligible** | mg/dL and nmol/L are not universally convertible; usually once in adulthood, but repeat may be clinically justified when context changes | 7.0B assay/unit identity; 7.0C risk context |
| CM-LIP-TC | Total cholesterol | Screening-panel component and published-model input | Direct enzymatic assay | HDL, LDL method, triglycerides, medication | High availability; limited incremental value | **Context Only** | Does not distinguish atherogenic from HDL cholesterol and adds little independent interpretation when components are present | 7.0B provenance only; model use deferred |
| CM-LIP-RC-D | Direct remnant cholesterol | Research marker of cholesterol in remnant lipoproteins | Direct, method dependent | Exact assay/fraction definition, fasting state, triglycerides, units | Moderate association; low harmonization | **Research Only** | “Direct” methods quantify different remnant constructs and are not interchangeable | Method-specific future review |
| CM-LIP-RC-C | Calculated remnant cholesterol | Research estimate of remnant cholesterol | Derived | Exact source analytes and LDL method, same specimen, triglycerides | Moderate association; low individual method validity | **Deferred** | Inherits all source and LDL errors; direct and calculated results show imperfect agreement | Separate derivation authorization |
| CM-LIP-R-TCHDL | Total cholesterol / HDL-C ratio | Published risk-model input; contextual risk marker | Derived | Same specimen and units; model identity if used | Moderate | **Context Only** | Ratio obscures whether numerator, denominator, or both changed; no independent interpretation outside an authorized model | Risk Prediction program |
| CM-LIP-R-TGHDL | Triglyceride / HDL-C ratio | Research surrogate for insulin resistance and dyslipidaemia pattern | Derived | Fasting state, unit system, ethnicity/population, assay | Low-to-moderate | **Research Only** | Cutoffs vary by population and unit system; does not measure insulin resistance | Research standard only |
| CM-LIP-R-APOBAPOA1 | ApoB / ApoA1 ratio | Epidemiological risk marker | Derived | Both assays, same specimen, population | Moderate | **Research Only** | Strong INTERHEART association does not establish incremental production value over ApoB and standard measures; requires an otherwise unselected ApoA1 assay | Comparative-value review |

### 6.2 Glycemic health

| Stable ID | Display name | Scientific role | Direct / derived | Required context | Evidence | Status | Principal limitation and boundary | Future phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CM-GLY-HBA1C | Hemoglobin A1c | Screening, external diagnosis, and diabetes monitoring | Direct standardized assay | NGSP/DCCT traceability and IFCC unit; anemia, hemoglobin variant, red-cell turnover, CKD, transfusion, pregnancy, medication | High | **Production Eligible** | Indirect weighted glycemic exposure; distorted when erythrocyte biology or assay interference breaks its relation to glucose | 7.0B assay/context gates; 7.0C references and diagnostic-boundary language |
| CM-GLY-FPG | Fasting plasma glucose | Screening, external diagnosis, monitoring | Direct laboratory plasma assay | Verified fast, specimen handling, collection time, acute illness, exercise, medication, pregnancy | High | **Conditionally Production Eligible** | Meaningful day-to-day and pre-analytical variability; fasting state must never be inferred | 7.0B specimen/fasting/repeat rules; 7.0C thresholds |
| CM-GLY-RPG | Random plasma glucose | Symptom-linked external diagnostic pathway and acute clinical assessment | Direct laboratory plasma assay | Time since food, symptoms, acute illness, medication, pregnancy, specimen type | High in its clinical pathway | **Clinical Specialty** | Not a general fasting-equivalent screen; isolated asymptomatic value does not diagnose diabetes | Clinical escalation standard |
| CM-GLY-OGTT | 75-g oral glucose tolerance test | External diagnosis of impaired glucose tolerance/diabetes and pregnancy-specific pathways | Direct serial plasma measurements under a protocol | Dose, fasting, timing, specimen handling, activity, illness, medication, pregnancy protocol | High | **Clinical Specialty** | High burden and within-person variability; pregnancy and nonpregnancy protocols and thresholds differ | Test-specific clinical standard |
| CM-GLY-CGM-DM | CGM metrics in diabetes | Treatment monitoring and hypoglycaemia/hyperglycaemia pattern assessment | Device-estimated interstitial glucose and derived metrics | Diagnosis, device, sensor/algorithm version, wear completeness, calibration, medication, clinical goal | High in selected diabetes populations | **Clinical Specialty** | Not interchangeable with laboratory plasma glucose and not authorized here for treatment decisions | Diabetes Technology specialty program |
| CM-GLY-CGM-ND | CGM metrics without diabetes | Consumer wellness and research observation | Device-estimated and derived | Device, wear, meal/activity context, population | Low for clinical outcomes and interpretation | **Research Only** | No validated universal “optimal” excursions; ADA finds insufficient evidence for screening or diagnosis | Prospective outcome and utility evidence |
| CM-GLY-INS | Fasting insulin | Research marker of basal insulin secretion and insulin resistance context | Direct immunoassay | Verified fast, assay, specimen matrix, medications including exogenous insulin, acute illness, pregnancy | Moderate physiology; low standardization | **Research Only** | Large inter-assay differences and no universal clinical scale | IFCC traceability and clinical-governance gate |
| CM-GLY-HOMAIR | HOMA-IR | Research surrogate of fasting insulin resistance | Derived model | Matched fasting glucose and insulin, specimen matrix, assay, HOMA version/calculator, medication | Moderate research validity; low general reproducibility | **Research Only** | Insulin-assay variation can produce approximately twofold estimate variation; population cutoffs disagree | No production until assay and model governance mature |
| CM-GLY-FRUCT | Fructosamine | Shorter-term glycated-protein monitoring when HbA1c is unsuitable | Direct assay | Albumin/total protein, protein turnover, thyroid/liver/kidney state, pregnancy | Moderate | **Clinical Specialty** | Assay and protein-concentration effects; not a general diagnostic substitute | Specialty reference standard |
| CM-GLY-GA | Glycated albumin | Shorter-term glycemic monitoring in selected settings | Direct or assay-derived percentage | Albumin, protein turnover, nephrotic loss, liver/thyroid state, pregnancy | Moderate | **Clinical Specialty** | Bias with abnormal albumin metabolism and incomplete global standardization/adoption | Specialty reference standard |

### 6.3 Blood pressure

| Stable ID | Display name | Scientific role | Direct / derived | Required context | Evidence | Status | Principal limitation and boundary | Future phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CM-BP-OFFICE | Office cuff SBP and DBP | Screening and clinical measurement | Direct auscultatory or validated oscillometric | Device validation, cuff, arm, posture, rest, talking, repeats, operator, time, recent exposures, medication | High | **Conditionally Production Eligible** | White-coat effect, technique, and single-visit variability; one reading is not a diagnosis | 7.0B protocol and repeat policy; 7.0C setting-specific thresholds |
| CM-BP-AOBP | Automated office SBP and DBP | Standardized office measurement | Direct validated oscillometric series | Device, unattended/attended status, rest, repeat algorithm, arm/cuff | High | **Conditionally Production Eligible** | Different protocols generate different values; cannot be silently pooled with routine office readings | Separate measurement identity |
| CM-BP-HOME | Repeated home cuff SBP and DBP | Out-of-office confirmation and longitudinal monitoring | Direct validated oscillometric | Validated upper-arm device, user training, morning/evening timing, repeats, medication timing, dates | High | **Production Eligible** | Technique and selective recording can bias results; requires a series, not an isolated home value | 7.0B series completeness and comparability |
| CM-BP-ABPM | Ambulatory SBP and DBP | Reference out-of-office phenotype, confirmation, nocturnal and diurnal assessment | Direct repeated oscillometric | Validated device, schedule, wake/sleep/activity diary, valid-reading count, medication | High | **Clinical Specialty** | Highest information and prognostic authority, but clinical setup and interpretation are required | ABPM specialty standard |
| CM-BP-SINGLE | Single cuff blood-pressure reading | Dated observation and possible safety input | Direct | Full technique and symptom context | High measurement relevance; low classification authority | **Context Only** | Cannot diagnose hypertension or establish usual pressure | Safety/escalation review only |
| CM-BP-CUFFLESS | Consumer cuffless BP estimate | Consumer estimate | Device/algorithm estimate | Device, calibration, posture, motion, algorithm, validation | Low | **Unsupported** | 2025 AHA/ACC recommends against use for diagnosis or management until precision and reliability improve | Re-review after independent standards and real-world validation |
| CM-BP-PP | Pulse pressure | Hemodynamic descriptor and specialty prognostic marker | Derived from same-reading SBP and DBP | Same beat/reading, age, arterial context, method | Moderate | **Context Only** | Strongly age- and disease-dependent; no sufficient independent general-user actionability | Specialty/reference review |
| CM-BP-MAP | Mean arterial pressure | Hemodynamic/perfusion descriptor | Device output or derived approximation | Waveform or stated approximation, heart rate/rhythm, clinical state | High physiology; low general-platform utility | **Context Only** | Approximation varies with waveform and heart rate; primarily acute/specialty use | Specialty review |
| CM-BP-RHR | Resting heart rate | Cardiovascular and autonomic context; published-model input in limited settings | Direct count/device measure | Rest, posture, rhythm, fitness, fever, medication, stimulants, device | Moderate association | **Context Only** | Nonspecific and overlaps Recovery/Resilience and Cardiorespiratory Fitness; not a blood-pressure measurement | Future cross-domain governance |

### 6.4 Anthropometry and adiposity

| Stable ID | Display name | Scientific role | Direct / derived | Required context | Evidence | Status | Principal limitation and boundary | Future phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CM-ANTH-WAIST | Waist circumference | Central-adiposity screening marker and monitoring measure | Direct anthropometry | Anatomical site, tape, posture, respiration, clothing, time/meal, pregnancy, population | High for association; moderate global thresholds | **Conditionally Production Eligible** | Protocol and sex/ethnicity/region affect interpretation; not direct visceral-fat measurement | 7.0B protocol; 7.0C population references |
| CM-ANTH-WHTR | Waist-to-height ratio | Central-adiposity screening marker | Derived from direct waist and height | Both protocols, same unit, adult/pediatric status, pregnancy | Moderate-to-high | **Conditionally Production Eligible** | More portable than fixed waist cutoffs but not a direct fat measurement or diagnosis | 7.0B derivation; 7.0C age/population policy |
| CM-ANTH-BMI | Body mass index | Population screening and contextual body-size descriptor | Derived from weight and height | Measurement methods, age, pregnancy, edema, muscularity, ethnicity/population | High for population association | **Context Only** | Not a direct measure of adiposity, fat distribution, muscle, or individual health quality | 7.0C contextual policy |
| CM-ANTH-WEIGHT | Body weight | Direct longitudinal descriptor | Direct scale measurement | Scale, clothing, time, hydration, food, edema, pregnancy, medication | High availability | **Context Only** | Change may reflect fluid, tissue, pregnancy, illness, or measurement context; direction is not inherently good or bad | 7.0B comparability |
| CM-ANTH-BF-CLIN | Clinical body-fat percentage | Body-composition measurement | Device-estimated against a method-specific model | Method such as DXA/4-compartment/BIA, device, hydration, population, pregnancy | Method dependent | **Clinical Specialty** | No method is universally interchangeable; belongs to Body Composition | Body Composition program |
| CM-ANTH-BF-CONS | Consumer body-fat percentage | Consumer body-composition estimate | Proprietary BIA or wearable estimate | Device/version, hydration, food, exercise, skin/foot contact, population | Low individually | **Research Only** | Wide individual limits of agreement and algorithm dependence | Device-specific validation |
| CM-ANTH-VISC | Commercial visceral-fat score | Consumer/research estimate | Proprietary derived score | Device, algorithm, reference modality and population | Low | **Research Only** | Undefined units and vendor-specific scales are not comparable or clinically interpretable | No use without transparent validation |
| CM-ANTH-WHR | Waist-to-hip ratio | Central fat-distribution marker | Derived from waist and hip circumference | Both anatomical protocols, sex, population, pregnancy | Moderate-to-high association | **Context Only** | Added hip measurement and protocol error do not establish general incremental production value over waist/WtHR | 7.0C comparative review |

### 6.5 Inflammation and renal/hepatic/metabolic context

| Stable ID | Display name | Scientific role | Direct / derived | Required context | Evidence | Status | Principal limitation and boundary | Future phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CM-INF-HSCRP | High-sensitivity C-reactive protein | Nonspecific inflammation and cardiovascular risk marker | Direct high-sensitivity immunoassay | Acute illness/injury, inflammatory disease, repeat stability, smoking, adiposity, exercise, pregnancy, medication | High association; not causal for CRP itself | **Context Only** | Small incremental prediction in many settings; not a stand-alone cardiometabolic state or treatment target | Inflammation or Risk Prediction program |
| CM-INF-CRP | Standard C-reactive protein | Acute/systemic inflammation marker | Direct immunoassay | Symptoms, infection, injury, inflammatory disease, assay | High clinical utility outside this domain | **Excluded** | Not the assay intended for low-grade cardiovascular-risk context; belongs to General Inflammation/clinical assessment | Future Inflammation domain |
| CM-REN-CREAT | Serum creatinine | Kidney filtration context and eGFR input | Direct assay | Assay traceability, muscle mass, diet, supplements, medication, hydration, acute illness, pregnancy | High | **Context Only** | Not a direct GFR measure and belongs to Kidney Health | Kidney Health program |
| CM-REN-EGFR | Estimated glomerular filtration rate | CKD evaluation/staging and risk-model input | Published equation | Equation/version, creatinine/cystatin assay, age, body-size extremes, acute state | High in governed use | **Context Only** | Single low eGFR does not establish CKD; equation limitations and chronicity apply | Kidney Health program |
| CM-REN-UACR | Urine albumin-to-creatinine ratio | Kidney-damage marker and cardiovascular/kidney prognostic marker | Ratio of direct urine assays | Sample type/time, exercise, infection, menstruation, fever, glycemia, BP, repeat confirmation | High | **Context Only** | High within-person variability; chronic kidney interpretation requires repeat/context | Kidney Health program |
| CM-REN-CYSC | Cystatin C | Filtration marker and combined-eGFR input | Direct immunoassay | Assay, thyroid state, glucocorticoids, inflammation, body composition, smoking | High for selected kidney use | **Context Only** | Non-GFR determinants remain; belongs to Kidney Health | Kidney Health program |
| CM-MET-URATE | Uric acid | Gout/stone variable and cardiometabolic risk marker | Direct assay | Kidney function, diet/alcohol, hydration, medication, tumor turnover, sex/pregnancy | Moderate association; uncertain causality | **Research Only** | Cardiovascular causality and benefit of treating asymptomatic elevation remain uncertain | Separate gout/kidney/metabolic review |
| CM-HEP-ALT | Alanine aminotransferase | Hepatocellular-injury context | Direct enzyme assay | Method/upper limit, muscle injury, exercise, alcohol, medication, infection, pregnancy | High clinical adoption | **Context Only** | Normal does not exclude steatotic liver disease; abnormal is nonspecific; belongs to Liver Health | Liver Health program |
| CM-HEP-AST | Aspartate aminotransferase | Hepatic and muscle-injury context | Direct enzyme assay | Method/upper limit, muscle injury, exercise, alcohol, medication, hemolysis | High clinical adoption | **Context Only** | Less liver specific than ALT; ratio/composite interpretation is not authorized | Liver Health program |
| CM-HEP-GGT | Gamma-glutamyl transferase | Hepatobiliary/enzyme-induction context and epidemiologic risk marker | Direct enzyme assay | Alcohol, cholestasis, liver disease, medication, smoking, assay | Moderate cardiometabolic association | **Context Only** | Nonspecific and not a cardiometabolic causal target | Liver Health program |

No additional emerging commercial biomarker is admitted to version 1. In
particular, LDL subfractions, proprietary lipoprotein-particle panels, TyG and
METS-IR variants, adipokines, metabolomics, oxidized LDL, and commercial
“biological” or “metabolic” ages lack sufficient incremental evidence,
standardization, or governance for this scope.

## 7. Lipid and Atherogenic Burden Review

### 7.1 Construct and causal status

ApoB-containing particles include LDL, intermediate-density and very-low-density
remnants, and Lp(a). Each circulating atherogenic particle contains one ApoB
molecule. ApoB concentration therefore approximates particle number, while LDL-C
and non-HDL-C quantify cholesterol mass in overlapping particle sets. Convergent
mechanistic, genetic, epidemiological, and randomized-treatment evidence establishes
retention of ApoB-containing lipoproteins in the arterial wall as causal in ASCVD
([EAS causal consensus](https://academic.oup.com/eurheartj/article/38/32/2459/3745109);
[2026 ACC/AHA guideline](https://www.jacc.org/doi/10.1016/j.jacc.2025.11.016)).

**ApoB is the preferred scientific representation of atherogenic particle burden,
especially when ApoB, LDL-C, and non-HDL-C are discordant.** It is not the sole
authorized lipid measurement:

- LDL-C remains the most internationally adopted causal exposure marker and
  guideline treatment target.
- Non-HDL-C is inexpensive, available from the standard panel, valid when
  triglyceride-rich particles matter, and a current treatment target in the 2026
  US guideline.
- ApoB can better represent particle burden when cholesterol per particle varies,
  particularly with diabetes, hypertriglyceridaemia, metabolic dysfunction, or
  very low LDL-C.
- Lp(a) conveys inherited risk that is not adequately represented by LDL-C,
  non-HDL-C, or ApoB alone at typical concentrations.

All may coexist as independent measurements. The interpretation policy should show
their related but nonidentical roles and should not count their shared biology as
three separate risk votes. “Precedence” means explanatory priority in discordance,
not deletion of LDL-C or non-HDL-C and not an instruction to treat.

### 7.2 Candidate-specific judgment

| Candidate | Definition and physiology | Clinical and longitudinal role | Incremental value and evidence judgment |
| --- | --- | --- | --- |
| ApoB | Structural apolipoprotein present once per atherogenic particle | Screening/risk assessment and monitoring under guideline pathways | Highest conceptual fidelity to particle number; high value in discordance; strong production value |
| LDL-C | Cholesterol mass attributed to LDL particles | Most adopted screening and treatment-monitoring lipid | Mature causal and trial evidence, but cholesterol-depleted or enriched particles create discordance |
| Non-HDL-C | Total cholesterol outside HDL, spanning LDL and triglyceride-rich remnants plus Lp(a) cholesterol | Screening and monitoring, including nonfasting use | Adds broader atherogenic-cholesterol coverage at no additional assay cost; still cholesterol mass |
| HDL-C | Cholesterol carried in HDL particles | Epidemiological marker and input to published risk models | Inverse association does not make HDL-C itself a validated protective intervention target; production interpretation must be marker-only |
| Triglycerides | Glycerol-esterified fatty-acid mass in circulating lipoproteins | Screening, pancreatitis-related clinical pathways, risk enhancement, and monitoring | Strong clinical utility; causal interpretation attaches more directly to triglyceride-rich ApoB particles/remnant cholesterol than to triglyceride mass itself |
| Lp(a) | LDL-like ApoB particle covalently linked to apolipoprotein(a) | Usually once-in-adulthood inherited-risk assessment, with selected repeats | Strong continuous genetic and epidemiological causal evidence for ASCVD and aortic stenosis; substantial incremental value |
| Total cholesterol | Cholesterol mass across all lipoproteins | Panel component and model input | Low independent value after components are available |
| Remnant cholesterol | Cholesterol attributed to triglyceride-rich remnant particles | Research risk marker | Relevant biology, but heterogeneous direct methods and calculated-error propagation block general production |
| Ratios | Relative values derived from two assays | Some published models and epidemiological studies | Ratios compress distinct biology, are unit-sensitive in the case of TG/HDL-C, and rarely add enough beyond governed source measurements |

HDL-C must be described as a **risk marker, not a therapeutic target**. Genetic
studies and failed HDL-raising strategies show that an observationally higher value
does not establish benefit from raising it. Neither low nor high HDL-C can offset
high atherogenic-particle exposure.

Lp(a) is predominantly genetically determined and relatively stable. The 2022 EAS
consensus supports measurement at least once in adults, preferably with an initial
lipid profile
([EAS Lp(a) consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC9639807/)).
Kidney disease, acute inflammation, pregnancy, and some therapies can alter values,
so “once” is a usual strategy rather than a biological guarantee. Results must
retain the assay's native mass or molar unit. An isoform-independent universal
conversion between mg/dL and nmol/L does not exist.

### 7.3 Measurement, variability, and confounding

| Dimension | ApoB | LDL-C / non-HDL-C / HDL-C / total cholesterol | Triglycerides | Lp(a) |
| --- | --- | --- | --- | --- |
| Availability | Broad but less universal than standard panel | Very broad international availability | Very broad | Increasing but not universal |
| Standardization | WHO/IFCC-aligned immunoassay traceability is mature, though laboratory bias remains possible | Cholesterol assays are well standardized; LDL calculation and direct methods remain method dependent | Enzymatic assays mature | Apo(a) isoform size affects some assays; harmonization remains incomplete |
| Within-person variability | Generally lower than triglycerides | Moderate; illness and biological change matter | High, especially after food/alcohol | Usually low over time outside changing context |
| Fasting | Not usually required | Nonfasting lipid panels are routinely acceptable; LDL method limitations still apply | Fasting status materially affects interpretation and must be retained | Not ordinarily required |
| Pre-analytics | Serum/plasma, storage, and assay identity | Same-specimen source analytes required for derived results | Meal timing, alcohol, and specimen timing important | Original specimen, assay, and unit required |
| Medication effects | Lipid-lowering and several systemic drugs alter value | Lipid-lowering, hormones, steroids, and other drugs may alter values | Lipid/glucose therapies, estrogens, steroids, retinoids, alcohol-related exposures | Some lipid therapies and inflammatory/kidney changes alter value; magnitude is therapy specific |
| Acute illness/exercise | Acute inflammation may lower or alter lipids; strenuous exercise can transiently change profile | Same | Especially variable | Acute inflammation can increase Lp(a) in some people |
| Pregnancy | Physiological lipids rise; no routine nonpregnant interpretation | Same | Often rises substantially | May rise; pregnancy-specific clinical context required |
| Kidney/liver/hematology | Nephrotic and liver states change lipoprotein production/clearance | Same | Same | Kidney disease can raise Lp(a); severe liver disease may lower synthesis |
| Population limits | Thresholds and treatment meaning depend on overall clinical risk | Same | Distribution differs by metabolic state and population | Distribution is strongly ancestry dependent; risk remains continuous across groups |

The 2016 EAS/EFLM consensus supports routine nonfasting lipid profiles
([consensus statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC4929379/)).
Vitalspan must nonetheless preserve fasting duration rather than infer it. A later
standard must define when a clinically obtained repeat fasting sample is necessary
without turning that rule into diagnosis or treatment advice.

Calculated remnant cholesterol is **not authorized** in this phase. Direct assays
also remain Research Only because they do not isolate one universally defined
fraction. Total cholesterol/HDL-C may be passed only into a separately authorized
model requiring it. TG/HDL-C and ApoB/ApoA1 ratios receive no standalone
insulin-resistance, “balance,” or risk interpretation.

### 7.4 Independent interpretation policy

- ApoB, LDL-C, non-HDL-C, triglycerides, and Lp(a) can each be described in their
  native scientific role when provenance and context are complete.
- HDL-C can be described independently only as a risk marker, never as protective
  capacity or a target.
- Total cholesterol is contextual when component measurements exist.
- Source measurements and derived non-HDL-C must remain visibly related; they
  cannot be presented as independent corroboration.
- Discordance can be stated descriptively only after Phase 7.0C defines applicable
  references. It must not be converted into a home-grown risk rule.

## 8. Glycemic Health Review

### 8.1 Roles of primary tests

| Test | Screening | External diagnosis | Monitoring | Vitalspan production role |
| --- | --- | --- | --- | --- |
| HbA1c | Yes | Yes, with standardized laboratory method and confirmation rules | Established in diabetes | Independent longer-term glycemic-exposure measurement |
| Fasting plasma glucose | Yes | Yes, with verified fasting and confirmation rules | Useful dated laboratory value | Independent fasting glycemic measurement |
| Random plasma glucose | Not a preferred asymptomatic general screen | Only in a symptom/hyperglycaemic-crisis pathway under clinical authority | Acute clinical use | Clinical Specialty only |
| 75-g OGTT | Yes in selected pathways | Yes; also uses distinct pregnancy pathways | Limited routine longitudinal use | Clinical Specialty protocol |
| CGM | Not validated for screening/diagnosis | No | Strong in selected diabetes populations | Clinical Specialty in diabetes; Research Only without diabetes |

ADA 2026 recognizes HbA1c, fasting plasma glucose, and two-hour plasma glucose
during a 75-g OGTT as diagnostic tests, and random plasma glucose only with classic
symptoms or hyperglycaemic crisis
([ADA 2026 Section 2](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes)).
In the absence of unequivocal hyperglycaemia, clinical practice requires
confirmation by a second abnormal result, either from the same test on another
sample or a different authorized test as specified by the clinical framework.
This dossier records that rule but does not diagnose diabetes or prediabetes.

HbA1c reflects glucose exposure across the erythrocyte lifespan, with more weight
on recent weeks. It is convenient, does not require fasting, and has lower acute
variability than glucose. It must be measured by an NGSP-certified method traceable
to the DCCT reference assay for the ADA diagnostic role, with IFCC-standardized
reporting supported internationally.

FPG measures one concentration after a verified fasting interval. Glucose is
biologically variable and vulnerable to ex-vivo glycolysis if specimen processing
is delayed. Laboratory venous plasma—not a consumer meter, CGM value, or inferred
fasting value—is the governed screening/diagnostic measurement.

OGTT tests the response to a standardized glucose challenge and can identify
post-challenge dysglycaemia missed by fasting measures. Dose, fast, collection
times, activity during the test, specimen handling, acute illness, and pregnancy-
specific protocol are integral to the measurement. It is not reducible to a generic
“post-meal glucose” value.

### 8.2 HbA1c distortion and glucose context

| Context | Scientific consequence |
| --- | --- |
| Hemoglobin variants | Method-specific analytical interference or altered red-cell biology can bias HbA1c |
| Hemolysis, blood loss, transfusion, erythropoietin, G6PD deficiency | Altered red-cell age changes the relation between HbA1c and glucose |
| Iron, folate, or B12 deficiency and treatment | Can change erythrocyte turnover and HbA1c independently of glycemia |
| CKD, kidney failure, dialysis | Anemia, erythropoiesis therapy, uremia, and shortened cell survival complicate HbA1c |
| Liver disease, HIV, splenectomy | May alter turnover or the HbA1c–glucose relationship |
| Pregnancy | Red-cell turnover and glycemic physiology change; pregnancy-specific clinical standards apply |
| Acute illness, stress, glucocorticoids | Can markedly change plasma glucose; HbA1c may not reflect the acute state |
| Recent exercise, food, alcohol, sleep, circadian timing | Can change glucose; fasting and timing metadata matter |
| Glucose-lowering medication | Value is a treated state, not untreated physiology; no treatment effect may be inferred without context |

When HbA1c and glucose are substantially discordant, the platform must not select
whichever looks more favorable. It must flag interpretation uncertainty and require
clinical review of assay, hematology, kidney/liver status, timing, and treatment.

### 8.3 CGM, fasting insulin, and derived insulin resistance

ADA 2026 supports CGM for treatment monitoring in expanding populations with
diabetes, but finds insufficient evidence to use CGM for screening or diagnosing
prediabetes or diabetes
([ADA 2026 technology](https://diabetesjournals.org/care/article/49/Supplement_1/S150/163922/7-Diabetes-Technology-Standards-of-Care-in);
[ADA abridged diagnosis](https://diabetesjournals.org/docm-care/article/doi/10.2337/doc26-a002/164629/Section-2-Diagnosis-and-Classification-of-Diabetes)).
Metrics such as time in range, glucose-management indicator, variability, peaks,
and meal responses are device-, wear-, population-, and purpose-dependent.
Diabetes treatment ranges must not be applied to people without diabetes as
wellness “optimization” ranges.

Fasting insulin has physiological relevance but inadequate between-assay
comparability for a universal individual scale. A current review of serum-insulin
standardization confirms that lack of standardized measurement continues to block
specific clinical interpretation
([insulin standardization review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12452087/)).
Exogenous insulin, insulin analogues, proinsulin cross-reactivity, secretion
patterns, fasting duration, and clearance further complicate results.

HOMA-IR combines fasting insulin and glucose within a model. Eleven insulin assays
produced approximately twofold differences in HOMA estimates in a direct
comparison
([HOMA analytical study](https://pmc.ncbi.nlm.nih.gov/articles/PMC2518363/)).
HOMA1 equations and HOMA2 calculators are not interchangeable, and cutoffs vary by
age, sex, ancestry, assay, and study definition. Fasting insulin and HOMA-IR remain
Research Only. This review explicitly blocks their use as a diagnosis, “insulin
sensitivity score,” or longitudinal treatment target.

Fructosamine and glycated albumin reflect a shorter window of protein glycation and
can be useful when HbA1c is unsuitable. Albumin concentration and turnover,
proteinuria, nephrotic states, liver and thyroid disease, nutrition, and assay
standardization limit general interpretation. They remain Clinical Specialty
measurements
([2023 laboratory guideline](https://academic.oup.com/clinchem/article/69/8/808/7226244)).

### 8.4 Longitudinal suitability

- HbA1c is highly suitable when assay and erythrocyte context remain valid.
- FPG is suitable only across comparable verified fasts, collection timing,
  specimen handling, clinical state, and medication context.
- Random glucose is not a fasting trend and cannot be pooled with FPG.
- OGTT trends require the exact same protocol and clinical purpose and are
  specialty governed.
- CGM trends require stable device/algorithm, sufficient wear, and a diabetes
  monitoring purpose; consumer meal-response experiments are Research Only.
- No glycemic change proves a cause, treatment benefit, or change in longevity.

## 9. Blood-Pressure Review

### 9.1 Measurement authority and identities

Ambulatory blood-pressure monitoring (ABPM) has the greatest scientific authority
for characterizing the full out-of-office blood-pressure phenotype because it
captures daytime, night-time, sleep–wake pattern, and many readings and has strong
prognostic evidence. It remains Clinical Specialty because device fitting, reading
quality, diaries, completeness, and interpretation require a clinical protocol.

Repeated home blood-pressure monitoring (HBPM) is the strongest scalable production
method for longitudinal observation and out-of-office confirmation when a validated
upper-arm cuff and standardized series are used. Standardized automated office,
routine office, home, and ambulatory measurements require separate scientific
identities. Values from those settings may be compared descriptively but not pooled
as if method were irrelevant.

The 2021 USPSTF recommendation uses office measurement for screening and requires
out-of-office measurement for diagnostic confirmation before treatment
([USPSTF](https://www.uspreventiveservicestaskforce.org/uspstf/index.php/recommendation/hypertension-in-adults-screening)).
The 2024 ESC guideline likewise distinguishes office, home, and ambulatory methods
([ESC 2024](https://academic.oup.com/eurheartj/article/45/38/3912/7741010)).
One measurement is a snapshot, not a diagnosis.

### 9.2 Minimum metadata and validity

Every interpretable cuff reading requires:

- systolic and diastolic values from the same reading;
- date, local time, and measurement setting;
- device make/model and independent validation status where available;
- cuff location, cuff size, measured arm, and arm position relative to the heart;
- posture, back/feet support, and rest duration;
- whether the person talked or moved;
- number and order of readings and interval between them;
- recent exercise, caffeine, nicotine, food, alcohol, pain, stress, bladder
  fullness, and acute illness;
- medication identity and timing where known; and
- pregnancy, symptoms, arrhythmia, and protocol deviations where applicable.

Initial clinical assessment commonly includes both arms; later serial comparison
requires a consistent selected arm under an authorized protocol. An incorrect cuff,
unsupported posture, arm below/above heart level, no rest, talking, recent exercise,
caffeine, nicotine, pain, or a full bladder can bias a reading. Unknown context is
not permission to assume ideal technique.

Repeated readings are required for usual-pressure interpretation. Phase 7.0B must
define complete office, home, and ambulatory series from the originating
guidelines; it must not invent a Vitalspan averaging rule.

### 9.3 Derived hemodynamics and heart rate

Pulse pressure is the same-reading difference between SBP and DBP. It may reflect
stroke volume and arterial stiffness, especially with aging, but age, valve
disease, rhythm, and vascular state strongly affect meaning. It lacks sufficient
incremental general-user utility beyond the source readings and remains Context
Only.

Mean arterial pressure describes average arterial pressure across a cardiac cycle.
Simple approximations assume a waveform and heart-rate range that may not hold.
MAP is important in acute and specialty care but does not add a mature independent
general cardiometabolic interpretation.

Resting heart rate is cardiometabolically relevant as a nonspecific autonomic,
fitness, rhythm, medication, fever, and stress marker. It is not a blood-pressure
component and remains cross-domain context.

### 9.4 Cuffless estimates

The 2025 AHA/ACC guideline recommends against cuffless devices for diagnosis or
management until precision and reliability improve. The related AHA scientific
statement notes sensitivity to calibration, motion, sensor position, posture, and
hydrostatic pressure and that regulatory clearance is not synonymous with clinical
accuracy
([AHA cuffless statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC13335599/)).
Consumer cuffless estimates are therefore Unsupported, not a lower-confidence
substitute for cuff measurement.

### 9.5 Outcome and longitudinal interpretation

Sustained elevated blood pressure is a causal risk factor for stroke, coronary
disease, heart failure, CKD, cardiovascular death, and all-cause mortality.
Randomized individual-participant evidence shows that lowering SBP reduces major
cardiovascular events, but this population treatment evidence cannot be converted
into an individual's predicted benefit or medication recommendation
([BPLTTC meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8102467/)).

Longitudinal monitoring is highly suitable when setting, device, cuff, posture,
timing, and medication context are comparable. Apparent change may otherwise be
measurement-context change. Vitalspan must not diagnose hypertension, identify a
drug effect, or infer that lower is always better.

## 10. Anthropometry and Adiposity Review

### 10.1 Core boundary

Waist circumference and waist-to-height ratio belong in Cardiometabolic Health
because they are simple measures of central body size with direct relevance to
diabetes and cardiovascular screening. They do not authorize a complete adiposity
or body-composition interpretation. BMI and weight remain useful context. Body-fat
percentage and visceral-fat estimates belong to Body Composition.

WHO's expert consultation concluded that waist and waist-to-hip measures predict
diabetes, cardiovascular disease, and mortality while emphasizing method, sex,
age, and ethnicity
([WHO report](https://www.who.int/publications/i/item/9789241501491)).
A meta-analysis of 72 prospective cohorts found central-fatness measures associated
with all-cause mortality, but with high heterogeneity and observational limitations
([BMJ meta-analysis](https://www.bmj.com/content/370/bmj.m3324)).

### 10.2 Waist, waist-to-height ratio, and BMI

Waist circumference is directly measured but method sensitive. Required protocol
elements include anatomical landmark, end-expiration or respiratory phase, posture,
tape tension/orientation, clothing, repeat rule, and whether measurement is
appropriate in pregnancy, ascites, abdominal mass, or major skin-fold distortion.
Different WHO and NIH-type sites cannot be silently pooled.

Waist-to-height ratio adjusts waist for stature and often discriminates
cardiometabolic risk better than BMI, with some advantage over waist alone in
systematic reviews
([Ashwell meta-analysis](https://pubmed.ncbi.nlm.nih.gov/22106927/);
[prospective synthesis](https://pmc.ncbi.nlm.nih.gov/articles/PMC3810792/)).
NICE NG246 supports its use in adults with BMI below 35, but the associated
classification cutoffs are clinical decision thresholds, not universal longevity
optima
([NICE NG246](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity)).

Fixed waist thresholds are not universally portable. Sex and ethnicity/region
affect the relation between waist and visceral tissue or metabolic risk.
Phase 7.0C must either select an applicable population-specific policy or fail
closed. Waist-to-height ratio may reduce, but does not eliminate, population,
age, sex, pregnancy, and protocol dependence.

BMI is weight divided by squared height and is a population screening measure of
body size. It is **not direct adiposity**, does not distinguish fat from muscle or
bone, does not show fat distribution, and does not determine individual health
quality. Edema, amputation, high muscularity, aging-related muscle loss, pregnancy,
and population differences can make individual inference particularly misleading.

### 10.3 Body-fat and visceral-fat estimates

Clinical body-composition methods measure different constructs and have different
assumptions. DXA, four-compartment models, air displacement, imaging, and BIA are
not interchangeable. A 2026 systematic review against a four-compartment model
found BIA body-fat percentage limits of agreement commonly spanning approximately
15–20 percentage points despite smaller average group bias
([BIA systematic review](https://pubmed.ncbi.nlm.nih.gov/41718193/)).

Consumer BIA varies with hydration, meals, exercise, temperature, skin contact,
device geometry, proprietary equations, sex/age categories, and population.
Repeated values on one device may appear precise without being accurate, and
firmware or equation changes may create false trends. Commercial visceral-fat
scores are often dimensionless vendor outputs without a transparent mapping to CT
or MRI visceral adipose tissue. Neither is production ready.

### 10.4 Longitudinal suitability

- Waist is suitable when landmark and protocol are identical and measurement error
  is governed.
- Waist-to-height ratio mainly changes through waist in adults, but height loss in
  older age can create change and must not be ignored.
- Weight is highly repeatable under fixed conditions but may change through fluid,
  tissue, pregnancy, illness, medication, or scale bias.
- BMI inherits weight and height limitations.
- Consumer body-fat and visceral scores are not authorized as evidence of tissue
  loss, gain, or metabolic improvement.

No anthropometric direction is universally beneficial. Unintentional weight or
waist loss may signal illness; low BMI or low body fat may coexist with frailty,
malnutrition, or disease. No result may be labelled “healthy weight,” “optimal,” or
“metabolically healthy” without later governed context.

## 11. Inflammation Review

CRP is a hepatic acute-phase protein induced by inflammatory signaling. Standard
CRP assays quantify the acute-phase range; hs-CRP assays quantify the same analyte
with precision at lower concentrations relevant to epidemiological cardiovascular-
risk assessment. They are not interchangeable labels for one interpretation.

hs-CRP has replicated prospective associations with coronary disease, stroke,
cardiovascular mortality, all-cause mortality, and several noncardiovascular
outcomes. Its lack of specificity is central, not incidental. A large individual-
participant meta-analysis found broadly similar associations with vascular and
several nonvascular outcomes
([Emerging Risk Factors Collaboration](https://pmc.ncbi.nlm.nih.gov/articles/PMC3162187/)).
An umbrella review found no supporting Mendelian-randomization evidence for a
causal CRP role
([umbrella review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7847446/)).

The 2018 USPSTF concluded evidence was insufficient to assess the balance of
benefits and harms of adding hs-CRP, ankle-brachial index, or coronary calcium to
traditional risk assessment in asymptomatic adults; incremental discrimination was
generally small
([USPSTF](https://www.uspreventiveservicestaskforce.org/uspstf/document/RecommendationStatementFinal/cardiovascular-disease-screening-using-nontraditional-risk-assessment)).
This does not mean hs-CRP has no prognostic information. It means it should not
become an independent Vitalspan cardiovascular-risk classifier.

Interpretation requires absence or explicit handling of acute infection, trauma,
recent strenuous exercise, inflammatory disease activity, smoking, adiposity,
pregnancy, and medications. Within-person variability supports repeated stable
measurements in external risk pathways. CRP assays have improved traceability using
ERM-DA474/IFCC, but analytical harmonization does not solve biological
nonspecificity
([JCTLM consensus](https://pubmed.ncbi.nlm.nih.gov/37253275/)).

Decision:

- hs-CRP: Context Only for cardiovascular-risk or future Inflammation governance.
- standard CRP: Excluded from core Cardiometabolic Health.
- no other inflammatory biomarker is sufficiently justified for this version.
- “Cardiometabolic Inflammation” is deferred as a subdomain, not because
  inflammation is biologically irrelevant, but because one nonspecific marker
  cannot support a coherent independent measurement family.

## 12. Renal, Hepatic, and Metabolic Context Review

### 12.1 Kidney

KDIGO 2024 requires both filtration and kidney-damage assessment for CKD evaluation
and defines chronicity as at least three months. A single abnormal eGFR or UACR may
reflect acute kidney injury, acute disease, exercise, infection, hemodynamics, or
measurement variability and must not be labelled CKD
([KDIGO 2024](https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf)).

Creatinine depends on muscle mass, meat/creatine intake, tubular secretion,
medication, and assay. Creatinine eGFR is a published equation, not a direct
measurement. Cystatin C can improve GFR estimation in combination with creatinine
but is influenced by thyroid state, glucocorticoids, inflammation, smoking, and
body composition. UACR has high within-person variability and can be increased by
exercise, infection, fever, menstruation, hyperglycaemia, and blood pressure.

These measurements strongly predict kidney failure, CVD, heart failure, and
mortality and are required inputs or optional enhancers in some published models.
That strength is the reason to create a governed Kidney Health domain, not a reason
to flatten them into Cardiometabolic Health.

### 12.2 Liver

ALT is more liver-associated than AST, while AST is also abundant in muscle and
other tissues. GGT is influenced by hepatobiliary disease, alcohol, smoking,
medication/enzyme induction, and metabolic state. Exercise and muscle injury can
raise AST and sometimes ALT; hemolysis can affect AST. Laboratory upper reference
limits and methods vary.

Metabolic dysfunction-associated steatotic liver disease overlaps strongly with
adiposity, glycemia, lipids, and blood pressure, but ALT, AST, and GGT neither
measure hepatic fat directly nor exclude disease when normal. AASLD's 2023 practice
guidance uses liver enzymes within a broader clinical assessment rather than as
standalone disease measures
([AASLD guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC10735173/)).
All three remain Context Only and belong to Liver Health.

### 12.3 Uric acid

Uric acid is the end product of purine metabolism and is clinically central to
gout and urate stones. Kidney clearance, diet, alcohol, hydration, cell turnover,
and medications substantially affect it. Hyperuricaemia is associated with
hypertension, CKD, diabetes, cardiovascular events, and mortality, but residual
confounding and reverse causation are substantial. Evidence that urate lowering
improves cardiovascular outcomes in asymptomatic hyperuricaemia is not established
([2024 clinical review](https://pubmed.ncbi.nlm.nih.gov/39051476/)).
It remains Research Only for a general cardiometabolic platform.

## 13. Outcome Evidence Review

The table describes evidence at measurement-family level. It does not convert
population relative risk into an individual prognosis.

| Measurement or family | ASCVD / MI / stroke | Heart failure | Type 2 diabetes / metabolic dysfunction | CKD | Mortality | Disability, functional decline, healthy aging |
| --- | --- | --- | --- | --- | --- | --- |
| ApoB-containing lipoproteins | **Causal** for ASCVD; LDL-C, non-HDL-C, and ApoB are treatment-monitoring measures in external guidelines | Association is less specific than for ASCVD | Dyslipidaemia commonly accompanies diabetes; not diagnostic | CKD changes lipid pattern; ASCVD risk remains important | Strong cardiovascular and all-cause association, with treatment trials supporting event reduction through lowering causal ApoB exposure | Vascular events contribute to disability; lipid values do not directly measure function or healthy aging |
| Lp(a) | **Causal** continuous risk factor for ASCVD and aortic valve stenosis; risk enhancing, not diagnostic | Association may occur through ischemic/valvular pathways | Not a diabetes screen | Kidney function can alter concentration and risk context | Cardiovascular association; no personal lifespan inference | Event-related disability relevance only |
| HDL-C | Prognostic **risk marker**, not an established causal treatment target | Association, nonspecific | Low HDL-C commonly marks insulin-resistant phenotypes | Altered in CKD | Observational nonlinear associations | No direct functional interpretation |
| Triglycerides / remnant biology | Triglyceride-rich ApoB particles and remnants contribute causally to ASCVD; triglyceride mass is a marker and external treatment context | Association through metabolic and vascular disease | Strong marker of metabolic dysfunction; not diagnostic | Kidney disease and therapies alter values | Observational association | No direct function measure |
| HbA1c / plasma glucose / OGTT | Screening/diagnostic and prognostic roles; dysglycaemia associates with MI and stroke | Diabetes and dysglycaemia associate with HF | **Diagnostic role** in external frameworks and strong prognostic role for incident diabetes | Hyperglycaemia contributes causally to diabetic microvascular kidney injury; the tests do not diagnose CKD | Nonlinear observational associations; intensive glucose lowering does not yield a universal mortality translation | Diabetes complications contribute to disability and functional decline; a value alone does not measure healthy aging |
| Fasting insulin / HOMA-IR | Prognostic research associations | Research association | Research estimate of insulin resistance; not a standardized diagnosis | Confounded by kidney insulin clearance | Research association | Unvalidated consumer interpretation |
| Blood pressure | **Causal** risk factor for stroke, coronary disease, and vascular death; externally monitored treatment target | **Causal and treatment-responsive** risk factor | Shares causes and predicts diabetes; not a glycemic measure | **Causal and treatment-responsive** contributor to CKD progression in clinical frameworks | Randomized lowering reduces cardiovascular events and death at population level | Stroke, HF, CKD, and vascular cognitive burden contribute to disability; BP is not a direct function measure |
| Waist / WtHR / BMI / weight | Adiposity is plausibly causal through multiple pathways; anthropometric measures are exposure proxies and risk markers | Strong association through hemodynamic and metabolic pathways | Central adiposity strongly predicts incident diabetes and metabolic dysfunction | Association and shared causal pathways | Central-fatness measures show nonlinear observational associations | High and low values can both associate with adverse aging; neither defines healthy aging |
| hs-CRP | Risk-enhancing/prognostic association with small incremental value in many models; CRP itself not established causal | Prognostic association in disease settings | Association with adiposity and diabetes | Strongly confounded by inflammation and kidney state | Prospective association with cardiovascular and all-cause mortality | Nonspecific association only |
| eGFR / UACR | Strong independent prognostic markers and inputs to risk models | Strong prognostic markers | Diabetes is a major context | **Diagnostic/prognostic role** under KDIGO with chronicity | Strong graded mortality association | CKD contributes to frailty and decline; kidney markers do not directly measure function |
| ALT / AST / GGT / uric acid | Prognostic associations, but not core causal ASCVD targets | Associations are nonspecific | Associations with metabolic dysfunction | Strong confounding by kidney/liver state | Observational associations | No direct functional interpretation |

### 13.1 Association, causation, and treatment

The strongest causal claims are bounded:

- arterial retention of ApoB-containing lipoproteins causes ASCVD;
- elevated Lp(a) is causally related to ASCVD and aortic valve stenosis;
- sustained elevated blood pressure causes vascular, cardiac, and kidney harm;
- chronic hyperglycaemia contributes causally to diabetes microvascular
  complications; and
- excess adiposity contributes causally to metabolic disease, while waist, BMI, and
  body-fat estimates remain imperfect proxies for adipose tissue and distribution.

A biomarker can be a valid treatment target without every association of the
biomarker being causal. Conversely, a causal risk factor does not authorize
Vitalspan to select a treatment or target. Intervention effects depend on drug,
population, baseline risk, duration, harms, adherence, and co-treatment.

Intensive glycaemic-control trials in type 2 diabetes reduce some microvascular
outcomes but do not support a universal all-cause or cardiovascular mortality
benefit from pushing HbA1c to one value
([systematic review](https://www.bmj.com/content/343/bmj.d6898)).
The platform must not infer that lower glucose or HbA1c is always better.

### 13.2 Healthy aging and disability

Cardiometabolic disease can reduce disability-free survival through stroke, heart
failure, kidney disease, neuropathy, retinopathy, amputation, pain, and cognitive
or vascular burden. Evidence is much stronger for disease incidence and mortality
than for any candidate as a direct measure of functional decline or healthy aging.
Functional Capacity, Frailty, and Recovery remain separately governed. A favorable
cardiometabolic profile is not proof of healthy aging as a whole.

## 14. Composite and Risk-Model Review

No reviewed model belongs inside the core measurement domain. Each is a separately
versioned transformation with a target population, endpoint, time horizon, and
calibration. A valid model output is not a measurement and must not be confused with
the input candidates.

| Model / construct | Intended population and inputs | Target and horizon | Validation / geography | Licensing and version issues | Decision |
| --- | --- | --- | --- | --- | --- |
| ACC/AHA Pooled Cohort Equations / ASCVD Risk Estimator Plus | US primary prevention, historically ages 40–79; demographics, TC, HDL-C, SBP/treatment, smoking, diabetes | First hard ASCVD event, 10 years; estimator also showed lifetime context | US cohorts; calibration varies across contemporary and external populations | 2013 equations and later estimator versions must be distinguished | **Superseded for the 2026 US dyslipidaemia pathway by PREVENT; retain only for explicitly versioned legacy use** |
| AHA PREVENT-CVD / ASCVD / HF | US adults 30–79 without known CVD; required routine clinical inputs, with optional kidney/metabolic/social inputs | 10-year CVD, ASCVD, or HF for ages 30–79; 30-year estimates for ages 30–59 | Developed from more than 6.5 million US adults; requires external and local calibration review | AHA PREVENT trademark, equations, endpoint, optional-input, and software versions require legal and scientific review | **Future Risk Prediction program; preferred current US model candidate** |
| SCORE2 | Apparently healthy European adults 40–69 | Fatal and nonfatal MI/stroke CVD, 10 years | Recalibrated to four European risk regions; not globally portable | ESC materials have explicit copyright and software-use terms; current 2025 lipid update retains SCORE2 | **Future Risk Prediction program** |
| SCORE2-OP | Apparently healthy European older people, generally 70–89 | Fatal and nonfatal CVD, 10 years, accounting for competing risk | Derived/validated across European regions; discrimination lower in older ages and calibration is regional | Same ESC licensing and version controls | **Future Risk Prediction program; never substitute SCORE2 outside age scope** |
| QRISK3 | People aged 25–84 without CVD in UK/NICE pathway; extensive clinical, ethnicity, deprivation, treatment, and variability inputs | CVD, 10 years | Very large English primary-care derivation and validation; requires recalibration outside UK context | Algorithm/code copyright and ClinRisk licensing terms must be verified; implementation/version identity required | **Future UK Risk Prediction program** |
| Framingham General CVD | Adults 30–74 without CVD in original cohort; sex-specific clinical risk factors | First general CVD event, commonly 10 years | Framingham derivation; widely studied but transportability/calibration limitations are material | Multiple Framingham endpoints and versions create high misidentification risk | **Historical/conditional future model, not default** |
| Metabolic syndrome definitions | Adults assessed using waist, BP, glucose, triglyceride, and HDL components; definitions differ | Cross-sectional syndrome classification, not a time-to-event prediction | International adoption but population-specific waist criteria and definition disagreement | Published definition and edition must be named; no proprietary Vitalspan variant | **Excluded from version-1 core; possible clinical-classification review only** |
| Diabetes-risk models such as FINDRISC | Generally asymptomatic adults; age, family history, anthropometry, activity, diet, BP medication, glucose history; exact version varies | Incident type 2 diabetes, often 10 years | Many external validations, but calibration and thresholds vary substantially by country and ethnicity | Tool ownership/version and local calibration required | **Future Diabetes Risk Prediction program** |
| Life's Essential 8 | Population cardiovascular-health construct using diet, activity, nicotine, sleep, BMI, lipids, glucose, and BP | Current cardiovascular-health construct, not an event probability | Strong association studies; component scoring is normative and composite | AHA trademarks/copyright and scoring version require permission review | **Not a core model and no Vitalspan adaptation; research/context only** |

The original PREVENT scientific statement and calculator describe 10- and 30-year
risk for CVD including ASCVD and heart failure in US adults without known CVD
([AHA PREVENT](https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator)).
The 2026 ACC/AHA dyslipidaemia guideline now uses PREVENT-ASCVD in its US
primary-prevention pathway. This is a version change, not permission to implement
PREVENT during Phase 7.0A.

SCORE2 and SCORE2-OP use European regional recalibration and different age scopes
([ESC prevention guideline](https://academic.oup.com/eurheartj/article/42/34/3227/6358713);
[SCORE2-OP](https://academic.oup.com/eurheartj/article/42/25/2455/6297711)).
QRISK3 is current in NICE NG238 for ages 25–84
([NICE NG238](https://www.nice.org.uk/guidance/ng238/chapter/recommendations)).
No model is geographically universal.

Risk models require:

- exact publication, equation, endpoint, sex and age scope, and software version;
- complete required inputs without inferred smoking, treatment, pregnancy, disease,
  fasting, ethnicity, or socioeconomic state;
- validation in the intended population and outcome setting;
- calibration and recalibration surveillance;
- competing-risk handling where applicable;
- licensing, trademark, copyright, and commercial-use review;
- independent numerical validation and regression fixtures; and
- separate clinical interpretation and safety governance.

No home-grown Vitalspan cardiometabolic score, metabolic syndrome variant, weighted
average, traffic-light count, “risk age,” or cross-domain composite is authorized.

## 15. Clinical Adoption Review

| Adoption tier | Candidates | Judgment |
| --- | --- | --- |
| Highest international maturity | LDL-C, total cholesterol, HDL-C, triglycerides, HbA1c, laboratory plasma glucose, cuff-based SBP/DBP, body weight, BMI | Broadly available and guideline embedded; broad availability does not remove context or authorize universal thresholds |
| High and increasing maturity | ApoB, non-HDL-C, Lp(a), validated HBPM, waist circumference | Strong guideline roles; assay, protocol, population, and interpretation requirements remain |
| Mature in specialty pathways | OGTT, random plasma glucose in symptomatic assessment, ABPM, diabetes CGM, fructosamine/glycated albumin, clinical body composition, eGFR/UACR/cystatin C, liver enzymes | Valid within defined clinical purposes; not general consumer interpretation |
| Incomplete general-platform maturity | Remnant cholesterol, fasting insulin, HOMA-IR, consumer CGM without diabetes, consumer body-fat/visceral estimates, cuffless BP, uric acid for cardiovascular use | Evidence, standardization, incremental utility, or governance is insufficient |

International adoption differs. ApoB and Lp(a) availability, waist protocols,
HbA1c access, CGM coverage, ABPM access, assay units, and laboratory reporting vary
by country and health system. Production eligibility never means universal
availability.

## 16. Evidence Registry

### 16.1 Guidelines, standards, and consensus sources

| ID | Source and exact version | Publication / status date | Principal contribution | Important limitation or supersession |
| --- | --- | --- | --- | --- |
| CM-E001 | [2026 ACC/AHA multisociety Guideline on Management of Dyslipidemia](https://www.jacc.org/doi/10.1016/j.jacc.2025.11.016) | Originally published 13 March 2026 | Current US lipid screening, targets, Lp(a), ApoB, PREVENT, and special populations | Replaces 2018 AHA/ACC cholesterol guideline; treatment recommendations are not implemented here |
| CM-E002 | [2025 Focused Update of 2019 ESC/EAS Dyslipidaemias Guideline](https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/dyslipidaemias/) | 29 August 2025; evidence through 31 March 2025 | Current European changes for risk estimation, Lp(a), and lipid therapies | Supplements rather than replaces the 2019 full guideline; ESC reuse/licensing restrictions require review |
| CM-E003 | [2019 ESC/EAS Dyslipidaemias Guideline](https://academic.oup.com/eurheartj/article/41/1/111/5556353) | Online 31 August 2019; journal issue 1 January 2020 | Full lipid measurement, causal, target, and population framework | Read with 2025 focused update |
| CM-E004 | [EAS Lp(a) consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC9639807/) | 29 August 2022 online; 14 October 2022 issue | Causal status, once-in-adulthood measurement, assay and unit limits | Consensus, not an outcome trial; therapy content not adopted |
| CM-E005 | [EAS/EFLM atherogenic-lipoprotein quantification consensus](https://academic.oup.com/clinchem/article/64/7/1006/5608948) | 1 July 2018 | LDL-C, non-HDL-C, ApoB analytical comparison and method discordance | Newer guidelines govern clinical decisions |
| CM-E006 | [EAS/EFLM nonfasting lipid consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC4929379/) | 26 April 2016 online; July 2016 issue | Routine nonfasting profiles and interpretation implications | Does not remove need for fasting metadata or selected repeats |
| CM-E007 | [ADA Standards of Care—2026, Diagnosis and Classification](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes) | 8 December 2025 | Current screening/diagnostic tests, confirmation, HbA1c interference, pregnancy boundaries | Annual guideline; this dossier does not operationalize diagnostic cutoffs |
| CM-E008 | [ADA Standards of Care—2026, Diabetes Technology](https://diabetesjournals.org/care/article/49/Supplement_1/S150/163922/7-Diabetes-Technology-Standards-of-Care-in) | 8 December 2025 | CGM roles in diabetes | Does not validate wellness CGM in people without diabetes |
| CM-E009 | [2023 laboratory guideline for diabetes](https://academic.oup.com/clinchem/article/69/8/808/7226244) | 20 July 2023 online; August 2023 issue | Glucose/HbA1c specimen, assay, standardization, and alternative glycated proteins | Clinical laboratory guidance, not a platform interpretation standard |
| CM-E010 | [WHO HbA1c diagnostic consultation](https://www.who.int/publications/i/item/use-of-glycated-haemoglobin-%28-hba1c%29-in-diagnosis-of-diabetes-mellitus) | 13 January 2011 | Conditional diagnostic role with assay quality and absence of invalidating conditions | Older; read with ADA 2026 and current lab guidance |
| CM-E011 | [2025 AHA/ACC High Blood Pressure Guideline](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007) | Published online 14 August 2025 | Current US measurement, confirmation, home/ambulatory, and cuffless policy | Replaces the 2017 guideline; treatment targets are not operationalized |
| CM-E012 | [2024 ESC Elevated BP and Hypertension Guideline](https://academic.oup.com/eurheartj/article/45/38/3912/7741010) | 30 August 2024 online; 7 October 2024 issue | Office, home, and ambulatory methods; technique and clinical framework | European thresholds differ from US concepts |
| CM-E013 | [2021 USPSTF Hypertension Screening](https://www.uspreventiveservicestaskforce.org/uspstf/index.php/recommendation/hypertension-in-adults-screening) | 27 April 2021 | Office screening and out-of-office diagnostic confirmation | Screening statement, not full measurement or treatment standard |
| CM-E014 | [2025 AHA cuffless-device scientific statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC13335599/) | Published online 11 December 2025; March 2026 issue | Current limits, calibration, validation, and non-readiness for diagnosis/management | Technology evolves; requires surveillance |
| CM-E015 | [WHO Waist Circumference and Waist–Hip Ratio consultation](https://www.who.int/publications/i/item/9789241501491) | Consultation 8–11 December 2008; report published 2011 | Measurement methods, ethnicity, disease and mortality associations | Older thresholds and population evidence require current review |
| CM-E016 | [NICE NG246 Overweight and Obesity Management](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity) | 14 January 2025 | Current UK BMI and waist-to-height use and boundaries | UK clinical guidance; not a universal reference |
| CM-E017 | [2003 CDC/AHA inflammation statement](https://stacks.cdc.gov/view/cdc/7090) | 28 January 2003 | hs-CRP cardiovascular use, stable-state and repeat principles | Old; later USPSTF evidence limits incremental screening claims |
| CM-E018 | [2018 USPSTF nontraditional CVD risk factors](https://www.uspreventiveservicestaskforce.org/uspstf/document/RecommendationStatementFinal/cardiovascular-disease-screening-using-nontraditional-risk-assessment) | 10 July 2018 | Insufficient evidence for adding hs-CRP to asymptomatic risk assessment | Predates PREVENT and 2026 lipid guidance; still latest final USPSTF statement located |
| CM-E019 | [KDIGO 2024 CKD Guideline](https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf) | 13 March 2024 | GFR, albuminuria, cystatin C, chronicity, and outcome evidence | Current focused update work does not yet supersede the final guideline |
| CM-E020 | [AASLD 2023 NAFLD practice guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC10735173/) | 17 March 2023 online | Liver enzyme and steatotic-liver clinical context | Nomenclature evolved to MASLD; liver domain remains separate |
| CM-E021 | [AHA PREVENT scientific statement/calculator](https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator) | Scientific statement 10 November 2023; current page verified 18 July 2026 | 10-/30-year CVD, ASCVD, and HF models in US adults | Model/version/licensing and calibration require separate review |
| CM-E022 | [2021 ESC CVD Prevention Guideline](https://academic.oup.com/eurheartj/article/42/34/3227/6358713) | 30 August 2021 online | SCORE2/SCORE2-OP scope and European risk regions | Read with 2025 lipid update |
| CM-E023 | [NICE NG238 CVD Risk and Lipid Modification](https://www.nice.org.uk/guidance/ng238/chapter/recommendations) | 14 December 2023; current page verified 18 July 2026 | Current QRISK3 UK use | UK-specific and dependent on current QRISK implementation |
| CM-E024 | [AHA Life's Essential 8 advisory](https://pmc.ncbi.nlm.nih.gov/articles/PMC10503546/) | 29 June 2022 | Eight-component cardiovascular-health construct and 0–100 scoring method | Not a clinical event model; no Vitalspan composite is authorized |

### 16.2 Primary studies and evidence syntheses

| ID | Evidence source | Design / population | Principal contribution | Quality and limitation |
| --- | --- | --- | --- | --- |
| CM-E025 | [EAS LDL causal consensus](https://academic.oup.com/eurheartj/article/38/32/2459/3745109) | Genetic, epidemiological, mechanistic, and trial synthesis | ApoB-containing lipoprotein retention causally initiates/progresses ASCVD | High causal confidence; not individual prediction |
| CM-E026 | [NLA ApoB consensus](https://www.sciencedirect.com/science/article/pii/S193328742400240X) | Clinical consensus and evidence review, 2024 | ApoB/LDL-C discordance and ApoB's stronger alignment with risk | Consensus; guideline roles vary |
| CM-E027 | [INTERHEART lipid analysis](https://pubmed.ncbi.nlm.nih.gov/18640459/) | Case-control study across 52 countries | Strong ApoB/ApoA1 ratio association with MI | Case-control design; association does not prove incremental production value |
| CM-E028 | [HOMA analytical comparison](https://pmc.ncbi.nlm.nih.gov/articles/PMC2518363/) | 11 insulin assays and HOMA variants | Demonstrates large assay-driven HOMA variation | Older, but unresolved standardization problem remains current |
| CM-E029 | [2025 insulin standardization review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12452087/) | Multi-assay standardization assessment/review | Confirms continuing lack of adequate serum-insulin comparability | Standardization work is ongoing |
| CM-E030 | [BPLTTC randomized IPD meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8102467/) | 48 trials, individual participant data | Causal cardiovascular event reduction from BP lowering | Treatment evidence cannot yield personal benefit from one reading |
| CM-E031 | [Central-fatness mortality meta-analysis](https://www.bmj.com/content/370/bmj.m3324) | 72 prospective cohorts; more than 2 million participants for waist analysis | Central adiposity measures associated with all-cause mortality | Observational, nonlinear, highly heterogeneous |
| CM-E032 | [WtHR screening meta-analysis](https://pubmed.ncbi.nlm.nih.gov/22106927/) | Systematic review/meta-analysis | WtHR often discriminates cardiometabolic risk better than BMI and waist | Study/threshold heterogeneity and largely risk-factor outcomes |
| CM-E033 | [2026 BIA validity systematic review](https://pubmed.ncbi.nlm.nih.gov/41718193/) | 12 studies against four-compartment criterion | Wide individual limits for BIA body-fat percentage | Healthy-adult focus and device heterogeneity |
| CM-E034 | [CRP individual-participant meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC3162187/) | Prospective cohorts | CRP associations with vascular and nonvascular mortality outcomes | Observational and nonspecific |
| CM-E035 | [CRP umbrella review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7847446/) | Observational and Mendelian-randomization syntheses | Limited strong associations and no supporting causal CRP evidence | Heterogeneous source reviews |
| CM-E036 | [KDIGO CKD Prognosis Consortium evidence within KDIGO 2024](https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf) | Up to 27.5 million participants across global cohorts | Strong independent eGFR and albuminuria outcome gradients | Kidney construct; not core cardiometabolic permission |
| CM-E037 | [HbA1c mortality dose-response meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC4820688/) | Prospective cohorts without known diabetes | Nonlinear HbA1c associations with cause-specific mortality | Observational; HbA1c confounding and reverse causation remain |
| CM-E038 | [DECODE fasting versus 2-hour glucose](https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/647267) | European pooled prospective cohorts | Post-challenge glucose adds mortality-related information | Older European data; not a personal forecast |
| CM-E039 | [Intensive glycaemic-control systematic review](https://www.bmj.com/content/343/bmj.d6898) | Randomized trials in type 2 diabetes | No universal mortality benefit; microvascular benefit and harms differ | Older therapy era; central inference remains that target intensity is contextual |
| CM-E040 | [2024 uric-acid cardiovascular review](https://pubmed.ncbi.nlm.nih.gov/39051476/) | Clinical evidence review | Cardiovascular association but uncertain causality/target benefit | Review rather than new outcomes trial |
| CM-E041 | [PREVENT original scientific statement](https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator) | More than 6.5 million US adults across development/validation data | Contemporary CVD/ASCVD/HF equations | US calibration and model-governance limits |
| CM-E042 | [QRISK3 original study](https://www.bmj.com/content/357/bmj.j2099) | 7.89 million derivation and 2.67 million validation patients, ages 25–84 | UK 10-year CVD model | UK primary-care data and local calibration |
| CM-E043 | [Framingham General CVD profile](https://pubmed.ncbi.nlm.nih.gov/18212285/) | 8,491 participants ages 30–74 free of CVD | Sex-specific general CVD risk model | Historical predominantly White US cohort |

## 17. Candidate Classification Registry

| Classification | Count | Stable candidate IDs |
| --- | ---: | --- |
| **Production Eligible** | 6 | CM-LIP-APOB, CM-LIP-LDLC, CM-LIP-NHDLC, CM-LIP-HDLC, CM-GLY-HBA1C, CM-BP-HOME |
| **Conditionally Production Eligible** | 7 | CM-LIP-TG, CM-LIP-LPA, CM-GLY-FPG, CM-BP-OFFICE, CM-BP-AOBP, CM-ANTH-WAIST, CM-ANTH-WHTR |
| **Clinical Specialty** | 7 | CM-GLY-RPG, CM-GLY-OGTT, CM-GLY-CGM-DM, CM-GLY-FRUCT, CM-GLY-GA, CM-BP-ABPM, CM-ANTH-BF-CLIN |
| **Context Only** | 17 | CM-LIP-TC, CM-LIP-R-TCHDL, CM-BP-SINGLE, CM-BP-PP, CM-BP-MAP, CM-BP-RHR, CM-ANTH-BMI, CM-ANTH-WEIGHT, CM-ANTH-WHR, CM-INF-HSCRP, CM-REN-CREAT, CM-REN-EGFR, CM-REN-UACR, CM-REN-CYSC, CM-HEP-ALT, CM-HEP-AST, CM-HEP-GGT |
| **Research Only** | 9 | CM-LIP-RC-D, CM-LIP-R-TGHDL, CM-LIP-R-APOBAPOA1, CM-GLY-CGM-ND, CM-GLY-INS, CM-GLY-HOMAIR, CM-ANTH-BF-CONS, CM-ANTH-VISC, CM-MET-URATE |
| **Deferred** | 1 | CM-LIP-RC-C |
| **Unsupported** | 1 | CM-BP-CUFFLESS |
| **Excluded** | 1 | CM-INF-CRP |

The 49 classifications are candidate-purpose classifications. A Clinical Specialty
or Context Only measurement can be clinically important; the label means it is not
authorized for independent general production interpretation inside this domain.

## 18. Production Readiness Assessment

| Readiness dimension | Assessment |
| --- | --- |
| Construct validity | **Met.** The four approved subdomains are coherent, established, and independently measurable. |
| Independent-domain justification | **Met.** Cardiometabolic measurements address major causal and prognostic pathways not represented by Clinical PhenoAge, VO₂max, or Functional Capacity. |
| Candidate evidence | **Met for selected candidates.** Six are Production Eligible and seven are conditionally eligible. |
| Measurement maturity | **Mixed.** Mature for standard lipids, HbA1c, laboratory glucose, cuff BP, waist, weight; method-specific or inadequate for several derived/device candidates. |
| International recognition | **Met.** Current ACC/AHA, ESC/EAS, ADA, ESC/AHA BP, WHO, NICE, KDIGO, and laboratory sources support the bounded roles. |
| Causal validity | **Met for ApoB-containing lipoproteins, Lp(a), sustained BP, and selected disease pathways; not met for every marker.** |
| Universal interpretation | **Not met and not required for construct readiness.** Phase 7.0C must govern references and clinical-threshold concepts. |
| Longitudinal suitability | **Met conditionally.** Comparable method, context, treatment, and biological state are mandatory. |
| Composite score | **Prohibited.** No Vitalspan parent or cross-subdomain score is validated. |
| Diagnosis and treatment | **Outside scope and prohibited.** |
| Safety escalation | **Unresolved.** Phase 7.0B must inventory values/context needing urgent or clinician-directed handling without diagnosing. |
| Repository implementation | **Not performed.** This phase adds documentation only. |

### 18.1 Threshold and reference inventory

Phase 7.0A identifies but does not operationalize:

| Concept | Scientific meaning | Examples in this domain | Governance rule |
| --- | --- | --- | --- |
| Population reference interval | Distribution in a defined reference population | Laboratory assay intervals, age/sex anthropometry distributions | Does not equal healthy, optimal, diagnostic, or treatment target |
| Diagnostic threshold | Criterion within a clinical disease framework | ADA glycemic criteria, office/out-of-office hypertension definitions, CKD chronicity/staging | Requires complete external framework, confirmation, and clinical authority |
| Guideline decision threshold | Point informing a clinical action after risk/context assessment | Lipid, BP, or obesity pathway decisions | Must not be presented as diagnosis or universal biology |
| Treatment target | Goal chosen in a treated clinical population | LDL-C/non-HDL-C/ApoB, BP, HbA1c | Requires diagnosis, risk, therapy, harms, and clinician management |
| Risk-enhancing threshold | Value that modifies a validated multivariable assessment | Lp(a), ApoB, triglycerides, hs-CRP in selected guidelines | No standalone event probability or automatic treatment conclusion |
| Assay-specific cutoff | Method-dependent analytical/clinical decision point | Lp(a), HbA1c method interference, CRP assay range | Requires assay identity and traceability |

Every Production Eligible and Conditionally Production Eligible candidate requires
Phase 7.0C review. Context candidates require 7.0C only if they will receive any
reference-based language. No universal “optimal longevity range” is authorized.

### 18.2 Scientific, diagnostic, safety, treatment, and monitoring boundaries

| Activity | Permitted scientific scope after later gates | Not authorized here |
| --- | --- | --- |
| Scientific interpretation | Define what was measured, method confidence, known confounders, and population-level evidence | Disease declaration or personal prognosis |
| Diagnostic assessment | Acknowledge that an external clinical framework exists and that confirmation may be required | Apply diagnosis from isolated platform data |
| Urgent safety escalation | Future clinician-directed or emergency messaging based on a separately reviewed safety policy | Define final alerts or infer symptoms/context |
| Treatment decision | State that some measures are external guideline targets | Start/stop/change medication, dose, or personal target |
| Routine monitoring | Describe comparable values and uncertainty over time | Attribute change to a drug, diet, supplement, or behavior without a valid design |

Potential future safety review must cover, at minimum, extreme or rapidly changing
glucose, blood pressure, triglycerides, kidney markers, and values accompanied by
concerning symptoms or pregnancy. This is an inventory for clinical review, not an
alert definition.

## 19. Scientific Governance

### 19.1 Fail-closed requirements

Interpretation must return Unknown or withhold classification when:

- candidate identity, direct/derived method, unit, specimen, date, or source is
  missing or incompatible;
- fasting state is required but unknown;
- BP setting, device validation, cuff, or repeat structure is inadequate;
- HbA1c validity is materially uncertain from red-cell, hemoglobin, kidney,
  transfusion, or pregnancy context;
- a derived value lacks same-specimen source evidence and a versioned method;
- Lp(a) unit or assay identity is lost or an unsupported unit conversion is
  attempted;
- medication, pregnancy, acute illness, or clinical context is required for the
  proposed interpretation but absent;
- a reference population, model population, age, sex, or geography does not match;
- a trend crosses devices, assays, methods, settings, or algorithms without
  demonstrated comparability; or
- the requested claim exceeds association, measurement, or model authority.

### 19.2 Independence and duplication policy

- Store and interpret native measurements independently.
- Preserve mathematical dependency for non-HDL-C, ratios, BMI, WtHR, pulse
  pressure, MAP, eGFR, and every model output.
- Never count a source value and its derivative as corroborating independent
  evidence.
- Do not average percentiles, z-scores, traffic lights, or classifications.
- Do not allow a favorable result to cancel an unfavorable result.
- Use a published multivariable model only in its own future governed program.
- Version any scientific change; do not mutate prior interpretation in place.

### 19.3 Claim controls

Authorized future educational language may say that a measurement is associated
with outcomes, is a causal risk factor where established, is used in screening or
monitoring, and may warrant clinical assessment under external guidelines.

Explicitly blocked:

- “Your cardiometabolic age is …”
- “Your lifespan will be longer/shorter by …”
- “Your personal risk is …” without an authorized model and complete eligibility
- “You have diabetes/prediabetes/hypertension/CKD/metabolic syndrome”
- “Start, stop, increase, or decrease this medication/supplement”
- “This is your optimal longevity target”
- “Higher HDL-C is protective” or “the higher the better”
- “Lower BP, glucose, weight, BMI, CRP, or triglycerides is always better”
- “Your insulin resistance is …” from fasting insulin, HOMA-IR, TG/HDL-C, CGM, or
  a commercial score
- “This device visceral-fat score measures your visceral fat”
- “This single reading predicts a heart attack, stroke, disability, or death”
- “This change was caused by your treatment, diet, exercise, or supplement”
- “Normal laboratory range means optimal health” or “outside range means disease”

### 19.4 Evidence surveillance

At minimum, review:

- annual ADA Standards and corrections;
- ACC/AHA, ESC/EAS, ESH/ESC, NICE, USPSTF, WHO, KDIGO, AASLD, NLA, and laboratory-
  standardization updates;
- PREVENT, SCORE, QRISK, and other model recalibration or version changes;
- Lp(a), ApoB, insulin, HbA1c, cystatin C, and CRP assay standardization;
- cuffless BP, consumer CGM, BIA, and wearable independent validation;
- subgroup performance across age, sex, pregnancy, ancestry/ethnicity, geography,
  disability, and kidney/liver/hematologic states; and
- regulatory, copyright, licensing, and commercial-use changes.

## 20. Remaining Limitations

1. This was a rapid structured review, not a registered systematic review with
   duplicate screening and formal risk-of-bias assessment.
2. Evidence density differs greatly across candidates and outcomes.
3. Much prognostic evidence is observational and vulnerable to confounding,
   reverse causation, selection, and treatment bias.
4. Randomized therapy effects do not validate biomarker-only treatment advice or
   prove that the biomarker mediates every benefit or harm.
5. Sex and ancestry are often represented as broad categories that inadequately
   capture biology, environment, structural inequity, and individual diversity.
6. Pregnancy, children, adolescents, very old adults, disability, frailty, and
   gender-diverse populations require dedicated review.
7. Assay availability, traceability, units, and clinical practice vary globally.
8. Medication status is often incomplete, yet treated measurements do not
   represent untreated physiology.
9. Acute illness, exercise, diet, alcohol, smoking/nicotine, sleep, hydration, and
   stress can affect several candidates simultaneously.
10. Longitudinal biological variation and reference-change values are not yet
    governed.
11. Direct versus calculated LDL-C, “direct” remnant cholesterol, consumer-device
    algorithms, and cuffless BP remain method-sensitive.
12. No reviewed evidence validates a parent cardiometabolic score or an interaction
    with Clinical PhenoAge, VO₂max, or Functional Capacity.
13. A publication or correction after 18 July 2026 may change a decision.
14. Licensing and commercial reuse of ESC, AHA, QRISK/ClinRisk, and other model
    materials require legal review before implementation.

## 21. Phase 7.0B Requirements

Phase 7.0B should be a measurement and provenance standard, not an implementation
phase. It must:

1. Freeze stable measurement identities for every version-1 candidate, including
   direct versus calculated LDL-C and office/AOBP/HBPM identities.
2. Define canonical and accepted source units without unsupported conversion;
   specifically preserve Lp(a) mg/dL and nmol/L as noninterconvertible measurement
   classes unless an assay-specific conversion is explicitly authorized.
3. Define specimen type, collection timing, fasting metadata, processing,
   laboratory accreditation/assay provenance, and limits of acceptability.
4. Define medication, pregnancy, acute illness, exercise, alcohol, nicotine,
   transfusion, kidney/liver/hematology, and symptom metadata requirements per
   candidate.
5. Establish HbA1c invalidation and discordance handling using current ADA,
   NGSP/IFCC, and laboratory guidance.
6. Establish BP setting-specific protocols, validated-device requirements, cuff
   metadata, repeat structure, home-series completeness, ABPM specialty boundary,
   and cuffless exclusion.
7. Establish waist and height protocols and block pooling across incompatible
   anatomical sites or derived-source quality.
8. Define longitudinal comparability, minimum repeat interval where scientifically
   justified, biological variation, analytical variation, and method-change breaks.
9. Define fail-closed eligibility and Unknown outputs without category or threshold
   implementation.
10. Inventory possible urgent and clinician-directed findings for a dedicated
    safety review; do not design UI alerts.
11. Preserve mathematical lineage for non-HDL-C and WtHR; do not authorize remnant
    cholesterol, ratios, HOMA-IR, or new composites.
12. Specify evidence, measurement, normalization, and interpretation versioning and
    immutable provenance.
13. Define cross-domain dependency interfaces that do not transfer authority from
    Kidney, Liver, Inflammation, Body Composition, Clinical PhenoAge, VO₂max, or
    Functional Capacity.
14. Produce a Phase 7.0C question set for population references, diagnostic
    boundaries, decision thresholds, targets, and risk-enhancing thresholds.
15. Complete independent scientific, laboratory-medicine, cardiology,
    endocrinology, hypertension, and privacy/legal review before implementation.

Phase 7.0B is ready to begin. No unresolved issue prevents the measurement-standard
review, but production implementation remains blocked until 7.0B and 7.0C are
approved.

## 22. Final Scientific Recommendation

### Final status: Production Ready — Conditional

Cardiometabolic Health should proceed as a standalone organizational domain of
independently governed measurements. Version 1 should contain:

- **Atherogenic Lipids:** ApoB, LDL-C, non-HDL-C, HDL-C as a marker, triglycerides,
  and Lp(a), with total cholesterol retained as context.
- **Glycemic Status:** HbA1c and verified fasting laboratory plasma glucose.
- **Blood Pressure:** repeated validated cuff-based home readings plus governed
  office or automated-office identities.
- **Central Adiposity:** protocol-complete waist circumference and waist-to-height
  ratio, with BMI and body weight as context only.

Production Eligible candidates are ApoB, LDL-C, non-HDL-C, HDL-C, HbA1c, and
repeated validated home cuff blood pressure. Conditionally eligible candidates are
triglycerides, Lp(a), fasting plasma glucose, office and automated-office cuff blood
pressure, waist circumference, and waist-to-height ratio.

Random plasma glucose, OGTT, diabetes CGM, fructosamine, glycated albumin, ABPM, and
clinical body-fat measurement remain Clinical Specialty. Direct remnant
cholesterol, fasting insulin, HOMA-IR, CGM without diabetes, consumer body-fat and
visceral-fat estimates, TG/HDL-C, ApoB/ApoA1, and uric acid for cardiometabolic
interpretation remain Research Only. Calculated remnant cholesterol is Deferred.
Cuffless BP is Unsupported. Standard CRP is Excluded.

Kidney markers are Context Only and belong to future Kidney Health. Liver enzymes
are Context Only and belong to future Liver Health. hs-CRP is Context Only and
belongs in a future Inflammation domain or an authorized cardiovascular Risk
Prediction program, not a version-1 Cardiometabolic Inflammation subdomain.

The decision authorizes no calculation, score, composite, category, risk engine,
diagnosis, treatment recommendation, target, reference interval, alert, production
code, architecture, ingestion, persistence, API, UI, AI behavior, or modification
of an existing scientific domain.

The governing conclusion is:

> Vitalspan may organize provenance-complete cardiometabolic measurements as a
> standalone scientific domain. It may not merge them into a cardiometabolic score,
> infer missing clinical context, or turn population evidence into diagnosis,
> treatment advice, biological age, or personal longevity prediction.
