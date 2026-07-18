import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  CANDIDATE_EVALUATION_RUBRIC,
  CANDIDATE_PRIORITIZATION_DECISION,
  SCIENTIFIC_CANDIDATE_DOSSIERS,
  SCIENTIFIC_CANDIDATE_RECOMMENDATIONS,
  SCIENTIFIC_MODEL_REGISTRY,
  getScientificCandidateDossier,
  validateScientificCandidateEvaluations,
} from '../domain/scientificModels';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    const path = join(directory, item.name);
    if (item.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(item.name) ? [path] : [];
  });
}

describe('scientific candidate evaluation and prioritization', () => {
  test('passes complete candidate-evaluation integrity validation', () => {
    expect(validateScientificCandidateEvaluations()).toEqual([]);
    expect(SCIENTIFIC_CANDIDATE_DOSSIERS).toHaveLength(10);
    expect(SCIENTIFIC_CANDIDATE_DOSSIERS.map(candidate => candidate.id)).toEqual([
      'clinical_phenoage_reference', 'kdm', 'vo2max',
      'dunedinpace', 'dnam_phenoage', 'grim_age',
      'cardiometage', 'frailty_index', 'hrv_biological_age',
      'sleep_biological_age',
    ]);
  });

  test('gives every candidate every qualitative rubric criterion without a score', () => {
    expect(CANDIDATE_EVALUATION_RUBRIC).toHaveLength(25);
    const allowed = new Set([
      'excellent', 'strong', 'moderate', 'limited', 'insufficient', 'unknown',
      'not_applicable',
    ]);
    SCIENTIFIC_CANDIDATE_DOSSIERS.forEach(candidate => {
      expect(candidate.rubric).toHaveLength(CANDIDATE_EVALUATION_RUBRIC.length);
      expect(new Set(candidate.rubric.map(item => item.criterionId)).size).toBe(25);
      expect(candidate.rubric.every(item => allowed.has(item.assessment))).toBe(true);
      expect(candidate.rubric.every(item => item.rationale.length > 0
        && item.evidenceReferenceIds.length > 0)).toBe(true);
    });
    expect(JSON.stringify(SCIENTIFIC_CANDIDATE_DOSSIERS)).not.toMatch(
      /"score"|"numericScore"|"totalScore"|"weightedScore"|"coefficient"|"formula"/i,
    );
  });

  test('includes a complete evidence, architecture, and risk dossier for each candidate', () => {
    SCIENTIFIC_CANDIDATE_DOSSIERS.forEach(candidate => {
      expect(candidate.evidenceProfile.requiredInputs.length).toBeGreaterThan(0);
      expect(candidate.evidenceProfile.knownStrengths.length).toBeGreaterThan(0);
      expect(candidate.evidenceProfile.knownLimitations.length).toBeGreaterThan(0);
      expect(candidate.evidenceProfile.missingEvidence.length).toBeGreaterThan(0);
      expect(candidate.architectureFit).toHaveLength(12);
      expect(candidate.risks).toHaveLength(12);
      expect(candidate.risks.every(risk => risk.rationale.length > 0
        && risk.mitigation.length > 0)).toBe(true);
      expect(candidate.governancePrerequisites.length).toBeGreaterThan(0);
      expect(candidate.canBypassGovernance).toBe(false);
    });
  });

  test('prioritizes one conditional program while authorizing no implementation', () => {
    expect(CANDIDATE_PRIORITIZATION_DECISION).toMatchObject({
      recommendedNextCandidateId: 'kdm',
      productionImplementationAuthorizedNow: false,
      tierOrder: {
        reference_only: ['clinical_phenoage_reference'],
        tier_1: ['kdm'],
        tier_2: ['vo2max', 'dnam_phenoage'],
        tier_3: ['cardiometage', 'frailty_index'],
        research: ['dunedinpace', 'grim_age', 'sleep_biological_age'],
        rejected: ['hrv_biological_age'],
      },
    });
    expect(getScientificCandidateDossier('kdm')).toMatchObject({
      implementationReadiness: 'requires_calibration',
      priorityTier: 'tier_1',
    });
    expect(SCIENTIFIC_CANDIDATE_DOSSIERS
      .filter(candidate => !candidate.referenceOnly)
      .map(candidate => candidate.implementationReadiness))
      .not.toContain('production_ready');
  });

  test('answers every required special scientific decision conservatively', () => {
    expect(SCIENTIFIC_CANDIDATE_RECOMMENDATIONS).toHaveLength(6);
    const serialized = JSON.stringify(SCIENTIFIC_CANDIDATE_RECOMMENDATIONS);
    expect(serialized).toMatch(/named KDM calibration/i);
    expect(serialized).toMatch(/Keep direct measured VO₂max as normative context/i);
    expect(serialized).toMatch(/pace construct must remain scientifically independent/i);
    expect(serialized).toMatch(/No\. Registry and research review may continue/i);
    expect(serialized).toMatch(/wearable-derived biological age be excluded/i);
    expect(serialized).toMatch(/Frailty Index may be considered later as separately reported context/i);
  });

  test('keeps rejected and research candidates outside production', () => {
    expect(getScientificCandidateDossier('hrv_biological_age')).toMatchObject({
      implementationReadiness: 'rejected', priorityTier: 'rejected',
    });
    expect(getScientificCandidateDossier('sleep_biological_age')).toMatchObject({
      implementationReadiness: 'not_recommended', priorityTier: 'research',
    });
    expect(getScientificCandidateDossier('dunedinpace')).toMatchObject({
      implementationReadiness: 'research_only', priorityTier: 'research',
    });
    expect(getScientificCandidateDossier('frailty_index').recommendedAction)
      .toMatch(/Keep Frailty Index separate/i);
  });

  test('does not modify or duplicate the scientific registry', () => {
    expect(SCIENTIFIC_MODEL_REGISTRY).toHaveLength(17);
    expect(SCIENTIFIC_MODEL_REGISTRY.filter(model => model.id === 'clinical_phenoage'))
      .toHaveLength(1);
    expect(SCIENTIFIC_MODEL_REGISTRY.filter(model => model.id === 'kdm_biological_age'))
      .toHaveLength(1);
    expect(SCIENTIFIC_MODEL_REGISTRY.find(model => model.id === 'hrv_derived_age'))
      .toMatchObject({ classification: 'rejected', useDecision: 'excluded' });
  });

  test('contains decision metadata only and has no production, UI, or calculation path', () => {
    const candidateDirectory = join(
      process.cwd(), 'src/domain/scientificModels/candidateEvaluation',
    );
    const source = sourceFiles(candidateDirectory)
      .map(file => readFileSync(file, 'utf8')).join('\n');
    expect(source).not.toMatch(/from ['"].*clinicalPhenoAge\/calculation/);
    expect(source).not.toMatch(/calculateClinicalPhenoAge|calculateMultimodal|weightedAverage/);
    expect(source).not.toMatch(/components\/|screens\/|navigation\/|livingSphere\/renderer/);

    const applicationSource = sourceFiles(join(process.cwd(), 'src'))
      .filter(file => !file.includes('/domain/scientificModels/')
        && !file.includes('/__tests__/'))
      .map(file => readFileSync(file, 'utf8')).join('\n');
    expect(applicationSource).not.toMatch(/candidateEvaluation|SCIENTIFIC_CANDIDATE_DOSSIERS/);
  });

  test('documents every tier, candidate, special decision, and evidence boundary', () => {
    const documentation = readFileSync(join(
      process.cwd(),
      'src/domain/scientificModels/candidateEvaluation/README.md',
    ), 'utf8');
    [
      'Clinical PhenoAge', 'KDM', 'VO₂max', 'DunedinPACE', 'DNAm PhenoAge',
      'DNAm GrimAge', 'CardioMetAge', 'Frailty Index', 'HRV-based biological age',
      'Sleep-derived biological age',
    ].forEach(candidate => expect(documentation).toContain(candidate));
    [
      'Reference only', 'Tier 1', 'Tier 2', 'Tier 3', 'Research only', 'Rejected',
      'KDM next?', 'VO₂max evolution?', 'DunedinPACE independent forever?',
      'Methylation without a laboratory?', 'Wearable-derived age?', 'Frailty?',
    ].forEach(section => expect(documentation).toContain(section));
    expect(documentation).toMatch(/No new candidate is currently authorized for production implementation/);
    expect(documentation).toMatch(/no numeric score/i);
    expect((documentation.match(/https:\/\//g) ?? []).length).toBeGreaterThanOrEqual(10);
  });
});
