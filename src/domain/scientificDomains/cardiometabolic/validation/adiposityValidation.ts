import type { CardiometabolicMeasurementInput, CardiometabolicReason } from '../contracts';
import type { CardiometabolicMeasurementDefinition } from '../measurementRegistry';
import { getCardiometabolicProtocol } from '../protocolRegistry';
import { reasonForCardiometabolic } from '../reasonRegistry';

function timestampsCompatible(first: string | null, second: string | null): boolean {
  if (!first || !second) return false;
  return Math.abs(Date.parse(first) - Date.parse(second)) <= 31 * 24 * 60 * 60 * 1000;
}

export function validateCardiometabolicAdiposity(input: CardiometabolicMeasurementInput, definition: CardiometabolicMeasurementDefinition): CardiometabolicReason[] {
  const reasons: CardiometabolicReason[] = [];
  const protocol = getCardiometabolicProtocol(input.protocol.protocolId);
  if (!input.protocol.protocolId) reasons.push(reasonForCardiometabolic('missing_protocol_identity'));
  else if (!protocol) reasons.push(reasonForCardiometabolic('unknown_protocol_identity'));
  else if (!protocol.measurements.includes(definition.id)) reasons.push(reasonForCardiometabolic('protocol_measurement_mismatch'));
  else if (input.protocol.protocolVersion !== protocol.version) reasons.push(reasonForCardiometabolic('protocol_mismatch'));
  if (input.protocol.adherence === null || input.protocol.adherence === 'unknown') reasons.push(reasonForCardiometabolic('protocol_adherence_unknown'));
  else if (input.protocol.adherence !== 'complete') reasons.push(reasonForCardiometabolic('protocol_mismatch'));
  if (input.context.pregnancy === null || input.context.pregnancy === 'unknown') reasons.push(reasonForCardiometabolic('missing_pregnancy_context'));
  if (input.context.pregnancy === 'present') reasons.push(reasonForCardiometabolic('pregnancy_exclusion'));

  if (definition.id === 'waist_circumference') {
    if (input.protocol.waistLandmark !== 'who_midpoint_last_rib_iliac_crest') reasons.push(reasonForCardiometabolic('waist_landmark_mismatch'));
  } else {
    if (input.lineage.lineageVerified !== true || !input.lineage.waistRecordId || !input.lineage.sourceAnalytes?.waist_circumference || input.lineage.measuredHeightCm === null) reasons.push(reasonForCardiometabolic('waist_lineage_incomplete'));
    if (input.protocol.waistLandmark !== 'who_midpoint_last_rib_iliac_crest') reasons.push(reasonForCardiometabolic('waist_landmark_mismatch'));
    if (input.lineage.heightSource === 'self_reported') reasons.push(reasonForCardiometabolic('self_reported_height_unsupported'));
    if (input.lineage.heightSource !== 'measured') reasons.push(reasonForCardiometabolic('waist_lineage_incomplete'));
    if (!timestampsCompatible(input.timestamps.measuredAt, input.lineage.heightTimestamp)) reasons.push(reasonForCardiometabolic('height_timestamp_incompatible'));
    if (input.population.adultEligible !== true) reasons.push(reasonForCardiometabolic('adult_population_required'));
    if (input.population.nicePopulationEligible !== true || input.population.guidelineRegion !== 'UK') reasons.push(reasonForCardiometabolic('nice_population_mismatch'));
  }
  return reasons;
}
