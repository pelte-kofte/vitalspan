import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join } from 'node:path';

import type {
  PersistenceAudit,
  PersistenceEnvelope,
  PersistenceLineage,
  ValidatedPersistenceInput,
} from '../domain/scientificPersistence';
import {
  PersistencePortException,
  PersistenceService,
} from '../domain/scientificPersistence';
import {
  SCIENTIFIC_EVALUATION_REQUEST_VERSION,
  SCIENTIFIC_EVALUATION_RESULT_VERSION,
  ScientificContractError,
  deserializeScientificEvaluationRequest,
  deserializeScientificEvaluationResult,
  serializeScientificEvaluationRequest,
  serializeScientificEvaluationResult,
  type ScientificDomainVersion,
  type ScientificEvaluationRequest,
  type ScientificEvaluationResult,
} from '../domain/scientificProduction';
import { SCIENTIFIC_PERSISTENCE_METADATA } from '../infrastructure/scientificPersistence/metadata';
import {
  mapPersistenceEnvelopeToStorageInsert,
} from '../infrastructure/scientificPersistence/storageMapper';
import {
  SupabasePersistencePort,
  type ScientificPersistenceStorageClient,
} from '../infrastructure/scientificPersistence/supabasePersistencePort';
import * as runtimeComposition from '../infrastructure/scientificPersistence/runtimeComposition';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

const ROOT = process.cwd();
const INFRASTRUCTURE_ROOT = join(ROOT, 'src', 'infrastructure', 'scientificPersistence');

function sourceFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap(entry => {
    const candidate = join(directory, entry);
    if (statSync(candidate).isDirectory()) {
      return sourceFiles(candidate);
    }
    return /\.tsx?$/.test(candidate) ? [candidate] : [];
  });
}

function requestFixture(): ScientificEvaluationRequest {
  return {
    contractVersion: SCIENTIFIC_EVALUATION_REQUEST_VERSION,
    requestId: 'request-001',
    domainId: 'cardiometabolic_health',
    requestedDomainVersion: 'Vitalspan-CMH-DOMAIN-1.0.0',
    requestedAt: '2026-07-19T12:00:00.000Z',
    observations: [],
    context: {},
    priorSnapshot: null,
  };
}

function resultFixture(): ScientificEvaluationResult {
  const domainVersion: ScientificDomainVersion = {
    domainId: 'cardiometabolic_health',
    scientificSpecificationVersion: 'Vitalspan-CMH-DOMAIN-1.0.0',
    componentVersions: [{
      componentId: 'eligibility_policy',
      version: 'Vitalspan-CMH-ELIGIBILITY-1.0.0',
    }],
  };
  const blockingReason = {
    code: 'missing_protocol_metadata',
    severity: 'blocking_insufficient',
    explanation: 'Required protocol metadata is unavailable.',
    evidenceReferenceIds: ['evidence-001'],
  };

  return {
    contractVersion: SCIENTIFIC_EVALUATION_RESULT_VERSION,
    requestId: 'request-001',
    snapshotId: 'snapshot-001',
    domainId: 'cardiometabolic_health',
    domainVersion,
    evaluatedAt: '2026-07-19T12:00:00.000Z',
    status: {
      code: 'insufficient_data',
      authority: 'scientific_domain',
      reasons: [blockingReason],
    },
    measurements: [],
    interpretations: [],
    blockedOutputs: [{
      outputId: 'reference_interpretation',
      reasons: [blockingReason],
    }],
    warnings: [],
    evidence: [{
      referenceId: 'evidence-001',
      citation: 'Frozen scientific evidence reference.',
      sourceUrl: null,
      publicationDate: null,
      accessedOn: null,
      role: 'measurement_governance',
    }],
    auditMetadata: {
      evaluationId: 'evaluation-001',
      evaluatorId: 'fixture-scientific-domain',
      evaluatorVersion: 'fixture-scientific-domain/1.0.0',
      requestContractVersion: SCIENTIFIC_EVALUATION_REQUEST_VERSION,
      resultContractVersion: SCIENTIFIC_EVALUATION_RESULT_VERSION,
      domainVersion,
      inputObservationIds: [],
      authorizedOutputIds: [],
      blockedOutputIds: ['reference_interpretation'],
      reasonCodes: ['missing_protocol_metadata'],
      inputFingerprint: null,
      outputFingerprint: null,
      domainAudit: { originalInputPreserved: true },
    },
    confidence: {
      code: 'unsupported',
      registryId: 'confidence_registry',
      registryVersion: 'confidence-registry/1.0.0',
      limitations: ['Protocol provenance is incomplete.'],
    },
    provenanceSummary: {
      sourceIds: ['unknown'],
      sourceTypes: ['unknown'],
      verificationStatuses: ['unknown'],
      completeness: 'unknown',
      limitations: ['Source provenance is unavailable.'],
    },
    safetyCandidate: null,
    trendStatus: null,
    limitations: ['No diagnosis or treatment is authorized.'],
  };
}

