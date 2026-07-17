import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  SCIENTIFIC_INPUT_POLICIES,
  SCIENTIFIC_MODEL_REGISTRY,
  SCIENTIFIC_MODEL_VERSIONS,
  evaluateScientificEligibility,
  isScientificExecutionAuthorized,
  validateEligibilityCatalog,
  type ScientificEligibilityInput,
  type ScientificEligibilityRequest,
  type ScientificModelVersion,
} from '../domain/scientificModels';

const ASSESSED_AT = '2026-07-17T12:00:00.000Z';
const VERSION = 'clinical-phenoage/1.0.0';

const UNITS: Record<string, string> = {
  chronological_age: 'years',
  albumin: 'g/L',
  creatinine: 'μmol/L',
  glucose: 'mmol/L',
  crp: 'mg/dL',
  lymphocyte_percent: '%',
  mean_cell_volume: 'fL',
  red_cell_distribution_width: '%',
  alkaline_phosphatase: 'U/L',
  white_blood_cell_count: '10^3/μL',
};

function completeInputs(): ScientificEligibilityInput[] {
  const policy = SCIENTIFIC_INPUT_POLICIES.find(candidate =>
    candidate.id === 'clinical_phenoage_complete_visit');
  if (!policy) throw new Error('Missing test policy.');
  return policy.requiredInputs.map(requirement => ({
    id: requirement.id,
    measurementId: `${requirement.id}-measurement`,
    present: true,
    source: requirement.acceptedSources[0],
    unit: UNITS[requirement.id],
    measurementValidity: 'valid',
    freshness: 'current',
    assayCompatibility: 'supported',
    confidence: 'very_high',
    measuredAt: '2026-07-10T08:00:00.000Z',
  }));
}

function request(overrides: Partial<ScientificEligibilityRequest> = {}): ScientificEligibilityRequest {
  return {
    modelId: 'clinical_phenoage',
    requestedVersion: VERSION,
    assessedAt: ASSESSED_AT,
    inputs: completeInputs(),
    population: {
      ageYears: 40,
      sex: 'female',
      compatibility: 'supported',
      provenance: 'Verified profile and model-population review',
    },
    laboratory: {
      compatibility: 'supported',
      contextId: 'source-laboratory-report',
      provenance: 'Original laboratory report',
    },
    calibration: null,
    device: null,
    history: { observationCount: 1, timeSpanDays: 0, continuity: 'sparse' },
    ...overrides,
  };
}

function replaceInput(
  inputs: readonly ScientificEligibilityInput[],
  id: string,
  changes: Partial<ScientificEligibilityInput>,
): ScientificEligibilityInput[] {
  return inputs.map(input => input.id === id ? { ...input, ...changes } : input);
}

function activeVersion(changes: Partial<ScientificModelVersion>): ScientificModelVersion[] {
  const current = SCIENTIFIC_MODEL_VERSIONS.find(version =>
    version.modelId === 'clinical_phenoage' && version.version === VERSION);
  if (!current) throw new Error('Missing active test version.');
  return [{ ...current, ...changes }];
}

