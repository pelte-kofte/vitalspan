import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  SCIENTIFIC_EVALUATION_REQUEST_VERSION,
  SCIENTIFIC_PRODUCTION_CONTRACT_VERSION,
  validateScientificEvaluationRequestContract,
  validateScientificEvaluationResultContract,
  type ScientificEvaluationRequest,
  type ScientificObservation,
  type ScientificSnapshot,
} from '../domain/scientificProduction';
import {
  CLINICAL_PHENOAGE_PRODUCTION_ADAPTER_ID,
  CLINICAL_PHENOAGE_PRODUCTION_ADAPTER_VERSION,
  CLINICAL_PHENOAGE_PRODUCTION_DOMAIN_VERSION,
  ClinicalPhenoAgeAdapterError,
  ClinicalPhenoAgeProductionAdapter,
  createClinicalPhenoAgeEvaluationRequest,
} from '../infrastructure/scientificProduction/clinicalPhenoAgeAdapter';

const ROOT = join(__dirname, '..', '..');
const NOW = new Date('2026-07-21T12:00:00.000Z');
const COLLECTION = '2026-07-10T08:00:00.000Z';

const LAB_FIXTURE = [
  ['albumin', 4.4, 'g/dL'],
  ['creatinine', 0.9, 'mg/dL'],
  ['glucose', 90, 'mg/dL'],
  ['crp', 1, 'mg/L'],
  ['lymphocyte_percent', 30, '%'],
  ['mean_cell_volume', 90, 'fL'],
  ['red_cell_distribution_width', 13, '%'],
  ['alkaline_phosphatase', 65, 'IU/L'],
  ['white_blood_cell_count', 6, '10^9/L'],
] as const;

function ageObservation(): ScientificObservation {
  return {
    observationId: 'clinical-age-observation-001',
    measurementId: 'chronological_age',
    value: 40,
    unit: 'years',
    observedAt: NOW.toISOString(),
    provenance: {
      sourceId: 'vitalspan-profile',
      sourceRecordId: 'profile-age-record-001',
      sourceType: 'chronological_record',
      verificationStatus: 'verified',
      provider: {},
      originalUnit: 'years',
      originalValue: 40,
      metadata: {},
    },
    context: {},
  };
}

function labObservation(
  inputId: string,
  value: number,
  unit: string,
): ScientificObservation {
  const observationId = `clinical-laboratory-observation-${inputId}`;
  return {
    observationId,
    measurementId: inputId,
    value,
    unit,
    observedAt: COLLECTION,
    provenance: {
      sourceId: 'Validation Laboratory',
      sourceRecordId: `laboratory-record-${inputId}`,
      sourceType: 'laboratory',
      verificationStatus: 'verified',
      provider: { name: 'Validation Laboratory' },
      originalUnit: unit,
      originalValue: value,
      metadata: {},
    },
    context: {},
  };
}

function observations(): ScientificObservation[] {
  return [
    ageObservation(),
    ...LAB_FIXTURE.map(([inputId, value, unit]) => (
      labObservation(inputId, value, unit)
    )),
  ];
}

function request(
  suppliedObservations: readonly ScientificObservation[] = observations(),
): ScientificEvaluationRequest {
  return createClinicalPhenoAgeEvaluationRequest({
    requestId: 'clinical-request-001',
    requestedAt: NOW.toISOString(),
    observations: suppliedObservations,
  });
}

