import type {
  FunctionalCapacityMeasurementInput,
  FunctionalCapacityReasonCode,
  FunctionalCapacityTrendResult,
} from './contracts';
import { evaluateFunctionalCapacityEligibility } from './eligibility';
import { reasonForFunctionalCapacity, sortFunctionalCapacityReasons } from './reasonRegistry';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export const FUNCTIONAL_CAPACITY_TREND_COMPARISON_POLICY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.trendComparisonPolicy,
  calculatesChange: false,
  calculatesSlope: false,
  calculatesPercentageChange: false,
  requiresSameTest: true,
  requiresSameProtocol: true,
  requiresSameEndpoint: true,
  requiresSameCanonicalUnit: true,
  failClosedForMissingComparisonMetadata: true,
});

interface ComparisonState {
  matched: string[];
  mismatched: string[];
  missing: string[];
  codes: FunctionalCapacityReasonCode[];
}

function compareRequired(
  state: ComparisonState,
  dimension: string,
  first: unknown,
  second: unknown,
  mismatchCode: FunctionalCapacityReasonCode,
): void {
  const absent = (value: unknown): boolean => value === null || value === undefined || value === 'unknown' || value === '';
  if (absent(first) || absent(second)) {
    state.missing.push(dimension);
    state.codes.push('trend_metadata_missing');
  } else if (first !== second) {
    state.mismatched.push(dimension);
    state.codes.push(mismatchCode);
  } else {
    state.matched.push(dimension);
  }
}

function compareTestSpecific(
  first: FunctionalCapacityMeasurementInput,
  second: FunctionalCapacityMeasurementInput,
  state: ComparisonState,
): void {
  switch (first.testId) {
    case 'hand_grip_strength':
      compareRequired(state, 'tested_hand', first.details.handGrip?.handTested, second.details.handGrip?.handTested, 'trend_hand_mismatch');
      compareRequired(state, 'dynamometer_class', first.details.handGrip?.deviceType, second.details.handGrip?.deviceType, 'trend_equipment_mismatch');
      break;
    case 'usual_gait_speed':
    case 'four_meter_walk':
      compareRequired(state, 'gait_pace', first.details.gait?.pace, second.details.gait?.pace, 'trend_pace_mismatch');
      compareRequired(state, 'course_length', first.details.gait?.courseLengthM, second.details.gait?.courseLengthM, 'trend_course_mismatch');
      compareRequired(state, 'timed_distance', first.details.gait?.timedDistanceM, second.details.gait?.timedDistanceM, 'trend_course_mismatch');
      compareRequired(state, 'start_type', first.details.gait?.startType, second.details.gait?.startType, 'trend_protocol_mismatch');
      compareRequired(state, 'assistive_device', first.details.gait?.assistiveDevice, second.details.gait?.assistiveDevice, 'trend_assistive_device_mismatch');
      break;
    case 'chair_stand_30_second':
      compareRequired(state, 'chair_height', first.details.chairStand30?.chairHeightCm, second.details.chairStand30?.chairHeightCm, 'trend_chair_mismatch');
      compareRequired(state, 'arm_use_rule', first.details.chairStand30?.armUse, second.details.chairStand30?.armUse, 'trend_arm_rule_mismatch');
      break;
    case 'five_times_sit_to_stand':
      compareRequired(state, 'chair_height', first.details.fiveTimesSitToStand?.chairHeightCm, second.details.fiveTimesSitToStand?.chairHeightCm, 'trend_chair_mismatch');
      compareRequired(state, 'arm_use_rule', first.details.fiveTimesSitToStand?.armUse, second.details.fiveTimesSitToStand?.armUse, 'trend_arm_rule_mismatch');
      compareRequired(state, 'timing_stop_rule', first.details.fiveTimesSitToStand?.timingStopRule, second.details.fiveTimesSitToStand?.timingStopRule, 'trend_endpoint_mismatch');
      break;
    case 'timed_up_and_go':
      compareRequired(state, 'course_distance', first.details.timedUpAndGo?.courseDistanceM, second.details.timedUpAndGo?.courseDistanceM, 'trend_course_mismatch');
      compareRequired(state, 'chair_height', first.details.timedUpAndGo?.chairHeightCm, second.details.timedUpAndGo?.chairHeightCm, 'trend_chair_mismatch');
      compareRequired(state, 'assistive_device', first.details.timedUpAndGo?.assistiveDevice, second.details.timedUpAndGo?.assistiveDevice, 'trend_assistive_device_mismatch');
      break;
    case 'six_minute_walk_test':
      compareRequired(state, 'corridor_length', first.details.sixMinuteWalk?.corridorLengthM, second.details.sixMinuteWalk?.corridorLengthM, 'trend_course_mismatch');
      compareRequired(state, 'course_layout', first.details.sixMinuteWalk?.courseLayout, second.details.sixMinuteWalk?.courseLayout, 'trend_course_mismatch');
      compareRequired(state, 'oxygen_status', first.details.sixMinuteWalk?.oxygenUse, second.details.sixMinuteWalk?.oxygenUse, 'trend_protocol_mismatch');
      compareRequired(state, 'assistive_device', first.details.sixMinuteWalk?.assistiveDevice, second.details.sixMinuteWalk?.assistiveDevice, 'trend_assistive_device_mismatch');
      compareRequired(state, 'supervision_class', first.supervision.supervisionClass, second.supervision.supervisionClass, 'trend_supervision_mismatch');
      break;
    case 'short_physical_performance_battery':
      compareRequired(state, 'sppb_gait_course', first.details.sppb?.rawComponents?.gait.courseDistanceM, second.details.sppb?.rawComponents?.gait.courseDistanceM, 'trend_course_mismatch');
      compareRequired(state, 'sppb_chair_height', first.details.sppb?.rawComponents?.chair.chairHeightCm, second.details.sppb?.rawComponents?.chair.chairHeightCm, 'trend_chair_mismatch');
      compareRequired(state, 'sppb_assistive_device', first.details.sppb?.rawComponents?.gait.assistiveDevice, second.details.sppb?.rawComponents?.gait.assistiveDevice, 'trend_assistive_device_mismatch');
      compareRequired(state, 'supervision_class', first.supervision.supervisionClass, second.supervision.supervisionClass, 'trend_supervision_mismatch');
      break;
    default:
      state.missing.push('test_specific_metadata');
      state.codes.push('trend_metadata_missing');
  }
}

