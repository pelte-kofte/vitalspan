import type {
  CardiometabolicCanonicalMeasurement,
  CardiometabolicInterpretationDecision,
  CardiometabolicMeasurementInput,
  CardiometabolicReferenceDecision,
} from './contracts';
import type { CardiometabolicMeasurementDefinition } from './measurementRegistry';
import { getDefaultCardiometabolicInterpretationPolicy } from './interpretationPolicyRegistry';
import { getCardiometabolicReference } from './referenceRegistry';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

function contextLabel(
  input: CardiometabolicMeasurementInput,
  definition: CardiometabolicMeasurementDefinition,
  canonical: CardiometabolicCanonicalMeasurement,
): string | null {
  const value = canonical.value;
  if (definition.id === 'ldl_c_direct' || definition.id === 'ldl_c_calculated') {
    return value !== null && value >= 4.9 ? 'published clinician-review threshold context' : 'published lipid informational context';
  }
  if (definition.id === 'triglycerides' && value !== null) {
    if (value >= 11.3 || (input.numeric?.unit === 'mg/dL' && (input.numeric.value ?? 0) >= 1000)) return 'published severe triglyceride clinician-review context';
    if (value >= 5.6) return 'published clinician-review threshold context';
    if (input.context.fastingStatus === 'fasting') return value >= 1.7 ? 'published fasting risk-enhancing context' : 'published fasting informational context';
    if (input.context.fastingStatus === 'non_fasting') return value >= 2 ? 'published non-fasting screening context' : 'published non-fasting informational context';
    return 'published fasting-state-specific informational context';
  }
  if (definition.id === 'lipoprotein_a_molar' && value !== null) {
    return value >= 125 ? 'published elevated unit-specific risk-enhancing context' : value >= 75 ? 'published intermediate unit-specific context' : 'published lower unit-specific context';
  }
  if (definition.id === 'lipoprotein_a_mass' && value !== null) {
    return value >= 50 ? 'published elevated unit-specific risk-enhancing context' : value >= 30 ? 'published intermediate unit-specific context' : 'published lower unit-specific context';
  }
  if (definition.id === 'hba1c' && value !== null) {
    const boundary = input.population.guidelineRegion === 'UK' ? 42 : 39;
    return value >= 48 ? 'published threshold-crossing screening context; repeat confirmation required' : value >= boundary ? 'published intermediate screening context; repeat confirmation required' : 'published informational screening context';
  }
  if (definition.id === 'fasting_plasma_glucose' && value !== null) {
    const boundary = input.population.guidelineRegion === 'US' ? 5.6 : 6.1;
    return value >= 7 ? 'published threshold-crossing screening context; repeat confirmation required' : value >= boundary ? 'published intermediate screening context; repeat confirmation required' : 'published informational screening context';
  }
  if (definition.family === 'blood_pressure') return 'published repeated protocol-specific blood-pressure context';
  if (definition.id === 'waist_to_height_ratio' && value !== null) {
    return value >= 0.6 ? 'published NICE upper central-adiposity context' : value >= 0.5 ? 'published NICE increased central-adiposity context' : value >= 0.4 ? 'published NICE lower central-adiposity context' : null;
  }
  return null;
}

export function authorizeCardiometabolicInterpretation(
  input: CardiometabolicMeasurementInput,
  definition: CardiometabolicMeasurementDefinition,
  canonical: CardiometabolicCanonicalMeasurement,
  referenceDecision: CardiometabolicReferenceDecision,
): CardiometabolicInterpretationDecision {
  const policy = getDefaultCardiometabolicInterpretationPolicy(definition.id);
  const base = {
    policyId: policy.id,
    policyVersion: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.interpretationPolicyRegistry,
    requiredContext: [] as string[],
    limitations: [policy.diagnosticBoundary, policy.treatmentBoundary],
    diagnosticBoundary: policy.diagnosticBoundary,
    treatmentBoundary: policy.treatmentBoundary,
  };
  if (policy.mode === 'raw_and_trend_only') {
    return { eligible: false, availability: 'raw_only', authority: null, targetPopulation: null, interpretationType: policy.interpretationType, contextLabel: null, ...base };
  }
  if (referenceDecision.status !== 'exact_match') {
    return { eligible: false, availability: referenceDecision.status === 'not_requested' ? 'not_authorized' : 'context_missing', authority: null, targetPopulation: null, interpretationType: policy.interpretationType, contextLabel: null, ...base };
  }
  const reference = getCardiometabolicReference(referenceDecision.referenceId, referenceDecision.referenceVersion);
  const label = contextLabel(input, definition, canonical);
  if ((definition.id === 'ldl_c_direct' || definition.id === 'ldl_c_calculated') && (canonical.value === null || canonical.value < 4.9)) {
    return { eligible: false, availability: 'raw_only', authority: reference?.authority ?? null, targetPopulation: reference?.targetPopulation ?? null, interpretationType: policy.interpretationType, contextLabel: null, ...base };
  }
  if (definition.id === 'waist_to_height_ratio' && label === null) {
    return { eligible: false, availability: 'context_missing', authority: reference?.authority ?? null, targetPopulation: reference?.targetPopulation ?? null, interpretationType: policy.interpretationType, contextLabel: null, ...base };
  }
  const repeatConfirmation = ['hba1c', 'fasting_plasma_glucose'].includes(definition.id);
  return {
    eligible: true,
    availability: 'authorized',
    authority: reference?.authority ?? null,
    targetPopulation: reference?.targetPopulation ?? null,
    interpretationType: policy.interpretationType,
    contextLabel: label,
    ...base,
    requiredContext: repeatConfirmation ? ['Clinical repeat confirmation when the source guideline requires it.'] : [],
  };
}
