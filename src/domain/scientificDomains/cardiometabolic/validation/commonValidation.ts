import type {
  CardiometabolicCanonicalMeasurement,
  CardiometabolicMeasurementInput,
  CardiometabolicReason,
} from '../contracts';
import type { CardiometabolicMeasurementDefinition } from '../measurementRegistry';
import { getCardiometabolicSource } from '../sourceRegistry';
import { reasonForCardiometabolic } from '../reasonRegistry';
import { CARDIOMETABOLIC_CONVERSION_STANDARD } from '../versions';

function validDate(value: string | null): boolean {
  return value !== null && Number.isFinite(Date.parse(value));
}

function convertNumeric(value: number, unit: string, definition: CardiometabolicMeasurementDefinition): number | null {
  if (unit === definition.canonicalUnit) return value;
  switch (definition.id) {
    case 'apolipoprotein_b': return unit === 'mg/dL' ? value * CARDIOMETABOLIC_CONVERSION_STANDARD.apoBMgDlToGL : null;
    case 'ldl_c_direct':
    case 'ldl_c_calculated':
    case 'non_hdl_c':
    case 'hdl_c': return unit === 'mg/dL' ? value * CARDIOMETABOLIC_CONVERSION_STANDARD.cholesterolMgDlToMmolL : null;
    case 'triglycerides': return unit === 'mg/dL' ? value * CARDIOMETABOLIC_CONVERSION_STANDARD.triglycerideMgDlToMmolL : null;
    case 'lipoprotein_a_mass':
      if (unit === 'mg/L') return value * CARDIOMETABOLIC_CONVERSION_STANDARD.lpaMgLToMgDl;
      if (unit === 'g/L') return value * CARDIOMETABOLIC_CONVERSION_STANDARD.lpaGLToMgDl;
      return null;
    case 'hba1c': return unit === '%' ? (value - CARDIOMETABOLIC_CONVERSION_STANDARD.hba1cNgspIntercept) * CARDIOMETABOLIC_CONVERSION_STANDARD.hba1cNgspToIfccSlope : null;
    case 'fasting_plasma_glucose': return unit === 'mg/dL' ? value * CARDIOMETABOLIC_CONVERSION_STANDARD.glucoseMgDlToMmolL : null;
    case 'waist_circumference': return unit === 'in' ? value * CARDIOMETABOLIC_CONVERSION_STANDARD.inchToCentimetre : null;
    default: return null;
  }
}

