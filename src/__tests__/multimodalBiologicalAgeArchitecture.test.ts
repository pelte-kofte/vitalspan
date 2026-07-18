import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  CLINICAL_PHENOAGE_OVERLAP_PROFILE,
  COMPONENT_GOVERNANCE_STAGE_ORDER,
  CURRENT_MULTIMODAL_PRODUCT_TRUTH,
  DOMAIN_CONTEXT_ROLE_MAPPINGS,
  DUNEDINPACE_OVERLAP_PROFILE,
  MULTIMODAL_RUBRIC_DIMENSIONS,
  MULTIMODAL_TEMPORAL_POLICIES,
  SCIENTIFIC_COMPONENT_ROLE_POLICIES,
  SCIENTIFIC_MODEL_COMPONENT_MAPPINGS,
  UNCONFIGURED_KDM_OVERLAP_PROFILE,
  assessComponentPairCompatibility,
  assessMultimodalAvailability,
  validateComponentGovernance,
  validateMultimodalArchitecture,
  validateMultimodalComponent,
  type ComponentGovernanceRecord,
  type ComponentUncertaintyCategory,
  type ComponentUncertaintyRecord,
  type MultimodalScientificComponent,
  type ScientificCombinationReviewPolicy,
} from '../domain/scientificModels';

const UNCERTAINTY_CATEGORIES = [
  'model_uncertainty',
  'measurement_uncertainty',
  'population_uncertainty',
  'temporal_uncertainty',
  'device_or_assay_uncertainty',
  'combination_uncertainty',
  'missing_evidence',
  'conflicting_evidence',
] as const satisfies readonly ComponentUncertaintyCategory[];

const ALL_UNCERTAINTY: readonly ComponentUncertaintyRecord[] = UNCERTAINTY_CATEGORIES.map(category => ({
  category,
  status: category === 'combination_uncertainty' ? 'present' : 'not_detected',
  explanation: category === 'combination_uncertainty'
    ? 'No multimodal combination is authorized.'
    : 'No additional uncertainty was detected in this fixture.',
  provenance: ['test scientific record'],
}));

function verifiedGovernance(): ComponentGovernanceRecord {
  return {
    lifecycleStatus: 'independently_verified',
    completedStages: COMPONENT_GOVERNANCE_STAGE_ORDER.slice(0, 7),
    currentStage: 'compatibility_review',
    rubricReview: {
      rubricVersion: '1.0.0',
      evidenceByCriterion: {
        evidence_quality: ['levine_phenoage_2018'],
        external_validation: ['liu_phenoage_validation_2018'],
        independent_replication: ['liu_phenoage_validation_2018'],
      },
      completeness: 'complete',
      reviewerReferences: ['phase-3.4a.4-independent-validation'],
      decision: 'approved',
      rationale: ['The individual model is independently verified; combination remains unreviewed.'],
    },
    retirementReason: null,
    supersededByComponentId: null,
  };
}

function researchGovernance(): ComponentGovernanceRecord {
  return {
    lifecycleStatus: 'under_review',
    completedStages: ['registry_entry', 'evidence_audit'],
    currentStage: 'internal_rubric_review',
    rubricReview: {
      rubricVersion: '1.0.0',
      evidenceByCriterion: {},
      completeness: 'incomplete',
      reviewerReferences: [],
      decision: 'pending',
      rationale: ['Production review is incomplete.'],
    },
    retirementReason: null,
    supersededByComponentId: null,
  };
}

