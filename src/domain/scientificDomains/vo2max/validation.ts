import type {
  Vo2MaxMeasurementInput,
  Vo2MaxReason,
  Vo2MaxReasonCode,
} from './contracts';
import { reasonFor, sortVo2MaxReasons } from './reasonRegistry';
import { getVo2MaxSourceDefinition, type Vo2MaxSourceDefinition } from './sourceRegistry';
import { VO2MAX_CANONICAL_UNIT, VO2MAX_SCIENTIFIC_VERSIONS } from './versions';

export interface Vo2MaxMeasurementValidation {
  canonicalValue: number | null;
  canonicalUnit: typeof VO2MAX_CANONICAL_UNIT | null;
  ageAtMeasurement: number | null;
  provenanceComplete: boolean;
  sourceDefinition: Vo2MaxSourceDefinition | null;
  reasons: readonly Vo2MaxReason[];
}

export const VO2MAX_MEASUREMENT_VALIDATION_POLICY = Object.freeze({
  version: VO2MAX_SCIENTIFIC_VERSIONS.eligibilityPolicy,
  canonicalUnit: VO2MAX_CANONICAL_UNIT,
  canonicalUnitAliases: [
    'ml/kg/min', 'ml·kg-1·min-1', 'ml·kg−1·min−1',
    'ml o2·kg^-1·min^-1', 'ml o₂·kg⁻¹·min⁻¹',
  ] as const,
  litreUnitAliases: [
    'l/kg/min', 'l·kg-1·min-1', 'l·kg−1·min−1', 'l o2·kg^-1·min^-1',
  ] as const,
  litreToMillilitreFactor: 1000,
  canonicalPrecisionDecimals: 1,
  generalPlausibilityInterval: { minimum: 5, maximum: 100 },
});

const CANONICAL_UNIT_ALIASES = new Set<string>(
  VO2MAX_MEASUREMENT_VALIDATION_POLICY.canonicalUnitAliases,
);
const LITRE_UNIT_ALIASES = new Set<string>(
  VO2MAX_MEASUREMENT_VALIDATION_POLICY.litreUnitAliases,
);

function unitKey(unit: string): string {
  return unit.trim().toLowerCase().replace(/\s+/g, ' ');
}

