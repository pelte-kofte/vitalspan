import type {
  EvidenceReferenceId,
  ScientificModelId,
} from '../models';
import type {
  ScientificEligibilityConfidence,
  ScientificEligibilityStatus,
} from '../eligibilityModels';
import type { ScientificRubricCriterionId } from '../rubric';

export type ScientificComponentRole =
  | 'primary_age_estimate'
  | 'independent_age_estimate'
  | 'pace_of_aging_measure'
  | 'validated_risk_modifier'
  | 'normative_context'
  | 'interpretive_context'
  | 'monitoring_signal'
  | 'research_only'
  | 'rejected';

export type ScientificOutputConstruct =
  | 'age_in_years'
  | 'pace_per_biological_year'
  | 'percentile'
  | 'risk_estimate'
  | 'normative_deviation'
  | 'proportion'
  | 'context_only';

export type ScientificOutputUnit =
  | 'years'
  | 'pace_per_biological_year'
  | 'percentile'
  | 'probability'
  | 'standard_deviation'
  | 'proportion'
  | 'source_unit'
  | 'none';

export interface ScientificOutputDescriptor {
  construct: ScientificOutputConstruct;
  unit: ScientificOutputUnit;
  description: string;
  numericOutputPermitted: boolean;
  mayAlterAgeInYears: false;
}

export type CorrelationGroup =
  | 'inflammation'
  | 'metabolic'
  | 'hematologic'
  | 'renal'
  | 'cardiorespiratory'
  | 'lifestyle'
  | 'wearable_recovery'
  | 'epigenetic'
  | 'frailty'
  | 'unresolved';

export interface ComponentOverlapMetadata {
  inputIds: readonly string[];
  correlationGroups: readonly CorrelationGroup[];
  trainingPopulationIds: readonly string[];
  outcomeConstructIds: readonly string[];
  completeness: 'complete' | 'incomplete' | 'unknown';
  notes: readonly string[];
}

export type ComponentUncertaintyCategory =
  | 'model_uncertainty'
  | 'measurement_uncertainty'
  | 'population_uncertainty'
  | 'temporal_uncertainty'
  | 'device_or_assay_uncertainty'
  | 'combination_uncertainty'
  | 'missing_evidence'
  | 'conflicting_evidence';

export interface ComponentUncertaintyRecord {
  category: ComponentUncertaintyCategory;
  status: 'not_detected' | 'present' | 'unknown' | 'not_assessed';
  explanation: string;
  provenance: readonly string[];
}

