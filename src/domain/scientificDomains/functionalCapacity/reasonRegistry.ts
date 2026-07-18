import type {
  FunctionalCapacityReason,
  FunctionalCapacityReasonCode,
  FunctionalCapacityReasonSeverity,
} from './contracts';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export const FUNCTIONAL_CAPACITY_REASON_ORDER = [
  'missing_test_identity', 'unknown_test_identity', 'missing_value', 'missing_raw_components',
  'non_finite_value', 'non_positive_value', 'negative_value', 'non_integer_repetition_count',
  'unsupported_unit', 'verified_extreme_preserved', 'unresolved_extreme_requires_review',
  'missing_timestamp', 'invalid_timestamp', 'missing_ingestion_timestamp', 'invalid_ingestion_timestamp',
  'missing_source', 'unknown_source', 'source_research_only', 'source_unsupported',
  'missing_ingestion_method', 'missing_protocol', 'unknown_protocol', 'missing_endpoint', 'protocol_test_mismatch',
  'protocol_version_mismatch', 'protocol_adherence_unknown', 'material_protocol_deviation',
  'missing_source_record_id', 'missing_session_id', 'missing_provider_identity',
  'missing_observer_identity', 'missing_assessor_training', 'provenance_incomplete',
  'unverified_clinician_entry', 'unverified_user_entry', 'self_report_not_measurement',
  'wearable_not_validated_test', 'passive_estimate_not_validated_test',
  'missing_completion_status', 'test_incomplete', 'test_interrupted', 'test_not_completed',
  'missing_interruption_record', 'missing_assistance_status', 'physical_assistance_invalidates_standard',
  'missing_stopping_reason', 'missing_safety_screen', 'contraindication_present',
  'acute_safety_event', 'missing_supervision', 'six_mwt_supervision_required',
  'six_mwt_emergency_readiness_required', 'sppb_live_supervision_required',
  'missing_attempts', 'duplicate_attempt_id', 'invalid_attempt_sequence', 'missing_rest_period',
  'missing_hand', 'missing_dynamometer_identity', 'missing_device_type', 'device_not_calibrated',
  'missing_grip_position', 'missing_elbow_position', 'invalid_grip_attempt_count',
  'invalid_grip_selection_rule', 'grip_pain_limited', 'mixed_hands_not_allowed',
  'missing_course_length', 'missing_timed_distance', 'unknown_gait_pace', 'fast_gait_not_usual',
  'moving_start_not_static', 'missing_start_type', 'missing_assistive_device_status',
  'missing_gait_environment', 'gait_course_not_overground', 'invalid_gait_trial_rule',
  'four_meter_course_required', 'generic_gait_not_four_meter_walk',
  'missing_chair_height', 'nonstandard_chair_height', 'arm_use_not_standard',
  'invalid_30_second_duration', 'invalid_partial_repetition_rule',
  'invalid_five_times_repetition_count', 'unknown_five_times_stop_rule',
  'sppb_endpoint_not_standalone_five_times',
  'invalid_tug_course', 'missing_chair_specifications', 'invalid_tug_task',
  'invalid_tug_pace', 'invalid_tug_stop_rule', 'tug_mobility_only',
  'invalid_six_mwt_corridor', 'invalid_six_mwt_layout', 'invalid_six_mwt_duration',
  'missing_standardized_encouragement', 'six_mwt_timer_paused_during_rest',
  'missing_oxygen_status', 'oxygen_titrated_during_test', 'missing_six_mwt_safety_metadata',
  'six_mwt_not_vo2max', 'specialty_protocol_only',
  'sppb_official_protocol_required', 'sppb_component_order_invalid',
  'sppb_raw_components_incomplete', 'sppb_gait_protocol_invalid',
  'sppb_chair_endpoint_invalid', 'standalone_five_times_not_sppb_component',
  'sppb_total_not_vitalspan_generated', 'published_protocol_output_preserved',
  'exact_duplicate_not_active', 'probable_duplicate_requires_reconciliation',
  'superseded_record_not_active', 'source_correction_preserved',
  'missing_birth_date_for_reference', 'invalid_birth_date', 'age_not_derivable',
  'age_outside_reference_range', 'missing_source_recorded_sex_for_reference',
  'sex_not_supported_by_reference', 'missing_country_for_reference',
  'country_not_supported_by_reference', 'region_not_supported_by_reference',
  'health_population_not_supported_by_reference', 'protocol_not_supported_by_reference',
  'equipment_not_supported_by_reference', 'course_not_supported_by_reference',
  'endpoint_not_supported_by_reference', 'supervision_not_supported_by_reference',
  'reference_version_unavailable', 'reference_inactive', 'reference_not_requested',
  'no_authorized_reference', 'reference_exact_match', 'percentile_source_unverified',
  'percentile_value_invalid', 'published_percentile_authorized', 'percentile_unavailable',
  'five_times_no_normative_reference', 'sppb_no_normative_reference',
  'trend_same_record', 'trend_test_mismatch', 'trend_protocol_mismatch',
  'trend_endpoint_mismatch', 'trend_unit_mismatch', 'trend_equipment_mismatch',
  'trend_hand_mismatch', 'trend_pace_mismatch', 'trend_course_mismatch',
  'trend_chair_mismatch', 'trend_arm_rule_mismatch', 'trend_assistive_device_mismatch',
  'trend_supervision_mismatch', 'trend_completion_mismatch', 'trend_metadata_missing',
  'trend_exact_match', 'trend_conditional_match',
] as const satisfies readonly FunctionalCapacityReasonCode[];

