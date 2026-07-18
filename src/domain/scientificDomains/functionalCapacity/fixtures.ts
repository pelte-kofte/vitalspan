import type {
  FunctionalCapacityMeasurementInput,
  FunctionalCapacityProtocolId,
  FunctionalCapacityReferenceId,
  FunctionalCapacityTestDetails,
  FunctionalCapacityTestId,
} from './contracts';
import { getFunctionalCapacityProtocolDefinition } from './protocolRegistry';

const EMPTY_DETAILS: FunctionalCapacityTestDetails = {
  handGrip: null,
  gait: null,
  chairStand30: null,
  fiveTimesSitToStand: null,
  timedUpAndGo: null,
  sixMinuteWalk: null,
  sppb: null,
};

function attempt(id: string, sequence: number, value: number, unit: string, hand: 'left' | 'right' | null = null) {
  return {
    attemptId: id,
    sequence,
    value,
    unit,
    hand,
    completed: true,
    invalidated: false,
    invalidationReason: null,
    restBeforeSeconds: sequence === 1 ? null : 60,
  } as const;
}

function common(
  testId: FunctionalCapacityTestId,
  protocolId: FunctionalCapacityProtocolId,
  recordId: string,
): FunctionalCapacityMeasurementInput {
  const protocol = getFunctionalCapacityProtocolDefinition(protocolId);
  if (protocol === null) throw new Error(`Fixture protocol is not registered: ${protocolId}.`);
  return {
    recordId,
    personId: 'fixture-person-1',
    testId,
    value: 1,
    unit: 's',
    attempts: [attempt(`${recordId}-attempt-1`, 1, 1, 's')],
    protocolId,
    protocolVersion: protocol.version,
    protocolAdherence: 'complete',
    endpoint: protocol.endpoint,
    sourceId: 'validated_clinical_assessment',
    provider: {
      organization: 'Fixture Clinical Laboratory', application: null,
      deviceManufacturer: null, deviceModel: null, deviceSerial: null,
      softwareVersion: null, firmwareVersion: null,
    },
    ingestionMethod: 'clinical_import',
    timestamps: {
      measuredAt: '2025-06-15T09:00:00+00:00', endedAt: '2025-06-15T09:10:00+00:00',
      precision: 'instant', localTime: '2025-06-15T09:00:00', utcOffset: '+00:00',
      timeZone: 'UTC', ingestedAt: '2025-06-15T10:00:00+00:00',
    },
    provenance: {
      sourceRecordId: `${recordId}-source`, sourceSessionId: `${recordId}-session`,
      originalRecordReference: `fixture://${recordId}`, payloadIntegrityReference: `sha256:${recordId}`,
      observerId: 'fixture-observer', assessorRole: 'physiotherapist', assessorTrainingDocumented: true,
      providerIdentityVerified: true, sourceDocumentVerified: true, protocolDocumented: true,
      equipmentQualityDocumented: true, transcriptionVerified: null,
    },
    population: {
      birthDate: '1960-01-01', sourceRecordedSex: 'female', countryCode: 'US', regionCode: null,
      healthPopulation: 'community_general', referenceCountrySupported: true,
    },
    completion: {
      state: 'completed', interruptions: [], assistance: 'none', stoppingReason: null,
      stoppingReasonRecorded: true,
    },
    safety: {
      screeningCompleted: true, contraindicationPresent: false, acuteSymptomsPresent: false,
      stoppingCriteriaReviewed: true, safetyEvents: [], adverseEvents: [], emergencyResponseUsed: false,
      baselineSafetyObservationsRecorded: true, endSafetyObservationsRecorded: true,
    },
    supervision: {
      supervisionClass: 'qualified_clinical', supervisorCredentials: 'licensed physiotherapist',
      settingClassification: 'outpatient clinic', emergencyReadinessDocumented: true,
      participantContinuouslyObserved: true,
    },
    duplicate: {
      disposition: 'not_duplicate', canonicalRecordId: recordId, sharedEventId: null,
      supersedesRecordId: null,
    },
    outlierStatus: 'not_flagged',
    details: { ...EMPTY_DETAILS },
    requestedReference: { id: null, version: null },
    publishedPercentile: null,
    publishedProtocolOutput: null,
  };
}

function requestReference(
  input: FunctionalCapacityMeasurementInput,
  id: FunctionalCapacityReferenceId,
  version: string,
): void {
  input.requestedReference = { id, version };
  input.publishedPercentile = {
    referenceId: id,
    referenceVersion: version,
    percentile: 50,
    sourceTableIdentifier: 'fixture-source-table',
    sourceValueMatchVerified: true,
  };
}

