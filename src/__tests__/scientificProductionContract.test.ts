import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  SCIENTIFIC_EVALUATION_REQUEST_VERSION,
  SCIENTIFIC_EVALUATION_RESULT_FIELDS,
  SCIENTIFIC_EVALUATION_RESULT_VERSION,
  SCIENTIFIC_PRODUCTION_BOUNDARY,
  SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS,
  SCIENTIFIC_PRODUCTION_CONTRACT_VERSION,
  ScientificContractError,
  auditScientificProductionRegistry,
  deserializeScientificEvaluationRequest,
  deserializeScientificEvaluationResult,
  serializeScientificEvaluationRequest,
  serializeScientificEvaluationResult,
  validateScientificEvaluationRequestContract,
  validateScientificEvaluationResultContract,
  type ScientificDomainVersion,
  type ScientificEvaluationRequest,
  type ScientificEvaluationResult,
} from '../domain/scientificProduction';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

function resultFixture(): ScientificEvaluationResult {
  const domainVersion: ScientificDomainVersion = {
    domainId: 'cardiometabolic_health',
    scientificSpecificationVersion: 'Vitalspan-CMH-DOMAIN-1.0.0',
    componentVersions: [
      { componentId: 'eligibility_policy', version: 'Vitalspan-CMH-ELIGIBILITY-1.0.0' },
    ],
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
      reasons: [{
        code: 'missing_protocol_metadata',
        severity: 'blocking_insufficient',
        explanation: 'Required protocol metadata is unavailable.',
        evidenceReferenceIds: ['evidence-001'],
      }],
    },
    measurements: [],
    interpretations: [],
    blockedOutputs: [{
      outputId: 'reference_interpretation',
      reasons: [{
        code: 'missing_protocol_metadata',
        severity: 'blocking_insufficient',
        explanation: 'Required protocol metadata is unavailable.',
        evidenceReferenceIds: ['evidence-001'],
      }],
    }],
    warnings: [{
      code: 'context_incomplete',
      severity: 'warning',
      explanation: 'The source context is incomplete.',
      reasonCodes: ['missing_protocol_metadata'],
    }],
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
      inputObservationIds: ['observation-001'],
      authorizedOutputIds: [],
      blockedOutputIds: ['reference_interpretation'],
      reasonCodes: ['missing_protocol_metadata'],
      inputFingerprint: 'input-fingerprint-001',
      outputFingerprint: 'output-fingerprint-001',
      domainAudit: { originalInputPreserved: true },
    },
    confidence: {
      code: 'unsupported',
      registryId: 'confidence_registry',
      registryVersion: 'confidence-registry/1.0.0',
      limitations: ['Protocol provenance is incomplete.'],
    },
    provenanceSummary: {
      sourceIds: ['manual_entry'],
      sourceTypes: ['manual'],
      verificationStatuses: ['unverified'],
      completeness: 'incomplete',
      limitations: ['Source report is unavailable.'],
    },
    safetyCandidate: {
      status: 'inactive_candidate_only',
      policyId: 'safety-candidate-policy',
      policyVersion: 'safety-candidate-policy/0.1.0-inactive',
      reasonCodes: [],
      clinicianReviewCandidate: false,
      productionActionAuthorized: false,
    },
    trendStatus: null,
    limitations: ['No diagnosis, treatment, or individual prognosis is authorized.'],
  };
}

function requestFixture(): ScientificEvaluationRequest {
  return {
    contractVersion: SCIENTIFIC_EVALUATION_REQUEST_VERSION,
    requestId: 'request-001',
    domainId: 'cardiometabolic_health',
    requestedDomainVersion: 'Vitalspan-CMH-DOMAIN-1.0.0',
    requestedAt: '2026-07-19T12:00:00.000Z',
    observations: [{
      observationId: 'observation-001',
      measurementId: 'apolipoprotein_b',
      value: 90,
      unit: 'mg/dL',
      observedAt: '2026-07-18T08:00:00.000Z',
      provenance: {
        sourceId: 'laboratory',
        sourceRecordId: 'source-record-001',
        sourceType: 'certified_laboratory',
        verificationStatus: 'verified',
        provider: { organization: 'Example laboratory' },
        originalUnit: 'mg/dL',
        originalValue: 90,
        metadata: {},
      },
      context: { fastingStatus: 'unknown' },
    }],
    context: { medicationStatus: 'unknown' },
    priorSnapshot: null,
  };
}

