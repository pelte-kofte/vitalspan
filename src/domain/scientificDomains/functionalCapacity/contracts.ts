export type FunctionalCapacityTestId =
  | 'hand_grip_strength'
  | 'usual_gait_speed'
  | 'four_meter_walk'
  | 'chair_stand_30_second'
  | 'five_times_sit_to_stand'
  | 'timed_up_and_go'
  | 'six_minute_walk_test'
  | 'short_physical_performance_battery';

export type FunctionalCapacityEligibilityStatus =
  | 'eligible'
  | 'conditionally_eligible'
  | 'measurement_accepted_no_reference'
  | 'protocol_mismatch'
  | 'research_only'
  | 'clinical_specialty'
  | 'unsupported'
  | 'invalid'
  | 'incomplete'
  | 'insufficient_data'
  | 'safety_requirements_not_met';

export type FunctionalCapacityConfidence =
  | 'clinical_grade'
  | 'high_confidence'
  | 'moderate_confidence'
  | 'low_confidence'
  | 'research_only'
  | 'unsupported';

export type FunctionalCapacitySourceId =
  | 'validated_clinical_assessment'
  | 'validated_rehabilitation_assessment'
  | 'trained_research_assessment'
  | 'supervised_standardized_home_assessment'
  | 'unsupervised_home_assessment'
  | 'validated_connected_medical_device'
  | 'unvalidated_connected_device'
  | 'consumer_wearable'
  | 'passive_estimate'
  | 'clinician_verified_transcription'
  | 'clinician_entered_unverified'
  | 'user_transcription_pending_verification'
  | 'user_entered_unverified'
  | 'self_report';

export type FunctionalCapacityProtocolId =
  | 'southampton_grip_v1'
  | 'asht_grip_v1'
  | 'usual_gait_static_4m_nia_v1'
  | 'usual_gait_named_variant_v1'
  | 'nia_four_meter_walk_v1'
  | 'nih_toolbox_four_meter_walk_v1'
  | 'clsa_four_meter_walk_2023'
  | 'cdc_steadi_30cst_v1'
  | 'standalone_5xsts_fifth_sit_v1'
  | 'cdc_steadi_tug_3m_v1'
  | 'cdc_steadi_tug_10ft_v1'
  | 'clsa_tug_2023'
  | 'tromso_tug_2021'
  | 'ers_ats_6mwt_2014'
  | 'six_mwt_specialty_short_course_v1'
  | 'nia_sppb_4m_v1'
  | 'nia_sppb_3m_v1';

export type FunctionalCapacityReferenceId =
  | 'igrips_2025_adult_absolute'
  | 'nih_toolbox_4m_us_2019'
  | 'clsa_4m_ca_2023'
  | 'rikli_jones_30cst_us_1999'
  | 'clsa_tug_ca_2023'
  | 'tromso_tug_no_2021'
  | 'casanova_6mwt_multicentre_2011'
  | 'elsa_gait_england_2026_candidate';

export type FunctionalCapacityIngestionMethod =
  | 'clinical_import'
  | 'research_import'
  | 'rehabilitation_import'
  | 'device_sync'
  | 'manual_clinician'
  | 'manual_user'
  | 'supervised_home_capture';

export type FunctionalCapacityHealthPopulation =
  | 'apparently_healthy'
  | 'healthy_independent'
  | 'community_general'
  | 'clinical'
  | 'disease_specific'
  | 'institutionalized'
  | 'unknown';

export type FunctionalCapacitySourceRecordedSex =
  | 'female'
  | 'male'
  | 'intersex'
  | 'unknown'
  | 'not_recorded';

export type FunctionalCapacityCompletionState =
  | 'completed'
  | 'incomplete'
  | 'interrupted'
  | 'not_started'
  | 'contraindicated'
  | 'refused'
  | 'technical_failure'
  | 'unknown';

export type FunctionalCapacityDuplicateDisposition =
  | 'not_duplicate'
  | 'exact_reimport'
  | 'probable_same_event'
  | 'distinct_same_day_event'
  | 'source_correction'
  | 'superseded';

