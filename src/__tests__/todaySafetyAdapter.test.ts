import fs from 'node:fs';
import path from 'node:path';

import { adaptTodaySafety } from '../lib/todaySafetyAdapter';
import type { TodaySafetyAlert } from '../lib/todayExperience';

function safetyAlert(
  overrides: Partial<TodaySafetyAlert> = {},
): TodaySafetyAlert {
  return {
    id: 'safety:Vitamin K:Warfarin',
    title: 'Possible interaction needs review',
    body: 'Vitamin K and Warfarin may interact. Review the existing interaction guidance before taking them together.',
    sourceLabel: 'Current medication and supplement protocol',
    action: { destination: 'InteractionChecker' },
    ...overrides,
  };
}

describe('Today Safety Adapter', () => {
  test('maps the existing resolved safety output without changing its meaning', () => {
    const source = safetyAlert();

    expect(adaptTodaySafety(source)).toEqual({
      id: source.id,
      title: source.title,
      summary: source.body,
      actionLabel: 'Review interaction',
      action: { kind: 'review_interactions' },
    });
  });

  test('keeps safety nullable when no governed output exists', () => {
    expect(adaptTodaySafety(null)).toBeNull();
  });

  test.each([
    ['identifier', { id: '  ' }],
    ['title', { title: '' }],
    ['summary', { body: '\n' }],
    ['source', { sourceLabel: '' }],
    ['review destination', { action: { destination: 'Protocol' } }],
  ])('fails closed when the resolved %s is unsupported', (_, overrides) => {
    expect(adaptTodaySafety(safetyAlert(
      overrides as Partial<TodaySafetyAlert>,
    ))).toBeNull();
  });

  test('fails closed rather than throwing for a malformed resolved output', () => {
    const malformed = {
      ...safetyAlert(),
      title: null,
      action: null,
    } as unknown as TodaySafetyAlert;

    expect(adaptTodaySafety(malformed)).toBeNull();
  });

  test('is deterministic and does not mutate the governed input', () => {
    const source = safetyAlert();
    const before = JSON.stringify(source);
    const first = adaptTodaySafety(source);
    const second = adaptTodaySafety(source);

    expect(first).toEqual(second);
    expect(JSON.stringify(source)).toBe(before);
  });

  test('contains no rule evaluation or runtime integration dependencies', () => {
    const adapterSource = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/todaySafetyAdapter.ts'),
      'utf8',
    );
    const presenterSource = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/todayPresenter.ts'),
      'utf8',
    );
    const dashboardSource = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/DashboardScreen.tsx'),
      'utf8',
    );
    const navigationSource = fs.readFileSync(
      path.join(process.cwd(), 'src/navigation/AppNavigator.tsx'),
      'utf8',
    );

    expect(adapterSource).not.toMatch(
      /\bAdvisorContext\b|\btimingConflicts\b|\bINTERACTIONS\b|\bclassify\w*\(|\bcalculate\w*\(|\brank\w*\(/,
    );
    expect(adapterSource).not.toMatch(
      /AsyncStorage|setItem|removeItem|from ['"]react|use[A-Z]\w*\(/,
    );
    expect(adapterSource).not.toMatch(
      /Premium|AIAdvisor|advisorService|anthropic|supabase/i,
    );
    expect(adapterSource).not.toMatch(/Math\.random|Date\.now|new Date\(\)/);
    expect(adapterSource).not.toMatch(/^import (?!type )/m);
    expect(presenterSource).not.toContain('todaySafetyAdapter');
    expect(dashboardSource).not.toContain('todaySafetyAdapter');
    expect(navigationSource).not.toContain('todaySafetyAdapter');
  });
});