export function createValidFunctionalCapacityFixture(
  testId: FunctionalCapacityTestId,
  recordId = `fixture-${testId}`,
): FunctionalCapacityMeasurementInput {
  if (testId === 'hand_grip_strength') {
    const input = common(testId, 'southampton_grip_v1', recordId);
    input.value = 30;
    input.unit = 'kgf';
    input.attempts = [attempt('grip-1', 1, 28, 'kgf', 'right'), attempt('grip-2', 2, 30, 'kgf', 'right'), attempt('grip-3', 3, 29, 'kgf', 'right')];
    input.details.handGrip = {
      handTested: 'right', dominance: 'dominant', deviceType: 'hydraulic', dynamometerIdentity: 'Jamar-fixture-1',
      calibrationStatus: 'current', participantPosition: 'seated_supported', elbowPosition: 'approximately_90_degrees',
      wristPosition: 'neutral', handleSetting: '2', numberOfAttempts: 3, selectedAttemptId: 'grip-2',
      selectionRule: 'maximum_for_tested_hand', painOrSafetyLimitation: false,
    };
    requestReference(input, 'igrips_2025_adult_absolute', 'igrips-adult-absolute/2025.1');
    return input;
  }
  if (testId === 'usual_gait_speed') {
    const input = common(testId, 'usual_gait_static_4m_nia_v1', recordId);
    input.value = 1.1;
    input.unit = 'm/s';
    input.attempts = [attempt('gait-1', 1, 1, 'm/s'), attempt('gait-2', 2, 1.1, 'm/s')];
    input.details.gait = {
      courseLengthM: 4, timedDistanceM: 4, accelerationAllowanceM: 0, decelerationAllowanceM: 0,
      pace: 'usual', startType: 'static', assistiveDevice: 'none', humanAssistance: false,
      numberOfTrials: 2, selectedAttemptId: 'gait-2', selectionRule: 'faster_completed_trial',
      timingMethod: 'manual_stopwatch', environment: 'indoor_level', surface: 'hard level', footwear: 'usual shoes',
    };
    return input;
  }
  if (testId === 'four_meter_walk') {
    const input = common(testId, 'nih_toolbox_four_meter_walk_v1', recordId);
    input.value = 1.2;
    input.unit = 'm/s';
    input.attempts = [attempt('four-m-1', 1, 1.1, 'm/s'), attempt('four-m-2', 2, 1.2, 'm/s')];
    input.details.gait = {
      courseLengthM: 4, timedDistanceM: 4, accelerationAllowanceM: 0, decelerationAllowanceM: 0,
      pace: 'usual', startType: 'static', assistiveDevice: 'none', humanAssistance: false,
      numberOfTrials: 2, selectedAttemptId: 'four-m-2', selectionRule: 'faster_completed_trial',
      timingMethod: 'manual_stopwatch', environment: 'indoor_level', surface: 'hard level', footwear: 'usual shoes',
    };
    input.population.healthPopulation = 'community_general';
    requestReference(input, 'nih_toolbox_4m_us_2019', 'nih-toolbox-4m-us/2019.1');
    return input;
  }
  if (testId === 'chair_stand_30_second') {
    const input = common(testId, 'cdc_steadi_30cst_v1', recordId);
    input.value = 14;
    input.unit = 'completed_stands';
    input.attempts = [attempt('chair-1', 1, 14, 'completed_stands')];
    input.details.chairStand30 = {
      chairHeightCm: 43.2, chairHasArms: false, chairHasBack: true, armUse: false,
      testDurationSeconds: 30, completedRepetitions: 14, partialRepetitionHandling: 'cdc_expiration_rule',
      footwear: 'usual shoes',
    };
    requestReference(input, 'rikli_jones_30cst_us_1999', 'rikli-jones-30cst-us/1999.1');
    return input;
  }
  if (testId === 'five_times_sit_to_stand') {
    const input = common(testId, 'standalone_5xsts_fifth_sit_v1', recordId);
    input.value = 11.2;
    input.unit = 's';
    input.attempts = [attempt('five-1', 1, 11.2, 's')];
    input.details.fiveTimesSitToStand = {
      chairHeightCm: 43.2, chairHasBack: true, armUse: false, timingStartRule: 'start_command',
      timingStopRule: 'buttocks_contact_after_fifth_sit', completedRepetitions: 5, practiceCompleted: true,
    };
    return input;
  }
  if (testId === 'timed_up_and_go') {
    const input = common(testId, 'clsa_tug_2023', recordId);
    input.value = 8.5;
    input.unit = 's';
    input.attempts = [attempt('tug-1', 1, 8.5, 's')];
    input.details.timedUpAndGo = {
      courseDistanceM: 3, chairHeightCm: 45, chairHasArmrests: true, assistiveDevice: 'none',
      footwear: 'usual shoes', paceInstruction: 'not_specified_by_protocol', timingStartRule: 'start_command',
      timingStopRule: 'seated_again', practiceCompleted: true, taskType: 'single_task',
    };
    input.population.countryCode = 'CA';
    input.population.healthPopulation = 'healthy_independent';
    requestReference(input, 'clsa_tug_ca_2023', 'clsa-tug-ca/2023.1');
    return input;
  }
  if (testId === 'six_minute_walk_test') {
    const input = common(testId, 'ers_ats_6mwt_2014', recordId);
    input.value = 550;
    input.unit = 'm';
    input.attempts = [attempt('six-1', 1, 530, 'm'), attempt('six-2', 2, 550, 'm')];
    input.details.sixMinuteWalk = {
      corridorLengthM: 30, courseLayout: 'straight', surface: 'hard_level_indoor',
      standardizedEncouragement: true, testDurationMinutes: 6, laps: 18, totalDistanceM: 550,
      rests: [], timerContinuedDuringRests: true, oxygenUse: 'none', oxygenFlow: null,
      assistiveDevice: 'none', baselineSymptomsRecorded: true, baselineVitalSignsRecorded: true,
      stoppingCriteriaRecorded: true, numberOfTests: 2, selectedAttemptId: 'six-2',
      selectionRule: 'greater_qualifying_distance',
    };
    input.population.healthPopulation = 'apparently_healthy';
    requestReference(input, 'casanova_6mwt_multicentre_2011', 'casanova-6mwt/2011.1');
    return input;
  }
  const input = common(testId, 'nia_sppb_4m_v1', recordId);
  input.value = null;
  input.unit = null;
  input.attempts = [];
  input.details.sppb = {
    officialProtocolAdministered: true,
    assessorTrainedForFullBattery: true,
    rawComponents: {
      componentOrder: ['balance', 'gait', 'chair'],
      balance: { sideBySideSeconds: 10, semiTandemSeconds: 10, tandemSeconds: 10, stopReasonsRecorded: true },
      gait: {
        courseDistanceM: 4, startType: 'static', pace: 'usual', trialTimesSeconds: [4.1, 3.9],
        selectedTrialIndex: 1, assistiveDevice: 'none',
      },
      chair: {
        chairHeightCm: 43, singleRiseScreenCompleted: true, armUse: false,
        repeatedRiseTimeSeconds: 10.5, completedRepetitions: 5, stopRule: 'full_standing_fifth_rise',
      },
    },
  };
  input.publishedProtocolOutput = {
    protocolId: 'nia_sppb_4m_v1', protocolVersion: 'nia-sppb-4m/1.0.0',
    componentScores: { balance: 4, gait: 4, chair: 4 }, total: 12,
    sourceCalculated: true, calculationAttestedToOfficialProtocol: true,
    sourceDocumentReference: 'fixture://sppb-official-output',
  };
  return input;
}