function clinicalComponent(
  overrides: Partial<MultimodalScientificComponent> = {},
): MultimodalScientificComponent {
  return {
    componentId: 'clinical-phenoage-v1-current',
    scientificModelId: 'clinical_phenoage',
    scientificModelVersion: 'clinical-phenoage/1.0.0',
    role: 'primary_age_estimate',
    output: {
      construct: 'age_in_years',
      unit: 'years',
      description: 'Blood-based Clinical Phenotypic Age in years.',
      numericOutputPermitted: true,
      mayAlterAgeInYears: false,
    },
    eligibilityStatus: 'eligible',
    executionAuthorizationReference: 'scientific-execution:fixture',
    evidenceReferenceIds: ['levine_phenoage_2018', 'liu_phenoage_validation_2018'],
    populationApplicability: {
      status: 'supported',
      populationKey: 'reviewed_adult_population',
      description: 'Fixture population falls within reviewed applicability.',
      evidenceReferenceIds: ['levine_phenoage_2018', 'liu_phenoage_validation_2018'],
    },
    measurementWindow: {
      kind: 'single_collection',
      start: '2026-07-10T08:00:00.000Z',
      end: '2026-07-10T08:00:00.000Z',
      freshness: 'current',
      policyId: 'single_laboratory_collection',
      supportedIntervals: ['single collection'],
      missingPeriods: [],
      longitudinalRequirement: 'none',
      repeatMeasurementPolicy: 'model_specific',
      provenance: ['Validation Laboratory'],
    },
    confidence: { level: 'very_high', basis: 'Complete authorized fixture evidence.' },
    uncertainty: ALL_UNCERTAINTY,
    limitations: ['One model is not a multimodal biological-age result.'],
    dependencySet: [],
    overlap: CLINICAL_PHENOAGE_OVERLAP_PROFILE,
    combinationEligibility: {
      status: 'ineligible',
      exclusionReasons: ['combination_not_authorized'],
      scientificReviewReference: null,
      reviewedComponentVersions: [],
    },
    provenanceSnapshot: {
      capturedAt: '2026-07-17T12:00:00.000Z',
      registryModelId: 'clinical_phenoage',
      registryModelVersion: 'clinical-phenoage/1.0.0',
      evidenceReferenceIds: ['levine_phenoage_2018', 'liu_phenoage_validation_2018'],
      measurementIds: ['fixture-age', 'fixture-laboratory-visit'],
      sourceDescriptions: ['Scientific Eligibility Engine'],
      authorizationReference: 'scientific-execution:fixture',
    },
    governance: verifiedGovernance(),
    ...overrides,
  };
}

function paceComponent(
  overrides: Partial<MultimodalScientificComponent> = {},
): MultimodalScientificComponent {
  return {
    ...clinicalComponent(),
    componentId: 'dunedinpace-research',
    scientificModelId: 'dunedinpace',
    scientificModelVersion: 'dunedinpace/1.0.0',
    role: 'pace_of_aging_measure',
    output: {
      construct: 'pace_per_biological_year',
      unit: 'pace_per_biological_year',
      description: 'Research pace per biological year.',
      numericOutputPermitted: true,
      mayAlterAgeInYears: false,
    },
    eligibilityStatus: 'research_only',
    executionAuthorizationReference: null,
    evidenceReferenceIds: ['belsky_dunedinpace_2022'],
    populationApplicability: {
      status: 'unknown',
      populationKey: null,
      description: 'Production population applicability has not been approved.',
      evidenceReferenceIds: ['belsky_dunedinpace_2022'],
    },
    measurementWindow: {
      ...clinicalComponent().measurementWindow,
      kind: 'point_assessment',
      policyId: null,
      freshness: 'unknown',
    },
    overlap: DUNEDINPACE_OVERLAP_PROFILE,
    combinationEligibility: {
      status: 'research_only',
      exclusionReasons: ['research_only_component', 'construct_incompatible'],
      scientificReviewReference: null,
      reviewedComponentVersions: [],
    },
    provenanceSnapshot: {
      capturedAt: '2026-07-17T12:00:00.000Z',
      registryModelId: 'dunedinpace',
      registryModelVersion: 'dunedinpace/1.0.0',
      evidenceReferenceIds: ['belsky_dunedinpace_2022'],
      measurementIds: [],
      sourceDescriptions: ['Research registry'],
      authorizationReference: null,
    },
    governance: researchGovernance(),
    ...overrides,
  };
}

function unavailableKdmComponent(): MultimodalScientificComponent {
  return {
    ...clinicalComponent(),
    componentId: 'kdm-unconfigured',
    scientificModelId: 'kdm_biological_age',
    scientificModelVersion: null,
    role: 'independent_age_estimate',
    eligibilityStatus: 'unsupported',
    executionAuthorizationReference: null,
    evidenceReferenceIds: ['klemera_doubal_2006', 'levine_kdm_2013'],
    populationApplicability: {
      status: 'unknown', populationKey: null,
      description: 'A named calibration population has not been selected.',
      evidenceReferenceIds: ['klemera_doubal_2006', 'levine_kdm_2013'],
    },
    overlap: UNCONFIGURED_KDM_OVERLAP_PROFILE,
    combinationEligibility: {
      status: 'ineligible',
      exclusionReasons: ['missing_model_version', 'calibration_unavailable'],
      scientificReviewReference: null,
      reviewedComponentVersions: [],
    },
    provenanceSnapshot: {
      capturedAt: '2026-07-17T12:00:00.000Z',
      registryModelId: 'kdm_biological_age',
      registryModelVersion: null,
      evidenceReferenceIds: ['klemera_doubal_2006', 'levine_kdm_2013'],
      measurementIds: [],
      sourceDescriptions: ['Scientific registry placeholder'],
      authorizationReference: null,
    },
    dependencySet: [{
      id: 'named-kdm-calibration', version: null, status: 'unavailable',
      provenance: 'No calibration approved.',
    }],
    governance: researchGovernance(),
  };
}

