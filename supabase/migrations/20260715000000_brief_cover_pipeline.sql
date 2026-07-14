-- Phase 3C: private, review-first cover generation metadata and workflow.
-- This migration preserves the existing public articles/issues read model.

BEGIN;

ALTER TABLE public.editorial_drafts ADD COLUMN IF NOT EXISTS editorial_thesis text;
ALTER TABLE public.editorial_drafts ADD COLUMN IF NOT EXISTS theme_confidence text;
ALTER TABLE public.editorial_drafts ADD COLUMN IF NOT EXISTS theme_type text;
ALTER TABLE public.editorial_drafts ADD COLUMN IF NOT EXISTS theme_keywords text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.editorial_drafts ADD COLUMN IF NOT EXISTS theme_evidence jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'editorial_drafts_theme_confidence_check') THEN
    ALTER TABLE public.editorial_drafts ADD CONSTRAINT editorial_drafts_theme_confidence_check
      CHECK (theme_confidence IS NULL OR theme_confidence IN ('high', 'medium', 'low'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'editorial_drafts_theme_evidence_array_check') THEN
    ALTER TABLE public.editorial_drafts ADD CONSTRAINT editorial_drafts_theme_evidence_array_check
      CHECK (jsonb_typeof(theme_evidence) = 'array');
  END IF;
END;
$$;

CREATE TABLE public.editorial_cover_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.editorial_drafts(id) ON DELETE RESTRICT,
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL DEFAULT 'concept_ready'
    CHECK (status IN ('concept_ready', 'generating', 'ready_for_review', 'approved', 'rejected', 'failed')),

  issue_number_snapshot integer NOT NULL CHECK (issue_number_snapshot > 0),
  issue_title_snapshot text NOT NULL,
  art_bible_version text NOT NULL,
  art_bible_sha256 text NOT NULL CHECK (art_bible_sha256 ~ '^[0-9a-f]{64}$'),
  prompt_version integer NOT NULL CHECK (prompt_version > 0),
  permanent_style_block text NOT NULL,
  permanent_exclusion_block text NOT NULL,
  editorial_thesis text NOT NULL,
  theme_confidence text NOT NULL CHECK (theme_confidence IN ('high', 'medium', 'low')),
  theme_type text NOT NULL,
  central_tension text NOT NULL,
  cover_paper_role text NOT NULL,
  composition_family text NOT NULL
    CHECK (composition_family IN ('singular-transformation', 'tension-still-life', 'living-system', 'threshold', 'constellation')),
  physical_world text NOT NULL,
  hero_object text NOT NULL,
  supporting_forms text[] NOT NULL CHECK (cardinality(supporting_forms) BETWEEN 1 AND 4),
  dominant_objects text[] NOT NULL CHECK (cardinality(dominant_objects) BETWEEN 2 AND 5),
  hero_description text NOT NULL,
  controlled_impossibility text NOT NULL,
  unresolved_state text NOT NULL,
  supported_interpretation text NOT NULL,
  principal_uncertainty text NOT NULL,
  claims_not_imply text[] NOT NULL CHECK (cardinality(claims_not_imply) >= 3),
  palette jsonb NOT NULL CHECK (jsonb_typeof(palette) = 'object'),
  crop_plan jsonb NOT NULL CHECK (jsonb_typeof(crop_plan) = 'object'),

  final_prompt text,
  prompt_sha256 text CHECK (prompt_sha256 IS NULL OR prompt_sha256 ~ '^[0-9a-f]{64}$'),
  provider_id text CHECK (provider_id IS NULL OR provider_id IN ('openai', 'google', 'stability')),
  provider_model text,
  provider_request_id text,
  render_size text,
  render_quality text,
  output_format text CHECK (output_format IS NULL OR output_format IN ('png', 'jpeg', 'webp')),
  output_mime_type text CHECK (output_mime_type IS NULL OR output_mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  output_bytes integer CHECK (output_bytes IS NULL OR output_bytes > 0),
  output_width integer CHECK (output_width IS NULL OR output_width > 0),
  output_height integer CHECK (output_height IS NULL OR output_height > 0),
  generation_duration_ms integer CHECK (generation_duration_ms IS NULL OR generation_duration_ms >= 0),
  estimated_cost_usd numeric(10, 6) CHECK (estimated_cost_usd IS NULL OR estimated_cost_usd >= 0),
  storage_bucket text,
  storage_path text CHECK (
    storage_path IS NULL
    OR (storage_path !~ '(^/|\\.\\.|://)' AND storage_path ~ '^[A-Za-z0-9_./-]+$')
  ),
  asset_sha256 text CHECK (asset_sha256 IS NULL OR asset_sha256 ~ '^[0-9a-f]{64}$'),

  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  generation_started_at timestamptz,
  generation_completed_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  approved_at timestamptz,
  rejected_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  rejected_at timestamptz,
  rejection_reason text,
  failed_at timestamptz,
  failure_code text,
  failure_message text,

  UNIQUE (draft_id, version),
  CONSTRAINT editorial_cover_generation_confidence_composition CHECK (
    (theme_confidence = 'high' AND composition_family IN ('singular-transformation', 'living-system'))
    OR (theme_confidence = 'medium' AND composition_family IN ('tension-still-life', 'threshold'))
    OR (theme_confidence = 'low' AND composition_family = 'constellation')
  ),
  CONSTRAINT editorial_cover_generation_review_consistent CHECK (
    (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL
      AND rejected_by IS NULL AND rejected_at IS NULL AND rejection_reason IS NULL)
    OR (status = 'rejected' AND rejected_by IS NOT NULL AND rejected_at IS NOT NULL
      AND nullif(btrim(rejection_reason), '') IS NOT NULL AND approved_by IS NULL AND approved_at IS NULL)
    OR (status NOT IN ('approved', 'rejected') AND approved_by IS NULL AND approved_at IS NULL
      AND rejected_by IS NULL AND rejected_at IS NULL AND rejection_reason IS NULL)
  ),
  CONSTRAINT editorial_cover_generation_failure_consistent CHECK (
    (status = 'failed' AND failed_at IS NOT NULL AND nullif(btrim(failure_code), '') IS NOT NULL)
    OR (status <> 'failed' AND failed_at IS NULL AND failure_code IS NULL AND failure_message IS NULL)
  ),
  CONSTRAINT editorial_cover_generation_asset_consistent CHECK (
    status NOT IN ('ready_for_review', 'approved', 'rejected')
    OR (final_prompt IS NOT NULL AND prompt_sha256 IS NOT NULL AND provider_id IS NOT NULL
      AND provider_model IS NOT NULL AND render_size IS NOT NULL AND render_quality IS NOT NULL
      AND output_format IS NOT NULL AND output_mime_type IS NOT NULL AND output_bytes IS NOT NULL
      AND output_width IS NOT NULL AND output_height IS NOT NULL AND generation_duration_ms IS NOT NULL
      AND estimated_cost_usd IS NOT NULL AND storage_bucket IS NOT NULL AND storage_path IS NOT NULL
      AND asset_sha256 IS NOT NULL AND generation_started_at IS NOT NULL AND generation_completed_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX editorial_cover_one_generating_per_draft_idx
  ON public.editorial_cover_generations (draft_id) WHERE status = 'generating';
CREATE UNIQUE INDEX editorial_cover_one_reviewable_per_draft_idx
  ON public.editorial_cover_generations (draft_id) WHERE status = 'ready_for_review';
CREATE UNIQUE INDEX editorial_cover_one_approved_per_draft_idx
  ON public.editorial_cover_generations (draft_id) WHERE status = 'approved';
CREATE INDEX editorial_cover_generations_draft_version_idx
  ON public.editorial_cover_generations (draft_id, version DESC);

CREATE TABLE public.editorial_cover_generation_sources (
  generation_id uuid NOT NULL REFERENCES public.editorial_cover_generations(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.article_candidates(id) ON DELETE RESTRICT,
  pmid text NOT NULL,
  ordinal smallint NOT NULL CHECK (ordinal BETWEEN 1 AND 5),
  source_phrase text NOT NULL,
  PRIMARY KEY (generation_id, candidate_id),
  UNIQUE (generation_id, ordinal)
);

CREATE OR REPLACE FUNCTION public.guard_cover_generation_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    RAISE EXCEPTION 'approved cover generations are immutable' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'approved' THEN
      RAISE EXCEPTION 'approved cover generations are immutable' USING ERRCODE = '55000';
    END IF;
    IF NEW.status <> OLD.status AND NOT (
      (OLD.status = 'concept_ready' AND NEW.status = 'generating')
      OR (OLD.status = 'generating' AND NEW.status IN ('ready_for_review', 'failed'))
      OR (OLD.status = 'ready_for_review' AND NEW.status IN ('approved', 'rejected'))
    ) THEN
      RAISE EXCEPTION 'invalid cover generation transition % -> %', OLD.status, NEW.status USING ERRCODE = '22023';
    END IF;
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER editorial_cover_generations_guard
BEFORE UPDATE OR DELETE ON public.editorial_cover_generations
FOR EACH ROW EXECUTE FUNCTION public.guard_cover_generation_mutation();

CREATE TRIGGER editorial_cover_generations_updated_at
BEFORE UPDATE ON public.editorial_cover_generations
FOR EACH ROW EXECUTE FUNCTION public.set_brief_updated_at();

ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS cover_generation_id uuid
  REFERENCES public.editorial_cover_generations(id) ON DELETE RESTRICT;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS cover_image_path text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS cover_image_alt text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS cover_image_sha256 text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'issues_cover_image_path_safe') THEN
    ALTER TABLE public.issues ADD CONSTRAINT issues_cover_image_path_safe CHECK (
      cover_image_path IS NULL
      OR (cover_image_path !~ '(^/|\\.\\.|://)' AND cover_image_path ~ '^[A-Za-z0-9_./-]+$')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'issues_cover_image_sha256_valid') THEN
    ALTER TABLE public.issues ADD CONSTRAINT issues_cover_image_sha256_valid CHECK (
      cover_image_sha256 IS NULL OR cover_image_sha256 ~ '^[0-9a-f]{64}$'
    );
  END IF;
END;
$$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brief-covers', 'brief-covers', false, 15728640, ARRAY['image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE public.editorial_cover_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_cover_generation_sources ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.editorial_cover_generations, public.editorial_cover_generation_sources FROM anon, authenticated;
GRANT SELECT ON public.editorial_cover_generations, public.editorial_cover_generation_sources TO authenticated;

CREATE POLICY "brief admins read cover generations"
  ON public.editorial_cover_generations FOR SELECT TO authenticated
  USING (public.is_brief_admin());
CREATE POLICY "brief admins read cover generation sources"
  ON public.editorial_cover_generation_sources FOR SELECT TO authenticated
  USING (public.is_brief_admin());

DROP POLICY IF EXISTS "brief admins review private covers" ON storage.objects;
CREATE POLICY "brief admins review private covers"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'brief-covers'
    AND (storage.foldername(name))[1] = 'private'
    AND public.is_brief_admin()
  );

CREATE OR REPLACE FUNCTION public.create_cover_concept(p_draft_id uuid, p_concept jsonb)
RETURNS public.editorial_cover_generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.editorial_drafts;
  v_generation public.editorial_cover_generations;
  v_version integer;
  v_source jsonb;
  v_source_count integer;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_draft FROM public.editorial_drafts WHERE id = p_draft_id FOR UPDATE;
  IF NOT FOUND OR v_draft.status <> 'ready_for_review' THEN
    RAISE EXCEPTION 'a ready-for-review editorial draft is required' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.editorial_cover_generations
    WHERE draft_id = p_draft_id AND status IN ('concept_ready', 'generating', 'ready_for_review', 'approved')
  ) THEN
    RAISE EXCEPTION 'an active cover concept already exists' USING ERRCODE = '23505';
  END IF;
  IF p_concept->>'artBibleSha256' <> '43e83d69e275c5a5227f19f7f5fb9fa519659bf4a4a2ad9f5abf1e53347499d0'
    OR p_concept->>'artBibleVersion' <> '1.0'
    OR (p_concept->>'promptVersion')::integer <> 1 THEN
    RAISE EXCEPTION 'cover concept uses a non-canonical Art Bible or prompt version' USING ERRCODE = '22023';
  END IF;
  IF v_draft.editorial_thesis IS NULL OR v_draft.theme_confidence IS NULL OR v_draft.theme_type IS NULL
    OR p_concept->>'editorialThesis' <> v_draft.editorial_thesis
    OR p_concept->>'themeConfidence' <> v_draft.theme_confidence
    OR p_concept->>'themeType' <> v_draft.theme_type THEN
    RAISE EXCEPTION 'cover concept must match the draft editorial intelligence' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(p_concept->'supportingSources') <> 'array' THEN
    RAISE EXCEPTION 'supportingSources must be an array' USING ERRCODE = '22023';
  END IF;
  v_source_count := jsonb_array_length(p_concept->'supportingSources');
  IF v_source_count NOT BETWEEN 4 AND 5 OR v_source_count <> cardinality(v_draft.candidate_ids) THEN
    RAISE EXCEPTION 'cover evidence must match all draft candidates' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_concept->'supportingSources') source
    WHERE NOT ((source->>'candidateId')::uuid = ANY(v_draft.candidate_ids))
      OR nullif(btrim(source->>'sourcePhrase'), '') IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM public.article_candidates candidate
        WHERE candidate.id = (source->>'candidateId')::uuid
          AND candidate.pmid = source->>'pmid'
      )
  ) THEN
    RAISE EXCEPTION 'cover evidence contains an invalid candidate or source phrase' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(max(version), 0) + 1 INTO v_version
  FROM public.editorial_cover_generations WHERE draft_id = p_draft_id;

  INSERT INTO public.editorial_cover_generations (
    draft_id, version, issue_number_snapshot, issue_title_snapshot,
    art_bible_version, art_bible_sha256, prompt_version,
    permanent_style_block, permanent_exclusion_block,
    editorial_thesis, theme_confidence, theme_type, central_tension, cover_paper_role,
    composition_family, physical_world, hero_object, supporting_forms, dominant_objects,
    hero_description, controlled_impossibility, unresolved_state, supported_interpretation,
    principal_uncertainty, claims_not_imply, palette, crop_plan, created_by
  ) VALUES (
    p_draft_id, v_version, v_draft.issue_number, v_draft.title,
    p_concept->>'artBibleVersion', p_concept->>'artBibleSha256', (p_concept->>'promptVersion')::integer,
    p_concept->>'permanentStyleBlock', p_concept->>'permanentExclusionBlock',
    p_concept->>'editorialThesis', p_concept->>'themeConfidence', p_concept->>'themeType',
    p_concept->>'centralTension', p_concept->>'coverPaperRole', p_concept->>'compositionFamily',
    p_concept->>'physicalWorld', p_concept->>'heroObject',
    ARRAY(SELECT jsonb_array_elements_text(p_concept->'supportingForms')),
    ARRAY(SELECT jsonb_array_elements_text(p_concept->'dominantObjects')),
    p_concept->>'heroDescription', p_concept->>'controlledImpossibility', p_concept->>'unresolvedState',
    p_concept->>'supportedInterpretation', p_concept->>'principalUncertainty',
    ARRAY(SELECT jsonb_array_elements_text(p_concept->'claimsNotImply')),
    p_concept->'palette', p_concept->'cropPlan', auth.uid()
  ) RETURNING * INTO v_generation;

  FOR v_source IN SELECT value FROM jsonb_array_elements(p_concept->'supportingSources') LOOP
    INSERT INTO public.editorial_cover_generation_sources (
      generation_id, candidate_id, pmid, ordinal, source_phrase
    ) VALUES (
      v_generation.id,
      (v_source->>'candidateId')::uuid,
      v_source->>'pmid',
      (v_source->>'ordinal')::smallint,
      btrim(v_source->>'sourcePhrase')
    );
  END LOOP;
  RETURN v_generation;
