import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const AFFECTED_FILES = [
  'src/screens/DashboardScreen.tsx',
  'src/screens/LongevityScoreScreen.tsx',
  'src/screens/ProfileScreen.tsx',
  'src/screens/BiomarkerDetailScreen.tsx',
  'src/screens/BiomarkerEntryScreen.tsx',
  'src/screens/AboutScreen.tsx',
  'src/components/health/BiomarkerHistoryChart.tsx',
  'src/data/firstRunContent.ts',
];

function affectedSource(): string {
  return AFFECTED_FILES
    .map(file => fs.readFileSync(path.join(ROOT, file), 'utf8'))
    .join('\n');
}

describe('scientific stop-loss copy and feature removal', () => {
  test('removes the age-ratio projection component completely', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/components/FutureSelf.tsx'))).toBe(false);
    expect(affectedSource()).not.toMatch(/aging rate|biologicalAge\s*\/\s*chronologicalAge/i);
  });

  test('contains no projected lifespan, years-saved, or faux-confidence outputs', () => {
    const source = affectedSource();
    expect(source).not.toMatch(/projected lifespan|bio years|biological years saved|years saved|years younger/i);
    expect(source).not.toMatch(/bioConfidence|% confident|score confidence/i);
  });

  test('uses the exact nine-input requirement and corrected output name', () => {
    const source = affectedSource();
    expect(source).toContain('Blood phenotypic age');
    expect(source).toContain('9 required blood measurements');
    expect(source).not.toMatch(/first three biomarkers|three values reveal|log 4\+ biomarkers/i);
  });

  test('removes generic evidence-review presentation and legacy Optimal labels', () => {
    const source = affectedSource();
    expect(source).not.toMatch(/Pharmacist-reviewed|Evidence grade based on RCT|✓ Optimal|Suboptimal/i);
    expect(source).toContain('Clinical interpretation is being reviewed');
    expect(source).toContain('Ranges vary by laboratory, assay, population, and clinical context');
    expect(source).not.toContain('{bm.description}');
    expect(source).not.toContain('{bm.howToImprove}');
  });
});
