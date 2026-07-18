import type { Vo2MaxReason, Vo2MaxReasonCode, Vo2MaxReasonSeverity } from './contracts';
import { VO2MAX_SCIENTIFIC_VERSIONS } from './versions';

interface ReasonDefinition {
  code: Vo2MaxReasonCode;
  defaultSeverity: Vo2MaxReasonSeverity;
  explanation: string;
}

export const VO2MAX_REASON_REGISTRY = Object.freeze({
  version: VO2MAX_SCIENTIFIC_VERSIONS.eligibilityPolicy,
  definitions: [
    { code: 'missing_value', defaultSeverity: 'blocking_insufficient', explanation: 'A VO2max-domain value is required.' },
    { code: 'non_finite_value', defaultSeverity: 'blocking_invalid', explanation: 'The value must be a finite number.' },
    { code: 'non_positive_value', defaultSeverity: 'blocking_invalid', explanation: 'The value must be greater than zero.' },
    { code: 'unsupported_unit', defaultSeverity: 'blocking_invalid', explanation: 'The original unit cannot be normalized to the canonical mass-normalized oxygen-uptake unit.' },
    { code: 'source_range_violation', defaultSeverity: 'blocking_invalid', explanation: 'The value is outside the source feature’s documented representable range.' },
    { code: 'extreme_value_requires_review', defaultSeverity: 'conditional', explanation: 'The value is outside the general plausibility interval and requires source-report review.' },
    { code: 'missing_timestamp', defaultSeverity: 'blocking_insufficient', explanation: 'The measurement event date or timestamp is required.' },
    { code: 'invalid_timestamp', defaultSeverity: 'blocking_invalid', explanation: 'The measurement timestamp is invalid or lacks an explicit offset.' },
    { code: 'missing_ingestion_timestamp', defaultSeverity: 'blocking_insufficient', explanation: 'The ingestion timestamp is required for auditability.' },
    { code: 'invalid_ingestion_timestamp', defaultSeverity: 'blocking_invalid', explanation: 'The ingestion timestamp is invalid or lacks an explicit offset.' },
    { code: 'missing_source', defaultSeverity: 'blocking_insufficient', explanation: 'An identifiable originating measurement source is required.' },
    { code: 'unknown_source', defaultSeverity: 'blocking_unsupported', explanation: 'The source is not present in the active measurement source registry.' },
    { code: 'missing_test_type', defaultSeverity: 'blocking_insufficient', explanation: 'The scientific test or estimation type is required.' },
    { code: 'missing_endpoint', defaultSeverity: 'blocking_insufficient', explanation: 'VO2max and VO2peak must be explicitly distinguished.' },
    { code: 'endpoint_source_mismatch', defaultSeverity: 'blocking_invalid', explanation: 'The endpoint contradicts the registered source method.' },
    { code: 'missing_modality', defaultSeverity: 'blocking_insufficient', explanation: 'The exercise or estimation modality required by this source is missing.' },
    { code: 'modality_source_mismatch', defaultSeverity: 'blocking_invalid', explanation: 'The recorded modality is incompatible with the registered source method.' },
    { code: 'measurement_nature_mismatch', defaultSeverity: 'blocking_invalid', explanation: 'Direct measurement, estimate, and transcription status contradict the source registry.' },
    { code: 'direct_gas_not_verified', defaultSeverity: 'blocking_invalid', explanation: 'A direct CPET source requires documented respiratory gas analysis.' },
    { code: 'maximality_not_documented', defaultSeverity: 'blocking_insufficient', explanation: 'VO2max requires documented evidence supporting attainment of a maximum.' },
    { code: 'symptom_limitation_not_documented', defaultSeverity: 'blocking_insufficient', explanation: 'A symptom-limited VO2peak result requires its symptom limitation and termination context.' },
    { code: 'missing_provider_identity', defaultSeverity: 'blocking_insufficient', explanation: 'The laboratory, organization, application, or device provider is not identifiable.' },
    { code: 'missing_source_record_id', defaultSeverity: 'blocking_insufficient', explanation: 'A stable originating sample or source record identifier is required.' },
    { code: 'missing_report_identity', defaultSeverity: 'blocking_insufficient', explanation: 'The original clinical or laboratory report identity is required.' },
    { code: 'missing_direct_cpet_quality', defaultSeverity: 'blocking_insufficient', explanation: 'Direct CPET calibration, quality control, protocol, or averaging evidence is incomplete.' },
    { code: 'provenance_incomplete', defaultSeverity: 'blocking_insufficient', explanation: 'Required scientific provenance is incomplete and was not inferred.' },
    { code: 'healthkit_origin_unverified', defaultSeverity: 'blocking_unsupported', explanation: 'HealthKit is a container; unresolved origin and method are unsupported.' },
    { code: 'clinician_source_unverified', defaultSeverity: 'blocking_unsupported', explanation: 'Clinician entry does not establish the underlying measurement method without a verified report.' },
    { code: 'user_entry_unverified', defaultSeverity: 'blocking_unsupported', explanation: 'An unverified user-entered number is not a scientific measurement source.' },
    { code: 'exact_duplicate_not_active', defaultSeverity: 'blocking_unsupported', explanation: 'An exact re-import must not create a second active scientific measurement.' },
    { code: 'probable_duplicate_requires_reconciliation', defaultSeverity: 'conditional', explanation: 'A probable same-event duplicate requires reconciliation before reference interpretation.' },
    { code: 'superseded_record_not_active', defaultSeverity: 'blocking_unsupported', explanation: 'A superseded record remains auditable but is not an active scientific measurement.' },
    { code: 'source_correction_preserved', defaultSeverity: 'informational', explanation: 'The source correction is preserved as a new linked record.' },
    { code: 'research_source_restricted', defaultSeverity: 'informational', explanation: 'The source is restricted to segregated research use.' },
    { code: 'missing_birth_date_for_reference', defaultSeverity: 'informational', explanation: 'Age at measurement cannot be derived, so normative reference matching is unavailable.' },
    { code: 'invalid_birth_date', defaultSeverity: 'blocking_invalid', explanation: 'The recorded birth date is invalid.' },
    { code: 'age_not_derivable', defaultSeverity: 'informational', explanation: 'Age at measurement is not scientifically derivable from the supplied dates.' },
    { code: 'age_outside_reference_range', defaultSeverity: 'informational', explanation: 'Age at measurement is outside the active reference range; no extrapolation is permitted.' },
    { code: 'missing_source_recorded_sex_for_reference', defaultSeverity: 'informational', explanation: 'The source-recorded sex required by the reference is unavailable and was not inferred.' },
    { code: 'sex_not_supported_by_reference', defaultSeverity: 'informational', explanation: 'The available source-recorded sex has no supported stratum in the active reference.' },
    { code: 'missing_region_for_reference', defaultSeverity: 'informational', explanation: 'Country or region compatibility is not explicit, so reference matching is unavailable.' },
    { code: 'region_not_supported_by_reference', defaultSeverity: 'informational', explanation: 'The active reference does not represent the recorded country or region; no nearest-region fallback is permitted.' },
    { code: 'health_population_not_supported_by_reference', defaultSeverity: 'informational', explanation: 'The measurement population does not match the active apparently healthy reference.' },
    { code: 'measurement_class_not_supported_by_reference', defaultSeverity: 'informational', explanation: 'The measurement confidence or method is not authorized for this direct-CPET reference.' },
    { code: 'endpoint_not_supported_by_reference', defaultSeverity: 'informational', explanation: 'The endpoint does not match the active reference definition.' },
    { code: 'modality_not_supported_by_reference', defaultSeverity: 'informational', explanation: 'The modality does not match an active reference stratum; no modality fallback is permitted.' },
    { code: 'reference_version_unavailable', defaultSeverity: 'informational', explanation: 'The requested reference identifier or version is unavailable or inactive.' },
    { code: 'estimate_not_reference_eligible', defaultSeverity: 'informational', explanation: 'Estimated values cannot use a directly measured CPET percentile reference.' },
    { code: 'no_authorized_reference', defaultSeverity: 'informational', explanation: 'No authorized reference exactly matches the measurement and population.' },
    { code: 'reference_exact_match', defaultSeverity: 'informational', explanation: 'The measurement exactly matches the active reference population and method requirements.' },
    { code: 'percentile_authorized', defaultSeverity: 'informational', explanation: 'Source-bound percentile lookup is authorized; this eligibility engine does not calculate the percentile value.' },
    { code: 'percentile_unavailable', defaultSeverity: 'informational', explanation: 'Percentile interpretation is unavailable and no fallback was used.' },
  ] as const satisfies readonly ReasonDefinition[],
});

export const VO2MAX_REASON_ORDER = VO2MAX_REASON_REGISTRY.definitions.map(item => item.code);

export function reasonFor(
  code: Vo2MaxReasonCode,
  severity?: Vo2MaxReasonSeverity,
): Vo2MaxReason {
  const definition = VO2MAX_REASON_REGISTRY.definitions.find(item => item.code === code);
  if (!definition) throw new Error(`Unknown VO2max reason code: ${code}.`);
  return {
    code,
    severity: severity ?? definition.defaultSeverity,
    explanation: definition.explanation,
  };
}

export function sortVo2MaxReasons(reasons: readonly Vo2MaxReason[]): readonly Vo2MaxReason[] {
  const byCode = new Map<Vo2MaxReasonCode, Vo2MaxReason>();
  reasons.forEach(reason => {
    if (!byCode.has(reason.code)) byCode.set(reason.code, reason);
  });
  return VO2MAX_REASON_ORDER.flatMap(code => {
    const reason = byCode.get(code);
    return reason ? [reason] : [];
  });
}

