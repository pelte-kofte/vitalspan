import type { FunctionalCapacityMeasurementInput, FunctionalCapacityReason } from '../contracts';
import { addReason } from './commonValidation';

function validHold(value: number | null): boolean {
  return value !== null && Number.isFinite(value) && value >= 0 && value <= 10;
}

export function validateSppb(
  input: FunctionalCapacityMeasurementInput,
  reasons: FunctionalCapacityReason[],
): void {
  const details = input.details.sppb;
  if (details === null || details.officialProtocolAdministered !== true) {
    addReason(reasons, 'sppb_official_protocol_required');
    return;
  }
  if (details.assessorTrainedForFullBattery !== true) addReason(reasons, 'missing_assessor_training');
  if (!['qualified_clinical', 'qualified_rehabilitation', 'trained_research', 'live_professional_home']
    .includes(input.supervision.supervisionClass)) addReason(reasons, 'sppb_live_supervision_required');
  const raw = details.rawComponents;
  if (raw === null) {
    addReason(reasons, 'sppb_raw_components_incomplete');
    return;
  }
  if (raw.componentOrder.join('|') !== 'balance|gait|chair') addReason(reasons, 'sppb_component_order_invalid');
  if (!validHold(raw.balance.sideBySideSeconds) || !validHold(raw.balance.semiTandemSeconds)
    || !validHold(raw.balance.tandemSeconds) || !raw.balance.stopReasonsRecorded) {
    addReason(reasons, 'sppb_raw_components_incomplete');
  }
  const expectedDistance = input.protocolId === 'nia_sppb_3m_v1' ? 3 : 4;
  if (raw.gait.courseDistanceM !== expectedDistance || raw.gait.startType !== 'static'
    || raw.gait.pace !== 'usual' || raw.gait.trialTimesSeconds.length !== 2
    || raw.gait.selectedTrialIndex === null) addReason(reasons, 'sppb_gait_protocol_invalid');
  if (raw.chair.singleRiseScreenCompleted !== true || raw.chair.armUse !== false
    || raw.chair.completedRepetitions !== 5 || raw.chair.repeatedRiseTimeSeconds === null) {
    addReason(reasons, 'sppb_raw_components_incomplete');
  }
  if (raw.chair.stopRule === 'buttocks_contact_after_fifth_sit') addReason(reasons, 'standalone_five_times_not_sppb_component');
  if (raw.chair.stopRule !== 'full_standing_fifth_rise') addReason(reasons, 'sppb_chair_endpoint_invalid');
  if (input.publishedProtocolOutput !== null) {
    const output = input.publishedProtocolOutput;
    if (output.protocolId === input.protocolId && output.protocolVersion === input.protocolVersion
      && output.sourceCalculated && output.calculationAttestedToOfficialProtocol
      && output.sourceDocumentReference?.trim()) addReason(reasons, 'published_protocol_output_preserved');
    else addReason(reasons, 'sppb_total_not_vitalspan_generated');
  }
  addReason(reasons, 'sppb_total_not_vitalspan_generated');
}
