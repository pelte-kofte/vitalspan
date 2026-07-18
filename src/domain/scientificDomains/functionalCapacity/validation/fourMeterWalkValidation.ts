import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { addReason } from './commonValidation';
import { validateUsualGaitSpeed } from './gaitSpeedValidation';

export function validateFourMeterWalk(
  input: FunctionalCapacityMeasurementInput,
  reasons: FunctionalCapacityReason[],
): void {
  validateUsualGaitSpeed(input, reasons);
  const gait = input.details.gait;
  if (gait === null) return;
  if (gait.courseLengthM !== 4 || gait.timedDistanceM !== 4) addReason(reasons, 'four_meter_course_required');
  if (gait.startType === 'moving') addReason(reasons, 'moving_start_not_static');
  if (input.protocolId === 'usual_gait_static_4m_nia_v1'
    || input.protocolId === 'usual_gait_named_variant_v1') addReason(reasons, 'generic_gait_not_four_meter_walk');
  if ((input.protocolId === 'nia_four_meter_walk_v1' || input.protocolId === 'nih_toolbox_four_meter_walk_v1')
    && (gait.numberOfTrials !== 2 || gait.selectionRule !== 'faster_completed_trial')) {
    addReason(reasons, 'invalid_gait_trial_rule');
  }
  if (input.protocolId === 'clsa_four_meter_walk_2023'
    && (gait.numberOfTrials !== 1 || gait.selectionRule !== 'single_trial')) {
    addReason(reasons, 'invalid_gait_trial_rule');
  }
}
