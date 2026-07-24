import fs from 'fs';
import path from 'path';
import type { AdvisorContext } from '../lib/advisorContext';
import {
  buildChangedSignals,
  buildHealthState,
  buildPriorityCandidates,
  buildProtocolItems,
  buildTodayExperience,
  getTodayLayout,
  selectTodayPriority,
  TODAY_HOME_ORDER,
  type TodayExperienceInput,
} from '../lib/todayExperience';
import { CLINICAL_PHENOAGE_LIMITATIONS } from '../domain/scientificModels';
import type { ClinicalPhenoAgePresentation } from '../lib/clinicalPhenoAgePresentation';
import type { ClinicalPhenoAgeRequirementPresentationSource } from '../lib/clinicalPhenoAgeProduct';
import type { StoredEntry } from '../types/biomarkerEntry';
import { EMPTY_PROTOCOL, type ProtocolState } from '../types/protocol';

const NOW = new Date('2026-07-16T12:00:00.000Z');

function requirements(presentCount: number, staleKey?: string): ClinicalPhenoAgeRequirementPresentationSource[] {
  const definitions = [
    ['albumin', 'albumin', 'Albumin', 'g/L'],
    ['creatinine', 'creatinine', 'Creatinine', 'μmol/L'],
    ['glucose', 'fastingglucose', 'Fasting Glucose', 'mmol/L'],
    ['crp', 'hscrp', 'hsCRP / CRP', 'mg/dL'],
    ['lymphocyte_percent', 'lymphocytepct', 'Lymphocyte %', '%'],
    ['mean_cell_volume', 'mcv', 'MCV', 'fL'],
    ['red_cell_distribution_width', 'rdw', 'RDW', '%'],
    ['alkaline_phosphatase', 'alp', 'Alkaline Phosphatase', 'U/L'],
    ['white_blood_cell_count', 'wbc', 'WBC', '10^3/μL'],
  ] as const;
  return definitions.map(([inputId, biomarkerId, label, canonicalUnit], index) => ({
    inputId,
    biomarkerId,
    label,
    canonicalUnit,
    status: inputId === staleKey ? 'stale' : index < presentCount ? 'present' : 'missing',
    measurementId: index < presentCount ? `measurement-${inputId}` : null,
    reportedUnit: index < presentCount ? canonicalUnit : null,
    collectedAt: inputId === staleKey ? '2024-01-01T00:00:00.000Z' : null,
  }));
}

function phenoResult(presentCount: number, calculated = false, staleKey?: string): ClinicalPhenoAgePresentation {
  return {
    status: calculated ? 'available' : 'unavailable',
    valueYears: calculated ? 42.1 : null,
    formattedValue: calculated ? '42.1' : null,
    chronologicalAgeYears: 45,
    ageValid: true,
    requirements: requirements(presentCount, staleKey),
    presentCount,
    totalRequired: 9 as const,
    missingCount: 9 - presentCount,
    unavailableMeasurements: requirements(presentCount, staleKey).filter(item => item.status !== 'present').map(item => item.label),
    calculatedAt: calculated ? NOW.toISOString() : null,
    limitations: CLINICAL_PHENOAGE_LIMITATIONS,
    failure: calculated ? null : {
      code: 'missing_biomarkers', title: 'More laboratory data required',
      detail: 'All nine required blood measurements are needed before calculation.',
    },
    modelVersion: 'clinical-phenoage/1.0.0',
    evidenceConfidence: calculated ? 'very_high' : 'insufficient',
  };
}

function context(conflict = false): AdvisorContext {
  return {
    ageBand: '45–49',
    biologicalAge: null,
    phenoAgeInputCount: 0,
    sex: 'not set',
    goal: 'not set',
    conditions: [],
    medications: [],
    supplements: [],
    biomarkers: [],
    adherenceRate: 'unknown',
    timingConflicts: conflict ? [{
      item1: 'Warfarin',
      item2: 'Vitamin K',
      slot: 'any',
      note: 'Review interaction',
    }] : [],
    healthDataAvailable: false,
  };
}

