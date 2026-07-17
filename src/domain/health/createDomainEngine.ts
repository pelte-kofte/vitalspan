import { assessDomainConfidence } from './confidence';
import { interpretDomainEvidence } from './interpretation';
import { interpretDomainTrend } from './trend';
import { SOURCE_RELIABILITY_LEVELS } from './models';
import type {
  DataCompleteness,
  DomainCapabilityId,
  DomainEngineInput,
  DomainLimitation,
  DomainMetric,
  EvidenceSummary,
  HealthDomainDefinition,
  HealthDomainEngine,
  HealthDomainId,
  HealthDomainState,
  MetricProvenance,
} from './models';

function assertTimestamp(value: string, field: string): void {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${field} must be a valid date: ${value}`);
}

function validateInput<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  input: DomainEngineInput<D>,
): void {
  assertTimestamp(input.asOf, `${definition.id}.asOf`);
  const supported = new Set<string>(definition.capabilities.map(capability => capability.id));
  const metricIds = new Set<string>();

  for (const metric of input.metrics ?? []) {
    if (!metric.id.trim()) throw new Error(`${definition.id} metric id cannot be empty`);
    if (metricIds.has(metric.id)) throw new Error(`Duplicate ${definition.id} metric id: ${metric.id}`);
    metricIds.add(metric.id);
    if (!supported.has(metric.capability)) {
      throw new Error(`Unsupported ${definition.id} capability: ${metric.capability}`);
    }
    assertTimestamp(metric.observedAt, `${definition.id}.${metric.id}.observedAt`);
    if (Date.parse(metric.observedAt) > Date.parse(input.asOf)) {
      throw new Error(`${definition.id}.${metric.id}.observedAt cannot be after asOf`);
    }
    if (metric.provenance.length === 0) throw new Error(`${definition.id}.${metric.id} requires provenance`);
    for (const provenance of metric.provenance) {
      if (!provenance.provider.trim()) throw new Error(`${definition.id}.${metric.id} provenance provider cannot be empty`);
      if (!SOURCE_RELIABILITY_LEVELS.includes(provenance.reliability)) {
        throw new Error(`${definition.id}.${metric.id} has unsupported source reliability`);
      }
      assertTimestamp(provenance.recordedAt, `${definition.id}.${metric.id}.provenance.recordedAt`);
      if (Date.parse(provenance.recordedAt) > Date.parse(input.asOf)) {
        throw new Error(`${definition.id}.${metric.id}.provenance.recordedAt cannot be after asOf`);
      }
    }
    if (metric.interpretation && !metric.interpretation.observation.trim()) {
      throw new Error(`${definition.id}.${metric.id} interpretation observation cannot be empty`);
    }
    if (metric.interpretation && !metric.interpretation.basisDescription.trim()) {
      throw new Error(`${definition.id}.${metric.id} interpretation basis description cannot be empty`);
    }
  }

  for (const limitation of input.limitations ?? []) {
    for (const capability of limitation.affectedCapabilities) {
      if (!supported.has(capability)) throw new Error(`Unsupported ${definition.id} limitation capability: ${capability}`);
    }
  }
}

function dataCompleteness<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  metrics: readonly DomainMetric<D>[],
): DataCompleteness {
  const available = new Set(metrics.map(metric => metric.capability));
  const missing = definition.capabilities
    .filter(capability => !available.has(capability.id))
    .map(capability => capability.id);
  const availableCapabilities = definition.capabilities.length - missing.length;
  return {
    state: availableCapabilities === 0 ? 'none' : missing.length === 0 ? 'complete' : 'partial',
    availableCapabilities,
    totalCapabilities: definition.capabilities.length,
    missingCapabilities: missing,
  };
}

function collectProvenance<D extends HealthDomainId>(metrics: readonly DomainMetric<D>[]): MetricProvenance[] {
  const unique = new Map<string, MetricProvenance>();
  for (const metric of metrics) {
    for (const provenance of metric.provenance) {
      const key = [provenance.source, provenance.provider, provenance.recordedAt,
        provenance.sourceRecordId ?? '', provenance.integrationId ?? ''].join('\u0000');
      if (!unique.has(key)) unique.set(key, { ...provenance });
    }
  }
  return [...unique.values()];
}

function latestUpdate<D extends HealthDomainId>(metrics: readonly DomainMetric<D>[]): string | null {
  const timestamps = metrics.flatMap(metric => [metric.observedAt, ...metric.provenance.map(item => item.recordedAt)]);
  return timestamps.length === 0 ? null : timestamps.reduce((latest, current) => (
    Date.parse(current) > Date.parse(latest) ? current : latest
  ));
}

function buildLimitations<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  metrics: readonly DomainMetric<D>[],
  completeness: DataCompleteness,
  supplied: readonly DomainLimitation<DomainCapabilityId<D>>[],
): readonly DomainLimitation<DomainCapabilityId<D>>[] {
  const derived: DomainLimitation<DomainCapabilityId<D>>[] = [];
  if (completeness.state === 'none') {
    derived.push({ code: 'no_data', message: definition.noDataLimitation,
      affectedCapabilities: definition.capabilities.map(capability => capability.id) });
  } else if (completeness.state === 'partial') {
    derived.push({ code: 'missing_capabilities',
      message: `Evidence is unavailable for: ${completeness.missingCapabilities.join(', ')}.`,
      affectedCapabilities: completeness.missingCapabilities as DomainCapabilityId<D>[] });
  }
  const uninterpreted = definition.capabilities
    .filter(capability => metrics.some(metric => metric.capability === capability.id)
      && !metrics.some(metric => metric.capability === capability.id && metric.interpretation))
    .map(capability => capability.id);
  if (uninterpreted.length > 0) {
    derived.push({ code: 'interpretation_unavailable',
      message: `Validated interpretation is unavailable for: ${uninterpreted.join(', ')}.`,
      affectedCapabilities: uninterpreted });
  }
  return [...supplied.map(item => ({ ...item })), ...derived];
}

function evidenceSummary<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  metrics: readonly DomainMetric<D>[],
  provenance: readonly MetricProvenance[],
): EvidenceSummary {
  if (metrics.length === 0) return { text: `No source-attributed ${definition.title.toLowerCase()} evidence is available.`,
    metricCount: 0, collectionCount: 0, providers: [], observedFrom: null, observedTo: null, supportingMetricIds: [] };
  const dates = metrics.map(metric => metric.observedAt).sort((a, b) => Date.parse(a) - Date.parse(b));
  const collections = new Set(metrics.map(metric => metric.collectionId ?? metric.observedAt.slice(0, 10)));
  const providers = [...new Set(provenance.map(item => item.provider))];
  const policy = definition.evidencePolicy;
  const metricLabel = metrics.length === 1 ? policy.metricLabel.singular : policy.metricLabel.plural;
  const collectionLabel = collections.size === 1 ? policy.collectionLabel.singular : policy.collectionLabel.plural;
  return {
    text: `${definition.title} assessment uses ${metrics.length} ${metricLabel} across ${collections.size} ${collectionLabel} from ${providers.join(', ')}.`,
    metricCount: metrics.length,
    collectionCount: collections.size,
    providers,
    observedFrom: dates[0],
    observedTo: dates[dates.length - 1],
    supportingMetricIds: metrics.map(metric => metric.id),
  };
}

function cloneMetrics<D extends HealthDomainId>(metrics: readonly DomainMetric<D>[]): DomainMetric<D>[] {
  return metrics.map(metric => {
    const [first, ...rest] = metric.provenance;
    return { ...metric, interpretation: metric.interpretation ? { ...metric.interpretation } : undefined,
      provenance: [{ ...first }, ...rest.map(item => ({ ...item }))] };
  });
}

export function createDomainEngine<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
): HealthDomainEngine<D> {
  return { id: definition.id, definition, build(input): HealthDomainState<D> {
    const effectiveInput: DomainEngineInput<D> = input ?? { asOf: '1970-01-01T00:00:00.000Z' };
    validateInput(definition, effectiveInput);
    const metrics = cloneMetrics(effectiveInput.metrics ?? []);
    const completeness = dataCompleteness(definition, metrics);
    const provenance = collectProvenance(metrics);
    const interpretation = interpretDomainEvidence(definition, metrics, completeness);
    return { id: definition.id, title: definition.title, ...interpretation,
      futureOpportunities: definition.futureCapabilities.map(item => ({ ...item })),
      limitations: buildLimitations(definition, metrics, completeness, effectiveInput.limitations ?? []),
      evidenceSummary: evidenceSummary(definition, metrics, provenance),
      confidence: assessDomainConfidence(definition, metrics, completeness, effectiveInput.asOf),
      provenance, availableMetrics: metrics, lastUpdated: latestUpdate(metrics), dataCompleteness: completeness,
      trend: interpretDomainTrend(definition, effectiveInput.trendHistory, effectiveInput.asOf) };
  } };
}
