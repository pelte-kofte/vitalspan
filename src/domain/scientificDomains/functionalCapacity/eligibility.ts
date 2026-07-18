import type {
  FunctionalCapacityAuthorizedOutput,
  FunctionalCapacityBlockedOutput,
  FunctionalCapacityEligibilityResult,
  FunctionalCapacityEligibilityStatus,
  FunctionalCapacityMeasurementInput,
  FunctionalCapacityProhibitedOutput,
  FunctionalCapacityReason,
} from './contracts';
import { classifyFunctionalCapacityConfidence } from './confidenceRegistry';
import { evaluateFunctionalCapacityInterpretation } from './interpretationPolicy';
import { sortFunctionalCapacityReasons } from './reasonRegistry';
import { evaluateFunctionalCapacityReferenceEligibility } from './referenceMatching';
import { validateFunctionalCapacityMeasurement } from './validation';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export const FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS = [
  'overall_functional_capacity_score', 'cross_test_ranking', 'qualitative_performance_category',
  'universal_performance_category', 'mortality_threshold', 'lifespan_prediction',
  'biological_age', 'fitness_age', 'frailty_diagnosis', 'sarcopenia_diagnosis',
  'fall_risk_diagnosis', 'disease_diagnosis', 'treatment_recommendation',
  'exercise_prescription', 'composite_longevity_score', 'clinician_assessment_replacement',
  'six_mwt_to_vo2max_conversion', 'cross_test_substitution',
] as const satisfies readonly FunctionalCapacityProhibitedOutput[];

export const FUNCTIONAL_CAPACITY_ELIGIBILITY_POLICY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.eligibilityPolicy,
  failClosed: true,
  aiScientificDecisioningAllowed: false,
  potentialAuthorizedOutputs: [
    'audit_record', 'validated_raw_measurement', 'canonical_unit', 'test_identity',
    'protocol_identity', 'source_provenance_summary', 'measurement_confidence',
    'completion_status', 'reference_identity', 'published_percentile',
    'published_protocol_output', 'limitations', 'interpretation_availability',
    'trend_compatibility', 'research_record',
  ] as const satisfies readonly FunctionalCapacityAuthorizedOutput[],
  prohibitedOutputs: FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS,
});

const STATUS_EXPLANATIONS: Readonly<Record<FunctionalCapacityEligibilityStatus, string>> = {
  eligible: 'The measurement is accepted and exactly matches an active authorized reference.',
  conditionally_eligible: 'The measurement is accepted only with explicit limitations; no unsupported inference is authorized.',
  measurement_accepted_no_reference: 'The measurement is accepted, but no exact authorized normative reference is available.',
  protocol_mismatch: 'The record conflicts with the named protocol and cannot represent its standard endpoint.',
  research_only: 'The record is restricted to segregated research use.',
  clinical_specialty: 'The measurement is retained only as a named clinical-specialty protocol and has no general reference interpretation.',
  unsupported: 'The source or record is unsupported as an objective Functional Capacity measurement.',
  invalid: 'The record contains an invalid or contradictory scientific value, unit, timestamp, test, or endpoint.',
  incomplete: 'The attempt did not produce the complete standard endpoint.',
  insufficient_data: 'Required identity, protocol, provenance, equipment, or context is missing and was not inferred.',
  safety_requirements_not_met: 'Required safety screening, supervision, monitoring, or emergency readiness was not met.',
};

function hasSeverity(reasons: readonly FunctionalCapacityReason[], severity: FunctionalCapacityReason['severity']): boolean {
  return reasons.some(reason => reason.severity === severity);
}

