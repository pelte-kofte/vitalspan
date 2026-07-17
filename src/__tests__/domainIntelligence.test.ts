import {
  bloodDomainEngine,
  sleepDomainEngine,
  therapyDomainEngine,
  type DomainMetric,
  type DomainState,
  type MetricInterpretation,
  type MetricProvenance,
} from '../domain/health';

const AS_OF = '2026-07-17T12:00:00.000Z';

const appleHealth: MetricProvenance = {
  source: 'apple_health', provider: 'Apple Health', reliability: 'device_recorded',
  recordedAt: '2026-07-17T08:00:00.000Z', integrationId: 'healthkit',
};

const laboratory: MetricProvenance = {
  source: 'laboratory', provider: 'Example Laboratory', reliability: 'clinically_verified',
  recordedAt: '2026-07-17T09:00:00.000Z', sourceRecordId: 'report-1',
};

function interpretation(
  state: DomainState,
  observation: string,
  overrides: Partial<MetricInterpretation> = {},
): MetricInterpretation {
  return {
    state, observation, basis: 'direct_observation',
    basisDescription: 'Observed directly by the source.',
    consistency: 'consistent', ...overrides,
  };
}

function sleepMetric(
  capability: DomainMetric<'sleep'>['capability'],
  state: DomainState,
  observation: string,
  overrides: Partial<DomainMetric<'sleep'>> = {},
): DomainMetric<'sleep'> {
  return {
    id: `sleep-${capability}`,
    capability,
    label: capability,
    value: 'source observation',
    collectionId: 'night-1',
    observedAt: '2026-07-16T22:00:00.000Z',
    provenance: [appleHealth],
    interpretation: interpretation(state, observation),
    ...overrides,
  };
}

function completeSleepMetrics(overrides: Partial<Record<DomainMetric<'sleep'>['capability'], DomainMetric<'sleep'>>> = {}): DomainMetric<'sleep'>[] {
  return [
    overrides.duration ?? sleepMetric('duration', 'good', 'Sleep duration adequate'),
    overrides.consistency ?? sleepMetric('consistency', 'good', 'Sleep schedule consistent'),
    overrides.efficiency ?? sleepMetric('efficiency', 'good', 'Sleep efficiency adequate'),
    overrides.timing ?? sleepMetric('timing', 'good', 'Sleep timing consistent'),
  ];
}