END;
$$;

CREATE OR REPLACE FUNCTION public.regenerate_cover(p_draft_id uuid)
RETURNS public.editorial_cover_generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_previous public.editorial_cover_generations;
  v_generation public.editorial_cover_generations;
  v_version integer;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;
  PERFORM 1 FROM public.editorial_drafts
    WHERE id = p_draft_id AND status = 'ready_for_review' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'a ready-for-review editorial draft is required' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.editorial_cover_generations
    WHERE draft_id = p_draft_id AND status IN ('concept_ready', 'generating', 'ready_for_review', 'approved')
  ) THEN
    RAISE EXCEPTION 'reject or resolve the active cover before regeneration' USING ERRCODE = '55000';
  END IF;
  SELECT * INTO v_previous FROM public.editorial_cover_generations
    WHERE draft_id = p_draft_id AND status IN ('rejected', 'failed')
    ORDER BY version DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'no rejected or failed cover exists to regenerate' USING ERRCODE = 'P0002';
  END IF;
  SELECT max(version) + 1 INTO v_version FROM public.editorial_cover_generations WHERE draft_id = p_draft_id;

  INSERT INTO public.editorial_cover_generations (
    draft_id, version, issue_number_snapshot, issue_title_snapshot,
    art_bible_version, art_bible_sha256, prompt_version, permanent_style_block, permanent_exclusion_block,
    editorial_thesis, theme_confidence, theme_type, central_tension, cover_paper_role,
    composition_family, physical_world, hero_object, supporting_forms, dominant_objects,
    hero_description, controlled_impossibility, unresolved_state, supported_interpretation,
    principal_uncertainty, claims_not_imply, palette, crop_plan, created_by
  ) SELECT
    draft_id, v_version, issue_number_snapshot, issue_title_snapshot,
    art_bible_version, art_bible_sha256, prompt_version, permanent_style_block, permanent_exclusion_block,
    editorial_thesis, theme_confidence, theme_type, central_tension, cover_paper_role,
    composition_family, physical_world, hero_object, supporting_forms, dominant_objects,
    hero_description, controlled_impossibility, unresolved_state, supported_interpretation,
    principal_uncertainty, claims_not_imply, palette, crop_plan, auth.uid()
  FROM public.editorial_cover_generations WHERE id = v_previous.id
  RETURNING * INTO v_generation;

  INSERT INTO public.editorial_cover_generation_sources (generation_id, candidate_id, pmid, ordinal, source_phrase)
  SELECT v_generation.id, candidate_id, pmid, ordinal, source_phrase
  FROM public.editorial_cover_generation_sources WHERE generation_id = v_previous.id;
  RETURN v_generation;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_cover(p_draft_id uuid)
