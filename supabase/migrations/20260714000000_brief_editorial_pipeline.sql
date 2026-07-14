-- The Vitalspan Brief editorial pipeline.
--
-- Keeps the existing public articles/issues read model intact while moving all
-- ingestion, review, and publishing writes behind service-role jobs and
-- authenticated admin RPCs.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The original project created these tables from src/db/*.sql rather than a
-- migration. Creating them here makes a clean migration replay safe without
-- removing or replacing an existing production table.
CREATE TABLE IF NOT EXISTS public.articles (
  pmid text PRIMARY KEY,
  title text NOT NULL,
  journal text,
  pub_date text,
  abstract text,
  biomarker_tags text[] NOT NULL DEFAULT '{}',
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.issues (
  issue_number integer PRIMARY KEY,
  publish_date date NOT NULL,
  cover_article_id text REFERENCES public.articles(pmid),
  article_ids text[] NOT NULL DEFAULT '{}',
  pharmacist_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS issue_number integer REFERENCES public.issues(issue_number);
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS doi text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS study_type text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS limitations text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS evidence_label text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS topics text[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_section_check') THEN
    ALTER TABLE public.articles ADD CONSTRAINT articles_section_check
      CHECK (section IS NULL OR section IN ('cover', 'brief', 'note'));
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS articles_doi_unique_idx
  ON public.articles (lower(doi)) WHERE doi IS NOT NULL;
CREATE INDEX IF NOT EXISTS articles_issue_number_idx ON public.articles (issue_number);

INSERT INTO public.issues (issue_number, publish_date, cover_article_id, article_ids, pharmacist_note)
VALUES (0, '2020-01-01', NULL, '{}', NULL)
ON CONFLICT (issue_number) DO NOTHING;

UPDATE public.articles SET issue_number = 0 WHERE issue_number IS NULL;

CREATE TABLE IF NOT EXISTS public.article_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pmid text NOT NULL UNIQUE,
  doi text,
  title text NOT NULL,
  abstract text,
  journal text,
  authors jsonb NOT NULL DEFAULT '[]'::jsonb,
  publication_date date,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  study_type text NOT NULL,
  sample_size integer,
  topics text[] NOT NULL DEFAULT '{}',
  biomarker_tags text[] NOT NULL DEFAULT '{}',
  evidence_score numeric NOT NULL DEFAULT 0,
  relevance_score numeric NOT NULL DEFAULT 0,
  novelty_score numeric NOT NULL DEFAULT 0,
  safety_flags text[] NOT NULL DEFAULT '{}',
  editorial_headline text,
  ai_summary text,
  ai_takeaway text,
  limitations text,
  evidence_label text,
  source_url text NOT NULL,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'shortlisted', 'approved', 'rejected', 'published')),
  raw_metadata jsonb NOT NULL,
  CONSTRAINT article_candidates_sample_size_check CHECK (sample_size IS NULL OR sample_size > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS article_candidates_doi_unique_idx
  ON public.article_candidates (lower(doi)) WHERE doi IS NOT NULL;
CREATE INDEX IF NOT EXISTS article_candidates_queue_idx
  ON public.article_candidates (status, evidence_score DESC, relevance_score DESC, publication_date DESC);

CREATE TABLE IF NOT EXISTS public.editorial_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number integer NOT NULL,
  proposed_publish_date date NOT NULL,
  cover_candidate_id uuid REFERENCES public.article_candidates(id),
  candidate_ids uuid[] NOT NULL DEFAULT '{}',
  pharmacist_note_draft text,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ready_for_review', 'approved', 'published', 'rejected')),
  editorial_week date NOT NULL DEFAULT (date_trunc('week', timezone('UTC', now())))::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  published_issue_number integer REFERENCES public.issues(issue_number)
);

CREATE INDEX IF NOT EXISTS editorial_drafts_status_idx
  ON public.editorial_drafts (status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS editorial_drafts_active_week_unique_idx
  ON public.editorial_drafts (editorial_week) WHERE status <> 'rejected';

CREATE TABLE IF NOT EXISTS public.publication_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL CHECK (job_type IN ('ingestion', 'editorial_generation')),
  status text NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  error_message text,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS publication_jobs_started_at_idx
  ON public.publication_jobs (started_at DESC);

CREATE OR REPLACE FUNCTION public.set_brief_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS editorial_drafts_updated_at ON public.editorial_drafts;
CREATE TRIGGER editorial_drafts_updated_at
BEFORE UPDATE ON public.editorial_drafts
FOR EACH ROW EXECUTE FUNCTION public.set_brief_updated_at();

-- Admins are explicitly designated through Auth app_metadata, which ordinary
-- clients cannot edit. Either {"role":"admin"} or {"brief_admin":true} works.
CREATE OR REPLACE FUNCTION public.is_brief_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'app_metadata' ->> 'brief_admin' = 'true',
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_brief_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_brief_admin() TO authenticated;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_jobs ENABLE ROW LEVEL SECURITY;

-- Remove the legacy client write path. Scheduled ingestion is service-role only.
DROP POLICY IF EXISTS "anon insert articles" ON public.articles;
DROP POLICY IF EXISTS "anon update articles" ON public.articles;
DROP POLICY IF EXISTS "anon insert issues" ON public.issues;
DROP POLICY IF EXISTS "anon update issues" ON public.issues;
DROP POLICY IF EXISTS "public read articles" ON public.articles;
DROP POLICY IF EXISTS "public read issues" ON public.issues;
DROP POLICY IF EXISTS "public read published articles" ON public.articles;
DROP POLICY IF EXISTS "public read published issues" ON public.issues;
DROP POLICY IF EXISTS "brief admins read candidates" ON public.article_candidates;
DROP POLICY IF EXISTS "brief admins read drafts" ON public.editorial_drafts;
DROP POLICY IF EXISTS "brief admins read jobs" ON public.publication_jobs;

CREATE POLICY "public read published articles"
  ON public.articles FOR SELECT TO anon, authenticated
  USING (issue_number IS NOT NULL);

CREATE POLICY "public read published issues"
  ON public.issues FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "brief admins read candidates"
  ON public.article_candidates FOR SELECT TO authenticated
  USING (public.is_brief_admin());

CREATE POLICY "brief admins read drafts"
  ON public.editorial_drafts FOR SELECT TO authenticated
  USING (public.is_brief_admin());

CREATE POLICY "brief admins read jobs"
  ON public.publication_jobs FOR SELECT TO authenticated
  USING (public.is_brief_admin());

-- No direct candidate/draft/job write policies exist. The service role handles
-- automation, and the following narrow RPCs handle authenticated review.
CREATE OR REPLACE FUNCTION public.review_article_candidate(
  p_candidate_id uuid,
  p_status text
)
RETURNS public.article_candidates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_candidate public.article_candidates;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('shortlisted', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'invalid review status' USING ERRCODE = '22023';
  END IF;

  UPDATE public.article_candidates
  SET status = p_status
  WHERE id = p_candidate_id AND status <> 'published'
  RETURNING * INTO v_candidate;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'candidate not found or already published' USING ERRCODE = 'P0002';
  END IF;
  IF p_status <> 'approved' THEN
    UPDATE public.article_candidates
    SET status = 'shortlisted'
    WHERE status = 'approved' AND id IN (
      SELECT unnest(candidate_ids)
      FROM public.editorial_drafts
      WHERE status = 'approved' AND p_candidate_id = ANY(candidate_ids)
    );
    UPDATE public.editorial_drafts
    SET status = 'ready_for_review', approved_by = NULL, approved_at = NULL
    WHERE status = 'approved' AND p_candidate_id = ANY(candidate_ids);
    SELECT * INTO v_candidate FROM public.article_candidates WHERE id = p_candidate_id;
  END IF;
  RETURN v_candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_article_candidate_editorial(
  p_candidate_id uuid,
  p_headline text,
  p_summary text,
  p_takeaway text,
  p_limitations text,
  p_evidence_label text
)
RETURNS public.article_candidates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_candidate public.article_candidates;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;
  IF nullif(btrim(p_headline), '') IS NULL
    OR nullif(btrim(p_summary), '') IS NULL
    OR nullif(btrim(p_takeaway), '') IS NULL THEN
    RAISE EXCEPTION 'headline, summary, and why-it-matters are required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.article_candidates
  SET editorial_headline = btrim(p_headline),
      ai_summary = btrim(p_summary),
      ai_takeaway = btrim(p_takeaway),
      limitations = nullif(btrim(p_limitations), ''),
      evidence_label = nullif(btrim(p_evidence_label), '')
  WHERE id = p_candidate_id AND status <> 'published'
  RETURNING * INTO v_candidate;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'candidate not found or already published' USING ERRCODE = 'P0002';
  END IF;
  UPDATE public.article_candidates
  SET status = 'shortlisted'
  WHERE status = 'approved' AND id IN (
    SELECT unnest(candidate_ids)
    FROM public.editorial_drafts
    WHERE status = 'approved' AND p_candidate_id = ANY(candidate_ids)
  );
  UPDATE public.editorial_drafts
  SET status = 'ready_for_review', approved_by = NULL, approved_at = NULL
  WHERE status = 'approved' AND p_candidate_id = ANY(candidate_ids);
  SELECT * INTO v_candidate FROM public.article_candidates WHERE id = p_candidate_id;
  RETURN v_candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_editorial_draft(
  p_draft_id uuid,
  p_cover_candidate_id uuid,
  p_candidate_ids uuid[],
  p_title text,
  p_pharmacist_note text
)
RETURNS public.editorial_drafts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.editorial_drafts;
  v_distinct_count integer;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;
  IF COALESCE(array_length(p_candidate_ids, 1), 0) NOT BETWEEN 4 AND 5 THEN
    RAISE EXCEPTION 'a draft requires one cover and three or four briefs' USING ERRCODE = '22023';
  END IF;
  IF nullif(btrim(p_title), '') IS NULL THEN
    RAISE EXCEPTION 'draft title is required' USING ERRCODE = '22023';
  END IF;
  SELECT count(DISTINCT selected.candidate_id) INTO v_distinct_count
  FROM unnest(p_candidate_ids) AS selected(candidate_id);
  IF v_distinct_count <> array_length(p_candidate_ids, 1) OR NOT p_cover_candidate_id = ANY(p_candidate_ids) THEN
    RAISE EXCEPTION 'candidate order must be unique and include the cover' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(*) FROM public.article_candidates WHERE id = ANY(p_candidate_ids) AND status <> 'published')
       <> array_length(p_candidate_ids, 1) THEN
    RAISE EXCEPTION 'one or more candidates are invalid or already published' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_draft
  FROM public.editorial_drafts
  WHERE id = p_draft_id AND status IN ('draft', 'ready_for_review', 'approved')
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'editable draft not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_draft.status = 'approved' THEN
    UPDATE public.article_candidates
    SET status = 'shortlisted'
    WHERE id = ANY(v_draft.candidate_ids) AND status = 'approved';
  END IF;

  UPDATE public.editorial_drafts
  SET cover_candidate_id = p_cover_candidate_id,
      candidate_ids = p_candidate_ids,
      title = btrim(p_title),
      pharmacist_note_draft = nullif(btrim(p_pharmacist_note), ''),
      status = 'ready_for_review',
      approved_by = NULL,
      approved_at = NULL
  WHERE id = p_draft_id
  RETURNING * INTO v_draft;
  RETURN v_draft;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_editorial_draft(
  p_draft_id uuid,
  p_status text
)
RETURNS public.editorial_drafts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.editorial_drafts;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('draft', 'ready_for_review', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'invalid draft review status' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_draft FROM public.editorial_drafts WHERE id = p_draft_id FOR UPDATE;
  IF NOT FOUND OR v_draft.status = 'published' THEN
    RAISE EXCEPTION 'reviewable draft not found' USING ERRCODE = 'P0002';
  END IF;
  IF p_status = 'approved' THEN
    IF COALESCE(array_length(v_draft.candidate_ids, 1), 0) NOT BETWEEN 4 AND 5
       OR v_draft.cover_candidate_id IS NULL
       OR NOT v_draft.cover_candidate_id = ANY(v_draft.candidate_ids) THEN
      RAISE EXCEPTION 'complete the cover and brief selection before approval' USING ERRCODE = '22023';
    END IF;
    IF nullif(btrim(v_draft.pharmacist_note_draft), '') IS NULL
       OR v_draft.pharmacist_note_draft = 'Pharmacist review required before publication.' THEN
      RAISE EXCEPTION 'a pharmacist-authored note is required before approval' USING ERRCODE = '22023';
    END IF;
    IF (SELECT count(DISTINCT selected.candidate_id) FROM unnest(v_draft.candidate_ids) AS selected(candidate_id))
         <> array_length(v_draft.candidate_ids, 1)
       OR (SELECT count(*) FROM public.article_candidates WHERE id = ANY(v_draft.candidate_ids))
         <> array_length(v_draft.candidate_ids, 1) THEN
      RAISE EXCEPTION 'draft candidate selection is invalid' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.article_candidates
      WHERE id = ANY(v_draft.candidate_ids)
        AND (status IN ('rejected', 'published')
          OR editorial_headline IS NULL OR ai_summary IS NULL OR ai_takeaway IS NULL)
    ) THEN
      RAISE EXCEPTION 'all selected candidates require reviewed editorial copy' USING ERRCODE = '22023';
    END IF;
    UPDATE public.article_candidates SET status = 'approved' WHERE id = ANY(v_draft.candidate_ids);
  ELSIF v_draft.status = 'approved' THEN
    UPDATE public.article_candidates
    SET status = 'shortlisted'
    WHERE id = ANY(v_draft.candidate_ids) AND status = 'approved';
  END IF;

  UPDATE public.editorial_drafts
  SET status = p_status,
      approved_by = CASE WHEN p_status = 'approved' THEN auth.uid() ELSE NULL END,
      approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END
  WHERE id = p_draft_id
  RETURNING * INTO v_draft;
  RETURN v_draft;
END;
$$;

CREATE OR REPLACE FUNCTION public.publish_editorial_draft(p_draft_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.editorial_drafts;
  v_issue_number integer;
  v_candidate_id uuid;
  v_candidate public.article_candidates;
  v_pmids text[] := '{}';
  v_cover_pmid text;
  v_distinct_count integer;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;

  -- Serializes allocation and publication. Any exception rolls back every write.
  PERFORM pg_advisory_xact_lock(hashtext('vitalspan-brief-publish'));
  SELECT * INTO v_draft FROM public.editorial_drafts WHERE id = p_draft_id FOR UPDATE;
  IF NOT FOUND OR v_draft.status <> 'approved' OR v_draft.approved_by IS NULL THEN
    RAISE EXCEPTION 'an explicitly approved draft is required' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(array_length(v_draft.candidate_ids, 1), 0) NOT BETWEEN 4 AND 5 THEN
    RAISE EXCEPTION 'approved draft has an invalid candidate count' USING ERRCODE = '22023';
  END IF;
  SELECT count(DISTINCT selected.candidate_id) INTO v_distinct_count
  FROM unnest(v_draft.candidate_ids) AS selected(candidate_id);
  IF v_distinct_count <> array_length(v_draft.candidate_ids, 1)
     OR NOT v_draft.cover_candidate_id = ANY(v_draft.candidate_ids) THEN
    RAISE EXCEPTION 'approved draft has an invalid candidate selection' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(max(issue_number), 0) + 1 INTO v_issue_number
  FROM public.issues WHERE issue_number > 0;

  FOREACH v_candidate_id IN ARRAY v_draft.candidate_ids LOOP
    SELECT * INTO STRICT v_candidate
    FROM public.article_candidates
    WHERE id = v_candidate_id AND status = 'approved'
    FOR UPDATE;

    IF v_candidate.editorial_headline IS NULL OR v_candidate.ai_summary IS NULL
       OR v_candidate.ai_takeaway IS NULL THEN
      RAISE EXCEPTION 'candidate % has incomplete editorial copy', v_candidate_id USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.articles (
      pmid, doi, title, journal, pub_date, abstract, biomarker_tags, fetched_at,
      issue_number, section, source_url, study_type, limitations, evidence_label, topics
    ) VALUES (
      v_candidate.pmid,
      v_candidate.doi,
      v_candidate.editorial_headline,
      v_candidate.journal,
      v_candidate.publication_date::text,
      v_candidate.ai_summary || E'\n\nWhy it matters: ' || v_candidate.ai_takeaway,
      v_candidate.biomarker_tags,
      v_candidate.fetched_at,
      NULL,
      CASE WHEN v_candidate_id = v_draft.cover_candidate_id THEN 'cover' ELSE 'brief' END,
      v_candidate.source_url,
      v_candidate.study_type,
      v_candidate.limitations,
      v_candidate.evidence_label,
      v_candidate.topics
    )
    ON CONFLICT (pmid) DO UPDATE SET
      doi = EXCLUDED.doi,
      title = EXCLUDED.title,
      journal = EXCLUDED.journal,
      pub_date = EXCLUDED.pub_date,
      abstract = EXCLUDED.abstract,
      biomarker_tags = EXCLUDED.biomarker_tags,
      section = EXCLUDED.section,
      source_url = EXCLUDED.source_url,
      study_type = EXCLUDED.study_type,
      limitations = EXCLUDED.limitations,
      evidence_label = EXCLUDED.evidence_label,
      topics = EXCLUDED.topics;

    v_pmids := array_append(v_pmids, v_candidate.pmid);
    IF v_candidate_id = v_draft.cover_candidate_id THEN
      v_cover_pmid := v_candidate.pmid;
    END IF;
  END LOOP;

  IF v_cover_pmid IS NULL THEN
    RAISE EXCEPTION 'cover candidate is not in the draft' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.issues (
    issue_number, publish_date, cover_article_id, article_ids, pharmacist_note
  ) VALUES (
    v_issue_number, v_draft.proposed_publish_date, v_cover_pmid, v_pmids,
    v_draft.pharmacist_note_draft
  );

  UPDATE public.articles
  SET issue_number = v_issue_number
  WHERE pmid = ANY(v_pmids);

  UPDATE public.article_candidates
  SET status = 'published'
  WHERE id = ANY(v_draft.candidate_ids);

  UPDATE public.editorial_drafts
  SET status = 'published',
      issue_number = v_issue_number,
      published_issue_number = v_issue_number
  WHERE id = p_draft_id;

  RETURN v_issue_number;
END;
$$;

REVOKE ALL ON FUNCTION public.review_article_candidate(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_article_candidate_editorial(uuid, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_editorial_draft(uuid, uuid, uuid[], text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.review_editorial_draft(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_editorial_draft(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.review_article_candidate(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_article_candidate_editorial(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_editorial_draft(uuid, uuid, uuid[], text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_editorial_draft(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_editorial_draft(uuid) TO authenticated;

REVOKE ALL ON public.articles, public.issues FROM anon, authenticated;
REVOKE ALL ON public.article_candidates, public.editorial_drafts, public.publication_jobs FROM anon, authenticated;
GRANT SELECT ON public.article_candidates, public.editorial_drafts, public.publication_jobs TO authenticated;
GRANT SELECT ON public.articles, public.issues TO anon, authenticated;

COMMENT ON TABLE public.article_candidates IS 'Immutable PubMed source metadata plus reviewable editorial fields; never read by the mobile app.';
COMMENT ON TABLE public.editorial_drafts IS 'Human-review queue for weekly Vitalspan Brief issues; automation cannot publish.';
COMMENT ON FUNCTION public.publish_editorial_draft(uuid) IS 'Admin-only, transactional publication into the legacy articles/issues mobile read model.';
