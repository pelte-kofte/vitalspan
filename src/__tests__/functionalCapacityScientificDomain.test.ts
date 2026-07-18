import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS,
  FUNCTIONAL_CAPACITY_CONFIDENCE_REGISTRY,
  FUNCTIONAL_CAPACITY_GOVERNANCE,
  FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY,
  FUNCTIONAL_CAPACITY_REASON_ORDER,
  FUNCTIONAL_CAPACITY_REFERENCE_MATCHING_POLICY,
  FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY,
  FUNCTIONAL_CAPACITY_REQUIRED_FIXTURE_IDS,
  FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS,
  FUNCTIONAL_CAPACITY_SOURCE_REGISTRY,
  FUNCTIONAL_CAPACITY_TEST_REGISTRY,
  FUNCTIONAL_CAPACITY_TREND_COMPARISON_POLICY,
  auditFunctionalCapacityGovernance,
  createValidFunctionalCapacityFixture,
  evaluateFunctionalCapacityEligibility,
  evaluateFunctionalCapacityTrendCompatibility,
  type FunctionalCapacityMeasurementInput,
  type FunctionalCapacityTestId,
} from '../domain/scientificDomains/functionalCapacity';

function fixture(testId: FunctionalCapacityTestId, suffix = 'test'): FunctionalCapacityMeasurementInput {
  return createValidFunctionalCapacityFixture(testId, `${testId}-${suffix}`);
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : [];
  });
}