function lineageFixture(parentPersistenceId?: string): PersistenceLineage {
  return Object.freeze(parentPersistenceId === undefined
    ? { contractVersion: 'scientific-persistence-lineage/1.0.0' }
    : {
      contractVersion: 'scientific-persistence-lineage/1.0.0',
      parentPersistenceId,
    });
}

function envelopeFixture(
  parentPersistenceId?: string,
  result: ScientificEvaluationResult = resultFixture(),
): PersistenceEnvelope {
  const request = requestFixture();
  const input: ValidatedPersistenceInput = Object.freeze({
    contractVersion: 'scientific-persistence-input/1.0.0',
    request,
    result,
  });
  const audit: PersistenceAudit = Object.freeze({
    contractVersion: 'scientific-persistence-audit/1.0.0',
    boundaryVersion: 'scientific-persistence-boundary/1.0.0',
    validationVersion: 'scientific-persistence-validation/1.0.0',
    inputContractVersion: input.contractVersion,
    requestContractVersion: request.contractVersion,
    resultContractVersion: result.contractVersion,
    validationStatus: 'passed',
    validationIssueCodes: Object.freeze([] as const),
  });

  return Object.freeze({
    contractVersion: 'scientific-persistence-envelope/1.0.0',
    input,
    metadata: SCIENTIFIC_PERSISTENCE_METADATA,
    lineage: lineageFixture(parentPersistenceId),
    audit,
  });
}

function storageClientFixture(response: {
  readonly data: unknown;
  readonly error: unknown;
}): {
  readonly client: ScientificPersistenceStorageClient;
  readonly rpc: jest.Mock;
} {
  const rpc = jest.fn(async () => response);

  return {
    client: { rpc },
    rpc,
  };
}

