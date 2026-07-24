import fs from 'node:fs';
import path from 'node:path';

import { presentToday } from '../lib/todayPresenter';
import {
  diffTodaySnapshots,
  refreshTodayPresentation,
  type TodayPresentationFrame,
} from '../lib/todayRefresh';
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
      medications: ['Metformin'],
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

function frame(input: TodayDataSnapshot): TodayPresentationFrame {
  return {
    snapshot: input,
    presentation: presentToday(input),
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('selective Today refresh', () => {
  test('ignores capture-only changes and preserves the complete presentation identity', () => {
    const previousSnapshot = snapshot();
    const nextSnapshot = {
      ...clone(previousSnapshot),
      capturedAt: '2026-07-24T09:00:00.000Z',
    };
    const previous = frame(previousSnapshot);
    const next = refreshTodayPresentation(previous, nextSnapshot);

    expect(diffTodaySnapshots(previousSnapshot, nextSnapshot)).toEqual({
      profile: false,
      biomarkers: false,
      protocol: false,
      healthConnection: false,
      exercise: false,
      localDay: false,
      changed: false,
    });
    expect(next.presentation).toBe(previous.presentation);
    expect(next.snapshot).toBe(nextSnapshot);
  });

  test('refreshes profile-dependent sections only for a profile change', () => {
    const previousSnapshot = snapshot();
    const nextSnapshot = snapshot({
      profile: {
        ...previousSnapshot.profile!,
        name: 'Sam',
      },
    });
    const previous = frame(previousSnapshot);
    const next = refreshTodayPresentation(previous, nextSnapshot);
    const diff = diffTodaySnapshots(previousSnapshot, nextSnapshot);

    expect(diff).toMatchObject({
      profile: true,
      biomarkers: false,
      protocol: false,
      healthConnection: false,
      exercise: false,
      localDay: false,
    });
    expect(next.presentation.header).not.toBe(previous.presentation.header);
    expect(next.presentation.brief).not.toBe(previous.presentation.brief);
    expect(next.presentation.priorities).not.toBe(previous.presentation.priorities);
    expect(next.presentation.progress).not.toBe(previous.presentation.progress);
    expect(next.presentation.quickActions).not.toBe(previous.presentation.quickActions);
    expect(next.presentation.keyInsight).toBe(previous.presentation.keyInsight);
    expect(next.presentation.safetyNotice).toBe(previous.presentation.safetyNotice);
  });

  test('refreshes biomarker-dependent sections without replacing Header or Progress', () => {
    const previousSnapshot = snapshot();
    const nextSnapshot = snapshot({
      biomarkerEntries: [{
        ...previousSnapshot.biomarkerEntries[0],
        value: 4.4,
        reportedValue: 4.4,
      }],
    });
    const previous = frame(previousSnapshot);
    const next = refreshTodayPresentation(previous, nextSnapshot);

    expect(diffTodaySnapshots(previousSnapshot, nextSnapshot)).toMatchObject({
      profile: false,
      biomarkers: true,
      protocol: false,
      healthConnection: false,
      exercise: false,
      localDay: false,
    });
    expect(next.presentation.header).toBe(previous.presentation.header);
    expect(next.presentation.progress).toBe(previous.presentation.progress);
    expect(next.presentation.brief).not.toBe(previous.presentation.brief);
    expect(next.presentation.priorities).not.toBe(previous.presentation.priorities);
    expect(next.presentation.quickActions).not.toBe(previous.presentation.quickActions);
  });

  test('updates protocol completion while retaining unrelated presentation models', () => {
    const previousSnapshot = snapshot();
    const nextSnapshot = snapshot({
      protocol: {
        ...previousSnapshot.protocol,
        taken: ['Metformin'],
      },
    });
    const previous = frame(previousSnapshot);
    const next = refreshTodayPresentation(previous, nextSnapshot);

    expect(diffTodaySnapshots(previousSnapshot, nextSnapshot)).toMatchObject({
      protocol: true,
      changed: true,
    });
    expect(next.presentation.header).toBe(previous.presentation.header);
    expect(next.presentation.brief).toBe(previous.presentation.brief);
    expect(next.presentation.progress).not.toBe(previous.presentation.progress);
    expect(next.presentation.priorities).not.toBe(previous.presentation.priorities);
    expect(next.presentation.quickActions).not.toBe(previous.presentation.quickActions);
    expect(next.presentation.progress.completedCount).toBe(1);
  });

  test('limits exercise and connection refreshes to their dependent sections', () => {
    const previousSnapshot = snapshot();
    const exerciseSnapshot = snapshot({
      exerciseLogs: [{
        id: 'exercise-1',
        exerciseId: 'walk',
        exerciseName: 'Walk',
        category: 'Cardio',
        date: '2026-07-24',
        loggedAt: '2026-07-24T07:00:00.000Z',
      }],
    });
    const previous = frame(previousSnapshot);
    const exercise = refreshTodayPresentation(previous, exerciseSnapshot);

    expect(exercise.presentation.header).toBe(previous.presentation.header);
    expect(exercise.presentation.brief).toBe(previous.presentation.brief);
    expect(exercise.presentation.priorities).toBe(previous.presentation.priorities);
    expect(exercise.presentation.progress).toBe(previous.presentation.progress);
    expect(exercise.presentation.quickActions).not.toBe(previous.presentation.quickActions);

    const healthSnapshot = snapshot({
      healthData: {
        source: 'healthkit',
        lastSynced: '2026-07-24T08:00:00.000Z',
      },
    });
    const health = refreshTodayPresentation(previous, healthSnapshot);
    expect(health.presentation.header).toBe(previous.presentation.header);
    expect(health.presentation.priorities).toBe(previous.presentation.priorities);
    expect(health.presentation.progress).toBe(previous.presentation.progress);
    expect(health.presentation.brief).not.toBe(previous.presentation.brief);
    expect(health.presentation.quickActions).not.toBe(previous.presentation.quickActions);
  });

  test('refreshes day-sensitive sections without replacing the Brief', () => {
    const previousSnapshot = snapshot();
    const nextSnapshot = snapshot({
      capturedAt: '2026-07-25T08:30:00.000Z',
      localDay: '2026-07-25',
    });
    const previous = frame(previousSnapshot);
    const next = refreshTodayPresentation(previous, nextSnapshot);

    expect(diffTodaySnapshots(previousSnapshot, nextSnapshot)).toMatchObject({
      localDay: true,
      changed: true,
    });
    expect(next.presentation.header).not.toBe(previous.presentation.header);
    expect(next.presentation.brief).toBe(previous.presentation.brief);
    expect(next.presentation.priorities).not.toBe(previous.presentation.priorities);
    expect(next.presentation.progress).not.toBe(previous.presentation.progress);
    expect(next.presentation.quickActions).not.toBe(previous.presentation.quickActions);
  });

  test('retains valid content on refresh failure and rejects stale hook results', () => {
    const hookSource = fs.readFileSync(
      path.join(process.cwd(), 'src/hooks/useTodaySnapshot.ts'),
      'utf8',
    );
    const screenSource = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/TodayScreen.tsx'),
      'utf8',
    );
    const catchStart = hookSource.indexOf('} catch (reason: unknown) {');
    const finallyStart = hookSource.indexOf('} finally {', catchStart);
    const catchBody = hookSource.slice(catchStart, finallyStart);
    const staleGuards = hookSource.match(
      /if \(requestSequence\.current !== requestId\) return;/g,
    ) ?? [];

    expect(catchBody).not.toContain('setSnapshot(');
    expect(staleGuards.length).toBeGreaterThanOrEqual(3);
    expect(screenSource).toContain('const presentationFrameRef = useRef');
    expect(screenSource).toContain('refreshTodayPresentation(previous, snapshot)');
    expect(screenSource).toContain('accessibilityState={{ busy: refreshing }}');
    expect(screenSource).not.toMatch(
      /setInterval|setTimeout|poll|TodayLoadingState[^]*refreshing \?/i,
    );
  });

  test('keeps diffing pure and separate from React, storage, AI, and science', () => {
    const refreshSource = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/todayRefresh.ts'),
      'utf8',
    );

    expect(refreshSource).not.toMatch(
      /from ['"]react|use[A-Z]\w*\(|AsyncStorage|setItem|removeItem/,
    );
    expect(refreshSource).not.toMatch(
      /AIAdvisor|advisorService|anthropic|Premium|supabase/i,
    );
    expect(refreshSource).not.toMatch(
      /clinicalPhenoAge|scientificModels|classify|calculate|navigate\(/i,
    );
    expect(refreshSource).not.toMatch(/JSON\.stringify|Date\.now|new Date\(\)/);
    expect(refreshSource).not.toMatch(/\bpresentToday\(/);
  });
});
