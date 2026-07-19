import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import ts from 'typescript';

import {
  PersistenceBoundary,
  PersistencePortException,
  PersistenceService,
  type PersistenceAudit,
  type PersistenceEnvelope,
  type PersistenceLineage,
  type PersistenceMetadata,
  type PersistencePort,
  type PersistenceResult,
  type ValidatedPersistenceInput,
} from '../domain/scientificPersistence';
import { postConstructionValidation } from '../domain/scientificPersistence/validation';
import {
  SCIENTIFIC_EVALUATION_REQUEST_FIELDS,
  SCIENTIFIC_EVALUATION_REQUEST_VERSION,
  SCIENTIFIC_EVALUATION_RESULT_FIELDS,
  SCIENTIFIC_EVALUATION_RESULT_VERSION,
  SCIENTIFIC_PRODUCTION_BOUNDARY,
  SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS,
  type ScientificDomainVersion,
  type ScientificEvaluationRequest,
  type ScientificEvaluationResult,
  type ScientificSnapshot,
} from '../domain/scientificProduction';

const ROOT = process.cwd();
const SRC_ROOT = join(ROOT, 'src');
const PERSISTENCE_ROOT = join(SRC_ROOT, 'domain', 'scientificPersistence');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : /\.tsx?$/.test(path)
        ? [path]
        : [];
  });
}

function source(path: string): string {
  return readFileSync(path, 'utf8');
}

function persistenceSource(name: string): string {
  return source(join(PERSISTENCE_ROOT, name));
}

