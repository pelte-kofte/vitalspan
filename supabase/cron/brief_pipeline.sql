-- One-time scheduler setup for The Vitalspan Brief.
--
-- Before running this file, create these Vault secrets once (Dashboard Vault or
-- vault.create_secret):
--   project_url           https://<project-ref>.supabase.co
--   service_role_key      the server-only Supabase secret/service-role key
--   brief_pipeline_secret the same random value configured as the Edge Function
--                         secret BRIEF_PIPELINE_SECRET
--
-- NCBI_EMAIL, optional NCBI_API_KEY, BRIEF_PIPELINE_SECRET, ANTHROPIC_API_KEY,
-- and optional BRIEF_AI_MODEL belong in Supabase Edge Function secrets, never
-- in this SQL file or the mobile app.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS supabase_vault CASCADE;

DO $$
DECLARE
  required_secret text;
BEGIN
  FOREACH required_secret IN ARRAY ARRAY['project_url', 'service_role_key', 'brief_pipeline_secret'] LOOP
    IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = required_secret) THEN
      RAISE EXCEPTION 'Missing Vault secret: %', required_secret;
    END IF;
  END LOOP;
END;
$$;

-- Idempotently replace the jobs when the schedule or function name changes.
DO $$
DECLARE
  existing_job bigint;
BEGIN
  SELECT jobid INTO existing_job FROM cron.job WHERE jobname = 'vitalspan-brief-ingest';
  IF existing_job IS NOT NULL THEN PERFORM cron.unschedule(existing_job); END IF;
  SELECT jobid INTO existing_job FROM cron.job WHERE jobname = 'vitalspan-brief-draft';
  IF existing_job IS NOT NULL THEN PERFORM cron.unschedule(existing_job); END IF;
END;
$$;

-- Tuesday 05:05 UTC keeps this small batch inside NCBI's recommended overnight
-- Eastern-time window throughout the year.
SELECT cron.schedule(
  'vitalspan-brief-ingest',
  '5 5 * * 2',
  $job$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
        || '/functions/v1/brief-ingest',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
        'x-brief-pipeline-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'brief_pipeline_secret')
      ),
      body := jsonb_build_object('trigger', 'cron', 'scheduledAt', now()),
      timeout_milliseconds := 120000
    );
  $job$
);
-- Drafting starts after ingestion has had time to finish. It can only create a
-- ready-for-review draft; the publish RPC still requires a human admin.
SELECT cron.schedule(
  'vitalspan-brief-draft',
  '20 5 * * 2',
  $job$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
        || '/functions/v1/brief-draft',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
        'x-brief-pipeline-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'brief_pipeline_secret')
      ),
      body := jsonb_build_object('trigger', 'cron', 'scheduledAt', now()),
      timeout_milliseconds := 120000
    );
  $job$
);