describe('Scientific Eligibility Engine', () => {
  test('validates version coverage for every registered scientific model', () => {
    expect(validateEligibilityCatalog()).toEqual([]);
    const versionedModels = new Set(SCIENTIFIC_MODEL_VERSIONS.map(version => version.modelId));
    expect(SCIENTIFIC_MODEL_REGISTRY.every(model => versionedModels.has(model.id))).toBe(true);
  });

  test('allows calculation only when every active-version requirement is satisfied', () => {
    const result = evaluateScientificEligibility(request());
    expect(result).toMatchObject({
      status: 'eligible',
      confidence: 'very_high',
      calculationAllowed: true,
      eligibleVersion: VERSION,
      blockingIssues: [],
      missingInputs: [],
    });
    expect(result.satisfiedInputs).toHaveLength(10);
    expect(isScientificExecutionAuthorized(result, ASSESSED_AT)).toBe(true);
    expect(result.authorizationReference).toMatch(/^scientific-auth-/);
    expect(result.authorizedEvidence).toHaveLength(10);
    expect(result.warnings).toContainEqual(expect.objectContaining({
      code: 'sparse_history', severity: 'informational',
    }));
  });

  test('blocks every missing required biomarker without imputation', () => {
    const inputs = completeInputs().filter(input => input.id !== 'albumin');
    const result = evaluateScientificEligibility(request({ inputs }));
    expect(result.status).toBe('not_eligible');
    expect(result.calculationAllowed).toBe(false);
    expect(result.missingInputs).toEqual(['albumin']);
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'missing_required_input', inputId: 'albumin',
    }));
  });

  test('blocks wrong units and never converts them automatically', () => {
    const inputs = replaceInput(completeInputs(), 'albumin', { unit: 'g/dL' });
    const result = evaluateScientificEligibility(request({ inputs }));
    expect(result.status).toBe('not_eligible');
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'unsupported_unit', inputId: 'albumin',
    }));
    expect(result.satisfiedInputs).not.toContain('albumin');
    expect(isScientificExecutionAuthorized(result)).toBe(false);
    expect(result.failureReasons.join(' ')).toMatch(/not converted automatically/i);
  });

  test('validates source and explicit unit as independent requirements', () => {
    const wrongSource = replaceInput(completeInputs(), 'albumin', {
      source: 'clinical_measurement',
    });
    expect(evaluateScientificEligibility(request({ inputs: wrongSource })).blockingIssues)
      .toContainEqual(expect.objectContaining({ code: 'wrong_input_source', inputId: 'albumin' }));

    const missingUnit = replaceInput(completeInputs(), 'albumin', { unit: undefined });
    expect(evaluateScientificEligibility(request({ inputs: missingUnit })).blockingIssues)
      .toContainEqual(expect.objectContaining({ code: 'missing_unit', inputId: 'albumin' }));
  });

  test('detects duplicate input identifiers', () => {
    const inputs = completeInputs();
    const result = evaluateScientificEligibility(request({ inputs: [...inputs, inputs[1]] }));
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'duplicate_input', inputId: 'albumin',
    }));
  });

  test('requires unique stable measurement identifiers for downstream authorization', () => {
    const missing = replaceInput(completeInputs(), 'albumin', { measurementId: '' });
    expect(evaluateScientificEligibility(request({ inputs: missing })).blockingIssues)
      .toContainEqual(expect.objectContaining({
        code: 'missing_measurement_identifier', inputId: 'albumin',
      }));

    const duplicate = replaceInput(completeInputs(), 'albumin', {
      measurementId: 'crp-measurement',
    });
    expect(evaluateScientificEligibility(request({ inputs: duplicate })).blockingIssues)
      .toContainEqual(expect.objectContaining({ code: 'duplicate_measurement_identifier' }));
  });

  test.each([
    ['measurement validity', { measurementValidity: 'invalid' as const }, 'invalid_measurement'],
    ['freshness', { freshness: 'stale' as const }, 'stale_measurement'],
    ['assay support', { assayCompatibility: 'unsupported' as const }, 'unsupported_assay'],
  ])('blocks failed %s', (_label, changes, code) => {
    const inputs = replaceInput(completeInputs(), 'crp', changes);
    const result = evaluateScientificEligibility(request({ inputs }));
    expect(result.status).toBe('not_eligible');
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({ code, inputId: 'crp' }));
  });

  test('returns conditional without calculation when measurement evidence is unknown', () => {
    const inputs = replaceInput(completeInputs(), 'crp', {
      measurementValidity: 'unknown',
      assayCompatibility: 'unknown',
    });
    const result = evaluateScientificEligibility(request({ inputs }));
    expect(result.status).toBe('conditionally_eligible');
    expect(result.calculationAllowed).toBe(false);
    expect(isScientificExecutionAuthorized(result)).toBe(false);
    expect(result.warnings.map(item => item.code)).toEqual(expect.arrayContaining([
      'unknown_measurement_validity', 'unknown_assay',
    ]));
  });

  test('treats unknown freshness as conditional and invalid timestamps as blocking', () => {
    const unknown = replaceInput(completeInputs(), 'crp', { freshness: 'unknown' });
    const conditional = evaluateScientificEligibility(request({ inputs: unknown }));
    expect(conditional.status).toBe('conditionally_eligible');
    expect(conditional.warnings).toContainEqual(expect.objectContaining({
      code: 'unknown_freshness', inputId: 'crp',
    }));

    const future = replaceInput(completeInputs(), 'crp', {
      measuredAt: '2027-01-01T00:00:00.000Z',
    });
    expect(evaluateScientificEligibility(request({ inputs: future })).blockingIssues)
      .toContainEqual(expect.objectContaining({ code: 'invalid_measurement', inputId: 'crp' }));
    expect(evaluateScientificEligibility(request({ assessedAt: 'not-a-date' })).blockingIssues)
      .toContainEqual(expect.objectContaining({ code: 'invalid_assessment_timestamp' }));
  });

  test('checks supplied optional inputs without turning absence into a blocker', () => {
    const basePolicy = SCIENTIFIC_INPUT_POLICIES.find(policy =>
      policy.id === 'clinical_phenoage_complete_visit');
    if (!basePolicy) throw new Error('Missing base policy.');
    const optionalPolicy = {
      ...basePolicy,
      optionalInputs: [{
        id: 'optional_context',
        label: 'Optional context',
        acceptedSources: ['clinical_measurement'] as const,
        unitRequired: true,
        acceptedUnits: ['context-unit'],
      }],
    };
    const absent = evaluateScientificEligibility(request(), SCIENTIFIC_MODEL_VERSIONS, [optionalPolicy]);
    expect(absent.status).toBe('eligible');

    const optionalInput: ScientificEligibilityInput = {
      id: 'optional_context', measurementId: 'optional-context-measurement', present: true,
      source: 'clinical_measurement', unit: 'wrong-unit',
      measurementValidity: 'valid', freshness: 'current', assayCompatibility: 'supported',
      confidence: 'very_high',
    };
    const supplied = evaluateScientificEligibility(request({
      inputs: [...completeInputs(), optionalInput],
    }), SCIENTIFIC_MODEL_VERSIONS, [optionalPolicy]);
    expect(supplied.status).toBe('eligible');
    expect(supplied.warnings).toContainEqual(expect.objectContaining({
      code: 'unsupported_unit', severity: 'informational', inputId: 'optional_context',
    }));
  });

  test('blocks documented population mismatch', () => {
    const base = request();
    const result = evaluateScientificEligibility(request({
      population: { ...base.population, compatibility: 'unsupported' },
    }));
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({ code: 'population_mismatch' }));
    expect(result.calculationAllowed).toBe(false);
  });

  test('returns conditional for unknown population compatibility', () => {
    const base = request();
    const result = evaluateScientificEligibility(request({
      population: { ...base.population, compatibility: 'unknown' },
    }));
    expect(result.status).toBe('conditionally_eligible');
    expect(result.warnings).toContainEqual(expect.objectContaining({ code: 'population_unknown' }));
  });

  test.each([
    [19, 'age_outside_range'],
    [undefined, 'missing_age'],
  ])('blocks unsupported or missing age (%s)', (ageYears, code) => {
    const base = request();
    const result = evaluateScientificEligibility(request({
      population: { ...base.population, ageYears },
    }));
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({ code }));
  });

  test('enforces sex restrictions only when a version scientifically requires them', () => {
    const result = evaluateScientificEligibility(request(), activeVersion({ allowedSex: ['male'] }));
    expect(result.status).toBe('not_eligible');
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'sex_restriction_mismatch',
    }));
  });

  test('blocks an unknown sex when a version scientifically requires a stratum', () => {
    const base = request();
    const result = evaluateScientificEligibility(request({
      population: { ...base.population, sex: 'not_recorded' },
    }), activeVersion({ allowedSex: ['female', 'male'] }));
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'missing_required_sex',
    }));
  });

  test.each([
    [null, 'missing_laboratory_context'],
    [{ compatibility: 'unsupported' as const, contextId: 'unsupported-lab', provenance: 'Audit' }, 'unsupported_laboratory_context'],
  ])('blocks missing or unsupported laboratory context', (laboratory, code) => {
    const result = evaluateScientificEligibility(request({ laboratory }));
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({ code }));
  });

  test('returns conditional for unknown laboratory compatibility', () => {
    const result = evaluateScientificEligibility(request({
      laboratory: { compatibility: 'unknown', contextId: 'unverified-lab', provenance: 'Unverified import' },
    }));
    expect(result.status).toBe('conditionally_eligible');
    expect(result.warnings).toContainEqual(expect.objectContaining({ code: 'unknown_laboratory_context' }));
  });

  test('requires an explicit laboratory context identifier', () => {
    const result = evaluateScientificEligibility(request({
      laboratory: { compatibility: 'supported', provenance: 'Unidentified import' },
    }));
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'missing_laboratory_context',
    }));
  });

  test('blocks missing and unsupported reference calibrations', () => {
    const versions = activeVersion({ requiredCalibrationIds: ['validated-calibration/1'] });
    const missing = evaluateScientificEligibility(request(), versions);
    expect(missing.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'missing_reference_calibration',
    }));

    const unsupported = evaluateScientificEligibility(request({
      calibration: {
        calibrationId: 'unknown-calibration',
        compatibility: 'unsupported',
        provenance: 'External file',
      },
    }), versions);
    expect(unsupported.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'unsupported_reference_calibration',
    }));
  });

  test('returns conditional for an unresolved named reference calibration', () => {
    const versions = activeVersion({ requiredCalibrationIds: ['validated-calibration/1'] });
    const result = evaluateScientificEligibility(request({
      calibration: {
        calibrationId: 'validated-calibration/1',
        compatibility: 'unknown',
        version: '1',
        provenance: 'Pending scientific verification',
      },
    }), versions);
    expect(result.status).toBe('conditionally_eligible');
    expect(result.warnings).toContainEqual(expect.objectContaining({
      code: 'unknown_reference_calibration',
    }));
  });

  test('handles unsupported and unknown device quality independently', () => {
    const versions = activeVersion({
      requiresDevice: true,
      supportedDeviceTypes: ['validated-device'],
    });
    const unsupported = evaluateScientificEligibility(request({
      device: {
        deviceType: 'consumer-device',
        compatibility: 'unsupported',
        quality: 'unvalidated',
        provenance: 'Device metadata',
      },
    }), versions);
    expect(unsupported.status).toBe('not_eligible');
    expect(unsupported.blockingIssues.map(item => item.code)).toEqual(expect.arrayContaining([
      'unsupported_device', 'unvalidated_device_quality',
    ]));

    const unknown = evaluateScientificEligibility(request({
      device: {
        deviceType: 'validated-device',
        compatibility: 'supported',
        quality: 'unknown',
        provenance: 'Incomplete device metadata',
      },
    }), versions);
    expect(unknown.status).toBe('conditionally_eligible');
    expect(unknown.calculationAllowed).toBe(false);
    expect(unknown.warnings).toContainEqual(expect.objectContaining({ code: 'unknown_device_quality' }));
  });

  test('blocks missing device evidence and missing device type independently', () => {
    const versions = activeVersion({ requiresDevice: true, supportedDeviceTypes: ['validated-device'] });
    expect(evaluateScientificEligibility(request(), versions).blockingIssues)
      .toContainEqual(expect.objectContaining({ code: 'missing_device' }));
    const withoutType = evaluateScientificEligibility(request({
      device: {
        compatibility: 'supported', quality: 'validated', provenance: 'Device report',
      },
    }), versions);
    expect(withoutType.blockingIssues).toContainEqual(expect.objectContaining({ code: 'missing_device' }));
  });

  test('blocks insufficient required history and warns on supported sparse history', () => {
    const versions = activeVersion({ minimumHistoryObservations: 2, minimumHistoryDays: 30 });
    const result = evaluateScientificEligibility(request(), versions);
    expect(result.status).toBe('not_eligible');
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({ code: 'insufficient_history' }));
  });

  test('blocks deprecated inputs explicitly', () => {
    const versions = activeVersion({ deprecatedInputIds: ['crp'] });
    const result = evaluateScientificEligibility(request(), versions);
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({
      code: 'deprecated_input', inputId: 'crp',
    }));
  });

  test('returns Unsupported for version mismatch and identifies the active version', () => {
    const result = evaluateScientificEligibility(request({ requestedVersion: 'clinical-phenoage/2.0.0' }));
    expect(result).toMatchObject({
      status: 'unsupported',
      calculationAllowed: false,
      eligibleVersion: VERSION,
    });
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({ code: 'unknown_model_version' }));
  });

  test('blocks research-only and unsupported registry models before input evaluation', () => {
    const research = evaluateScientificEligibility({
      ...request(),
      modelId: 'dunedinpace',
      requestedVersion: 'dunedinpace/1.0.0',
    });
    expect(research).toMatchObject({ status: 'research_only', calculationAllowed: false });
    expect(research.blockingIssues).toContainEqual(expect.objectContaining({ code: 'research_only_model' }));

    const unsupported = evaluateScientificEligibility({
      ...request(),
      modelId: 'hrv_derived_age',
      requestedVersion: 'hrv-derived-age/unsupported-1.0.0',
    });
    expect(unsupported).toMatchObject({ status: 'unsupported', calculationAllowed: false });
  });

  test('blocks a retired scientific version', () => {
    const retired = activeVersion({ lifecycle: 'retired' });
    const result = evaluateScientificEligibility(request(), retired);
    expect(result).toMatchObject({ status: 'retired', calculationAllowed: false });
    expect(result.blockingIssues).toContainEqual(expect.objectContaining({ code: 'retired_model' }));
  });

  test('propagates confidence without inventing it', () => {
    const highInputs = completeInputs().map(input => ({ ...input, confidence: 'high' as const }));
    const high = evaluateScientificEligibility(request({ inputs: highInputs }));
    expect(high).toMatchObject({ confidence: 'high', status: 'conditionally_eligible', calculationAllowed: false });

    const moderateInputs = replaceInput(completeInputs(), 'albumin', { confidence: 'moderate' });
    const moderate = evaluateScientificEligibility(request({ inputs: moderateInputs }));
    expect(moderate).toMatchObject({ confidence: 'moderate', status: 'not_eligible', calculationAllowed: false });
  });

  test('is deterministic and gives human-readable scientific failure reasons', () => {
    const incomplete = request({ inputs: completeInputs().filter(input => input.id !== 'albumin') });
    const first = evaluateScientificEligibility(incomplete);
    const second = evaluateScientificEligibility(incomplete);
    expect(first).toEqual(second);
    expect(first.humanExplanation).toMatch(/not eligible/i);
    expect(first.failureReasons[0]).toMatch(/Albumin is required/i);
    expect(first.evidenceSource.length).toBeGreaterThan(0);
  });

  test('contains no biological-age calculations or forbidden system dependencies', () => {
    const directory = join(process.cwd(), 'src/domain/scientificModels');
    const source = ['eligibilityModels.ts', 'modelVersions.ts', 'eligibilityValidation.ts', 'eligibility.ts']
      .map(file => readFileSync(join(directory, file), 'utf8')).join('\n');
    expect(source).not.toMatch(/computePhenoAge|calculateBiologicalAge|coefficient|weightedAverage/);
    expect(source).not.toMatch(/components\/|screens\/|livingSphere|navigation|recommendation|advisor/);
  });
});