RETURNS public.editorial_cover_generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_generation public.editorial_cover_generations;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_generation FROM public.editorial_cover_generations
    WHERE draft_id = p_draft_id AND status = 'ready_for_review'
    ORDER BY version DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'no cover is ready for review' USING ERRCODE = 'P0002';
  END IF;
  UPDATE public.editorial_cover_generations
    SET status = 'approved', approved_by = auth.uid(), approved_at = now()
    WHERE id = v_generation.id RETURNING * INTO v_generation;
  RETURN v_generation;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_cover(p_draft_id uuid, p_reason text)
RETURNS public.editorial_cover_generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_generation public.editorial_cover_generations;
BEGIN
  IF NOT public.is_brief_admin() THEN
    RAISE EXCEPTION 'brief admin access required' USING ERRCODE = '42501';
  END IF;
  IF nullif(btrim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'a rejection reason is required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_generation FROM public.editorial_cover_generations
    WHERE draft_id = p_draft_id AND status = 'ready_for_review'
    ORDER BY version DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'no cover is ready for review' USING ERRCODE = 'P0002';
  END IF;
  UPDATE public.editorial_cover_generations
    SET status = 'rejected', rejected_by = auth.uid(), rejected_at = now(), rejection_reason = btrim(p_reason)
    WHERE id = v_generation.id RETURNING * INTO v_generation;
  RETURN v_generation;
END;
$$;

CREATE OR REPLACE FUNCTION public.begin_cover_generation(
  p_draft_id uuid, p_provider_id text, p_provider_model text, p_estimated_cost_usd numeric
)
RETURNS public.editorial_cover_generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_generation public.editorial_cover_generations;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('vitalspan-cover-' || p_draft_id::text));
  PERFORM 1 FROM public.editorial_drafts
    WHERE id = p_draft_id AND status = 'ready_for_review' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'a ready-for-review editorial draft is required' USING ERRCODE = '22023';
  END IF;
  IF p_provider_id <> 'openai' OR p_provider_model <> 'gpt-image-2' OR p_estimated_cost_usd < 0 THEN
    RAISE EXCEPTION 'unsupported initial cover provider configuration' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.editorial_cover_generations
    WHERE draft_id = p_draft_id AND status IN ('generating', 'ready_for_review', 'approved')
  ) THEN
    RAISE EXCEPTION 'cover generation already active or complete' USING ERRCODE = '55000';
  END IF;
  SELECT * INTO v_generation FROM public.editorial_cover_generations
    WHERE draft_id = p_draft_id AND status = 'concept_ready'
    ORDER BY version DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'no cover concept is ready' USING ERRCODE = 'P0002';
  END IF;
  UPDATE public.editorial_cover_generations SET
    status = 'generating', provider_id = p_provider_id, provider_model = p_provider_model,
    render_size = '1152x1536', render_quality = 'medium', output_format = 'png',
    estimated_cost_usd = p_estimated_cost_usd, generation_started_at = now()
  WHERE id = v_generation.id RETURNING * INTO v_generation;
  RETURN v_generation;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_cover_generation(
  p_generation_id uuid, p_final_prompt text, p_prompt_sha256 text,
  p_storage_bucket text, p_storage_path text, p_output_mime_type text,
  p_output_width integer, p_output_height integer, p_output_bytes integer,
  p_asset_sha256 text, p_generation_duration_ms integer,
  p_provider_request_id text, p_estimated_cost_usd numeric
)
RETURNS public.editorial_cover_generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_generation public.editorial_cover_generations;
  v_expected_path text;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_generation FROM public.editorial_cover_generations
    WHERE id = p_generation_id AND status = 'generating' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'generation is not active' USING ERRCODE = 'P0002';
  END IF;
  v_expected_path := 'private/' || v_generation.draft_id || '/' || v_generation.id || '/master.png';
  IF p_storage_bucket <> 'brief-covers' OR p_storage_path <> v_expected_path
    OR p_output_mime_type <> 'image/png' OR p_output_width <> 1152 OR p_output_height <> 1536
    OR p_output_bytes <= 0 OR p_output_bytes > 15728640
    OR p_prompt_sha256 !~ '^[0-9a-f]{64}$' OR p_asset_sha256 !~ '^[0-9a-f]{64}$'
    OR p_generation_duration_ms < 0 OR p_estimated_cost_usd < 0 THEN
    RAISE EXCEPTION 'invalid generated cover metadata' USING ERRCODE = '22023';
  END IF;
  UPDATE public.editorial_cover_generations SET
    status = 'ready_for_review', final_prompt = p_final_prompt, prompt_sha256 = p_prompt_sha256,
    storage_bucket = p_storage_bucket, storage_path = p_storage_path,
    output_mime_type = p_output_mime_type, output_width = p_output_width,
    output_height = p_output_height, output_bytes = p_output_bytes,
    asset_sha256 = p_asset_sha256, generation_duration_ms = p_generation_duration_ms,
    provider_request_id = nullif(btrim(p_provider_request_id), ''),
    estimated_cost_usd = p_estimated_cost_usd, generation_completed_at = now()
  WHERE id = p_generation_id RETURNING * INTO v_generation;
  RETURN v_generation;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_cover_generation(
  p_generation_id uuid, p_failure_code text, p_failure_message text
)
RETURNS public.editorial_cover_generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_generation public.editorial_cover_generations;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
  END IF;
  IF nullif(btrim(p_failure_code), '') IS NULL THEN
    RAISE EXCEPTION 'failure code is required' USING ERRCODE = '22023';
  END IF;
  UPDATE public.editorial_cover_generations SET
    status = 'failed', failed_at = now(), failure_code = left(btrim(p_failure_code), 100),
    failure_message = left(nullif(btrim(p_failure_message), ''), 500)
  WHERE id = p_generation_id AND status = 'generating'
  RETURNING * INTO v_generation;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'generation is not active' USING ERRCODE = 'P0002';
  END IF;
  RETURN v_generation;
