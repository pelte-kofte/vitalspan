import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Sleep observations; it does not consume recovery or lifestyle evidence. */
export const SLEEP_DOMAIN_DEFINITION = {
  id: 'sleep',
  title: 'Sleep',
  capabilities: [
    { id: 'duration', title: 'Duration', description: 'Observed sleep duration.', missingEvidence: 'Sleep duration unavailable.', monitoringPriority: 'Increase source-attributed sleep duration history.' },
    { id: 'consistency', title: 'Consistency', description: 'Longitudinal sleep schedule observations.', missingEvidence: 'Sleep consistency history unavailable.', monitoringPriority: 'Increase sleep history to observe consistency.' },
    { id: 'efficiency', title: 'Efficiency', description: 'Observed sleep efficiency evidence.', missingEvidence: 'Sleep efficiency unavailable.', monitoringPriority: 'Capture sleep efficiency in future monitoring.' },
    { id: 'timing', title: 'Timing', description: 'Sleep onset and wake timing.', missingEvidence: 'Sleep timing unavailable.', monitoringPriority: 'Capture sleep and wake timing.' },
  ],
  futureCapabilities: [],
  noDataLimitation: 'Sleep history is unavailable; a connected source or manual history is required.',
  evidencePolicy: { freshnessWindowDays: 14, moderateHistoryCollections: 7, strongHistoryCollections: 28,
    metricLabel: { singular: 'sleep observation', plural: 'sleep observations' },
    collectionLabel: { singular: 'night', plural: 'nights' } },
} as const satisfies HealthDomainDefinition<'sleep'>;

export const sleepDomainEngine = createDomainEngine(SLEEP_DOMAIN_DEFINITION);