export type FunctionalCapacitySupervisionClass =
  | 'qualified_clinical'
  | 'qualified_rehabilitation'
  | 'trained_research'
  | 'live_professional_home'
  | 'unsupervised'
  | 'unknown';

export type FunctionalCapacityAssistance =
  | 'none'
  | 'guarding_only'
  | 'physical_assistance'
  | 'arm_support'
  | 'unknown';

export type FunctionalCapacityOutlierStatus =
  | 'not_flagged'
  | 'verified_extreme'
  | 'unresolved_extreme';

export interface FunctionalCapacityProviderIdentity {
  organization: string | null;
  application: string | null;
  deviceManufacturer: string | null;
  deviceModel: string | null;
  deviceSerial: string | null;
  softwareVersion: string | null;
  firmwareVersion: string | null;
}

export interface FunctionalCapacityTimestampRecord {
  measuredAt: string | null;
  endedAt: string | null;
  precision: 'instant' | 'date_only' | 'unknown';
  localTime: string | null;
  utcOffset: string | null;
  timeZone: string | null;
  ingestedAt: string | null;
}

export interface FunctionalCapacityProvenanceInput {
  sourceRecordId: string | null;
  sourceSessionId: string | null;
  originalRecordReference: string | null;
  payloadIntegrityReference: string | null;
  observerId: string | null;
  assessorRole: string | null;
  assessorTrainingDocumented: boolean | null;
  providerIdentityVerified: boolean;
  sourceDocumentVerified: boolean;
  protocolDocumented: boolean | null;
  equipmentQualityDocumented: boolean | null;
  transcriptionVerified: boolean | null;
}

export interface FunctionalCapacityPopulationInput {
  birthDate: string | null;
  sourceRecordedSex: FunctionalCapacitySourceRecordedSex;
  countryCode: string | null;
  regionCode: string | null;
  healthPopulation: FunctionalCapacityHealthPopulation;
  referenceCountrySupported: boolean | null;
}

export interface FunctionalCapacityCompletionInput {
  state: FunctionalCapacityCompletionState;
  interruptions: readonly string[];
  assistance: FunctionalCapacityAssistance;
  stoppingReason: string | null;
  stoppingReasonRecorded: boolean;
}

export interface FunctionalCapacitySafetyInput {
  screeningCompleted: boolean | null;
  contraindicationPresent: boolean | null;
  acuteSymptomsPresent: boolean | null;
  stoppingCriteriaReviewed: boolean | null;
  safetyEvents: readonly string[];
  adverseEvents: readonly string[];
  emergencyResponseUsed: boolean | null;
  baselineSafetyObservationsRecorded: boolean | null;
  endSafetyObservationsRecorded: boolean | null;
}

export interface FunctionalCapacitySupervisionInput {
  supervisionClass: FunctionalCapacitySupervisionClass;
  supervisorCredentials: string | null;
  settingClassification: string | null;
  emergencyReadinessDocumented: boolean | null;
  participantContinuouslyObserved: boolean | null;
}

export interface FunctionalCapacityDuplicateInput {
  disposition: FunctionalCapacityDuplicateDisposition;
  canonicalRecordId: string | null;
  sharedEventId: string | null;
  supersedesRecordId: string | null;
}

export interface FunctionalCapacityAttempt {
  attemptId: string;
  sequence: number;
  value: number | null;
  unit: string | null;
  hand: 'left' | 'right' | null;
  completed: boolean;
  invalidated: boolean;
  invalidationReason: string | null;
  restBeforeSeconds: number | null;
}

export interface HandGripDetails {
  handTested: 'left' | 'right' | 'unknown';
  dominance: 'dominant' | 'non_dominant' | 'ambidextrous' | 'unknown';
  deviceType: 'hydraulic' | 'electronic' | 'spring' | 'unknown';
  dynamometerIdentity: string | null;
  calibrationStatus: 'current' | 'expired' | 'not_calibrated' | 'unknown';
  participantPosition: 'seated_supported' | 'seated_unsupported' | 'standing' | 'supine' | 'unknown';
  elbowPosition: 'approximately_90_degrees' | 'extended' | 'unknown';
  wristPosition: 'neutral' | 'standardized_asht' | 'unknown';
  handleSetting: string | null;
  numberOfAttempts: number | null;
  selectedAttemptId: string | null;
  selectionRule: 'maximum_for_tested_hand' | 'mean' | 'unknown';
  painOrSafetyLimitation: boolean | null;
}

