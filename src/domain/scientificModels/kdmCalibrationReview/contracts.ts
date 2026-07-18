export type KdmCalibrationReviewId =
  | 'klemera_doubal_method_2006'
  | 'levine_nhanes_iii_kdm1_2013'
  | 'levine_nhanes_iii_kdm2_2013'
  | 'belsky_dunedin_reuse_2015'
  | 'calerie_nhanes_adaptation_2017'
  | 'bioage_v2_nhanes_iii_2021'
  | 'zhong_slas_kdm_2020'
  | 'liu_chns_kdm_2020'
  | 'chan_uk_biobank_kdm_2021'
  | 'mak_nhanes_iii_18_kdm_2023'
  | 'nhanes_iv_validation_role';

export type KdmRecordKind =
  | 'method_only'
  | 'named_calibration'
  | 'study_specific_adaptation'
  | 'external_reuse'
  | 'implementation_framework'
  | 'validation_dataset_role';

export type KdmReviewDisposition =
  | 'selected_after_prerequisites'
  | 'research_only'
  | 'not_a_distinct_calibration'
  | 'rejected_for_production';

export type ProductionRecommendation =
  | 'proceed'
  | 'proceed_after_prerequisites'
  | 'research_only'
  | 'not_recommended'
  | 'rejected';

export type QualitativeAssessment =
  | 'strong'
  | 'moderate'
  | 'limited'
  | 'insufficient'
  | 'not_applicable';

export type BiomarkerAccessibility = 'routine' | 'specialty' | 'research' | 'mixed';
export type SensitivityLevel = 'low' | 'moderate' | 'high' | 'variable' | 'unknown';

export interface KdmEvidenceReference {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  pmid: string;
  pmcid: string | null;
  url: string;
  role: 'method' | 'development' | 'validation' | 'adaptation' | 'implementation';
}

export interface KdmBiomarkerDefinition {
  id: string;
  name: string;
  units: readonly string[];
  accessibility: BiomarkerAccessibility;
  internationalAvailability: string;
  measurementVariability: SensitivityLevel;
  acuteIllnessSensitivity: SensitivityLevel;
  assayDependence: SensitivityLevel;
  standardization: QualitativeAssessment;
  costImplication: 'low' | 'moderate' | 'high' | 'variable';
  clinicalPhenoAgeOverlap: 'exact' | 'related' | 'none';
}

export interface KdmPopulationProfile {
  country: string;
  sampleSize: string;
  ageRange: string;
  sexHandling: string;
  ethnicityAndDiversity: string;
  healthSelection: string;
  referenceCohort: string;
  selectionBias: readonly string[];
  geographicBias: string;
  transportability: string;
  internationalConsumerSuitability: QualitativeAssessment;
}

export interface KdmValidationProfile {
  developmentValidation: readonly string[];
  independentReplications: readonly string[];
  externalValidations: readonly string[];
  outcomeCoverage: readonly string[];
  exactCalibrationReplicated: boolean;
  limitations: readonly string[];
}

export type KdmRubricCriterion =
  | 'evidence_quality'
  | 'replication'
  | 'clinical_adoption'
  | 'external_validation'
  | 'longevity_relevance'
  | 'construct_clarity'
  | 'interpretability'
  | 'biomarker_quality'
  | 'calibration_robustness'
  | 'population_robustness'
  | 'generalizability'
  | 'scientific_maturity'
  | 'maintenance_burden'
  | 'version_stability'
  | 'implementation_complexity'
  | 'future_proofing'
  | 'double_counting_risk'
  | 'clinical_phenoage_compatibility'
  | 'consumer_health_suitability'
  | 'scientific_platform_suitability';

export interface KdmRubricAssessment {
  criterion: KdmRubricCriterion;
  assessment: QualitativeAssessment;
  rationale: string;
}

export type KdmArchitectureArea =
  | 'scientific_registry'
  | 'eligibility'
  | 'authorization'
  | 'versioning'
  | 'validation'
  | 'scientific_governance'
  | 'rubric'
  | 'multimodal_architecture'
  | 'component_contracts'
  | 'temporal_policies'
  | 'uncertainty_architecture'
  | 'combination_safety'
  | 'future_multimodal_expansion';

export interface KdmArchitectureAssessment {
  area: KdmArchitectureArea;
  status: 'compatible' | 'compatible_after_prerequisites' | 'blocked' | 'not_applicable';
  rationale: string;
}

export interface KdmCalibrationDossier {
  id: KdmCalibrationReviewId;
  officialName: string;
  proposedVersionName: string | null;
  recordKind: KdmRecordKind;
  disposition: KdmReviewDisposition;
  primaryEvidenceId: string;
  supportingEvidenceIds: readonly string[];
  authors: string;
  publicationYear: number;
  purpose: string;
  population: KdmPopulationProfile;
  biomarkerPanel: readonly KdmBiomarkerDefinition[];
  biomarkerPanelScope: string;
  statisticalMethodology: string;
  requiredPreprocessing: readonly string[];
  calibrationStrategy: string;
  versionStability: string;
  validation: KdmValidationProfile;
  knownImplementations: readonly string[];
  currentScientificUse: string;
  knownLimitations: readonly string[];
  clinicalRelevance: string;
  longevityRelevance: string;
  interpretability: string;
  transportability: string;
  maintenanceBurden: string;
  scientificMaturity: QualitativeAssessment;
  productionReadiness: ProductionRecommendation;
  architecture: readonly KdmArchitectureAssessment[];
  rubric: readonly KdmRubricAssessment[];
  rejectionOrSelectionRationale: readonly string[];
}

export interface KdmGovernanceDecision {
  question: string;
  decision: string;
  rationale: readonly string[];
}

export interface KdmProductionDecision {
  recommendation: ProductionRecommendation;
  selectedCalibrationId: KdmCalibrationReviewId;
  recommendedVersionName: string;
  implementationAuthorized: false;
  rationale: readonly string[];
  prerequisites: readonly string[];
  openScientificQuestions: readonly string[];
}
