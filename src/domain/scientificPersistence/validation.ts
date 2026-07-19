import type {
  ScientificEvaluationRequest,
  ScientificEvaluationResult,
} from '../scientificProduction';
import type {
  PersistenceAudit,
  PersistenceEnvelope,
  PersistenceLineage,
  PersistenceMetadata,
  ValidatedPersistenceInput,
  ValidationOutcome,
} from './contracts';

type ValidationIssue = ValidationOutcome['issues'][number];
type ValidationPhase = ValidationOutcome['validationPhase'];

const METADATA_FIELDS = Object.freeze([
  'contractVersion',
  'implementationId',
  'implementationVersion',
  'schemaVersion',
  'modelVersion',
] as const);

const LINEAGE_REQUIRED_FIELDS = Object.freeze(['contractVersion'] as const);
const LINEAGE_OPTIONAL_FIELDS = Object.freeze(['parentPersistenceId'] as const);

const AUDIT_FIELDS = Object.freeze([
  'contractVersion',
  'boundaryVersion',
  'validationVersion',
  'inputContractVersion',
  'requestContractVersion',
  'resultContractVersion',
  'validationStatus',
  'validationIssueCodes',
] as const);

const ENVELOPE_FIELDS = Object.freeze([
  'contractVersion',
  'input',
  'metadata',
  'lineage',
  'audit',
] as const);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, field);
}

