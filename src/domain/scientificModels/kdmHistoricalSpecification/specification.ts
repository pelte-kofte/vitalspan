import type {
  HistoricalPipelineStage,
  KdmFutureImplementationContract,
  KdmHistoricalContextSpecification,
  KdmHistoricalReconstructionDecision,
  KdmNhanesReproductionSpecification,
  KdmSexStratificationSpecification,
  PreprocessingSpecification,
} from './contracts';

export const KDM_HISTORICAL_PIPELINE = [
  {
    id: 'source_population', order: 1, resolution: 'resolved', confidence: 'high',
    description: 'Use NHANES III, a cross-sectional US civilian noninstitutionalized population survey conducted from 1988 through 1994.',
    evidenceIds: ['levine_2013_primary', 'nhanes_iii_data_files'], unknowns: ['The paper does not identify the exact release snapshots used.'],
  },
  {
    id: 'age_restriction', order: 2, resolution: 'resolved', confidence: 'very_high',
    description: 'Restrict the development population to adults ages 30 through 75 inclusive.',
    evidenceIds: ['levine_2013_primary'], unknowns: ['The paper does not name the age variable or specify interview-age versus examination-age treatment.'],
  },
  {
    id: 'measurement_collection', order: 3, resolution: 'partially_resolved', confidence: 'moderate',
    description: 'Join demographic, laboratory, physical examination, spirometry, blood-pressure, and CMV evidence at participant level.',
    evidenceIds: ['levine_2013_primary', 'nhanes_iii_laboratory_codebook', 'nhanes_iii_examination_codebook', 'nhanes_iii_cmv_status', 'nhanes_iii_cmv_optical_density'],
    unknowns: ['The exact join script and release lineage are unavailable.', 'The public continuous CMV file cannot yield the reported mixed-sex cohort.'],
  },
  {
    id: 'biomarker_selection', order: 4, resolution: 'resolved', confidence: 'very_high',
    description: 'From 21 candidate biomarkers, retain the ten whose reported correlation with chronological age exceeded the stated threshold.',
    evidenceIds: ['levine_2013_primary'], unknowns: ['No multiplicity policy or weighted-correlation treatment is documented.'],
  },
  {
    id: 'complete_case_selection', order: 5, resolution: 'resolved', confidence: 'very_high',
    description: 'Exclude participants missing one or more of the ten biomarker measures; no imputation is reported. The published flow is 12,517 age-eligible participants to 9,389 complete cases.',
    evidenceIds: ['levine_2013_primary'], unknowns: ['Variable-specific reasons for missingness and quality-flag exclusions are not reported.'],
  },
  {
    id: 'sex_stratification', order: 6, resolution: 'partially_resolved', confidence: 'high',
    description: 'Fit separate male and female KDM1 parameterizations using the same ten-marker panel.',
    evidenceIds: ['levine_2013_primary'], unknowns: ['Exact sex-specific parameter artifacts are unavailable.', 'No scientifically supported branch exists outside the two recorded NHANES categories.'],
  },
  {
    id: 'parameter_estimation', order: 7, resolution: 'partially_resolved', confidence: 'moderate',
    description: 'Estimate marker-to-age relationships and residual variation using the KDM procedure described by the primary and original method publications.',
    evidenceIds: ['levine_2013_primary', 'klemera_doubal_2006_primary'], unknowns: ['The complete sex-specific artifact, software, numerical settings, and exact input preprocessing are not published.'],
  },
  {
    id: 'kdm_variance_handling', order: 8, resolution: 'partially_resolved', confidence: 'moderate',
    description: 'The paper reports an age-dependent transformation of a KDM variance component while preserving its mean; this is a model stage, not a biomarker preprocessing instruction.',
    evidenceIds: ['levine_2013_primary'], unknowns: ['The executable artifact and boundary behaviour are unavailable.', 'No undocumented reconstruction is permitted.'],
  },
  {
    id: 'mortality_validation', order: 9, resolution: 'resolved', confidence: 'high',
    description: 'Validate against NHANES III mortality linkage through 2006, censoring deaths attributed to HIV, violence, or accidents; follow-up varies from 12 to 18 years.',
    evidenceIds: ['levine_2013_primary'], unknowns: ['The exact linkage release and analytic program are not archived with the paper.', 'The paper does not document complex-survey handling.'],
  },
] as const satisfies readonly HistoricalPipelineStage[];

