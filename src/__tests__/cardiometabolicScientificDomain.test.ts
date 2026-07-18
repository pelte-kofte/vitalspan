import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS,
  CARDIOMETABOLIC_CONFIDENCE_REGISTRY,
  CARDIOMETABOLIC_GOVERNANCE,
  CARDIOMETABOLIC_INTERPRETATION_POLICY_REGISTRY,
  CARDIOMETABOLIC_MEASUREMENT_REGISTRY,
  CARDIOMETABOLIC_REASON_ORDER,
  CARDIOMETABOLIC_REFERENCE_MATCHING_POLICY,
  CARDIOMETABOLIC_REFERENCE_REGISTRY,
  CARDIOMETABOLIC_REQUIRED_FIXTURE_IDS,
  CARDIOMETABOLIC_SCIENTIFIC_VERSIONS,
  CARDIOMETABOLIC_SOURCE_REGISTRY,
  CARDIOMETABOLIC_TREND_COMPARISON_POLICY,
  auditCardiometabolicGovernance,
  createValidCardiometabolicFixture,
  evaluateCardiometabolicEligibility,
  evaluateCardiometabolicTrendCompatibility,
  type CardiometabolicMeasurementId,
  type CardiometabolicMeasurementInput,
} from '../domain/scientificDomains/cardiometabolic';

