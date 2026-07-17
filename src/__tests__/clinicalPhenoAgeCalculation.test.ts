import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  CLINICAL_PHENOAGE_CANONICAL_UNITS,
  CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT,
  CLINICAL_PHENOAGE_FORMULA_DEFINITION,
  CLINICAL_PHENOAGE_INPUT_ORDER,
  CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
  SCIENTIFIC_INPUT_POLICIES,
  calculateClinicalPhenoAge,
  calculateClinicalPhenoAgeWithAudit,
  clinicalPhenoAgeFormulaFingerprint,
  evaluateScientificEligibility,
  isClinicalPhenoAgeFormulaIntegrityValid,
  isScientificExecutionAuthorized,
  sha256,
  type ClinicalPhenoAgeCalculationError,
  type ClinicalPhenoAgeCalculationRequest,
  type ClinicalPhenoAgeCanonicalUnit,
  type ClinicalPhenoAgeInput,
  type ClinicalPhenoAgeInputId,
  type ScientificEligibilityInput,
  type ScientificEligibilityRequest,
  type ScientificExecutionAuthorization,
} from '../domain/scientificModels';

const ASSESSED_AT = '2026-07-17T12:00:00.000Z';
const CALCULATED_AT = '2026-07-17T12:01:00.000Z';
const VERSION = 'clinical-phenoage/1.0.0';

interface ReferenceFixture {
  cases: Array<{
    id: string;
    inputs: Record<ClinicalPhenoAgeInputId, number>;
    expected: {
      naturalLogCrp: number;
      linearPredictor: number;
      publishedMortalityTransformation: number;
      transformedMortality: number;
      phenotypicAgeYears: number;
    };
  }>;
}

const fixtures = JSON.parse(readFileSync(join(
  process.cwd(),
  'fixtures/scientific/clinical-phenoage-v1-reference.json',
), 'utf8')) as ReferenceFixture;

function eligibilityInputs(): ScientificEligibilityInput[] {
  const policy = SCIENTIFIC_INPUT_POLICIES.find(candidate =>
    candidate.id === 'clinical_phenoage_complete_visit');
  if (!policy) throw new Error('Missing Clinical PhenoAge input policy.');
  return policy.requiredInputs.map(requirement => ({
    id: requirement.id,
    measurementId: `measurement-${requirement.id}`,
    present: true,
    source: requirement.acceptedSources[0],
    unit: CLINICAL_PHENOAGE_CANONICAL_UNITS[requirement.id as ClinicalPhenoAgeInputId],
    measurementValidity: 'valid',
    freshness: 'current',
    assayCompatibility: 'supported',
    confidence: 'very_high',
    measuredAt: '2026-07-10T08:00:00.000Z',
  }));
}

function eligibilityRequest(
  overrides: Partial<ScientificEligibilityRequest> = {},
): ScientificEligibilityRequest {
  return {
    modelId: 'clinical_phenoage',
    requestedVersion: VERSION,
    assessedAt: ASSESSED_AT,
    inputs: eligibilityInputs(),
    population: {
      ageYears: 40,
      sex: 'female',
      compatibility: 'supported',
      provenance: 'Verified chronological record',
    },
    laboratory: {
      compatibility: 'supported',
      contextId: 'laboratory-visit-2026-07-10',
      provenance: 'Original laboratory report',
    },
    calibration: null,
    device: null,
    history: { observationCount: 1, timeSpanDays: 0, continuity: 'sparse' },
    ...overrides,
  };
}

function authorization(ageYears = 40): ScientificExecutionAuthorization {
  const base = eligibilityRequest();
  const result = evaluateScientificEligibility(eligibilityRequest({
    population: { ...base.population, ageYears },
  }));
  if (!isScientificExecutionAuthorized(result, CALCULATED_AT)) {
    throw new Error('Test eligibility request did not produce an authorization.');
  }
  return result;
}

function calculationInputs(
  values: Record<ClinicalPhenoAgeInputId, number> = fixtures.cases[0].inputs,
): ClinicalPhenoAgeInput[] {
  return CLINICAL_PHENOAGE_INPUT_ORDER.map(id => ({
    id,
    measurementId: `measurement-${id}`,
    value: values[id],
    unit: CLINICAL_PHENOAGE_CANONICAL_UNITS[id],
  }));
}

