import fs from 'node:fs';
import path from 'node:path';

const COMPONENT_DIRECTORY = path.join(
  process.cwd(),
  'src/components/todayV2',
);

const COMPONENT_FILES = [
  'TodayHeader.tsx',
  'SafetyNotice.tsx',
  'DailyHealthBrief.tsx',
  'TopPriorities.tsx',
  'KeyInsight.tsx',
  'TodayProgress.tsx',
  'TodayQuickActions.tsx',
  'TodayLoadingState.tsx',
] as const;

function source(file: typeof COMPONENT_FILES[number] | 'index.ts'): string {
  return fs.readFileSync(path.join(COMPONENT_DIRECTORY, file), 'utf8');
}

function componentSource(): string {
  return COMPONENT_FILES.map(source).join('\n');
}

describe('Today V2 presentation components', () => {
  test('exports the complete component set in canonical hierarchy order', () => {
    const barrel = source('index.ts');
    const expectedOrder = [
      'TodayHeader',
      'SafetyNotice',
      'DailyHealthBrief',
      'TopPriorities',
      'KeyInsight',
      'TodayProgress',
      'TodayQuickActions',
      'TodayLoadingState',
    ];

    for (const file of COMPONENT_FILES) {
      expect(fs.existsSync(path.join(COMPONENT_DIRECTORY, file))).toBe(true);
    }

    const positions = expectedOrder.map(name =>
      barrel.indexOf(`export { ${name} }`));
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test('consumes presentation contracts without application-data dependencies', () => {
    const combined = componentSource();

    expect(combined).not.toMatch(
      /todayData|useTodaySnapshot|todayPresenter|todaySafetyAdapter|todayExperience/,
    );
    expect(combined).not.toMatch(
      /AsyncStorage|storage|supabase|useNavigation|navigate\(|route\.|routeName/i,
    );
    expect(combined).not.toMatch(
      /Premium|AIAdvisor|advisorService|anthropic|scientificModels|clinicalPhenoAge/i,
    );
    expect(combined).not.toMatch(
      /\bclassify\w*\(|\bcalculate\w*\(|\bbuildPriority\w*\(/,
    );

    for (const file of COMPONENT_FILES.filter(
      name => name !== 'TodayLoadingState.tsx',
    )) {
      expect(source(file)).toContain("from '../../types/today'");
    }
  });

  test('omits nullable and empty optional sections instead of rendering filler', () => {
    expect(source('SafetyNotice.tsx')).toMatch(
      /if \(!notice\) return null;/,
    );
    expect(source('KeyInsight.tsx')).toMatch(
      /if \(!insight\) return null;/,
    );
    expect(source('TodayQuickActions.tsx')).toMatch(
      /if \(actions\.length === 0\) return null;/,
    );
    expect(componentSource()).not.toMatch(
      /no insight|nothing changed|no quick actions|coming soon|placeholder/i,
    );
  });

  test('uses semantic headings, accessible controls, and explicit state', () => {
    const headingFiles = [
      'TodayHeader.tsx',
      'SafetyNotice.tsx',
      'DailyHealthBrief.tsx',
      'TopPriorities.tsx',
      'KeyInsight.tsx',
      'TodayProgress.tsx',
      'TodayQuickActions.tsx',
    ] as const;
    for (const file of headingFiles) {
      expect(source(file)).toContain('accessibilityRole="header"');
    }

    const interactiveFiles = [
      'SafetyNotice.tsx',
      'DailyHealthBrief.tsx',
      'TopPriorities.tsx',
      'KeyInsight.tsx',
      'TodayProgress.tsx',
      'TodayQuickActions.tsx',
    ] as const;
    for (const file of interactiveFiles) {
      const content = source(file);
      expect(content).toContain('<Pressable');
      expect(content).toContain('minHeight: 44');
      expect(content).toMatch(/accessibilityRole="(?:button|checkbox)"/);
      expect(content).toContain('accessibilityLabel=');
    }

    expect(source('SafetyNotice.tsx')).toContain(
      'accessibilityRole="alert"',
    );
    expect(source('TodayProgress.tsx')).toContain(
      'accessibilityRole="progressbar"',
    );
    expect(source('TodayProgress.tsx')).toContain('accessibilityState=');
    expect(source('TodayLoadingState.tsx')).toContain(
      'accessibilityState={{ busy: true }}',
    );
  });

  test('supports flexible text and uses no motion-dependent presentation', () => {
    const combined = componentSource();

    expect(combined.match(/React\.memo\(/g)).toHaveLength(
      COMPONENT_FILES.length,
    );
    expect(combined).not.toMatch(/numberOfLines|maxFontSizeMultiplier/);
    expect(combined).not.toMatch(
      /\bAnimated\b|StaggerIn|SkeletonPulse|withTiming|withSpring/,
    );
    expect(combined).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(/i);
    expect(combined).toContain('flexWrap:');
  });

  test('does not display technical provenance or implementation details', () => {
    expect(componentSource()).not.toMatch(
      /sourceLabel|freshnessLabel|confidenceLanguage|policyVersion|modelVersion|destination/,
    );
  });

  test('remains off-route with no production imports', () => {
    const dashboard = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/DashboardScreen.tsx'),
      'utf8',
    );
    const navigator = fs.readFileSync(
      path.join(process.cwd(), 'src/navigation/AppNavigator.tsx'),
      'utf8',
    );

    expect(dashboard).not.toContain('components/todayV2');
    expect(navigator).not.toContain('components/todayV2');
    expect(fs.existsSync(
      path.join(process.cwd(), 'src/screens/TodayScreen.tsx'),
    )).toBe(true);
  });
});
