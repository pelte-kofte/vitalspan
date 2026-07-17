import {
  DOMAIN_LAYER_MAP,
  DOMAIN_TITLES,
  LIVING_SPHERE_DOMAIN_IDS,
  buildLivingSphereRendererContract,
  buildLivingSphereVisualState,
  createLivingSphereInput,
  mapDomainToLayer,
  toLivingSphereDomainInput,
  validateLivingSphereVisualState,
  type LivingSphereDomainId,
  type LivingSphereDomainInput,
  type LivingSphereInput,
  type LivingSphereVisualState,
} from '../domain/livingSphere';
import {
  sleepDomainEngine,
  type DomainMetric,
  type DomainState,
  type MetricProvenance,
} from '../domain/health';

const AS_OF = '2026-07-17T12:00:00.000Z';

function confidenceFactor(
  id: 'freshness' | 'historical_depth' | 'consistency',
  level: LivingSphereDomainInput['confidence'] = 'high',
) {
  return { id, level, explanation: `${id} evidence is ${level}.` } as const;
}

function trend(
  overrides: Partial<LivingSphereDomainInput['trend']> = {},
): LivingSphereDomainInput['trend'] {
  return {
    direction: 'stable',
    confidence: 'high',
    pattern: 'stable_pattern',
    persistence: 'recent',
    velocity: 'unknown',
    historicalCoverage: {
      observationCount: 3, durationDays: 15, supportedIntervals: 2, missingPeriodCount: 0,
    },
    explanation: 'The domain state remained stable across three structured observations.',
    provenance: [{
      source: 'calculated', provider: 'Vitalspan Deterministic Trend Engine',
      reliability: 'deterministically_derived',
    }],
    limitations: [],
    ...overrides,
  };
}

function domainInput<D extends LivingSphereDomainId>(
  id: D,
  overrides: Partial<LivingSphereDomainInput<D>> = {},
): LivingSphereDomainInput<D> {
  const state = overrides.currentState ?? 'stable';
  return {
    id,
    title: DOMAIN_TITLES[id],
    currentState: state,
    confidence: 'high',
    dataCompleteness: {
      state: 'complete', availableCapabilities: 4, totalCapabilities: 4, missingCapabilities: [],
    },
    freshness: confidenceFactor('freshness'),
    historicalDepth: confidenceFactor('historical_depth'),
    consistency: confidenceFactor('consistency'),
    observedSignals: [{
      capability: `${id}_capability`, state, text: `${DOMAIN_TITLES[id]} evidence is ${state}.`,
      basis: 'direct_observation', basisDescription: 'Observed by the domain engine.',
      supportingMetricIds: [`${id}-metric`],
    }],
    knownGaps: [],
    limitations: [],
    evidenceSummary: {
      text: `${DOMAIN_TITLES[id]} assessment uses 4 observations across 3 collections from Example Source.`,
      metricCount: 4,
      collectionCount: 3,
      providers: ['Example Source'],
      observedFrom: '2026-07-01T08:00:00.000Z',
      observedTo: '2026-07-16T08:00:00.000Z',
      supportingMetricIds: [`${id}-metric`],
    },
    trend: trend(),
    lastUpdated: '2026-07-17T08:00:00.000Z',
    ...overrides,
  };
}

function sphereInput(
  domains: readonly LivingSphereDomainInput[],
  reduceMotion = false,
): LivingSphereInput {
  return { asOf: AS_OF, domains, reduceMotion };
}

function allDomains(state: DomainState = 'stable'): LivingSphereDomainInput[] {
  return LIVING_SPHERE_DOMAIN_IDS.map(id => domainInput(id, { currentState: state }));
}

