-- Phase 8.0C scientific persistence storage.
-- One authenticated call appends one complete persistence envelope record.
-- This migration creates infrastructure only and does not activate a runtime path.

CREATE TABLE public.scientific_persistence_records (
  persistence_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  persisted_at timestamptz NOT NULL DEFAULT now(),
  parent_persistence_id uuid,
  envelope_contract_version text NOT NULL,
  input_contract_version text NOT NULL,
  request_payload text NOT NULL,
  result_payload text NOT NULL,
  metadata_contract_version text NOT NULL,
  implementation_id text NOT NULL,
  implementation_version text NOT NULL,
  schema_version text NOT NULL,
  model_version text NOT NULL,
  lineage_contract_version text NOT NULL,
  audit_contract_version text NOT NULL,
  boundary_version text NOT NULL,
  validation_version text NOT NULL,
  audit_input_contract_version text NOT NULL,
  request_contract_version text NOT NULL,
  result_contract_version text NOT NULL,
  validation_status text NOT NULL,
  validation_issue_codes jsonb NOT NULL,
  CONSTRAINT scientific_persistence_owner_identity_unique
    UNIQUE (owner_id, persistence_id),
  CONSTRAINT scientific_persistence_parent_not_self
    CHECK (parent_persistence_id IS NULL OR parent_persistence_id <> persistence_id),
  CONSTRAINT scientific_persistence_parent_same_owner
    FOREIGN KEY (owner_id, parent_persistence_id)
    REFERENCES public.scientific_persistence_records (owner_id, persistence_id),
  CONSTRAINT scientific_persistence_envelope_version_nonempty
    CHECK (btrim(envelope_contract_version) <> ''),
  CONSTRAINT scientific_persistence_input_version_nonempty
    CHECK (btrim(input_contract_version) <> ''),
  CONSTRAINT scientific_persistence_request_payload_nonempty
    CHECK (length(request_payload) > 0),
  CONSTRAINT scientific_persistence_result_payload_nonempty
    CHECK (length(result_payload) > 0),
  CONSTRAINT scientific_persistence_metadata_version_nonempty
    CHECK (btrim(metadata_contract_version) <> ''),
  CONSTRAINT scientific_persistence_implementation_id_nonempty
    CHECK (btrim(implementation_id) <> ''),
  CONSTRAINT scientific_persistence_implementation_version_nonempty
    CHECK (btrim(implementation_version) <> ''),
  CONSTRAINT scientific_persistence_schema_version_nonempty
    CHECK (btrim(schema_version) <> ''),
  CONSTRAINT scientific_persistence_model_version_nonempty
    CHECK (btrim(model_version) <> ''),
  CONSTRAINT scientific_persistence_lineage_version_nonempty
    CHECK (btrim(lineage_contract_version) <> ''),
  CONSTRAINT scientific_persistence_audit_version_nonempty
    CHECK (btrim(audit_contract_version) <> ''),
  CONSTRAINT scientific_persistence_boundary_version_nonempty
    CHECK (btrim(boundary_version) <> ''),
  CONSTRAINT scientific_persistence_validation_version_nonempty
    CHECK (btrim(validation_version) <> ''),
  CONSTRAINT scientific_persistence_audit_input_version_nonempty
    CHECK (btrim(audit_input_contract_version) <> ''),
  CONSTRAINT scientific_persistence_request_version_nonempty
    CHECK (btrim(request_contract_version) <> ''),
  CONSTRAINT scientific_persistence_result_version_nonempty
    CHECK (btrim(result_contract_version) <> ''),
  CONSTRAINT scientific_persistence_validation_passed
    CHECK (validation_status = 'passed'),
  CONSTRAINT scientific_persistence_validation_issues_empty
    CHECK (
      jsonb_typeof(validation_issue_codes) = 'array'
      AND validation_issue_codes = '[]'::jsonb
    )
);

COMMENT ON TABLE public.scientific_persistence_records IS
  'Append-only Phase 8.0C preservation records for authoritative scientific persistence envelopes.';

REVOKE ALL ON TABLE public.scientific_persistence_records FROM PUBLIC, anon, authenticated;

DO $role$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = 'scientific_persistence_writer'
  ) THEN
    RAISE EXCEPTION 'scientific_persistence_writer role already exists';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = 'scientific_persistence_migration_owner'
  ) THEN
    RAISE EXCEPTION 'scientific_persistence_migration_owner role already exists';
  END IF;
END
$role$;

-- Supabase protects memberships of its managed postgres role from GRANT and
-- REVOKE. Use a disposable CREATEROLE bridge so the writer can be created with
-- SET capability, then remove the entire bridge after ownership is transferred.
SET createrole_self_grant = 'set';

CREATE ROLE scientific_persistence_migration_owner
  NOLOGIN
  NOINHERIT
  NOSUPERUSER
  NOCREATEDB
  CREATEROLE
  NOREPLICATION
  NOBYPASSRLS;

RESET createrole_self_grant;

SET ROLE scientific_persistence_migration_owner;
SET createrole_self_grant = 'set';

CREATE ROLE scientific_persistence_writer
  NOLOGIN
  NOINHERIT
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS;

RESET createrole_self_grant;
RESET ROLE;

GRANT USAGE, CREATE ON SCHEMA public TO scientific_persistence_writer;
GRANT INSERT ON TABLE public.scientific_persistence_records TO scientific_persistence_writer;
GRANT SELECT (persistence_id, persisted_at)
  ON TABLE public.scientific_persistence_records
  TO scientific_persistence_writer;

ALTER TABLE public.scientific_persistence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scientific_persistence_records FORCE ROW LEVEL SECURITY;

CREATE POLICY scientific_persistence_writer_insert_own
  ON public.scientific_persistence_records
  FOR INSERT
  TO scientific_persistence_writer
  WITH CHECK (
    owner_id = COALESCE(
      NULLIF(pg_catalog.current_setting('request.jwt.claim.sub', true), ''),
      (
        NULLIF(pg_catalog.current_setting('request.jwt.claims', true), '')::pg_catalog.jsonb
        ->> 'sub'
      )
    )::pg_catalog.uuid
  );

CREATE POLICY scientific_persistence_writer_return_own
  ON public.scientific_persistence_records
  FOR SELECT
  TO scientific_persistence_writer
  USING (
    owner_id = COALESCE(
      NULLIF(pg_catalog.current_setting('request.jwt.claim.sub', true), ''),
      (
        NULLIF(pg_catalog.current_setting('request.jwt.claims', true), '')::pg_catalog.jsonb
        ->> 'sub'
      )
    )::pg_catalog.uuid
  );

CREATE FUNCTION public.insert_scientific_persistence_record(
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
BEGIN
  IF caller_owner_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required for scientific persistence'
      USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  INSERT INTO public.scientific_persistence_records AS inserted_record (
    owner_id,
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
  RETURNING inserted_record.persistence_id, inserted_record.persisted_at;
END
$function$;

REVOKE ALL ON FUNCTION public.insert_scientific_persistence_record(
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

GRANT EXECUTE ON FUNCTION public.insert_scientific_persistence_record(
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

ALTER FUNCTION public.insert_scientific_persistence_record(
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
) OWNER TO scientific_persistence_writer;

REVOKE CREATE ON SCHEMA public FROM scientific_persistence_writer;

DROP ROLE scientific_persistence_migration_owner;
