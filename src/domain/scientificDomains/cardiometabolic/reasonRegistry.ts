import type { CardiometabolicReason, CardiometabolicReasonCode, CardiometabolicReasonSeverity } from './contracts';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export const CARDIOMETABOLIC_REASON_ORDER = [
  'missing_measurement_identity', 'unknown_measurement_identity', 'measurement_standard_mismatch',
  'missing_value', 'non_finite_value', 'non_positive_value', 'impossible_blood_pressure_structure',
  'unsupported_unit', 'unit_conversion_not_authorized', 'lpa_unit_mismatch',
  'missing_timestamp', 'invalid_timestamp', 'missing_ingestion_timestamp', 'invalid_ingestion_timestamp',
  'missing_source', 'unknown_source', 'source_unsupported', 'source_research_only',
  'missing_ingestion_method', 'missing_provider_identity', 'missing_source_record_id',
  'missing_verification_status', 'verification_not_accepted', 'provenance_incomplete',
  'unverified_manual_entry', 'container_origin_missing', 'exact_duplicate_not_active',
  'probable_duplicate_requires_reconciliation', 'historical_correction_retained',
  'missing_assay_identity', 'unknown_assay_identity', 'assay_measurement_mismatch',
  'assay_traceability_missing', 'assay_certification_missing', 'assay_mismatch',
  'missing_protocol_identity', 'unknown_protocol_identity', 'protocol_measurement_mismatch',
  'protocol_adherence_unknown', 'protocol_mismatch',
  'missing_fasting_status', 'unknown_fasting_status', 'fasting_duration_insufficient',
  'missing_medication_context', 'missing_acute_illness_context', 'missing_pregnancy_context',
  'missing_clinical_history', 'pregnancy_exclusion', 'hba1c_confounding_context',
  'invalid_ldl_calculation_context', 'ldl_source_analytes_missing', 'derived_lineage_incomplete',
  'random_glucose_not_fpg', 'glycolysis_control_missing', 'venous_plasma_required',
  'bp_device_unvalidated', 'cuffless_bp_unsupported', 'upper_arm_cuff_required',
  'cuff_size_missing', 'bp_series_incomplete', 'bp_multi_occasion_required',
  'waist_lineage_incomplete', 'waist_landmark_mismatch', 'self_reported_height_unsupported',
  'height_timestamp_incompatible', 'adult_population_required', 'nice_population_mismatch',
  'interpretation_raw_only', 'reference_not_requested', 'no_exact_reference', 'reference_exact_match',
  'repeat_confirmation_required', 'diagnosis_blocked', 'treatment_blocked',
  'safety_context_incomplete', 'safety_candidate_boundary_met', 'no_authorized_glucose_safety_boundary',
  'trend_same_record', 'trend_measurement_mismatch', 'trend_unit_mismatch', 'trend_assay_mismatch',
  'trend_calculation_method_mismatch', 'trend_fasting_mismatch', 'trend_context_mismatch',
  'trend_protocol_mismatch', 'trend_device_mismatch', 'trend_series_mismatch',
  'trend_landmark_mismatch', 'trend_lineage_mismatch', 'trend_metadata_missing',
  'trend_exact_match', 'trend_conditional_match',
] as const satisfies readonly CardiometabolicReasonCode[];

const GROUPS: Record<CardiometabolicReasonSeverity, ReadonlySet<CardiometabolicReasonCode>> = {
  blocking_invalid: new Set(['unknown_measurement_identity', 'measurement_standard_mismatch', 'non_finite_value', 'non_positive_value', 'impossible_blood_pressure_structure', 'unsupported_unit', 'unit_conversion_not_authorized', 'lpa_unit_mismatch', 'invalid_timestamp', 'invalid_ingestion_timestamp', 'random_glucose_not_fpg']),
  blocking_insufficient: new Set(['missing_measurement_identity', 'missing_value', 'missing_timestamp', 'missing_ingestion_timestamp', 'missing_ingestion_method', 'missing_provider_identity', 'missing_source_record_id', 'missing_verification_status', 'provenance_incomplete', 'missing_assay_identity', 'missing_protocol_identity', 'missing_fasting_status', 'missing_medication_context', 'missing_acute_illness_context', 'missing_pregnancy_context', 'missing_clinical_history', 'ldl_source_analytes_missing', 'derived_lineage_incomplete', 'glycolysis_control_missing', 'venous_plasma_required', 'cuff_size_missing', 'bp_series_incomplete', 'bp_multi_occasion_required', 'waist_lineage_incomplete', 'trend_metadata_missing']),
  blocking_source: new Set(['missing_source', 'unknown_source', 'source_unsupported', 'verification_not_accepted', 'unverified_manual_entry', 'container_origin_missing', 'exact_duplicate_not_active']),
  blocking_assay: new Set(['unknown_assay_identity', 'assay_measurement_mismatch', 'assay_traceability_missing', 'assay_certification_missing', 'assay_mismatch', 'invalid_ldl_calculation_context']),
  blocking_protocol: new Set(['unknown_protocol_identity', 'protocol_measurement_mismatch', 'protocol_adherence_unknown', 'protocol_mismatch', 'fasting_duration_insufficient', 'bp_device_unvalidated', 'cuffless_bp_unsupported', 'upper_arm_cuff_required', 'waist_landmark_mismatch', 'self_reported_height_unsupported', 'height_timestamp_incompatible']),
  blocking_interpretation: new Set(['unknown_fasting_status', 'pregnancy_exclusion', 'hba1c_confounding_context', 'adult_population_required', 'nice_population_mismatch', 'no_exact_reference', 'safety_context_incomplete', 'trend_measurement_mismatch', 'trend_unit_mismatch', 'trend_assay_mismatch', 'trend_calculation_method_mismatch', 'trend_context_mismatch', 'trend_protocol_mismatch', 'trend_device_mismatch', 'trend_series_mismatch', 'trend_landmark_mismatch', 'trend_lineage_mismatch']),
  research_restriction: new Set(['source_research_only']),
  conditional: new Set(['probable_duplicate_requires_reconciliation', 'trend_fasting_mismatch', 'trend_conditional_match']),
  informational: new Set(),
};