function syntaxTree(path: string): ts.SourceFile {
  return ts.createSourceFile(
    path,
    source(path),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
}

function moduleSpecifiers(path: string): string[] {
  return syntaxTree(path).statements.flatMap(statement => {
    if ((ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement))
      && statement.moduleSpecifier !== undefined
      && ts.isStringLiteral(statement.moduleSpecifier)) {
      return [statement.moduleSpecifier.text];
    }
    return [];
  });
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

function resultFixture(): ScientificEvaluationResult {
  const domainVersion: ScientificDomainVersion = {
    domainId: 'cardiometabolic_health',
    scientificSpecificationVersion: 'Vitalspan-CMH-DOMAIN-1.0.0',
    componentVersions: [{
      componentId: 'eligibility_policy',
      version: 'Vitalspan-CMH-ELIGIBILITY-1.0.0',
    }],
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

function snapshotFixture(): ScientificSnapshot {
  const { requestId: _requestId, ...snapshot } = resultFixture();
  return snapshot;
}

function validatedInput(
  request: ScientificEvaluationRequest = requestFixture(),
  result: ScientificEvaluationResult = resultFixture(),
): ValidatedPersistenceInput {
  const outcome = PersistenceBoundary.validate(request, result);
  if (!outcome.valid || outcome.validatedInput === null) {
    throw new Error('Fixture request and result did not pass persistence boundary validation.');
  }
  return outcome.validatedInput;
}

function metadataFixture(): PersistenceMetadata {
  return Object.freeze({
    contractVersion: 'scientific-persistence-metadata/1.0.0',
    implementationId: 'test-persistence-port',
    implementationVersion: '1.0.0',
    schemaVersion: '1.0.0',
    modelVersion: '1.0.0',
  });
}

function lineageFixture(parentPersistenceId?: string): PersistenceLineage {
  return Object.freeze(parentPersistenceId === undefined
    ? { contractVersion: 'scientific-persistence-lineage/1.0.0' }
    : {
      contractVersion: 'scientific-persistence-lineage/1.0.0',
      parentPersistenceId,
    });
}

function auditFixture(input: ValidatedPersistenceInput): PersistenceAudit {
  return Object.freeze({
    contractVersion: 'scientific-persistence-audit/1.0.0',
    boundaryVersion: 'scientific-persistence-boundary/1.0.0',
    validationVersion: 'scientific-persistence-validation/1.0.0',
    inputContractVersion: input.contractVersion,
    requestContractVersion: input.request.contractVersion,
    resultContractVersion: input.result.contractVersion,
    validationStatus: 'passed',
    validationIssueCodes: Object.freeze([] as const),
  });
}

function envelopeFixture(
  input: ValidatedPersistenceInput = validatedInput(),
  metadata: PersistenceMetadata = metadataFixture(),
  lineage: PersistenceLineage = lineageFixture(),
  audit: PersistenceAudit = auditFixture(input),
): PersistenceEnvelope {
  return Object.freeze({
    contractVersion: 'scientific-persistence-envelope/1.0.0',
    input,
    metadata,
    lineage,
    audit,
  });
}

function resultOutcome(
  status: 'succeeded' | 'failed' = 'succeeded',
): PersistenceResult {
  return Object.freeze(status === 'succeeded'
    ? {
      contractVersion: 'scientific-persistence-result/1.0.0',
      status,
      persistenceId: 'port-created-id',
      persistedAt: 'port-created-time',
      issues: Object.freeze([]),
      portOperationInvoked: true,
    }
    : {
      contractVersion: 'scientific-persistence-result/1.0.0',
      status,
      persistenceId: null,
      persistedAt: null,
      issues: Object.freeze([Object.freeze({
        code: 'port_failure' as const,
        path: null,
        message: 'The test port could not persist the envelope.',
      })]),
      portOperationInvoked: true,
    });
}

class RecordingPort implements PersistencePort {
  readonly contractVersion = 'scientific-persistence-port/1.0.0' as const;
  readonly calls: PersistenceEnvelope[] = [];

  constructor(
    private readonly operation: (envelope: PersistenceEnvelope) => Promise<PersistenceResult>,
  ) {}

  save(envelope: PersistenceEnvelope): Promise<PersistenceResult> {
    this.calls.push(envelope);
    return this.operation(envelope);
  }
}

describe('Phase 8.0B scientific persistence architecture', () => {
  describe('public API and Phase 8.0A preservation', () => {
    test('exports exactly the eleven approved names through explicit named exports', () => {
      const indexPath = join(PERSISTENCE_ROOT, 'index.ts');
      const tree = syntaxTree(indexPath);
      const exportedNames: string[] = [];

      tree.statements.forEach(statement => {
        if (!ts.isExportDeclaration(statement)) return;
        expect(statement.exportClause).toBeDefined();
        expect(ts.isNamedExports(statement.exportClause!)).toBe(true);
        if (statement.exportClause !== undefined && ts.isNamedExports(statement.exportClause)) {
          statement.exportClause.elements.forEach(element => exportedNames.push(element.name.text));
        }
      });

      expect(exportedNames.sort()).toEqual([
        'PersistenceAudit',
        'PersistenceBoundary',
        'PersistenceEnvelope',
        'PersistenceLineage',
        'PersistenceMetadata',
        'PersistencePort',
        'PersistencePortException',
        'PersistenceResult',
        'PersistenceService',
        'ValidatedPersistenceInput',
        'ValidationOutcome',
      ]);
      expect(persistenceSource('index.ts')).not.toMatch(/export\s+\*/);
      expect(exportedNames).not.toEqual(expect.arrayContaining([
        'preConstructionValidation',
        'postConstructionValidation',
        'PersistenceValidationIssue',
        'PersistenceValidationIssueCode',
      ]));
    });

    test('preserves Phase 8.0A fields, versions, and snapshot shape exactly', () => {
      expect(SCIENTIFIC_EVALUATION_REQUEST_VERSION)
        .toBe('scientific-evaluation-request/1.0.0');
      expect(SCIENTIFIC_EVALUATION_RESULT_VERSION)
        .toBe('scientific-evaluation-result/1.0.0');
      expect(SCIENTIFIC_EVALUATION_REQUEST_FIELDS).toEqual([
        'contractVersion',
        'requestId',
        'domainId',
        'requestedDomainVersion',
        'requestedAt',
        'observations',
        'context',
        'priorSnapshot',
      ]);
      expect(SCIENTIFIC_EVALUATION_RESULT_FIELDS).toEqual([
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
      ]);
      expect(Object.keys(snapshotFixture())).toEqual(
        SCIENTIFIC_EVALUATION_RESULT_FIELDS.filter(field => field !== 'requestId'),
      );
    });

    test('keeps boundary, service, and port signatures at their exact approved arity', () => {
      expect(PersistenceBoundary.validate).toHaveLength(2);
      expect(PersistenceService).toHaveLength(1);
      expect(PersistenceService.prototype.persist).toHaveLength(3);

      const boundary = persistenceSource('boundary.ts');
      const service = persistenceSource('service.ts');
      const port = persistenceSource('port.ts');
      expect(boundary).toMatch(/validate\(\s*request:\s*ScientificEvaluationRequest,\s*result:\s*ScientificEvaluationResult/);
      expect(boundary).not.toContain('ScientificSnapshot');
      expect(service).toMatch(/persist\(\s*input:\s*ValidatedPersistenceInput,\s*metadata:\s*PersistenceMetadata,\s*lineage:\s*PersistenceLineage/);
      expect(port).toMatch(/save\(envelope:\s*PersistenceEnvelope\):\s*Promise<PersistenceResult>/);
      expect(port).not.toMatch(/\bpersist\s*\(/);
    });

    test('introduces no caller-precondition proof or additional scientific contract', () => {
      const persistenceSources = sourceFiles(PERSISTENCE_ROOT)
        .map(path => source(path))
        .join('\n');
      expect(persistenceSources).not.toMatch(
        /phase_8_0a_validation_precondition_not_met|validationProof|validationMarker|validationToken|trustFlag|trustedIdentity|validatedRequest|validatedResult/i,
      );
      expect(persistenceSources).not.toMatch(/interface\s+Scientific|type\s+Scientific|class\s+Scientific/);
    });

    test('defines every persistence contract with exact readonly fields and versions', () => {
      const contractsPath = join(PERSISTENCE_ROOT, 'contracts.ts');
      const tree = syntaxTree(contractsPath);
      const expectedFields = new Map<string, readonly string[]>([
        ['ValidationOutcome', ['validationVersion', 'validationPhase', 'valid', 'issues', 'validatedInput']],
        ['ValidatedPersistenceInput', ['contractVersion', 'request', 'result']],
        ['PersistenceMetadata', ['contractVersion', 'implementationId', 'implementationVersion', 'schemaVersion', 'modelVersion']],
        ['PersistenceLineage', ['contractVersion', 'parentPersistenceId']],
        ['PersistenceAudit', ['contractVersion', 'boundaryVersion', 'validationVersion', 'inputContractVersion', 'requestContractVersion', 'resultContractVersion', 'validationStatus', 'validationIssueCodes']],
        ['PersistenceEnvelope', ['contractVersion', 'input', 'metadata', 'lineage', 'audit']],
        ['PersistenceResult', ['contractVersion', 'status', 'persistenceId', 'persistedAt', 'issues', 'portOperationInvoked']],
      ]);

      tree.statements.filter(ts.isInterfaceDeclaration).forEach(declaration => {
        const expected = expectedFields.get(declaration.name.text);
        if (expected === undefined) return;
        const properties = declaration.members.filter(ts.isPropertySignature);
        expect(properties.map(member => member.name.getText(tree))).toEqual(expected);
        properties.forEach(member => {
          expect(member.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ReadonlyKeyword))
            .toBe(true);
        });
      });

      expect(tree.statements.filter(ts.isInterfaceDeclaration).map(item => item.name.text))
        .toEqual(expect.arrayContaining([...expectedFields.keys()]));
      expect(persistenceSource('contracts.ts')).toContain('scientific-persistence-input/1.0.0');
      expect(persistenceSource('contracts.ts')).toContain('scientific-persistence-metadata/1.0.0');
      expect(persistenceSource('contracts.ts')).toContain('scientific-persistence-lineage/1.0.0');
      expect(persistenceSource('contracts.ts')).toContain('scientific-persistence-audit/1.0.0');
      expect(persistenceSource('contracts.ts')).toContain('scientific-persistence-envelope/1.0.0');
      expect(persistenceSource('contracts.ts')).toContain('scientific-persistence-result/1.0.0');
      expect(PersistenceBoundary.boundaryVersion).toBe('scientific-persistence-boundary/1.0.0');
      expect(new PersistenceService(new RecordingPort(async () => resultOutcome())).contractVersion)
        .toBe('scientific-persistence-service/1.0.0');
    });

    test('keeps metadata, lineage, and port exception at their exact approved shapes', () => {
      expect(Object.keys(metadataFixture())).toEqual([
        'contractVersion',
        'implementationId',
        'implementationVersion',
        'schemaVersion',
        'modelVersion',
      ]);
      expect(Object.keys(lineageFixture())).toEqual(['contractVersion']);
      expect(Object.keys(lineageFixture('parent-id'))).toEqual([
        'contractVersion',
        'parentPersistenceId',
      ]);
      expect(Object.keys(metadataFixture())).not.toEqual(expect.arrayContaining([
        'persistenceId',
        'createdAt',
        'persistedAt',
        'storageId',
        'databaseId',
      ]));

      const exception = new PersistencePortException('port_failure', 'Persistence failed.');
      expect(exception).toBeInstanceOf(Error);
      expect(exception.name).toBe('PersistencePortException');
      expect(exception.code).toBe('port_failure');
      expect(exception.message).toBe('Persistence failed.');
      expect('cause' in exception).toBe(false);
    });

    test('rejects an empty PersistencePortException message', () => {
      expect(() => new PersistencePortException('port_failure', ''))
        .toThrow('PersistencePortException message must be non-empty.');
    });

    test('rejects a whitespace-only PersistencePortException message', () => {
      expect(() => new PersistencePortException('port_failure', '   '))
        .toThrow('PersistencePortException message must be non-empty.');
    });
  });

  describe('pre-construction boundary validation', () => {
    test('accepts a matching ordinary request and result and constructs only validated input', () => {
      const request = requestFixture();
      const result = resultFixture();
      const outcome = PersistenceBoundary.validate(request, result);

      expect(outcome).toMatchObject({
        validationVersion: 'scientific-persistence-validation/1.0.0',
        validationPhase: 'pre_construction',
        valid: true,
        issues: [],
      });
      expect(outcome.validatedInput).toEqual({
        contractVersion: 'scientific-persistence-input/1.0.0',
        request,
        result,
      });
      expect(outcome).not.toHaveProperty('audit');
      expect(outcome).not.toHaveProperty('envelope');
    });

    test('rejects request ID mismatch without constructing validated input', () => {
      const result = { ...resultFixture(), requestId: 'request-002' };
      const outcome = PersistenceBoundary.validate(requestFixture(), result);
      expect(outcome.valid).toBe(false);
      expect(outcome.validatedInput).toBeNull();
      expect(outcome.issues).toEqual([expect.objectContaining({
        code: 'request_id_mismatch',
        path: 'result.requestId',
      })]);
    });

    test('rejects domain ID mismatch without constructing validated input', () => {
      const result = {
        ...resultFixture(),
        domainId: 'functional_capacity' as const,
        domainVersion: {
          ...resultFixture().domainVersion,
          domainId: 'functional_capacity' as const,
        },
      };
      const outcome = PersistenceBoundary.validate(requestFixture(), result);
      expect(outcome.valid).toBe(false);
      expect(outcome.validatedInput).toBeNull();
      expect(outcome.issues).toEqual([expect.objectContaining({ code: 'domain_id_mismatch' })]);
    });

    test('rejects result domain-version identity mismatch without constructing validated input', () => {
      const result = {
        ...resultFixture(),
        domainVersion: {
          ...resultFixture().domainVersion,
          domainId: 'functional_capacity' as const,
        },
      };
      const outcome = PersistenceBoundary.validate(requestFixture(), result);
      expect(outcome.valid).toBe(false);
      expect(outcome.validatedInput).toBeNull();
      expect(outcome.issues).toEqual([expect.objectContaining({
        code: 'result_domain_version_mismatch',
        path: 'result.domainVersion.domainId',
      })]);
    });

    test('orders all pre-construction issues deterministically', () => {
      const request = { ...requestFixture(), requestId: 'request-other' };
      const result = {
        ...resultFixture(),
        domainId: 'functional_capacity' as const,
        domainVersion: {
          ...resultFixture().domainVersion,
          domainId: 'clinical_biological_age' as const,
        },
      };
      const first = PersistenceBoundary.validate(request, result);
      const second = PersistenceBoundary.validate(request, result);
      expect(first.issues.map(issue => issue.code)).toEqual([
        'request_id_mismatch',
        'domain_id_mismatch',
        'result_domain_version_mismatch',
      ]);
      expect(second).toEqual(first);
    });

    test('freezes outcomes, issue arrays, issues, and successful validated input', () => {
      const success = PersistenceBoundary.validate(requestFixture(), resultFixture());
      const failure = PersistenceBoundary.validate(
        requestFixture(),
        { ...resultFixture(), requestId: 'mismatch' },
      );
      expect(Object.isFrozen(PersistenceBoundary)).toBe(true);
      expect(Object.isFrozen(success)).toBe(true);
      expect(Object.isFrozen(success.issues)).toBe(true);
      expect(Object.isFrozen(success.validatedInput)).toBe(true);
      expect(Object.isFrozen(failure)).toBe(true);
      expect(Object.isFrozen(failure.issues)).toBe(true);
      failure.issues.forEach(issue => expect(Object.isFrozen(issue)).toBe(true));
    });

    test('does not inspect metadata, lineage, versions, or prior snapshot content', () => {
      const priorSnapshot = { invalidScientificShape: true } as unknown as ScientificSnapshot;
      const request = {
        ...requestFixture(),
        contractVersion: 'unverified-request-version' as typeof SCIENTIFIC_EVALUATION_REQUEST_VERSION,
        priorSnapshot,
      };
      const result = {
        ...resultFixture(),
        contractVersion: 'unverified-result-version' as typeof SCIENTIFIC_EVALUATION_RESULT_VERSION,
      };
      const outcome = PersistenceBoundary.validate(request, result);
      expect(outcome.valid).toBe(true);
      expect(outcome.validatedInput?.request.priorSnapshot).toBe(priorSnapshot);

      const preConstructionSource = persistenceSource('validation.ts').split(
        'export function preConstructionValidation',
      )[1].split('function validMetadata')[0];
      expect(preConstructionSource).not.toMatch(/PersistenceMetadata|PersistenceLineage|metadata|lineage/);
      expect(preConstructionSource).not.toMatch(/validationProof|validationMarker|trustFlag|token/i);
    });

    test('accepts blocked outputs and unknown scientific provenance unchanged', () => {
      const result = resultFixture();
      const outcome = PersistenceBoundary.validate(requestFixture(), result);
      expect(outcome.valid).toBe(true);
      expect(outcome.validatedInput?.result.blockedOutputs).toBe(result.blockedOutputs);
      expect(outcome.validatedInput?.result.provenanceSummary).toBe(result.provenanceSummary);
      expect(outcome.validatedInput?.result.confidence).toBe(result.confidence);
    });
  });

  describe('post-construction validation and envelope integrity', () => {
    test('constructs audit before envelope and validates both before the port call', async () => {
      const serviceSource = persistenceSource('service.ts');
      expect(serviceSource.indexOf('const audit: PersistenceAudit')).toBeLessThan(
        serviceSource.indexOf('const envelope: PersistenceEnvelope'),
      );
      expect(serviceSource.indexOf('const envelope: PersistenceEnvelope')).toBeLessThan(
        serviceSource.indexOf('postConstructionValidation(audit, envelope)'),
      );
      expect(serviceSource.indexOf('postConstructionValidation(audit, envelope)')).toBeLessThan(
        serviceSource.indexOf('this.port.save(envelope)'),
      );

      const port = new RecordingPort(async envelope => {
        expect(Object.isFrozen(envelope.audit)).toBe(true);
        expect(Object.isFrozen(envelope.audit.validationIssueCodes)).toBe(true);
        expect(Object.isFrozen(envelope)).toBe(true);
        return resultOutcome();
      });
      await new PersistenceService(port).persist(
        validatedInput(),
        metadataFixture(),
        lineageFixture(),
      );
      expect(port.calls).toHaveLength(1);
    });

    test('rejects missing and malformed metadata only after envelope construction', async () => {
      const port = new RecordingPort(async () => resultOutcome());
      const service = new PersistenceService(port);
      const missing = await service.persist(
        validatedInput(),
        undefined as unknown as PersistenceMetadata,
        lineageFixture(),
      );
      expect(missing.status).toBe('rejected');
      expect(missing.issues.map(issue => issue.code)).toEqual([
        'missing_persistence_metadata',
        'invalid_persistence_envelope',
      ]);

      const malformed = await service.persist(
        validatedInput(),
        { ...metadataFixture() },
        lineageFixture(),
      );
      expect(malformed.status).toBe('rejected');
      expect(malformed.issues.map(issue => issue.code)).toEqual([
        'invalid_persistence_metadata',
        'invalid_persistence_envelope',
      ]);
      expect(port.calls).toHaveLength(0);
    });

    test('accepts root lineage and a non-empty opaque parent lineage', async () => {
      const port = new RecordingPort(async () => resultOutcome());
      const service = new PersistenceService(port);
      await service.persist(validatedInput(), metadataFixture(), lineageFixture());
      await service.persist(validatedInput(), metadataFixture(), lineageFixture('opaque-parent'));
      expect(port.calls).toHaveLength(2);
      expect(port.calls[0].lineage).toEqual({
        contractVersion: 'scientific-persistence-lineage/1.0.0',
      });
      expect(port.calls[1].lineage.parentPersistenceId).toBe('opaque-parent');
    });

    test('validates audit completeness, envelope completeness, and persistence invariants', () => {
      const input = validatedInput();
      const audit = auditFixture(input);
      const envelope = envelopeFixture(input, metadataFixture(), lineageFixture(), audit);
      expect(postConstructionValidation(audit, envelope)).toMatchObject({ valid: true, issues: [] });

      const malformedAudit = Object.freeze({
        ...audit,
        validationStatus: 'failed',
      }) as unknown as PersistenceAudit;
      expect(postConstructionValidation(malformedAudit, Object.freeze({
        ...envelope,
        audit: malformedAudit,
      }))).toMatchObject({
        valid: false,
        issues: expect.arrayContaining([
          expect.objectContaining({ code: 'invalid_persistence_audit' }),
          expect.objectContaining({ code: 'invalid_persistence_envelope' }),
        ]),
      });

      const { audit: _audit, ...incompleteEnvelope } = envelope;
      expect(postConstructionValidation(
        audit,
        Object.freeze(incompleteEnvelope) as unknown as PersistenceEnvelope,
      )).toMatchObject({
        valid: false,
        issues: [expect.objectContaining({ code: 'invalid_persistence_envelope' })],
      });
    });

    test('preserves every nested scientific object and adds no scientific field', async () => {
      const request = requestFixture();
      const result = resultFixture();
      const input = validatedInput(request, result);
      const port = new RecordingPort(async () => resultOutcome());
      await new PersistenceService(port).persist(input, metadataFixture(), lineageFixture());
      const envelope = port.calls[0];

      expect(envelope.input).toBe(input);
      expect(envelope.input.request).toBe(request);
      expect(envelope.input.result).toBe(result);
      expect(envelope.input.result.auditMetadata).toBe(result.auditMetadata);
      expect(envelope.input.result.blockedOutputs).toBe(result.blockedOutputs);
      expect(envelope.input.result.confidence).toBe(result.confidence);
      expect(envelope.input.result.domainVersion).toBe(result.domainVersion);
      expect(Object.keys(envelope)).toEqual([
        'contractVersion',
        'input',
        'metadata',
        'lineage',
        'audit',
      ]);
      expect(Object.isFrozen(envelope)).toBe(true);
    });
  });

  describe('service, port, ownership, and immutability', () => {
    test('returns rejected before save with null port-owned values and frozen issues', async () => {
      const port = new RecordingPort(async () => resultOutcome());
      const result = await new PersistenceService(port).persist(
        validatedInput(),
        metadataFixture(),
        { ...lineageFixture(), parentPersistenceId: '' },
      );
      expect(port.calls).toHaveLength(0);
      expect(result).toMatchObject({
        contractVersion: 'scientific-persistence-result/1.0.0',
        status: 'rejected',
        persistenceId: null,
        persistedAt: null,
        portOperationInvoked: false,
      });
      expect(result.issues.length).toBeGreaterThan(0);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.issues)).toBe(true);
    });

    test('invokes save exactly once with only one complete envelope', async () => {
      const portResult = resultOutcome();
      const port = new RecordingPort(async envelope => {
        expect(Object.keys(envelope)).toEqual([
          'contractVersion',
          'input',
          'metadata',
          'lineage',
          'audit',
        ]);
        return portResult;
      });
      const returned = await new PersistenceService(port).persist(
        validatedInput(),
        metadataFixture(),
        lineageFixture(),
      );
      expect(port.calls).toHaveLength(1);
      expect(returned).toBe(portResult);
    });

    test.each(['succeeded', 'failed'] as const)(
      'preserves a structurally valid %s port result unchanged',
      async status => {
        const portResult = resultOutcome(status);
        const port = new RecordingPort(async () => portResult);
        const returned = await new PersistenceService(port).persist(
          validatedInput(),
          metadataFixture(),
          lineageFixture(),
        );
        expect(returned).toBe(portResult);
        expect(returned.portOperationInvoked).toBe(true);
        if (status === 'succeeded') {
          expect(returned.persistenceId).toBe('port-created-id');
          expect(returned.persistedAt).toBe('port-created-time');
          expect(returned.issues).toEqual([]);
        } else {
          expect(returned.issues.length).toBeGreaterThan(0);
        }
      },
    );

    test('propagates the exact PersistencePortException instance without a result', async () => {
      const exception = new PersistencePortException('port_failure', 'Port failed.');
      const port = new RecordingPort(async () => { throw exception; });
      let caught: unknown;
      try {
        await new PersistenceService(port).persist(
          validatedInput(),
          metadataFixture(),
          lineageFixture(),
        );
      } catch (error) {
        caught = error;
      }
      expect(caught).toBe(exception);
      expect(port.calls).toHaveLength(1);
      expect(persistenceSource('service.ts')).not.toMatch(/\bcatch\b|new PersistencePortException/);
    });

    test('leaves identifiers and timestamps exclusively under port control', async () => {
      const serviceSource = persistenceSource('service.ts');
      expect(serviceSource.match(/persistenceId/g)).toHaveLength(1);
      expect(serviceSource.match(/persistedAt/g)).toHaveLength(1);
      expect(serviceSource).toContain('persistenceId: null');
      expect(serviceSource).toContain('persistedAt: null');
      expect(serviceSource).not.toMatch(/randomUUID|uuid|Date\s*\(|Date\.now|new Date|clock/i);

      const portResult = resultOutcome();
      const returned = await new PersistenceService(
        new RecordingPort(async () => portResult),
      ).persist(validatedInput(), metadataFixture(), lineageFixture());
      expect(returned).toBe(portResult);
      expect(returned.persistenceId).toBe('port-created-id');
      expect(returned.persistedAt).toBe('port-created-time');
    });

    test('keeps all data contracts readonly and every constructed value immutable', async () => {
      const contractsTree = syntaxTree(join(PERSISTENCE_ROOT, 'contracts.ts'));
      contractsTree.statements.filter(ts.isInterfaceDeclaration).forEach(declaration => {
        declaration.members.filter(ts.isPropertySignature).forEach(member => {
          expect(member.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ReadonlyKeyword))
            .toBe(true);
        });
      });
      expect(persistenceSource('port.ts')).toMatch(/readonly contractVersion/);
      expect(persistenceSource('port.ts')).toMatch(/readonly code/);
      expect(persistenceSource('service.ts')).toMatch(/readonly contractVersion/);

      const metadata = metadataFixture();
      const lineage = lineageFixture();
      const portResult = resultOutcome();
      const port = new RecordingPort(async () => portResult);
      const input = validatedInput();
      const returned = await new PersistenceService(port).persist(input, metadata, lineage);
      const submittedEnvelope = port.calls[0];
      expect(Object.isFrozen(input)).toBe(true);
      expect(Object.isFrozen(metadata)).toBe(true);
      expect(Object.isFrozen(lineage)).toBe(true);
      expect(Object.isFrozen(submittedEnvelope)).toBe(true);
      expect(Object.isFrozen(submittedEnvelope.audit)).toBe(true);
      expect(Object.isFrozen(returned)).toBe(true);
    });

    test('contains no production port implementation and keeps doubles test-local', () => {
      const productionPersistenceSources = sourceFiles(PERSISTENCE_ROOT)
        .map(path => source(path))
        .join('\n');
      expect(productionPersistenceSources).not.toMatch(/implements\s+PersistencePort/);
      expect(productionPersistenceSources).not.toMatch(/class\s+(?!PersistencePortException)\w*Port\b/);
      expect(persistenceSource('port.ts')).toMatch(/export interface PersistencePort/);
    });
  });

  describe('dependency direction, baseline, and activation', () => {
    test('keeps science, production, application, and UI free while allowing approved Phase 8.0C infrastructure', () => {
      const persistenceDirectory = resolve(PERSISTENCE_ROOT);
      const approvedInfrastructureDirectory = resolve(
        SRC_ROOT,
        'infrastructure',
        'scientificPersistence',
      );
      const outsideProductionReferences = sourceFiles(SRC_ROOT)
        .filter(path => !resolve(path).startsWith(persistenceDirectory))
        .filter(path => !resolve(path).startsWith(approvedInfrastructureDirectory))
        .filter(path => !path.includes(`${join('src', '__tests__')}`))
        .filter(path => /(?:from|require\()\s*['"][^'"]*scientificPersistence/.test(source(path)));
      expect(outsideProductionReferences).toEqual([]);

      sourceFiles(approvedInfrastructureDirectory).forEach(path => {
        moduleSpecifiers(path)
          .filter(specifier => specifier.includes('scientificPersistence'))
          .forEach(specifier => expect(specifier).toBe('../../domain/scientificPersistence'));
      });

      const scientificRoots = [
        join(SRC_ROOT, 'domain', 'scientificDomains'),
        join(SRC_ROOT, 'domain', 'scientificModels'),
      ];
      const scientificReferences = scientificRoots.flatMap(sourceFiles)
        .filter(path => source(path).includes('scientificPersistence'));
      expect(scientificReferences).toEqual([]);
    });

    test('limits persistence dependencies to its local modules and public scientificProduction barrel', () => {
      const files = sourceFiles(PERSISTENCE_ROOT);
      files.forEach(path => {
        moduleSpecifiers(path).forEach(specifier => {
          expect(specifier === '../scientificProduction' || specifier.startsWith('./')).toBe(true);
          expect(specifier).not.toMatch(/serialization|storage|supabase|asyncstorage|repository|adapter|network|ui|uuid|clock/i);
        });
      });

      const combinedSource = files.map(path => source(path)).join('\n');
      expect(combinedSource).not.toMatch(
        /from\s+['"][^'"]*(?:serialization|storage|supabase|asyncstorage|repository|adapter|network|ui|uuid|clock)[^'"]*['"]/i,
      );
    });

    test('has an acyclic persistence-local dependency graph', () => {
      const files = sourceFiles(PERSISTENCE_ROOT);
      const fileSet = new Set(files.map(path => resolve(path)));
      const graph = new Map<string, string[]>();
      files.forEach(path => {
        const dependencies = moduleSpecifiers(path)
          .filter(specifier => specifier.startsWith('./'))
          .map(specifier => resolve(dirname(path), `${specifier}.ts`))
          .filter(dependency => fileSet.has(dependency));
        graph.set(resolve(path), dependencies);
      });

      const visiting = new Set<string>();
      const visited = new Set<string>();
      const visit = (node: string): void => {
        expect(visiting.has(node)).toBe(false);
        if (visited.has(node)) return;
        visiting.add(node);
        (graph.get(node) ?? []).forEach(visit);
        visiting.delete(node);
        visited.add(node);
      };
      [...graph.keys()].forEach(visit);
      expect(visited.size).toBe(graph.size);
    });

    test('keeps standardized paths and cardiometabolic safety inactive with no composite', () => {
      SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.forEach(declaration => {
        expect(declaration.activation.productionActive).toBe(false);
        expect(declaration.activation.featureFlag.defaultEnabled).toBe(false);
        expect(declaration.activation.featureFlag.wiredToRuntime).toBe(false);
        expect(declaration.activation.automaticActivationPermitted).toBe(false);
        expect(declaration.adapterRegistrationStatus).toBe('not_registered');
      });
      const cardiometabolic = SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.find(
        declaration => declaration.domainId === 'cardiometabolic_health',
      );
      expect(cardiometabolic?.activation.existingProductionStateAtBaseline).toBe('inactive');
      expect(source(join(
        SRC_ROOT,
        'domain',
        'scientificDomains',
        'cardiometabolic',
        'versions.ts',
      ))).toContain("safetyCandidatePolicy: 'CMH-SBP-0.1.0-inactive'");
      expect(SCIENTIFIC_PRODUCTION_BOUNDARY.parentScientificScoreRepresented).toBe(false);
      expect(SCIENTIFIC_PRODUCTION_BOUNDARY.crossDomainCompositeRepresented).toBe(false);
    });

    test('preserves the frozen Scientific Baseline manifest hash', () => {
      const path = join(
        SRC_ROOT,
        'domain',
        'scientificDomains',
        'scientific' + 'Baseline.ts',
      );
      expect(createHash('sha256').update(readFileSync(path)).digest('hex'))
        .toBe('492a559da4f0d449af5a3da934036c2e8f1c075e8b6ccb3bf38fef5124d37ec6');
    });
  });
});
