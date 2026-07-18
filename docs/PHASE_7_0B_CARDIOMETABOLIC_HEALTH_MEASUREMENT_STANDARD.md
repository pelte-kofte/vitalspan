# Phase 7.0B — Cardiometabolic Health Measurement Standard

<!-- markdownlint-disable MD013 -->

| Document field | Value |
| --- | --- |
| Document type | Official scientific measurement specification |
| Scientific platform | Vitalspan |
| Domain | Cardiometabolic Health |
| Standard version | `Vitalspan-CMH-MS-1.0.0` |
| Measurement registry | `Vitalspan-CMH-MEASUREMENT-1.0.0` |
| Source registry | `Vitalspan-CMH-SOURCE-1.0.0` |
| Confidence registry | `Vitalspan-CMH-CONFIDENCE-1.0.0` |
| Laboratory governance | `Vitalspan-CMH-LAB-1.0.0` |
| Validation policy | `Vitalspan-CMH-VALIDATION-1.0.0` |
| Review date | 18 July 2026 |
| Governing evidence review | Phase 7.0A Cardiometabolic Health Scientific Evidence Review |
| Scope | Scientific measurement, provenance, laboratory, and protocol policy only |
| Production recommendation | **Production Ready — Conditional** |

## 1. Decision

Vitalspan may accept the Phase 7.0A Production Eligible and Conditionally
Production Eligible Cardiometabolic Health measurements under this standard, but
only as independent, provenance-complete observations. Acceptance means that the
measurement identity, source, method, unit, specimen or physical protocol, time,
and quality state are known well enough to preserve scientific meaning. It does
not authorize interpretation.

The official policy is:

- ApoB, LDL-C, non-HDL-C, HDL-C, triglycerides, Lp(a), HbA1c, fasting plasma
  glucose, home cuff blood pressure, office blood pressure, automated office blood
  pressure, waist circumference, and waist-to-height ratio retain separate
  scientific identities.
- Direct and calculated LDL-C are separate method identities. A result with an
  unknown method class is incomplete for method-sensitive comparison.
- Non-HDL-C and waist-to-height ratio are governed derived measurements. Their
  source observations and derivation lineage are mandatory. This document does
  not calculate either value.
- Lp(a) particle concentration in nmol/L and mass concentration in mg/dL are
  separate unit identities. No general conversion between them is authorized.
- HbA1c must be traceable to the IFCC reference system and, where reported in NGSP
  percent units, to an NGSP-certified method aligned to DCCT results.
- Fasting plasma glucose means laboratory measurement of venous plasma collected
  after a documented fast with controlled glycolysis. Capillary meter, CGM,
  interstitial, serum-only, and unspecified “blood sugar” values are not FPG.
- Home, office, and automated office blood pressure are distinct setting and
  protocol identities. Every cuff reading preserves systolic and diastolic values
  as a paired observation, never as a score.
- A single blood-pressure reading may be stored as a raw observation but is not a
  protocol-complete home or office series and cannot diagnose hypertension.
- The preferred waist identity uses the WHO midpoint landmark. Umbilical,
  narrowest-waist, and iliac-crest protocols must not be silently pooled with it.
- No laboratory, hospital, professional title, device brand, app, or ingestion
  route confers confidence by itself. Confidence follows the underlying method,
  protocol, validation, and provenance.
- Missing or ambiguous protocol, specimen, unit, method, source, or derivation
  information fails closed for the use that depends on it. Unknown is retained as
  Unknown and is never inferred.

This standard authorizes no formula implementation, score, composite, clinical
category, diagnostic rule, treatment target, risk engine, alert, UI, production
code, or modification of Clinical PhenoAge, VO₂max, or Functional Capacity.

## 2. Scope and authority

### 2.1 Measurements in scope

This standard governs the following Phase 7.0A candidates:

1. Apolipoprotein B.
2. LDL cholesterol.
3. Non-HDL cholesterol.
4. HDL cholesterol.
5. Triglycerides.
6. Lipoprotein(a).
7. Hemoglobin A1c.
8. Fasting plasma glucose.
9. Home cuff blood pressure.
10. Office blood pressure.
11. Automated office blood pressure.
12. Waist circumference.
13. Waist-to-height ratio.

Each remains independent. Co-collection in a lipid panel, simultaneous systolic
and diastolic observation, or shared inputs for a derived measurement does not
create a composite health result.

### 2.2 Governing authority

Phase 7.0A governs candidate role and readiness. This phase may narrow acceptance
when a method cannot satisfy measurement quality, but it may not promote a Phase
7.0A Research Only, Clinical Specialty, Context Only, Deferred, Unsupported, or
Excluded candidate into production scope.

The established Vitalspan governance pattern also controls:

- raw observations and normalized representations remain distinct;
- method and protocol identity are part of the measurement, not optional notes;
- a container or transcription route inherits, and never upgrades, the source;
- all eligibility, rejection, correction, and reclassification decisions are
  versioned and auditable;
- incompatible methods remain separate in longitudinal history; and
- population evidence does not become an individual prediction.

### 2.3 What this standard does not authorize

It does not authorize:

- reference intervals, percentiles, categories, decision thresholds, treatment
  targets, or “optimal” ranges;
- diabetes, hypertension, dyslipidemia, obesity, metabolic-syndrome, or other
  diagnosis;
- selection or adjustment of medication, diet, exercise, or clinical care;
- a parent Cardiometabolic Health score or cross-measurement compensation;
- remnant cholesterol, lipid ratios, HOMA-IR, fasting-insulin interpretation,
  pulse pressure, mean arterial pressure, or other Phase 7.0A non-core candidates;
- clinical cardiovascular or diabetes risk prediction;
- interpretation of pregnancy, pediatric, acute-care, or specialty results beyond
  preserving their context; or
- implementation, persistence architecture, APIs, ingestion wiring, AI behavior,
  or UI.

## 3. Normative language and scientific principles

**Must** and **must not** identify requirements. **Should** identifies the
scientifically preferred policy where a documented exception may exist. **May**
identifies an allowed option.

The governing principles are:

1. **Science calculates; AI explains.** This standard defines scientific data
   eligibility. It does not delegate calculation or classification to AI.
2. **Unknown is preferable to unsupported certainty.** Missing fasting, medication,
   pregnancy, assay, cuff, landmark, or time context remains Unknown.
3. **Fail closed.** A value may be retained in raw history while being unavailable
   for normalized scientific use, derivation, comparison, or interpretation.
4. **Measurement independence.** One favorable value never cancels another value,
   and correlated measurements do not become independent votes.
5. **No silent equivalence.** Same units do not make assays, specimens, settings,
   landmarks, or devices interchangeable.
6. **No diagnostic authority.** A technically valid value can still be
   insufficient for diagnosis or treatment.
7. **No inferred context.** Vitalspan must not infer fasting, medication use,
   pregnancy, illness, posture, cuff fit, or assay method from the value itself.
8. **Immutable provenance.** Raw reports, values, units, timestamps, and source
   identifiers are never overwritten.

## 4. Standards hierarchy and measurement ontology

### 4.1 Standards hierarchy

The following authorities control measurement quality, in descending order for
their applicable question:

1. Reference measurement procedures, certified reference materials, and formal
   metrological traceability systems.
2. ISO 15189:2022 accreditation and applicable national medical-laboratory
   regulation, with ISO 15195:2018 for reference-measurement laboratories.
3. IFCC, NGSP, CDC Clinical Standardization Programs, and recognized external
   quality-assessment or proficiency-testing systems.
4. AAMI/ESH/ISO and ISO 81060 device-validation standards plus independent
   validated-device lists for blood pressure.
5. WHO physical-measurement protocols and other named international or national
   anthropometric protocols.
6. Current professional guidelines and laboratory-medicine recommendations.
7. Manufacturer instructions only for the exact validated analyzer, reagent,
   specimen, measuring interval, stability, calibration, and device operation.

A manufacturer claim cannot replace independent calibration or clinical
validation. Regulatory clearance alone does not prove BP-device measurement
accuracy.

### 4.2 Required scientific distinctions

| Concept | Required Vitalspan meaning |
| --- | --- |
| Measurand | The explicitly defined quantity intended to be measured, including specimen or physical setting where relevant |
| Direct laboratory measurement | An analyzer observes the analyte using a stated assay; “direct” does not imply error-free or reference-method status |
| Derived measurement | A governed result whose exact source observations, units, method identity, and derivation policy are retained |
| Reference measurement procedure | A high-order procedure used to assign or transfer reference values; not an ordinary clinical assay |
| Metrological traceability | Documented unbroken calibration chain to a stated reference, with uncertainty at each applicable step |
| Standardization | Calibration and performance alignment to a reference measurement system |
| Harmonization | Comparability achieved by an agreed process when complete reference-method standardization is unavailable |
| Biological variability | Within-person physiological variation not caused by analytical error |
| Analytical variability | Variation introduced by collection, processing, analyzer, reagent, calibration, or measurement procedure |
| Protocol-complete | All mandatory conditions and observations for the named method or physical protocol are present |
| Source-verified | The originating report, device memory, or signed protocol record can be authenticated |
| Interpretation-eligible | A later phase may interpret the value; measurement acceptance alone does not grant this state |

## 5. Official Measurement Registry

The following registry freezes scientific identities. These are documentation
identifiers, not a production code registry.

