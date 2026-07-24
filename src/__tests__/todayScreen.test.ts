import fs from 'node:fs';
import path from 'node:path';

function source(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('TodayScreen orchestration', () => {
  const screen = source('src/screens/TodayScreen.tsx');

  test('composes the completed Today layers without replacing their authority', () => {
    expect(screen).toContain(
      "import { useTodaySnapshot } from '../hooks/useTodaySnapshot';",
    );
    expect(screen).toContain(
      "import { presentToday } from '../lib/todayPresenter';",
    );
    expect(screen).toContain(
      "import { adaptTodaySafety } from '../lib/todaySafetyAdapter';",
    );
    expect(screen).toContain("from '../components/todayV2';");
    expect(screen).toContain('presentation: presentToday(snapshot)');
    expect(screen).toContain(
      '() => adaptTodaySafety(safetyAlert)',
    );
    expect(screen).toContain('refreshTodayPresentation(previous, snapshot)');
  });

  test('renders the canonical ready-state hierarchy', () => {
    const hierarchy = [
      '<TodayHeader',
      '<SafetyNotice',
      '<DailyHealthBrief',
      '<TopPriorities',
      '<KeyInsight',
      '<TodayProgress',
      '<TodayQuickActions',
    ];
    const positions = hierarchy.map(component => screen.indexOf(component));

    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(screen).toContain('notice={safetyNotice}');
    expect(screen).toContain('insight={presentation.keyInsight}');
    expect(screen).toContain('actions={presentation.quickActions}');
    expect(screen.indexOf('<SafetyNotice')).toBeLessThan(
      screen.indexOf('{accountNotice}'),
    );
    expect(screen.indexOf('<TodayQuickActions')).toBeLessThan(
      screen.indexOf('{accountNotice}'),
    );
  });

  test('supports initial loading, retained-content refresh, and calm failure', () => {
    expect(screen).toContain('if (!snapshot)');
    expect(screen).toContain('{loading ? (');
    expect(screen).toContain('<TodayLoadingState />');
    expect(screen).toContain('<RefreshControl');
    expect(screen).toContain('refreshing={refreshing}');
    expect(screen).toContain('onRefresh={retry}');
    expect(screen).toContain('accessibilityState={{ busy: refreshing }}');
    expect(screen).toContain('The latest update is unavailable.');

    const presentationPosition = screen.indexOf(
      'const presentation = presentationFrame!.presentation;',
    );
    const refreshingPosition = screen.indexOf(
      'accessibilityState={{ busy: refreshing }}',
    );
    expect(presentationPosition).toBeLessThan(refreshingPosition);
    expect(screen).toContain(
      "if (mountedRef.current && outcome === 'refresh') return refreshAll();",
    );
    expect(screen).toContain('.catch(() => undefined)');
  });

  test('delegates all actions and priority explanations to injected handlers', () => {
    expect(screen).toContain(
      ') => TodayActionOutcome | Promise<TodayActionOutcome>;',
    );
    expect(screen).toContain(
      'readonly onExplainPriority: (priority: TodayPriority) => void;',
    );
    expect(screen).toContain('onAction={handleAction}');
    expect(screen).toContain('onExplain={onExplainPriority}');
    expect(screen).not.toMatch(/switch \(\s*action\.kind|case ['"]open_/);
    expect(screen).not.toMatch(/useNavigation|navigation\.|navigate\(/);
  });

  test('contains orchestration only and no direct data or decision dependencies', () => {
    expect(screen).not.toMatch(
      /AsyncStorage|setItem|removeItem|multiSet|supabase/i,
    );
    expect(screen).not.toMatch(
      /AIAdvisor|advisorService|anthropic|Premium|entitlement/i,
    );
    expect(screen).not.toMatch(
      /clinicalPhenoAge|scientificModels|classify|calculate|buildPriority/i,
    );
    expect(screen).not.toMatch(
      /biomarkerEntryService|protocolPersistence|healthkit|todayData/,
    );
    expect(screen).not.toMatch(/Math\.random|Date\.now|new Date\(\)/);
  });

  test('is activated through the route adapter without coupling Dashboard', () => {
    const dashboard = source('src/screens/DashboardScreen.tsx');
    const navigator = source('src/navigation/AppNavigator.tsx');
    const homeAdapter = source('src/screens/TodayHomeScreen.tsx');

    expect(dashboard).not.toContain('TodayScreen');
    expect(navigator).toContain(
      "import TodayHomeScreen from '../screens/TodayHomeScreen';",
    );
    expect(navigator).toContain("ACTIVE_HOME_EXPERIENCE = 'today'");
    expect(navigator).toContain(
      "import DashboardScreen from '../screens/DashboardScreen';",
    );
    expect(navigator).toMatch(/component=\{ActiveHomeScreen\}/);
    expect(homeAdapter).toContain('<TodayScreen');
  });
});
