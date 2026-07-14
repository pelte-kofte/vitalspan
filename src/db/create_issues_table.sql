-- Vitalspan Issues Table — "The Vitalspan Brief" weekly editorial structure.
-- Layers an Issue concept on top of the existing shared `articles` cache table.
-- No PII — issues and articles are both shared, public-read content.
--
-- LEGACY REFERENCE ONLY. New environments and production changes must use
-- supabase/migrations. Editorial writes are service-role/admin-RPC only.

CREATE TABLE IF NOT EXISTS issues (
  issue_number      int PRIMARY KEY,
  publish_date      date NOT NULL,
  cover_article_id  text REFERENCES articles(pmid),
  article_ids       text[] NOT NULL DEFAULT '{}',
  pharmacist_note   text,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read — all users (including anon) can SELECT
CREATE POLICY "public read issues"
  ON issues
  FOR SELECT
  USING (true);

-- No client INSERT/UPDATE policy. Only the admin publishing RPC creates issues.

-- Existing `articles` table gains issue membership + the article's role within
-- the issue. Nullable: the auto-fetched biomarker feed (articleService.ts) still
-- inserts plain rows with no issue/section — those are backfilled into the
-- synthetic "Issue 0" archive below so nothing breaks.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS issue_number int REFERENCES issues(issue_number);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS section text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_section_check'
  ) THEN
    ALTER TABLE articles ADD CONSTRAINT articles_section_check
      CHECK (section IS NULL OR section IN ('cover', 'brief', 'note'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS articles_issue_number_idx ON articles (issue_number);

-- Legacy archive: every article that predates the issue system (the personalized
-- biomarker feed fetched live from PubMed) belongs to a synthetic "Issue 0" so
-- old rows keep working and stay browsable from "Past issues" with zero data loss.
-- Issue 0 has no cover story and no pharmacist's note — it's an archive, not an issue.
INSERT INTO issues (issue_number, publish_date, cover_article_id, article_ids, pharmacist_note)
VALUES (0, '2020-01-01', NULL, '{}', NULL)
ON CONFLICT (issue_number) DO NOTHING;

UPDATE articles SET issue_number = 0 WHERE issue_number IS NULL;