function baseInput(overrides: Partial<TodayExperienceInput> = {}): TodayExperienceInput {
  return {
    profile: { age: 45, medications: [] },
    entries: [],
    phenoResult: phenoResult(0),
    protocol: EMPTY_PROTOCOL,
    exerciseLogs: [],
    advisorContext: context(),
    now: NOW,
    wearableConnected: false,
    ...overrides,
  };
}

function entry(overrides: Partial<StoredEntry> = {}): StoredEntry {
  return {
    id: 'entry-1',
    biomarkerId: 'albumin',
    value: 4.4,
    reportedValue: 4.4,
    unit: 'g/dL',
    reportedUnit: 'g/dL',
    date: '2026-07-15T00:00:00.000Z',
    source: 'Example laboratory',
    notes: '',
    sourceLabRange: { lowerBound: 3.5, upperBound: 5.0, unit: 'g/dL' },
    ...overrides,
  };
}

describe('Vitalspan Today deterministic experience', () => {
  test('selects exactly one primary priority', () => {
    const experience = buildTodayExperience(baseInput());
    expect(experience.priority).toBeDefined();
    expect(Array.isArray(experience.priority)).toBe(false);
  });

  test('places a genuine safety alert before every Home section', () => {
    const experience = buildTodayExperience(baseInput({ advisorContext: context(true) }));
    expect(experience.safetyAlert?.title).toBe('Possible interaction needs review');
    expect(TODAY_HOME_ORDER[0]).toBe('safety_alert');
    expect(TODAY_HOME_ORDER[TODAY_HOME_ORDER.length - 1]).toBe('weekly_research');
  });

  test('uses deterministic ranking and falls back after a declined candidate', () => {
    const outside = entry({ value: 6.1, reportedValue: 6.1 });
    const input = baseInput({ entries: [outside] });
    const protocolItems = buildProtocolItems(input.profile, input.protocol, [], input.advisorContext, NOW);
    const candidates = buildPriorityCandidates(input, protocolItems);
    const first = selectTodayPriority(candidates);
    expect(first.kind).toBe('review_outside_range');
    const next = selectTodayPriority(candidates, new Set([first.id]));
    expect(next.kind).toBe('complete_labs');
  });

  test('represents valid and invalid Blood phenotypic age honestly', () => {
    const valid = buildHealthState({ age: 45 }, phenoResult(9, true), true);
    expect(valid.status).toBe('valid');
    expect(valid.bloodPhenotypicAge).toBe(42.1);
    expect(valid.historyLabel).toBe('Insufficient longitudinal history');
    expect(valid.wearableSummary).toMatch(/not included/i);

    const invalid = buildHealthState({ age: 45 }, phenoResult(3), false);
    expect(invalid.status).toBe('insufficient_data');
    expect(invalid.bloodPhenotypicAge).toBeNull();
    expect(invalid.summary).toMatch(/all (9|nine)/i);
    expect(invalid.wearableSummary).toMatch(/cannot be interpreted/i);
  });

  test('does not calculate or imply an age from fewer than nine inputs', () => {
    const experience = buildTodayExperience(baseInput({ phenoResult: phenoResult(8) }));
    expect(experience.healthState.bloodPhenotypicAge).toBeNull();
    expect(experience.healthState.presentCount).toBe(8);
    expect(experience.priority.kind).toBe('complete_labs');
  });

  test('exposes the complete tappable PhenoAge requirement checklist', () => {
    const candidates = buildPriorityCandidates(baseInput({ phenoResult: phenoResult(2) }), []);
    const priority = candidates.find(candidate => candidate.kind === 'complete_labs');
    expect(priority?.requirements).toHaveLength(9);
    expect(priority?.requirements?.slice(0, 3)).toEqual([
      { biomarkerId: 'albumin', label: 'Albumin', status: 'present' },
      { biomarkerId: 'creatinine', label: 'Creatinine', status: 'present' },
      { biomarkerId: 'fastingglucose', label: 'Fasting Glucose', status: 'missing' },
    ]);
    expect(priority?.action).toEqual({
      destination: 'BiomarkerEntry',
      params: { biomarkerId: 'fastingglucose' },
    });
  });

  test('explicitly models no profile, no lab, partial, and stale states', () => {
    expect(buildTodayExperience(baseInput({ profile: null, phenoResult: null })).priority.kind).toBe('profile_setup');
    expect(buildTodayExperience(baseInput()).priority.title).toMatch(/9 required blood inputs/i);
    expect(buildTodayExperience(baseInput({ phenoResult: phenoResult(4) })).healthState.presentCount).toBe(4);
    expect(buildTodayExperience(baseInput({ phenoResult: phenoResult(8, false, 'albumin') })).priority.kind).toBe('repeat_stale_lab');
  });

  test('caps changed signals at three and preserves provenance', () => {
    const entries = ['albumin', 'creatinine', 'fastingglucose', 'hscrp'].map((biomarkerId, index) => entry({
      id: `entry-${index}`,
      biomarkerId,
      value: 100 + index,
      reportedValue: 100 + index,
      reportedUnit: 'unit',
      unit: 'unit',
      sourceLabRange: { lowerBound: 1, upperBound: 2, unit: 'unit' },
    }));
    const signals = buildChangedSignals(entries, NOW);
    expect(signals).toHaveLength(3);
    expect(signals.every(signal => signal.source === 'Example laboratory')).toBe(true);
    expect(signals.every(signal => signal.kind === 'laboratory_range')).toBe(true);
  });

  test('returns a calm empty state when nothing meaningful changed', () => {
    const experience = buildTodayExperience(baseInput({ entries: [entry()] }));
    expect(experience.changedSignals).toEqual([]);
    expect(experience.changedSignalsEmptyMessage).toMatch(/nothing meaningful/i);
  });

  test('orders protocol by time and reports real completion state', () => {
    const protocol: ProtocolState = {
      ...EMPTY_PROTOCOL,
      medTimes: { Metformin: 'evening' },
      supplements: [{
        id: 'magnesium',
        name: 'Magnesium',
        dose: '200 mg',
        timing: 'morning',
        source: 'manual',
        addedAt: NOW.toISOString(),
      }],
      taken: ['magnesium'],
      takenDate: '2026-07-16',
    };
    const items = buildProtocolItems(
      { age: 45, medications: ['Metformin'] },
      protocol,
      [{
        id: 'workout-1', exerciseId: 'x', exerciseName: 'Walk', category: 'Cardio',
        date: '2026-07-16', durationMin: 20, loggedAt: NOW.toISOString(),
      }],
      context(),
      NOW,
    );
    expect(items.map(item => item.title)).toEqual(['Magnesium', 'Metformin', 'Walk']);
    expect(items[0].state).toBe('done');
    expect(items[1].state).toBe('due');
    expect(items[2]).toMatchObject({ kind: 'exercise', state: 'done', canToggle: false });
  });

  test('uses compact, unclipped layout values for small screens', () => {
    expect(getTodayLayout(320)).toEqual({ mode: 'compact', horizontalPadding: 14 });
    expect(getTodayLayout(390)).toEqual({ mode: 'regular', horizontalPadding: 20 });
  });
});

