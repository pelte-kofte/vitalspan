-- Vitalspan Articles Cache Table
-- Shared PubMed article cache keyed by PMID.
-- No PII — this is a shared cache visible to all users.
--
-- HOW TO RUN:
--   1. Open the Supabase SQL editor for your project.
--   2. Paste this entire file and click "Run".
--   3. Safe to re-run (IF NOT EXISTS guards prevent duplicate errors).
--   4. Do NOT run DROP TABLE before running this — IF NOT EXISTS makes it idempotent.

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

-- Policy 2: Anon INSERT — app client upserts new articles into the cache
CREATE POLICY "anon insert articles"
  ON articles
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Anon UPDATE — app client updates existing articles (upsert path)
CREATE POLICY "anon update articles"
  ON articles
  FOR UPDATE
  USING (true);

-- Index to accelerate ORDER BY fetched_at DESC (common query pattern)
CREATE INDEX IF NOT EXISTS articles_fetched_at_idx ON articles (fetched_at DESC);
