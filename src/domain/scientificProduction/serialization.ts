import {
  SCIENTIFIC_EVALUATION_REQUEST_FIELDS,
  SCIENTIFIC_EVALUATION_REQUEST_VERSION,
  SCIENTIFIC_EVALUATION_RESULT_FIELDS,
  SCIENTIFIC_EVALUATION_RESULT_VERSION,
  type ScientificDomainId,
  type ScientificEvaluationRequest,
  type ScientificEvaluationResult,
} from './contracts';

export type ScientificContractIssueCode =
  | 'not_an_object'
  | 'missing_field'
  | 'unexpected_field'
  | 'invalid_field_type'
  | 'empty_identifier'
  | 'unknown_domain'
  | 'version_mismatch'
  | 'audit_identity_mismatch'
  | 'not_json_safe'
  | 'invalid_json';

export interface ScientificContractIssue {
  readonly code: ScientificContractIssueCode;
  readonly path: string;
  readonly message: string;
}

export interface ScientificContractValidation {
  readonly valid: boolean;
  readonly issues: readonly ScientificContractIssue[];
}

export class ScientificContractError extends Error {
  readonly issues: readonly ScientificContractIssue[];

  constructor(message: string, issues: readonly ScientificContractIssue[]) {
    super(message);
    this.name = 'ScientificContractError';
    this.issues = issues;
  }
}

const DOMAIN_IDS = Object.freeze([
  'clinical_biological_age',
  'cardiorespiratory_fitness',
  'functional_capacity',
  'cardiometabolic_health',
] as const satisfies readonly ScientificDomainId[]);

const ARRAY_FIELDS = Object.freeze([
  'measurements',
  'interpretations',
  'blockedOutputs',
  'warnings',
  'evidence',
  'limitations',
] as const);

const OBJECT_FIELDS = Object.freeze([
  'domainVersion',
  'status',
  'auditMetadata',
  'confidence',
  'provenanceSummary',
] as const);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function issue(
  code: ScientificContractIssueCode,
  path: string,
  message: string,
): ScientificContractIssue {
  return { code, path, message };
}

function validateExactFields(
  value: Record<string, unknown>,
  requiredFields: readonly string[],
  path: string,
  issues: ScientificContractIssue[],
): void {
  const required = new Set(requiredFields);
  requiredFields.forEach(field => {
    if (!Object.prototype.hasOwnProperty.call(value, field)) {
      issues.push(issue('missing_field', `${path}.${field}`, `Required field ${field} is missing.`));
    }
  });
  Object.keys(value).forEach(field => {
    if (!required.has(field)) {
      issues.push(issue('unexpected_field', `${path}.${field}`, `Field ${field} is not part of the contract.`));
    }
  });
}

function requireNestedFields(
  value: Record<string, unknown>,
  fields: readonly string[],
  path: string,
  issues: ScientificContractIssue[],
): void {
  fields.forEach(field => {
    if (!Object.prototype.hasOwnProperty.call(value, field)) {
      issues.push(issue('missing_field', `${path}.${field}`, `Required field ${field} is missing.`));
    }
  });
}

function collectJsonSafetyIssues(
  value: unknown,
  path: string,
  seen: Set<object>,
  issues: ScientificContractIssue[],
): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      issues.push(issue('not_json_safe', path, 'Scientific contract numbers must be finite.'));
    }
    return;
  }
  if (typeof value !== 'object') {
    issues.push(issue('not_json_safe', path, `Unsupported JSON value type: ${typeof value}.`));
    return;
  }
  if (seen.has(value)) {
    issues.push(issue('not_json_safe', path, 'Circular values are not supported.'));
    return;
  }
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectJsonSafetyIssues(item, `${path}[${index}]`, seen, issues));
  } else {
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
      issues.push(issue('not_json_safe', path, 'Only plain JSON objects are supported.'));
    }
    Object.entries(value).forEach(([key, item]) => {
      collectJsonSafetyIssues(item, `${path}.${key}`, seen, issues);
    });
  }
  seen.delete(value);
}