describe('Today screen safety copy and accessibility contract', () => {
  const screenSource = fs.readFileSync(path.join(__dirname, '../screens/DashboardScreen.tsx'), 'utf8');
  const sectionSource = fs.readFileSync(path.join(__dirname, '../components/today/TodaySections.tsx'), 'utf8');
  const source = `${screenSource}\n${sectionSource}`;

  test('contains no unsupported projection or universal Optimal copy', () => {
    expect(source).not.toMatch(/aging velocity|years saved|projected lifespan|years younger|\bOptimal\b/i);
  });

  test('keeps research and AI Advisor secondary to the primary action', () => {
    expect(screenSource.indexOf('<TodayPriorityHero')).toBeLessThan(screenSource.indexOf('<WeeklyResearchCard'));
    expect(sectionSource).toMatch(/Ask about this/);
    expect(screenSource).toMatch(/destination: 'AIAdvisor'/);
  });

  test('provides headings, meaningful labels, and reduced-motion handling', () => {
    expect(source).toMatch(/accessibilityRole="header"/);
    expect(source).toMatch(/accessibilityLabel=/);
    expect(source).toMatch(/accessibilityRole=\{item\.canToggle \? 'checkbox'/);
    expect(screenSource).toMatch(/isReduceMotionEnabled/);
    expect(sectionSource).toMatch(/reduceMotion \? content/);
  });
});