/**
 * Required fixture inventory. Tests construct independent records from the
 * valid builders above; this registry prevents a requested scientific case
 * from disappearing silently during future policy revisions.
 */
export const FUNCTIONAL_CAPACITY_REQUIRED_FIXTURE_IDS = Object.freeze([
  'deterministic_repeated_evaluation', 'stable_reason_code_ordering', 'missing_test_identity',
  'unsupported_unit', 'non_finite_value', 'missing_timestamp', 'incomplete_provenance',
  'duplicate_measurement_handling', 'verified_extreme_preserved_and_flagged', 'impossible_value_rejected',
  'no_silent_reference_fallback', 'no_production_integration', 'clinical_phenoage_unchanged', 'vo2max_unchanged',
  'grip_igrips_exact_match', 'grip_no_igrips_match', 'grip_missing_dynamometer', 'grip_uncalibrated_device',
  'grip_hands_preserved_separately', 'grip_hand_comparison_blocked', 'grip_user_entry_unsupported',
  'gait_valid_usual', 'gait_fast_not_usual', 'gait_start_mismatch', 'gait_aid_mismatch',
  'gait_course_mismatch', 'gait_raw_no_reference', 'four_meter_valid', 'generic_gait_not_four_meter',
  'chair_30_valid', 'chair_30_arm_use', 'chair_30_height_comparison_blocked', 'chair_30_interrupted',
  'five_times_valid', 'five_times_no_normative', 'five_times_sppb_not_substituted', 'five_times_incomplete',
  'tug_valid', 'tug_conditional', 'tug_fall_risk_blocked', 'tug_course_reference_blocked',
  'tug_missing_aid_blocks_interpretation', 'six_mwt_valid_supervised', 'six_mwt_home_blocked',
  'six_mwt_corridor_mismatch', 'six_mwt_missing_stopping_metadata', 'six_mwt_oxygen_preserved',
  'six_mwt_vo2max_blocked', 'sppb_valid_official', 'sppb_raw_components_retained',
  'sppb_official_output_preserved', 'sppb_vitalspan_composite_blocked', 'sppb_five_times_not_substituted',
  'sppb_nonofficial_invalid', 'trend_same_protocol_comparable', 'trend_chair_height_not_comparable',
  'trend_grip_hand_not_comparable', 'trend_gait_pace_not_comparable', 'trend_aid_not_comparable',
  'trend_missing_metadata_insufficient',
] as const);
