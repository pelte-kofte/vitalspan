# Phase 6.0A — Functional Capacity scientific evidence review

| Document field | Value |
| --- | --- |
| Document type | Official scientific evidence dossier |
| Scientific platform | Vitalspan |
| Review date | 18 July 2026 |
| Review type | Rapid structured evidence review |
| Scope | Scientific validity and clinical readiness only |
| Final production recommendation | **Production Ready** |

## 1. Decision

Functional Capacity is sufficiently established to become a standalone Vitalspan
scientific domain. The domain is scientifically **Production Ready**, provided it
is defined narrowly as objective performance on validated physical tasks and each
result remains tied to the exact test, protocol, population, and date.

This decision does not authorize every candidate test or every interpretation.

- Hand Grip Strength, standardized usual-pace Gait Speed, the Four-Meter Walk,
  Five Times Sit-to-Stand, the 30-Second Chair Stand, Timed Up and Go, the Short
  Physical Performance Battery, and the Six-Minute Walk Test have sufficient
  evidence for a governed production test registry.
- The Four-Meter Walk is an authorized protocol for Gait Speed, not a separate
  physiological domain.
- Timed Up and Go is suitable as a mobility measure, but not as a standalone
  falls prediction or diagnosis.
- The Six-Minute Walk Test measures submaximal functional exercise capacity. It
  is not VO₂max, does not identify the mechanism of exercise limitation, and
  cannot replace cardiopulmonary exercise testing.
- One-Leg Balance has relevant construct and cohort evidence, but protocol
  heterogeneity, safety constraints, ceiling effects, and insufficiently mature
  universal interpretation make it **Research Only** for this platform phase.
- A published clinical battery such as SPPB may retain its official instrument
  result. This review does not create a Vitalspan composite, modify an existing
  instrument, or authorize cross-test aggregation.
- No test result may be translated into biological age, fitness age, remaining
  lifespan, an individual mortality probability, frailty diagnosis, or a global
  health score.

The Production Ready decision is a scientific-domain decision. It is not an
implementation recommendation and does not authorize calculations, production
code, architecture changes, UI, or scoring.

## 2. Primary questions

| Question | Evidence-based answer |
| --- | --- |
| What is Functional Capacity? | For Vitalspan, it is the presently observed ability to perform standardized physical tasks requiring one or more of muscular strength, transfers, locomotion, dynamic mobility, balance, and submaximal walking endurance. It is a performance construct, not an age estimate or diagnosis. |
| How is it distinguished from Biological Age? | Biological-age models infer an age-related latent state from biomarkers or other inputs. Functional Capacity directly records task performance at a particular time. It must remain in the test's native meaning and must not be converted to “years.” |
| How is it distinguished from VO₂max? | VO₂max is maximal integrated aerobic physiology measured or estimated during exercise. Functional Capacity is broader in movement domains and usually submaximal. Strength, rising from a chair, short-distance walking, turning, and balance can be impaired despite preserved VO₂max, and the reverse can also occur. |
| What outcomes does it predict? | Lower performance is associated with all-cause mortality, cardiovascular mortality in selected populations, future disability, mobility loss, falls or fall-related vulnerability, frailty, hospitalization, institutionalization, reduced independence, and worse quality of life. The strength and specificity of prediction differ materially by test and population. |
| Is it an independent longevity domain? | **Yes as a scientific construct and prognostic domain.** Many associations persist after age, sex, body size, disease, and other covariate adjustment. This does not prove a separate causal pathway, guarantee incremental prediction beyond every Vitalspan domain, or justify combining tests into a longevity score. |

## 3. Scope and terminology

### 3.1 Official Vitalspan definition

**Functional Capacity is an individual's observed ability, on a stated date and
under a standardized protocol, to complete a defined physical-performance task
that samples strength, transfer ability, locomotion, mobility, balance, or
submaximal walking endurance.**

The result describes performance under the test conditions. It does not by itself
state why performance was high or low. Musculoskeletal disease, neurological
function, cardiopulmonary reserve, pain, body size, cognition, sensory function,
medication, motivation, fatigue, environment, assistive devices, and test
familiarity may all contribute.

### 3.2 Related terms that must remain distinct

| Term | Relationship to this domain | Required boundary |
| --- | --- | --- |
| WHO functional ability | The ability to be and do what a person values, arising from intrinsic capacity, the environment, and their interaction | Broader than laboratory or clinic performance. Vitalspan test results must not be presented as the whole of functional ability. |
| WHO intrinsic capacity | The total physical and mental capacities a person can draw upon | Broader than physical performance and includes cognition, sensory capacity, psychological capacity, vitality, and locomotion. |
| Locomotor capacity | The physical capacity to move, supported by joints, bones, reflexes, muscle, and related systems | The closest WHO construct to this domain, but Functional Capacity also includes grip and field walking endurance. |
| Physical capability | An epidemiological term commonly used for objective grip, walking, chair-rise, and balance performance | Substantially aligned with the Vitalspan domain. |
| Functional status | Often describes ability in daily activities, sometimes by self-report | Related outcome, not interchangeable with standardized observed performance. |
| Disability | Difficulty or dependence in life activities, shaped by health and environment | A possible outcome or contextual condition, not a synonym for a test result. |
| Frailty | A multidimensional state of reduced reserve and vulnerability to stressors | Some functional tests are frailty components or markers, but none alone establishes frailty. |
| Sarcopenia | A muscle disease characterized through muscle strength, quantity or quality, and physical performance under a diagnostic framework | Grip, chair stand, gait, or SPPB may contribute to a clinical framework, but the test alone does not diagnose sarcopenia. |
| Cardiorespiratory fitness | Capacity of the circulatory, respiratory, blood, vascular, and muscle systems to support aerobic work | Represented most directly by VO₂max or VO₂peak; it is not interchangeable with functional task performance. |
| Physical activity | Behavior involving bodily movement | An exposure and modifiable determinant, not a performance measurement. |