export function evaluateFunctionalCapacityTrendCompatibility(
  first: FunctionalCapacityMeasurementInput,
  second: FunctionalCapacityMeasurementInput,
): FunctionalCapacityTrendResult {
  const firstEvaluation = evaluateFunctionalCapacityEligibility(first);
  const secondEvaluation = evaluateFunctionalCapacityEligibility(second);
  const state: ComparisonState = { matched: [], mismatched: [], missing: [], codes: [] };

  if (first.recordId === second.recordId) state.codes.push('trend_same_record');
  compareRequired(state, 'test', first.testId, second.testId, 'trend_test_mismatch');
  compareRequired(state, 'protocol', first.protocolId, second.protocolId, 'trend_protocol_mismatch');
  compareRequired(state, 'protocol_version', first.protocolVersion, second.protocolVersion, 'trend_protocol_mismatch');
  compareRequired(state, 'endpoint', first.endpoint, second.endpoint, 'trend_endpoint_mismatch');
  compareRequired(
    state,
    'canonical_unit',
    firstEvaluation.canonicalMeasurement.canonicalUnit,
    secondEvaluation.canonicalMeasurement.canonicalUnit,
    'trend_unit_mismatch',
  );
  compareRequired(state, 'completion', first.completion.state, second.completion.state, 'trend_completion_mismatch');
  if (first.testId !== null && first.testId === second.testId) compareTestSpecific(first, second, state);

  const accepted = firstEvaluation.measurementAccepted && secondEvaluation.measurementAccepted;
  let status: FunctionalCapacityTrendResult['status'];
  if (state.missing.length > 0) {
    status = 'insufficient_data';
  } else if (state.mismatched.length > 0 || state.codes.includes('trend_same_record')) {
    status = 'not_comparable';
  } else if (!accepted) {
    status = 'insufficient_data';
    state.codes.push('trend_metadata_missing');
  } else {
    const conditional = firstEvaluation.status === 'conditionally_eligible'
      || secondEvaluation.status === 'conditionally_eligible'
      || first.protocolAdherence === 'permitted_variant'
      || second.protocolAdherence === 'permitted_variant';
    status = conditional ? 'conditionally_comparable' : 'comparable';
    state.codes.push(conditional ? 'trend_conditional_match' : 'trend_exact_match');
  }

  const reasons = sortFunctionalCapacityReasons(state.codes.map(code => reasonForFunctionalCapacity(code)));
  return {
    status,
    reasonCodes: reasons.map(reason => reason.code),
    explanations: reasons.map(reason => reason.explanation),
    comparedRecordIds: [first.recordId, second.recordId],
    versions: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS,
    audit: {
      firstEvaluationKey: firstEvaluation.audit.evaluationKey,
      secondEvaluationKey: secondEvaluation.audit.evaluationKey,
      matchedDimensions: state.matched,
      mismatchedDimensions: state.mismatched,
      missingDimensions: state.missing,
    },
  };
}
