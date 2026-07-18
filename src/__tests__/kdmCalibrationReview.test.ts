import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  KDM_ARCHITECTURE_AREAS,
  KDM_CALIBRATION_DOSSIERS,
  KDM_CALIBRATION_EVIDENCE,
  KDM_CALIBRATION_GOVERNANCE_DECISIONS,
  KDM_PANEL_COMPARISON,
  KDM_POPULATION_COMPARISON,
  KDM_PRODUCTION_CALIBRATION_DECISION,
  KDM_RUBRIC_CRITERIA,
  KDM_VALIDATION_COMPARISON,
  getKdmCalibrationDossier,
  validateKdmCalibrationReview,
} from '../domain/scientificModels/kdmCalibrationReview';
import { SCIENTIFIC_MODEL_REGISTRY } from '../domain/scientificModels';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    const path = join(directory, item.name);
    if (item.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(item.name) ? [path] : [];
  });
}

describe('KDM calibration evidence review', () => {
  test('passes structured scientific integrity validation', () => {
    expect(validateKdmCalibrationReview()).toEqual([]);
    expect(KDM_CALIBRATION_DOSSIERS).toHaveLength(11);
    expect(new Set(KDM_CALIBRATION_DOSSIERS.map(item => item.id)).size).toBe(11);
    expect(KDM_CALIBRATION_EVIDENCE.length).toBeGreaterThanOrEqual(10);
    expect(new Set(KDM_CALIBRATION_EVIDENCE.map(item => item.id)).size)
      .toBe(KDM_CALIBRATION_EVIDENCE.length);
    KDM_CALIBRATION_EVIDENCE.forEach(reference => {
      expect(reference.doi).toMatch(/^10\./);
      expect(reference.pmid).toMatch(/^\d+$/);
      expect(reference.url).toMatch(/^https:\/\//);
    });
    KDM_CALIBRATION_DOSSIERS.forEach(dossier => {
      expect(dossier.officialName.length).toBeGreaterThan(0);
      expect(dossier.population.referenceCohort.length).toBeGreaterThan(0);
      expect(dossier.requiredPreprocessing.length).toBeGreaterThan(0);
      expect(dossier.validation.limitations.length).toBeGreaterThan(0);
      expect(dossier.knownLimitations.length).toBeGreaterThan(0);
      expect(dossier.knownImplementations.length).toBeGreaterThan(0);
      expect(dossier.rejectionOrSelectionRationale.length).toBeGreaterThan(0);
    });
  });

  test('distinguishes methods, calibrations, adaptations, reuse, and validation roles', () => {
    expect(getKdmCalibrationDossier('klemera_doubal_method_2006')).toMatchObject({
      recordKind: 'method_only', productionReadiness: 'rejected', biomarkerPanel: [],
    });
    expect(getKdmCalibrationDossier('belsky_dunedin_reuse_2015')).toMatchObject({
      recordKind: 'external_reuse', disposition: 'not_a_distinct_calibration',
    });
    expect(getKdmCalibrationDossier('nhanes_iv_validation_role')).toMatchObject({
      recordKind: 'validation_dataset_role', proposedVersionName: null,
    });
    expect(KDM_CALIBRATION_DOSSIERS.filter(item => item.recordKind === 'named_calibration')
      .every(item => item.biomarkerPanel.length > 0)).toBe(true);
  });

  test('selects exactly one named version conditionally and authorizes nothing', () => {
    expect(KDM_CALIBRATION_DOSSIERS
      .filter(item => item.disposition === 'selected_after_prerequisites')
      .map(item => item.id)).toEqual(['levine_nhanes_iii_kdm1_2013']);
    expect(KDM_PRODUCTION_CALIBRATION_DECISION).toMatchObject({
      recommendation: 'proceed_after_prerequisites',
      selectedCalibrationId: 'levine_nhanes_iii_kdm1_2013',
      recommendedVersionName: 'KDM-Levine-NHANES-III-KDM1 v1.0.0',
      implementationAuthorized: false,
    });
    expect(KDM_PRODUCTION_CALIBRATION_DECISION.prerequisites.length).toBeGreaterThanOrEqual(8);
    expect(KDM_CALIBRATION_DOSSIERS.map(item => String(item.productionReadiness)))
      .not.toContain('proceed');
  });

  test('documents complete qualitative rubrics and architecture fit without numeric scoring', () => {
    expect(KDM_RUBRIC_CRITERIA).toHaveLength(20);
    expect(KDM_ARCHITECTURE_AREAS).toHaveLength(13);
    for (const dossier of KDM_CALIBRATION_DOSSIERS) {
      expect(dossier.rubric).toHaveLength(KDM_RUBRIC_CRITERIA.length);
      expect(new Set(dossier.rubric.map(item => item.criterion)).size).toBe(KDM_RUBRIC_CRITERIA.length);
      expect(dossier.rubric.every(item => item.rationale.length > 0)).toBe(true);
      expect(dossier.architecture).toHaveLength(KDM_ARCHITECTURE_AREAS.length);
      expect(new Set(dossier.architecture.map(item => item.area)).size)
        .toBe(KDM_ARCHITECTURE_AREAS.length);
    }
    const serialized = JSON.stringify(KDM_CALIBRATION_DOSSIERS);
    expect(serialized).not.toMatch(/"score"|"numericScore"|"weightedScore"|"totalScore"/i);
  });

  test('preserves biomarker provenance, units, feasibility, overlap, and population comparisons', () => {
    expect(KDM_PANEL_COMPARISON).toHaveLength(KDM_CALIBRATION_DOSSIERS.length);
    expect(KDM_POPULATION_COMPARISON).toHaveLength(KDM_CALIBRATION_DOSSIERS.length);
    expect(KDM_VALIDATION_COMPARISON).toHaveLength(KDM_CALIBRATION_DOSSIERS.length);
    const selectedPanel = KDM_PANEL_COMPARISON.find(
      item => item.calibrationId === 'levine_nhanes_iii_kdm1_2013',
    );
    expect(selectedPanel).toMatchObject({ exactInputCount: 11 });
    expect(selectedPanel?.exactClinicalPhenoAgeOverlap).toEqual(expect.arrayContaining([
      'Chronological age', 'Serum albumin', 'Serum creatinine',
      'C-reactive protein', 'Serum alkaline phosphatase',
    ]));
    expect(selectedPanel?.specialtyOrResearchInputs).toEqual(expect.arrayContaining([
      'Cytomegalovirus antibody optical density', 'Forced expiratory volume in one second',
    ]));
    for (const dossier of KDM_CALIBRATION_DOSSIERS) {
      for (const input of dossier.biomarkerPanel) {
        expect(input.units.length).toBeGreaterThan(0);
        expect(input.internationalAvailability.length).toBeGreaterThan(0);
      }
    }
  });

  test('answers every calibration-governance question conservatively', () => {
    expect(KDM_CALIBRATION_GOVERNANCE_DECISIONS).toHaveLength(10);
    const decisions = JSON.stringify(KDM_CALIBRATION_GOVERNANCE_DECISIONS);
    [
      /exactly one calibration/i, /country/i, /ethnicity/i, /sex/i, /laboratory/i,
      /choose a calibration manually/i, /longitudinal consistency/i,
      /future recalibration/i, /freeze one version/i, /version migration/i,
    ].forEach(pattern => expect(decisions).toMatch(pattern));
    expect(decisions).toMatch(/No\. Country must never silently switch/i);
    expect(decisions).toMatch(/No\./i);
    expect(decisions).toMatch(/new model version/i);
  });

  test('is isolated review metadata with no calculation, UI, or execution path', () => {
    const directory = join(process.cwd(), 'src/domain/scientificModels/kdmCalibrationReview');
    const source = sourceFiles(directory).map(file => readFileSync(file, 'utf8')).join('\n');
    expect(source).not.toMatch(/calculateKdm|calculateBiologicalAge|executeScientific|createScientificAuthorization/);
    expect(source).not.toMatch(/components\/|screens\/|navigation\/|livingSphere|clinicalPhenoAge\/calculation/);
    expect(source).not.toMatch(/Math\.|reduce\(.*\+|weightedAverage/);

    const applicationSource = sourceFiles(join(process.cwd(), 'src'))
      .filter(file => !file.includes('/domain/scientificModels/') && !file.includes('/__tests__/'))
      .map(file => readFileSync(file, 'utf8')).join('\n');
    expect(applicationSource).not.toMatch(/kdmCalibrationReview|KDM_PRODUCTION_CALIBRATION_DECISION/);
  });

  test('does not mutate registry or production scientific status', () => {
    expect(SCIENTIFIC_MODEL_REGISTRY).toHaveLength(17);
    expect(SCIENTIFIC_MODEL_REGISTRY.find(item => item.id === 'kdm_biological_age'))
      .toMatchObject({ inputPolicyId: 'validated_kdm_calibration' });
    expect(SCIENTIFIC_MODEL_REGISTRY.find(item => item.id === 'levine_2013_kdm'))
      .toMatchObject({ classification: 'research_only', useDecision: 'deferred' });
  });

  test('documentation contains the decision, dossiers, matrices, governance, risks, and sources', () => {
    const documentation = readFileSync(join(
      process.cwd(), 'src/domain/scientificModels/kdmCalibrationReview/README.md',
    ), 'utf8');
    [
      'Klemera–Doubal 2006', 'Levine NHANES III KDM1', 'Levine NHANES III KDM2',
      'Belsky/Dunedin 2015', 'CALERIE 2017', 'BioAge V2 2021',
      'Zhong Singapore Longitudinal Aging Study 2020', 'Liu CHNS 2020',
      'Chan UK Biobank 2021', 'Mak NHANES III 18-marker KDM 2023',
      'NHANES IV and later recalibrations', 'Biomarker comparison',
      'Population comparison', 'Qualitative scientific rubric',
      'Architectural compatibility', 'Calibration governance answers',
      'Prerequisites before implementation', 'Open scientific uncertainties',
    ].forEach(section => expect(documentation).toContain(section));
    expect(documentation).toMatch(/Proceed after prerequisites/);
    expect(documentation).toContain('KDM-Levine-NHANES-III-KDM1 v1.0.0');
    expect(documentation).toMatch(/no KDM calculation/i);
    expect((documentation.match(/https:\/\//g) ?? []).length).toBeGreaterThanOrEqual(10);
  });
});
