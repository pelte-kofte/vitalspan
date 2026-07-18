import { classifyCardiometabolicConfidence } from './confidenceRegistry';
import type {
  CardiometabolicAuthorizedOutput,
  CardiometabolicBlockedOutput,
  CardiometabolicEligibilityResult,
  CardiometabolicEligibilityStatus,
  CardiometabolicMeasurementInput,
  CardiometabolicReason,
} from './contracts';
import { authorizeCardiometabolicInterpretation } from './interpretationAuthorization';
import { getCardiometabolicMeasurement } from './measurementRegistry';
import { matchCardiometabolicReference } from './referenceMatching';
import { reasonForCardiometabolic, sortCardiometabolicReasons } from './reasonRegistry';
import { evaluateCardiometabolicSafetyCandidate } from './safetyCandidate';
import { getCardiometabolicSource } from './sourceRegistry';
import { evaluateCardiometabolicTrendCompatibility } from './trendCompatibility';
import { validateCardiometabolicCommon, validateCardiometabolicFamily } from './validation';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export const CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS = Object.freeze([
  'cardiometabolic_health_score', 'cross_marker_composite', 'traffic_light_parent_status',
  'optimal_longevity_range', 'biological_age_adjustment', 'fitness_age',
  'individual_lifespan_prediction', 'individual_event_risk_prediction', 'ascvd_calculation',
  'score2', 'score2_op', 'qrisk', 'framingham_risk', 'metabolic_syndrome_diagnosis',
  'diabetes_diagnosis', 'prediabetes_diagnosis', 'hypertension_diagnosis',
  'familial_hypercholesterolemia_diagnosis', 'obesity_diagnosis', 'pancreatitis_diagnosis',
  'medication_initiation', 'medication_cessation', 'dose_recommendation',
  'individual_treatment_target', 'cross_marker_ranking', 'higher_is_always_better',
  'lower_is_always_better', 'lpa_unit_conversion', 'clinical_phenoage_modification',
  'composite_longevity_score',
] as const satisfies readonly CardiometabolicBlockedOutput[]);

const RAW_RETAINABLE = new Set([
  'unknown_fasting_status', 'missing_medication_context', 'missing_acute_illness_context',
  'missing_pregnancy_context', 'missing_clinical_history', 'pregnancy_exclusion',
  'hba1c_confounding_context', 'bp_series_incomplete', 'bp_multi_occasion_required',
  'nice_population_mismatch', 'adult_population_required',
]);

function statusFor(reasons: readonly CardiometabolicReason[], rawOnly: boolean, interpretationEligible: boolean, accepted: boolean, safety: string): CardiometabolicEligibilityStatus {
  if (reasons.some(reason => reason.severity === 'blocking_invalid')) return 'invalid';
  if (reasons.some(reason => reason.severity === 'blocking_source')) return reasons.some(reason => reason.code === 'source_unsupported') ? 'source_unsupported' : 'unsupported';
  if (reasons.some(reason => reason.severity === 'research_restriction')) return 'research_only';
  if (reasons.some(reason => reason.severity === 'blocking_assay')) return 'assay_mismatch';
  if (reasons.some(reason => reason.severity === 'blocking_protocol' && !RAW_RETAINABLE.has(reason.code))) return 'protocol_mismatch';
  if (!accepted) return 'insufficient_data';
  if (safety !== 'no_authorized_safety_candidate' && safety !== 'insufficient_safety_context') return 'safety_review_candidate';
  if (rawOnly) return 'measurement_accepted_raw_only';
  if (interpretationEligible) return reasons.some(reason => reason.severity === 'conditional') ? 'conditionally_eligible' : 'eligible';
  if (reasons.some(reason => RAW_RETAINABLE.has(reason.code))) return 'measurement_accepted_context_missing';
  return 'measurement_accepted_no_interpretation';
}