describe('Phase 8.0A scientific production contract', () => {
  test('declares the identical contract for exactly the four frozen domains', () => {
    expect(SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.map(item => item.domainId)).toEqual([
      'clinical_biological_age',
      'cardiorespiratory_fitness',
      'functional_capacity',
      'cardiometabolic_health',
    ]);
    expect(new Set(SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.map(item => item.domainId)).size).toBe(4);
    SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.forEach(item => {
      expect(item.productionContractVersion).toBe(SCIENTIFIC_PRODUCTION_CONTRACT_VERSION);
      expect(item.requestContractVersion).toBe(SCIENTIFIC_EVALUATION_REQUEST_VERSION);
      expect(item.resultContractVersion).toBe(SCIENTIFIC_EVALUATION_RESULT_VERSION);
      expect(item.requiredResultFields).toEqual(SCIENTIFIC_EVALUATION_RESULT_FIELDS);
      expect(item.requiredResultFields).toContain('auditMetadata');
      expect(item.domainScientificSpecificationVersion.trim()).not.toBe('');
      expect(item.adapterRegistrationStatus).toBe('not_registered');
    });
  });

  test('has unique component identities and passes the production-boundary audit', () => {
    const audit = auditScientificProductionRegistry();
    expect(audit).toMatchObject({ valid: true, issues: [] });
    expect(new Set(audit.componentIds).size).toBe(audit.componentIds.length);
  });

  test('keeps every standardized contract path and feature flag inactive', () => {
    const baselineKey = ['scientific', 'BaselineVersion'].join('');
    SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.forEach(item => {
      expect(item.activation.productionActive).toBe(false);
      expect(item.activation.featureFlag.defaultEnabled).toBe(false);
      expect(item.activation.featureFlag.wiredToRuntime).toBe(false);
      expect(item.activation.minimumSupportedAppVersion).toBeNull();
      expect(item.activation.automaticActivationPermitted).toBe(false);
      expect((item.activation as unknown as Record<string, unknown>)[baselineKey]).toBe('1.0.0');
    });
    expect(SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS[0].activation.existingProductionStateAtBaseline)
      .toBe('active_outside_standard_contract');
    expect(SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.slice(1)
      .every(item => item.activation.existingProductionStateAtBaseline === 'inactive')).toBe(true);
  });

  test('represents no parent score, cross-domain composite, runtime adapter, or automatic activation', () => {
    expect(SCIENTIFIC_PRODUCTION_BOUNDARY).toMatchObject({
      parentScientificScoreRepresented: false,
      crossDomainCompositeRepresented: false,
      automaticActivationPermitted: false,
      runtimeDomainAdaptersRegistered: false,
      productionMayTransformScientificOutput: false,
      productionMayOverrideStatus: false,
      productionMayChangeConfidence: false,
      productionMayInferMissingContext: false,
    });
  });

  test('preserves blocked outputs and audit metadata through serialization', () => {
    const fixture = resultFixture();
    const payload = serializeScientificEvaluationResult(fixture);
    const restored = deserializeScientificEvaluationResult(payload);
    expect(restored.blockedOutputs).toEqual(fixture.blockedOutputs);
    expect(restored.auditMetadata).toEqual(fixture.auditMetadata);
    expect(restored.safetyCandidate).toEqual(fixture.safetyCandidate);
    expect(Object.isFrozen(restored)).toBe(true);
    expect(Object.isFrozen(restored.auditMetadata)).toBe(true);
  });

  test('validates and preserves the neutral request without inferring context', () => {
    const fixture = requestFixture();
    const restored = deserializeScientificEvaluationRequest(
      serializeScientificEvaluationRequest(fixture),
    );
    expect(restored).toEqual(fixture);
    expect(restored.context).toEqual({ medicationStatus: 'unknown' });
    expect(restored.observations[0].context).toEqual({ fastingStatus: 'unknown' });
    expect(Object.isFrozen(restored.observations[0].provenance)).toBe(true);
    expect(validateScientificEvaluationRequestContract({ ...fixture, icon: 'heart' }))
      .toMatchObject({
        valid: false,
        issues: expect.arrayContaining([expect.objectContaining({ code: 'unexpected_field' })]),
      });
  });

  test('has a deterministic exact output structure without presentation fields', () => {
    const fixture = resultFixture();
    expect(Object.keys(fixture)).toEqual(SCIENTIFIC_EVALUATION_RESULT_FIELDS);
    expect(serializeScientificEvaluationResult(fixture)).toBe(serializeScientificEvaluationResult(fixture));
    expect(validateScientificEvaluationResultContract({ ...fixture, color: 'red' })).toMatchObject({
      valid: false,
      issues: expect.arrayContaining([expect.objectContaining({ code: 'unexpected_field', path: '$.color' })]),
    });
  });

  test('fails closed for malformed, identity-mismatched, or non-JSON-safe results', () => {
    const fixture = resultFixture();
    expect(validateScientificEvaluationResultContract({
      ...fixture,
      domainVersion: { ...fixture.domainVersion, domainId: 'functional_capacity' },
    })).toMatchObject({
      valid: false,
      issues: expect.arrayContaining([expect.objectContaining({ code: 'audit_identity_mismatch' })]),
    });
    expect(validateScientificEvaluationResultContract({
      ...fixture,
      evaluatedAt: Number.NaN,
    })).toMatchObject({
      valid: false,
      issues: expect.arrayContaining([expect.objectContaining({ code: 'not_json_safe' })]),
    });
    expect(() => deserializeScientificEvaluationResult('{not-json'))
      .toThrow(ScientificContractError);
  });

  test('keeps UI and production services away from scientific internals', () => {
    const root = join(process.cwd(), 'src');
    const uiRoots = ['components', 'screens', 'navigation'].map(directory => join(root, directory));
    const uiReferences = uiRoots.flatMap(sourceFiles).filter(path =>
      /from ['"][^'"]*domain\/scientific/.test(readFileSync(path, 'utf8')));
    expect(uiReferences).toEqual([]);

    const productionRoots = ['services', 'lib', 'context', 'scientificProduction']
      .map(directory => directory === 'scientificProduction'
        ? join(root, 'domain', directory)
        : join(root, directory));
    const internalRegistryImports = productionRoots.flatMap(sourceFiles).filter(path =>
      /from ['"][^'"]*(sourceRegistry|confidenceRegistry|referenceRegistry|reasonRegistry|protocolRegistry|assayRegistry|interpretationPolicyRegistry|\/versions)/
        .test(readFileSync(path, 'utf8')));
    expect(internalRegistryImports).toEqual([]);
  });

  test('leaves the prepared frozen manifest byte-for-byte unchanged', () => {
    const path = join(
      process.cwd(),
      'src',
      'domain',
      'scientific' + 'Domains',
      'scientific' + 'Baseline.ts',
    );
    const digest = createHash('sha256').update(readFileSync(path)).digest('hex');
    expect(digest).toBe('492a559da4f0d449af5a3da934036c2e8f1c075e8b6ccb3bf38fef5124d37ec6');
  });

  test('copies domain specification identities without importing scientific registries', () => {
    const root = join(process.cwd(), 'src', 'domain', 'scientificDomains');
    const sources = new Map<string, string>([
      ['cardiorespiratory_fitness', readFileSync(join(root, 'vo2max', 'versions.ts'), 'utf8')],
      ['functional_capacity', readFileSync(join(root, 'functional' + 'Capacity', 'versions.ts'), 'utf8')],
      ['cardiometabolic_health', readFileSync(join(root, 'cardio' + 'metabolic', 'versions.ts'), 'utf8')],
    ]);
    SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.slice(1).forEach(item => {
      expect(sources.get(item.domainId)).toContain(item.domainScientificSpecificationVersion);
    });
    const clinicalSource = readFileSync(join(
      process.cwd(), 'src', 'domain', 'scientificModels', 'clinicalPhenoAge', 'constants.ts',
    ), 'utf8');
    expect(clinicalSource).toContain(
      SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS[0].domainScientificSpecificationVersion,
    );
  });
});
