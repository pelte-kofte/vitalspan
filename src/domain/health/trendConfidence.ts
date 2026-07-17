import type {
  DomainConfidence,
  DomainHistorySnapshot,
  HealthDomainDefinition,
  HealthDomainId,
  TrendConfidenceAssessment,
  TrendConfidenceFactor,
  TrendDirection,
  TrendHistoricalCoverage,
} from './models';

const CONFIDENCE_ORDER: readonly DomainConfidence[] = [
  'insufficient', 'limited', 'moderate', 'high', 'very_high',
];

function minimumConfidence(factors: readonly TrendConfidenceFactor[]): DomainConfidence {
  return factors.reduce<DomainConfidence>((lowest, factor) => (
    CONFIDENCE_ORDER.indexOf(factor.level) < CONFIDENCE_ORDER.indexOf(lowest)
      ? factor.level
      : lowest
  ), 'very_high');
}

function depthFactor(count: number): TrendConfidenceFactor {
  const level: DomainConfidence = count <= 1
    ? 'insufficient'
    : count === 2
      ? 'limited'
      : count < 5
        ? 'moderate'
        : count < 12
          ? 'high'
          : 'very_high';
  return {
    id: 'historical_depth',
    level,
    explanation: `${count} structured domain observation${count === 1 ? '' : 's'} are available.`,
  };
}

function continuityFactor(coverage: TrendHistoricalCoverage): TrendConfidenceFactor {
  if (coverage.observationCount === 0) {
    return { id: 'continuity', level: 'insufficient', explanation: 'No historical continuity is available.' };
  }
  if (coverage.missingPeriods.length > 0 || coverage.interval === 'irregular') {
    return {
      id: 'continuity',
      level: 'limited',
      explanation: coverage.missingPeriods.length > 0
        ? `${coverage.missingPeriods.length} missing observation period${coverage.missingPeriods.length === 1 ? '' : 's'} interrupt the history.`
        : 'Observation intervals are explicitly marked irregular.',
    };
  }
  return { id: 'continuity', level: 'very_high', explanation: 'No missing observation periods are declared.' };
}

function freshnessFactor<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  snapshots: readonly DomainHistorySnapshot<D>[],
  asOf: string,
): TrendConfidenceFactor {
  if (snapshots.length === 0) {
    return { id: 'freshness', level: 'insufficient', explanation: 'No dated trend observation is available.' };
  }
  const latest = snapshots[snapshots.length - 1].observedAt;
  const ageDays = Math.floor((Date.parse(asOf) - Date.parse(latest)) / 86_400_000);
  const window = definition.evidencePolicy.freshnessWindowDays;
  const level: DomainConfidence = ageDays <= window
    ? 'very_high'
    : ageDays <= window * 2
      ? 'moderate'
      : 'limited';
  return {
    id: 'freshness',
    level,
    explanation: `Newest trend observation is ${ageDays} day${ageDays === 1 ? '' : 's'} old; the domain evidence window is ${window} days.`,
  };
}

function reliabilityFactor<D extends HealthDomainId>(
  snapshots: readonly DomainHistorySnapshot<D>[],
): TrendConfidenceFactor {
  const reliability = snapshots.flatMap(snapshot => snapshot.provenance.map(item => item.reliability));
  let level: DomainConfidence;
  if (reliability.length === 0 || reliability.includes('unverified')) level = 'insufficient';
  else if (reliability.includes('self_reported')) level = 'limited';
  else if (reliability.every(value => value === 'clinically_verified')) level = 'very_high';
  else level = 'high';
  return {
    id: 'source_reliability',
    level,
    explanation: `Trend source reliability represented: ${[...new Set(reliability)].join(', ') || 'none'}.`,
  };
}

function directionalFactor(direction: TrendDirection): TrendConfidenceFactor {
  const level: DomainConfidence = direction === 'unknown'
    ? 'insufficient'
    : direction === 'emerging'
      ? 'limited'
      : direction === 'mixed'
        ? 'moderate'
        : 'very_high';
  const explanation = direction === 'unknown'
    ? 'Available history does not support a direction.'
    : direction === 'emerging'
      ? 'A possible change is present, but directional history is limited.'
      : direction === 'mixed'
        ? 'Observed state transitions move in more than one direction.'
        : `Observed state transitions consistently support the ${direction} direction.`;
  return { id: 'directional_consistency', level, explanation };
}

export function assessTrendConfidence<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  snapshots: readonly DomainHistorySnapshot<D>[],
  coverage: TrendHistoricalCoverage,
  direction: TrendDirection,
  asOf: string,
): TrendConfidenceAssessment {
  const factors: readonly TrendConfidenceFactor[] = [
    depthFactor(snapshots.length),
    continuityFactor(coverage),
    freshnessFactor(definition, snapshots, asOf),
    reliabilityFactor(snapshots),
    directionalFactor(direction),
  ];
  return { level: minimumConfidence(factors), factors };
}
