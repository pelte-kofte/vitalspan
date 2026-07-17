import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Peptide regimen records; no dosing or clinical recommendations are generated. */
export const PEPTIDE_DOMAIN_DEFINITION = {
  id: 'peptide',
  title: 'Peptide',
  capabilities: [
    { id: 'cycles', title: 'Cycles', description: 'Documented peptide cycle history.', missingEvidence: 'Peptide cycle history unavailable.', monitoringPriority: 'Maintain peptide cycle history.' },
    { id: 'dose', title: 'Dose', description: 'Recorded dose evidence.', missingEvidence: 'Peptide dose records unavailable.', monitoringPriority: 'Confirm source-attributed dose records.' },
    { id: 'storage', title: 'Storage', description: 'Recorded storage requirements and observations.', missingEvidence: 'Peptide storage records unavailable.', monitoringPriority: 'Maintain storage records.' },
    { id: 'injection_schedule', title: 'Injection schedule', description: 'Recorded administration schedule.', missingEvidence: 'Injection schedule unavailable.', monitoringPriority: 'Maintain injection schedule records.' },
    { id: 'monitoring', title: 'Monitoring', description: 'Source-attributed monitoring evidence.', missingEvidence: 'Peptide monitoring incomplete.', monitoringPriority: 'Complete source-attributed monitoring records.' },
  ],
  futureCapabilities: [],
  noDataLimitation: 'Peptide use is unavailable or has not been confirmed.',
  evidencePolicy: { freshnessWindowDays: 30, moderateHistoryCollections: 2, strongHistoryCollections: 4,
    metricLabel: { singular: 'peptide record', plural: 'peptide records' },
    collectionLabel: { singular: 'monitoring period', plural: 'monitoring periods' } },
} as const satisfies HealthDomainDefinition<'peptide'>;

export const peptideDomainEngine = createDomainEngine(PEPTIDE_DOMAIN_DEFINITION);
