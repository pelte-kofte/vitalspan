import type {
  FunctionalCapacityConfidence,
  FunctionalCapacityMeasurementInput,
  FunctionalCapacityReason,
} from './contracts';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export const FUNCTIONAL_CAPACITY_CONFIDENCE_REGISTRY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.confidenceRegistry,
  definitions: [
    { id: 'clinical_grade', rank: 6, productionInterpretation: true, definition: 'Direct observation under an authoritative clinical protocol with qualified administration, controlled equipment, safety procedures, and complete source record.' },
    { id: 'high_confidence', rank: 5, productionInterpretation: true, definition: 'Direct standardized observation with strong protocol control and auditable research or validated device quality assurance.' },
    { id: 'moderate_confidence', rank: 4, productionInterpretation: true, definition: 'Direct observation under a recognized protocol with an explicit permitted setting limitation.' },
    { id: 'low_confidence', rank: 3, productionInterpretation: false, definition: 'Plausible observed or transcribed task with material limitations; reference interpretation unavailable by default.' },
    { id: 'research_only', rank: 2, productionInterpretation: false, definition: 'Experimental, unsupervised, remote, adapted, or algorithmic method not authorized as the production endpoint.' },
    { id: 'unsupported', rank: 1, productionInterpretation: false, definition: 'Self-report, unverified entry, consumer surrogate, or irrecoverably incomplete provenance.' },
  ] as const satisfies readonly { id: FunctionalCapacityConfidence; rank: number; productionInterpretation: boolean; definition: string }[],
  downgradeOnly: true,
  sourceIdentityAloneCanUpgrade: false,
});

export function getFunctionalCapacityConfidenceRank(confidence: FunctionalCapacityConfidence): number {
  return FUNCTIONAL_CAPACITY_CONFIDENCE_REGISTRY.definitions.find(item => item.id === confidence)?.rank ?? 0;
}

export function classifyFunctionalCapacityConfidence(
  input: FunctionalCapacityMeasurementInput,
  sourceConfidence: FunctionalCapacityConfidence | null,
  reasons: readonly FunctionalCapacityReason[],
): FunctionalCapacityConfidence {
  if (sourceConfidence === null) return 'unsupported';
  if (reasons.some(reason => reason.severity === 'blocking_unsupported')) return 'unsupported';
  if (sourceConfidence === 'research_only' || reasons.some(reason => reason.severity === 'research_restriction')) {
    return 'research_only';
  }
  if (reasons.some(reason => [
    'blocking_invalid', 'blocking_insufficient', 'blocking_protocol',
    'blocking_incomplete', 'blocking_safety',
  ].includes(reason.severity))) return 'low_confidence';
  if (input.sourceId === 'supervised_standardized_home_assessment') return 'moderate_confidence';
  if (input.sourceId === 'user_transcription_pending_verification') return 'low_confidence';
  return sourceConfidence;
}
