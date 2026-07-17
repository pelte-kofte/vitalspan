import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Cardiorespiratory, activity, strength, and mobility evidence. */
export const FITNESS_DOMAIN_DEFINITION = {
  id: 'fitness',
  title: 'Fitness',
  capabilities: [
    { id: 'vo2max', title: 'VO₂max', description: 'Source-attributed cardiorespiratory fitness observations.', missingEvidence: 'Aerobic-capacity data unavailable.', monitoringPriority: 'Capture source-attributed aerobic-capacity data.' },
    { id: 'activity', title: 'Activity', description: 'Movement and exercise observations.', missingEvidence: 'Activity history unavailable.', monitoringPriority: 'Increase activity monitoring history.' },
    { id: 'strength', title: 'Strength', description: 'Strength performance history.', missingEvidence: 'Strength assessment history unavailable.', monitoringPriority: 'Capture repeatable strength assessments.' },
    { id: 'mobility', title: 'Mobility', description: 'Mobility assessment history.', missingEvidence: 'Mobility assessment history unavailable.', monitoringPriority: 'Capture repeatable mobility assessments.' },
  ],
  futureCapabilities: [],
  noDataLimitation: 'Fitness evidence is unavailable; no activity, performance, or assessment history was provided.',
  evidencePolicy: { freshnessWindowDays: 90, moderateHistoryCollections: 2, strongHistoryCollections: 6,
    metricLabel: { singular: 'fitness observation', plural: 'fitness observations' },
    collectionLabel: { singular: 'assessment', plural: 'assessments' } },
} as const satisfies HealthDomainDefinition<'fitness'>;

export const fitnessDomainEngine = createDomainEngine(FITNESS_DOMAIN_DEFINITION);