const INVALID = new Set<FunctionalCapacityReasonCode>([
  'unknown_test_identity', 'non_finite_value', 'non_positive_value', 'negative_value',
  'non_integer_repetition_count', 'unsupported_unit', 'invalid_timestamp',
  'invalid_ingestion_timestamp', 'protocol_test_mismatch', 'duplicate_attempt_id',
  'invalid_attempt_sequence', 'mixed_hands_not_allowed', 'four_meter_course_required',
  'generic_gait_not_four_meter_walk', 'invalid_30_second_duration',
  'invalid_partial_repetition_rule', 'invalid_five_times_repetition_count',
  'sppb_endpoint_not_standalone_five_times', 'invalid_tug_course', 'invalid_tug_task',
  'invalid_tug_pace', 'invalid_tug_stop_rule', 'invalid_six_mwt_layout',
  'invalid_six_mwt_duration', 'six_mwt_timer_paused_during_rest',
  'oxygen_titrated_during_test', 'sppb_component_order_invalid',
  'sppb_gait_protocol_invalid', 'sppb_chair_endpoint_invalid',
  'standalone_five_times_not_sppb_component',
]);

const INSUFFICIENT = new Set<FunctionalCapacityReasonCode>([
  'missing_test_identity', 'missing_value', 'missing_raw_components', 'missing_timestamp',
  'missing_ingestion_timestamp', 'missing_source', 'missing_ingestion_method',
  'missing_protocol', 'missing_endpoint', 'protocol_version_mismatch', 'protocol_adherence_unknown',
  'missing_source_record_id', 'missing_session_id', 'missing_provider_identity',
  'missing_observer_identity', 'missing_assessor_training', 'provenance_incomplete',
  'missing_completion_status', 'missing_interruption_record', 'missing_assistance_status',
  'missing_stopping_reason', 'missing_safety_screen', 'missing_supervision',
  'missing_attempts', 'missing_rest_period', 'missing_hand', 'missing_dynamometer_identity',
  'missing_device_type', 'missing_grip_position', 'missing_elbow_position',
  'missing_course_length', 'missing_timed_distance', 'unknown_gait_pace',
  'missing_start_type', 'missing_assistive_device_status', 'missing_gait_environment',
  'missing_chair_height', 'unknown_five_times_stop_rule', 'missing_chair_specifications',
  'missing_standardized_encouragement', 'missing_oxygen_status',
  'missing_six_mwt_safety_metadata', 'sppb_raw_components_incomplete',
]);

const UNSUPPORTED = new Set<FunctionalCapacityReasonCode>([
  'unknown_source', 'source_unsupported', 'unverified_clinician_entry',
  'unverified_user_entry', 'self_report_not_measurement', 'wearable_not_validated_test',
  'passive_estimate_not_validated_test', 'exact_duplicate_not_active',
  'superseded_record_not_active',
]);

const PROTOCOL = new Set<FunctionalCapacityReasonCode>([
  'unknown_protocol', 'material_protocol_deviation', 'device_not_calibrated',
  'invalid_grip_attempt_count', 'invalid_grip_selection_rule', 'grip_pain_limited',
  'fast_gait_not_usual', 'moving_start_not_static', 'gait_course_not_overground',
  'invalid_gait_trial_rule', 'nonstandard_chair_height', 'arm_use_not_standard',
  'sppb_official_protocol_required',
]);

const INCOMPLETE = new Set<FunctionalCapacityReasonCode>([
  'test_incomplete', 'test_interrupted', 'test_not_completed',
  'physical_assistance_invalidates_standard',
]);

const SAFETY = new Set<FunctionalCapacityReasonCode>([
  'contraindication_present', 'acute_safety_event', 'six_mwt_supervision_required',
  'six_mwt_emergency_readiness_required', 'sppb_live_supervision_required',
]);

const RESEARCH = new Set<FunctionalCapacityReasonCode>([
  'source_research_only',
]);

const SPECIALTY = new Set<FunctionalCapacityReasonCode>([
  'specialty_protocol_only',
]);

const CONDITIONAL = new Set<FunctionalCapacityReasonCode>([
  'verified_extreme_preserved', 'unresolved_extreme_requires_review',
  'probable_duplicate_requires_reconciliation',
]);

