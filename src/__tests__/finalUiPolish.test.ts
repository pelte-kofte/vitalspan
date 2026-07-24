import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ExerciseLogEntry } from '../data/exercises';
import {
  estimateZone2HeartRate,
  summarizeLongevityWeek,
  ZONE_2_EXERCISE_ID,
} from '../lib/exerciseLongevity';

const ROOT = process.cwd();
const source = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

function cardioLog(overrides: Partial<ExerciseLogEntry>): ExerciseLogEntry {
  return {
    id: 'log',
    exerciseId: ZONE_2_EXERCISE_ID,
    exerciseName: 'Zone 2 cardio',
    category: 'Cardio',
    date: '2026-07-22',
    loggedAt: '2026-07-22T10:00:00.000Z',
    durationMin: 30,
    ...overrides,
  };
}

describe('final product UI polish', () => {
  test('Zone 2 first-use and age-available states stay explicitly estimated', () => {
    expect(estimateZone2HeartRate(null)).toBeNull();
    expect(estimateZone2HeartRate(17)).toBeNull();
    expect(estimateZone2HeartRate(35)).toEqual({ lowBpm: 110, highBpm: 128 });

    const exercise = source('src/screens/ExerciseScreen.tsx');
    expect(exercise).toContain('PERCEIVED-EFFORT GUIDE');
    expect(exercise).toContain('ESTIMATED FROM PROFILE AGE');
    expect(exercise).toContain('not a clinical threshold');
    expect(exercise).toContain('Laboratory testing can establish a different individual range');
  });

  test('weekly movement summary counts only explicit Zone 2 and distinct strength/VO2 sessions', () => {
    const logs: ExerciseLogEntry[] = [
      cardioLog({ id: 'z1', durationMin: 35 }),
      cardioLog({ id: 'z2', date: '2026-07-23', durationMin: 25 }),
      cardioLog({ id: 'v1', exerciseId: 'other', exerciseName: 'VO2 max intervals', date: '2026-07-23' }),
      cardioLog({ id: 's1', exerciseId: 'squat', exerciseName: 'Squat', category: 'Legs', date: '2026-07-21' }),
      cardioLog({ id: 's2', exerciseId: 'row', exerciseName: 'Row', category: 'Pull / Row', date: '2026-07-21' }),
      cardioLog({ id: 'old', date: '2026-07-13', durationMin: 100 }),
    ];
    expect(summarizeLongevityWeek(logs, '2026-07-20', '2026-07-27')).toEqual({
      zone2Minutes: 60,
      strengthSessions: 1,
      vo2Sessions: 1,
    });
    expect(summarizeLongevityWeek([], '2026-07-20', '2026-07-27')).toEqual({
      zone2Minutes: 0,
      strengthSessions: 0,
      vo2Sessions: 0,
    });
  });

  test('exercise and protocol completion persistence contracts are unchanged', () => {
    const exercise = source('src/screens/ExerciseScreen.tsx');
    const quickLog = source('src/components/QuickLogModal.tsx');
    const protocol = source('src/screens/ProtocolScreen.tsx');
    const protocolPersistence = source('src/lib/protocolPersistence.ts');
    expect(exercise).toContain("AsyncStorage.setItem('@vitalspan_exercise_log'");
    expect(quickLog).toContain("AsyncStorage.setItem('@vitalspan_exercise_log'");
    expect(protocol).toContain('function toggleTaken(id: string)');
    expect(protocol).toContain('persistProtocolState(');
    expect(protocolPersistence).toContain("PROTOCOL_STORAGE_KEY = '@vitalspan_protocol'");
    expect(protocolPersistence).toContain("PROTOCOL_TODAY_STORAGE_KEY = '@vitalspan_protocol_today'");
    expect(protocol).toContain('accessibilityRole="checkbox"');
  });

  test('profile and settings retain account actions while separating destructive controls', () => {
    const profile = source('src/screens/ProfileScreen.tsx');
    const settings = source('src/screens/SettingsScreen.tsx');
    expect(profile).toContain('signOutUser()');
    expect(profile).toContain('Connected health sources');
    expect(profile).toContain('Subscription');
    expect(settings).toContain('Subscription & restore purchases');
    expect(settings).toContain('Privacy & data');
    expect(settings).toContain('Destructive actions');
    expect(settings).toContain('handleClearData');
    expect(settings).toContain('handleSignOut');
  });

  test('biomarker V2 shows only measurement facts and report-specific references', () => {
    const detail = source('src/screens/BiomarkerDetailScreen.tsx');
    const entry = source('src/screens/BiomarkerEntryScreen.tsx');
    const chart = source('src/components/health/BiomarkerHistoryChart.tsx');
    expect(detail).toContain('Reference interval from this laboratory report');
    expect(detail).toContain('hasImportedReportReference(latest)');
    expect(detail).toContain('Measurement history');
    expect(detail).toContain("entryId: entry.id");
    expect(entry).toContain('Measurement date');
    expect(entry).toContain('Result value');
    expect(entry).not.toContain('placeholder="Low"');
    expect(entry).not.toContain('placeholder="High"');
    expect(chart).toContain('historical');
    expect(chart).toContain('accessibilityState={{ selected:');
    expect(`${detail}\n${entry}`).not.toMatch(
      /\.optMin|\.optMax|\.target|\.howToImprove|\.insight/,
    );
  });

  test('article empty state remains editorial and Advisor premium gate is untouched', () => {
    const articles = source('src/screens/ArticlesScreen.tsx');
    const advisor = source('src/screens/AIAdvisorScreen.tsx');
    expect(articles).toContain('The next issue is being edited.');
    expect(articles).toContain('Read the archive');
    expect(advisor).toContain("if (accessState === 'paywall') nav.replace('Paywall')");
    expect(advisor).toContain("accessState !== 'allowed'");
  });

  test('shared layout includes compact, standard, and large phone-safe geometry', () => {
    const theme = source('src/theme/index.ts');
    const header = source('src/components/ProductScreenHeader.tsx');
    expect(theme).toContain('compactBreakpoint: 360');
    expect(theme).toContain('maxContentWidth: 720');
    expect(theme).toContain('bottomClearance: 64');
    expect(header).toContain('headerCompact');
    expect(header).toContain('maxFontSizeMultiplier');
  });
});