function roundOneDecimal(value: number): number {
  const scale = 10 ** VO2MAX_MEASUREMENT_VALIDATION_POLICY.canonicalPrecisionDecimals;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

function canonicalize(
  value: number | null,
  unit: string | null,
  estimated: boolean,
): { value: number | null; unit: typeof VO2MAX_CANONICAL_UNIT | null; unsupported: boolean } {
  if (value === null || !Number.isFinite(value) || unit === null) {
    return { value: null, unit: null, unsupported: unit !== null && value !== null };
  }
  const key = unitKey(unit);
  if (CANONICAL_UNIT_ALIASES.has(key)) {
    return {
      value: estimated && Number.isInteger(value) ? value : roundOneDecimal(value),
      unit: VO2MAX_CANONICAL_UNIT,
      unsupported: false,
    };
  }
  if (LITRE_UNIT_ALIASES.has(key)) {
    return {
      value: roundOneDecimal(
        value * VO2MAX_MEASUREMENT_VALIDATION_POLICY.litreToMillilitreFactor,
      ),
      unit: VO2MAX_CANONICAL_UNIT,
      unsupported: false,
    };
  }
  return { value: null, unit: null, unsupported: true };
}

function isRealDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function isValidTimestamp(value: string, allowDateOnly: boolean): boolean {
  if (allowDateOnly && isRealDateOnly(value)) return true;
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

function eventDate(value: string): string | null {
  const candidate = value.slice(0, 10);
  return isRealDateOnly(candidate) ? candidate : null;
}

function ageAtDate(birthDate: string, measuredAt: string): number | null {
  if (!isRealDateOnly(birthDate)) return null;
  const measuredDate = eventDate(measuredAt);
  if (measuredDate === null) return null;
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
  const [year, month, day] = measuredDate.split('-').map(Number);
  let age = year - birthYear;
  if (month < birthMonth || (month === birthMonth && day < birthDay)) age -= 1;
  return age >= 0 && age <= 130 ? age : null;
}

function hasProviderIdentity(input: Vo2MaxMeasurementInput): boolean {
  const provider = input.provider;
  return Boolean(
    provider.organization?.trim()
    || provider.application?.trim()
    || provider.deviceManufacturer?.trim()
    || provider.deviceModel?.trim(),
  ) && input.provenance.providerIdentityVerified;
}

function push(reasons: Vo2MaxReason[], code: Vo2MaxReasonCode): void {
  reasons.push(reasonFor(code));
}

function validateDirectCpet(
  input: Vo2MaxMeasurementInput,
  source: Vo2MaxSourceDefinition,
  reasons: Vo2MaxReason[],
): void {
  const provenance = input.provenance;
  if (provenance.directGasAnalysis !== true) push(reasons, 'direct_gas_not_verified');
  if (!provenance.reportVerified || !provenance.sourceReportId?.trim()) {
    push(reasons, 'missing_report_identity');
  }
  if (provenance.calibrationDocumented !== true
    || provenance.qualityControlDocumented !== true
    || provenance.protocolDocumented !== true
    || provenance.averagingIntervalDocumented !== true) {
    push(reasons, 'missing_direct_cpet_quality');
  }
  if (source.id === 'direct_cpet_maximal'
    && provenance.maximalityEvidenceDocumented !== true) push(reasons, 'maximality_not_documented');
  if (source.id === 'direct_cpet_symptom_limited'
    && (provenance.symptomLimitationDocumented !== true
      || provenance.terminationReasonDocumented !== true)) {
    push(reasons, 'symptom_limitation_not_documented');
  }
}

function validateSourceSpecific(
  input: Vo2MaxMeasurementInput,
  source: Vo2MaxSourceDefinition,
  reasons: Vo2MaxReason[],
): void {
  if (source.productionAcceptance === 'research_only') push(reasons, 'research_source_restricted');
  if (source.id === 'healthkit_unverified') push(reasons, 'healthkit_origin_unverified');
  if (source.id === 'clinician_unverified_entry') push(reasons, 'clinician_source_unverified');
  if (source.id === 'user_manual_entry') push(reasons, 'user_entry_unverified');

  if (source.id === 'clinician_verified_transcription') {
    if (!input.provenance.reportVerified
      || !input.provenance.sourceReportId?.trim()
      || input.provenance.clinicianAttestationDocumented !== true
      || input.provenance.originatingSourceId === null) {
      push(reasons, 'provenance_incomplete');
    }
  }
  if (source.id === 'user_report_transcription_unverified'
    && (!input.provenance.sourceReportId?.trim()
      || !input.provenance.originalPayloadReference?.trim())) {
    push(reasons, 'provenance_incomplete');
  }
  if (input.ingestionMethod === 'healthkit'
    && input.provenance.originatingSourceId !== input.sourceId) {
    push(reasons, 'healthkit_origin_unverified');
  }
}

export function validateVo2MaxMeasurement(
  input: Vo2MaxMeasurementInput,
): Vo2MaxMeasurementValidation {
  const reasons: Vo2MaxReason[] = [];
  const source = getVo2MaxSourceDefinition(input.sourceId);
  if (input.value === null) push(reasons, 'missing_value');
  else if (!Number.isFinite(input.value)) push(reasons, 'non_finite_value');
  else if (input.value <= 0) push(reasons, 'non_positive_value');

  const normalized = canonicalize(
    input.value,
    input.unit,
    input.measurementNature !== 'direct_gas',
  );
  if (input.unit === null || normalized.unsupported) push(reasons, 'unsupported_unit');

  if (input.timestamps.measuredAt === null) push(reasons, 'missing_timestamp');
  else if (!isValidTimestamp(
    input.timestamps.measuredAt,
    input.timestamps.precision === 'date_only',
  )) push(reasons, 'invalid_timestamp');
  if (input.timestamps.ingestedAt === null) push(reasons, 'missing_ingestion_timestamp');
  else if (!isValidTimestamp(input.timestamps.ingestedAt, false)) {
    push(reasons, 'invalid_ingestion_timestamp');
  }

  if (input.sourceId === null) push(reasons, 'missing_source');
  else if (source === null) push(reasons, 'unknown_source');
  if (input.testType === null || input.testType === 'unknown') push(reasons, 'missing_test_type');
  if (input.endpoint === 'unknown') push(reasons, 'missing_endpoint');

  if (source !== null) {
    if (input.measurementNature !== source.measurementNature) push(reasons, 'measurement_nature_mismatch');
    if (input.testType !== null && !source.allowedTestTypes.includes(input.testType)) {
      push(reasons, 'measurement_nature_mismatch');
    }
    if (!source.allowedEndpoints.includes(input.endpoint)) push(reasons, 'endpoint_source_mismatch');
    if (input.modality === null || input.modality === 'unknown') push(reasons, 'missing_modality');
    else if (!source.allowedModalities.includes(input.modality)) push(reasons, 'modality_source_mismatch');
    if (source.providerIdentityRequired && !hasProviderIdentity(input)) {
      push(reasons, 'missing_provider_identity');
    }
    if (source.sourceRecordIdRequired && !input.provenance.sourceRecordId?.trim()) {
      push(reasons, 'missing_source_record_id');
    }
    if (source.directCpetQualityRequired) validateDirectCpet(input, source, reasons);
    validateSourceSpecific(input, source, reasons);
    if (normalized.value !== null && source.sourceRange !== null
      && (normalized.value < source.sourceRange.minimum
        || normalized.value > source.sourceRange.maximum)) {
      push(reasons, 'source_range_violation');
    }
  }

  const plausibility = VO2MAX_MEASUREMENT_VALIDATION_POLICY.generalPlausibilityInterval;
  if (normalized.value !== null
    && (normalized.value < plausibility.minimum || normalized.value > plausibility.maximum)) {
    push(reasons, 'extreme_value_requires_review');
  }

  if (input.duplicate.disposition === 'exact_reimport') push(reasons, 'exact_duplicate_not_active');
  if (input.duplicate.disposition === 'probable_same_event') {
    push(reasons, 'probable_duplicate_requires_reconciliation');
  }
  if (input.duplicate.disposition === 'superseded') push(reasons, 'superseded_record_not_active');
  if (input.duplicate.disposition === 'source_correction') push(reasons, 'source_correction_preserved');

  let derivedAge: number | null = null;
  if (input.population.birthDate === null) {
    push(reasons, 'missing_birth_date_for_reference');
  } else if (!isRealDateOnly(input.population.birthDate)) {
    push(reasons, 'invalid_birth_date');
  } else if (input.timestamps.measuredAt !== null) {
    derivedAge = ageAtDate(input.population.birthDate, input.timestamps.measuredAt);
    if (derivedAge === null) push(reasons, 'age_not_derivable');
  }

  const sorted = sortVo2MaxReasons(reasons);
  const provenanceComplete = !sorted.some(reason => [
    'blocking_invalid', 'blocking_insufficient', 'blocking_unsupported',
  ].includes(reason.severity));
  return {
    canonicalValue: normalized.value,
    canonicalUnit: normalized.unit,
    ageAtMeasurement: derivedAge,
    provenanceComplete,
    sourceDefinition: source,
    reasons: sorted,
  };
}
