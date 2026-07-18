import type {
  FunctionalCapacityMeasurementInput,
  FunctionalCapacityReason,
  FunctionalCapacityReasonCode,
  FunctionalCapacityTestId,
} from '../contracts';
import { reasonForFunctionalCapacity, sortFunctionalCapacityReasons } from '../reasonRegistry';
import { getFunctionalCapacityProtocolDefinition, type FunctionalCapacityProtocolDefinition } from '../protocolRegistry';
import { getFunctionalCapacitySourceDefinition, type FunctionalCapacitySourceDefinition } from '../sourceRegistry';
import { getFunctionalCapacityTestDefinition, type FunctionalCapacityTestDefinition } from '../testRegistry';
import {
  FUNCTIONAL_CAPACITY_CANONICAL_UNITS,
  FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS,
  FUNCTIONAL_CAPACITY_UNIT_STANDARD,
} from '../versions';

export interface FunctionalCapacityCommonValidation {
  canonicalValue: number | null;
  canonicalUnit: string | null;
  ageAtMeasurement: number | null;
  sourceDefinition: FunctionalCapacitySourceDefinition | null;
  protocolDefinition: FunctionalCapacityProtocolDefinition | null;
  testDefinition: FunctionalCapacityTestDefinition | null;
  provenanceComplete: boolean;
  reasons: readonly FunctionalCapacityReason[];
}

export const FUNCTIONAL_CAPACITY_VALIDATION_POLICY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.validationPolicy,
  failClosed: true,
  inferMissingProtocolMetadata: false,
  mergeAttempts: false,
  mergeHands: false,
  imputeMissingValues: false,
  deleteVerifiedExtremeValues: false,
  unitStandardVersion: FUNCTIONAL_CAPACITY_UNIT_STANDARD.version,
});

export function addReason(
  reasons: FunctionalCapacityReason[],
  code: FunctionalCapacityReasonCode,
): void {
  reasons.push(reasonForFunctionalCapacity(code));
}

function unitKey(unit: string): string {
  return unit.trim().toLowerCase().replace(/\s+/g, ' ');
}

function canonicalize(
  testId: FunctionalCapacityTestId | null,
  value: number | null,
  unit: string | null,
): { value: number | null; unit: string | null; unsupported: boolean } {
  if (testId === 'short_physical_performance_battery') {
    return { value: null, unit: FUNCTIONAL_CAPACITY_CANONICAL_UNITS.short_physical_performance_battery, unsupported: false };
  }
  if (testId === null || value === null || !Number.isFinite(value) || unit === null) {
    return { value: null, unit: null, unsupported: unit !== null && value !== null };
  }
  const key = unitKey(unit);
  if (testId === 'hand_grip_strength') {
    if (['kgf', 'kilogram-force', 'kilogram force'].includes(key)) return { value, unit: 'kgf', unsupported: false };
    if (['lbf', 'pound-force', 'pound force'].includes(key)) return { value: value * FUNCTIONAL_CAPACITY_UNIT_STANDARD.poundForceToKilogramForce, unit: 'kgf', unsupported: false };
    if (['n', 'newton', 'newtons'].includes(key)) return { value: value * FUNCTIONAL_CAPACITY_UNIT_STANDARD.newtonToKilogramForce, unit: 'kgf', unsupported: false };
  }
  if (testId === 'usual_gait_speed' || testId === 'four_meter_walk') {
    if (['m/s', 'm·s^-1', 'metres per second', 'meters per second'].includes(key)) return { value, unit: 'm/s', unsupported: false };
    if (['cm/s', 'centimetres per second', 'centimeters per second'].includes(key)) return { value: value * FUNCTIONAL_CAPACITY_UNIT_STANDARD.centimetrePerSecondToMetrePerSecond, unit: 'm/s', unsupported: false };
    if (['ft/s', 'feet per second'].includes(key)) return { value: value * FUNCTIONAL_CAPACITY_UNIT_STANDARD.footPerSecondToMetrePerSecond, unit: 'm/s', unsupported: false };
  }
  if (testId === 'chair_stand_30_second') {
    if (['completed_stands', 'stands', 'repetitions', 'reps'].includes(key)) return { value, unit: 'completed_stands', unsupported: false };
  }
  if (testId === 'five_times_sit_to_stand' || testId === 'timed_up_and_go') {
    if (['s', 'sec', 'second', 'seconds'].includes(key)) return { value, unit: 's', unsupported: false };
    if (['ms', 'millisecond', 'milliseconds'].includes(key)) return { value: value * FUNCTIONAL_CAPACITY_UNIT_STANDARD.millisecondToSecond, unit: 's', unsupported: false };
  }
  if (testId === 'six_minute_walk_test') {
    if (['m', 'metre', 'metres', 'meter', 'meters'].includes(key)) return { value, unit: 'm', unsupported: false };
    if (['ft', 'foot', 'feet'].includes(key)) return { value: value * FUNCTIONAL_CAPACITY_UNIT_STANDARD.footToMetre, unit: 'm', unsupported: false };
  }
  return { value: null, unit: null, unsupported: true };
}

function isRealDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isValidTimestamp(value: string, dateOnlyAllowed: boolean): boolean {
  if (dateOnlyAllowed && isRealDateOnly(value)) return true;
  return /(Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}

function ageAtMeasurement(birthDate: string, measuredAt: string): number | null {
  if (!isRealDateOnly(birthDate)) return null;
  const measuredDate = measuredAt.slice(0, 10);
  if (!isRealDateOnly(measuredDate)) return null;
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
  const [year, month, day] = measuredDate.split('-').map(Number);
  let age = year - birthYear;
  if (month < birthMonth || (month === birthMonth && day < birthDay)) age -= 1;
  return age >= 0 && age <= 130 ? age : null;
}

function hasProviderIdentity(input: FunctionalCapacityMeasurementInput): boolean {
  const provider = input.provider;
  return Boolean(provider.organization?.trim() || provider.application?.trim()
    || provider.deviceManufacturer?.trim() || provider.deviceModel?.trim())
    && input.provenance.providerIdentityVerified;
}

function validateSource(
  input: FunctionalCapacityMeasurementInput,
  source: FunctionalCapacitySourceDefinition | null,
  reasons: FunctionalCapacityReason[],
): void {
  if (input.sourceId === null) addReason(reasons, 'missing_source');
  else if (source === null) addReason(reasons, 'unknown_source');
  if (source === null) return;
  if (source.acceptance === 'research_only') addReason(reasons, 'source_research_only');
  if (source.acceptance === 'unsupported') addReason(reasons, 'source_unsupported');
  if (source.allowedTests !== 'all' && input.testId !== null && !source.allowedTests.includes(input.testId)) {
    addReason(reasons, 'source_unsupported');
  }
  if (source.id === 'consumer_wearable') addReason(reasons, 'wearable_not_validated_test');
  if (source.id === 'passive_estimate') addReason(reasons, 'passive_estimate_not_validated_test');
  if (source.id === 'clinician_entered_unverified') addReason(reasons, 'unverified_clinician_entry');
  if (source.id === 'user_entered_unverified') addReason(reasons, 'unverified_user_entry');
  if (source.id === 'self_report') addReason(reasons, 'self_report_not_measurement');
  if (!hasProviderIdentity(input)) addReason(reasons, 'missing_provider_identity');
  if (!input.provenance.sourceRecordId?.trim()) addReason(reasons, 'missing_source_record_id');
  if (!input.provenance.sourceSessionId?.trim()) addReason(reasons, 'missing_session_id');
  if (source.directObservationRequired && !input.provenance.observerId?.trim()) addReason(reasons, 'missing_observer_identity');
  if (source.directObservationRequired && input.provenance.assessorTrainingDocumented !== true) addReason(reasons, 'missing_assessor_training');
  if (source.verifiedOriginalRecordRequired && !input.provenance.originalRecordReference?.trim()) addReason(reasons, 'provenance_incomplete');
  if ((source.id === 'clinician_verified_transcription' || source.id === 'user_transcription_pending_verification')
    && (input.provenance.transcriptionVerified !== true || !input.provenance.sourceDocumentVerified)) {
    addReason(reasons, 'provenance_incomplete');
  }
}

function validateCompletion(input: FunctionalCapacityMeasurementInput, reasons: FunctionalCapacityReason[]): void {
  if (input.completion.state === 'unknown') addReason(reasons, 'missing_completion_status');
  if (input.completion.state === 'incomplete') addReason(reasons, 'test_incomplete');
  if (input.completion.state === 'interrupted') addReason(reasons, 'test_interrupted');
  if (['not_started', 'contraindicated', 'refused', 'technical_failure'].includes(input.completion.state)) {
    addReason(reasons, 'test_not_completed');
  }
  if (input.completion.state === 'interrupted' && input.completion.interruptions.length === 0) {
    addReason(reasons, 'missing_interruption_record');
  }
  if (input.completion.assistance === 'unknown') addReason(reasons, 'missing_assistance_status');
  if (input.completion.assistance === 'physical_assistance') addReason(reasons, 'physical_assistance_invalidates_standard');
  if (input.completion.state !== 'completed' && !input.completion.stoppingReasonRecorded) addReason(reasons, 'missing_stopping_reason');
}

function validateSafety(input: FunctionalCapacityMeasurementInput, reasons: FunctionalCapacityReason[]): void {
  if (input.safety.screeningCompleted !== true) addReason(reasons, 'missing_safety_screen');
  if (input.safety.contraindicationPresent === true) addReason(reasons, 'contraindication_present');
  if (input.safety.acuteSymptomsPresent === true || input.safety.adverseEvents.length > 0) addReason(reasons, 'acute_safety_event');
  if (input.supervision.supervisionClass === 'unknown') addReason(reasons, 'missing_supervision');
}

function validateAttempts(input: FunctionalCapacityMeasurementInput, reasons: FunctionalCapacityReason[]): void {
  if (input.testId !== 'short_physical_performance_battery' && input.attempts.length === 0) addReason(reasons, 'missing_attempts');
  const ids = input.attempts.map(attempt => attempt.attemptId);
  if (new Set(ids).size !== ids.length) addReason(reasons, 'duplicate_attempt_id');
  const sequences = input.attempts.map(attempt => attempt.sequence);
  if (sequences.some(sequence => !Number.isInteger(sequence) || sequence < 1)
    || new Set(sequences).size !== sequences.length) addReason(reasons, 'invalid_attempt_sequence');
  input.attempts.forEach(attempt => {
    if (attempt.value !== null && !Number.isFinite(attempt.value)) addReason(reasons, 'non_finite_value');
    if (attempt.restBeforeSeconds !== null && (!Number.isFinite(attempt.restBeforeSeconds) || attempt.restBeforeSeconds < 0)) addReason(reasons, 'negative_value');
  });
}

export function validateFunctionalCapacityCommon(
  input: FunctionalCapacityMeasurementInput,
): FunctionalCapacityCommonValidation {
  const reasons: FunctionalCapacityReason[] = [];
  const testDefinition = getFunctionalCapacityTestDefinition(input.testId);
  const protocolDefinition = getFunctionalCapacityProtocolDefinition(input.protocolId);
  const sourceDefinition = getFunctionalCapacitySourceDefinition(input.sourceId);
  if (input.testId === null) addReason(reasons, 'missing_test_identity');
  else if (testDefinition === null) addReason(reasons, 'unknown_test_identity');

  if (testDefinition?.scalarValueRequired) {
    if (input.value === null) addReason(reasons, 'missing_value');
    else if (!Number.isFinite(input.value)) addReason(reasons, 'non_finite_value');
    else if (input.value <= 0) addReason(reasons, 'non_positive_value');
  }
  if (testDefinition?.rawComponentsRequired && input.details.sppb?.rawComponents == null) {
    addReason(reasons, 'missing_raw_components');
  }
  const normalized = canonicalize(input.testId, input.value, input.unit);
  if (input.testId !== null && input.testId !== 'short_physical_performance_battery'
    && (input.unit === null || normalized.unsupported)) addReason(reasons, 'unsupported_unit');
  if (input.testId === 'chair_stand_30_second' && input.value !== null && !Number.isInteger(input.value)) {
    addReason(reasons, 'non_integer_repetition_count');
  }

  if (input.timestamps.measuredAt === null) addReason(reasons, 'missing_timestamp');
  else if (!isValidTimestamp(input.timestamps.measuredAt, input.timestamps.precision === 'date_only')) addReason(reasons, 'invalid_timestamp');
  if (input.timestamps.ingestedAt === null) addReason(reasons, 'missing_ingestion_timestamp');
  else if (!isValidTimestamp(input.timestamps.ingestedAt, false)) addReason(reasons, 'invalid_ingestion_timestamp');

  if (input.ingestionMethod === null) addReason(reasons, 'missing_ingestion_method');
  if (input.protocolId === null) addReason(reasons, 'missing_protocol');
  else if (protocolDefinition === null) addReason(reasons, 'unknown_protocol');
  if (input.endpoint === null) addReason(reasons, 'missing_endpoint');
  if (protocolDefinition !== null && input.testId !== null && input.testId !== protocolDefinition.testId) {
    addReason(reasons, 'protocol_test_mismatch');
  }
  if (protocolDefinition !== null && input.endpoint !== null && input.endpoint !== protocolDefinition.endpoint) {
    addReason(reasons, 'material_protocol_deviation');
  }
  if (protocolDefinition !== null && input.protocolVersion !== protocolDefinition.version) addReason(reasons, 'protocol_version_mismatch');
  if (input.protocolAdherence === 'unknown') addReason(reasons, 'protocol_adherence_unknown');
  if (input.protocolAdherence === 'material_deviation') addReason(reasons, 'material_protocol_deviation');
  if (input.provenance.protocolDocumented !== true) addReason(reasons, 'provenance_incomplete');

  validateSource(input, sourceDefinition, reasons);
  validateCompletion(input, reasons);
  validateSafety(input, reasons);
  validateAttempts(input, reasons);

  if (input.outlierStatus === 'verified_extreme') addReason(reasons, 'verified_extreme_preserved');
  if (input.outlierStatus === 'unresolved_extreme') addReason(reasons, 'unresolved_extreme_requires_review');
  if (input.duplicate.disposition === 'exact_reimport') addReason(reasons, 'exact_duplicate_not_active');
  if (input.duplicate.disposition === 'probable_same_event') addReason(reasons, 'probable_duplicate_requires_reconciliation');
  if (input.duplicate.disposition === 'superseded') addReason(reasons, 'superseded_record_not_active');
  if (input.duplicate.disposition === 'source_correction') addReason(reasons, 'source_correction_preserved');

  let derivedAge: number | null = null;
  if (input.population.birthDate === null) addReason(reasons, 'missing_birth_date_for_reference');
  else if (!isRealDateOnly(input.population.birthDate)) addReason(reasons, 'invalid_birth_date');
  else if (input.timestamps.measuredAt !== null) {
    derivedAge = ageAtMeasurement(input.population.birthDate, input.timestamps.measuredAt);
    if (derivedAge === null) addReason(reasons, 'age_not_derivable');
  }

  const sorted = sortFunctionalCapacityReasons(reasons);
  const provenanceComplete = !sorted.some(reason => [
    'blocking_invalid', 'blocking_insufficient', 'blocking_unsupported',
    'blocking_protocol', 'blocking_incomplete', 'blocking_safety',
  ].includes(reason.severity));
  return {
    canonicalValue: normalized.value,
    canonicalUnit: normalized.unit,
    ageAtMeasurement: derivedAge,
    sourceDefinition,
    protocolDefinition,
    testDefinition,
    provenanceComplete,
    reasons: sorted,
  };
}
