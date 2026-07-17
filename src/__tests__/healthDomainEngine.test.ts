import {
  BLOOD_DOMAIN_DEFINITION,
  DOMAIN_CONFIDENCE_LABELS,
  DOMAIN_STATE_LABELS,
  GENETICS_DOMAIN_PLACEHOLDER,
  HEALTH_DOMAIN_ENGINES,
  HEALTH_DOMAIN_IDS,
  PROVENANCE_SOURCES,
  buildHealthDomains,
  sleepDomainEngine,
  type DomainMetric,
  type MetricProvenance,
} from '../domain/health';

const AS_OF = '2026-07-17T12:00:00.000Z';

const appleHealth: MetricProvenance = {
  source: 'apple_health',
  provider: 'Apple Health',
  reliability: 'device_recorded',
  recordedAt: '2026-07-17T06:00:00.000Z',
  sourceRecordId: 'apple-sleep-1',
  integrationId: 'healthkit',
};

function sleepMetric(
  id: string,
  capability: DomainMetric<'sleep'>['capability'],
  value: number | string,
): DomainMetric<'sleep'> {
  return { id, capability, label: capability, value, collectionId: 'night-1',
    observedAt: '2026-07-16T22:00:00.000Z', provenance: [appleHealth] };
}

describe('multimodal health-domain foundation', () => {
  test('registers exactly the ten independent executable domains', () => {
    expect(HEALTH_DOMAIN_IDS).toEqual([
      'blood', 'sleep', 'recovery', 'fitness', 'nutrition',
      'lifestyle', 'medication', 'supplement', 'peptide', 'therapy',
    ]);
    expect(Object.keys(HEALTH_DOMAIN_ENGINES)).toEqual(HEALTH_DOMAIN_IDS);
    expect(new Set(Object.values(HEALTH_DOMAIN_ENGINES)).size).toBe(10);
  });

  test('retains the Phase 3.1 capability boundary for every domain', () => {
    expect(Object.fromEntries(Object.entries(HEALTH_DOMAIN_ENGINES).map(([id, engine]) => [
      id, engine.definition.capabilities.map(capability => capability.id),
    ]))).toEqual({
      blood: ['biomarkers', 'inflammation', 'cardiometabolic'],
      sleep: ['duration', 'consistency', 'efficiency', 'timing'],
      recovery: ['hrv', 'resting_heart_rate', 'recovery_score', 'body_temperature'],
      fitness: ['vo2max', 'activity', 'strength', 'mobility'],
      nutrition: ['protein', 'fiber', 'hydration', 'energy_balance'],
      lifestyle: ['smoking', 'alcohol', 'stress', 'sunlight'],
      medication: ['current_medications', 'history', 'monitoring'],
      supplement: ['active_supplements', 'adherence', 'scheduling'],
      peptide: ['cycles', 'dose', 'storage', 'injection_schedule', 'monitoring'],
      therapy: ['protocols', 'recovery_therapies'],
    });
  });

  test('exposes the same intelligence contract from every domain', () => {
    const expectedKeys = [
      'availableMetrics', 'confidence', 'currentState', 'dataCompleteness',
      'evidenceSummary', 'futureOpportunities', 'id', 'knownGaps', 'knownStrengths',
      'lastUpdated', 'limitations', 'monitoringPriorities', 'observedSignals',
      'primaryDriver', 'provenance', 'title', 'trend',
    ];
    for (const domain of buildHealthDomains()) {
      expect(Object.keys(domain).sort()).toEqual(expectedKeys);
      expect(domain.currentState.state).toBe('unknown');
      expect(domain.primaryDriver.text).toBe('Insufficient evidence');
      expect(domain.confidence.level).toBe('insufficient');
      expect(domain.knownStrengths).toEqual([]);
      expect(domain.limitations.length).toBeGreaterThan(0);
      expect(domain.observedSignals).toHaveLength(
        HEALTH_DOMAIN_ENGINES[domain.id].definition.capabilities.length,
      );
      expect(domain.observedSignals.every(signal => signal.state === 'unknown')).toBe(true);
      expect(domain.knownGaps.length).toBe(domain.observedSignals.length);
      expect(domain.monitoringPriorities.length).toBe(domain.observedSignals.length);
      expect(domain.trend).toMatchObject({
        domainId: domain.id,
        direction: 'unknown',
        pattern: 'unknown',
        persistence: 'unknown',
        velocity: 'unknown',
        confidence: { level: 'insufficient' },
      });
    }
  });

  test('uses shared semantic labels without presentation colors', () => {
    expect(DOMAIN_STATE_LABELS).toEqual({
      excellent: 'Excellent', good: 'Good', stable: 'Stable', needs_review: 'Needs Review',
      attention_needed: 'Attention Needed', unknown: 'Unknown',
    });
    expect(DOMAIN_CONFIDENCE_LABELS.high).toBe('High');
    expect(Object.keys(DOMAIN_STATE_LABELS).some(key => /color|tone/i.test(key))).toBe(false);
  });

  test('models completeness separately and does not interpret arbitrary values', () => {
    const partial = sleepDomainEngine.build({
      asOf: AS_OF,
      metrics: [sleepMetric('sleep-duration', 'duration', 7.5)],
    });
    expect(partial.dataCompleteness).toEqual({
      state: 'partial', availableCapabilities: 1, totalCapabilities: 4,
      missingCapabilities: ['consistency', 'efficiency', 'timing'],
    });
    expect(partial.currentState.state).toBe('unknown');
    expect(partial.knownStrengths).toEqual([]);
    expect(partial.limitations.map(item => item.code)).toEqual([
      'missing_capabilities', 'interpretation_unavailable',
    ]);
  });

  test('preserves metric and aggregate provenance without losing sources', () => {
    const laboratory: MetricProvenance = {
      source: 'laboratory', provider: 'Example Laboratory', reliability: 'clinically_verified',
      recordedAt: '2026-07-17T07:00:00.000Z', sourceRecordId: 'lab-123',
    };
    const state = sleepDomainEngine.build({ asOf: AS_OF, metrics: [{
      ...sleepMetric('sleep-duration', 'duration', 7.5), provenance: [appleHealth, laboratory],
    }] });
    expect(state.availableMetrics[0].provenance).toEqual([appleHealth, laboratory]);
    expect(state.provenance).toEqual([appleHealth, laboratory]);
    expect(state.lastUpdated).toBe(laboratory.recordedAt);
    expect(PROVENANCE_SOURCES).toContain('future_integration');
  });

  test('keeps domain inputs isolated in app-level composition', () => {
    const domains = buildHealthDomains({
      sleep: { asOf: AS_OF, metrics: [sleepMetric('sleep-duration', 'duration', 7.5)] },
    });
    expect(domains.find(domain => domain.id === 'sleep')?.dataCompleteness.state).toBe('partial');
    expect(domains.filter(domain => domain.id !== 'sleep')
      .every(domain => domain.dataCompleteness.state === 'none')).toBe(true);
  });

  test('rejects malformed, future-dated, duplicate, and unsupported evidence', () => {
    expect(() => sleepDomainEngine.build({ asOf: AS_OF, metrics: [
      sleepMetric('duplicate', 'duration', 7.5), sleepMetric('duplicate', 'efficiency', 0.88),
    ] })).toThrow(/duplicate sleep metric id/i);
    expect(() => sleepDomainEngine.build({ asOf: AS_OF, metrics: [{
      ...sleepMetric('sleep-duration', 'duration', 7.5), observedAt: 'not-a-date',
    }] })).toThrow(/observedAt must be a valid date/i);
    expect(() => sleepDomainEngine.build({ asOf: '2026-01-01T00:00:00.000Z',
      metrics: [sleepMetric('sleep-duration', 'duration', 7.5)] })).toThrow(/cannot be after asOf/i);
  });

  test('keeps biological-age work outside the blood engine', () => {
    expect(BLOOD_DOMAIN_DEFINITION.capabilities.map(item => item.id)).toEqual([
      'biomarkers', 'inflammation', 'cardiometabolic',
    ]);
    expect(BLOOD_DOMAIN_DEFINITION.futureCapabilities).toEqual([
      expect.objectContaining({ id: 'phenotypic_age', availability: 'future' }),
    ]);
    expect(Object.keys(HEALTH_DOMAIN_ENGINES.blood.build()).some(key => /age/i.test(key))).toBe(false);
  });

  test('exposes genetics only as a future placeholder', () => {
    expect(GENETICS_DOMAIN_PLACEHOLDER).toMatchObject({
      id: 'genetics', implementationStatus: 'placeholder',
    });
    expect('genetics' in HEALTH_DOMAIN_ENGINES).toBe(false);
  });
});