describe('Phase 6.0D Functional Capacity scientific domain', () => {
  describe('versioned governance and domain isolation', () => {
    test('locks independent versions, registries, fail-closed governance, and fixture inventory', () => {
      const audit = auditFunctionalCapacityGovernance();
      expect(audit).toMatchObject({ valid: true, issues: [] });
      expect(new Set(Object.values(FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS)).size).toBe(11);
      expect(FUNCTIONAL_CAPACITY_TEST_REGISTRY.tests).toHaveLength(8);
      expect(new Set(FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY.protocols.map(item => item.id)).size)
        .toBe(FUNCTIONAL_CAPACITY_PROTOCOL_REGISTRY.protocols.length);
      expect(new Set(FUNCTIONAL_CAPACITY_SOURCE_REGISTRY.sources.map(item => item.id)).size)
        .toBe(FUNCTIONAL_CAPACITY_SOURCE_REGISTRY.sources.length);
      expect(FUNCTIONAL_CAPACITY_CONFIDENCE_REGISTRY.definitions.map(item => item.id)).toEqual([
        'clinical_grade', 'high_confidence', 'moderate_confidence',
        'low_confidence', 'research_only', 'unsupported',
      ]);
      expect(FUNCTIONAL_CAPACITY_REQUIRED_FIXTURE_IDS.length).toBeGreaterThanOrEqual(60);
      expect(FUNCTIONAL_CAPACITY_GOVERNANCE).toMatchObject({
        standaloneDomain: true,
        independentTestResults: true,
        failClosed: true,
        artificialIntelligenceScientificDecisionsAllowed: false,
        productionIntegrationAuthorized: false,
        silentFallbackAllowed: false,
        crossTestSubstitutionAllowed: false,
      });
    });

    test('prohibits every score, diagnosis, age, risk, recommendation, conversion, and substitution output', () => {
      expect(FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS).toEqual(expect.arrayContaining([
        'overall_functional_capacity_score', 'cross_test_ranking', 'qualitative_performance_category',
        'mortality_threshold', 'biological_age', 'fitness_age', 'frailty_diagnosis',
        'sarcopenia_diagnosis', 'fall_risk_diagnosis', 'disease_diagnosis',
        'treatment_recommendation', 'exercise_prescription', 'composite_longevity_score',
        'six_mwt_to_vo2max_conversion', 'cross_test_substitution',
      ]));
      expect(Object.entries(FUNCTIONAL_CAPACITY_REFERENCE_MATCHING_POLICY)
        .filter(([key]) => key.startsWith('permits')).every(([, value]) => value === false)).toBe(true);
      expect(FUNCTIONAL_CAPACITY_TREND_COMPARISON_POLICY).toMatchObject({
        calculatesChange: false, calculatesSlope: false, calculatesPercentageChange: false,
      });
    });

    test('has no import or product reference outside its isolated module and test', () => {
      const sourceRoot = join(process.cwd(), 'src');
      const moduleRoot = `${join(sourceRoot, 'domain', 'scientificDomains', 'functionalCapacity')}/`;
      const thisTest = join(sourceRoot, '__tests__', 'functionalCapacityScientificDomain.test.ts');
      const references = sourceFiles(sourceRoot)
        .filter(path => !`${path}/`.startsWith(moduleRoot) && path !== thisTest)
        .filter(path => /functionalCapacity|functional-capacity-domain|FUNCTIONAL_CAPACITY_/.test(readFileSync(path, 'utf8')));
      expect(references).toEqual([]);
    });
  });

  describe('common deterministic validation and auditability', () => {
    test('is deterministic, keeps stable reason ordering, and preserves the original audit input', () => {
      const input = fixture('hand_grip_strength', 'deterministic');
      input.timestamps.measuredAt = null;
      input.provenance.sourceRecordId = null;
      input.details.handGrip!.dynamometerIdentity = null;
      const first = evaluateFunctionalCapacityEligibility(input);
      const second = evaluateFunctionalCapacityEligibility(input);
      expect(first).toEqual(second);
      expect(first.reasonCodes).toEqual([...first.reasonCodes].sort((a, b) =>
        FUNCTIONAL_CAPACITY_REASON_ORDER.indexOf(a) - FUNCTIONAL_CAPACITY_REASON_ORDER.indexOf(b)));
      expect(first.audit.originalInput).toBe(input);
      expect(first.audit.registryVersions).toEqual(FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS);
    });

    test.each([
      ['missing test', (input: FunctionalCapacityMeasurementInput) => { input.testId = null; }, 'insufficient_data', 'missing_test_identity'],
      ['unsupported unit', (input: FunctionalCapacityMeasurementInput) => { input.unit = 'score'; }, 'invalid', 'unsupported_unit'],
      ['non-finite value', (input: FunctionalCapacityMeasurementInput) => { input.value = Number.NaN; }, 'invalid', 'non_finite_value'],
      ['negative value', (input: FunctionalCapacityMeasurementInput) => { input.value = -1; }, 'invalid', 'non_positive_value'],
      ['missing timestamp', (input: FunctionalCapacityMeasurementInput) => { input.timestamps.measuredAt = null; }, 'insufficient_data', 'missing_timestamp'],
      ['missing provenance', (input: FunctionalCapacityMeasurementInput) => { input.provenance.sourceRecordId = null; }, 'insufficient_data', 'missing_source_record_id'],
    ] as const)('%s fails closed', (_name, mutate, status, reason) => {
      const input = fixture('hand_grip_strength', String(_name));
      mutate(input);
      const result = evaluateFunctionalCapacityEligibility(input);
      expect(result.status).toBe(status);
      expect(result.reasonCodes).toContain(reason);
      expect(result.measurementAccepted).toBe(false);
    });

    test('preserves verified extremes, rejects impossible values, and applies append-only duplicate dispositions', () => {
      const extreme = fixture('hand_grip_strength', 'extreme');
      extreme.value = 1000;
      extreme.outlierStatus = 'verified_extreme';
      expect(evaluateFunctionalCapacityEligibility(extreme)).toMatchObject({
        status: 'conditionally_eligible', canonicalMeasurement: { canonicalValue: 1000 },
      });
      expect(evaluateFunctionalCapacityEligibility(extreme).reasonCodes).toContain('verified_extreme_preserved');

      const impossible = fixture('hand_grip_strength', 'impossible');
      impossible.value = Number.POSITIVE_INFINITY;
      expect(evaluateFunctionalCapacityEligibility(impossible).status).toBe('invalid');

      const duplicate = fixture('hand_grip_strength', 'duplicate');
      duplicate.duplicate.disposition = 'exact_reimport';
      expect(evaluateFunctionalCapacityEligibility(duplicate)).toMatchObject({ status: 'unsupported', measurementAccepted: false });
      expect(evaluateFunctionalCapacityEligibility(duplicate).audit.originalInput.duplicate.disposition).toBe('exact_reimport');
    });
  });

  describe('independent test identities and exact reference behavior', () => {
    test.each([
      ['hand_grip_strength', 'eligible'],
      ['usual_gait_speed', 'measurement_accepted_no_reference'],
      ['four_meter_walk', 'conditionally_eligible'],
      ['chair_stand_30_second', 'eligible'],
      ['five_times_sit_to_stand', 'measurement_accepted_no_reference'],
      ['timed_up_and_go', 'conditionally_eligible'],
      ['six_minute_walk_test', 'conditionally_eligible'],
      ['short_physical_performance_battery', 'measurement_accepted_no_reference'],
    ] as const)('evaluates %s independently as %s', (testId, expectedStatus) => {
      const result = evaluateFunctionalCapacityEligibility(fixture(testId));
      expect(result.status).toBe(expectedStatus);
      expect(result.testIdentity).toBe(testId);
      expect(result.blockedOutputs).toEqual(expect.arrayContaining(FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS));
    });

    test('authorizes only an exact source-verified published percentile and never calculates one', () => {
      const exact = evaluateFunctionalCapacityEligibility(fixture('hand_grip_strength', 'igrips'));
      expect(exact).toMatchObject({
        status: 'eligible', measurementConfidence: 'clinical_grade',
        referenceEligibility: { status: 'eligible', reference: { id: 'igrips_2025_adult_absolute' } },
        interpretation: { availability: 'published_percentile_authorized', publishedPercentile: 50 },
      });
      expect(exact.authorizedOutputs).toContain('published_percentile');

      const noSuppliedPercentile = fixture('hand_grip_strength', 'no-percentile');
      noSuppliedPercentile.publishedPercentile = null;
      const result = evaluateFunctionalCapacityEligibility(noSuppliedPercentile);
      expect(result.interpretation.availability).toBe('reference_eligible_percentile_not_supplied');
      expect(result.authorizedOutputs).not.toContain('published_percentile');
    });

    test('uses no country, age, sex, protocol, equipment, or course fallback', () => {
      const cases = [
        ['country', (input: FunctionalCapacityMeasurementInput) => { input.population.countryCode = 'TR'; }, 'country_not_supported_by_reference'],
        ['age', (input: FunctionalCapacityMeasurementInput) => { input.population.birthDate = '1930-01-01'; }, 'age_outside_reference_range'],
        ['sex', (input: FunctionalCapacityMeasurementInput) => { input.population.sourceRecordedSex = 'unknown'; }, 'missing_source_recorded_sex_for_reference'],
        ['course', (input: FunctionalCapacityMeasurementInput) => { input.details.gait!.courseLengthM = 5; }, 'four_meter_course_required'],
      ] as const;
      cases.forEach(([name, mutate, reason]) => {
        const input = fixture('four_meter_walk', `no-fallback-${name}`);
        mutate(input);
        const result = evaluateFunctionalCapacityEligibility(input);
        expect(result.referenceEligibility.status).toBe('ineligible');
        expect(result.authorizedOutputs).not.toContain('published_percentile');
        expect(result.reasonCodes).toContain(reason);
      });
    });

    test('keeps 5xSTS and SPPB intentionally without Vitalspan normative interpretation', () => {
      const five = evaluateFunctionalCapacityEligibility(fixture('five_times_sit_to_stand'));
      expect(five.reasonCodes).toContain('five_times_no_normative_reference');
      expect(five.referenceEligibility.reference).toBeNull();

      const sppb = evaluateFunctionalCapacityEligibility(fixture('short_physical_performance_battery'));
      expect(sppb.reasonCodes).toEqual(expect.arrayContaining([
        'sppb_total_not_vitalspan_generated', 'published_protocol_output_preserved',
        'sppb_no_normative_reference',
      ]));
      expect(sppb.authorizedOutputs).toContain('published_protocol_output');
      expect(sppb.authorizedOutputs).not.toContain('published_percentile');
      expect(sppb.canonicalMeasurement.rawComponents).not.toBeNull();
    });
  });

  describe('test-specific fail-closed validation', () => {
    test('keeps grip hands separate and blocks missing, mixed, uncalibrated, and unverified results', () => {
      const missingDevice = fixture('hand_grip_strength', 'missing-device');
      missingDevice.details.handGrip!.dynamometerIdentity = null;
      expect(evaluateFunctionalCapacityEligibility(missingDevice).reasonCodes).toContain('missing_dynamometer_identity');

      const mixed = fixture('hand_grip_strength', 'mixed');
      mixed.attempts = mixed.attempts.map((value, index) => index === 2 ? { ...value, hand: 'left' } : value);
      expect(evaluateFunctionalCapacityEligibility(mixed).reasonCodes).toContain('mixed_hands_not_allowed');

      const uncalibrated = fixture('hand_grip_strength', 'uncalibrated');
      uncalibrated.details.handGrip!.calibrationStatus = 'expired';
      expect(evaluateFunctionalCapacityEligibility(uncalibrated).status).toBe('protocol_mismatch');

      const user = fixture('hand_grip_strength', 'user');
      user.sourceId = 'user_entered_unverified';
      user.ingestionMethod = 'manual_user';
      expect(evaluateFunctionalCapacityEligibility(user).status).toBe('unsupported');
    });

    test('distinguishes usual gait, fast gait, start type, aids, course, and Four-Meter Walk identity', () => {
      const fast = fixture('usual_gait_speed', 'fast');
      fast.details.gait!.pace = 'fast';
      expect(evaluateFunctionalCapacityEligibility(fast).reasonCodes).toContain('fast_gait_not_usual');

      const moving = fixture('usual_gait_speed', 'moving');
      moving.details.gait!.startType = 'moving';
      expect(evaluateFunctionalCapacityEligibility(moving).reasonCodes).toContain('moving_start_not_static');

      const generic = fixture('four_meter_walk', 'generic');
      generic.protocolId = 'usual_gait_static_4m_nia_v1';
      generic.protocolVersion = 'nia-usual-gait-4m/1.0.0';
      generic.endpoint = 'faster_completed_trial';
      expect(evaluateFunctionalCapacityEligibility(generic).reasonCodes).toContain('protocol_test_mismatch');
    });

    test('does not convert or substitute chair tests and retains interrupted attempts', () => {
      const arms = fixture('chair_stand_30_second', 'arms');
      arms.details.chairStand30!.armUse = true;
      expect(evaluateFunctionalCapacityEligibility(arms).reasonCodes).toContain('arm_use_not_standard');

      const interrupted = fixture('chair_stand_30_second', 'interrupted');
      interrupted.completion.state = 'interrupted';
      interrupted.completion.interruptions = ['participant stopped at 20 seconds'];
      interrupted.completion.stoppingReason = 'fatigue';
      expect(evaluateFunctionalCapacityEligibility(interrupted).status).toBe('incomplete');

      const sppbEndpoint = fixture('five_times_sit_to_stand', 'sppb-endpoint');
      sppbEndpoint.details.fiveTimesSitToStand!.timingStopRule = 'full_standing_fifth_rise';
      expect(evaluateFunctionalCapacityEligibility(sppbEndpoint).reasonCodes).toContain('sppb_endpoint_not_standalone_five_times');
    });

    test('limits TUG to mobility and blocks universal fall-risk claims and mismatched reference context', () => {
      const tug = evaluateFunctionalCapacityEligibility(fixture('timed_up_and_go'));
      expect(tug.reasonCodes).toContain('tug_mobility_only');
      expect(tug.blockedOutputs).toContain('fall_risk_diagnosis');

      const missingAid = fixture('timed_up_and_go', 'missing-aid');
      missingAid.details.timedUpAndGo!.assistiveDevice = 'unknown';
      expect(evaluateFunctionalCapacityEligibility(missingAid).status).toBe('insufficient_data');

      const wrongCourse = fixture('timed_up_and_go', 'wrong-course');
      wrongCourse.details.timedUpAndGo!.courseDistanceM = 3.048;
      expect(evaluateFunctionalCapacityEligibility(wrongCourse).referenceEligibility.status).toBe('ineligible');
    });

    test('requires supervised safe 6MWT, retains oxygen context, and blocks VO2max conversion', () => {
      const valid = evaluateFunctionalCapacityEligibility(fixture('six_minute_walk_test'));
      expect(valid.reasonCodes).toContain('six_mwt_not_vo2max');
      expect(valid.blockedOutputs).toContain('six_mwt_to_vo2max_conversion');

      const home = fixture('six_minute_walk_test', 'home');
      home.sourceId = 'unsupervised_home_assessment';
      home.ingestionMethod = 'manual_user';
      home.supervision.supervisionClass = 'unsupervised';
      home.supervision.supervisorCredentials = null;
      home.supervision.participantContinuouslyObserved = false;
      expect(evaluateFunctionalCapacityEligibility(home).status).toBe('safety_requirements_not_met');

      const oxygen = fixture('six_minute_walk_test', 'oxygen');
      oxygen.details.sixMinuteWalk!.oxygenUse = 'supplemental_fixed';
      oxygen.details.sixMinuteWalk!.oxygenFlow = '2 L/min';
      expect(evaluateFunctionalCapacityEligibility(oxygen).audit.originalInput.details.sixMinuteWalk?.oxygenFlow).toBe('2 L/min');
    });

    test('requires official SPPB components and never substitutes standalone 5xSTS', () => {
      const nonofficial = fixture('short_physical_performance_battery', 'nonofficial');
      nonofficial.details.sppb!.officialProtocolAdministered = false;
      expect(evaluateFunctionalCapacityEligibility(nonofficial).status).toBe('protocol_mismatch');

      const substitute = fixture('short_physical_performance_battery', 'substitute');
      substitute.details.sppb!.rawComponents!.chair.stopRule = 'buttocks_contact_after_fifth_sit';
      expect(evaluateFunctionalCapacityEligibility(substitute).reasonCodes).toContain('standalone_five_times_not_sppb_component');
      expect(evaluateFunctionalCapacityEligibility(substitute).blockedOutputs).toContain('cross_test_substitution');
    });
  });

  describe('trend comparison eligibility without change calculation', () => {
    test('returns comparable only for matching comparison-critical metadata', () => {
      const first = fixture('hand_grip_strength', 'trend-1');
      const second = fixture('hand_grip_strength', 'trend-2');
      expect(evaluateFunctionalCapacityTrendCompatibility(first, second)).toMatchObject({
        status: 'comparable', reasonCodes: ['trend_exact_match'],
      });
    });

    test.each([
      ['grip hand', 'hand_grip_strength', (input: FunctionalCapacityMeasurementInput) => { input.details.handGrip!.handTested = 'left'; }, 'trend_hand_mismatch'],
      ['chair height', 'chair_stand_30_second', (input: FunctionalCapacityMeasurementInput) => { input.details.chairStand30!.chairHeightCm = 44; }, 'trend_chair_mismatch'],
      ['gait pace', 'usual_gait_speed', (input: FunctionalCapacityMeasurementInput) => { input.details.gait!.pace = 'fast'; }, 'trend_pace_mismatch'],
      ['assistive device', 'usual_gait_speed', (input: FunctionalCapacityMeasurementInput) => { input.details.gait!.assistiveDevice = 'cane'; }, 'trend_assistive_device_mismatch'],
    ] as const)('returns not comparable for different %s', (_name, testId, mutate, reason) => {
      const first = fixture(testId, `${_name}-1`);
      const second = fixture(testId, `${_name}-2`);
      mutate(second);
      const result = evaluateFunctionalCapacityTrendCompatibility(first, second);
      expect(result.status).toBe('not_comparable');
      expect(result.reasonCodes).toContain(reason);
    });

    test('returns insufficient data when comparison metadata is missing', () => {
      const first = fixture('timed_up_and_go', 'missing-1');
      const second = fixture('timed_up_and_go', 'missing-2');
      second.details.timedUpAndGo!.assistiveDevice = 'unknown';
      const result = evaluateFunctionalCapacityTrendCompatibility(first, second);
      expect(result.status).toBe('insufficient_data');
      expect(result.reasonCodes).toContain('trend_metadata_missing');
      expect(result.audit.missingDimensions).toContain('assistive_device');
    });
  });

  test('registry contains only explicit active references and preserves the inactive gait candidate', () => {
    const activeByTest = FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY.references
      .filter(reference => reference.active)
      .reduce<Record<string, number>>((counts, reference) => ({
        ...counts, [reference.testId]: (counts[reference.testId] ?? 0) + 1,
      }), {});
    expect(activeByTest).toMatchObject({
      hand_grip_strength: 1, four_meter_walk: 2, chair_stand_30_second: 1,
      timed_up_and_go: 2, six_minute_walk_test: 1,
    });
    expect(FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY.references.find(reference =>
      reference.id === 'elsa_gait_england_2026_candidate')?.active).toBe(false);
  });
});