export interface GaitDetails {
  courseLengthM: number | null;
  timedDistanceM: number | null;
  accelerationAllowanceM: number | null;
  decelerationAllowanceM: number | null;
  pace: 'usual' | 'fast' | 'maximal' | 'dual_task' | 'unknown';
  startType: 'static' | 'moving' | 'unknown';
  assistiveDevice: 'none' | 'cane' | 'walker' | 'other' | 'unknown';
  humanAssistance: boolean | null;
  numberOfTrials: number | null;
  selectedAttemptId: string | null;
  selectionRule: 'faster_completed_trial' | 'single_trial' | 'mean' | 'unknown';
  timingMethod: 'manual_stopwatch' | 'validated_timing_gates' | 'other' | 'unknown';
  environment: 'indoor_level' | 'outdoor' | 'treadmill' | 'unknown';
  surface: string | null;
  footwear: string | null;
}

export interface ChairStand30Details {
  chairHeightCm: number | null;
  chairHasArms: boolean | null;
  chairHasBack: boolean | null;
  armUse: boolean | null;
  testDurationSeconds: number | null;
  completedRepetitions: number | null;
  partialRepetitionHandling: 'cdc_expiration_rule' | 'not_counted' | 'fractional' | 'unknown';
  footwear: string | null;
}

export interface FiveTimesSitToStandDetails {
  chairHeightCm: number | null;
  chairHasBack: boolean | null;
  armUse: boolean | null;
  timingStartRule: 'start_command' | 'movement_onset' | 'unknown';
  timingStopRule: 'buttocks_contact_after_fifth_sit' | 'full_standing_fifth_rise' | 'unknown';
  completedRepetitions: number | null;
  practiceCompleted: boolean | null;
}

export interface TimedUpAndGoDetails {
  courseDistanceM: number | null;
  chairHeightCm: number | null;
  chairHasArmrests: boolean | null;
  assistiveDevice: 'none' | 'cane' | 'walker' | 'other' | 'unknown';
  footwear: string | null;
  paceInstruction: 'usual' | 'fast' | 'dual_task' | 'unknown' | 'not_specified_by_protocol';
  timingStartRule: 'start_command' | 'movement_onset' | 'unknown';
  timingStopRule: 'seated_again' | 'crossed_return_line' | 'unknown';
  practiceCompleted: boolean | null;
  taskType: 'single_task' | 'cognitive_dual_task' | 'manual_dual_task' | 'instrumented' | 'unknown';
}

export interface SixMinuteWalkDetails {
  corridorLengthM: number | null;
  courseLayout: 'straight' | 'circular' | 'treadmill' | 'outdoor_route' | 'unknown';
  surface: 'hard_level_indoor' | 'other' | 'unknown';
  standardizedEncouragement: boolean | null;
  testDurationMinutes: number | null;
  laps: number | null;
  totalDistanceM: number | null;
  rests: readonly { startedAtSeconds: number; durationSeconds: number; reason: string | null }[];
  timerContinuedDuringRests: boolean | null;
  oxygenUse: 'none' | 'supplemental_fixed' | 'titrated_during_test' | 'unknown';
  oxygenFlow: string | null;
  assistiveDevice: 'none' | 'cane' | 'walker' | 'other' | 'unknown';
  baselineSymptomsRecorded: boolean | null;
  baselineVitalSignsRecorded: boolean | null;
  stoppingCriteriaRecorded: boolean | null;
  numberOfTests: number | null;
  selectedAttemptId: string | null;
  selectionRule: 'greater_qualifying_distance' | 'single_test_status' | 'unknown';
}

