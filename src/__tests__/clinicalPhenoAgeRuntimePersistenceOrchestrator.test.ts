import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  PersistencePortException,
  PersistenceService,
  type PersistenceLineage,
  type PersistenceMetadata,
  type PersistenceResult,
  type ValidatedPersistenceInput,
  type ValidationOutcome,
} from '../domain/scientificPersistence';
import {
  ClinicalPhenoAgeProductionAdapter,
} from '../infrastructure/scientificProduction/clinicalPhenoAgeAdapter';
import {
  ClinicalPhenoAgeRuntimePersistenceExecutor,
  ClinicalPhenoAgeRuntimePersistenceExecutorError,
} from '../infrastructure/scientificPersistence/clinicalPhenoAgeRuntimePersistenceExecutor';
import {
  ClinicalPhenoAgeRuntimePersistenceOrchestrator,
} from '../infrastructure/scientificPersistence/clinicalPhenoAgeRuntimePersistenceOrchestrator';
import {
  ClinicalPhenoAgeRuntimeRequestBuilderError,
  buildClinicalPhenoAgeRuntimeRequest,
  type ClinicalPhenoAgeRuntimeRequestBuilderInput,
  type ClinicalPhenoAgeRuntimeVerification,
} from '../infrastructure/scientificProduction/clinicalPhenoAgeRuntimeRequestBuilder';
import type { StoredEntry } from '../types/biomarkerEntry';

const ROOT = join(__dirname, '..', '..');
const REQUESTED_AT = '2026-07-21T12:00:00.000Z';
const OBSERVED_AT = '2026-07-10T08:00:00.000Z';
const VERIFIED_AT = '2026-07-10T10:00:00.000Z';

const PERSISTENCE_METADATA: PersistenceMetadata = Object.freeze({
  contractVersion: 'scientific-persistence-metadata/1.0.0',
  implementationId: 'executor-test-persistence',
  implementationVersion: 'executor-test-persistence/1.0.0',
  schemaVersion: 'executor-test-schema/1.0.0',
  modelVersion: 'executor-test-model/1.0.0',
});

const PERSISTENCE_LINEAGE: PersistenceLineage = Object.freeze({
  contractVersion: 'scientific-persistence-lineage/1.0.0',
});

const LABS = [
  ['albumin', 44, 'g/L'],
  ['creatinine', 80, 'μmol/L'],
  ['fastingglucose', 5, 'mmol/L'],
  ['hscrp', 0.1, 'mg/dL'],
  ['lymphocytepct', 30, '%'],
  ['mcv', 90, 'fL'],
  ['rdw', 12.5, '%'],
  ['alp', 70, 'U/L'],
  ['wbc', 6, '10^3/μL'],
] as const;

function entry(biomarkerId: string, value: number, unit: string): StoredEntry {
  return {
    id: `laboratory-record-${biomarkerId}`,
    biomarkerId,
    value,
    unit,
    date: OBSERVED_AT,
    source: 'Validation Laboratory',
    notes: '',
    ...(biomarkerId === 'albumin' ? {
      reportedValue: 4.4,
      reportedUnit: 'g/dL',
      sourceLabRange: {
        lowerBound: 3.5,
        upperBound: 5.2,
        unit: 'g/dL',
        laboratoryName: 'Validation Laboratory',
      },
    } : {}),
  };
}

function entries(): Map<string, StoredEntry> {
  return new Map(LABS.map(([biomarkerId, value, unit]) => [
    biomarkerId,
    entry(biomarkerId, value, unit),
  ]));
}

function verification(
  sourceRecordId: string,
  sourceId: string,
  sourceType: ClinicalPhenoAgeRuntimeVerification['sourceType'],
): ClinicalPhenoAgeRuntimeVerification {
  return {
    sourceRecordId,
    sourceId,
    sourceType,
    verificationStatus: 'verified',
    verificationAuthorityId: 'verified-health-record-import',
    verifiedAt: VERIFIED_AT,
    provider: { name: sourceId },
    metadata: { verificationRecordId: `verification-${sourceRecordId}` },
    observationContext: { verificationScope: 'runtime-persistence-orchestrator-test' },
  };
}

