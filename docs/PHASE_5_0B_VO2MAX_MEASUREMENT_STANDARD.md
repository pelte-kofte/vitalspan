# Phase 5.0B — VO₂max Measurement Standard

**Document type:** Official scientific measurement specification  
**Scientific platform:** Vitalspan  
**Review date:** 17 July 2026  
**Status:** Approved scientific standard  
**Final recommendation:** **Production Ready**

## 1. Decision

Vitalspan may accept VO₂max-domain data in production under this standard. The
decision is conditional: a value is usable only for the purpose authorized for
its measurement class, with complete provenance, an explicit measured-versus-
estimated label, and source-specific confidence.

The central policy is:

- A quality-controlled maximal cardiopulmonary exercise test with direct
  respiratory gas analysis is the **Gold Standard**.
- A valid symptom-limited clinical CPET is **Clinical Grade**, but its result is
  normally VO₂peak unless attainment of VO₂max was demonstrated.
- A treadmill or cycle test without respiratory gas analysis is an estimate,
  regardless of whether it was performed in a laboratory or clinic.
- Apple Watch, Garmin, Polar, COROS, Fitbit, WHOOP, and comparable consumer
  devices produce estimates. None may be represented as directly measured
  VO₂max or as clinical truth.
- Apple Health is a data container, not a measurement method. An Apple Health
  value inherits the status of its originating method only when that origin and
  method are verifiable.
- Manual entry is a transcription route, not a scientific method. It never
  upgrades the source measurement.
- No source is interchangeable with another merely because the same unit is
  used.

This standard authorizes measurement acceptance and scientific classification.
It does not authorize a formula, score, biological-age transformation, diagnosis,
clinical decision, UI, or production implementation.

## 2. Normative language and scope

**Must** and **must not** identify requirements. **Should** identifies the
scientifically preferred policy where an exception may be justified and audited.
**May** identifies an allowed option.

This document governs:

- what Vitalspan means by a VO₂max-domain measurement;
- acceptable measurement and entry sources;
- source and confidence classification;
- scientific validity and intended production use;
- units, precision, plausibility, duplicate and outlier handling;
- provenance, timestamps, versioning, corrections, and auditability; and
- scientific conditions for future source admission.

It does not define reference-percentile calculations, change thresholds, alerts,
risk models, clinical cutoffs, or user-facing interpretations.

## 3. Measurement ontology

### 3.1 Required scientific distinctions

Vitalspan must preserve these terms as separate concepts:

| Term | Required meaning |
| --- | --- |
| Cardiorespiratory fitness | The integrated capacity of the respiratory, cardiovascular, blood, vascular, and skeletal-muscle systems to support aerobic work. |
| Oxygen uptake | The physiological rate of oxygen use observed at a stated point or interval during exercise. |
| VO₂max | The greatest attained oxygen-uptake rate when evidence supports that a physiological maximum was reached. |
| VO₂peak | The highest oxygen-uptake rate attained in a test, without asserting that a physiological maximum was demonstrated. |
| Direct measurement | Respiratory gas exchange was measured during exercise using a quality-controlled metabolic measurement system. |
| Exercise-based estimate | Maximal capacity was predicted from submaximal or maximal exercise information without direct measurement of respiratory oxygen uptake. |
| Non-exercise estimate | Maximal capacity was predicted without an exercise test, usually from demographics, body size, resting physiology, or reported activity. |
| Wearable estimate | A device or platform prediction derived from sensor, activity, demographic, or profile data. |
| Source container | A repository or exchange layer, such as Apple Health, that may hold values produced by different methods. |