function reviewPolicy(overrides: Partial<ScientificCombinationReviewPolicy> = {}): ScientificCombinationReviewPolicy {
  return {
    policyId: 'fixture-pair-review',
    componentIds: ['clinical-phenoage-v1-current', 'clinical-phenoage-v1-comparison'],
    componentVersions: ['clinical-phenoage/1.0.0', 'clinical-phenoage/1.0.0'],
    constructCompatibility: 'approved',
    unitCompatibilityReview: 'approved',
    sharedBiomarkerReview: 'not_reviewed',
    sharedTrainingPopulationReview: 'not_reviewed',
    outcomeOverlapReview: 'not_reviewed',
    doubleCountingReview: 'not_reviewed',
    correlationReview: 'not_reviewed',
    populationCompatibilityReview: 'approved',
    versionCompatibilityReview: 'approved',
    independentValidationReview: 'approved',
    calibrationAvailability: 'available',
    missingDataPolicy: 'never_impute',
    maximumAlignmentWindowDays: 0,
    scientificReviewDecision: 'approved',
    combinationAuthorizationReference: 'combination-authorization:fixture',
    evidenceReferenceIds: ['levine_phenoage_2018', 'liu_phenoage_validation_2018'],
    ...overrides,
  };
}

describe('Multimodal Biological Age architecture', () => {
  test('maps every scientific registry model through a valid conservative role', () => {
    expect(validateMultimodalArchitecture()).toEqual([]);
    expect(SCIENTIFIC_MODEL_COMPONENT_MAPPINGS).toHaveLength(17);
    expect(SCIENTIFIC_MODEL_COMPONENT_MAPPINGS.find(mapping => mapping.scientificModelId
      === 'clinical_phenoage')).toMatchObject({
      componentRole: 'primary_age_estimate',
      currentModelVersion: 'clinical-phenoage/1.0.0',
      currentAvailability: 'production',
      combinationStatus: 'ineligible',
    });
    expect(SCIENTIFIC_MODEL_COMPONENT_MAPPINGS.find(mapping => mapping.scientificModelId
      === 'kdm_biological_age')).toMatchObject({
      componentRole: 'independent_age_estimate',
      currentModelVersion: null,
      currentAvailability: 'future_unavailable',
    });
  });

  test('defines all roles while allowing age-in-years only for age-estimate roles', () => {
    expect(SCIENTIFIC_COMPONENT_ROLE_POLICIES.map(policy => policy.role)).toEqual([
      'primary_age_estimate', 'independent_age_estimate', 'pace_of_aging_measure',
      'validated_risk_modifier', 'normative_context', 'interpretive_context',
      'monitoring_signal', 'research_only', 'rejected',
    ]);
    expect(SCIENTIFIC_COMPONENT_ROLE_POLICIES
      .filter(policy => policy.mayProduceAgeInYears).map(policy => policy.role))
      .toEqual(['primary_age_estimate', 'independent_age_estimate']);
    expect(SCIENTIFIC_COMPONENT_ROLE_POLICIES.every(policy => !policy.mayNumericallyAlterAnotherAgeResult))
      .toBe(true);
  });

  test('pace cannot masquerade as age in years', () => {
    const invalid = paceComponent({
      output: {
        construct: 'age_in_years', unit: 'years', description: 'Invalid relabeling.',
        numericOutputPermitted: true, mayAlterAgeInYears: false,
      },
    });
    expect(validateMultimodalComponent(invalid)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid_role_construct' }),
    ]));
    const pair = assessComponentPairCompatibility(clinicalComponent(), paceComponent(), null);
    expect(pair.blockingReasons).toEqual(expect.arrayContaining([
      'role_prohibited', 'construct_incompatible', 'research_only_component',
    ]));
  });

  test('context and intervention domains cannot numerically modify age', () => {
    expect(DOMAIN_CONTEXT_ROLE_MAPPINGS.map(mapping => mapping.id)).toEqual(expect.arrayContaining([
      'sleep_duration', 'sleep_regularity', 'hrv', 'resting_heart_rate', 'smoking',
      'alcohol', 'nutrition', 'medication', 'supplement', 'peptide', 'therapy', 'frailty',
    ]));
    expect(DOMAIN_CONTEXT_ROLE_MAPPINGS.every(mapping => mapping.numericAgeInfluence
      === 'prohibited' && mapping.combinationStatus === 'ineligible')).toBe(true);
    const altered = { ...clinicalComponent(), ageContribution: 2 } as MultimodalScientificComponent;
    expect(validateMultimodalComponent(altered)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'prohibited_runtime_field' }),
    ]));
  });

  test('research-only components cannot combine', () => {
    const result = assessComponentPairCompatibility(clinicalComponent(), paceComponent(), null);
    expect(result.status).toBe('incompatible');
    expect(result.blockingReasons).toContain('research_only_component');
    expect(result.combinationAuthorizationReference).toBeNull();
  });

  test('incompatible output units are blocked explicitly', () => {
    const comparison = clinicalComponent({
      componentId: 'clinical-phenoage-v1-comparison',
      combinationEligibility: {
        status: 'eligible_for_review', exclusionReasons: [],
        scientificReviewReference: 'review:fixture',
        reviewedComponentVersions: ['clinical-phenoage/1.0.0'],
      },
    });
    const result = assessComponentPairCompatibility(
      clinicalComponent({ combinationEligibility: comparison.combinationEligibility }),
      comparison,
      reviewPolicy({ unitCompatibilityReview: 'rejected' }),
    );
    expect(result.blockingReasons).toContain('unit_incompatible');
    expect(result.status).toBe('incompatible');
  });

  test('overlapping components require explicit double-counting review', () => {
    const eligibility = {
      status: 'eligible_for_review' as const,
      exclusionReasons: [],
      scientificReviewReference: 'review:fixture',
      reviewedComponentVersions: ['clinical-phenoage/1.0.0'],
    };
    const left = clinicalComponent({ combinationEligibility: eligibility });
    const right = clinicalComponent({
      componentId: 'clinical-phenoage-v1-comparison',
      combinationEligibility: eligibility,
    });
    const result = assessComponentPairCompatibility(left, right, reviewPolicy());
    expect(result.sharedInputIds).toContain('crp');
    expect(result.sharedCorrelationGroups).toContain('inflammation');
    expect(result.blockingReasons).toEqual(expect.arrayContaining([
      'shared_biomarkers_unresolved',
      'shared_training_population_unresolved',
      'outcome_overlap_unresolved',
      'double_counting_risk_unresolved',
      'correlation_risk_unresolved',
    ]));
  });

  test('missing version, stale timing, and population mismatch each fail closed', () => {
    const missingVersion = assessComponentPairCompatibility(
      clinicalComponent(), unavailableKdmComponent(), null,
    );
    expect(missingVersion.blockingReasons).toEqual(expect.arrayContaining([
      'missing_model_version', 'calibration_unavailable',
    ]));

    const stale = clinicalComponent({
      componentId: 'clinical-phenoage-stale',
      measurementWindow: { ...clinicalComponent().measurementWindow, freshness: 'stale' },
    });
    expect(assessComponentPairCompatibility(clinicalComponent(), stale, null)
      .blockingReasons).toContain('stale_component');

    const populationMismatch = clinicalComponent({
      componentId: 'clinical-phenoage-other-population',
      populationApplicability: {
        ...clinicalComponent().populationApplicability,
        populationKey: 'different_population',
      },
    });
    expect(assessComponentPairCompatibility(clinicalComponent(), populationMismatch, null)
      .blockingReasons).toContain('population_mismatch');
  });

  test('unknown overlap and alignment evidence fails closed', () => {
    const unknown = clinicalComponent({
      componentId: 'clinical-phenoage-unknown-overlap',
      overlap: { ...CLINICAL_PHENOAGE_OVERLAP_PROFILE, completeness: 'unknown' },
      measurementWindow: {
        ...clinicalComponent().measurementWindow, end: null, freshness: 'unknown',
      },
    });
    const result = assessComponentPairCompatibility(clinicalComponent(), unknown, null);
    expect(result.blockingReasons).toEqual(expect.arrayContaining([
      'unknown_evidence', 'measurement_window_unknown',
    ]));
    expect(result.combinationAuthorizationReference).toBeNull();
  });

  test('preserves every uncertainty category instead of collapsing to confidence', () => {
    expect(validateMultimodalComponent(clinicalComponent())).toEqual([]);
    const incomplete = clinicalComponent({ uncertainty: ALL_UNCERTAINTY.slice(0, -1) });
    expect(validateMultimodalComponent(incomplete)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'missing_uncertainty_category' }),
    ]));
    expect(clinicalComponent().confidence).toEqual({
      level: 'very_high', basis: 'Complete authorized fixture evidence.',
    });
  });

  test('single validated age model cannot produce multimodal availability', () => {
    const current = assessMultimodalAvailability([clinicalComponent()]);
    expect(current).toMatchObject({
      state: 'single_validated_model_available',
      multimodalAgeAvailable: false,
      validatedAgeComponentIds: ['clinical-phenoage-v1-current'],
    });
    expect(CURRENT_MULTIMODAL_PRODUCT_TRUTH).toMatchObject({
      validatedProductionAgeModels: ['clinical-phenoage/1.0.0'],
      productionLabel: 'Blood-Based Phenotypic Age',
      multimodalBiologicalAgeExists: false,
    });
  });

  test('governance stages cannot be skipped and reviewer rejection remains authoritative', () => {
    const skipped: ComponentGovernanceRecord = {
      ...researchGovernance(),
      completedStages: ['registry_entry', 'internal_rubric_review'],
      currentStage: 'versioned_input_policy',
    };
    expect(validateComponentGovernance(skipped)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'stage_skipped' }),
    ]));

    const rejected: ComponentGovernanceRecord = {
      ...researchGovernance(),
      lifecycleStatus: 'rejected',
      currentStage: null,
      rubricReview: {
        ...researchGovernance().rubricReview,
        decision: 'rejected',
        rationale: ['Scientific reviewers rejected the construct despite available evidence.'],
      },
    };
    expect(validateComponentGovernance(rejected)).toEqual([]);
  });

  test('connects the existing unscored rubric and leaves temporal durations model-specific', () => {
    expect(MULTIMODAL_RUBRIC_DIMENSIONS.map(dimension => dimension.id)).toEqual(expect.arrayContaining([
      'evidence_quality', 'external_validation', 'reproducibility',
      'population_diversity', 'longevity_relevance', 'implementation_feasibility',
      'maintenance_cost', 'construct_compatibility', 'overlap_risk',
      'independent_replication',
    ]));
    expect(JSON.stringify(MULTIMODAL_RUBRIC_DIMENSIONS)).not.toMatch(/"score"|"weight"|"total"/i);
    expect(MULTIMODAL_TEMPORAL_POLICIES.every(policy => policy.maximumAlignmentWindowDays
      === null && policy.defaultWindowDays === null)).toBe(true);
  });

  test('contains no calculation path and introduces no product terminology regression', () => {
    const directory = join(process.cwd(), 'src/domain/scientificModels/multimodal');
    const source = readdirSync(directory)
      .filter(file => file.endsWith('.ts'))
      .map(file => readFileSync(join(directory, file), 'utf8'))
      .join('\n');
    expect(source).not.toMatch(/calculateMultimodal|compositeAge|weightedAverage|ageContribution\s*:/);
    expect(source).not.toMatch(/components\/|screens\/|livingSphere|recommendation|ClinicalCopilot/);

    const productDirectories = ['src/screens', 'src/components', 'src/navigation'];
    const productSource = productDirectories.flatMap(path => {
      const root = join(process.cwd(), path);
      const walk = (directoryPath: string): string[] => readdirSync(directoryPath, { withFileTypes: true })
        .flatMap(item => item.isDirectory()
          ? walk(join(directoryPath, item.name))
          : /\.(ts|tsx)$/.test(item.name) ? [join(directoryPath, item.name)] : []);
      return walk(root);
    }).map(file => readFileSync(file, 'utf8')).join('\n');
    expect(productSource).not.toMatch(/Multimodal Biological Age|Multimodal Age/i);
  });
});