export interface ComponentPopulationApplicability {
  status: 'supported' | 'unsupported' | 'unknown';
  populationKey: string | null;
  description: string;
  evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export type ComponentMeasurementWindowKind =
  | 'single_collection'
  | 'point_assessment'
  | 'rolling_observation_window'
  | 'current_behavior_questionnaire'
  | 'longitudinal_series'
  | 'unknown';

export interface ComponentMeasurementWindow {
  kind: ComponentMeasurementWindowKind;
  start: string | null;
  end: string | null;
  freshness: 'current' | 'stale' | 'unknown';
  policyId: string | null;
  supportedIntervals: readonly string[];
  missingPeriods: readonly string[];
  longitudinalRequirement: 'none' | 'model_specific' | 'required' | 'unknown';
  repeatMeasurementPolicy: 'not_required' | 'model_specific' | 'required' | 'unknown';
  provenance: readonly string[];
}

export interface ComponentDependency {
  id: string;
  version: string | null;
  status: 'available' | 'unavailable' | 'unknown';
  provenance: string;
}

export type ComponentCombinationStatus =
  | 'eligible_for_review'
  | 'requires_explicit_review'
  | 'ineligible'
  | 'research_only'
  | 'unknown';

export type CombinationExclusionReason =
  | 'role_prohibited'
  | 'construct_incompatible'
  | 'unit_incompatible'
  | 'missing_model_version'
  | 'execution_not_authorized'
  | 'research_only_component'
  | 'rejected_component'
  | 'eligibility_not_satisfied'
  | 'overlap_review_required'
  | 'shared_biomarkers_unresolved'
  | 'shared_training_population_unresolved'
  | 'outcome_overlap_unresolved'
  | 'double_counting_risk_unresolved'
  | 'correlation_risk_unresolved'
  | 'measurement_window_unknown'
  | 'measurement_window_misaligned'
  | 'stale_component'
  | 'population_mismatch'
  | 'population_unknown'
  | 'version_incompatible'
  | 'independent_validation_missing'
  | 'calibration_unavailable'
  | 'missing_data_policy_unsupported'
  | 'scientific_review_incomplete'
  | 'combination_not_authorized'
  | 'unknown_evidence';

export interface ComponentCombinationEligibility {
  status: ComponentCombinationStatus;
  exclusionReasons: readonly CombinationExclusionReason[];
  scientificReviewReference: string | null;
  reviewedComponentVersions: readonly string[];
}

export type ComponentGovernanceStage =
  | 'registry_entry'
  | 'evidence_audit'
  | 'internal_rubric_review'
  | 'versioned_input_policy'
  | 'eligibility_implementation'
  | 'calculation_implementation'
  | 'independent_verification'
  | 'compatibility_review'
  | 'combination_authorization'
  | 'production_approval';

export type ComponentLifecycleStatus =
  | 'proposed'
  | 'under_review'
  | 'independently_verified'
  | 'production_approved'
  | 'retired'
  | 'superseded'
  | 'rejected';

export type MultimodalRubricCriterionId = ScientificRubricCriterionId
  | 'construct_compatibility'
  | 'overlap_risk'
  | 'independent_replication';

export interface ComponentRubricReview {
  rubricVersion: string;
  evidenceByCriterion: Readonly<Partial<Record<MultimodalRubricCriterionId, readonly EvidenceReferenceId[]>>>;
  completeness: 'not_started' | 'incomplete' | 'complete';
  reviewerReferences: readonly string[];
  decision: 'pending' | 'approved' | 'rejected';
  rationale: readonly string[];
}

export interface ComponentGovernanceRecord {
  lifecycleStatus: ComponentLifecycleStatus;
  completedStages: readonly ComponentGovernanceStage[];
  currentStage: ComponentGovernanceStage | null;
  rubricReview: ComponentRubricReview;
  retirementReason: string | null;
  supersededByComponentId: string | null;
}

export interface ComponentProvenanceSnapshot {
  capturedAt: string;
  registryModelId: ScientificModelId;
  registryModelVersion: string | null;
  evidenceReferenceIds: readonly EvidenceReferenceId[];
  measurementIds: readonly string[];
  sourceDescriptions: readonly string[];
  authorizationReference: string | null;
}

/**
 * Scientific metadata for one independently governed component. It contains no
 * output value, formula, coefficient, weight, or composite contribution.
 */
export interface MultimodalScientificComponent {
  componentId: string;
  scientificModelId: ScientificModelId;
  scientificModelVersion: string | null;
  role: ScientificComponentRole;
  output: ScientificOutputDescriptor;
  eligibilityStatus: ScientificEligibilityStatus;
  executionAuthorizationReference: string | null;
  evidenceReferenceIds: readonly EvidenceReferenceId[];
  populationApplicability: ComponentPopulationApplicability;
  measurementWindow: ComponentMeasurementWindow;
  confidence: {
    level: ScientificEligibilityConfidence;
    basis: string;
  };
  uncertainty: readonly ComponentUncertaintyRecord[];
  limitations: readonly string[];
  dependencySet: readonly ComponentDependency[];
  overlap: ComponentOverlapMetadata;
  combinationEligibility: ComponentCombinationEligibility;
  provenanceSnapshot: ComponentProvenanceSnapshot;
  governance: ComponentGovernanceRecord;
}

export type MultimodalAvailabilityState =
  | 'single_validated_model_available'
  | 'multiple_compatible_models_available'
  | 'multiple_incompatible_models_available'
  | 'context_available_without_additional_model'
  | 'insufficient_scientific_evidence'
  | 'research_preview_only';

export interface MultimodalAvailabilityAssessment {
  state: MultimodalAvailabilityState;
  validatedAgeComponentIds: readonly string[];
  contextComponentIds: readonly string[];
  researchComponentIds: readonly string[];
  multimodalAgeAvailable: boolean;
  explanation: string;
  blockingReasons: readonly CombinationExclusionReason[];
}

export type CombinationReviewDecision = 'approved' | 'rejected' | 'unknown' | 'not_reviewed';

export interface ScientificCombinationReviewPolicy {
  policyId: string;
  componentIds: readonly [string, string];
  componentVersions: readonly [string, string];
  constructCompatibility: CombinationReviewDecision;
  unitCompatibilityReview: CombinationReviewDecision;
  sharedBiomarkerReview: CombinationReviewDecision;
  sharedTrainingPopulationReview: CombinationReviewDecision;
  outcomeOverlapReview: CombinationReviewDecision;
  doubleCountingReview: CombinationReviewDecision;
  correlationReview: CombinationReviewDecision;
  populationCompatibilityReview: CombinationReviewDecision;
  versionCompatibilityReview: CombinationReviewDecision;
  independentValidationReview: CombinationReviewDecision;
  calibrationAvailability: 'available' | 'unavailable' | 'unknown';
  missingDataPolicy: 'never_impute' | 'unsupported' | 'unknown';
  maximumAlignmentWindowDays: number | null;
  scientificReviewDecision: CombinationReviewDecision;
  combinationAuthorizationReference: string | null;
  evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export interface ComponentTemporalPolicyDefinition {
  policyId: string;
  measurementWindowKind: ComponentMeasurementWindowKind;
  defaultWindowDays: number | null;
  maximumAlignmentWindowDays: number | null;
  unknownTimingBehavior: 'block_combination';
  staleComponentBehavior: 'block_combination';
  longitudinalRequirement: 'none' | 'model_specific' | 'required' | 'unknown';
  repeatMeasurementPolicy: 'not_required' | 'model_specific' | 'required' | 'unknown';
  rationale: readonly string[];
}

export interface ComponentPairCompatibilityAssessment {
  componentIds: readonly [string, string];
  status: 'compatible_for_authorized_research' | 'incompatible' | 'unknown';
  blockingReasons: readonly CombinationExclusionReason[];
  sharedInputIds: readonly string[];
  sharedCorrelationGroups: readonly CorrelationGroup[];
  sharedTrainingPopulationIds: readonly string[];
  sharedOutcomeConstructIds: readonly string[];
  policyId: string | null;
  combinationAuthorizationReference: string | null;
  explanation: string;
}

export interface ScientificModelComponentMapping {
  scientificModelId: ScientificModelId;
  componentRole: ScientificComponentRole;
  outputConstruct: ScientificOutputConstruct;
  outputUnit: ScientificOutputUnit;
  currentModelVersion: string | null;
  currentAvailability: 'production' | 'future_unavailable' | 'context_only' | 'research_only' | 'rejected';
  combinationStatus: ComponentCombinationStatus;
  numericAgeInfluence: 'prohibited' | 'age_model_output_only';
  rationale: readonly string[];
}

export interface DomainContextRoleMapping {
  id: string;
  label: string;
  scientificModelId: ScientificModelId | null;
  primaryRole: Extract<ScientificComponentRole, 'interpretive_context' | 'monitoring_signal' | 'normative_context'>;
  secondaryRoles: readonly Extract<ScientificComponentRole, 'interpretive_context' | 'monitoring_signal' | 'normative_context'>[];
  numericAgeInfluence: 'prohibited';
  combinationStatus: 'ineligible';
  rationale: string;
}
