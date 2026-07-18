export type CardiometabolicMeasurementId =
  | 'apolipoprotein_b'
  | 'ldl_c_direct'
  | 'ldl_c_calculated'
  | 'non_hdl_c'
  | 'hdl_c'
  | 'triglycerides'
  | 'lipoprotein_a_molar'
  | 'lipoprotein_a_mass'
  | 'hba1c'
  | 'fasting_plasma_glucose'
  | 'home_cuff_blood_pressure'
  | 'office_blood_pressure'
  | 'automated_office_blood_pressure'
  | 'waist_circumference'
  | 'waist_to_height_ratio';

export type CardiometabolicFamily =
  | 'atherogenic_lipids'
  | 'glycemic_status'
  | 'blood_pressure'
  | 'central_adiposity';

export type CardiometabolicEligibilityStatus =
  | 'eligible'
  | 'conditionally_eligible'
  | 'measurement_accepted_raw_only'
  | 'measurement_accepted_no_interpretation'
  | 'measurement_accepted_context_missing'
  | 'protocol_mismatch'
  | 'assay_mismatch'
  | 'source_unsupported'
  | 'research_only'
  | 'clinical_specialty'
  | 'context_only'
  | 'unsupported'
  | 'invalid'
  | 'incomplete'
  | 'insufficient_data'
  | 'safety_review_candidate';

export type CardiometabolicConfidenceId =
  | 'CMH-CONF-R'
  | 'CMH-CONF-F'
  | 'CMH-CONF-L'
  | 'CMH-CONF-P'
  | 'CMH-CONF-Q'
  | 'CMH-CONF-X';

export type CardiometabolicVerificationStatus =
  | 'verified_original'
  | 'verified_transcription'
  | 'provisional'
  | 'quarantined'
  | 'rejected'
  | 'superseded';

export type CardiometabolicTriState = 'present' | 'absent' | 'unknown' | 'not_applicable';
export type CardiometabolicFastingStatus = 'fasting' | 'non_fasting' | 'unknown';
export type CardiometabolicReasonSeverity =
  | 'blocking_invalid'
  | 'blocking_insufficient'
  | 'blocking_source'
  | 'blocking_assay'
  | 'blocking_protocol'
  | 'blocking_interpretation'
  | 'research_restriction'
  | 'conditional'
  | 'informational';

export type CardiometabolicReasonCode =
  | 'missing_measurement_identity' | 'unknown_measurement_identity' | 'measurement_standard_mismatch'
  | 'missing_value' | 'non_finite_value' | 'non_positive_value' | 'impossible_blood_pressure_structure'
  | 'unsupported_unit' | 'unit_conversion_not_authorized' | 'lpa_unit_mismatch'
  | 'missing_timestamp' | 'invalid_timestamp' | 'missing_ingestion_timestamp' | 'invalid_ingestion_timestamp'
  | 'missing_source' | 'unknown_source' | 'source_unsupported' | 'source_research_only'
  | 'missing_ingestion_method' | 'missing_provider_identity' | 'missing_source_record_id'
  | 'missing_verification_status' | 'verification_not_accepted' | 'provenance_incomplete'
  | 'unverified_manual_entry' | 'container_origin_missing' | 'exact_duplicate_not_active'
  | 'probable_duplicate_requires_reconciliation' | 'historical_correction_retained'
  | 'missing_assay_identity' | 'unknown_assay_identity' | 'assay_measurement_mismatch'
  | 'assay_traceability_missing' | 'assay_certification_missing' | 'assay_mismatch'
  | 'missing_protocol_identity' | 'unknown_protocol_identity' | 'protocol_measurement_mismatch'
  | 'protocol_adherence_unknown' | 'protocol_mismatch'
  | 'missing_fasting_status' | 'unknown_fasting_status' | 'fasting_duration_insufficient'
  | 'missing_medication_context' | 'missing_acute_illness_context' | 'missing_pregnancy_context'
  | 'missing_clinical_history' | 'pregnancy_exclusion' | 'hba1c_confounding_context'
  | 'invalid_ldl_calculation_context' | 'ldl_source_analytes_missing' | 'derived_lineage_incomplete'
  | 'random_glucose_not_fpg' | 'glycolysis_control_missing' | 'venous_plasma_required'
  | 'bp_device_unvalidated' | 'cuffless_bp_unsupported' | 'upper_arm_cuff_required'
  | 'cuff_size_missing' | 'bp_series_incomplete' | 'bp_multi_occasion_required'
  | 'waist_lineage_incomplete' | 'waist_landmark_mismatch' | 'self_reported_height_unsupported'
  | 'height_timestamp_incompatible' | 'adult_population_required' | 'nice_population_mismatch'
  | 'interpretation_raw_only' | 'reference_not_requested' | 'no_exact_reference'
  | 'reference_exact_match' | 'repeat_confirmation_required' | 'diagnosis_blocked'
  | 'treatment_blocked' | 'safety_context_incomplete' | 'safety_candidate_boundary_met'
  | 'no_authorized_glucose_safety_boundary'
  | 'trend_same_record' | 'trend_measurement_mismatch' | 'trend_unit_mismatch'
  | 'trend_assay_mismatch' | 'trend_calculation_method_mismatch' | 'trend_fasting_mismatch'
  | 'trend_context_mismatch' | 'trend_protocol_mismatch' | 'trend_device_mismatch'
  | 'trend_series_mismatch' | 'trend_landmark_mismatch' | 'trend_lineage_mismatch'
  | 'trend_metadata_missing' | 'trend_exact_match' | 'trend_conditional_match';