END;
$$;

-- Replace publication atomically so all future non-legacy issues require both
-- editorial approval and an immutable approved cover generation.
CREATE OR REPLACE FUNCTION public.publish_editorial_draft(p_draft_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.editorial_drafts;
  v_cover_generation public.editorial_cover_generations;
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
  PERFORM pg_advisory_xact_lock(hashtext('vitalspan-brief-publish'));
  SELECT * INTO v_draft FROM public.editorial_drafts WHERE id = p_draft_id FOR UPDATE;
  IF NOT FOUND OR v_draft.status <> 'approved' OR v_draft.approved_by IS NULL THEN
    RAISE EXCEPTION 'an explicitly approved draft is required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_cover_generation FROM public.editorial_cover_generations
    WHERE draft_id = p_draft_id AND status = 'approved'
    ORDER BY version DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'an explicitly approved cover is required' USING ERRCODE = '22023';
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
    SELECT * INTO STRICT v_candidate FROM public.article_candidates
      WHERE id = v_candidate_id AND status = 'approved' FOR UPDATE;
    IF v_candidate.editorial_headline IS NULL OR v_candidate.ai_summary IS NULL
      OR v_candidate.ai_takeaway IS NULL THEN
      RAISE EXCEPTION 'candidate % has incomplete editorial copy', v_candidate_id USING ERRCODE = '22023';
    END IF;
    INSERT INTO public.articles (
      pmid, doi, title, journal, pub_date, abstract, biomarker_tags, fetched_at,
      issue_number, section, source_url, study_type, limitations, evidence_label, topics
    ) VALUES (
      v_candidate.pmid, v_candidate.doi, v_candidate.editorial_headline, v_candidate.journal,
      v_candidate.publication_date::text, v_candidate.ai_summary || E'\n\nWhy it matters: ' || v_candidate.ai_takeaway,
      v_candidate.biomarker_tags, v_candidate.fetched_at, NULL,
      CASE WHEN v_candidate_id = v_draft.cover_candidate_id THEN 'cover' ELSE 'brief' END,
      v_candidate.source_url, v_candidate.study_type, v_candidate.limitations,
      v_candidate.evidence_label, v_candidate.topics
    ) ON CONFLICT (pmid) DO UPDATE SET
      doi = EXCLUDED.doi, title = EXCLUDED.title, journal = EXCLUDED.journal,
      pub_date = EXCLUDED.pub_date, abstract = EXCLUDED.abstract,
      biomarker_tags = EXCLUDED.biomarker_tags, section = EXCLUDED.section,
      source_url = EXCLUDED.source_url, study_type = EXCLUDED.study_type,
      limitations = EXCLUDED.limitations, evidence_label = EXCLUDED.evidence_label,
      topics = EXCLUDED.topics;
    v_pmids := array_append(v_pmids, v_candidate.pmid);
    IF v_candidate_id = v_draft.cover_candidate_id THEN v_cover_pmid := v_candidate.pmid; END IF;
  END LOOP;
  IF v_cover_pmid IS NULL THEN
    RAISE EXCEPTION 'cover candidate is not in the draft' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.issues (
    issue_number, publish_date, cover_article_id, article_ids, pharmacist_note,
    cover_generation_id, cover_image_path, cover_image_alt, cover_image_sha256
  ) VALUES (
    v_issue_number, v_draft.proposed_publish_date, v_cover_pmid, v_pmids, v_draft.pharmacist_note_draft,
    v_cover_generation.id, NULL,
    'Editorial cover artwork for ' || v_draft.title, v_cover_generation.asset_sha256
  );
  UPDATE public.articles SET issue_number = v_issue_number WHERE pmid = ANY(v_pmids);
  UPDATE public.article_candidates SET status = 'published' WHERE id = ANY(v_draft.candidate_ids);
  UPDATE public.editorial_drafts SET
    status = 'published', issue_number = v_issue_number, published_issue_number = v_issue_number
  WHERE id = p_draft_id;
  RETURN v_issue_number;
END;
$$;

REVOKE ALL ON FUNCTION public.create_cover_concept(uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.regenerate_cover(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_cover(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_cover(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.begin_cover_generation(uuid, text, text, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_cover_generation(uuid, text, text, text, text, text, integer, integer, integer, text, integer, text, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fail_cover_generation(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_cover_generation_mutation() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_cover_concept(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_cover(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_cover(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_cover(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.begin_cover_generation(uuid, text, text, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_cover_generation(uuid, text, text, text, text, text, integer, integer, integer, text, integer, text, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_cover_generation(uuid, text, text) TO service_role;

COMMENT ON TABLE public.editorial_cover_generations IS
  'Private versioned cover concepts and generation provenance; no credentials, image bytes, or provider response bodies.';
COMMENT ON TABLE public.editorial_cover_generation_sources IS
  'Source-grounded phrases tied only to candidates selected for the editorial draft.';
COMMENT ON FUNCTION public.publish_editorial_draft(uuid) IS
  'Admin-only transactional publication requiring separate editorial and cover approvals; legacy published issues are unchanged.';

COMMIT;
