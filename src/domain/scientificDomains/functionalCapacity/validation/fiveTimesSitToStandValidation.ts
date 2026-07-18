import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { addReason } from './commonValidation';

export function validateFiveTimesSitToStand(
  input: FunctionalCapacityMeasurementInput,
  reasons: FunctionalCapacityReason[],
): void {
  const details = input.details.fiveTimesSitToStand;
  if (details === null) {
    addReason(reasons, 'missing_chair_height');
    addReason(reasons, 'unknown_five_times_stop_rule');
    return;
  }
  if (details.chairHeightCm === null) addReason(reasons, 'missing_chair_height');
  else if (details.chairHeightCm < 43 || details.chairHeightCm > 45) addReason(reasons, 'nonstandard_chair_height');
  if (details.armUse !== false) addReason(reasons, 'arm_use_not_standard');
  if (details.completedRepetitions !== 5) addReason(reasons, 'invalid_five_times_repetition_count');
  if (details.timingStopRule === 'unknown') addReason(reasons, 'unknown_five_times_stop_rule');
  if (details.timingStopRule === 'full_standing_fifth_rise') addReason(reasons, 'sppb_endpoint_not_standalone_five_times');
  if (details.timingStopRule !== 'buttocks_contact_after_fifth_sit') addReason(reasons, 'sppb_endpoint_not_standalone_five_times');
}
