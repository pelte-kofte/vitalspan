import fs from 'node:fs';
import path from 'node:path';

import { presentToday } from '../lib/todayPresenter';
import type { TodayDataSnapshot } from '../types/todayData';

function snapshot(
  overrides: Partial<TodayDataSnapshot> = {},
): TodayDataSnapshot {
  return {
    capturedAt: '2026-07-24T08:30:00.000Z',
    localDay: '2026-07-24',
    profile: {
      name: 'Alex',
      age: 42,
      sex: 'female',
      goal: 'Track & understand',
      conditions: [],
      medications: [],
      onboardingComplete: true,
    },
    biomarkerEntries: [{
      id: 'entry-1',
      biomarkerId: 'albumin',
      value: 4.2,
      reportedValue: 4.2,
      unit: 'g/dL',
      reportedUnit: 'g/dL',
      date: '2026-07-20T08:00:00.000Z',
      source: 'Example Laboratory',
      notes: '',
      sourceLabRange: {
        lowerBound: 3.5,
        upperBound: 5,
        unit: 'g/dL',
      },
    }],
    protocol: {
      supplements: [],
      medTimes: {},
      hiddenMeds: [],
      taken: [],
      takenDate: '2026-07-24',
      currentStreak: 0,
      bestStreak: 0,
      lastCompleteDate: '',
    },
    exerciseLogs: [],
    healthData: null,
    ...overrides,
  };
}

function briefText(input: TodayDataSnapshot): string {
  return presentToday(input).brief.sentences.join(' ');
}

