export type Vo2MaxEligibilityStatus =
  | 'eligible'
  | 'conditionally_eligible'
  | 'measurement_accepted_no_reference'
  | 'research_only'
  | 'unsupported'
  | 'invalid'
  | 'insufficient_data';

export type Vo2MaxConfidence =
  | 'gold_standard'
  | 'clinical_grade'
  | 'high_confidence'
  | 'moderate_confidence'
  | 'low_confidence'
  | 'research_only'
  | 'unsupported';

export type Vo2MaxSourceId =
  | 'direct_cpet_maximal'
  | 'direct_cpet_symptom_limited'
  | 'laboratory_exercise_estimate'
  | 'apple_watch_estimate'
  | 'garmin_supported_estimate'
  | 'polar_running_index'
  | 'polar_fitness_test_resting'
  | 'fitbit_google_qualifying_gps_estimate'
  | 'coros_evolab'
  | 'whoop_5_mg'
  | 'healthkit_unverified'
  | 'clinician_verified_transcription'
  | 'clinician_unverified_entry'
  | 'user_report_transcription_unverified'
  | 'user_manual_entry';

export type Vo2MaxMeasurementNature =
  | 'direct_gas'
  | 'exercise_estimate'
  | 'resting_estimate'
  | 'transcription'
  | 'unknown';

export type Vo2MaxEndpoint = 'vo2max' | 'vo2peak' | 'unknown';

export type Vo2MaxTestType =
  | 'maximal_cpet'
  | 'symptom_limited_cpet'
  | 'maximal_exercise_without_gas'
  | 'outdoor_walk_run_hike_estimate'
  | 'supported_running_or_cycling_estimate'
  | 'running_index_estimate'
  | 'resting_nonexercise_estimate'
  | 'qualifying_gps_run_estimate'
  | 'rolling_wearable_estimate'
  | 'manual_transcription'
  | 'unknown';

export type Vo2MaxModality =
  | 'treadmill'
  | 'cycle'
  | 'running'
  | 'walking'
  | 'hiking'
  | 'resting'
  | 'mixed'
  | 'unknown';

export type Vo2MaxSourceRecordedSex = 'female' | 'male' | 'intersex' | 'unknown' | 'not_recorded';
export type Vo2MaxHealthPopulation = 'apparently_healthy' | 'clinical' | 'disease_specific' | 'unknown';
export type Vo2MaxIngestionMethod =
  | 'clinical_import'
  | 'device_sync'
  | 'healthkit'
  | 'manual_clinician'
  | 'manual_user'
  | 'research_import';

export type Vo2MaxDuplicateDisposition =
  | 'not_duplicate'
  | 'exact_reimport'
  | 'probable_same_event'
  | 'distinct_same_day_event'
  | 'source_correction'
  | 'superseded';

export interface Vo2MaxProviderIdentity {
  organization: string | null;
  application: string | null;
  deviceManufacturer: string | null;
  deviceModel: string | null;
  softwareVersion: string | null;
  firmwareVersion: string | null;
  algorithmVersion: string | null;
}

export interface Vo2MaxTimestampRecord {
  measuredAt: string | null;
  precision: 'instant' | 'date_only' | 'unknown';
  localTime: string | null;
  utcOffset: string | null;
  timeZone: string | null;
  createdAt: string | null;
  revisedAt: string | null;
  ingestedAt: string | null;
}

export interface Vo2MaxProvenanceInput {
  sourceRecordId: string | null;
  sourceReportId: string | null;
  relatedWorkoutId: string | null;
  originalPayloadReference: string | null;
  payloadIntegrityReference: string | null;
  originatingSourceId: Vo2MaxSourceId | null;
  providerIdentityVerified: boolean;
  reportVerified: boolean;
  directGasAnalysis: boolean | null;
  calibrationDocumented: boolean | null;
  qualityControlDocumented: boolean | null;
  maximalityEvidenceDocumented: boolean | null;
  symptomLimitationDocumented: boolean | null;
  protocolDocumented: boolean | null;
  averagingIntervalDocumented: boolean | null;
  terminationReasonDocumented: boolean | null;
  clinicianAttestationDocumented: boolean | null;
}

