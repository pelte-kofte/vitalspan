import { assessTrendConfidence } from './trendConfidence';
import {
  DOMAIN_STATES,
  PROVENANCE_SOURCES,
  SOURCE_RELIABILITY_LEVELS,
} from './models';
import type {
  DomainHistorySnapshot,
  DomainState,
  DomainTrendHistory,
  DomainTrendState,
  HealthDomainDefinition,
  HealthDomainId,
  MetricProvenance,
  TrendDirection,
  TrendHistoricalCoverage,
  TrendLimitation,
  TrendPattern,
  TrendPersistence,
  TrendProvenanceRecord,
  TrendVelocity,
} from './models';

const DAY_MS = 86_400_000;
const STATE_ORDER: readonly Exclude<DomainState, 'unknown'>[] = [
  'attention_needed', 'needs_review', 'stable', 'good', 'excellent',
];
const HISTORY_KEYS = ['snapshots', 'interval', 'supportedIntervals', 'missingPeriods', 'patternEvidence'] as const;
const SNAPSHOT_KEYS = ['id', 'domainId', 'state', 'observedAt', 'provenance', 'supportingMetricIds'] as const;
const PROVENANCE_KEYS = ['source', 'provider', 'reliability', 'recordedAt', 'sourceRecordId', 'integrationId'] as const;
const MISSING_PERIOD_KEYS = ['from', 'to', 'reason'] as const;
const PATTERN_KEYS = ['pattern', 'explanation', 'supportingSnapshotIds'] as const;
const INTERVALS = ['daily', 'weekly', 'monthly', 'visit_based', 'irregular'] as const;

