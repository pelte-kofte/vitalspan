import {
  SCIENTIFIC_EVALUATION_REQUEST_VERSION,
  SCIENTIFIC_EVALUATION_RESULT_FIELDS,
  SCIENTIFIC_EVALUATION_RESULT_VERSION,
  SCIENTIFIC_PRODUCTION_CONTRACT_VERSION,
  ScientificContractError,
  deserializeScientificEvaluationRequest,
  deserializeScientificEvaluationResult,
  serializeScientificEvaluationRequest,
  serializeScientificEvaluationResult,
  validateScientificEvaluationRequestContract,
  type ScientificDomainProductionPort,
  type ScientificDomainVersion,
  type ScientificEvaluationRequest,
  type ScientificEvaluationResult,
  type ScientificEvidenceReference,
  type ScientificJsonObject,
  type ScientificObservation,
  type ScientificReason,
  type ScientificSnapshot,
  type ScientificWarning,
} from '../../domain/scientificProduction';
import {
  CLINICAL_PHENOAGE_COEFFICIENT_VERSION,
  CLINICAL_PHENOAGE_IMPLEMENTATION_VERSION,
  CLINICAL_PHENOAGE_INPUT_ORDER,
  CLINICAL_PHENOAGE_MODEL_VERSION,
  CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
  SCIENTIFIC_EVIDENCE,
  type ClinicalPhenoAgeInputId,
} from '../../domain/scientificModels';
import {
  evaluateClinicalPhenoAgeForProduct,
  type ClinicalPhenoAgeProductEvaluation,
} from '../../lib/clinicalPhenoAgeProduct';

export const CLINICAL_PHENOAGE_PRODUCTION_ADAPTER_ID =
  'clinical_phenoage_phase_8_0a_adapter' as const;
export const CLINICAL_PHENOAGE_PRODUCTION_ADAPTER_VERSION =
  'clinical-phenoage-production-adapter/2.0.0' as const;

export const CLINICAL_PHENOAGE_PRODUCTION_DOMAIN_VERSION: ScientificDomainVersion =
  Object.freeze({
    domainId: 'clinical_biological_age',
    scientificSpecificationVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
    componentVersions: Object.freeze([
      Object.freeze({
        componentId: 'clinical_biological_age:scientific_specification',
        version: CLINICAL_PHENOAGE_MODEL_VERSION,
      }),
      Object.freeze({
        componentId: 'clinical_biological_age:measurement_registry',
        version: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
      }),
      Object.freeze({
        componentId: 'clinical_biological_age:validation_policy',
        version: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
      }),
      Object.freeze({
        componentId: 'clinical_biological_age:eligibility_policy',
        version: CLINICAL_PHENOAGE_MODEL_VERSION,
      }),
      Object.freeze({
        componentId: 'clinical_biological_age:coefficient_registry',
        version: CLINICAL_PHENOAGE_COEFFICIENT_VERSION,
      }),
      Object.freeze({
        componentId: 'clinical_biological_age:normalization_contract',
        version: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
      }),
      Object.freeze({
        componentId: 'clinical_biological_age:implementation',
        version: CLINICAL_PHENOAGE_IMPLEMENTATION_VERSION,
      }),
    ]),
  });

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

const AUTHORIZED_OUTPUT_IDS = Object.freeze([
  'phenotypicAgeYears',
  'chronologicalAgeYears',
  'ageDifferenceYears',
]);
const MAX_JSON_DEPTH = 32;
const MAX_JSON_NODES = 4096;

export type ClinicalPhenoAgeAdapterErrorCode =
  | 'invalid_request'
  | 'unsupported_domain_version'
  | 'invalid_prior_snapshot'
  | 'invalid_observation'
  | 'duplicate_observation'
  | 'provenance_incomplete'
  | 'scientific_result_mismatch'
  | 'invalid_result_identity'
  | 'json_complexity_exceeded';