export function validateScientificEvaluationRequestContract(
  value: unknown,
): ScientificContractValidation {
  const issues: ScientificContractIssue[] = [];
  if (!isRecord(value)) {
    return Object.freeze({
      valid: false,
      issues: Object.freeze([issue('not_an_object', '$', 'Evaluation request must be an object.')]),
    });
  }

  validateExactFields(value, SCIENTIFIC_EVALUATION_REQUEST_FIELDS, '$', issues);
  ['contractVersion', 'requestId', 'domainId', 'requestedAt'].forEach(field => {
    const fieldValue = value[field];
    if (typeof fieldValue !== 'string') {
      issues.push(issue('invalid_field_type', `$.${field}`, `${field} must be a string.`));
    } else if (!fieldValue.trim()) {
      issues.push(issue('empty_identifier', `$.${field}`, `${field} must not be empty.`));
    }
  });
  if (value.requestedDomainVersion !== null && typeof value.requestedDomainVersion !== 'string') {
    issues.push(issue(
      'invalid_field_type',
      '$.requestedDomainVersion',
      'requestedDomainVersion must be a string or null.',
    ));
  }
  if (!Array.isArray(value.observations)) {
    issues.push(issue('invalid_field_type', '$.observations', 'observations must be an array.'));
  }
  if (!isRecord(value.context)) {
    issues.push(issue('invalid_field_type', '$.context', 'context must be an object.'));
  }
  if (value.priorSnapshot !== null && !isRecord(value.priorSnapshot)) {
    issues.push(issue('invalid_field_type', '$.priorSnapshot', 'priorSnapshot must be an object or null.'));
  }
  if (typeof value.domainId === 'string' && !DOMAIN_IDS.includes(value.domainId as ScientificDomainId)) {
    issues.push(issue('unknown_domain', '$.domainId', `Unknown scientific domain: ${value.domainId}.`));
  }
  if (value.contractVersion !== SCIENTIFIC_EVALUATION_REQUEST_VERSION) {
    issues.push(issue('version_mismatch', '$.contractVersion', 'Unsupported request contract version.'));
  }
  collectJsonSafetyIssues(value, '$', new Set<object>(), issues);
  return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) });
}

export function validateScientificEvaluationResultContract(
  value: unknown,
): ScientificContractValidation {
  const issues: ScientificContractIssue[] = [];
  if (!isRecord(value)) {
    return Object.freeze({
      valid: false,
      issues: Object.freeze([issue('not_an_object', '$', 'Evaluation result must be an object.')]),
    });
  }

  validateExactFields(value, SCIENTIFIC_EVALUATION_RESULT_FIELDS, '$', issues);

  ['contractVersion', 'requestId', 'snapshotId', 'domainId', 'evaluatedAt'].forEach(field => {
    const fieldValue = value[field];
    if (typeof fieldValue !== 'string') {
      issues.push(issue('invalid_field_type', `$.${field}`, `${field} must be a string.`));
    } else if (!fieldValue.trim()) {
      issues.push(issue('empty_identifier', `$.${field}`, `${field} must not be empty.`));
    }
  });
  ARRAY_FIELDS.forEach(field => {
    if (!Array.isArray(value[field])) {
      issues.push(issue('invalid_field_type', `$.${field}`, `${field} must be an array.`));
    }
  });
  OBJECT_FIELDS.forEach(field => {
    if (!isRecord(value[field])) {
      issues.push(issue('invalid_field_type', `$.${field}`, `${field} must be an object.`));
    }
  });
  if (value.safetyCandidate !== null && !isRecord(value.safetyCandidate)) {
    issues.push(issue('invalid_field_type', '$.safetyCandidate', 'safetyCandidate must be an object or null.'));
  }
  if (value.trendStatus !== null && !isRecord(value.trendStatus)) {
    issues.push(issue('invalid_field_type', '$.trendStatus', 'trendStatus must be an object or null.'));
  }
  if (isRecord(value.domainVersion)) {
    requireNestedFields(
      value.domainVersion,
      ['domainId', 'scientificSpecificationVersion', 'componentVersions'],
      '$.domainVersion',
      issues,
    );
  }
  if (isRecord(value.status)) {
    requireNestedFields(value.status, ['code', 'authority', 'reasons'], '$.status', issues);
    if (value.status.authority !== 'scientific_domain') {
      issues.push(issue(
        'audit_identity_mismatch',
        '$.status.authority',
        'Status authority must be the scientific domain.',
      ));
    }
  }
  if (isRecord(value.confidence)) {
    requireNestedFields(
      value.confidence,
      ['code', 'registryId', 'registryVersion', 'limitations'],
      '$.confidence',
      issues,
    );
  }
  if (isRecord(value.provenanceSummary)) {
    requireNestedFields(
      value.provenanceSummary,
      ['sourceIds', 'sourceTypes', 'verificationStatuses', 'completeness', 'limitations'],
      '$.provenanceSummary',
      issues,
    );
  }
  if (isRecord(value.safetyCandidate)) {
    requireNestedFields(
      value.safetyCandidate,
      [
        'status',
        'policyId',
        'policyVersion',
        'reasonCodes',
        'clinicianReviewCandidate',
        'productionActionAuthorized',
      ],
      '$.safetyCandidate',
      issues,
    );
    if (value.safetyCandidate.productionActionAuthorized !== false) {
      issues.push(issue(
        'audit_identity_mismatch',
        '$.safetyCandidate.productionActionAuthorized',
        'Safety candidates cannot authorize production action in Phase 8.0A.',
      ));
    }
  }
  if (typeof value.domainId === 'string' && !DOMAIN_IDS.includes(value.domainId as ScientificDomainId)) {
    issues.push(issue('unknown_domain', '$.domainId', `Unknown scientific domain: ${value.domainId}.`));
  }
  if (value.contractVersion !== SCIENTIFIC_EVALUATION_RESULT_VERSION) {
    issues.push(issue('version_mismatch', '$.contractVersion', 'Unsupported result contract version.'));
  }

  if (isRecord(value.domainVersion) && value.domainVersion.domainId !== value.domainId) {
    issues.push(issue('audit_identity_mismatch', '$.domainVersion.domainId', 'Domain version identity must match the result.'));
  }
  if (isRecord(value.auditMetadata)) {
    requireNestedFields(
      value.auditMetadata,
      [
        'evaluationId',
        'evaluatorId',
        'evaluatorVersion',
        'requestContractVersion',
        'resultContractVersion',
        'domainVersion',
        'inputObservationIds',
        'authorizedOutputIds',
        'blockedOutputIds',
        'reasonCodes',
        'inputFingerprint',
        'outputFingerprint',
        'domainAudit',
      ],
      '$.auditMetadata',
      issues,
    );
    if (value.auditMetadata.resultContractVersion !== value.contractVersion) {
      issues.push(issue('audit_identity_mismatch', '$.auditMetadata.resultContractVersion', 'Audit contract version must match the result.'));
    }
    if (isRecord(value.auditMetadata.domainVersion)
      && value.auditMetadata.domainVersion.domainId !== value.domainId) {
      issues.push(issue('audit_identity_mismatch', '$.auditMetadata.domainVersion.domainId', 'Audit domain identity must match the result.'));
    }
  }

  collectJsonSafetyIssues(value, '$', new Set<object>(), issues);
  return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) });
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(item => deepFreeze(item));
    Object.freeze(value);
  }
  return value;
}

