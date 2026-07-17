import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Medication records and their monitoring evidence; supplements stay separate. */
export const MEDICATION_DOMAIN_DEFINITION = {
  id: 'medication',
  title: 'Medication',
  capabilities: [
    { id: 'current_medications', title: 'Current medications', description: 'Active medication records.', missingEvidence: 'Current medication list unavailable or unconfirmed.', monitoringPriority: 'Confirm the current medication list.' },
    { id: 'history', title: 'History', description: 'Medication start, change, and stop history.', missingEvidence: 'Medication history unavailable.', monitoringPriority: 'Maintain medication start, change, and stop history.' },
    { id: 'monitoring', title: 'Monitoring', description: 'Source-attributed monitoring evidence linked to medication use.', missingEvidence: 'Medication monitoring incomplete.', monitoringPriority: 'Complete source-attributed medication monitoring records.' },
  ],
  futureCapabilities: [],
  noDataLimitation: 'Medication history is unavailable or has not been confirmed.',
  evidencePolicy: { freshnessWindowDays: 90, moderateHistoryCollections: 2, strongHistoryCollections: 4,
    metricLabel: { singular: 'medication record', plural: 'medication records' },
    collectionLabel: { singular: 'review', plural: 'reviews' } },
} as const satisfies HealthDomainDefinition<'medication'>;

export const medicationDomainEngine = createDomainEngine(MEDICATION_DOMAIN_DEFINITION);