| Phase 7.0A candidate | Standard identity | Measurand and method class | Canonical unit | Accepted alternative | Required lineage | Readiness under this standard |
| --- | --- | --- | --- | --- | --- | --- |
| CM-LIP-APOB | CMH-MS-APOB-1 | ApoB mass concentration in validated serum or plasma by standardized immunoassay | g/L | mg/dL | Specimen, assay/platform, traceability, lab, collection time | Production Eligible |
| CM-LIP-LDLC | CMH-MS-LDLC-DIRECT-1 | LDL-C cholesterol concentration by a direct routine assay | mmol/L | mg/dL | Direct-method flag, platform, specimen, TG context, lab | Conditionally eligible method identity |
| CM-LIP-LDLC | CMH-MS-LDLC-CALCULATED-1 | Source-reported LDL-C derived from the same-specimen lipid observations | mmol/L | mg/dL | Source analytes, algorithm name/version, same specimen and units | Conditionally eligible method identity |
| CM-LIP-NHDLC | CMH-MS-NHDLC-1 | Derived atherogenic cholesterol concentration | mmol/L | mg/dL | Same-specimen total and HDL cholesterol, source units, derivation version | Production Eligible when lineage complete |
| CM-LIP-HDLC | CMH-MS-HDLC-1 | HDL-C cholesterol concentration by validated assay | mmol/L | mg/dL | Specimen, assay/platform, lab, collection time | Production Eligible; marker identity only |
| CM-LIP-TG | CMH-MS-TG-1 | Triglyceride/total-glyceride concentration by validated enzymatic assay | mmol/L | mg/dL | Specimen, assay, fasting duration, meal/alcohol context | Conditionally Production Eligible |
| CM-LIP-LPA | CMH-MS-LPA-MOLAR-1 | Lp(a) particle concentration in molar units | nmol/L | None outside exact molar scaling | Assay, isoform sensitivity, calibrator/reference material, lab | Conditionally Production Eligible; preferred identity |
| CM-LIP-LPA | CMH-MS-LPA-MASS-1 | Lp(a) mass concentration | mg/dL | mg/L or g/L by exact mass scaling | Assay, unit, calibrator/reference material, lab | Conditionally Production Eligible; separate from molar identity |
| CM-GLY-HBA1C | CMH-MS-HBA1C-1 | Glycated hemoglobin fraction in whole blood | mmol/mol | NGSP % | IFCC/NGSP traceability, exact method, specimen, interference context | Production Eligible |
| CM-GLY-FPG | CMH-MS-FPG-1 | Glucose concentration in fasting venous plasma | mmol/L | mg/dL | Fasting duration, venous plasma, glycolysis control, method, times | Conditionally Production Eligible |
| CM-BP-HOME | CMH-MS-HBPM-1 | Paired systolic and diastolic upper-arm cuff observations in a home protocol | mmHg | None | Device/model/cuff, validation, posture, arm, raw series, timing | Production Eligible when series-complete |
| CM-BP-OFFICE | CMH-MS-OBP-1 | Paired systolic and diastolic cuff observations in attended clinical office measurement | mmHg | None | Device/method, observer, posture, arm, cuff, rest, repeats | Conditionally Production Eligible |
| CM-BP-AOBP | CMH-MS-AOBP-1 | Paired systolic and diastolic observations from a programmed automated office sequence | mmHg | None | Device/program, attended state, rest, interval, every raw reading | Conditionally Production Eligible |
| CM-ANTH-WAIST | CMH-MS-WAIST-WHO-1 | Waist circumference at the WHO midpoint landmark | cm | in, with exact length normalization | Landmark, tape, posture, expiration, clothing, observer, trials | Conditionally Production Eligible |
| CM-ANTH-WHTR | CMH-MS-WHTR-WHO-1 | Dimensionless waist-to-height ratio using a protocol-valid WHO waist and measured standing height | Dimensionless | None | Both source observations, identical length-unit family, session dates, derivation version | Conditionally Production Eligible |

The registry creates 15 method identities for 13 candidate groups because direct
and calculated LDL-C and molar and mass Lp(a) cannot be scientifically collapsed.

## 6. Common Laboratory Governance

### 6.1 Laboratory eligibility

A laboratory result is fully eligible only when issued by a medical laboratory
operating under applicable law and an auditable quality system. ISO 15189:2022
accreditation, or a national accreditation/regulatory framework with equivalent
competence, quality control, proficiency testing, and traceability requirements,
is preferred.

Laboratory location or ownership is not sufficient. Hospital, primary-care,
commercial, university, and research laboratories are evaluated by the same
requirements. A research laboratory without clinical accreditation may qualify
only when its study documentation establishes method validation, calibration,
quality control, external performance assessment, specimen handling, and result
traceability. Otherwise the result is Research Only.

An at-home collection kit is a collection route, not a laboratory method. It may
inherit an accredited laboratory result only when the sample identity, collection
device, transport conditions, stability window, receipt/acceptance state, assay,
and issuing laboratory are verified.

### 6.2 Required harmonization and calibration

| Family | Required alignment | Vitalspan policy |
| --- | --- | --- |
| Total cholesterol, HDL-C, LDL-C, triglycerides | CDC CRMLN/Lipid Standardization Program or demonstrably equivalent traceability and proficiency assessment | Prefer currently certified systems; preserve certification scope and date when available |
| ApoB | Calibration traceable to the WHO/IFCC apoB reference material and participation in an accuracy/proficiency program | Method/platform is mandatory for high-confidence longitudinal use |
| Lp(a) | Assay traceable to the WHO/IFCC secondary reference material; isoform-insensitive design preferred; harmonization remains incomplete | Preserve exact assay and unit; never infer interchangeability or convert mass to molar units |
| HbA1c | IFCC reference measurement system; NGSP certification for NGSP/DCCT-aligned percent reporting | Method certification must be current for the assay/platform period represented |
| Plasma glucose | Higher-order reference procedure traceability, accredited laboratory performance, and proficiency testing | Hexokinase and glucose-oxidase routine methods are accepted when validated; specimen control remains essential |

Certification is analyzer/method/time specific. A laboratory or manufacturer that
is certified for one analyte, platform, or period is not thereby certified for all
analytes or future reagent/software generations.

### 6.3 Calibration and quality control

An eligible laboratory or research method must maintain:

- calibration traceability to the stated reference system where one exists;
- manufacturer and laboratory calibration records;
- internal quality control across clinically relevant concentrations;
- external quality assessment or proficiency testing appropriate to the analyte;
- validated analytical measuring and reportable intervals;
- lot-change, analyzer-maintenance, and method-comparison procedures;
- uncertainty or performance specifications appropriate to the method; and
- rules for interference, sample rejection, dilution, rerun, and corrected reports.

Vitalspan does not reproduce these laboratory operations. It requires evidence
that they govern the issued result. For raw research data, the relevant records
must be supplied rather than presumed.

### 6.4 Required assay metadata

The minimum laboratory provenance record contains:

- analyte and standard identity;
- raw result, raw unit, laboratory reference/decision annotations as source data,
  and abnormal or interference flags without adopting their interpretation;
- specimen matrix and collection container when available;
- collection date/time, receipt date/time when relevant, result date/time, and
  correction date/time;
- issuing laboratory, location/jurisdiction, accreditation or regulatory status,
  report identifier, and source sample/accession identifier;
- method class and platform for direct LDL-C, Lp(a), HbA1c, and FPG;
- analyzer manufacturer/model, assay name, reagent generation or lot, calibration
  standard, and software version when exposed;
- dilution, repeat, hemolysis, lipemia, icterus, variant, or quality flags;
- fasting duration and specimen-processing details where required;
- original report or signed research data dictionary; and
- measurement, source, confidence, laboratory, and validation-policy versions.

An accredited laboratory report that omits routine platform metadata may be
accepted as **Verified with Method Limits**, but method-sensitive comparison is
blocked. Lp(a) unit identity, LDL-C direct-versus-calculated status, HbA1c
standardization, and FPG specimen/fasting identity are never optional.

### 6.5 Specimen, stability, and storage policy

There is no universal storage interval covering every analyzer, matrix, transport
medium, or analyte. Stability must follow the validated instructions for the exact
assay and specimen.

- An issued accredited-laboratory result may rely on that laboratory's documented
  sample-acceptance and stability controls unless the report carries a quality
  exception.
- Raw research or direct-to-consumer specimens require collection-to-processing
  time, temperature, centrifugation/separation time, storage temperature, freeze-
  thaw history, transport conditions, and assay-specific stability evidence.
- Serum and plasma must not be treated as interchangeable unless the method is
  validated for both matrices.
- Samples outside the method's validated stability or storage conditions are
  rejected or quarantined; the value is not “corrected” mathematically.
- Repeated freeze-thaw cycles, evaporation, contamination, misidentification, and
  use beyond the validated storage period block high-confidence use.

### 6.6 Biological and analytical variability

No single universal coefficient of variation or “real change” threshold is
authorized. Within-person variation differs by analyte, health state, fasting,
time, medication, pregnancy, and acute exposures. Analytical variation differs by
method, laboratory, lot, concentration, and calibration.

Longitudinal comparison therefore requires the same measurand, compatible specimen
and assay class, compatible fasting/context state, and no unresolved method change.
Where the issuing laboratory supplies measurement uncertainty or a validated
reference-change policy, it may be preserved as source metadata but is not
operationalized by this phase.

## 7. Atherogenic Lipid Measurement Standards

### 7.1 Shared lipid collection standard

Serum or validated plasma is accepted. The exact matrix and anticoagulant must be
retained. Routine lipid measurement does not universally require fasting, but
fasting state and hours since caloric intake must be recorded whenever known.
Triglyceride interpretation and calculated LDL-C comparability especially depend
on this context.

Required shared context includes collection time, fasting duration or Unknown,
recent meal, alcohol, acute illness, pregnancy, recent vigorous exercise, major
weight change, and lipid-modifying medication name/status when supplied. A treated
measurement remains a valid observation but must not be represented as untreated
physiology or attributed to treatment without clinical authority.

Samples should be processed under the issuing assay's validated protocol. Gross
lipemia, hemolysis, icterus, paraprotein, dilution, or assay-interference flags are
retained and may block use according to the method. Posture, prolonged tourniquet,
and major hydration changes can alter concentration through plasma-volume effects.

### 7.2 ApoB

