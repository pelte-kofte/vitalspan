import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const source = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

describe('pre-release UX hardening', () => {
  test('makes manual entry the primary Add Result action', () => {
    const chooser = source('src/screens/AddResultScreen.tsx');
    const manual = chooser.indexOf('Enter manually');
    const pdf = chooser.indexOf('Import laboratory PDF');
    expect(manual).toBeGreaterThan(-1);
    expect(pdf).toBeGreaterThan(manual);
    expect(chooser).toContain("navigation.replace('BiomarkerEntry'");
    expect(chooser).toContain("navigation.replace('LabUpload')");
  });

  test('manual entry asks only for biomarker, value, unit, and measurement date', () => {
    const entry = source('src/screens/BiomarkerEntryScreen.tsx');
    expect(entry).toContain('Search biomarkers');
    expect(entry).toContain('Result value');
    expect(entry).toContain('Unit');
    expect(entry).toContain('Measurement date');
    expect(entry).not.toContain('labRangeLow');
    expect(entry).not.toContain('labRangeHigh');
    expect(entry).not.toContain('placeholder="Low"');
    expect(entry).not.toContain('placeholder="High"');
    expect(entry).not.toMatch(/how to improve|longevity research target/i);
  });

  test('keeps technical Home metadata in the Evidence disclosure', () => {
    const sections = source('src/components/today/TodaySections.tsx');
    expect(sections).toContain("disclosure === 'evidence'");
    expect(sections).toContain('Source: {priority.sourceLabel}');
    expect(sections).toContain('Data status: {priority.freshnessLabel}');
    expect(sections).toContain('Confidence: {priority.confidenceLanguage}');
    expect(sections).toContain('Required blood input checklist');
  });

  test('uses a dismissible iOS modal for AI Advisor with a safe fallback', () => {
    const navigator = source('src/navigation/AppNavigator.tsx');
    const advisor = source('src/screens/AIAdvisorScreen.tsx');
    expect(navigator).toMatch(/name="AIAdvisor"[\s\S]*presentation: 'modal'/);
    expect(advisor).toContain('if (nav.canGoBack())');
    expect(advisor).toContain("nav.navigate('Main', { screen: 'Home' })");
    expect(advisor).toContain('Close AI Advisor');
  });
});