export interface CardiometabolicReason {
  code: CardiometabolicReasonCode;
  severity: CardiometabolicReasonSeverity;
  explanation: string;
}

export type CardiometabolicAuthorizedOutput =
  | 'validated_raw_measurement' | 'canonical_unit' | 'method_identity' | 'provenance_summary'
  | 'confidence' | 'laboratory_reported_flag' | 'published_informational_screening_context'
  | 'published_risk_enhancing_context' | 'protocol_specific_bp_interpretation'
  | 'repeat_confirmation_requirement' | 'clinician_review_recommendation'
  | 'safety_review_candidate' | 'reference_identity_and_version' | 'limitations'
  | 'longitudinal_comparability_status';

export type CardiometabolicBlockedOutput =
  | 'cardiometabolic_health_score' | 'cross_marker_composite' | 'traffic_light_parent_status'
  | 'optimal_longevity_range' | 'biological_age_adjustment' | 'fitness_age'
  | 'individual_lifespan_prediction' | 'individual_event_risk_prediction'
  | 'ascvd_calculation' | 'score2' | 'score2_op' | 'qrisk' | 'framingham_risk'
  | 'metabolic_syndrome_diagnosis' | 'diabetes_diagnosis' | 'prediabetes_diagnosis'
  | 'hypertension_diagnosis' | 'familial_hypercholesterolemia_diagnosis'
  | 'obesity_diagnosis' | 'pancreatitis_diagnosis' | 'medication_initiation'
  | 'medication_cessation' | 'dose_recommendation' | 'individual_treatment_target'
  | 'cross_marker_ranking' | 'higher_is_always_better' | 'lower_is_always_better'
  | 'lpa_unit_conversion' | 'clinical_phenoage_modification' | 'composite_longevity_score';

export interface CardiometabolicScientificVersions {
  domainSpecification: string;
  measurementRegistry: string;
  protocolRegistry: string;
  assayRegistry: string;
  sourceRegistry: string;
  confidenceRegistry: string;
  validationPolicy: string;
  eligibilityPolicy: string;
  reasonRegistry: string;
  referenceRegistry: string;
  interpretationPolicyRegistry: string;
  populationMatchingPolicy: string;
  safetyCandidatePolicy: string;
  trendComparabilityPolicy: string;
}

export interface CardiometabolicNumericValue {
  value: number | null;
  unit: string | null;
}

