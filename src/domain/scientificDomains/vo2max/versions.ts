import type { Vo2MaxScientificVersions } from './contracts';

export const VO2MAX_SCIENTIFIC_VERSIONS = Object.freeze({
  domainSpecification: 'vo2max-domain/1.0.0',
  sourceRegistry: 'vo2max-source-registry/1.0.0',
  confidenceRegistry: 'vo2max-confidence-registry/1.0.0',
  eligibilityPolicy: 'vo2max-eligibility-policy/1.0.0',
  referenceRegistry: 'vo2max-reference-registry/1.0.0',
  percentileInterpretationPolicy: 'vo2max-percentile-policy/1.0.0',
}) satisfies Vo2MaxScientificVersions;

export const VO2MAX_CANONICAL_UNIT = 'mL O2·kg^-1·min^-1' as const;