| Requirement | Official standard |
| --- | --- |
| Scientific definition | Mass concentration of apolipoprotein B in serum or validated plasma; it represents the ApoB protein carried by circulating atherogenic particles, not plaque burden or an individual event probability |
| Measurement principle | Antigen-antibody quantification, commonly immunoturbidimetry or immunonephelometry |
| Accepted technologies | Validated routine immunoassay calibrated to the WHO/IFCC apoB reference material; CDC accuracy-monitoring participation preferred |
| Reference/harmonization | WHO/IFCC secondary reference material and CDC Lipid Standardization/accuracy programs; complete metrological refinement remains an active field |
| Specimen | Serum or assay-validated EDTA/heparin plasma; matrix required |
| Units and precision | Canonical g/L; mg/dL accepted through exact mass-unit normalization; preserve native precision and do not add decimal precision |
| Fasting and time | Fasting not routinely required; duration still retained; no mandatory time of day, but comparable longitudinal timing is preferred |
| Variability | Lower meal-related variability than triglycerides; biological and assay variation still exist and prohibit interpreting small differences without method continuity |
| Stability/storage | Assay- and matrix-specific; issued lab acceptance governs, while raw/research specimens require processing and storage records |
| Medication/illness/exercise/pregnancy | Lipid therapies, acute inflammatory illness, major exercise/weight changes, and pregnancy may change concentration; record context without causal attribution |
| Pitfalls | Unit errors, calibration drift, method changes, paraprotein/interference, and confusing mass concentration with literal particle counting |
| Production suitability | Eligible with verified assay, unit, matrix, laboratory, collection time, and medication/context metadata state |

### 7.3 LDL-C

LDL-C measures cholesterol mass attributed to LDL-class particles. It is not an
ApoB particle count. Direct and calculated results remain separate.

| Requirement | Direct LDL-C | Calculated LDL-C |
| --- | --- | --- |
| Measurement principle | Routine homogeneous/selective assay or recognized reference procedure | Source-laboratory derivation from same-specimen lipid observations using a named published equation |
| Accepted technology | Validated clinical assay with CRMLN or equivalent traceability | Friedewald, Martin/Hopkins, Sampson/NIH, or another separately authorized published method, with exact identity/version |
| Reference procedure | CDC beta-quantification/reference network framework | Inherits analytical quality of source analytes plus model limitations; it is not a reference measurement procedure |
| Required specimen | Serum or validated plasma | Same specimen and collection event for every required source analyte |
| Required lineage | Platform, direct-method flag, matrix, TG, lab, flags | Every source value/unit, fasting state, algorithm, lab report, and derivation provenance |
| Units | Canonical mmol/L; mg/dL accepted by authorized cholesterol-unit normalization | Same |
| Fasting | Not universally required; fasting and TG context mandatory metadata | Same, with stricter fail-closed handling when the source method's operating conditions are unknown or violated |
| Variability | Method and concentration dependent; direct assays are not automatically more accurate in all dyslipidemic samples | Compounds source-analyte error and equation error; high TG and low LDL-C can increase disagreement |
| Production rule | Accept only with explicit direct identity | Accept only with explicit calculated identity and known source algorithm; source-reported calculated LDL-C with unknown equation is retained with method limits and excluded from method-sensitive comparison |

The source report's LDL-C must never be silently recalculated, replaced by a
different equation, or relabelled as direct. A future calculation implementation
would require separate authorization and validation fixtures.

### 7.4 Non-HDL-C

| Requirement | Official standard |
| --- | --- |
| Scientific definition | Derived cholesterol concentration across non-HDL lipoproteins; atherogenic-cholesterol marker, not particle count |
| Measurement principle | Governed derivation from total cholesterol and HDL-C obtained from the same specimen in compatible units |
| Accepted technologies | No separate assay is required; both source assays must be validated and traceable |
| Required lineage | Raw total cholesterol and HDL-C, units, specimen/accession, collection time, assays, laboratory, and derivation-policy version |
| Units | Canonical mmol/L; mg/dL accepted by authorized cholesterol-unit normalization |
| Precision | Must not exceed the effective precision of the source results; raw source precision is retained |
| Fasting/time | Fasting not routinely required; status retained for comparability |
| Variability | Inherits biological and analytical variation of both source measurements |
| Pitfalls | Inputs from different specimens/dates, unit mismatch, duplicated presentation as a third independent “vote,” and source correction without derived-result supersession |
| Production suitability | Eligible only when same-specimen lineage is complete; no calculation is implemented by this phase |

### 7.5 HDL-C

| Requirement | Official standard |
| --- | --- |
| Scientific definition | Cholesterol concentration assigned to HDL-class particles; a risk marker, not a direct measure of HDL function or a therapeutic target in this domain |
| Measurement principle | Validated homogeneous enzymatic/selective assay or recognized precipitation/reference method |
| Reference/harmonization | CDC CRMLN/Lipid Standardization alignment or equivalent |
| Specimen and units | Serum or validated plasma; canonical mmol/L, mg/dL accepted |
| Fasting/time | Fasting not routinely required; collection context retained |
| Variability and stability | Moderate biological variation; assay/matrix and storage conditions govern; preserve alcohol, medication, illness, pregnancy, and exercise context |
| Pitfalls | Method-specific interference, severe hypertriglyceridemia, paraproteins, treating high values as always protective, or implying HDL function from HDL-C |
| Production suitability | Eligible as an independent marker-only measurement with assay and provenance controls |

### 7.6 Triglycerides

| Requirement | Official standard |
| --- | --- |
| Scientific definition | Concentration of triglyceride/total-glyceride mass measured by the stated enzymatic system; it does not directly count triglyceride-rich particles |
| Measurement principle | Enzymatic hydrolysis and glycerol quantification; glycerol-blanking status should be retained where available |
| Reference/harmonization | CDC total-glyceride reference and CRMLN/Lipid Standardization alignment or equivalent |
| Specimen and units | Serum or validated plasma; canonical mmol/L, mg/dL accepted through triglyceride-specific normalization, never the cholesterol conversion |
| Fasting requirement | Fasting is not mandatory for collection, but fasting duration, last meal time, and alcohol context are mandatory for governed interpretation and comparison |
| Time/exposure | Record collection time, recent meal, alcohol, acute illness, glycemic decompensation, pregnancy, and vigorous exercise |
| Variability | Material within-person and postprandial variability; repeat confirmation under comparable conditions may be required before later interpretation |
| Stability/storage | Method-specific; delayed processing, contamination, glycerol, and storage violations can bias results |
| Medication effects | Lipid, glucose, hormone, immunosuppressive, retinoid, and other therapies may affect concentration; preserve medication state without treatment advice |
| Production suitability | Conditional on explicit fasting metadata state and assay/provenance completeness; Unknown fasting is not silently recoded as fasting or nonfasting |

### 7.7 Lipoprotein(a)

| Requirement | Official standard |
| --- | --- |
| Scientific definition | Concentration of Lp(a) particles or their mass, depending on the assay's calibrated measurand and unit |
| Measurement principle | Immunochemical quantification of apo(a); apo(a) kringle-IV repeat heterogeneity can create isoform-dependent bias |
| Accepted technology | Isoform-insensitive or minimally sensitive assay calibrated to WHO/IFCC reference material; exact assay required |
| Harmonization | Molar reporting in nmol/L is preferred, but full method harmonization is incomplete; mass-reported results remain valid only in their own identity |
| Specimen | Serum or assay-validated plasma; matrix recorded |
| Units | nmol/L for molar identity; mg/dL, mg/L, or g/L only within mass identity; no mass-to-molar conversion |
| Precision | Preserve source precision; do not create apparent agreement across assays or unit identities |
| Fasting/time | Fasting generally not required; time and state retained |
| Variability | Predominantly genetically determined and usually stable, but acute inflammation, pregnancy, kidney disease, liver disease, medication, and assay variation can affect a result |
| Repeatability | One technically valid adult measurement often characterizes exposure, but repeat is appropriate when assay, unit, acute state, pregnancy, or provenance is uncertain or a clinician requests it |
| Pitfalls | Isoform sensitivity, unit conversion, assay changes, values near method limits, and interpreting one measurement as personal event probability |
| Production suitability | Conditional on exact unit identity, assay, traceability, laboratory, specimen, and relevant context |

## 8. Glycemic Measurement Standards

### 8.1 HbA1c

| Requirement | Official standard |
| --- | --- |
| Scientific definition | Proportion of hemoglobin beta chains with stable glycation at the defined N-terminal site, reflecting glycemic exposure over the preceding erythrocyte lifespan rather than a contemporaneous glucose concentration |
| Measurement principles | Ion-exchange HPLC, capillary electrophoresis, immunoassay, boronate-affinity chromatography, or enzymatic assay, only when the exact method meets standardization requirements |
| Reference procedure | IFCC reference measurement system using higher-order separation/mass-spectrometric or capillary-electrophoretic procedures |
| Laboratory standardization | IFCC traceability mandatory; NGSP certification mandatory for NGSP/DCCT-aligned percent reporting; current method certification must be verifiable |
| Specimen | Anticoagulated whole blood, ordinarily EDTA, as validated by the method; serum or plasma is not accepted |
| Units | Canonical IFCC mmol/mol; NGSP % accepted and may be normalized only through the official IFCC-NGSP master relationship while preserving native value/unit |
| Analytical performance | Intralaboratory imprecision should meet the current laboratory-guideline goal below 1.5% CV and interlaboratory imprecision below 2.5% CV, ideally without measurable bias |
| Fasting/time | No fasting requirement and no required time of day |
| Stability/storage | Whole-blood stability is method, tube, temperature, and duration specific; issued-lab acceptance or full raw-sample records are required |
| Biological variability | Lower short-term variability than glucose, but altered erythrocyte age or turnover changes interpretation independently of assay accuracy |
| Mandatory context | Hemoglobin variant/assay flag, anemia or altered red-cell turnover, blood loss, hemolysis, transfusion, erythropoietin, iron/B12/folate state when known, CKD, liver disease, pregnancy, and relevant medication |
| Acute/exercise effects | Ordinary short-term meal or exercise does not acutely determine HbA1c, but acute blood loss, hemolysis, transfusion, or rapid clinical change can make it nonrepresentative |
| Pitfalls | Method-specific variant interference, elevated fetal hemoglobin, carbamylated hemoglobin, iron deficiency, shortened red-cell survival, recent transfusion, pregnancy-related turnover, and discordance with plasma glucose |
| Production suitability | Eligible only with certified method identity and explicit interference-context state; suspected discordance fails closed for later interpretation |

