# Phase 5.0A — VO₂max scientific evidence review

**Review date:** 17 July 2026  
**Review type:** Structured scientific evidence review  
**Scope:** Scientific validity and clinical readiness only  
**Final recommendation:** **Production Ready**

## Decision

VO₂max is sufficiently validated to become Vitalspan's second production
scientific domain, provided that the domain is defined as a **standalone
cardiorespiratory-fitness domain** and not as a biological-age model, lifespan
estimate, diagnosis, or global health score.

The Production Ready decision applies to the scientific construct and to
quality-controlled, provenance-complete measurements. It does not make all data
sources interchangeable:

- Direct gas-exchange cardiopulmonary exercise testing (CPET) has the strongest
  measurement validity and is the production-grade reference method.
- A symptom-limited clinical CPET commonly establishes VO₂peak rather than a
  demonstrated physiological VO₂max. That distinction must be retained.
- Exercise-test, field-test, non-exercise, Apple Watch, and other wearable values
  are estimates. They can support appropriately labelled context or monitoring,
  but cannot inherit the confidence of directly measured CPET.
- Apple Watch estimates are not suitable substitutes for CPET in diagnosis,
  individual clinical risk decisions, or precise fitness classification.
- VO₂max must not be converted to “fitness age,” biological-age years, years of
  life, or an individual mortality probability. The evidence does not validate
  those transformations.

This is a scientific readiness decision, not authorization to implement a
calculation, change architecture, design a UI, or create a score.

## Primary questions

| Question | Evidence-based answer |
| --- | --- |
| What is VO₂max? | The greatest rate at which a person can take up and use oxygen during progressive, large-muscle exercise when further work does not produce a meaningful increase in oxygen uptake. It is the criterion measure of cardiorespiratory fitness (CRF). |
| What does it physiologically measure? | Integrated maximal aerobic function across pulmonary ventilation and gas exchange, cardiac output and blood flow, blood oxygen-carrying capacity, tissue diffusion, and skeletal-muscle oxygen extraction and mitochondrial use. It is a whole-pathway capacity, not a heart-only or lung-only measurement. |
| Why is it a strong longevity predictor? | It captures multisystem functional reserve, is impaired by many forms of subclinical and clinical disease, is responsive to habitual activity and training, and has a strong graded association with all-cause and cardiovascular mortality across many cohorts. It also adds prognostic information to traditional risk factors. |
| Is it independent after age and sex adjustment? | Yes. The inverse association persists in multivariable models that include age, sex, and commonly smoking, body size, hypertension, diabetes, lipids, cardiovascular disease, medications, and other covariates. “Independent predictor” is a statistical statement, not proof that VO₂max itself causes longer life. |
| Which major organizations recognize it? | ACSM embeds CRF and maximal exercise testing in its exercise-testing and prescription standards; the AHA argues that CRF should be treated as a clinical vital sign; ESC guidance uses CPET and peak oxygen uptake for functional assessment, exercise prescription, diagnosis, and prognosis in selected populations; EACPR/AHA, ATS/ACCP, and ERS have issued detailed CPET standards or statements. |
| Is it appropriate for Vitalspan production use? | Yes, as an independent CRF domain with method-specific evidence labels, source provenance, population-appropriate references, and explicit uncertainty. It is not ready as a biological-age modifier or as an unqualified consumer-wearable value. |

## Review protocol

### Search and evidence approach

The review was updated through **17 July 2026**. Sources included PubMed, PubMed
Central, society and journal guideline pages, official Apple documentation, and
publisher full text. Citation chaining began with ACSM standards, the AHA CRF
vital-sign statement, ESC guidance, CPET standards, major evidence syntheses,
landmark cohorts, FRIEND and HUNT reference studies, and wearable validation
reviews.

This is a structured evidence review, not a prospectively registered systematic
review. It does not claim exhaustive study-level screening.

### Evidence hierarchy

Greater weight was given, in order, to:

1. Professional-society guidelines, scientific statements, and technical
   standards.
2. Overviews of systematic reviews and systematic reviews with meta-analysis.
3. Large prospective or well-characterized clinical cohorts.
4. Population reference studies with directly measured gas exchange.
5. Criterion-validation studies against CPET.
6. Manufacturer validation, used only for device-specific operating claims and
   interpreted below independent evidence.

### Confidence language

- **High:** concordant evidence from standards, multiple large cohorts or
  syntheses, and a well-established criterion method.
- **Moderate:** generally consistent evidence with meaningful population,
  protocol, transportability, or observational limitations.
- **Low:** sparse, small, proprietary, heterogeneous, or insufficiently
  independent evidence for individual clinical interpretation.

These are qualitative evidence judgments, not a score.

## Scientific dossier

### Definition and terminology

**Cardiorespiratory fitness** is the physiological trait: the capacity of the
circulatory and respiratory systems and exercising muscle to support sustained
aerobic work. **VO₂max** is the criterion physiological measurement used to
quantify that trait. The terms are closely linked but not identical.

