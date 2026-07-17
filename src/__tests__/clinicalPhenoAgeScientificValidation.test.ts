import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  CLINICAL_PHENOAGE_CANONICAL_UNITS,
  CLINICAL_PHENOAGE_COEFFICIENT_VERSION,
  CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT,
  CLINICAL_PHENOAGE_IMPLEMENTATION_VERSION,
  CLINICAL_PHENOAGE_INPUT_ORDER,
  CLINICAL_PHENOAGE_INPUT_POLICY_ID,
  CLINICAL_PHENOAGE_MODEL_ID,
  CLINICAL_PHENOAGE_MODEL_VERSION,
  CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
  calculateClinicalPhenoAge,
  calculateClinicalPhenoAgeWithAudit,
  clinicalPhenoAgeFormulaFingerprint,
  evaluateScientificEligibility,
  isScientificExecutionAuthorized,
  sha256,
  stableSha256,
  type ClinicalPhenoAgeCalculationError,
  type ClinicalPhenoAgeInput,
  type ClinicalPhenoAgeInputId,
  type ClinicalPhenoAgeResult,
  type ScientificEligibilityInput,
  type ScientificEligibilityRequest,
  type ScientificExecutionAuthorization,
} from '../domain/scientificModels';

const ROOT = process.cwd();
const ASSESSED_AT = '2026-07-17T12:00:00.000Z';
const CALCULATED_AT = '2026-07-17T12:01:00.000Z';

interface ReferenceCase {
  id: string;
  inputs: Record<ClinicalPhenoAgeInputId, number>;
  expected: {
    naturalLogCrp: number;
    linearPredictor: number;
    publishedMortalityTransformation: number;
    transformedMortality: number;
    phenotypicAgeYears: number;
  };
}

interface ValidationManifest {
  scientificIdentity: Record<string, string>;
  primaryReference: {
    doi: string;
    pmcid: string;
    publishedNumericIndividualFixturesAvailable: boolean;
  };
  tolerancePolicy: {
    engineVsArbitraryPrecisionAbsolute: number;
    engineVsArbitraryPrecisionRelative: number;
    javascriptCrossRuntimeAbsolute: number;
    javascriptCrossRuntimeRelative: number;
    sameRuntimeRepeatability: string;
  };
  artifactSha256: Record<string, string>;
  referenceCases: Array<{
    id: string;
    inputSnapshotHash: string;
    scientificOutputHash: string;
  }>;
  verifiedRuntimes: string[];
  unverifiedPlatforms: string[];
}

interface RuntimeProbeResult {
  id: string;
  naturalLogCrp: number;
  linearPredictor: number;
  mortalityTransformation: number;
  transformedMortality: number;
  phenotypicAgeYears: number;
}

const fixtureDocument = JSON.parse(readFileSync(join(
  ROOT,
  'fixtures/scientific/clinical-phenoage-v1-reference.json',
), 'utf8')) as { cases: ReferenceCase[] };

const manifest = JSON.parse(readFileSync(join(
  ROOT,
  'fixtures/scientific/clinical-phenoage-v1-validation-manifest.json',
), 'utf8')) as ValidationManifest;

function withinTolerance(actual: number, expected: number, absolute: number, relative: number): boolean {
  return Math.abs(actual - expected) <= Math.max(absolute, relative * Math.max(Math.abs(actual), Math.abs(expected)));
}

function eligibilityInputs(): ScientificEligibilityInput[] {
  return CLINICAL_PHENOAGE_INPUT_ORDER.map(id => ({
    id,
    measurementId: `validation-measurement-${id}`,
    present: true,
    source: id === 'chronological_age' ? 'chronological_record' : 'laboratory',
    unit: CLINICAL_PHENOAGE_CANONICAL_UNITS[id],
    measurementValidity: 'valid',
    freshness: 'current',
    assayCompatibility: 'supported',
    confidence: 'very_high',
    measuredAt: '2026-07-10T08:00:00.000Z',
  }));
}