describe('Living Sphere semantic architecture', () => {
  test('uses a calm neutral dormant fallback when no evidence exists', () => {
    const state = buildLivingSphereVisualState(sphereInput([]));
    expect(state).toMatchObject({
      overallCoherence: 'dormant',
      overallEvidenceClarity: 'obscured',
      temporalStability: 'insufficient_history',
      dominantInfluence: null,
      availableDomainCount: 0,
      missingDomainCount: 6,
      evidenceMode: 'no_evidence',
      fallback: { code: 'no_evidence', isFallback: true },
      palette: { base: 'neutral_base', primaryAccent: 'muted_uncertainty' },
    });
    expect(state.layers.core_vitality.properties).toEqual({
      luminosity: 'dormant', density: 'dormant', continuity: 'indeterminate',
    });
    expect(Object.values(state.layers).filter(layer => layer.sourceDomain !== 'aggregate')
      .every(layer => layer.sourceState === null)).toBe(true);
    expect(Object.values(state.palette)).not.toContain('red');
    expect(Object.values(state.palette)).not.toContain('green');
  });

  test('allows one domain to influence only its assigned layer', () => {
    const state = buildLivingSphereVisualState(sphereInput([
      domainInput('sleep', { currentState: 'good' }),
    ]));
    expect(state.evidenceMode).toBe('limited_evidence');
    expect(state.layers.atmospheric_rhythm).toMatchObject({
      represented: true, sourceDomain: 'sleep', sourceState: 'good',
    });
    for (const id of LIVING_SPHERE_DOMAIN_IDS.filter(id => id !== 'sleep')) {
      expect(state.layers[DOMAIN_LAYER_MAP[id]].represented).toBe(false);
    }
    expect(state.dominantInfluence).toBe('sleep');
  });

  test('represents partial evidence through visibility and uncertainty, not poor health', () => {
    const sleep = domainInput('sleep', {
      currentState: 'unknown',
      confidence: 'limited',
      dataCompleteness: {
        state: 'partial', availableCapabilities: 1, totalCapabilities: 4,
        missingCapabilities: ['consistency', 'efficiency', 'timing'],
      },
      knownGaps: [{ id: 'gap:sleep', text: 'Sleep history is incomplete.', supportingMetricIds: [] }],
    });
    const state = buildLivingSphereVisualState(sphereInput([sleep]));
    expect(state.layers.atmospheric_rhythm).toMatchObject({
      sourceState: 'unknown', visibility: 'partial',
    });
    expect(state.layers.atmospheric_rhythm.properties).toEqual({
      breathCadence: 'indeterminate', haloSoftness: 'muted', expansionRegularity: 'indeterminate',
    });
    expect(state.overallEvidenceClarity).toBe('muted');
    expect(state.palette.primaryAccent).toBe('muted_uncertainty');
  });

  test('represents every supported domain without activating excluded domains', () => {
    const state = buildLivingSphereVisualState(sphereInput(allDomains()));
    expect(state.availableDomainCount).toBe(6);
    expect(state.missingDomainCount).toBe(0);
    expect(state.evidenceMode).toBe('sufficient_evidence');
    expect(state.fallback.isFallback).toBe(false);
    expect(Object.values(DOMAIN_LAYER_MAP).every(layer => state.layers[layer].represented)).toBe(true);
    expect(state.layers.evidence_clarity.sourceDomain).toBe('aggregate');
  });

  test('preserves mixed and conflicting domain states as independent layers', () => {
    const state = buildLivingSphereVisualState(sphereInput([
      domainInput('blood', { currentState: 'good' }),
      domainInput('sleep', { currentState: 'needs_review' }),
      domainInput('fitness', { currentState: 'unknown' }),
      domainInput('recovery', { currentState: 'stable' }),
    ]));
    expect(state.evidenceMode).toBe('conflicting_evidence');
    expect(state.overallCoherence).toBe('variable');
    expect(state.layers.core_vitality.sourceState).toBe('good');
    expect(state.layers.atmospheric_rhythm.sourceState).toBe('needs_review');
    expect(state.layers.kinetic_presence.sourceState).toBe('unknown');
    expect(state.layers.internal_flow.sourceState).toBe('stable');
    expect(state.dominantInfluence).toBe('sleep');
  });

  test('low-confidence Good evidence is never clearer than high-confidence Needs Review evidence', () => {
    const lowConfidenceGood = buildLivingSphereVisualState(sphereInput([
      domainInput('blood', { currentState: 'good', confidence: 'limited' }),
      ...LIVING_SPHERE_DOMAIN_IDS.filter(id => id !== 'blood').map(id => domainInput(id)),
    ]));
    const highConfidenceReview = buildLivingSphereVisualState(sphereInput([
      domainInput('blood', { currentState: 'needs_review', confidence: 'high' }),
      ...LIVING_SPHERE_DOMAIN_IDS.filter(id => id !== 'blood').map(id => domainInput(id)),
    ]));
    expect(lowConfidenceGood.overallEvidenceClarity).toBe('muted');
    expect(highConfidenceReview.overallEvidenceClarity).toBe('clear');
    expect(lowConfidenceGood.layers.core_vitality.visibility).toBe('partial');
    expect(highConfidenceReview.layers.core_vitality.visibility).toBe('clear');
  });

  test('uses stale evidence fallback without creating an alarming health state', () => {
    const sleep = domainInput('sleep', {
      currentState: 'stable',
      confidence: 'limited',
      freshness: confidenceFactor('freshness', 'limited'),
    });
    const state = buildLivingSphereVisualState(sphereInput([sleep]));
    expect(state.evidenceMode).toBe('stale_evidence');
    expect(state.fallback.affectedDomains).toEqual(['sleep']);
    expect(state.layers.atmospheric_rhythm.sourceState).toBe('stable');
    expect(state.uncertainty.reasons.map(reason => reason.code)).toContain('stale_evidence');
  });

  test.each([
    ['insufficient_history', trend({ direction: 'unknown', confidence: 'insufficient', pattern: 'unknown',
      persistence: 'unknown', historicalCoverage: { observationCount: 0, durationDays: 0,
        supportedIntervals: 0, missingPeriodCount: 0 } })],
    ['snapshot', trend({ direction: 'unknown', confidence: 'limited', pattern: 'unknown' })],
    ['emerging_trend', trend({ direction: 'emerging', pattern: 'emerging_pattern' })],
    ['stable_pattern', trend()],
    ['volatile_pattern', trend({ direction: 'mixed', pattern: 'volatile_pattern', velocity: 'moderate' })],
    ['seasonal_pattern', trend({ direction: 'stable', pattern: 'seasonal_pattern', persistence: 'long_term' })],
    ['interrupted_pattern', trend({ direction: 'unknown', pattern: 'interrupted_pattern',
      confidence: 'limited', persistence: 'unknown' })],
  ] as const)('maps Trend Intelligence to %s without reading raw history', (expected, trendState) => {
    const sleep = domainInput('sleep', {
      trend: trendState,
    });
    expect(buildLivingSphereVisualState(sphereInput([sleep])).temporalStability).toBe(expected);
  });

  test('the domain projection strips raw metrics and preserves structured evidence provenance', () => {
    const provenance: MetricProvenance = {
      source: 'apple_health', provider: 'Apple Health', reliability: 'device_recorded',
      recordedAt: '2026-07-17T08:00:00.000Z', integrationId: 'healthkit',
    };
    const capabilities: DomainMetric<'sleep'>['capability'][] = ['duration', 'consistency', 'efficiency', 'timing'];
    const metrics: DomainMetric<'sleep'>[] = capabilities.map(capability => ({
      id: `sleep-${capability}`, capability, label: capability, value: 123.456, unit: 'raw-unit',
      collectionId: 'night-1', observedAt: '2026-07-16T22:00:00.000Z', provenance: [provenance],
      interpretation: { state: 'good', observation: `${capability} observed`,
        basis: 'direct_observation', basisDescription: 'Observed by Apple Health.', consistency: 'consistent' },
    }));
    const sleepState = sleepDomainEngine.build({ asOf: AS_OF, metrics });
    const domain = toLivingSphereDomainInput(sleepState);
    const projectedInput = createLivingSphereInput({
      asOf: AS_OF, domains: [sleepState], reduceMotion: false,
    });
    const serialized = JSON.stringify(domain);
    expect(domain.evidenceSummary.providers).toEqual(['Apple Health']);
    expect(domain.observedSignals.every(signal => signal.supportingMetricIds.length > 0)).toBe(true);
    expect(serialized).not.toContain('123.456');
    expect(serialized).not.toContain('raw-unit');
    expect(serialized).not.toContain('availableMetrics');
    expect(projectedInput.domains).toEqual([domain]);
  });

  test('maps every domain to exactly one documented layer', () => {
    for (const id of LIVING_SPHERE_DOMAIN_IDS) {
      const stable = mapDomainToLayer(domainInput(id, { currentState: 'stable' }));
      const attention = mapDomainToLayer(domainInput(id, { currentState: 'attention_needed' }));
      expect(stable.id).toBe(DOMAIN_LAYER_MAP[id]);
      expect(attention.id).toBe(DOMAIN_LAYER_MAP[id]);
      expect(stable.properties).not.toEqual(attention.properties);

      const aggregate = buildLivingSphereVisualState(sphereInput([domainInput(id)]));
      for (const other of LIVING_SPHERE_DOMAIN_IDS.filter(domainId => domainId !== id)) {
        expect(aggregate.layers[DOMAIN_LAYER_MAP[other]].represented).toBe(false);
      }
    }
  });

  test('rejects protocol domains and raw fields at the input boundary', () => {
    const protocolDomain = {
      ...domainInput('sleep'), id: 'medication', title: 'Medication',
    } as unknown as LivingSphereDomainInput;
    expect(() => buildLivingSphereVisualState(sphereInput([protocolDomain])))
      .toThrow(/unsupported living sphere domain/i);

    const rawDomain = {
      ...domainInput('sleep'), availableMetrics: [{ value: 42 }],
    } as unknown as LivingSphereDomainInput;
    expect(() => buildLivingSphereVisualState(sphereInput([rawDomain])))
      .toThrow(/unsupported fields: availableMetrics/i);
  });

  test('produces provenance-aware, deterministic explanations', () => {
    const input = sphereInput([domainInput('sleep')]);
    const first = buildLivingSphereVisualState(input);
    const second = buildLivingSphereVisualState(input);
    expect(first).toEqual(second);
    const atmosphere = first.explanation.layerInfluences
      .find(item => item.layer === 'atmospheric_rhythm');
    expect(atmosphere).toMatchObject({
      sourceDomain: 'sleep', represented: true,
      evidenceSummary: 'Sleep assessment uses 4 observations across 3 collections from Example Source.',
      updatedAt: '2026-07-17T08:00:00.000Z',
    });
    expect(first.explanation.displayStrings.join(' ')).toContain('Example Source');
  });

  test('provides an accessible summary independent from color and motion', () => {
    const state = buildLivingSphereVisualState(sphereInput([
      domainInput('blood', { currentState: 'good' }),
      domainInput('sleep', { currentState: 'stable' }),
      domainInput('recovery', { currentState: 'stable' }),
    ], true));
    expect(state.accessibility).toMatchObject({
      livingState: 'Living state: mixed but stable',
      evidenceClarity: 'Evidence clarity: partial',
      representedDomains: 'Represented domains: Blood, Sleep, Recovery',
      motion: 'Motion: reduced-motion static representation',
    });
    expect(state.accessibility.limitedBy).toMatch(/Fitness, Nutrition, Lifestyle/);
    expect(state.motion).toMatchObject({
      mode: 'static', reduceMotionApplied: true, animationRequiredForMeaning: false,
    });
  });

  test('produces a renderer-independent contract with bounded output', () => {
    const contract = buildLivingSphereRendererContract(sphereInput(allDomains(), true));
    expect(contract).toMatchObject({
      contractVersion: '1.0', reduceMotion: true,
      state: { schemaVersion: '1.0' },
    });
    expect(contract.accessibility).toEqual(contract.state.accessibility);
    expect(() => validateLivingSphereVisualState(contract.state)).not.toThrow();
    expect(JSON.stringify(contract)).not.toMatch(/skia|three|webgl|lottie|svg|reanimated|metal/i);
  });

  test('rejects unbounded or non-finite renderer output', () => {
    const invalidEnum = JSON.parse(JSON.stringify(
      buildLivingSphereVisualState(sphereInput([domainInput('blood')])),
    )) as LivingSphereVisualState;
    invalidEnum.layers.core_vitality.properties.luminosity = 'unbounded' as 'balanced';
    expect(() => validateLivingSphereVisualState(invalidEnum)).toThrow(/out-of-contract/i);

    const invalidNumber = JSON.parse(JSON.stringify(
      buildLivingSphereVisualState(sphereInput([])),
    )) as LivingSphereVisualState;
    invalidNumber.availableDomainCount = Number.NaN;
    expect(() => validateLivingSphereVisualState(invalidNumber)).toThrow(/non-negative integer/i);
  });

  test('contains no biological-age, lifespan, mortality, diagnosis, or health-score fields', () => {
    const state = buildLivingSphereVisualState(sphereInput(allDomains()));
    const collectKeys = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.flatMap(collectKeys);
      if (!value || typeof value !== 'object') return [];
      return Object.entries(value).flatMap(([key, child]) => [key, ...collectKeys(child)]);
    };
    expect(collectKeys(state).join(' ')).not.toMatch(
      /biological.?age|lifespan|mortality|diagnos|health.?score|global.?score/i,
    );
  });
});
