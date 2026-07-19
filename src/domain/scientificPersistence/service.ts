import type {
  PersistenceAudit,
  PersistenceEnvelope,
  PersistenceLineage,
  PersistenceMetadata,
  PersistenceResult,
  ValidatedPersistenceInput,
} from './contracts';
import type { PersistencePort } from './port';
import { postConstructionValidation } from './validation';

export class PersistenceService {
  readonly contractVersion = 'scientific-persistence-service/1.0.0' as const;

  constructor(private readonly port: PersistencePort) {}

  async persist(
    input: ValidatedPersistenceInput,
    metadata: PersistenceMetadata,
    lineage: PersistenceLineage,
  ): Promise<PersistenceResult> {
    const audit: PersistenceAudit = Object.freeze({
      contractVersion: 'scientific-persistence-audit/1.0.0',
      boundaryVersion: 'scientific-persistence-boundary/1.0.0',
      validationVersion: 'scientific-persistence-validation/1.0.0',
      inputContractVersion: input.contractVersion,
      requestContractVersion: input.request.contractVersion,
      resultContractVersion: input.result.contractVersion,
      validationStatus: 'passed',
      validationIssueCodes: Object.freeze([] as const),
    });

    const envelope: PersistenceEnvelope = Object.freeze({
      contractVersion: 'scientific-persistence-envelope/1.0.0',
      input,
      metadata,
      lineage,
      audit,
    });

    const validation = postConstructionValidation(audit, envelope);
    if (!validation.valid) {
      return Object.freeze({
        contractVersion: 'scientific-persistence-result/1.0.0',
        status: 'rejected',
        persistenceId: null,
        persistedAt: null,
        issues: validation.issues,
        portOperationInvoked: false,
      });
    }

    return this.port.save(envelope);
  }
}