export function validateCardiometabolicCommon(
  input: CardiometabolicMeasurementInput,
  definition: CardiometabolicMeasurementDefinition | null,
): { reasons: CardiometabolicReason[]; canonical: CardiometabolicCanonicalMeasurement; provenanceComplete: boolean } {
  const reasons: CardiometabolicReason[] = [];
  const isBp = definition?.family === 'blood_pressure';
  const originalValue = input.numeric?.value ?? null;
  const originalUnit = isBp ? 'mmHg' : input.numeric?.unit ?? null;
  let canonicalValue: number | null = null;
  let systolic: number | null = input.bloodPressure?.summarySystolic ?? null;
  let diastolic: number | null = input.bloodPressure?.summaryDiastolic ?? null;
  let conversionAuthorized = false;

  if (input.measurementId === null) reasons.push(reasonForCardiometabolic('missing_measurement_identity'));
  else if (!definition) reasons.push(reasonForCardiometabolic('unknown_measurement_identity'));
  if (definition && input.measurementStandardId !== definition.standardId) reasons.push(reasonForCardiometabolic('measurement_standard_mismatch'));

  if (isBp) {
    if (systolic === null || diastolic === null) reasons.push(reasonForCardiometabolic('missing_value'));
    else if (![systolic, diastolic].every(Number.isFinite)) reasons.push(reasonForCardiometabolic('non_finite_value'));
    else if (systolic <= 0 || diastolic <= 0) reasons.push(reasonForCardiometabolic('non_positive_value'));
    else if (systolic <= diastolic) reasons.push(reasonForCardiometabolic('impossible_blood_pressure_structure'));
    else conversionAuthorized = true;
  } else {
    if (originalValue === null) reasons.push(reasonForCardiometabolic('missing_value'));
    else if (!Number.isFinite(originalValue)) reasons.push(reasonForCardiometabolic('non_finite_value'));
    else if (originalValue <= 0) reasons.push(reasonForCardiometabolic('non_positive_value'));
    if (definition && originalUnit !== null) {
      if (!definition.acceptedUnits.includes(originalUnit)) reasons.push(reasonForCardiometabolic(definition.id.startsWith('lipoprotein_a') ? 'lpa_unit_mismatch' : 'unsupported_unit'));
      else if (originalValue !== null && Number.isFinite(originalValue)) {
        canonicalValue = convertNumeric(originalValue, originalUnit, definition);
        conversionAuthorized = canonicalValue !== null;
        if (!conversionAuthorized) reasons.push(reasonForCardiometabolic('unit_conversion_not_authorized'));
      }
    } else if (definition) reasons.push(reasonForCardiometabolic('unsupported_unit'));
  }

  if (input.timestamps.measuredAt === null) reasons.push(reasonForCardiometabolic('missing_timestamp'));
  else if (!validDate(input.timestamps.measuredAt)) reasons.push(reasonForCardiometabolic('invalid_timestamp'));
  if (input.timestamps.ingestedAt === null) reasons.push(reasonForCardiometabolic('missing_ingestion_timestamp'));
  else if (!validDate(input.timestamps.ingestedAt)) reasons.push(reasonForCardiometabolic('invalid_ingestion_timestamp'));

  const source = getCardiometabolicSource(input.sourceId);
  if (input.sourceId === null) reasons.push(reasonForCardiometabolic('missing_source'));
  else if (!source) reasons.push(reasonForCardiometabolic('unknown_source'));
  else if (source.acceptance === 'unsupported') reasons.push(reasonForCardiometabolic('source_unsupported'));
  else if (source.acceptance === 'research_only') reasons.push(reasonForCardiometabolic('source_research_only'));
  if (!input.ingestionMethod) reasons.push(reasonForCardiometabolic('missing_ingestion_method'));
  if (!input.provider.providerId) reasons.push(reasonForCardiometabolic('missing_provider_identity'));
  if (!input.provenance.sourceRecordId) reasons.push(reasonForCardiometabolic('missing_source_record_id'));
  if (input.verificationStatus === null) reasons.push(reasonForCardiometabolic('missing_verification_status'));
  else if (['rejected', 'superseded'].includes(input.verificationStatus)) reasons.push(reasonForCardiometabolic('verification_not_accepted'));
  if (input.sourceId === 'CMH-SRC-MANUAL') reasons.push(reasonForCardiometabolic('unverified_manual_entry'));
  if (input.sourceId === 'CMH-SRC-MANUAL-DOC' && (input.provenance.sourceDocumentVerified !== true || input.verificationStatus !== 'verified_transcription')) reasons.push(reasonForCardiometabolic('unverified_manual_entry'));
  if (input.sourceId === 'CMH-SRC-CONTAINER' && !input.provenance.originSourceId) reasons.push(reasonForCardiometabolic('container_origin_missing'));
  if (input.duplicate.disposition === 'exact_reimport' || input.duplicate.disposition === 'superseded') reasons.push(reasonForCardiometabolic('exact_duplicate_not_active'));
  if (input.duplicate.disposition === 'probable_duplicate') reasons.push(reasonForCardiometabolic('probable_duplicate_requires_reconciliation'));
  if (input.duplicate.disposition === 'correction') reasons.push(reasonForCardiometabolic('historical_correction_retained'));

  const provenanceComplete = Boolean(
    input.ingestionMethod && input.provider.providerId && input.provenance.sourceRecordId
    && input.provenance.completenessDeclared === true && input.verificationStatus,
  );
  if (!provenanceComplete) reasons.push(reasonForCardiometabolic('provenance_incomplete'));

  return {
    reasons,
    canonical: {
      value: canonicalValue,
      systolic,
      diastolic,
      unit: definition?.canonicalUnit ?? null,
      conversionAuthorized,
    },
    provenanceComplete,
  };
}
