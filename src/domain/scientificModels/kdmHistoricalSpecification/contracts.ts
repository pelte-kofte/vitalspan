export type ReconstructionResolution =
  | 'resolved'
  | 'partially_resolved'
  | 'conflicted'
  | 'unknown';

export type ReconstructionConfidence =
  | 'insufficient'
  | 'limited'
  | 'moderate'
  | 'high'
  | 'very_high';

export type ReconstructionSourceAuthority =
  | 'primary_publication'
  | 'original_method_publication'
  | 'official_nhanes_documentation'
  | 'official_procedure_manual'
  | 'peer_reviewed_replication';

export interface ReconstructionEvidenceSource {
  id: string;
  title: string;
  authority: ReconstructionSourceAuthority;
  year: number;
  url: string;
  doi: string | null;
  scope: string;
}

export interface EvidenceBoundClaim<T> {
  resolution: ReconstructionResolution;
  confidence: ReconstructionConfidence;
  value: T | null;
  evidenceIds: readonly string[];
  rationale: string;
}

export type VariableMappingStatus =
  | 'verified'
  | 'strong_candidate'
  | 'ambiguous'
  | 'incompatible_public_artifact'
  | 'unknown';

export interface HistoricalRange {
  minimum: number | null;
  maximum: number | null;
  qualifier: 'observed_archive_encoding' | 'detection_limit' | 'not_established';
  note: string;
}

export interface KdmHistoricalBiomarkerSpecification {
  id: string;
  officialName: string;
  publicationLabel: string;
  nhanesVariableCandidates: readonly string[];
  mappingStatus: VariableMappingStatus;
  requiredUnit: EvidenceBoundClaim<string>;
  historicalRange: EvidenceBoundClaim<HistoricalRange>;
  productionAllowedRange: EvidenceBoundClaim<HistoricalRange>;
  specimen: EvidenceBoundClaim<string>;
  historicalMethod: EvidenceBoundClaim<string>;
  historicalInstrumentation: EvidenceBoundClaim<string>;
  modernEquivalent: EvidenceBoundClaim<string>;
  knownDrift: readonly string[];
  internationalAvailability: 'routine' | 'specialty' | 'research_only' | 'variable';
  clinicalRoutineAvailability: 'routine' | 'specialty' | 'not_routine' | 'unknown';
  transformationBeforeModel: EvidenceBoundClaim<string>;
  qualityControl: readonly string[];
  acuteIllnessSensitivity: 'low' | 'moderate' | 'high' | 'variable' | 'unknown';
  clinicalPhenoAgeOverlap: 'exact' | 'related' | 'none';
  overlapNote: string;
  controversies: readonly string[];
  evidenceIds: readonly string[];
}

export type HistoricalPipelineStageId =
  | 'source_population'
  | 'age_restriction'
  | 'measurement_collection'
  | 'biomarker_selection'
  | 'complete_case_selection'
  | 'sex_stratification'
  | 'parameter_estimation'
  | 'kdm_variance_handling'
  | 'mortality_validation';

export interface HistoricalPipelineStage {
  id: HistoricalPipelineStageId;
  order: number;
  resolution: ReconstructionResolution;
  confidence: ReconstructionConfidence;
  description: string;
  evidenceIds: readonly string[];
  unknowns: readonly string[];
}

export type PreprocessingOperation =
  | 'log_transformation'
  | 'scaling'
  | 'winsorization'
  | 'normalization'
  | 'centering'
  | 'outlier_removal'
  | 'below_detection_handling'
  | 'unit_conversion'
  | 'assay_harmonization'
  | 'missing_data_handling';

export interface PreprocessingSpecification {
  operation: PreprocessingOperation;
  resolution: ReconstructionResolution;
  historicalBehaviour: string;
  productionRule: 'blocked_until_resolved' | 'complete_case_only';
  evidenceIds: readonly string[];
}

export type OpenQuestionResolutionRoute =
  | 'can_resolve_from_literature'
  | 'requires_nhanes_investigation'
  | 'requires_statistical_reconstruction'
  | 'requires_expert_review'
  | 'cannot_currently_be_resolved';

export type ScientificBlockSeverity = 'blocking' | 'material' | 'advisory';

export interface KdmHistoricalOpenQuestion {
  id: string;
  question: string;
  route: OpenQuestionResolutionRoute;
  severity: ScientificBlockSeverity;
  currentFinding: string;
  requiredResolutionArtifact: string;
  evidenceIds: readonly string[];
}

export interface KdmSexStratificationSpecification {
  modelStructure: EvidenceBoundClaim<string>;
  biomarkerPanel: EvidenceBoundClaim<string>;
  parameters: EvidenceBoundClaim<string>;
  preprocessing: EvidenceBoundClaim<string>;
  eligibility: EvidenceBoundClaim<string>;
  validation: EvidenceBoundClaim<string>;
  unsupportedSexContextRule: string;
}

export interface KdmNhanesReproductionSpecification {
  cycle: EvidenceBoundClaim<string>;
  publicFiles: readonly string[];
  participantLinkage: EvidenceBoundClaim<string>;
  ageVariable: EvidenceBoundClaim<string>;
  sexVariable: EvidenceBoundClaim<string>;
  biomarkerVariables: EvidenceBoundClaim<readonly string[]>;
  derivedVariables: EvidenceBoundClaim<readonly string[]>;
  exclusions: EvidenceBoundClaim<readonly string[]>;
  missingDataPolicy: EvidenceBoundClaim<string>;
  populationWeights: EvidenceBoundClaim<string>;
  samplingTreatment: EvidenceBoundClaim<string>;
  restrictedDataRequired: EvidenceBoundClaim<boolean>;
  trainingPopulation: EvidenceBoundClaim<string>;
  validationPopulation: EvidenceBoundClaim<string>;
}

export interface KdmHistoricalContextSpecification {
  referenceCohort: EvidenceBoundClaim<string>;
  measurementTiming: EvidenceBoundClaim<string>;
  laboratoryRequirements: EvidenceBoundClaim<readonly string[]>;
  statisticalAssumptions: readonly EvidenceBoundClaim<string>[];
  qualityControlPolicy: EvidenceBoundClaim<string>;
  unknownBehaviour: string;
}

export interface KdmFutureImplementationContract {
  calibrationIdentity: 'KDM-Levine-NHANES-III-KDM1 v1.0.0';
  documentStatus: 'historical_reconstruction';
  implementationAuthorized: false;
  executionAllowed: false;
  readiness: 'not_yet';
  requiredInputs: readonly string[];
  exactUnitsRequired: true;
  noImplicitConversion: true;
  noImputation: true;
  noAssaySubstitution: true;
  noSexBranchInference: true;
  blockingConditions: readonly string[];
  unavailableStates: readonly string[];
  requiredProvenance: readonly string[];
  versionDependencies: readonly string[];
  scientificWarnings: readonly string[];
  documentationRequiredBeforeAuthorization: readonly string[];
}

export interface KdmHistoricalReconstructionDecision {
  calibrationIdentity: 'KDM-Levine-NHANES-III-KDM1 v1.0.0';
  goNoGo: 'not_yet';
  scientificConfidence: ReconstructionConfidence;
  faithfulImplementationPossibleNow: false;
  resolvedFindings: readonly string[];
  blockingUnknowns: readonly string[];
  rationale: readonly string[];
}
