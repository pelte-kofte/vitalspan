import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const migration = readFileSync(
  join(ROOT, 'supabase/migrations/20260722130000_biomarker_entry_provenance.sql'),
  'utf8',
);
const normalized = migration.replace(/--.*$/gm, ' ').replace(/\s+/g, ' ').toLowerCase();

describe('biomarker provenance persistence migration', () => {
  test('is additive and preserves the deployed table and data', () => {
    expect(normalized).toContain('alter table public.biomarker_entries');
    expect(normalized).not.toMatch(/\bdrop table\b|\btruncate\b|\bdelete from\b/);
    expect(normalized).toContain('add column reported_value numeric');
    expect(normalized).toContain('add column reported_unit text');
    expect(normalized).toContain('add column source_lab_range_lower numeric');
    expect(normalized).toContain('add column source_lab_range_upper numeric');
    expect(normalized).toContain('add column source_lab_range_unit text');
  });

  test('keeps immutable values append-only while enriching only matching owner rows', () => {
    expect(normalized).toContain('security definer set search_path =');
    expect(normalized).toContain('stored.user_id = v_user_id');
    expect(normalized).toContain('stored.biomarker_id = entry.biomarker_id');
    expect(normalized).toContain('stored.value = entry.value');
    expect(normalized).toContain('stored.date = entry.date');
    const updateAssignments = normalized.match(
      /update public\.biomarker_entries as stored set (.*?) from jsonb_to_recordset/,
    )?.[1] ?? '';
    expect(updateAssignments).not.toMatch(/\bvalue\s*=|\bbiomarker_id\s*=|\bdate\s*=|\buser_id\s*=/);
    expect(normalized).toContain('coalesce(stored.reported_value, entry.reported_value)');
  });

  test('preserves existing RLS and grants only the narrow enrichment RPC', () => {
    expect(normalized).not.toMatch(/disable row level security|grant[^;]* on table/);
    expect(normalized).toContain(
      'revoke all on function public.enrich_biomarker_entry_provenance(jsonb) from public',
    );
    expect(normalized).toContain(
      'grant execute on function public.enrich_biomarker_entry_provenance(jsonb) to authenticated',
    );
    expect(normalized).not.toMatch(/\bto anon\b/);
  });
});