function calculationRequest(
  overrides: Partial<ClinicalPhenoAgeCalculationRequest> = {},
): ClinicalPhenoAgeCalculationRequest {
  const inputs = overrides.inputs ?? calculationInputs();
  const ageInput = inputs.find(input => input.id === 'chronological_age');
  const defaultAuthorization = authorization(
    ageInput && typeof ageInput.value === 'number' && Number.isFinite(ageInput.value)
      && ageInput.value >= 20
      ? ageInput.value
      : 40,
  );
  return {
    authorization: defaultAuthorization,
    normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
    inputs,
    ...overrides,
  };
}

function replaceInput(
  inputs: readonly ClinicalPhenoAgeInput[],
  id: ClinicalPhenoAgeInputId,
  changes: Partial<ClinicalPhenoAgeInput>,
): ClinicalPhenoAgeInput[] {
  return inputs.map(input => input.id === id ? { ...input, ...changes } : input);
}

function captureError(action: () => unknown): ClinicalPhenoAgeCalculationError {
  try {
    action();
  } catch (error) {
    return error as ClinicalPhenoAgeCalculationError;
  }
  throw new Error('Expected calculation to fail.');
}

describe('Clinical Phenotypic Age calculation engine v1.0.0', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(CALCULATED_AT));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('locks SHA-256 and the exact versioned formula fingerprint', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(clinicalPhenoAgeFormulaFingerprint()).toBe(
      CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT,
    );
    expect(isClinicalPhenoAgeFormulaIntegrityValid()).toBe(true);
    expect(isClinicalPhenoAgeFormulaIntegrityValid({
      ...CLINICAL_PHENOAGE_FORMULA_DEFINITION,
      linearPredictor: {
        ...CLINICAL_PHENOAGE_FORMULA_DEFINITION.linearPredictor,
        albumin: '-0.0335',
      },
    })).toBe(false);
  });

  test.each(fixtures.cases)('matches independent arbitrary-precision fixture $id', fixture => {
    const output = calculateClinicalPhenoAgeWithAudit(calculationRequest({
      inputs: calculationInputs(fixture.inputs),
    }));
    expect(output.result.phenotypicAgeYears).toBeCloseTo(fixture.expected.phenotypicAgeYears, 10);
    expect(output.result.ageDifferenceYears).toBeCloseTo(
      fixture.expected.phenotypicAgeYears - fixture.inputs.chronological_age,
      10,
    );
    expect(output.audit.transformedInputs.naturalLogCrp).toBeCloseTo(fixture.expected.naturalLogCrp, 12);
    expect(output.audit.linearPredictor).toBeCloseTo(fixture.expected.linearPredictor, 12);
    expect(output.audit.publishedMortalityTransformation)
      .toBeCloseTo(fixture.expected.publishedMortalityTransformation, 12);
    expect(output.audit.transformedMortality).toBeCloseTo(fixture.expected.transformedMortality, 12);
  });

  test('returns an unrounded immutable audit snapshot with complete provenance', () => {
    const result = calculateClinicalPhenoAge(calculationRequest());
    expect(result).toMatchObject({
      calculationStatus: 'calculated',
      modelId: 'clinical_phenoage',
      modelVersion: VERSION,
      coefficientVersion: 'clinical-phenoage-coefficients/1.0.0',
      normalizationVersion: CLINICAL_PHENOAGE_NORMALIZATION_VERSION,
      implementationVersion: 'vitalspan-clinical-phenoage/1.0.0',
      chronologicalAgeYears: 40,
      calculatedAt: CALCULATED_AT,
      precision: {
        arithmetic: 'IEEE-754 binary64',
        intermediateRounding: 'none',
        outputRounding: 'none',
        presentationRounding: 'not_applied',
      },
    });
    expect(result.inputSnapshot).toHaveLength(10);
    expect(result.inputSnapshotHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.authorization.reference).toMatch(/^scientific-auth-/);
    expect(result.formulaProvenance.coefficientFingerprint)
      .toBe(CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT);
    expect(result.evidenceReferences).toContainEqual(expect.objectContaining({
      id: 'levine_phenoage_2018', doi: '10.18632/aging.101414',
    }));
    expect(result.limitations.length).toBeGreaterThan(3);
    expect(result).not.toHaveProperty('mortalityRisk');
    expect(result).not.toHaveProperty('lifespan');
    expect(result).not.toHaveProperty('recommendation');
    expect(result).not.toHaveProperty('healthScore');
  });

  test('requires an eligibility-engine-issued authorization', () => {
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ authorization: null }))).code)
      .toBe('AuthorizationMissing');

    const denied = evaluateScientificEligibility(eligibilityRequest({
      inputs: eligibilityInputs().filter(input => input.id !== 'albumin'),
    }));
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ authorization: denied }))).code)
      .toBe('AuthorizationDenied');

    const conditionalInputs = eligibilityInputs().map(input => input.id === 'crp'
      ? { ...input, assayCompatibility: 'unknown' as const }
      : input);
    const conditional = evaluateScientificEligibility(eligibilityRequest({ inputs: conditionalInputs }));
    expect(conditional.status).toBe('conditionally_eligible');
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({
      authorization: conditional,
    }))).code).toBe('AuthorizationDenied');

    const forged = { ...authorization() } as ScientificExecutionAuthorization;
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ authorization: forged }))).code)
      .toBe('AuthorizationAltered');
  });

  test('rejects expired and altered authorizations', () => {
    const expired = authorization();
    jest.setSystemTime(new Date('2026-07-17T12:06:00.001Z'));
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ authorization: expired }))).code)
      .toBe('AuthorizationExpired');

    jest.setSystemTime(new Date(CALCULATED_AT));
    const altered = authorization();
    (altered.authorizedEvidence as unknown as Array<{ measurementId: string }>)[0].measurementId = 'altered';
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ authorization: altered }))).code)
      .toBe('AuthorizationAltered');
  });

  test.each([
    ['modelId', 'kdm_biological_age', 'AuthorizationModelMismatch'],
    ['eligibleVersion', 'clinical-phenoage/2.0.0', 'AuthorizationVersionMismatch'],
    ['inputPolicyId', 'quality_controlled_vo2max', 'InputPolicyMismatch'],
  ] as const)('rejects authorization %s mismatch', (field, value, expectedCode) => {
    const mismatched = authorization();
    (mismatched as unknown as Record<string, unknown>)[field] = value;
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({
      authorization: mismatched,
    }))).code).toBe(expectedCode);
  });

  test('accepts only the explicit normalization contract', () => {
    const error = captureError(() => calculateClinicalPhenoAge(calculationRequest({
      normalizationVersion: 'clinical-phenoage-canonical-units/2.0.0',
    })));
    expect(error.code).toBe('UnsupportedNormalizationVersion');
    expect(error.message).toMatch(/no conversion/i);
  });

  test.each(CLINICAL_PHENOAGE_INPUT_ORDER)('rejects missing required input %s', id => {
    const inputs = calculationInputs().filter(input => input.id !== id);
    const error = captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs })));
    expect(error).toMatchObject({ code: 'MissingInput', inputId: id });
  });

  test.each(CLINICAL_PHENOAGE_INPUT_ORDER)('rejects the wrong unit for %s', id => {
    const inputs = replaceInput(calculationInputs(), id, {
      unit: 'ambiguous-unit' as ClinicalPhenoAgeCanonicalUnit,
    });
    const error = captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs })));
    expect(error).toMatchObject({ code: 'InvalidUnit', inputId: id });
  });

  test('rejects a missing unit without inferring it', () => {
    const inputs = replaceInput(calculationInputs(), 'albumin', {
      unit: undefined as unknown as ClinicalPhenoAgeCanonicalUnit,
    });
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs }))).code)
      .toBe('InvalidUnit');
  });

  test('rejects unexpected, duplicate, and substituted evidence', () => {
    const duplicate = [...calculationInputs(), calculationInputs()[0]];
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs: duplicate }))).code)
      .toBe('DuplicateInput');

    const unexpected = calculationInputs();
    (unexpected[0] as unknown as Record<string, unknown>).id = 'hba1c';
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({
      inputs: unexpected as readonly ClinicalPhenoAgeInput[],
    }))).code).toBe('InputSetMismatch');

    const substituted = replaceInput(calculationInputs(), 'albumin', { measurementId: 'different-measurement' });
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs: substituted }))).code)
      .toBe('MeasurementIdentifierMismatch');

    const changedAge = replaceInput(calculationInputs(), 'chronological_age', { value: 41 });
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({
      authorization: authorization(40),
      inputs: changedAge,
    }))).code).toBe('AuthorizedEvidenceMismatch');
  });

  test.each([
    ['NaN', Number.NaN, 'NonFiniteValue'],
    ['positive infinity', Number.POSITIVE_INFINITY, 'NonFiniteValue'],
    ['negative infinity', Number.NEGATIVE_INFINITY, 'NonFiniteValue'],
    ['locale-formatted string', '5,2', 'InvalidNumericType'],
  ] as const)('rejects %s numeric payloads', (_label, value, expectedCode) => {
    const inputs = replaceInput(calculationInputs(), 'glucose', {
      value: value as unknown as number,
    });
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs }))).code)
      .toBe(expectedCode);
  });

  test.each(CLINICAL_PHENOAGE_INPUT_ORDER)('rejects impossible negative value for %s', id => {
    const inputs = replaceInput(calculationInputs(), id, { value: -0.0001 });
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs }))).code)
      .toBe('OutOfSafetyBounds');
  });

  test('enforces inclusive and exclusive computational boundaries without clinical interpretation', () => {
    const minimumAge = replaceInput(calculationInputs(), 'chronological_age', { value: 20 });
    expect(calculateClinicalPhenoAge(calculationRequest({ inputs: minimumAge })).chronologicalAgeYears)
      .toBe(20);

    const zeroCrp = replaceInput(calculationInputs(), 'crp', { value: 0 });
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs: zeroCrp }))).code)
      .toBe('OutOfSafetyBounds');

    const excessiveAge = replaceInput(calculationInputs(), 'chronological_age', { value: 130.000001 });
    expect(captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs: excessiveAge }))).code)
      .toBe('OutOfSafetyBounds');
  });

  test('accepts an extreme but computationally valid value without clamping', () => {
    const inputs = replaceInput(calculationInputs(), 'crp', { value: 999 });
    const result = calculateClinicalPhenoAge(calculationRequest({ inputs }));
    expect(result.inputSnapshot.find(input => input.id === 'crp')?.value).toBe(999);
    expect(Number.isFinite(result.phenotypicAgeYears)).toBe(true);
  });

  test('returns a typed failure when valid bounded inputs leave the formula domain', () => {
    const inputs = replaceInput(calculationInputs(), 'white_blood_cell_count', { value: 1000 });
    const error = captureError(() => calculateClinicalPhenoAge(calculationRequest({ inputs })));
    expect(error.code).toBe('ComputationalDomainError');
    expect(error.message).toMatch(/no partial age/i);
  });

  test('is deterministic across repeated execution and input ordering', () => {
    const first = calculateClinicalPhenoAge(calculationRequest());
    const second = calculateClinicalPhenoAge(calculationRequest({ inputs: [...calculationInputs()].reverse() }));
    expect(second).toEqual(first);
  });

  test('keeps the snapshot hash stable and sensitive to exact numeric evidence', () => {
    const first = calculateClinicalPhenoAge(calculationRequest());
    const repeated = calculateClinicalPhenoAge(calculationRequest());
    expect(repeated.inputSnapshotHash).toBe(first.inputSnapshotHash);
    const changedInputs = replaceInput(calculationInputs(), 'glucose', { value: 5.0000001 });
    const changed = calculateClinicalPhenoAge(calculationRequest({ inputs: changedInputs }));
    expect(changed.inputSnapshotHash).not.toBe(first.inputSnapshotHash);
  });
});
