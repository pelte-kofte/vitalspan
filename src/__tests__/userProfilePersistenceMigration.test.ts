import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const migration = readFileSync(
  join(ROOT, 'supabase/migrations/20260722120000_user_profile_persistence.sql'),
  'utf8',
);
const normalized = migration.replace(/--.*$/gm, ' ').replace(/\s+/g, ' ').toLowerCase();
const service = readFileSync(join(ROOT, 'src/lib/userProfilePersistence.ts'), 'utf8');
const app = readFileSync(join(ROOT, 'App.tsx'), 'utf8');

describe('governed user profile persistence', () => {
  test('stores every onboarding field under an auth.uid-owned primary key', () => {
    expect(normalized).toContain('create table public.user_profiles');
    expect(normalized).toContain('user_id uuid primary key default auth.uid()');
    for (const column of [
      'name text',
      'age integer',
      'sex text',
      'goal text',
      'conditions text[]',
      'medications text[]',
      'onboarding_complete boolean',
    ]) expect(normalized).toContain(column);
    expect(normalized).toContain('references auth.users(id) on delete cascade');
    expect(service).not.toMatch(/user_id\s*:/);
  });

  test('enforces complete shape, value constraints, and durable defaults', () => {
    expect(normalized).toContain('constraint user_profiles_complete_shape');
    expect(normalized).toContain('age between 18 and 120');
    expect(normalized).toContain("sex in ('male', 'female')");
    expect(normalized).toContain('conditions text[] not null default array[]::text[]');
    expect(normalized).toContain('medications text[] not null default array[]::text[]');
    expect(normalized).toContain('onboarding_complete boolean not null default false');
  });

  test('uses forced RLS and exact authenticated CRUD without anon access', () => {
    expect(normalized).toContain('alter table public.user_profiles enable row level security');
    expect(normalized).toContain('alter table public.user_profiles force row level security');
    expect(normalized.match(/user_id = auth\.uid\(\)/g)).toHaveLength(5);
    expect(normalized).toContain(
      'revoke all on table public.user_profiles from public, anon, authenticated',
    );
    expect(normalized).toContain(
      'grant select, insert, update, delete on table public.user_profiles to authenticated',
    );
    expect(normalized).not.toMatch(/grant[^;]*\bto anon\b/);
  });

  test('waits for authenticated remote hydration before choosing onboarding', () => {
    expect(app).toContain('await userProfilePersistence.hydrate(scope, registeredAccount)');
    expect(app).toContain("route === 'ProfileError'");
    expect(app).not.toContain("getItem('@vitalspan_user_profile')");
  });

  test('does not alter or activate Scientific Persistence', () => {
    expect(normalized).not.toContain('scientific_persistence');
    expect(migration.endsWith('\n')).toBe(true);
  });
});
