-- Phase 8 scientific persistence storage idempotency: empty-table cutover.
-- Deployment sequence:
--   1. Apply 20260719000000_scientific_persistence_records.sql.
--   2. Verify that the base installation exists and contains no persisted rows.
--   3. Apply this migration before activating any runtime writer.
-- The writer-owned legacy RPC is immutable. This migration creates the
-- postgres-owned, versioned v2 RPC used by the application.

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $dependencies$
BEGIN
  IF pg_catalog.to_regprocedure('extensions.digest(bytea,text)') IS NULL THEN
    RAISE EXCEPTION 'Scientific persistence idempotency requires the pgcrypto digest function.';
  END IF;
END
$dependencies$;

DO $preflight$
DECLARE
  legacy_owner pg_catalog.text;
  legacy_security_definer pg_catalog.bool;
  legacy_config pg_catalog.text[];
  table_owner pg_catalog.text;
  table_rls_enabled pg_catalog.bool;
  table_rls_forced pg_catalog.bool;
  writer_can_login pg_catalog.bool;
  writer_bypasses_rls pg_catalog.bool;
BEGIN
  IF pg_catalog.to_regclass('public.scientific_persistence_records') IS NULL THEN
    RAISE EXCEPTION 'Scientific persistence base table is missing.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.scientific_persistence_records
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Scientific persistence idempotency requires an empty table.';
  END IF;

  IF (
    SELECT pg_catalog.array_agg(
      attribute.attname::pg_catalog.text
      ORDER BY attribute.attnum
    )
    FROM pg_catalog.pg_attribute AS attribute
    WHERE attribute.attrelid =
      'public.scientific_persistence_records'::pg_catalog.regclass
      AND attribute.attnum > 0
      AND NOT attribute.attisdropped
  ) IS DISTINCT FROM ARRAY[
    'persistence_id',
    'owner_id',
    'persisted_at',
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
    'validation_issue_codes'
  ]::pg_catalog.text[] THEN
    RAISE EXCEPTION 'Scientific persistence base columns differ.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attribute AS attribute
    WHERE attribute.attrelid = 'public.scientific_persistence_records'::pg_catalog.regclass
      AND attribute.attname IN (
        'domain_id',
        'request_id',
        'snapshot_id',
        'evaluation_id',
        'scientific_payload_fingerprint',
        'idempotency_version'
      )
      AND NOT attribute.attisdropped
  ) THEN
    RAISE EXCEPTION 'Scientific persistence idempotency columns already exist.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraint_record
    WHERE constraint_record.conrelid =
      'public.scientific_persistence_records'::pg_catalog.regclass
      AND constraint_record.conname IN (
        'scientific_persistence_owner_domain_request_unique',
        'scientific_persistence_domain_id_nonempty',
        'scientific_persistence_request_id_nonempty',
        'scientific_persistence_snapshot_id_nonempty',
        'scientific_persistence_evaluation_id_nonempty',
        'scientific_persistence_fingerprint_format',
        'scientific_persistence_idempotency_version_current',
        'scientific_persistence_payload_identity_consistent',
        'scientific_persistence_fingerprint_consistent'
      )
  ) THEN
    RAISE EXCEPTION 'Scientific persistence idempotency constraints already exist.';
  END IF;

  IF pg_catalog.to_regprocedure(
    'public.insert_scientific_persistence_record(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb)'
  ) IS NULL THEN
    RAISE EXCEPTION 'Scientific persistence legacy RPC is missing.';
  END IF;

  IF pg_catalog.to_regprocedure(
    'public.insert_scientific_persistence_record_v2(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb)'
  ) IS NOT NULL THEN
    RAISE EXCEPTION 'Scientific persistence v2 RPC already exists.';
  END IF;

  SELECT
    pg_catalog.pg_get_userbyid(function_record.proowner),
    function_record.prosecdef,
    function_record.proconfig
  INTO legacy_owner, legacy_security_definer, legacy_config
  FROM pg_catalog.pg_proc AS function_record
  WHERE function_record.oid = pg_catalog.to_regprocedure(
    'public.insert_scientific_persistence_record(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb)'
  );

  IF legacy_owner IS DISTINCT FROM 'scientific_persistence_writer'
    OR legacy_security_definer IS DISTINCT FROM true
    OR NOT (
      'search_path=""' = ANY(
        COALESCE(legacy_config, ARRAY[]::pg_catalog.text[])
      )
    ) THEN
    RAISE EXCEPTION 'Scientific persistence legacy RPC assumptions differ.';
  END IF;

  SELECT role_record.rolcanlogin, role_record.rolbypassrls
  INTO writer_can_login, writer_bypasses_rls
  FROM pg_catalog.pg_roles AS role_record
  WHERE role_record.rolname = 'scientific_persistence_writer';

  IF NOT FOUND
    OR writer_can_login IS DISTINCT FROM false
    OR writer_bypasses_rls IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Scientific persistence writer role assumptions differ.';
  END IF;

  SELECT
    pg_catalog.pg_get_userbyid(table_record.relowner),
    table_record.relrowsecurity,
    table_record.relforcerowsecurity
  INTO table_owner, table_rls_enabled, table_rls_forced
  FROM pg_catalog.pg_class AS table_record
  WHERE table_record.oid =
    'public.scientific_persistence_records'::pg_catalog.regclass;

  IF table_owner IS DISTINCT FROM 'postgres'
    OR table_rls_enabled IS DISTINCT FROM true
    OR table_rls_forced IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Scientific persistence table security assumptions differ.';
  END IF;

  IF (
    SELECT pg_catalog.count(*)
    FROM pg_catalog.pg_policies AS policy_record
    WHERE policy_record.schemaname = 'public'
      AND policy_record.tablename = 'scientific_persistence_records'
  ) IS DISTINCT FROM 2::pg_catalog.int8
    OR (
      SELECT pg_catalog.count(*)
      FROM pg_catalog.pg_policies AS policy_record
      WHERE policy_record.schemaname = 'public'
        AND policy_record.tablename = 'scientific_persistence_records'
        AND (
          (
            policy_record.policyname = 'scientific_persistence_writer_insert_own'
            AND policy_record.cmd = 'INSERT'
            AND policy_record.roles =
              ARRAY['scientific_persistence_writer']::pg_catalog.name[]
          )
          OR (
            policy_record.policyname = 'scientific_persistence_writer_return_own'
            AND policy_record.cmd = 'SELECT'
            AND policy_record.roles =
              ARRAY['scientific_persistence_writer']::pg_catalog.name[]
          )
        )
    ) IS DISTINCT FROM 2::pg_catalog.int8 THEN
    RAISE EXCEPTION 'Scientific persistence RLS policy assumptions differ.';
  END IF;

  IF pg_catalog.has_table_privilege(
    'authenticated',
    'public.scientific_persistence_records',
    'SELECT'
  )
    OR pg_catalog.has_table_privilege(
      'authenticated',
      'public.scientific_persistence_records',
      'INSERT'
    )
    OR pg_catalog.has_table_privilege(
      'authenticated',
      'public.scientific_persistence_records',
      'UPDATE'
    )
    OR pg_catalog.has_table_privilege(
      'authenticated',
      'public.scientific_persistence_records',
      'DELETE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'authenticated',
      'public.insert_scientific_persistence_record(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb)',
      'EXECUTE'
    )
    OR pg_catalog.has_function_privilege(
      'anon',
      'public.insert_scientific_persistence_record(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb)',
      'EXECUTE'
    ) THEN
    RAISE EXCEPTION 'Scientific persistence privilege assumptions differ.';
  END IF;
