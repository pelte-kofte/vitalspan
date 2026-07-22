import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MIGRATION_PATH = join(
  ROOT,
  'supabase',
  'migrations',
  '20260720000000_biomarker_persistence.sql',
);
const migration = readFileSync(MIGRATION_PATH, 'utf8');
const statements = migration
  .replace(/--.*$/gm, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();
const service = readFileSync(join(ROOT, 'src', 'lib', 'biomarkerWriteService.ts'), 'utf8');
const app = readFileSync(join(ROOT, 'App.tsx'), 'utf8');
const biomarkerEntryScreen = readFileSync(
  join(ROOT, 'src', 'screens', 'BiomarkerEntryScreen.tsx'),
  'utf8',
);
const guidedFirstRunScreen = readFileSync(
  join(ROOT, 'src', 'screens', 'GuidedFirstRunScreen.tsx'),
  'utf8',
);
const labUploadScreen = readFileSync(
  join(ROOT, 'src', 'screens', 'LabUploadScreen.tsx'),
  'utf8',
);

describe('governed Biomarker Persistence migration', () => {
  test('replaces the manual bootstrap with one ordered migration authority', () => {
    expect(existsSync(join(ROOT, 'src', 'db', 'create_biomarker_entries.sql'))).toBe(false);
    expect(statements.match(/\bcreate table\b/g)).toHaveLength(1);
    expect(statements).toContain('create table public.biomarker_entries');
    expect(MIGRATION_PATH).toContain('20260720000000_biomarker_persistence.sql');
  });

  test('preserves the StoredEntry database contract and server-owned user identity', () => {
    expect(statements).toMatch(/id text primary key/);
    expect(statements).toMatch(/user_id uuid not null default auth\.uid\(\)/);
    expect(statements).toMatch(/references auth\.users\(id\) on delete cascade/);
    expect(statements).toMatch(/biomarker_id text not null/);
    expect(statements).toMatch(/value numeric not null/);
    expect(statements).toMatch(/date text not null/);
    expect(statements).toMatch(/source text[,\s]/);
    expect(statements).toMatch(/notes text[,\s]/);
    expect(statements).toContain("check (btrim(id) <> '')");
    expect(statements).toContain("check (btrim(biomarker_id) <> '')");
    expect(statements).toContain("check (btrim(date) <> '')");
    expect(service).not.toContain('user_id:');
  });

  test('indexes the authenticated dashboard read path', () => {
    expect(statements).toContain(
      'create index biomarker_entries_user_date_idx on public.biomarker_entries (user_id, date desc)',
    );
  });

  test('enforces authenticated cross-user isolation with least privilege', () => {
    expect(statements).toContain(
      'alter table public.biomarker_entries enable row level security',
    );
    expect(statements).toMatch(
      /create policy "users select own entries" on public\.biomarker_entries for select to authenticated using \(user_id = auth\.uid\(\)\)/,
    );
    expect(statements).toMatch(
      /create policy "users insert own entries" on public\.biomarker_entries for insert to authenticated with check \(user_id = auth\.uid\(\)\)/,
    );
    expect(statements).toContain(
      'revoke all on table public.biomarker_entries from public, anon, authenticated',
    );
    expect(statements).toContain(
      'grant select, insert on table public.biomarker_entries to authenticated',
    );
    expect(statements).not.toMatch(/\bfor update\b|\bfor delete\b/);
    expect(statements).not.toMatch(/grant[^;]*\bupdate\b|grant[^;]*\bdelete\b/);
  });

  test('keeps client retries idempotent without weakening append-only storage', () => {
    expect(service.match(/ignoreDuplicates: true/g)).toHaveLength(2);
    expect(service.match(/defaultToNull: false/g)).toHaveLength(2);
    expect(service.match(/onConflict: 'id'/g)).toHaveLength(2);
    expect(service).toContain('Promise<boolean>');
    expect(service).toContain('if (error)');
    expect(service).toContain('return false;');
  });

  test('does not persist a false migration success marker', () => {
    expect(app).toContain('const migrationSucceeded = await migrateHistory(entries, scope)');
    expect(app).toContain('latestBiomarkersRaw === biomarkersRaw');
    expect(app).toContain('&& isAuthRequestScopeCurrent(scope)');
    expect(app).toContain('BIOMARKER_PERSISTENCE_MIGRATION_KEY');
    expect(app).not.toContain("getItem('@vitalspan_migrated_v2')");
  });

  test('schedules retry-safe history migration after every local biomarker write path', () => {
    for (const source of [biomarkerEntryScreen, guidedFirstRunScreen, labUploadScreen]) {
      expect(source).toContain("setItem('@vitalspan_biomarkers'");
      expect(source).toContain('markBiomarkerHistoryDirty(scope)');
    }
  });

  test('does not activate or reference Scientific Persistence', () => {
    expect(statements).not.toMatch(/scientific_persistence|insert_scientific|runtime/);
  });

  test('ends with a final newline', () => {
    expect(migration.endsWith('\n')).toBe(true);
  });
});
