import type { EvidenceReferenceId, ScientificModelId } from '../models';
import type { ScientificRubricCriterionId } from '../rubric';

export type ScientificCandidateId =
  | 'clinical_phenoage_reference'
  | 'kdm'
  | 'vo2max'
  | 'dunedinpace'
  | 'dnam_phenoage'
  | 'grim_age'
  | 'cardiometage'
  | 'frailty_index'
  | 'hrv_biological_age'
  | 'sleep_biological_age';

export type QualitativeScientificAssessment =
  | 'excellent'
  | 'strong'
  | 'moderate'
  | 'limited'
  | 'insufficient'
  | 'unknown'
  | 'not_applicable';

export type CandidateRubricCriterionId =
  | 'scientific_evidence_quality'
  | 'external_validation'
  | 'independent_replication'
  | 'population_diversity'
  | 'clinical_relevance'
  | 'longevity_relevance'
  | 'construct_clarity'
  | 'interpretability'
  | 'input_reliability'
  | 'measurement_availability'
  | 'standardization'
  | 'implementation_complexity'
  | 'maintenance_burden'
  | 'calibration_availability'
  | 'version_stability'
  | 'temporal_robustness'
  | 'generalizability'
  | 'risk_of_misuse'
  | 'double_counting_risk'
  | 'correlation_with_production_model'
  | 'architecture_compatibility'
  | 'multimodal_suitability'
  | 'expert_review_need'
  | 'future_calibration_need'
  | 'additional_governance_need';

export interface CandidateRubricCriterionDefinition {
  id: CandidateRubricCriterionId;
  title: string;
  question: string;
  existingRubricCriterionId: ScientificRubricCriterionId | null;
}

export interface CandidateRubricAssessment {
  criterionId: CandidateRubricCriterionId;
  assessment: QualitativeScientificAssessment;
  rationale: string;
  evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export type CandidateImplementationReadiness =
  | 'production_ready'
  | 'scientifically_promising'
  | 'research_only'
  | 'requires_calibration'
  | 'requires_independent_review'
  | 'not_recommended'
  | 'rejected';

export type CandidatePriorityTier =
  | 'reference_only'
  | 'tier_1'
  | 'tier_2'
  | 'tier_3'
  | 'research'
  | 'rejected';

export type CandidateArchitectureArea =
  | 'scientific_registry'
  | 'eligibility_engine'
  | 'execution_authorization'
  | 'versioning'
  | 'scientific_governance'
  | 'component_contracts'
  | 'temporal_policies'
  | 'uncertainty_architecture'
  | 'combination_safety'
  | 'presentation_layer'
  | 'multimodal_framework'
  | 'living_sphere';

export type ArchitectureFitStatus =
  | 'compatible'
  | 'compatible_with_conditions'
  | 'blocked'
  | 'not_applicable'
  | 'unknown';

export interface CandidateArchitectureAssessment {
  area: CandidateArchitectureArea;
  status: ArchitectureFitStatus;
  rationale: string;
}

export type CandidateRiskCategory =
  | 'scientific_uncertainty'
  | 'implementation_risk'
  | 'maintenance_risk'
  | 'future_migration_risk'
  | 'regulatory_ambiguity'
  | 'clinical_interpretation_risk'
  | 'user_misunderstanding_risk'
  | 'biological_age_overstatement_risk'
  | 'unsupported_marketing_risk'
  | 'double_counting_risk'
  | 'population_transportability_risk'
  | 'version_drift_risk';

export type CandidateRiskLevel = 'low' | 'moderate' | 'high' | 'unknown' | 'not_applicable';

export interface CandidateRiskAssessment {
  category: CandidateRiskCategory;
  level: CandidateRiskLevel;
  rationale: string;
  mitigation: string;
}

export type CandidateBurden = 'low' | 'moderate' | 'high' | 'very_high' | 'unknown';
export type CandidateAvailability = 'common' | 'specialty' | 'research_only' | 'unavailable' | 'unknown';

export interface CandidateEvidenceProfile {
  whatItMeasures: string;
  scientificConstruct: string;
  requiredInputs: readonly string[];
  typicalUse: readonly string[];
  knownStrengths: readonly string[];
  knownLimitations: readonly string[];
  validationHistory: readonly string[];
  currentResearchStatus: string;
  productionReadinessSummary: string;
  expectedFutureStability: string;
  importantAssumptions: readonly string[];
  knownControversies: readonly string[];
  missingEvidence: readonly string[];
  populationLimitations: readonly string[];
  measurementBurden: CandidateBurden;
  costImplications: CandidateBurden;
  clinicalAvailability: CandidateAvailability;
}

export interface ScientificCandidateDossier {
  id: ScientificCandidateId;
  title: string;
  scientificModelIds: readonly ScientificModelId[];
  referenceOnly: boolean;
  evidenceReferenceIds: readonly EvidenceReferenceId[];
  evidenceProfile: CandidateEvidenceProfile;
  rubric: readonly CandidateRubricAssessment[];
  architectureFit: readonly CandidateArchitectureAssessment[];
  risks: readonly CandidateRiskAssessment[];
  implementationReadiness: CandidateImplementationReadiness;
  readinessReasons: readonly string[];
  priorityTier: CandidatePriorityTier;
  priorityRationale: readonly string[];
  recommendedAction: string;
  governancePrerequisites: readonly string[];
  canBypassGovernance: false;
}

export interface CandidatePrioritizationDecision {
  recommendedNextCandidateId: ScientificCandidateId;
  productionImplementationAuthorizedNow: false;
  decision: string;
  prerequisites: readonly string[];
  tierOrder: Readonly<Record<CandidatePriorityTier, readonly ScientificCandidateId[]>>;
}

export interface ScientificCandidateRecommendation {
  question: string;
  decision: string;
  rationale: readonly string[];
  affectedCandidateIds: readonly ScientificCandidateId[];
}
