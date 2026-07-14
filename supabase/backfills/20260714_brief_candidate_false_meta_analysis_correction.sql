-- Guarded one-time correction for candidates falsely promoted because their
-- abstracts mention meta-analysis as a method. Run only after explicit approval.
--
-- The read-only canonical-classifier preview across all 130 candidates found
-- exactly these two affected PMIDs. This transaction changes only study_type
-- and evidence_score; every source, ranking, status, and editorial field is
-- intentionally preserved.

BEGIN;

SELECT pg_advisory_xact_lock(hashtext('vitalspan-brief-false-meta-analysis-correction-20260714'));
LOCK TABLE public.article_candidates IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.articles) <> 75
     OR (SELECT count(*) FROM public.issues) <> 1
     OR (SELECT count(*) FROM public.issues WHERE issue_number <> 0) <> 0
     OR (SELECT count(*) FROM public.article_candidates) <> 130
     OR (SELECT count(*) FROM public.editorial_drafts) <> 0
     OR (SELECT count(*) FROM public.publication_jobs) <> 1 THEN
    RAISE EXCEPTION 'production state no longer matches the approved correction precondition';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.article_candidates
    WHERE status <> 'new'
       OR editorial_headline IS NOT NULL
       OR ai_summary IS NOT NULL
       OR ai_takeaway IS NOT NULL
       OR evidence_label IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'candidate review or editorial work has started; refusing correction';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.article_candidates
    WHERE pmid = '42302219'
      AND study_type = 'meta-analysis'
      AND evidence_score = 100
      AND safety_flags = ARRAY[]::text[]
      AND COALESCE(raw_metadata -> 'publicationTypes', '[]'::jsonb)
        = '["Journal Article", "Comparative Study"]'::jsonb
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.article_candidates
    WHERE pmid = '42430684'
      AND study_type = 'meta-analysis'
      AND evidence_score = 100
      AND safety_flags = ARRAY[]::text[]
      AND COALESCE(raw_metadata -> 'publicationTypes', '[]'::jsonb)
        = '["Journal Article", "Systematic Review"]'::jsonb
  ) THEN
    RAISE EXCEPTION 'reviewed false-promotion rows no longer match their expected before-state';
  END IF;
END;
$$;

CREATE TEMP TABLE brief_false_meta_analysis_plan (
  pmid text PRIMARY KEY,
  previous_study_type text NOT NULL,
  previous_evidence_score numeric NOT NULL,
  corrected_study_type text NOT NULL,
  corrected_evidence_score numeric NOT NULL
) ON COMMIT DROP;

INSERT INTO brief_false_meta_analysis_plan VALUES
  ('42302219', 'meta-analysis', 100, 'observational-study', 61),
  ('42430684', 'meta-analysis', 100, 'systematic-review', 99);

-- Emit the exact guarded before/after plan in the apply transcript.
SELECT
  candidate.pmid,
  candidate.study_type AS previous_study_type,
  plan.corrected_study_type,
  candidate.evidence_score AS previous_evidence_score,
  plan.corrected_evidence_score,
  candidate.safety_flags,
  candidate.relevance_score,
  candidate.novelty_score,
  candidate.status
FROM public.article_candidates AS candidate
JOIN brief_false_meta_analysis_plan AS plan USING (pmid)
ORDER BY candidate.pmid;

DO $$
DECLARE
  applied_changes integer;
BEGIN
  UPDATE public.article_candidates AS candidate
  SET study_type = plan.corrected_study_type,
      evidence_score = plan.corrected_evidence_score
  FROM brief_false_meta_analysis_plan AS plan
  WHERE candidate.pmid = plan.pmid
    AND candidate.study_type = plan.previous_study_type
    AND candidate.evidence_score = plan.previous_evidence_score
    AND candidate.safety_flags = ARRAY[]::text[]
    AND candidate.status = 'new'
    AND candidate.editorial_headline IS NULL
    AND candidate.ai_summary IS NULL
    AND candidate.ai_takeaway IS NULL
    AND candidate.evidence_label IS NULL;

  GET DIAGNOSTICS applied_changes = ROW_COUNT;
  IF applied_changes <> 2 THEN
    RAISE EXCEPTION 'expected exactly 2 candidate updates but applied %', applied_changes;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.article_candidates
    WHERE pmid = '42302219'
      AND study_type = 'observational-study'
      AND evidence_score = 61
      AND safety_flags = ARRAY[]::text[]
  ) OR NOT EXISTS (
    SELECT 1 FROM public.article_candidates
    WHERE pmid = '42430684'
      AND study_type = 'systematic-review'
      AND evidence_score = 99
      AND safety_flags = ARRAY[]::text[]
  ) THEN
    RAISE EXCEPTION 'corrected rows failed post-update verification';
  END IF;

  IF (SELECT count(*) FROM public.articles) <> 75
     OR (SELECT count(*) FROM public.issues) <> 1
     OR (SELECT count(*) FROM public.issues WHERE issue_number <> 0) <> 0
     OR (SELECT count(*) FROM public.article_candidates) <> 130
     OR (SELECT count(*) FROM public.editorial_drafts) <> 0
     OR (SELECT count(*) FROM public.publication_jobs) <> 1
     OR EXISTS (SELECT 1 FROM public.article_candidates WHERE status <> 'new') THEN
    RAISE EXCEPTION 'post-correction production invariant failed';
  END IF;
END;
$$;

COMMIT;
