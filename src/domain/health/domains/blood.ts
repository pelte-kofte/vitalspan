import { createDomainEngine } from '../createDomainEngine';
import type { HealthDomainDefinition } from '../models';

/** Laboratory evidence, inflammation, and cardiometabolic observations. */
export const BLOOD_DOMAIN_DEFINITION = {
  id: 'blood',
  title: 'Blood',
  capabilities: [
    { id: 'biomarkers', title: 'Biomarkers', description: 'Individual laboratory observations and history.', missingEvidence: 'Laboratory biomarker data unavailable.', monitoringPriority: 'Obtain source-attributed laboratory biomarker data.' },
    { id: 'inflammation', title: 'Inflammation', description: 'Validated inflammatory laboratory evidence.', missingEvidence: 'Inflammation markers unavailable.', monitoringPriority: 'Include inflammation markers in future laboratory monitoring.' },
    { id: 'cardiometabolic', title: 'Cardiometabolic', description: 'Validated cardiovascular and metabolic laboratory evidence.', missingEvidence: 'Cardiometabolic laboratory evidence incomplete.', monitoringPriority: 'Complete cardiometabolic laboratory monitoring.' },
  ],
  futureCapabilities: [{
    id: 'phenotypic_age',
    title: 'Phenotypic age',
    description: 'Reserved integration point; this domain does not calculate or depend on biological age.',
    availability: 'future',
  }],
  noDataLimitation: 'No laboratory evidence is available.',
  evidencePolicy: { freshnessWindowDays: 365, moderateHistoryCollections: 2, strongHistoryCollections: 3,
    metricLabel: { singular: 'laboratory biomarker', plural: 'laboratory biomarkers' },
    collectionLabel: { singular: 'visit', plural: 'visits' } },
} as const satisfies HealthDomainDefinition<'blood'>;

export const bloodDomainEngine = createDomainEngine(BLOOD_DOMAIN_DEFINITION);