export interface Vo2MaxPopulationInput {
  birthDate: string | null;
  sourceRecordedSex: Vo2MaxSourceRecordedSex;
  countryCode: string | null;
  regionCode: string | null;
  healthPopulation: Vo2MaxHealthPopulation;
}

export interface Vo2MaxDuplicateInput {
  disposition: Vo2MaxDuplicateDisposition;
  canonicalRecordId: string | null;
  supersedesRecordId: string | null;
  sharedEventId: string | null;
}

export interface Vo2MaxMeasurementInput {
  recordId: string;
  personId: string;
  value: number | null;
  unit: string | null;
  sourceId: Vo2MaxSourceId | null;
  provider: Vo2MaxProviderIdentity;
  testType: Vo2MaxTestType | null;
  measurementNature: Vo2MaxMeasurementNature;
  endpoint: Vo2MaxEndpoint;
  modality: Vo2MaxModality | null;
  timestamps: Vo2MaxTimestampRecord;
  ingestionMethod: Vo2MaxIngestionMethod;
  provenance: Vo2MaxProvenanceInput;
  population: Vo2MaxPopulationInput;
  duplicate: Vo2MaxDuplicateInput;
  requestedReference: {
    id: string | null;
    version: string | null;
  };
}

export type Vo2MaxReasonSeverity =
  | 'blocking_invalid'
  | 'blocking_insufficient'
  | 'blocking_unsupported'
  | 'conditional'
  | 'informational';

export type Vo2MaxReasonCode =
  | 'missing_value'
  | 'non_finite_value'
  | 'non_positive_value'
  | 'unsupported_unit'
  | 'source_range_violation'
  | 'extreme_value_requires_review'
  | 'missing_timestamp'
  | 'invalid_timestamp'
  | 'missing_ingestion_timestamp'
  | 'invalid_ingestion_timestamp'
  | 'missing_source'
  | 'unknown_source'
  | 'missing_test_type'
  | 'missing_endpoint'
  | 'endpoint_source_mismatch'
  | 'missing_modality'
  | 'modality_source_mismatch'
  | 'measurement_nature_mismatch'
  | 'direct_gas_not_verified'
  | 'maximality_not_documented'
  | 'symptom_limitation_not_documented'
  | 'missing_provider_identity'
  | 'missing_source_record_id'
  | 'missing_report_identity'
  | 'missing_direct_cpet_quality'
  | 'provenance_incomplete'
  | 'healthkit_origin_unverified'
  | 'clinician_source_unverified'
  | 'user_entry_unverified'
  | 'exact_duplicate_not_active'
  | 'probable_duplicate_requires_reconciliation'
  | 'superseded_record_not_active'
  | 'source_correction_preserved'
  | 'research_source_restricted'
  | 'missing_birth_date_for_reference'
  | 'invalid_birth_date'
  | 'age_not_derivable'
  | 'age_outside_reference_range'
  | 'missing_source_recorded_sex_for_reference'
  | 'sex_not_supported_by_reference'
  | 'missing_region_for_reference'
  | 'region_not_supported_by_reference'
  | 'health_population_not_supported_by_reference'
  | 'measurement_class_not_supported_by_reference'
  | 'endpoint_not_supported_by_reference'
  | 'modality_not_supported_by_reference'
  | 'reference_version_unavailable'
  | 'estimate_not_reference_eligible'
  | 'no_authorized_reference'
  | 'reference_exact_match'
  | 'percentile_authorized'
  | 'percentile_unavailable';

export interface Vo2MaxReason {
  code: Vo2MaxReasonCode;
  severity: Vo2MaxReasonSeverity;
  explanation: string;
}

export interface Vo2MaxScientificVersions {
  domainSpecification: string;
  sourceRegistry: string;
  confidenceRegistry: string;
  eligibilityPolicy: string;
  referenceRegistry: string;
  percentileInterpretationPolicy: string;
}

export type Vo2MaxAuthorizedOutput =
  | 'audit_record'
  | 'canonical_value'
  | 'measurement_type'
  | 'measurement_confidence'
  | 'provenance_summary'
  | 'reference_identity'
  | 'percentile'
  | 'data_quality_limitations'
  | 'interpretation_availability'
  | 'research_record';

