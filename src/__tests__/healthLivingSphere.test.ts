import { livingSphereHeroSize } from '../components/health/healthOverviewLayout';
import { BIOMARKERS } from '../data/biomarkers';
import { buildHealthLivingSphere } from '../lib/healthLivingSphere';
import type { StoredEntry } from '../types/biomarkerEntry';

const AS_OF = '2026-07-17T12:00:00.000Z';

function entry(overrides: Partial<StoredEntry> = {}): StoredEntry {
  return {
    id: 'lab-apob-1',
    biomarkerId: 'apob',
    value: 123.456,
    unit: 'mg/dL',
    date: '2026-07-10T08:00:00.000Z',
    source: 'Example Laboratory',
    notes: '',
    sourceLabRange: { lowerBound: 40, upperBound: 100, unit: 'mg/dL' },
    ...overrides,
  };
}

describe('Health Living Sphere integration', () => {
  test('renders an honest dormant state when no supported evidence exists', () => {
    const model = buildHealthLivingSphere({ asOf: AS_OF, biomarkers: BIOMARKERS,
      entries: [], healthData: null, reduceMotion: false });
    expect(model.contract.state).toMatchObject({ evidenceMode: 'no_evidence',
      availableDomainCount: 0, missingDomainCount: 6 });
    expect(model.currentState).toBe('Current state unavailable');
    expect(model.evidenceClarity).toBe('Insufficient');
    expect(model.primaryInsight).toMatch(/No supported domain evidence/i);
  });

  test('routes device evidence through independent domains without interpreting raw values', () => {
    const model = buildHealthLivingSphere({ asOf: AS_OF, biomarkers: BIOMARKERS, entries: [],
      healthData: { source: 'healthkit', sleepHours: 7.25, hrv: 51.75, restingHeartRate: 58.5,
        vo2max: 42.25, steps: 77777, lastSynced: '2026-07-17T08:00:00.000Z' },
      reduceMotion: false });
    expect(model.contract.state.explanation.representedDomains).toEqual([
      'sleep', 'recovery', 'fitness',
    ]);
    expect(model.contract.state.explanation.missingDomains).toEqual([
      'blood', 'nutrition', 'lifestyle',
    ]);
    expect(model.currentState).toBe('Current state is still forming');
    const serialized = JSON.stringify(model.contract);
    expect(serialized).not.toContain('77777');
    expect(serialized).not.toContain('51.75');
    expect(serialized).not.toContain('availableMetrics');
  });

  test('preserves source-laboratory interpretation and provenance without creating a score', () => {
    const model = buildHealthLivingSphere({ asOf: AS_OF, biomarkers: BIOMARKERS,
      entries: [entry()], healthData: null, reduceMotion: false });
    expect(model.currentState).toBe('Blood: Needs Review');
    expect(model.primaryInsight).toMatch(/ApoB is outside its source-reported laboratory range/);
    expect(model.contract.state.explanation.displayStrings.join(' ')).toContain('Example Laboratory');
    expect(JSON.stringify(model.contract)).not.toMatch(/123\.456|health.?score|biological.?age/i);
  });

  test('skips future-dated evidence rather than crashing or overstating certainty', () => {
    const model = buildHealthLivingSphere({ asOf: AS_OF, biomarkers: BIOMARKERS,
      entries: [entry({ date: '2026-07-18T08:00:00.000Z' })], healthData: null,
      reduceMotion: false });
    expect(model.contract.state.evidenceMode).toBe('no_evidence');
  });

  test('propagates Reduce Motion into both visual and accessible semantics', () => {
    const model = buildHealthLivingSphere({ asOf: AS_OF, biomarkers: BIOMARKERS,
      entries: [entry()], healthData: null, reduceMotion: true });
    expect(model.contract.state.motion).toMatchObject({ mode: 'static', reduceMotionApplied: true });
    expect(model.contract.accessibility.motion).toMatch(/reduced-motion static/i);
  });

  test('is deterministic for identical integration inputs', () => {
    const input = { asOf: AS_OF, biomarkers: BIOMARKERS, entries: [entry()], healthData: null,
      reduceMotion: false } as const;
    expect(buildHealthLivingSphere(input)).toEqual(buildHealthLivingSphere(input));
  });

  test('keeps the hero sphere responsive on small, large, and Dynamic Type layouts', () => {
    const se = livingSphereHeroSize(375, 667, 1);
    const pro = livingSphereHeroSize(402, 874, 1);
    const largeType = livingSphereHeroSize(375, 667, 2);
    const landscape = livingSphereHeroSize(667, 375, 1);
    expect(se).toBeGreaterThanOrEqual(150);
    expect(pro).toBeGreaterThan(se);
    expect(pro).toBeLessThanOrEqual(184);
    expect(largeType).toBeLessThan(se);
    expect(landscape).toBe(112);
  });

  test('profiles 1,000 complete integration builds within the CPU ceiling', () => {
    const input = { asOf: AS_OF, biomarkers: BIOMARKERS, entries: [entry()], healthData: {
      source: 'healthkit' as const, sleepHours: 7.2, hrv: 52, vo2max: 43, steps: 8200,
      lastSynced: '2026-07-17T08:00:00.000Z',
    }, reduceMotion: false };
    const startedAt = performance.now();
    for (let index = 0; index < 1_000; index += 1) buildHealthLivingSphere(input);
    expect(performance.now() - startedAt).toBeLessThan(2_000);
  });
});