export class ClinicalPhenoAgeAdapterError extends Error {
  constructor(readonly code: ClinicalPhenoAgeAdapterErrorCode) {
    super('Clinical PhenoAge could not satisfy the scientific production contract.');
    this.name = 'ClinicalPhenoAgeAdapterError';
  }
}

export interface ClinicalPhenoAgeEvaluationIdentity {
  readonly snapshotId: string;
  readonly evaluationId: string;
}

export interface ClinicalPhenoAgeEvaluationIdentityProvider {
  create(request: ScientificEvaluationRequest): ClinicalPhenoAgeEvaluationIdentity;
}

export interface ClinicalPhenoAgeEvaluationRequestInput {
  readonly requestId: string;
  readonly requestedAt: string;
  readonly observations: readonly ScientificObservation[];
}

interface LegacyClinicalPhenoAgeEntry {
  readonly id: string;
  readonly biomarkerId: string;
  readonly value: number;
  readonly unit: string;
  readonly reportedValue: number;
  readonly reportedUnit: string;
  readonly date: string;
  readonly source: string;
  readonly notes: '';
}

type ValidatedScientificObservation = ScientificObservation & {
  readonly value: number;
  readonly observedAt: string;
};

interface ValidatedClinicalPhenoAgeRequest {
  readonly request: ScientificEvaluationRequest;
  readonly chronologicalAgeObservation: ValidatedScientificObservation | null;
  readonly entries: ReadonlyMap<string, LegacyClinicalPhenoAgeEntry>;
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

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value;
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
      throw new ClinicalPhenoAgeAdapterError('json_complexity_exceeded');
    }
    if (current.value === null || typeof current.value === 'string'
      || typeof current.value === 'boolean') continue;
    if (typeof current.value === 'number') {
      if (!Number.isFinite(current.value)) {
        throw new ClinicalPhenoAgeAdapterError('invalid_request');
      }
      continue;
    }
    if (typeof current.value !== 'object') {
      throw new ClinicalPhenoAgeAdapterError('invalid_request');
    }
    if (current.exiting) {
      active.delete(current.value);
      continue;
    }
    if (active.has(current.value)) {
      throw new ClinicalPhenoAgeAdapterError('invalid_request');
    }
    active.add(current.value);
    const prototype = Object.getPrototypeOf(current.value);
    if (prototype !== Object.prototype && prototype !== null
      && !Array.isArray(current.value)) {
      throw new ClinicalPhenoAgeAdapterError('invalid_request');
    }
    stack.push({ value: current.value, depth: current.depth, exiting: true });
    Object.values(current.value).forEach(item => stack.push({
      value: item,
      depth: current.depth + 1,
    }));
  }
}

function canonicalizeRequest(request: ScientificEvaluationRequest): ScientificEvaluationRequest {
  assertBoundedJson(request);
  return deserializeScientificEvaluationRequest(serializeScientificEvaluationRequest(request));
}

function toScientificJsonObject(value: unknown): ScientificJsonObject {
  assertBoundedJson(value);
  const cloned = JSON.parse(JSON.stringify(value)) as unknown;
  if (!isRecord(cloned)) throw new ClinicalPhenoAgeAdapterError('invalid_request');
  return cloned as ScientificJsonObject;
}

function requireObservationShape(
  observation: ScientificObservation,
): asserts observation is ValidatedScientificObservation {
  if (!isRecord(observation) || !hasExactKeys(observation, [
    'observationId', 'measurementId', 'value', 'unit', 'observedAt',
    'provenance', 'context',
  ])) {
    throw new ClinicalPhenoAgeAdapterError('invalid_observation');
  }
  if (!isRecord(observation.provenance) || !hasExactKeys(observation.provenance, [
    'sourceId', 'sourceRecordId', 'sourceType', 'verificationStatus', 'provider',
    'originalUnit', 'originalValue', 'metadata',
  ])) {
    throw new ClinicalPhenoAgeAdapterError('invalid_observation');
  }
  if (!observation.observationId.trim()
    || observation.observationId !== observation.observationId.trim()
    || typeof observation.value !== 'number'
    || !Number.isFinite(observation.value)
    || Object.is(observation.value, -0)
    || !isCanonicalIsoTimestamp(observation.observedAt)
    || !isRecord(observation.context)
    || !isRecord(observation.provenance.provider)
    || !isRecord(observation.provenance.metadata)) {
    throw new ClinicalPhenoAgeAdapterError('invalid_observation');
  }
  if (typeof observation.provenance.sourceRecordId !== 'string'
    || !observation.provenance.sourceRecordId.trim()
    || observation.provenance.sourceRecordId !== observation.provenance.sourceRecordId.trim()
    || observation.provenance.verificationStatus !== 'verified') {
    throw new ClinicalPhenoAgeAdapterError('provenance_incomplete');
  }
}

