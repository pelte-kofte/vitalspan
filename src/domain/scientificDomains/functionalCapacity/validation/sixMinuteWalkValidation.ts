import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { addReason } from './commonValidation';

export function validateSixMinuteWalk(
  input: FunctionalCapacityMeasurementInput,
  reasons: FunctionalCapacityReason[],
): void {
  const details = input.details.sixMinuteWalk;
  if (details === null) {
    addReason(reasons, 'invalid_six_mwt_corridor');
    addReason(reasons, 'missing_six_mwt_safety_metadata');
    return;
  }
  if (input.protocolId === 'six_mwt_specialty_short_course_v1') addReason(reasons, 'specialty_protocol_only');
  if (input.protocolId === 'ers_ats_6mwt_2014' && (details.corridorLengthM === null || details.corridorLengthM < 30)) {
    addReason(reasons, 'invalid_six_mwt_corridor');
  }
  if (details.courseLayout !== 'straight' || details.surface !== 'hard_level_indoor') addReason(reasons, 'invalid_six_mwt_layout');
  if (details.testDurationMinutes !== 6) addReason(reasons, 'invalid_six_mwt_duration');
  if (details.standardizedEncouragement !== true) addReason(reasons, 'missing_standardized_encouragement');
  if (details.timerContinuedDuringRests !== true) addReason(reasons, 'six_mwt_timer_paused_during_rest');
  if (details.oxygenUse === 'unknown') addReason(reasons, 'missing_oxygen_status');
  if (details.oxygenUse === 'titrated_during_test') addReason(reasons, 'oxygen_titrated_during_test');
  if (details.assistiveDevice === 'unknown') addReason(reasons, 'missing_assistive_device_status');
  if (details.baselineSymptomsRecorded !== true || details.baselineVitalSignsRecorded !== true
    || details.stoppingCriteriaRecorded !== true
    || input.safety.baselineSafetyObservationsRecorded !== true
    || input.safety.endSafetyObservationsRecorded !== true) {
    addReason(reasons, 'missing_six_mwt_safety_metadata');
  }
  if (!['qualified_clinical', 'qualified_rehabilitation', 'trained_research'].includes(input.supervision.supervisionClass)
    || !input.supervision.supervisorCredentials?.trim()
    || input.supervision.participantContinuouslyObserved !== true) {
    addReason(reasons, 'six_mwt_supervision_required');
  }
  if (input.supervision.emergencyReadinessDocumented !== true) addReason(reasons, 'six_mwt_emergency_readiness_required');
  addReason(reasons, 'six_mwt_not_vo2max');
}