export interface SppbRawComponents {
  componentOrder: readonly ('balance' | 'gait' | 'chair')[];
  balance: {
    sideBySideSeconds: number | null;
    semiTandemSeconds: number | null;
    tandemSeconds: number | null;
    stopReasonsRecorded: boolean;
  };
  gait: {
    courseDistanceM: 3 | 4 | null;
    startType: 'static' | 'moving' | 'unknown';
    pace: 'usual' | 'fast' | 'unknown';
    trialTimesSeconds: readonly number[];
    selectedTrialIndex: number | null;
    assistiveDevice: 'none' | 'cane' | 'walker' | 'other' | 'unknown';
  };
  chair: {
    chairHeightCm: number | null;
    singleRiseScreenCompleted: boolean | null;
    armUse: boolean | null;
    repeatedRiseTimeSeconds: number | null;
    completedRepetitions: number | null;
    stopRule: 'full_standing_fifth_rise' | 'buttocks_contact_after_fifth_sit' | 'unknown';
  };
}

export interface SppbDetails {
  officialProtocolAdministered: boolean | null;
  assessorTrainedForFullBattery: boolean | null;
  rawComponents: SppbRawComponents | null;
}

export interface FunctionalCapacityTestDetails {
  handGrip: HandGripDetails | null;
  gait: GaitDetails | null;
  chairStand30: ChairStand30Details | null;
  fiveTimesSitToStand: FiveTimesSitToStandDetails | null;
  timedUpAndGo: TimedUpAndGoDetails | null;
  sixMinuteWalk: SixMinuteWalkDetails | null;
  sppb: SppbDetails | null;
}

export interface FunctionalCapacityPublishedProtocolOutput {
  protocolId: FunctionalCapacityProtocolId;
  protocolVersion: string;
  componentScores: Readonly<Record<string, number>> | null;
  total: number | null;
  sourceCalculated: boolean;
  calculationAttestedToOfficialProtocol: boolean;
  sourceDocumentReference: string | null;
}

export interface FunctionalCapacityPublishedPercentileInput {
  referenceId: FunctionalCapacityReferenceId;
  referenceVersion: string;
  percentile: number;
  sourceTableIdentifier: string | null;
  sourceValueMatchVerified: boolean;
}

export interface FunctionalCapacityMeasurementInput {
  recordId: string;
  personId: string;
  testId: FunctionalCapacityTestId | null;
  value: number | null;
  unit: string | null;
  attempts: readonly FunctionalCapacityAttempt[];
  protocolId: FunctionalCapacityProtocolId | null;
  protocolVersion: string | null;
  protocolAdherence: 'complete' | 'permitted_variant' | 'material_deviation' | 'unknown';
  endpoint: string | null;
  sourceId: FunctionalCapacitySourceId | null;
  provider: FunctionalCapacityProviderIdentity;
  ingestionMethod: FunctionalCapacityIngestionMethod | null;
  timestamps: FunctionalCapacityTimestampRecord;
  provenance: FunctionalCapacityProvenanceInput;
  population: FunctionalCapacityPopulationInput;
  completion: FunctionalCapacityCompletionInput;
  safety: FunctionalCapacitySafetyInput;
  supervision: FunctionalCapacitySupervisionInput;
  duplicate: FunctionalCapacityDuplicateInput;
  outlierStatus: FunctionalCapacityOutlierStatus;
  details: FunctionalCapacityTestDetails;
  requestedReference: { id: FunctionalCapacityReferenceId | null; version: string | null };
  publishedPercentile: FunctionalCapacityPublishedPercentileInput | null;
  publishedProtocolOutput: FunctionalCapacityPublishedProtocolOutput | null;
}

export type FunctionalCapacityReasonSeverity =
  | 'blocking_invalid'
  | 'blocking_insufficient'
  | 'blocking_unsupported'
  | 'blocking_protocol'
  | 'blocking_incomplete'
  | 'blocking_safety'
  | 'research_restriction'
  | 'clinical_specialty'
  | 'conditional'
  | 'informational';