const CUSTOM_EXPLANATIONS: Partial<Record<FunctionalCapacityReasonCode, string>> = {
  missing_test_identity: 'A stable Functional Capacity test identity is required and was not inferred.',
  unsupported_unit: 'The original unit is not authorized for the identified test.',
  material_protocol_deviation: 'A material deviation prevents representation as the registered standard protocol.',
  source_unsupported: 'The source class is unsupported for objective Functional Capacity measurement.',
  wearable_not_validated_test: 'A consumer wearable output is not an administered validated performance test.',
  test_incomplete: 'The test did not reach its required endpoint; the attempt remains auditable but has no completed standard result.',
  physical_assistance_invalidates_standard: 'Physical assistance materially changed performance and invalidates the standard endpoint.',
  six_mwt_supervision_required: 'The 6MWT requires Phase 6.0B-authorized qualified supervision.',
  six_mwt_emergency_readiness_required: 'The 6MWT setting lacks documented emergency readiness required by the governing protocol.',
  mixed_hands_not_allowed: 'Right and left grip observations must remain separate and cannot be combined.',
  generic_gait_not_four_meter_walk: 'A generic gait-speed record is not silently treated as the Four-Meter Walk.',
  sppb_endpoint_not_standalone_five_times: 'The SPPB fifth-standing chair endpoint cannot substitute for standalone fifth-return-to-sitting 5xSTS.',
  tug_mobility_only: 'TUG is authorized only as mobility context, not as a universal fall-risk or diagnostic result.',
  six_mwt_not_vo2max: 'Six-minute walk distance is not VO2max and no conversion is authorized.',
  sppb_total_not_vitalspan_generated: 'Vitalspan does not calculate, reconstruct, modify, or interpret an SPPB total.',
  five_times_no_normative_reference: 'Phase 6.0C version 1.0.0 authorizes no normative interpretation for standalone 5xSTS.',
  sppb_no_normative_reference: 'Phase 6.0C version 1.0.0 authorizes no Vitalspan normative interpretation for SPPB.',
  no_authorized_reference: 'No active reference exactly matches every required measurement and population field; no fallback was used.',
  published_percentile_authorized: 'The supplied published percentile is source-verified and matches the exact active reference.',
  percentile_unavailable: 'Normative percentile interpretation is unavailable and was not estimated.',
  trend_exact_match: 'All comparison-critical fields match exactly.',
  trend_conditional_match: 'Core comparison fields match, but an explicit permitted limitation requires conditional comparability.',
};

function severityFor(code: FunctionalCapacityReasonCode): FunctionalCapacityReasonSeverity {
  if (INVALID.has(code)) return 'blocking_invalid';
  if (INSUFFICIENT.has(code)) return 'blocking_insufficient';
  if (UNSUPPORTED.has(code)) return 'blocking_unsupported';
  if (PROTOCOL.has(code)) return 'blocking_protocol';
  if (INCOMPLETE.has(code)) return 'blocking_incomplete';
  if (SAFETY.has(code)) return 'blocking_safety';
  if (RESEARCH.has(code)) return 'research_restriction';
  if (SPECIALTY.has(code)) return 'clinical_specialty';
  if (CONDITIONAL.has(code)) return 'conditional';
  return 'informational';
}

function defaultExplanation(code: FunctionalCapacityReasonCode): string {
  const text = code.replace(/_/g, ' ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

export const FUNCTIONAL_CAPACITY_REASON_REGISTRY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.eligibilityPolicy,
  orderedCodes: FUNCTIONAL_CAPACITY_REASON_ORDER,
  definitions: FUNCTIONAL_CAPACITY_REASON_ORDER.map(code => ({
    code,
    defaultSeverity: severityFor(code),
    explanation: CUSTOM_EXPLANATIONS[code] ?? defaultExplanation(code),
  })),
});

export function reasonForFunctionalCapacity(
  code: FunctionalCapacityReasonCode,
  severity?: FunctionalCapacityReasonSeverity,
): FunctionalCapacityReason {
  const definition = FUNCTIONAL_CAPACITY_REASON_REGISTRY.definitions.find(item => item.code === code);
  if (!definition) throw new Error(`Unknown Functional Capacity reason code: ${code}.`);
  return {
    code,
    severity: severity ?? definition.defaultSeverity,
    explanation: definition.explanation,
  };
}

export function sortFunctionalCapacityReasons(
  reasons: readonly FunctionalCapacityReason[],
): readonly FunctionalCapacityReason[] {
  const byCode = new Map<FunctionalCapacityReasonCode, FunctionalCapacityReason>();
  reasons.forEach(reason => {
    if (!byCode.has(reason.code)) byCode.set(reason.code, reason);
  });
  return FUNCTIONAL_CAPACITY_REASON_ORDER.flatMap(code => {
    const reason = byCode.get(code);
    return reason ? [reason] : [];
  });
}
