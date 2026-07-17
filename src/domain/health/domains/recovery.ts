import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Short-term recovery evidence from cardiovascular and temperature observations. */
export const RECOVERY_DOMAIN_DEFINITION = {
  id: 'recovery',
  title: 'Recovery',
  capabilities: [
    { id: 'hrv', title: 'HRV', description: 'Heart-rate variability observations.', missingEvidence: 'HRV history unavailable.', monitoringPriority: 'Track HRV over a longer history.' },
    { id: 'resting_heart_rate', title: 'Resting HR', description: 'Resting heart-rate observations.', missingEvidence: 'Resting heart-rate history unavailable.', monitoringPriority: 'Track resting heart rate over time.' },
    { id: 'recovery_score', title: 'Recovery score', description: 'Externally supplied, source-attributed recovery assessments.', missingEvidence: 'Source-attributed recovery assessments unavailable.', monitoringPriority: 'Capture source-attributed recovery assessments.' },
    { id: 'body_temperature', title: 'Body temperature', description: 'Body or wrist temperature observations.', missingEvidence: 'Body-temperature observations unavailable.', monitoringPriority: 'Capture body-temperature history.' },
  ],
  futureCapabilities: [],
  noDataLimitation: 'Recovery evidence is unavailable; no compatible wearable or manual observations were provided.',
  evidencePolicy: { freshnessWindowDays: 7, moderateHistoryCollections: 7, strongHistoryCollections: 21,
    metricLabel: { singular: 'recovery observation', plural: 'recovery observations' },
    collectionLabel: { singular: 'day', plural: 'days' } },
} as const satisfies HealthDomainDefinition<'recovery'>;

export const recoveryDomainEngine = createDomainEngine(RECOVERY_DOMAIN_DEFINITION);