export type FunctionalCapacityReasonCode =
  | 'missing_test_identity' | 'unknown_test_identity' | 'missing_value' | 'missing_raw_components'
  | 'non_finite_value' | 'non_positive_value' | 'negative_value' | 'non_integer_repetition_count'
  | 'unsupported_unit' | 'verified_extreme_preserved' | 'unresolved_extreme_requires_review'
  | 'missing_timestamp' | 'invalid_timestamp' | 'missing_ingestion_timestamp' | 'invalid_ingestion_timestamp'
  | 'missing_source' | 'unknown_source' | 'source_research_only' | 'source_unsupported'
  | 'missing_ingestion_method' | 'missing_protocol' | 'unknown_protocol' | 'missing_endpoint' | 'protocol_test_mismatch'
  | 'protocol_version_mismatch' | 'protocol_adherence_unknown' | 'material_protocol_deviation'
  | 'missing_source_record_id' | 'missing_session_id' | 'missing_provider_identity'
  | 'missing_observer_identity' | 'missing_assessor_training' | 'provenance_incomplete'
  | 'unverified_clinician_entry' | 'unverified_user_entry' | 'self_report_not_measurement'
  | 'wearable_not_validated_test' | 'passive_estimate_not_validated_test'
  | 'missing_completion_status' | 'test_incomplete' | 'test_interrupted' | 'test_not_completed'
  | 'missing_interruption_record' | 'missing_assistance_status' | 'physical_assistance_invalidates_standard'
  | 'missing_stopping_reason' | 'missing_safety_screen' | 'contraindication_present'
  | 'acute_safety_event' | 'missing_supervision' | 'six_mwt_supervision_required'
  | 'six_mwt_emergency_readiness_required' | 'sppb_live_supervision_required'
  | 'missing_attempts' | 'duplicate_attempt_id' | 'invalid_attempt_sequence' | 'missing_rest_period'
  | 'missing_hand' | 'missing_dynamometer_identity' | 'missing_device_type' | 'device_not_calibrated'
  | 'missing_grip_position' | 'missing_elbow_position' | 'invalid_grip_attempt_count'
  | 'invalid_grip_selection_rule' | 'grip_pain_limited' | 'mixed_hands_not_allowed'
  | 'missing_course_length' | 'missing_timed_distance' | 'unknown_gait_pace' | 'fast_gait_not_usual'
  | 'moving_start_not_static' | 'missing_start_type' | 'missing_assistive_device_status'
  | 'missing_gait_environment' | 'gait_course_not_overground' | 'invalid_gait_trial_rule'
  | 'four_meter_course_required' | 'generic_gait_not_four_meter_walk'
  | 'missing_chair_height' | 'nonstandard_chair_height' | 'arm_use_not_standard'
  | 'invalid_30_second_duration' | 'invalid_partial_repetition_rule'
  | 'invalid_five_times_repetition_count' | 'unknown_five_times_stop_rule'
  | 'sppb_endpoint_not_standalone_five_times'
  | 'invalid_tug_course' | 'missing_chair_specifications' | 'invalid_tug_task'
  | 'invalid_tug_pace' | 'invalid_tug_stop_rule' | 'tug_mobility_only'
  | 'invalid_six_mwt_corridor' | 'invalid_six_mwt_layout' | 'invalid_six_mwt_duration'
  | 'missing_standardized_encouragement' | 'six_mwt_timer_paused_during_rest'
  | 'missing_oxygen_status' | 'oxygen_titrated_during_test' | 'missing_six_mwt_safety_metadata'
  | 'six_mwt_not_vo2max' | 'specialty_protocol_only'
  | 'sppb_official_protocol_required' | 'sppb_component_order_invalid'
  | 'sppb_raw_components_incomplete' | 'sppb_gait_protocol_invalid'
  | 'sppb_chair_endpoint_invalid' | 'standalone_five_times_not_sppb_component'
  | 'sppb_total_not_vitalspan_generated' | 'published_protocol_output_preserved'
  | 'exact_duplicate_not_active' | 'probable_duplicate_requires_reconciliation'
  | 'superseded_record_not_active' | 'source_correction_preserved'
  | 'missing_birth_date_for_reference' | 'invalid_birth_date' | 'age_not_derivable'
  | 'age_outside_reference_range' | 'missing_source_recorded_sex_for_reference'
  | 'sex_not_supported_by_reference' | 'missing_country_for_reference'
  | 'country_not_supported_by_reference' | 'region_not_supported_by_reference'
  | 'health_population_not_supported_by_reference' | 'protocol_not_supported_by_reference'
  | 'equipment_not_supported_by_reference' | 'course_not_supported_by_reference'
  | 'endpoint_not_supported_by_reference' | 'supervision_not_supported_by_reference'
  | 'reference_version_unavailable' | 'reference_inactive' | 'reference_not_requested'
  | 'no_authorized_reference' | 'reference_exact_match' | 'percentile_source_unverified'
  | 'percentile_value_invalid' | 'published_percentile_authorized' | 'percentile_unavailable'
  | 'five_times_no_normative_reference' | 'sppb_no_normative_reference'
  | 'trend_same_record' | 'trend_test_mismatch' | 'trend_protocol_mismatch'
  | 'trend_endpoint_mismatch' | 'trend_unit_mismatch' | 'trend_equipment_mismatch'
  | 'trend_hand_mismatch' | 'trend_pace_mismatch' | 'trend_course_mismatch'
  | 'trend_chair_mismatch' | 'trend_arm_rule_mismatch' | 'trend_assistive_device_mismatch'
  | 'trend_supervision_mismatch' | 'trend_completion_mismatch' | 'trend_metadata_missing'
  | 'trend_exact_match' | 'trend_conditional_match';

