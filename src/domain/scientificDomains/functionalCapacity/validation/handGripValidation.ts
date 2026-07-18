import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { addReason } from './commonValidation';

export function validateHandGrip(
  input: FunctionalCapacityMeasurementInput,
  reasons: FunctionalCapacityReason[],
): void {
  const details = input.details.handGrip;
  if (details === null) {
    addReason(reasons, 'missing_hand');
    addReason(reasons, 'missing_dynamometer_identity');
    addReason(reasons, 'missing_device_type');
    addReason(reasons, 'missing_grip_position');
    addReason(reasons, 'missing_elbow_position');
    return;
  }
  if (details.handTested === 'unknown') addReason(reasons, 'missing_hand');
  if (!details.dynamometerIdentity?.trim()) addReason(reasons, 'missing_dynamometer_identity');
  if (details.deviceType === 'unknown') addReason(reasons, 'missing_device_type');
  if (details.calibrationStatus !== 'current') addReason(reasons, 'device_not_calibrated');
  if (details.participantPosition === 'unknown') addReason(reasons, 'missing_grip_position');
  if (details.elbowPosition === 'unknown') addReason(reasons, 'missing_elbow_position');
  if (details.selectionRule !== 'maximum_for_tested_hand') addReason(reasons, 'invalid_grip_selection_rule');
  if (details.painOrSafetyLimitation === true) addReason(reasons, 'grip_pain_limited');
  if (details.numberOfAttempts === null || details.numberOfAttempts < 1
    || input.attempts.length !== details.numberOfAttempts) addReason(reasons, 'invalid_grip_attempt_count');
  if (input.protocolId === 'southampton_grip_v1'
    && (details.numberOfAttempts !== 3 || details.participantPosition !== 'seated_supported')) {
    addReason(reasons, 'invalid_grip_attempt_count');
  }
  const hands = new Set(input.attempts.map(attempt => attempt.hand).filter(Boolean));
  if (hands.size > 1 || (details.handTested !== 'unknown' && [...hands].some(hand => hand !== details.handTested))) {
    addReason(reasons, 'mixed_hands_not_allowed');
  }
  if (!details.selectedAttemptId || !input.attempts.some(attempt => attempt.attemptId === details.selectedAttemptId)) {
    addReason(reasons, 'invalid_grip_selection_rule');
  }
}