function authorization(ageYears: number): ScientificExecutionAuthorization {
  const request: ScientificEligibilityRequest = {
    modelId: CLINICAL_PHENOAGE_MODEL_ID,
    requestedVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
    assessedAt: ASSESSED_AT,
    inputs: eligibilityInputs(),
    population: {
      ageYears,
      sex: 'female',
      compatibility: 'supported',
      provenance: 'Scientific validation fixture',
    },
    laboratory: {
      compatibility: 'supported',
      contextId: 'scientific-validation-laboratory-context',
      provenance: 'Scientific validation fixture',
    },
    calibration: null,
    device: null,
    history: { observationCount: 1, timeSpanDays: 0, continuity: 'sparse' },
  };
  const result = evaluateScientificEligibility(request);
  if (!isScientificExecutionAuthorized(result, CALCULATED_AT)) {
    throw new Error('Scientific validation fixture did not receive authorization.');
  }
  return result;
}

function inputs(values: Record<ClinicalPhenoAgeInputId, number>): ClinicalPhenoAgeInput[] {
  return CLINICAL_PHENOAGE_INPUT_ORDER.map(id => ({
    id,
    measurementId: `validation-measurement-${id}`,
    value: values[id],
    unit: CLINICAL_PHENOAGE_CANONICAL_UNITS[id],
  }));
}

function calculate(values: Record<ClinicalPhenoAgeInputId, number>): ClinicalPhenoAgeResult {
  return calculateClinicalPhenoAge({
    authorization: authorization(values.chronological_age),
    normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
    inputs: inputs(values),
  });
}

function calculateWithAudit(values: Record<ClinicalPhenoAgeInputId, number>) {
  return calculateClinicalPhenoAgeWithAudit({
    authorization: authorization(values.chronological_age),
    normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
    inputs: inputs(values),
  });
}

function scientificOutputHash(result: ClinicalPhenoAgeResult): string {
  return stableSha256({
    calculationStatus: result.calculationStatus,
    modelId: result.modelId,
    modelVersion: result.modelVersion,
    coefficientVersion: result.coefficientVersion,
    normalizationVersion: result.normalizationVersion,
    implementationVersion: result.implementationVersion,
    phenotypicAgeYears: result.phenotypicAgeYears,
    chronologicalAgeYears: result.chronologicalAgeYears,
    ageDifferenceYears: result.ageDifferenceYears,
    inputSnapshot: result.inputSnapshot,
    inputSnapshotHash: result.inputSnapshotHash,
    evidenceReferences: result.evidenceReferences,
    formulaProvenance: result.formulaProvenance,
    canonicalUnits: result.canonicalUnits,
    warnings: result.warnings,
    limitations: result.limitations,
    precision: result.precision,
  });
}

function captureError(action: () => unknown): ClinicalPhenoAgeCalculationError {
  try {
    action();
  } catch (error) {
    return error as ClinicalPhenoAgeCalculationError;
  }
  throw new Error('Expected validation action to fail.');
}

function runRuntime(command: string, args: string[]): string {
  const execution = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8' });
  if (execution.status !== 0) {
    throw new Error(`Runtime probe failed: ${execution.stderr || execution.stdout}`);
  }
  return execution.stdout.trim();
}

function hermesExecutable(): string {
  const platformDirectory = process.platform === 'darwin'
    ? 'osx-bin'
    : process.platform === 'win32' ? 'win64-bin' : 'linux64-bin';
  const executable = process.platform === 'win32' ? 'hermes.exe' : 'hermes';
  return join(ROOT, 'node_modules/react-native/sdks/hermesc', platformDirectory, executable);
}