export const KDM_NHANES_REPRODUCTION_SPECIFICATION = {
  cycle: { resolution: 'resolved', confidence: 'very_high', value: 'NHANES III, 1988–1994', evidenceIds: ['levine_2013_primary', 'nhanes_iii_data_files'], rationale: 'Named directly by the primary publication.' },
  publicFiles: ['NHANES III Laboratory 1A', 'NHANES III Examination 1A', 'NHANES III CMV 19A', 'NHANES III SPSCMVOD 21A', 'NHANES III mortality linkage through 2006'],
  participantLinkage: { resolution: 'partially_resolved', confidence: 'high', value: 'Participant-level sequence identifier across public files.', evidenceIds: ['nhanes_iii_data_files', 'nhanes_iii_cmv_status', 'nhanes_iii_cmv_optical_density'], rationale: 'Official files expose a participant sequence identifier; the original merge program is unavailable.' },
  ageVariable: { resolution: 'unknown', confidence: 'limited', value: null, evidenceIds: ['levine_2013_primary', 'nhanes_iii_examination_codebook'], rationale: 'HSAGEIR is the official general-analysis recommendation, but the paper does not name it.' },
  sexVariable: { resolution: 'partially_resolved', confidence: 'high', value: 'HSSEX (1 male, 2 female) is the public candidate.', evidenceIds: ['levine_2013_primary', 'nhanes_iii_examination_codebook'], rationale: 'The paper reports male/female stratification but not the source variable.' },
  biomarkerVariables: { resolution: 'conflicted', confidence: 'moderate', value: ['CRP', 'CEP', 'GHP', 'PEPMNK1R', 'AMP', 'TCP or CHP', 'unresolved CMV continuous variable', 'APPSI', 'SPPFEV1', 'BUP'], evidenceIds: ['levine_2013_primary', 'nhanes_iii_laboratory_codebook', 'nhanes_iii_examination_codebook', 'nhanes_iii_cmv_status', 'nhanes_iii_cmv_optical_density'], rationale: 'Most mappings are strong candidates, but cholesterol and blood pressure are not named and continuous CMV is incompatible with the public cohort.' },
  derivedVariables: { resolution: 'partially_resolved', confidence: 'moderate', value: ['Candidate PEPMNK1R is a derived average of up to six systolic readings.', 'SPPFEV1 is the largest acceptable FEV1.', 'KDM sex-specific calibration artifacts are derived but unavailable.'], evidenceIds: ['nhanes_iii_examination_codebook', 'levine_2013_primary'], rationale: 'Official derivations are known for candidate variables, not confirmed as the study choices.' },
  exclusions: { resolution: 'partially_resolved', confidence: 'high', value: ['Age outside 30–75.', 'Missing one or more biomarker measurements.'], evidenceIds: ['levine_2013_primary'], rationale: 'These are the only study-level exclusions explicitly reported. Pregnancy, illness, spirometry quality, and assay flags are not stated as exclusions.' },
  missingDataPolicy: { resolution: 'resolved', confidence: 'very_high', value: 'Complete-case exclusion; no imputation reported.', evidenceIds: ['levine_2013_primary'], rationale: 'Explicit in the primary publication.' },
  populationWeights: { resolution: 'unknown', confidence: 'insufficient', value: null, evidenceIds: ['levine_2013_primary', 'nhanes_iii_examination_codebook'], rationale: 'NHANES provides weights, but the primary analysis does not say whether or how they were used for calibration.' },
  samplingTreatment: { resolution: 'unknown', confidence: 'insufficient', value: null, evidenceIds: ['levine_2013_primary', 'nhanes_iii_examination_codebook'], rationale: 'Strata, clusters, subsample weights, and design-based variance treatment are not reported.' },
  restrictedDataRequired: { resolution: 'conflicted', confidence: 'limited', value: null, evidenceIds: ['nhanes_iii_data_files', 'nhanes_iii_cmv_status', 'nhanes_iii_cmv_optical_density'], rationale: 'Named files are public, but the reported continuous CMV cohort cannot be reconstructed from the public continuous file. A non-public or author-held artifact may be necessary.' },
  trainingPopulation: { resolution: 'resolved', confidence: 'very_high', value: '9,389 complete-case NHANES III participants ages 30–75, calibrated separately by male/female group.', evidenceIds: ['levine_2013_primary'], rationale: 'Explicit primary-publication sample.' },
  validationPopulation: { resolution: 'resolved', confidence: 'high', value: 'The same NHANES III analytic cohort linked to mortality through 2006; no independent external validation cohort was used in the 2013 paper.', evidenceIds: ['levine_2013_primary'], rationale: 'The study validates prediction internally against later mortality outcomes.' },
} as const satisfies KdmNhanesReproductionSpecification;