Point-of-care HbA1c is a separate source method. It may be retained as **Verified
with Limits** only when the exact device is currently NGSP certified, used in a
regulated professional setting by trained personnel with quality control, and
clearly labelled point-of-care. It is not interchangeable with a central
laboratory method. Consumer-estimated, wearable, image-derived, or non-invasive
HbA1c is Unsupported.

### 8.2 Fasting plasma glucose

| Requirement | Official standard |
| --- | --- |
| Scientific definition | Glucose concentration in venous plasma after at least eight hours without caloric intake, measured by an accredited laboratory method |
| Measurement principle | Validated hexokinase or glucose-oxidase routine procedure traceable to a higher-order glucose reference system |
| Specimen | Venous plasma; tube type and anticoagulant/glycolysis inhibitor required |
| Pre-analytical requirement | Prompt cell separation is preferred. If immediate separation is not assured, a rapidly effective citrate-buffer glycolysis inhibitor is required. Fluoride alone does not immediately stop glycolysis |
| Units | Canonical mmol/L; mg/dL accepted through authorized glucose-unit normalization; raw value/unit retained |
| Analytical performance | Current laboratory guidance targets imprecision at or below 2.4%, bias at or below 2.1%, and total error at or below 6.1%, with the goal of no measurable bias |
| Fasting | Duration, start/end time when available, caloric intake, and whether fasting was instructed or self-reported are mandatory; “fasting” without duration is incomplete |
| Time of day | Morning collection is preferred for standardized longitudinal comparison; exact collection time is mandatory |
| Variability | Meaningful within-person and day-to-day variation; stress, sleep, recent activity, illness, and processing delay can change results |
| Medication/illness/exercise | Glucose-lowering drugs, glucocorticoids and other medicines, acute illness, infection, stress, pregnancy, and exercise must be retained when known |
| Stability/storage | Highly time-sensitive before plasma separation; post-separation storage follows the validated assay protocol |
| Pitfalls | Continued glycolysis, serum/plasma confusion, capillary or whole-blood meter values, unknown fasting, IV glucose, specimen contamination, delayed processing, and labeling random glucose as fasting |
| Production suitability | Conditional on verified venous-plasma identity, fasting duration, collection time, glycolysis control, assay, unit, and laboratory provenance |

Capillary blood-glucose meters, continuous glucose monitors, interstitial sensors,
and consumer “fasting glucose” estimates are not FPG and cannot populate this
identity. A laboratory-released serum glucose result also does not become FPG
unless the laboratory's specimen and fasting identity meet this standard.

## 9. Blood-Pressure Measurement Standards

### 9.1 Common cuff standard

Blood pressure is a paired systolic and diastolic observation. The raw pair, device
reading sequence, and setting must be retained. Pulse pressure, mean arterial
pressure, category, series mean, and diagnosis are outside this phase.

Every accepted automated device must be the exact manufacturer/model/cuff system
validated under a recognized protocol for its intended population. Preferred
evidence is ISO 81060-2:2018 with applicable amendments or the AAMI/ESH/ISO
Universal Standard, assessed by an independent validated-device list such as
STRIDE BP or ValidateBP. Validation of one model does not extend to a successor,
different cuff, wrist mode, software algorithm, pregnancy, atrial fibrillation,
children, or unusual arm circumference without applicable evidence.

Required preparation for standard seated measurement:

- no caffeine, nicotine, alcohol, or exercise during the preceding 30 minutes;
- empty bladder;
- at least five minutes of quiet seated rest unless the exact authorized AOBP
  protocol specifies and records another validated rest sequence;
- quiet room, no talking, texting, active listening, or conversation;
- back supported, feet flat and supported, legs uncrossed;
- bare upper arm supported at heart level with muscles relaxed;
- cuff bladder range appropriate to measured mid-arm circumference;
- correct cuff placement according to the device; and
- current symptoms, medication timing, posture deviations, and acute illness
  recorded.

### 9.2 Arm and cuff policy

At an initial clinical assessment, both arms should be measured using a
standardized protocol. A persistent difference and the clinician-designated arm
must be preserved; subsequent series should use the designated arm, commonly the
arm with the higher reproducible pressure. Vitalspan must not infer the arm.

Mid-arm circumference, cuff manufacturer/model or cuff-size identifier, cuff
range, arm, and fit/placement status are required. “Adult cuff” without a size
range is insufficient when fit cannot be verified. Measurements over clothing are
protocol deviations and are not standard-grade.

### 9.3 Home cuff blood pressure

| Requirement | Official HBPM standard |
| --- | --- |
| Setting | Seated self- or helper-administered measurement in the person's usual home environment |
| Device | Independently validated automated upper-arm oscillometric cuff; current model and cuff must appear on or satisfy a recognized validation registry |
| Preparation/position | Common cuff standard above; same quiet location and designated arm preferred |
| Timing | Two morning and two evening readings are preferred each day; relation to awakening, meals, exercise, alcohol/nicotine/caffeine, symptoms, and medication must be retained |
| Repeats | Readings within a session are separated by at least one minute; every raw reading is retained |
| Series duration | Seven days is preferred. A minimum three-day series with morning and evening duplicate readings may be protocol-complete for measurement storage, but is marked minimum-duration rather than equivalent to seven days |
| Single reading | May be stored as a raw, valid cuff observation if protocol metadata are complete; it is not a protocol-complete HBPM series |
| Device verification | Model validation, cuff range, serial/device identifier where available, and periodic comparison or servicing recommended by the manufacturer/clinical service |
| Unsupported | Cuffless watch/ring/phone estimates, unvalidated cuff, calibration-only cuffless output, finger device, or unknown device model |
| Conditional exception | A validated wrist-cuff device may be retained as a separate exception identity when upper-arm measurement is unsuitable and the wrist is held at heart level; it is not merged with core upper-arm HBPM |

No daily or series average is calculated by this phase. If a source report supplies
an average, store it as a source-derived companion with its raw readings and source
algorithm; do not reconstruct it when readings are incomplete.

### 9.4 Office blood pressure

| Requirement | Official office standard |
| --- | --- |
| Setting | Attended professional clinical setting, distinguished from AOBP |
| Accepted methods | Validated automated upper-arm oscillometric device preferred; calibrated aneroid auscultation is acceptable with trained observer and documented maintenance |
| Preparation | Common cuff standard, including five-minute quiet rest |
| Repeats | At least two readings separated by one to two minutes at a measurement session; additional readings may follow the named clinical protocol |
| Arm | Both arms at initial assessment; designated arm thereafter; exact arm always recorded |
| Auscultatory metadata | Device, calibration date, observer, cuff, Korotkoff protocol, deflation procedure, and reading resolution where available |
| Automated metadata | Manufacturer/model, validation evidence, cuff, raw readings, interval, and whether a clinician was present/talking |
| Special populations | Pregnancy, arrhythmia, children, and very large/small arms require applicable device validation and clinical protocol; otherwise comparison/interpretation is blocked |
| Production status | Conditionally eligible only when setting, device/method, preparation, arm, cuff, rest, and repeats are complete |

A rushed triage reading without rest or a reading taken while the person is
talking may be retained as a **Nonstandard Clinical Observation**, not as standard
office BP. Professional origin does not repair protocol failure.

### 9.5 Automated office blood pressure

| Requirement | Official AOBP standard |
| --- | --- |
| Definition | A programmed office device obtains multiple cuff readings with limited operator interaction |
| Device | Validated upper-arm automated device with the exact office-sequence capability documented |
| Attended state | Attended versus unattended is mandatory metadata; absence of an observer must not be inferred from “automated” |
| Program | Rest period, number of readings, delay before first reading, inter-reading interval, discard rule, and source averaging behavior are retained exactly |
| Raw data | Every available systolic/diastolic pair and device timestamp is retained; source summary does not replace raw readings |
| Position/cuff | Common seated position, bare supported arm, measured cuff fit, and quiet environment |
| Production status | Conditionally eligible only under the named validated program; differing programs remain separate comparison identities |

### 9.6 BP biological variability, limitations, and invalidation

Blood pressure varies with time, sleep, posture, temperature, pain, stress,
conversation, meals, bladder fullness, caffeine, nicotine, alcohol, exercise,
medication timing, arrhythmia, and acute illness. A technically valid reading
describes that time and setting; it does not prove a chronic state.

Quarantine or classify as nonstandard when the device reports motion, irregular
rhythm, cuff error, out-of-range result, poor fit, talking, unsupported arm,
incorrect posture, inadequate rest, or interrupted sequence. An extreme value from
a verified device is not automatically erroneous and must not be deleted; it
requires source confirmation and the future safety policy.

Cuffless BP is **Unsupported** for this registry. FDA/other regulatory clearance,
calibration against a cuff, or output in mmHg does not make a cuffless estimate
interchangeable with validated cuff measurement.

## 10. Central Adiposity Measurement Standards

### 10.1 Waist circumference

The preferred Vitalspan adult protocol is the WHO midpoint protocol.

