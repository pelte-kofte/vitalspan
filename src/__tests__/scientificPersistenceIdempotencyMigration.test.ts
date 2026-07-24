import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const INITIAL_MIGRATION_PATH = join(
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

const initialMigration = readFileSync(INITIAL_MIGRATION_PATH, 'utf8');
const migration = readFileSync(IDEMPOTENCY_MIGRATION_PATH, 'utf8');
const statements = migration
  .replace(/--.*$/gm, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

function occurrences(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0;
}

function functionSignature(source: string, functionName: string): string {
  const match = source.match(
    new RegExp(
      `CREATE(?: OR REPLACE)? FUNCTION public\\.${functionName}\\(([\\s\\S]*?)\\)\\s*RETURNS TABLE`,
    ),
  );
  if (match === null)
    throw new Error('Scientific persistence RPC signature is missing.');
  return match[1].replace(/\s+/g, ' ').trim().toLowerCase();
}

function functionReturns(source: string, functionName: string): string {
  const match = source.match(
    new RegExp(
      `CREATE(?: OR REPLACE)? FUNCTION public\\.${functionName}\\([\\s\\S]*?\\)\\s*RETURNS TABLE\\s*\\(([\\s\\S]*?)\\)\\s*LANGUAGE`,
    ),
  );
  if (match === null)
    throw new Error('Scientific persistence RPC return contract is missing.');
  return match[1].replace(/\s+/g, ' ').trim().toLowerCase();
}

function functionBody(): string {
  const match = migration.match(
    /CREATE FUNCTION public\.insert_scientific_persistence_record_v2\([\s\S]*?AS \$function\$([\s\S]*?)\$function\$;/,
  );
  if (match === null)
    throw new Error('Scientific persistence RPC body is missing.');
  return match[1]
    .replace(/--.*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

describe('Phase 8 scientific persistence empty-table idempotency migration', () => {
  test('creates a versioned RPC with the exact legacy input and return contract', () => {
    expect(
      functionSignature(
        migration,
        'insert_scientific_persistence_record_v2',
      ),
    ).toBe(
      functionSignature(
        initialMigration,
        'insert_scientific_persistence_record',
      ),
    );
    expect(
      functionReturns(
        migration,
        'insert_scientific_persistence_record_v2',
      ),
    ).toBe(
      functionReturns(
        initialMigration,
        'insert_scientific_persistence_record',
      ),
    );
    expect(statements).not.toMatch(
      /\bdrop table\b|\btruncate\b|\bdelete from\b/,
    );
    expect(statements).not.toMatch(
      /\bcreate table public\.scientific_persistence_records\b/,
    );
  });

  test('documents the ordered base-install, verification, and idempotency cutover', () => {
    expect(migration).toContain(
      '1. Apply 20260719000000_scientific_persistence_records.sql.',
    );
    expect(migration).toContain(
      '2. Verify that the base installation exists and contains no persisted rows.',
    );
    expect(migration).toContain(
      '3. Apply this migration before activating any runtime writer.',
    );
  });

  test('creates every idempotency field as immediately required', () => {
    [
      'domain_id text not null',
      'request_id text not null',
      'snapshot_id text not null',
      'evaluation_id text not null',
      'scientific_payload_fingerprint text not null',
      'idempotency_version text not null',
    ].forEach(column => expect(statements).toContain(`add column ${column}`));

    expect(statements).not.toMatch(/\balter column\b[\s\S]*?\bset not null\b/);
  });

  test('is transactional and fails closed before DDL when assumptions differ', () => {
    expect(statements.startsWith('begin;')).toBe(true);
    expect(statements.endsWith('commit;')).toBe(true);
    expect(statements).toContain(
      "if pg_catalog.to_regclass('public.scientific_persistence_records') is null then",
    );
    expect(statements).toContain(
      'if exists ( select 1 from public.scientific_persistence_records limit 1 ) then',
    );
    expect(statements).toContain(
      'scientific persistence idempotency requires an empty table.',
    );
    expect(statements).toContain(
      'scientific persistence legacy rpc assumptions differ.',
    );
    expect(statements).toContain(
      'scientific persistence table security assumptions differ.',
    );
    expect(statements).toContain(
      'scientific persistence rls policy assumptions differ.',
    );
    expect(statements).not.toMatch(/\bfor\b[\s\S]*?\bloop\b|\bend loop\b/);
    expect(statements).not.toMatch(
      /\bupdate public\.scientific_persistence_records\b/,
    );
    expect(statements).not.toMatch(/\brows_before\b|\brows_after\b/);
    expect(statements).not.toMatch(/\bnot valid\b|\bvalidate constraint\b/);
  });

  test('uses owner, domain, and request as the only logical uniqueness invariant', () => {
    expect(statements).toContain('unique (owner_id, domain_id, request_id)');
    expect(statements).not.toMatch(/unique\s*\([^)]*snapshot_id/);
    expect(statements).not.toMatch(/unique\s*\([^)]*evaluation_id/);
    expect(statements).not.toMatch(/unique\s*\([^)]*parent_persistence_id/);
  });

  test('requires snapshot and evaluation identity without making either unique', () => {
    expect(statements).toContain('add column snapshot_id text not null');
    expect(statements).toContain('add column evaluation_id text not null');
    expect(statements).toContain(
      "constraint scientific_persistence_snapshot_id_nonempty check (pg_catalog.btrim(snapshot_id) <> '')",
    );
    expect(statements).toContain(
      "constraint scientific_persistence_evaluation_id_nonempty check (pg_catalog.btrim(evaluation_id) <> '')",
    );

    const body = functionBody();
    expect(body).toContain(
      'on conflict (owner_id, domain_id, request_id) do nothing',
    );
    expect(body).not.toMatch(/on conflict\s*\([^)]*snapshot_id/);
    expect(body).not.toMatch(/on conflict\s*\([^)]*evaluation_id/);
  });

  test('installs identity and fingerprint consistency constraints immediately', () => {
    expect(statements).toContain(
      'add constraint scientific_persistence_payload_identity_consistent check',
    );
    expect(statements).toContain(
      'add constraint scientific_persistence_fingerprint_consistent check',
    );
    expect(statements).toContain(
      "check (idempotency_version = 'scientific-persistence-idempotency/1.0.0')",
    );
    expect(statements).toContain(
      "check (scientific_payload_fingerprint ~ '^[0-9a-f]{64}$')",
    );
    expect(statements).toContain(
      "jsonb_typeof(result_payload::pg_catalog.jsonb -> 'auditmetadata') is not distinct from 'object'",
    );
    expect(
      occurrences(
        statements,
        /jsonb_typeof\([\s\S]*?\) is not distinct from '(?:object|string)'/g,
      ),
    ).toBeGreaterThanOrEqual(9);
    expect(statements).toContain(
      "domain_id is not distinct from request_payload::pg_catalog.jsonb ->> 'domainid'",
    );
    expect(statements).toContain(
      "evaluation_id is not distinct from result_payload::pg_catalog.jsonb #>> '{auditmetadata,evaluationid}'",
    );
  });

  test('extracts and validates every identity on the server without client identity parameters', () => {
    const signature = functionSignature(
      migration,
      'insert_scientific_persistence_record_v2',
    );
    const body = functionBody();

    expect(signature).not.toMatch(
      /p_owner_id|p_domain_id|p_request_id|p_snapshot_id/,
    );
    expect(signature).not.toMatch(/p_evaluation_id|p_fingerprint/);
    expect(body).toContain("request_domain_id := request_json ->> 'domainid'");
    expect(body).toContain("result_domain_id := result_json ->> 'domainid'");
    expect(body).toContain(
      "request_request_id := request_json ->> 'requestid'",
    );
    expect(body).toContain("result_request_id := result_json ->> 'requestid'");
    expect(body).toContain(
      "result_snapshot_id := result_json ->> 'snapshotid'",
    );
    expect(body).toContain(
      "result_evaluation_id := result_json #>> '{auditmetadata,evaluationid}'",
    );
    expect(body).toContain('scientific persistence identity is invalid.');
    expect(body).toContain('scientific persistence identity mismatch.');
  });

  test('derives authority without inaccessible auth-schema grants', () => {
    const signature = functionSignature(
      migration,
      'insert_scientific_persistence_record_v2',
    );
    const body = functionBody();

    expect(signature).not.toMatch(/p_owner_id/);
    expect(body).toMatch(
      /caller_owner_id pg_catalog\.uuid := coalesce\([\s\S]*?current_setting\('request\.jwt\.claim\.sub', true\)[\s\S]*?current_setting\('request\.jwt\.claims', true\)[\s\S]*?->> 'sub'[\s\S]*?\)::pg_catalog\.uuid/,
    );
    expect(body).toContain('if caller_owner_id is null then');
    expect(body).toContain("using errcode = '28000'");
    expect(statements).toContain('security definer set search_path =');
    expect(statements).not.toMatch(/grant [^;]*\bauth\./);
    expect(statements).not.toMatch(/grant usage on schema auth/);
    expect(statements).not.toMatch(
      /grant [^;]+ to scientific_persistence_writer/,
    );
    expect(statements).not.toMatch(
      /grant (?:select|insert|update|delete)[^;]+ to authenticated/,
    );
    expect(statements).not.toMatch(
      /alter table public\.scientific_persistence_records owner to/,
    );
  });

  test('leaves the legacy writer-owned RPC untouched and secures the postgres-owned v2 RPC', () => {
    expect(statements).toContain(
      'create function public.insert_scientific_persistence_record_v2',
    );
    expect(statements).toContain(
      'alter function public.insert_scientific_persistence_record_v2',
    );
    expect(statements).toContain('owner to postgres');
    expect(statements).toMatch(
      /revoke all on function public\.insert_scientific_persistence_record_v2\([\s\S]*?\) from public, anon/,
    );
    expect(statements).toMatch(
      /grant execute on function public\.insert_scientific_persistence_record_v2\([\s\S]*?\) to authenticated/,
    );
    expect(statements).not.toMatch(
      /create(?: or replace)? function public\.insert_scientific_persistence_record\(/,
    );
    expect(statements).not.toMatch(
      /(?:alter|drop|revoke|grant)[^;]*function public\.insert_scientific_persistence_record\(/,
    );
    expect(statements).not.toMatch(
      /\bset role\b|\bgrant create on schema public\b|\bdrop role\b/,
    );
  });

  test('builds the server fingerprint from canonical request, result, and explicit lineage null', () => {
    const body = functionBody();
    expect(body).toContain('calculated_fingerprint := pg_catalog.encode(');
    expect(body).toContain('extensions.digest(');
    expect(body).toContain("'request', request_json");
    expect(body).toContain("'result', result_json");
    expect(body).toContain("'parentpersistenceid', coalesce(");
    expect(body).toContain("'null'::pg_catalog.jsonb");
    expect(body).toContain("'sha256'");
  });

  test('performs one insert and returns the original row for an identical retry', () => {
    const body = functionBody();
    expect(occurrences(body, /\binsert into\b/g)).toBe(1);
    expect(body).toContain(
      'on conflict (owner_id, domain_id, request_id) do nothing',
    );
    expect(body).toMatch(
      /select stored_record\.persistence_id, stored_record\.persisted_at,[\s\S]*?where stored_record\.owner_id = caller_owner_id and stored_record\.domain_id = request_domain_id and stored_record\.request_id = request_request_id/,
    );
    expect(body).toContain('persistence_id := existing_persistence_id');
    expect(body).toContain('persisted_at := existing_persisted_at');
  });

  test('uses the logical unique key for concurrent insert resolution', () => {
    const body = functionBody();
    expect(statements).toContain('unique (owner_id, domain_id, request_id)');
    expect(body).toContain(
      'on conflict (owner_id, domain_id, request_id) do nothing',
    );
    expect(body).toContain('if not found then');
    expect(body).toContain(
      'scientific persistence idempotency resolution failed.',
    );
    expect(body).not.toMatch(/\bpg_advisory|\block table\b/);
  });

  test('fails closed when a retry changes content or identity', () => {
    const body = functionBody();
    expect(body).toMatch(
      /if existing_fingerprint is distinct from calculated_fingerprint or existing_snapshot_id is distinct from result_snapshot_id or existing_evaluation_id is distinct from result_evaluation_id or existing_parent_persistence_id is distinct from p_parent_persistence_id then raise exception 'scientific persistence idempotency conflict\.'/,
    );
    expect(body).toContain("using errcode = '23505'");
  });

  test('preserves append-only insert-or-return behavior', () => {
    const body = functionBody();
    expect(occurrences(body, /\binsert into\b/g)).toBe(1);
    expect(body).not.toMatch(/\bon conflict[\s\S]*?do update\b/);
    expect(body).not.toMatch(/\bupdate\b|\bdelete\b|\btruncate\b|\bmerge\b/);
  });

  test('bounds lock acquisition and contains no runtime activation', () => {
    expect(statements).toContain("set local lock_timeout = '5s'");
    expect(statements).not.toMatch(
      /runtimecomposition|feature[_ ]flag|persistenceservice/,
    );
  });

  test('ends with a final newline', () => {
    expect(migration.endsWith('\n')).toBe(true);
  });
});
