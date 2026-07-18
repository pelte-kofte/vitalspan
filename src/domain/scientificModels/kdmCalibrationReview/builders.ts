import type {
  KdmArchitectureArea,
  KdmArchitectureAssessment,
  KdmRubricAssessment,
  KdmRubricCriterion,
  QualitativeAssessment,
} from './contracts';

export const KDM_RUBRIC_CRITERIA = [
  'evidence_quality', 'replication', 'clinical_adoption', 'external_validation',
  'longevity_relevance', 'construct_clarity', 'interpretability', 'biomarker_quality',
  'calibration_robustness', 'population_robustness', 'generalizability',
  'scientific_maturity', 'maintenance_burden', 'version_stability',
  'implementation_complexity', 'future_proofing', 'double_counting_risk',
  'clinical_phenoage_compatibility', 'consumer_health_suitability',
  'scientific_platform_suitability',
] as const satisfies readonly KdmRubricCriterion[];

export const KDM_ARCHITECTURE_AREAS = [
  'scientific_registry', 'eligibility', 'authorization', 'versioning', 'validation',
  'scientific_governance', 'rubric', 'multimodal_architecture', 'component_contracts',
  'temporal_policies', 'uncertainty_architecture', 'combination_safety',
  'future_multimodal_expansion',
] as const satisfies readonly KdmArchitectureArea[];

type RubricValue = readonly [QualitativeAssessment, string];
type RubricInput = Readonly<Record<KdmRubricCriterion, RubricValue>>;

export function defineKdmRubric(
  defaultValue: RubricValue,
  overrides: Partial<RubricInput> = {},
): readonly KdmRubricAssessment[] {
  return KDM_RUBRIC_CRITERIA.map(criterion => ({
    criterion,
    assessment: (overrides[criterion] ?? defaultValue)[0],
    rationale: (overrides[criterion] ?? defaultValue)[1],
  }));
}

type ArchitectureInput = Readonly<Record<
  KdmArchitectureArea,
  readonly [KdmArchitectureAssessment['status'], string]
>>;

type ArchitectureValue = ArchitectureInput[KdmArchitectureArea];

export function defineKdmArchitecture(
  defaultValue: ArchitectureValue,
  overrides: Partial<ArchitectureInput> = {},
): readonly KdmArchitectureAssessment[] {
  return KDM_ARCHITECTURE_AREAS.map(area => ({
    area,
    status: (overrides[area] ?? defaultValue)[0],
    rationale: (overrides[area] ?? defaultValue)[1],
  }));
}
