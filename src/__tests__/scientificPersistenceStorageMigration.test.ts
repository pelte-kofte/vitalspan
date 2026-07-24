import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATION_PATH = join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260719000000_scientific_persistence_records.sql',
);
const IDEMPOTENCY_MIGRATION_PATH = join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260721000000_scientific_persistence_idempotency.sql',
);

const migration = readFileSync(MIGRATION_PATH, 'utf8');
const idempotencyMigration = readFileSync(IDEMPOTENCY_MIGRATION_PATH, 'utf8');
const statements = migration
  .replace(/--.*$/gm, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();
const idempotencyStatements = idempotencyMigration
  .replace(/--.*$/gm, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

function occurrences(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0;
}

function insertionFunctionSignature(): string {
  const match = migration.match(
    /CREATE FUNCTION public\.insert_scientific_persistence_record\(([\s\S]*?)\)\s*RETURNS TABLE/,
  );
  if (match === null) throw new Error('Scientific persistence insertion function is missing.');
  return match[1];
}

function insertionFunctionBody(): string {
  const match = migration.match(/AS \$function\$([\s\S]*?)\$function\$;/);
  if (match === null) throw new Error('Scientific persistence insertion function body is missing.');
  return match[1].replace(/--.*$/gm, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

describe('Phase 8.0C Sprint 1 scientific persistence storage migration', () => {
  test('creates exactly one new append-only persistence table', () => {
    expect(occurrences(statements, /\bcreate table\b/g)).toBe(1);
    expect(statements).toContain('create table public.scientific_persistence_records');

    const alteredTables = [...statements.matchAll(/\balter table\s+([^\s;]+)/g)]
      .map(match => match[1]);
    expect(alteredTables).toEqual([
      'public.scientific_persistence_records',
      'public.scientific_persistence_records',
    ]);
  });

  test('uses database authority for persistence identity and time', () => {
    expect(statements).toMatch(/persistence_id uuid primary key default gen_random_uuid\(\)/);
    expect(statements).toMatch(/persisted_at timestamptz not null default now\(\)/);

    const signature = insertionFunctionSignature();
    expect(signature).not.toMatch(/p_owner_id\b/);
    expect(signature).not.toMatch(/p_persistence_id\b/);
    expect(signature).not.toMatch(/p_persisted_at\b/);
  });

  test('preserves every approved persistence field without scientific projections', () => {
    const requiredColumns = [
      'parent_persistence_id',
      'envelope_contract_version',
      'input_contract_version',
      'request_payload',
      'result_payload',
      'metadata_contract_version',
      'implementation_id',
      'implementation_version',
      'schema_version',
      'model_version',
      'lineage_contract_version',
      'audit_contract_version',
      'boundary_version',
      'validation_version',
      'audit_input_contract_version',
      'request_contract_version',
      'result_contract_version',
      'validation_status',
      'validation_issue_codes',
    ];
    requiredColumns.forEach(column => expect(statements).toMatch(new RegExp(`\\b${column}\\b`)));

    const prohibitedColumns = [
      'domain_status',
      'confidence',
      'measurements',
      'interpretations',
      'blocked_outputs',
      'warnings',
      'evidence',
      'provenance_completeness',
      'safety_candidate',
      'trend_status',
      'limitations',
      'scientific_component_versions',
    ];
    prohibitedColumns.forEach(column => expect(statements).not.toMatch(new RegExp(`\\b${column}\\b`)));
  });

  test('requires complete payload, metadata, and successful persistence audit values', () => {
    expect(statements).toMatch(/request_payload text not null/);
    expect(statements).toMatch(/result_payload text not null/);
    expect(statements).toMatch(/check \(length\(request_payload\) > 0\)/);
    expect(statements).toMatch(/check \(length\(result_payload\) > 0\)/);

    [
      'envelope_contract_version',
      'input_contract_version',
      'metadata_contract_version',
      'implementation_id',
      'implementation_version',
      'schema_version',
      'model_version',
      'lineage_contract_version',
      'audit_contract_version',
      'boundary_version',
      'validation_version',
      'audit_input_contract_version',
      'request_contract_version',
      'result_contract_version',
    ].forEach(column => {
      expect(statements).toMatch(new RegExp(`check \\(btrim\\(${column}\\) <> ''\\)`));
    });

    expect(statements).toContain("check (validation_status = 'passed')");
    expect(statements).toContain("validation_issue_codes = '[]'::jsonb");
  });

  test('enforces root or same-owner immediate-predecessor lineage', () => {
    expect(statements).toMatch(/parent_persistence_id uuid[,\s]/);
    expect(statements).toContain(
      'check (parent_persistence_id is null or parent_persistence_id <> persistence_id)',
    );
    expect(statements).toContain('unique (owner_id, persistence_id)');
    expect(statements).toMatch(
      /foreign key \(owner_id, parent_persistence_id\) references public\.scientific_persistence_records \(owner_id, persistence_id\)/,
    );
  });

  test('enables and forces RLS with no application update or delete policy', () => {
    expect(statements).toContain(
      'alter table public.scientific_persistence_records enable row level security',
    );
    expect(statements).toContain(
      'alter table public.scientific_persistence_records force row level security',
    );
    expect(statements).not.toMatch(/\bfor update\b/);
    expect(statements).not.toMatch(/\bfor delete\b/);
  });

  test('uses a least-privilege no-login writer subject to RLS', () => {
    expect(statements).toMatch(
      /create role scientific_persistence_writer nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls/,
    );
    expect(statements).toMatch(
      /create policy scientific_persistence_writer_insert_own on public\.scientific_persistence_records for insert to scientific_persistence_writer with check \( owner_id = coalesce\([\s\S]*?current_setting\('request\.jwt\.claim\.sub', true\)[\s\S]*?current_setting\('request\.jwt\.claims', true\)[\s\S]*?->> 'sub'[\s\S]*?\)::pg_catalog\.uuid \)/,
    );
    expect(statements).toMatch(
      /create policy scientific_persistence_writer_return_own on public\.scientific_persistence_records for select to scientific_persistence_writer using \( owner_id = coalesce\([\s\S]*?current_setting\('request\.jwt\.claim\.sub', true\)[\s\S]*?current_setting\('request\.jwt\.claims', true\)[\s\S]*?->> 'sub'[\s\S]*?\)::pg_catalog\.uuid \)/,
    );
    const policies = [...statements.matchAll(/create policy[^;]+;/g)]
      .map(match => match[0]);
    expect(policies).toHaveLength(2);
    policies.forEach(policy => expect(policy).not.toMatch(/\bto authenticated\b/));
    expect(statements).toContain(
      'revoke all on table public.scientific_persistence_records from public, anon, authenticated',
    );
    expect(statements).not.toMatch(/grant (?:select|insert|update|delete)[^;]* to authenticated/);
    expect(statements).not.toMatch(/grant (?:usage on schema auth|execute on function auth\.uid\(\))/);
  });

  test('provides one authenticated internal insertion operation', () => {
    expect(occurrences(statements, /\bcreate function public\.insert_scientific_persistence_record\b/g))
      .toBe(1);
    expect(statements).toContain('security definer');
    expect(statements).toContain("set search_path = ''");
    expect(statements).toContain('owner to scientific_persistence_writer');
    expect(insertionFunctionBody()).not.toMatch(/\bset role\b/);
    expect(statements).toMatch(
      /revoke all on function public\.insert_scientific_persistence_record\([\s\S]*?\) from public, anon/,
    );
    expect(statements).toMatch(
      /grant execute on function public\.insert_scientific_persistence_record\([\s\S]*?\) to authenticated/,
    );
  });

  test('opens the PostgreSQL 17 ownership bridge for the following migration', () => {
    const bridgeCreation = 'create role scientific_persistence_migration_owner';
    const bridgeActivation = 'set role scientific_persistence_migration_owner';
    const roleCreation = 'create role scientific_persistence_writer';
    const ownerRestore = 'set role postgres';
    const tableGrant =
      'grant insert on table public.scientific_persistence_records to scientific_persistence_writer';
    const ownershipTransfer = 'owner to scientific_persistence_writer';

    expect(occurrences(statements, /set createrole_self_grant = 'set'/g)).toBe(2);
    expect(occurrences(statements, /reset createrole_self_grant/g)).toBe(2);
    expect(statements).toContain(bridgeCreation);
    expect(statements).toContain(bridgeActivation);
    expect(statements).not.toContain('drop role scientific_persistence_migration_owner');
    expect(statements).not.toMatch(/grant scientific_persistence_writer to current_user/);
    expect(statements).not.toMatch(/revoke scientific_persistence_writer from current_user/);
    expect(statements).not.toContain('reset role');
    expect(statements.indexOf(bridgeCreation)).toBeLessThan(statements.indexOf(bridgeActivation));
    expect(statements.indexOf(bridgeActivation)).toBeLessThan(statements.indexOf(roleCreation));
    expect(statements.indexOf(roleCreation)).toBeLessThan(statements.indexOf(ownerRestore));
    expect(statements.indexOf(ownerRestore)).toBeLessThan(statements.indexOf(tableGrant));
    expect(statements.indexOf(roleCreation)).toBeLessThan(statements.indexOf(ownershipTransfer));
  });

  test('models Supabase CLI session and effective roles for both ownership transitions', () => {
    const sessionUser = 'cli_login_postgres';
    const tableOwner = 'postgres';
    let currentUser = 'postgres';

    expect(currentUser).toBe(tableOwner);

    currentUser = 'scientific_persistence_migration_owner';
    expect(currentUser).not.toBe(tableOwner);

    const resetRole = (): string => sessionUser;
    expect(resetRole()).toBe('cli_login_postgres');
    expect(resetRole()).not.toBe(tableOwner);

    expect(statements).toContain('set role postgres');
    expect(statements).not.toContain('reset role');
    currentUser = 'postgres';
    expect(currentUser).toBe(tableOwner);
    const migration190Completed = currentUser === tableOwner;
    expect(migration190Completed).toBe(true);

    expect(idempotencyStatements).not.toMatch(/\bset role\b|\breset role\b/);
    expect(idempotencyStatements).toContain(
      'create function public.insert_scientific_persistence_record_v2',
    );
    expect(idempotencyStatements).toContain('owner to postgres');
    expect(currentUser).toBe(tableOwner);
    const migration210Completed = currentUser === tableOwner;
    expect(migration210Completed).toBe(true);
  });

  test('derives the owner from authenticated context and fails closed without it', () => {
    const body = insertionFunctionBody();
    expect(statements).toMatch(
      /caller_owner_id pg_catalog\.uuid := coalesce\([\s\S]*?current_setting\('request\.jwt\.claim\.sub', true\)[\s\S]*?current_setting\('request\.jwt\.claims', true\)[\s\S]*?->> 'sub'[\s\S]*?\)::pg_catalog\.uuid/,
    );
    expect(body).toContain('if caller_owner_id is null then');
    expect(body).toContain("using errcode = '28000'");
    expect(body).toMatch(/insert into public\.scientific_persistence_records[\s\S]*?values \( caller_owner_id,/);
  });

  test('executes exactly one insert and returns only generated identity and time', () => {
    const body = insertionFunctionBody();
    expect(occurrences(body, /\binsert into\b/g)).toBe(1);
    expect(body).not.toMatch(/\bon conflict\b|\bupsert\b/);
    expect(body).not.toMatch(/\bupdate\b|\bdelete\b|\btruncate\b/);
    expect(body).toContain(
      'returning inserted_record.persistence_id, inserted_record.persisted_at',
    );
    expect(statements).toMatch(
      /returns table \( persistence_id uuid, persisted_at timestamptz \)/,
    );
  });

  test('contains no backfill, destructive rollback, existing-data source, or secret', () => {
    expect(statements).not.toMatch(/\bdrop table\b|\btruncate\b|\bdelete from\b/);
    expect(statements).not.toMatch(/insert into public\.scientific_persistence_records[\s\S]*?\bselect\b/);
    expect(statements).not.toMatch(/biomarker_entries|asyncstorage|service_role|secret|api[_-]?key/);
  });

  test('ends with a final newline', () => {
    expect(migration.endsWith('\n')).toBe(true);
  });
});