const SCIENTIFIC_SNAPSHOT_FIELDS = Object.freeze(
  SCIENTIFIC_EVALUATION_RESULT_FIELDS.filter(field => field !== 'requestId'),
);

function validatePriorSnapshot(
  snapshot: ScientificSnapshot,
  requestedAt: string,
): void {
  if (!isRecord(snapshot)
    || !hasExactKeys(snapshot, SCIENTIFIC_SNAPSHOT_FIELDS)
    || snapshot.domainId !== 'clinical_biological_age'
    || !isCanonicalIsoTimestamp(snapshot.evaluatedAt)
    || Date.parse(snapshot.evaluatedAt) > Date.parse(requestedAt)) {
    throw new ClinicalPhenoAgeAdapterError('invalid_prior_snapshot');
  }
  try {
    serializeScientificEvaluationResult({
      ...snapshot,
      requestId: 'prior-snapshot-contract-validation',
    });
  } catch {
    throw new ClinicalPhenoAgeAdapterError('invalid_prior_snapshot');
  }
}

function validateClinicalPhenoAgeRequest(
  request: ScientificEvaluationRequest,
): ValidatedClinicalPhenoAgeRequest {
  const contractValidation = validateScientificEvaluationRequestContract(request);
  if (!contractValidation.valid) {
    throw new ScientificContractError(
      'Clinical PhenoAge request failed scientific production contract validation.',
      contractValidation.issues,
    );
  }
  if (request.domainId !== 'clinical_biological_age') {
    throw new ClinicalPhenoAgeAdapterError('invalid_request');
  }
  if (request.requestedDomainVersion !== CLINICAL_PHENOAGE_MODEL_VERSION) {
    throw new ClinicalPhenoAgeAdapterError('unsupported_domain_version');
  }
  if (!isCanonicalIsoTimestamp(request.requestedAt)) {
    throw new ClinicalPhenoAgeAdapterError('invalid_request');
  }
  if (request.priorSnapshot !== null) validatePriorSnapshot(
    request.priorSnapshot,
    request.requestedAt,
  );

  const byInputId = new Map<ClinicalPhenoAgeInputId, ValidatedScientificObservation>();
  for (const observation of request.observations) {
    requireObservationShape(observation);
    if (!(CLINICAL_PHENOAGE_INPUT_ORDER as readonly string[]).includes(
      observation.measurementId,
    )) {
      throw new ClinicalPhenoAgeAdapterError('invalid_observation');
    }
    const inputId = observation.measurementId as ClinicalPhenoAgeInputId;
    if (byInputId.has(inputId)) {
      throw new ClinicalPhenoAgeAdapterError('duplicate_observation');
    }
    byInputId.set(inputId, observation);
  }

  const age = byInputId.get('chronological_age') ?? null;
  if (age !== null) {
    if (age.unit !== 'years'
      || age.provenance.sourceType !== 'chronological_record'
      || typeof age.provenance.sourceId !== 'string'
      || !age.provenance.sourceId.trim()
      || age.provenance.sourceId !== age.provenance.sourceId.trim()
      || age.provenance.originalValue !== age.value
      || age.provenance.originalUnit !== age.unit
      || Date.parse(age.observedAt) > Date.parse(request.requestedAt)) {
      throw new ClinicalPhenoAgeAdapterError('provenance_incomplete');
    }
  }

  const entries = new Map<string, LegacyClinicalPhenoAgeEntry>();
  Object.entries(LAB_INPUT_TO_BIOMARKER_ID).forEach(([inputId, biomarkerId]) => {
    const observation = byInputId.get(inputId as ClinicalPhenoAgeInputId);
    if (!observation) return;
    const provenance = observation.provenance;
    if (provenance.sourceType !== 'laboratory'
      || typeof provenance.sourceId !== 'string'
      || !provenance.sourceId.trim()
      || provenance.sourceId !== provenance.sourceId.trim()
      || typeof provenance.originalValue !== 'number'
      || !Number.isFinite(provenance.originalValue)
      || typeof provenance.originalUnit !== 'string'
      || !provenance.originalUnit.trim()
      || typeof observation.unit !== 'string'
      || !observation.unit.trim()
      || provenance.originalValue !== observation.value
      || provenance.originalUnit !== observation.unit) {
      throw new ClinicalPhenoAgeAdapterError('provenance_incomplete');
    }
    entries.set(biomarkerId, Object.freeze({
      id: observation.observationId,
      biomarkerId,
      value: observation.value as number,
      unit: observation.unit,
      reportedValue: provenance.originalValue,
      reportedUnit: provenance.originalUnit,
      date: observation.observedAt as string,
      source: provenance.sourceId,
      notes: '',
    }));
  });

  return Object.freeze({ request, chronologicalAgeObservation: age, entries });
}

