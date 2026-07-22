import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const source = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

function sourceFiles(directory: string): string[] {
  return readdirSync(join(ROOT, directory)).flatMap((name) => {
    const relative = join(directory, name);
    const absolute = join(ROOT, relative);
    if (statSync(absolute).isDirectory()) {
      return name === '__tests__' ? [] : sourceFiles(relative);
    }
    return /\.(ts|tsx)$/.test(name) ? [relative] : [];
  });
}

describe('Auth Session Consistency architecture boundaries', () => {
  test('has one application auth listener owned by the coordinator', () => {
    expect(source('src/lib/authSessionCoordinator.ts')).toContain('onAuthStateChange');
    expect(source('src/screens/WelcomeScreen.tsx')).not.toContain('onAuthStateChange');
    expect(source('App.tsx')).not.toContain('onAuthStateChange');
  });

  test('uses explicit initialization states and a generation-scoped request guard', () => {
    const coordinator = source('src/lib/authSessionCoordinator.ts');
    expect(coordinator).toContain("'initializing' | 'signedOut' | 'authenticated'");
    expect(coordinator).toContain('generation');
    expect(coordinator).toContain('isScopeCurrent');
    expect(source('App.tsx')).toContain('routeState.generation !== auth.generation');
  });

  test('guards personalized AI, health, premium, dashboard, and migration commits', () => {
    for (const path of [
      'src/lib/advisorService.ts',
      'src/lib/healthkit.ts',
      'src/context/PremiumContext.tsx',
      'src/screens/DashboardScreen.tsx',
      'src/lib/biomarkerWriteService.ts',
    ]) {
      expect(source(path)).toContain('isAuthRequestScopeCurrent');
    }
  });

  test('derives biomarker ownership from auth.uid instead of a mobile owner field', () => {
    const service = source('src/lib/biomarkerWriteService.ts');
    const migration = source('supabase/migrations/20260720000000_biomarker_persistence.sql');
    expect(service).not.toContain('user_id:');
    expect(migration).toContain('DEFAULT auth.uid()');
    expect(migration).toContain('WITH CHECK (user_id = auth.uid())');
  });

  test('AI usage ownership comes from the verified JWT user', () => {
    const edgeFunction = source('supabase/functions/ai-advisor/index.ts');
    expect(edgeFunction).toContain('serviceClient.auth.getUser(token)');
    expect(edgeFunction).toContain('const userId = user.id');
    expect(edgeFunction).not.toMatch(/body[^\n]*userId/);
  });

  test('premium is reset and identified for the exact auth generation before profile commits', () => {
    const premium = source('src/context/PremiumContext.tsx');
    expect(premium).toContain('identifiedScopeRef.current = null');
    expect(premium).toContain('identifyAdaptyUser(scope.userId)');
    expect(premium).toContain('identifiedScopeRef.current !== scopeKey');
  });

  test('the clear boundary includes every persisted Vitalspan application key', () => {
    const appSources = ['App.tsx', ...sourceFiles('src')].map(source).join('\n');
    const declaredKeys = source('src/lib/storageKeys.ts');
    const usedKeys = new Set(appSources.match(/@vitalspan_[A-Za-z0-9_:-]+/g) ?? []);
    usedKeys.delete('@vitalspan_auth_owner_id');
    for (const key of usedKeys) expect(declaredKeys).toContain(`'${key}'`);
  });
});