export interface FunctionalCapacityReason {
  code: FunctionalCapacityReasonCode;
  severity: FunctionalCapacityReasonSeverity;
  explanation: string;
}

export interface FunctionalCapacityScientificVersions {
  domainSpecification: string;
  testRegistry: string;
  protocolRegistry: string;
  sourceRegistry: string;
  confidenceRegistry: string;
  validationPolicy: string;
  eligibilityPolicy: string;
  referenceRegistry: string;
  referenceMatchingPolicy: string;
  interpretationPolicy: string;
  trendComparisonPolicy: string;
}

export type FunctionalCapacityAuthorizedOutput =
  | 'audit_record' | 'validated_raw_measurement' | 'canonical_unit' | 'test_identity'
  | 'protocol_identity' | 'source_provenance_summary' | 'measurement_confidence'
  | 'completion_status' | 'reference_identity' | 'published_percentile'
  | 'published_protocol_output' | 'limitations' | 'interpretation_availability'
  | 'trend_compatibility' | 'research_record';

export type FunctionalCapacityProhibitedOutput =
  | 'overall_functional_capacity_score' | 'cross_test_ranking' | 'qualitative_performance_category'
  | 'universal_performance_category' | 'mortality_threshold' | 'lifespan_prediction'
  | 'biological_age' | 'fitness_age' | 'frailty_diagnosis' | 'sarcopenia_diagnosis'
  | 'fall_risk_diagnosis' | 'disease_diagnosis' | 'treatment_recommendation'
  | 'exercise_prescription' | 'composite_longevity_score' | 'clinician_assessment_replacement'
  | 'six_mwt_to_vo2max_conversion' | 'cross_test_substitution';

export type FunctionalCapacityBlockedOutput =
  | FunctionalCapacityAuthorizedOutput
  | FunctionalCapacityProhibitedOutput;

export interface FunctionalCapacityReferenceIdentity {
  id: FunctionalCapacityReferenceId;
  version: string;
  publication: string;
  testId: FunctionalCapacityTestId;
  protocolIds: readonly FunctionalCapacityProtocolId[];
  population: string;
  interpretationType: 'published_percentile' | 'published_reference_interval' | 'published_reference_curve';
}

export interface FunctionalCapacityReferenceDecision {
  status: 'eligible' | 'ineligible' | 'not_evaluated';
  reference: FunctionalCapacityReferenceIdentity | null;
  reasonCodes: readonly FunctionalCapacityReasonCode[];
}