describe('Clinical PhenoAge v1.0.0 scientific validation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(CALCULATED_AT));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('published specification and version integrity', () => {
    test('locks the peer-reviewed source and every scientific version identifier', () => {
      expect(manifest.primaryReference).toMatchObject({
        doi: '10.18632/aging.101414',
        pmcid: 'PMC5940111',
        publishedNumericIndividualFixturesAvailable: false,
      });
      expect(manifest.scientificIdentity).toEqual({
        modelId: CLINICAL_PHENOAGE_MODEL_ID,
        modelVersion: CLINICAL_PHENOAGE_MODEL_VERSION,
        coefficientVersion: CLINICAL_PHENOAGE_COEFFICIENT_VERSION,
        normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
        implementationVersion: CLINICAL_PHENOAGE_IMPLEMENTATION_VERSION,
        inputPolicyId: CLINICAL_PHENOAGE_INPUT_POLICY_ID,
        coefficientFingerprint: CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT,
      });
    });

    test('verifies coefficient fingerprint and production source integrity', () => {
      expect(clinicalPhenoAgeFormulaFingerprint())
        .toBe(CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT);
      const artifacts = {
        calculationSource: 'src/domain/scientificModels/clinicalPhenoAge/calculation.ts',
        constantsSource: 'src/domain/scientificModels/clinicalPhenoAge/constants.ts',
        validationSource: 'src/domain/scientificModels/clinicalPhenoAge/validation.ts',
        referenceFixture: 'fixtures/scientific/clinical-phenoage-v1-reference.json',
        arbitraryPrecisionEvaluator: 'fixtures/scientific/clinical-phenoage-v1-reference.bc',
        javascriptRuntimeProbe: 'fixtures/scientific/clinical-phenoage-v1-runtime-probe.js',
      } as const;
      Object.entries(artifacts).forEach(([id, path]) => {
        expect(sha256(readFileSync(join(ROOT, path), 'utf8'))).toBe(manifest.artifactSha256[id]);
      });
    });
  });

  describe('independent reference and golden regression', () => {
    test.each(fixtureDocument.cases)('agrees with arbitrary-precision case $id', reference => {
      const output = calculateWithAudit(reference.inputs);
      const tolerance = manifest.tolerancePolicy;
      expect(withinTolerance(
        output.audit.transformedInputs.naturalLogCrp,
        reference.expected.naturalLogCrp,
        tolerance.engineVsArbitraryPrecisionAbsolute,
        tolerance.engineVsArbitraryPrecisionRelative,
      )).toBe(true);
      expect(withinTolerance(output.audit.linearPredictor, reference.expected.linearPredictor,
        tolerance.engineVsArbitraryPrecisionAbsolute, tolerance.engineVsArbitraryPrecisionRelative)).toBe(true);
      expect(withinTolerance(
        output.audit.publishedMortalityTransformation,
        reference.expected.publishedMortalityTransformation,
        tolerance.engineVsArbitraryPrecisionAbsolute,
        tolerance.engineVsArbitraryPrecisionRelative,
      )).toBe(true);
      expect(withinTolerance(output.audit.transformedMortality, reference.expected.transformedMortality,
        tolerance.engineVsArbitraryPrecisionAbsolute, tolerance.engineVsArbitraryPrecisionRelative)).toBe(true);
      expect(withinTolerance(output.result.phenotypicAgeYears, reference.expected.phenotypicAgeYears,
        tolerance.engineVsArbitraryPrecisionAbsolute, tolerance.engineVsArbitraryPrecisionRelative)).toBe(true);
    });

    test('reproduces fixture ages with the independent GNU bc evaluator', () => {
      const evaluator = join(ROOT, 'fixtures/scientific/clinical-phenoage-v1-reference.bc');
      const execution = spawnSync('bc', ['-l', evaluator], { cwd: ROOT, encoding: 'utf8' });
      expect(execution.status).toBe(0);
      const values = execution.stdout.trim().split(/\s+/).map(Number);
      expect(values).toHaveLength(fixtureDocument.cases.length);
      values.forEach((value, index) => {
        expect(withinTolerance(
          value,
          fixtureDocument.cases[index].expected.phenotypicAgeYears,
          manifest.tolerancePolicy.engineVsArbitraryPrecisionAbsolute,
          manifest.tolerancePolicy.engineVsArbitraryPrecisionRelative,
        )).toBe(true);
      });
    });

    test('freezes input and scientific-output hashes for every golden case', () => {
      const actual = fixtureDocument.cases.map(reference => {
        const result = calculate(reference.inputs);
        return {
          id: reference.id,
          inputSnapshotHash: result.inputSnapshotHash,
          scientificOutputHash: scientificOutputHash(result),
        };
      });
      expect(actual).toEqual(manifest.referenceCases);
    });
  });

  describe('JavaScript runtime reproducibility', () => {
    test('is exactly repeatable within Node and Hermes', () => {
      const probe = 'fixtures/scientific/clinical-phenoage-v1-runtime-probe.js';
      const hermes = hermesExecutable();
      if (!existsSync(hermes)) {
        expect(manifest.unverifiedPlatforms.length).toBeGreaterThan(0);
        return;
      }
      const nodeFirst = runRuntime(process.execPath, [probe]);
      const nodeSecond = runRuntime(process.execPath, [probe]);
      const hermesFirst = runRuntime(hermes, [probe]);
      const hermesSecond = runRuntime(hermes, [probe]);
      expect(nodeSecond).toBe(nodeFirst);
      expect(hermesSecond).toBe(hermesFirst);
      expect(manifest.tolerancePolicy.sameRuntimeRepeatability).toBe('exact');
    });

    test('keeps Node and Hermes within the explicit cross-runtime tolerance', () => {
      const probe = 'fixtures/scientific/clinical-phenoage-v1-runtime-probe.js';
      if (!existsSync(hermesExecutable())) {
        expect(manifest.unverifiedPlatforms.length).toBeGreaterThan(0);
        return;
      }
      const node = JSON.parse(runRuntime(process.execPath, [probe])) as RuntimeProbeResult[];
      const hermes = JSON.parse(runRuntime(hermesExecutable(), [probe])) as RuntimeProbeResult[];
      expect(hermes.map(item => item.id)).toEqual(node.map(item => item.id));
      const numericKeys = [
        'naturalLogCrp',
        'linearPredictor',
        'mortalityTransformation',
        'transformedMortality',
        'phenotypicAgeYears',
      ] as const;
      node.forEach((reference, index) => numericKeys.forEach(key => {
        expect(withinTolerance(
          hermes[index][key],
          reference[key],
          manifest.tolerancePolicy.javascriptCrossRuntimeAbsolute,
          manifest.tolerancePolicy.javascriptCrossRuntimeRelative,
        )).toBe(true);
      }));
    });
  });

  describe('numerical stability and boundary behavior', () => {
    test('handles very small and very large computationally valid CRP values', () => {
      const base = fixtureDocument.cases[0].inputs;
      const small = calculate({ ...base, crp: 1e-12 });
      const large = calculate({ ...base, crp: 999 });
      expect(Number.isFinite(small.phenotypicAgeYears)).toBe(true);
      expect(Number.isFinite(large.phenotypicAgeYears)).toBe(true);
      expect(small.inputSnapshot.find(input => input.id === 'crp')?.value).toBe(1e-12);
      expect(large.inputSnapshot.find(input => input.id === 'crp')?.value).toBe(999);
    });

    test('fails explicitly when a representable input loses formula-domain resolution', () => {
      const base = fixtureDocument.cases[0].inputs;
      const error = captureError(() => calculate({ ...base, crp: Number.MIN_VALUE }));
      expect(error.code).toBe('ComputationalDomainError');
      expect(error.message).toMatch(/no partial age/i);
    });

    test('is stable under decimal-heavy inputs and input ordering', () => {
      const reference = fixtureDocument.cases[1];
      const first = calculate(reference.inputs);
      const reordered = calculateClinicalPhenoAge({
        authorization: authorization(reference.inputs.chronological_age),
        normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
        inputs: [...inputs(reference.inputs)].reverse(),
      });
      expect(reordered).toEqual(first);
    });

    test('is exactly deterministic across 1,000 repeated executions', () => {
      const reference = fixtureDocument.cases[0].inputs;
      const first = calculate(reference);
      const expectedHash = scientificOutputHash(first);
      for (let iteration = 0; iteration < 1000; iteration += 1) {
        const repeated = calculate(reference);
        expect(repeated).toEqual(first);
        expect(scientificOutputHash(repeated)).toBe(expectedHash);
      }
    });

    test('distinguishes one-ULP-scale evidence even below final output resolution', () => {
      const base = fixtureDocument.cases[0].inputs;
      const first = calculate(base);
      const perturbed = calculate({ ...base, glucose: 5.000000000000001 });
      expect(perturbed.inputSnapshotHash).not.toBe(first.inputSnapshotHash);
      expect(perturbed.phenotypicAgeYears).toBe(first.phenotypicAgeYears);
    });
  });

  describe('coefficient-direction and local sensitivity checks', () => {
    const positiveDirection: readonly ClinicalPhenoAgeInputId[] = [
      'chronological_age', 'creatinine', 'glucose', 'crp', 'mean_cell_volume',
      'red_cell_distribution_width', 'alkaline_phosphatase', 'white_blood_cell_count',
    ];
    const negativeDirection: readonly ClinicalPhenoAgeInputId[] = ['albumin', 'lymphocyte_percent'];

    test.each(positiveDirection)('preserves the published positive direction for %s', id => {
      const base = fixtureDocument.cases[0].inputs;
      const delta = id === 'crp' ? 0.001 : 0.01;
      expect(calculate({ ...base, [id]: base[id] + delta }).phenotypicAgeYears)
        .toBeGreaterThan(calculate(base).phenotypicAgeYears);
    });

    test.each(negativeDirection)('preserves the published negative direction for %s', id => {
      const base = fixtureDocument.cases[0].inputs;
      expect(calculate({ ...base, [id]: base[id] + 0.01 }).phenotypicAgeYears)
        .toBeLessThan(calculate(base).phenotypicAgeYears);
    });

    test('keeps increasing CRP monotonic without assigning clinical meaning', () => {
      const base = fixtureDocument.cases[0].inputs;
      const sequence = [0.01, 0.05, 0.1, 0.5, 1, 10, 100]
        .map(crp => calculate({ ...base, crp }).phenotypicAgeYears);
      sequence.slice(1).forEach((value, index) => expect(value).toBeGreaterThan(sequence[index]));
    });

    test('responds proportionately to small local perturbations', () => {
      const base = fixtureDocument.cases[0].inputs;
      const baseline = calculate(base).phenotypicAgeYears;
      const firstDelta = calculate({ ...base, glucose: base.glucose + 1e-5 }).phenotypicAgeYears - baseline;
      const secondDelta = calculate({ ...base, glucose: base.glucose + 2e-5 }).phenotypicAgeYears - baseline;
      expect(firstDelta).toBeGreaterThan(0);
      expect(secondDelta / firstDelta).toBeCloseTo(2, 4);
    });
  });

  describe('authorization regression protection', () => {
    test('rejects replay after expiry, structural cloning, and evidence mutation', () => {
      const reference = fixtureDocument.cases[0].inputs;
      const valid = authorization(reference.chronological_age);
      const cloned = { ...valid } as ScientificExecutionAuthorization;
      expect(captureError(() => calculateClinicalPhenoAge({
        authorization: cloned,
        normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
        inputs: inputs(reference),
      })).code).toBe('AuthorizationAltered');

      const altered = authorization(reference.chronological_age);
      (altered.authorizedEvidence as unknown as Array<{ measurementId: string }>)[0]
        .measurementId = 'mutated-measurement';
      expect(captureError(() => calculateClinicalPhenoAge({
        authorization: altered,
        normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
        inputs: inputs(reference),
      })).code).toBe('AuthorizationAltered');

      const expired = authorization(reference.chronological_age);
      jest.setSystemTime(new Date('2026-07-17T12:05:00.000Z'));
      expect(captureError(() => calculateClinicalPhenoAge({
        authorization: expired,
        normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
        inputs: inputs(reference),
      })).code).toBe('AuthorizationExpired');
    });
  });
});
