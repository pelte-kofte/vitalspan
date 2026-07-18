import type { CardiometabolicMeasurementInput, CardiometabolicReason } from '../contracts';
import type { CardiometabolicMeasurementDefinition } from '../measurementRegistry';
import { getCardiometabolicAssay } from '../assayRegistry';
import { getCardiometabolicProtocol } from '../protocolRegistry';
import { reasonForCardiometabolic } from '../reasonRegistry';

export function validateCardiometabolicGlycemic(input: CardiometabolicMeasurementInput, definition: CardiometabolicMeasurementDefinition): CardiometabolicReason[] {
  const reasons: CardiometabolicReason[] = [];
  const assay = getCardiometabolicAssay(input.assay.methodId);
  if (!input.assay.methodId) reasons.push(reasonForCardiometabolic('missing_assay_identity'));
  else if (!assay) reasons.push(reasonForCardiometabolic('unknown_assay_identity'));
  else if (!assay.measurements.includes(definition.id)) reasons.push(reasonForCardiometabolic('assay_measurement_mismatch'));
  else if (input.assay.methodVersion !== assay.version) reasons.push(reasonForCardiometabolic('assay_mismatch'));
  if (assay?.traceabilityRequired && input.assay.traceabilityDocumented !== true) reasons.push(reasonForCardiometabolic('assay_traceability_missing'));
  if (!input.provider.laboratoryId) reasons.push(reasonForCardiometabolic('provenance_incomplete'));
  if (input.context.pregnancy === null || input.context.pregnancy === 'unknown') reasons.push(reasonForCardiometabolic('missing_pregnancy_context'));
  if (input.context.pregnancy === 'present') reasons.push(reasonForCardiometabolic('pregnancy_exclusion'));
  if (input.context.medicationContextKnown === null) reasons.push(reasonForCardiometabolic('missing_medication_context'));
  if (input.context.acuteIllness === null || input.context.acuteIllness === 'unknown') reasons.push(reasonForCardiometabolic('missing_acute_illness_context'));
  if (input.context.diabetesHistoryKnown === null || input.context.ckd === null || input.context.ckd === 'unknown') reasons.push(reasonForCardiometabolic('missing_clinical_history'));

  if (definition.id === 'hba1c') {
    if (input.numeric?.unit === '%' && input.assay.ngspCertified !== true) reasons.push(reasonForCardiometabolic('assay_certification_missing'));
    const confounders = [input.context.anemia, input.context.hemoglobinopathy, input.context.alteredRedCellTurnover, input.context.recentTransfusion];
    if (confounders.some(value => value === null || value === 'unknown')) reasons.push(reasonForCardiometabolic('missing_clinical_history'));
    if (confounders.some(value => value === 'present')) reasons.push(reasonForCardiometabolic('hba1c_confounding_context'));
  }
  if (definition.id === 'fasting_plasma_glucose') {
    const protocol = getCardiometabolicProtocol(input.protocol.protocolId);
    if (!input.protocol.protocolId) reasons.push(reasonForCardiometabolic('missing_protocol_identity'));
    else if (!protocol) reasons.push(reasonForCardiometabolic('unknown_protocol_identity'));
    else if (!protocol.measurements.includes(definition.id)) reasons.push(reasonForCardiometabolic('protocol_measurement_mismatch'));
    else if (input.protocol.protocolVersion !== protocol.version) reasons.push(reasonForCardiometabolic('protocol_mismatch'));
    if (input.assay.specimen !== 'venous_plasma') reasons.push(reasonForCardiometabolic(input.assay.specimen === 'random_plasma' ? 'random_glucose_not_fpg' : 'venous_plasma_required'));
    if (input.context.fastingStatus === null || input.context.fastingStatus === 'unknown') reasons.push(reasonForCardiometabolic('unknown_fasting_status'));
    else if (input.context.fastingStatus !== 'fasting') reasons.push(reasonForCardiometabolic('random_glucose_not_fpg'));
    if (input.context.fastingHours === null) reasons.push(reasonForCardiometabolic('missing_fasting_status'));
    else if (input.context.fastingHours < 8) reasons.push(reasonForCardiometabolic('fasting_duration_insufficient'));
    if (input.protocol.adherence !== 'complete') reasons.push(reasonForCardiometabolic('glycolysis_control_missing'));
  }
  return reasons;
}
