import {
  DOMAIN_TITLES,
  LIVING_SPHERE_DOMAIN_IDS,
  buildLivingSphereRendererContract,
  type LivingSphereDomainId,
  type LivingSphereDomainInput,
} from '../domain/livingSphere';
import {
  LIVING_SPHERE_PERFORMANCE_BOUNDS,
  assertLivingSpherePerformanceBounds,
  buildLivingSphereRenderPlan,
} from '../components/livingSphere/renderPlan';
import { livingSphereAccessibilityProps } from '../components/livingSphere/accessibility';
import { resolveLivingSpherePalette } from '../components/livingSphere/palette';

const AS_OF = '2026-07-17T12:00:00.000Z';

function domain<D extends LivingSphereDomainId>(
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
      state: 'complete', availableCapabilities: 1, totalCapabilities: 1, missingCapabilities: [],
    },
    freshness: { id: 'freshness', level: 'high', explanation: 'Evidence is fresh.' },
    historicalDepth: { id: 'historical_depth', level: 'high', explanation: 'History is sufficient.' },
    consistency: { id: 'consistency', level: 'high', explanation: 'Evidence is consistent.' },
    observedSignals: [{ capability: `${id}_signal`, state, text: 'A structured signal is present.',
      basis: 'direct_observation', basisDescription: 'Supplied by domain intelligence.',
      supportingMetricIds: [`${id}-metric`] }],
    knownGaps: [],
    limitations: [],
    evidenceSummary: { text: `${DOMAIN_TITLES[id]} uses structured evidence from Example Source.`,
      metricCount: 1, collectionCount: 3, providers: ['Example Source'],
      observedFrom: '2026-05-01T08:00:00.000Z', observedTo: '2026-07-16T08:00:00.000Z',
      supportingMetricIds: [`${id}-metric`] },
    trend: {
      direction: 'stable', confidence: 'high', pattern: 'stable_pattern', persistence: 'established',
      velocity: 'unknown', historicalCoverage: { observationCount: 4, durationDays: 76,
        supportedIntervals: 3, missingPeriodCount: 0 },
      explanation: 'The domain remained stable across four structured observations.',
      provenance: [{ source: 'calculated', provider: 'Vitalspan Deterministic Trend Engine',
        reliability: 'deterministically_derived' }], limitations: [],
    },
    lastUpdated: '2026-07-16T08:00:00.000Z',
    ...overrides,
  };
}

function contract(domains: readonly LivingSphereDomainInput[], reduceMotion = false) {
  return buildLivingSphereRendererContract({ asOf: AS_OF, domains, reduceMotion });
}