function fixture(id: CardiometabolicMeasurementId, suffix = 'test'): CardiometabolicMeasurementInput {
  return createValidCardiometabolicFixture(id, suffix);
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

describe('Phase 7.0D Cardiometabolic Health scientific domain', () => {
  describe('versioned governance and isolation', () => {
    test('governs 15 independent identities and every required registry', () => {
      expect(auditCardiometabolicGovernance()).toMatchObject({ valid: true, issues: [] });
      expect(CARDIOMETABOLIC_MEASUREMENT_REGISTRY.measurements).toHaveLength(15);
      expect(new Set(CARDIOMETABOLIC_MEASUREMENT_REGISTRY.measurements.map(item => item.id)).size).toBe(15);
      expect(CARDIOMETABOLIC_INTERPRETATION_POLICY_REGISTRY.policies).toHaveLength(15);
      expect(CARDIOMETABOLIC_REFERENCE_REGISTRY.references).toHaveLength(21);
      expect(Object.keys(CARDIOMETABOLIC_SCIENTIFIC_VERSIONS)).toHaveLength(14);
      expect(CARDIOMETABOLIC_REQUIRED_FIXTURE_IDS.length).toBeGreaterThanOrEqual(80);
      expect(CARDIOMETABOLIC_GOVERNANCE).toMatchObject({
        standaloneDomain: true,
        independentMeasurements: true,
        failClosed: true,
        artificialIntelligenceScientificDecisionsAllowed: false,
        productionIntegrationAuthorized: false,
        diagnosisAuthorized: false,
        treatmentAdviceAuthorized: false,
        silentFallbackAllowed: false,
      });
    });

    test('uses the six exact Phase 7.0B confidence identities and source classes', () => {
      expect(CARDIOMETABOLIC_CONFIDENCE_REGISTRY.definitions.map(item => item.id)).toEqual([
        'CMH-CONF-R', 'CMH-CONF-F', 'CMH-CONF-L', 'CMH-CONF-P', 'CMH-CONF-Q', 'CMH-CONF-X',
      ]);
      expect(CARDIOMETABOLIC_SOURCE_REGISTRY.sources.map(item => item.id)).toEqual(expect.arrayContaining([
        'CMH-SRC-REFLAB', 'CMH-SRC-CLAB', 'CMH-SRC-HOSP-EHR', 'CMH-SRC-RESEARCH',
        'CMH-SRC-POCT', 'CMH-SRC-HOMEKIT', 'CMH-SRC-CLIN-BP', 'CMH-SRC-HOME-BP',
        'CMH-SRC-CLIN-ANTH', 'CMH-SRC-SELF-ANTH', 'CMH-SRC-MANUAL-DOC',
        'CMH-SRC-MANUAL', 'CMH-SRC-CONTAINER', 'CMH-SRC-CUFFLESS', 'CMH-SRC-CONSUMER-BIO',
      ]));
      expect(CARDIOMETABOLIC_CONFIDENCE_REGISTRY).toMatchObject({ confidenceIsNotAScore: true, downgradeOnly: true, sourceIdentityAloneCanUpgrade: false });
    });

    test('blocks scores, diagnoses, treatment, risk prediction, substitutions, and PhenoAge modification', () => {
      expect(CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS).toEqual(expect.arrayContaining([
        'cardiometabolic_health_score', 'cross_marker_composite', 'traffic_light_parent_status',
        'optimal_longevity_range', 'individual_event_risk_prediction', 'ascvd_calculation',
        'metabolic_syndrome_diagnosis', 'diabetes_diagnosis', 'prediabetes_diagnosis',
        'hypertension_diagnosis', 'familial_hypercholesterolemia_diagnosis', 'obesity_diagnosis',
        'pancreatitis_diagnosis', 'medication_initiation', 'dose_recommendation',
        'higher_is_always_better', 'lower_is_always_better', 'lpa_unit_conversion',
        'clinical_phenoage_modification', 'composite_longevity_score',
      ]));
      expect(Object.entries(CARDIOMETABOLIC_REFERENCE_MATCHING_POLICY)
        .filter(([key]) => key.startsWith('permits')).every(([, value]) => value === false)).toBe(true);
    });

    test('has no product reference outside the isolated module and this test', () => {
      const sourceRoot = join(process.cwd(), 'src');
      const moduleRoot = `${join(sourceRoot, 'domain', 'scientificDomains', 'cardiometabolic')}/`;
      const thisTest = join(sourceRoot, '__tests__', 'cardiometabolicScientificDomain.test.ts');
      const references = sourceFiles(sourceRoot)
        .filter(path => !`${path}/`.startsWith(moduleRoot) && path !== thisTest)
        .filter(path => /scientificDomains\/cardiometabolic|CARDIOMETABOLIC_/.test(readFileSync(path, 'utf8')));
      expect(references).toEqual([]);
    });
  });

  describe('common validation and auditability', () => {
    test('is deterministic, orders reason codes, and preserves original input and all versions', () => {
      const input = fixture('apolipoprotein_b', 'deterministic');
      input.timestamps.measuredAt = null;
      input.provenance.sourceRecordId = null;
      const first = evaluateCardiometabolicEligibility(input);
      const second = evaluateCardiometabolicEligibility(input);
      expect(first).toEqual(second);
      expect(first.reasonCodes).toEqual([...first.reasonCodes].sort((a, b) => CARDIOMETABOLIC_REASON_ORDER.indexOf(a) - CARDIOMETABOLIC_REASON_ORDER.indexOf(b)));
      expect(first.audit.originalInput).toBe(input);
      expect(first.scientificVersions).toEqual(CARDIOMETABOLIC_SCIENTIFIC_VERSIONS);
      expect(first.audit.registryVersions).toEqual(CARDIOMETABOLIC_SCIENTIFIC_VERSIONS);
    });

    test.each([
      ['unknown identity', (input: CardiometabolicMeasurementInput) => { input.measurementId = 'unknown'; }, 'invalid', 'unknown_measurement_identity'],
      ['missing value', (input: CardiometabolicMeasurementInput) => { input.numeric!.value = null; }, 'insufficient_data', 'missing_value'],
      ['non-finite value', (input: CardiometabolicMeasurementInput) => { input.numeric!.value = Number.NaN; }, 'invalid', 'non_finite_value'],
      ['unsupported unit', (input: CardiometabolicMeasurementInput) => { input.numeric!.unit = 'particles'; }, 'invalid', 'unsupported_unit'],
      ['missing timestamp', (input: CardiometabolicMeasurementInput) => { input.timestamps.measuredAt = null; }, 'insufficient_data', 'missing_timestamp'],
      ['incomplete provenance', (input: CardiometabolicMeasurementInput) => { input.provenance.sourceRecordId = null; }, 'insufficient_data', 'missing_source_record_id'],
    ] as const)('%s fails closed', (_name, mutate, status, reason) => {
      const input = fixture('apolipoprotein_b', _name);
      mutate(input);
      const result = evaluateCardiometabolicEligibility(input);
      expect(result.status).toBe(status);
      expect(result.reasonCodes).toContain(reason);
      expect(result.measurementAccepted).toBe(false);
    });

    test('does not promote manual entry and preserves append-only corrections', () => {
      const manual = fixture('hba1c', 'manual');
      manual.sourceId = 'CMH-SRC-MANUAL-DOC';
      manual.verificationStatus = 'provisional';
      manual.provenance.sourceDocumentVerified = false;
      expect(evaluateCardiometabolicEligibility(manual)).toMatchObject({ status: 'unsupported', confidenceClassification: 'CMH-CONF-P', measurementAccepted: false });

      const correction = fixture('hba1c', 'correction');
      correction.duplicate = { disposition: 'correction', correctsRecordId: 'older-record' };
      const corrected = evaluateCardiometabolicEligibility(correction);
      expect(corrected.reasonCodes).toContain('historical_correction_retained');
      expect(corrected.audit.originalInput.duplicate.correctsRecordId).toBe('older-record');
    });

    test('retains a valid raw measurement when exact interpretation fails and uses no fallback', () => {
      const input = fixture('ldl_c_direct', 'no-fallback');
      input.population.guidelineRegion = 'Europe';
      const result = evaluateCardiometabolicEligibility(input);
      expect(result).toMatchObject({ measurementAccepted: true, status: 'measurement_accepted_no_interpretation' });
      expect(result.canonicalMeasurement.value).toBeCloseTo(3.2);
      expect(result.referenceDecision.status).toBe('ineligible');
      expect(result.reasonCodes).toContain('no_exact_reference');
      expect(result.authorizedOutputs).toContain('validated_raw_measurement');
    });
  });

  describe('independent measurement eligibility', () => {
    test.each([
      ['apolipoprotein_b', 'measurement_accepted_raw_only'], ['ldl_c_direct', 'measurement_accepted_no_interpretation'],
      ['ldl_c_calculated', 'measurement_accepted_no_interpretation'], ['non_hdl_c', 'measurement_accepted_raw_only'],
      ['hdl_c', 'measurement_accepted_raw_only'], ['triglycerides', 'eligible'],
      ['lipoprotein_a_molar', 'eligible'], ['lipoprotein_a_mass', 'eligible'],
      ['hba1c', 'eligible'], ['fasting_plasma_glucose', 'eligible'],
      ['home_cuff_blood_pressure', 'eligible'], ['office_blood_pressure', 'eligible'],
      ['automated_office_blood_pressure', 'measurement_accepted_raw_only'],
      ['waist_circumference', 'measurement_accepted_raw_only'], ['waist_to_height_ratio', 'eligible'],
    ] as const)('%s evaluates independently as %s', (id, status) => {
      const result = evaluateCardiometabolicEligibility(fixture(id));
      expect(result.status).toBe(status);
      expect(result.measurementIdentity).toBe(id);
      expect(result.measurementAccepted).toBe(true);
      expect(result.blockedOutputs).toEqual(expect.arrayContaining(CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS));
    });

    test('keeps direct and calculated LDL distinct and validates calculated lineage and method', () => {
      const direct = fixture('ldl_c_direct', 'direct');
      const calculated = fixture('ldl_c_calculated', 'calculated');
      expect(evaluateCardiometabolicEligibility(direct).measurementIdentity).not.toBe(evaluateCardiometabolicEligibility(calculated).measurementIdentity);
      expect(evaluateCardiometabolicTrendCompatibility(direct, calculated).status).toBe('not_comparable');

      calculated.assay.methodId = 'CMH-CALC-LDLC-UNSUPPORTED';
      expect(evaluateCardiometabolicEligibility(calculated)).toMatchObject({ status: 'assay_mismatch', measurementAccepted: false });

      const missing = fixture('ldl_c_calculated', 'missing-lineage');
      delete missing.lineage.sourceAnalytes!.triglycerides;
      expect(evaluateCardiometabolicEligibility(missing).reasonCodes).toContain('ldl_source_analytes_missing');

      const invalid = fixture('ldl_c_calculated', 'invalid-context');
      invalid.assay.calculationValid = false;
      expect(evaluateCardiometabolicEligibility(invalid).reasonCodes).toContain('invalid_ldl_calculation_context');
    });

    test('keeps ApoB, non-HDL-C, and HDL-C raw-only with marker limitations', () => {
      for (const id of ['apolipoprotein_b', 'non_hdl_c', 'hdl_c'] as const) {
        const result = evaluateCardiometabolicEligibility(fixture(id));
        expect(result.interpretation.availability).toBe('raw_only');
        expect(result.authorizedOutputs).not.toContain('published_informational_screening_context');
      }
      expect(evaluateCardiometabolicEligibility(fixture('hdl_c')).blockedOutputs).toEqual(expect.arrayContaining(['higher_is_always_better', 'individual_treatment_target']));
      const missingLineage = fixture('non_hdl_c', 'missing-lineage');
      missingLineage.lineage.sourceAnalytes = null;
      expect(evaluateCardiometabolicEligibility(missingLineage).reasonCodes).toContain('derived_lineage_incomplete');
    });
  });

  describe('lipid, glycemic, pressure, and adiposity boundaries', () => {
    test('distinguishes fasting status and limits severe triglycerides to review candidacy', () => {
      const nonfasting = fixture('triglycerides', 'nonfasting');
      nonfasting.context.fastingStatus = 'non_fasting';
      expect(evaluateCardiometabolicEligibility(nonfasting).interpretation.contextLabel).toContain('non-fasting');

      const unknown = fixture('triglycerides', 'unknown');
      unknown.context.fastingStatus = 'unknown';
      expect(evaluateCardiometabolicEligibility(unknown)).toMatchObject({ status: 'measurement_accepted_context_missing', interpretation: { eligible: false } });

      const severe = fixture('triglycerides', 'severe');
      severe.numeric = { value: 1000, unit: 'mg/dL' };
      const result = evaluateCardiometabolicEligibility(severe);
      expect(result).toMatchObject({ status: 'safety_review_candidate', safetyCandidate: { status: 'safety_candidate_time_sensitive_clinical_review', diagnosisAuthorized: false, emergencyDispositionAuthorized: false } });
      expect(result.blockedOutputs).toContain('pancreatitis_diagnosis');
    });

    test('never converts Lp(a) mass and molar identities', () => {
      expect(evaluateCardiometabolicEligibility(fixture('lipoprotein_a_molar')).interpretation.eligible).toBe(true);
      expect(evaluateCardiometabolicEligibility(fixture('lipoprotein_a_mass')).interpretation.eligible).toBe(true);
      const wrongUnit = fixture('lipoprotein_a_molar', 'wrong-unit');
      wrongUnit.numeric!.unit = 'mg/dL';
      expect(evaluateCardiometabolicEligibility(wrongUnit).reasonCodes).toContain('lpa_unit_mismatch');
      expect(evaluateCardiometabolicTrendCompatibility(fixture('lipoprotein_a_molar'), fixture('lipoprotein_a_mass')).status).toBe('not_comparable');
      expect(CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS).toContain('lpa_unit_conversion');
    });

    test('blocks HbA1c interpretation for missing certification, anemia, altered turnover, and pregnancy', () => {
      const percent = fixture('hba1c', 'percent');
      percent.numeric = { value: 6.0, unit: '%' };
      percent.assay.ngspCertified = false;
      expect(evaluateCardiometabolicEligibility(percent).reasonCodes).toContain('assay_certification_missing');

      for (const [field, reason] of [['anemia', 'hba1c_confounding_context'], ['alteredRedCellTurnover', 'hba1c_confounding_context'], ['pregnancy', 'pregnancy_exclusion']] as const) {
        const input = fixture('hba1c', field);
        (input.context[field] as 'present') = 'present';
        const result = evaluateCardiometabolicEligibility(input);
        expect(result.measurementAccepted).toBe(true);
        expect(result.interpretation.eligible).toBe(false);
        expect(result.reasonCodes).toContain(reason);
      }
      const valid = evaluateCardiometabolicEligibility(fixture('hba1c', 'valid'));
      expect(valid.authorizedOutputs).toContain('repeat_confirmation_requirement');
      expect(valid.blockedOutputs).toEqual(expect.arrayContaining(['diabetes_diagnosis', 'prediabetes_diagnosis']));
    });

    test('requires true fasting venous plasma and glycolysis control without inventing a glucose safety threshold', () => {
      const noFast = fixture('fasting_plasma_glucose', 'no-fast');
      noFast.context.fastingStatus = 'unknown';
      expect(evaluateCardiometabolicEligibility(noFast)).toMatchObject({ measurementAccepted: true, interpretation: { eligible: false } });

      const random = fixture('fasting_plasma_glucose', 'random');
      random.assay.specimen = 'random_plasma';
      random.context.fastingStatus = 'non_fasting';
      expect(evaluateCardiometabolicEligibility(random)).toMatchObject({ status: 'invalid', measurementAccepted: false });

      const handling = fixture('fasting_plasma_glucose', 'handling');
      handling.protocol.adherence = 'partial';
      expect(evaluateCardiometabolicEligibility(handling).reasonCodes).toContain('glycolysis_control_missing');

      const high = fixture('fasting_plasma_glucose', 'high');
      high.numeric!.value = 30;
      const result = evaluateCardiometabolicEligibility(high);
      expect(result.safetyCandidate.status).toBe('no_authorized_safety_candidate');
      expect(result.reasonCodes).toContain('no_authorized_glucose_safety_boundary');
      expect(result.blockedOutputs).toContain('diabetes_diagnosis');
    });

    test('requires repeated validated cuff protocols and never diagnoses hypertension', () => {
      const singleHome = fixture('home_cuff_blood_pressure', 'single');
      singleHome.bloodPressure!.readings = singleHome.bloodPressure!.readings.slice(0, 1);
      Object.assign(singleHome.bloodPressure!, { readingCount: 1, occasionCount: 1, seriesComplete: false });
      expect(evaluateCardiometabolicEligibility(singleHome)).toMatchObject({ status: 'measurement_accepted_context_missing', measurementAccepted: true, interpretation: { eligible: false } });

      const singleOffice = fixture('office_blood_pressure', 'single');
      Object.assign(singleOffice.bloodPressure!, { readingCount: 2, occasionCount: 1, seriesComplete: false });
      expect(evaluateCardiometabolicEligibility(singleOffice).reasonCodes).toContain('bp_multi_occasion_required');

      const cuffless = fixture('home_cuff_blood_pressure', 'cuffless');
      cuffless.sourceId = 'CMH-SRC-CUFFLESS';
      cuffless.protocol.upperArmCuff = false;
      expect(evaluateCardiometabolicEligibility(cuffless)).toMatchObject({ status: 'source_unsupported', measurementAccepted: false });
      expect(evaluateCardiometabolicEligibility(fixture('office_blood_pressure')).blockedOutputs).toContain('hypertension_diagnosis');
      expect(evaluateCardiometabolicEligibility(fixture('automated_office_blood_pressure')).interpretation.availability).toBe('raw_only');
    });

    test('keeps BP safety candidate separate from diagnosis and emergency disposition', () => {
      const high = fixture('home_cuff_blood_pressure', 'high');
      high.bloodPressure!.summarySystolic = 181;
      high.bloodPressure!.summaryDiastolic = 121;
      const complete = evaluateCardiometabolicEligibility(high);
      expect(complete.safetyCandidate).toMatchObject({ status: 'safety_candidate_time_sensitive_clinical_review', diagnosisAuthorized: false, emergencyDispositionAuthorized: false });
      expect(complete.safetyCandidate.boundaryVersion).toBe(CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.safetyCandidatePolicy);

      high.context.symptomsPresent = null;
      expect(evaluateCardiometabolicEligibility(high).safetyCandidate.status).toBe('safety_candidate_symptom_context_required');

      high.bloodPressure!.seriesComplete = false;
      expect(evaluateCardiometabolicEligibility(high).safetyCandidate.status).toBe('insufficient_safety_context');
    });

    test('limits LDL-C 190 mg/dL to clinician review, never FH diagnosis', () => {
      const high = fixture('ldl_c_direct', '190');
      high.numeric = { value: 190, unit: 'mg/dL' };
      const result = evaluateCardiometabolicEligibility(high);
      expect(result.safetyCandidate.status).toBe('clinician_review_candidate');
      expect(result.safetyCandidate.emergencyDispositionAuthorized).toBe(false);
      expect(result.blockedOutputs).toContain('familial_hypercholesterolemia_diagnosis');
    });

    test('keeps waist raw-only and bounds waist-to-height interpretation to complete NICE adult lineage', () => {
      const waist = evaluateCardiometabolicEligibility(fixture('waist_circumference'));
      expect(waist.interpretation.availability).toBe('raw_only');
      expect(waist.blockedOutputs).toContain('obesity_diagnosis');

      const landmark = fixture('waist_circumference', 'landmark');
      landmark.protocol.waistLandmark = 'umbilicus';
      expect(evaluateCardiometabolicEligibility(landmark).reasonCodes).toContain('waist_landmark_mismatch');

      const selfReported = fixture('waist_to_height_ratio', 'self-height');
      selfReported.lineage.heightSource = 'self_reported';
      expect(evaluateCardiometabolicEligibility(selfReported).interpretation.eligible).toBe(false);

      const oldHeight = fixture('waist_to_height_ratio', 'old-height');
      oldHeight.lineage.heightTimestamp = '2020-01-01T00:00:00.000Z';
      expect(evaluateCardiometabolicEligibility(oldHeight).reasonCodes).toContain('height_timestamp_incompatible');

      const pregnant = fixture('waist_to_height_ratio', 'pregnant');
      pregnant.context.pregnancy = 'present';
      expect(evaluateCardiometabolicEligibility(pregnant).interpretation.eligible).toBe(false);

      const pediatric = fixture('waist_to_height_ratio', 'pediatric');
      pediatric.population.adultEligible = false;
      expect(evaluateCardiometabolicEligibility(pediatric).reasonCodes).toContain('adult_population_required');

      const global = fixture('waist_to_height_ratio', 'global');
      global.population.guidelineRegion = 'WHO';
      expect(evaluateCardiometabolicEligibility(global).referenceDecision.status).toBe('ineligible');
    });
  });

  describe('trend comparability', () => {
    test('returns only the four authorized states and never calculates change', () => {
      expect(CARDIOMETABOLIC_TREND_COMPARISON_POLICY).toMatchObject({
        statuses: ['Comparable', 'Conditionally Comparable', 'Not Comparable', 'Insufficient Data'],
        calculatesChange: false, calculatesSlope: false, calculatesPercentageChange: false,
        infersImprovement: false, infersTreatmentResponse: false, infersPrognosis: false,
      });
    });

    test('compares same methods and fails closed across identities, methods, settings, and landmarks', () => {
      expect(evaluateCardiometabolicTrendCompatibility(fixture('apolipoprotein_b', 'a'), fixture('apolipoprotein_b', 'b')).status).toBe('comparable');

      const changedAssay = fixture('apolipoprotein_b', 'changed');
      changedAssay.assay.methodId = 'different-assay';
      expect(evaluateCardiometabolicTrendCompatibility(fixture('apolipoprotein_b', 'base'), changedAssay).status).toBe('not_comparable');
      expect(evaluateCardiometabolicTrendCompatibility(fixture('ldl_c_direct'), fixture('ldl_c_calculated')).status).toBe('not_comparable');
      expect(evaluateCardiometabolicTrendCompatibility(fixture('lipoprotein_a_mass'), fixture('lipoprotein_a_molar')).status).toBe('not_comparable');
      expect(evaluateCardiometabolicTrendCompatibility(fixture('home_cuff_blood_pressure'), fixture('office_blood_pressure')).status).toBe('not_comparable');

      const otherLandmark = fixture('waist_circumference', 'other');
      otherLandmark.protocol.waistLandmark = 'umbilicus';
      expect(evaluateCardiometabolicTrendCompatibility(fixture('waist_circumference', 'who'), otherLandmark).status).toBe('not_comparable');
    });

    test('treats triglyceride fasting mismatch as conditional and missing metadata as insufficient', () => {
      const fasting = fixture('triglycerides', 'fasting');
      const nonfasting = fixture('triglycerides', 'nonfasting');
      nonfasting.context.fastingStatus = 'non_fasting';
      expect(evaluateCardiometabolicTrendCompatibility(fasting, nonfasting).status).toBe('conditionally_comparable');

      const missing = fixture('apolipoprotein_b', 'missing');
      missing.assay.methodId = null;
      expect(evaluateCardiometabolicTrendCompatibility(fixture('apolipoprotein_b', 'complete'), missing).status).toBe('insufficient_data');
    });

    test('exposes trend status in the eligibility audit only when requested', () => {
      const first = fixture('automated_office_blood_pressure', 'first');
      const second = fixture('automated_office_blood_pressure', 'second');
      expect(evaluateCardiometabolicEligibility(first).trendComparability).toBeNull();
      expect(evaluateCardiometabolicEligibility(first, second).trendComparability?.status).toBe('comparable');
    });
  });
});