| Requirement | Official waist standard |
| --- | --- |
| Anatomical landmark | Horizontal midpoint between the lower margin of the last palpable rib and the top of the iliac crest, located on each side |
| Tape | Flexible, stretch-resistant tension tape, readable to 0.1 cm, checked against a length standard, wide enough to avoid cutting into skin, and capable of a snug non-compressive fit |
| Body position | Standing, feet together, weight evenly distributed, arms relaxed at sides, abdomen relaxed |
| Breathing | Read at the end of a normal expiration after normal breathing; no breath holding or forced exhalation |
| Tape plane | Horizontal and parallel to the floor around the body; no twisting, sagging, gap, or skin compression |
| Clothing | Directly on skin is preferred. Light, non-compressive clothing is a documented lower-confidence exception; bulky/compressive clothing is unsupported |
| Precision | Record to nearest 0.1 cm when equipment permits; preserve source precision without adding digits |
| Repeats | One WHO STEPS measurement is protocol-valid. Two independently repositioned trials are preferred for longitudinal production quality; store both. Material disagreement triggers a further measurement or protocol-quality flag, not silent averaging |
| Observer | Trained professional is Fully Verified. Guided self-measurement under the exact protocol is accepted with limits; unguided self-report is provisional |
| Time/context | Record local time, recent meal, bladder state when known, pregnancy, ascites/edema, stoma, abdominal mass, recent surgery, and clothing |
| Limitations | Landmark differences, breathing, tape tension, observer, posture, abdominal distension, and body shape create error; waist is not a direct visceral-fat measurement |
| Unsupported techniques | Visual estimate, clothing size, photo/scan/app estimate without method-specific validation, navel-only or narrowest-waist value relabelled as WHO, commercial “visceral score,” or a tape that stretches |

NIH iliac-crest, umbilical, minimal-waist, and other named protocols may be retained
as distinct historical or research observations. They do not populate
`CMH-MS-WAIST-WHO-1` and must not be converted to the WHO landmark by an equation
or assumed offset.

Pregnancy, clinically important ascites, major edema, abdominal masses, large
hernia, stoma/appliance obstruction, inability to stand, or recent abdominal
surgery do not make the circumference numerically impossible. They make general
central-adiposity interpretation unsuitable or specialty-context dependent.

### 10.2 Height source for waist-to-height ratio

Standing height must be measured with a calibrated wall-mounted or freestanding
stadiometer on a level surface. The person is barefoot or in thin socks, standing
erect with heels together where possible, weight evenly distributed, and head in
the Frankfort horizontal plane. Hair, headwear, footwear, posture limitation, and
spinal deformity are recorded. Height is read to 0.1 cm when equipment permits.

Self-reported profile height, identity-document height, recumbent length, arm span,
knee-height estimate, or historical height is not interchangeable with measured
standing height. Such values may be stored as separate context but do not support
the highest-confidence waist-to-height ratio.

### 10.3 Waist-to-height ratio

Waist-to-height ratio is a dimensionless governed derivation using a protocol-
valid waist circumference and a compatible measured height expressed in the same
length-unit family. This statement defines lineage; this phase does not implement
the derivation.

Required provenance includes:

- both raw source values and units;
- WHO waist protocol identity and every waist trial;
- height method, stadiometer, posture, and measurement date;
- whether height and waist were measured in the same session;
- unit-normalization policy and derivation-policy version;
- raw or source-reported ratio and precision, if imported; and
- pregnancy, edema/ascites, posture, and self-measurement context.

Same-session measured standing height is preferred. A prior adult stadiometer
height may be used only as **Verified with Limits** when the date is known and no
growth, age-related height loss, spinal/postural change, amputation, or other
material reason for incompatibility is present. Unknown provenance or self-
reported height blocks production-grade derivation.

The ratio must not be described as body-fat percentage, visceral-fat volume,
obesity diagnosis, health quality, or personal risk probability.

## 11. Source Registry

| Source ID | Source class | Verification requirements | Maximum confidence | Production policy |
| --- | --- | --- | --- | --- |
| CMH-SRC-REFLAB | Reference measurement laboratory | ISO 15195/15189 competence, stated RMP, traceability, uncertainty, sample identity | Reference Aligned | Accepted for applicable laboratory measurand |
| CMH-SRC-CLAB | Accredited/certified clinical laboratory | Original report, accreditation/regulatory status, analyte, specimen, unit, time, method-critical metadata | Fully Verified | Accepted; method limits apply when platform is absent |
| CMH-SRC-HOSP-EHR | Hospital or primary-care health record | Authenticated import plus resolvable original lab/device/protocol and report identifiers | Inherits source, at most Fully Verified | Container does not upgrade source |
| CMH-SRC-RESEARCH | Research cohort/laboratory | Protocol, consent/governance, sample chain, assay validation, QC/EQA, calibration, data dictionary | Fully Verified or Research Only | Method-specific review required |
| CMH-SRC-POCT | Professional point-of-care analyzer | Exact device/method, certification, trained operator, QC, specimen, setting, result report | Verified with Limits | HbA1c/lipids only when specifically authorized; not interchangeable with central lab |
| CMH-SRC-HOMEKIT | Home collection sent to laboratory | Kit identity, collection time, transport/stability, sample acceptance, accredited issuing lab | Verified with Limits | Accepted only when analyte-specific preanalytics are validated; FPG generally unsuitable unless venous-plasma requirements are met |
| CMH-SRC-CLIN-BP | Clinician office/AOBP | Exact cuff device, validation, calibration, cuff, arm, preparation, repeats, setting | Fully Verified | Accepted when protocol-complete |
| CMH-SRC-HOME-BP | Home upper-arm cuff | Exact validated model/cuff, raw device readings, arm, position, preparation, timestamps, series completeness | Fully Verified for protocol-complete HBPM | Accepted; single/nonstandard readings remain limited |
| CMH-SRC-CLIN-ANTH | Trained professional anthropometry | Named landmark/protocol, checked tape/stadiometer, posture, breathing, clothing, trials | Fully Verified | Accepted when protocol-complete |
| CMH-SRC-SELF-ANTH | Guided self-measured waist/height | Exact instructions, tape/device, landmark attestation, posture, source values, timestamps | Verified with Limits | Accepted for cautious longitudinal context; not interchangeable with professional measurement |
| CMH-SRC-MANUAL-DOC | Manual entry with original report/device evidence | Two-source or document verification of value, unit, date, method, and identity | Inherits source after verification | Provisional until verified; transcription remains recorded |
| CMH-SRC-MANUAL | Manual entry without evidence | User assertion only | Provisional | Excluded from scientific interpretation |
| CMH-SRC-CONTAINER | Apple Health, Health Connect, FHIR, or other container | Originating source, method, device/report IDs, raw metadata and integrity resolvable | Inherits origin | Missing origin is Unsupported |
| CMH-SRC-CUFFLESS | Watch, ring, phone, camera, PPG, pulse-transit or other cuffless BP | No current qualifying pathway | Unsupported | Reject from BP scientific history; may remain segregated raw consumer data |
| CMH-SRC-CONSUMER-BIO | Consumer-estimated lipid, glucose, HbA1c, waist, or visceral-fat output | No verified qualifying assay/protocol | Unsupported | Reject from scoped measurement identity |

## 12. Confidence Registry

Confidence is a categorical statement about measurement evidence and provenance,
not a health score and not a comparison between analyte importance.

| Confidence ID | Label | Definition | Authorized use |
| --- | --- | --- | --- |
| CMH-CONF-R | **Reference Aligned** | Result issued by a competent reference-measurement service using the applicable RMP or direct traceability assignment with uncertainty | Reference or calibration-grade representation for the stated measurand |
| CMH-CONF-F | **Fully Verified** | Original source authenticated; eligible assay/device/protocol; mandatory specimen, unit, time, method, and context complete | Independent measurement history and method-compatible longitudinal comparison; no interpretation yet |
| CMH-CONF-L | **Verified with Limits** | Source is authentic and the measurement is real, but noncritical method detail, setting quality, or comparison context is incomplete | Preserve as measured context; block the use that depends on missing metadata |
| CMH-CONF-P | **Provisional** | Plausible transcription or import awaiting original-source verification | Visible only as unverified raw data; no scientific interpretation, derivation, or comparison |
| CMH-CONF-Q | **Quarantined** | Conflict, outlier, interference, impossible structure, or protocol problem requires resolution | Retain immutably; exclude from active scientific use |
| CMH-CONF-X | **Unsupported** | Method, device, specimen, source, or provenance cannot represent the scoped measurand under this standard | Reject from scoped scientific history; retain rejection audit when permitted |

Every active record carries exactly one current confidence state plus its original
state and reclassification history. Confidence may differ by intended use: a
verified lab report missing its analyzer may preserve an absolute result but remain
ineligible for method-sensitive longitudinal comparison.

## 13. Minimum Provenance Standard

### 13.1 Common fields

Every accepted record must preserve:

- person, source-record, event/session, and specimen/accession identifiers as
  applicable;
- candidate ID and measurement-standard identity;
- raw value, raw unit, source precision, normalized value/unit if later produced,
  and unit-policy version;
- direct, derived, calculated, manual, or device-observed status;
- source organization, facility, laboratory, clinician/research protocol, device,
  app/container, and import route as applicable;
- event/collection local timestamp, original UTC offset/time zone, result timestamp,
  correction timestamp, and ingestion timestamp;
- date-only precision when time is unavailable, without inventing a time;
- method/protocol, specimen or physical setting, and quality flags;
- medication status and timing, fasting state, pregnancy state, acute illness,
  recent exercise, and other required context as Known, Unknown, or Not Applicable;
- original report/payload reference and integrity/verification evidence;
- confidence, validation, duplicate, correction, and active/superseded state; and
- every governing registry and policy version.

### 13.2 Measurement-family additions

| Family | Additional mandatory provenance |
| --- | --- |
| Lipids | Matrix, fasting duration state, assay/platform where critical, direct/calculated LDL status, source algorithm, Lp(a) unit identity, interference flags |
| HbA1c | Whole-blood matrix, IFCC/NGSP certification, assay principle/platform, variant/interference flags, red-cell/transfusion/pregnancy context state |
| FPG | Venous-plasma identity, fast duration, collection and separation times, tube/glycolysis control, method, contamination/IV context |
| BP | Setting, device/model/serial, validation evidence, cuff/range, mid-arm circumference when available, arm, posture, rest, exposures, observer presence, every raw pair and interval |
| Waist | Landmark, tape, observer/self source, posture, expiration, clothing, time, trials, distension/pregnancy context |
| Waist-to-height ratio | Every waist and height source observation, unit family, height method/date, derivation identity/version, source-reported versus platform-derived status |