describe('Living Sphere renderer v1', () => {
  test('renders no evidence as a dormant, non-animated neutral plan', () => {
    const plan = buildLivingSphereRenderPlan(contract([]), 'light');
    expect(plan.motion).toMatchObject({ breathEnabled: false, flowEnabled: false,
      rotationEnabled: false, driftEnabled: false });
    expect(Object.values(plan.layerOpacity).every(value => value === 0)).toBe(true);
    expect(plan.evidenceOpacity).toBe(0.34);
  });

  test('partially expresses only represented evidence', () => {
    const sleep = domain('sleep', { confidence: 'limited', dataCompleteness: {
      state: 'partial', availableCapabilities: 1, totalCapabilities: 4,
      missingCapabilities: ['consistency', 'efficiency', 'timing'],
    } });
    const plan = buildLivingSphereRenderPlan(contract([sleep]), 'light');
    expect(plan.layerOpacity.atmospheric_rhythm).toBeGreaterThan(0);
    expect(plan.layerOpacity.core_vitality).toBe(0);
    expect(plan.evidenceOpacity).toBe(0.48);
  });

  test('keeps mixed domains in independent visual layers', () => {
    const plan = buildLivingSphereRenderPlan(contract([
      domain('blood', { currentState: 'good' }),
      domain('sleep', { currentState: 'needs_review' }),
      domain('recovery', { currentState: 'stable' }),
    ]), 'dark');
    expect(plan.layerOpacity.core_vitality).toBeGreaterThan(0);
    expect(plan.layerOpacity.atmospheric_rhythm).toBeGreaterThan(0);
    expect(plan.layerOpacity.internal_flow).toBeGreaterThan(0);
    expect(plan.layerOpacity.surface_richness).toBe(0);
  });

  test('evidence confidence controls clarity independently from health state', () => {
    const low = buildLivingSphereRenderPlan(contract([
      domain('blood', { currentState: 'good', confidence: 'limited' }),
    ]), 'light');
    const high = buildLivingSphereRenderPlan(contract(LIVING_SPHERE_DOMAIN_IDS.map(id =>
      domain(id, { currentState: 'needs_review', confidence: 'very_high' }))), 'light');
    expect(low.evidenceOpacity).toBe(0.48);
    expect(high.evidenceOpacity).toBe(1);
  });

  test('unknown trends use calm idle motion without inventing direction', () => {
    const unknownTrend = { ...domain('fitness').trend, direction: 'unknown' as const,
      confidence: 'limited' as const, pattern: 'unknown' as const, persistence: 'unknown' as const };
    const plan = buildLivingSphereRenderPlan(contract([
      domain('sleep', { trend: unknownTrend }),
      domain('fitness', { trend: unknownTrend }),
    ]), 'light');
    expect(plan.motion.breathEnabled).toBe(true);
    expect(plan.motion.rotationEnabled).toBe(false);
    expect(plan.motion.flowEnabled).toBe(false);
    expect(plan.motion.breathCycleMs).toBeGreaterThanOrEqual(9_000);
  });

  test('maps direction, confidence, pattern, persistence and velocity into bounded motion', () => {
    const fitness = domain('fitness', { trend: { ...domain('fitness').trend,
      direction: 'declining', confidence: 'very_high', pattern: 'emerging_pattern',
      persistence: 'long_term', velocity: 'rapid' } });
    const plan = buildLivingSphereRenderPlan(contract([fitness]), 'dark');
    expect(plan.motion).toMatchObject({ rotationEnabled: true, rotationDirection: -1,
      rotationCycleMs: 20_000 });
    expect(() => assertLivingSpherePerformanceBounds(plan)).not.toThrow();
  });

  test('uses pattern for rhythm consistency and persistence for motion stability', () => {
    const stableSleep = domain('sleep', { trend: { ...domain('sleep').trend,
      pattern: 'stable_pattern', persistence: 'long_term' } });
    const volatileSleep = domain('sleep', { trend: { ...domain('sleep').trend,
      direction: 'mixed', pattern: 'volatile_pattern', persistence: 'recent', velocity: 'moderate' } });
    const recentFitness = domain('fitness', { trend: { ...domain('fitness').trend,
      direction: 'improving', pattern: 'emerging_pattern', persistence: 'recent', velocity: 'moderate' } });
    const establishedFitness = domain('fitness', { trend: { ...recentFitness.trend,
      persistence: 'long_term' } });
    const stablePlan = buildLivingSphereRenderPlan(contract([stableSleep]), 'light');
    const volatilePlan = buildLivingSphereRenderPlan(contract([volatileSleep]), 'light');
    const recentPlan = buildLivingSphereRenderPlan(contract([recentFitness]), 'light');
    const establishedPlan = buildLivingSphereRenderPlan(contract([establishedFitness]), 'light');
    expect(volatilePlan.motion.rhythmVariance).toBeGreaterThan(stablePlan.motion.rhythmVariance);
    expect(recentPlan.motion.rotationCycleMs).toBeGreaterThan(establishedPlan.motion.rotationCycleMs);
  });

  test('Reduce Motion produces an equivalent static representation', () => {
    const plan = buildLivingSphereRenderPlan(contract(LIVING_SPHERE_DOMAIN_IDS.map(id => domain(id))),
      'dark', true);
    expect(plan.motion.reduced).toBe(true);
    expect(plan.performance.animatedValueCount).toBe(5);
    expect(plan.performance.activeAnimationCount).toBe(0);
    expect(plan.performance.shortestAnimationMs).toBeNull();
    expect(plan.evidenceOpacity).toBe(0.84);
  });

  test('is deterministic for identical contracts', () => {
    const value = contract(LIVING_SPHERE_DOMAIN_IDS.map(id => domain(id)));
    expect(buildLivingSphereRenderPlan(value, 'light')).toEqual(
      buildLivingSphereRenderPlan(value, 'light'),
    );
  });

  test('rejects a renderer contract that bypasses validated accessibility semantics', () => {
    const value = contract([domain('sleep')]);
    const bypass = { ...value, accessibility: { ...value.accessibility, text: 'Unvalidated label' } };
    expect(() => buildLivingSphereRenderPlan(bypass, 'light')).toThrow(
      /accessibility must match/i,
    );
  });

  test('exposes complete screen-reader semantics with or without interaction', () => {
    const value = contract([domain('blood'), domain('sleep')]);
    const image = livingSphereAccessibilityProps(value, false);
    const button = livingSphereAccessibilityProps(value, true);
    expect(image.role).toBe('image');
    expect(image.label).toMatch(/Living state:/);
    expect(image.label).toMatch(/Evidence clarity:/);
    expect(image.label).toMatch(/Represented domains: Blood, Sleep/);
    expect(image.label).toMatch(/missing Recovery, Fitness, Nutrition, Lifestyle evidence/);
    expect(button).toMatchObject({ role: 'button', hint: expect.any(String) });
  });

  test('stays within the fixed performance budget', () => {
    const plan = buildLivingSphereRenderPlan(contract(LIVING_SPHERE_DOMAIN_IDS.map(id =>
      domain(id, { trend: { ...domain(id).trend, direction: 'improving', velocity: 'rapid' } }))), 'dark');
    expect(plan.performance.svgElementCount).toBeLessThanOrEqual(
      LIVING_SPHERE_PERFORMANCE_BOUNDS.maxSvgElementCount,
    );
    expect(plan.performance.animatedValueCount).toBeLessThanOrEqual(5);
    expect(plan.performance.shortestAnimationMs).toBeGreaterThanOrEqual(6_000);
    expect(() => assertLivingSpherePerformanceBounds(plan)).not.toThrow();
  });

  test('profiles 10,000 deterministic render-plan builds within the CPU ceiling', () => {
    const value = contract(LIVING_SPHERE_DOMAIN_IDS.map(id => domain(id)));
    const startedAt = performance.now();
    for (let index = 0; index < 10_000; index += 1) {
      buildLivingSphereRenderPlan(value, index % 2 === 0 ? 'light' : 'dark');
    }
    const duration = performance.now() - startedAt;
    expect(duration).toBeLessThan(2_000);
  });

  test('uses distinct restrained palettes for dark and light appearance', () => {
    const value = contract([domain('blood')]);
    const lightPlan = buildLivingSphereRenderPlan(value, 'light');
    const darkPlan = buildLivingSphereRenderPlan(value, 'dark');
    const light = resolveLivingSpherePalette('light', value.state.palette);
    const dark = resolveLivingSpherePalette('dark', value.state.palette);
    expect(lightPlan.appearance).toBe('light');
    expect(darkPlan.appearance).toBe('dark');
    expect(light).not.toEqual(dark);
    expect(Object.keys(light)).toEqual(Object.keys(dark));
  });
});
