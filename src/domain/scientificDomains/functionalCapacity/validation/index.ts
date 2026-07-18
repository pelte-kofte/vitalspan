import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { sortFunctionalCapacityReasons } from '../reasonRegistry';
import { validateChairStand30 } from './chairStand30Validation';
import { validateFunctionalCapacityCommon, type FunctionalCapacityCommonValidation } from './commonValidation';
import { validateFiveTimesSitToStand } from './fiveTimesSitToStandValidation';
import { validateFourMeterWalk } from './fourMeterWalkValidation';
import { validateUsualGaitSpeed } from './gaitSpeedValidation';
import { validateHandGrip } from './handGripValidation';
import { validateSixMinuteWalk } from './sixMinuteWalkValidation';
import { validateSppb } from './sppbValidation';
import { validateTimedUpAndGo } from './timedUpAndGoValidation';

export type FunctionalCapacityMeasurementValidation = FunctionalCapacityCommonValidation;

export function validateFunctionalCapacityMeasurement(
  input: FunctionalCapacityMeasurementInput,
): FunctionalCapacityMeasurementValidation {
  const common = validateFunctionalCapacityCommon(input);
  const reasons: FunctionalCapacityReason[] = [...common.reasons];
  if (input.testId === 'hand_grip_strength') validateHandGrip(input, reasons);
  if (input.testId === 'usual_gait_speed') validateUsualGaitSpeed(input, reasons);
  if (input.testId === 'four_meter_walk') validateFourMeterWalk(input, reasons);
  if (input.testId === 'chair_stand_30_second') validateChairStand30(input, reasons);
  if (input.testId === 'five_times_sit_to_stand') validateFiveTimesSitToStand(input, reasons);
  if (input.testId === 'timed_up_and_go') validateTimedUpAndGo(input, reasons);
  if (input.testId === 'six_minute_walk_test') validateSixMinuteWalk(input, reasons);
  if (input.testId === 'short_physical_performance_battery') validateSppb(input, reasons);
  const sorted = sortFunctionalCapacityReasons(reasons);
  const provenanceComplete = !sorted.some(reason => [
    'blocking_invalid', 'blocking_insufficient', 'blocking_unsupported',
    'blocking_protocol', 'blocking_incomplete', 'blocking_safety',
  ].includes(reason.severity));
  return { ...common, provenanceComplete, reasons: sorted };
}
