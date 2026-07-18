import type {
  Vo2MaxAuthorizedOutput,
  Vo2MaxBlockedOutput,
  Vo2MaxEligibilityResult,
  Vo2MaxEligibilityStatus,
  Vo2MaxMeasurementInput,
  Vo2MaxProhibitedOutput,
  Vo2MaxReason,
} from './contracts';
import { VO2MAX_PERCENTILE_POLICY } from './percentilePolicy';
import { reasonFor, sortVo2MaxReasons } from './reasonRegistry';
import { evaluateVo2MaxReferenceEligibility } from './referenceRegistry';
import { validateVo2MaxMeasurement } from './validation';
import { VO2MAX_SCIENTIFIC_VERSIONS } from './versions';

export const VO2MAX_ELIGIBILITY_POLICY = Object.freeze({
  version: VO2MAX_SCIENTIFIC_VERSIONS.eligibilityPolicy,
  failClosed: true,
  potentialAuthorizedOutputs: [
    'audit_record', 'canonical_value', 'measurement_type', 'measurement_confidence',
    'provenance_summary', 'reference_identity', 'percentile', 'data_quality_limitations',
    'interpretation_availability', 'research_record',
  ] as const satisfies readonly Vo2MaxAuthorizedOutput[],
});

const STATUS_EXPLANATIONS: Readonly<Record<Vo2MaxEligibilityStatus, string>> = {
  eligible: 'The measurement is accepted and exactly matches an active normative reference. Source-bound percentile lookup is authorized.',
  conditionally_eligible: 'The measurement is retained conditionally, but unresolved review requirements block normative percentile interpretation.',
  measurement_accepted_no_reference: 'The measurement is accepted for its source-authorized context, but no normative reference exactly matches it.',
  research_only: 'The source is retained only in a segregated research context and is unavailable for production interpretation.',
  unsupported: 'The source or record is unsupported for VO2max-domain scientific interpretation.',
  invalid: 'The record contains an invalid or contradictory scientific value, unit, timestamp, or method claim.',
  insufficient_data: 'Required measurement or provenance data are missing and were not inferred.',
};

function evaluationKey(input: Vo2MaxMeasurementInput): string {
  return [
    VO2MAX_SCIENTIFIC_VERSIONS.domainSpecification,
    input.recordId,
    input.sourceId ?? 'missing-source',
    input.provenance.sourceRecordId ?? 'missing-source-record',
    input.timestamps.measuredAt ?? 'missing-measured-at',
  ].join('|');
}

function hasSeverity(reasons: readonly Vo2MaxReason[], severity: Vo2MaxReason['severity']): boolean {
  return reasons.some(reason => reason.severity === severity);
}

function determineStatus(
  reasons: readonly Vo2MaxReason[],
  sourceAcceptance: 'accepted' | 'conditional' | 'research_only' | 'unsupported' | null,
  referenceEligible: boolean,
): Vo2MaxEligibilityStatus {
  if (hasSeverity(reasons, 'blocking_invalid')) return 'invalid';
  if (hasSeverity(reasons, 'blocking_unsupported') || sourceAcceptance === 'unsupported') return 'unsupported';
  if (hasSeverity(reasons, 'blocking_insufficient')) return 'insufficient_data';
  if (sourceAcceptance === 'research_only') return 'research_only';
  if (hasSeverity(reasons, 'conditional') || sourceAcceptance === 'conditional') {
    return 'conditionally_eligible';
  }
  return referenceEligible ? 'eligible' : 'measurement_accepted_no_reference';
}

function authorizedOutputs(status: Vo2MaxEligibilityStatus): readonly Vo2MaxAuthorizedOutput[] {
  if (status === 'eligible') return [
    'audit_record', 'canonical_value', 'measurement_type', 'measurement_confidence',
    'provenance_summary', 'reference_identity', 'percentile', 'data_quality_limitations',
    'interpretation_availability',
  ];
  if (status === 'measurement_accepted_no_reference' || status === 'conditionally_eligible') return [
    'audit_record', 'canonical_value', 'measurement_type', 'measurement_confidence',
    'provenance_summary', 'data_quality_limitations', 'interpretation_availability',
  ];
  if (status === 'research_only') return [
    'audit_record', 'provenance_summary', 'data_quality_limitations', 'research_record',
  ];
  return ['audit_record', 'provenance_summary', 'data_quality_limitations'];
}

function blockedOutputs(
  authorized: readonly Vo2MaxAuthorizedOutput[],
): readonly Vo2MaxBlockedOutput[] {
  return [
    ...VO2MAX_ELIGIBILITY_POLICY.potentialAuthorizedOutputs
      .filter(output => !authorized.includes(output)),
    ...VO2MAX_PERCENTILE_POLICY.prohibitedOutputs,
  ];
}