function scientificReasons(evaluation: ClinicalPhenoAgeProductEvaluation): readonly ScientificReason[] {
  const issues = evaluation.eligibility.blockingIssues;
  if (issues.length > 0) {
    return issues.map(issue => ({
      code: issue.code,
      severity: issue.severity,
      explanation: issue.message,
      evidenceReferenceIds: [...evaluation.eligibility.evidenceSource],
    }));
  }
  if (evaluation.failure !== null) {
    return [{
      code: evaluation.failure.code,
      severity: 'blocking',
      explanation: evaluation.failure.detail,
      evidenceReferenceIds: [...evaluation.eligibility.evidenceSource],
    }];
  }
  return [];
}

function scientificWarnings(evaluation: ClinicalPhenoAgeProductEvaluation): readonly ScientificWarning[] {
  const eligibilityWarnings = evaluation.eligibility.warnings.map(warning => ({
    code: warning.code,
    severity: warning.severity,
    explanation: warning.message,
    reasonCodes: [warning.code],
  }));
  const resultWarnings = evaluation.scientificResult?.warnings.map(warning => ({
    code: warning,
    severity: 'warning',
    explanation: warning,
    reasonCodes: [],
  })) ?? [];
  return [...eligibilityWarnings, ...resultWarnings];
}

function scientificEvidence(
  evaluation: ClinicalPhenoAgeProductEvaluation,
): readonly ScientificEvidenceReference[] {
  const calculationIds = new Set(
    evaluation.scientificResult?.evidenceReferences.map(reference => reference.id) ?? [],
  );
  const ids = [...new Set([
    ...evaluation.eligibility.evidenceSource,
    ...calculationIds,
  ])];
  return ids.map(referenceId => {
    const reference = SCIENTIFIC_EVIDENCE.find(candidate => candidate.id === referenceId);
    if (!reference) throw new ClinicalPhenoAgeAdapterError('scientific_result_mismatch');
    return {
      referenceId: reference.id,
      citation: `${reference.authors}. ${reference.title}. ${reference.journal}. ${reference.year}. DOI: ${reference.doi}.`,
      sourceUrl: reference.url,
      publicationDate: null,
      accessedOn: null,
      role: calculationIds.has(reference.id)
        ? 'calculation_model_evidence'
        : 'eligibility_evidence',
    };
  });
}

