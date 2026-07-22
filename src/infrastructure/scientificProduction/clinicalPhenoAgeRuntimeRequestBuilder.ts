import {
  SCIENTIFIC_EVALUATION_REQUEST_VERSION,
  SCIENTIFIC_EVALUATION_RESULT_FIELDS,
  deserializeScientificEvaluationRequest,
  serializeScientificEvaluationRequest,
  serializeScientificEvaluationResult,
  type ScientificEvaluationRequest,
  type ScientificJsonObject,
  type ScientificObservation,
  type ScientificSnapshot,
} from '../../domain/scientificProduction';
import {
  CLINICAL_PHENOAGE_INPUT_ORDER,
  CLINICAL_PHENOAGE_MODEL_VERSION,
  type ClinicalPhenoAgeInputId,
} from '../../domain/scientificModels';
import type { StoredEntry } from '../../types/biomarkerEntry';

const LAB_INPUT_TO_BIOMARKER_ID = Object.freeze({
  albumin: 'albumin',
  creatinine: 'creatinine',
  glucose: 'fastingglucose',
  crp: 'hscrp',
  lymphocyte_percent: 'lymphocytepct',
  mean_cell_volume: 'mcv',
  red_cell_distribution_width: 'rdw',
  alkaline_phosphatase: 'alp',
  white_blood_cell_count: 'wbc',
} as const satisfies Record<Exclude<ClinicalPhenoAgeInputId, 'chronological_age'>, string>);

const SNAPSHOT_FIELDS = Object.freeze(
  SCIENTIFIC_EVALUATION_RESULT_FIELDS.filter(field => field !== 'requestId'),
);
const MAX_JSON_DEPTH = 32;
const MAX_JSON_NODES = 4096;

export type ClinicalPhenoAgeRuntimeRequestBuilderErrorCode =
  | 'invalid_request_identity'
  | 'invalid_timestamp'
  | 'invalid_source_record'
  | 'missing_verification'
  | 'verification_mismatch'
  | 'duplicate_observation_identity'
  | 'invalid_prior_snapshot'
  | 'json_complexity_exceeded';

export class ClinicalPhenoAgeRuntimeRequestBuilderError extends Error {
  constructor(readonly code: ClinicalPhenoAgeRuntimeRequestBuilderErrorCode) {
    super('Clinical PhenoAge runtime data could not produce a verified scientific request.');
    this.name = 'ClinicalPhenoAgeRuntimeRequestBuilderError';
  }
}

export interface ClinicalPhenoAgeRuntimeAgeRecord {
  readonly id: string;
  readonly ageYears: number;
  readonly observedAt: string;
  readonly sourceId: string;
}

export interface ClinicalPhenoAgeRuntimeVerification {
  readonly sourceRecordId: string;
  readonly sourceId: string;
  readonly sourceType: 'chronological_record' | 'laboratory';
  readonly verificationStatus: 'verified';
  readonly verificationAuthorityId: string;
  readonly verifiedAt: string;
  readonly provider: ScientificJsonObject;
  readonly metadata: ScientificJsonObject;
  readonly observationContext: ScientificJsonObject;
}

export interface ClinicalPhenoAgeRuntimeRequestBuilderInput {
  readonly requestId: string;
  readonly requestedAt: string;
  readonly chronologicalAgeRecord: ClinicalPhenoAgeRuntimeAgeRecord | null;
  readonly latestEntries: ReadonlyMap<string, StoredEntry>;
  readonly verificationBySourceRecordId: ReadonlyMap<
    string,
    ClinicalPhenoAgeRuntimeVerification
  >;
  readonly context: ScientificJsonObject;
  readonly priorSnapshot: ScientificSnapshot | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function isStableIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value === value.trim();
}

function timestampMilliseconds(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== value) return null;
  return milliseconds;
}

function assertBoundedJson(value: unknown): void {
  const stack: Array<{ value: unknown; depth: number; exiting?: boolean }> = [
    { value, depth: 0 },
  ];
  const active = new WeakSet<object>();
  let nodes = 0;

  while (stack.length > 0) {
    const current = stack.pop() as { value: unknown; depth: number; exiting?: boolean };
    nodes += 1;
    if (nodes > MAX_JSON_NODES || current.depth > MAX_JSON_DEPTH) {
      throw new ClinicalPhenoAgeRuntimeRequestBuilderError('json_complexity_exceeded');
    }
    if (current.value === null || typeof current.value === 'string'
      || typeof current.value === 'boolean') continue;
    if (typeof current.value === 'number') {
      if (!Number.isFinite(current.value)) {
        throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
      }
      continue;
    }
    if (typeof current.value !== 'object') {
      throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
    }
    if (current.exiting) {
      active.delete(current.value);
      continue;
    }
    if (active.has(current.value)) {
      throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
    }
    active.add(current.value);
    const prototype = Object.getPrototypeOf(current.value);
    if (prototype !== Object.prototype && prototype !== null
      && !Array.isArray(current.value)) {
      throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
    }
    stack.push({ value: current.value, depth: current.depth, exiting: true });
    Object.values(current.value).forEach(item => stack.push({
      value: item,
      depth: current.depth + 1,
    }));
  }
}

