export type ScientificModelId =
  | 'clinical_phenoage'
  | 'kdm_biological_age'
  | 'levine_2013_kdm'
  | 'dnam_phenoage'
  | 'dunedinpace'
  | 'grim_age'
  | 'frailty_index'
  | 'vo2max_normative_ageing'
  | 'hrv_derived_age'
  | 'resting_heart_rate_literature'
  | 'sleep_duration_literature'
  | 'sleep_consistency_literature'
  | 'cardiorespiratory_fitness_literature'
  | 'nutrition_longevity_literature'
  | 'inflammation_literature'
  | 'cardiometabolic_risk_literature'
  | 'cardiometage';

export type ScientificModelClassification =
  | 'core_biological_age_model'
  | 'candidate_modifier'
  | 'context_only'
  | 'research_only'
  | 'rejected'
  | 'placeholder';

export type ScientificUseDecision =
  | 'accepted_candidate'
  | 'deferred'
  | 'reference_only'
  | 'excluded';

export type ScientificCategory =
  | 'clinical_biomarker_composite'
  | 'epigenetic'
  | 'frailty'
  | 'cardiorespiratory_fitness'
  | 'autonomic'
  | 'sleep'
  | 'nutrition'
  | 'inflammation'
  | 'cardiometabolic';

export type ScientificOutputType =
  | 'biological_age_years'
  | 'pace_of_aging'
  | 'mortality_risk_surrogate_age'
  | 'frailty_proportion'
  | 'normative_fitness_context'
  | 'physiologic_association'
  | 'exposure_outcome_association';

export type ValidationStatus =
  | 'externally_validated'
  | 'replicated_associations'
  | 'derivation_and_internal_validation'
  | 'not_validated_as_age_model'
  | 'not_applicable';

export type ClinicalAdoption =
  | 'none'
  | 'research_only'
  | 'limited_specialty'
  | 'established_context_measure';

export type EvidenceLevel =
  | 'insufficient'
  | 'limited'
  | 'moderate'
  | 'strong'
  | 'conflicting';

export type PeerReviewStatus =
  | 'peer_reviewed_primary_model'
  | 'peer_reviewed_body_of_evidence'
  | 'peer_reviewed_association_only';

export type EvidenceReferenceId =
  | 'klemera_doubal_2006'
  | 'levine_kdm_2013'
  | 'levine_phenoage_2018'
  | 'liu_phenoage_validation_2018'
  | 'lu_grimage_2019'
  | 'belsky_dunedinpace_2022'
  | 'searle_frailty_2008'
  | 'kaminsky_friend_2015'
  | 'mandsager_crf_2018'
  | 'nunan_hrv_2010'
  | 'garavaglia_hrv_2021'
  | 'zhang_resting_hr_2016'
  | 'cappuccio_sleep_2010'
  | 'windred_sleep_regularity_2024'
  | 'english_nutrition_2021'
  | 'varadhan_inflammation_2014'
  | 'li_cardiometage_2026';

export type PublicationType =
  | 'model_development'
  | 'external_validation'
  | 'prospective_cohort'
  | 'systematic_review_meta_analysis'
  | 'methods_standard';

export interface EvidenceReference {
  id: EvidenceReferenceId;
  title: string;
  authors: string;
  journal: string;
  year: number;
  publicationType: PublicationType;
  peerReviewed: true;
  doi: string;
  pmid: string;
  pmcid?: string;
  url: string;
}

export type ScientificInputPolicyId =
  | 'clinical_phenoage_complete_visit'
  | 'validated_kdm_calibration'
  | 'quality_controlled_vo2max';

export type ScientificInputSource =
  | 'chronological_record'
  | 'laboratory'
  | 'clinical_measurement'
  | 'cardiopulmonary_exercise_test'
  | 'validated_reference_dataset';

export interface ScientificInputRequirement {
  id: string;
  label: string;
  acceptedSources: readonly ScientificInputSource[];
  unitRequired: boolean;
  acceptedUnits: readonly string[] | null;
}

export type MinimumHistory =
  | 'single_complete_timepoint'
  | 'single_quality_controlled_assessment'
  | 'calibration_defined';

export type ScientificInputConfidence = 'high' | 'very_high';

export type ScientificFailureCondition =
  | 'missing_required_input'
  | 'missing_reference_calibration'
  | 'incompatible_unit'
  | 'invalid_or_non_finite_value'
  | 'invalid_timestamp'
  | 'stale_evidence'
  | 'mixed_collection_window'
  | 'unsupported_population'
  | 'unverified_assay_or_protocol'
  | 'failed_quality_control';

export type ScientificFallbackBehavior =
  | 'exclude_model'
  | 'defer_until_complete'
  | 'retain_as_context_only';

export interface ScientificInputPolicy {
  id: ScientificInputPolicyId;
  requiredInputs: readonly ScientificInputRequirement[];
  optionalInputs: readonly ScientificInputRequirement[];
  minimumEvidence: string;
  minimumHistory: MinimumHistory;
  confidenceRequirement: ScientificInputConfidence;
  failureConditions: readonly ScientificFailureCondition[];
  fallbackBehavior: ScientificFallbackBehavior;
  missingValuePolicy: 'never_impute';
  notes: readonly string[];
}

export interface ScientificModelRecord {
  id: ScientificModelId;
  modelName: string;
  category: ScientificCategory;
  classification: ScientificModelClassification;
  useDecision: ScientificUseDecision;
  purpose: string;
  primaryInputs: readonly string[];
  outputType: ScientificOutputType;
  validationStatus: ValidationStatus;
  population: readonly string[];
  clinicalAdoption: ClinicalAdoption;
  strengths: readonly string[];
  knownLimitations: readonly string[];
  evidenceLevel: EvidenceLevel;
  peerReviewStatus: PeerReviewStatus;
  externalDependencies: readonly string[];
  evidenceReferenceIds: readonly EvidenceReferenceId[];
  inputPolicyId: ScientificInputPolicyId | null;
  relatedModelIds: readonly ScientificModelId[];
  notes: readonly string[];
}

export interface ScientificModelAlias {
  alias: string;
  canonicalModelId: ScientificModelId;
  clarification: string;
}