END
$preflight$;

ALTER TABLE public.scientific_persistence_records
  ADD COLUMN domain_id text NOT NULL,
  ADD COLUMN request_id text NOT NULL,
  ADD COLUMN snapshot_id text NOT NULL,
  ADD COLUMN evaluation_id text NOT NULL,
  ADD COLUMN scientific_payload_fingerprint text NOT NULL,
  ADD COLUMN idempotency_version text NOT NULL,
  ADD CONSTRAINT scientific_persistence_owner_domain_request_unique
    UNIQUE (owner_id, domain_id, request_id),
  ADD CONSTRAINT scientific_persistence_domain_id_nonempty
    CHECK (pg_catalog.btrim(domain_id) <> ''),
  ADD CONSTRAINT scientific_persistence_request_id_nonempty
    CHECK (pg_catalog.btrim(request_id) <> ''),
  ADD CONSTRAINT scientific_persistence_snapshot_id_nonempty
    CHECK (pg_catalog.btrim(snapshot_id) <> ''),
  ADD CONSTRAINT scientific_persistence_evaluation_id_nonempty
    CHECK (pg_catalog.btrim(evaluation_id) <> ''),
  ADD CONSTRAINT scientific_persistence_fingerprint_format
    CHECK (scientific_payload_fingerprint ~ '^[0-9a-f]{64}$'),
  ADD CONSTRAINT scientific_persistence_idempotency_version_current
    CHECK (idempotency_version = 'scientific-persistence-idempotency/1.0.0'),
  ADD CONSTRAINT scientific_persistence_payload_identity_consistent
    CHECK (
      pg_catalog.jsonb_typeof(request_payload::pg_catalog.jsonb)
        IS NOT DISTINCT FROM 'object'
      AND pg_catalog.jsonb_typeof(result_payload::pg_catalog.jsonb)
        IS NOT DISTINCT FROM 'object'
      AND pg_catalog.jsonb_typeof(request_payload::pg_catalog.jsonb -> 'domainId')
        IS NOT DISTINCT FROM 'string'
      AND pg_catalog.jsonb_typeof(result_payload::pg_catalog.jsonb -> 'domainId')
        IS NOT DISTINCT FROM 'string'
      AND pg_catalog.jsonb_typeof(request_payload::pg_catalog.jsonb -> 'requestId')
        IS NOT DISTINCT FROM 'string'
      AND pg_catalog.jsonb_typeof(result_payload::pg_catalog.jsonb -> 'requestId')
        IS NOT DISTINCT FROM 'string'
      AND pg_catalog.jsonb_typeof(result_payload::pg_catalog.jsonb -> 'snapshotId')
        IS NOT DISTINCT FROM 'string'
      AND pg_catalog.jsonb_typeof(result_payload::pg_catalog.jsonb -> 'auditMetadata')
        IS NOT DISTINCT FROM 'object'
      AND pg_catalog.jsonb_typeof(
        result_payload::pg_catalog.jsonb #> '{auditMetadata,evaluationId}'
      ) IS NOT DISTINCT FROM 'string'
      AND domain_id IS NOT DISTINCT FROM
        request_payload::pg_catalog.jsonb ->> 'domainId'
      AND domain_id IS NOT DISTINCT FROM
        result_payload::pg_catalog.jsonb ->> 'domainId'
      AND request_id IS NOT DISTINCT FROM
        request_payload::pg_catalog.jsonb ->> 'requestId'
      AND request_id IS NOT DISTINCT FROM
        result_payload::pg_catalog.jsonb ->> 'requestId'
      AND snapshot_id IS NOT DISTINCT FROM
        result_payload::pg_catalog.jsonb ->> 'snapshotId'
      AND evaluation_id IS NOT DISTINCT FROM
        result_payload::pg_catalog.jsonb #>> '{auditMetadata,evaluationId}'
    ),
  ADD CONSTRAINT scientific_persistence_fingerprint_consistent
    CHECK (
      scientific_payload_fingerprint = pg_catalog.encode(
        extensions.digest(
          pg_catalog.convert_to(
            pg_catalog.jsonb_build_object(
              'parentPersistenceId',
              COALESCE(
                pg_catalog.to_jsonb(parent_persistence_id),
                'null'::pg_catalog.jsonb
              ),
              'request', request_payload::pg_catalog.jsonb,
              'result', result_payload::pg_catalog.jsonb
            )::pg_catalog.text,
            'UTF8'
          ),
          'sha256'
        ),
        'hex'
      )
    );