export const KDM_HISTORICAL_CONTEXT_SPECIFICATION = {
  referenceCohort: {
    resolution: 'resolved', confidence: 'high',
    value: 'The 9,389-person complete-case NHANES III development cohort, partitioned into male and female calibration groups.',
    evidenceIds: ['levine_2013_primary'],
    rationale: 'The cohort and separate calibration are explicit; exact branch counts are not printed.',
  },
  measurementTiming: {
    resolution: 'partially_resolved', confidence: 'limited',
    value: 'Cross-sectional NHANES III baseline measurements; stored serum CMV testing occurred later than collection.',
    evidenceIds: ['levine_2013_primary', 'nhanes_iii_laboratory_codebook', 'nhanes_iii_examination_codebook', 'nhanes_iii_cmv_status'],
    rationale: 'The paper does not define a maximum interval among interview, examination, laboratory, blood-pressure, and spirometry inputs, nor a fasting/session requirement.',
  },
  laboratoryRequirements: {
    resolution: 'partially_resolved', confidence: 'moderate',
    value: [
      'Use the documented historical specimen type and measurement definition for every laboratory marker.',
      'Preserve HbA1c method-branch provenance.',
      'Resolve archived versus standardized creatinine before use.',
      'Resolve TCP versus CHP before use.',
      'Authenticate the continuous CMV assay, scale, and coverage before use.',
    ],
    evidenceIds: ['nhanes_iii_laboratory_codebook', 'nhanes_iii_laboratory_manual', 'nhanes_iii_cmv_optical_density'],
    rationale: 'Historical requirements are documentable, but a modern compatibility contract is not yet established.',
  },
  statisticalAssumptions: [
    {
      resolution: 'resolved', confidence: 'high',
      value: 'KDM treats the biomarkers as distinct age-related dimensions described by marker-to-age relationships and residual variation.',
      evidenceIds: ['klemera_doubal_2006_primary', 'levine_2013_primary'],
      rationale: 'This is the conceptual method basis, not an executable formula.',
    },
    {
      resolution: 'partially_resolved', confidence: 'moderate',
      value: 'The primary paper reports low pairwise marker correlations, while also noting the KDM preference for functionally uncorrelated inputs; KDM1 nevertheless retains all ten markers.',
      evidenceIds: ['levine_2013_primary', 'klemera_doubal_2006_primary'],
      rationale: 'The publication does not establish full functional independence.',
    },
    {
      resolution: 'partially_resolved', confidence: 'moderate',
      value: 'Cross-sectional age differences are used to parameterize a construct intended to represent biological ageing.',
      evidenceIds: ['levine_2013_primary'],
      rationale: 'The paper identifies cross-sectional design and mortality selection as limitations.',
    },
    {
      resolution: 'unknown', confidence: 'insufficient', value: null,
      evidenceIds: ['levine_2013_primary'],
      rationale: 'Residual distribution diagnostics, heteroscedasticity treatment, survey-design estimation, and numerical boundary rules are not documented.',
    },
  ],
  qualityControlPolicy: {
    resolution: 'unknown', confidence: 'insufficient', value: null,
    evidenceIds: ['levine_2013_primary', 'nhanes_iii_laboratory_codebook', 'nhanes_iii_examination_codebook'],
    rationale: 'NHANES quality metadata exist, but the study does not publish the quality-flag inclusion policy.',
  },
  unknownBehaviour: 'Return scientifically unavailable. Unknown must never be converted into an assumed value, normal result, compatible assay, stable model branch, or executable state.',
} as const satisfies KdmHistoricalContextSpecification;

