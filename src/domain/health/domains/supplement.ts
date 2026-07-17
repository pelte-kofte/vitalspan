import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Supplement regimen evidence, independent from medication and nutrition. */
export const SUPPLEMENT_DOMAIN_DEFINITION = {
  id: 'supplement',
  title: 'Supplement',
  capabilities: [
    { id: 'active_supplements', title: 'Active supplements', description: 'Current supplement records.', missingEvidence: 'Current supplement list unavailable or unconfirmed.', monitoringPriority: 'Confirm the current supplement list.' },
    { id: 'adherence', title: 'Adherence', description: 'Observed supplement completion history.', missingEvidence: 'Supplement adherence history unavailable.', monitoringPriority: 'Increase supplement adherence history.' },
    { id: 'scheduling', title: 'Scheduling', description: 'Supplement timing and schedule records.', missingEvidence: 'Supplement schedule unavailable.', monitoringPriority: 'Maintain supplement schedule records.' },
  ],
  futureCapabilities: [],
  noDataLimitation: 'Supplement use is unavailable or has not been confirmed.',
  evidencePolicy: { freshnessWindowDays: 30, moderateHistoryCollections: 7, strongHistoryCollections: 28,
    metricLabel: { singular: 'supplement record', plural: 'supplement records' },
    collectionLabel: { singular: 'day', plural: 'days' } },
} as const satisfies HealthDomainDefinition<'supplement'>;

export const supplementDomainEngine = createDomainEngine(SUPPLEMENT_DOMAIN_DEFINITION);