function requireVerification(
  recordId: string,
  sourceId: string,
  sourceType: ClinicalPhenoAgeRuntimeVerification['sourceType'],
  observedAtMs: number,
  requestedAtMs: number,
  verificationBySourceRecordId: ClinicalPhenoAgeRuntimeRequestBuilderInput[
    'verificationBySourceRecordId'
  ],
): ClinicalPhenoAgeRuntimeVerification {
  const verification = verificationBySourceRecordId.get(recordId);
  if (!verification) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('missing_verification');
  }
  assertBoundedJson(verification);
  const verifiedAtMs = timestampMilliseconds(verification.verifiedAt);
  if (!hasExactKeys(verification as unknown as Record<string, unknown>, [
    'sourceRecordId', 'sourceId', 'sourceType', 'verificationStatus',
    'verificationAuthorityId', 'verifiedAt', 'provider', 'metadata', 'observationContext',
  ])
    || verification.sourceRecordId !== recordId
    || verification.sourceId !== sourceId
    || verification.sourceType !== sourceType
    || verification.verificationStatus !== 'verified'
    || !isStableIdentifier(verification.verificationAuthorityId)
    || verifiedAtMs === null
    || verifiedAtMs < observedAtMs
    || verifiedAtMs > requestedAtMs
    || !isRecord(verification.provider)
    || !isRecord(verification.metadata)
    || !isRecord(verification.observationContext)) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('verification_mismatch');
  }
  return verification;
}

function verificationMetadata(
  verification: ClinicalPhenoAgeRuntimeVerification,
  runtimeMetadata: ScientificJsonObject,
): ScientificJsonObject {
  return {
    verification: {
      authorityId: verification.verificationAuthorityId,
      verifiedAt: verification.verifiedAt,
    },
    runtime: runtimeMetadata,
    verificationMetadata: verification.metadata,
  };
}

function ageObservation(
  record: ClinicalPhenoAgeRuntimeAgeRecord,
  requestedAtMs: number,
  verifications: ClinicalPhenoAgeRuntimeRequestBuilderInput['verificationBySourceRecordId'],
): ScientificObservation {
  const observedAtMs = timestampMilliseconds(record.observedAt);
  if (!hasExactKeys(record as unknown as Record<string, unknown>, [
    'id', 'ageYears', 'observedAt', 'sourceId',
  ])
    || !isStableIdentifier(record.id)
    || !isStableIdentifier(record.sourceId)
    || typeof record.ageYears !== 'number'
    || !Number.isFinite(record.ageYears)
    || Object.is(record.ageYears, -0)
    || observedAtMs === null
    || observedAtMs > requestedAtMs) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
  }
  const verification = requireVerification(
    record.id,
    record.sourceId,
    'chronological_record',
    observedAtMs,
    requestedAtMs,
    verifications,
  );
  return {
    observationId: record.id,
    measurementId: 'chronological_age',
    value: record.ageYears,
    unit: 'years',
    observedAt: record.observedAt,
    provenance: {
      sourceId: record.sourceId,
      sourceRecordId: record.id,
      sourceType: verification.sourceType,
      verificationStatus: verification.verificationStatus,
      provider: verification.provider,
      originalUnit: 'years',
      originalValue: record.ageYears,
      metadata: verificationMetadata(verification, {}),
    },
    context: verification.observationContext,
  };
}

function sourceMeasurement(entry: StoredEntry): { value: number; unit: string } {
  const hasReportedValue = entry.reportedValue !== undefined;
  const hasReportedUnit = entry.reportedUnit !== undefined;
  if (hasReportedValue !== hasReportedUnit) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
  }
  const value = hasReportedValue ? entry.reportedValue : entry.value;
  const unit = hasReportedUnit ? entry.reportedUnit : entry.unit;
  if (typeof value !== 'number' || !Number.isFinite(value) || Object.is(value, -0)
    || typeof unit !== 'string' || !unit.trim()) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
  }
  return { value, unit };
}

