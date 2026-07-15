-- One-shot admin operation for the pre-Phase-2B Issue 1 draft.
-- No table schema changes; every non-target draft field is preserved.

BEGIN;

CREATE OR REPLACE FUNCTION public.backfill_issue_one_editorial_intelligence(p_draft_id uuid)
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

  IF p_draft_id IS DISTINCT FROM '9c0966bf-2ed4-44b6-a616-d38e4ad5100f'::uuid THEN
    RAISE EXCEPTION 'this backfill is restricted to the existing Issue 1 draft' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_draft
  FROM public.editorial_drafts
  WHERE id = p_draft_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'editorial draft not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_draft.status <> 'ready_for_review'
    OR v_draft.approved_at IS NOT NULL
    OR v_draft.approved_by IS NOT NULL
    OR v_draft.published_issue_number IS NOT NULL THEN
    RAISE EXCEPTION 'draft is not eligible for the one-shot editorial-intelligence backfill' USING ERRCODE = '55000';
  END IF;

  -- theme_keywords is NOT NULL DEFAULT '{}' in the Phase 3C schema, so the
  -- empty array is the only possible unset state for this migrated draft.
  IF v_draft.editorial_thesis IS NOT NULL
    OR v_draft.theme_confidence IS NOT NULL
    OR v_draft.theme_type IS NOT NULL
    OR cardinality(v_draft.theme_keywords) <> 0 THEN
    RAISE EXCEPTION 'editorial intelligence is already populated; overwrites are forbidden' USING ERRCODE = '55000';
  END IF;

  UPDATE public.editorial_drafts
  SET editorial_thesis = 'Promising intervention signals repeatedly meet decision limits: nutritional trade-offs, observational uncertainty, and methodological weakness constrain how confidently findings can guide practice.',
      theme_confidence = 'medium',
      theme_type = 'evidence-limitation',
      theme_keywords = ARRAY['promising signals meet decision limits']::text[]
  WHERE id = p_draft_id
  RETURNING * INTO v_draft;

  RETURN v_draft;
END;
$$;

REVOKE ALL ON FUNCTION public.backfill_issue_one_editorial_intelligence(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backfill_issue_one_editorial_intelligence(uuid) TO authenticated;

COMMENT ON FUNCTION public.backfill_issue_one_editorial_intelligence(uuid) IS
  'One-shot brief-admin-only metadata backfill for draft 9c0966bf-2ed4-44b6-a616-d38e4ad5100f; refuses overwrites and changes only four Phase 2B fields.';

COMMIT;
