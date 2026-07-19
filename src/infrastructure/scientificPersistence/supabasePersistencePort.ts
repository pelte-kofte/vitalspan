import {
  PersistencePortException,
  type PersistenceEnvelope,
  type PersistencePort,
  type PersistenceResult,
} from '../../domain/scientificPersistence';
import {
  mapPersistenceEnvelopeToStorageInsert,
  type ScientificPersistenceStorageInsert,
} from './storageMapper';

interface ScientificPersistenceStorageResponse {
  readonly data: unknown;
  readonly error: unknown;
}

export interface ScientificPersistenceStorageClient {
  rpc(
    operation: 'insert_scientific_persistence_record',
    input: ScientificPersistenceStorageInsert,
  ): PromiseLike<ScientificPersistenceStorageResponse>;
}

const PORT_FAILURE_MESSAGE = 'Persistence storage operation failed.';

function persistencePortException(): PersistencePortException {
  return new PersistencePortException('port_failure', PORT_FAILURE_MESSAGE);
}

function failedPersistenceResult(): PersistenceResult {
  const issue = Object.freeze({
    code: 'port_failure' as const,
    path: null,
    message: PORT_FAILURE_MESSAGE,
  });

  return Object.freeze({
    contractVersion: 'scientific-persistence-result/1.0.0',
    status: 'failed',
    persistenceId: null,
    persistedAt: null,
    issues: Object.freeze([issue]),
    portOperationInvoked: true,
  });
}

function succeededPersistenceResult(
  persistenceId: string,
  persistedAt: string,
): PersistenceResult {
  return Object.freeze({
    contractVersion: 'scientific-persistence-result/1.0.0',
    status: 'succeeded',
    persistenceId,
    persistedAt,
    issues: Object.freeze([]),
    portOperationInvoked: true,
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export class SupabasePersistencePort implements PersistencePort {
  readonly contractVersion = 'scientific-persistence-port/1.0.0' as const;

  constructor(private readonly client: ScientificPersistenceStorageClient) {}

  async save(envelope: PersistenceEnvelope): Promise<PersistenceResult> {
    let storageInput: ScientificPersistenceStorageInsert;

    try {
      storageInput = mapPersistenceEnvelopeToStorageInsert(envelope);
    } catch {
      throw persistencePortException();
    }

    let response: ScientificPersistenceStorageResponse;

    try {
      response = await this.client.rpc(
        'insert_scientific_persistence_record',
        storageInput,
      );
    } catch {
      throw persistencePortException();
    }

    if (!isRecord(response)
      || !Object.prototype.hasOwnProperty.call(response, 'data')
      || !Object.prototype.hasOwnProperty.call(response, 'error')) {
      throw persistencePortException();
    }

    if (response.error !== null) {
      return failedPersistenceResult();
    }

    if (!Array.isArray(response.data) || response.data.length !== 1) {
      throw persistencePortException();
    }

    const [storedRecord] = response.data;

    if (!isRecord(storedRecord)
      || !isNonEmptyString(storedRecord.persistence_id)
      || !isNonEmptyString(storedRecord.persisted_at)
      || storedRecord.persistence_id === envelope.lineage.parentPersistenceId) {
      throw persistencePortException();
    }

    return succeededPersistenceResult(
      storedRecord.persistence_id,
      storedRecord.persisted_at,
    );
  }
}