describe('deterministic Today presenter', () => {
  test('makes missing profile the only setup focus and keeps the Brief explanatory', () => {
    const input = snapshot({
      profile: null,
      biomarkerEntries: [],
    });
    const presentation = presentToday(input);

    expect(presentation.priorities.primary).toMatchObject({
      kind: 'profile_setup',
      title: 'Complete your health profile',
      action: { kind: 'complete_profile' },
    });
    expect(presentation.priorities.secondary).toEqual([]);
    expect(presentation.quickActions).toEqual([]);
    expect(briefText(input)).not.toMatch(/complete your health profile|complete profile/i);
  });

  test('uses laboratory absence without inventing a partial scientific result', () => {
    const input = snapshot({ biomarkerEntries: [] });
    const presentation = presentToday(input);

    expect(presentation.priorities.primary).toMatchObject({
      kind: 'data_completion',
      title: 'Add your laboratory results',
      action: { kind: 'add_result' },
    });
    expect(briefText(input)).toMatch(/blood-based interpretation is unavailable/i);
    expect(briefText(input)).not.toMatch(/age estimate|risk|normal|abnormal|optimal/i);
    expect(briefText(input)).not.toMatch(/add your laboratory results|add result/i);
  });

  test('maps an explicit incomplete saved-plan item without treating it as a health outcome', () => {
    const input = snapshot({
      profile: {
        ...snapshot().profile!,
        medications: ['Metformin'],
      },
      protocol: {
        ...snapshot().protocol,
        supplements: [{
          id: 'magnesium',
          name: 'Magnesium',
          dose: '200 mg',
          source: 'manual',
          addedAt: '2026-01-01T00:00:00.000Z',
        }],
        taken: ['magnesium'],
      },
    });
    const presentation = presentToday(input);

    expect(presentation.progress).toMatchObject({
      completedCount: 1,
      totalCount: 2,
      nextItem: {
        id: 'Metformin',
        completed: false,
        completionAction: {
          kind: 'set_plan_item_completion',
          itemId: 'Metformin',
          completed: true,
        },
      },
    });
    expect(presentation.priorities.primary).toMatchObject({
      kind: 'plan_action',
      action: { kind: 'open_plan', itemId: 'Metformin' },
    });
    expect(presentation.priorities.primary.explanation.interpretation)
      .toMatch(/not a health outcome/i);
    expect(briefText(input)).not.toMatch(/review today’s saved plan|open plan/i);
  });

  test('ignores completion from another day and never manufactures a plan item', () => {
    const staleCompletion = presentToday(snapshot({
      profile: {
        ...snapshot().profile!,
        medications: ['Metformin'],
      },
      protocol: {
        ...snapshot().protocol,
        taken: ['Metformin'],
        takenDate: '2026-07-23',
      },
    }));
    expect(staleCompletion.progress).toMatchObject({
      completedCount: 0,
      totalCount: 1,
      nextItem: { id: 'Metformin' },
    });

    const noPlan = presentToday(snapshot());
    expect(noPlan.progress).toMatchObject({
      completedCount: 0,
      totalCount: 0,
      nextItem: null,
    });
  });

  test('preserves existing single-dose and multi-dose completion identifiers', () => {
    const presentation = presentToday(snapshot({
      protocol: {
        ...snapshot().protocol,
        supplements: [
          {
            id: 'vitamin-d',
            name: 'Vitamin D',
            dose: '1000 IU',
            source: 'manual',
            addedAt: '2026-01-01T00:00:00.000Z',
          },
          {
            id: 'magnesium',
            name: 'Magnesium',
            dose: '200 mg (3x daily)',
            source: 'manual',
            addedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        taken: [
          'Vitamin D_dose_0',
          'Magnesium_dose_0',
          'Magnesium_dose_1',
        ],
      },
    }));

    expect(presentation.progress).toMatchObject({
      completedCount: 3,
      totalCount: 4,
      nextItem: {
        id: 'Magnesium_dose_2',
        title: 'Magnesium · dose 3',
        completionAction: {
          kind: 'set_plan_item_completion',
          itemId: 'Magnesium_dose_2',
          completed: true,
        },
      },
    });
  });

  test('omits Key Insight rather than inferring a trend from one measurement', () => {
    const presentation = presentToday(snapshot({
      biomarkerEntries: [{
        ...snapshot().biomarkerEntries[0],
        value: 500,
        reportedValue: 500,
      }],
    }));
    const allCopy = JSON.stringify(presentation);

    expect(presentation.keyInsight).toBeNull();
    expect(allCopy).not.toMatch(/improving|declining|trending|rose|fell|stable trend/i);
    expect(allCopy).not.toMatch(/diagnosis|prognosis|individual risk/i);
  });

  test('uses contextual tools only and omits them after their context is satisfied', () => {
    const missingContext = presentToday(snapshot());
    expect(missingContext.quickActions).toEqual([
      {
        id: 'connect-health-data',
        label: 'Connect health data',
        action: { kind: 'connect_health_data' },
      },
      {
        id: 'log-movement',
        label: 'Log movement',
        action: { kind: 'log_movement' },
      },
    ]);

    const completeContext = presentToday(snapshot({
      healthData: {
        source: 'healthkit',
        lastSynced: '2026-07-24T08:00:00.000Z',
      },
      exerciseLogs: [{
        id: 'exercise-1',
        exerciseId: 'walk',
        exerciseName: 'Walk',
        category: 'Cardio',
        date: '2026-07-24',
        loggedAt: '2026-07-24T07:00:00.000Z',
      }],
    }));
    expect(completeContext.quickActions).toEqual([]);
  });

  test('returns the same output without mutating the same snapshot', () => {
    const input = snapshot();
    const before = JSON.stringify(input);
    const first = presentToday(input);
    const second = presentToday(input);

    expect(first).toEqual(second);
    expect(JSON.stringify(input)).toBe(before);
    expect(first.header).toEqual({
      greeting: 'Hello, Alex',
      dateLabel: 'Friday, July 24',
    });
  });

  test('has only type dependencies and no runtime integration boundary', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/todayPresenter.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/from ['"]react|use[A-Z]\w*\(/);
    expect(source).not.toMatch(/navigation|navigate\(|AsyncStorage|storage/i);
    expect(source).not.toMatch(/Premium|AIAdvisor|advisorService|anthropic/i);
    expect(source).not.toMatch(/classify|calculate|clinicalPhenoAge|scientificModels/i);
    expect(source).not.toMatch(/Math\.random|Date\.now|new Date\(\)/);
    expect(source).not.toMatch(/^import (?!type )/m);
  });
});
