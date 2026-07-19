export const SCIENTIFIC_PRODUCTION_CONTRACT_VERSION = 'scientific-production-contract/1.0.0' as const;
export const SCIENTIFIC_EVALUATION_REQUEST_VERSION = 'scientific-evaluation-request/1.0.0' as const;
export const SCIENTIFIC_EVALUATION_RESULT_VERSION = 'scientific-evaluation-result/1.0.0' as const;

export type ScientificDomainId =
  | 'clinical_biological_age'
  | 'cardiorespiratory_fitness'
  | 'functional_capacity'
  | 'cardiometabolic_health';

export type ScientificJsonPrimitive = string | number | boolean | null;
export type ScientificJsonValue =
  | ScientificJsonPrimitive
  | ScientificJsonObject
  | readonly ScientificJsonValue[];

export interface ScientificJsonObject {
  readonly [key: string]: ScientificJsonValue;
}

export type ScientificScalar = string | number | boolean | null;

export interface ScientificEvidenceReference {
  readonly referenceId: string;
  readonly citation: string;
  readonly sourceUrl: string | null;
  readonly publicationDate: string | null;
  readonly accessedOn: string | null;
  readonly role: string;
}

export interface ScientificReason {
  readonly code: string;
  readonly severity: string;
  readonly explanation: string;
  readonly evidenceReferenceIds: readonly string[];
}

export interface ScientificWarning {
  readonly code: string;
  readonly severity: string;
  readonly explanation: string;
  readonly reasonCodes: readonly string[];
}

export interface ScientificStatus {
  /** Opaque, authoritative status supplied by the scientific domain. */
  readonly code: string;
  readonly authority: 'scientific_domain';
  readonly reasons: readonly ScientificReason[];
}

export interface ScientificProvenance {
  readonly sourceId: string | null;
  readonly sourceRecordId: string | null;
  readonly sourceType: string;
  readonly verificationStatus: string;
  readonly provider: ScientificJsonObject;
  readonly originalUnit: string | null;
  readonly originalValue: ScientificScalar;
  readonly metadata: ScientificJsonObject;
}

export interface ScientificObservation {
  readonly observationId: string;
  readonly measurementId: string;
  readonly value: ScientificScalar;
  readonly unit: string | null;
  readonly observedAt: string | null;
  readonly provenance: ScientificProvenance;
  readonly context: ScientificJsonObject;
}

export interface ScientificMeasurement {
  readonly measurementId: string;
  readonly value: ScientificScalar;
  readonly unit: string | null;
  readonly observedAt: string | null;
  readonly sourceObservationIds: readonly string[];
  readonly methodId: string | null;
  readonly methodVersion: string | null;
  readonly status: ScientificStatus;
  readonly limitations: readonly string[];
  readonly metadata: ScientificJsonObject;
}

export interface ScientificInterpretation {
  readonly interpretationId: string;
  readonly code: string;
  readonly statement: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly reasonCodes: readonly string[];
  readonly evidenceReferenceIds: readonly string[];
  readonly limitations: readonly string[];
}

export interface ScientificBlockedOutput {
  readonly outputId: string;
  readonly reasons: readonly ScientificReason[];
}

export interface ScientificConfidence {
  /** Opaque confidence identity supplied by the scientific domain. */
  readonly code: string;
  readonly registryId: string | null;
  readonly registryVersion: string | null;
  readonly limitations: readonly string[];
}

export interface ScientificProvenanceSummary {
  readonly sourceIds: readonly string[];
  readonly sourceTypes: readonly string[];
  readonly verificationStatuses: readonly string[];
  readonly completeness: string;
  readonly limitations: readonly string[];
}

export interface ScientificSafetyCandidate {
  readonly status: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly reasonCodes: readonly string[];
  readonly clinicianReviewCandidate: boolean;
  /** Phase 8.0A does not authorize a production action from a safety candidate. */
  readonly productionActionAuthorized: false;
}

export interface ScientificTrendStatus {
  readonly code: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly comparable: boolean | null;
  readonly reasonCodes: readonly string[];
  readonly limitations: readonly string[];
}