WHO defines healthy ageing through functional ability and explicitly describes it
as the interaction of intrinsic capacity with relevant environmental
characteristics. Its locomotor-capacity material identifies gait speed, balance,
and chair-rise testing as physical-performance measures
([WHO healthy ageing framework](https://www.who.int/news-room/questions-and-answers/item/healthy-ageing-and-functional-ability);
[WHO Decade baseline report](https://iris.who.int/bitstream/handle/10665/338677/9789240017900-eng.pdf)).
Vitalspan therefore uses the more limited term **Functional Capacity** for the
objective test domain and does not claim to measure the complete WHO construct.

### 3.3 Semantic warning

In cardiology and perioperative medicine, “functional capacity” is sometimes used
more narrowly for exercise capacity, metabolic equivalents, self-reported exercise
tolerance, or VO₂peak. In gerontology it may refer to mobility, strength, balance,
or daily function. Every Vitalspan result must therefore name the actual test and
construct. The label “Functional Capacity” alone is scientifically incomplete.

## 4. Review method

### 4.1 Review design

This document is a **rapid structured evidence review**, updated through 18 July
2026. Searches covered PubMed, PubMed Central, official organization sites,
guideline and technical-standard pages, and reference chaining from consensus
documents, systematic reviews, and landmark cohorts.

Priority searches combined the concepts of physical performance, physical
capability, functional capacity, ageing, mortality, disability, falls,
hospitalization, frailty, quality of life, independence, and the named tests.
Organization-specific searches covered WHO, ESC, AHA, ACSM, NIA, and ICFSR.

This was not a prospectively registered PRISMA review, and it does not claim
exhaustive title-level screening of every disease-specific validation study. That
limitation is material. The dossier is suitable for domain selection and test
governance, not for a claim that all literature has been enumerated.

### 4.2 Evidence hierarchy

Greater weight was given, in order, to:

1. International definitions, guidelines, scientific statements, consensus
   standards, and test technical standards.
2. Systematic reviews, meta-analyses, and individual-participant pooled analyses.
3. Large prospective cohorts with adjusted clinical outcomes.
4. Randomized trials addressing preservation of mobility or functional outcomes.
5. Original validation, reliability, and reproducibility studies.
6. Narrative reviews and operational resources, used for adoption and feasibility
   rather than causal or prognostic conclusions.

### 4.3 Evidence-quality language

- **High:** replicated evidence from multiple large cohorts or syntheses, supported
  by a mature standardized instrument or international standard.
- **Moderate:** generally consistent validity or outcome evidence with important
  protocol, population, transportability, or observational limitations.
- **Low:** small, heterogeneous, narrow, poorly standardized, or insufficiently
  replicated evidence for general individual interpretation.

Evidence quality is separate from test reliability. A stopwatch test may be highly
reliable while having poor specificity for a clinical outcome.

### 4.4 Scientific-readiness labels

| Label | Meaning in this review |
| --- | --- |
| **Production Eligible** | The construct, standardized protocol, measurement properties, and clinical adoption are sufficient for future governed use. This phase does not authorize implementation. |
| **Conditionally Production Eligible** | Scientifically usable only in the stated populations and protocol context, with limitations prominent and no unsupported clinical inference. |
| **Clinical Specialty** | Established within defined clinical or rehabilitation settings, but not authorized as a general-population platform test without a later specialty standard. |
| **Research Only** | Promising or useful in research, but standardization, validation, safety, or interpretation is insufficient for governed general production use. |
| **Excluded from this domain** | The measure may be useful elsewhere but does not meet the objective physical-performance definition or is unvalidated for the claimed purpose. |

These labels classify evidence and intended scientific use. They do not rank a
person and are not a scoring system.

## 5. Physiological and clinical construct

Functional performance is an integrated output of multiple systems:

- central and peripheral nervous-system planning, coordination, reaction, and
  motor control;
- vestibular, visual, and somatosensory information;
- muscle mass, force, power, endurance, and neuromuscular activation;
- joint mobility, skeletal integrity, pain, and biomechanics;
- cardiac, pulmonary, vascular, hematologic, and metabolic reserve;
- cognition, attention, confidence, and understanding of instructions; and
- task conditions, footwear, walking aids, surface, chair dimensions, course
  layout, and examiner behavior.

This explains both the prognostic value and the lack of diagnostic specificity.
Poor performance can reveal low multisystem reserve before a person reports
disability, but it cannot identify a single mechanism.

The American Heart Association scientific statement on older adults with
cardiovascular disease treats functional capacity as clinically meaningful across
aerobic, strength, balance, and cognitive realms and highlights SPPB, gait speed,
and the Six-Minute Walk Test as feasible measures
([AHA scientific statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC7252210/)).
This supports the multidomain performance construct while also illustrating that
the exact meaning depends on the selected test.

## 6. Domain distinctions

### 6.1 Functional Capacity versus Biological Age

Functional Capacity is directly observed and time-specific. Biological age is a
model-dependent abstraction inferred from biomarkers, function, or both. A
functional test may correlate with chronological age and with biological-age
models, but correlation does not make the result an age.

Required policy:

- preserve native test outputs and test identity;
- do not express performance as age acceleration, age deceleration, or years;
- do not use age-equivalent norms to name a “functional age” or “fitness age”;
- do not modify Clinical PhenoAge; and
- do not imply that a change in performance reverses biological ageing.

### 6.2 Functional Capacity versus VO₂max

VO₂max is a maximal aerobic-capacity endpoint. Functional tests answer different
questions:

- Grip tests upper-limb isometric force.
- Chair tests sample transfer ability and lower-limb functional strength or power.
- Short gait tests sample usual locomotion.
- TUG adds transitions and turning.
- Balance tests sample postural control.
- SPPB samples lower-extremity performance through a published battery.
- 6MWT samples self-paced, submaximal functional walking capacity.

The ATS states that 6MWT reflects integrated submaximal functional exercise and
daily activity better than a maximal test in some contexts, but does not determine
peak oxygen uptake or the cause of exercise limitation and is complementary to,
not a replacement for, CPET
([ATS 6MWT statement](https://pubmed.ncbi.nlm.nih.gov/12091180/)).

Overlap with VO₂max is expected because aerobic reserve affects sustained walking.
That overlap does not justify estimating VO₂max from a Functional Capacity result,
substituting a walk test for CPET, or merging the domains.

### 6.3 Functional Capacity versus Frailty

ICFSR defines physical frailty as a clinical vulnerability construct and recommends
validated setting-appropriate frailty instruments. The Fried phenotype includes
weakness and slowness, but also weight loss, exhaustion, and low activity
([ICFSR physical-frailty guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC6800406/)).
ESC guidance similarly treats frailty as multidimensional and notes that physical
function appears within, but does not exhaust, frailty assessment
([ESC non-cardiac-surgery guideline](https://academic.oup.com/eurheartj/article/43/39/3826/6675076)).

Required policy:

- a low grip, gait, chair, TUG, 6MWT, or balance result is not a frailty diagnosis;
- SPPB can be used within external frailty pathways only when that pathway is
  separately authorized;
- no Functional Capacity result may silently trigger a frailty label; and
- Functional Capacity remains a performance domain even when a test is also used
  in sarcopenia or frailty practice.

### 6.4 Is the domain independent?

**Construct independence is high.** The domain measures observed task performance,
which neither blood biomarkers nor maximal aerobic physiology fully capture.

**Prognostic independence is moderate to high, depending on test and population.**
Grip and gait associations commonly persist after age, sex, body size, disease, and
other adjustment. SPPB predicts outcomes in multivariable models. Disease-specific
6MWT and cardiac-surgery gait data also add prognostic information.

**Causal independence is unproven.** Functional performance may be a mediator,
consequence, or marker of disease, activity, reserve, social conditions, and
environment. No reviewed evidence establishes a single independent biological
pathway from a test result to lifespan.

**Incremental independence from every Vitalspan domain is not established.** The
literature does not validate a universal combined model containing Clinical
PhenoAge, direct VO₂max, cardiometabolic measures, recovery measures, and all
functional tests. Domain independence must not be misrepresented as proven added
predictive value in an untested composite.

## 7. International organization and guideline review

| Organization | Relevant position | Scientific meaning for Vitalspan | Important limitation |
| --- | --- | --- | --- |
| **WHO** | Healthy ageing is maintenance of functional ability; functional ability reflects intrinsic capacity, environment, and their interaction. Locomotor-capacity materials use gait, chair rise, and balance. ICOPE uses a five-rise chair task to screen limited mobility. | Objective performance belongs within the physical or locomotor component of healthy ageing. | A performance test does not measure the full WHO concept, wellbeing, environment, or all intrinsic-capacity domains. ([WHO framework](https://www.who.int/news-room/questions-and-answers/item/healthy-ageing-and-functional-ability); [WHO ICOPE training](https://www.who.int/tools/icope-training-programme)) |
| **AHA** | Functional capacity should be a principal outcome in older adults with CVD; the statement reviews aerobic capacity, strength, balance, and cognition and describes SPPB, gait speed, and 6MWT. | Strong recognition that function is clinically important in its own right, not merely a surrogate for disease biomarkers. | Cardiovascular populations and clinical decisions require disease-specific context. ([AHA statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC7252210/)) |
| **ESC / EAPC** | ESC guidance recognizes functional status and frailty in older and cardiovascular populations. Recent ESC PAD guidance recommends 6MWT for functional walking performance and SPPB as an alternative assessment; EACTS/EAPC consensus supports gait speed and SPPB for selected cardiac procedural prognoses. | Confirms adoption of objective walking and lower-extremity performance in cardiovascular care. | Findings from PAD, cardiac surgery, or TAVI must not be generalized to healthy adults or used as universal cutoffs. ([2024 ESC PAD guideline](https://academic.oup.com/eurheartj/article/45/36/3538/7738955); [EACTS/EAPC consensus](https://academic.oup.com/eurjpc/article/31/2/146/7291991)) |
| **ACSM** | Its older-adult position stand concludes that regular activity and exercise can improve functional capacity and recommends aerobic, strengthening, flexibility, and balance-related activity. ACSM maintains older-adult exercise and neuromotor-fitness positions as evidence-based standards. | Supports the multidimensional, modifiable nature of physical function and the separation of aerobic, muscular, and neuromotor components. | Exercise-prescription guidance is not a normative interpretation standard for any one test. ([ACSM position stand](https://pubmed.ncbi.nlm.nih.gov/19516148/); [ACSM position-stand registry](https://acsm.org/education-resources/pronouncements-scientific-communications/position-stands/)) |
| **NIA** | NIA identifies SPPB as an objective lower-extremity function assessment and provides official administration and safety material. The NIA-supported LIFE trial used SPPB eligibility and inability to complete a 400-meter walk as its major mobility-disability outcome. | Strong validation and adoption for SPPB and long-distance walking as mobility outcomes in older adults. | LIFE studied sedentary adults aged 70–89 at elevated disability risk; causal findings are not universal to all ages or every test. ([NIA SPPB resource](https://www.nia.nih.gov/research/labs/leps/short-physical-performance-battery-sppb); [NIA LIFE resource](https://www.nia.nih.gov/research/resource/lifestyle-interventions-and-independence-elders-life)) |
| **ICFSR** | Recommends validated context-specific screening for frailty and recognizes grip and walking speed in physical-frailty constructs; its sarcopenia guidance recognizes gait speed and other performance measures. | Confirms clinical relevance of weakness and slowness, while requiring a broader diagnostic framework. | Frailty and sarcopenia recommendations must not be repurposed as a standalone longevity classification. ([ICFSR frailty guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC6800406/); [ICFSR sarcopenia guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC12280515/)) |
| **ERS / ATS** | Provides detailed standards for 6MWT and other field walking tests. In chronic respiratory disease, 6MWT is valid, reliable, responsive, and prognostic when standardized. | Establishes the strongest technical and clinical standard for 6MWT. | Standards are population-specific, demonstrate learning effects, and explicitly warn that methodology changes results. ([ERS/ATS technical standard](https://www.thoracic.org/statements/resources/copd/FWT-Tech-Std.pdf)) |

International recognition is therefore strong, but no organization endorses a
single universal “Functional Capacity score.” The organizations recognize specific
constructs, tests, or clinical pathways.

## 8. Candidate Test Registry

| Test | Primary construct | Evidence quality | Clinical adoption | Scientific readiness | Authorized scientific claim |
| --- | --- | --- | --- | --- | --- |
| Hand Grip Strength | Upper-limb isometric strength; general muscle-function marker | **High** for reliability and all-cause mortality association; moderate-to-high for disability and CV outcomes | High in geriatrics, sarcopenia, rehabilitation, epidemiology | **Production Eligible** | Standardized grip strength on the test date |
| Usual Gait Speed | Habitual locomotor performance | **High** for reliability, disability, and mortality association | Very high in geriatrics and rehabilitation; increasing in cardiology | **Production Eligible** | Usual walking performance under the stated course protocol |
| Four-Meter Walk Test | A standardized short-course instance of gait speed | **High** in older adults and SPPB contexts | High | **Production Eligible as Gait Speed protocol** | Four-meter usual-pace gait result; not a separate domain |
| 30-Second Chair Stand | Repeated transfer performance and lower-limb functional strength/endurance | **Moderate** overall; high reliability in studied older adults | High in older-adult fitness and CDC falls pathways | **Production Eligible** | Repetitions completed under the official protocol |
| Five Times Sit-to-Stand | Timed transfer performance, lower-limb functional strength, balance control | **Moderate-to-high** for reliability; moderate for outcome interpretation | High in geriatrics, sarcopenia, rehabilitation, and disease cohorts | **Production Eligible** | Completion time and protocol-specific task result |
| Timed Up and Go | Functional mobility combining rise, gait, turning, and sitting | **High** for reliability in many populations; **moderate** for construct validity; **low-to-moderate** for standalone future-fall prediction | Very high in geriatrics, rehabilitation, and falls assessment | **Conditionally Production Eligible** | Mobility performance only; no standalone falls classification |
| SPPB | Published lower-extremity performance battery | **High** for validity, reliability, disability, institutionalization, and mortality prognosis in older adults | Very high in geriatrics, trials, sarcopenia, and cardiovascular research | **Production Eligible** | Official component results and unmodified published instrument result |
| One-Leg Balance | Static postural control | **Moderate** for construct; moderate observational mortality/falls association; limited standardization | Moderate | **Research Only** | Research observation only; no longevity or falls label |
| Six-Minute Walk Test | Self-paced submaximal functional walking capacity | **High** in chronic respiratory and selected cardiovascular populations; moderate for general-population interpretation | Very high in pulmonary, cardiac, vascular, and rehabilitation settings | **Conditionally Production Eligible** | Standardized six-minute walk distance and test context; not VO₂max |
| 400-Meter Walk / Long-Distance Corridor Walk | Sustained walking ability and major mobility-disability endpoint | **High** in selected older-adult cohorts and LIFE | High in ageing research; lower in routine general practice | **Clinical Specialty** | Mobility-disability research or specialty result under a governed protocol |
| Berg Balance Scale | Multitask clinical balance performance | **Moderate-to-high** measurement evidence in relevant clinical groups | High in rehabilitation | **Clinical Specialty** | Official balance-instrument result; not standalone falls prediction |
| Two-Minute Walk Test | Short field walking capacity | **Moderate**, population dependent | Moderate in rehabilitation when 6MWT is impractical | **Clinical Specialty** | Test-specific distance only; not interchangeable with 6MWT |
| 10-Meter Walk Test | Short-course usual or fast gait performance | **Moderate-to-high**, especially in rehabilitation populations | High in neurology and rehabilitation | **Clinical Specialty** | Protocol-specific gait performance; not interchangeable with a four-meter protocol |
| Incremental / Endurance Shuttle Walk | Externally paced functional exercise performance | **High** in chronic respiratory disease under ERS/ATS standard | High in pulmonary rehabilitation, limited general adoption | **Clinical Specialty** | Specialty field-test endpoint under its exact protocol |

The registry status concerns scientific suitability only. It does not prescribe
which tests should be implemented, displayed, or combined.

## 9. Test dossiers

### 9.1 Hand Grip Strength

**Purpose and measurement principle.** Grip dynamometry measures maximal voluntary
isometric force generated by the hand and forearm under a defined posture, handle
setting, hand selection, trial count, rest period, and value-selection rule. It is
an accessible marker of muscle function, not a direct whole-body strength test.

**Clinical validity.** Grip is embedded in sarcopenia and physical-frailty practice
and has substantial prognostic evidence. In PURE, 139,691 adults from 17 countries
with known vital status showed adjusted associations between lower grip and
all-cause mortality, cardiovascular mortality, myocardial infarction, and stroke
([PURE cohort](https://pubmed.ncbi.nlm.nih.gov/25982160/)). An umbrella review found
highly suggestive evidence for all-cause mortality, cardiovascular death, and
incident disability, while also noting that no assessed outcome reached its
strictest “convincing evidence” class
([umbrella review](https://pubmed.ncbi.nlm.nih.gov/32565244/)).

**Reliability and reproducibility.** Reliability is generally good with a calibrated
dynamometer and stable protocol. Reproducibility is materially weakened by device,
handle position, posture, elbow and wrist position, dominant versus nondominant
hand, number of attempts, encouragement, pain, and use of maximum versus mean.
A review of 48 mortality cohorts with more than three million participants found
substantial protocol incompleteness and heterogeneity
([protocol review](https://pubmed.ncbi.nlm.nih.gov/36215867/)).

**Equipment and time.** A calibrated clinical dynamometer, adjustable chair when
seated testing is used, and a few minutes for instruction, repeated attempts, and
rest.

**Clinical adoption.** High in geriatrics, rehabilitation, sarcopenia assessment,
epidemiology, and increasingly cardiovascular care. EWGSOP2 prioritizes low muscle
strength in sarcopenia and recognizes grip or chair stand for strength assessment
([EWGSOP2](https://pubmed.ncbi.nlm.nih.gov/30312372/)).

**Strengths.** Low burden, objective, inexpensive after equipment acquisition,
widely studied, sensitive to age and sex, and prospectively associated with major
outcomes.

**Limitations.** Hand arthritis, pain, injury, neurologic disease, upper-limb
impairment, hand size, effort, and device differences can dominate the result. It
cannot localize systemic disease or represent lower-limb function. Norms vary by
age, sex, body size, and world region
([global normative review](https://pubmed.ncbi.nlm.nih.gov/26790455/)).

**Applicable populations.** Broad adult and older-adult use when the participant
can safely grip and the reference population matches. Disease-specific and
upper-limb-limited populations require separate interpretation.

**Evidence judgment.** Measurement validity **High**; prognostic association
**High**; universal cutoff validity **Moderate-to-low**; readiness **Production
Eligible**.

### 9.2 Usual Gait Speed

**Purpose and measurement principle.** A participant walks a precisely marked
short course at their usual pace while time is recorded over a defined measurement
zone. The protocol must state pace, course length, acceleration and deceleration
handling, standing or moving start, number of trials, footwear, assistive device,
and timing method.

**Clinical validity.** Usual gait speed samples integrated locomotor function and
predicts disability, hospitalization, and survival. An individual-participant
pooled analysis of 34,485 community-dwelling adults aged 65 years or older across
nine cohorts found a graded association with survival in every study after age and
sex modeling and broad clinical adjustment
([Studenski et al.](https://pubmed.ncbi.nlm.nih.gov/21205966/)). A systematic review
of physical-performance determinants also found consistent associations between
gait speed and future disability
([disability review](https://pubmed.ncbi.nlm.nih.gov/21596497/)).

**Reliability and reproducibility.** Usually high under a fixed protocol, but
results change with course length, start method, pace instruction, turning,
assistive devices, footwear, surface, pain, and manual versus electronic timing.
Short courses magnify timing and acceleration effects.

**Equipment and time.** A safe marked walkway, space for acceleration and
deceleration when required, stopwatch or timing gates, and typically less than five
minutes.

**Clinical adoption.** Very high in geriatric medicine and rehabilitation and
recognized in cardiovascular and surgical frailty pathways. ESC/EAPC consensus
advises short-distance gait speed in selected cardiac procedural assessment
([EACTS/EAPC consensus](https://academic.oup.com/eurjpc/article/31/2/146/7291991)).

**Strengths.** Brief, inexpensive, understandable, repeatable, and strongly linked
to mobility and survival.

**Limitations.** Not a pure speed trait; it integrates pain, balance, strength,
neurology, cognition, confidence, and environment. It has ceiling effects in
high-functioning younger people and cannot assess nonambulatory people. A slow
result is nonspecific and is not a diagnosis. Healthy reference performance varies
by age and sex
([normative systematic review](https://pubmed.ncbi.nlm.nih.gov/36528509/)).

**Applicable populations.** Best established in ambulatory older adults; also
validated in many clinical populations. Younger, athletic, disease-specific, and
assistive-device users need suitable protocols and references.

**Evidence judgment.** Measurement validity **High**; prognostic association
**High** in older adults; general-population transportability **Moderate-to-high**;
readiness **Production Eligible**.

### 9.3 Four-Meter Walk Test

**Purpose and measurement principle.** This is a standardized short-course gait
speed protocol over four meters, commonly used within SPPB and as a standalone
usual-pace measure.

**Clinical validity, reliability, and reproducibility.** It inherits the strong
gait-speed construct and is embedded in the NIA SPPB protocol. It is reliable when
the start, finish, pace, timing, trials, aids, and surrounding course are fixed.
Because the measured course is short, inconsistent start rules or manual timing can
produce proportionally important variation.

**Equipment and time.** Safe marked walking course, timing device, and several
minutes including instruction and repeat trials.

**Clinical adoption.** High in geriatric research, SPPB administration, pulmonary
and rehabilitation settings.

**Strengths.** Very low burden and space requirement; directly comparable with a
large older-adult evidence base when the same protocol is used.

**Limitations.** Ceiling effect, timing sensitivity, and inability to assess
endurance. It is not interchangeable with five- or ten-meter protocols without
validation.

**Applicable populations.** Ambulatory adults able to traverse the course safely.

**Evidence judgment.** **High** within older-adult and SPPB contexts; readiness
**Production Eligible as an official Gait Speed protocol**, not as a second test
domain.

### 9.4 30-Second Chair Stand Test

**Purpose and measurement principle.** The test records how many complete chair
rises a person performs in a fixed interval using a defined chair, foot position,
arm position, and completion rule. It samples repeated transfer ability, functional
lower-body strength, muscular endurance, balance, and coordination.

**Clinical validity.** The original validation in 76 community-dwelling adults over
60 showed good stability and relationships with weight-adjusted leg-press
performance, while distinguishing age and activity groups
([Jones et al.](https://pubmed.ncbi.nlm.nih.gov/10380242/)). It is used by CDC STEADI
to assess leg strength and endurance in older-adult falls evaluation
([CDC STEADI resources](https://www.cdc.gov/steadi/hcp/clinical-resources/index.html)).

**Reliability and reproducibility.** Good in the original population, but chair
height, use of arms, depth of sitting, foot placement, incomplete stands, pacing,
examiner counting, and encouragement alter results.

**Equipment and time.** Standard-height straight-backed armless chair, wall support
for chair stability, stopwatch, and approximately two to three minutes including
instruction and safety positioning.

**Clinical adoption.** High in older-adult fitness, rehabilitation, primary care,
and falls pathways.

**Strengths.** Low cost, direct relation to an everyday transfer, and avoids the
fixed-repetition ceiling for people who can perform many rises.

**Limitations.** Knee or hip pain, chair dimensions, body size, balance, movement
strategy, and use of arms affect the result. The standard test may have a floor
effect for people unable to rise without arm support. The evidence base for direct
all-cause mortality prediction is weaker than for grip, gait, or SPPB.

**Applicable populations.** Primarily community-dwelling and clinical older adults
who can attempt the task safely; modified variants are distinct tests.

**Evidence judgment.** Reliability and construct validity **Moderate-to-high**;
long-term outcome evidence **Moderate**; readiness **Production Eligible** with an
exact protocol and no standalone fall or mortality claim.

### 9.5 Five Times Sit-to-Stand Test

**Purpose and measurement principle.** The participant completes five chair-rise
cycles as quickly and safely as instructed; total completion time is recorded. It
samples transfer ability, lower-limb functional strength, power, balance control,
and coordination.

**Clinical validity.** The task is included in SPPB and WHO ICOPE-related mobility
screening and is accepted in EWGSOP2 as an alternative strength assessment. It has
broad disease-specific and geriatric use.

**Reliability and reproducibility.** A 2021 meta-analysis of eight studies and 400
participants reported excellent pooled inter-rater reliability
([reliability meta-analysis](https://pubmed.ncbi.nlm.nih.gov/34207604/)). A later
systematic review found substantial procedural commonality but confirmed that chair
height, foot placement, arm rules, and other details matter
([procedure review](https://pubmed.ncbi.nlm.nih.gov/37390277/)).

**Equipment and time.** Stable standardized chair, stopwatch, and approximately two
to three minutes.

**Clinical adoption.** High in geriatrics, rehabilitation, sarcopenia pathways,
COPD, neurological conditions, and musculoskeletal practice.

**Strengths.** Very brief, inexpensive, functionally meaningful, and suitable for
repeated evaluation when protocol and recovery are controlled.

**Limitations.** Not a pure strength test. Pain, chair height, body size, foot
position, balance, cognition, movement strategy, and arm use influence time. People
unable to complete five repetitions have a floor result that must be recorded as a
noncompletion, not fabricated time. Population-specific cutoffs disagree.

**Applicable populations.** Best established in older and clinical adult
populations able to rise safely.

**Evidence judgment.** Reliability **High**; construct and prognostic validity
**Moderate**; readiness **Production Eligible** with no universal cutoff or falls
claim.

### 9.6 Timed Up and Go

**Purpose and measurement principle.** TUG times a sequence of standing from a
chair, walking a defined short distance, turning, returning, and sitting. It samples
basic functional mobility, transitions, gait, turning, balance, and task planning.

**Clinical validity.** The original clinical test was developed for frail older
people and has extensive validation across geriatric, neurological, and
rehabilitation populations. It is included in CDC STEADI functional assessment
resources.

**Reliability and reproducibility.** Generally high under a fixed protocol. Chair
height and armrests, footwear, walking aid, turn direction, walking distance, pace
instruction, practice trial, manual timing, and cognitive or manual dual tasks can
all change the result. Instrumented TUG is a distinct measurement family and lacks
standardized universal outputs.

**Equipment and time.** Standard chair, marked course, turn marker, stopwatch, safe
floor, and usually less than three minutes.

**Clinical adoption.** Very high in geriatric medicine, physical therapy,
neurology, falls assessment, and rehabilitation.

**Strengths.** Fast, low cost, and more ecologically representative of basic
mobility than straight walking alone because it includes transfers and turning.

**Limitations.** TUG is not a specific falls test. A systematic review and
meta-analysis of 25 studies found limited ability to predict future falls in
community-dwelling older adults and concluded it should not be used alone for that
purpose
([Barry et al.](https://pubmed.ncbi.nlm.nih.gov/24484314/)). Cutoffs varied widely
across populations and protocols. Cognition, pain, aids, and strategy can dominate
performance.

**Applicable populations.** Older adults and many clinical groups able to complete
the course safely. Healthy high-functioning adults may show a ceiling effect.

**Evidence judgment.** Reliability **High**; mobility construct validity
**Moderate-to-high**; standalone falls prediction **Low-to-moderate**; readiness
**Conditionally Production Eligible for mobility only**.

### 9.7 Short Physical Performance Battery

**Purpose and measurement principle.** SPPB is an established published battery of
standing balance, usual-pace short walking, and repeated chair-rise tasks. It
assesses lower-extremity physical performance through both component results and
the instrument's official summary result.

**Clinical validity.** The original study assessed more than 5,000 adults aged 71
years or older in three communities. Components and the published summary result
were associated with self-reported disability and independently predicted
short-term mortality and nursing-home admission
([Guralnik et al.](https://pubmed.ncbi.nlm.nih.gov/8126356/)). A mortality
meta-analysis standardized data from 17 studies and 16,534 participants and found a
graded association between lower SPPB performance and all-cause mortality after
age, sex, and body-size adjustment
([Pavasini et al.](https://pubmed.ncbi.nlm.nih.gov/28003033/)).

**Reliability and reproducibility.** A systematic review of 28 studies concluded
that SPPB is a reliable and valid physical-performance measure in adults older than
60, while noting variable study quality
([psychometric review](https://pubmed.ncbi.nlm.nih.gov/35442231/)). Standardization
of the balance positions, gait course and timing, chair, arm use, instructions,
component order, and handling of inability is essential.

**Equipment and time.** Standard chair, stopwatch, marked short walkway, safe area
for balance testing, and approximately ten to twelve minutes. NIA provides official
instructions and safety resources
([NIA SPPB resource](https://www.nia.nih.gov/research/labs/leps/short-physical-performance-battery-sppb)).

**Clinical adoption.** Very high in geriatric assessment, ageing trials,
rehabilitation, sarcopenia frameworks, oncology, cardiology, and perioperative
research.

**Strengths.** Multicomponent lower-extremity assessment, extensive longitudinal
evidence, standardized public clinical resource, and ability to characterize a
broader range than one task alone.

**Limitations.** It is an existing composite instrument and can obscure which
component changed if only its summary is retained. Ceiling effects occur in
high-functioning adults. It does not assess upper-limb strength or sustained
walking. Alternative scoring or component substitution invalidates comparability.

**Applicable populations.** Best supported in adults over 60 and particularly
older, clinical, or mobility-limited populations. It is not a universal adult
fitness battery.

**Evidence judgment.** Measurement and prognostic validity **High** in older
adults; transportability to younger high-functioning adults **Low-to-moderate**;
readiness **Production Eligible only as the unchanged published instrument**. This
review creates no new composite.

### 9.8 One-Leg Balance Test

**Purpose and measurement principle.** The participant maintains a defined
single-leg stance for a stated maximum duration under specified visual, footwear,
foot-placement, arm, support, and side-testing conditions. It samples static
postural control.

**Clinical validity.** Standing balance was associated with mortality in the major
physical-capability meta-analysis. A prospective cohort of 1,702 adults aged 51–75
reported that inability to complete a specifically defined ten-second stance was
associated with all-cause mortality after adjustment
([Araújo et al.](https://pubmed.ncbi.nlm.nih.gov/35728834/)). A falls-focused
systematic review found relevant evidence but substantial heterogeneity in study
design, balance protocols, and falls ascertainment
([balance and falls review](https://pubmed.ncbi.nlm.nih.gov/34748974/)).

**Reliability and reproducibility.** Sensitive to eyes open or closed, footwear,
surface, lifted-foot placement, tested side, number of trials, maximum allowed
time, arm position, practice, and examiner guarding. Ceiling effects are common in
healthier adults; floor and safety problems occur in impaired adults.

**Equipment and time.** Stopwatch, safe uncluttered area, stable support available
without being used during timing, and trained guarding. Usually a few minutes.

**Clinical adoption.** Moderate as part of balance and falls assessment; less
standardized as a standalone prognostic test than gait or SPPB.

**Strengths.** Very low equipment burden and a direct balance challenge.

**Limitations.** Meaningful fall risk is multifactorial. One cohort does not
validate a universal longevity threshold, and inability may reflect vestibular,
visual, neurologic, musculoskeletal, pain, or confidence factors. Unsupervised
testing can cause falls.

**Applicable populations.** Only people who can attempt the task safely with
appropriate guarding. Protocol- and population-specific evidence is required.

**Evidence judgment.** Construct validity **Moderate**; reproducibility
**Moderate** when standardized; prognostic transportability **Low-to-moderate**;
readiness **Research Only**.

### 9.9 Six-Minute Walk Test

**Purpose and measurement principle.** A person is instructed to walk as far as
possible for six minutes along a standardized flat course, with standardized
encouragement, rest, aids, oxygen, symptoms, and safety monitoring. The primary
result is distance walked. It evaluates self-paced submaximal functional exercise
capacity.

**Clinical validity.** ATS identifies its strongest indication as response
assessment in moderate-to-severe heart or lung disease and recognizes use for
functional status and prognosis. ERS/ATS concludes that it has good construct
validity, test-retest reliability, treatment responsiveness, and prognostic
association in chronic respiratory disease. A heart-failure systematic review of
44 longitudinal cohorts and 22,598 patients found worse hospitalization or
mortality prognosis with poorer 6MWT, SPPB, and gait performance, but no homogeneous
universal cutoffs
([heart-failure review](https://pubmed.ncbi.nlm.nih.gov/33297975/)).

**Reliability and reproducibility.** Reliability is high in established disease
groups, but there is a meaningful learning effect. ERS/ATS recommends two tests
when measuring baseline or change and warns that track length and layout,
encouragement, oxygen, wheeled aids, medication, and test conduct materially alter
distance
([ERS/ATS standard](https://www.thoracic.org/statements/resources/copd/FWT-Tech-Std.pdf)).

**Equipment and time.** A standardized long corridor, cones, distance markers,
stopwatch, chair, emergency-response capability, symptom measures, and appropriate
clinical monitoring. Administration and recovery generally require more than the
six-minute walking interval.

**Clinical adoption.** Very high in pulmonary hypertension, COPD, interstitial lung
disease, heart failure, cardiomyopathy, vascular disease, rehabilitation, and
clinical trials.

**Strengths.** Standardized, functionally meaningful, more reflective of daily
submaximal activity than maximal exercise, and responsive in several disease
contexts.

**Limitations.** It is not a direct cardiopulmonary measurement. Motivation,
learning, corridor, turn frequency, oxygen, walking aids, pain, balance, and
musculoskeletal limitations affect distance. Geographic and population reference
variation is substantial, and local reference standards are preferred where
possible
([seven-country reference study](https://pubmed.ncbi.nlm.nih.gov/20525717/)). It
cannot diagnose the cause of dyspnea or replace CPET.

**Applicable populations.** Strongest in defined cardiopulmonary and rehabilitation
populations under supervised standardized conditions. General-population use needs
age-, sex-, body-size-, protocol-, and region-appropriate reference evidence.

**Evidence judgment.** Measurement and disease-specific clinical validity **High**;
general-population interpretation **Moderate**; readiness **Conditionally Production
Eligible**.

### 9.10 Other internationally accepted tests

#### 400-Meter Walk / Long-Distance Corridor Walk

The test assesses sustained walking and is a validated mobility-disability endpoint
in older adults. The LIFE randomized trial enrolled 1,635 sedentary adults aged
70–89 with physical limitations and demonstrated that structured physical activity
reduced incident and persistent major mobility disability defined through ability
to complete a 400-meter walk
([LIFE randomized trial](https://pubmed.ncbi.nlm.nih.gov/24866862/)). This is stronger
causal evidence for preservation of mobility than the observational mortality
literature, but it applies to a selected older high-risk population and a structured
intervention, not to longevity from a single test result.

The test requires a longer course, repeated turns, more time, screening, and safety
oversight than short gait tests. It has **High** evidence for mobility disability in
the studied context and is classified **Clinical Specialty** rather than a routine
general platform test.

#### Berg Balance Scale

Berg is a mature clinician-administered multi-item balance instrument with wide
rehabilitation adoption and generally strong reliability in relevant populations.
It requires trained administration, substantially more time than a single stance,
and exact use of the official instrument. Ceiling effects occur in high-functioning
people, and it should not be used alone to predict future falls. It is classified
**Clinical Specialty**; no modified Vitalspan balance composite is authorized.

#### Two-Minute Walk Test

The test is used when a six-minute test is impractical or too burdensome. It can be
reliable and responsive in specific rehabilitation populations, but it is a
distinct endpoint and cannot be converted into, or treated as, a 6MWT. The
cross-population prognostic evidence and standardization are less mature. It is
classified **Clinical Specialty**.

#### 10-Meter Walk Test

This is a well-established rehabilitation measure of usual or fast gait,
particularly in neurological populations. Course length, acceleration zones, pace,
and aids must be retained. It is classified **Clinical Specialty** because its
reference and disease-specific evidence must not be silently pooled with the
four-meter usual gait protocol.

#### Incremental and Endurance Shuttle Walk Tests

These are externally paced field tests with strong respiratory-rehabilitation
standards. ERS/ATS finds good validity and reliability and provides exact operating
procedures. They require audio pacing, a defined course, test-specific stopping
rules, and clinical safety. They are classified **Clinical Specialty**, not generic
walking tests.

#### Floor-rise, stair-climb, jump, maximal power, and consumer-camera tests

These tasks may capture important high-level mobility or power, but general
clinical standards, population references, safety conditions, and long-term
outcome validation are inconsistent. They remain **Research Only** unless a future
test-specific review authorizes an exact protocol.

## 10. Mortality and longevity evidence

### 10.1 All-cause mortality

The most comprehensive foundational synthesis is the 2010 BMJ systematic review
and meta-analysis of objective physical capability. It found consistently higher
all-cause mortality among people with weaker grip, slower walking, slower chair
rising, and poorer standing balance. Associations for grip were adjusted for age,
sex, and body size; the walking association was particularly large, although based
on fewer older-adult cohorts and heterogeneous protocols
([Cooper et al.](https://pubmed.ncbi.nlm.nih.gov/20829298/)).

Evidence is strongest for:

- **Grip:** very large international cohorts and multiple meta-analyses;
- **Gait speed:** large individual-participant pooled analysis with long follow-up;
- **SPPB:** landmark cohorts and a dedicated mortality meta-analysis; and
- **chair rise and standing balance:** consistent association, but fewer cohorts
  and more protocol heterogeneity.

6MWT mortality evidence is strongest in cardiopulmonary disease rather than the
healthy general population. TUG is clinically meaningful for mobility but has less
specific mortality evidence.

**Conclusion:** Low objective performance is a robust mortality-associated marker,
especially in older adults. It is not a validated individual lifespan estimator.

### 10.2 Cardiovascular mortality and disease

Grip strength has broad multinational cardiovascular outcome evidence. PURE found
adjusted associations with cardiovascular mortality, myocardial infarction, and
stroke. In established heart failure, lower 6MWT, SPPB, and gait performance are
associated with hospitalization or mortality. ESC/EAPC cardiac-surgery consensus
supports gait speed and SPPB for prognosis in defined procedural populations.

The association may reflect cardiovascular disease, systemic reserve,
inflammation, neuromuscular health, activity, and social or clinical confounding.
A low functional result does not diagnose cardiovascular disease, and
disease-specific thresholds cannot be transferred to healthy adults.

**Evidence quality:** **High** for association in selected tests and populations;
**Low** for a universal cardiovascular-risk interpretation.

### 10.3 Longevity interpretation

Functional performance is relevant to longevity because it predicts survival and
captures the ability to live independently, not because it directly measures
lifespan. Vitalspan may scientifically describe the domain as **longevity
relevant**, but must not use any test to report expected remaining years, “years
gained,” mortality probabilities, or causal longevity benefits.

## 11. Other clinical outcomes

| Outcome | Evidence summary | Confidence and limits |
| --- | --- | --- |
| **Disability and mobility loss** | Grip, lower-body strength, gait, and SPPB prospectively predict disability. The LIFE trial shows structured activity can reduce major mobility disability in selected high-risk older adults. | **High** association; **Moderate-to-high** causal evidence for mobility preservation in the LIFE population, not for every test or lifespan. |
| **Falls** | Balance, gait, chair rise, and TUG are associated with fall history or risk, but no single measure has strong enough prediction to represent comprehensive fall risk. TUG meta-analysis shows poor sensitivity when used alone. | **Moderate** association; **Low** confidence in standalone classification. Falls are multifactorial. |
| **Frailty** | Weakness and slowness are components of physical-frailty and sarcopenia frameworks; SPPB and gait are widely used to characterize performance. | **High** overlap; **High** confidence that a single test is insufficient for frailty diagnosis. |
| **Hospitalization** | Lower performance predicts hospitalization in older and disease-specific cohorts; HF synthesis supports gait, SPPB, and 6MWT. Hospitalization itself can accelerate gait and ADL decline. | **Moderate-to-high** association; substantial disease and setting dependence. |
| **Institutionalization** | Original SPPB evidence predicted nursing-home admission; mobility limitation is closely linked to care dependence. | **Moderate-to-high** in older populations; not a universal individual forecast. |
| **Healthy ageing** | WHO recognizes mobility and functional ability as central to healthy ageing. Functional tests measure only part of locomotor or physical capacity. | **High** conceptual relevance; **Low** validity as a complete healthy-ageing measure. |
| **Quality of life** | Functional limitation and 6MWT often correlate with health-related quality of life in cardiopulmonary and rehabilitation populations. | **Moderate**; quality of life includes mental, social, symptom, and environmental dimensions not captured by performance. |
| **Independence** | Gait, transfers, balance, and endurance are prerequisites for many independent activities; prospective disability evidence is strong. | **High** relevance and association; actual independence depends on environment and assistance. |

## 12. Association versus causation

Most mortality, cardiovascular, hospitalization, frailty, and independence evidence
is observational. Multivariable adjustment reduces but cannot remove reverse
causation, residual confounding, selection bias, measurement differences, and the
possibility that subclinical disease lowers performance before diagnosis.

The evidence supports these statements:

- lower performance is associated with adverse outcomes;
- several tests add prognostic information after common adjustment;
- functional performance is modifiable in many people; and
- structured physical activity can reduce mobility disability in selected older
  adults.

The evidence does **not** support these statements:

- a particular test result causes an individual to live longer or shorter;
- improving a test by a specified amount produces a specified mortality benefit;
- practicing a test improves the underlying systems in proportion to the result;
- any one test captures total healthy ageing; or
- associations justify treatment, diagnosis, or mortality prediction by Vitalspan.

## 13. Population and measurement limitations

### 13.1 Age

Most mortality and disability evidence comes from adults over 60 or 65. Grip has
broader midlife evidence, and the one-leg mortality cohort covered ages 51–75.
Ceiling effects are common for short gait, TUG, balance, and SPPB in younger or
high-functioning adults. Floor effects occur in frail, nonambulatory, painful, or
acutely ill people.

No older-adult cutoff should be extrapolated to younger adults. No age band should
be extrapolated beyond the source dataset.

### 13.2 Sex and body size

Grip, gait, chair performance, and 6MWT commonly differ by sex and body size.
Interpretation may require sex-, age-, height-, weight-, or body-size-aware
references depending on the test. These factors do not imply biological
essentialism or explain every individual's result, but ignoring them can
misclassify performance.

### 13.3 Region, ethnicity, and socioeconomic context

Grip norms show world-region variation. 6MWT reference equations vary across
countries and centers even under standardized conduct. Comfortable gait-speed
meta-analysis found substantial age and sex effects and overlapping continental
estimates, but wide prediction intervals remain. Built environment, habitual
activity, nutrition, occupation, healthcare, test familiarity, and recruitment
can contribute.

One universal reference or cutoff is not authorized by this phase.

### 13.4 Clinical population

Cardiac, pulmonary, neurologic, oncologic, musculoskeletal, postoperative, and
frailty cohorts often have different measurement properties and prognostic
thresholds. Disease-specific evidence must remain disease specific.

### 13.5 Safety and feasibility

Walking, turning, chair rise, and balance can provoke falls, pain, dyspnea, chest
symptoms, desaturation, syncope, or fatigue in susceptible people. A test's low
equipment burden does not make unsupervised testing safe. Acute illness, unstable
symptoms, recent procedures, clinician restrictions, and inability to understand
instructions may make a test inappropriate.

Safety eligibility and stop rules require a later measurement-standard phase and
must be based on the originating clinical standard.

## 14. Domain boundary policy

| Adjacent domain | Scientifically justified overlap | Boundary that must remain |
| --- | --- | --- |
| **Clinical PhenoAge** | Both associate with ageing-related outcomes and may reflect systemic health. | Functional performance must not change PhenoAge or be converted to biological-age years. No combined validation exists. |
| **VO₂max** | Aerobic reserve contributes to walking endurance and sometimes gait. | No walk, chair, grip, balance, TUG, or SPPB result is VO₂max. 6MWT cannot replace CPET. |
| **Cardiometabolic Health** | Obesity, diabetes, vascular disease, and blood pressure can affect mobility and strength. | Functional performance is neither a cardiometabolic diagnosis nor a substitute for biomarkers. |
| **Frailty** | Grip, gait, chair rise, and SPPB are used within frailty and sarcopenia pathways. | The Functional Capacity domain records performance; it does not diagnose frailty, sarcopenia, vulnerability, or care need. |
| **Recovery** | Fatigue, sleep, acute training load, illness, and recent exertion can change test performance. | A single functional result does not measure recovery state. Recovery context may be metadata, not a reinterpretation. |

The same measurement may be relevant to more than one clinical framework. Domain
independence is preserved by retaining native meaning, provenance, protocol, and
authorized interpretation rather than by pretending the biology does not overlap.

## 15. Evidence Registry

| ID | Evidence source | Design and population | Principal contribution | Quality / limitation |
| --- | --- | --- | --- | --- |
| FC-E001 | [WHO healthy ageing and functional ability](https://www.who.int/news-room/questions-and-answers/item/healthy-ageing-and-functional-ability) | International conceptual framework | Defines functional ability, intrinsic capacity, environment, and healthy ageing | Authoritative concept; not a test validation study |
| FC-E002 | [WHO ICOPE](https://www.who.int/tools/icope-training-programme) | International guidance for older people | Recognizes mobility assessment and management of intrinsic-capacity decline | Older-person care framework; broader than platform test domain |
| FC-E003 | [AHA functional-capacity statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC7252210/) | Scientific statement focused on older adults with CVD | Establishes functional capacity as a meaningful endpoint and reviews practical tests | Cardiovascular and older-adult emphasis |
| FC-E004 | [2024 ESC PAD guideline](https://academic.oup.com/eurheartj/article/45/36/3538/7738955) | ESC clinical guideline | Recognizes 6MWT, SPPB, walking performance, and functional status | Disease-specific |
| FC-E005 | [EACTS/EAPC frailty consensus](https://academic.oup.com/eurjpc/article/31/2/146/7291991) | European cardiovascular consensus | Supports gait speed and SPPB prognostic use around cardiac procedures | Specialty procedural populations; cutoffs not generalizable |
| FC-E006 | [ACSM older-adult position stand](https://pubmed.ncbi.nlm.nih.gov/19516148/) | Evidence-based position stand | Supports aerobic, strength, flexibility, balance, and functional capacity as distinct exercise-relevant dimensions | Exercise guidance, not test interpretation standard |
| FC-E007 | [NIA SPPB resource](https://www.nia.nih.gov/research/labs/leps/short-physical-performance-battery-sppb) | Official instrument resource | Establishes objective lower-extremity test administration and safety | Does not authorize platform interpretation |
| FC-E008 | [ICFSR physical-frailty guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC6800406/) | GRADE-informed international guideline | Defines frailty screening and relationship of weakness/slowness to physical frailty | Frailty is broader than function |
| FC-E009 | [Cooper et al. 2010](https://pubmed.ncbi.nlm.nih.gov/20829298/) | Systematic review and meta-analysis of grip, gait, chair rise, balance and mortality | Found consistent age-, sex-, and body-size-adjusted mortality associations | Observational, heterogeneous, older cohorts for most tests |
| FC-E010 | [Studenski et al. 2011](https://pubmed.ncbi.nlm.nih.gov/21205966/) | Pooled individual data; 34,485 adults aged 65+ from nine cohorts | Strong graded gait-speed and survival association | Selected cohorts; majority White; observational |
| FC-E011 | [PURE grip cohort](https://pubmed.ncbi.nlm.nih.gov/25982160/) | Prospective multinational cohort; 139,691 with known vital status | Grip associated with all-cause and CV mortality and CV events after adjustment | Observational; relatively short median early follow-up |
| FC-E012 | [Grip umbrella review](https://pubmed.ncbi.nlm.nih.gov/32565244/) | Umbrella review of meta-analyses | Highly suggestive evidence for mortality, CV death, and disability | No association reached the review's strict “convincing” class |
| FC-E013 | [Grip protocol review](https://pubmed.ncbi.nlm.nih.gov/36215867/) | 48 cohorts; more than three million participants | Demonstrates major protocol heterogeneity that can bias values | Focused on mortality cohorts, not all clinical uses |
| FC-E014 | [Jones 30-second chair validation](https://pubmed.ncbi.nlm.nih.gov/10380242/) | Validation study; 76 community-dwelling adults over 60 | Good stability and convergent validity with leg press | Small, generally active older sample |
| FC-E015 | [Five-rise reliability meta-analysis](https://pubmed.ncbi.nlm.nih.gov/34207604/) | Eight studies; 400 participants | Excellent pooled inter-rater reliability | Small total evidence base and mixed populations |
| FC-E016 | [TUG falls meta-analysis](https://pubmed.ncbi.nlm.nih.gov/24484314/) | 25-study review; ten-study diagnostic meta-analysis | TUG alone has limited future-fall prediction | Cutoff- and population-dependent |
| FC-E017 | [Guralnik SPPB cohort](https://pubmed.ncbi.nlm.nih.gov/8126356/) | More than 5,000 adults aged 71+ in three communities | SPPB associated with disability and predicted mortality and nursing-home admission | Older US community sample |
| FC-E018 | [SPPB mortality meta-analysis](https://pubmed.ncbi.nlm.nih.gov/28003033/) | 17 standardized studies; 16,534 participants | Graded association between lower SPPB and all-cause mortality | Observational; category and cohort heterogeneity |
| FC-E019 | [SPPB psychometric review](https://pubmed.ncbi.nlm.nih.gov/35442231/) | 28 studies in adults over 60 | Supports reliability and validity | Study quality varied |
| FC-E020 | [Araújo one-leg cohort](https://pubmed.ncbi.nlm.nih.gov/35728834/) | Prospective cohort; 1,702 adults aged 51–75 | Specific ten-second stance failure associated with mortality | Single protocol and selected clinic cohort; observational |
| FC-E021 | [One-leg balance falls review](https://pubmed.ncbi.nlm.nih.gov/34748974/) | Systematic review | Supports relevance while documenting substantial heterogeneity | Insufficient universal protocol or cutoff |
| FC-E022 | [ATS 6MWT statement](https://pubmed.ncbi.nlm.nih.gov/12091180/) | Official technical guideline | Defines submaximal functional capacity, conduct, safety, and limitations | Older standard; strengthened by later ERS/ATS document |
| FC-E023 | [ERS/ATS field-walk standard](https://www.thoracic.org/statements/resources/copd/FWT-Tech-Std.pdf) | Systematic-review-informed international standard | Confirms validity, reliability, learning effect, prognosis, and method sensitivity | Written for chronic respiratory disease |
| FC-E024 | [HF functional-performance review](https://pubmed.ncbi.nlm.nih.gov/33297975/) | 44 longitudinal cohorts; 22,598 patients | 6MWT, SPPB, and gait linked to hospitalization or mortality | Low-to-moderate GRADE by outcome; no homogeneous cutoffs |
| FC-E025 | [Physical performance and disability review](https://pubmed.ncbi.nlm.nih.gov/21596497/) | Systematic review; 22 studies | Grip, strength, gait, and activity associated with disability | Heterogeneous disability measures |
| FC-E026 | [LIFE randomized trial](https://pubmed.ncbi.nlm.nih.gov/24866862/) | Multicenter RCT; 1,635 sedentary adults aged 70–89 | Structured activity reduced major and persistent mobility disability | Selected high-risk older volunteers; not a mortality trial |
| FC-E027 | [Gait norm systematic review](https://pubmed.ncbi.nlm.nih.gov/36528509/) | Meta-analysis; 51,248 healthy adults | Demonstrates age and sex patterns and wide prediction intervals | Apparently healthy adults; protocol variation remains |
| FC-E028 | [Global grip norms](https://pubmed.ncbi.nlm.nih.gov/26790455/) | Systematic review and meta-analysis; 63 samples | Demonstrates age, sex, and world-region variation | Normative methods and devices vary |
| FC-E029 | [Seven-country 6MWT references](https://pubmed.ncbi.nlm.nih.gov/20525717/) | Multicenter healthy sample; 444 adults aged 40–80 | Shows age, sex, anthropometry, center, and geographic variation | Modest sample by country; routine pooled equation not recommended |

## 16. Clinical Adoption Review

### 16.1 Highest maturity

- **Gait speed and four-meter walk:** exceptionally feasible, well studied, and
  adopted across geriatrics and rehabilitation.
- **Grip strength:** widely available where a calibrated dynamometer and protocol
  are present; strong epidemiological and sarcopenia adoption.
- **SPPB:** mature standardized battery with NIA support and extensive outcome
  evidence.
- **6MWT:** mature international technical standard and very high specialty
  adoption, with greater safety and operational burden.

### 16.2 High adoption with narrower interpretation

- **30-Second Chair Stand and Five Times Sit-to-Stand:** widely used and reliable,
  but protocol variants and weaker universal prognostic evidence require exact
  naming.
- **TUG:** extremely common for mobility assessment, but frequently overinterpreted
  as a falls classifier.

### 16.3 Incomplete general-platform maturity

- **One-Leg Balance:** clinically intuitive and promising, but insufficiently
  standardized for universal interpretation.
- **400-Meter Walk, Berg, Two-Minute Walk, 10-Meter Walk, and shuttle tests:**
  established within particular research or clinical settings, but not suitable
  for silent general-population pooling.

## 17. Validation Summary

### 17.1 What is validated

- Objective physical performance is a coherent and clinically relevant construct.
- Grip, gait, chair rise, balance, SPPB, and field walking measure related but
  nonidentical aspects of physical function.
- Lower performance is prospectively associated with mortality and disability.
- Grip and gait have particularly strong adjusted mortality evidence.
- SPPB has strong older-adult outcome and psychometric evidence.
- 6MWT has high disease-specific validity under international technical standards.
- Several tests are reliable when their protocols are fixed.
- Function is modifiable, and structured physical activity can preserve mobility
  in selected older adults.

### 17.2 What is not validated

- A universal Functional Capacity score or composite across these tests.
- Interchangeability between tests or between protocol variants.
- A universal normal range, cutoff, or risk threshold across age, sex, region, and
  disease.
- Mortality probability, life expectancy, or lifespan change from an individual
  test.
- Biological age, fitness age, or PhenoAge adjustment from performance.
- Frailty, sarcopenia, cardiovascular disease, neurological disease, or falls
  diagnosis from a Functional Capacity result alone.
- Replacement of CPET or VO₂max by 6MWT or any other functional test.
- Unsupervised test safety across all users.

## 18. Scientific governance

### 18.1 Production-eligible test policy

A test is scientifically eligible only if future standards preserve:

- the exact named test and protocol version;
- the construct and native result;
- equipment, course, chair, timing, pace, aid, side, trial, and assistance details
  required by that test;
- completion, noncompletion, symptoms, rests, and protocol deviations;
- population and reference compatibility;
- supervised or clinical context where safety requires it; and
- test-specific limitations and prohibited interpretations.

No value becomes valid merely because its label resembles a recognized test.

### 18.2 Research-only policy

Research Only applies to:

- One-Leg Balance as a general Vitalspan prognostic test;
- instrumented, camera-derived, phone-derived, or wearable-derived versions without
  validation against the exact clinical protocol;
- floor-rise, jump, maximal-power, stair, or novel movement tests without a separate
  approved standard;
- home or unsupervised adaptations not authorized by the source standard; and
- any attempt to infer one test from another.

### 18.3 Exclusion policy

The following are excluded from this objective performance domain:

- self-reported ADL or IADL questionnaires;
- device step counts, active minutes, exercise calories, or movement reminders;
- self-described fitness or mobility without observed standardized testing;
- unverified manual claims that a test was completed;
- proprietary consumer “mobility,” “readiness,” or “functional age” outputs without
  test-specific validation and provenance;
- clinician judgment alone without a named performance protocol; and
- informal demonstrations, challenge videos, or rep counts that do not follow an
  accepted clinical protocol.

These exclusions do not mean the information lacks all health value. They mean it
does not qualify as an objective Functional Capacity measurement under this review.

### 18.4 Interpretation governance

- Report the test, not a generic capacity label alone.
- Keep native tests separate; do not pool or average them.
- Preserve SPPB only as the official published instrument; do not alter its
  components or create a Vitalspan battery.
- Do not use universal labels such as poor, good, superior, frail, fit, or healthy
  without a later authorized reference and interpretation standard.
- Do not interpret change until test-specific measurement error, learning effect,
  protocol consistency, and population evidence are governed.
- Do not infer causation from prognostic association.
- Do not provide diagnosis, treatment, or exercise prescription from the result.

## 19. Remaining scientific limitations

1. This is a rapid structured review, not a registered exhaustive systematic
   review.
2. Most mortality evidence is observational and concentrated in older adults.
3. Adjustment sets vary, and few cohorts jointly compare all Functional Capacity
   tests with direct VO₂max, Clinical PhenoAge, and cardiometabolic domains.
4. Protocol heterogeneity is substantial for grip, gait, chair rise, TUG, balance,
   and field walking.
5. Reference distributions vary with age, sex, body size, region, recruitment, and
   clinical state.
6. Disability, hospitalization, falls, and quality-of-life outcomes are defined
   differently across studies.
7. Disease-specific prognostic thresholds are not general-population thresholds.
8. Test–retest learning, fatigue, recent activity, pain, and acute illness can
   mimic change.
9. High-functioning younger adults are underrepresented and may encounter ceiling
   effects.
10. People unable to attempt a test safely are systematically excluded from many
    validation cohorts, limiting generalizability.
11. One-leg and other balance protocols lack a sufficiently universal standard for
    longevity interpretation.
12. Evidence does not justify a universal composite or an age-equivalent output.

## 20. Production Readiness Assessment

| Criterion | Assessment |
| --- | --- |
| Construct validity | **Met.** Objective physical performance is coherent, clinically meaningful, and distinct from biomarker age and maximal aerobic capacity. |
| International recognition | **Met.** WHO, AHA, ESC/EAPC, ACSM, NIA, ICFSR, and ERS/ATS recognize physical function, mobility, strength, balance, or field walking in their appropriate contexts. |
| Measurement maturity | **Met for selected tests.** Strongest for grip, gait/four-meter walk, SPPB, and standardized 6MWT; adequate with conditions for chair tests and TUG. |
| Prognostic validity | **Met with qualifications.** Strong for all-cause mortality and disability; test- and population-specific for cardiovascular mortality, hospitalization, and other outcomes. |
| Causal validity | **Not met for longevity.** Mobility preservation is modifiable, but test change cannot be translated into lifespan change. |
| Universal interpretation | **Not met.** No global cross-test cutoff, label, or reference is authorized. |
| Composite score | **Prohibited.** No scientific basis for a new cross-test index in this phase. |
| Biological or fitness age | **Prohibited.** No validated transformation. |
| Safety for unsupervised use | **Not established.** Test-specific safety standards are required later. |
| Domain independence | **Met as a construct.** Must remain analytically separate from Clinical PhenoAge, VO₂max, cardiometabolic health, frailty, and recovery. |

## 21. Scientific recommendations

1. Approve Functional Capacity as an independent scientific domain defined by
   standardized objective physical-performance tests.
2. Approve the test-level Candidate Test Registry in Section 8 as the governing
   scientific selection for the next measurement-standard review.
3. Treat Gait Speed and the Four-Meter Walk as one construct with a protocol
   relationship, not as independent signals.
4. Preserve 30-Second Chair Stand and Five Times Sit-to-Stand as distinct tests;
   neither may be converted into the other.
5. Preserve TUG as functional mobility and explicitly prohibit standalone falls
   classification.
6. Preserve SPPB as an unchanged published battery with component visibility; do
   not create a Vitalspan composite.
7. Preserve 6MWT as submaximal functional exercise capacity and prohibit VO₂max or
   CPET equivalence.
8. Keep One-Leg Balance Research Only until an exact protocol, safety standard,
   target population, repeatability policy, and externally validated interpretation
   are approved.
9. Require later standards to govern test protocol, provenance, safety,
   repeatability, reference population, and interpretation independently for each
   test.
10. Prohibit biological age, fitness age, mortality thresholds, diagnosis,
    treatment advice, user ranking, and cross-domain scoring.

## 22. Final Production Recommendation

**PRODUCTION READY**

Functional Capacity is scientifically ready to become a standalone Vitalspan
domain at the construct level, and the selected test registry contains sufficiently
validated production-eligible tests. Readiness is conditional on later scientific
measurement, reference, eligibility, safety, and governance standards.

This review authorizes no calculation, score, composite index, code, UI,
architecture change, clinical diagnosis, treatment recommendation, biological-age
estimate, fitness-age estimate, or production implementation.