export const KDM_SEX_STRATIFICATION_SPECIFICATION = {
  modelStructure: { resolution: 'resolved', confidence: 'high', value: 'Separate male and female KDM1 calibrations.', evidenceIds: ['levine_2013_primary'], rationale: 'The paper states biological-age estimates were calculated separately for men and women.' },
  biomarkerPanel: { resolution: 'resolved', confidence: 'very_high', value: 'The same ten biomarkers are used in both KDM1 branches.', evidenceIds: ['levine_2013_primary'], rationale: 'KDM1 is the all-ten-marker variant; unlike KDM2, it does not use different sex-specific panels.' },
  parameters: { resolution: 'partially_resolved', confidence: 'high', value: 'Sex-specific parameter values differ, but the complete parameter artifacts are not available.', evidenceIds: ['levine_2013_primary'], rationale: 'Separate estimation implies separate parameters; only limited summary values are printed.' },
  preprocessing: { resolution: 'unknown', confidence: 'insufficient', value: null, evidenceIds: ['levine_2013_primary'], rationale: 'The paper does not state whether preprocessing differed by sex.' },
  eligibility: { resolution: 'partially_resolved', confidence: 'moderate', value: 'Historical eligibility used the recorded male/female grouping; no other branch is described.', evidenceIds: ['levine_2013_primary', 'nhanes_iii_examination_codebook'], rationale: 'This describes the historical dataset and does not justify inferring a branch for a future user.' },
  validation: { resolution: 'partially_resolved', confidence: 'moderate', value: 'Calibration was sex-specific, while reported mortality comparisons controlled for sex; separate full validation performance by branch is not established.', evidenceIds: ['levine_2013_primary'], rationale: 'The published validation presentation is not a complete sex-specific external validation.' },
  unsupportedSexContextRule: 'Return unavailable. Never infer, guess, or let a user manually select a historical sex branch.',
} as const satisfies KdmSexStratificationSpecification;

export const KDM_PREPROCESSING_SPECIFICATION = [
  { operation: 'log_transformation', resolution: 'unknown', historicalBehaviour: 'No biomarker log transformation is documented in the primary publication.', productionRule: 'blocked_until_resolved', evidenceIds: ['levine_2013_primary', 'kwon_belsky_bioage_2021'] },
  { operation: 'scaling', resolution: 'unknown', historicalBehaviour: 'No input scaling policy is documented. KDM parameter estimation must not be mistaken for input scaling.', productionRule: 'blocked_until_resolved', evidenceIds: ['levine_2013_primary'] },
  { operation: 'winsorization', resolution: 'unknown', historicalBehaviour: 'No winsorization is documented.', productionRule: 'blocked_until_resolved', evidenceIds: ['levine_2013_primary'] },
  { operation: 'normalization', resolution: 'unknown', historicalBehaviour: 'No biomarker normalization pipeline is documented.', productionRule: 'blocked_until_resolved', evidenceIds: ['levine_2013_primary'] },
  { operation: 'centering', resolution: 'unknown', historicalBehaviour: 'No input-centering policy is documented.', productionRule: 'blocked_until_resolved', evidenceIds: ['levine_2013_primary'] },
  { operation: 'outlier_removal', resolution: 'unknown', historicalBehaviour: 'No outlier exclusion threshold is documented. Later BioAge workflows cannot be retroactively attributed to the 2013 calibration.', productionRule: 'blocked_until_resolved', evidenceIds: ['levine_2013_primary', 'kwon_belsky_bioage_2021'] },
  { operation: 'below_detection_handling', resolution: 'unknown', historicalBehaviour: 'The archive encodes below-detection CRP, but the paper does not state how that encoding entered calibration.', productionRule: 'blocked_until_resolved', evidenceIds: ['levine_2013_primary', 'nhanes_iii_laboratory_codebook'] },
  { operation: 'unit_conversion', resolution: 'partially_resolved', historicalBehaviour: 'Published marker units are known, but no conversion pipeline is documented.', productionRule: 'blocked_until_resolved', evidenceIds: ['levine_2013_primary', 'nhanes_iii_laboratory_codebook', 'nhanes_iii_examination_codebook'] },
  { operation: 'assay_harmonization', resolution: 'conflicted', historicalBehaviour: 'HbA1c has method branches, creatinine has a later CDC correction, cholesterol has two candidate variables, and CMV assay identity is unresolved.', productionRule: 'blocked_until_resolved', evidenceIds: ['nhanes_iii_laboratory_codebook', 'nhanes_iii_cmv_optical_density'] },
  { operation: 'missing_data_handling', resolution: 'resolved', historicalBehaviour: 'Exclude any participant missing one or more biomarker measurements; no imputation is reported.', productionRule: 'complete_case_only', evidenceIds: ['levine_2013_primary'] },
] as const satisfies readonly PreprocessingSpecification[];

