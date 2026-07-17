import type { GeneticsDomainPlaceholder } from './models';

/**
 * Future integration contract only. Genetics has no engine, metrics, state
 * builder, interpretation, or relationship to another domain in Phase 3.1.
 */
export const GENETICS_DOMAIN_PLACEHOLDER: GeneticsDomainPlaceholder = {
  id: 'genetics',
  title: 'Genetics',
  implementationStatus: 'placeholder',
  futureCapabilities: [{
    id: 'genetic_evidence',
    title: 'Genetic evidence',
    description: 'Reserved for validated, source-attributed genetic evidence.',
    availability: 'future',
  }],
};