function verifications(
  latestEntries: ReadonlyMap<string, StoredEntry>,
): Map<string, ClinicalPhenoAgeRuntimeVerification> {
  const result = new Map<string, ClinicalPhenoAgeRuntimeVerification>();
  result.set('profile-age-record-001', verification(
    'profile-age-record-001',
    'Vitalspan Profile',
    'chronological_record',
  ));
  latestEntries.forEach(item => {
    result.set(item.id, verification(item.id, item.source, 'laboratory'));
  });
  return result;
}

function input(
  overrides: Partial<ClinicalPhenoAgeRuntimeRequestBuilderInput> = {},
): ClinicalPhenoAgeRuntimeRequestBuilderInput {
  const latestEntries = entries();
  return {
    requestId: 'runtime-persistence-orchestration-request-001',
    requestedAt: REQUESTED_AT,
    chronologicalAgeRecord: {
      id: 'profile-age-record-001',
      ageYears: 40,
      observedAt: '2026-07-10T09:00:00.000Z',
      sourceId: 'Vitalspan Profile',
    },
    latestEntries,
    verificationBySourceRecordId: verifications(latestEntries),
    context: {
      runtime: { source: 'verified_local_health_records' },
      persistenceIntent: 'validation_only',
    },
    priorSnapshot: null,
    ...overrides,
  };
}

function adapter(): ClinicalPhenoAgeProductionAdapter {
  return new ClinicalPhenoAgeProductionAdapter({
    create: request => ({
      snapshotId: `snapshot:${request.requestId}`,
      evaluationId: `evaluation:${request.requestId}`,
    }),
  });
}

