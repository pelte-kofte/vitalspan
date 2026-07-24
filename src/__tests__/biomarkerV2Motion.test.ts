import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const source = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

describe('Biomarker Detail V2 motion polish', () => {
  const detail = source('src/screens/BiomarkerDetailScreen.tsx');
  const entry = source('src/screens/BiomarkerEntryScreen.tsx');
  const chart = source('src/components/health/BiomarkerHistoryChart.tsx');
  const activeExperience = `${detail}\n${entry}\n${chart}`;

  test('keeps the three-stage screen entrance below 600 milliseconds', () => {
    expect(detail).toContain(
      'const duration = reduceMotion ? 140 : 220',
    );
    expect(detail).toContain(
      'Animated.stagger(reduceMotion ? 0 : 90, animations)',
    );
    expect(220 + 90 * 2).toBeLessThan(600);
    expect(detail).toContain('outputRange: [reduceMotion ? 0 : 8, 0]');
  });

  test('draws the line, fades the band, enlarges points, and moves one tooltip', () => {
    expect(chart).toContain('AnimatedPolyline');
    expect(chart).toContain('strokeDashoffset');
    expect(chart).toContain('withDelay(220');
    expect(chart).toContain('AnimatedRect');
    expect(chart).toContain('AnimatedChartPoint');
    expect(chart).toContain('4 + selection.value * 2');
    expect(chart).toContain('translateX: tooltipX');
    expect(chart).toContain('translateY: tooltipY');
    expect(chart.match(/style=\{\[\s*s\.tooltip,/g)).toHaveLength(1);
    expect(chart).toContain('Haptics.selectionAsync()');
  });

  test('animates each mutation once and guards duplicate execution', () => {
    expect(detail).toContain("type HistoryMutationKind = 'added' | 'edited'");
    expect(detail).toContain('handledMutationToken.current === mutation.token');
    expect(detail).toContain('historyHighlight');
    expect(detail).toContain('maxHeight: collapse.interpolate');
    expect(detail).toContain('mutationExecution.current.has(entry.id)');
    expect(detail).toContain('setPendingDeleteId(entry.id)');
    expect(detail).toContain('<CrossfadeResultContent');
    expect(detail).not.toMatch(/setInterval|setTimeout/);
  });

  test('provides keyboard-safe field focus and explicit save states', () => {
    expect(entry).toContain('automaticallyAdjustKeyboardInsets');
    expect(entry).toContain("focusField('value')");
    expect(entry).toContain("focusField('unit')");
    expect(entry).toContain("focusField('date')");
    expect(entry).toContain("type SaveState = 'idle' | 'loading' | 'success' | 'failure'");
    expect(entry).toContain('saveInFlight.current');
    expect(entry).toContain("saveState === 'success'");
    expect(entry).toContain("saveState === 'failure'");
    expect(entry).toContain('accessibilityLiveRegion="assertive"');
    expect(entry).toContain('navigation.goBack()');
    expect(entry).not.toMatch(/setTimeout|delay\(/);
  });

  test('uses fades instead of movement when Reduce Motion is enabled', () => {
    expect(detail).toContain('outputRange: [reduceMotion ? 0 : 8, 0]');
    expect(detail).toContain('outputRange: [reduceMotion ? 0 : 7, 0]');
    expect(chart).toContain('if (reduceMotion || points.length < 2)');
    expect(detail).toContain('duration: reduceMotion ? 120 : 170');
    expect(entry).toContain('outputRange: [reduceMotion ? 1 : 0.995, 1]');
    expect(entry).toContain('saveButtonPressedReduced');
  });

  test('adds no health-direction or score-like motion language', () => {
    expect(activeExperience).not.toMatch(
      /\b(improving|declining|increased today|decreased today|better|worse|optimal|healthy|normal for you)\b/i,
    );
    expect(activeExperience).not.toMatch(/count-up|score animation|celebrat/i);
  });
});
