import fs from 'node:fs';
import path from 'node:path';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn() },
}));
jest.mock('../lib/biomarkerEntryService', () => ({
  loadBiomarkerHistory: jest.fn(),
}));
jest.mock('../lib/healthkit', () => ({
  loadHealthData: jest.fn(),
}));
jest.mock('../lib/supabase', () => ({
  captureAuthRequestScope: jest.fn(),
  isAuthRequestScopeCurrent: jest.fn(),
  supabase: {},
}));

import type { ExerciseLogEntry } from '../data/exercises';
import type { AuthRequestScope } from '../lib/authSessionCoordinator';
import {
  loadTodayDataSnapshot,
  type TodayDataDependencies,
} from '../lib/todayData';
import type { HealthData } from '../lib/healthkit';
import type { UserProfile } from '../lib/userProfilePersistence';
import type { StoredEntry } from '../types/biomarkerEntry';
import type { ProtocolState } from '../types/protocol';

const SCOPE: AuthRequestScope = { userId: 'user-a', generation: 7 };
const CAPTURED_AT = new Date('2026-07-24T08:30:00.000Z');

const profile: UserProfile = {
  name: 'Alex',
  age: 42,
  sex: 'female',
  goal: 'Track & understand',
  conditions: [],
  medications: ['Metformin'],
  onboardingComplete: true,
};

const biomarkerEntry: StoredEntry = {
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
    laboratoryName: 'Example Laboratory',
  },
};

const protocol: ProtocolState = {
  supplements: [{
    id: 'magnesium',
    name: 'Magnesium',
    dose: '200 mg',
    source: 'manual',
    addedAt: '2026-01-01T00:00:00.000Z',
  }],
  medTimes: { Metformin: 'evening' },
  hiddenMeds: [],
  taken: ['magnesium'],
  takenDate: '2026-07-24',
  currentStreak: 0,
  bestStreak: 0,
  lastCompleteDate: '',
};

const exerciseLog: ExerciseLogEntry = {
  id: 'exercise-1',
  exerciseId: 'walk',
  exerciseName: 'Walk',
  category: 'Cardio',
  date: '2026-07-24',
  durationMin: 30,
  loggedAt: '2026-07-24T07:00:00.000Z',
};

