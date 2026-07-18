import type { CardiometabolicMeasurementInput, CardiometabolicReason } from '../contracts';
import type { CardiometabolicMeasurementDefinition } from '../measurementRegistry';
import { getCardiometabolicProtocol } from '../protocolRegistry';
import { reasonForCardiometabolic } from '../reasonRegistry';

export function validateCardiometabolicBloodPressure(input: CardiometabolicMeasurementInput, definition: CardiometabolicMeasurementDefinition): CardiometabolicReason[] {
  const reasons: CardiometabolicReason[] = [];
  const protocol = getCardiometabolicProtocol(input.protocol.protocolId);
  if (!input.protocol.protocolId) reasons.push(reasonForCardiometabolic('missing_protocol_identity'));
  else if (!protocol) reasons.push(reasonForCardiometabolic('unknown_protocol_identity'));
  else if (!protocol.measurements.includes(definition.id)) reasons.push(reasonForCardiometabolic('protocol_measurement_mismatch'));
  else if (input.protocol.protocolVersion !== protocol.version) reasons.push(reasonForCardiometabolic('protocol_mismatch'));
  if (input.protocol.adherence === null || input.protocol.adherence === 'unknown') reasons.push(reasonForCardiometabolic('protocol_adherence_unknown'));
  else if (input.protocol.adherence !== 'complete') reasons.push(reasonForCardiometabolic('protocol_mismatch'));
  if (input.sourceId === 'CMH-SRC-CUFFLESS') reasons.push(reasonForCardiometabolic('cuffless_bp_unsupported'));
  if (input.protocol.validatedDevice !== true) reasons.push(reasonForCardiometabolic('bp_device_unvalidated'));
  if (input.protocol.upperArmCuff !== true) reasons.push(reasonForCardiometabolic('upper_arm_cuff_required'));
  if (!input.protocol.cuffSize) reasons.push(reasonForCardiometabolic('cuff_size_missing'));
  if (!input.provider.deviceId) reasons.push(reasonForCardiometabolic('provenance_incomplete'));
  if (input.context.medicationContextKnown === null) reasons.push(reasonForCardiometabolic('missing_medication_context'));
  if (input.context.cardiovascularDiseaseHistoryKnown === null) reasons.push(reasonForCardiometabolic('missing_clinical_history'));

  const series = input.bloodPressure;
  if (!series || series.readingCount === null || series.occasionCount === null) reasons.push(reasonForCardiometabolic('bp_series_incomplete'));
  else if (series.readings.some(reading => reading.systolic === null || reading.diastolic === null || !Number.isFinite(reading.systolic) || !Number.isFinite(reading.diastolic) || reading.systolic <= reading.diastolic)) reasons.push(reasonForCardiometabolic('impossible_blood_pressure_structure'));
  else if (series.readings.some(reading => !reading.timestamp || !reading.occasionId || reading.sequence === null)) reasons.push(reasonForCardiometabolic('bp_series_incomplete'));
  else if (definition.id === 'home_cuff_blood_pressure' && (series.seriesComplete !== true || series.readingCount < 12 || series.occasionCount < 4)) reasons.push(reasonForCardiometabolic('bp_series_incomplete'));
  else if (definition.id === 'office_blood_pressure' && (series.seriesComplete !== true || series.readingCount < 4 || series.occasionCount < 2)) reasons.push(reasonForCardiometabolic('bp_multi_occasion_required'));
  return reasons;
}
