import { BIOMARKERS } from '../data/biomarkers';
import {
  BODY_SYSTEMS,
  buildHealthExperience,
  deriveEntryTrend,
  EMPTY_STATE_COPY,
  HEALTH_DOMAINS,
  freshnessLabel,
} from '../lib/healthExperience';
import type { PhenoAgeResult } from '../lib/phenoAge';
import type { StoredEntry } from '../types/biomarkerEntry';

const NOW = new Date('2026-07-16T12:00:00.000Z');

function result(status: PhenoAgeResult['status'], presentCount: number): PhenoAgeResult {
  return {
    status,
    bloodPhenotypicAge: status === 'calculated' ? 38.4 : null,
    chronologicalAge: 40,
    ageValid: true,
    requirements: [],
    presentCount,
    totalRequired: 9,
    missingCount: 9 - presentCount,
    missingBiomarkers: [],
    calculatedAt: status === 'calculated' ? NOW.toISOString() : null,
    modelLimitations: ['Blood measurements only.'],
  };
}

function entry(input: Partial<StoredEntry> & Pick<StoredEntry, 'id' | 'biomarkerId' | 'value'>): StoredEntry {
  return {
    date: '2026-07-01T08:00:00.000Z',
    source: 'Acme Laboratory',
    notes: '',
    unit: 'mg/dL',
    ...input,
  };
}

describe('Health Operating System experience model', () => {
  test('defines ten distinct body systems in editorial order', () => {
    expect(BODY_SYSTEMS).toHaveLength(10);
    expect(new Set(BODY_SYSTEMS.map(system => system.id)).size).toBe(10);
    expect(BODY_SYSTEMS[0].name).toBe('Cardiovascular');
    expect(BODY_SYSTEMS[9].name).toBe('Longevity Research');
  });

  test('supports every requested source-completeness state', () => {
    const base = { biomarkers: BIOMARKERS, phenoAge: result('insufficient_data', 0), now: NOW };
    expect(buildHealthExperience({ ...base, entries: [], healthData: null }).inputState).toBe('no_labs');
    expect(buildHealthExperience({ ...base, entries: [], healthData: { hrv: 50 }, healthDataSource: 'healthkit' }).inputState).toBe('only_healthkit');
    expect(buildHealthExperience({ ...base, entries: [], healthData: { hrv: 50 }, healthDataSource: 'wearable' }).inputState).toBe('only_wearables');
    expect(buildHealthExperience({ ...base, entries: [entry({ id: 'manual', biomarkerId: 'apob', value: 70, source: 'Manual entry' })], healthData: null }).inputState).toBe('only_manual');
    expect(buildHealthExperience({ ...base, entries: [entry({ id: 'partial', biomarkerId: 'apob', value: 70 })], healthData: null }).inputState).toBe('partial_labs');
    expect(buildHealthExperience({ ...base, entries: [entry({ id: 'old', biomarkerId: 'apob', value: 70, date: '2024-01-01' })], healthData: null }).inputState).toBe('old_labs');
    expect(buildHealthExperience({ ...base, phenoAge: result('calculated', 9), entries: [entry({ id: 'complete', biomarkerId: 'apob', value: 70 })], healthData: null }).inputState).toBe('complete');
  });

  test('keeps multimodal domains extensible without calculating a multimodal age', () => {
    expect(HEALTH_DOMAINS.map(domain => domain.id)).toEqual([
      'sleep', 'recovery', 'wearables', 'fitness', 'nutrition', 'body_composition',
      'smoking', 'alcohol', 'medication', 'supplements', 'mental_health', 'genetics',
    ]);
    const experience = buildHealthExperience({
      biomarkers: BIOMARKERS,
      entries: [],
      phenoAge: result('insufficient_data', 0),
      healthData: { source: 'wearable', sleepHours: 7.4, vo2max: 42 },
      now: NOW,
    });
    expect(experience.domains.find(domain => domain.id === 'sleep')).toMatchObject({ status: 'available', signalCount: 1 });
    expect(experience.domains.find(domain => domain.id === 'fitness')).toMatchObject({ status: 'available', signalCount: 1 });
    expect(experience.overview.completeness).toBe(0);
    expect(experience.overview.bloodPhenotypicAge.status).toBe('insufficient_data');
  });

  test('each empty state explains knowledge, uncertainty, and a next action', () => {
    for (const copy of Object.values(EMPTY_STATE_COPY)) {
      expect(copy.known.length).toBeGreaterThan(10);
      expect(copy.unknown.length).toBeGreaterThan(10);
      expect(copy.action.length).toBeGreaterThan(10);
      expect(copy.actionLabel.length).toBeGreaterThan(3);
    }
  });

  test('uses source laboratory range, not legacy optimization targets, for review state', () => {
    const apob = entry({
      id: 'apob-current',
      biomarkerId: 'apob',
      value: 80,
      sourceLabRange: { lowerBound: 40, upperBound: 100, unit: 'mg/dL' },
    });
    const experience = buildHealthExperience({
      biomarkers: BIOMARKERS,
      entries: [apob],
      phenoAge: result('insufficient_data', 0),
      healthData: null,
      now: NOW,
    });
    const cardiovascular = experience.systems.find(system => system.id === 'cardiovascular');
    expect(cardiovascular?.state).toBe('Within reported ranges');
    expect(cardiovascular?.state).not.toMatch(/optimal|suboptimal|critical/i);
  });

  test('summarizes range movement before exposing a chart', () => {
    const current = entry({ id: 'new', biomarkerId: 'apob', value: 105, sourceLabRange: { upperBound: 100, unit: 'mg/dL' } });
    const previous = entry({ id: 'old', biomarkerId: 'apob', value: 120, date: '2026-03-01', sourceLabRange: { upperBound: 100, unit: 'mg/dL' } });
    expect(deriveEntryTrend([current, previous])).toBe('needs_review');
    expect(deriveEntryTrend([
      entry({ id: 'in', biomarkerId: 'apob', value: 95, sourceLabRange: { upperBound: 100, unit: 'mg/dL' } }),
      previous,
    ])).toBe('improving');
  });

  test('labels freshness without implying clinical safety', () => {
    expect(freshnessLabel('2026-07-01', NOW)).toBe('Current');
    expect(freshnessLabel('2026-01-01', NOW)).toBe('Aging');
    expect(freshnessLabel('2024-01-01', NOW)).toBe('Out of date');
  });
});
