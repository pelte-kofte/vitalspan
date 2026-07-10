-- Vitalspan AI Advisor — per-user daily cap on PubMed-search-enabled chat messages.
-- Apply via: supabase db push  OR  paste into Supabase Dashboard SQL editor.
-- Safe to re-run (IF NOT EXISTS guard).

ALTER TABLE public.ai_usage
  ADD COLUMN IF NOT EXISTS search_count int NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.ai_usage.search_count IS
  'Count of chat messages today for which PubMed MCP search was enabled (D-13/D-14 semantics — managed exclusively by the ai-advisor Edge Function).';
