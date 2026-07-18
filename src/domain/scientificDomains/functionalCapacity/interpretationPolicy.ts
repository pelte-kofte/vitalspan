import type {
  FunctionalCapacityInterpretationDecision,
  FunctionalCapacityMeasurementInput,
  FunctionalCapacityReason,
  FunctionalCapacityReferenceDecision,
} from './contracts';
import { reasonForFunctionalCapacity, sortFunctionalCapacityReasons } from './reasonRegistry';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export const FUNCTIONAL_CAPACITY_INTERPRETATION_POLICY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.interpretationPolicy,
  permitsCalculatedPercentile: false,
  permitsSilentPercentileEstimation: false,
  permitsNamedPerformanceCategories: false,
  permitsDiagnosticThresholdRelabeling: false,
  standaloneFiveTimesNormativeInterpretation: false,
  sppbNormativeInterpretation: false,
  publishedProtocolOutputsMayBePreserved: true,
});

export function evaluateFunctionalCapacityInterpretation(
  input: FunctionalCapacityMeasurementInput,
  referenceDecision: FunctionalCapacityReferenceDecision,
  measurementAccepted: boolean,
  conditionalMeasurement: boolean,
  researchOnly: boolean,
  publishedProtocolOutputAuthorized: boolean,
): { decision: FunctionalCapacityInterpretationDecision; reasons: readonly FunctionalCapacityReason[] } {
  const reasons: FunctionalCapacityReason[] = [];
  if (researchOnly) {
    return {
      decision: { availability: 'research_only', publishedPercentile: null, reference: null, reasonCodes: [], policyVersion: FUNCTIONAL_CAPACITY_INTERPRETATION_POLICY.version },
      reasons,
    };
  }
  if (!measurementAccepted) {
    return {
      decision: { availability: 'unavailable', publishedPercentile: null, reference: null, reasonCodes: [], policyVersion: FUNCTIONAL_CAPACITY_INTERPRETATION_POLICY.version },
      reasons,
    };
  }
  if (input.testId === 'five_times_sit_to_stand') reasons.push(reasonForFunctionalCapacity('five_times_no_normative_reference'));
  if (input.testId === 'short_physical_performance_battery') reasons.push(reasonForFunctionalCapacity('sppb_no_normative_reference'));
  if (referenceDecision.status !== 'eligible' || referenceDecision.reference === null) {
    reasons.push(reasonForFunctionalCapacity('percentile_unavailable'));
    const availability = publishedProtocolOutputAuthorized
      ? 'published_protocol_output_only' as const
      : conditionalMeasurement ? 'conditional_measurement_context' as const : 'measurement_context_only' as const;
    const sorted = sortFunctionalCapacityReasons(reasons);
    return {
      decision: { availability, publishedPercentile: null, reference: null, reasonCodes: sorted.map(item => item.code), policyVersion: FUNCTIONAL_CAPACITY_INTERPRETATION_POLICY.version },
      reasons: sorted,
    };
  }
  const supplied = input.publishedPercentile;
  if (supplied === null) {
    reasons.push(reasonForFunctionalCapacity('percentile_unavailable'));
    const sorted = sortFunctionalCapacityReasons(reasons);
    return {
      decision: { availability: 'reference_eligible_percentile_not_supplied', publishedPercentile: null, reference: referenceDecision.reference, reasonCodes: sorted.map(item => item.code), policyVersion: FUNCTIONAL_CAPACITY_INTERPRETATION_POLICY.version },
      reasons: sorted,
    };
  }
  if (supplied.referenceId !== referenceDecision.reference.id
    || supplied.referenceVersion !== referenceDecision.reference.version
    || supplied.sourceValueMatchVerified !== true
    || !supplied.sourceTableIdentifier?.trim()) reasons.push(reasonForFunctionalCapacity('percentile_source_unverified'));
  if (!Number.isFinite(supplied.percentile) || supplied.percentile <= 0 || supplied.percentile >= 100) {
    reasons.push(reasonForFunctionalCapacity('percentile_value_invalid'));
  }
  const authorized = reasons.length === 0;
  if (authorized) reasons.push(reasonForFunctionalCapacity('published_percentile_authorized'));
  else reasons.push(reasonForFunctionalCapacity('percentile_unavailable'));
  const sorted = sortFunctionalCapacityReasons(reasons);
  return {
    decision: {
      availability: authorized ? 'published_percentile_authorized' : 'reference_eligible_percentile_not_supplied',
      publishedPercentile: authorized ? supplied.percentile : null,
      reference: referenceDecision.reference,
      reasonCodes: sorted.map(item => item.code),
      policyVersion: FUNCTIONAL_CAPACITY_INTERPRETATION_POLICY.version,
    },
    reasons: sorted,
  };
}
