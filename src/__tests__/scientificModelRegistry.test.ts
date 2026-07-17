import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  SCIENTIFIC_EVALUATION_RUBRIC,
  SCIENTIFIC_EVIDENCE,
  SCIENTIFIC_INPUT_POLICIES,
  SCIENTIFIC_MODEL_ALIASES,
  SCIENTIFIC_MODEL_REGISTRY,
  SCIENTIFIC_UNCERTAINTY_POLICY,
  getScientificModel,
  validateScientificRegistry,
} from '../domain/scientificModels';

describe('scientific model registry', () => {
  test('passes strict registry integrity validation', () => {
    expect(validateScientificRegistry()).toEqual([]);
  });

  test('covers every required candidate without duplicating aliases', () => {
    expect(SCIENTIFIC_MODEL_REGISTRY).toHaveLength(17);
    expect(SCIENTIFIC_MODEL_ALIASES).toEqual(expect.arrayContaining([
      expect.objectContaining({ alias: 'Levine PhenoAge', canonicalModelId: 'clinical_phenoage' }),
      expect.objectContaining({ alias: 'Phenotypic Age', canonicalModelId: 'clinical_phenoage' }),
      expect.objectContaining({ alias: 'Biological Age (Levine original)', canonicalModelId: 'levine_2013_kdm' }),
    ]));
  });

  test('keeps acceptance conservative and explicit', () => {
    const accepted = SCIENTIFIC_MODEL_REGISTRY.filter(model => model.useDecision === 'accepted_candidate');
    expect(accepted.map(model => model.id)).toEqual([
      'clinical_phenoage',
      'kdm_biological_age',
      'vo2max_normative_ageing',
    ]);
    expect(accepted.every(model => model.inputPolicyId !== null)).toBe(true);
  });

  test('rejects generic HRV age and keeps context signals outside age influence', () => {
    expect(getScientificModel('hrv_derived_age')).toMatchObject({
      classification: 'rejected',
      useDecision: 'excluded',
      evidenceLevel: 'insufficient',
      inputPolicyId: null,
    });
    const contextIds = SCIENTIFIC_MODEL_REGISTRY
      .filter(model => model.classification === 'context_only')
      .map(model => model.id);
    expect(contextIds).toEqual(expect.arrayContaining([
      'frailty_index',
      'resting_heart_rate_literature',
      'sleep_duration_literature',
      'cardiorespiratory_fitness_literature',
      'nutrition_longevity_literature',
      'inflammation_literature',
      'cardiometabolic_risk_literature',
    ]));
  });

  test('retains epigenetic, sleep-regularity, historical, and emerging models as research only', () => {
    const researchOnly = SCIENTIFIC_MODEL_REGISTRY
      .filter(model => model.classification === 'research_only')
      .map(model => model.id);
    expect(researchOnly).toEqual([
      'levine_2013_kdm',
      'dnam_phenoage',
      'dunedinpace',
      'grim_age',
      'sleep_consistency_literature',
      'cardiometage',
    ]);
  });

  test('requires complete evidence and never allows missing-value imputation', () => {
    expect(SCIENTIFIC_INPUT_POLICIES).toHaveLength(3);
    SCIENTIFIC_INPUT_POLICIES.forEach(policy => {
      expect(policy.requiredInputs.length).toBeGreaterThan(0);
      expect(policy.missingValuePolicy).toBe('never_impute');
      expect(policy.failureConditions).toContain('missing_required_input');
    });
    expect(SCIENTIFIC_UNCERTAINTY_POLICY.find(rule => rule.id === 'missing_required_input'))
      .toMatchObject({ action: 'exclude_affected_model' });
  });

  test('preserves traceable peer-reviewed provenance for every model', () => {
    const evidenceIds = new Set(SCIENTIFIC_EVIDENCE.map(reference => reference.id));
    expect(SCIENTIFIC_EVIDENCE.every(reference => reference.peerReviewed)).toBe(true);
    expect(SCIENTIFIC_EVIDENCE.every(reference => reference.doi.length > 0
      && reference.pmid.length > 0 && reference.url.startsWith('https://'))).toBe(true);
    SCIENTIFIC_MODEL_REGISTRY.forEach(model => {
      expect(model.evidenceReferenceIds.length).toBeGreaterThan(0);
      expect(model.evidenceReferenceIds.every(id => evidenceIds.has(id))).toBe(true);
    });
  });

  test('defines an unscored rubric architecture with every required dimension', () => {
    expect(SCIENTIFIC_EVALUATION_RUBRIC.map(criterion => criterion.id)).toEqual([
      'evidence_quality',
      'external_validation',
      'clinical_adoption',
      'reproducibility',
      'population_diversity',
      'longevity_relevance',
      'interpretability',
      'implementation_feasibility',
      'maintenance_cost',
      'future_expandability',
    ]);
    expect(JSON.stringify(SCIENTIFIC_EVALUATION_RUBRIC)).not.toMatch(/"score"|"weight"|"total"/i);
  });

  test('contains metadata only and no calculations, estimates, or UI dependencies', () => {
    const serialized = JSON.stringify(SCIENTIFIC_MODEL_REGISTRY);
    expect(serialized).not.toMatch(/"formula"|"coefficient"|"weight"|"estimatedAge"|"lifespan"/i);

    const directory = join(process.cwd(), 'src/domain/scientificModels');
    const source = ['models.ts', 'evidence.ts', 'inputPolicies.ts', 'registry.ts', 'rubric.ts', 'uncertainty.ts', 'validation.ts']
      .map(file => readFileSync(join(directory, file), 'utf8')).join('\n');
    expect(source).not.toMatch(/components\/|screens\/|livingSphere|domain\/health/);
    expect(source).not.toMatch(/computePhenoAge|calculateBiologicalAge|predictLifespan/);
  });

  test('is deterministic and returns canonical records without mutation', () => {
    expect(JSON.stringify(SCIENTIFIC_MODEL_REGISTRY)).toBe(JSON.stringify(SCIENTIFIC_MODEL_REGISTRY));
    expect(getScientificModel('clinical_phenoage')).toBe(SCIENTIFIC_MODEL_REGISTRY[0]);
  });
});