describe('Phase 8.0C Sprint 2 metadata and lossless storage mapper', () => {
  test('defines the exact immutable Phase 8.0C persistence metadata', () => {
    expect(SCIENTIFIC_PERSISTENCE_METADATA).toEqual({
      contractVersion: 'scientific-persistence-metadata/1.0.0',
      implementationId: 'supabase_postgresql_scientific_persistence',
      implementationVersion: 'supabase-scientific-persistence/1.0.0',
      schemaVersion: 'scientific-persistence-schema/1.1.0',
      modelVersion: 'scientific-persistence-storage-model/1.1.0',
    });
    expect(Object.keys(SCIENTIFIC_PERSISTENCE_METADATA)).toEqual([
      'contractVersion',
      'implementationId',
      'implementationVersion',
      'schemaVersion',
      'modelVersion',
    ]);
    expect(Object.isFrozen(SCIENTIFIC_PERSISTENCE_METADATA)).toBe(true);
  });

  test('maps every approved envelope field to the private insertion representation', () => {
    const envelope = envelopeFixture();
    const mapped = mapPersistenceEnvelopeToStorageInsert(envelope);

    expect(Object.keys(mapped)).toEqual([
      'p_parent_persistence_id',
      'p_envelope_contract_version',
      'p_input_contract_version',
      'p_request_payload',
      'p_result_payload',
      'p_metadata_contract_version',
      'p_implementation_id',
      'p_implementation_version',
      'p_schema_version',
      'p_model_version',
      'p_lineage_contract_version',
      'p_audit_contract_version',
      'p_boundary_version',
      'p_validation_version',
      'p_audit_input_contract_version',
      'p_request_contract_version',
      'p_result_contract_version',
      'p_validation_status',
      'p_validation_issue_codes',
    ]);
    expect(mapped).toMatchObject({
      p_parent_persistence_id: null,
      p_envelope_contract_version: envelope.contractVersion,
      p_input_contract_version: envelope.input.contractVersion,
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
  });

  test('stores the approved request and result serializer outputs exactly', () => {
    const envelope = envelopeFixture();
    const mapped = mapPersistenceEnvelopeToStorageInsert(envelope);

    expect(mapped.p_request_payload)
      .toBe(serializeScientificEvaluationRequest(envelope.input.request));
    expect(mapped.p_result_payload)
      .toBe(serializeScientificEvaluationResult(envelope.input.result));
  });

  test('round-trips blocked, provenance, audit, version, null, and empty states unchanged', () => {
    const envelope = envelopeFixture();
    const mapped = mapPersistenceEnvelopeToStorageInsert(envelope);
    const decodedRequest = deserializeScientificEvaluationRequest(mapped.p_request_payload);
    const decodedResult = deserializeScientificEvaluationResult(mapped.p_result_payload);

    expect(decodedRequest).toEqual(envelope.input.request);
    expect(decodedRequest.priorSnapshot).toBeNull();
    expect(decodedRequest.observations).toEqual([]);
    expect(decodedResult).toEqual(envelope.input.result);
    expect(decodedResult.blockedOutputs).toEqual(envelope.input.result.blockedOutputs);
    expect(decodedResult.provenanceSummary).toEqual(envelope.input.result.provenanceSummary);
    expect(decodedResult.auditMetadata).toEqual(envelope.input.result.auditMetadata);
    expect(decodedResult.domainVersion).toEqual(envelope.input.result.domainVersion);
    expect(decodedResult.safetyCandidate).toBeNull();
    expect(decodedResult.trendStatus).toBeNull();
    expect(decodedResult.measurements).toEqual([]);
    expect(decodedResult.interpretations).toEqual([]);
  });

  test('preserves an opaque immediate-parent identity and maps a root to null', () => {
    const parentPersistenceId = '550e8400-e29b-41d4-a716-446655440000';
    expect(mapPersistenceEnvelopeToStorageInsert(envelopeFixture())
      .p_parent_persistence_id).toBeNull();
    expect(mapPersistenceEnvelopeToStorageInsert(envelopeFixture(parentPersistenceId))
      .p_parent_persistence_id).toBe(parentPersistenceId);
  });

  test('adds no owner, current persistence identity, storage time, or scientific projection', () => {
    const mapped = mapPersistenceEnvelopeToStorageInsert(envelopeFixture());
    [
      'owner_id',
      'p_owner_id',
      'persistence_id',
      'p_persistence_id',
      'persisted_at',
      'p_persisted_at',
      'domain_status',
      'confidence',
      'measurements',
      'interpretations',
      'blocked_outputs',
      'provenance_completeness',
      'safety_candidate',
      'trend_status',
    ].forEach(field => expect(mapped).not.toHaveProperty(field));
  });

  test('returns an immutable deterministic mapping without mutating its input', () => {
    const envelope = envelopeFixture();
    const requestBefore = serializeScientificEvaluationRequest(envelope.input.request);
    const resultBefore = serializeScientificEvaluationResult(envelope.input.result);

    const first = mapPersistenceEnvelopeToStorageInsert(envelope);
    const second = mapPersistenceEnvelopeToStorageInsert(envelope);

    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(first.p_validation_issue_codes).toBe(envelope.audit.validationIssueCodes);
    expect(serializeScientificEvaluationRequest(envelope.input.request)).toBe(requestBefore);
    expect(serializeScientificEvaluationResult(envelope.input.result)).toBe(resultBefore);
  });

  test('fails before producing a mapping when approved serialization rejects a payload', () => {
    const invalidResult = {
      ...resultFixture(),
      contractVersion: 'unsupported-result-version',
    } as unknown as ScientificEvaluationResult;

    expect(() => mapPersistenceEnvelopeToStorageInsert(envelopeFixture(undefined, invalidResult)))
      .toThrow(ScientificContractError);
  });

  test('depends only on public Phase 8.0A and Phase 8.0B boundaries', () => {
    const mapperSource = readFileSync(join(INFRASTRUCTURE_ROOT, 'storageMapper.ts'), 'utf8');
    const metadataSource = readFileSync(join(INFRASTRUCTURE_ROOT, 'metadata.ts'), 'utf8');

    expect(mapperSource).toContain("from '../../domain/scientificPersistence'");
    expect(mapperSource).toContain("from '../../domain/scientificProduction'");
    expect(mapperSource).toContain('serializeScientificEvaluationRequest');
    expect(mapperSource).toContain('serializeScientificEvaluationResult');
    expect(mapperSource).not.toMatch(/JSON\.stringify|scientificDomains|scientificModels/);
    expect(mapperSource).not.toMatch(/supabase|AsyncStorage|randomUUID|Date\.now|new Date/);
    expect(metadataSource).toContain("from '../../domain/scientificPersistence'");
    expect(metadataSource).not.toMatch(
      /from\s+['"][^'"]*(?:scientificProduction|scientificDomains|supabase)[^'"]*['"]|process\.env/,
    );
  });

  test('introduces no infrastructure barrel or public persistence export', () => {
    expect(existsSync(join(INFRASTRUCTURE_ROOT, 'index.ts'))).toBe(false);
    const persistenceBarrel = readFileSync(
      join(ROOT, 'src', 'domain', 'scientificPersistence', 'index.ts'),
      'utf8',
    );
    expect(persistenceBarrel).not.toMatch(
      /SCIENTIFIC_PERSISTENCE_(?:METADATA|SERVICE)|ScientificPersistenceStorageInsert|mapPersistenceEnvelopeToStorageInsert|SupabasePersistencePort|runtimeComposition/,
    );
    expect(existsSync(join(INFRASTRUCTURE_ROOT, 'index.ts'))).toBe(false);
  });
});

describe('Phase 8.0C Sprint 3 concrete Supabase persistence port', () => {
  test('implements the exact existing port contract and transports database identity and time unchanged', async () => {
    const envelope = envelopeFixture();
    const persistenceId = '550e8400-e29b-41d4-a716-446655440001';
    const persistedAt = '2026-07-19T20:45:12.345678+00:00';
    const { client, rpc } = storageClientFixture({
      data: [{ persistence_id: persistenceId, persisted_at: persistedAt }],
      error: null,
    });
    const port = new SupabasePersistencePort(client);

    const result = await port.save(envelope);

    expect(port.contractVersion).toBe('scientific-persistence-port/1.0.0');
    expect(result).toEqual({
      contractVersion: 'scientific-persistence-result/1.0.0',
      status: 'succeeded',
      persistenceId,
      persistedAt,
      issues: [],
      portOperationInvoked: true,
    });
    expect(result.persistenceId).toBe(persistenceId);
    expect(result.persistedAt).toBe(persistedAt);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.issues)).toBe(true);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      'insert_scientific_persistence_record',
      mapPersistenceEnvelopeToStorageInsert(envelope),
    );
  });

  test('returns one immutable generic failed result for an expected storage refusal', async () => {
    const rawVendorError = {
      message: 'owner 0b542c45 raw SQL rejected payload biomarker=private',
      details: 'database-sensitive-detail',
    };
    const { client, rpc } = storageClientFixture({ data: null, error: rawVendorError });
    const port = new SupabasePersistencePort(client);

    const result = await port.save(envelopeFixture());

    expect(result).toEqual({
      contractVersion: 'scientific-persistence-result/1.0.0',
      status: 'failed',
      persistenceId: null,
      persistedAt: null,
      issues: [{
        code: 'port_failure',
        path: null,
        message: 'Persistence storage operation failed.',
      }],
      portOperationInvoked: true,
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.issues)).toBe(true);
    expect(Object.isFrozen(result.issues[0])).toBe(true);
    expect(JSON.stringify(result)).not.toContain(rawVendorError.message);
    expect(JSON.stringify(result)).not.toContain(rawVendorError.details);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  test('throws the existing fixed, sanitized exception for a thrown storage-client failure', async () => {
    const rawVendorError = new Error(
      'token=secret owner=private request_payload=private database=internal',
    );
    const rpc = jest.fn(async () => {
      throw rawVendorError;
    });
    const client: ScientificPersistenceStorageClient = { rpc };
    const port = new SupabasePersistencePort(client);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    try {
      const operation = port.save(envelopeFixture());

      await expect(operation).rejects.toMatchObject({
        name: 'PersistencePortException',
        code: 'port_failure',
        message: 'Persistence storage operation failed.',
      });
      await expect(operation).rejects.toBeInstanceOf(
        PersistencePortException,
      );
      expect(rpc).toHaveBeenCalledTimes(1);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      logSpy.mockRestore();
    }
  });

  test.each([
    ['non-array data', { data: {}, error: null }],
    ['no returned row', { data: [], error: null }],
    ['multiple returned rows', {
      data: [
        { persistence_id: 'persistence-001', persisted_at: 'time-001' },
        { persistence_id: 'persistence-002', persisted_at: 'time-002' },
      ],
      error: null,
    }],
    ['missing persistence identity', {
      data: [{ persisted_at: '2026-07-19T20:45:12.345678+00:00' }],
      error: null,
    }],
    ['blank persistence identity', {
      data: [{ persistence_id: '   ', persisted_at: '2026-07-19T20:45:12.345678+00:00' }],
      error: null,
    }],
    ['missing persistence timestamp', {
      data: [{ persistence_id: '550e8400-e29b-41d4-a716-446655440001' }],
      error: null,
    }],
    ['blank persistence timestamp', {
      data: [{ persistence_id: '550e8400-e29b-41d4-a716-446655440001', persisted_at: '' }],
      error: null,
    }],
  ])('throws the existing exception for malformed success response: %s', async (_label, response) => {
    const { client, rpc } = storageClientFixture(response);
    const port = new SupabasePersistencePort(client);

    await expect(port.save(envelopeFixture())).rejects.toEqual(
      expect.objectContaining({
        name: 'PersistencePortException',
        code: 'port_failure',
        message: 'Persistence storage operation failed.',
      }),
    );
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  test('rejects a returned identity equal to supplied parent lineage', async () => {
    const parentPersistenceId = '550e8400-e29b-41d4-a716-446655440001';
    const { client, rpc } = storageClientFixture({
      data: [{
        persistence_id: parentPersistenceId,
        persisted_at: '2026-07-19T20:45:12.345678+00:00',
      }],
      error: null,
    });
    const port = new SupabasePersistencePort(client);

    await expect(port.save(envelopeFixture(parentPersistenceId))).rejects.toBeInstanceOf(
      PersistencePortException,
    );
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  test('fails before storage when approved serialization cannot produce a mapping', async () => {
    const invalidResult = {
      ...resultFixture(),
      contractVersion: 'unsupported-result-version',
    } as unknown as ScientificEvaluationResult;
    const { client, rpc } = storageClientFixture({ data: null, error: null });
    const port = new SupabasePersistencePort(client);

    await expect(
      port.save(envelopeFixture(undefined, invalidResult)),
    ).rejects.toBeInstanceOf(PersistencePortException);
    expect(rpc).not.toHaveBeenCalled();
  });

  test('contains no retry, fallback, logging, read, update, delete, upsert, queue, or cache path', () => {
    const portSource = readFileSync(
      join(INFRASTRUCTURE_ROOT, 'supabasePersistencePort.ts'),
      'utf8',
    );

    expect(portSource).toContain("from '../../domain/scientificPersistence'");
    expect(portSource).toContain("from './storageMapper'");
    expect(portSource).toContain("'insert_scientific_persistence_record'");
    expect(portSource).not.toMatch(
      /from\s+['"][^'"]*(?:scientificDomains|scientificModels|AsyncStorage)[^'"]*['"]/,
    );
    expect(portSource).not.toMatch(
      /console\.|setTimeout|setInterval|retry|fallback|\.select\(|\.update\(|\.delete\(|\.upsert\(|queue|cache|randomUUID|Date\.now|new Date/,
    );
  });
});

describe('Phase 8.0C Sprint 4 inactive runtime composition', () => {
  const supabaseRpc = supabase.rpc as unknown as jest.Mock;

  beforeEach(() => {
    supabaseRpc.mockReset();
  });

  test('constructs only the existing service with the concrete port and fixed metadata', () => {
    expect(Object.keys(runtimeComposition).sort()).toEqual([
      'SCIENTIFIC_PERSISTENCE_METADATA',
      'SCIENTIFIC_PERSISTENCE_SERVICE',
    ]);
    expect(runtimeComposition.SCIENTIFIC_PERSISTENCE_SERVICE).toBeInstanceOf(
      PersistenceService,
    );
    expect(runtimeComposition.SCIENTIFIC_PERSISTENCE_SERVICE.contractVersion)
      .toBe('scientific-persistence-service/1.0.0');
    expect(runtimeComposition.SCIENTIFIC_PERSISTENCE_METADATA)
      .toBe(SCIENTIFIC_PERSISTENCE_METADATA);
    expect(Object.isFrozen(runtimeComposition.SCIENTIFIC_PERSISTENCE_METADATA)).toBe(true);
    expect(supabaseRpc).not.toHaveBeenCalled();
  });

  test('remains dormant until the existing service is explicitly invoked', async () => {
    const envelope = envelopeFixture();
    const persistenceId = '550e8400-e29b-41d4-a716-446655440002';
    const persistedAt = '2026-07-19T21:15:30.123456+00:00';
    supabaseRpc.mockResolvedValueOnce({
      data: [{ persistence_id: persistenceId, persisted_at: persistedAt }],
      error: null,
    });

    expect(supabaseRpc).not.toHaveBeenCalled();

    const result = await runtimeComposition.SCIENTIFIC_PERSISTENCE_SERVICE.persist(
      envelope.input,
      runtimeComposition.SCIENTIFIC_PERSISTENCE_METADATA,
      envelope.lineage,
    );

    expect(result).toMatchObject({
      status: 'succeeded',
      persistenceId,
      persistedAt,
      portOperationInvoked: true,
    });
    expect(supabaseRpc).toHaveBeenCalledTimes(1);
  });

  test('contains composition only and introduces no wrapper, invocation, or activation behavior', () => {
    const compositionSource = readFileSync(
      join(INFRASTRUCTURE_ROOT, 'runtimeComposition.ts'),
      'utf8',
    );

    expect(compositionSource).toContain(
      "import { PersistenceService } from '../../domain/scientificPersistence'",
    );
    expect(compositionSource).toContain("import { supabase } from '../../lib/supabase'");
    expect(compositionSource).toContain("from './metadata'");
    expect(compositionSource).toContain("from './supabasePersistencePort'");
    expect(compositionSource).toContain('new SupabasePersistencePort(supabase)');
    expect(compositionSource).toContain('new PersistenceService(');
    expect(compositionSource).not.toMatch(
      /\.persist\(|\.save\(|function\s|class\s|featureFlag|activationRegistry|scientificDomains|scientificModels|PersistenceBoundary|PersistenceLineage|screen|component|navigation/,
    );
  });

  test('is not imported by any existing runtime module or exported from a public barrel', () => {
    const compositionFile = join(INFRASTRUCTURE_ROOT, 'runtimeComposition.ts');
    const runtimeReferences = sourceFiles(join(ROOT, 'src'))
      .filter(file => file !== compositionFile)
      .filter(file => !file.includes(`${join('src', '__tests__')}`))
      .filter(file => /(?:from\s+|import\(|require\()\s*['"][^'"]*runtimeComposition['"]/.test(
        readFileSync(file, 'utf8'),
      ));
    const persistenceBarrel = readFileSync(
      join(ROOT, 'src', 'domain', 'scientificPersistence', 'index.ts'),
      'utf8',
    );

    expect(runtimeReferences).toEqual([]);
    expect(persistenceBarrel).not.toMatch(
      /runtimeComposition|SCIENTIFIC_PERSISTENCE_SERVICE|SCIENTIFIC_PERSISTENCE_METADATA|SupabasePersistencePort/,
    );
    expect(existsSync(join(INFRASTRUCTURE_ROOT, 'index.ts'))).toBe(false);
  });
});