function determinePreReferenceStatus(
  input: FunctionalCapacityMeasurementInput,
  reasons: readonly FunctionalCapacityReason[],
  sourceAcceptance: 'accepted' | 'conditional' | 'research_only' | 'unsupported' | null,
  protocolAcceptance: 'accepted' | 'conditional' | 'clinical_specialty' | null,
): FunctionalCapacityEligibilityStatus {
  if (hasSeverity(reasons, 'blocking_invalid')) return 'invalid';
  if (hasSeverity(reasons, 'blocking_unsupported') || sourceAcceptance === 'unsupported') return 'unsupported';
  if (hasSeverity(reasons, 'blocking_safety')) return 'safety_requirements_not_met';
  if (hasSeverity(reasons, 'blocking_incomplete')) return 'incomplete';
  if (hasSeverity(reasons, 'blocking_insufficient')) return 'insufficient_data';
  if (hasSeverity(reasons, 'blocking_protocol')) return 'protocol_mismatch';
  if (hasSeverity(reasons, 'research_restriction') || sourceAcceptance === 'research_only') return 'research_only';
  if (hasSeverity(reasons, 'clinical_specialty') || protocolAcceptance === 'clinical_specialty') return 'clinical_specialty';
  if (hasSeverity(reasons, 'conditional') || sourceAcceptance === 'conditional'
    || protocolAcceptance === 'conditional' || input.protocolAdherence === 'permitted_variant') {
    return 'conditionally_eligible';
  }
  return 'measurement_accepted_no_reference';
}

function isAccepted(status: FunctionalCapacityEligibilityStatus): boolean {
  return ['eligible', 'conditionally_eligible', 'measurement_accepted_no_reference', 'clinical_specialty'].includes(status);
}

function authorizedOutputs(
  status: FunctionalCapacityEligibilityStatus,
  referenceEligible: boolean,
  percentileAuthorized: boolean,
  publishedProtocolOutputAuthorized: boolean,
): readonly FunctionalCapacityAuthorizedOutput[] {
  if (status === 'research_only') return ['audit_record', 'source_provenance_summary', 'limitations', 'research_record'];
  if (!isAccepted(status)) return ['audit_record', 'source_provenance_summary', 'limitations'];
  const outputs: FunctionalCapacityAuthorizedOutput[] = [
    'audit_record', 'validated_raw_measurement', 'canonical_unit', 'test_identity',
    'protocol_identity', 'source_provenance_summary', 'measurement_confidence',
    'completion_status', 'limitations', 'interpretation_availability', 'trend_compatibility',
  ];
  if (referenceEligible) outputs.push('reference_identity');
  if (percentileAuthorized) outputs.push('published_percentile');
  if (publishedProtocolOutputAuthorized) outputs.push('published_protocol_output');
  return outputs;
}

function blockedOutputs(authorized: readonly FunctionalCapacityAuthorizedOutput[]): readonly FunctionalCapacityBlockedOutput[] {
  return [
    ...FUNCTIONAL_CAPACITY_ELIGIBILITY_POLICY.potentialAuthorizedOutputs.filter(output => !authorized.includes(output)),
    ...FUNCTIONAL_CAPACITY_ALWAYS_BLOCKED_OUTPUTS,
  ];
}

function evaluationKey(input: FunctionalCapacityMeasurementInput): string {
  return [
    FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.domainSpecification,
    input.recordId,
    input.testId ?? 'missing-test',
    input.protocolId ?? 'missing-protocol',
    input.provenance.sourceRecordId ?? 'missing-source-record',
    input.timestamps.measuredAt ?? 'missing-timestamp',
  ].join('|');
}

