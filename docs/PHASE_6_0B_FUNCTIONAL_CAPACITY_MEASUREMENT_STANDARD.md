# Phase 6.0B — Functional Capacity measurement standard

| Document field | Value |
| --- | --- |
| Document type | Official scientific measurement specification |
| Scientific platform | Vitalspan |
| Domain | Functional Capacity |
| Standard version | `Vitalspan-FC-MS-1.0.0` |
| Protocol registry | `Vitalspan-FC-PROTOCOL-1.0.0` |
| Source registry | `Vitalspan-FC-SOURCE-1.0.0` |
| Confidence registry | `Vitalspan-FC-CONFIDENCE-1.0.0` |
| Review date | 18 July 2026 |
| Governing evidence review | Phase 6.0A |
| Scope | Scientific measurement policy only |
| Production recommendation | **Production Ready, subject to the controls in this standard** |

## 1. Decision

Vitalspan may accept measurements from the eight tests authorized by Phase 6.0A,
but only when the result is bound to an identified protocol, endpoint, source,
session, and provenance record. The fact that a test name is recognized is not
sufficient for acceptance.

The official policy is:

- Hand Grip Strength, usual Gait Speed, the Four-Meter Walk, the 30-Second Chair
  Stand, standalone Five Times Sit-to-Stand, and raw SPPB component measurements
  are **Production Eligible** under an authorized protocol.
- Timed Up and Go is **Conditionally Production Eligible** as a mobility test. It
  must not be used alone to diagnose fall risk, neurological disease, or frailty.
- The Six-Minute Walk Test is **Conditionally Production Eligible** as a supervised
  submaximal field-walking test in an appropriate clinical or research setting.
  It is not an unsupervised home test and is not a substitute for CPET or VO₂max.
- A Four-Meter Walk may be represented as a named usual-gait-speed protocol, but
  it remains scientifically distinct from four-metre fast walking, a rolling-start
  walk, or a walk measured over another distance.
- Standalone Five Times Sit-to-Stand ends when the participant returns to the
  chair after the fifth stand. The SPPB repeated-chair component ends at full
  standing on the fifth rise. They are different endpoints and are not
  interchangeable.
- SPPB is accepted only when its three components are administered in the official
  sequence. This phase stores the raw component observations. It does not create,
  calculate, reconstruct, or interpret a battery total.
- No location, professional title, device brand, app, or ingestion channel confers
  confidence by itself. Confidence follows the observed method and the completeness
  of its evidence and provenance.
- Consumer-wearable, self-reported, and unverified manually entered values are not
  accepted as measurements of these administered tests.
- Cross-session comparison is authorized only when the protocol identity and all
  comparison-critical conditions are compatible.

This standard contains no calculations, formulas, clinical categories, composite
indices, or user-ranking rules. It does not authorize implementation or UI.

## 2. Scope and authority

### 2.1 Tests in scope

This standard governs these independent measurements:

1. Hand Grip Strength.
2. Usual Gait Speed.
3. Four-Meter Walk at usual pace.
4. 30-Second Chair Stand.
5. Five Times Sit-to-Stand.
6. Timed Up and Go.
7. Six-Minute Walk Test.
8. Short Physical Performance Battery.

The Four-Meter Walk is listed separately because Phase 6.0A requested a named
protocol standard. It is also a protocol family within usual Gait Speed. A stored
record must not duplicate one observed walk as though it were two independent
measurements.

### 2.2 What this standard does not authorize

It does not authorize:

- reference matching, percentiles, categories, clinical cut points, or user-facing
  interpretation;
- a Vitalspan Functional Capacity total or cross-test aggregation;
- calculation or modification of an official SPPB total;
- biological age, fitness age, mortality prediction, diagnosis, or treatment;
- conversion of 6MWT distance into VO2max, VO2peak, or aerobic capacity;
- inferring an unrecorded protocol, chair height, walking aid, hand, course, pace,
  endpoint, trial-selection rule, or safety outcome; or
- production code, persistence design, API behavior, interface design, or device
  integration.

### 2.3 Normative language

In this document, **required** defines a condition for an accepted standard result;
**conditionally accepted** identifies a scientifically legitimate variant that must
remain separately labelled; and **not comparable** means that two results must not
be treated as repeated measurements of the same protocol.

## 3. Primary questions

| Question | Official answer |
| --- | --- |
| What is the official protocol? | Each test has an authorized protocol family in Section 8. The preferred platform protocols are Southampton for grip, NIA/SPPB static-start procedures for usual four-metre gait, CDC STEADI for 30-Second Chair Stand and TUG, the established standalone 5xSTS procedure, ERS/ATS for 6MWT, and the unmodified NIA SPPB sequence. |
| Are protocol variations acceptable? | Yes, only when supported by a published standard or validation evidence, named explicitly, and stored with all comparison-critical metadata. A variant remains a different protocol identity. |
| Which variations invalidate comparison? | Any unrecorded or changed element known to affect the endpoint, including grip device/posture/hand/handle; gait pace/distance/start/timing; chair height/arm use/end position; TUG course/chair/aid/task; 6MWT course/oxygen/encouragement/repetition; or SPPB component/order change. |
| Can an incomplete or interrupted test yield the standard endpoint? | Generally no. It may yield an auditable attempt record, and the 6MWT may include protocol-permitted rests while its clock continues. An early-terminated 6MWT is not a standard completed endpoint. |
| Can a wearable or manual user value be accepted? | No. These tests require a defined administered task. A wearable may provide supplementary sensor data only after device-specific validation; it cannot replace the reference endpoint. An unverified manual user value is unsupported. |

## 4. Scientific foundation and evidence hierarchy

Phase 6.0A established the clinical validity and outcome relevance of the test set.
This phase gives greatest protocol authority to official technical standards and
administration manuals, then to professional outcome-measure guidance, measurement-
property reviews, and original validation studies.

The principal authorities are:

- the National Institute on Aging SPPB materials and LIFE study manual for the
  balance, static-start gait, and chair-rise procedures
  ([NIA SPPB resource](https://www.nia.nih.gov/research/labs/leps/short-physical-performance-battery-sppb);
  [LIFE physical-measurements manual](https://agingresearchbiobank.nia.nih.gov/studies/life/documents/download/Manual_of_Procedures_Pilot/16.pLIFE-MOP%20Chapter%2016-Physical%20Measurements.pdf/));
- CDC STEADI administration sheets for the 30-Second Chair Stand and TUG
  ([CDC chair-stand protocol](https://www.cdc.gov/steadi/media/pdfs/STEADI-Assessment-30Sec-508.pdf);
  [CDC TUG protocol](https://www.cdc.gov/steadi/media/pdfs/STEADI-Assessment-TUG-508.pdf));
- the ERS/ATS field-walking technical standard for 6MWT
  ([ERS/ATS technical standard](https://www.thoracic.org/statements/resources/copd/FWT-Tech-Std.pdf);
  [ATS field-walking resource](https://site.thoracic.org/assemblies/pr/outcome-measures/field-walking-tests));
- the Southampton grip protocol and ASHT standardized assessment tradition
  ([Southampton protocol](https://eprints.soton.ac.uk/466286/1/1071942.pdf);
  [ASHT clinical assessment recommendations](https://asht.org/practice/clinical-assessment-recommendations)); and
- published professional summaries for standalone 5xSTS and TUG
  ([Five Times Sit-to-Stand](https://www.sralab.org/rehabilitation-measures/five-times-sit-stand-test);
  [Timed Up and Go](https://www.sralab.org/rehabilitation-measures/timed-and-go)).

The protocols are highly standardized, but not identical across authorities.
Experimental evidence shows that gait starting condition and timing method can
materially change the observed speed, and that different grip dynamometers may
change clinical classification. Standardization is therefore a scientific validity
requirement, not administrative detail
([gait-protocol comparison](https://pmc.ncbi.nlm.nih.gov/articles/PMC4271538/);
 [grip-device comparison](https://pmc.ncbi.nlm.nih.gov/articles/PMC8649858/)).

Recent measurement-property syntheses support the reliability and validity of
usual gait speed in community-dwelling older adults, while rating portions of the
evidence low quality; support high test-retest reliability for 5xSTS across adult
populations; and find SPPB measurement properties established but population and
study-quality dependent. TUG is extensively validated in older and clinical
populations, but evidence is thinner in younger adults and its many variants must
remain separate. The ERS/ATS 6MWT systematic review documents repeatability together
with a learning effect that directly informs the two-test baseline policy
([gait-speed COSMIN review](https://pubmed.ncbi.nlm.nih.gov/38517125/);
 [5xSTS meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8228261/);
 [SPPB systematic review](https://pubmed.ncbi.nlm.nih.gov/35442231/);
 [TUG systematic review](https://pubmed.ncbi.nlm.nih.gov/31656104/);
 [ERS/ATS field-walking systematic review](https://www.thoracic.org/statements/resources/copd/FWT-Syst-Rev.pdf)).

## 5. Measurement ontology

### 5.1 The observed event

Every record must distinguish:

- **test session:** one scheduled administration under one protocol and setting;
- **attempt:** a discrete trial within that session;
- **raw observation:** what was directly read or timed;
- **selected endpoint:** the protocol-authorized attempt or set of observations;
- **protocol deviation:** any difference from the named protocol;
- **completion state:** whether the endpoint was completed as specified; and
- **comparison eligibility:** whether another result is sufficiently compatible for
  longitudinal comparison.

An attempt that fails quality or safety requirements remains part of the historical
audit record. It must not be silently deleted, averaged, or converted into a
standard result.

### 5.2 Endpoint identity

The following distinctions are mandatory:

| Test | Endpoint identity that must be preserved |
| --- | --- |
| Grip | hand, device, handle setting, posture, attempt, and protocol selection rule |
| Usual Gait Speed | exact distance, static or rolling start, usual pace, surface, timing method, aid, and trial rule |
| Four-Meter Walk | exact four-metre course, start rule, crossing rule, usual pace, aid, and trial rule |
| 30-Second Chair Stand | completed full stands during the fixed interval, including the published expiration rule |
| 5xSTS | time from command until the buttocks contact the chair after the fifth full stand |
| TUG | time from command through standing, exact course, turn, return, and sitting |
| 6MWT | total ground distance during the fixed test duration under the standardized corridor protocol |
| SPPB | the separately observed balance holds, gait trials, and SPPB-specific chair sequence; no Vitalspan total |

### 5.3 Completion and validity states

| State | Scientific meaning | Endpoint availability |
| --- | --- | --- |
| **Accepted** | Required protocol and provenance complete; no material deviation | Native endpoint may be retained |
| **Accepted — conditional comparison** | Legitimate named variant or permitted aid/condition is fully recorded | Endpoint retained; comparison restricted to compatible conditions |
| **Incomplete — no standard endpoint** | Test started but required task or repetitions were not completed | Attempt retained; no completed endpoint |
| **Interrupted — not comparable** | Interruption was outside the protocol or early safety termination occurred | Attempt retained; not a standard comparison result |
| **Invalid** | Value, unit, timing, protocol, or identity is internally impossible or materially defective | No scientific endpoint |
| **Unsupported** | Claimed source or method does not establish that the standardized test occurred | No scientific endpoint |

These are data-quality states, not health classifications.

## 6. Confidence registry

Confidence describes how well an observation establishes the named measurement. It
does not describe whether a person's performance is favorable.

For this standard, repeatability means consistency under the same method and
conditions; reproducibility extends that question across assessors, equipment, or
settings. Published high reliability does not authorize interchangeability when a
comparison-critical condition changes. Method agreement, not reliability or
correlation alone, is required to bridge methods.

| Confidence | Definition | Minimum conditions |
| --- | --- | --- |
| **Clinical Grade** | Direct observation under an authoritative clinical protocol with qualified administration, controlled equipment, safety procedures, and complete source record | All required metadata; qualified assessor; equipment and environment conform; no material deviation; original record available |
| **High Confidence** | Direct standardized observation with strong protocol control and quality assurance, commonly in trained research assessment | All required metadata; trained assessor; auditable protocol; calibrated or verified equipment; complete attempt record |
| **Moderate Confidence** | Direct observation under a recognized protocol with a permitted setting or procedural limitation that reduces control | Limitation explicit; safety adequate; no missing comparison-critical field; interpretation restricted |
| **Low Confidence** | Plausible observed task with material limitations, incomplete quality assurance, or a legitimate but weakly standardized context | Retain only where a later policy explicitly permits; no reference or change interpretation by default |
| **Research Only** | Experimental sensor, remote, adapted, or algorithmic method not authorized as the clinical endpoint | May be retained in a segregated research context; must not be represented as the standard test |
| **Unsupported** | Self-report, unverified entry, inferred value, consumer-wearable surrogate, or irrecoverably incomplete provenance | Not an accepted Functional Capacity measurement |

Clinical Grade is not a claim that the result is diagnostic or error-free. A High
Confidence research assessment may be methodologically stronger than routine care;
the different labels preserve source context rather than rank professions.

## 7. Source classification registry

### 7.1 Source classes

| Source class | Default confidence | Accepted use | Conditions and exclusions |
| --- | --- | --- | --- |
| Qualified clinical assessment | Clinical Grade | All tests appropriate to the service | Exact authorized protocol, trained assessor, equipment control, safety screening, and original record required |
| Rehabilitation-clinic assessment | Clinical Grade | All appropriate tests; 6MWT only with required emergency readiness | Same conditions as clinical assessment; treatment context does not alter the endpoint |
| Trained research assessment | High Confidence | All tests under an approved protocol | Training, protocol version, source data, equipment QC, deviations, and adverse events documented |
| Live, professionally supervised home assessment | Moderate Confidence | Grip, short gait, chair tests, TUG, or SPPB components when the home can meet the protocol | Exact setup verified live; safety helper or guarding where required; no general home 6MWT authorization |
| Unsupervised home assessment | Research Only | Research capture only | Cannot establish protocol adherence, safety, timing, or environmental equivalence for production interpretation |
| Connected medical device | Research Only by default; High Confidence only after method-specific authorization | Supplementary timing, force, or distance capture | Exact model, firmware, algorithm, calibration, and validation against the relevant reference method required; correlation alone is insufficient |
| Consumer wearable or phone passive measure | Unsupported as the named test | None | Free-living gait, steps, estimated strength, or estimated distance is not an administered test endpoint |
| Clinician transcription of an original record | Inherits underlying confidence, with a transcription flag | All tests if the source document is available | Entry channel is not the source; original observer, protocol, date, units, and record identity required |
| User transcription with verifiable source document | Low Confidence pending verification; may inherit after independent verification | Historical retention only until verified | Must preserve document; no interpretation while unverified |
| Manual user entry without source evidence | Unsupported | None | Self-reported time, count, force, or distance is not accepted |
| Self-reported ability or questionnaire | Unsupported as these tests | None | May belong to another domain but is not objective performance testing |

### 7.2 Test-specific source limits

| Test | Home-supervised ceiling | Device or wearable policy |
| --- | --- | --- |
| Grip | Moderate Confidence; exact dynamometer and posture required | A connected dynamometer may qualify only after device-specific agreement and calibration validation |
| Usual gait / 4 m | Moderate Confidence; measured course, full-body view, helper, and exact timing required | Validated timing gates may qualify; passive wearable gait speed does not |
| 30-Second Chair Stand | Moderate Confidence with verified chair and live guarding | Video or sensor repetition detection is supplementary until endpoint-specific validation |
| 5xSTS | Moderate Confidence with verified chair, endpoint, and live guarding | Automated timing is supplementary until endpoint-specific validation |
| TUG | Moderate Confidence only under an approved live tele-assessment procedure | Passive mobility, phone TUG, and instrumented TUG are separate research methods unless specifically authorized |
| 6MWT | No general home production authorization | Wearable distance estimates, GPS routes, treadmills, and unsupervised app tests are not standard 6MWT |
| SPPB | Moderate Confidence only with a trained live assessor, safe layout, and complete sequence | An app may support administration but does not replace direct protocol observation |

CDC has published a telemedicine adaptation of TUG that requires an appropriate
measured space, safe chair placement, visual observation, and safety support. This
supports a constrained live home pathway, not unsupervised self-testing
([CDC tele-STEADI guide](https://www.cdc.gov/steadi/media/pdfs/2024/08/Telesteadi-Guide_H_WEB.pdf)).

## 8. Test measurement standards

### 8.1 Hand Grip Strength

**Purpose and endpoint.** Hand Grip Strength records maximal voluntary isometric
grip force for a named hand under a standardized posture. It samples upper-limb
strength and broader neuromuscular function, but it is not a diagnosis of
sarcopenia, nutrition, frailty, or whole-body strength.

**Preferred platform protocol — Southampton.** The participant sits in a standard
chair with arm supports. The tested forearm rests on the chair arm, the wrist is
neutral just beyond the support, and the dynamometer is lightly supported at its
base without assisting the squeeze. The handle is adjusted for comfort and the
setting recorded. After demonstration, the right and left hands are tested in
alternation until three observations per hand are obtained. The participant is
asked to squeeze maximally until the reading no longer rises. Each observation is
retained; the protocol-selected maximum for each hand is the endpoint. The original
Southampton manual records analogue readings to the nearest kilogram-force
([Southampton protocol](https://eprints.soton.ac.uk/466286/1/1071942.pdf)).

**Conditionally accepted protocol family — ASHT.** A seated ASHT-style procedure
with shoulder adducted, elbow at approximately a right angle, forearm neutral, and
standardized wrist position is scientifically accepted when its exact edition,
device, handle, repetitions, rest, and selection rule are recorded. The ASHT and
Southampton postures are not interchangeable. A supine, standing, bed-seated, or
unsupported-arm adaptation is a separate protocol and is not eligible for direct
comparison with either preferred family.

| Field | Official standard |
| --- | --- |
| Equipment | Calibrated hydraulic or electronic hand dynamometer with documented make, model, serial or asset identifier, handle setting, resolution, and calibration status; a stable chair matching the protocol |
| Environment | Quiet, private, stable chair and floor, enough space for standardized posture; no tester contact that assists force production |
| Preparation | Explain and demonstrate; identify dominant hand without inferring it; record acute pain, recent exertion, relevant upper-limb restriction, and whether maximal effort is safe |
| Attempts | Three per hand in alternating order for Southampton; the named protocol's published attempt count for another authorized family; every attempt retained |
| Rest | Alternating hands supplies recovery in Southampton; any additional or protocol-specific interval must be recorded and kept consistent on retest |
| Endpoint | Protocol-selected maximal observed force for each hand; never an undocumented mean or combination of hands |
| Canonical unit | Kilogram-force, labelled explicitly as force rather than body mass |
| Accepted alternatives | Pound-force or newtons from a traceable source; original value and unit retained; conversion must use a separately governed exact unit standard |
| Precision | Preserve device resolution; Southampton analogue reporting no finer than the nearest kilogram-force; do not add decimal precision not supported by the instrument |
| Repeatability and reliability | Generally high with standardized position, device, instructions, and effort; learning, fatigue, pain, tester encouragement, and device disagreement can dominate change interpretation |
| Required metadata | Hand, dominance status, posture protocol, arm support, shoulder/elbow/wrist position, device details, handle setting, calibration/QC, attempt order, all readings, selection rule, assessor, pain/restriction, assistance, date and time |

**Invalid or not comparable.** Unknown hand; mixed hands; unknown device; altered
handle; different device without agreement evidence; changed posture; unrecorded arm
support; assistance; submaximal instruction represented as maximal; fewer attempts
silently treated as the preferred protocol; or pain-limited effort represented as
unlimited maximal force. Device agreement must be established directly; a strong
correlation between devices does not make their values interchangeable.

**Applicable populations and limitations.** Commonly used in adults and older
adults, including clinical populations able to understand the task and grip the
device. Hand pathology, arthritis, pain, neurological impairment, recent upper-
limb surgery or injury, cognition, body size, and motivation influence the result.
Defer or obtain clinician authorization when maximal gripping may breach a surgical
or medical restriction. Production suitability is **Production Eligible** under an
authorized protocol.

### 8.2 Usual Gait Speed

**Purpose and endpoint.** Usual Gait Speed measures over-ground locomotion at the
participant's usual or comfortable pace across a precisely measured course. Pace,
start condition, distance, timing technology, and aids are part of the measurement,
not optional notes.

**Preferred platform family.** A static start over four metres following the NIA
SPPB method in Section 8.3. Other published usual-speed protocols using three, six,
or ten metres, or a defined rolling start, may be conditionally accepted as their
own protocol identities. They are not interchangeable with the preferred family.

| Field | Official standard |
| --- | --- |
| Equipment | Calibrated tape or fixed measured course, high-contrast start and finish marks, stopwatch or validated timing gates, stable usual walking aid when applicable |
| Environment | Level, straight, unobstructed, well-lit, non-slip surface with adequate space beyond the finish; surface type recorded |
| Preparation | Usual footwear; usual medically required aid; demonstrate instructions; record symptoms, assistance, orthoses, oxygen equipment, and practice status |
| Pace | Usual or comfortable pace only. Fast, maximal, hurried, dual-task, or externally paced walking is a different test |
| Start | Static or rolling start must be declared. Exact acceleration distance for a rolling start is required |
| Attempts | Follow the named protocol; both trials retained where two are required; selected trial rule declared in advance |
| Endpoint | Native elapsed time and the protocol-associated speed, with distance and time both retained |
| Canonical unit | Metres per second for the selected usual-speed endpoint; raw seconds and course metres remain mandatory observations |
| Accepted alternatives | Centimetres per second; course distance originally marked in feet only when exact measurement and original unit are preserved |
| Precision | Manual elapsed time no finer than one hundredth of a second; derived reporting must not imply greater timing accuracy; device resolution retained |
| Repeatability and reliability | Usually good under a fixed protocol; short courses are sensitive to manual timing, acceleration, tester rule, and within-person variability |
| Required metadata | Exact distance, pace wording, static/rolling start, acceleration and deceleration zones, start/finish trigger, timing method/device, trials, selection rule, footwear, aid, physical assistance, surface, assessor, symptoms, date and time |

**Invalid or not comparable.** Unknown pace; participant runs; a fast trial labelled
usual; treadmill speed; passive free-living wearable estimate; unknown course;
course measured by unverified step count or consumer GPS; mixed static and rolling
starts; change from stopwatch to sensor without method-agreement evidence; changed
aid; physical assistance; or use of a protocol-incompatible reference.

Static-start and dynamic-start gait speeds differ systematically, and tester and
timing rules also influence results
([protocol effects](https://pmc.ncbi.nlm.nih.gov/articles/PMC4271538/);
 [tester and timing effects](https://pmc.ncbi.nlm.nih.gov/articles/PMC6790294/)).
The measurement is **Production Eligible**, but comparison and later reference
matching must be protocol-specific.

**Applicable populations and clinical limitations.** Usual gait speed is most
established in adults and older adults who can traverse the course, with or without
a usual aid, and has also been validated in many disease-specific populations.
Measurement reliability and validity are supported in community-dwelling older
adults, but the evidence does not make different populations, aids, protocols, or
settings interchangeable
([usual-gait-speed measurement review](https://pubmed.ncbi.nlm.nih.gov/38517125/)).
Very high-functioning adults may show limited discrimination on a short usual-pace
course, while acute illness, pain, cognition, neurological disease, and fear of
falling may affect performance without identifying the cause.

### 8.3 Four-Meter Walk at usual pace

**Purpose and endpoint.** This is Vitalspan's preferred short usual-gait-speed
protocol. It records the time to traverse an exact four-metre course from a static
start, with the selected usual-pace endpoint retaining its native time and gait-
speed identity.

**Official procedure.** Use an unobstructed course with a marked start, a marked
four-metre finish, and sufficient safe space past the finish. The participant
stands with toes behind the starting line and begins from rest. After demonstration,
the participant walks at usual pace and continues beyond the finish. Timing begins
when the participant initiates the walk under the named manual's trigger rule and
ends when the first foot has completely crossed the finish. Two timed trials are
recorded; the faster qualifying trial is selected. The NIA manual records manual
times to one hundredth of a second. The assessor remains close enough for safety
without pacing and records the usual aid
([NIA/LIFE manual](https://agingresearchbiobank.nia.nih.gov/studies/life/documents/download/Manual_of_Procedures_Pilot/16.pLIFE-MOP%20Chapter%2016-Physical%20Measurements.pdf/)).

The NIH Toolbox adaptation, with demonstration, one practice, and two timed static-
start usual-pace trials, is conditionally accepted as a separately named family
([NIH Toolbox data structure](https://fitbir.nih.gov/dictionary/publicData/dataStructureAction%21view.action?dataStructureName=NIHTB4MtrWlkGtSpeedTest&publicArea=true&style.key=FITBIR-style)).

| Field | Official standard |
| --- | --- |
| Course | Exactly four metres, measured with a traceable tape or fixed validated layout; at least an additional half metre of safe space is preferred at each end |
| Equipment | Course markings, stopwatch or validated timing system, usual aid if needed |
| Environment | Straight, level, unobstructed, well-lit, non-slip over-ground surface |
| Attempts | Demonstration; practice status recorded; two timed trials; retain both and select the faster completed trial |
| Endpoint | Selected completion time and associated usual gait-speed endpoint; do not discard trial-level times |
| Canonical unit | Metres per second, with seconds and exact four-metre distance retained |
| Precision | Manual time to one hundredth of a second; do not claim precision beyond the timing method |
| Required metadata | All usual-gait fields plus exact NIA/SPPB or NIH Toolbox protocol identity and version |

**Acceptable variants.** The NIA three-metre option is permitted only when space
prevents four metres and must be stored as a three-metre SPPB protocol, not as a
Four-Meter Walk. A four-metre rolling-start method, automated gates, or maximum-
speed trial may be a scientifically valid separate research or clinical test, but
it is not the preferred Four-Meter Walk and is not directly comparable.

**Limitations.** Manual reaction time is important over a short course, a static
start incorporates acceleration, and reliability for individual change is not
perfect even when group validity is strong. The NIH Toolbox study supports use
across a broad age span but also illustrates protocol-specific reliability and
normative dependence
([NIH Toolbox reliability study](https://pmc.ncbi.nlm.nih.gov/articles/PMC6363908/)).
Production suitability is **Production Eligible**.

**Applicable populations and clinical limitations.** The four-metre test is
clinically practical for adults and older adults able to walk the course; the NIH
Toolbox has studied a broad age span. Its strongest longevity and geriatric use
remains population- and protocol-specific. Static-start acceleration, manual
reaction time, a short course, aids, and ceiling effects in highly mobile people
limit individual change claims.

### 8.4 30-Second Chair Stand

**Purpose and endpoint.** The 30-Second Chair Stand measures repeated transfer
performance and lower-limb functional strength/endurance. The endpoint is an
integer count of qualifying full stands during the fixed interval.

**Official procedure — CDC STEADI family.** Use a straight-backed, armless chair
with a seat approximately 43 cm high, placed on a stable non-slip surface. The
participant sits in the middle, feet flat, back straight, and wrists crossed with
hands on opposite shoulders. After explanation and demonstration, timing begins at
the command. The participant rises to full standing and returns to sitting as many
times as possible during the fixed interval. Count full stands; the CDC rule counts
the final repetition when the participant is more than halfway to standing at
expiration. The assessor stands close for safety. If arm support is required, stop
the standard test
([CDC protocol](https://www.cdc.gov/steadi/media/pdfs/STEADI-Assessment-30Sec-508.pdf)).

The original older-adult validation study found good test-retest stability and
construct support, but does not establish the same reliability for every age,
disease, chair, or adapted protocol
([30-Second Chair Stand validation](https://pubmed.ncbi.nlm.nih.gov/10380242/)).

| Field | Official standard |
| --- | --- |
| Equipment | Straight-back armless chair, measured seat height near 43 cm, stable floor, stopwatch |
| Environment | Clear, well-lit, non-slip area; chair stabilized against movement without altering seat access |
| Preparation | Usual stable footwear; explain and demonstrate; record pain, aid, orthosis, recent exertion, and relevant restriction |
| Attempts | One standard timed attempt after demonstration; an extra attempt only for a documented technical invalidation after adequate recovery |
| Endpoint | Integer qualifying repetitions under the published expiration rule |
| Canonical unit | Completed stands; integer only |
| Accepted alternatives | None. A fraction, time-to-repetitions, or estimate is not this endpoint |
| Precision | Whole repetitions; fixed duration verified by the timing source |
| Repeatability and reliability | Generally good when chair, arms, instructions, and counting rule are fixed; learning, pacing, fatigue, and chair height affect results |
| Required metadata | Chair height, back and armrest status, feet/arm position, expiration rule, attempt status, repetition count, any arm use or assistance, symptoms, interruption, assessor, date and time |

**Incomplete and invalid results.** The CDC sheet records zero if arm use is
required. Vitalspan must retain that source convention only as part of the original
record and must also retain “unable without arm support” or the applicable reason.
It must not represent inability, refusal, contraindication, interruption, or a
technical failure as an observed completed count of zero. Partial repetitions other
than the published expiration rule are not counted.

Chairs of 43–45 cm used by a published clinical protocol may be conditionally
accepted if exact height is stored, but changed chair height, arm support, raised
seats, external assistance, or modified range invalidates standard longitudinal
comparison. Production suitability is **Production Eligible**.

**Applicable populations and clinical limitations.** The foundational protocol
was validated in community-residing adults over 60 and is widely used in older-
adult falls and function pathways. Disease-specific adult use requires appropriate
validation and safety. The task depends on balance, technique, joint motion, pain,
motivation, and cardiopulmonary tolerance as well as lower-limb strength; it does
not isolate a muscle group or diagnose a cause of low performance.

### 8.5 Five Times Sit-to-Stand

**Purpose and endpoint.** Standalone 5xSTS measures the time required to complete
five full sit-to-stand-to-sit cycles. It is a transfer and lower-limb functional-
strength measure, not a direct isolated muscle-force test.

**Official standalone procedure.** Use a stable standard-height chair, generally
43–45 cm, with a backrest. Record the exact chair height and keep the same chair for
retest. The participant starts seated with back against the chair, feet placed
comfortably, and arms folded across the chest. Demonstrate or provide one practice
trial as appropriate. At the command, the participant stands fully and sits five
times as quickly and safely as possible. Timing starts at the command and ends when
the buttocks contact the chair after the fifth repetition. Retain whether the back
touched between repetitions and any assistance. The common clinical protocol
specifies one practice and treats inability to finish without arm support or human
assistance as failure to complete the standard test
([5xSTS protocol summary](https://www.sralab.org/rehabilitation-measures/five-times-sit-stand-test)).

| Field | Official standard |
| --- | --- |
| Equipment | Stable 43–45 cm chair with backrest, exact seat height recorded, stopwatch |
| Environment | Clear, non-slip area with guarding space |
| Preparation | Explain and demonstrate; usual stable footwear; record symptoms, pain, orthosis, chair familiarity, and practice status |
| Attempts | One practice and one timed attempt; demonstration plus limited familiarization may replace a full practice when fatigue is a material concern and must be labelled |
| Endpoint | Seconds from the command until buttocks contact after the fifth full stand |
| Canonical unit | Seconds |
| Accepted alternatives | None; milliseconds may be retained as device source precision but the method must justify it |
| Precision | Manual reporting no finer than one hundredth of a second |
| Repeatability and reliability | Generally high in many adult clinical populations under standardized conditions; chair height, endpoint definition, arm use, practice, and encouragement materially affect results |
| Required metadata | Standalone protocol identity, exact chair height/type, start and finish triggers, arms/feet/back position, practice, all attempts, assistance, completion, symptoms, assessor, date and time |

**Critical distinction from SPPB.** The SPPB chair component stops at full standing
on the fifth rise and includes a single-stand safety screen. Standalone 5xSTS stops
after the participant sits following the fifth rise. A result with unknown final
position is not safely classifiable. Neither endpoint may be converted, relabelled,
or compared with the other.

Arm support, physical assistance, altered chair height, incomplete range, unknown
endpoint, or inability to complete all five repetitions produces an incomplete or
adapted attempt, not a standard timed 5xSTS endpoint. Production suitability is
**Production Eligible**.

**Applicable populations and clinical limitations.** 5xSTS has high test-retest
reliability evidence across healthy and clinical adult populations, but protocol
heterogeneity limits pooled interpretation
([5xSTS reliability meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8228261/)).
It is applicable when the participant can attempt the chair transfer without arm
or human assistance. It is not a valid standard endpoint for those who cannot do
so, and it reflects balance, movement strategy, pain, and speed as well as lower-
limb function.

### 8.6 Timed Up and Go

**Purpose and endpoint.** TUG is a composite mobility task involving a sit-to-stand
transfer, straight walking, turning, return walking, and sitting. The endpoint is
completion time under the exact task conditions. It is not a standalone fall-risk
diagnosis.

**Preferred platform procedure — standard single-task TUG.** The participant begins
seated back in a standard armchair, wearing regular footwear and using the usual
walking aid if needed. Mark an exact three-metre course, or the CDC's documented
ten-foot course. At the command, begin timing as the participant stands, walks at
normal pace to the line, turns, walks back, and sits. Stop timing when seated again.
Remain close enough to guard without assisting or pacing. One untimed practice
followed by one timed trial is preferred; a CDC administration without practice is
accepted only when practice status is explicit
([CDC TUG protocol](https://www.cdc.gov/steadi/media/pdfs/STEADI-Assessment-TUG-508.pdf);
 [RehabMeasures TUG](https://www.sralab.org/rehabilitation-measures/timed-and-go)).

| Field | Official standard |
| --- | --- |
| Equipment | Standard armchair, exact seat height and armrest status, measured three-metre or ten-foot line, stopwatch |
| Environment | Level, unobstructed, well-lit, non-slip course with safe turning and guarding space |
| Preparation | Regular footwear, usual aid, instructions and demonstration, practice status, symptom and safety screen |
| Attempts | One practice plus one timed attempt preferred; a second timed attempt only under a named protocol or after technical invalidation |
| Endpoint | Seconds from the start command until seated again after completing the standard single task |
| Canonical unit | Seconds |
| Accepted alternatives | None; exact course may be three metres or ten feet but must remain explicit |
| Precision | Manual reporting no finer than one hundredth of a second |
| Repeatability and reliability | Commonly good under fixed conditions; chair, aid, turn strategy, pace, practice, cognition, and manual timing contribute variability |
| Required metadata | Course distance and unit, chair dimensions, start/finish trigger, pace, task type, practice, aid, footwear, assistance, turn direction if prescribed, observer findings, interruption, assessor, date and time |

**Separate variants.** Cognitive dual-task TUG, manual-task TUG, fast TUG,
instrumented TUG, phone-derived TUG, altered turn distance, and physical-assistance
TUG are distinct tests. They are Research Only unless separately authorized and
must never be merged with standard TUG.

For a live home TUG, the full course and participant must be visible, the chair and
distance verified, hazards removed, the chair secured appropriately, and an able
helper available when required by the remote safety plan. Unsupervised home TUG is
Research Only. Production suitability is **Conditionally Production Eligible** for
mobility measurement.

**Applicable populations and clinical limitations.** TUG is most established in
older adults and in neurological, vestibular, musculoskeletal, and rehabilitation
populations. Evidence is less mature in younger adults, and ceiling effects may
occur in high-functioning people
([TUG systematic review](https://pubmed.ncbi.nlm.nih.gov/31656104/)). It combines
several tasks, so a slower result cannot identify whether transfer, gait, turn,
balance, cognition, pain, or confidence is responsible. It must not be used alone
as a falls classifier.

### 8.7 Six-Minute Walk Test

**Purpose and endpoint.** 6MWT measures the distance an individual can walk over
ground during a standardized, self-paced, submaximal field test. It integrates
multiple systems and is clinically mature in chronic cardiopulmonary and selected
other populations. It does not establish maximal oxygen uptake or the mechanism of
limitation.

**Official procedure — ERS/ATS family.** Conduct the test on a flat, straight, hard,
low-traffic corridor of at least 30 metres, with turnaround points marked. The
participant wears comfortable clothing and appropriate footwear, uses the usual
walking aid, and follows the protocol's medication and oxygen conditions. There is
no warm-up. After the required seated pre-test rest and safety observations, give
the standardized instructions. The participant walks as far as possible without
running. Standardized time announcements and encouragement are used; extra coaching
and pacing are prohibited. Permitted rests occur with the timer continuing, and
rest timing and reason are recorded. At expiration, mark the position and record
the total corridor distance to the nearest metre, all rests, symptoms, and safety
observations
([ERS/ATS technical standard](https://www.thoracic.org/statements/resources/copd/FWT-Tech-Std.pdf)).

| Field | Official standard |
| --- | --- |
| Equipment | Measured corridor, turn markers, countdown timer, lap counter, distance marker, chair, communication access, vital-sign and pulse-oximetry equipment appropriate to the clinical standard, emergency equipment and response pathway |
| Environment | Indoor, level, straight, hard-surface course of at least 30 m with low traffic and controlled temperature/conditions; any outdoor administration is a separate protocol |
| Preparation | Appropriate clothing/footwear; usual aid; protocol-defined medication and oxygen state; no vigorous exertion in the preceding two hours; no warm-up; seated baseline rest of at least 15 minutes under the current technical standard |
| Attempts | Two tests are required for a stable baseline intended for longitudinal or treatment-response use; allow at least 30 minutes and return toward baseline between tests; retain both and select the greater qualifying distance. A single test may be retained as one-off status but is conditionally comparable |
| Rest | Participant may slow, stop, or rest while the timer continues; all rest events and total rest time recorded |
| Endpoint | Total over-ground distance completed during the fixed test duration, with lap and partial-lap source observations retained |
| Canonical unit | Metres |
| Accepted alternatives | Feet from an exact measured source; original unit retained and converted under the governed unit standard |
| Precision | Nearest metre for the standard corridor endpoint; do not add precision from consumer GPS or step estimates |
| Repeatability and reliability | High in many chronic respiratory populations when standardized; a material learning effect supports duplicate baseline testing; course length, encouragement, oxygen, aid, and disease state affect results |
| Required metadata | Indication and population, course length/layout/surface, indoor/outdoor status, laps/partial distance, all attempts, rest events, standardized encouragement confirmation, assessor, aid, oxygen device/flow/carrier, medications per protocol, baseline/end/nadir safety observations as required, symptoms, stop reason, adverse event, date and time |

The ATS field-walking resource reports strong test-retest performance in several
chronic respiratory populations while emphasizing standardized instructions and
encouragement. Those measurement properties do not establish general-population
interchangeability or remove the learning effect
([ATS field-walking resource](https://site.thoracic.org/assemblies/pr/outcome-measures/field-walking-tests)).

**Not acceptable as standard 6MWT.** Treadmill testing; circular or materially short
courses; unsupervised home or outdoor app routes; consumer GPS or step-derived
distance; running; nonstandard coaching; assessor pacing; timer stopped during
rests; oxygen titrated during the distance test; unknown oxygen or aid conditions;
or an early-terminated test represented as completed. Course layouts shorter than
30 metres may be legitimate specialty protocols but are not ERS/ATS-equivalent and
are not eligible for direct comparison.

Production suitability is **Conditionally Production Eligible** only in settings
that can meet clinical safety, equipment, and emergency requirements.

**Applicable populations and clinical limitations.** The most mature technical and
measurement-property evidence is in adults with chronic respiratory disease, with
additional disease-specific evidence in cardiac, pulmonary vascular, oncology,
neurological, and rehabilitation populations. General-population use is not
authorized merely because a person can walk. The test is effort dependent,
submaximal, and affected by course, learning, turning, symptoms, encouragement,
oxygen, aids, and comorbidity; it cannot localize the limiting physiological system.

### 8.8 Short Physical Performance Battery

**Purpose and endpoint.** SPPB is a published older-adult lower-extremity performance
battery comprising standing balance, usual gait, and repeated chair rise. This
standard accepts the administered battery identity and its raw components. It does
not authorize Vitalspan to calculate or interpret a battery total.

**Official sequence.** Administer in the official order: balance, gait, then chair.
Use the NIA standardized script, demonstration, equipment, and safety procedures.
The assessor must be trained in the full battery, not merely the component tests
([NIA SPPB resource](https://www.nia.nih.gov/research/labs/leps/short-physical-performance-battery-sppb)).

**Balance component.** With eyes open and appropriate guarding, administer the
side-by-side, semi-tandem, and tandem positions in sequence. Give one attempt for
each eligible position and observe for up to ten seconds. Record the actual hold
time, including the stop reason if the participant moves the feet, seeks support,
or cannot safely continue. Do not add extra attempts or substitute another balance
test.

**Gait component.** Use the static-start usual four-metre protocol in Section 8.3,
two timed trials, with the faster completed trial selected. The NIA three-metre
space-limited alternative is accepted only when explicitly identified and is not
comparable with the four-metre component for later reference use.

**Chair component.** First administer the official single-chair-rise screen with
arms folded. Only if completed safely, administer five rises as quickly as possible.
The repeated-chair timer stops when the participant reaches full standing on the
fifth rise. Stop if arms are used, the assessor judges the task unsafe, limiting
symptoms occur, or the protocol time limit is reached. This is not the standalone
5xSTS endpoint.

| Field | Official standard |
| --- | --- |
| Equipment | Stopwatch, exact three- or four-metre marked course, tape or traceable measure, stable hard-seat straight-back chair without wheels or deep cushioning, safe balance area |
| Environment | Level, uncluttered, well-lit, non-slip surface with guarding space and adequate gait overrun |
| Preparation | Standard script and demonstration; usual footwear and aid; symptom and safety review; trained assessor; record inability, refusal, and contraindication distinctly |
| Attempts | Official component-specific attempt counts only; no informal best-of extra trials |
| Raw endpoints | Actual balance hold times and stop reasons; both gait times and selected trial; single-stand eligibility; repeated-chair time or noncompletion reason |
| Canonical units | Seconds for balance and chair observations; seconds and metres for gait source observations; no canonical Vitalspan battery-total unit |
| Precision | Balance and manually timed gait/chair results no finer than one hundredth of a second; actual source precision retained |
| Repeatability and reliability | The standardized battery has established reliability and broad older-adult adoption; component and total comparability require unchanged sequence, protocol, aid, course, and chair |
| Required metadata | Battery name/version, exact order, component completion states, every raw component observation, course, chair, aid, assistance, protocol deviations, assessor/training, safety events, date and time |

**Battery integrity policy.** Missing, reordered, substituted, or materially adapted
components invalidate the claim that a complete standard SPPB was administered. A
qualifying standalone component may still be retained under its own protocol if its
required metadata are complete. A source-reported official SPPB total may be
preserved as an external source artifact with document provenance, but Vitalspan
must not calculate, reconstruct, modify, compare, or interpret it under Phase 6.0B.

Production suitability is **Production Eligible** for the official battery protocol
and raw component capture in appropriate adult and older-adult populations. It is
not a universal measure for people unable to understand or safely attempt the tasks.

**Applicable populations and clinical limitations.** SPPB was developed for lower-
extremity function in older people and has the strongest support in older-adult and
geriatric clinical or research populations. Use in younger or disease-specific
groups requires population-appropriate evidence. The battery can have ceiling
effects, and its components are affected by pain, cognition, sensory function,
neurological disease, aids, and the environment. A component or battery result does
not identify a diagnosis
([SPPB psychometric review](https://pubmed.ncbi.nlm.nih.gov/35442231/)).

## 9. Common data standard

### 9.1 Canonical measurement table

| Test | Canonical endpoint unit | Mandatory source observations | Prohibited substitution |
| --- | --- | --- | --- |
| Grip | Kilogram-force | Every attempt, hand, device reading and original unit | Combined hands, estimated force, undocumented mean |
| Usual Gait Speed | Metres per second | Exact distance and every elapsed time | Step count, passive wearable estimate, treadmill speed |
| Four-Meter Walk | Metres per second | Exact four-metre distance and both elapsed times | Three-metre or rolling-start result relabelled as four-metre static start |
| 30-Second Chair Stand | Whole completed stands | Count and expiration/completion state | Fractional count or timed 5xSTS |
| 5xSTS | Seconds | Timed attempt and fifth-sit endpoint confirmation | SPPB chair time |
| TUG | Seconds | Timed attempt, course, chair, turn and sitting completion | Dual-task, instrumented, or passive mobility result |
| 6MWT | Metres | Laps, partial distance, rests, and exact course | Treadmill, GPS, steps, or estimated distance |
| SPPB | Native raw component units only | Balance holds, gait trials, chair screen and repeated-rise attempt | Vitalspan-created total or substituted component |

### 9.2 Unit conversion

- Preserve the original value and original unit exactly as received.
- Store the canonical representation separately and identify the conversion-standard
  version; this document does not supply equations or calculations.
- Accept only explicit physical units appropriate to the endpoint. Ambiguous `kg`
  for grip must be resolved as kilogram-force from the source record before use.
- Never convert repetitions to time, time to repetitions, walking distance to oxygen
  uptake, or one test's endpoint into another test.
- Imperial distance or force is acceptable only when the source quantity is exact,
  the original unit is preserved, and a governed exact unit conversion is later
  available.

### 9.3 Precision and decimal handling

- Preserve source precision without adding trailing scientific significance.
- Do not round the source observation destructively.
- Manual stopwatch results may be reported to one hundredth of a second, but this
  reporting convention does not imply measurement accuracy at that resolution.
- Grip precision cannot exceed the device display or official analogue convention.
- 6MWT is retained to the nearest metre under the standard corridor protocol.
- Chair-stand repetitions are integers. Fractional values are invalid except that
  the protocol's expiration observation determines whether the final repetition is
  counted; no fraction is stored as the endpoint.

### 9.4 Missing, invalid, and non-finite values

Missing is not zero. Required distinctions include not assessed, refused, unsafe,
contraindicated, unable, interrupted, technical failure, protocol deviation,
unknown, and not recorded.

A value is invalid when it is non-finite, negative, expressed in an unsupported or
ambiguous unit, inconsistent with the test's data type, temporally impossible, or
internally incompatible with the source observations. Zero is:

- invalid for positive elapsed-time, speed, force, and completed-distance endpoints;
- a possible count representation in an original 30-Second Chair Stand source but
  must be accompanied by the precise completion or arm-support reason; and
- never a replacement for a missing, refused, unsafe, or interrupted observation.

### 9.5 Physiological limits and outliers

This standard does not establish universal numerical physiological bounds. Age,
body size, disability, elite performance, device range, and clinical context make
unsupported hard cutoffs unsafe.

Policy:

- enforce logical bounds imposed by the test structure, such as whole counts,
  positive completed times, an exact course, and the fixed administration window;
- verify values outside the instrument range or plausible source context against
  the original record and equipment;
- flag, do not delete, a verified extreme result;
- do not winsorize, cap, impute, replace, or silently correct an outlier; and
- withhold comparison and later interpretation while an unresolved outlier or unit
  conflict remains.

### 9.6 Timestamps and time zones

Every session requires:

- local start date and time;
- local end date and time when materially different or required by the test;
- numeric UTC offset and named time zone when available;
- source-recorded timestamp and ingestion timestamp as separate fields;
- sufficient precision to identify the session, without fabricating seconds; and
- provenance for retrospective dates.

A date-only historical record may be retained but is **Accepted — conditional
comparison** at best and cannot support within-day ordering. An impossible,
conflicting, or absent measurement date prevents standard acceptance.

### 9.7 Duplicate and repeated measurement policy

- Generate no averages or merged “best daily” result across independent sessions.
- Preserve every attempt within its session and apply only the named protocol's
  prespecified selection rule.
- Exact duplicate records from the same source identifier, timestamp, test session,
  attempt, and value are one ingestion duplicate; retain lineage without creating a
  second scientific event.
- Similar results on the same day are not duplicates when the source session or
  attempt differs.
- If two systems contain the same source assessment, link them to one event and
  preserve both ingestion paths.
- Corrections create a new version that supersedes the prior record; never overwrite
  the original audit history.
- Repeated measurements made because of a technical error, learning protocol, or
  clinical deterioration must retain the reason and rest interval.

### 9.8 Historical storage and provenance

Storage policy is append-only at the scientific-record level. Each retained event
must identify:

- test, protocol family, protocol version, and endpoint;
- original and canonical value and unit, when applicable;
- every raw attempt required by the protocol;
- participant identifier and session identifier;
- observer identity or coded assessor role and training status;
- organization, service, setting, and source-record identity;
- ingestion method and whether the record was transcribed;
- equipment, calibration or QC status, and software/firmware where relevant;
- environment, course, chair, posture, aid, oxygen, and assistance as applicable;
- start/end/source/ingestion timestamps and time-zone information;
- preparation, deviations, completion, stops, symptoms, adverse events, and safety
  supervision;
- source document or traceable link when transcribed; and
- confidence, validation state, reason, and the versions of all governing
  registries.

No scientific conclusion may depend on an unrecorded UI selection or later memory.

## 10. Measurement quality and validation policy

### 10.1 Protocol adherence

An accepted result requires the named protocol's critical elements. Deviations are
classified before the endpoint is selected:

- **non-material:** administrative difference not affecting task performance or
  endpoint, documented with rationale;
- **comparison-limiting:** recognized variant such as a permitted aid or alternate
  course, accepted but isolated from incompatible results; or
- **invalidating:** changes the construct or endpoint, such as arm-assisted chair
  rise, wrong pace, stopped 6MWT clock, unknown 5xSTS finish position, or an inferred
  grip device.

No deviation may be silently normalized.

### 10.2 Incomplete and interrupted tests

- Retain that the test was offered and attempted, with the stage reached and reason.
- Do not create a completed time, distance, speed, count, force, or battery result.
- Protocol-permitted 6MWT rests are not interruptions when the clock continues and
  the participant resumes; early termination remains a nonstandard attempt.
- An SPPB component not attempted for safety is different from missing data and from
  refusal; the battery is incomplete in all cases, but the reasons remain distinct.
- A chair or TUG attempt requiring physical rescue or assistance is not a standard
  endpoint even if a timer value exists.

### 10.3 Repeated attempts and rest

- Use only the number of attempts authorized by the named protocol.
- Retain all attempts, not just the selected one.
- Extra attempts require a documented technical or safety reason and must not enter
  the protocol selection unless the protocol explicitly authorizes them.
- Rest intervals must follow the authoritative protocol and be recorded when they
  can affect comparability.
- Stop repeated maximal attempts when pain, unsafe fatigue, cardiopulmonary symptoms,
  or loss of task quality emerges.

### 10.4 Observer influence

Assessors must use standardized scripts, neutral demonstrations, and only the
published encouragement. They must not pace walking tests, physically assist a
standard attempt, reveal a prior result to induce performance, or vary coaching
between sessions. Guarding without contact is permitted and expected where safety
requires it. Contact, cueing, or assistance must be recorded.

Training and periodic competency review are required for Clinical Grade and High
Confidence sources. 6MWT assessors additionally require the clinical safety skills
and emergency readiness specified by the service protocol.

### 10.5 Self-reported and device-generated values

Self-reported results are Unsupported for these eight objective tests. A person may
report that a test occurred, but the measurement is not accepted without a
traceable observing source.

Device-generated results must retain the raw reference observation where the
official protocol requires one. A device cannot:

- infer a standard test from free-living activity;
- replace exact course or chair metadata;
- infer maximal effort or usual pace;
- hide its algorithm or firmware version;
- substitute estimated distance for 6MWT corridor measurement; or
- change a Research Only method into Clinical Grade through app distribution.

A later device authorization requires independent agreement, repeatability,
failure-mode, population, firmware-change, and human-factors evidence for the exact
test endpoint.

## 11. Safety standard

### 11.1 General safety gate

No test is mandatory. Before testing, the assessor must confirm that the person can
understand the task and that current symptoms, medical restrictions, environment,
and available supervision make the attempt reasonable. When doubt is clinically
material, defer and obtain clinician assessment.

Across all tests, do not start or stop immediately for acute chest pain, severe or
unexpected breathlessness, syncope or near-syncope, new focal neurological symptoms,
marked pallor or diaphoresis, uncontrolled bleeding, an acute injury, inability to
follow safety instructions, or an environment that cannot be made safe. This list
does not replace clinical emergency procedures.

Unlike the ERS/ATS 6MWT standard, the reviewed authoritative manuals for the short
performance tests do not provide one universal, validated set of absolute and
relative medical contraindications across all populations. Vitalspan must not
invent one. The general gate above, test-specific restrictions below, the
participant's current clinical restrictions, and setting-specific professional
policy govern those tests.

### 11.2 Test-specific safety policy

| Test | Defer or require clinical review | Supervision and stopping requirements | Home suitability |
| --- | --- | --- | --- |
| Grip | Acute or healing hand/wrist/elbow/shoulder injury or surgery, severe pain, restriction against maximal isometric effort, inability to hold device safely | Stop for pain, neurological symptoms, device slip, compensatory movement that defeats protocol, or withdrawal of consent | Possible only with the exact dynamometer and live supervision; unsupervised production use not authorized |
| Usual gait / 4 m | Acute lower-limb injury, new severe dizziness, inability to walk the course safely even with usual aid, medical restriction against walking | Close guarding; stop for instability, symptoms, unsafe aid use, or need for physical assistance | Conditionally suitable with live professional observation and an able helper when needed |
| Chair tests | Acute lower-limb/spine injury, painful or restricted transfers, inability to perform the screen safely, unstable chair or floor | Stand close; stop for arm support where prohibited, loss of balance, pain, limiting symptoms, incomplete control, or physical assistance | Conditionally suitable only with verified chair/setup and live guarding |
| TUG | Unsafe transfers or turning, acute dizziness, inability to use aid safely, high immediate fall concern without hands-on clinical support | Continuous close observation; stop for unstable gait, loss of balance, symptoms, collision risk, or need for assistance | Live approved tele-assessment only; unsuitable for unsupervised self-test |
| 6MWT | Any ERS/ATS absolute contraindication; unresolved relative contraindication; inability to provide required monitoring or emergency response | Qualified clinical supervision; continuous monitoring and stop criteria according to the applicable technical standard | Unsuitable for general home production testing |
| SPPB | Inability to safely attempt sequential balance, gait, and chair tasks or inability to understand the instructions | Trained assessor guards every component and applies component-specific stopping rules | Only live, trained supervision with safe layout; unsupervised battery unsupported |

### 11.3 6MWT contraindications and stopping policy

The current ERS/ATS technical standard is controlling. Absolute reasons not to begin
include recent acute myocardial infarction, unstable angina, uncontrolled symptomatic
arrhythmia, syncope, active endocarditis or acute myocarditis/pericarditis,
symptomatic severe aortic stenosis, uncontrolled heart failure, acute pulmonary
embolism or infarction, acute lower-extremity thrombosis, suspected aortic dissection,
pulmonary oedema, uncontrolled asthma, acute respiratory failure, severe resting
hypoxaemia that has not been clinically managed, an acute condition worsened by
exercise, or inability to cooperate safely.

Relative reasons requiring clinician judgment include significant coronary or
valvular disease, severe untreated resting hypertension, important tachy- or
bradyarrhythmia, advanced conduction disease, hypertrophic cardiomyopathy,
significant pulmonary hypertension, complicated or advanced pregnancy, electrolyte
abnormality, or orthopaedic impairment that prevents safe walking.

The operator stops the test for chest pain, intolerable breathlessness, leg cramps,
staggering, marked diaphoresis, pale or ashen appearance, clinically significant
oxygen desaturation under the technical standard, or any other unsafe presentation.
The source record must state the reason and whether emergency procedures were used.
An early-stopped test is not a completed standard 6MWT endpoint.

### 11.4 Situations unsuitable for production interpretation

Interpretation must remain unavailable when:

- safety screening or completion status is unknown;
- physical assistance materially changed performance;
- the participant did not understand or follow the task;
- pain, acute illness, intoxication, or a transient event made the result
  nonrepresentative and the source did not classify it;
- an absolute contraindication was present;
- an unapproved home, wearable, or adapted protocol was used;
- comparison-critical metadata are missing; or
- the test is valid only as a specialty measure but the population and indication
  are absent.

## 12. Comparison policy

### 12.1 Required comparability dimensions

Two results may be longitudinally compared only when the following match, or when a
future evidence standard expressly authorizes equivalence:

- test and endpoint;
- protocol family and version;
- participant task and pace;
- trial and endpoint-selection rule;
- equipment class and validated device agreement;
- chair height/type or course distance/layout;
- posture, hand, handle, aid, oxygen, assistance, and footwear where relevant;
- timing method and trigger rule;
- environment and supervision class; and
- completion and quality state.

### 12.2 Explicitly prohibited comparisons

- Southampton versus ASHT grip without method-specific agreement evidence.
- Different hands, handles, or dynamometer families as if they were one series.
- Static-start versus rolling-start gait.
- Usual versus fast or dual-task gait.
- Four-metre versus another course under one reference identity.
- Arm-assisted versus arms-folded chair performance.
- Different chair heights without a protocol-specific equivalence standard.
- Standalone 5xSTS versus SPPB repeated-chair rise.
- Three-metre versus ten-foot TUG when a later reference requires one exact course,
  or any standard TUG versus dual-task or instrumented TUG.
- 6MWT across changed course length, oxygen condition, aid, encouragement, or
  treadmill/over-ground method.
- Complete versus incomplete SPPB, or SPPB with reordered/substituted components.

The absence of proof that a difference matters is not proof of interchangeability.

## 13. Measurement governance

### 13.1 Registry control

Every scientific record must expose the versions of:

- this measurement standard;
- protocol registry;
- source registry;
- confidence registry; and
- any later unit, validation, safety, or interpretation policy applied to it.

Registries are immutable once released. A change creates a new semantic version and
effective date. Historical results retain the policy used at evaluation and may be
re-evaluated only as a new auditable decision; their original decision remains.

### 13.2 Change classification

| Change | Required governance |
| --- | --- |
| Editorial clarification with no decision effect | Patch version and documented change log |
| New metadata requirement or compatible source clarification | Minor version, validation review, migration impact assessment |
| Protocol endpoint, source confidence, accepted variant, safety, or comparability change | Major version, scientific review, independent approval, regression fixtures, and explicit historical policy |
| New device, wearable, remote method, or population | Separate evidence review before registry entry; no class-wide inference |

### 13.3 Auditability and conflicts

Source evidence is never overwritten. If values conflict, retain every source,
identify the authoritative original assessment where possible, and withhold a
selected endpoint until the conflict is resolved. Professional entry does not win
automatically over an original device or research form; source traceability and
protocol completeness govern.

All exclusions, invalidations, confidence assignments, and comparison blocks require
stable reason terminology and human-readable explanation. Unknown metadata remains
unknown. It is never inferred from clinic, country, age, device brand, or a previous
session.

### 13.4 Future extensibility

Future additions must be test- and method-specific. A new protocol needs:

- construct and endpoint definition;
- authoritative administration source;
- reliability and agreement evidence;
- population and setting limits;
- safety and stopping policy;
- complete metadata and provenance schema;
- comparability analysis against existing protocols; and
- an explicit Production Eligible, Conditional, Research Only, or Unsupported
  decision.

Approval of one connected dynamometer, timing gate, phone application, or sensor
does not approve the device category, successor firmware, or another test.

## 14. Validation summary

The following scientific acceptance fixtures are required before any later
implementation phase. They specify expected policy behavior, not code.

| Fixture | Required outcome |
| --- | --- |
| Complete Southampton grip session with three alternating trials per hand | Accepted; selected hand-specific endpoints available; Clinical Grade or High Confidence according to source |
| Grip value with unknown hand, device, or posture | Invalid or insufficient provenance; no standard endpoint |
| Same person retested with a different unvalidated dynamometer | Measurements retained separately; longitudinal comparison blocked |
| NIA four-metre static-start usual walk with two trials | Accepted; both times retained; faster qualifying trial identified |
| Four-metre rolling-start or fast walk labelled standard static usual walk | Invalid classification; no silent relabelling |
| Three-metre SPPB gait due to limited space | Conditionally accepted as exact three-metre variant; not a Four-Meter Walk |
| CDC 30-Second Chair Stand with full protocol | Accepted integer endpoint |
| Chair Stand requiring arms | Incomplete standard endpoint with arm-support reason; not silently treated as an ordinary zero |
| Standalone 5xSTS ending seated | Accepted under standalone protocol |
| SPPB chair rise ending at fifth full stand | Accepted only as SPPB component; never compared with standalone 5xSTS |
| TUG with standard task, course, chair, usual aid, and live observer | Conditionally accepted mobility result |
| Dual-task, phone-derived, or passively inferred TUG | Research Only or Unsupported; not standard TUG |
| ERS/ATS 30 m corridor 6MWT with standardized encouragement, monitoring, and complete source data | Conditionally accepted clinical field-walking result |
| 6MWT timer paused during rest, consumer GPS distance, treadmill, or unsupervised home route | Invalid as standard 6MWT |
| Early-stopped 6MWT for symptoms | Attempt and stop reason retained; no completed standard endpoint |
| Complete official SPPB sequence | Raw components accepted; no Vitalspan total produced |
| Reordered or incomplete SPPB | Complete-battery identity unavailable; qualifying components considered only under their own protocols |
| Unverified manual user value | Unsupported |
| Clinician transcription with original report and full protocol | Confidence inherited from underlying assessment with transcription provenance |
| Non-finite, negative, ambiguous-unit, or impossible value | Invalid |
| Exact source event received twice | One scientific event with both ingestion lineages |
| Two genuine same-day sessions | Both retained; no averaging or silent daily selection |

### 14.1 Evidence-quality validation

| Area | Confidence in standard | Principal residual limitation |
| --- | --- | --- |
| Grip protocol control | High | Multiple established postures and imperfect device interchangeability |
| Usual gait / 4 m protocol control | High | Start, course, and manual timing create material heterogeneity |
| 30-Second Chair Stand | Moderate to high | Chair and arm rules are standardized, but population protocols vary |
| Standalone 5xSTS | Moderate to high | Endpoint and chair variations remain common in published use |
| TUG | Moderate to high for mobility measurement | Protocol variants and weak specificity for falls prohibit broad inference |
| 6MWT | High in authorized clinical populations | Specialty population, learning, course, oxygen, and safety dependencies limit generalization |
| SPPB | High for official older-adult battery | Battery integrity and component conventions must be preserved; this phase does not authorize totals |
| Remote/device assessment | Low to moderate and method-specific | Insufficient class-wide agreement, safety, protocol-observation, and firmware evidence |

## 15. Scientific and production recommendation

### 15.1 Final recommendation: Production Ready

The Functional Capacity Measurement Standard is **Production Ready** as a scientific
specification for a later isolated validation and governance phase, with these
mandatory restrictions:

- accept only an identified authorized protocol with complete provenance;
- preserve every test and protocol family independently;
- treat TUG only as a conditional mobility test;
- restrict 6MWT to appropriately supervised settings meeting ERS/ATS safety and
  course requirements;
- accept SPPB only as the unmodified battery sequence and retain raw components
  without creating or recalculating a total;
- block comparison whenever endpoint, equipment, course, chair, aid, oxygen,
  posture, pace, or source conditions are incompatible;
- classify consumer wearables, passive estimates, and unverified user entries as
  Unsupported;
- classify unapproved automated and unsupervised remote methods as Research Only;
- retain incomplete and safety-stopped attempts without fabricating endpoints;
- never treat missing as zero or infer absent provenance; and
- expose the governing scientific versions and audit trail for every decision.

This decision does not recommend implementation. Reference matching, interpretation,
clinical categories, and any production connection require separately authorized
phases.

## 16. Scientific limitations

1. Many reliability estimates are population-specific and do not establish a
   universal threshold for individual change.
2. Chair dimensions, gait starts, encouragement, timing technology, devices, and
   assessor behavior remain heterogeneous in clinical practice despite mature core
   protocols.
3. Home and digital administration evidence is evolving; validation of one method
   cannot be generalized to other software, firmware, devices, or populations.
4. Safety standards are clearest for 6MWT. Short performance tests still require
   individualized clinical judgment where acute illness, pain, falls, or medical
   restrictions are present.
5. An objective test result is influenced by motivation, cognition, pain,
   environment, practice, and transient health state; it is not a pure measure of a
   single organ system.
6. Phase 6.0B deliberately does not select reference datasets, determine meaningful
   change, create categories, or authorize interpretation. Measurement acceptance
   is necessary but not sufficient for those later decisions.

## 17. Official registry summary

| Test | Authorized protocol identity | Readiness | Maximum default confidence | Core comparison barrier |
| --- | --- | --- | --- | --- |
| Hand Grip Strength | Southampton preferred; named ASHT family conditional | Production Eligible | Clinical Grade | Device, hand, handle, posture, attempt rule |
| Usual Gait Speed | Named usual-pace over-ground family | Production Eligible | Clinical Grade | Distance, pace, static/rolling start, timer, aid |
| Four-Meter Walk | NIA/SPPB static-start usual pace preferred; NIH Toolbox named variant | Production Eligible | Clinical Grade | Exact course, crossing trigger, trial rule |
| 30-Second Chair Stand | CDC STEADI family | Production Eligible | Clinical Grade | Chair height, arms, range, expiration rule |
| Five Times Sit-to-Stand | Standalone fifth-sit endpoint | Production Eligible | Clinical Grade | Chair, arms, practice, final seated endpoint |
| Timed Up and Go | Standard single-task three-metre or documented ten-foot family | Conditionally Production Eligible | Clinical Grade in person; Moderate Confidence remotely | Course, chair, aid, task, practice, turn |
| Six-Minute Walk Test | ERS/ATS corridor protocol | Conditionally Production Eligible | Clinical Grade | Course, learning tests, oxygen, aid, encouragement, rest timing |
| SPPB | Official NIA sequence and raw components | Production Eligible | Clinical Grade | Order, component completeness, course, chair, endpoint |

The registries and policies in this document constitute the official Phase 6.0B
Functional Capacity Measurement Standard for the Vitalspan Scientific Platform.