const healthData: HealthData = {
  source: 'healthkit',
  hrv: 52,
  lastSynced: '2026-07-24T08:00:00.000Z',
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function dependencies(overrides: Partial<TodayDataDependencies> = {}): {
  ports: TodayDataDependencies;
  getItem: jest.Mock;
  loadBiomarkers: jest.Mock;
  loadConnectedHealth: jest.Mock;
  isScopeCurrent: jest.Mock;
  source: {
    profile: UserProfile;
    biomarkerEntry: StoredEntry;
    protocol: ProtocolState;
    healthData: HealthData;
  };
} {
  const source = {
    profile: clone(profile),
    biomarkerEntry: clone(biomarkerEntry),
    protocol: clone(protocol),
    healthData: clone(healthData),
  };
  const stored = new Map<string, string>([
    ['@vitalspan_user_profile', JSON.stringify(source.profile)],
    ['@vitalspan_protocol', JSON.stringify(source.protocol)],
    ['@vitalspan_exercise_log', JSON.stringify([exerciseLog])],
  ]);
  const getItem = jest.fn(async (key: string) => stored.get(key) ?? null);
  const loadBiomarkers = jest.fn(async () => [source.biomarkerEntry]);
  const loadConnectedHealth = jest.fn(async () => source.healthData);
  const isScopeCurrent = jest.fn(() => true);
  return {
    ports: {
      storage: { getItem },
      loadBiomarkers,
      loadConnectedHealth,
      captureScope: () => SCOPE,
      isScopeCurrent,
      now: () => CAPTURED_AT,
      ...overrides,
    },
    getItem,
    loadBiomarkers,
    loadConnectedHealth,
    isScopeCurrent,
    source,
  };
}

describe('immutable Today data snapshot', () => {
  test('aggregates existing loaders and persisted data without deriving presentation', async () => {
    const { ports, getItem, loadBiomarkers, loadConnectedHealth } = dependencies();

    const snapshot = await loadTodayDataSnapshot(
      { forceBiomarkerRefresh: true },
      ports,
    );

    expect(snapshot).toEqual({
      capturedAt: CAPTURED_AT.toISOString(),
      localDay: '2026-07-24',
      profile,
      biomarkerEntries: [biomarkerEntry],
      protocol,
      exerciseLogs: [exerciseLog],
      healthData,
    });
    expect(getItem.mock.calls.map(([key]) => key)).toEqual([
      '@vitalspan_user_profile',
      '@vitalspan_protocol',
      '@vitalspan_exercise_log',
    ]);
    expect(loadBiomarkers).toHaveBeenCalledWith(true);
    expect(loadConnectedHealth).toHaveBeenCalledTimes(1);
  });

  test('returns an isolated deeply frozen snapshot', async () => {
    const { ports, source } = dependencies();
    const snapshot = await loadTodayDataSnapshot({}, ports);
    expect(snapshot).not.toBeNull();

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot?.profile)).toBe(true);
    expect(Object.isFrozen(snapshot?.profile?.medications)).toBe(true);
    expect(Object.isFrozen(snapshot?.biomarkerEntries)).toBe(true);
    expect(Object.isFrozen(snapshot?.biomarkerEntries[0]?.sourceLabRange)).toBe(true);
    expect(Object.isFrozen(snapshot?.protocol.supplements)).toBe(true);
    expect(Object.isFrozen(snapshot?.exerciseLogs)).toBe(true);
    expect(Object.isFrozen(snapshot?.healthData)).toBe(true);

    source.profile.medications[0] = 'Changed outside snapshot';
    source.biomarkerEntry.sourceLabRange!.upperBound = 99;
    source.protocol.taken.push('changed-outside-snapshot');
    source.healthData.hrv = 1;

    expect(snapshot?.profile?.medications).toEqual(['Metformin']);
    expect(snapshot?.biomarkerEntries[0]?.sourceLabRange?.upperBound).toBe(5);
    expect(snapshot?.protocol.taken).toEqual(['magnesium']);
    expect(snapshot?.healthData?.hrv).toBe(52);
  });

  test('returns no account data when authentication is absent or changes during load', async () => {
    const signedOut = dependencies({ captureScope: () => null });
    await expect(loadTodayDataSnapshot({}, signedOut.ports)).resolves.toBeNull();
    expect(signedOut.getItem).not.toHaveBeenCalled();
    expect(signedOut.loadBiomarkers).not.toHaveBeenCalled();

    const stale = dependencies({ isScopeCurrent: () => false });
    await expect(loadTodayDataSnapshot({}, stale.ports)).resolves.toBeNull();
  });

  test('fails closed for malformed cached profile, protocol, and exercise data', async () => {
    const stored = new Map<string, string>([
      ['@vitalspan_user_profile', '{invalid'],
      ['@vitalspan_protocol', JSON.stringify({ taken: ['unowned-shape'] })],
      ['@vitalspan_exercise_log', JSON.stringify({ id: 'not-an-array' })],
    ]);
    const { ports } = dependencies({
      storage: { getItem: async key => stored.get(key) ?? null },
    });

    const snapshot = await loadTodayDataSnapshot({}, ports);
    expect(snapshot?.profile).toBeNull();
    expect(snapshot?.protocol).toMatchObject({
      supplements: [],
      medTimes: {},
      hiddenMeds: [],
      taken: [],
      takenDate: '',
    });
    expect(snapshot?.exerciseLogs).toEqual([]);
  });

  test('propagates storage failure without substituting fabricated data', async () => {
    const { ports } = dependencies({
      storage: {
        getItem: async () => {
          throw new Error('storage unavailable');
        },
      },
    });

    await expect(loadTodayDataSnapshot({}, ports))
      .rejects.toThrow('storage unavailable');
  });

  test('keeps the loader and hook outside presentation, science, Premium, AI, and navigation', () => {
    const loaderSource = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/todayData.ts'),
      'utf8',
    );
    const modelSource = fs.readFileSync(
      path.join(process.cwd(), 'src/types/todayData.ts'),
      'utf8',
    );
    const hookSource = fs.readFileSync(
      path.join(process.cwd(), 'src/hooks/useTodaySnapshot.ts'),
      'utf8',
    );
    const dashboardSource = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/DashboardScreen.tsx'),
      'utf8',
    );

    const boundarySource = `${loaderSource}\n${modelSource}\n${hookSource}`;
    expect(boundarySource).not.toMatch(/todayExperience|clinicalPhenoAge|Premium|AIAdvisor/);
    expect(boundarySource).not.toMatch(/useNavigation|navigate\(/);
    expect(boundarySource).not.toMatch(/buildPriority|priority:|recommendation:/);
    expect(boundarySource).not.toMatch(/AsyncStorage\.(?:setItem|removeItem|multiSet)/);
    expect(dashboardSource).not.toContain('useTodaySnapshot');
  });
});
