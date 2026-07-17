import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Dietary intake and energy evidence; supplement intake remains separate. */
export const NUTRITION_DOMAIN_DEFINITION = {
  id: 'nutrition',
  title: 'Nutrition',
  capabilities: [
    { id: 'protein', title: 'Protein', description: 'Dietary protein observations.', missingEvidence: 'Protein intake history unavailable.', monitoringPriority: 'Track protein intake consistently.' },
    { id: 'fiber', title: 'Fiber', description: 'Dietary fiber observations.', missingEvidence: 'Fiber intake history unavailable.', monitoringPriority: 'Track fiber intake consistently.' },
    { id: 'hydration', title: 'Hydration', description: 'Fluid intake observations.', missingEvidence: 'Hydration history unavailable.', monitoringPriority: 'Track hydration consistently.' },
    { id: 'energy_balance', title: 'Energy balance', description: 'Source-attributed intake and expenditure evidence.', missingEvidence: 'Energy-balance evidence unavailable.', monitoringPriority: 'Capture source-attributed intake and expenditure history.' },
  ],
  futureCapabilities: [],
  noDataLimitation: 'Nutrition history is unavailable; no dietary intake evidence was provided.',
  evidencePolicy: { freshnessWindowDays: 14, moderateHistoryCollections: 7, strongHistoryCollections: 28,
    metricLabel: { singular: 'dietary observation', plural: 'dietary observations' },
    collectionLabel: { singular: 'day', plural: 'days' } },
} as const satisfies HealthDomainDefinition<'nutrition'>;

export const nutritionDomainEngine = createDomainEngine(NUTRITION_DOMAIN_DEFINITION);