function persistenceResult(
  status: PersistenceResult['status'] = 'succeeded',
): PersistenceResult {
  const succeeded = status === 'succeeded';
  return Object.freeze({
    contractVersion: 'scientific-persistence-result/1.0.0',
    status,
    persistenceId: succeeded ? 'executor-test-persistence-001' : null,
    persistedAt: succeeded ? '2026-07-21T12:00:01.000Z' : null,
    issues: Object.freeze(succeeded ? [] : [Object.freeze({
      code: 'port_failure' as const,
      path: null,
      message: 'Persistence storage operation failed.',
    })]),
    portOperationInvoked: true,
  });
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

describe('inactive Clinical PhenoAge runtime persistence orchestrator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(REQUESTED_AT));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('runs Builder → Adapter → PersistenceBoundary without losing provenance', async () => {
    const runtimeInput = input();
    const expectedRequest = buildClinicalPhenoAgeRuntimeRequest(runtimeInput);
    const persist = jest.spyOn(PersistenceService.prototype, 'persist');
    const orchestrator = new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter());

    const outcome = await orchestrator.validate(runtimeInput);

    expect(outcome).toMatchObject({
      validationVersion: 'scientific-persistence-validation/1.0.0',
      validationPhase: 'pre_construction',
      valid: true,
      issues: [],
      validatedInput: {
        contractVersion: 'scientific-persistence-input/1.0.0',
      },
    });
    expect(outcome.validatedInput?.request).toEqual(expectedRequest);
    expect(outcome.validatedInput?.request.observations[1]).toEqual(
      expectedRequest.observations[1],
    );
    expect(outcome.validatedInput?.request.observations[1]).toMatchObject({
      observationId: 'laboratory-record-albumin',
      value: 4.4,
      unit: 'g/dL',
      provenance: {
        sourceId: 'Validation Laboratory',
        sourceRecordId: 'laboratory-record-albumin',
        originalValue: 4.4,
        originalUnit: 'g/dL',
        metadata: {
          verification: {
            authorityId: 'verified-health-record-import',
            verifiedAt: VERIFIED_AT,
          },
        },
      },
      context: { verificationScope: 'runtime-persistence-orchestrator-test' },
    });
    expect(new Map(outcome.validatedInput?.result.measurements.map(measurement => [
      measurement.measurementId,
      measurement.value,
    ]))).toEqual(new Map([
      ['phenotypicAgeYears', 31.514754353039137],
      ['chronologicalAgeYears', 40],
      ['ageDifferenceYears', -8.485245646960863],
    ]));
    expect(persist).not.toHaveBeenCalled();
  });

  test('is deterministic and returns deeply immutable validated contracts', async () => {
    const runtimeInput = input();
    const orchestrator = new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter());

    const first = await orchestrator.validate(runtimeInput);
    const second = await orchestrator.validate(runtimeInput);

    expect(second).toEqual(first);
    expect(Object.isFrozen(orchestrator)).toBe(true);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.validatedInput)).toBe(true);
    expect(Object.isFrozen(first.validatedInput?.request)).toBe(true);
    expect(Object.isFrozen(first.validatedInput?.request.observations[0].provenance)).toBe(true);
    expect(Object.isFrozen(first.validatedInput?.result)).toBe(true);
    expect(Object.isFrozen(first.validatedInput?.result.blockedOutputs)).toBe(true);
  });

  test('preserves blocked results through boundary validation and stops before persistence', async () => {
    const runtimeInput = input();
    const incompleteEntries = new Map(runtimeInput.latestEntries);
    incompleteEntries.delete('albumin');
    const persist = jest.spyOn(PersistenceService.prototype, 'persist');
    const orchestrator = new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter());

    const outcome = await orchestrator.validate({
      ...runtimeInput,
      latestEntries: incompleteEntries,
    });

    expect(outcome.valid).toBe(true);
    expect(outcome.validatedInput?.result.status.code).toBe('unavailable');
    expect(outcome.validatedInput?.result.measurements).toEqual([]);
    expect(outcome.validatedInput?.result.blockedOutputs.map(output => output.outputId)).toEqual([
      'phenotypicAgeYears', 'chronologicalAgeYears', 'ageDifferenceYears',
    ]);
    expect(outcome.validatedInput?.result.auditMetadata.authorizedOutputIds).toEqual([]);
    expect(persist).not.toHaveBeenCalled();
  });

  test('fails closed when the builder cannot verify runtime provenance', async () => {
    const runtimeInput = input();
    const incompleteVerifications = new Map(runtimeInput.verificationBySourceRecordId);
    incompleteVerifications.delete('laboratory-record-albumin');
    const persist = jest.spyOn(PersistenceService.prototype, 'persist');
    const orchestrator = new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter());

    await expect(orchestrator.validate({
      ...runtimeInput,
      verificationBySourceRecordId: incompleteVerifications,
    })).rejects.toEqual(
      expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
        code: 'missing_verification',
      }),
    );
    expect(persist).not.toHaveBeenCalled();
  });

  test('returns boundary validation failure without constructing persistence input', async () => {
    const runtimeInput = input();
    const productionAdapter = adapter();
    const validRequest = buildClinicalPhenoAgeRuntimeRequest(runtimeInput);
    const validResult = await productionAdapter.evaluate(validRequest);
    jest.spyOn(productionAdapter, 'evaluate').mockResolvedValue({
      ...validResult,
      requestId: 'mismatched-result-request',
    });
    const persist = jest.spyOn(PersistenceService.prototype, 'persist');
    const orchestrator = new ClinicalPhenoAgeRuntimePersistenceOrchestrator(productionAdapter);

    const outcome = await orchestrator.validate(runtimeInput);

    expect(outcome.valid).toBe(false);
    expect(outcome.validatedInput).toBeNull();
    expect(outcome.issues).toEqual([expect.objectContaining({
      code: 'request_id_mismatch',
      path: 'result.requestId',
    })]);
    expect(Object.isFrozen(outcome)).toBe(true);
    expect(Object.isFrozen(outcome.issues)).toBe(true);
    expect(persist).not.toHaveBeenCalled();
  });

  test('is imported only by the inactive persistence executor', () => {
    const orchestratorPath = join(
      ROOT,
      'src',
      'infrastructure',
      'scientificPersistence',
      'clinicalPhenoAgeRuntimePersistenceOrchestrator.ts',
    );
    const source = readFileSync(orchestratorPath, 'utf8');

    expect(source).not.toMatch(
      /PersistenceService|\.persist\s*\(|runtimeComposition|supabase|\.rpc\s*\(/i,
    );
    expect(source.indexOf('buildClinicalPhenoAgeRuntimeRequest(input)')).toBeLessThan(
      source.indexOf('this.adapter.evaluate(request)'),
    );
    expect(source.indexOf('this.adapter.evaluate(request)')).toBeLessThan(
      source.indexOf('PersistenceBoundary.validate(request, result)'),
    );

    const productionImporters = sourceFiles(join(ROOT, 'src'))
      .filter(path => !path.includes(`${join('src', '__tests__')}`))
      .filter(path => path !== orchestratorPath)
      .filter(path => /clinicalPhenoAgeRuntimePersistenceOrchestrator/.test(
        readFileSync(path, 'utf8'),
      ));
    expect(productionImporters).toEqual([join(
      ROOT,
      'src',
      'infrastructure',
      'scientificPersistence',
      'clinicalPhenoAgeRuntimePersistenceExecutor.ts',
    )]);
  });
});

