-- Phase 8 scientific persistence storage idempotency: empty-table cutover.
-- Deployment sequence:
--   1. Apply 20260719000000_scientific_persistence_records.sql.
--   2. Verify that the base installation exists and contains no persisted rows.
--   3. Apply this migration before activating any runtime writer.
-- This forward-only migration preserves the existing RPC contract and inactive runtime.

SET LOCAL lock_timeout = '5s';

DO $dependencies$
BEGIN
  IF pg_catalog.to_regprocedure('extensions.digest(bytea,text)') IS NULL THEN
    RAISE EXCEPTION 'Scientific persistence idempotency requires the pgcrypto digest function.';
  END IF;
END
$dependencies$;

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

GRANT SELECT (
  owner_id,
  parent_persistence_id,
  domain_id,
  request_id,
  snapshot_id,
  evaluation_id,
  scientific_payload_fingerprint
) ON TABLE public.scientific_persistence_records TO scientific_persistence_writer;

GRANT USAGE ON SCHEMA extensions TO scientific_persistence_writer;
GRANT EXECUTE ON FUNCTION extensions.digest(bytea, text)
  TO scientific_persistence_writer;

GRANT CREATE ON SCHEMA public TO scientific_persistence_writer;
SET ROLE scientific_persistence_writer;

CREATE OR REPLACE FUNCTION public.insert_scientific_persistence_record(
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

RESET ROLE;
REVOKE CREATE ON SCHEMA public FROM scientific_persistence_writer;
DROP ROLE scientific_persistence_migration_owner;
