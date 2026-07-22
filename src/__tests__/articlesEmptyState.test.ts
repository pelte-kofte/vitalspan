import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const dashboard = readFileSync(join(ROOT, 'src/screens/DashboardScreen.tsx'), 'utf8');
const articles = readFileSync(join(ROOT, 'src/screens/ArticlesScreen.tsx'), 'utf8');

describe('Vitalspan Brief availability states', () => {
  test('treats no published current issue as an editorial empty state', () => {
    expect(dashboard).toContain('The next issue is being edited');
    expect(dashboard).not.toContain('The current issue is unavailable');
    expect(articles).toContain('The next issue is being edited.');
    expect(articles).toContain('Read the archive');
  });

  test('keeps fetch failures recoverable and separate from no publication', () => {
    expect(articles).toContain('The issue could not be refreshed.');
    expect(articles).toContain('Try again');
    expect(dashboard).toContain('Weekly research could not refresh');
  });
});
