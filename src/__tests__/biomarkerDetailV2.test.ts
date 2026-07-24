import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const source = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

describe('Biomarker Detail V2 product boundary', () => {
  const detail = source('src/screens/BiomarkerDetailScreen.tsx');
  const entry = source('src/screens/BiomarkerEntryScreen.tsx');
  const chart = source('src/components/health/BiomarkerHistoryChart.tsx');
  const activeExperience = `${detail}\n${entry}\n${chart}`;

  test('keeps manual entry to the four required fields', () => {
    expect(entry).toContain('Search biomarkers');
    expect(entry).toContain('Result value');
    expect(entry).toContain('Unit');
    expect(entry).toContain('Measurement date');
    expect(entry).not.toMatch(/labRangeLow|labRangeHigh|placeholder="Low"|placeholder="High"/);
  });

  test('selects report, app classification, or no classification without changing manual entry', () => {
    expect(detail).toContain('hasImportedReportReference(latest)');
    expect(detail).toContain("entry.source.trim().toLowerCase() === 'lab pdf'");
    expect(detail).toContain('resolveBiomarkerClassification({');
    expect(detail).toContain('classificationBandsForChart({');
    expect(detail).toContain('Reference interval from this laboratory report');
    expect(detail).toContain('General reference interval');
    expect(detail).toContain(
      'Ranges may vary by laboratory, method, age, sex, and clinical context.',
    );
    expect(entry).not.toMatch(/labRangeLow|labRangeHigh|placeholder="Low"|placeholder="High"/);
  });

  test('provides chart, chronological history, add, edit, and delete controls', () => {
    expect(detail).toContain('.sort((a, b) => a.date.localeCompare(b.date))');
    expect(detail).toContain('<BiomarkerHistoryChart');
    expect(detail).toContain('referenceInterval={reportReference}');
    expect(detail).toContain('classificationBands={chartBands}');
    expect(detail).toContain('Measurement history');
    expect(detail).toContain('Add another result');
    expect(detail).toContain('onEdit={editResult}');
    expect(detail).toContain('onDelete={requestDelete}');
  });

  test('contains no ungoverned biomarker targets, advice, or directional labels', () => {
    expect(activeExperience).not.toMatch(
      /\.optMin|\.optMax|\.target|\.howToImprove|\.insight/,
    );
    expect(activeExperience).not.toMatch(
      /\b(improving|declining|increased today|decreased today|better|worse|optimal|healthy|normal for you)\b/i,
    );
    expect(activeExperience).not.toMatch(
      /longevity target|how to improve|supplement|dosage/i,
    );
  });

  test('supports point selection, reduced motion, Dynamic Type, and 44-point actions', () => {
    expect(chart).toContain('reduceMotionChanged');
    expect(chart).toContain('accessibilityState={{ selected:');
    expect(chart).toContain('const TARGET_SIZE = 44');
    expect(chart).toContain('<AnimatedRect');
    expect(detail).toContain('ProductLayout.controlMinHeight');
    expect(detail).not.toContain('maxFontSizeMultiplier=');
    expect(entry).not.toContain('maxFontSizeMultiplier=');
  });
});