Unknown contextual metadata does not always erase the fact that a value was
measured. It blocks the scientific use for which the context is indispensable. For
example, unknown medication status blocks an “untreated” claim; unknown fasting
duration blocks FPG identity; unknown LDL method blocks direct/calculated
comparison; unknown waist landmark blocks WHO-waist identity.

## 14. Common Data Standard

### 14.1 Canonical units and conversion policy

| Measurement family | Canonical | Accepted alternative | Conversion policy |
| --- | --- | --- | --- |
| ApoB | g/L | mg/dL | Exact mass-unit normalization permitted; raw retained |
| LDL-C, non-HDL-C, HDL-C | mmol/L | mg/dL | Only authorized cholesterol-specific deterministic normalization |
| Triglycerides | mmol/L | mg/dL | Only triglyceride-specific deterministic normalization; never cholesterol factor |
| Lp(a) molar | nmol/L | Exact molar-scale variants if explicitly reported | No conversion to mass identity |
| Lp(a) mass | mg/dL | mg/L, g/L | Exact mass scaling only; no conversion to molar identity |
| HbA1c | mmol/mol | NGSP % | Only official IFCC-NGSP master relationship; preserve both native and normalized values |
| FPG | mmol/L | mg/dL | Only authorized glucose-specific deterministic normalization |
| Blood pressure | mmHg | None | kPa or other values remain raw/unsupported until a later authorized unit policy |
| Waist and height | cm | in | Exact length normalization with raw unit retained |
| Waist-to-height ratio | Dimensionless | None | Source inputs must share a verified length-unit family before derivation |

This phase specifies allowable normalization but performs none. No unit conversion
may rescue a missing or ambiguous unit. Decimal separators and thousands
separators require explicit locale; ambiguous values are quarantined.

### 14.2 Precision

- Preserve the raw numeric/text value and every source digit.
- Do not add precision through unit normalization or derivation.
- Do not round source observations before a later authorized derivation.
- Laboratory analytical quality is determined by calibration, bias, imprecision,
  and uncertainty—not number of displayed decimals.
- Automated BP values preserve the device's integer mmHg resolution; manual
  auscultatory precision preserves the source scale and must not invent odd or
  decimal values.
- Waist and stadiometer measurements should be captured to 0.1 cm when the
  equipment supports it.
- Derived-result precision must not exceed the least precise source observation;
  the exact policy requires implementation validation in a later phase.

### 14.3 Missing values

- Missing is null/absent with a reason, never zero, an empty string, a sentinel,
  a population mean, or a previous value.
- Distinguish not measured, not reported, unknown, not applicable, declined,
  technically failed, sample rejected, and source unavailable.
- Missing fasting, medication, pregnancy, protocol, or method context is never
  inferred from another visit.
- A derived value is unavailable when any required source observation or lineage
  is missing.

### 14.4 Impossible and invalid values

Structurally invalid records include:

- nonnumeric, non-finite, unparsable, or unitless quantitative content;
- negative analyte concentration, nonpositive waist/height, or a nonpositive ratio;
- a value outside the analyzer/device's documented reportable range without a
  valid dilution, greater-than/less-than, or quality representation;
- incompatible specimen, such as serum represented as HbA1c whole blood or
  capillary sensor output represented as venous FPG;
- internally inconsistent fasting duration/status;
- an Lp(a) mass/molar value created through an unauthorized conversion;
- derived inputs from different specimens or unlinked sessions;
- BP with missing paired component, unit, device identity, or arm when the source
  claims a protocol-complete session; and
- a waist value with unknown landmark represented as the WHO identity.

Physiologically unusual is not the same as impossible. This phase sets no universal
numeric “healthy” or plausibility interval because extreme real results may require
clinical attention. An unusual value is quarantined for source, unit, specimen,
decimal, range, interference, and report verification. It is never clipped,
winsorized, or silently discarded.

### 14.5 Outlier policy

An outlier must be:

1. retained exactly as received;
2. excluded from active derivation, comparison, or later interpretation while
   unresolved;
3. checked against the original report/device memory and reportable interval;
4. checked for unit, decimal, specimen, timing, fasting, cuff, posture, landmark,
   duplicate, interference, and method change;
5. accepted with an extreme/verified flag, superseded by a source correction, or
   rejected with a stable reason; and
6. considered by a future urgent-safety policy without this phase defining alerts.

### 14.6 Duplicate and same-event policy

- An exact re-import of the same source record/accession/device reading is one
  scientific event with multiple ingestion lineages.
- A lab result imported through EHR and manually transcribed from the same report
  is a probable duplicate; reconcile to one event while retaining both routes.
- Two assays on the same specimen are distinct method observations, not duplicates.
- Repeated BP readings in one session are required raw observations, not duplicates.
- Multiple waist trials in one session are required raw observations, not
  duplicates.
- Separate specimens or sessions on the same date remain separate. No daily
  averaging or highest/lowest-value selection is authorized.
- A corrected report supersedes but never deletes the earlier version.

### 14.7 Timestamps and historical storage

Laboratory collection time is the scientific event time; result and ingestion
times do not replace it. BP and anthropometry require local event timestamps.
Original local time, UTC offset/time zone, and normalized UTC time must coexist
when available. Date-only historical results retain date-only precision.

History is append-only. Raw records are immutable. Unit normalization,
verification, confidence reassignment, duplicate reconciliation, and source
correction create auditable linked records. A later assay, equation, or policy
must not retroactively rewrite a historical result without a new versioned
decision.

### 14.8 Verification status

| Status | Meaning |
| --- | --- |
| `verified_original` | Original laboratory report, device memory, or signed protocol record authenticated |
| `verified_transcription` | Manual/imported value matched to authenticated original; transcription route retained |
| `provisional` | Awaiting original-source verification; no scientific use |
| `quarantined` | Conflict, outlier, or quality issue under review |
| `rejected` | Does not meet scoped measurand/method/provenance requirements |
| `superseded` | Preserved historical version replaced by a linked correction or authoritative source update |

These labels are scientific specification terms, not an implementation schema.

## 15. Measurement Validation Policy

### 15.1 Validation sequence

Every record is evaluated in this order:

1. **Identity:** candidate and exact measurement-standard identity are resolvable.
2. **Source:** origin and source event/report can be authenticated.
3. **Method:** assay, calculation class, device, or physical protocol is eligible.
4. **Specimen/protocol:** specimen matrix or collection protocol is compatible.
5. **Unit/precision:** unit is explicit and belongs to the authorized unit family.
6. **Required context:** fasting, medication, pregnancy, illness, exercise,
   posture, cuff, landmark, and other measurement-specific states are explicit or
   explicitly Unknown.
7. **Quality:** source flags, reportable range, calibration, device validation,
   sample stability, and internal consistency pass.
8. **Lineage:** required source observations and derivation/algorithm identity are
   complete for derived results.
9. **Duplicate/conflict:** same-event duplicates and conflicting reports are
   reconciled without data loss.
10. **Confidence:** one current confidence and verification state are assigned
    with reason and registry version.

Failure at one stage does not justify guessing at the next. The raw record may be
preserved, but the unavailable scientific result must be Unknown, Provisional,
Quarantined, or Unsupported as applicable.

### 15.2 Scientific acceptance fixtures

These fixtures specify required policy behavior, not code or calculations.

| Fixture | Required outcome |
| --- | --- |
| Accredited lab ApoB with serum matrix, g/L, standardized assay, collection time, and report | Fully Verified ApoB accepted |
| ApoB manual number without unit/report | Provisional or Unsupported; no scientific value |
| LDL-C report explicitly calculated with named method and complete same-specimen panel | Calculated LDL identity accepted; source lineage retained |
| LDL-C with direct/calculated status unknown | Result retained with method limits; method-sensitive comparison blocked |
| Non-HDL-C whose source observations came from different dates | Invalid derivation identity; no reconstruction |
| HDL-C result used to claim “protective” status | Measurement may be valid; claim blocked |
| Triglycerides with fasting state Unknown | Measurement retained with Unknown fasting; fasting-specific use blocked |
| Lp(a) in mg/dL converted by a generic factor to nmol/L | Converted record rejected; native mass record retained |
| Lp(a) molar assay with exact platform and WHO/IFCC traceability | Molar identity accepted |
| NGSP-certified HbA1c with whole-blood specimen and no interference flag | Accepted; no diagnosis/category produced |
| HbA1c with recent transfusion or shortened red-cell survival | Measurement retained; interpretation quarantined/limited by interference context |
| Capillary meter value labelled FPG | Rejected from FPG identity |
| Venous plasma glucose after documented fast but delayed unprotected cell separation | Quarantined or rejected according to lab acceptance evidence |
| Seven-day validated upper-arm home BP series with full protocol and raw pairs | Protocol-complete HBPM accepted; no diagnostic average produced |
| Single validated home cuff reading | Raw observation retained; not a complete HBPM series |
| Home BP from unknown device or wrong cuff | Limited, quarantined, or Unsupported; not standard HBPM |
| Cuffless watch BP calibrated to an arm cuff | Unsupported for scoped BP identity |
| Office triage BP taken while talking immediately after walking | Nonstandard Clinical Observation; not standard office BP |
| AOBP summary without raw readings or program metadata | Verified with Limits; protocol comparison blocked |
| Professional WHO-midpoint waist with checked tape and full posture/breathing metadata | Fully Verified waist accepted |
| Waist measured at navel relabelled as WHO midpoint | Rejected classification; retain exact alternate protocol if known |
| Self-reported historical waist with no method | Provisional context only |
| Waist-to-height ratio with profile height and no source waist | Unsupported derivation |
| Exact report imported through two routes | One scientific event with both provenance trails |
| Extreme verified value outside typical population experience | Quarantine for verification; never cap or classify clinically in this phase |

## 16. Measurement Governance

### 16.1 Registry ownership and versioning