function assertAvailableResultMatchesRequest(
  request: ScientificEvaluationRequest,
  evaluation: ClinicalPhenoAgeProductEvaluation,
): void {
  const result = evaluation.scientificResult;
  if (evaluation.status !== 'available' || result === null) return;
  if (result.inputSnapshot.length !== request.observations.length) {
    throw new ClinicalPhenoAgeAdapterError('scientific_result_mismatch');
  }
  result.inputSnapshot.forEach(input => {
    const observation = request.observations.find(candidate => (
      candidate.measurementId === input.id
    ));
    if (!observation
      || observation.observationId !== input.measurementId) {
      throw new ClinicalPhenoAgeAdapterError('scientific_result_mismatch');
    }
  });
}

function validateIdentity(identity: ClinicalPhenoAgeEvaluationIdentity): void {
  if (!isRecord(identity)
    || !hasExactKeys(identity, ['snapshotId', 'evaluationId'])
    || typeof identity.snapshotId !== 'string'
    || !identity.snapshotId.trim()
    || typeof identity.evaluationId !== 'string'
    || !identity.evaluationId.trim()) {
    throw new ClinicalPhenoAgeAdapterError('invalid_result_identity');
  }
}

function buildResult(
  request: ScientificEvaluationRequest,
  evaluation: ClinicalPhenoAgeProductEvaluation,
  identity: ClinicalPhenoAgeEvaluationIdentity,
): ScientificEvaluationResult {
  const scientificResult = evaluation.scientificResult;
  const reasons = scientificReasons(evaluation);
  const status = scientificResult === null
    ? {
      code: evaluation.status,
      authority: 'scientific_domain' as const,
      reasons,
    }
    : {
      code: scientificResult.calculationStatus,
      authority: 'scientific_domain' as const,
      reasons: [] as readonly ScientificReason[],
    };
  const observationIds = request.observations.map(observation => observation.observationId);
  const measurementBase = scientificResult === null ? null : {
    unit: 'years',
    observedAt: scientificResult.calculatedAt,
    methodId: scientificResult.modelId,
    methodVersion: scientificResult.modelVersion,
    status,
    limitations: [...scientificResult.limitations],
    metadata: toScientificJsonObject({
      calculationStatus: scientificResult.calculationStatus,
      coefficientVersion: scientificResult.coefficientVersion,
      normalizationVersion: scientificResult.normalizationVersion,
      implementationVersion: scientificResult.implementationVersion,
      precision: scientificResult.precision,
      formulaProvenance: scientificResult.formulaProvenance,
    }),
  } as const;
  const measurements = scientificResult === null || measurementBase === null ? [] : [
    {
      ...measurementBase,
      measurementId: 'phenotypicAgeYears',
      value: scientificResult.phenotypicAgeYears,
      sourceObservationIds: observationIds,
    },
    {
      ...measurementBase,
      measurementId: 'chronologicalAgeYears',
      value: scientificResult.chronologicalAgeYears,
      sourceObservationIds: request.observations
        .filter(observation => observation.measurementId === 'chronological_age')
        .map(observation => observation.observationId),
    },
    {
      ...measurementBase,
      measurementId: 'ageDifferenceYears',
      value: scientificResult.ageDifferenceYears,
      sourceObservationIds: observationIds,
    },
  ];
  const blockedOutputIds = scientificResult === null ? [...AUTHORIZED_OUTPUT_IDS] : [];
  const blockedOutputs = blockedOutputIds.map(outputId => ({ outputId, reasons }));
  const reasonCodes = [...new Set([
    ...reasons.map(reason => reason.code),
    ...evaluation.eligibility.warnings.map(warning => warning.code),
  ])];

  return {
    contractVersion: SCIENTIFIC_EVALUATION_RESULT_VERSION,
    requestId: request.requestId,
    snapshotId: identity.snapshotId,
    domainId: 'clinical_biological_age',
    domainVersion: CLINICAL_PHENOAGE_PRODUCTION_DOMAIN_VERSION,
    evaluatedAt: scientificResult?.calculatedAt ?? evaluation.evaluatedAt,
    status,
    measurements,
    interpretations: [],
    blockedOutputs,
    warnings: scientificWarnings(evaluation),
    evidence: scientificEvidence(evaluation),
    auditMetadata: {
      evaluationId: identity.evaluationId,
      evaluatorId: CLINICAL_PHENOAGE_PRODUCTION_ADAPTER_ID,
      evaluatorVersion: CLINICAL_PHENOAGE_PRODUCTION_ADAPTER_VERSION,
      requestContractVersion: SCIENTIFIC_EVALUATION_REQUEST_VERSION,
      resultContractVersion: SCIENTIFIC_EVALUATION_RESULT_VERSION,
      domainVersion: CLINICAL_PHENOAGE_PRODUCTION_DOMAIN_VERSION,
      inputObservationIds: observationIds,
      authorizedOutputIds: scientificResult === null ? [] : [...AUTHORIZED_OUTPUT_IDS],
      blockedOutputIds,
      reasonCodes,
      inputFingerprint: scientificResult?.inputSnapshotHash ?? null,
      outputFingerprint: null,
      domainAudit: toScientificJsonObject({
        clinicalPhenoAgeEvaluation: evaluation,
      }),
    },
    confidence: {
      code: evaluation.eligibility.confidence,
      registryId: null,
      registryVersion: null,
      limitations: [...evaluation.eligibility.scientificNotes],
    },
    provenanceSummary: {
      sourceIds: [...new Set(request.observations.flatMap(observation => (
        observation.provenance.sourceId === null ? [] : [observation.provenance.sourceId]
      )))],
      sourceTypes: [...new Set(request.observations.map(
        observation => observation.provenance.sourceType,
      ))],
      verificationStatuses: [...new Set(request.observations.map(
        observation => observation.provenance.verificationStatus,
      ))],
      completeness: 'unknown',
      limitations: [
        'Aggregate provenance completeness is not authored by the Clinical PhenoAge runtime.',
      ],
    },
    safetyCandidate: null,
    trendStatus: null,
    limitations: [...evaluation.limitations],
  };
}