const EXPLANATIONS: Partial<Record<CardiometabolicReasonCode, string>> = {
  unknown_measurement_identity: 'The supplied identity is not registered and was not inferred or substituted.',
  measurement_standard_mismatch: 'The stable Phase 7.0B measurement-standard identity does not match the measurement.',
  unsupported_unit: 'The original unit is not authorized for this measurement identity.',
  lpa_unit_mismatch: 'Lipoprotein(a) mass and molar identities are not convertible or interchangeable.',
  provenance_incomplete: 'Required source provenance is incomplete; application state does not supply scientific evidence.',
  unverified_manual_entry: 'Manual entry is not treated as verified merely because a user or clinician entered it.',
  assay_traceability_missing: 'Required assay traceability or standardization metadata is absent.',
  invalid_ldl_calculation_context: 'The declared LDL calculation method is not valid for the supplied context.',
  hba1c_confounding_context: 'A declared red-cell, hemoglobin, transfusion, pregnancy, or related context blocks ordinary HbA1c interpretation.',
  random_glucose_not_fpg: 'A non-venous-plasma or random glucose value cannot be represented as fasting plasma glucose.',
  cuffless_bp_unsupported: 'A cuffless estimate is not an authorized cuff blood-pressure measurement.',
  bp_series_incomplete: 'The repeated-reading series required for this interpretation is incomplete; a valid reading may remain raw only.',
  waist_lineage_incomplete: 'Waist-to-height ratio requires verified waist and measured-height lineage with compatible timestamps.',
  interpretation_raw_only: 'Phase 7.0C authorizes the measurement as raw value and comparability-qualified trend only.',
  no_exact_reference: 'No active reference exactly matches the requested identity, version, population, method, and protocol; no fallback was used.',
  repeat_confirmation_required: 'The published context requires clinical repeat confirmation and does not authorize diagnosis from this value.',
  diagnosis_blocked: 'Disease diagnosis is outside this domain and remains blocked.',
  treatment_blocked: 'Treatment advice, targets, medication changes, and dose decisions remain blocked.',
  safety_candidate_boundary_met: 'A documented candidate boundary was met; this is not a diagnosis, production alert, or emergency disposition.',
  no_authorized_glucose_safety_boundary: 'Phase 7.0C authorizes no universal glucose safety boundary.',
  trend_measurement_mismatch: 'Distinct measurement identities are not longitudinally interchangeable.',
  trend_exact_match: 'All comparison-critical identity, method, protocol, context, and lineage fields match.',
  trend_conditional_match: 'Core identity and method fields match, with a documented permitted comparability limitation.',
};

function severityFor(code: CardiometabolicReasonCode): CardiometabolicReasonSeverity {
  for (const [severity, codes] of Object.entries(GROUPS) as [CardiometabolicReasonSeverity, ReadonlySet<CardiometabolicReasonCode>][]) {
    if (codes.has(code)) return severity;
  }
  return 'informational';
}

export const CARDIOMETABOLIC_REASON_REGISTRY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.reasonRegistry,
  orderedCodes: CARDIOMETABOLIC_REASON_ORDER,
  definitions: CARDIOMETABOLIC_REASON_ORDER.map(code => ({ code, defaultSeverity: severityFor(code), explanation: EXPLANATIONS[code] ?? `${code.replace(/_/g, ' ')}.` })),
});

export function reasonForCardiometabolic(code: CardiometabolicReasonCode, severity?: CardiometabolicReasonSeverity): CardiometabolicReason {
  const definition = CARDIOMETABOLIC_REASON_REGISTRY.definitions.find(item => item.code === code);
  if (!definition) throw new Error(`Unknown Cardiometabolic reason code: ${code}.`);
  return { code, severity: severity ?? definition.defaultSeverity, explanation: definition.explanation };
}

export function sortCardiometabolicReasons(reasons: readonly CardiometabolicReason[]): readonly CardiometabolicReason[] {
  const unique = new Map(reasons.map(reason => [reason.code, reason]));
  return CARDIOMETABOLIC_REASON_ORDER.flatMap(code => unique.has(code) ? [unique.get(code)!] : []);
}
