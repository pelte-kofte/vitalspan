-- One-time production correction for the first Vitalspan Brief ingestion.
--
-- Run only after explicit approval. This transaction is deliberately pinned to
-- the reviewed 130-candidate, pre-draft production state. It updates only
-- study_type, evidence_score, and safety_flags. Relevance does not depend on
-- classification, so relevance_score is intentionally left unchanged.

BEGIN;

SELECT pg_advisory_xact_lock(hashtext('vitalspan-brief-candidate-reclassification-20260714'));
LOCK TABLE public.article_candidates IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.articles) <> 75
     OR (SELECT count(*) FROM public.issues) <> 1
     OR (SELECT count(*) FROM public.issues WHERE issue_number <> 0) <> 0
     OR (SELECT count(*) FROM public.editorial_drafts) <> 0 THEN
    RAISE EXCEPTION 'production content state no longer matches the approved backfill precondition';
  END IF;

  IF (SELECT count(*) FROM public.article_candidates) <> 130 THEN
    RAISE EXCEPTION 'expected exactly 130 candidates from the first ingestion';
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
    RAISE EXCEPTION 'candidate review or editorial work has started; refusing deterministic backfill';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.article_candidates
    WHERE pmid = '42440093' AND study_type = 'systematic-review' AND evidence_score = 94
  ) OR NOT EXISTS (
    SELECT 1 FROM public.article_candidates
    WHERE pmid = '42437946' AND study_type = 'systematic-review' AND evidence_score = 94
  ) THEN
    RAISE EXCEPTION 'reviewed regression examples no longer match their expected before-state';
  END IF;
END;
$$;

CREATE TEMP TABLE brief_candidate_reclassification_plan ON COMMIT DROP AS
WITH source AS (
  SELECT
    candidate.id,
    candidate.pmid,
    candidate.study_type AS previous_study_type,
    candidate.evidence_score AS previous_evidence_score,
    candidate.safety_flags AS previous_safety_flags,
    candidate.sample_size,
    candidate.abstract IS NOT NULL AND btrim(candidate.abstract) <> '' AS has_abstract,
    lower(candidate.title) AS title_text,
    lower(COALESCE(candidate.abstract, '')) AS abstract_text,
    lower(candidate.title || ' ' || COALESCE(candidate.abstract, '')) AS combined_text,
    COALESCE((
      SELECT string_agg(lower(publication_type.value), ' ' ORDER BY publication_type.value)
      FROM jsonb_array_elements_text(
        COALESCE(candidate.raw_metadata -> 'publicationTypes', '[]'::jsonb)
      ) AS publication_type(value)
    ), '') AS publication_types
  FROM public.article_candidates AS candidate
), classified AS (
  SELECT
    source.*,
    CASE
      WHEN publication_types ~ '\mcase series\M'
        OR title_text ~ '\mcase series\M'
        OR abstract_text ~ '\m(this|our) case series\M'
        OR abstract_text ~ '\mwe (report|present|describe)\M.{0,30}\mseries of\M.{0,20}\mcases\M'
        THEN 'case-series'
      WHEN publication_types ~ '\mcase reports?\M'
        OR title_text ~ '\mcase reports?\M'
        OR abstract_text ~ '\m(this is|we (report|present|describe))\M.{0,40}\mcase\M'
        OR abstract_text ~ '\mcase presentation\M'
        THEN 'case-report'
      WHEN publication_types ~ '\mprotocol\M'
        OR title_text ~ '\mprotocol\M'
        OR abstract_text ~ '\m(study|trial|review|research|registered|systematic review|meta-analysis) protocol\M'
        OR abstract_text ~ '\mprotocol for (an? |the )?(study|trial|review|meta-analysis)\M'
        OR abstract_text ~ '\m(we|this (paper|article|study)) (describe|describes|present|presents|report|reports)\M.{0,40}\mprotocol\M'
        THEN 'protocol'
      WHEN publication_types ~ '\m(conference|congress|meeting) abstracts?\M'
        OR title_text ~ '\m(conference|congress|meeting) abstract\M'
        OR abstract_text ~ '\mpublished as (a |an )?(conference|congress|meeting) abstract\M'
        THEN 'conference-abstract'
      WHEN publication_types ~ '\m(editorial|comment|letter)\M'
        OR title_text ~ '^(editorial|commentary|comment|letter to the editor)\M'
        OR title_text ~ '\m(editorial|commentary|letter to the editor)[[:space:]]*[:-]'
        THEN 'editorial'
      WHEN publication_types ~ '\manimals?\M' AND publication_types !~ '\mhumans?\M'
        THEN 'animal-study'
      WHEN combined_text ~ '\min vitro\M|cell line|cultured cells'
        THEN 'in-vitro-study'
      WHEN combined_text ~ '\m(mice|mouse|rats?|murine)\M'
        AND combined_text !~ '\m(participants?|patients?|adults?|humans?)\M'
        THEN 'animal-study'
      WHEN publication_types ~ '\mmeta-analysis\M' OR combined_text ~ '\mmeta[- ]analysis\M'
        THEN 'meta-analysis'
      WHEN publication_types ~ '\msystematic review\M' OR combined_text ~ '\msystematic review\M'
        THEN 'systematic-review'
      WHEN publication_types ~ '\mrandomized controlled trial\M'
        OR combined_text ~ '\mrandomi[sz]ed controlled trial\M'
        THEN 'randomized-controlled-trial'
      WHEN publication_types ~ '\mclinical trial\M'
        THEN 'clinical-trial'
      WHEN combined_text ~ 'prospective.{0,20}cohort|cohort.{0,20}prospective'
        THEN 'prospective-cohort'
      WHEN combined_text ~ '\mcohort\M'
        THEN 'cohort-study'
      WHEN publication_types ~ '\mobservational study\M'
        OR combined_text ~ 'cross-sectional|case-control|observational'
        THEN 'observational-study'
      ELSE 'other'
    END AS new_study_type
  FROM source
), flagged AS (
  SELECT
    classified.*,
    ARRAY(
      SELECT flag
      FROM unnest(ARRAY[
        CASE WHEN NOT has_abstract THEN 'missing-abstract' END,
        CASE WHEN new_study_type = 'animal-study' THEN 'animal-only' END,
        CASE WHEN new_study_type = 'in-vitro-study' THEN 'in-vitro' END,
        CASE WHEN new_study_type IN ('case-report', 'case-series') THEN 'case-report' END,
        CASE WHEN new_study_type = 'protocol' THEN 'protocol' END,
        CASE WHEN new_study_type IN ('protocol', 'conference-abstract') THEN 'incomplete-evidence' END,
        CASE WHEN new_study_type = 'conference-abstract' THEN 'conference-abstract' END,
        CASE WHEN new_study_type = 'editorial' THEN 'editorial' END,
        CASE WHEN publication_types ~ '\mretracted publication\M' THEN 'retracted' END
      ]::text[]) AS flag
      WHERE flag IS NOT NULL
      ORDER BY flag
    ) AS new_safety_flags
  FROM classified
), raw_scored AS (
  SELECT
    flagged.*,
    CASE new_study_type
      WHEN 'meta-analysis' THEN 100
      WHEN 'systematic-review' THEN 94
      WHEN 'randomized-controlled-trial' THEN 88
      WHEN 'clinical-trial' THEN 76
      WHEN 'prospective-cohort' THEN 72
      WHEN 'cohort-study' THEN 64
      WHEN 'observational-study' THEN 52
      WHEN 'other' THEN 35
      WHEN 'case-series' THEN 18
      WHEN 'case-report' THEN 14
      WHEN 'animal-study' THEN 10
      WHEN 'in-vitro-study' THEN 7
      WHEN 'protocol' THEN 6
      WHEN 'conference-abstract' THEN 5
      WHEN 'editorial' THEN 3
    END
    + CASE
        WHEN sample_size >= 10000 THEN 12
        WHEN sample_size >= 1000 THEN 9
        WHEN sample_size >= 200 THEN 5
        WHEN sample_size < 20 THEN -15
        WHEN sample_size < 50 THEN -8
        ELSE 0
      END
    + CASE WHEN has_abstract THEN 0 ELSE -25 END AS raw_evidence_score
  FROM flagged
), final_scored AS (
  SELECT
    raw_scored.*,
    greatest(0, least(100, round((
      CASE
        WHEN 'retracted' = ANY(new_safety_flags) THEN 0
        WHEN new_study_type = 'protocol' THEN least(raw_evidence_score, 10)
        WHEN new_study_type = 'case-report' THEN least(raw_evidence_score, 14)
        WHEN new_study_type = 'case-series' THEN least(raw_evidence_score, 20)
        WHEN new_study_type = 'conference-abstract' THEN least(raw_evidence_score, 5)
        WHEN new_study_type = 'editorial' THEN least(raw_evidence_score, 3)
        ELSE raw_evidence_score
      END
    )::numeric, 1))) AS new_evidence_score
  FROM raw_scored
)
SELECT
  id,
  pmid,
  previous_study_type,
  new_study_type,
  previous_evidence_score,
  new_evidence_score,
  previous_safety_flags,
  new_safety_flags