function laboratoryObservation(
  inputId: Exclude<ClinicalPhenoAgeInputId, 'chronological_age'>,
  biomarkerId: string,
  entry: StoredEntry,
  requestedAtMs: number,
  verifications: ClinicalPhenoAgeRuntimeRequestBuilderInput['verificationBySourceRecordId'],
): ScientificObservation {
  const observedAtMs = timestampMilliseconds(entry.date);
  if (!isStableIdentifier(entry.id)
    || entry.biomarkerId !== biomarkerId
    || !isStableIdentifier(entry.source)
    || observedAtMs === null
    || observedAtMs > requestedAtMs) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
  }
  const source = sourceMeasurement(entry);
  const verification = requireVerification(
    entry.id,
    entry.source,
    'laboratory',
    observedAtMs,
    requestedAtMs,
    verifications,
  );
  const sourceLabRange: ScientificJsonObject | null = entry.sourceLabRange ? {
    unit: entry.sourceLabRange.unit,
    ...(entry.sourceLabRange.lowerBound === undefined
      ? {} : { lowerBound: entry.sourceLabRange.lowerBound }),
    ...(entry.sourceLabRange.upperBound === undefined
      ? {} : { upperBound: entry.sourceLabRange.upperBound }),
    ...(entry.sourceLabRange.reportedText === undefined
      ? {} : { reportedText: entry.sourceLabRange.reportedText }),
    ...(entry.sourceLabRange.laboratoryName === undefined
      ? {} : { laboratoryName: entry.sourceLabRange.laboratoryName }),
  } : null;
  const runtimeMetadata: ScientificJsonObject = {
    biomarkerId,
    ...(sourceLabRange === null ? {} : { sourceLabRange }),
  };
  return {
    observationId: entry.id,
    measurementId: inputId,
    value: source.value,
    unit: source.unit,
    observedAt: entry.date,
    provenance: {
      sourceId: entry.source,
      sourceRecordId: entry.id,
      sourceType: verification.sourceType,
      verificationStatus: verification.verificationStatus,
      provider: verification.provider,
      originalUnit: source.unit,
      originalValue: source.value,
      metadata: verificationMetadata(verification, runtimeMetadata),
    },
    context: verification.observationContext,
  };
}

function validatePriorSnapshot(
  priorSnapshot: ScientificSnapshot,
  requestedAtMs: number,
): void {
  assertBoundedJson(priorSnapshot);
  if (!isRecord(priorSnapshot)
    || !hasExactKeys(priorSnapshot, SNAPSHOT_FIELDS)
    || priorSnapshot.domainId !== 'clinical_biological_age'
    || timestampMilliseconds(priorSnapshot.evaluatedAt) === null
    || Date.parse(priorSnapshot.evaluatedAt) > requestedAtMs) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_prior_snapshot');
  }
  try {
    serializeScientificEvaluationResult({
      ...priorSnapshot,
      requestId: 'prior-snapshot-contract-validation',
    });
  } catch {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_prior_snapshot');
  }
}

export function buildClinicalPhenoAgeRuntimeRequest(
  input: ClinicalPhenoAgeRuntimeRequestBuilderInput,
): ScientificEvaluationRequest {
  if (!isStableIdentifier(input.requestId)) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_request_identity');
  }
  const requestedAtMs = timestampMilliseconds(input.requestedAt);
  if (requestedAtMs === null) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_timestamp');
  }
  assertBoundedJson(input.context);
  if (!isRecord(input.context)) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('invalid_source_record');
  }
  if (input.priorSnapshot !== null) {
    validatePriorSnapshot(input.priorSnapshot, requestedAtMs);
  }

  const observations = new Map<ClinicalPhenoAgeInputId, ScientificObservation>();
  if (input.chronologicalAgeRecord !== null) {
    observations.set('chronological_age', ageObservation(
      input.chronologicalAgeRecord,
      requestedAtMs,
      input.verificationBySourceRecordId,
    ));
  }
  Object.entries(LAB_INPUT_TO_BIOMARKER_ID).forEach(([inputId, biomarkerId]) => {
    const entry = input.latestEntries.get(biomarkerId);
    if (!entry) return;
    observations.set(inputId as ClinicalPhenoAgeInputId, laboratoryObservation(
      inputId as Exclude<ClinicalPhenoAgeInputId, 'chronological_age'>,
      biomarkerId,
      entry,
      requestedAtMs,
      input.verificationBySourceRecordId,
    ));
  });

  const observationIds = [...observations.values()].map(observation => observation.observationId);
  if (new Set(observationIds).size !== observationIds.length) {
    throw new ClinicalPhenoAgeRuntimeRequestBuilderError('duplicate_observation_identity');
  }
  const orderedObservations = CLINICAL_PHENOAGE_INPUT_ORDER.flatMap(inputId => {
    const observation = observations.get(inputId);
    return observation ? [observation] : [];
  });
  const request: ScientificEvaluationRequest = {
    contractVersion: SCIENTIFIC_EVALUATION_REQUEST_VERSION,
    requestId: input.requestId,
    domainId: 'clinical_biological_age',
    requestedDomainVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
    requestedAt: input.requestedAt,
    observations: orderedObservations,
    context: input.context,
    priorSnapshot: input.priorSnapshot,
  };
  assertBoundedJson(request);
  return deserializeScientificEvaluationRequest(serializeScientificEvaluationRequest(request));
}