Vitalspan Scientific Governance owns this standard and its measurement, source,
confidence, laboratory, and validation registries. Registries are immutable once
released. Any change receives a semantic version, effective date, rationale,
approver, evidence record, and migration-impact assessment.

Every evaluated measurement retains the policy versions used at the time. Later
evidence may re-evaluate a record through a new auditable decision but cannot erase
the original classification.

### 16.2 Change classification

| Change | Required governance |
| --- | --- |
| Editorial clarification without decision effect | Patch version and change log |
| New optional metadata or compatible source clarification | Minor version, scientific review, validation-impact assessment |
| New required field, assay class, unit policy, BP protocol, waist landmark, derivation lineage, or confidence rule | Major version, independent scientific and laboratory review, migration plan, validation fixtures |
| New device/model, POCT method, home kit, cuffless method, or consumer anthropometry technology | Separate method-specific evidence review; no category-wide inference |
| New interpretation, reference, category, urgent alert, or clinical threshold | Outside Phase 7.0B; requires Phase 7.0C or a separate authorized clinical-safety program |

### 16.3 Review and evidence surveillance

Formal review should occur at least annually and whenever:

- CDC, IFCC, NGSP, WHO, ISO, AHA/ACC, ESC/ESH, or laboratory guidance changes;
- a reference material or measurement procedure is replaced;
- a certification expires or assay/platform materially changes;
- an LDL equation, HbA1c interference table, Lp(a) reference system, or BP-device
  standard changes;
- a validated-device list removes or restricts a model;
- a systematic source error, unit error, silent correction, or protocol drift is
  detected; or
- Phase 7.0C requires measurement-policy clarification.

### 16.4 Exceptions and incident handling

An exception must identify the record/class, requested scientific use, reason,
evidence, approver, effective period, monitoring, and rollback condition. An
exception cannot authorize mass-to-molar Lp(a) conversion, call capillary glucose
FPG, call cuffless BP cuff BP, infer a missing waist landmark, or transform a
provisional record into clinical truth.

Scientific incidents include systematic unit conversion errors, expired assay
certification, silent LDL-method substitution, HbA1c interference mishandling,
glucose preanalytic failure, BP-device validation withdrawal, cuff-size errors,
duplicate inflation, and landmark drift. Affected records must be traced,
quarantined, corrected through immutable versions, and re-evaluated before reuse.

### 16.5 Independent review requirement

Before implementation, this standard requires review by laboratory medicine,
lipidology, endocrinology/diabetology, hypertension, anthropometry/obesity science,
data provenance, privacy/legal, and Vitalspan Scientific Governance. Legal review
must address copyrighted standards, validated-device-list terms, certification
claims, and jurisdiction-specific laboratory regulation.

## 17. Production Policies

### 17.1 Accepted-measurement policy

Accept only records whose identity, source, method, unit, event date, and
measurement-critical metadata permit assignment under the Measurement, Source,
and Confidence Registries. A valid measurement may remain unavailable for later
interpretation because Phase 7.0C has not authorized references or thresholds.

### 17.2 Fail-closed policy

| Missing or conflicting item | Required outcome |
| --- | --- |
| Analyte or unit | Unsupported scientific value |
| Original source | Provisional; no interpretation |
| LDL direct/calculated class | Preserve with limits; block method-sensitive comparison |
| Lp(a) mass/molar identity | Unsupported until resolved; no conversion |
| HbA1c standardization or critical interference context | Quarantine/limit interpretation |
| FPG fasting duration, venous-plasma identity, or glycolysis control | Does not qualify as FPG |
| BP setting, device validation, cuff, arm, posture, or repeat protocol | Raw/nonstandard observation only or Unsupported |
| Waist landmark | Does not qualify as WHO waist |
| Waist-to-height source observations | Derived measurement unavailable |
| Medication/pregnancy/acute context | Measurement may remain valid; claims depending on the context are Unknown |

### 17.3 Longitudinal comparison policy

Longitudinal comparison requires:

- same measurement-standard identity;
- compatible laboratory method/platform or documented method agreement;
- compatible specimen and preanalytics;
- compatible fasting and time context where material;
- same BP setting, arm, validated device/cuff class, posture, and series protocol;
- same waist landmark, observer class, breathing/posture protocol, and compatible
  height source for waist-to-height ratio;
- treatment, pregnancy, illness, exercise, and major context changes visible; and
- no unresolved correction, duplicate, interference, or quality flag.

Changing a method or protocol creates a comparison break. Values remain in history
but are not treated as a continuous series by default. No universal meaningful-
change threshold is authorized.

### 17.4 Explicitly blocked outputs

This standard blocks:

- “normal,” “abnormal,” “optimal,” “poor,” “healthy,” “unhealthy,” or traffic-light
  labels;
- diagnoses or statements that a single value confirms disease;
- treatment initiation, cessation, dose, target, or causal response claims;
- atherogenic, glycemic, BP, adiposity, or parent-domain scores;
- conversion of HDL-C into “protection,” ApoB into plaque amount, HbA1c into exact
  average glucose, waist into body-fat percentage, or any value into lifespan;
- individual event probabilities without a separately authorized risk model;
- silent averaging, imputation, interpolation, carrying forward, or selection of
  the most favorable/unfavorable value;
- urgent UI alerts before a separate clinical-safety policy; and
- AI invention of fasting state, source, method, pregnancy, medication, protocol,
  or clinical meaning.

## 18. Validation Summary and Remaining Limitations

### 18.1 Validation summary

| Area | Standard conclusion | Confidence | Residual limitation |
| --- | --- | --- | --- |
| Routine lipids | Mature reference networks and broad clinical adoption support governed laboratory acceptance | High | Direct/calculated LDL and some routine assay differences remain method-sensitive |
| ApoB | Standardized routine immunoassay is production suitable | High | Reference-system refinement and platform metadata still matter |
| Lp(a) | Production suitable only with exact assay and unit identity | Moderate to high | Apo(a) isoform effects and incomplete harmonization prevent mass/molar equivalence |
| HbA1c | Strong IFCC/NGSP framework supports production | High | Red-cell biology and method-specific variants can invalidate interpretation despite analytical quality |
| FPG | Referenceable measurand and mature assays support production | High for assay; conditional overall | Preanalytic glycolysis and fasting provenance are frequent failure points |
| Home cuff BP | Strong measurement standards and validated-device pathways | High when complete | Technique, adherence, device/cuff fit, and series completeness vary |
| Office/AOBP | Mature but protocol-sensitive | Moderate to high | Routine clinical practice often deviates; AOBP programs are heterogeneous |
| Waist | Feasible standardized anthropometry | Moderate | Landmark and observer variability; no global single protocol consensus |
| Waist-to-height ratio | Simple governed derivation with guideline adoption | Moderate | Inherits waist and height error; height compatibility and derivation precision require validation |
| Provenance/source policy | Scientifically defensible fail-closed framework | High conceptually | Real-world EHR exports often omit assay, fasting, cuff, or protocol metadata |

### 18.2 Remaining limitations

1. Many laboratory interfaces do not expose analyzer, reagent, calibration, tube,
   or processing metadata.
2. ISO and other standards may be copyrighted; this dossier cites their authority
   but is not a substitute for licensed full text.
3. ApoB and especially Lp(a) standardization continue to evolve.
4. Routine direct LDL-C methods and calculated equations are not universally
   interchangeable across triglyceride and LDL-C concentrations.
5. HbA1c interference depends on the exact assay and red-cell biology; a generic
   interference list cannot resolve every variant.
6. FPG is unusually vulnerable to collection-to-separation delay and falsely
   asserted fasting state.
7. BP-device validation lists, models, cuffs, amendments, and special-population
   evidence change over time.
8. No global consensus establishes one optimal waist landmark. The WHO identity is
   selected for platform consistency, not because all alternatives are invalid.
9. Self-measured waist can be useful but has observer and technique error; it is
   not automatically equivalent to professional measurement.
10. Biological variation and analytical uncertainty do not support one universal
    minimum meaningful change for any scoped measurement.
11. Pediatric growth, pregnancy, acute-care, dialysis, hemoglobinopathy, severe
    edema/ascites, amputation, and other specialty populations need dedicated
    policies.
12. No thresholds, references, clinical categories, or urgent escalation rules are
    validated here.

## 19. Phase 7.0C Interface

Phase 7.0C must keep measurement acceptance separate from interpretation. It must:

1. Distinguish population reference intervals, clinical diagnostic thresholds,
   guideline decision thresholds, risk-enhancing thresholds, treatment targets,
   and assay-specific cutoffs.
2. Define which reference or interpretation systems apply by age, sex, pregnancy,
   ethnicity/region, clinical state, specimen, method, BP setting, and waist
   protocol.
3. Determine whether and how direct and calculated LDL-C, ApoB, non-HDL-C, and
   HDL-C can be displayed without duplication or false precedence.
4. Define fasting/nonfasting triglyceride interpretation and repeat-confirmation
   rules without inferring fasting.
5. Define Lp(a) unit- and assay-specific interpretation without conversion.
6. Govern HbA1c/plasma-glucose discordance and every condition that requires
   interpretation to be Unknown or clinician-directed.
7. Keep screening and diagnostic authority distinct and require repeat
   confirmation where external clinical practice requires it.
8. Preserve home, office, and AOBP setting-specific references and prohibit
   hypertension diagnosis from one reading.
9. Review ethnicity/region-specific waist thresholds and waist-to-height
   interpretation without creating a universal “optimal longevity” range.
10. Establish longitudinal uncertainty and method-change policies without
    claiming treatment causation.
11. Conduct a separate urgent-safety review for potentially critical laboratory or
    BP findings before any alert language.
12. Produce no parent Cardiometabolic Health score.

Phase 7.0C may proceed using this measurement standard. Production interpretation
and application integration remain blocked until 7.0C and independent governance
review are complete.

## 20. Evidence Registry

### 20.1 Laboratory and assay authorities