CREATE FUNCTION public.insert_scientific_persistence_record_v2(
  p_parent_persistence_id uuid,
  p_envelope_contract_version text,
  p_input_contract_version text,
  p_request_payload text,
  p_result_payload text,
  p_metadata_contract_version text,
  p_implementation_id text,
  p_implementation_version text,
  p_schema_version text,
  p_model_version text,
  p_lineage_contract_version text,
  p_audit_contract_version text,
  p_boundary_version text,
  p_validation_version text,
  p_audit_input_contract_version text,
  p_request_contract_version text,
  p_result_contract_version text,
  p_validation_status text,
  p_validation_issue_codes jsonb
)
RETURNS TABLE (
  persistence_id uuid,
  persisted_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  caller_owner_id pg_catalog.uuid := COALESCE(
    NULLIF(pg_catalog.current_setting('request.jwt.claim.sub', true), ''),
    (
      NULLIF(pg_catalog.current_setting('request.jwt.claims', true), '')::pg_catalog.jsonb
      ->> 'sub'
    )
  )::pg_catalog.uuid;
  request_json pg_catalog.jsonb;
  result_json pg_catalog.jsonb;
  request_domain_id pg_catalog.text;
  result_domain_id pg_catalog.text;
  request_request_id pg_catalog.text;
  result_request_id pg_catalog.text;
  result_snapshot_id pg_catalog.text;
  result_evaluation_id pg_catalog.text;
  calculated_fingerprint pg_catalog.text;
  inserted_persistence_id pg_catalog.uuid;
  inserted_persisted_at pg_catalog.timestamptz;
  existing_persistence_id pg_catalog.uuid;
  existing_persisted_at pg_catalog.timestamptz;
  existing_snapshot_id pg_catalog.text;
  existing_evaluation_id pg_catalog.text;
  existing_parent_persistence_id pg_catalog.uuid;
  existing_fingerprint pg_catalog.text;
BEGIN
  IF caller_owner_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required for scientific persistence'
      USING ERRCODE = '28000';
  END IF;

  BEGIN
    request_json := p_request_payload::pg_catalog.jsonb;
    result_json := p_result_payload::pg_catalog.jsonb;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Scientific persistence payload is invalid.'
      USING ERRCODE = '22023';
  END;

  IF pg_catalog.jsonb_typeof(request_json) IS DISTINCT FROM 'object'
    OR pg_catalog.jsonb_typeof(result_json) IS DISTINCT FROM 'object'
    OR pg_catalog.jsonb_typeof(request_json -> 'domainId') IS DISTINCT FROM 'string'
    OR pg_catalog.jsonb_typeof(result_json -> 'domainId') IS DISTINCT FROM 'string'
    OR pg_catalog.jsonb_typeof(request_json -> 'requestId') IS DISTINCT FROM 'string'
    OR pg_catalog.jsonb_typeof(result_json -> 'requestId') IS DISTINCT FROM 'string'
    OR pg_catalog.jsonb_typeof(result_json -> 'snapshotId') IS DISTINCT FROM 'string'
    OR pg_catalog.jsonb_typeof(result_json -> 'auditMetadata') IS DISTINCT FROM 'object'
    OR pg_catalog.jsonb_typeof(result_json #> '{auditMetadata,evaluationId}')
      IS DISTINCT FROM 'string' THEN
    RAISE EXCEPTION 'Scientific persistence identity is invalid.'
      USING ERRCODE = '22023';
  END IF;

  request_domain_id := request_json ->> 'domainId';
  result_domain_id := result_json ->> 'domainId';
  request_request_id := request_json ->> 'requestId';
  result_request_id := result_json ->> 'requestId';
  result_snapshot_id := result_json ->> 'snapshotId';
  result_evaluation_id := result_json #>> '{auditMetadata,evaluationId}';

  IF pg_catalog.btrim(request_domain_id) = ''
    OR pg_catalog.btrim(result_domain_id) = ''
    OR pg_catalog.btrim(request_request_id) = ''
    OR pg_catalog.btrim(result_request_id) = ''
    OR pg_catalog.btrim(result_snapshot_id) = ''
    OR pg_catalog.btrim(result_evaluation_id) = '' THEN
    RAISE EXCEPTION 'Scientific persistence identity is invalid.'
      USING ERRCODE = '22023';
  END IF;

  IF request_domain_id IS DISTINCT FROM result_domain_id
    OR request_request_id IS DISTINCT FROM result_request_id THEN
    RAISE EXCEPTION 'Scientific persistence identity mismatch.'
      USING ERRCODE = '23514';
  END IF;

  calculated_fingerprint := pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(
        pg_catalog.jsonb_build_object(
          'parentPersistenceId',
          COALESCE(
            pg_catalog.to_jsonb(p_parent_persistence_id),
            'null'::pg_catalog.jsonb
          ),
          'request', request_json,
          'result', result_json
        )::pg_catalog.text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  );

  INSERT INTO public.scientific_persistence_records AS inserted_record (
    owner_id,
    domain_id,
    request_id,
    snapshot_id,
    evaluation_id,
    scientific_payload_fingerprint,
    idempotency_version,
    parent_persistence_id,
    envelope_contract_version,
    input_contract_version,
    request_payload,
    result_payload,
    metadata_contract_version,
    implementation_id,
    implementation_version,
    schema_version,
    model_version,
    lineage_contract_version,
    audit_contract_version,
    boundary_version,
    validation_version,
    audit_input_contract_version,
    request_contract_version,
    result_contract_version,
    validation_status,
    validation_issue_codes
  ) VALUES (
    caller_owner_id,
    request_domain_id,
    request_request_id,
    result_snapshot_id,
    result_evaluation_id,
    calculated_fingerprint,
    'scientific-persistence-idempotency/1.0.0',
    p_parent_persistence_id,
    p_envelope_contract_version,
    p_input_contract_version,
    p_request_payload,
    p_result_payload,
    p_metadata_contract_version,
    p_implementation_id,
    p_implementation_version,
    p_schema_version,
    p_model_version,
    p_lineage_contract_version,
    p_audit_contract_version,
    p_boundary_version,
    p_validation_version,
    p_audit_input_contract_version,
    p_request_contract_version,
    p_result_contract_version,
    p_validation_status,
    p_validation_issue_codes
  )
  ON CONFLICT (owner_id, domain_id, request_id) DO NOTHING
  RETURNING inserted_record.persistence_id, inserted_record.persisted_at
  INTO inserted_persistence_id, inserted_persisted_at;

  IF inserted_persistence_id IS NOT NULL THEN
    persistence_id := inserted_persistence_id;
    persisted_at := inserted_persisted_at;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT
    stored_record.persistence_id,
    stored_record.persisted_at,
    stored_record.snapshot_id,
    stored_record.evaluation_id,
    stored_record.parent_persistence_id,
    stored_record.scientific_payload_fingerprint
  INTO
    existing_persistence_id,
    existing_persisted_at,
    existing_snapshot_id,
    existing_evaluation_id,
    existing_parent_persistence_id,
    existing_fingerprint
  FROM public.scientific_persistence_records AS stored_record
  WHERE stored_record.owner_id = caller_owner_id
    AND stored_record.domain_id = request_domain_id
    AND stored_record.request_id = request_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Scientific persistence idempotency resolution failed.'
      USING ERRCODE = '40001';
  END IF;

  IF existing_fingerprint IS DISTINCT FROM calculated_fingerprint
    OR existing_snapshot_id IS DISTINCT FROM result_snapshot_id
    OR existing_evaluation_id IS DISTINCT FROM result_evaluation_id
    OR existing_parent_persistence_id IS DISTINCT FROM p_parent_persistence_id THEN
    RAISE EXCEPTION 'Scientific persistence idempotency conflict.'
      USING ERRCODE = '23505';
  END IF;

  persistence_id := existing_persistence_id;
  persisted_at := existing_persisted_at;
  RETURN NEXT;
END
$function$;

REVOKE ALL ON FUNCTION public.insert_scientific_persistence_record_v2(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.insert_scientific_persistence_record_v2(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) TO authenticated;

ALTER FUNCTION public.insert_scientific_persistence_record_v2(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) OWNER TO postgres;

COMMENT ON FUNCTION public.insert_scientific_persistence_record_v2(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) IS
  'Versioned authenticated idempotent scientific persistence insertion boundary.';

COMMIT;
