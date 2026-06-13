-- Vitalspan AI Advisor Rate Limit Table
-- Per-user daily AI Advisor usage counters (D-13, D-14, D-16).
-- Apply via: supabase db push  OR  paste into Supabase Dashboard SQL editor.
-- Safe to re-run (IF NOT EXISTS guards).

-- Required for uuid functions on some Supabase projects.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rate limit table: one row per (user_id, UTC date).
-- A new calendar day in UTC automatically produces a new row, resetting counts (D-14).
CREATE TABLE IF NOT EXISTS public.ai_usage (
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         date NOT NULL,
  report_count int  NOT NULL DEFAULT 0,
  chat_count   int  NOT NULL DEFAULT 0,
  CONSTRAINT ai_usage_pkey PRIMARY KEY (user_id, date)
);

COMMENT ON TABLE public.ai_usage IS
  'Per-user daily AI Advisor usage counters. Managed exclusively by the ai-advisor Edge Function (service_role). UTC date key resets counters automatically (D-14).';

-- Enable RLS so authenticated clients can only read their own row.
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Authenticated users may SELECT their own row only (e.g. for future quota UI).
-- The Edge Function runs as service_role and bypasses RLS — no SELECT policy needed for it.
CREATE POLICY "ai_usage_select_own"
  ON public.ai_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT/UPDATE performed exclusively by the ai-advisor Edge Function running as service_role (bypasses RLS).
-- No client-side write policies.

-- Index for faster per-user lookups by date descending.
CREATE INDEX IF NOT EXISTS ai_usage_user_date_idx
  ON public.ai_usage (user_id, date DESC);