export interface CardiometabolicBloodPressureReading {
  readingId: string;
  systolic: number | null;
  diastolic: number | null;
  timestamp: string | null;
  occasionId: string | null;
  sequence: number | null;
}

export interface CardiometabolicMeasurementInput {
  recordId: string;
  measurementId: string | null;
  measurementStandardId: string | null;
  numeric: CardiometabolicNumericValue | null;
  bloodPressure: {
    readings: CardiometabolicBloodPressureReading[];
    summarySystolic: number | null;
    summaryDiastolic: number | null;
    readingCount: number | null;
    occasionCount: number | null;
    seriesComplete: boolean | null;
  } | null;
  timestamps: { measuredAt: string | null; ingestedAt: string | null };
  sourceId: string | null;
  ingestionMethod: string | null;
  provider: { providerId: string | null; laboratoryId: string | null; deviceId: string | null };
  provenance: {
    sourceRecordId: string | null;
    sourceDocumentVerified: boolean | null;
    originSourceId: string | null;
    completenessDeclared: boolean | null;
  };
  verificationStatus: CardiometabolicVerificationStatus | null;
  assay: {
    methodId: string | null;
    methodVersion: string | null;
    traceabilityDocumented: boolean | null;
    ngspCertified: boolean | null;
    isoformSensitivity: 'insensitive' | 'sensitive' | 'unknown' | null;
    specimen: string | null;
    calculationValid: boolean | null;
  };
  protocol: {
    protocolId: string | null;
    protocolVersion: string | null;
    adherence: 'complete' | 'partial' | 'unknown' | null;
    validatedDevice: boolean | null;
    upperArmCuff: boolean | null;
    cuffSize: string | null;
    arm: 'left' | 'right' | 'both' | 'unknown' | null;
    bodyPosition: string | null;
    restMinutes: number | null;
    talking: CardiometabolicTriState | null;
    observerPresent: boolean | null;
    waistLandmark: string | null;
  };
  context: {
    fastingStatus: CardiometabolicFastingStatus | null;
    fastingHours: number | null;
    pregnancy: CardiometabolicTriState | null;
    acuteIllness: CardiometabolicTriState | null;
    medicationContextKnown: boolean | null;
    alcoholContextKnown: boolean | null;
    anemia: CardiometabolicTriState | null;
    hemoglobinopathy: CardiometabolicTriState | null;
    alteredRedCellTurnover: CardiometabolicTriState | null;
    recentTransfusion: CardiometabolicTriState | null;
    ckd: CardiometabolicTriState | null;
    cardiovascularDiseaseHistoryKnown: boolean | null;
    diabetesHistoryKnown: boolean | null;
    symptomsPresent: boolean | null;
    recentExerciseKnown: boolean | null;
    caffeineKnown: boolean | null;
    nicotineKnown: boolean | null;
  };
  lineage: {
    sourceAnalytes: Record<string, CardiometabolicNumericValue> | null;
    calculationMethodId: string | null;
    calculationVersion: string | null;
    measuredHeightCm: number | null;
    heightSource: 'measured' | 'self_reported' | 'unknown' | null;
    heightTimestamp: string | null;
    waistRecordId: string | null;
    lineageVerified: boolean | null;
  };
  population: {
    ageYears: number | null;
    sourceRecordedSex: 'female' | 'male' | 'intersex' | 'unknown' | null;
    countryCode: string | null;
    guidelineRegion: 'US' | 'Europe' | 'UK' | 'WHO' | null;
    adultEligible: boolean | null;
    nicePopulationEligible: boolean | null;
  };
  requestedInterpretation: {
    policyId: string | null;
    referenceId: string | null;
    referenceVersion: string | null;
  } | null;
  duplicate: {
    disposition: 'unique' | 'exact_reimport' | 'probable_duplicate' | 'correction' | 'superseded' | null;
    correctsRecordId: string | null;
  };
}

