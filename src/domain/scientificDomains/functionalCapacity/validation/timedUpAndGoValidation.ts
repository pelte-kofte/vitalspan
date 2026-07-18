import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { addReason } from './commonValidation';

export function validateTimedUpAndGo(
  input: FunctionalCapacityMeasurementInput,
  reasons: FunctionalCapacityReason[],
): void {
  const details = input.details.timedUpAndGo;
  if (details === null) {
    addReason(reasons, 'invalid_tug_course');
    addReason(reasons, 'missing_chair_specifications');
    addReason(reasons, 'missing_assistive_device_status');
    return;
  }
  const expectedCourse = input.protocolId === 'cdc_steadi_tug_10ft_v1' ? 3.048 : 3;
  if (details.courseDistanceM !== expectedCourse) addReason(reasons, 'invalid_tug_course');
  if (details.chairHeightCm === null || details.chairHasArmrests === null) addReason(reasons, 'missing_chair_specifications');
  if (details.assistiveDevice === 'unknown') addReason(reasons, 'missing_assistive_device_status');
  if (details.taskType !== 'single_task') addReason(reasons, 'invalid_tug_task');
  if (input.protocolId === 'clsa_tug_2023') {
    if (details.paceInstruction !== 'not_specified_by_protocol') addReason(reasons, 'invalid_tug_pace');
  } else if (details.paceInstruction !== 'usual') addReason(reasons, 'invalid_tug_pace');
  if (details.timingStopRule !== 'seated_again') addReason(reasons, 'invalid_tug_stop_rule');
  if (input.completion.assistance === 'physical_assistance') addReason(reasons, 'physical_assistance_invalidates_standard');
  addReason(reasons, 'tug_mobility_only');
}