function assertTimestamp(value: string, field: string): void {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${field} must be a valid date`);
}

function assertExactKeys(value: object, allowed: readonly string[], field: string): void {
  const unexpected = Object.keys(value).filter(key => !allowed.includes(key));
  if (unexpected.length > 0) throw new Error(`${field} contains unsupported fields: ${unexpected.join(', ')}`);
}

function validateProvenance(provenance: MetricProvenance, field: string, asOf: string): void {
  assertExactKeys(provenance, PROVENANCE_KEYS, field);
  if (!PROVENANCE_SOURCES.includes(provenance.source)) throw new Error(`${field} has unsupported source`);
  if (!SOURCE_RELIABILITY_LEVELS.includes(provenance.reliability)) throw new Error(`${field} has unsupported reliability`);
  if (!provenance.provider.trim()) throw new Error(`${field} provider cannot be empty`);
  assertTimestamp(provenance.recordedAt, `${field}.recordedAt`);
  if (Date.parse(provenance.recordedAt) > Date.parse(asOf)) throw new Error(`${field}.recordedAt cannot be after asOf`);
}

function validateHistory<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  history: DomainTrendHistory<D>,
  asOf: string,
): void {
  assertExactKeys(history, HISTORY_KEYS, `${definition.id} trend history`);
  if (!INTERVALS.includes(history.interval)) throw new Error(`${definition.id} trend interval is unsupported`);
  if (!Number.isInteger(history.supportedIntervals) || history.supportedIntervals < 0) {
    throw new Error(`${definition.id} supportedIntervals must be a non-negative integer`);
  }
  const ids = new Set<string>();
  const timestamps = new Set<number>();
  for (const snapshot of history.snapshots) {
    assertExactKeys(snapshot, SNAPSHOT_KEYS, `${definition.id} trend snapshot`);
    if (!snapshot.id.trim()) throw new Error(`${definition.id} trend snapshot id cannot be empty`);
    if (ids.has(snapshot.id)) throw new Error(`Duplicate ${definition.id} trend snapshot id: ${snapshot.id}`);
    ids.add(snapshot.id);
    if (snapshot.domainId !== definition.id) throw new Error(`${definition.id} trend cannot consume ${snapshot.domainId} history`);
    if (!DOMAIN_STATES.includes(snapshot.state)) throw new Error(`${definition.id} trend snapshot has unsupported state`);
    assertTimestamp(snapshot.observedAt, `${definition.id}.${snapshot.id}.observedAt`);
    if (Date.parse(snapshot.observedAt) > Date.parse(asOf)) throw new Error(`${definition.id}.${snapshot.id} cannot be after asOf`);
    const observedTime = Date.parse(snapshot.observedAt);
    if (timestamps.has(observedTime)) throw new Error(`${definition.id} trend snapshots require unique timestamps`);
    timestamps.add(observedTime);
    if (snapshot.provenance.length === 0) throw new Error(`${definition.id}.${snapshot.id} requires provenance`);
    snapshot.provenance.forEach(item => validateProvenance(item, `${definition.id}.${snapshot.id}.provenance`, asOf));
  }
  const missingPeriods = [...(history.missingPeriods ?? [])]
    .sort((a, b) => Date.parse(a.from) - Date.parse(b.from));
  for (const [index, period] of missingPeriods.entries()) {
    assertExactKeys(period, MISSING_PERIOD_KEYS, `${definition.id} missing period`);
    assertTimestamp(period.from, `${definition.id} missing period from`);
    assertTimestamp(period.to, `${definition.id} missing period to`);
    if (Date.parse(period.from) > Date.parse(period.to)) throw new Error(`${definition.id} missing period cannot end before it starts`);
    if (Date.parse(period.to) > Date.parse(asOf)) throw new Error(`${definition.id} missing period cannot end after asOf`);
    if (!period.reason.trim()) throw new Error(`${definition.id} missing period requires a reason`);
    const previous = missingPeriods[index - 1];
    if (previous && Date.parse(previous.to) >= Date.parse(period.from)) {
      throw new Error(`${definition.id} missing periods cannot overlap`);
    }
  }
  if (history.patternEvidence) {
    assertExactKeys(history.patternEvidence, PATTERN_KEYS, `${definition.id} pattern evidence`);
    if (!history.patternEvidence.explanation.trim()) throw new Error(`${definition.id} pattern evidence requires explanation`);
    const references = new Set(history.patternEvidence.supportingSnapshotIds);
    if (references.size < 2) throw new Error(`${definition.id} seasonal pattern requires at least two snapshots`);
    for (const id of references) {
      if (!ids.has(id)) throw new Error(`${definition.id} seasonal pattern references unknown snapshot: ${id}`);
    }
  }
}

function cloneAndSort<D extends HealthDomainId>(
  snapshots: readonly DomainHistorySnapshot<D>[],
): DomainHistorySnapshot<D>[] {
  return snapshots.map(snapshot => {
    const [first, ...rest] = snapshot.provenance;
    const clone: DomainHistorySnapshot<D> = {
      ...snapshot,
      supportingMetricIds: [...snapshot.supportingMetricIds],
      provenance: [{ ...first }, ...rest.map(item => ({ ...item }))] as const,
    };
    return clone;
  }).sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));
}

function coverage<D extends HealthDomainId>(
  history: DomainTrendHistory<D> | undefined,
  snapshots: readonly DomainHistorySnapshot<D>[],
): TrendHistoricalCoverage {
  const startedAt = snapshots[0]?.observedAt ?? null;
  const endedAt = snapshots[snapshots.length - 1]?.observedAt ?? null;
  const durationDays = startedAt && endedAt
    ? Math.max(0, Math.floor((Date.parse(endedAt) - Date.parse(startedAt)) / DAY_MS))
    : 0;
  return {
    historyLength: { value: durationDays, unit: 'days' },
    observationCount: snapshots.length,
    timeSpan: { startedAt, endedAt, durationDays },
    interval: history?.interval ?? 'unavailable',
    supportedIntervals: history?.supportedIntervals ?? 0,
    missingPeriods: [...(history?.missingPeriods ?? [])]
      .map(period => ({ ...period }))
      .sort((a, b) => Date.parse(a.from) - Date.parse(b.from)),
  };
}

function transitionDirection(from: Exclude<DomainState, 'unknown'>, to: Exclude<DomainState, 'unknown'>): number {
  return Math.sign(STATE_ORDER.indexOf(to) - STATE_ORDER.indexOf(from));
}

function trendDirection<D extends HealthDomainId>(
  snapshots: readonly DomainHistorySnapshot<D>[],
  hasInterruption: boolean,
): TrendDirection {
  if (hasInterruption || snapshots.some(snapshot => snapshot.state === 'unknown')) return 'unknown';
  if (snapshots.length <= 1) return 'unknown';
  const states = snapshots.map(snapshot => snapshot.state as Exclude<DomainState, 'unknown'>);
  const transitions = states.slice(1).map((state, index) => transitionDirection(states[index], state));
  if (snapshots.length === 2) return transitions[0] === 0 ? 'unknown' : 'emerging';
  const positive = transitions.some(value => value > 0);
  const negative = transitions.some(value => value < 0);
  if (positive && negative) return 'mixed';
  if (positive) return 'improving';
  if (negative) return 'declining';
  return 'stable';
}

function trendPattern<D extends HealthDomainId>(
  history: DomainTrendHistory<D> | undefined,
  snapshots: readonly DomainHistorySnapshot<D>[],
  direction: TrendDirection,
): TrendPattern {
  if ((history?.missingPeriods?.length ?? 0) > 0 || snapshots.some(snapshot => snapshot.state === 'unknown')) {
    return 'interrupted_pattern';
  }
  if (history?.patternEvidence?.pattern === 'seasonal_pattern') return 'seasonal_pattern';
  if (direction === 'stable') return 'stable_pattern';
  if (direction === 'emerging' || direction === 'improving' || direction === 'declining') return 'emerging_pattern';
  if (direction === 'mixed') return 'volatile_pattern';
  return 'unknown';
}

function persistence(
  direction: TrendDirection,
  pattern: TrendPattern,
  coverageValue: TrendHistoricalCoverage,
): TrendPersistence {
  const consistent = direction === 'stable' || direction === 'improving' || direction === 'declining'
    || pattern === 'seasonal_pattern';
  if (!consistent || coverageValue.observationCount < 3) return 'unknown';
  if (coverageValue.timeSpan.durationDays >= 365 || coverageValue.observationCount >= 12) return 'long_term';
  if (coverageValue.timeSpan.durationDays >= 90 || coverageValue.observationCount >= 6) return 'established';
  return 'recent';
}

function velocity<D extends HealthDomainId>(
  snapshots: readonly DomainHistorySnapshot<D>[],
  direction: TrendDirection,
  pattern: TrendPattern,
  supportedIntervals: number,
): TrendVelocity {
  if (snapshots.length < 3 || pattern === 'interrupted_pattern'
    || !['improving', 'declining', 'mixed'].includes(direction)) return 'unknown';
  const states = snapshots.map(snapshot => snapshot.state as Exclude<DomainState, 'unknown'>);
  const changes = states.slice(1)
    .filter((state, index) => transitionDirection(states[index], state) !== 0).length;
  if (changes === 0) return 'unknown';
  const intervals = Math.max(supportedIntervals, snapshots.length - 1);
  if (changes >= intervals) return 'rapid';
  if (changes * 3 >= intervals) return 'moderate';
  return 'slow';
}

function explanation<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  snapshots: readonly DomainHistorySnapshot<D>[],
  coverageValue: TrendHistoricalCoverage,
  direction: TrendDirection,
  pattern: TrendPattern,
): DomainTrendState<D>['explanation'] {
  const ids = snapshots.map(snapshot => snapshot.id);
  const count = snapshots.length;
  const collection = count === 1
    ? definition.evidencePolicy.collectionLabel.singular
    : definition.evidencePolicy.collectionLabel.plural;
  const span = coverageValue.timeSpan.durationDays;
  let text: string;
  if (count === 0) text = `${definition.title} trend is unknown because no structured history is available.`;
  else if (count === 1) text = `${definition.title} trend cannot be established from a single ${collection}.`;
  else if (pattern === 'interrupted_pattern') text = `${definition.title} trend cannot be established because the structured history is interrupted.`;
  else if (pattern === 'seasonal_pattern') text = `${definition.title} history contains a declared seasonal pattern across ${count} ${collection} over ${span} days.`;
  else if (direction === 'stable') text = `${definition.title} state remained stable across ${count} ${collection} over ${span} days.`;
  else if (direction === 'improving') text = `${definition.title} state moved in an improving direction across ${count} ${collection} over ${span} days.`;
  else if (direction === 'declining') text = `${definition.title} state moved in a declining direction across ${count} ${collection} over ${span} days.`;
  else if (direction === 'mixed') text = `${definition.title} state moved in mixed directions across ${count} ${collection} over ${span} days.`;
  else if (direction === 'emerging') text = `${definition.title} has an emerging change across ${count} ${collection}; more history is required to establish direction.`;
  else text = `${definition.title} trend cannot be established from the available structured history.`;
  return { text, supportingSnapshotIds: ids };
}

function trendProvenance<D extends HealthDomainId>(
  snapshots: readonly DomainHistorySnapshot<D>[],
  asOf: string,
): TrendProvenanceRecord[] {
  const records = new Map<string, TrendProvenanceRecord>();
  for (const snapshot of snapshots) {
    for (const source of snapshot.provenance) {
      const key = [source.source, source.provider, source.recordedAt,
        source.sourceRecordId ?? '', source.integrationId ?? ''].join('\u0000');
      const existing = records.get(key);
      const ids = existing ? [...existing.supportingSnapshotIds, snapshot.id] : [snapshot.id];
      records.set(key, { ...source, supportingSnapshotIds: [...new Set(ids)] });
    }
  }
  records.set('calculated-trend', {
    source: 'calculated',
    provider: 'Vitalspan Deterministic Trend Engine',
    reliability: 'deterministically_derived',
    recordedAt: asOf,
    integrationId: 'domain-trend-v1',
    supportingSnapshotIds: snapshots.map(snapshot => snapshot.id),
  });
  return [...records.values()];
}

function limitations<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  history: DomainTrendHistory<D> | undefined,
  snapshots: readonly DomainHistorySnapshot<D>[],
  confidence: DomainTrendState<D>['confidence'],
): TrendLimitation[] {
  const values: TrendLimitation[] = [];
  if (snapshots.length <= 1) values.push({ code: 'insufficient_historical_depth',
    message: 'At least three structured domain observations are required to establish direction.' });
  else if (snapshots.length === 2) values.push({ code: 'limited_history',
    message: 'Two observations can identify an emerging change but cannot establish direction.' });
  if ((history?.missingPeriods?.length ?? 0) > 0) values.push({ code: 'missing_observation_window',
    message: 'One or more observation windows are missing.' });
  if (snapshots.some(snapshot => snapshot.state === 'unknown')) values.push({ code: 'unknown_historical_state',
    message: 'At least one historical domain state is unknown.' });
  if (history?.interval === 'irregular') values.push({ code: 'irregular_observation_intervals',
    message: 'Historical observations are explicitly marked as irregular.' });
  const manual = snapshots.some(snapshot => snapshot.provenance.some(item => item.source === 'manual_entry'));
  if (manual && history?.interval === 'irregular') values.push({ code: 'irregular_manual_logging',
    message: 'Manual history contains irregular observation intervals.' });
  if (definition.id === 'blood' && snapshots.length < 3) values.push({ code: 'sparse_laboratory_history',
    message: 'Laboratory history is too sparse to establish a blood trend.' });
  const reliability = confidence.factors.find(factor => factor.id === 'source_reliability')?.level;
  if (reliability === 'insufficient' || reliability === 'limited') values.push({ code: 'source_reliability_limited',
    message: 'Trend confidence is limited by source reliability.' });
  return values;
}

export function interpretDomainTrend<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  history: DomainTrendHistory<D> | undefined,
  asOf: string,
): DomainTrendState<D> {
  if (history) validateHistory(definition, history, asOf);
  const snapshots = cloneAndSort(history?.snapshots ?? []);
  const coverageValue = coverage(history, snapshots);
  const hasInterruption = coverageValue.missingPeriods.length > 0;
  const direction = trendDirection(snapshots, hasInterruption);
  const pattern = trendPattern(history, snapshots, direction);
  const confidence = assessTrendConfidence(definition, snapshots, coverageValue, direction, asOf);
  return {
    domainId: definition.id,
    direction,
    confidence,
    pattern,
    persistence: persistence(direction, pattern, coverageValue),
    velocity: velocity(snapshots, direction, pattern, coverageValue.supportedIntervals),
    historicalCoverage: coverageValue,
    explanation: explanation(definition, snapshots, coverageValue, direction, pattern),
    provenance: trendProvenance(snapshots, asOf),
    limitations: limitations(definition, history, snapshots, confidence),
  };
}
