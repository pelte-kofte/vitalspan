import {
  HEALTH_DOMAIN_ENGINES,
  bloodDomainEngine,
  sleepDomainEngine,
  type DomainHistorySnapshot,
  type DomainMetric,
  type DomainState,
  type DomainTrendHistory,
  type HealthDomainId,
  type MetricProvenance,
} from '../domain/health';

const AS_OF = '2026-07-17T12:00:00.000Z';

const appleHealth: MetricProvenance = {
  source: 'apple_health',
  provider: 'Apple Health',
  reliability: 'device_recorded',
  recordedAt: '2026-07-17T08:00:00.000Z',
  integrationId: 'healthkit',
};

const laboratory: MetricProvenance = {
  source: 'laboratory',
  provider: 'Example Laboratory',
  reliability: 'clinically_verified',
  recordedAt: '2026-07-17T09:00:00.000Z',
  sourceRecordId: 'lab-history',
};

function snapshot<D extends HealthDomainId>(
  domainId: D,
  id: string,
  state: DomainState,
  observedAt: string,
  provenance: MetricProvenance = appleHealth,
): DomainHistorySnapshot<D> {
  return {
    id,
    domainId,
    state,
    observedAt,
    provenance: [provenance],
    supportingMetricIds: [`metric:${id}`],
  };
}

function sleepHistory(
  snapshots: readonly DomainHistorySnapshot<'sleep'>[],
  overrides: Partial<DomainTrendHistory<'sleep'>> = {},
): DomainTrendHistory<'sleep'> {
  return {
    snapshots,
    interval: 'daily',
    supportedIntervals: Math.max(0, snapshots.length - 1),
    ...overrides,
  };
}

function buildSleepTrend(
  snapshots: readonly DomainHistorySnapshot<'sleep'>[],
  overrides: Partial<DomainTrendHistory<'sleep'>> = {},
) {
  return sleepDomainEngine.build({
    asOf: AS_OF,
    trendHistory: sleepHistory(snapshots, overrides),
  }).trend;
}

