import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Behavioral and environmental observations not owned by other domains. */
export const LIFESTYLE_DOMAIN_DEFINITION = {
  id: 'lifestyle',
  title: 'Lifestyle',
  capabilities: [
    { id: 'smoking', title: 'Smoking', description: 'Current and historical tobacco exposure.', missingEvidence: 'Smoking history unavailable.', monitoringPriority: 'Confirm current and historical smoking status.' },
    { id: 'alcohol', title: 'Alcohol', description: 'Alcohol use observations.', missingEvidence: 'Alcohol-use history unavailable.', monitoringPriority: 'Confirm current alcohol-use history.' },
    { id: 'stress', title: 'Stress', description: 'Source-attributed stress observations.', missingEvidence: 'Stress history unavailable.', monitoringPriority: 'Increase source-attributed stress history.' },
    { id: 'sunlight', title: 'Sunlight', description: 'Sunlight exposure observations.', missingEvidence: 'Sunlight-exposure history unavailable.', monitoringPriority: 'Capture sunlight-exposure history.' },
  ],
  futureCapabilities: [],
  noDataLimitation: 'Lifestyle history is unavailable; no behavioral or environmental observations were provided.',
  evidencePolicy: { freshnessWindowDays: 180, moderateHistoryCollections: 2, strongHistoryCollections: 4,
    metricLabel: { singular: 'lifestyle record', plural: 'lifestyle records' },
    collectionLabel: { singular: 'review', plural: 'reviews' } },
} as const satisfies HealthDomainDefinition<'lifestyle'>;

export const lifestyleDomainEngine = createDomainEngine(LIFESTYLE_DOMAIN_DEFINITION);