export interface CardiometabolicCanonicalMeasurement {
  value: number | null;
  systolic: number | null;
  diastolic: number | null;
  unit: string | null;
  conversionAuthorized: boolean;
}

export interface CardiometabolicReferenceDecision {
  status: 'exact_match' | 'not_requested' | 'ineligible';
  referenceId: string | null;
  referenceVersion: string | null;
  policyId: string | null;
  reasons: readonly CardiometabolicReason[];
}

export interface CardiometabolicInterpretationDecision {
  eligible: boolean;
  availability: 'authorized' | 'raw_only' | 'context_missing' | 'not_authorized';
  authority: string | null;
  policyId: string | null;
  policyVersion: string | null;
  targetPopulation: string | null;
  interpretationType: string | null;
  contextLabel: string | null;
  requiredContext: readonly string[];
  limitations: readonly string[];
  diagnosticBoundary: string;
  treatmentBoundary: string;
}

export type CardiometabolicSafetyStatus =
  | 'safety_candidate_symptom_context_required'
  | 'safety_candidate_time_sensitive_clinical_review'
  | 'clinician_review_candidate'
  | 'no_authorized_safety_candidate'
  | 'insufficient_safety_context';

export interface CardiometabolicSafetyDecision {
  status: CardiometabolicSafetyStatus;
  displayStatus: string;
  boundaryAuthority: string | null;
  boundaryVersion: string | null;
  reasons: readonly CardiometabolicReason[];
  diagnosisAuthorized: false;
  emergencyDispositionAuthorized: false;
}

export type CardiometabolicTrendStatus = 'comparable' | 'conditionally_comparable' | 'not_comparable' | 'insufficient_data';

export interface CardiometabolicTrendDecision {
  status: CardiometabolicTrendStatus;
  displayStatus: 'Comparable' | 'Conditionally Comparable' | 'Not Comparable' | 'Insufficient Data';
  reasons: readonly CardiometabolicReason[];
  calculatesChange: false;
  calculatesSlope: false;
  calculatesPercentageChange: false;
  infersImprovement: false;
  infersTreatmentResponse: false;
  infersPrognosis: false;
}

export interface CardiometabolicEligibilityResult {
  measurementIdentity: CardiometabolicMeasurementId | null;
  status: CardiometabolicEligibilityStatus;
  reasonCodes: readonly CardiometabolicReasonCode[];
  explanations: readonly string[];
  originalMeasurement: CardiometabolicMeasurementInput;
  canonicalMeasurement: CardiometabolicCanonicalMeasurement;
  sourceClassification: string | null;
  confidenceClassification: CardiometabolicConfidenceId;
  methodOrAssayIdentity: string | null;
  protocolIdentity: string | null;
  provenanceComplete: boolean;
  measurementValid: boolean;
  measurementAccepted: boolean;
  interpretation: CardiometabolicInterpretationDecision;
  referenceDecision: CardiometabolicReferenceDecision;
  authorizedOutputs: readonly CardiometabolicAuthorizedOutput[];
  blockedOutputs: readonly CardiometabolicBlockedOutput[];
  safetyCandidate: CardiometabolicSafetyDecision;
  trendComparability: CardiometabolicTrendDecision | null;
  scientificVersions: CardiometabolicScientificVersions;
  audit: {
    evaluationKey: string;
    originalInput: CardiometabolicMeasurementInput;
    validationDecision: string;
    confidenceDecision: CardiometabolicConfidenceId;
    eligibilityDecision: CardiometabolicEligibilityStatus;
    referenceDecision: CardiometabolicReferenceDecision;
    interpretationDecision: CardiometabolicInterpretationDecision;
    safetyDecision: CardiometabolicSafetyDecision;
    authorizedOutputs: readonly CardiometabolicAuthorizedOutput[];
    blockedOutputs: readonly CardiometabolicBlockedOutput[];
    orderedReasonCodes: readonly CardiometabolicReasonCode[];
    registryVersions: CardiometabolicScientificVersions;
  };
}
