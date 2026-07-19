import type {
  ScientificEvaluationRequest,
  ScientificEvaluationResult,
} from '../scientificProduction';

type PersistenceValidationPhase = 'pre_construction' | 'post_construction';

type PersistenceValidationIssueCode =
  | 'missing_request'
  | 'missing_result'
  | 'request_id_mismatch'
  | 'domain_id_mismatch'
  | 'result_domain_version_mismatch'
  | 'missing_persistence_metadata'
  | 'invalid_persistence_metadata'
  | 'missing_persistence_lineage'
  | 'invalid_persistence_lineage'
  | 'invalid_persistence_audit'
  | 'invalid_persistence_envelope';

interface PersistenceValidationIssue {
  readonly code: PersistenceValidationIssueCode;
  readonly path: string | null;
  readonly message: string;
}

type PersistenceResultIssueCode = PersistenceValidationIssueCode | 'port_failure';

interface PersistenceResultIssue {
  readonly code: PersistenceResultIssueCode;
  readonly path: string | null;
  readonly message: string;
}

export interface ValidationOutcome {
  readonly validationVersion: 'scientific-persistence-validation/1.0.0';
  readonly validationPhase: PersistenceValidationPhase;
  readonly valid: boolean;
  readonly issues: readonly PersistenceValidationIssue[];
  readonly validatedInput: ValidatedPersistenceInput | null;
}

export interface ValidatedPersistenceInput {
  readonly contractVersion: 'scientific-persistence-input/1.0.0';
  readonly request: ScientificEvaluationRequest;
  readonly result: ScientificEvaluationResult;
}

export interface PersistenceMetadata {
  readonly contractVersion: 'scientific-persistence-metadata/1.0.0';
  readonly implementationId: string;
  readonly implementationVersion: string;
  readonly schemaVersion: string;
  readonly modelVersion: string;
}

export interface PersistenceLineage {
  readonly contractVersion: 'scientific-persistence-lineage/1.0.0';
  readonly parentPersistenceId?: string;
}

export interface PersistenceAudit {
  readonly contractVersion: 'scientific-persistence-audit/1.0.0';
  readonly boundaryVersion: 'scientific-persistence-boundary/1.0.0';
  readonly validationVersion: 'scientific-persistence-validation/1.0.0';
  readonly inputContractVersion: ValidatedPersistenceInput['contractVersion'];
  readonly requestContractVersion: ScientificEvaluationRequest['contractVersion'];
  readonly resultContractVersion: ScientificEvaluationResult['contractVersion'];
  readonly validationStatus: 'passed';
  readonly validationIssueCodes: readonly [];
}

export interface PersistenceEnvelope {
  readonly contractVersion: 'scientific-persistence-envelope/1.0.0';
  readonly input: ValidatedPersistenceInput;
  readonly metadata: PersistenceMetadata;
  readonly lineage: PersistenceLineage;
  readonly audit: PersistenceAudit;
}

export interface PersistenceResult {
  readonly contractVersion: 'scientific-persistence-result/1.0.0';
  readonly status: 'succeeded' | 'rejected' | 'failed';
  readonly persistenceId: string | null;
  readonly persistedAt: string | null;
  readonly issues: readonly PersistenceResultIssue[];
  readonly portOperationInvoked: boolean;
}