export function serializeScientificEvaluationResult(result: ScientificEvaluationResult): string {
  const validation = validateScientificEvaluationResultContract(result);
  if (!validation.valid) {
    throw new ScientificContractError('Scientific evaluation result failed contract validation.', validation.issues);
  }
  return JSON.stringify(result);
}

export function serializeScientificEvaluationRequest(request: ScientificEvaluationRequest): string {
  const validation = validateScientificEvaluationRequestContract(request);
  if (!validation.valid) {
    throw new ScientificContractError(
      'Scientific evaluation request failed contract validation.',
      validation.issues,
    );
  }
  return JSON.stringify(request);
}

export function deserializeScientificEvaluationRequest(payload: string): ScientificEvaluationRequest {
  let value: unknown;
  try {
    value = JSON.parse(payload) as unknown;
  } catch {
    const issues = [issue('invalid_json', '$', 'Payload is not valid JSON.')];
    throw new ScientificContractError('Scientific evaluation request could not be decoded.', issues);
  }
  const validation = validateScientificEvaluationRequestContract(value);
  if (!validation.valid) {
    throw new ScientificContractError(
      'Scientific evaluation request failed contract validation.',
      validation.issues,
    );
  }
  return deepFreeze(value as ScientificEvaluationRequest);
}

export function deserializeScientificEvaluationResult(payload: string): ScientificEvaluationResult {
  let value: unknown;
  try {
    value = JSON.parse(payload) as unknown;
  } catch {
    const issues = [issue('invalid_json', '$', 'Payload is not valid JSON.')];
    throw new ScientificContractError('Scientific evaluation payload could not be decoded.', issues);
  }
  const validation = validateScientificEvaluationResultContract(value);
  if (!validation.valid) {
    throw new ScientificContractError('Scientific evaluation payload failed contract validation.', validation.issues);
  }
  return deepFreeze(value as ScientificEvaluationResult);
}
