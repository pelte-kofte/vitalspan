import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Non-medication therapy and protocol evidence. */
export const THERAPY_DOMAIN_DEFINITION = {
  id: 'therapy',
  title: 'Therapy',
  capabilities: [
    { id: 'protocols', title: 'Protocols', description: 'Documented therapy protocols.', missingEvidence: 'Therapy protocol history unavailable.', monitoringPriority: 'Maintain source-attributed therapy protocol history.' },
    { id: 'recovery_therapies', title: 'Recovery therapies', description: 'Documented recovery therapy sessions.', missingEvidence: 'Recovery therapy history unavailable.', monitoringPriority: 'Capture recovery therapy session history.' },
  ],
  futureCapabilities: [{
    id: 'future_longevity_interventions',
    title: 'Future longevity interventions',
    description: 'Reserved for validated interventions introduced in a future phase.',
    availability: 'future',
  }],
  noDataLimitation: 'Therapy history is unavailable; no protocol or recovery therapy evidence was provided.',
  evidencePolicy: { freshnessWindowDays: 90, moderateHistoryCollections: 2, strongHistoryCollections: 6,
    metricLabel: { singular: 'therapy record', plural: 'therapy records' },
    collectionLabel: { singular: 'session', plural: 'sessions' } },
} as const satisfies HealthDomainDefinition<'therapy'>;

export const therapyDomainEngine = createDomainEngine(THERAPY_DOMAIN_DEFINITION);