describe('domain trend intelligence', () => {
  test('exposes an independent unknown trend from every domain when history is absent', () => {
    for (const [id, engine] of Object.entries(HEALTH_DOMAIN_ENGINES)) {
      const trend = engine.build().trend;
      expect(trend).toMatchObject({
        domainId: id,
        direction: 'unknown',
        pattern: 'unknown',
        persistence: 'unknown',
        velocity: 'unknown',
        historicalCoverage: { observationCount: 0, supportedIntervals: 0 },
        confidence: { level: 'insufficient' },
      });
      expect(trend.explanation.text).toMatch(/no structured history/i);
      expect(trend.limitations.map(item => item.code)).toContain('insufficient_historical_depth');
    }
  });

  test('never infers a trend from a single observation', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'good', '2026-07-16T08:00:00.000Z'),
    ]);
    expect(trend).toMatchObject({
      direction: 'unknown', pattern: 'unknown', persistence: 'unknown', velocity: 'unknown',
      confidence: { level: 'insufficient' },
    });
    expect(trend.explanation).toEqual({
      text: 'Sleep trend cannot be established from a single night.',
      supportingSnapshotIds: ['night-1'],
    });
  });

  test('uses two changing observations only as an emerging trend', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'needs_review', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'stable', '2026-07-16T08:00:00.000Z'),
    ]);
    expect(trend).toMatchObject({
      direction: 'emerging', pattern: 'emerging_pattern',
      persistence: 'unknown', velocity: 'unknown', confidence: { level: 'limited' },
    });
    expect(trend.limitations).toEqual([expect.objectContaining({ code: 'limited_history' })]);
  });

  test('requires three known observations before establishing a stable trend', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'good', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'good', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'good', '2026-07-16T08:00:00.000Z'),
    ]);
    expect(trend).toMatchObject({
      direction: 'stable', pattern: 'stable_pattern', persistence: 'recent', velocity: 'unknown',
    });
    expect(trend.explanation.text).toBe('Sleep state remained stable across 3 nights over 2 days.');
  });

  test('derives improving direction only from consistent semantic state transitions', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'needs_review', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'stable', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'good', '2026-07-16T08:00:00.000Z'),
    ]);
    expect(trend).toMatchObject({
      direction: 'improving', pattern: 'emerging_pattern', persistence: 'recent', velocity: 'rapid',
    });
    expect(trend.explanation.text).toMatch(/improving direction across 3 nights/i);
  });

  test('derives declining direction without implying danger or diagnosis', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'excellent', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'good', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'stable', '2026-07-16T08:00:00.000Z'),
    ]);
    expect(trend).toMatchObject({ direction: 'declining', pattern: 'emerging_pattern', velocity: 'rapid' });
    expect(trend.explanation.text).toMatch(/declining direction/i);
    expect(trend.explanation.text).not.toMatch(/danger|disease|diagnos/i);
  });

  test('preserves mixed direction as a volatile observed pattern', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'good', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'needs_review', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'good', '2026-07-16T08:00:00.000Z'),
    ]);
    expect(trend).toMatchObject({
      direction: 'mixed', pattern: 'volatile_pattern', persistence: 'unknown', velocity: 'rapid',
    });
    expect(trend.confidence.factors.find(item => item.id === 'directional_consistency')?.level)
      .toBe('moderate');
  });

  test('an interrupted observation window forces unknown direction', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'needs_review', '2026-07-10T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'stable', '2026-07-12T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'good', '2026-07-16T08:00:00.000Z'),
    ], {
      missingPeriods: [{
        from: '2026-07-13T00:00:00.000Z', to: '2026-07-15T00:00:00.000Z',
        reason: 'Wearable disconnected',
      }],
    });
    expect(trend).toMatchObject({
      direction: 'unknown', pattern: 'interrupted_pattern',
      persistence: 'unknown', velocity: 'unknown', confidence: { level: 'insufficient' },
    });
    expect(trend.limitations.map(item => item.code)).toContain('missing_observation_window');
  });

  test('an unknown historical state is never converted to stable', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'good', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'unknown', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'good', '2026-07-16T08:00:00.000Z'),
    ]);
    expect(trend.direction).toBe('unknown');
    expect(trend.pattern).toBe('interrupted_pattern');
    expect(trend.limitations.map(item => item.code)).toContain('unknown_historical_state');
  });

  test('models source-declared seasonal behavior without inferring clinical meaning', () => {
    const snapshots = [
      snapshot('sleep', 'season-1', 'stable', '2025-01-01T08:00:00.000Z'),
      snapshot('sleep', 'season-2', 'good', '2025-07-01T08:00:00.000Z'),
      snapshot('sleep', 'season-3', 'stable', '2026-01-01T08:00:00.000Z'),
      snapshot('sleep', 'season-4', 'good', '2026-07-01T08:00:00.000Z'),
    ];
    const trend = buildSleepTrend(snapshots, {
      interval: 'monthly',
      supportedIntervals: 18,
      patternEvidence: {
        pattern: 'seasonal_pattern',
        explanation: 'Repeated seasonal phases were supplied by the domain history adapter.',
        supportingSnapshotIds: ['season-1', 'season-2', 'season-3', 'season-4'],
      },
    });
    expect(trend.pattern).toBe('seasonal_pattern');
    expect(trend.persistence).toBe('long_term');
    expect(trend.explanation.text).toMatch(/declared seasonal pattern/i);
  });

  test.each([
    [10, 'slow'],
    [3, 'moderate'],
    [2, 'moderate'],
  ] as const)('classifies observed change over %i supported intervals as %s velocity', (
    supportedIntervals, expected,
  ) => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'needs_review', '2026-07-13T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'needs_review', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'stable', '2026-07-16T08:00:00.000Z'),
    ], { supportedIntervals });
    expect(trend.velocity).toBe(expected);
  });

  test.each([
    ['2026-07-14T08:00:00.000Z', 'recent'],
    ['2026-03-01T08:00:00.000Z', 'established'],
    ['2025-07-01T08:00:00.000Z', 'long_term'],
  ] as const)('classifies persistence from %s as %s', (startedAt, expected) => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'stable', startedAt),
      snapshot('sleep', 'night-2', 'stable', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'stable', '2026-07-16T08:00:00.000Z'),
    ]);
    expect(trend.persistence).toBe(expected);
  });

  test('exposes complete structured historical coverage in chronological order', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-3', 'good', '2026-07-16T08:00:00.000Z'),
      snapshot('sleep', 'night-1', 'needs_review', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'stable', '2026-07-15T08:00:00.000Z'),
    ], { supportedIntervals: 2 });
    expect(trend.historicalCoverage).toEqual({
      historyLength: { value: 2, unit: 'days' },
      observationCount: 3,
      timeSpan: {
        startedAt: '2026-07-14T08:00:00.000Z',
        endedAt: '2026-07-16T08:00:00.000Z',
        durationDays: 2,
      },
      interval: 'daily',
      supportedIntervals: 2,
      missingPeriods: [],
    });
    expect(trend.explanation.supportingSnapshotIds).toEqual(['night-1', 'night-2', 'night-3']);
  });

  test('low-confidence irregular manual history remains separate from trend direction', () => {
    const manual: MetricProvenance = {
      source: 'manual_entry', provider: 'Manual Entry', reliability: 'self_reported',
      recordedAt: '2026-07-17T07:00:00.000Z',
    };
    const snapshots = Array.from({ length: 5 }, (_, index) => snapshot(
      'sleep', `manual-${index}`, 'stable', `2026-07-${String(10 + index).padStart(2, '0')}T08:00:00.000Z`, manual,
    ));
    const trend = buildSleepTrend(snapshots, { interval: 'irregular' });
    expect(trend.direction).toBe('stable');
    expect(trend.confidence.level).toBe('limited');
    expect(trend.limitations.map(item => item.code)).toEqual(expect.arrayContaining([
      'irregular_observation_intervals', 'irregular_manual_logging', 'source_reliability_limited',
    ]));
  });

  test('high confidence requires adequate, continuous, fresh, reliable history', () => {
    const snapshots = Array.from({ length: 5 }, (_, index) => snapshot(
      'sleep', `night-${index}`, 'stable', `2026-07-${String(12 + index).padStart(2, '0')}T08:00:00.000Z`,
    ));
    const trend = buildSleepTrend(snapshots);
    expect(trend.confidence.level).toBe('high');
    expect(trend.confidence.factors.map(item => item.id)).toEqual([
      'historical_depth', 'continuity', 'freshness', 'source_reliability', 'directional_consistency',
    ]);
    expect(Object.fromEntries(trend.confidence.factors.map(item => [item.id, item.level]))).toEqual({
      historical_depth: 'high', continuity: 'very_high', freshness: 'very_high',
      source_reliability: 'high', directional_consistency: 'very_high',
    });
  });

  test('trend confidence is independent from health-quality state labels', () => {
    const dates = ['2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16'];
    const excellent = buildSleepTrend(dates.map((date, index) => snapshot(
      'sleep', `excellent-${index}`, 'excellent', `${date}T08:00:00.000Z`,
    )));
    const attention = buildSleepTrend(dates.map((date, index) => snapshot(
      'sleep', `attention-${index}`, 'attention_needed', `${date}T08:00:00.000Z`,
    )));
    expect(excellent.direction).toBe('stable');
    expect(attention.direction).toBe('stable');
    expect(excellent.confidence).toEqual(attention.confidence);
  });

  test('clinically verified long history can produce very high trend confidence', () => {
    const snapshots = Array.from({ length: 12 }, (_, index) => snapshot(
      'blood', `visit-${index}`, 'stable',
      new Date(Date.UTC(2025, 7 + index, 1, 8)).toISOString(), laboratory,
    ));
    const trend = bloodDomainEngine.build({
      asOf: AS_OF,
      trendHistory: { snapshots, interval: 'monthly', supportedIntervals: 11 },
    }).trend;
    expect(trend.confidence.level).toBe('very_high');
    expect(trend.explanation.text).toMatch(/12 visits/);
    expect(trend.provenance.map(item => item.source)).toEqual(['laboratory', 'calculated']);
    expect(trend.provenance.at(-1)).toMatchObject({
      provider: 'Vitalspan Deterministic Trend Engine',
      reliability: 'deterministically_derived',
      supportingSnapshotIds: snapshots.map(item => item.id),
    });
  });

  test('current state and trend direction remain independent concepts', () => {
    const capabilities: DomainMetric<'sleep'>['capability'][] = ['duration', 'consistency', 'efficiency', 'timing'];
    const metrics: DomainMetric<'sleep'>[] = capabilities.map(capability => ({
      id: `sleep-${capability}`, capability, label: capability, value: 'observed',
      collectionId: 'night-current', observedAt: '2026-07-16T08:00:00.000Z', provenance: [appleHealth],
      interpretation: {
        state: 'good', observation: `${capability} is currently good`, basis: 'direct_observation',
        basisDescription: 'Current structured evidence.', consistency: 'consistent',
      },
    }));
    const state = sleepDomainEngine.build({
      asOf: AS_OF,
      metrics,
      trendHistory: sleepHistory([
        snapshot('sleep', 'night-1', 'excellent', '2026-07-14T08:00:00.000Z'),
        snapshot('sleep', 'night-2', 'good', '2026-07-15T08:00:00.000Z'),
        snapshot('sleep', 'night-3', 'stable', '2026-07-16T08:00:00.000Z'),
      ]),
    });
    expect(state.currentState.state).toBe('good');
    expect(state.trend.direction).toBe('declining');
  });

  test('rejects raw, cross-domain, duplicate, future, and invalid pattern history', () => {
    const rawSnapshot = {
      ...snapshot('sleep', 'raw', 'stable', '2026-07-16T08:00:00.000Z'),
      value: 42,
    } as unknown as DomainHistorySnapshot<'sleep'>;
    expect(() => buildSleepTrend([rawSnapshot])).toThrow(/unsupported fields: value/i);

    const crossDomain = snapshot('blood', 'blood-1', 'stable', '2026-07-16T08:00:00.000Z') as unknown as DomainHistorySnapshot<'sleep'>;
    expect(() => buildSleepTrend([crossDomain])).toThrow(/cannot consume blood history/i);

    const duplicateTime = [
      snapshot('sleep', 'a', 'stable', '2026-07-16T08:00:00.000Z'),
      snapshot('sleep', 'b', 'good', '2026-07-16T08:00:00.000Z'),
    ];
    expect(() => buildSleepTrend(duplicateTime)).toThrow(/unique timestamps/i);

    expect(() => buildSleepTrend([
      snapshot('sleep', 'future', 'stable', '2027-01-01T08:00:00.000Z'),
    ])).toThrow(/cannot be after asOf/i);

    expect(() => buildSleepTrend([
      snapshot('sleep', 'season-1', 'stable', '2026-06-01T08:00:00.000Z'),
      snapshot('sleep', 'season-2', 'good', '2026-07-01T08:00:00.000Z'),
    ], {
      patternEvidence: {
        pattern: 'seasonal_pattern', explanation: 'Pattern supplied.',
        supportingSnapshotIds: ['season-1', 'missing'],
      },
    })).toThrow(/references unknown snapshot/i);
  });

  test('is deterministic and fully understandable without motion', () => {
    const history = sleepHistory([
      snapshot('sleep', 'night-1', 'needs_review', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'stable', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'good', '2026-07-16T08:00:00.000Z'),
    ]);
    const first = sleepDomainEngine.build({ asOf: AS_OF, trendHistory: history }).trend;
    const second = sleepDomainEngine.build({ asOf: AS_OF, trendHistory: history }).trend;
    expect(first).toEqual(second);
    expect(first.explanation.text.length).toBeGreaterThan(20);
    expect(Object.keys(first).join(' ')).not.toMatch(/motion|animation/i);
  });

  test('contains no prediction, biological-age, mortality, lifespan, treatment, or global trend fields', () => {
    const trend = buildSleepTrend([
      snapshot('sleep', 'night-1', 'stable', '2026-07-14T08:00:00.000Z'),
      snapshot('sleep', 'night-2', 'stable', '2026-07-15T08:00:00.000Z'),
      snapshot('sleep', 'night-3', 'stable', '2026-07-16T08:00:00.000Z'),
    ]);
    const keys = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.flatMap(keys);
      if (!value || typeof value !== 'object') return [];
      return Object.entries(value).flatMap(([key, child]) => [key, ...keys(child)]);
    };
    expect(keys(trend).join(' ')).not.toMatch(
      /predict|biological.?age|mortality|lifespan|treatment|global.?trend|health.?score/i,
    );
  });
});