| Evidence ID | Source and current version/date | Governing contribution | Limitation |
| --- | --- | --- | --- |
| CMH-B-E001 | [ISO 15189:2022, fourth edition](https://www.iso.org/standard/76677.html) | Medical-laboratory quality and competence, including POCT applicability | Full requirements require licensed standard |
| CMH-B-E002 | [CDC CRMLN overview, updated 2 December 2025](https://www.cdc.gov/clinical-standardization-programs/php/cvd/improving-performance-crmln.html) | Reference services for total cholesterol, HDL-C, LDL-C, and triglycerides | Certification is system/analyte/time specific |
| CMH-B-E003 | [CDC Lipids Standardization/Accuracy-Based Monitoring, 24 April 2024](https://www.cdc.gov/clinical-standardization-programs/php/cvd/monitoring-accuracy-lsp.html) | Accuracy monitoring for lipids, ApoA-I, and ApoB | Participation does not expose every patient-result metadata field |
| CMH-B-E004 | [CDC certified CVD assays and participants, 28 April 2026](https://www.cdc.gov/clinical-standardization-programs/php/cvd/list-of-cvd-certified-assays.html) | Current certification scope and expiry principle | Registry changes over time |
| CMH-B-E005 | [EAS/EFLM atherogenic-lipoprotein quantification consensus, 2018](https://eas-society.org/wp-content/uploads/2022/05/2018_Consensus-Quantifying-Atherogeneic-Lipoproteins.pdf) | ApoB, LDL-C, non-HDL-C measurement and standardization | Predates newest guidelines but remains a core laboratory consensus |
| CMH-B-E006 | [Standardization review of ApoB, LDL-C, and non-HDL-C, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10492988/) | Current strengths and limitations of standardization | Narrative/scientific review rather than formal standard |
| CMH-B-E007 | [EAS Lp(a) consensus, 2022](https://eas-society.org/wp-content/uploads/2024/01/ehac361.pdf) | Assay isoform sensitivity, molar preference, no generic unit conversion | Harmonization is still incomplete |
| CMH-B-E008 | [AHA Lp(a) scientific statement, 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9989949/) | Genetically determined biology and mass/molar non-equivalence | Does not create a complete assay reference system |
| CMH-B-E009 | [EAS/EFLM nonfasting lipid consensus, 2016](https://pubmed.ncbi.nlm.nih.gov/27122601/) | Routine nonfasting acceptability and analyte-specific meal effects | Fasting may still be needed in selected clinical contexts |

### 20.2 Glycemic authorities

| Evidence ID | Source and current version/date | Governing contribution | Limitation |
| --- | --- | --- | --- |
| CMH-B-E010 | [ADA Standards of Care—2026, diagnosis and classification](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes) | Current roles, confirmation, fasting definition, HbA1c limitations | Diagnostic thresholds are intentionally not operationalized |
| CMH-B-E011 | [Laboratory analysis guideline, Diabetes Care 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/) | Plasma-glucose preanalytics, analytical goals, HbA1c standardization and performance | Some recommendations are clinical and remain outside this phase |
| CMH-B-E012 | [NGSP interference guidance, updated 23 June 2026](https://ngsp.org/factors.asp) | Method-specific hemoglobin variants and red-cell interpretation limitations | Requires exact assay identification and ongoing surveillance |
| CMH-B-E013 | [NGSP certified methods](https://ngsp.org/certified.asp) | Current method certification for DCCT-aligned HbA1c reporting | Certification list changes and is method-specific |
| CMH-B-E014 | [IFCC HbA1c reference-system consensus](https://cms.ifcc.org/media/147917/HbA1c%20Clin%20Chem%20Lab%20Med%202007_45_942-944.pdf) | IFCC anchor, mmol/mol and NGSP dual reporting through official relationship | Foundational and older; implementation varies by jurisdiction |

### 20.3 Blood-pressure authorities

| Evidence ID | Source and current version/date | Governing contribution | Limitation |
| --- | --- | --- | --- |
| CMH-B-E015 | [2025 AHA/ACC High Blood Pressure Guideline, online 14 August 2025](https://www.ahajournals.org/doi/10.1161/HYP.0000000000000249) | Current US standardized measurement, validated devices, HBPM, and cuffless restriction | Clinical diagnosis/treatment content is outside this phase |
| CMH-B-E016 | [2024 ESC BP Guideline, 30 August 2024](https://academic.oup.com/eurheartj/article/45/38/3912/7741010) | Standard office preparation, out-of-office authority, and device validation | Thresholds and treatment are not operationalized |
| CMH-B-E017 | [AHA Measurement of Blood Pressure in Humans statement, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409525/) | Detailed office, AOBP, HBPM, cuff, posture, arm, and repeat protocols | Some later guideline details supersede clinical policy, not core technique |
| CMH-B-E018 | [ESH HBPM position paper, 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC9904446/) | Three-to-seven-day home protocol and duplicate morning/evening readings | Protocol variants remain across guidelines |
| CMH-B-E019 | [AAMI/ESH/ISO Universal Standard statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC5796427/) | Universal independent validation framework for cuff devices | The full current ISO standard and amendments control exact testing |
| CMH-B-E020 | [ISO 81060-2:2018](https://www.iso.org/standard/73339.html) | Clinical investigation of intermittent automated non-invasive sphygmomanometers | Full text and amendments require current licensed review |
| CMH-B-E021 | [STRIDE BP validated-device registry](https://www.stridebp.org/bp-monitors/) | Independent model-, cuff-, protocol-, and population-specific device listing | Dynamic registry; listing must be checked at measurement/review time |
| CMH-B-E022 | [ValidateBP device registry](https://www.validatebp.org/devices/list) | Independently reviewed US validated-device list and cuff ranges | Geographic availability and listing criteria differ from STRIDE BP |
| CMH-B-E023 | [AHA cuffless-device statement, online 11 December 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC13335599/) | Cuffless limitations and non-equivalence to validated cuff measurement | Technology and validation standards continue to evolve |

### 20.4 Anthropometry authorities

| Evidence ID | Source and current version/date | Governing contribution | Limitation |
| --- | --- | --- | --- |
| CMH-B-E024 | [WHO STEPS physical-measurement protocol](https://iris.who.int/bitstream/handle/10665/43376/9241593830_eng.pdf) | Midpoint waist landmark, standing position, normal expiration, tape and 0.1-cm recording | Manual is older but remains the named international protocol |
| CMH-B-E025 | [WHO waist and waist-hip expert consultation, report 2011](https://www.who.int/publications/i/item/9789241501491) | Protocol and population/ethnicity considerations | Does not establish one universal threshold or eliminate protocol heterogeneity |
| CMH-B-E026 | [IAS/ICCR waist consensus statement, 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7027970/) | WHO and NIH protocols, observer/landmark limitations, consistency requirement | Consensus acknowledges no single optimal landmark |
| CMH-B-E027 | [NICE NG246, published 14 January 2025](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity) | Current waist-to-height adoption and same-unit source requirement | Interpretation categories are reserved for Phase 7.0C |
| CMH-B-E028 | [NHANES 2021 Anthropometry Procedures Manual](https://wwwn.cdc.gov/nchs/data/nhanes/public/2021/manuals/2021-Anthropometry-Procedures-Manual-508.pdf) | High-quality alternative iliac-crest protocol, equipment, training, and QC | Landmark differs from the preferred WHO identity |

### 20.5 Governing Vitalspan documents

| Evidence ID | Source | Governing contribution |
| --- | --- | --- |
| CMH-B-E029 | Phase 7.0A Cardiometabolic Health Scientific Evidence Review | Candidate scope, roles, exclusions, domain boundaries, and Phase 7.0B requirements |
| CMH-B-E030 | Clinical PhenoAge v1 scientific validation | Frozen scientific identity, independent validation, and bounded interpretation authority |
| CMH-B-E031 | Phase 5.0B VO₂max Measurement Standard | Source inheritance, confidence, raw/normalized separation, versioning, and fail-closed governance |
| CMH-B-E032 | Phase 6.0B Functional Capacity Measurement Standard | Protocol identity, raw-trial retention, comparison barriers, and source-neutral confidence |

No material correction changing this standard was identified in the official and
publisher records checked on 18 July 2026. Evidence surveillance remains required;
absence of a detected correction is not proof that none will appear later.

## 21. Production Recommendation

### Final status: Production Ready — Conditional

This Phase 7.0B specification is scientifically ready to govern a later isolated
measurement-validation design. It does not recommend production implementation.

The conditions are:

- apply the exact 15 method identities and preserve all 13 candidate groups as
  independent measurements;
- accept laboratory values only with analyte, unit, specimen, event time, source,
  and method-critical provenance;
- preserve direct/calculated LDL-C and molar/mass Lp(a) separation;
- require IFCC/NGSP-governed HbA1c and venous-plasma/glycolysis-controlled FPG;
- require validated upper-arm cuff devices, correct cuffs, standardized posture,
  preparation, arm, repeats, and setting-specific BP identities;
- use the WHO midpoint waist identity, preserve alternate landmarks separately,
  and require measured-height lineage for production-grade waist-to-height ratio;
- retain every raw observation, source value, trial, reading, unit, timestamp,
  correction, and policy version;
- assign source confidence from method and provenance rather than brand or setting;
- quarantine ambiguity and extremes rather than guessing, averaging, clipping, or
  diagnosing; and
- complete Phase 7.0C and independent specialty/legal review before any reference,
  interpretation, safety messaging, or implementation.

No unresolved scientific issue prevents Phase 7.0C from beginning. Production
interpretation and application integration remain blocked because this phase does
not authorize thresholds, categories, diagnosis, treatment, urgent alerts,
calculations, or code.

The governing conclusion is:

> Vitalspan may accept a cardiometabolic measurement only when the measurand,
> method, specimen or physical protocol, unit, source, time, and quality state are
> sufficiently known. It must preserve incompatible identities, retain Unknown
> context as Unknown, and never turn measurement acceptance into diagnosis,
> scoring, treatment advice, or personal risk prediction.
