import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  SCIENTIFIC_EVALUATION_RESULT_VERSION,
  validateScientificEvaluationRequestContract,
  type ScientificJsonObject,
  type ScientificSnapshot,
} from '../domain/scientificProduction';
import {
  ClinicalPhenoAgeProductionAdapter,
} from '../infrastructure/scientificProduction/clinicalPhenoAgeAdapter';
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

function entry(
  biomarkerId: string,
  value: number,
  unit: string,
  overrides: Partial<StoredEntry> = {},
): StoredEntry {
  return {
    id: `laboratory-record-${biomarkerId}`,
    biomarkerId,
    value,
    unit,
    date: OBSERVED_AT,
    source: 'Validation Laboratory',
    notes: 'not transported',
    ...overrides,
  };
}

function entries(): Map<string, StoredEntry> {
  const result = new Map(LABS.map(([biomarkerId, value, unit]) => [
    biomarkerId,
    entry(biomarkerId, value, unit),
  ]));
  result.set('albumin', entry('albumin', 44, 'g/L', {
    reportedValue: 4.4,
    reportedUnit: 'g/dL',
    sourceLabRange: {
      lowerBound: 3.5,
      upperBound: 5.2,
      unit: 'g/dL',
      laboratoryName: 'Validation Laboratory',
    },
  }));
  return result;
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
    observationContext: {},
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

function priorSnapshot(): ScientificSnapshot {
  const domainVersion = {
    domainId: 'clinical_biological_age' as const,
    scientificSpecificationVersion: 'clinical-phenoage/1.0.0',
    componentVersions: [],
  };
  return {
    contractVersion: SCIENTIFIC_EVALUATION_RESULT_VERSION,
    snapshotId: 'prior-snapshot-001',
    domainId: 'clinical_biological_age',
    domainVersion,
    evaluatedAt: '2026-07-20T12:00:00.000Z',
    status: { code: 'calculated', authority: 'scientific_domain', reasons: [] },
    measurements: [],
    interpretations: [],
    blockedOutputs: [],
    warnings: [],
    evidence: [],
    auditMetadata: {
      evaluationId: 'prior-evaluation-001',
      evaluatorId: 'clinical-adapter',
      evaluatorVersion: 'clinical-adapter/1.0.0',
      requestContractVersion: 'scientific-evaluation-request/1.0.0',
      resultContractVersion: SCIENTIFIC_EVALUATION_RESULT_VERSION,
      domainVersion,
      inputObservationIds: [],
      authorizedOutputIds: [],
      blockedOutputIds: [],
      reasonCodes: [],
      inputFingerprint: null,
      outputFingerprint: null,
      domainAudit: {},
    },
    confidence: { code: 'very_high', registryId: null, registryVersion: null, limitations: [] },
    provenanceSummary: {
      sourceIds: [], sourceTypes: [], verificationStatuses: [], completeness: 'unknown', limitations: [],
    },
    safetyCandidate: null,
    trendStatus: null,
    limitations: [],
  };
}

function builderInput(
  overrides: Partial<ClinicalPhenoAgeRuntimeRequestBuilderInput> = {},
): ClinicalPhenoAgeRuntimeRequestBuilderInput {
  const latestEntries = entries();
  return {
    requestId: 'clinical-runtime-request-001',
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
      population: { sex: 'not_recorded' },
    },
    priorSnapshot: priorSnapshot(),
    ...overrides,
  };
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

function adapter(): ClinicalPhenoAgeProductionAdapter {
  return new ClinicalPhenoAgeProductionAdapter({
    create: () => ({
      snapshotId: 'runtime-integration-snapshot-001',
      evaluationId: 'runtime-integration-evaluation-001',
    }),
  });
}

describe('inactive Clinical PhenoAge runtime request builder', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(REQUESTED_AT));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('constructs the complete request from verified runtime observations', () => {
    const request = buildClinicalPhenoAgeRuntimeRequest(builderInput());

    expect(validateScientificEvaluationRequestContract(request)).toEqual({ valid: true, issues: [] });
    expect(request).toMatchObject({
      contractVersion: 'scientific-evaluation-request/1.0.0',
      requestId: 'clinical-runtime-request-001',
      domainId: 'clinical_biological_age',
      requestedDomainVersion: 'clinical-phenoage/1.0.0',
      requestedAt: REQUESTED_AT,
      context: {
        runtime: { source: 'verified_local_health_records' },
        population: { sex: 'not_recorded' },
      },
      priorSnapshot: { snapshotId: 'prior-snapshot-001' },
    });
    expect(request.observations.map(observation => observation.measurementId)).toEqual([
      'chronological_age', 'albumin', 'creatinine', 'glucose', 'crp',
      'lymphocyte_percent', 'mean_cell_volume', 'red_cell_distribution_width',
      'alkaline_phosphatase', 'white_blood_cell_count',
    ]);
  });

  test('preserves stable record identities and exact original values and units', () => {
    const request = buildClinicalPhenoAgeRuntimeRequest(builderInput());
    const age = request.observations[0];
    const albumin = request.observations[1];

    expect(age).toMatchObject({
      observationId: 'profile-age-record-001',
      value: 40,
      unit: 'years',
      provenance: {
        sourceRecordId: 'profile-age-record-001',
        sourceId: 'Vitalspan Profile',
        verificationStatus: 'verified',
      },
    });
    expect(albumin).toMatchObject({
      observationId: 'laboratory-record-albumin',
      value: 4.4,
      unit: 'g/dL',
      provenance: {
        sourceRecordId: 'laboratory-record-albumin',
        originalValue: 4.4,
        originalUnit: 'g/dL',
        metadata: {
          verification: {
            authorityId: 'verified-health-record-import',
            verifiedAt: VERIFIED_AT,
          },
          runtime: {
            biomarkerId: 'albumin',
            sourceLabRange: {
              lowerBound: 3.5,
              upperBound: 5.2,
              unit: 'g/dL',
              laboratoryName: 'Validation Laboratory',
            },
          },
        },
      },
    });
  });

  test('is deterministic, deeply immutable, and does not retain runtime references', () => {
    const input = builderInput();
    const first = buildClinicalPhenoAgeRuntimeRequest(input);
    const second = buildClinicalPhenoAgeRuntimeRequest(input);

    expect(first).toEqual(second);
    expect(first.observations).not.toBe(input.latestEntries);
    expect(first.context).not.toBe(input.context);
    expect(first.priorSnapshot).not.toBe(input.priorSnapshot);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.observations)).toBe(true);
    expect(Object.isFrozen(first.observations[0].provenance.metadata)).toBe(true);
    expect(Object.isFrozen(first.context)).toBe(true);
    expect(Object.isFrozen(first.priorSnapshot)).toBe(true);
  });

  test('rejects every included record without matching verified provenance', () => {
    const input = builderInput();
    const missing = new Map(input.verificationBySourceRecordId);
    missing.delete('laboratory-record-albumin');

    expect(() => buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      verificationBySourceRecordId: missing,
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'missing_verification',
    }));
  });

  test('rejects mismatched source, authority, chronology, and partial raw provenance', () => {
    const input = builderInput();
    const sourceMismatch = new Map(input.verificationBySourceRecordId);
    sourceMismatch.set('laboratory-record-albumin', {
      ...sourceMismatch.get('laboratory-record-albumin') as ClinicalPhenoAgeRuntimeVerification,
      sourceId: 'Different Laboratory',
    });
    expect(() => buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      verificationBySourceRecordId: sourceMismatch,
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'verification_mismatch',
    }));

    const partialEntries = new Map(input.latestEntries);
    partialEntries.set('albumin', {
      ...partialEntries.get('albumin') as StoredEntry,
      reportedUnit: undefined,
    });
    expect(() => buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      latestEntries: partialEntries,
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'invalid_source_record',
    }));

    const futureVerification = new Map(input.verificationBySourceRecordId);
    futureVerification.set('laboratory-record-albumin', {
      ...futureVerification.get('laboratory-record-albumin') as ClinicalPhenoAgeRuntimeVerification,
      verifiedAt: '2026-07-22T00:00:00.000Z',
    });
    expect(() => buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      verificationBySourceRecordId: futureVerification,
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'verification_mismatch',
    }));
  });

  test('rejects duplicate observation identities across runtime records', () => {
    const input = builderInput();
    const duplicateEntries = new Map(input.latestEntries);
    duplicateEntries.set('albumin', {
      ...duplicateEntries.get('albumin') as StoredEntry,
      id: 'laboratory-record-creatinine',
    });

    expect(() => buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      latestEntries: duplicateEntries,
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'duplicate_observation_identity',
    }));
  });

  test('allows absent scientific inputs but never fabricates observations for them', () => {
    const input = builderInput();
    const incomplete = new Map(input.latestEntries);
    incomplete.delete('albumin');
    const request = buildClinicalPhenoAgeRuntimeRequest({ ...input, latestEntries: incomplete });

    expect(request.observations).toHaveLength(9);
    expect(request.observations.some(observation => observation.measurementId === 'albumin'))
      .toBe(false);
  });

  test('rejects malformed, future, cross-domain, and result-shaped prior snapshots', () => {
    const input = builderInput();
    expect(() => buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      priorSnapshot: {
        ...priorSnapshot(),
        domainId: 'cardiorespiratory_fitness',
      },
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'invalid_prior_snapshot',
    }));
    expect(() => buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      priorSnapshot: {
        ...priorSnapshot(),
        evaluatedAt: '2026-07-22T00:00:00.000Z',
      },
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'invalid_prior_snapshot',
    }));
    expect(() => buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      priorSnapshot: {
        ...priorSnapshot(),
        requestId: 'result-only-field',
      } as unknown as ScientificSnapshot,
    })).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'invalid_prior_snapshot',
    }));
  });

  test('rejects invalid request identity and cyclic or excessive context', () => {
    expect(() => buildClinicalPhenoAgeRuntimeRequest(builderInput({ requestId: '  ' })))
      .toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
        code: 'invalid_request_identity',
      }));

    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => buildClinicalPhenoAgeRuntimeRequest(builderInput({
      context: cyclic as ScientificJsonObject,
    }))).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'invalid_source_record',
    }));

    let nested: Record<string, unknown> = {};
    for (let index = 0; index < 40; index += 1) nested = { nested };
    expect(() => buildClinicalPhenoAgeRuntimeRequest(builderInput({
      context: nested as ScientificJsonObject,
    }))).toThrow(expect.objectContaining<Partial<ClinicalPhenoAgeRuntimeRequestBuilderError>>({
      code: 'json_complexity_exceeded',
    }));
  });

  test('feeds the complete builder request directly to the inactive Clinical adapter', async () => {
    const input = builderInput();
    const verificationBySourceRecordId = new Map(input.verificationBySourceRecordId);
    const albuminVerification = verificationBySourceRecordId.get(
      'laboratory-record-albumin',
    ) as ClinicalPhenoAgeRuntimeVerification;
    verificationBySourceRecordId.set('laboratory-record-albumin', {
      ...albuminVerification,
      observationContext: { specimen: 'serum', fastingStatus: 'verified' },
    });
    const request = buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      verificationBySourceRecordId,
    });

    const result = await adapter().evaluate(request);

    expect(request.context).toEqual(input.context);
    expect(request.priorSnapshot).toEqual(input.priorSnapshot);
    expect(request.observations[1].context).toEqual({
      specimen: 'serum',
      fastingStatus: 'verified',
    });
    expect(result.status.code).toBe('calculated');
    expect(new Map(result.measurements.map(measurement => [
      measurement.measurementId,
      measurement.value,
    ]))).toEqual(new Map([
      ['phenotypicAgeYears', 31.514754353039137],
      ['chronologicalAgeYears', 40],
      ['ageDifferenceYears', -8.485245646960863],
    ]));
    const evaluation = result.auditMetadata.domainAudit.clinicalPhenoAgeEvaluation as {
      eligibility: {
        authorizedEvidence: readonly {
          inputId: string;
          measurementId: string;
          measuredAt: string | null;
        }[];
      };
    };
    expect(evaluation.eligibility.authorizedEvidence.find(
      evidence => evidence.inputId === 'chronological_age',
    )).toEqual(expect.objectContaining({
      measurementId: 'profile-age-record-001',
      measuredAt: '2026-07-10T09:00:00.000Z',
    }));
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
  });

  test('keeps calculation deterministic and independent of context and prior snapshot', async () => {
    const request = buildClinicalPhenoAgeRuntimeRequest(builderInput());
    const withoutCrossSectionalMetadata = {
      ...request,
      context: {},
      priorSnapshot: null,
    };
    const productionAdapter = adapter();

    const first = await productionAdapter.evaluate(request);
    const second = await productionAdapter.evaluate(request);
    const withoutMetadata = await productionAdapter.evaluate(withoutCrossSectionalMetadata);

    expect(second).toEqual(first);
    expect(withoutMetadata).toEqual(first);
  });

  test('preserves blocked-result behavior for an incomplete builder request', async () => {
    const input = builderInput();
    const incomplete = new Map(input.latestEntries);
    incomplete.delete('albumin');
    const request = buildClinicalPhenoAgeRuntimeRequest({
      ...input,
      latestEntries: incomplete,
    });

    const result = await adapter().evaluate(request);

    expect(result.status.code).toBe('unavailable');
    expect(result.status.reasons.map(reason => reason.code)).toContain('missing_required_input');
    expect(result.measurements).toEqual([]);
    expect(result.auditMetadata.authorizedOutputIds).toEqual([]);
    expect(result.auditMetadata.blockedOutputIds).toEqual([
      'phenotypicAgeYears', 'chronologicalAgeYears', 'ageDifferenceYears',
    ]);
  });

  test('is imported only by the inactive persistence orchestrator', () => {
    const builderPath = join(
      ROOT,
      'src',
      'infrastructure',
      'scientificProduction',
      'clinicalPhenoAgeRuntimeRequestBuilder.ts',
    );
    const source = readFileSync(builderPath, 'utf8');
    expect(source).not.toMatch(
      /PersistenceService|scientificPersistence|runtimeComposition|supabase|\.rpc\(/,
    );

    const importers = sourceFiles(join(ROOT, 'src'))
      .filter(path => !path.includes(`${join('src', '__tests__')}`))
      .filter(path => path !== builderPath)
      .filter(path => /clinicalPhenoAgeRuntimeRequestBuilder/.test(readFileSync(path, 'utf8')));
    expect(importers).toEqual([join(
      ROOT,
      'src',
      'infrastructure',
      'scientificPersistence',
      'clinicalPhenoAgeRuntimePersistenceOrchestrator.ts',
    )]);
  });
});