function adapter(): ClinicalPhenoAgeProductionAdapter {
  return new ClinicalPhenoAgeProductionAdapter({
    create: () => ({
      snapshotId: 'clinical-snapshot-001',
      evaluationId: 'clinical-evaluation-001',
    }),
  });
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

describe('inactive Phase 8.0A Clinical PhenoAge production adapter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('implements the request-driven production port without changing scientific values', async () => {
    const productionAdapter = adapter();
    const evaluationRequest = request();
    const result = await productionAdapter.evaluate(evaluationRequest);

    expect(productionAdapter).toMatchObject({
      domainId: 'clinical_biological_age',
      contractVersion: SCIENTIFIC_PRODUCTION_CONTRACT_VERSION,
      domainVersion: CLINICAL_PHENOAGE_PRODUCTION_DOMAIN_VERSION,
    });
    expect(validateScientificEvaluationRequestContract(evaluationRequest)).toEqual({
      valid: true,
      issues: [],
    });
    expect(validateScientificEvaluationResultContract(result)).toEqual({
      valid: true,
      issues: [],
    });
    expect(result).toMatchObject({
      requestId: evaluationRequest.requestId,
      snapshotId: 'clinical-snapshot-001',
      domainId: evaluationRequest.domainId,
      evaluatedAt: NOW.toISOString(),
      status: { code: 'calculated', authority: 'scientific_domain', reasons: [] },
      auditMetadata: {
        evaluationId: 'clinical-evaluation-001',
        evaluatorId: CLINICAL_PHENOAGE_PRODUCTION_ADAPTER_ID,
        evaluatorVersion: CLINICAL_PHENOAGE_PRODUCTION_ADAPTER_VERSION,
      },
    });
    const measurements = new Map(result.measurements.map(item => [item.measurementId, item.value]));
    expect(measurements).toEqual(new Map([
      ['phenotypicAgeYears', 33.18650777523345],
      ['chronologicalAgeYears', 40],
      ['ageDifferenceYears', -6.813492224766549],
    ]));
  });

  test('uses exactly the frozen Scientific Baseline component identities and versions', () => {
    expect(CLINICAL_PHENOAGE_PRODUCTION_DOMAIN_VERSION).toEqual({
      domainId: 'clinical_biological_age',
      scientificSpecificationVersion: 'clinical-phenoage/1.0.0',
      componentVersions: [
        {
          componentId: 'clinical_biological_age:scientific_specification',
          version: 'clinical-phenoage/1.0.0',
        },
        {
          componentId: 'clinical_biological_age:measurement_registry',
          version: 'clinical-phenoage-canonical-units/1.0.0',
        },
        {
          componentId: 'clinical_biological_age:validation_policy',
          version: 'clinical-phenoage-canonical-units/1.0.0',
        },
        {
          componentId: 'clinical_biological_age:eligibility_policy',
          version: 'clinical-phenoage/1.0.0',
        },
        {
          componentId: 'clinical_biological_age:coefficient_registry',
          version: 'clinical-phenoage-coefficients/1.0.0',
        },
        {
          componentId: 'clinical_biological_age:normalization_contract',
          version: 'clinical-phenoage-canonical-units/1.0.0',
        },
        {
          componentId: 'clinical_biological_age:implementation',
          version: 'vitalspan-clinical-phenoage/1.0.0',
        },
      ],
    });
  });

  test('binds original provenance to the normalized values actually evaluated', async () => {
    const valid = request();
    const changed = valid.observations.map(observation => (
      observation.measurementId === 'albumin'
        ? {
          ...observation,
          provenance: { ...observation.provenance, originalValue: 4.5 },
        }
        : observation
    ));
    expect(() => createClinicalPhenoAgeEvaluationRequest({
      requestId: 'clinical-request-mismatched-provenance',
      requestedAt: NOW.toISOString(),
      observations: changed,
    })).toThrow(
      expect.objectContaining<Partial<ClinicalPhenoAgeAdapterError>>({
        code: 'provenance_incomplete',
      }),
    );

    const changedSource = valid.observations.map(observation => (
      observation.measurementId === 'albumin'
        ? {
          ...observation,
          value: 4.5,
          provenance: { ...observation.provenance, originalValue: 4.5 },
        }
        : observation
    ));
    const baselineResult = await adapter().evaluate(valid);
    const changedResult = await adapter().evaluate(createClinicalPhenoAgeEvaluationRequest({
      requestId: 'clinical-request-changed-source',
      requestedAt: NOW.toISOString(),
      observations: changedSource,
    }));
    expect(changedResult.measurements[0].value).not.toBe(baselineResult.measurements[0].value);
  });

  test('keeps chronological observation and source-record identities separate', async () => {
    const evaluationRequest = request();
    const result = await adapter().evaluate(evaluationRequest);
    const evaluation = result.auditMetadata.domainAudit.clinicalPhenoAgeEvaluation as {
      scientificResult: { inputSnapshot: Array<{ id: string; measurementId: string }> };
    };
    expect(evaluation.scientificResult.inputSnapshot.find(
      input => input.id === 'chronological_age',
    )?.measurementId).toBe('clinical-age-observation-001');
    expect(evaluationRequest.observations.find(
      observation => observation.measurementId === 'chronological_age',
    )?.provenance.sourceRecordId).toBe('profile-age-record-001');
  });

  test('does not invent warning identities or a confidence-registry version', async () => {
    const result = await adapter().evaluate(request());
    const warningTexts = [
      'Interpret only with the source laboratory context and the scientific limitations retained in this result.',
      'No clinical recommendation or causal interpretation is produced.',
    ];

    expect(result.warnings.filter(warning => warning.severity === 'warning')
      .map(warning => warning.code)).toEqual(expect.arrayContaining(warningTexts));
    expect(result.warnings.map(warning => warning.code)).not.toContain('clinical_phenoage_warning_1');
    expect(result.confidence).toMatchObject({
      code: 'very_high',
      registryId: null,
      registryVersion: null,
    });
  });

  test('preserves every legacy runtime value in opaque domain audit', async () => {
    const result = await adapter().evaluate(request());
    const evaluation = result.auditMetadata.domainAudit.clinicalPhenoAgeEvaluation as {
      scientificResult: Record<string, unknown>;
      eligibility: Record<string, unknown>;
      requirements: readonly Record<string, unknown>[];
    };

    expect(evaluation.scientificResult).toMatchObject({
      phenotypicAgeYears: result.measurements[0].value,
      chronologicalAgeYears: result.measurements[1].value,
      ageDifferenceYears: result.measurements[2].value,
      precision: {
        intermediateRounding: 'none',
        outputRounding: 'none',
        presentationRounding: 'not_applied',
      },
    });
    expect(evaluation.eligibility).toBeDefined();
    expect(evaluation.requirements).toHaveLength(9);
  });

  test('returns an authoritative blocked result for missing scientific inputs', async () => {
    const incomplete = request(observations().filter(
      observation => observation.measurementId !== 'albumin',
    ));
    const result = await adapter().evaluate(incomplete);

    expect(result.status.code).toBe('unavailable');
    expect(result.status.reasons.map(reason => reason.code)).toContain('missing_required_input');
    expect(result.measurements).toEqual([]);
    expect(result.auditMetadata.authorizedOutputIds).toEqual([]);
    expect(result.auditMetadata.blockedOutputIds).toEqual([
      'phenotypicAgeYears', 'chronologicalAgeYears', 'ageDifferenceYears',
    ]);
    expect(result.blockedOutputs).toHaveLength(3);
    expect(validateScientificEvaluationResultContract(result).valid).toBe(true);
  });

  test('accepts valid context and prior snapshots without changing cross-sectional outputs', async () => {
    const valid = request();
    const baseline = await adapter().evaluate(valid);
    const { requestId: _priorRequestId, ...priorSnapshot } = baseline;
    const withRuntimeContract = await adapter().evaluate({
      ...valid,
      observations: valid.observations.map((observation, index) => index === 0 ? {
        ...observation,
        context: { runtimeRecordType: 'verified_profile_age' },
      } : observation),
      context: { runtime: { source: 'verified_local_health_records' } },
      priorSnapshot,
    });

    expect(withRuntimeContract.measurements).toEqual(baseline.measurements);
    expect(withRuntimeContract.status).toEqual(baseline.status);
    await expect(adapter().evaluate({
      ...valid,
      priorSnapshot: {
        ...priorSnapshot,
        requestId: 'result-only-field',
      } as unknown as ScientificSnapshot,
    })).rejects.toEqual(expect.objectContaining<Partial<ClinicalPhenoAgeAdapterError>>({
      code: 'invalid_prior_snapshot',
    }));
  });

  test('rejects malformed timestamps and incomplete provenance before evaluation', async () => {
    expect(() => createClinicalPhenoAgeEvaluationRequest({
      requestId: 'invalid-time',
      requestedAt: 'not-a-timestamp',
      observations: observations(),
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeAdapterError>>({
      code: 'invalid_request',
    }));

    const unknown = observations().map(observation => ({
      ...observation,
      provenance: { ...observation.provenance, verificationStatus: 'unknown' },
    }));
    expect(() => request(unknown)).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeAdapterError>>({
      code: 'provenance_incomplete',
    }));
  });

  test('rejects circular and over-deep JSON without recursive stack failure', async () => {
    const circularContext: Record<string, unknown> = {};
    circularContext.self = circularContext;
    const cyclic = {
      ...request(),
      context: circularContext,
    } as unknown as ScientificEvaluationRequest;
    await expect(adapter().evaluate(cyclic)).rejects.toEqual(
      expect.objectContaining<Partial<ClinicalPhenoAgeAdapterError>>({
        code: 'invalid_request',
      }),
    );

    let nested: Record<string, unknown> = {};
    for (let index = 0; index < 40; index += 1) nested = { nested };
    await expect(adapter().evaluate({
      ...request(),
      context: nested,
    } as ScientificEvaluationRequest)).rejects.toEqual(
      expect.objectContaining<Partial<ClinicalPhenoAgeAdapterError>>({
        code: 'json_complexity_exceeded',
      }),
    );
  });

  test('returns isolated immutable request and result objects', async () => {
    const source = observations();
    const evaluationRequest = request(source);
    const result = await adapter().evaluate(evaluationRequest);

    expect(evaluationRequest.observations).not.toBe(source);
    expect(Object.isFrozen(evaluationRequest)).toBe(true);
    expect(Object.isFrozen(evaluationRequest.observations[0].provenance)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.measurements)).toBe(true);
    expect(Object.isFrozen(result.auditMetadata.domainAudit)).toBe(true);
  });

  test('is imported only by the inactive persistence orchestrator', () => {
    const adapterPath = join(
      ROOT,
      'src',
      'infrastructure',
      'scientificProduction',
      'clinicalPhenoAgeAdapter.ts',
    );
    const adapterSource = readFileSync(adapterPath, 'utf8');
    expect(adapterSource).not.toMatch(
      /scientificPersistence|runtimeComposition|SCIENTIFIC_PERSISTENCE_SERVICE|supabase|\.rpc\(/,
    );

    const productionImporters = sourceFiles(join(ROOT, 'src'))
      .filter(path => !path.includes(`${join('src', '__tests__')}`))
      .filter(path => path !== adapterPath)
      .filter(path => /clinicalPhenoAgeAdapter/.test(readFileSync(path, 'utf8')));
    expect(productionImporters).toEqual([join(
      ROOT,
      'src',
      'infrastructure',
      'scientificPersistence',
      'clinicalPhenoAgeRuntimePersistenceOrchestrator.ts',
    )]);
  });

  test('rejects a request for any version outside the frozen baseline', async () => {
    const unsupported = {
      ...request(),
      contractVersion: SCIENTIFIC_EVALUATION_REQUEST_VERSION,
      requestedDomainVersion: 'clinical-phenoage/2.0.0',
    } as ScientificEvaluationRequest;
    await expect(adapter().evaluate(unsupported)).rejects.toEqual(
      expect.objectContaining<Partial<ClinicalPhenoAgeAdapterError>>({
        code: 'unsupported_domain_version',
      }),
    );
  });
});