describe('domain intelligence pipeline', () => {
  test.each<readonly [DomainState, DomainState]>([
    ['excellent', 'excellent'],
    ['good', 'good'],
    ['stable', 'stable'],
    ['needs_review', 'needs_review'],
    ['attention_needed', 'attention_needed'],
    ['unknown', 'unknown'],
  ])('deterministically resolves %s evidence to %s', (signalState, expected) => {
    const metrics = completeSleepMetrics(Object.fromEntries(
      ['duration', 'consistency', 'efficiency', 'timing'].map(capability => [
        capability,
        sleepMetric(capability as DomainMetric<'sleep'>['capability'], signalState, `${capability} observation`),
      ]),
    ));
    expect(sleepDomainEngine.build({ asOf: AS_OF, metrics }).currentState.state).toBe(expected);
  });

  test('uses conservative state precedence without averaging or scoring', () => {
    const needsReview = sleepMetric('consistency', 'needs_review', 'Late sleep consistency', {
      interpretation: interpretation('needs_review', 'Late sleep consistency', {
        basis: 'longitudinal_pattern',
        gap: 'Sleep timing history covers only seven nights.',
        monitoringPriority: 'Increase sleep timing history.',
      }),
    });
    const state = sleepDomainEngine.build({
      asOf: AS_OF,
      metrics: completeSleepMetrics({ consistency: needsReview }),
    });
    expect(state.currentState).toMatchObject({
      state: 'needs_review', label: 'Needs Review', supportingMetricIds: ['sleep-consistency'],
    });
    expect(state.primaryDriver).toEqual({
      id: 'primary-driver:consistency', text: 'Late sleep consistency',
      supportingMetricIds: ['sleep-consistency'],
    });
    expect(state.currentState.text).toBe('Needs Review. Primary driver: Late sleep consistency.');
    expect('score' in state).toBe(false);
  });

  test('uses the latest interpreted observation for each capability', () => {
    const old = sleepMetric('duration', 'attention_needed', 'Older duration observation', {
      id: 'duration-old', observedAt: '2026-07-01T22:00:00.000Z', collectionId: 'night-old',
    });
    const current = sleepMetric('duration', 'good', 'Current duration observation', {
      id: 'duration-current', observedAt: '2026-07-16T22:00:00.000Z',
    });
    const state = sleepDomainEngine.build({
      asOf: AS_OF,
      metrics: [old, current, ...completeSleepMetrics().filter(item => item.capability !== 'duration')],
    });
    expect(state.currentState.state).toBe('good');
    expect(state.observedSignals.find(item => item.capability === 'duration')).toMatchObject({
      text: 'Current duration observation', supportingMetricIds: ['duration-current'],
    });
  });

  test('emits structured observations only and references their evidence', () => {
    const state = sleepDomainEngine.build({ asOf: AS_OF, metrics: completeSleepMetrics() });
    expect(state.observedSignals).toHaveLength(4);
    expect(state.observedSignals.map(item => item.text)).toEqual([
      'Sleep duration adequate', 'Sleep schedule consistent',
      'Sleep efficiency adequate', 'Sleep timing consistent',
    ]);
    expect(state.observedSignals.every(item => item.supportingMetricIds.length === 1)).toBe(true);
    expect(state.observedSignals.every(item => item.basis === 'direct_observation')).toBe(true);
    expect(state.observedSignals.every(item => item.basisDescription.length > 10)).toBe(true);
  });

  test('derives positive evidence without turning stable or unknown evidence into strengths', () => {
    const stableTiming = sleepMetric('timing', 'stable', 'Sleep timing stable');
    const state = sleepDomainEngine.build({
      asOf: AS_OF,
      metrics: completeSleepMetrics({ timing: stableTiming }),
    });
    expect(state.knownStrengths.map(item => item.text)).toEqual([
      'Sleep duration adequate', 'Sleep schedule consistent', 'Sleep efficiency adequate',
    ]);
    expect(state.knownStrengths.every(item => item.supportingMetricIds.length > 0)).toBe(true);
  });

  test('turns missing evidence into factual gaps, unknown signals, and monitoring priorities', () => {
    const state = sleepDomainEngine.build({
      asOf: AS_OF,
      metrics: [sleepMetric('duration', 'good', 'Sleep duration adequate')],
    });
    expect(state.currentState.state).toBe('unknown');
    expect(state.primaryDriver.text).toBe('Sleep consistency history unavailable.');
    expect(state.observedSignals.find(item => item.capability === 'efficiency')).toMatchObject({
      state: 'unknown', text: 'Sleep efficiency unavailable.', basis: 'evidence_unavailable',
      supportingMetricIds: [],
    });
    expect(state.knownGaps.map(item => item.text)).toEqual([
      'Sleep consistency history unavailable.',
      'Sleep efficiency unavailable.',
      'Sleep timing unavailable.',
    ]);
    expect(state.monitoringPriorities.map(item => item.text)).toEqual([
      'Increase sleep history to observe consistency.',
      'Capture sleep efficiency in future monitoring.',
      'Capture sleep and wake timing.',
    ]);
  });

  test('does not manufacture a conclusion from present but uninterpreted metrics', () => {
    const state = sleepDomainEngine.build({
      asOf: AS_OF,
      metrics: completeSleepMetrics().map(metric => ({ ...metric, interpretation: undefined })),
    });
    expect(state.currentState.state).toBe('unknown');
    expect(state.knownStrengths).toEqual([]);
    expect(state.observedSignals.every(signal => signal.state === 'unknown')).toBe(true);
    expect(state.limitations).toEqual([expect.objectContaining({ code: 'interpretation_unavailable' })]);
  });

  test('creates a provenance-referencing evidence summary with historical depth', () => {
    const metrics: DomainMetric<'blood'>[] = Array.from({ length: 8 }, (_, index) => ({
      id: `blood-${index}`,
      capability: index < 4 ? 'biomarkers' : 'inflammation',
      label: `Biomarker ${index + 1}`,
      value: index + 1,
      unit: 'unit',
      collectionId: index < 4 ? 'visit-1' : 'visit-2',
      observedAt: index < 4 ? '2026-05-01T08:00:00.000Z' : '2026-07-01T08:00:00.000Z',
      provenance: [laboratory],
      interpretation: interpretation('stable', `Biomarker ${index + 1} stable`, { basis: 'source_reference' }),
    }));
    const state = bloodDomainEngine.build({ asOf: AS_OF, metrics });
    expect(state.evidenceSummary).toMatchObject({
      text: 'Blood assessment uses 8 laboratory biomarkers across 2 visits from Example Laboratory.',
      metricCount: 8,
      collectionCount: 2,
      providers: ['Example Laboratory'],
      supportingMetricIds: metrics.map(metric => metric.id),
    });
    expect(state.evidenceSummary.observedFrom).toBe('2026-05-01T08:00:00.000Z');
    expect(state.evidenceSummary.observedTo).toBe('2026-07-01T08:00:00.000Z');
  });

  test('explains confidence through all five evidence-quality factors', () => {
    const metrics = completeSleepMetrics();
    for (let day = 2; day <= 28; day += 1) {
      metrics.push(sleepMetric('duration', 'good', 'Sleep duration adequate', {
        id: `sleep-duration-${day}`,
        collectionId: `night-${day}`,
        observedAt: new Date(Date.UTC(2026, 5, 18 + day, 22)).toISOString(),
      }));
    }
    const state = sleepDomainEngine.build({ asOf: AS_OF, metrics });
    expect(state.confidence.level).toBe('high');
    expect(state.confidence.factors.map(item => item.id)).toEqual([
      'completeness', 'consistency', 'freshness', 'source_reliability', 'historical_depth',
    ]);
    expect(Object.fromEntries(state.confidence.factors.map(item => [item.id, item.level]))).toEqual({
      completeness: 'very_high', consistency: 'very_high', freshness: 'very_high',
      source_reliability: 'high', historical_depth: 'very_high',
    });
  });

  test('confidence is constrained independently by partial, stale, mixed, and self-reported evidence', () => {
    const partial = sleepDomainEngine.build({
      asOf: AS_OF, metrics: [sleepMetric('duration', 'good', 'Sleep duration adequate')],
    });
    expect(partial.confidence.level).toBe('limited');
    expect(partial.confidence.factors.find(item => item.id === 'completeness')?.level).toBe('limited');

    const stale = sleepDomainEngine.build({ asOf: AS_OF, metrics: completeSleepMetrics().map(metric => ({
      ...metric, observedAt: '2026-05-01T22:00:00.000Z', collectionId: `${metric.id}-old`,
    })) });
    expect(stale.confidence.factors.find(item => item.id === 'freshness')?.level).toBe('limited');

    const mixed = sleepDomainEngine.build({ asOf: AS_OF, metrics: completeSleepMetrics({
      consistency: sleepMetric('consistency', 'stable', 'Sleep consistency mixed', {
        interpretation: interpretation('stable', 'Sleep consistency mixed', { consistency: 'mixed' }),
      }),
    }) });
    expect(mixed.confidence.factors.find(item => item.id === 'consistency')?.level).toBe('moderate');

    const manual: MetricProvenance = {
      source: 'manual_entry', provider: 'Manual Entry', reliability: 'self_reported',
      recordedAt: '2026-07-17T08:00:00.000Z',
    };
    const selfReported = sleepDomainEngine.build({ asOf: AS_OF,
      metrics: completeSleepMetrics().map(metric => ({ ...metric, provenance: [manual] })) });
    expect(selfReported.confidence.factors.find(item => item.id === 'source_reliability')?.level).toBe('limited');
  });

  test('can reach very high confidence without implying health quality', () => {
    const capabilities: DomainMetric<'blood'>['capability'][] = ['biomarkers', 'inflammation', 'cardiometabolic'];
    const metrics: DomainMetric<'blood'>[] = capabilities.map((capability, index) => ({
      id: `blood-${capability}`, capability, label: capability, value: 'observed',
      collectionId: `visit-${index + 1}`, observedAt: `2026-07-0${index + 1}T08:00:00.000Z`,
      provenance: [laboratory],
      interpretation: interpretation('needs_review', `${capability} requires review`, { basis: 'source_reference' }),
    }));
    const state = bloodDomainEngine.build({ asOf: AS_OF, metrics });
    expect(state.confidence.level).toBe('very_high');
    expect(state.currentState.state).toBe('needs_review');
  });

  test('preserves supplied limitations and exposes future opportunities without activating them', () => {
    const state = therapyDomainEngine.build({
      asOf: AS_OF,
      limitations: [{ code: 'records_unverified', message: 'Therapy records are unverified.',
        affectedCapabilities: ['protocols'] }],
    });
    expect(state.limitations[0]).toEqual({
      code: 'records_unverified', message: 'Therapy records are unverified.',
      affectedCapabilities: ['protocols'],
    });
    expect(state.futureOpportunities).toEqual([
      expect.objectContaining({ id: 'future_longevity_interventions', availability: 'future' }),
    ]);
  });

  test('is pure and deterministic for the same evidence and evaluation time', () => {
    const input = { asOf: AS_OF, metrics: completeSleepMetrics() } as const;
    expect(sleepDomainEngine.build(input)).toEqual(sleepDomainEngine.build(input));
  });

  test('does not expose recommendation, diagnosis, age, lifespan, mortality, or score outputs', () => {
    const state = sleepDomainEngine.build({ asOf: AS_OF, metrics: completeSleepMetrics() });
    const keys = Object.keys(state).join(' ');
    expect(keys).not.toMatch(/recommendation|diagnosis|age|lifespan|mortality|score/i);
  });
});