Strictly, VO₂max requires evidence that oxygen uptake has reached a maximum,
classically a plateau despite increasing workload. A plateau is not consistently
observed in ramp tests or clinical populations. The highest attained value should
therefore be called **VO₂peak** when a maximum has not been demonstrated. ATS/ACCP
and ERS standards recognize the practical importance of peak oxygen uptake while
requiring effort, protocol, and test-quality information
([ATS/ACCP statement](https://pubmed.ncbi.nlm.nih.gov/12524257/);
[ERS standardization statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC9488712/)).

VO₂ may be reported as an absolute rate or normalized to body mass. The commonly
used mass-normalized value is useful for weight-bearing activity and population
comparison, but it is not neutral: weight loss can increase the relative value
without an equal improvement in absolute oxygen transport, while high fat mass can
lower it. Absolute and mass-normalized results answer related but different
questions.

**Construct confidence: High.**  
**Terminology risk if VO₂max and VO₂peak are collapsed: High.**

### Physiology

VO₂max reflects the complete oxygen pathway under high metabolic demand:

- movement of air into and out of the lungs;
- pulmonary diffusion and matching of ventilation to perfusion;
- cardiac output and distribution of blood flow;
- hemoglobin concentration and arterial oxygen content;
- peripheral vascular conductance and tissue diffusion;
- skeletal-muscle capillary density, oxygen extraction, mitochondrial content,
  and oxidative enzyme capacity; and
- the amount and recruitment of active muscle.

Because the result is integrative, a low value identifies reduced aerobic reserve
but does not by itself localize the cause. Cardiac, pulmonary, vascular,
hematologic, neuromuscular, metabolic, medication-related, effort-related, and
deconditioning factors can all reduce the observed result. Full CPET interpretation
uses additional gas-exchange, ventilatory, circulatory, ECG, blood-pressure, symptom,
and workload information to distinguish mechanisms
([CPET methodology review](https://pubmed.ncbi.nlm.nih.gov/28510504/)).

VO₂max is therefore neither a direct measure of “heart health” nor a complete
measure of physical fitness. Strength, balance, mobility, body composition, and
other fitness dimensions remain separate.

**Physiological construct confidence: High.**

### Measurement methods

| Method | What is actually obtained | Principal strengths | Principal limitations | Scientific confidence |
| --- | --- | --- | --- | --- |
| Direct maximal laboratory CPET | Breath-by-breath oxygen uptake during progressive treadmill or cycle exercise, with evidence supporting maximal effort and preferably confirmation of the maximum | Criterion method; direct gas exchange; can examine the whole response to exercise | Requires calibrated equipment, trained staff, maximal effort, valid protocol, and safety procedures; plateau is not guaranteed | **High** |
| Symptom-limited clinical CPET | Usually VO₂peak plus ventilatory, circulatory, ECG, blood-pressure, workload, and symptom responses | Best clinical method for integrated functional capacity, mechanism of exercise limitation, and selected prognostic decisions | Patient symptoms or safety criteria may stop the test before a physiological maximum; disease-specific interpretation is required | **High for VO₂peak and integrated clinical assessment; moderate for calling the result VO₂max** |
| Maximal exercise test without gas analysis | Estimated aerobic capacity from achieved workload, speed, grade, power, or test duration | More accessible; strong outcome evidence; useful for broad risk stratification | Workload-to-oxygen assumptions vary by protocol, handrail use, efficiency, familiarity, and disease; not a direct oxygen measurement | **Moderate for risk stratification; low-to-moderate for an individual's exact VO₂max** |
| Submaximal exercise prediction | Estimated maximal capacity from heart-rate and workload response below maximum | Lower burden and lower immediate testing demand | Depends on the assumed heart-rate response, steady state, efficiency, medications, environment, and population-specific model | **Moderate at population level; low-to-moderate for individual precision** |
| Field performance test | Estimated CRF from timed walk, run, shuttle, or step performance | Low cost and scalable | Influenced by pacing, motivation, terrain, technique, musculoskeletal limitations, and test-specific equations | **Moderate when a validated protocol matches the target population; otherwise low** |
| Non-exercise estimate | Predicted CRF from age, sex, body size, activity, resting heart rate, or related variables | Very scalable and can rank population risk | Partly repackages known risk predictors; does not measure exercise physiology; model transportability is limited | **Moderate for population risk ranking; low for an individual's physiological VO₂max** |
| Consumer wearable estimate | Proprietary prediction using heart rate, motion, GPS, pace, and user attributes, at rest or during exercise | Repeated, low-burden, real-world observations | Proprietary and versioned algorithms, device dependence, individual error, sensor/context effects, and incomplete clinical validation | **Moderate for broad population monitoring; low-to-moderate for individual value or change** |

Direct and estimated methods can show similarly graded mortality associations
without being numerically or physiologically interchangeable. A 2024 systematic
review and meta-analysis of 42 studies and about 3.8 million observations found
similar mortality gradients for objectively measured, exercise-estimated, and
non-exercise-estimated CRF; this supports the prognostic construct, not equivalence
of individual values
([Singh et al.](https://pubmed.ncbi.nlm.nih.gov/39271056/)).

### Clinical interpretation

Clinical interpretation requires all of the following context:

- direct measurement versus estimate;
- VO₂max versus VO₂peak;
- treadmill, cycle, step, field, or free-living modality;
- maximality, symptom limitation, and test-quality evidence;
- absolute versus body-mass-normalized reporting;
- age, sex, body size, health status, medication use, and relevant disability;
- reference population and reference version; and
- reason for testing, including fitness assessment, unexplained exercise
  intolerance, exercise prescription, perioperative evaluation, or disease-specific
  prognosis.

A value should not be interpreted against a universal cutoff. Treadmill and cycle
values differ systematically, and healthy-population reference distributions do not
replace disease-specific thresholds used in heart failure, congenital heart disease,
pulmonary disease, transplantation, or perioperative care.

An apparently low result is not a diagnosis. It can reflect deconditioning, body
composition, anemia, acute illness, cardiopulmonary disease, medication effects,
pain, gait inefficiency, submaximal effort, or technical error. Abnormal symptoms or
a clinically obtained result require clinician interpretation of the full test, not
isolated interpretation of VO₂.

**Clinical interpretability confidence: High for provenance-complete CPET; Moderate
for protocol-matched estimates; Low when method or context is missing.**

### Mortality and longevity association

The association is unusually large, graded, replicated, and persistent for a
functional biomarker:

- A 2024 overview included 26 systematic reviews, more than 20.9 million
  observations, and 199 unique cohorts. Higher CRF was consistently associated with
  lower all-cause mortality, cardiovascular mortality, and incident chronic disease.
  The high-versus-low association with all-cause mortality was approximately a
  halving of risk, and each higher unit of exercise capacity showed a graded benefit.
  Because the underlying evidence is observational, its GRADE certainty ranged from
  very low to moderate despite its consistency
  ([Lang et al.](https://pubmed.ncbi.nlm.nih.gov/38599681/)).
- The landmark 2009 meta-analysis of 33 cohorts established a quantitative inverse
  association with all-cause mortality and coronary/cardiovascular events in
  initially healthy men and women
  ([Kodama et al.](https://pubmed.ncbi.nlm.nih.gov/19454641/)).
- A later dose-response meta-analysis of 34 cohorts again found graded inverse
  associations with all-cause, cardiovascular, and cancer mortality
  ([Han et al.](https://pubmed.ncbi.nlm.nih.gov/35022163/)).
- In patients with established cardiovascular disease, a meta-analysis of 21 CPET
  cohorts and 159,352 patients found substantially lower all-cause and cardiovascular
  mortality among those with higher measured CRF
  ([Ezzatvar et al.](https://pubmed.ncbi.nlm.nih.gov/34198003/)).

VO₂max is described as a strong longevity predictor because it integrates functional
reserve across multiple systems, associates with both fatal and nonfatal disease,
adds information beyond many resting risk factors, and is modifiable. It does not
measure longevity directly. No observational hazard ratio can validly be translated
into an individual's remaining years of life.

**Confidence that higher CRF predicts lower all-cause mortality: High.**  
**Confidence in a causal effect of a specified VO₂max change on an individual's
lifespan: Moderate-to-low.**

### Independence from age, sex, and conventional risk factors

The answer to the primary independence question is **yes**.

- Blair and colleagues followed 10,224 men and 3,120 women after a preventive
  examination and maximal treadmill test. Mortality decreased across fitness
  strata, and low fitness was important in both sexes
  ([Blair et al.](https://pubmed.ncbi.nlm.nih.gov/2795824/)).
- Myers and colleagues studied 6,213 men referred for exercise testing. After age
  adjustment, achieved exercise capacity was the strongest predictor of death in
  participants with and without cardiovascular disease
  ([Myers et al.](https://pubmed.ncbi.nlm.nih.gov/11893790/)).
- The Cleveland Clinic cohort of 122,007 adults found a graded inverse association
  across the fitness continuum after multivariable adjustment, with no observed
  mortality penalty at extreme fitness
  ([Mandsager et al.](https://pubmed.ncbi.nlm.nih.gov/30646252/)).
- The Veterans Exercise Testing Study included 750,302 adults aged 30–95. Models
  adjusted for age, sex, race, body size, cardiovascular disease, major risk factors,
  chronic disease, cancer, and medications; the inverse association persisted across
  age, race, and sex groups
  ([Kokkinos et al.](https://pubmed.ncbi.nlm.nih.gov/35926933/)).
- Long-term analyses in women and mixed cohorts also show persistence after
  multivariable adjustment
  ([Mora et al.](https://jamanetwork.com/journals/jama/fullarticle/197346);
  [three-decade follow-up](https://pmc.ncbi.nlm.nih.gov/articles/PMC3631586/)).

Residual confounding, reverse causation, referral bias, baseline disease, and
measurement heterogeneity remain possible. Statistical independence does not mean
biological isolation: age and sex strongly affect the expected distribution, and
illness can both lower CRF and increase mortality.

**Independent prognostic-association confidence: High.**

### Cardiovascular disease

CRF is associated with lower incident cardiovascular disease, heart failure,
cardiovascular mortality, and sudden cardiac death. In clinical practice, peak
oxygen uptake and other CPET variables are established tools in selected heart
failure, pulmonary hypertension, congenital heart disease, valvular disease,
ischemia, dyspnea, rehabilitation, and transplantation contexts.

CRF also improves risk classification when added to traditional factors, which was
a central conclusion of the AHA scientific statement. Nevertheless, an isolated
VO₂max value does not diagnose coronary disease, heart failure, pulmonary disease,
or the cause of exercise intolerance. Diagnostic use belongs to the complete,
clinically supervised exercise test.

**Cardiovascular prognostic confidence: High.**  
**Diagnostic confidence of VO₂max alone: Low.**

### Healthy aging

VO₂max normally declines with age, and longitudinal decline accelerates in later
life. In the Baltimore Longitudinal Study of Aging, serial treadmill gas-exchange
testing in adults aged 21–87 showed an accelerating decline even among people free
of clinical heart disease
([Fleg et al.](https://pubmed.ncbi.nlm.nih.gov/16043637/)). This decline reflects
changes in maximal heart rate, stroke volume, peripheral oxygen extraction, muscle
mass and quality, activity, disease burden, and other factors.

Higher midlife and later-life CRF is associated with longer survival, lower chronic
disease burden, and greater functional reserve. Exercise-training meta-analyses show
that VO₂max or VO₂peak remains modifiable in older adults, including adults over 65
and 70
([Huang et al.](https://pubmed.ncbi.nlm.nih.gov/16230876/);
[Sultana et al.](https://pubmed.ncbi.nlm.nih.gov/32083390/)).

The construct is relevant to healthy aging because aerobic reserve supports
mobility, independence, resilience to physiological stress, and the ability to
perform daily activities. It is not a complete healthy-aging measure: cognition,
frailty, strength, balance, sensory function, mental health, and social function are
not captured by VO₂max.

**Confidence for age-related decline and exercise responsiveness: High.**  
**Confidence that VO₂max alone represents whole-person healthy aging: Low.**

### Reference populations

No single reference distribution is valid for every person, protocol, and region.

- The original US FRIEND treadmill standards used 7,783 maximal tests from men and
  women aged 20–79 without cardiovascular disease and found substantial age and sex
  differences
  ([Kaminsky et al. 2015](https://pubmed.ncbi.nlm.nih.gov/26455884/)).
- Updated FRIEND standards provide age- and sex-specific percentiles for treadmill
  and cycle tests through ages 20–89 and show that choice of modality and quality
  criterion affects interpretation
  ([Kaminsky et al. 2022](https://pubmed.ncbi.nlm.nih.gov/34809986/)).
- HUNT 3 directly measured a community-based Norwegian reference sample of 4,631
  healthy men and women aged 20–90
  ([HUNT 3 Fitness Study](https://pmc.ncbi.nlm.nih.gov/articles/PMC4245230/)).
- The 2026 ERS technical standard pooled quality-reviewed cycle CPET data from 5,956
  healthy participants aged 6–83 across 17 sites on four continents. Important
  unexplained site differences and protocol heterogeneity prevented the task force
  from establishing a single robust, globally generalizable reference equation
  ([ERS technical standard](https://pubmed.ncbi.nlm.nih.gov/41786497/)).

These findings support versioned, modality-specific, population-described
references. They argue against a universal “normal,” a universal percentile, or a
single age-equivalent transformation.

**Confidence within a matching FRIEND or HUNT population and protocol: Moderate to
high.**  
**Confidence in global transportability of one reference: Low.**

### Age effects

Age is one of the strongest determinants of VO₂max and VO₂peak. Cross-sectional and
longitudinal reference data show lower values with advancing age and faster decline
at older ages. The amount and trajectory vary with habitual activity, disease,
body composition, training, and cohort selection.

Age adjustment does not remove the need to interpret the native value. A person may
rank favorably for age while still having limited absolute reserve for a specific
task, or rank poorly against a selected reference without having disease. Repeated
measurements cannot establish “rate of aging” unless method, protocol, body mass,
health state, and measurement conditions remain comparable.

### Sex effects

Population reference values differ by sex because of average differences in body
size and composition, hemoglobin, cardiac dimensions and stroke volume, and muscle
mass, as well as behavioral and sampling factors. Large cohorts show the mortality
gradient in both women and men, but women have historically been underrepresented;
the 2024 overview explicitly identified limited evidence in women for some outcomes.

Most reference sets use binary sex categories and do not provide sufficiently
validated interpretation for intersex people, transgender people, or the effects of
gender-affirming hormone therapy. Vitalspan should not imply that existing binary
reference equations solve those evidence gaps.

**Confidence that sex affects population distributions: High.**  
**Confidence in transport beyond the populations represented by current references:
Low.**

### Exercise effects

VO₂max is modifiable. Randomized-trial meta-analysis in adults without cardiovascular
disease shows that structured exercise improves CRF and cardiometabolic markers
([Lin et al.](https://pubmed.ncbi.nlm.nih.gov/26116691/)). Meta-analyses also show
improvement with endurance and interval training in younger, middle-aged, and older
adults.

Training response varies. Genetics, baseline fitness, adherence, dose, modality,
medication use, disease, nutrition, sleep, environment, and measurement error all
contribute. A wearable or CPET change should not automatically be described as a
causal treatment response, and absence of a measured change does not mean exercise
provided no health benefit.

**Confidence that exercise training can improve CRF: High.**  
**Confidence in predicting one individual's magnitude of response: Low-to-moderate.**

## Special measurement review

### Laboratory VO₂max

Direct gas-exchange measurement during a well-designed incremental test is the
criterion standard. A rigorous assessment includes calibrated flow and gas sensors,
an appropriate treadmill or cycle protocol, symptom and safety monitoring, valid
effort assessment, and a predefined method for averaging peak data. A verification
phase can strengthen confidence in an achieved maximum, although practice varies.

The test directly measures pulmonary oxygen uptake, which under usual steady
conditions is used as the noninvasive representation of whole-body oxygen
consumption. It still has biological and technical variability and is not literally
error-free.

**Scientific confidence: High.**  
**Production role: Reference measurement, when complete method and quality
provenance are available.**

### Clinical exercise testing

Clinical CPET adds ECG, blood pressure, symptoms, ventilation, carbon dioxide
output, oxygen saturation, workload, and derived response patterns to oxygen uptake.
It can identify likely mechanisms of exercise intolerance and is clinically
recognized in selected cardiac, pulmonary, perioperative, and rehabilitation
settings. ESC guidance prefers maximal exercise testing with gas exchange when
possible for individualized assessment and exercise prescription, and ESC heart
failure guidance uses CPET in diagnostic uncertainty and advanced clinical
assessment
([2020 ESC sports cardiology guideline](https://academic.oup.com/eurheartj/article/42/1/17/5898937);
[2021 ESC heart failure guideline](https://academic.oup.com/eurheartj/article/42/36/3599/6358045)).

Clinical tests are often symptom-limited, so VO₂peak is usually the defensible term.
The full clinical report has more diagnostic value than the isolated oxygen-uptake
number.

**Scientific confidence: High for integrated clinical CPET and VO₂peak; Moderate
for unqualified use of the term VO₂max.**  
**Production role: Reference-quality result if the reported test method, modality,
quality, and terminology are retained.**

### Estimated VO₂max

Estimated VO₂max is not one method. It includes maximal treadmill workload
estimates, submaximal heart-rate tests, field tests, and models with no exercise.
Each estimate inherits the validation population and assumptions of its specific
protocol.

Estimated CRF predicts mortality in large cohorts and meta-analyses. This makes it
useful for screening and population risk ranking when direct testing is impractical.
It does not show that the estimated number equals direct VO₂max for an individual.
The source model, protocol, and validation population are indispensable scientific
metadata.

**Scientific confidence: Moderate for population risk stratification; Low-to-
moderate for individual physiological accuracy.**  
**Production role: Context only, explicitly named as an estimate; never silently
combined with direct CPET.**

### Apple Health and Apple Watch estimation

Apple Health is a data store, not one measurement method. Its VO₂max sample can
contain an Apple Watch submaximal prediction, another app's prediction, a step-test
prediction, a manually entered value, or a clinic result. Apple provides a test-type
metadata field that distinguishes maximal exercise, submaximal exercise prediction,
non-exercise prediction, and step-test prediction
([Apple HealthKit test types](https://developer.apple.com/documentation/healthkit/hkvo2maxtesttype)).
The numeric value alone is therefore scientifically insufficient.

Apple Watch estimates CRF from heart-rate and motion responses during qualifying
outdoor walking, running, or hiking, with GPS, terrain, exertion, demographic, body
size, and medication inputs. It is a submaximal prediction, not measured gas
exchange. Apple currently documents a supported range of 14–65 mL/kg/min on its
consumer support page, while developer documentation still describes 14–60
mL/kg/min; this documentation difference reinforces the need for versioned source
provenance
([Apple Support](https://support.apple.com/en-us/108790);
[Apple HealthKit](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/vo2max)).

Apple's 2021 white paper reported good repeat reliability and small mean bias in a
221-person validation set. However, its reference was an average projected
submaximal CPET value rather than a directly demonstrated maximal VO₂ value, and the
validation was manufacturer-run
([Apple white paper](https://www.apple.com/in/healthcare/docs/site/Using_Apple_Watch_to_Estimate_Cardio_Fitness_with_VO2_max.pdf)).

Independent evidence is less reassuring for individual accuracy:

- A 19-person Apple Watch Series 7 validation found lower watch estimates than
  laboratory values, poor reliability, and substantial individual error
  ([Caserman et al.](https://pubmed.ncbi.nlm.nih.gov/39083800/)).
- A 30-person validation found mean underestimation of about 6 mL/kg/min and wide
  limits of agreement; the authors concluded that refinement was needed before
  clinical implementation
  ([Lambe et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC12080799/)).
- A 2026 living systematic review identified only that small VO₂max validation
  study for quantitative synthesis and concluded that longitudinal validation of
  key clinical metrics remains necessary
  ([living review](https://pubmed.ncbi.nlm.nih.gov/41513748/)).

Known failure contexts include inaccurate age, sex, weight, or medication data;
heart-rate-limiting drugs; chronotropic incompetence; arrhythmia or pacing;
pregnancy; pain; gait or neuromuscular impairment; peripheral arterial disease;
carrying loads; pushing a stroller or assistive device; sand or grade; heat;
dehydration; altitude; poor GPS or heart-rate signal; and too little qualifying
activity. Apple also documents that historical estimates may be recalibrated, which
can create algorithm-driven changes rather than physiological changes.

**Scientific confidence: Moderate for broad, repeated fitness context in ambulatory
adults who match the operating conditions; Low-to-moderate for an individual's
absolute value; Low for clinical decision-making or substitution for CPET.**  
**Production role: Clearly labelled Apple Watch estimate only. It may support
contextual monitoring, but remains Research Only for diagnosis, precise individual
classification, treatment response, or mortality interpretation.**

### Other wearable estimation

The 2022 INTERLIVE systematic review and meta-analysis included 14 validation
studies. Exercise-based wearable algorithms had little average group bias but wide
individual limits of agreement, while resting algorithms had greater bias and still
wider limits. The authors concluded that exercise-based estimates may be useful at
population level but require improvement for individual sport and clinical use
([Molina-Garcia et al.](https://pubmed.ncbi.nlm.nih.gov/35072942/)).

Brand, model, firmware, algorithm, chest-strap use, activity mode, population,
fitness range, and validation protocol all matter. A result for one model cannot be
generalized to the same brand's later model or to another brand. Small average bias
can coexist with clinically important error for an individual.

**Scientific confidence: Moderate at group level for exercise-based algorithms;
Low-to-moderate at individual level; Low for cross-device comparability.**  
**Production role: Device-specific estimated context only after independent
validation; otherwise Research Only.**

## Guideline summary

| Organization | Key source | Recognition and implication |
| --- | --- | --- |
| American College of Sports Medicine (ACSM) | [ACSM's Guidelines for Exercise Testing and Prescription, 12th edition](https://acsm.org/education-resources/books/guidelines-exercise-testing-prescription/); [ACSM position stand](https://pubmed.ncbi.nlm.nih.gov/21694556/) | ACSM treats CRF assessment, exercise testing, and individualized aerobic exercise prescription as core professional standards. It distinguishes healthy and clinical populations and does not recommend diagnostic exercise testing as universal screening for everyone. |
| American Heart Association (AHA) | [2016 CRF scientific statement](https://pubmed.ncbi.nlm.nih.gov/27881567/) | AHA concludes that low CRF is strongly associated with cardiovascular disease and mortality, adds risk information beyond conventional factors, and makes the case for CRF as a clinical vital sign. |
| European Society of Cardiology (ESC) and European Association for Preventive Cardiology | [2020 sports cardiology guideline](https://academic.oup.com/eurheartj/article/42/1/17/5898937); [2021 heart failure guideline](https://academic.oup.com/eurheartj/article/42/36/3599/6358045); [EACPR/AHA CPET statement](https://pubmed.ncbi.nlm.nih.gov/22952138/) | ESC guidance recognizes maximal testing and preferably CPET for individualized functional assessment and exercise prescription, and uses CPET in selected diagnostic and prognostic pathways. The joint European/AHA statement standardizes clinically meaningful CPET interpretation. |
| American Thoracic Society / American College of Chest Physicians | [ATS/ACCP CPET statement](https://pubmed.ncbi.nlm.nih.gov/12524257/) | Defines indications, conduct, physiology, quality, safety, and interpretation of CPET, including practical use of VO₂max/VO₂peak. |
| European Respiratory Society (ERS) | [2019 standardization statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC9488712/); [2026 reference technical standard](https://pubmed.ncbi.nlm.nih.gov/41786497/) | Recognizes CPET as an integrated physiological test and emphasizes test-specific references, quality control, and the unresolved heterogeneity that currently prevents one global reference equation. |

The organizations recognize clinical importance without claiming that a VO₂max
number alone is a diagnosis, that all adults need maximal CPET, or that consumer
wearables equal clinical testing.

## Evidence registry

| ID | Evidence source | Design and population | Principal contribution | Important limitation | Confidence for supported claim |
| --- | --- | --- | --- | --- | --- |
| VO2-G01 | [Ross et al., AHA 2016](https://pubmed.ncbi.nlm.nih.gov/27881567/) | Scientific statement reviewing CRF and outcomes | Establishes clinical importance, incremental prognostic value, and vital-sign case | Narrative scientific statement; does not make CRF routine in every setting | **High** |
| VO2-G02 | [ACSM 12th edition](https://acsm.org/education-resources/books/guidelines-exercise-testing-prescription/) | Evidence-based professional standard | Current ACSM exercise-testing and prescription framework | Full text is a professional handbook, not a de novo systematic review | **High** for professional recognition |
| VO2-G03 | [ESC sports cardiology 2020](https://academic.oup.com/eurheartj/article/42/1/17/5898937) | Clinical practice guideline | Supports maximal exercise testing and CPET for individualized assessment in relevant populations | Sports and CVD scope; not a general-population screening mandate | **High** |
| VO2-G04 | [ESC heart failure 2021](https://academic.oup.com/eurheartj/article/42/36/3599/6358045) | Clinical practice guideline | Recognizes CPET in functional, diagnostic, and advanced HF contexts | Disease-specific; peak VO₂ thresholds do not transfer to healthy users | **High** |
| VO2-G05 | [EACPR/AHA 2012](https://pubmed.ncbi.nlm.nih.gov/22952138/) and [2016 update](https://pubmed.ncbi.nlm.nih.gov/27143685/) | Joint scientific statements | Standardized clinical CPET data assessment and indication-specific use | Selected clinical indications; evolving variables and practice | **High** |
| VO2-G06 | [ATS/ACCP 2003](https://pubmed.ncbi.nlm.nih.gov/12524257/) | Technical and clinical statement | Foundational CPET physiology, conduct, quality, and interpretation | Older, though still foundational and supplemented by later standards | **High** |
| VO2-G07 | [ERS 2026](https://pubmed.ncbi.nlm.nih.gov/41786497/) | Technical standard; 5,956 healthy participants, 17 sites | Demonstrates global reference heterogeneity and need for stricter standardization | Cycle data dominated; no robust global equation resulted | **High** for the limitation |
| VO2-S01 | [Lang et al. 2024](https://pubmed.ncbi.nlm.nih.gov/38599681/) | Overview of 26 meta-analyses, 20.9 million observations, 199 cohorts | Broad, consistent prospective association with mortality and incident disease | Observational evidence; GRADE very low to moderate; women and some groups underrepresented | **High** for association; **Moderate-to-low** for causal magnitude |
| VO2-S02 | [Kodama et al. 2009](https://pubmed.ncbi.nlm.nih.gov/19454641/) | Meta-analysis of 33 cohorts | Landmark graded association with all-cause mortality and cardiovascular events | Heterogeneous CRF methods and cohorts | **High** |
| VO2-S03 | [Han et al. 2022](https://pubmed.ncbi.nlm.nih.gov/35022163/) | Dose-response meta-analysis of 34 cohorts | Replicates graded associations with all-cause, CVD, and cancer mortality | Observational cohorts and exercise-test heterogeneity | **High** for association |
| VO2-S04 | [Singh et al. 2024/2025](https://pubmed.ncbi.nlm.nih.gov/39271056/) | Meta-analysis of 42 studies, 35 cohorts, 3.8 million observations | Compares objective, exercise-estimated, and non-exercise-estimated CRF mortality gradients | Similar gradients do not prove measurement agreement | **High** for prognostic construct; **Low** for interchangeability |
| VO2-S05 | [Ezzatvar et al. 2021](https://pubmed.ncbi.nlm.nih.gov/34198003/) | Meta-analysis; 21 CPET cohorts, 159,352 CVD patients | Strong inverse association in established cardiovascular disease | Disease and protocol heterogeneity; some endpoint estimates imprecise | **Moderate-to-high** |
| VO2-C01 | [Blair et al. 1989](https://pubmed.ncbi.nlm.nih.gov/2795824/) | Prospective cohort; 13,344 healthy men and women | Landmark evidence across sex and fitness strata | Affluent, predominantly White preventive-clinic cohort; older methods | **Moderate-to-high** |
| VO2-C02 | [Myers et al. 2002](https://pubmed.ncbi.nlm.nih.gov/11893790/) | Clinical cohort; 6,213 men | Exercise capacity remained a powerful predictor after age adjustment | Men only; referred population; estimated METs rather than direct gas exchange | **Moderate-to-high** |
| VO2-C03 | [Mandsager et al. 2018](https://pubmed.ncbi.nlm.nih.gov/30646252/) | Retrospective clinical cohort; 122,007 adults | Graded inverse mortality association without observed harm at extreme CRF | Referral cohort; estimated treadmill capacity; residual confounding | **Moderate-to-high** |
| VO2-C04 | [Kokkinos et al. 2022](https://pubmed.ncbi.nlm.nih.gov/35926933/) | Veterans cohort; 750,302 adults aged 30–95 | Multivariable association across age, race, and sex | Predominantly male veterans; estimated peak METs; referral and survivor bias | **High** for robustness; **Moderate** for generalizability |
| VO2-R01 | [FRIEND 2015](https://pubmed.ncbi.nlm.nih.gov/26455884/) | 7,783 US treadmill CPETs, ages 20–79, no CVD | Modern age- and sex-specific treadmill reference standards | US laboratory registry; not population-random or globally representative | **Moderate-to-high** in matching users |
| VO2-R02 | [FRIEND 2022](https://pubmed.ncbi.nlm.nih.gov/34809986/) | Updated US treadmill and cycle registry, ages 20–89 | Modality-specific percentiles and updated distributions | Same registry and transportability constraints | **Moderate-to-high** in matching users |
| VO2-R03 | [HUNT 3](https://pmc.ncbi.nlm.nih.gov/articles/PMC4245230/) | 4,631 healthy Norwegian adults, ages 20–90 | Large community European direct-measurement reference | Predominantly Norwegian; selection of healthy volunteers | **Moderate-to-high** in matching users |
| VO2-A01 | [Fleg et al. 2005](https://pubmed.ncbi.nlm.nih.gov/16043637/) | Longitudinal study; serial CPET in 810 adults | Shows accelerating age-related decline in aerobic capacity | Healthy volunteer cohort; attrition and cohort effects | **Moderate-to-high** |
| VO2-A02 | [Lin et al. 2015](https://pubmed.ncbi.nlm.nih.gov/26116691/) | Systematic review and meta-analysis of randomized trials | Exercise improves CRF in adults without CVD | Training protocols and populations vary; outcome change does not establish mortality mediation | **High** for trainability |
| VO2-W01 | [INTERLIVE 2022](https://pubmed.ncbi.nlm.nih.gov/35072942/) | Systematic review and meta-analysis of 14 wearable validation studies | Exercise-based algorithms perform better on average, but individual error remains wide | Mostly selected brands and earlier devices; proprietary algorithm drift | **Moderate** at group level; **Low-to-moderate** individually |
| VO2-W02 | [Apple 2021 white paper](https://www.apple.com/in/healthcare/docs/site/Using_Apple_Watch_to_Estimate_Cardio_Fitness_with_VO2_max.pdf) | Manufacturer design and validation cohorts; 221 validation participants | Defines algorithm operating context, internal error, reliability, and failure conditions | Manufacturer-run; reference was projected submaximal CPET, not confirmed direct VO₂max | **Moderate** for operating claims; **Low-to-moderate** for criterion validity |
| VO2-W03 | [Caserman et al. 2024](https://pubmed.ncbi.nlm.nih.gov/39083800/) | Independent criterion validation; 19 adults | Shows meaningful individual error and weak reliability | Very small sample; cycle laboratory test versus outdoor running estimate | **Low-to-moderate** |
| VO2-W04 | [Lambe et al. 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12080799/) | Independent criterion validation; 30 adults | Shows Apple Watch underestimation and wide individual agreement limits | Small, relatively fit sample and uncontrolled free-living estimate context | **Low-to-moderate** |
| VO2-W05 | [Apple Watch living review 2026](https://pubmed.ncbi.nlm.nih.gov/41513748/) | Living systematic review and meta-analysis across Apple Watch metrics | Identifies sparse independent VO₂max validation and need for longitudinal validation | Only one small quantitative VO₂max study available | **High** for evidence-gap conclusion |

## Validation summary

| Validation dimension | Finding | Confidence |
| --- | --- | --- |
| Construct validity | VO₂max/VO₂peak clearly represents integrated maximal or peak aerobic capacity and is a canonical measure of CRF | **High** |
| Criterion measurement validity | Calibrated direct gas-exchange CPET is the accepted criterion method | **High** |
| Terminology validity | VO₂peak is preferable when a maximum is not demonstrated | **High** |
| Prognostic validity | Strong graded association with all-cause mortality, CVD mortality, heart failure, and incident disease across large evidence syntheses | **High** for association |
| Independence | Associations persist after age, sex, and extensive traditional-risk adjustment | **High** |
| Incremental clinical information | CRF improves risk classification beyond traditional factors in multiple settings | **Moderate-to-high** |
| Causal inference | Exercise improves CRF, but observational CRF–mortality effect sizes cannot specify the survival effect of changing one person's VO₂max | **Moderate-to-low** |
| Responsiveness | Structured exercise can improve VO₂max/VO₂peak across adulthood, including older age | **High** |
| Repeatability | Good under standardized direct testing; weaker when protocol, effort, body mass, device, or environment changes | **High** under controlled conditions; **Moderate** in practice |
| Normative validity | Strong within some age-, sex-, modality-, and population-specific references | **Moderate-to-high** locally |
| Global transportability | No single globally robust reference currently covers all populations and protocols | **Low** |
| Apple Watch criterion validity | Internal evidence is encouraging for group monitoring; independent evidence is sparse and shows substantial individual error | **Low-to-moderate** |
| Other wearable criterion validity | Exercise-based algorithms can be useful at group level; individual and cross-device agreement is insufficient for clinical substitution | **Moderate** at group level; **Low-to-moderate** individually |
| Individual longevity prediction | VO₂max alone cannot estimate an individual's lifespan or remaining years | **Not validated** |
| Biological-age transformation | No validated mapping converts VO₂max or a percentile into biological-age years | **Not validated** |

## Clinical limitations

- Most mortality evidence is observational. Consistency and dose-response strengthen
  inference but do not eliminate confounding, reverse causation, or healthy-user
  bias.
- Referral cohorts can overrepresent symptoms and disease; preventive-clinic and
  volunteer cohorts can overrepresent healthier, wealthier, and more active people.
- Women, some racial and ethnic groups, low-resource populations, people with
  disability, and gender-diverse populations remain incompletely represented.
- A low result does not identify the limiting organ system without full CPET
  interpretation.
- Maximal testing may be inappropriate or require clinical supervision in people
  with symptoms, unstable disease, or contraindications.
- Test mode, protocol length, handrail use, calibration, averaging interval, effort,
  encouragement, operator practice, and termination criteria affect the result.
- Treadmill, cycle, field, and wearable values are not interchangeable.
- Acute infection, anemia, pregnancy, recent training or detraining, altitude, heat,
  hydration, sleep, pain, and medications can change performance or estimation.
- Relative VO₂ is influenced by body mass; an apparent change can reflect body-mass
  change rather than the same change in absolute aerobic capacity.
- A single measurement establishes neither trend nor treatment response. Repeated
  measurements require comparable method and context.
- Healthy-population norms and disease-specific prognostic thresholds answer
  different questions.
- Very high CRF has not shown a mortality penalty in the largest exercise-testing
  cohorts, but that does not mean extreme endurance exercise is risk-free for every
  individual.

## Scientific implementation risks

These are readiness constraints, not an implementation design.

| Risk | Scientific consequence | Required readiness control |
| --- | --- | --- |
| Method collapse | A wearable prediction may be presented with the authority of measured CPET | Preserve direct, exercise-estimated, non-exercise-estimated, Apple, and other wearable evidence classes |
| VO₂max/VO₂peak collapse | A symptom-limited peak may be overstated as a demonstrated maximum | Preserve the source term and maximality evidence |
| Missing provenance | The same numeric value can represent incompatible methods | Require source, test type, modality, date, unit, and method identity before interpretation |
| Reference mismatch | Percentile or category can be wrong for the user's population or test | Use only a named, versioned, applicable reference and disclose its population |
| Global norm overreach | A US or Norwegian reference may be presented as universal | Treat transportability as limited; do not infer unvalidated global norms |
| Device and algorithm drift | Apparent longitudinal change may result from firmware or model revision | Retain device and algorithm context where available and break comparability when it changes materially |
| HealthKit source ambiguity | A HealthKit VO₂max quantity may be measured, predicted, third-party, or user-entered | Treat numeric-only HealthKit samples as scientifically indeterminate |
| Medication and disease effects | Heart-rate-based estimates can be biased in precisely the users with high clinical relevance | Exclude clinical interpretation when heart-rate response is decoupled from workload or required context is unknown |
| Body-mass artifact | Relative VO₂ change may be interpreted as physiological improvement | Retain body-mass context and avoid unsupported causal language |
| Sparse repeated data | Noise may be presented as a trend | Require comparable repeated evidence; otherwise present only a dated observation |
| Mortality overstatement | Population association may become an individual life-expectancy claim | Prohibit lifespan, years-added, and individual mortality translations |
| Biological-age overstatement | Normative rank may be converted to “fitness age” or combined with Clinical PhenoAge | Keep the domain independent; no age conversion or modifier role without separate prospective validation |
| Clinical diagnosis overreach | Low VO₂ may be labeled as cardiac or pulmonary disease | Treat isolated VO₂ as fitness evidence, not a diagnosis |
| Unsupported treatment inference | A change may be attributed to a workout, drug, or supplement | Do not infer treatment effect from observational before/after values |

## Clinical readiness assessment

### Ready scientific uses

- A standalone cardiorespiratory-fitness domain.
- Native VO₂max or VO₂peak reporting with the original method and unit.
- Quality-controlled direct CPET as the highest-confidence evidence class.
- Age-, sex-, modality-, and population-specific context when the reference is named
  and applicable.
- Clearly labelled estimated CRF as a lower-confidence evidence class.
- Longitudinal description only when method, device, and context are sufficiently
  comparable.
- Educational interpretation that CRF is modifiable and strongly associated with
  long-term health while avoiding individualized survival claims.

### Uses that remain Research Only or prohibited by current evidence

- Apple Watch or another consumer wearable as a substitute for clinical CPET.
- A numeric HealthKit VO₂max sample with unknown test type or source.
- Diagnosis, triage, or treatment decisions based on a wearable estimate.
- Cross-device, cross-protocol, or estimated-versus-measured trend continuity.
- Universal “low,” “normal,” or “elite” cutoffs independent of age, sex, modality,
  population, and purpose.
- Conversion into biological age, “fitness age,” aging rate, lifespan, years gained,
  or a mortality probability.
- Inclusion as a modifier of Clinical PhenoAge or any future composite without
  independent validation of the complete combined model.
- Exercise, medication, supplement, or other treatment-effect attribution from a
  change in the value alone.

### Remaining pre-production scientific gates

The domain is scientifically Production Ready only if a later implementation phase
can demonstrate all of the following without weakening this review:

1. Measurement class and provenance remain mandatory and visible to the scientific
   interpretation layer.
2. Unknown or incompatible methods fail closed rather than receiving a guessed
   classification.
3. Direct and estimated values are never pooled into one trend or silently
   substituted.
4. Reference use is versioned, population-described, and compatible with test
   modality and age range.
5. VO₂max, VO₂peak, and estimated VO₂max remain terminologically distinct.
6. Clinical red flags and test reports are deferred to qualified clinical review;
   the isolated number is not diagnostically interpreted.
7. Apple and other wearable algorithm or device changes can break longitudinal
   comparability.
8. Claims are limited to fitness, normative context, and association; no biological
   age, lifespan, causal treatment response, or score is created.
9. Scientific governance defines evidence surveillance, reference-version updates,
   subgroup review, and retirement of unsupported device methods.

If these gates cannot be met, the operational status must revert to **Research
Only**, even though the underlying CRF construct is strongly validated.

## Evidence quality synthesis

| Question | Overall judgment | Rationale |
| --- | --- | --- |
| Is VO₂max a valid physiological construct? | **High confidence** | Clear integrated physiology, criterion measurement, and long-standing standardization |
| Does CRF predict all-cause and cardiovascular mortality? | **High confidence that an association exists** | Large, graded, replicated association across cohorts and evidence syntheses |
| Is the association independent of age and sex? | **High confidence** | Repeated multivariable and subgroup evidence in men and women across wide age ranges |
| Does higher VO₂max cause a precisely quantifiable increase in lifespan? | **Not established** | Mortality evidence is mainly observational; exercise trials establish trainability, not an individual lifespan conversion |
| Can one normative system serve all adults? | **Low confidence** | Reference values vary by population, mode, protocol, and site; ERS could not establish one robust global equation |
| Can estimated CRF support population risk stratification? | **Moderate-to-high confidence** | Large cohorts show predictive gradients, but estimates partly encode their model inputs |
| Can an estimated value replace direct CPET for one person? | **Low confidence** | Individual agreement error and method dependence are too large |
| Is Apple Watch VO₂max clinically interchangeable with laboratory VO₂max? | **No** | It is a proprietary submaximal prediction; independent validation is sparse and shows substantial individual error |
| Is the domain suitable for production if evidence classes remain distinct? | **Yes** | The construct and direct measurement are mature; bounded estimated context is scientifically defensible |

## Production recommendation

### Final status: Production Ready

VO₂max/VO₂peak is one of the best-validated modifiable physiological measures of
cardiorespiratory fitness and one of the strongest replicated predictors of
all-cause and cardiovascular mortality. Its association remains after age, sex, and
traditional-risk adjustment; major professional organizations recognize its
clinical value; reference populations and CPET standards are mature enough for
bounded interpretation; and exercise responsiveness is supported by randomized
evidence.

The production domain must be narrower than the public shorthand “VO₂max”:

> **Vitalspan may treat provenance-complete cardiorespiratory fitness as a
> production scientific domain. It may not treat every VO₂max-labelled number as
> equivalent evidence.**

Direct CPET is the reference class. Clinical VO₂peak is highly valid when named
correctly. Validated exercise estimates can be contextual. Apple Watch and other
wearable values remain estimates with lower confidence and are Research Only for
diagnosis, precise individual classification, mortality inference, or substitution
for clinical exercise testing.

The Production Ready decision does not authorize a calculation, formula, score,
biological-age modification, architecture change, or UI. Those would require a
separate governed phase.