export type Vo2MaxProhibitedOutput =
  | 'qualitative_fitness_category'
  | 'mortality_threshold_label'
  | 'mortality_prediction'
  | 'fitness_age'
  | 'biological_age'
  | 'biological_age_adjustment'
  | 'universal_risk_claim'
  | 'diagnosis'
  | 'treatment_recommendation'
  | 'cpet_replacement_claim'
  | 'composite_longevity_score';

export type Vo2MaxBlockedOutput = Vo2MaxAuthorizedOutput | Vo2MaxProhibitedOutput;

export interface Vo2MaxReferenceIdentity {
  id: string;
  version: string;
  publication: string;
  population: string;
  ageBand: string;
  sourceRecordedSex: 'female' | 'male';
  countryCode: 'US';
  modality: 'treadmill' | 'cycle';
  endpoint: 'vo2max';
}

export interface Vo2MaxReferenceDecision {
  status: 'eligible' | 'ineligible' | 'not_evaluated';
  reference: Vo2MaxReferenceIdentity | null;
  reasonCodes: readonly Vo2MaxReasonCode[];
}

export interface Vo2MaxPercentileDecision {
  status: 'authorized' | 'unavailable';
  value: null;
  policyVersion: string;
  reasonCodes: readonly Vo2MaxReasonCode[];
}

export interface Vo2MaxAuditSnapshot {
  evaluationKey: string;
  recordId: string;
  personId: string;
  originalValue: number | null;
  canonicalValue: number | null;
  originalUnit: string | null;
  canonicalUnit: string | null;
  sourceId: Vo2MaxSourceId | null;
  provider: Vo2MaxProviderIdentity;
  testType: Vo2MaxTestType | null;
  measurementNature: Vo2MaxMeasurementNature;
  endpoint: Vo2MaxEndpoint;
  modality: Vo2MaxModality | null;
  timestamps: Vo2MaxTimestampRecord;
  ingestionMethod: Vo2MaxIngestionMethod;
  provenance: Vo2MaxProvenanceInput;
  provenanceComplete: boolean;
  population: Vo2MaxPopulationInput;
  ageAtMeasurement: number | null;
  duplicate: Vo2MaxDuplicateInput;
  confidenceDecision: Vo2MaxConfidence;
  eligibilityDecision: Vo2MaxEligibilityStatus;
  referenceDecision: Vo2MaxReferenceDecision;
  reasonCodes: readonly Vo2MaxReasonCode[];
  registryVersions: Vo2MaxScientificVersions;
}

export interface Vo2MaxEligibilityResult {
  status: Vo2MaxEligibilityStatus;
  reasonCodes: readonly Vo2MaxReasonCode[];
  reasons: readonly Vo2MaxReason[];
  explanation: string;
  measurementConfidence: Vo2MaxConfidence;
  measurementAccepted: boolean;
  sourceProvenance: {
    sourceId: Vo2MaxSourceId | null;
    provider: Vo2MaxProviderIdentity;
    ingestionMethod: Vo2MaxIngestionMethod;
    provenanceComplete: boolean;
    originatingSourceId: Vo2MaxSourceId | null;
  };
  canonicalMeasurement: {
    originalValue: number | null;
    canonicalValue: number | null;
    originalUnit: string | null;
    canonicalUnit: string | null;
    endpoint: Vo2MaxEndpoint;
    measurementNature: Vo2MaxMeasurementNature;
    modality: Vo2MaxModality | null;
    ageAtMeasurement: number | null;
  };
  referenceEligibility: Vo2MaxReferenceDecision;
  percentileEligibility: Vo2MaxPercentileDecision;
  interpretationAvailability:
    | 'normative_percentile_authorized'
    | 'measurement_context_only'
    | 'conditional_measurement_context'
    | 'research_only'
    | 'unavailable';
  authorizedOutputs: readonly Vo2MaxAuthorizedOutput[];
  blockedOutputs: readonly Vo2MaxBlockedOutput[];
  scientificVersion: Vo2MaxScientificVersions;
  audit: Vo2MaxAuditSnapshot;
}

