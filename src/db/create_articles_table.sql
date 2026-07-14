-- Vitalspan Articles Cache Table
-- Shared PubMed article cache keyed by PMID.
-- No PII — this is a shared cache visible to all users.
--
-- LEGACY REFERENCE ONLY. New environments and production changes must use
-- supabase/migrations. Editorial writes are service-role/admin-RPC only.

CREATE TABLE IF NOT EXISTS articles (
  pmid           text PRIMARY KEY,
  title          text NOT NULL,
  journal        text,
  pub_date       text,
  abstract       text,
  biomarker_tags text[] DEFAULT '{}',
  fetched_at     timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read — all users (including anon) can SELECT
CREATE POLICY "public read articles"
  ON articles
  FOR SELECT
  USING (true);

-- No client INSERT/UPDATE policy. The Brief ingestion Edge Function owns writes.

-- Index to accelerate ORDER BY fetched_at DESC (common query pattern)
CREATE INDEX IF NOT EXISTS articles_fetched_at_idx ON articles (fetched_at DESC);
