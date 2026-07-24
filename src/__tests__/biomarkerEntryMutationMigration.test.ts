import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const migration = readFileSync(
  join(
    ROOT,
    'supabase/migrations/20260724000000_biomarker_entry_user_mutations.sql',
  ),
  'utf8',
);
const normalized = migration
  .replace(/--.*$/gm, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

describe('user-owned biomarker entry mutations', () => {
  test('adds no columns and preserves the existing stored row contract', () => {
    expect(normalized).not.toMatch(
      /\bcreate table\b|\balter table\b|\badd column\b|\bdrop\b|\btruncate\b/,
    );
  });

  test('allows update and delete only for the authenticated row owner', () => {
    expect(normalized).toContain(
      'create policy "users update own entries" on public.biomarker_entries for update to authenticated',
    );
    expect(normalized).toContain('using (user_id = auth.uid())');
    expect(normalized).toContain('with check (user_id = auth.uid())');
    expect(normalized).toContain(
      'create policy "users delete own entries" on public.biomarker_entries for delete to authenticated',
    );
    expect(normalized).toContain(
      'grant update, delete on table public.biomarker_entries to authenticated',
    );
    expect(normalized).not.toMatch(/\bto anon\b|\bto public\b/);
  });

  test('ends with a final newline', () => {
    expect(migration.endsWith('\n')).toBe(true);
  });
});
