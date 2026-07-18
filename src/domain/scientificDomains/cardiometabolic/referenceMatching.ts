import type {
  CardiometabolicMeasurementInput,
  CardiometabolicReason,
  CardiometabolicReferenceDecision,
} from './contracts';
import type { CardiometabolicMeasurementDefinition } from './measurementRegistry';
import { getCardiometabolicInterpretationPolicy } from './interpretationPolicyRegistry';
import { reasonForCardiometabolic, sortCardiometabolicReasons } from './reasonRegistry';
import { getCardiometabolicReference } from './referenceRegistry';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export const CARDIOMETABOLIC_REFERENCE_MATCHING_POLICY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.populationMatchingPolicy,
  permitsGlobalFallback: false,
  permitsNearestRegionFallback: false,
  permitsSexFallback: false,
  permitsPregnancyFallback: false,
  permitsMissingHistoryFallback: false,
  permitsAssayFallback: false,
  permitsDirectCalculatedLdlSubstitution: false,
  permitsLpaUnitConversion: false,
  permitsBloodPressureSettingSubstitution: false,
  permitsSingleReadingSeriesSubstitution: false,
  permitsWaistProtocolSubstitution: false,
  permitsPediatricAdultFallback: false,
  permitsTreatmentTargetFallback: false,
});

export function matchCardiometabolicReference(
  input: CardiometabolicMeasurementInput,
  definition: CardiometabolicMeasurementDefinition,
  validationReasons: readonly CardiometabolicReason[],
): CardiometabolicReferenceDecision {
  const requested = input.requestedInterpretation;
  const policy = requested ? getCardiometabolicInterpretationPolicy(requested.policyId) : null;
  const reasons: CardiometabolicReason[] = [];

  if (!requested) {
    reasons.push(reasonForCardiometabolic('reference_not_requested'));
    return { status: 'not_requested', referenceId: null, referenceVersion: null, policyId: null, reasons };
  }
  const reference = getCardiometabolicReference(requested.referenceId, requested.referenceVersion);
  const interpretationBlock = validationReasons.some(reason => [
    'blocking_invalid', 'blocking_insufficient', 'blocking_source', 'blocking_assay',
    'blocking_protocol', 'blocking_interpretation', 'research_restriction',
  ].includes(reason.severity));
  const exact = Boolean(
    policy && reference && reference.activation === 'active_conditional'
    && policy.measurementId === definition.id
    && policy.mode === 'conditional_exact_match'
    && policy.referenceIds.includes(reference.id)
    && reference.measurements.includes(definition.id)
    && reference.region === input.population.guidelineRegion
    && !interpretationBlock,
  );
  reasons.push(reasonForCardiometabolic(exact ? 'reference_exact_match' : 'no_exact_reference'));
  return {
    status: exact ? 'exact_match' : 'ineligible',
    referenceId: reference?.id ?? requested.referenceId,
    referenceVersion: reference?.version ?? requested.referenceVersion,
    policyId: policy?.id ?? requested.policyId,
    reasons: sortCardiometabolicReasons(reasons),
  };
}