export interface ScientificDomainComponentVersion {
  readonly componentId: string;
  readonly version: string;
}

export interface ScientificDomainVersion {
  readonly domainId: ScientificDomainId;
  readonly scientificSpecificationVersion: string;
  readonly componentVersions: readonly ScientificDomainComponentVersion[];
}

export interface ScientificAuditMetadata {
  readonly evaluationId: string;
  readonly evaluatorId: string;
  readonly evaluatorVersion: string;
  readonly requestContractVersion: string;
  readonly resultContractVersion: string;
  readonly domainVersion: ScientificDomainVersion;
  readonly inputObservationIds: readonly string[];
  readonly authorizedOutputIds: readonly string[];
  readonly blockedOutputIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly inputFingerprint: string | null;
  readonly outputFingerprint: string | null;
  readonly domainAudit: ScientificJsonObject;
}

export interface ScientificEvaluationRequest {
  readonly contractVersion: typeof SCIENTIFIC_EVALUATION_REQUEST_VERSION;
  readonly requestId: string;
  readonly domainId: ScientificDomainId;
  readonly requestedDomainVersion: string | null;
  readonly requestedAt: string;
  readonly observations: readonly ScientificObservation[];
  readonly context: ScientificJsonObject;
  readonly priorSnapshot: ScientificSnapshot | null;
}

export interface ScientificAuthoritativeOutput {
  readonly contractVersion: typeof SCIENTIFIC_EVALUATION_RESULT_VERSION;
  readonly snapshotId: string;
  readonly domainId: ScientificDomainId;
  readonly domainVersion: ScientificDomainVersion;
  readonly evaluatedAt: string;
  readonly status: ScientificStatus;
  readonly measurements: readonly ScientificMeasurement[];
  readonly interpretations: readonly ScientificInterpretation[];
  readonly blockedOutputs: readonly ScientificBlockedOutput[];
  readonly warnings: readonly ScientificWarning[];
  readonly evidence: readonly ScientificEvidenceReference[];
  readonly auditMetadata: ScientificAuditMetadata;
  readonly confidence: ScientificConfidence;
  readonly provenanceSummary: ScientificProvenanceSummary;
  readonly safetyCandidate: ScientificSafetyCandidate | null;
  readonly trendStatus: ScientificTrendStatus | null;
  readonly limitations: readonly string[];
}

export interface ScientificSnapshot extends ScientificAuthoritativeOutput {}

export interface ScientificEvaluationResult extends ScientificAuthoritativeOutput {
  readonly requestId: string;
}

export interface ScientificDomainProductionPort {
  readonly domainId: ScientificDomainId;
  readonly contractVersion: typeof SCIENTIFIC_PRODUCTION_CONTRACT_VERSION;
  readonly domainVersion: ScientificDomainVersion;
  evaluate(request: ScientificEvaluationRequest): Promise<ScientificEvaluationResult>;
}

export type ScientificProductionDomainPorts = Readonly<
  Record<ScientificDomainId, ScientificDomainProductionPort>
>;

export const SCIENTIFIC_EVALUATION_REQUEST_FIELDS = Object.freeze([
  'contractVersion',
  'requestId',
  'domainId',
  'requestedDomainVersion',
  'requestedAt',
  'observations',
  'context',
  'priorSnapshot',
] as const satisfies readonly (keyof ScientificEvaluationRequest)[]);

export type ScientificEvaluationRequestField =
  (typeof SCIENTIFIC_EVALUATION_REQUEST_FIELDS)[number];

export const SCIENTIFIC_EVALUATION_RESULT_FIELDS = Object.freeze([
  'contractVersion',
  'requestId',
  'snapshotId',
  'domainId',
  'domainVersion',
  'evaluatedAt',
  'status',
  'measurements',
  'interpretations',
  'blockedOutputs',
  'warnings',
  'evidence',
  'auditMetadata',
  'confidence',
  'provenanceSummary',
  'safetyCandidate',
  'trendStatus',
  'limitations',
] as const satisfies readonly (keyof ScientificEvaluationResult)[]);

export type ScientificEvaluationResultField =
  (typeof SCIENTIFIC_EVALUATION_RESULT_FIELDS)[number];