VO₂max and VO₂peak must never be silently collapsed. Clinical CPET standards
recognize that a plateau is often absent and that a symptom-limited test may end
before a physiological maximum. The reported endpoint, test quality, effort,
termination reason, and modality must therefore be retained
([ATS/ACCP statement](https://pubmed.ncbi.nlm.nih.gov/12524257/);
[ERS standardization statement](https://publications.ersnet.org/content/errev/28/154/180101)).

### 3.2 What a direct result measures

Direct VO₂max or VO₂peak measures whole-body oxygen uptake during exercise. It
integrates ventilation, pulmonary gas exchange, cardiac output, blood oxygen-
carrying capacity, blood-flow distribution, tissue diffusion, skeletal-muscle
oxygen extraction, and mitochondrial use. A low value does not identify which
component is responsible.

Heart rate, pace, power, speed, grade, age, sex, weight, and activity history are
correlates or predictors. They are not themselves measurements of oxygen uptake.

## 4. Confidence Registry

Confidence labels describe the measurement's evidentiary status for Vitalspan.
They are categorical scientific labels, not scores.

| Confidence level | Vitalspan definition | Authorized interpretation |
| --- | --- | --- |
| **Gold Standard** | Direct respiratory gas analysis during a valid maximal test, with calibrated equipment, suitable protocol, quality control, and evidence supporting attainment of VO₂max. | Criterion VO₂max for the tested modality and date. |
| **Clinical Grade** | A professionally performed, quality-controlled clinical assessment suitable for its clinical endpoint, usually symptom-limited direct CPET reporting VO₂peak; also applies to a verified transcription of that report. | Clinical test result as reported, with full context; not automatically VO₂max. |
| **High Confidence** | An estimate with strong independent criterion validation, transparent method and population fit, and sufficiently bounded error for non-diagnostic individual monitoring. | Estimated value or trend only; never direct measurement or clinical truth. |
| **Moderate Confidence** | An estimate with useful validation but material individual error, population restrictions, protocol dependence, or algorithm opacity. | Contextual fitness estimate and cautious within-source trend. |
| **Low Confidence** | Sparse, indirect, inconsistent, self-reported, non-exercise, or weakly transportable evidence. | Supplemental context only; no clinical or precise longitudinal inference. |
| **Research Only** | Scientifically plausible but lacking adequate independent validation, algorithm stability, population evidence, or production comparability. | Retain for research or source evaluation; exclude from production interpretation. |
| **Unsupported** | Method or provenance is absent, invalid, unverifiable, fabricated, outside source specifications, or not meaningfully a VO₂max-domain measurement. | Do not use as a VO₂max-domain result. |

No consumer source evaluated in this review qualifies as Gold Standard or
Clinical Grade. No named consumer source currently qualifies for High Confidence;
that tier is reserved for future estimates with stronger independent,
version-specific individual validation. No confidence label removes the
requirement to call an estimate an estimate.

## 5. Measurement Standard

### 5.1 Acceptable production classes

Vitalspan may accept the following classes:

1. Gold Standard direct VO₂max.
2. Clinical Grade direct VO₂peak or verified clinician transcription.
3. High, Moderate, or Low Confidence estimates, only with the estimate label and
   the restricted use defined by the Source Classification Registry.
4. Research Only values in a segregated research context, excluded from
   production scientific interpretation.

Unsupported values may be retained in an audit or rejection record but must not
enter the scientific VO₂max history as valid measurements.

### 5.2 Gold Standard acceptance requirements

A result qualifies as Gold Standard only when all of the following are known:

- respiratory oxygen uptake was directly measured during progressive,
  large-muscle exercise;
- the ergometer modality was recorded;
- the metabolic system and laboratory quality-control status were documented;
- flow and gas analyzers were calibrated in accordance with the laboratory's
  accepted protocol;
- the exercise protocol, averaging interval, test date, and result unit were
  available;
- the test was technically valid, without a reported gas-exchange or equipment
  failure;
- evidence supporting maximal effort and attainment of a maximum was documented;
- the final report explicitly identified VO₂max, or the underlying report
  supported that designation; and
- the result could be traced to the issuing laboratory or clinician report.

A verification phase may strengthen maximality assessment, but evidence does not
support making it universally mandatory. A systematic review of 80 studies and
1,680 participants found that verification-phase and incremental-test means were
usually similar; the authors nevertheless emphasized protocol and participant
context rather than a universal rule
([Costa et al.](https://pubmed.ncbi.nlm.nih.gov/33596256/)).

If the plateau or other maximality evidence is absent, ambiguous, or not retained,
the result must be classified as Clinical Grade VO₂peak rather than Gold Standard
VO₂max. A high respiratory exchange value, predicted heart-rate attainment, or
perceived exertion can support effort assessment but no single secondary criterion
proves a physiological maximum in every population.

### 5.3 Clinical Grade acceptance requirements

A direct symptom-limited CPET qualifies as Clinical Grade when:

- gas exchange was directly measured;
- equipment, protocol, and test quality were clinically acceptable;
- the reason for termination and achieved endpoint were recorded;
- the result is retained exactly as VO₂peak or VO₂max in the source report; and
- provenance is verified.

CPET is more than one oxygen-uptake number. Clinical interpretation normally uses
ventilatory, circulatory, ECG, blood-pressure, symptom, and workload responses.
Vitalspan must not imply that an isolated imported VO₂peak reproduces the complete
clinical interpretation
([AHA CPET commentary](https://professional.heart.org/en/science-news/2016-focused-update-clinical-recommendations-for-cardiopulmonary-exercise-testing-data-assessment/commentary)).

### 5.4 Direct laboratory quality requirements

Laboratory status alone is insufficient. A direct result requires documented gas
analysis and quality control. Current ERS technical work shows that metabolic
measurement systems vary and require rigorous calibration and ongoing quality
assurance. Site, cart, protocol, and averaging method can materially affect
reference distributions
([ERS equipment standard](https://pubmed.ncbi.nlm.nih.gov/41786497/);
[ERS reference-values technical standard](https://publications.ersnet.org/index.php/content/erj/early/2026/02/26/1399300302463-2025)).

The record should preserve:

- metabolic-cart manufacturer and model;
- software version when available;
- flow and gas calibration completion;
- protocol name or complete protocol description;
- breath-by-breath averaging or reporting interval;
- participant preparation deviations;
- modality, achieved workload, symptoms, and termination reason;
- maximality evidence and verification phase, if performed; and
- whether the value is absolute, mass-normalized, VO₂peak, or VO₂max.

### 5.5 Modality rule

Treadmill and cycle ergometer results must not be merged as though they were the
same repeated measure. Treadmill testing often elicits a higher value in untrained
or running-adapted people because more muscle mass is active, while trained
cyclists may show smaller or reversed differences. One study in triathletes found
material modality differences and summarized prior treadmill-cycle differences of
approximately 7–18%, with substantial context dependence
([Basset et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC8955092/)).

The modality is therefore part of the measurement identity, not optional
metadata. Longitudinal comparison should use the same modality and a comparable
protocol whenever possible.

### 5.6 Methods that must never be treated as clinical truth

The following can never be promoted to clinical truth without a separate,
qualifying direct source report:

- treadmill or cycle capacity derived only from workload, power, speed, grade,
  duration, or protocol completion;
- submaximal exercise predictions;
- field-test and non-exercise predictions;
- Apple Watch, Garmin, Polar, COROS, Fitbit, WHOOP, or other consumer-device
  estimates;
- Apple Health or another repository value whose underlying method is not
  verified;
- manufacturer fitness levels, fitness ages, performance scores, or percentiles;
- clinician opinion that is not a transcription of a qualifying test; and
- user-entered values that have not completed source verification.

Repeated agreement with a person's expected fitness, consistency over time, or
closeness to one laboratory test does not change this rule.

## 6. Source Classification Registry

### 6.1 Registry overview

| Source or method | Required classification | Production status | Clinical truth? |
| --- | --- | --- | --- |
| Direct CPET with demonstrated maximum | **Gold Standard** | Accepted | Yes, for criterion VO₂max within the tested context |
| Direct symptom-limited CPET without demonstrated maximum | **Clinical Grade** | Accepted as VO₂peak | Clinical test result, but not proven VO₂max |
| Laboratory treadmill with valid gas analysis and demonstrated maximum | **Gold Standard** | Accepted | Yes, treadmill-specific |
| Laboratory cycle ergometer with valid gas analysis and demonstrated maximum | **Gold Standard** | Accepted | Yes, cycle-specific |
| Laboratory treadmill or cycle test without gas analysis | **Moderate Confidence** | Accepted as estimate only | No |
| Apple Health with missing or unverified origin/test type | **Unsupported** | Rejected from scientific interpretation | No |
| Apple Watch cardio-fitness estimate | **Moderate Confidence** | Accepted as estimate only | No |
| Garmin supported exercise-based estimate | **Moderate Confidence** | Accepted as estimate only | No |
| Polar Running Index | **Moderate Confidence** | Accepted as estimate only | No |
| Polar Fitness Test at rest | **Low Confidence** | Supplemental context only | No |
| COROS EvoLab running VO₂max | **Research Only** | Research ingestion only | No |
| Fitbit/Google Health qualifying GPS-run estimate | **Moderate Confidence** | Accepted as estimate only for supported devices/workflows | No |
| WHOOP 5.0/MG VO₂max estimate | **Research Only** | Research ingestion only | No |
| Verified clinician transcription of a qualifying report | Inherits source; at most **Clinical Grade** as an entry route | Accepted when attested and auditable | Only to the extent of the source report |
| Unverified clinician-entered estimate | **Unsupported** | Rejected from scientific interpretation | No |
| User entry with attached, verifiable source report | Inherits source measurement, with **Low Confidence** transcription until verified | Provisional only | No until verified |
| Unverified user-entered number | **Unsupported** | Rejected from scientific interpretation | No |

The classifications are versioned as of the review date. A brand name alone is
never sufficient: device model, algorithm generation, qualifying activity, source
metadata, and validation population determine whether the registry row applies.

### 6.2 Direct CPET

**Measurement principle and physiology.** Direct CPET measures inspired and
expired gases during progressively increasing exercise and derives oxygen uptake
throughout the test. It observes the integrated oxygen pathway under controlled
exercise stress.

**Scientific validity and clinical acceptance.** It is the criterion method for
VO₂max and the established clinical method for VO₂peak and integrative exercise
assessment. ATS/ACCP, AHA, ESC-associated groups, and ERS standards define its
performance and interpretation
([ATS/ACCP](https://pubmed.ncbi.nlm.nih.gov/12524257/);
[ESC CPET standards](https://esc365.escardio.org/journal/30954);
[ERS](https://publications.ersnet.org/content/errev/28/154/180101)).

**Expected accuracy and typical error.** Properly validated gas-analysis systems
can achieve low technical error under controlled conditions, but the total result
also contains biological, effort, protocol, and test-retest variability. ATS/ACCP
described carefully performed biological validation as generally accurate within
approximately 2–3% in healthy people at moderate-to-heavy workloads. Repeatability
is population-dependent; a 2025 study reported peak-VO₂ test-retest variability of
about 3% in healthy participants and 7.8% in COPD
([ATS/ACCP full statement](https://www.thoracic.org/statements/resources/pfet/cardioexercise.pdf);
[test-retest study](https://pubmed.ncbi.nlm.nih.gov/39878361/)). These figures must
not be treated as universal individual change thresholds.

**Limitations and populations.** Maximal exercise may be inappropriate or
unattainable in some people. Symptoms, safety criteria, pain, disability,
motivation, unfamiliarity, medication, acute illness, and disease can limit the
observed peak. Reference equations must match modality and population.

**Update frequency.** One result is generated per completed test. Retesting is
episodic and clinically or scientifically indicated; no universal retest interval
is established by this standard.

**Production usage.** Accept as Gold Standard only when the maximum is supported.
Otherwise accept the direct result as Clinical Grade VO₂peak.

### 6.3 Laboratory treadmill testing

**Measurement principle.** Work rate rises through speed, grade, or both. With
direct gas analysis, oxygen uptake is measured; without gas analysis, capacity is
predicted from workload, time, or protocol.

**Validity and acceptance.** Direct, quality-controlled treadmill CPET can be Gold
Standard. A treadmill stress test without gas analysis is clinically useful for
exercise capacity and risk assessment but does not directly measure VO₂max. The
AHA notes the inaccuracies of estimating peak or maximal oxygen uptake from
attained work rate
([AHA](https://professional.heart.org/en/science-news/2016-focused-update-clinical-recommendations-for-cardiopulmonary-exercise-testing-data-assessment/commentary)).

**Expected error.** Direct-test error follows CPET quality and repeatability.
Workload-based prediction error varies by protocol, handrail use, gait, efficiency,
body size, familiarity, and disease; a single universal error is not defensible.

**Population limitations.** Gait or balance impairment, musculoskeletal disease,
neurologic conditions, severe obesity, and treadmill unfamiliarity can reduce
validity or cause early termination. Treadmill values are not interchangeable with
cycle values.

**Update frequency and production use.** Per test. Accept direct valid VO₂max as
Gold Standard, direct VO₂peak as Clinical Grade, and workload-derived VO₂max as a
Moderate Confidence estimate.

### 6.4 Laboratory cycle ergometer testing

**Measurement principle.** External power is progressively increased on a cycle
ergometer. With direct gas analysis, oxygen uptake is measured; without it,
capacity is predicted from achieved power or protocol.

**Validity and acceptance.** Direct, quality-controlled cycle CPET can be Gold
Standard and is widely used clinically because workload is controllable and ECG,
blood-pressure, and sampling procedures are practical.

**Expected error.** Direct-test error follows CPET quality. Estimated values depend
on mechanical efficiency and the prediction method. Local leg fatigue may end a
test before cardiopulmonary capacity is fully expressed.

**Population limitations.** Untrained cyclists, people with peripheral vascular or
neuromuscular limitation, and people limited by quadriceps fatigue may achieve a
lower value than on a treadmill. Cycling-adapted athletes may not follow that
pattern.

**Update frequency and production use.** Per test. Accept direct valid VO₂max as
Gold Standard, direct VO₂peak as Clinical Grade, and power-derived VO₂max as a
Moderate Confidence estimate. Preserve cycle modality permanently.

### 6.5 Apple Health

**Measurement principle.** Apple Health/HealthKit stores discrete VO₂max samples
created by Apple Watch, clinical software, third-party apps, or users. It is a
container and exchange layer, not an estimator by itself.

**Scientific validity.** HealthKit provides method metadata values for maximal
exercise, submaximal exercise prediction, non-exercise prediction, and step-test
prediction. Apple explicitly directs sample creators to record the test type
([HealthKit test types](https://developer.apple.com/documentation/healthkit/hkvo2maxtesttype);
[VO₂max sample documentation](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/vo2max)).

**Known limitations.** A sample may be user-created or third-party-created. The
presence of `maxExercise` metadata establishes a declared method, not proof of gas
analysis, calibration, maximality, or clinical authenticity. Origin metadata can
be incomplete, and source applications can transform or duplicate values.

**Clinical acceptance and error.** There is no Apple-Health-wide accuracy or
clinical status. Accuracy belongs to the originating method.

**Population limitations and update frequency.** These inherit the originating
source. HealthKit may contain multiple samples on the same day and may receive
historically revised Apple estimates.

**Production usage.** Apple Health with complete, verifiable provenance inherits
the originating source classification. Apple Health with missing origin, method,
or test-type metadata is Unsupported. It must never be called clinical merely
because HealthKit reports `maxExercise`.

### 6.6 Apple Watch

**Measurement principle and physiology.** Apple Watch estimates VO₂max from the
heart-rate response to outdoor walking, running, or hiking, combined with motion,
pace, terrain, and profile information. It predicts maximal aerobic capacity from
submaximal free-living activity; it does not measure respiratory gases or require
peak exercise.

**Sensors and inputs.** Apple's validation paper identifies the optical heart
sensor, accelerometer, gyroscope, barometer, and GPS, together with age, sex,
height, weight, medication status, and activity context. Current Apple support
describes heart and motion sensors and a supported estimate range of 14–65
mL/kg/min
([Apple support](https://support.apple.com/en-euro/108790);
[Apple validation paper](https://www.apple.com/in/healthcare/docs/site/Using_Apple_Watch_to_Estimate_Cardio_Fitness_with_VO2_max.pdf)).

**When it is updated.** A qualifying Outdoor Walk, Outdoor Run, or Hiking workout
can generate an estimate when terrain is relatively flat, GPS and heart-rate
signals are adequate, and exertion is sufficient. The first estimate requires at
least 24 hours of wear followed by several eligible workouts and passive
measurements. Apple can later offer to update prior cardio-fitness data when it
determines that estimates could be more accurate. Historical revisions must be
retained as revisions, not silently overwrite the earlier record.

**Validity and expected error.** Apple's development used a projected submaximal
reference rather than directly demonstrated maximal VO₂. In its held-out sample of
221 participants, Apple reported mean error of 1.4 with a standard deviation of
4.7 mL/kg/min and reliability of 0.86. Independent studies have found larger
individual error. One 19-person study reported mean absolute percentage error of
15.79% and agreement of 0.47; a 30-person study reported underestimation of about
6.1 mL/kg/min, mean absolute percentage error of 13.31%, and wide limits of
agreement
([Caserman et al.](https://pubmed.ncbi.nlm.nih.gov/39083800/);
[Lambe et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC12080799/)). Small samples
and differing protocols limit precision of these error estimates, but they clearly
exclude clinical interchangeability.

**Reliability-reducing situations.** Reliability can be reduced by poor optical
heart-rate contact, motion artifact, weak or obstructed GPS, inaccurate profile or
medication data, chronotropic incompetence, arrhythmia, pacemaker use, heart-rate-
limiting drugs, pregnancy, acute illness, pain, gait inefficiency, carrying loads,
pushing a stroller, sand or steep terrain, heat, dehydration, altitude, and low or
atypical exertion. Apple notes that conditions or medications that limit heart rate
can cause overestimation.

**Population limitations.** Values outside the supported range cannot be observed
accurately by the feature. The training and validation population does not
establish equivalence in children, elite endurance athletes, all racial and ethnic
groups, pregnancy, major gait impairment, or all cardiac and pulmonary diseases.

**Can it replace laboratory testing?** No. It cannot replace direct CPET for
diagnosis, mechanism of exercise intolerance, precise individual classification,
high-stakes decisions, or confirmation of VO₂max.

**Required classification and production use.** **Moderate Confidence; Estimated.**
Accept for contextual within-device monitoring in eligible users. Do not treat as
clinical, measured, diagnostic, or interchangeable with CPET.

#### Required Apple Health decision

Vitalspan must not assign one scientific status to every value found in Apple
Health:

| Apple Health record | Required treatment |
| --- | --- |
| Apple Watch-generated cardio-fitness sample with qualifying provenance | **Estimated; Moderate Confidence** |
| Verified clinic-origin sample backed by a direct CPET report | Inherit **Gold Standard** VO₂max or **Clinical Grade** VO₂peak from the verified report |
| Verified third-party device estimate | **Estimated** and inherit that device/method's registry confidence |
| Declared maximal-exercise metadata without proof of direct gas analysis | Not clinical; quarantine for verification |
| Missing or unresolvable origin, test type, or method | **Unsupported** |

Therefore, the answer to “clinical, estimated, or research?” is **Estimated** for
Apple Watch cardio-fitness values. Apple Health itself is only a container; it can
also carry verified clinical results, Research Only values, or Unsupported values
depending on provenance. Apple Watch estimation cannot replace laboratory testing.

### 6.7 Garmin

**Measurement principle and physiology.** Supported Garmin devices estimate VO₂max
from heart-rate response and external workload, commonly pace/speed and GPS during
qualifying running, walking, or cycling activities. Exact inputs, eligible profiles,
and algorithms vary by model and software generation. Some products use Firstbeat-
derived methods; current Garmin materials describe a Garmin performance-lab engine.

**Validity.** Garmin is among the more frequently studied wearable families. The
INTERLIVE review found exercise-based wearable estimates had little pooled mean
bias but wide individual limits of agreement, approximately 10 mL/kg/min in either
direction. A small independent Garmin fēnix 6 study reported mean absolute
percentage error of 7.05%, while a 2025 Forerunner 245 study found errors around
7–8% overall and materially worse performance in highly trained athletes
([INTERLIVE](https://pubmed.ncbi.nlm.nih.gov/35072942/);
[fēnix 6](https://pubmed.ncbi.nlm.nih.gov/39797066/);
[Forerunner 245](https://pubmed.ncbi.nlm.nih.gov/40770433/)).

**Known limitations.** Wrist heart-rate error, GPS error, hills, heat, wind,
fatigue, inaccurate maximum heart rate or profile data, load carriage, stops,
drafting, cycling power-meter status, sport profile, device model, and algorithm
updates can affect the estimate. Running and cycling estimates are modality-
specific and must not be merged.

**Clinical acceptance.** Useful for fitness monitoring, not accepted as a direct
clinical VO₂max measurement and not suitable for high-stakes individual decisions.

**Population limitations.** Evidence is concentrated in healthy and active adults,
with smaller studies in athletes. Transportability is uncertain in children,
frail adults, people unable to run, users with altered heart-rate response, and
many clinical populations. Elite athletes may have larger underestimation.

**Update frequency.** The estimate is source-generated after qualifying supported
activities. Eligibility varies by model and activity profile; Vitalspan must not
infer an update when Garmin does not provide one
([Garmin support](https://support.garmin.com/en-US/?faq=lWqSVlq3w76z5WoihLy5f8)).

**Required classification and production use.** **Moderate Confidence; Estimated.**
Accept supported exercise-based estimates for within-model context and cautious
trend monitoring. Model, modality, sensor configuration, and software version are
required when available. Do not treat as clinical truth.

### 6.8 Polar

Polar exposes scientifically distinct estimates that must not be collapsed.

#### Polar Running Index

**Principle.** Running Index estimates maximal aerobic running performance from
heart rate and speed during a qualifying run, using GPS or a calibrated stride
sensor. Polar states that it is calculated for eligible running sessions of at
least 12 minutes and sufficient speed; terrain can be considered when altitude is
available
([Polar Running Index](https://support.polar.com/e_manuals/vantage-v2/polar-vantage-v2-user-manual-english/running-index.htm)).

**Validity and error.** It belongs to the exercise-based wearable class. That
class shows small pooled average bias but wide individual error in the INTERLIVE
meta-analysis. Independent evidence is not equally strong for every Polar model
and algorithm generation, so no single device-specific error is assigned.

**Limitations and populations.** Running economy, terrain, wind, temperature,
heart-rate accuracy, maximum-heart-rate settings, GPS or stride calibration,
fitness level, medication, and training specificity affect the result. It is not
appropriate for non-runners or as a cycling estimate.

**Update frequency and use.** Generated after each qualifying run. Classify as
**Moderate Confidence; Estimated** and use only for running-specific context and
within-source trends.

#### Polar Fitness Test

**Principle.** The five-minute resting test predicts VO₂max from resting heart
rate, heart-rate variability, age, sex, height, weight, and self-reported training
background. It does not exercise the oxygen-transport system to maximum
([Polar overview](https://support.polar.com/en/define-vo2max?product_id=100914)).

**Validity and error.** In a 2025 study of 24 adults in medically supervised
exercise training, the test showed mean absolute percentage error of 13.7%, mean
bias of −1.0 mL/kg/min, and limits of agreement of approximately ±11.4 mL/kg/min
against CPET. The investigators concluded that variability limits individual
clinical decisions
([Neudorfer et al.](https://pubmed.ncbi.nlm.nih.gov/41012888/)). INTERLIVE similarly
advised against relying on resting-condition estimates at the individual level.

**Limitations and populations.** The result depends strongly on demographic,
profile, training-background, resting-heart-rate, and HRV inputs. Stress, sleep,
illness, medication, arrhythmia, autonomic state, and incorrect activity class can
alter it. Evidence is insufficient for precise clinical use.

**Update frequency and use.** User-initiated per test. Classify as **Low
Confidence; Estimated** and use only as supplemental non-exercise context.

### 6.9 COROS

**Measurement principle.** COROS EvoLab estimates running VO₂max from heart rate
and pace in recent outdoor runs. The manufacturer describes a stable, running-
specific estimate and a guided outdoor running fitness test
([COROS EvoLab](https://support.coros.com/hc/en-us/articles/38180411247892-EvoLab)).

**Scientific validity and expected error.** COROS states that its result was
tested against laboratory results, but this review found no adequate,
independently replicated, peer-reviewed criterion-validation evidence defining
individual bias and limits of agreement for current EvoLab versions. A typical
independent error therefore cannot be specified.

**Limitations and populations.** The proprietary and versioned algorithm depends
on running pace, heart rate, recent training data, qualifying activity, terrain,
weather, GPS, optical heart-rate quality, and user profile. Evidence is not
established for non-runners, clinical populations, children, frail adults, or
cross-modality use.

**Clinical acceptance.** No. Manufacturer comparison with laboratory data is not
enough to establish clinical interchangeability.

**Update frequency.** Source-generated from qualifying recent outdoor-run data;
some activity metrics require sufficient duration and intensity. Exact VO₂max
revision behavior is algorithm-dependent.

**Required classification and production use.** **Research Only; Estimated.**
Retain with provenance for validation research, but exclude from production
scientific interpretation until adequate independent validation of current
versions is available.

### 6.10 Fitbit and Google Health

**Measurement principle.** Current Google Health documentation describes VO₂max
estimation during outdoor GPS-enabled runs. It uses running efficiency from pace
and heart rate, resting heart rate, and profile information. A first estimate
requires a qualifying run of at least 10 minutes and may require up to three runs
in 30 days
([Google Health](https://support.google.com/googlehealth/answer/14237924?hl=en)).

**Validity and expected error.** Independent Fitbit Charge 2 studies in healthy
adults found mean absolute percentage error below or around 10%. One study of 65
healthy adults reported small mean bias and acceptable group concordance, while
explicitly calling for more clinical and longitudinal research. Another reported
mean absolute percentage error of 10.2%
([Klepin et al.](https://pubmed.ncbi.nlm.nih.gov/31107835/);
[Fitbit Charge 2 assessment](https://pubmed.ncbi.nlm.nih.gov/31620466/)).

**Known limitations.** Validation of Charge 2 does not automatically validate
later Fitbit, Pixel Watch, or Google Health algorithm versions. GPS, optical heart
rate, terrain, pace, exercise intensity, resting heart rate, profile accuracy,
device placement, and algorithm changes can affect estimates.

**Clinical acceptance.** Not a direct or Clinical Grade method. Evidence supports
fitness estimation in selected healthy runners, not clinical decisions.

**Population limitations.** Evidence is strongest in young or middle-aged healthy
adults able to run. Applicability is uncertain in children, older frail adults,
non-runners, elite athletes, heart-rate-altering conditions or medications, and
many disease groups.

**Update frequency.** Source-generated after qualifying GPS runs. Google advises
reviewing longer trends rather than isolated results.

**Required classification and production use.** **Moderate Confidence; Estimated**
only when the supported device/workflow, qualifying GPS-run basis, and provenance
are known. A generic Fitbit value without model or method is Low Confidence; an
untraceable import is Unsupported. Never treat it as clinical truth.

### 6.11 WHOOP

**Measurement principle.** WHOOP 5.0 and MG estimate VO₂max weekly from a
proprietary model using resting heart rate, heart-rate variability, exercise
patterns, sleep-related observations, age, sex, height, and weight. GPS-enabled
runs can augment the model. WHOOP states that a result becomes available after
sufficient recovery records and that recent GPS runs improve precision
([WHOOP support](https://support.whoop.com/s/article/VO2-Max?language=en_US)).

**Scientific validity and expected error.** The feature is recent. WHOOP reports
internal comparison with laboratory testing and, in 2026, reported typical
distance from a laboratory value of approximately 3.3–3.7 mL/kg/min. This is a
manufacturer claim, not an independently replicated estimate of bias and limits
of agreement
([WHOOP validation description](https://www.whoop.com/us/en/thelocker/how-accurate-is-whoop-vo2-max/)).

**Known limitations.** The passive model partly predicts fitness from variables
already correlated with fitness. Error can arise from optical heart-rate and HRV
quality, incomplete wear, sleep or activity detection, profile data, medication,
illness, atypical heart-rate response, GPS and pace, and model updates.

**Clinical acceptance and populations.** No clinical acceptance as a VO₂max
measurement. WHOOP describes validation for adults aged 18 and older; independent
evidence is not yet sufficient across age, sex, fitness, ethnicity, disease,
medication, and athletic-performance strata.

**Update frequency.** Weekly under the current product description, with passive
data requirements and optional GPS-run augmentation.

**Required classification and production use.** **Research Only; Estimated.**
Retain for prospective evaluation but exclude from production scientific
interpretation until current-version independent validation and longitudinal
stability are demonstrated.

### 6.12 Manual clinician entry

**Measurement principle.** None. Manual clinician entry transcribes or attests to
a result produced elsewhere.

**Validity and clinical acceptance.** A verified transcription can faithfully
represent a Gold Standard or Clinical Grade source report. The entry channel
itself does not validate gas analysis, maximality, or test quality. A clinician's
unaudited recollection or informal estimate is not Clinical Grade.

**Expected error and limitations.** Transcription errors include wrong unit,
decimal, modality, date, endpoint, body-mass normalization, and confusion of
VO₂peak with VO₂max. The original report and attestation determine reliability.

**Population limitations and update frequency.** These inherit the original
measurement. Updates occur when an authorized clinician enters or corrects a
report; corrections must be append-only and linked.

**Production usage.** Accept a clinician entry only when the issuer, original
method, report date, modality, endpoint, value, unit, and attestation are present.
It inherits the source classification and is capped at Clinical Grade as a
transcription route until the original Gold Standard report is independently
verified. Unverified clinician estimates are Unsupported.

### 6.13 Manual user entry

**Measurement principle.** None. The user reports a number or transcribes a source.

**Validity and expected error.** The entry is vulnerable to recall, unit,
transcription, source, modality, date, and measured-versus-estimated errors. No
general numerical error can be assigned.

**Clinical acceptance.** None by itself. A user-uploaded laboratory report may
enter a verification workflow, but the self-entry remains provisional until the
document and source are checked.

**Population limitations and update frequency.** Not population-specific;
submitted at user discretion.

**Production usage.** A user-entered number with a verifiable attached report is
Low Confidence as a provisional transcription and may inherit the source class
after verification. An entry without a verifiable source is Unsupported and must
not influence scientific interpretation or trends.

## 7. Scientific error model

### 7.1 Error categories

Vitalspan must not represent “accuracy” as one universal number. Measurement
uncertainty includes:

- analyzer and flow-sensor error;
- calibration and maintenance error;
- protocol and averaging effects;
- within-person biological variability;
- effort, symptoms, learning, and termination effects;
- modality and exercise-economy effects;
- wearable heart-rate, motion, GPS, altitude, and pace error;
- model error and population transportability;
- profile, medication, and body-mass error;
- algorithm and software-version drift; and
- transcription, unit, timestamp, and provenance error.

The pooled wearable evidence is particularly important: exercise-based algorithms
showed near-zero average bias but limits of agreement near ±10 mL/kg/min, while
resting algorithms showed positive average bias and still wider limits. Good group
agreement therefore does not imply accurate individual agreement
([INTERLIVE](https://pubmed.ncbi.nlm.nih.gov/35072942/)).

### 7.2 Change over time

No universal “real change” threshold is authorized. A change can reflect training,
detraining, disease, body mass, medication, environment, protocol, device,
software, calibration, or normal test-retest variation. Longitudinal interpretation
requires the same endpoint, modality, method, source family, and preferably the
same protocol and algorithm version.

## 8. Data Standard

### 8.1 Canonical quantity and unit

The canonical production quantity is **body-mass-normalized VO₂max or VO₂peak** in
**millilitres of oxygen per kilogram of body mass per minute**, written
**mL O₂·kg⁻¹·min⁻¹**.

Accepted equivalent textual unit expressions may be normalized to that canonical
unit when their meaning is unambiguous. Examples include `mL/kg/min`,
`ml·kg−1·min−1`, and equivalent spacing or capitalization variants.

### 8.2 Accepted and prohibited conversions

- A value reported in litres per kilogram per minute may be unit-normalized only
  when the original unit is explicit and the raw value and raw unit are retained.
- Absolute oxygen uptake in litres per minute or millilitres per minute must be
  stored as an absolute companion quantity. It must not be relabelled as the
  canonical mass-normalized value.
- Conversion between absolute and mass-normalized oxygen uptake is permitted only
  when contemporaneous measured body mass from the same test report is present.
  The absolute source value, body mass, date, and conversion provenance must all be
  retained. A profile weight from another date is insufficient.
- Exercise capacity expressed as METs, watts, speed, grade, test duration, distance,
  or a vendor fitness category must not be converted into a directly measured
  VO₂max record. Such transformations are model-based estimates and belong in a
  separate estimated-test class if later authorized.
- Percent predicted, percentile, “fitness age,” and categorical fitness level are
  not units and must not populate the canonical value.

### 8.3 Precision and decimal handling

- The raw value and its original textual or numeric precision must be preserved.
- Scientific normalization must not add precision absent from the source.
- The canonical normalized value should retain no more than one decimal place for
  scientific comparison. Greater reported precision remains available in the raw
  source record but does not imply physiological accuracy.
- Integer-valued wearable estimates remain integers; a trailing decimal must not be
  invented.
- Rounding occurs only in the normalized scientific representation, never by
  altering the raw record.
- Decimal separators must be interpreted using explicit source locale. Ambiguous
  separators are quarantined rather than guessed.

### 8.4 Missing values

- Missing is represented as absent or null, never as zero, an empty string, a
  sentinel number, or a population average.
- Missing values must not be imputed, carried forward, interpolated, or inferred
  from a fitness category under this standard.
- A value with missing unit, missing endpoint, or missing measured-versus-estimated
  status is incomplete and cannot be scientifically interpreted.

### 8.5 Invalid values

The following are invalid:

- zero or a negative value;
- non-finite, nonnumeric, or unparsable content;
- a value with an absent or incompatible unit;
- a percentage, percentile, MET value, power, speed, time, distance, vendor score,
  or fitness category presented as canonical VO₂max;
- a source value outside the manufacturer's representable range when claimed to
  have been generated by that feature;
- a sample claimed as direct measurement when respiratory gas analysis was not
  performed; and
- an internally contradictory record that cannot be resolved from provenance.

Invalid records are not silently corrected. They are rejected from scientific use
and retained in an auditable rejection record when permitted.

### 8.6 Physiological plausibility limits

Science does not support one absolute healthy lower or upper limit across severe
disease, disability, age, body size, testing modality, and elite sport. Vitalspan
therefore uses review limits rather than pretending that all unusual values are
impossible.

- Values above zero and from **5 through 100 mL O₂·kg⁻¹·min⁻¹** are within the
  general automatic plausibility interval, subject to all other validation.
- Values below 5 or above 100 are physiologically unusual and must be quarantined
  for source, unit, modality, body mass, and report verification.
- An unusual value may be accepted only from a verified direct report or from a
  source whose documented range includes it. It remains flagged as extreme.
- Consumer estimates must also fall within that source's supported range. For
  example, current Apple support describes a 14–65 mL/kg/min Apple Watch range.
- Limits are quality-control gates, not clinical cutoffs and not definitions of
  health, disease, or athletic status.

### 8.7 Outlier policy

Outliers must not be winsorized, capped, deleted, averaged away, or automatically
declared erroneous. They must be:

1. retained in raw form;
2. excluded from scientific interpretation while under review;
3. checked for unit, decimal, body-mass, date, source, modality, endpoint,
   duplication, and algorithm changes;
4. reconciled against the original report or source; and
5. accepted with an extreme-value flag, superseded by a documented correction, or
   rejected with a reason.

### 8.8 Duplicate policy

- A stable originating sample identifier, source identifier, value, endpoint, and
  timestamp define an exact re-import duplicate.
- An exact re-import must not create a second active scientific measurement.
- The duplicate event and import provenance may be logged for audit.
- Two devices estimating the same workout are not duplicates; they are distinct
  estimates with shared-event linkage.
- A clinical report transcribed through two channels is a probable duplicate and
  should be reconciled to one source event without discarding either provenance
  trail.
- A source correction is not a duplicate. It supersedes the earlier version through
  an immutable link.

### 8.9 Historical storage and corrections

- Measurement history is append-only at the scientific record level.
- Raw source records must remain immutable.
- Corrections, changed metadata, and manufacturer recalibrations create new
  versions linked to the prior record.
- The currently active version must be identifiable without erasing the former
  value.
- Algorithm version, device software version, source application version, and
  confidence-policy version should be retained when available.
- Historical wearable values must not be recomputed under a new algorithm unless
  the source itself supplies a revision; a revision must be stored as such.

### 8.10 Multiple measurements on the same day

- Preserve every valid measurement; do not average by default.
- Record whether measurements came from the same physiological event.
- Prefer the highest-confidence valid source only when selecting a representative
  result for the same event; never delete the others.
- Separate tests or workouts on the same day remain separate observations.
- A daily date is not a sufficient basis for claiming equivalence.
- Longitudinal comparison should select comparable modality, endpoint, method, and
  source rather than whichever number is highest.

### 8.11 Source precedence

For the same measurement event, scientific precedence is:

1. verified Gold Standard direct VO₂max;
2. verified Clinical Grade direct VO₂peak;
3. verified clinical exercise-based estimate;
4. independently validated exercise-based wearable estimate;
5. non-exercise or resting estimate;
6. provisional manual transcription; and
7. Unsupported data, which has no interpretive precedence.

Precedence resolves representation of the same event. It does not mean that an old
laboratory test describes current fitness better than a newer estimate, and it does
not authorize cross-source trend construction.

### 8.12 Timestamp and time-zone requirements

Every accepted measurement must include:

- test or qualifying-activity start time and end time when supplied;
- the source's effective measurement timestamp;
- source creation or update timestamp when supplied;
- ingestion timestamp;
- original UTC offset and named time zone when available; and
- normalized UTC time without discarding local time.

Additional rules:

- The local calendar day is determined using the source event's local offset, not
  the ingestion location.
- Travel and offset changes must not rewrite the original local date.
- If only a date is known, retain date-only precision and do not invent a time.
- An unknown time zone must be explicitly marked unknown; it must not default
  silently to the user's current zone.
- For a wearable estimate derived from a rolling window, distinguish the estimate
  timestamp from the contributing activity window when the source exposes both.
- Revised Apple or other vendor estimates require both original and revision
  timestamps.

## 9. Minimum provenance standard

An accepted record must preserve, where applicable:

- person and record identifiers;
- raw value, raw unit, normalized value, and canonical unit;
- VO₂max versus VO₂peak;
- direct measurement versus estimate;
- measurement principle and test type;
- treadmill, cycle, running, walking, hiking, step, non-exercise, or other modality;
- source organization, application, device manufacturer, model, and identifier;
- software, firmware, and algorithm version when exposed;
- clinical facility, clinician, or laboratory report identity when applicable;
- test protocol, metabolic cart, averaging method, calibration and quality status;
- maximality evidence, symptom limitation, termination reason, and verification
  phase when applicable;
- body mass used for normalization and its measurement time;
- relevant heart-rate-limiting medication metadata when supplied;
- event, creation, revision, ingestion, local, and UTC timestamps;
- source sample identifier and related-workout identifier;
- original report or source payload reference and integrity evidence;
- confidence label, registry version, and classification reason; and
- correction, duplicate, rejection, and supersession history.

Absence of optional device metadata lowers confidence only when the registry says
it is required. Absence of method, endpoint, unit, provenance, or event date blocks
scientific interpretation.

## 10. Production policies

### 10.1 Accepted-source policy

An accepted source must have a scientifically identifiable method, unambiguous
unit, event date, endpoint, estimate status, and sufficient provenance to assign a
registry classification. Acceptance never implies interchangeability.

### 10.2 Rejected-source policy

Reject from scientific interpretation:

- untraceable numbers;
- user or clinician estimates without an underlying method;
- Apple Health samples with no resolvable origin or test type;
- inferred VO₂max from generic fitness scores, calories, steps, heart rate alone,
  METs, pace, power, or exercise time unless a separately approved method exists;
- screenshots without verifiable source identity or report context;
- values presented in an incompatible unit;
- synthetic, demo, or test data in a person's scientific history; and
- any source claiming clinical equivalence without adequate evidence.

### 10.3 Confidence-label policy

- Every active value must carry exactly one current confidence label.
- The label must be assigned from method, provenance, model/version evidence, and
  population fit—not brand reputation.
- The original classification at ingestion and every later reclassification must
  remain auditable.
- A later evidence review may upgrade or downgrade a source without rewriting what
  the source originally reported.
- Clinical Grade and Gold Standard require human-test and quality documentation;
  an API flag alone is insufficient.

### 10.4 Data-integrity policy

- Preserve raw source data and normalized scientific data separately.
- Never overwrite raw values, units, timestamps, source identifiers, or reports.
- Validate source-specific ranges and metadata.
- Quarantine ambiguity rather than guessing.
- Link corrections and duplicates explicitly.
- Detect impossible source combinations, including Apple Watch values outside its
  supported range or “direct” tests with no gas-analysis evidence.

### 10.5 Auditability policy

For any interpreted result, an auditor must be able to determine:

- who or what created it;
- when and in which time zone it was measured;
- whether it was measured or estimated;
- the modality, endpoint, and unit;
- the evidence used to assign confidence;
- all transformations and unit normalizations;
- whether it was corrected, duplicated, revised, or superseded; and
- which policy and registry version authorized its use.

### 10.6 Future-extensibility policy

A new device, algorithm, or test method is not admitted by analogy to a brand or
sensor. Admission requires:

1. a defined measurement principle and intended population;
2. direct criterion comparison against quality-controlled CPET;
3. independent validation, preferably by more than one group;
4. bias, random error, limits of agreement, failure rate, and test-retest evidence;
5. subgroup assessment by age, sex, fitness, body size, skin tone where relevant,
   medication, disease, and activity type;
6. known model, firmware, and algorithm versions;
7. longitudinal stability and update behavior;
8. complete provenance and data-integrity support; and
9. a documented Scientific Governance decision and registry version change.

Correlation alone is insufficient. Group-level absence of mean bias is
insufficient. Manufacturer-only validation normally supports no more than Research
Only status.

## 11. Measurement Governance

### 11.1 Ownership and review

The Vitalspan Scientific Governance function owns this standard and the Source
Classification Registry. The registry must be reviewed when:

- a manufacturer materially changes an algorithm or supported range;
- a new device generation supplies VO₂max;
- new independent validation materially changes error estimates;
- professional CPET standards change;
- a source changes metadata, revision, or export behavior; or
- an audit identifies systematic provenance or classification failure.

Absent a triggering event, a formal evidence review should occur at least
annually. Review frequency is a governance control, not a claim that physiology
changes annually.

### 11.2 Evidence requirements

Evidence decisions should prioritize professional standards, systematic reviews,
independent criterion validation, and population-relevant studies. Manufacturer
documentation is authoritative for operating behavior, supported ranges, sensors,
and update rules, but not by itself for independent clinical validity.

### 11.3 Exceptions

Exceptions must identify the record, requested use, scientific rationale,
approver, effective period, and rollback condition. An exception cannot relabel an
estimate as measured or Unsupported data as clinical truth.

### 11.4 Incident handling

Source algorithm changes, silent historical revisions, systematic unit errors,
duplicate inflation, incorrect modality, or measured-versus-estimated
misclassification are scientific data incidents. Affected values must be
quarantined, traced, corrected through versioned records, and reclassified before
reuse.

## 12. Guideline summary

| Organization | Measurement-standard position | Vitalspan consequence |
| --- | --- | --- |
| [American College of Sports Medicine](https://acsm.org/education-resources/books/guidelines-exercise-testing-prescription/) | ACSM's current exercise-testing and prescription guidelines provide evidence-based standards for testing healthy and clinical populations and distinguish measured exercise physiology from metabolic estimates. | Use standardized exercise-test methods; do not call workload-derived capacity directly measured VO₂max. |
| [American Heart Association](https://professional.heart.org/en/science-news/2016-focused-update-clinical-recommendations-for-cardiopulmonary-exercise-testing-data-assessment/commentary) | CPET combines exercise testing with simultaneous gas exchange and is more precise than estimating VO₂ from attained work rate. | Direct gas analysis and exercise-only estimates require different classes. |
| [European Society of Cardiology / EACPR](https://esc365.escardio.org/journal/30954) | CPET is an established standard for functional evaluation in selected cardiac patients and must be performed and interpreted in clinical context. | Accept valid clinical CPET; never reduce the complete clinical test to an unqualified consumer fitness number. |
| [American Thoracic Society / American College of Chest Physicians](https://pubmed.ncbi.nlm.nih.gov/12524257/) | The joint statement defines performance, quality control, reproducibility, reference values, and integrative interpretation of CPET. | Forms the core direct-test acceptance and audit requirements. |
| [European Respiratory Society](https://publications.ersnet.org/content/errev/28/154/180101) | ERS standards require protocol, equipment, calibration, symptoms, endpoint, and gas-exchange context and recognize VO₂peak as a practical clinical endpoint. | Preserve modality, protocol, quality, termination, and VO₂peak-versus-VO₂max status. |

Across organizations, the scientific consensus is consistent: direct gas-exchange
testing is the reference framework; estimated exercise capacity remains useful but
is not measurement-equivalent; and full clinical interpretation requires more than
an isolated VO₂ value.

## 13. Evidence Registry

| Evidence | Type and population | Principal finding | Standard implication | Evidence quality |
| --- | --- | --- | --- | --- |
| [ATS/ACCP CPET statement](https://pubmed.ncbi.nlm.nih.gov/12524257/) | Professional technical statement | Defines CPET performance, variables, quality, interpretation, reproducibility, and reference considerations | Foundation for direct-test acceptance | High authority; older but foundational |
| [AHA CPET guidance](https://professional.heart.org/en/science-news/2016-focused-update-clinical-recommendations-for-cardiopulmonary-exercise-testing-data-assessment/commentary) | Professional scientific guidance | CPET adds simultaneous gas exchange to exercise testing and is more precise than workload-based estimates | Direct and estimated tests must be separated | High authority |
| [ESC/EACPR CPET standards](https://esc365.escardio.org/journal/30954) | Professional standard | Supports CPET in clinical functional evaluation | Clinical Grade recognition | High authority |
| [ERS CPET standardization](https://publications.ersnet.org/content/errev/28/154/180101) | Professional technical standard | Requires protocol, quality, endpoint, symptoms, and integrated interpretation | VO₂peak/max and context must be retained | High authority |
| [ERS 2026 equipment standard](https://pubmed.ncbi.nlm.nih.gov/41786497/) | Technical standard and evidence synthesis | Commercial system accuracy varies; calibration and quality assurance are essential | Laboratory label alone is insufficient | High authority, current |
| [ERS 2026 reference report](https://publications.ersnet.org/index.php/content/erj/early/2026/02/26/1399300302463-2025) | Multisite healthy data, 5,956 people aged 6–83 | Site, cart, protocol, geography, and averaging heterogeneity prevented robust global equations | Preserve method details; avoid universal reference assumptions | High relevance; limitations directly informative |
| [Verification-phase review](https://pubmed.ncbi.nlm.nih.gov/33596256/) | Systematic review/meta-analysis, 80 studies, 1,680 participants | Verification and incremental-test values usually similar; universal necessity not established | Verification useful but not an absolute Gold Standard gate | Moderate-to-high |
| [INTERLIVE wearable review](https://pubmed.ncbi.nlm.nih.gov/35072942/) | Systematic review/meta-analysis, 14 studies | Exercise estimates had low mean bias but wide individual error; resting estimates were less reliable | Wearables are estimates and not clinically interchangeable | High for class-level conclusion |
| [Garmin fēnix 6 validation](https://pubmed.ncbi.nlm.nih.gov/39797066/) | Independent criterion study, 19 adults | Mean absolute percentage error 7.05%; promising but small sample | Supports Moderate, not Clinical Grade | Low-to-moderate due sample size |
| [Garmin Forerunner 245 validation](https://pubmed.ncbi.nlm.nih.gov/40770433/) | Independent criterion study, 35 athletes | Underestimation and fitness-dependent error, worse in highly trained participants | Requires population and model caveats | Moderate for that model/population |
| [Polar Fitness Test validation](https://pubmed.ncbi.nlm.nih.gov/41012888/) | Independent CPET comparison, 24 adults with cardiovascular risk factors | 13.7% mean absolute percentage error and wide individual agreement | Resting Polar test is Low Confidence | Moderate relevance; small sample |
| [Fitbit Charge 2 validation](https://pubmed.ncbi.nlm.nih.gov/31107835/) | Independent criterion study, 65 healthy adults | Small group bias and under-10% mean absolute percentage error; more clinical research needed | Supported GPS-running estimate may be Moderate | Moderate for that model only |
| [Second Fitbit Charge 2 study](https://pubmed.ncbi.nlm.nih.gov/31620466/) | Independent criterion study | Mean absolute percentage error approximately 10.2% | Confirms material individual estimation error | Moderate for that model only |
| [Apple validation paper](https://www.apple.com/in/healthcare/docs/site/Using_Apple_Watch_to_Estimate_Cardio_Fitness_with_VO2_max.pdf) | Manufacturer development and validation; held-out sample 221 | Good reliability against a projected submaximal reference, with nontrivial error | Supports estimated, not direct status | Moderate; manufacturer and projected reference |
| [Independent Apple study](https://pubmed.ncbi.nlm.nih.gov/39083800/) | Criterion study, 19 adults | Larger error and only moderate-to-poor agreement | Excludes clinical interchangeability | Low-to-moderate due small sample |
| [Independent Apple clinical study](https://pmc.ncbi.nlm.nih.gov/articles/PMC12080799/) | Criterion study, 30 adults | Systematic underestimation and wide agreement | Supports Moderate Confidence only | Moderate relevance; small sample |
| [COROS EvoLab documentation](https://support.coros.com/hc/en-us/articles/38180411247892-EvoLab) | Manufacturer operating description | Running estimate uses recent outdoor heart rate and pace; independent error not supplied | Research Only pending independent validation | Low for validity; authoritative for behavior |
| [WHOOP VO₂max documentation](https://support.whoop.com/s/article/VO2-Max?language=en_US) | Manufacturer operating description | Weekly proprietary passive and GPS-augmented estimate for WHOOP 5.0/MG | Research Only pending independent replication | Low for validity; authoritative for behavior |
| [Apple HealthKit test-type documentation](https://developer.apple.com/documentation/healthkit/hkvo2maxtesttype) | Platform specification | Distinguishes maximal, submaximal, non-exercise, and step-test values | HealthKit origin and method metadata are mandatory | High authority for platform behavior |

## 14. Validation summary

### Established

- Direct gas-exchange CPET is the criterion measurement framework.
- Treadmill and cycle ergometry can both support Gold Standard results when direct
  gas analysis, quality control, and maximality evidence are present.
- Symptom-limited direct clinical CPET validly measures VO₂peak even when a maximum
  is not proven.
- Workload-only tests and all evaluated consumer wearables are estimates.
- Exercise-based wearable methods generally outperform resting-only methods at
  group level.
- Individual wearable error remains too large and context-dependent for clinical
  equivalence.
- Modality, endpoint, protocol, population, and provenance materially affect
  interpretation.

### Not established

- Numerical interchangeability among CPET, Apple, Garmin, Polar, COROS, Fitbit,
  and WHOOP.
- A universal wearable error applicable to every model, algorithm, and person.
- A universal minimum change that represents true physiological improvement.
- Clinical validity of an Apple Health value based only on the container or its
  declared test-type metadata.
- Adequate independent current-version validation for COROS EvoLab or WHOOP
  VO₂max.
- Clinical truth from manual entry without verification.

## 15. Clinical limitations and implementation risks

The principal scientific risks are:

- calling VO₂peak VO₂max;
- treating a laboratory workload estimate as direct measurement;
- treating Apple Health as the originating source;
- promoting a consumer estimate to clinical status;
- merging treadmill, cycle, running, walking, or resting estimates;
- ignoring heart-rate-limiting medication or altered chronotropic response;
- using current profile weight to reinterpret an older absolute result;
- constructing trends across device or algorithm changes;
- using manufacturer mean accuracy to imply individual accuracy;
- silently accepting historical recalibration;
- averaging same-day values from different methods;
- converting METs, watts, duration, percentiles, or fitness age into measured
  VO₂max;
- imposing universal physiological or reference cutoffs;
- interpreting an outlier as disease without clinical assessment; and
- retaining more decimal precision than the method supports.

These risks are controlled by provenance, categorical source confidence,
modality-specific history, immutable versioning, source-range validation, and the
prohibition on clinical equivalence for estimates.

## 16. Clinical readiness assessment

### Production-ready uses

- Store and identify direct VO₂max and VO₂peak with full method context.
- Preserve Gold Standard and Clinical Grade reports.
- Store approved wearable values as explicitly estimated observations.
- Support within-source, within-modality historical context when algorithm
  continuity is known.
- Apply source-specific validation, plausibility, duplicate, and audit policies.
- Maintain Research Only data separately for future validation.

### Prohibited or Research Only uses

- Diagnose disease or exclude disease from an isolated value.
- Replace CPET with Apple Watch or another wearable.
- Use COROS or WHOOP estimates in production scientific interpretation under the
  current evidence base.
- Treat unverified Apple Health, clinician, or user entries as valid measurements.
- Blend sources into one unqualified trend.
- Infer a laboratory-equivalent value from a wearable.
- Convert VO₂max to biological age, fitness age, lifespan, mortality probability,
  or a score.
- Create a clinical alert or treatment recommendation from this standard.

## 17. Production Recommendation

### Final status: Production Ready

The Vitalspan VO₂max Measurement Standard is **Production Ready** with
source-stratified acceptance.

Production readiness applies to the measurement-governance framework, Gold
Standard and Clinical Grade direct testing, and explicitly labelled estimates
authorized by the registry. It does not confer production-grade scientific status
on every vendor. Under the evidence current on 17 July 2026:

- direct maximal CPET is Gold Standard;
- valid symptom-limited direct CPET is Clinical Grade VO₂peak;
- Apple Watch, Garmin, Polar Running Index, and supported Fitbit/Google Health GPS-
  running estimates are usable only as non-clinical estimates with the stated
  confidence;
- Polar's resting Fitness Test is supplemental Low Confidence context;
- COROS EvoLab and WHOOP VO₂max remain Research Only;
- unverified Apple Health, clinician, and user values are Unsupported; and
- no wearable or manual entry may replace laboratory testing or be presented as
  clinical truth.

This decision supplies the official scientific rules for acceptance,
classification, storage, validation, and interpretation. It contains no
calculation, formula, score, production code, architecture change, or UI design.