function interpretation(status: Vo2MaxEligibilityStatus): Vo2MaxEligibilityResult['interpretationAvailability'] {
  if (status === 'eligible') return 'normative_percentile_authorized';
  if (status === 'measurement_accepted_no_reference') return 'measurement_context_only';
  if (status === 'conditionally_eligible') return 'conditional_measurement_context';
  if (status === 'research_only') return 'research_only';
  return 'unavailable';
}

export function evaluateVo2MaxEligibility(
  input: Vo2MaxMeasurementInput,
): Vo2MaxEligibilityResult {
  const validation = validateVo2MaxMeasurement(input);
  const source = validation.sourceDefinition;
  const preliminaryAccepted = source !== null
    && (source.productionAcceptance === 'accepted' || source.productionAcceptance === 'conditional')
    && !validation.reasons.some(reason => [
      'blocking_invalid', 'blocking_insufficient', 'blocking_unsupported',
    ].includes(reason.severity));
  const conditionalMeasurement = source?.productionAcceptance === 'conditional'
    || validation.reasons.some(reason => reason.severity === 'conditional');
  const confidence = source?.confidence ?? 'unsupported';
  const referenceDecision = evaluateVo2MaxReferenceEligibility(
    input,
    validation.ageAtMeasurement,
    confidence,
    preliminaryAccepted,
    conditionalMeasurement,
  );
  const referenceReasons = referenceDecision.reasonCodes.map(code => reasonFor(code));
  const allReasons = sortVo2MaxReasons([...validation.reasons, ...referenceReasons]);
  const status = determineStatus(
    allReasons,
    source?.productionAcceptance ?? null,
    referenceDecision.status === 'eligible',
  );
  const accepted = status === 'eligible'
    || status === 'conditionally_eligible'
    || status === 'measurement_accepted_no_reference';
  const outputs = authorizedOutputs(status);
  const percentileEligibility = referenceDecision.status === 'eligible'
    ? {
      status: 'authorized' as const,
      value: null,
      policyVersion: VO2MAX_PERCENTILE_POLICY.version,
      reasonCodes: ['percentile_authorized'] as const,
    }
    : {
      status: 'unavailable' as const,
      value: null,
      policyVersion: VO2MAX_PERCENTILE_POLICY.version,
      reasonCodes: ['percentile_unavailable'] as const,
    };
  const reasonCodes = allReasons.map(reason => reason.code);

  return {
    status,
    reasonCodes,
    reasons: allReasons,
    explanation: `${STATUS_EXPLANATIONS[status]} ${allReasons.map(reason => reason.explanation).join(' ')}`.trim(),
    measurementConfidence: confidence,
    measurementAccepted: accepted,
    sourceProvenance: {
      sourceId: input.sourceId,
      provider: input.provider,
      ingestionMethod: input.ingestionMethod,
      provenanceComplete: validation.provenanceComplete,
      originatingSourceId: input.provenance.originatingSourceId,
    },
    canonicalMeasurement: {
      originalValue: input.value,
      canonicalValue: validation.canonicalValue,
      originalUnit: input.unit,
      canonicalUnit: validation.canonicalUnit,
      endpoint: input.endpoint,
      measurementNature: input.measurementNature,
      modality: input.modality,
      ageAtMeasurement: validation.ageAtMeasurement,
    },
    referenceEligibility: referenceDecision,
    percentileEligibility,
    interpretationAvailability: interpretation(status),
    authorizedOutputs: outputs,
    blockedOutputs: blockedOutputs(outputs),
    scientificVersion: VO2MAX_SCIENTIFIC_VERSIONS,
    audit: {
      evaluationKey: evaluationKey(input),
      recordId: input.recordId,
      personId: input.personId,
      originalValue: input.value,
      canonicalValue: validation.canonicalValue,
      originalUnit: input.unit,
      canonicalUnit: validation.canonicalUnit,
      sourceId: input.sourceId,
      provider: input.provider,
      testType: input.testType,
      measurementNature: input.measurementNature,
      endpoint: input.endpoint,
      modality: input.modality,
      timestamps: input.timestamps,
      ingestionMethod: input.ingestionMethod,
      provenance: input.provenance,
      provenanceComplete: validation.provenanceComplete,
      population: input.population,
      ageAtMeasurement: validation.ageAtMeasurement,
      duplicate: input.duplicate,
      confidenceDecision: confidence,
      eligibilityDecision: status,
      referenceDecision,
      reasonCodes,
      registryVersions: VO2MAX_SCIENTIFIC_VERSIONS,
    },
  };
}

export const VO2MAX_ALWAYS_BLOCKED_OUTPUTS = VO2MAX_PERCENTILE_POLICY
  .prohibitedOutputs satisfies readonly Vo2MaxProhibitedOutput[];