export function evaluateFunctionalCapacityEligibility(
  input: FunctionalCapacityMeasurementInput,
): FunctionalCapacityEligibilityResult {
  const validation = validateFunctionalCapacityMeasurement(input);
  const confidence = classifyFunctionalCapacityConfidence(
    input,
    validation.sourceDefinition?.defaultConfidence ?? null,
    validation.reasons,
  );
  const preliminaryStatus = determinePreReferenceStatus(
    input,
    validation.reasons,
    validation.sourceDefinition?.acceptance ?? null,
    validation.protocolDefinition?.acceptance ?? null,
  );
  const preliminaryAccepted = isAccepted(preliminaryStatus);
  const conditionalMeasurement = preliminaryStatus === 'conditionally_eligible'
    || preliminaryStatus === 'clinical_specialty'
    || validation.reasons.some(reason => reason.severity === 'conditional');
  const unresolvedConditionalRestriction = validation.reasons.some(reason => reason.severity === 'conditional')
    || validation.sourceDefinition?.acceptance === 'conditional'
    || input.protocolAdherence === 'permitted_variant';
  const eligibleForReference = preliminaryAccepted
    && preliminaryStatus !== 'clinical_specialty'
    // TUG and 6MWT remain conditionally production-eligible as tests, but an exact
    // protocol/reference match is still authorized by Phase 6.0C. Only a
    // record-specific limitation blocks reference matching here.
    && !unresolvedConditionalRestriction
    && confidence !== 'low_confidence';
  const reference = evaluateFunctionalCapacityReferenceEligibility(
    input,
    validation.ageAtMeasurement,
    confidence,
    eligibleForReference,
  );
  const publishedProtocolOutputAuthorized = validation.reasons.some(reason =>
    reason.code === 'published_protocol_output_preserved') && preliminaryAccepted;
  const interpretation = evaluateFunctionalCapacityInterpretation(
    input,
    reference.decision,
    preliminaryAccepted,
    conditionalMeasurement,
    preliminaryStatus === 'research_only',
    publishedProtocolOutputAuthorized,
  );
  const allReasons = sortFunctionalCapacityReasons([
    ...validation.reasons,
    ...reference.reasons,
    ...interpretation.reasons,
  ]);
  let status = determinePreReferenceStatus(
    input,
    allReasons,
    validation.sourceDefinition?.acceptance ?? null,
    validation.protocolDefinition?.acceptance ?? null,
  );
  if (status === 'measurement_accepted_no_reference' && reference.decision.status === 'eligible') status = 'eligible';
  const measurementAccepted = isAccepted(status);
  const outputs = authorizedOutputs(
    status,
    reference.decision.status === 'eligible',
    interpretation.decision.availability === 'published_percentile_authorized',
    publishedProtocolOutputAuthorized,
  );
  const reasonCodes = allReasons.map(reason => reason.code);
  const canonicalMeasurement = {
    originalValue: input.value,
    canonicalValue: validation.canonicalValue,
    originalUnit: input.unit,
    canonicalUnit: validation.canonicalUnit,
    rawComponents: input.details.sppb?.rawComponents ?? null,
    ageAtMeasurement: validation.ageAtMeasurement,
  };
  const measurementQualityDecision = measurementAccepted
    ? status === 'eligible' || status === 'measurement_accepted_no_reference' ? 'accepted' as const : 'conditional' as const
    : 'rejected' as const;

  return {
    testIdentity: input.testId,
    status,
    reasonCodes,
    reasons: allReasons,
    explanation: `${STATUS_EXPLANATIONS[status]} ${allReasons.map(reason => reason.explanation).join(' ')}`.trim(),
    measurementConfidence: confidence,
    measurementAccepted,
    protocolIdentity: { id: input.protocolId, version: input.protocolVersion },
    sourceProvenance: {
      sourceId: input.sourceId,
      provider: input.provider,
      ingestionMethod: input.ingestionMethod,
      provenanceComplete: validation.provenanceComplete,
    },
    canonicalMeasurement,
    completionStatus: input.completion.state,
    referenceEligibility: reference.decision,
    interpretation: interpretation.decision,
    authorizedOutputs: outputs,
    blockedOutputs: blockedOutputs(outputs),
    scientificVersions: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS,
    audit: {
      evaluationKey: evaluationKey(input),
      originalInput: input,
      canonicalMeasurement,
      testId: input.testId,
      protocolId: input.protocolId,
      protocolVersion: input.protocolVersion,
      protocolMetadata: input.details,
      sourceId: input.sourceId,
      provider: input.provider,
      ingestionMethod: input.ingestionMethod,
      timestamps: input.timestamps,
      provenanceComplete: validation.provenanceComplete,
      safetyMetadata: input.safety,
      supervisionMetadata: input.supervision,
      measurementQualityDecision,
      confidenceDecision: confidence,
      eligibilityDecision: status,
      referenceDecision: reference.decision,
      interpretationDecision: interpretation.decision,
      orderedReasonCodes: reasonCodes,
      registryVersions: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS,
    },
  };
}
