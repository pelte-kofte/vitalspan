import type { CardiometabolicMeasurementInput, CardiometabolicReason } from '../contracts';
import type { CardiometabolicMeasurementDefinition } from '../measurementRegistry';
import { getCardiometabolicAssay } from '../assayRegistry';
import { reasonForCardiometabolic } from '../reasonRegistry';

export function validateCardiometabolicLipid(input: CardiometabolicMeasurementInput, definition: CardiometabolicMeasurementDefinition): CardiometabolicReason[] {
  const reasons: CardiometabolicReason[] = [];
  const assay = getCardiometabolicAssay(input.assay.methodId);
  if (!input.assay.methodId) reasons.push(reasonForCardiometabolic('missing_assay_identity'));
  else if (!assay) reasons.push(reasonForCardiometabolic('unknown_assay_identity'));
  else if (!assay.measurements.includes(definition.id)) reasons.push(reasonForCardiometabolic('assay_measurement_mismatch'));
  else if (input.assay.methodVersion !== assay.version) reasons.push(reasonForCardiometabolic('assay_mismatch'));
  if (assay?.traceabilityRequired && input.assay.traceabilityDocumented !== true) reasons.push(reasonForCardiometabolic('assay_traceability_missing'));
  if (!input.provider.laboratoryId) reasons.push(reasonForCardiometabolic('provenance_incomplete'));
  if (input.context.medicationContextKnown === null) reasons.push(reasonForCardiometabolic('missing_medication_context'));
  if (input.context.acuteIllness === null || input.context.acuteIllness === 'unknown') reasons.push(reasonForCardiometabolic('missing_acute_illness_context'));
  if (input.context.pregnancy === null || input.context.pregnancy === 'unknown') reasons.push(reasonForCardiometabolic('missing_pregnancy_context'));
  if (input.context.pregnancy === 'present') reasons.push(reasonForCardiometabolic('pregnancy_exclusion'));
  if (definition.interpretationMode === 'conditional_exact_match' && input.context.cardiovascularDiseaseHistoryKnown === null) reasons.push(reasonForCardiometabolic('missing_clinical_history'));

  if (definition.id === 'ldl_c_calculated') {
    const required = input.lineage.sourceAnalytes;
    if (!required?.total_cholesterol || !required.hdl_c || !required.triglycerides) reasons.push(reasonForCardiometabolic('ldl_source_analytes_missing'));
    if (!input.lineage.calculationMethodId || !input.lineage.calculationVersion || input.lineage.lineageVerified !== true) reasons.push(reasonForCardiometabolic('derived_lineage_incomplete'));
    if (input.lineage.calculationMethodId !== input.assay.methodId || input.lineage.calculationVersion !== input.assay.methodVersion || input.assay.calculationValid !== true) reasons.push(reasonForCardiometabolic('invalid_ldl_calculation_context'));
  }
  if (definition.id === 'non_hdl_c') {
    if (!input.lineage.sourceAnalytes?.total_cholesterol || !input.lineage.sourceAnalytes.hdl_c || input.lineage.lineageVerified !== true) reasons.push(reasonForCardiometabolic('derived_lineage_incomplete'));
  }
  if (definition.id === 'triglycerides' && (input.context.fastingStatus === null || input.context.fastingStatus === 'unknown')) reasons.push(reasonForCardiometabolic('unknown_fasting_status'));
  return reasons;
}