export interface FunctionalCapacityInterpretationDecision {
  availability:
    | 'published_percentile_authorized'
    | 'reference_eligible_percentile_not_supplied'
    | 'measurement_context_only'
    | 'conditional_measurement_context'
    | 'published_protocol_output_only'
    | 'research_only'
    | 'unavailable';
  publishedPercentile: number | null;
  reference: FunctionalCapacityReferenceIdentity | null;
  reasonCodes: readonly FunctionalCapacityReasonCode[];
  policyVersion: string;
}

export interface FunctionalCapacityCanonicalMeasurement {
  originalValue: number | null;
  canonicalValue: number | null;
  originalUnit: string | null;
  canonicalUnit: string | null;
  rawComponents: SppbRawComponents | null;
  ageAtMeasurement: number | null;
}

export interface FunctionalCapacityAuditSnapshot {
  evaluationKey: string;
  originalInput: FunctionalCapacityMeasurementInput;
  canonicalMeasurement: FunctionalCapacityCanonicalMeasurement;
  testId: FunctionalCapacityTestId | null;
  protocolId: FunctionalCapacityProtocolId | null;
  protocolVersion: string | null;
  protocolMetadata: FunctionalCapacityTestDetails;
  sourceId: FunctionalCapacitySourceId | null;
  provider: FunctionalCapacityProviderIdentity;
  ingestionMethod: FunctionalCapacityIngestionMethod | null;
  timestamps: FunctionalCapacityTimestampRecord;
  provenanceComplete: boolean;
  safetyMetadata: FunctionalCapacitySafetyInput;
  supervisionMetadata: FunctionalCapacitySupervisionInput;
  measurementQualityDecision: 'accepted' | 'conditional' | 'rejected';
  confidenceDecision: FunctionalCapacityConfidence;
  eligibilityDecision: FunctionalCapacityEligibilityStatus;
  referenceDecision: FunctionalCapacityReferenceDecision;
  interpretationDecision: FunctionalCapacityInterpretationDecision;
  orderedReasonCodes: readonly FunctionalCapacityReasonCode[];
  registryVersions: FunctionalCapacityScientificVersions;
}

export interface FunctionalCapacityEligibilityResult {
  testIdentity: FunctionalCapacityTestId | null;
  status: FunctionalCapacityEligibilityStatus;
  reasonCodes: readonly FunctionalCapacityReasonCode[];
  reasons: readonly FunctionalCapacityReason[];
  explanation: string;
  measurementConfidence: FunctionalCapacityConfidence;
  measurementAccepted: boolean;
  protocolIdentity: { id: FunctionalCapacityProtocolId | null; version: string | null };
  sourceProvenance: {
    sourceId: FunctionalCapacitySourceId | null;
    provider: FunctionalCapacityProviderIdentity;
    ingestionMethod: FunctionalCapacityIngestionMethod | null;
    provenanceComplete: boolean;
  };
  canonicalMeasurement: FunctionalCapacityCanonicalMeasurement;
  completionStatus: FunctionalCapacityCompletionState;
  referenceEligibility: FunctionalCapacityReferenceDecision;
  interpretation: FunctionalCapacityInterpretationDecision;
  authorizedOutputs: readonly FunctionalCapacityAuthorizedOutput[];
  blockedOutputs: readonly FunctionalCapacityBlockedOutput[];
  scientificVersions: FunctionalCapacityScientificVersions;
  audit: FunctionalCapacityAuditSnapshot;
}

export type FunctionalCapacityTrendStatus =
  | 'comparable'
  | 'conditionally_comparable'
  | 'not_comparable'
  | 'insufficient_data';

export interface FunctionalCapacityTrendResult {
  status: FunctionalCapacityTrendStatus;
  reasonCodes: readonly FunctionalCapacityReasonCode[];
  explanations: readonly string[];
  comparedRecordIds: readonly [string, string];
  versions: FunctionalCapacityScientificVersions;
  audit: {
    firstEvaluationKey: string;
    secondEvaluationKey: string;
    matchedDimensions: readonly string[];
    mismatchedDimensions: readonly string[];
    missingDimensions: readonly string[];
  };
}