function hasExactFields(
  value: Record<string, unknown>,
  requiredFields: readonly string[],
  optionalFields: readonly string[] = [],
): boolean {
  if (requiredFields.some(field => !hasOwn(value, field))) return false;
  const allowedFields = new Set([...requiredFields, ...optionalFields]);
  return Object.keys(value).every(field => allowedFields.has(field));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validationIssue(
  code: ValidationIssue['code'],
  path: string | null,
  message: string,
): ValidationIssue {
  return Object.freeze({ code, path, message });
}

function validationOutcome(
  validationPhase: ValidationPhase,
  issues: readonly ValidationIssue[],
  validatedInput: ValidatedPersistenceInput | null,
): ValidationOutcome {
  const frozenIssues = Object.freeze([...issues]);
  return Object.freeze({
    validationVersion: 'scientific-persistence-validation/1.0.0',
    validationPhase,
    valid: frozenIssues.length === 0,
    issues: frozenIssues,
    validatedInput,
  });
}

export function preConstructionValidation(
  request: ScientificEvaluationRequest,
  result: ScientificEvaluationResult,
): ValidationOutcome {
  const issues: ValidationIssue[] = [];
  const requestRecord = isRecord(request) ? request : null;
  const resultRecord = isRecord(result) ? result : null;

  if (requestRecord === null) {
    issues.push(validationIssue(
      'missing_request',
      'request',
      'ScientificEvaluationRequest is required for persistence relationship validation.',
    ));
  }

  if (resultRecord === null) {
    issues.push(validationIssue(
      'missing_result',
      'result',
      'ScientificEvaluationResult is required for persistence relationship validation.',
    ));
  }

  if (requestRecord !== null && resultRecord !== null) {
    if (requestRecord.requestId !== resultRecord.requestId) {
      issues.push(validationIssue(
        'request_id_mismatch',
        'result.requestId',
        'Result requestId must match the persistence request requestId.',
      ));
    }

    if (requestRecord.domainId !== resultRecord.domainId) {
      issues.push(validationIssue(
        'domain_id_mismatch',
        'result.domainId',
        'Result domainId must match the persistence request domainId.',
      ));
    }

    const domainVersion = isRecord(resultRecord.domainVersion)
      ? resultRecord.domainVersion
      : null;
    if (domainVersion === null || domainVersion.domainId !== resultRecord.domainId) {
      issues.push(validationIssue(
        'result_domain_version_mismatch',
        'result.domainVersion.domainId',
        'Result domainVersion domainId must match the result domainId.',
      ));
    }
  }

  if (issues.length > 0) {
    return validationOutcome('pre_construction', issues, null);
  }

  const validatedInput: ValidatedPersistenceInput = Object.freeze({
    contractVersion: 'scientific-persistence-input/1.0.0',
    request,
    result,
  });

  return validationOutcome('pre_construction', issues, validatedInput);
}

function validMetadata(value: unknown): value is PersistenceMetadata {
  if (!isRecord(value) || !hasExactFields(value, METADATA_FIELDS)) return false;
  return value.contractVersion === 'scientific-persistence-metadata/1.0.0'
    && isNonEmptyString(value.implementationId)
    && isNonEmptyString(value.implementationVersion)
    && isNonEmptyString(value.schemaVersion)
    && isNonEmptyString(value.modelVersion)
    && Object.isFrozen(value);
}

function validLineage(value: unknown): value is PersistenceLineage {
  if (!isRecord(value)
    || !hasExactFields(value, LINEAGE_REQUIRED_FIELDS, LINEAGE_OPTIONAL_FIELDS)
    || value.contractVersion !== 'scientific-persistence-lineage/1.0.0'
    || !Object.isFrozen(value)) {
    return false;
  }
  return !hasOwn(value, 'parentPersistenceId') || isNonEmptyString(value.parentPersistenceId);
}

function validAudit(
  value: unknown,
  envelopeInput: unknown,
): value is PersistenceAudit {
  if (!isRecord(value)
    || !hasExactFields(value, AUDIT_FIELDS)
    || value.contractVersion !== 'scientific-persistence-audit/1.0.0'
    || value.boundaryVersion !== 'scientific-persistence-boundary/1.0.0'
    || value.validationVersion !== 'scientific-persistence-validation/1.0.0'
    || value.inputContractVersion !== 'scientific-persistence-input/1.0.0'
    || value.validationStatus !== 'passed'
    || !Array.isArray(value.validationIssueCodes)
    || value.validationIssueCodes.length !== 0
    || !Object.isFrozen(value)
    || !Object.isFrozen(value.validationIssueCodes)) {
    return false;
  }

  if (!isRecord(envelopeInput)
    || value.inputContractVersion !== envelopeInput.contractVersion
    || !isRecord(envelopeInput.request)
    || !isRecord(envelopeInput.result)) {
    return false;
  }

  return value.requestContractVersion === envelopeInput.request.contractVersion
    && value.resultContractVersion === envelopeInput.result.contractVersion;
}

function validEnvelope(
  value: unknown,
  audit: PersistenceAudit,
  metadataValid: boolean,
  lineageValid: boolean,
  auditValid: boolean,
): value is PersistenceEnvelope {
  if (!isRecord(value)
    || !hasExactFields(value, ENVELOPE_FIELDS)
    || value.contractVersion !== 'scientific-persistence-envelope/1.0.0'
    || !isRecord(value.input)
    || value.input.contractVersion !== 'scientific-persistence-input/1.0.0'
    || !Object.isFrozen(value.input)
    || value.audit !== audit
    || !metadataValid
    || !lineageValid
    || !auditValid
    || !Object.isFrozen(value)) {
    return false;
  }
  return true;
}

export function postConstructionValidation(
  audit: PersistenceAudit,
  envelope: PersistenceEnvelope,
): ValidationOutcome {
  const issues: ValidationIssue[] = [];
  const envelopeRecord = isRecord(envelope) ? envelope : null;
  const metadata = envelopeRecord?.metadata;
  const lineage = envelopeRecord?.lineage;
  const envelopeInput = envelopeRecord?.input;

  const metadataPresent = metadata !== null && metadata !== undefined;
  const metadataIsValid = validMetadata(metadata);
  if (!metadataPresent) {
    issues.push(validationIssue(
      'missing_persistence_metadata',
      'envelope.metadata',
      'PersistenceEnvelope requires PersistenceMetadata.',
    ));
  } else if (!metadataIsValid) {
    issues.push(validationIssue(
      'invalid_persistence_metadata',
      'envelope.metadata',
      'PersistenceMetadata is incomplete or violates its persistence structural contract.',
    ));
  }

  const lineagePresent = lineage !== null && lineage !== undefined;
  const lineageIsValid = validLineage(lineage);
  if (!lineagePresent) {
    issues.push(validationIssue(
      'missing_persistence_lineage',
      'envelope.lineage',
      'PersistenceEnvelope requires PersistenceLineage.',
    ));
  } else if (!lineageIsValid) {
    issues.push(validationIssue(
      'invalid_persistence_lineage',
      'envelope.lineage',
      'PersistenceLineage is incomplete or violates its persistence structural contract.',
    ));
  }

  const auditIsValid = validAudit(audit, envelopeInput);
  if (!auditIsValid) {
    issues.push(validationIssue(
      'invalid_persistence_audit',
      'audit',
      'PersistenceAudit is incomplete or inconsistent with the constructed persistence input.',
    ));
  }

  const envelopeIsValid = validEnvelope(
    envelope,
    audit,
    metadataIsValid,
    lineageIsValid,
    auditIsValid,
  );
  if (!envelopeIsValid) {
    issues.push(validationIssue(
      'invalid_persistence_envelope',
      'envelope',
      'PersistenceEnvelope is incomplete or violates its persistence structural invariants.',
    ));
  }

  const validatedInput = envelopeRecord !== null && isRecord(envelopeRecord.input)
    ? envelopeRecord.input as unknown as ValidatedPersistenceInput
    : null;

  return validationOutcome('post_construction', issues, validatedInput);
}
