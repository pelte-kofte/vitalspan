import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { addReason } from './commonValidation';

export function validateUsualGaitSpeed(
  input: FunctionalCapacityMeasurementInput,
  reasons: FunctionalCapacityReason[],
): void {
  const gait = input.details.gait;
  if (gait === null) {
    addReason(reasons, 'missing_course_length');
    addReason(reasons, 'missing_timed_distance');
    addReason(reasons, 'unknown_gait_pace');
    addReason(reasons, 'missing_start_type');
    addReason(reasons, 'missing_assistive_device_status');
    addReason(reasons, 'missing_gait_environment');
    return;
  }
  if (gait.courseLengthM === null || gait.courseLengthM <= 0) addReason(reasons, 'missing_course_length');
  if (gait.timedDistanceM === null || gait.timedDistanceM <= 0) addReason(reasons, 'missing_timed_distance');
  if (gait.pace === 'unknown') addReason(reasons, 'unknown_gait_pace');
  if (gait.pace !== 'usual' && gait.pace !== 'unknown') addReason(reasons, 'fast_gait_not_usual');
  if (gait.startType === 'unknown') addReason(reasons, 'missing_start_type');
  if (input.protocolId === 'usual_gait_static_4m_nia_v1' && gait.startType === 'moving') addReason(reasons, 'moving_start_not_static');
  if (gait.assistiveDevice === 'unknown') addReason(reasons, 'missing_assistive_device_status');
  if (gait.environment === 'unknown') addReason(reasons, 'missing_gait_environment');
  if (gait.environment === 'treadmill') addReason(reasons, 'gait_course_not_overground');
  if (gait.humanAssistance === true) addReason(reasons, 'physical_assistance_invalidates_standard');
  if (gait.numberOfTrials === null || !gait.selectedAttemptId || gait.selectionRule === 'unknown') {
    addReason(reasons, 'invalid_gait_trial_rule');
  }
}
