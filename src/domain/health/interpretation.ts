import { DOMAIN_STATE_LABELS } from './models';
import type {
  DataCompleteness,
  DomainCapabilityId,
  DomainCurrentState,
  DomainEvidenceItem,
  DomainMetric,
  DomainState,
  HealthDomainDefinition,
  HealthDomainId,
  ObservedSignal,
} from './models';

const STATE_PRECEDENCE: Readonly<Record<DomainState, number>> = {
  attention_needed: 0,
  needs_review: 1,
  unknown: 2,
  stable: 3,
  good: 4,
  excellent: 5,
};

interface InterpretedEvidence<D extends HealthDomainId> {
  currentState: DomainCurrentState;
  primaryDriver: DomainEvidenceItem;
  observedSignals: readonly ObservedSignal<DomainCapabilityId<D>>[];
  knownStrengths: readonly DomainEvidenceItem[];
  knownGaps: readonly DomainEvidenceItem[];
  monitoringPriorities: readonly DomainEvidenceItem[];
}

function representativeMetric<D extends HealthDomainId>(
  metrics: readonly DomainMetric<D>[],
): DomainMetric<D> | undefined {
  return [...metrics]
    .filter(metric => Boolean(metric.interpretation))
    .sort((a, b) => {
      const dateDifference = Date.parse(b.observedAt) - Date.parse(a.observedAt);
      return dateDifference !== 0 ? dateDifference : STATE_PRECEDENCE[a.interpretation!.state]
        - STATE_PRECEDENCE[b.interpretation!.state];
    })[0];
}

function uniqueItems(items: readonly DomainEvidenceItem[]): DomainEvidenceItem[] {
  const unique = new Map<string, DomainEvidenceItem>();
  for (const item of items) {
    if (!unique.has(item.text)) unique.set(item.text, item);
  }
  return [...unique.values()];
}

function deriveState(
  signals: readonly ObservedSignal[],
  completeness: DataCompleteness,
): DomainState {
  if (signals.some(signal => signal.state === 'attention_needed')) return 'attention_needed';
  if (signals.some(signal => signal.state === 'needs_review')) return 'needs_review';
  if (completeness.state !== 'complete' || signals.some(signal => signal.state === 'unknown')) return 'unknown';
  if (signals.some(signal => signal.state === 'stable')) return 'stable';
  if (signals.some(signal => signal.state === 'good')) return 'good';
  if (signals.length > 0 && signals.every(signal => signal.state === 'excellent')) return 'excellent';
  return 'unknown';
}

function primaryDriver(
  state: DomainState,
  signals: readonly ObservedSignal[],
): DomainEvidenceItem {
  const matching = signals.find(signal => signal.state === state);
  const selected = matching ?? (state === 'unknown'
    ? signals.find(signal => signal.state === 'unknown')
    : signals.find(signal => signal.state !== 'unknown'));
  if (!selected) {
    return { id: 'primary-driver:insufficient-evidence', text: 'Insufficient evidence', supportingMetricIds: [] };
  }
  return {
    id: `primary-driver:${selected.capability}`,
    text: selected.text,
    supportingMetricIds: selected.supportingMetricIds,
  };
}

export function interpretDomainEvidence<D extends HealthDomainId>(
  definition: HealthDomainDefinition<D>,
  metrics: readonly DomainMetric<D>[],
  completeness: DataCompleteness,
): InterpretedEvidence<D> {
  const signals: ObservedSignal<DomainCapabilityId<D>>[] = [];
  const strengths: DomainEvidenceItem[] = [];
  const gaps: DomainEvidenceItem[] = [];
  const priorities: DomainEvidenceItem[] = [];

  for (const capability of definition.capabilities) {
    const capabilityMetrics = metrics.filter(metric => metric.capability === capability.id);
    const representative = representativeMetric(capabilityMetrics);

    if (!representative) {
      const hasEvidence = capabilityMetrics.length > 0;
      const text = hasEvidence
        ? `${capability.title} evidence is available, but no validated interpretation is available.`
        : capability.missingEvidence;
      const ids = capabilityMetrics.map(metric => metric.id);
      signals.push({
        id: `signal:${capability.id}`,
        capability: capability.id,
        state: 'unknown',
        basis: 'evidence_unavailable',
        basisDescription: hasEvidence
          ? 'Evidence exists, but no validated interpretation metadata was supplied.'
          : 'No source-attributed evidence was supplied for this capability.',
        text,
        supportingMetricIds: ids,
      });
      gaps.push({ id: `gap:${capability.id}`, text, supportingMetricIds: ids });
      priorities.push({
        id: `monitor:${capability.id}`,
        text: capability.monitoringPriority,
        supportingMetricIds: ids,
      });
      continue;
    }

    const interpretation = representative.interpretation!;
    signals.push({
      id: `signal:${capability.id}`,
      capability: capability.id,
      state: interpretation.state,
      basis: interpretation.basis,
      basisDescription: interpretation.basisDescription,
      text: interpretation.observation,
      supportingMetricIds: [representative.id],
    });
    if (interpretation.state === 'excellent' || interpretation.state === 'good') {
      strengths.push({
        id: `strength:${capability.id}`,
        text: interpretation.strength ?? interpretation.observation,
        supportingMetricIds: [representative.id],
      });
    } else if (interpretation.strength) {
      strengths.push({
        id: `strength:${capability.id}`,
        text: interpretation.strength,
        supportingMetricIds: [representative.id],
      });
    }
    if (interpretation.gap || interpretation.state === 'unknown') {
      gaps.push({
        id: `gap:${capability.id}`,
        text: interpretation.gap ?? `Evidence is insufficient to interpret ${capability.title.toLowerCase()}.`,
        supportingMetricIds: [representative.id],
      });
    }
    if (interpretation.monitoringPriority) {
      priorities.push({
        id: `monitor:${capability.id}`,
        text: interpretation.monitoringPriority,
        supportingMetricIds: [representative.id],
      });
    }
  }

  const state = deriveState(signals, completeness);
  const driver = completeness.state === 'none'
    ? { id: 'primary-driver:insufficient-evidence', text: 'Insufficient evidence', supportingMetricIds: [] }
    : primaryDriver(state, signals);
  const driverSentence = driver.text.endsWith('.') ? driver.text.slice(0, -1) : driver.text;
  return {
    currentState: {
      id: `state:${definition.id}`,
      state,
      label: DOMAIN_STATE_LABELS[state],
      text: state === 'unknown'
        ? `Current state is unknown. ${driver.text}${driver.text.endsWith('.') ? '' : '.'}`
        : `${DOMAIN_STATE_LABELS[state]}. Primary driver: ${driverSentence}.`,
      supportingMetricIds: driver.supportingMetricIds,
    },
    primaryDriver: driver,
    observedSignals: signals,
    knownStrengths: uniqueItems(strengths),
    knownGaps: uniqueItems(gaps),
    monitoringPriorities: uniqueItems(priorities),
  };
}