export const KDM_FUTURE_IMPLEMENTATION_CONTRACT = {
  calibrationIdentity: 'KDM-Levine-NHANES-III-KDM1 v1.0.0', documentStatus: 'historical_reconstruction', implementationAuthorized: false, executionAllowed: false, readiness: 'not_yet',
  requiredInputs: ['Chronological age', 'Historical sex branch provenance', 'Serum C-reactive protein', 'Serum creatinine', 'HbA1c', 'Systolic blood pressure', 'Serum albumin', 'Serum total cholesterol', 'CMV IgG optical density', 'Serum alkaline phosphatase', 'FEV1', 'Serum blood urea nitrogen'],
  exactUnitsRequired: true, noImplicitConversion: true, noImputation: true, noAssaySubstitution: true, noSexBranchInference: true,
  blockingConditions: ['Any missing required input.', 'Unknown or incompatible unit.', 'Unknown specimen or method provenance.', 'Unresolved CMV optical-density assay and scale.', 'Unresolved creatinine representation.', 'Unresolved cholesterol variable lineage.', 'Unresolved systolic blood-pressure definition.', 'Unresolved preprocessing operation.', 'Missing authenticated sex-specific parameter artifact.', 'Unsupported sex context.', 'Any model identity other than the immutable named version.'],
  unavailableStates: ['insufficient_scientific_specification', 'missing_required_input', 'unsupported_measurement_context', 'unsupported_assay', 'unsupported_sex_context', 'parameter_artifact_unavailable', 'version_mismatch'],
  requiredProvenance: ['Source laboratory or device', 'Specimen type', 'Collection timestamp and context', 'Unit as received', 'Assay method and calibration traceability', 'Quality flags', 'Transformation history', 'Model version and sex branch'],
  versionDependencies: ['Authenticated original sex-specific parameter artifacts', 'Immutable preprocessing specification', 'Immutable assay-compatibility matrix', 'Independent reference fixtures', 'Scientific governance approval'],
  scientificWarnings: ['Archive observed ranges are not clinical or production eligibility ranges.', 'Later BioAge preprocessing is not evidence of the original 2013 pipeline.', 'Modern assay equivalence requires bridging evidence.', 'Results from different calibration or preprocessing versions must never share a longitudinal lineage.'],
  documentationRequiredBeforeAuthorization: ['Resolved variable map with author or archived-code provenance', 'Resolved CMV source artifact', 'Resolved preprocessing and weighting protocol', 'Assay bridging report', 'Independent statistical reconstruction', 'External validation plan', 'Immutable scientific version record'],
} as const satisfies KdmFutureImplementationContract;

export const KDM_HISTORICAL_RECONSTRUCTION_DECISION = {
  calibrationIdentity: 'KDM-Levine-NHANES-III-KDM1 v1.0.0', goNoGo: 'not_yet', scientificConfidence: 'limited', faithfulImplementationPossibleNow: false,
  resolvedFindings: ['NHANES III cycle and broad development cohort.', 'Age eligibility and complete-case sample counts.', 'The ten-marker KDM1 panel and published units.', 'Same panel with separate male/female calibration.', 'Historical methods and public archive definitions for most marker candidates.', 'Mortality linkage period and stated censoring policy.'],
  blockingUnknowns: ['Continuous CMV artifact compatible with both sexes through age 75.', 'Complete sex-specific parameter artifacts.', 'Exact variable map for age, systolic pressure, and cholesterol.', 'Corrected versus archived creatinine representation.', 'Every biomarker preprocessing operation.', 'Survey weighting and sampling treatment.', 'Original software and numerical execution settings.'],
  rationale: ['A named panel is not an executable calibration.', 'Substituting categorical CMV or a modern assay would create a different calibration.', 'Reconstructing undisclosed preprocessing or parameters would violate the no-guessing rule.', 'The safest scientifically valid output is unavailable until the blocking artifacts are authenticated.'],
} as const satisfies KdmHistoricalReconstructionDecision;
