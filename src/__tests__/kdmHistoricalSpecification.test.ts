import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  KDM_FUTURE_IMPLEMENTATION_CONTRACT,
  KDM_HISTORICAL_BIOMARKERS,
  KDM_HISTORICAL_EVIDENCE,
  KDM_HISTORICAL_CONTEXT_SPECIFICATION,
  KDM_HISTORICAL_OPEN_QUESTIONS,
  KDM_HISTORICAL_PIPELINE,
  KDM_HISTORICAL_RECONSTRUCTION_DECISION,
  KDM_NHANES_REPRODUCTION_SPECIFICATION,
  KDM_PREPROCESSING_SPECIFICATION,
  KDM_SEX_STRATIFICATION_SPECIFICATION,
  validateKdmHistoricalSpecification,
} from '../domain/scientificModels/kdmHistoricalSpecification';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    const path = join(directory, item.name);
    if (item.isDirectory()) return sourceFiles(path);
    return /\.ts$/.test(item.name) ? [path] : [];
  });
}

describe('KDM historical reconstruction and scientific specification', () => {
  test('passes scientific consistency and source traceability validation', () => {
    expect(validateKdmHistoricalSpecification()).toEqual([]);
    expect(KDM_HISTORICAL_EVIDENCE.length).toBeGreaterThanOrEqual(10);
    expect(new Set(KDM_HISTORICAL_EVIDENCE.map(source => source.id)).size)
      .toBe(KDM_HISTORICAL_EVIDENCE.length);
    expect(KDM_HISTORICAL_EVIDENCE.every(source => source.url.startsWith('https://'))).toBe(true);
    expect(KDM_HISTORICAL_EVIDENCE.map(source => source.authority)).toEqual(expect.arrayContaining([
      'primary_publication', 'original_method_publication', 'official_nhanes_documentation',
      'official_procedure_manual', 'peer_reviewed_replication',
    ]));
  });

  test('reconstructs the ten-marker KDM1 panel without creating production bounds', () => {
    expect(KDM_HISTORICAL_BIOMARKERS).toHaveLength(10);
    expect(new Set(KDM_HISTORICAL_BIOMARKERS.map(marker => marker.id)).size).toBe(10);
    expect(KDM_HISTORICAL_BIOMARKERS.map(marker => marker.id)).toEqual([
      'crp', 'creatinine', 'hba1c', 'systolic_blood_pressure', 'albumin',
      'total_cholesterol', 'cmv_optical_density', 'alkaline_phosphatase', 'fev1', 'bun',
    ]);
    for (const marker of KDM_HISTORICAL_BIOMARKERS) {
      expect(marker.nhanesVariableCandidates.length).toBeGreaterThan(0);
      expect(marker.qualityControl.length).toBeGreaterThan(0);
      expect(marker.evidenceIds.length).toBeGreaterThan(0);
      expect(marker.productionAllowedRange).toMatchObject({ resolution: 'unknown', value: null });
    }
  });

  test('preserves the public CMV contradiction as a blocking incompatibility', () => {
    const cmv = KDM_HISTORICAL_BIOMARKERS.find(marker => marker.id === 'cmv_optical_density');
    expect(cmv).toMatchObject({
      mappingStatus: 'incompatible_public_artifact',
      requiredUnit: { resolution: 'conflicted', value: null },
      modernEquivalent: { resolution: 'unknown', value: null },
    });
    expect(cmv?.controversies.join(' ')).toMatch(/women-only|male and female|impossible/i);
    expect(KDM_HISTORICAL_OPEN_QUESTIONS.find(question => question.id === 'cmv_source_artifact'))
      .toMatchObject({ route: 'cannot_currently_be_resolved', severity: 'blocking' });
  });

  test('documents a deterministic historical pipeline and complete-case policy', () => {
    expect(KDM_HISTORICAL_PIPELINE.map(stage => stage.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(KDM_HISTORICAL_PIPELINE.map(stage => stage.id)).toEqual([
      'source_population', 'age_restriction', 'measurement_collection', 'biomarker_selection',
      'complete_case_selection', 'sex_stratification', 'parameter_estimation',
      'kdm_variance_handling', 'mortality_validation',
    ]);
    expect(KDM_NHANES_REPRODUCTION_SPECIFICATION).toMatchObject({
      cycle: { value: 'NHANES III, 1988–1994' },
      missingDataPolicy: { resolution: 'resolved', value: expect.stringMatching(/complete-case/i) },
      populationWeights: { resolution: 'unknown', value: null },
      samplingTreatment: { resolution: 'unknown', value: null },
    });
  });

  test('keeps all undocumented preprocessing unknown and fail-closed', () => {
    expect(KDM_PREPROCESSING_SPECIFICATION).toHaveLength(10);
    expect(new Set(KDM_PREPROCESSING_SPECIFICATION.map(item => item.operation)).size).toBe(10);
    expect(KDM_PREPROCESSING_SPECIFICATION.find(item => item.operation === 'missing_data_handling'))
      .toMatchObject({ resolution: 'resolved', productionRule: 'complete_case_only' });
    expect(KDM_PREPROCESSING_SPECIFICATION
      .filter(item => item.operation !== 'missing_data_handling')
      .every(item => item.productionRule === 'blocked_until_resolved')).toBe(true);
    expect(KDM_PREPROCESSING_SPECIFICATION.find(item => item.operation === 'assay_harmonization'))
      .toMatchObject({ resolution: 'conflicted' });
  });

  test('represents sex stratification precisely without guessing unsupported branches', () => {
    expect(KDM_SEX_STRATIFICATION_SPECIFICATION).toMatchObject({
      modelStructure: { resolution: 'resolved', value: expect.stringMatching(/separate male and female/i) },
      biomarkerPanel: { resolution: 'resolved', value: expect.stringMatching(/same ten/i) },
      preprocessing: { resolution: 'unknown', value: null },
    });
    expect(KDM_SEX_STRATIFICATION_SPECIFICATION.unsupportedSexContextRule)
      .toMatch(/unavailable.*never infer/i);
  });

  test('makes reference cohort, timing, laboratory requirements, assumptions, and unknown behaviour explicit', () => {
    expect(KDM_HISTORICAL_CONTEXT_SPECIFICATION).toMatchObject({
      referenceCohort: { resolution: 'resolved', value: expect.stringMatching(/9,389/) },
      measurementTiming: { resolution: 'partially_resolved' },
      laboratoryRequirements: { resolution: 'partially_resolved' },
      qualityControlPolicy: { resolution: 'unknown', value: null },
    });
    expect(KDM_HISTORICAL_CONTEXT_SPECIFICATION.statisticalAssumptions).toHaveLength(4);
    expect(KDM_HISTORICAL_CONTEXT_SPECIFICATION.statisticalAssumptions.some(
      assumption => assumption.resolution === 'unknown',
    )).toBe(true);
    expect(KDM_HISTORICAL_CONTEXT_SPECIFICATION.unknownBehaviour)
      .toMatch(/unavailable.*never/i);
  });

  test('classifies every open question and retains material blockers', () => {
    expect(KDM_HISTORICAL_OPEN_QUESTIONS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(KDM_HISTORICAL_OPEN_QUESTIONS.map(question => question.id)).size)
      .toBe(KDM_HISTORICAL_OPEN_QUESTIONS.length);
    expect(new Set(KDM_HISTORICAL_OPEN_QUESTIONS.map(question => question.route))).toEqual(new Set([
      'requires_nhanes_investigation', 'requires_statistical_reconstruction',
      'requires_expert_review', 'cannot_currently_be_resolved',
    ]));
    expect(KDM_HISTORICAL_OPEN_QUESTIONS.filter(question => question.severity === 'blocking').length)
      .toBeGreaterThanOrEqual(10);
    expect(KDM_HISTORICAL_OPEN_QUESTIONS.every(question => question.requiredResolutionArtifact.length > 0))
      .toBe(true);
  });

  test('creates a non-executable fail-closed future contract and NOT YET decision', () => {
    expect(KDM_FUTURE_IMPLEMENTATION_CONTRACT).toMatchObject({
      calibrationIdentity: 'KDM-Levine-NHANES-III-KDM1 v1.0.0',
      implementationAuthorized: false,
      executionAllowed: false,
      readiness: 'not_yet',
      noImplicitConversion: true,
      noImputation: true,
      noAssaySubstitution: true,
      noSexBranchInference: true,
    });
    expect(KDM_FUTURE_IMPLEMENTATION_CONTRACT.blockingConditions.length).toBeGreaterThanOrEqual(10);
    expect(KDM_HISTORICAL_RECONSTRUCTION_DECISION).toMatchObject({
      goNoGo: 'not_yet', scientificConfidence: 'limited', faithfulImplementationPossibleNow: false,
    });
    expect(KDM_HISTORICAL_RECONSTRUCTION_DECISION.blockingUnknowns.length).toBeGreaterThanOrEqual(7);
  });

  test('contains research metadata only and cannot execute or reach product architecture', () => {
    const directory = join(process.cwd(), 'src/domain/scientificModels/kdmHistoricalSpecification');
    const source = sourceFiles(directory).map(file => readFileSync(file, 'utf8')).join('\n');
    expect(source).not.toMatch(/export function calculate|calculateKdm|executeScientific|createScientificAuthorization/);
    expect(source).not.toMatch(/Math\.|components\/|screens\/|navigation\/|livingSphere|clinicalPhenoAge\/calculation/);
    expect(source).not.toMatch(/coefficient\s*[:=]\s*-?\d/i);

    const applicationSource = sourceFiles(join(process.cwd(), 'src'))
      .filter(file => !file.includes('/domain/scientificModels/') && !file.includes('/__tests__/'))
      .map(file => readFileSync(file, 'utf8')).join('\n');
    expect(applicationSource).not.toMatch(/kdmHistoricalSpecification|KDM_FUTURE_IMPLEMENTATION_CONTRACT/);
  });

  test('documents every requested report section and scientific warning', () => {
    const documentation = readFileSync(join(
      process.cwd(), 'src/domain/scientificModels/kdmHistoricalSpecification/README.md',
    ), 'utf8');
    [
      'Reconstructed historical pipeline', 'Biomarker specification', 'CMV optical density',
      'Sex stratification', 'Preprocessing specification', 'NHANES reproduction specification',
      'Measurement timing and laboratory requirements', 'Statistical assumptions and limitations',
      'Non-executable implementation contract', 'Open scientific questions',
      'Scientific confidence', 'Final scientific decision',
    ].forEach(section => expect(documentation).toContain(section));
    expect(documentation).toContain('KDM-Levine-NHANES-III-KDM1 v1.0.0');
    expect(documentation).toMatch(/\*\*Go \/ No-Go: NOT YET\.\*\*/);
    expect(documentation).toMatch(/no equation, coefficient, executable model/i);
    expect(documentation).toMatch(/archive ranges.*not clinical reference ranges/i);
    expect((documentation.match(/https:\/\//g) ?? []).length).toBeGreaterThanOrEqual(10);
  });
});
