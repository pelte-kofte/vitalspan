import type { CardiometabolicConfidenceId, CardiometabolicReason, CardiometabolicVerificationStatus } from './contracts';
import type { CardiometabolicSourceDefinition } from './sourceRegistry';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export const CARDIOMETABOLIC_CONFIDENCE_REGISTRY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.confidenceRegistry,
  definitions: [
    { id: 'CMH-CONF-R', displayName: 'Reference Aligned', rank: 6, interpretationPermitted: true },
    { id: 'CMH-CONF-F', displayName: 'Fully Verified', rank: 5, interpretationPermitted: true },
    { id: 'CMH-CONF-L', displayName: 'Verified with Limits', rank: 4, interpretationPermitted: true },
    { id: 'CMH-CONF-P', displayName: 'Provisional', rank: 3, interpretationPermitted: false },
    { id: 'CMH-CONF-Q', displayName: 'Quarantined', rank: 2, interpretationPermitted: false },
    { id: 'CMH-CONF-X', displayName: 'Unsupported', rank: 1, interpretationPermitted: false },
  ] as const satisfies readonly { id: CardiometabolicConfidenceId; displayName: string; rank: number; interpretationPermitted: boolean }[],
  confidenceIsNotAScore: true,
  downgradeOnly: true,
  sourceIdentityAloneCanUpgrade: false,
});

export function classifyCardiometabolicConfidence(
  source: CardiometabolicSourceDefinition | null,
  verification: CardiometabolicVerificationStatus | null,
  reasons: readonly CardiometabolicReason[],
): CardiometabolicConfidenceId {
  if (!source || source.acceptance === 'unsupported') return 'CMH-CONF-X';
  if (verification === 'rejected' || verification === 'superseded') return 'CMH-CONF-X';
  if (verification === 'quarantined') return 'CMH-CONF-Q';
  if (verification === null || verification === 'provisional') return 'CMH-CONF-P';
  if (source.acceptance === 'research_only') return 'CMH-CONF-Q';
  if (reasons.some(reason => ['blocking_invalid', 'blocking_source'].includes(reason.severity))) return 'CMH-CONF-X';
  if (reasons.some(reason => ['blocking_assay', 'blocking_protocol', 'blocking_insufficient'].includes(reason.severity))) return 'CMH-CONF-P';
  if (source.acceptance === 'conditional') return source.maximumConfidence === 'CMH-CONF-F' ? 'CMH-CONF-F' : 'CMH-CONF-L';
  return source.maximumConfidence;
}
