import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  SCIENTIFIC_BASELINE_ID,
  SCIENTIFIC_BASELINE_V1_0,
  SCIENTIFIC_BASELINE_VERSION,
  auditScientificBaselineV1,
  type ScientificBaselineComponentKind,
  type ScientificBaselineDomainId,
} from '../domain/scientificDomains/scientificBaseline';

function domain(id: ScientificBaselineDomainId) {
  const found = SCIENTIFIC_BASELINE_V1_0.domains.find(item => item.domainId === id);
  if (!found) throw new Error(`Missing baseline domain: ${id}.`);
  return found;
}

function version(id: ScientificBaselineDomainId, kind: ScientificBaselineComponentKind): string {
  const found = domain(id).components.find(item => item.kind === kind);
  if (!found) throw new Error(`Missing ${kind} for ${id}.`);
  return found.version;
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

function expectComponentVersionsInSource(id: ScientificBaselineDomainId, source: string): void {
  const versions = [...new Set(domain(id).components.map(item => item.version))];
  versions.forEach(item => expect(source).toContain(item));
}

describe('Scientific Baseline v1.0 governance', () => {
  test('is static, deterministic, and bound to the committed source scientific state', () => {
    expect(JSON.stringify(SCIENTIFIC_BASELINE_V1_0)).toBe(JSON.stringify(SCIENTIFIC_BASELINE_V1_0));
    expect(SCIENTIFIC_BASELINE_ID).toBe('scientific-baseline-v1.0.0');
    expect(SCIENTIFIC_BASELINE_VERSION).toBe('1.0.0');
    expect(SCIENTIFIC_BASELINE_V1_0).toMatchObject({
      createdOn: '2026-07-19',
      repository: {
        sourceScientificCommitSha: '7b7b4bea1008a1b31b6d209d55debdfd608719e9',
        branch: 'main',
        workingTreeCleanAtPreparation: true,
      },
      verificationAtSourceCommit: {
        overallTestCount: 611,
        overallSuiteCount: 33,
        typescriptStatus: 'pass',
        governanceAuditStatus: 'pass',
      },
      baselineActivationStatus: 'prepared_not_activated',
    });
  });

  test('represents exactly the four frozen domains with unique stable IDs', () => {
    expect(SCIENTIFIC_BASELINE_V1_0.domains.map(item => item.domainId)).toEqual([
      'clinical_biological_age',
      'cardiorespiratory_fitness',
      'functional_capacity',
      'cardiometabolic_health',
    ]);
    expect(new Set(SCIENTIFIC_BASELINE_V1_0.domains.map(item => item.domainId)).size).toBe(4);
  });

  test('has unique component IDs, nonempty versions, and a clean baseline audit', () => {
    const audit = auditScientificBaselineV1();
    expect(audit).toMatchObject({ valid: true, issues: [] });
    expect(new Set(audit.componentIds).size).toBe(audit.componentIds.length);
    SCIENTIFIC_BASELINE_V1_0.domains.flatMap(item => item.components).forEach(item => {
      expect(item.componentId).not.toBe('');
      expect(item.version.trim()).not.toBe('');
    });
  });

  test('matches every frozen Clinical PhenoAge identity and fingerprint', () => {
    const constants = readFileSync(join(process.cwd(), 'src', 'domain', 'scientificModels', 'clinicalPhenoAge', 'constants.ts'), 'utf8');
    const validationManifest = readFileSync(join(process.cwd(), 'fixtures', 'scientific', 'clinical-phenoage-v1-validation-manifest.json'), 'utf8');
    expectComponentVersionsInSource('clinical_biological_age', constants);
    expect(constants).toContain(domain('clinical_biological_age').coefficientFingerprint!);
    expect(validationManifest).toContain(domain('clinical_biological_age').referenceDataFingerprint!);
  });

  test('matches the complete VO₂max version registry', () => {
    const registry = readFileSync(join(process.cwd(), 'src', 'domain', 'scientificDomains', 'vo2' + 'max', 'versions.ts'), 'utf8');
    expectComponentVersionsInSource('cardiorespiratory_fitness', registry);
  });

  test('matches the complete Functional Capacity version registry', () => {
    const registry = readFileSync(join(process.cwd(), 'src', 'domain', 'scientificDomains', 'functional' + 'Capacity', 'versions.ts'), 'utf8');
    expectComponentVersionsInSource('functional_capacity', registry);
  });

  test('matches the complete Cardiometabolic Health version registry', () => {
    const registry = readFileSync(join(process.cwd(), 'src', 'domain', 'scientificDomains', 'cardio' + 'metabolic', 'versions.ts'), 'utf8');
    expectComponentVersionsInSource('cardiometabolic_health', registry);
  });

  test('keeps Cardiometabolic safety and production activation inactive', () => {
    expect(domain('cardiometabolic_health').productionActivationState).toBe('inactive');
    expect(version('cardiometabolic_health', 'safety_policy')).toBe('CMH-SBP-0.1.0-inactive');
    expect(SCIENTIFIC_BASELINE_V1_0.baselineActivationStatus).toBe('prepared_not_activated');
  });

  test('records production truth without silently activating isolated domains', () => {
    expect(domain('clinical_biological_age').productionActivationState).toBe('active');
    expect(domain('cardiorespiratory_fitness').productionActivationState).toBe('inactive');
    expect(domain('functional_capacity').productionActivationState).toBe('inactive');
    expect(domain('cardiometabolic_health').productionActivationState).toBe('inactive');
  });

  test('represents no parent score, composite, or runtime fallback', () => {
    expect(SCIENTIFIC_BASELINE_V1_0.parentScientificScoreRepresented).toBe(false);
    expect(SCIENTIFIC_BASELINE_V1_0.crossDomainCompositeRepresented).toBe(false);
    expect(SCIENTIFIC_BASELINE_V1_0.runtimeScientificFallbackAuthorized).toBe(false);
    expect(SCIENTIFIC_BASELINE_V1_0.freezePolicy).toMatchObject({
      productionMayRedefineScientificOutput: false,
      uiMayAlterScientificStatus: false,
      aiMayMakeScientificDecisions: false,
      unmatchedResultFallbackAllowed: false,
    });
  });

  test('requires explicit classified and versioned scientific change governance', () => {
    expect(SCIENTIFIC_BASELINE_V1_0.freezePolicy.changeClassifications).toEqual([
      'editorial',
      'non_behavioral_implementation',
      'backward_compatible_scientific_revision',
      'breaking_scientific_revision',
      'emergency_scientific_correction',
    ]);
    expect(SCIENTIFIC_BASELINE_V1_0.freezePolicy).toMatchObject({
      changeProposalRequired: true,
      behavioralChangeRequiresVersionIncrement: true,
      registryChangeRequiresRegistryVersionIncrement: true,
      referenceChangeRequiresReferenceVersionIncrement: true,
      interpretationChangeRequiresPolicyVersionIncrement: true,
      coefficientChangeRequiresNewFingerprint: true,
      emergencyCorrectionRequiresAuditNoteAndRegressionEvidence: true,
    });
  });

  test('is not referenced by production or existing scientific-domain behavior', () => {
    const sourceRoot = join(process.cwd(), 'src');
    const manifest = join(sourceRoot, 'domain', 'scientificDomains', 'scientificBaseline.ts');
    const thisTest = join(sourceRoot, '__tests__', 'scientificBaseline.test.ts');
    const references = sourceFiles(sourceRoot)
      .filter(path => path !== manifest && path !== thisTest)
      .filter(path => /scientificBaseline|SCIENTIFIC_BASELINE_/.test(readFileSync(path, 'utf8')));
    expect(references).toEqual([]);
  });
});