export function evaluateCardiometabolicEligibility(
  input: CardiometabolicMeasurementInput,
  compareTo: CardiometabolicMeasurementInput | null = null,
): CardiometabolicEligibilityResult {
  const definition = getCardiometabolicMeasurement(input.measurementId);
  const common = validateCardiometabolicCommon(input, definition);
  const reasons: CardiometabolicReason[] = [...common.reasons];
  if (definition) reasons.push(...validateCardiometabolicFamily(input, definition));
  if (definition?.interpretationMode === 'raw_and_trend_only') reasons.push(reasonForCardiometabolic('interpretation_raw_only'));
  reasons.push(reasonForCardiometabolic('diagnosis_blocked'), reasonForCardiometabolic('treatment_blocked'));

  const source = getCardiometabolicSource(input.sourceId);
  const initiallyOrdered = sortCardiometabolicReasons(reasons);
  const confidence = classifyCardiometabolicConfidence(source, input.verificationStatus, initiallyOrdered);
  const referenceDecision = definition
    ? matchCardiometabolicReference(input, definition, initiallyOrdered)
    : { status: 'ineligible' as const, referenceId: null, referenceVersion: null, policyId: null, reasons: [reasonForCardiometabolic('no_exact_reference')] };
  reasons.push(...referenceDecision.reasons);
  const interpretation = definition
    ? authorizeCardiometabolicInterpretation(input, definition, common.canonical, referenceDecision)
    : { eligible: false, availability: 'not_authorized' as const, authority: null, policyId: null, policyVersion: null, targetPopulation: null, interpretationType: null, contextLabel: null, requiredContext: [], limitations: ['Unknown measurement identity.'], diagnosticBoundary: 'No diagnosis is authorized.', treatmentBoundary: 'No treatment is authorized.' };
  if (interpretation.eligible && ['hba1c', 'fasting_plasma_glucose'].includes(definition?.id ?? '')) reasons.push(reasonForCardiometabolic('repeat_confirmation_required'));
  const safetyCandidate = evaluateCardiometabolicSafetyCandidate(input, definition, common.canonical, initiallyOrdered);
  reasons.push(...safetyCandidate.reasons);
  const ordered = sortCardiometabolicReasons(reasons);

  const hardBlocking = ordered.some(reason =>
    ['blocking_invalid', 'blocking_source', 'blocking_assay'].includes(reason.severity)
    || (['blocking_insufficient', 'blocking_protocol'].includes(reason.severity) && !RAW_RETAINABLE.has(reason.code)),
  );
  const measurementAccepted = Boolean(definition && common.canonical.conversionAuthorized && !hardBlocking && confidence !== 'CMH-CONF-X' && confidence !== 'CMH-CONF-Q');
  const measurementValid = Boolean(definition && common.canonical.conversionAuthorized && !ordered.some(reason => reason.severity === 'blocking_invalid'));
  const status = statusFor(ordered, definition?.interpretationMode === 'raw_and_trend_only', interpretation.eligible, measurementAccepted, safetyCandidate.status);
  const authorizedOutputs: CardiometabolicAuthorizedOutput[] = [];
  if (measurementAccepted) authorizedOutputs.push('validated_raw_measurement', 'canonical_unit', 'method_identity', 'provenance_summary', 'confidence', 'limitations', 'longitudinal_comparability_status');
  if (source && definition?.family !== 'blood_pressure' && definition?.family !== 'central_adiposity') authorizedOutputs.push('laboratory_reported_flag');
  if (interpretation.eligible) {
    authorizedOutputs.push('reference_identity_and_version');
    if (definition?.id === 'lipoprotein_a_molar' || definition?.id === 'lipoprotein_a_mass') authorizedOutputs.push('published_risk_enhancing_context');
    else if (definition?.family === 'blood_pressure') authorizedOutputs.push('protocol_specific_bp_interpretation');
    else authorizedOutputs.push('published_informational_screening_context');
    if (['hba1c', 'fasting_plasma_glucose'].includes(definition?.id ?? '')) authorizedOutputs.push('repeat_confirmation_requirement');
  }
  if (safetyCandidate.status !== 'no_authorized_safety_candidate' && safetyCandidate.status !== 'insufficient_safety_context') {
    authorizedOutputs.push('safety_review_candidate');
    if (safetyCandidate.status !== 'safety_candidate_symptom_context_required') authorizedOutputs.push('clinician_review_recommendation');
  }
  const uniqueOutputs = [...new Set(authorizedOutputs)];
  const trendComparability = compareTo ? evaluateCardiometabolicTrendCompatibility(input, compareTo) : null;
  const evaluationKey = [CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.domainSpecification, input.recordId, input.measurementId ?? 'missing', input.timestamps.measuredAt ?? 'missing', compareTo?.recordId ?? 'no-comparison'].join('|');
  return {
    measurementIdentity: definition?.id ?? null,
    status,
    reasonCodes: ordered.map(reason => reason.code),
    explanations: ordered.map(reason => reason.explanation),
    originalMeasurement: input,
    canonicalMeasurement: common.canonical,
    sourceClassification: source?.id ?? null,
    confidenceClassification: confidence,
    methodOrAssayIdentity: input.assay.methodId,
    protocolIdentity: input.protocol.protocolId,
    provenanceComplete: common.provenanceComplete,
    measurementValid,
    measurementAccepted,
    interpretation,
    referenceDecision,
    authorizedOutputs: uniqueOutputs,
    blockedOutputs: CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS,
    safetyCandidate,
    trendComparability,
    scientificVersions: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS,
    audit: {
      evaluationKey,
      originalInput: input,
      validationDecision: measurementValid ? 'valid' : 'not_valid',
      confidenceDecision: confidence,
      eligibilityDecision: status,
      referenceDecision,
      interpretationDecision: interpretation,
      safetyDecision: safetyCandidate,
      authorizedOutputs: uniqueOutputs,
      blockedOutputs: CARDIOMETABOLIC_ALWAYS_BLOCKED_OUTPUTS,
      orderedReasonCodes: ordered.map(reason => reason.code),
      registryVersions: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS,
    },
  };
}