export function createClinicalPhenoAgeEvaluationRequest(
  input: ClinicalPhenoAgeEvaluationRequestInput,
): ScientificEvaluationRequest {
  const request: ScientificEvaluationRequest = {
    contractVersion: SCIENTIFIC_EVALUATION_REQUEST_VERSION,
    requestId: input.requestId,
    domainId: 'clinical_biological_age',
    requestedDomainVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
    requestedAt: input.requestedAt,
    observations: input.observations,
    context: {},
    priorSnapshot: null,
  };
  const canonical = canonicalizeRequest(request);
  validateClinicalPhenoAgeRequest(canonical);
  return canonical;
}

export class ClinicalPhenoAgeProductionAdapter implements ScientificDomainProductionPort {
  readonly domainId = 'clinical_biological_age' as const;
  readonly contractVersion = SCIENTIFIC_PRODUCTION_CONTRACT_VERSION;
  readonly domainVersion = CLINICAL_PHENOAGE_PRODUCTION_DOMAIN_VERSION;

  constructor(private readonly identityProvider: ClinicalPhenoAgeEvaluationIdentityProvider) {}

  async evaluate(request: ScientificEvaluationRequest): Promise<ScientificEvaluationResult> {
    const canonical = canonicalizeRequest(request);
    const validated = validateClinicalPhenoAgeRequest(canonical);
    const identity = this.identityProvider.create(canonical);
    validateIdentity(identity);
    const evaluation = evaluateClinicalPhenoAgeForProduct(
      validated.chronologicalAgeObservation === null
        ? null
        : validated.chronologicalAgeObservation.value,
      validated.entries,
      new Date(canonical.requestedAt),
      validated.chronologicalAgeObservation === null ? undefined : {
        chronologicalAgeMeasurementId: validated.chronologicalAgeObservation.observationId,
        chronologicalAgeMeasuredAt: validated.chronologicalAgeObservation.observedAt,
      },
    );
    assertAvailableResultMatchesRequest(canonical, evaluation);
    const result = buildResult(canonical, evaluation, identity);
    return deserializeScientificEvaluationResult(serializeScientificEvaluationResult(result));
  }
}