FROM final_scored;

-- Reviewable before/after rows are emitted as part of the apply transcript.
SELECT *
FROM brief_candidate_reclassification_plan
WHERE pmid IN ('42440093', '42437946')
ORDER BY pmid;

SELECT count(*) AS candidates_to_change
FROM brief_candidate_reclassification_plan
WHERE (previous_study_type, previous_evidence_score, previous_safety_flags)
  IS DISTINCT FROM (new_study_type, new_evidence_score, new_safety_flags);

DO $$
DECLARE
  expected_changes integer;
  applied_changes integer;
BEGIN
  SELECT count(*) INTO expected_changes
  FROM brief_candidate_reclassification_plan
  WHERE (previous_study_type, previous_evidence_score, previous_safety_flags)
    IS DISTINCT FROM (new_study_type, new_evidence_score, new_safety_flags);

  UPDATE public.article_candidates AS candidate
  SET study_type = plan.new_study_type,
      evidence_score = plan.new_evidence_score,
      safety_flags = plan.new_safety_flags
  FROM brief_candidate_reclassification_plan AS plan
  WHERE candidate.id = plan.id
    AND candidate.status = 'new'
    AND candidate.editorial_headline IS NULL
    AND candidate.ai_summary IS NULL
    AND candidate.ai_takeaway IS NULL
    AND candidate.evidence_label IS NULL
    AND (candidate.study_type, candidate.evidence_score, candidate.safety_flags)
      IS DISTINCT FROM (plan.new_study_type, plan.new_evidence_score, plan.new_safety_flags);

  GET DIAGNOSTICS applied_changes = ROW_COUNT;
  IF applied_changes <> expected_changes THEN
    RAISE EXCEPTION 'expected % candidate updates but applied %', expected_changes, applied_changes;
  END IF;
END;
$$;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.articles) <> 75
     OR (SELECT count(*) FROM public.issues) <> 1
     OR (SELECT count(*) FROM public.issues WHERE issue_number <> 0) <> 0
     OR (SELECT count(*) FROM public.editorial_drafts) <> 0
     OR EXISTS (SELECT 1 FROM public.article_candidates WHERE status <> 'new') THEN
    RAISE EXCEPTION 'post-backfill safety invariant failed';
  END IF;
END;
$$;

COMMIT;
