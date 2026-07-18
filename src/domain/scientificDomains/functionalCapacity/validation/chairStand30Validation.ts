import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { addReason } from './commonValidation';

export function validateChairStand30(
  input: FunctionalCapacityMeasurementInput,
  reasons: FunctionalCapacityReason[],
): void {
  const details = input.details.chairStand30;
  if (details === null) {
    addReason(reasons, 'missing_chair_height');
    return;
  }
  if (details.chairHeightCm === null) addReason(reasons, 'missing_chair_height');
  else if (details.chairHeightCm < 43 || details.chairHeightCm > 45) addReason(reasons, 'nonstandard_chair_height');
  if (details.chairHasArms !== false || details.armUse === true) addReason(reasons, 'arm_use_not_standard');
  if (details.testDurationSeconds !== 30) addReason(reasons, 'invalid_30_second_duration');
  if (details.partialRepetitionHandling !== 'cdc_expiration_rule') addReason(reasons, 'invalid_partial_repetition_rule');
  if (details.completedRepetitions === null || !Number.isInteger(details.completedRepetitions)
    || details.completedRepetitions < 0 || input.value !== details.completedRepetitions) {
    addReason(reasons, 'non_integer_repetition_count');
  }
}