describe('inactive Clinical PhenoAge runtime persistence executor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(REQUESTED_AT));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('passes the exact boundary-produced input to PersistenceService exactly once', async () => {
    const result = persistenceResult();
    const save = jest.fn(async () => result);
    const service = new PersistenceService({
      contractVersion: 'scientific-persistence-port/1.0.0',
      save,
    });
    const persist = jest.spyOn(service, 'persist');
    const runtimeOrchestrator = new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter());
    let validationOutcome: ValidationOutcome | null = null;
    const capturingOrchestrator = {
      validate: async (runtimeInput: ClinicalPhenoAgeRuntimeRequestBuilderInput) => {
        validationOutcome = await runtimeOrchestrator.validate(runtimeInput);
        return validationOutcome;
      },
    };
    const executor = new ClinicalPhenoAgeRuntimePersistenceExecutor(
      capturingOrchestrator,
      service,
      PERSISTENCE_METADATA,
      PERSISTENCE_LINEAGE,
    );

    const returned = await executor.execute(input());

    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist.mock.calls[0][0]).toBe(
      (validationOutcome as ValidationOutcome | null)?.validatedInput,
    );
    expect(persist.mock.calls[0][1]).toBe(PERSISTENCE_METADATA);
    expect(persist.mock.calls[0][2]).toBe(PERSISTENCE_LINEAGE);
    expect(save).toHaveBeenCalledTimes(1);
    expect(returned).toBe(result);
    expect(Object.isFrozen(executor)).toBe(true);
  });

  test('preserves a valid blocked result and persists it exactly once', async () => {
    const runtimeInput = input();
    const incompleteEntries = new Map(runtimeInput.latestEntries);
    incompleteEntries.delete('albumin');
    const returnedResult = persistenceResult();
    const persist = jest.fn(async (
      _validatedInput: ValidatedPersistenceInput,
      _metadata: PersistenceMetadata,
      _lineage: PersistenceLineage,
    ) => returnedResult);
    const executor = new ClinicalPhenoAgeRuntimePersistenceExecutor(
      new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter()),
      { persist },
      PERSISTENCE_METADATA,
      PERSISTENCE_LINEAGE,
    );

    const returned = await executor.execute({
      ...runtimeInput,
      latestEntries: incompleteEntries,
    });

    expect(persist).toHaveBeenCalledTimes(1);
    const validatedInput = persist.mock.calls[0][0];
    expect(validatedInput.result.status.code).toBe('unavailable');
    expect(validatedInput.result.measurements).toEqual([]);
    expect(validatedInput.result.blockedOutputs.map(output => output.outputId)).toEqual([
      'phenotypicAgeYears', 'chronologicalAgeYears', 'ageDifferenceYears',
    ]);
    expect(returned).toBe(returnedResult);
  });

  test('fails closed with zero persist calls on builder failure', async () => {
    const runtimeInput = input();
    const incompleteVerifications = new Map(runtimeInput.verificationBySourceRecordId);
    incompleteVerifications.delete('laboratory-record-albumin');
    const persist = jest.fn(async () => persistenceResult());
    const executor = new ClinicalPhenoAgeRuntimePersistenceExecutor(
      new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter()),
      { persist },
      PERSISTENCE_METADATA,
      PERSISTENCE_LINEAGE,
    );

    await expect(executor.execute({
      ...runtimeInput,
      verificationBySourceRecordId: incompleteVerifications,
    })).rejects.toEqual(expect.objectContaining({ code: 'missing_verification' }));
    expect(persist).not.toHaveBeenCalled();
  });

  test('fails closed with zero persist calls on adapter failure', async () => {
    const invalidAdapter = new ClinicalPhenoAgeProductionAdapter({
      create: () => ({ snapshotId: '', evaluationId: '' }),
    });
    const persist = jest.fn(async () => persistenceResult());
    const executor = new ClinicalPhenoAgeRuntimePersistenceExecutor(
      new ClinicalPhenoAgeRuntimePersistenceOrchestrator(invalidAdapter),
      { persist },
      PERSISTENCE_METADATA,
      PERSISTENCE_LINEAGE,
    );

    await expect(executor.execute(input())).rejects.toEqual(
      expect.objectContaining({ code: 'invalid_result_identity' }),
    );
    expect(persist).not.toHaveBeenCalled();
  });

  test.each([
    ['boundary rejection', false],
    ['missing validated input', true],
  ])('fails closed with zero persist calls on %s', async (_label, valid) => {
    const validationOutcome: ValidationOutcome = Object.freeze({
      validationVersion: 'scientific-persistence-validation/1.0.0',
      validationPhase: 'pre_construction',
      valid,
      issues: Object.freeze(valid ? [] : [Object.freeze({
        code: 'request_id_mismatch' as const,
        path: 'result.requestId',
        message: 'Result requestId must match the persistence request requestId.',
      })]),
      validatedInput: null,
    });
    const persist = jest.fn(async () => persistenceResult());
    const executor = new ClinicalPhenoAgeRuntimePersistenceExecutor(
      { validate: async () => validationOutcome },
      { persist },
      PERSISTENCE_METADATA,
      PERSISTENCE_LINEAGE,
    );

    await expect(executor.execute(input())).rejects.toEqual(
      expect.objectContaining<Partial<ClinicalPhenoAgeRuntimePersistenceExecutorError>>({
        code: 'persistence_boundary_rejected',
        validationOutcome,
      }),
    );
    expect(persist).not.toHaveBeenCalled();
  });

  test('returns failed persistence results unchanged', async () => {
    const failed = persistenceResult('failed');
    const persist = jest.fn(async () => failed);
    const executor = new ClinicalPhenoAgeRuntimePersistenceExecutor(
      new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter()),
      { persist },
      PERSISTENCE_METADATA,
      PERSISTENCE_LINEAGE,
    );

    const returned = await executor.execute(input());

    expect(persist).toHaveBeenCalledTimes(1);
    expect(returned).toBe(failed);
  });

  test('propagates persistence exceptions unchanged after exactly one call', async () => {
    const exception = new PersistencePortException(
      'port_failure',
      'Persistence storage operation failed.',
    );
    const persist = jest.fn(async (): Promise<PersistenceResult> => {
      throw exception;
    });
    const executor = new ClinicalPhenoAgeRuntimePersistenceExecutor(
      new ClinicalPhenoAgeRuntimePersistenceOrchestrator(adapter()),
      { persist },
      PERSISTENCE_METADATA,
      PERSISTENCE_LINEAGE,
    );

    await expect(executor.execute(input())).rejects.toBe(exception);
    expect(persist).toHaveBeenCalledTimes(1);
  });

  test('has no runtime importer, activation, Supabase, RPC, or composition dependency', () => {
    const executorPath = join(
      ROOT,
      'src',
      'infrastructure',
      'scientificPersistence',
      'clinicalPhenoAgeRuntimePersistenceExecutor.ts',
    );
    const source = readFileSync(executorPath, 'utf8');

    expect(source).not.toMatch(
      /runtimeComposition|supabase|\.rpc\s*\(|featureFlag|activationRegistry/i,
    );
    expect(source).toContain('outcome.validatedInput');
    expect(source).toContain('this.persistenceService.persist(');
    expect(source).not.toMatch(/buildClinicalPhenoAgeRuntimeRequest|adapter\.evaluate/);

    const productionImporters = sourceFiles(join(ROOT, 'src'))
      .filter(path => !path.includes(`${join('src', '__tests__')}`))
      .filter(path => path !== executorPath)
      .filter(path => /clinicalPhenoAgeRuntimePersistenceExecutor/.test(
        readFileSync(path, 'utf8'),
      ));
    expect(productionImporters).toEqual([]);
  });
});
