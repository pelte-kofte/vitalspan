import type {
  ConfidenceFactor,
  DataCompleteness,
  DomainConfidence,
  DomainConfidenceAssessment,
  DomainMetric,
  HealthDomainDefinition,
  HealthDomainId,
  SourceReliability,
} from './models';

const CONFIDENCE_ORDER: readonly DomainConfidence[] = [
  'insufficient',
  'limited',
  'moderate',
  'high',
  'very_high',
];

function minimumConfidence(factors: readonly ConfidenceFactor[]): DomainConfidence {
  return factors.reduce<DomainConfidence>((lowest, factor) => (
    CONFIDENCE_ORDER.indexOf(factor.level) < CONFIDENCE_ORDER.indexOf(lowest)
      ? factor.level
      : lowest
  ), 'very_high');
}

function completenessFactor(completeness: DataCompleteness): ConfidenceFactor {
  const level: DomainConfidence = completeness.state === 'complete'
    ? 'very_high'
    : completeness.state === 'partial'
      ? 'limited'
      : 'insufficient';
  return {
    id: 'completeness',
    level,
    explanation: `${completeness.availableCapabilities} of ${completeness.totalCapabilities} capabilities have evidence.`,
  };
}

function consistencyFactor<D extends HealthDomainId>(metrics: readonly DomainMetric<D>[]): ConfidenceFactor {
  const consistency = metrics
    .map(metric => metric.interpretation?.consistency)
    .filter((value): value is NonNullable<typeof value> => Boolean(value));
  let level: DomainConfidence = 'insufficient';
  let explanation = 'No interpreted evidence is available to assess consistency.';

  if (consistency.length > 0 && consistency.every(value => value === 'consistent')) {
    level = 'very_high';
    explanation = 'All interpreted evidence is marked consistent by its domain adapter.';
  } else if (consistency.some(value => value === 'mixed')) {
    level = 'moderate';
    explanation = 'The interpreted evidence contains mixed longitudinal patterns.';
  } else if (consistency.length > 0) {
    level = 'limited';
    explanation = 'Consistency is unknown for some or all interpreted evidence.';
  }
  return { id: 'consistency', level, explanation };
}

function freshnessFactor<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  metrics: readonly DomainMetric<D>[],
  asOf: string,
): ConfidenceFactor {
  if (metrics.length === 0) {
    return { id: 'freshness', level: 'insufficient', explanation: 'No dated evidence is available.' };
  }
  const newest = metrics.reduce((latest, metric) => (
    Date.parse(metric.observedAt) > Date.parse(latest) ? metric.observedAt : latest
  ), metrics[0].observedAt);
  const ageDays = Math.floor((Date.parse(asOf) - Date.parse(newest)) / 86_400_000);
  const window = definition.evidencePolicy.freshnessWindowDays;
  const level: DomainConfidence = ageDays <= window
    ? 'very_high'
    : ageDays <= window * 2
      ? 'moderate'
      : 'limited';
  return {
    id: 'freshness',
    level,
    explanation: `Newest evidence is ${ageDays} day${ageDays === 1 ? '' : 's'} old; the domain freshness window is ${window} days.`,
  };
}

function reliabilityLevel(reliability: readonly SourceReliability[]): DomainConfidence {
  if (reliability.length === 0 || reliability.includes('unverified')) return 'insufficient';
  if (reliability.includes('self_reported')) return 'limited';
  if (reliability.every(value => value === 'clinically_verified')) return 'very_high';
  return 'high';
}

function sourceReliabilityFactor<D extends HealthDomainId>(metrics: readonly DomainMetric<D>[]): ConfidenceFactor {
  const reliability = metrics.flatMap(metric => metric.provenance.map(item => item.reliability));
  const level = reliabilityLevel(reliability);
  const labels = [...new Set(reliability)].join(', ') || 'none';
  return {
    id: 'source_reliability',
    level,
    explanation: `Source reliability represented in this evidence: ${labels}.`,
  };
}

function historicalDepthFactor<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  metrics: readonly DomainMetric<D>[],
): ConfidenceFactor {
  const collections = new Set(metrics.map(metric => metric.collectionId ?? metric.observedAt.slice(0, 10)));
  const count = collections.size;
  const { moderateHistoryCollections, strongHistoryCollections, collectionLabel } = definition.evidencePolicy;
  let level: DomainConfidence;
  if (count === 0) level = 'insufficient';
  else if (count === 1) level = 'limited';
  else if (count >= strongHistoryCollections) level = 'very_high';
  else if (count >= moderateHistoryCollections) level = 'high';
  else level = 'moderate';
  const label = count === 1 ? collectionLabel.singular : collectionLabel.plural;
  return {
    id: 'historical_depth',
    level,
    explanation: `${count} ${label} represented; ${strongHistoryCollections} are required for strong history.`,
  };
}

export function assessDomainConfidence<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  metrics: readonly DomainMetric<D>[],
  completeness: DataCompleteness,
  asOf: string,
): DomainConfidenceAssessment {
  const factors: readonly ConfidenceFactor[] = [
    completenessFactor(completeness),
    consistencyFactor(metrics),
    freshnessFactor(definition, metrics, asOf),
    sourceReliabilityFactor(metrics),
    historicalDepthFactor(definition, metrics),
  ];
  return { level: minimumConfidence(factors), factors };
}
