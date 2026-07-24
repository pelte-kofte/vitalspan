import fs from 'node:fs';
import path from 'node:path';

jest.mock('../lib/supabase', () => ({
  captureAuthRequestScope: jest.fn(),
  isAuthRequestScopeCurrent: jest.fn(),
}));

import {
  PROTOCOL_STORAGE_KEY,
  PROTOCOL_TODAY_STORAGE_KEY,
} from '../lib/protocolPersistence';
import {
  createTodayMutationExecutor,
  setTodayPlanItemCompletion,
  type TodayHomeActivationDependencies,
} from '../lib/todayHomeActivation';
import { EMPTY_PROTOCOL } from '../types/protocol';

const NOW = new Date(2026, 6, 24, 9, 30, 0);
const SCOPE = { userId: 'user-1', generation: 7 };

function dependencies(
  raw: string | null,
  current = true,
): {
  readonly value: TodayHomeActivationDependencies;
  readonly setItem: jest.Mock;
} {
  const setItem = jest.fn(async () => undefined);
  return {
    setItem,
    value: {
      storage: {
        getItem: jest.fn(async () => raw),
        setItem,
      },
      captureScope: () => SCOPE,
      isScopeCurrent: () => current,
      now: () => NOW,
    },
  };
}

describe('Today Home activation', () => {
  test('activates Today and permits Dashboard only through the explicit rollback value', () => {
    const navigator = fs.readFileSync(
      path.join(process.cwd(), 'src/navigation/AppNavigator.tsx'),
      'utf8',
    );
    const dashboard = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/DashboardScreen.tsx'),
      'utf8',
    );

    expect(navigator).toContain("ACTIVE_HOME_EXPERIENCE = 'today'");
    expect(navigator).toContain(
      "ACTIVE_HOME_EXPERIENCE === 'legacy-dashboard'",
    );
    expect(navigator).toContain('? DashboardScreen');
    expect(navigator).toContain(': TodayHomeScreen');
    expect(dashboard).toContain(
      '@deprecated Rollback-only legacy Home. No new feature development.',
    );
    expect(dashboard).toContain(
      'Remove only after at least two stable Today releases.',
    );
  });

  test('contains the Dashboard import to the controlled Home switch', () => {
    function sourceFiles(directory: string): string[] {
      return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) return sourceFiles(absolute);
        return /\.[jt]sx?$/.test(entry.name) ? [absolute] : [];
      });
    }

    const imports = sourceFiles(path.join(process.cwd(), 'src'))
      .filter(file => !file.includes(`${path.sep}__tests__${path.sep}`))
      .filter(file => (
        /(?:from\s+['"][^'"]*DashboardScreen['"]|require\(\s*['"][^'"]*DashboardScreen['"]\s*\))/
          .test(fs.readFileSync(file, 'utf8'))
      ))
      .map(file => path.relative(process.cwd(), file));

    expect(imports).toEqual(['src/navigation/AppNavigator.tsx']);
  });

  test('maps every Today action and preserves route and Premium contracts', () => {
    const adapter = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/TodayHomeScreen.tsx'),
      'utf8',
    );
    const actions = [
      'open_biomarker',
      'enter_biomarker',
      'add_result',
      'import_laboratory_pdf',
      'open_health',
      'open_plan',
      'set_plan_item_completion',
      'log_movement',
      'connect_health_data',
      'complete_profile',
      'review_interactions',
      'open_learning',
      'explain_brief',
    ];

    for (const action of actions) {
      expect(adapter).toContain(`case '${action}'`);
    }
    expect(adapter).toContain('getAIAdvisorAccessState(');
    expect(adapter).toContain('buildSafetyAlert(context)');
    expect(adapter).toContain("navigation.navigate('BiomarkerDetail'");
    expect(adapter).toContain("navigation.navigate('BiomarkerEntry'");
    expect(adapter).toContain("navigation.navigate('AddResult')");
    expect(adapter).toContain("navigation.navigate('LabUpload')");
    expect(adapter).toContain("navigation.navigate('Biomarkers')");
    expect(adapter).toContain("navigation.navigate('Protocol')");
    expect(adapter).toContain("navigation.navigate('Exercise')");
    expect(adapter).toContain("navigation.navigate('LongevityScore')");
    expect(adapter).toContain("navigation.navigate('Profile')");
    expect(adapter).toContain("navigation.navigate('InteractionChecker')");
    expect(adapter).toContain("navigation.navigate('ArticleDetail'");
    expect(adapter).toContain("navigation.navigate('Articles')");
    expect(adapter).toContain("navigation.navigate('AIAdvisor')");
    expect(adapter).toContain("navigation.navigate('Paywall')");
    expect(adapter).toContain("if (isPremiumLoading) return 'handled';");
    expect(adapter).toContain('if (!isPremium)');
    expect(adapter).toContain(
      "execution.value === 'changed'",
    );
    expect(adapter).toContain("return 'refresh';");
    expect(adapter).toContain(
      'isAuthRequestScopeCurrent(actionScope)',
    );
    expect(adapter).toContain(
      "if (!mountedRef.current) return 'handled';",
    );
    expect(adapter).toContain(
      'verificationRequestRef.current?.scopeKey',
    );
    expect(adapter).toContain('resendVerificationEmail(');
  });

  test('uses the existing protocol keys and writes a completion once', async () => {
    const { value, setItem } = dependencies(JSON.stringify({
      ...EMPTY_PROTOCOL,
      taken: [],
      takenDate: '2026-07-24',
    }));

    await expect(
      setTodayPlanItemCompletion('item-1', true, value),
    ).resolves.toBe('changed');
    expect(setItem).toHaveBeenCalledWith(
      PROTOCOL_STORAGE_KEY,
      expect.stringContaining('"taken":["item-1"]'),
    );
    expect(setItem).toHaveBeenCalledWith(
      PROTOCOL_TODAY_STORAGE_KEY,
      JSON.stringify({ date: '2026-07-24', taken: ['item-1'] }),
    );
  });

  test('is idempotent and cancels stale account-scoped work', async () => {
    const completed = dependencies(JSON.stringify({
      ...EMPTY_PROTOCOL,
      taken: ['item-1'],
      takenDate: '2026-07-24',
    }));
    await expect(
      setTodayPlanItemCompletion('item-1', true, completed.value),
    ).resolves.toBe('unchanged');
    expect(completed.setItem).not.toHaveBeenCalled();

    const stale = dependencies(null, false);
    await expect(
      setTodayPlanItemCompletion('item-1', true, stale.value),
    ).resolves.toBe('cancelled');
    expect(stale.setItem).not.toHaveBeenCalled();
  });

  test('cancels an account switch before persistence and after settlement', async () => {
    const setItem = jest.fn(async () => undefined);
    const beforeWriteChecks = [true, false];
    const switchedBeforeWrite: TodayHomeActivationDependencies = {
      storage: {
        getItem: jest.fn(async () => null),
        setItem,
      },
      captureScope: () => SCOPE,
      isScopeCurrent: () => beforeWriteChecks.shift() ?? false,
      now: () => NOW,
    };

    await expect(
      setTodayPlanItemCompletion(
        'item-1',
        true,
        switchedBeforeWrite,
      ),
    ).resolves.toBe('cancelled');
    expect(setItem).not.toHaveBeenCalled();

    const afterWriteChecks = [true, true, false];
    const switchedAfterWrite: TodayHomeActivationDependencies = {
      storage: {
        getItem: jest.fn(async () => null),
        setItem,
      },
      captureScope: () => SCOPE,
      isScopeCurrent: () => afterWriteChecks.shift() ?? false,
      now: () => NOW,
    };
    await expect(
      setTodayPlanItemCompletion(
        'item-1',
        true,
        switchedAfterWrite,
      ),
    ).resolves.toBe('cancelled');
  });

  test('coalesces concurrent mutation taps and releases the key afterward', async () => {
    const executor = createTodayMutationExecutor();
    let release!: (value: string) => void;
    const mutation = jest.fn(() => new Promise<string>(resolve => {
      release = resolve;
    }));

    const first = executor.run('plan:item-1:true', mutation);
    await expect(
      executor.run('plan:item-1:true', mutation),
    ).resolves.toEqual({ status: 'duplicate' });
    expect(mutation).toHaveBeenCalledTimes(1);

    release('changed');
    await expect(first).resolves.toEqual({
      status: 'completed',
      value: 'changed',
    });
    await expect(
      executor.run('plan:item-1:true', async () => 'unchanged'),
    ).resolves.toEqual({
      status: 'completed',
      value: 'unchanged',
    });
  });
});
