import type { PersistenceEnvelope } from '../../domain/scientificPersistence';
import {
  serializeScientificEvaluationRequest,
  serializeScientificEvaluationResult,
} from '../../domain/scientificProduction';

export interface ScientificPersistenceStorageInsert {
  readonly p_parent_persistence_id: string | null;
  readonly p_envelope_contract_version: PersistenceEnvelope['contractVersion'];
  readonly p_input_contract_version: PersistenceEnvelope['input']['contractVersion'];
  readonly p_request_payload: string;
  readonly p_result_payload: string;
  readonly p_metadata_contract_version: PersistenceEnvelope['metadata']['contractVersion'];
  readonly p_implementation_id: string;
  readonly p_implementation_version: string;
  readonly p_schema_version: string;
  readonly p_model_version: string;
  readonly p_lineage_contract_version: PersistenceEnvelope['lineage']['contractVersion'];
  readonly p_audit_contract_version: PersistenceEnvelope['audit']['contractVersion'];
  readonly p_boundary_version: PersistenceEnvelope['audit']['boundaryVersion'];
  readonly p_validation_version: PersistenceEnvelope['audit']['validationVersion'];
  readonly p_audit_input_contract_version: PersistenceEnvelope['audit']['inputContractVersion'];
  readonly p_request_contract_version: PersistenceEnvelope['audit']['requestContractVersion'];
  readonly p_result_contract_version: PersistenceEnvelope['audit']['resultContractVersion'];
  readonly p_validation_status: PersistenceEnvelope['audit']['validationStatus'];
  readonly p_validation_issue_codes: PersistenceEnvelope['audit']['validationIssueCodes'];
}

export function mapPersistenceEnvelopeToStorageInsert(
  envelope: PersistenceEnvelope,
): ScientificPersistenceStorageInsert {
  const requestPayload = serializeScientificEvaluationRequest(envelope.input.request);
  const resultPayload = serializeScientificEvaluationResult(envelope.input.result);

  return Object.freeze({
    p_parent_persistence_id: envelope.lineage.parentPersistenceId ?? null,
    p_envelope_contract_version: envelope.contractVersion,
    p_input_contract_version: envelope.input.contractVersion,
    p_request_payload: requestPayload,
    p_result_payload: resultPayload,
    p_metadata_contract_version: envelope.metadata.contractVersion,
    p_implementation_id: envelope.metadata.implementationId,
    p_implementation_version: envelope.metadata.implementationVersion,
    p_schema_version: envelope.metadata.schemaVersion,
    p_model_version: envelope.metadata.modelVersion,
    p_lineage_contract_version: envelope.lineage.contractVersion,
    p_audit_contract_version: envelope.audit.contractVersion,
    p_boundary_version: envelope.audit.boundaryVersion,
    p_validation_version: envelope.audit.validationVersion,
    p_audit_input_contract_version: envelope.audit.inputContractVersion,
    p_request_contract_version: envelope.audit.requestContractVersion,
    p_result_contract_version: envelope.audit.resultContractVersion,
    p_validation_status: envelope.audit.validationStatus,
    p_validation_issue_codes: envelope.audit.validationIssueCodes,
  });
}
