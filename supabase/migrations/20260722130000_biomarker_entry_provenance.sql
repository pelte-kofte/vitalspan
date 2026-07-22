-- Preserve the original reported biomarker value, unit, and source-laboratory
-- interval across logout, account switching, reinstall, and device changes.
-- The deployed 20260720000000 table remains append-only for scientific values.

ALTER TABLE public.biomarker_entries
  ADD COLUMN unit text,
  ADD COLUMN reported_value numeric,
  ADD COLUMN reported_unit text,
  ADD COLUMN source_lab_range_lower numeric,
  ADD COLUMN source_lab_range_upper numeric,
  ADD COLUMN source_lab_range_unit text,
  ADD COLUMN source_lab_range_reported_text text,
  ADD COLUMN source_lab_name text,
  ADD CONSTRAINT biomarker_entries_unit_not_blank
    CHECK (unit IS NULL OR btrim(unit) <> ''),
  ADD CONSTRAINT biomarker_entries_reported_unit_not_blank
    CHECK (reported_unit IS NULL OR btrim(reported_unit) <> ''),
  ADD CONSTRAINT biomarker_entries_source_range_unit_not_blank
    CHECK (source_lab_range_unit IS NULL OR btrim(source_lab_range_unit) <> ''),
  ADD CONSTRAINT biomarker_entries_source_range_order
    CHECK (
      source_lab_range_lower IS NULL
      OR source_lab_range_upper IS NULL
      OR source_lab_range_lower <= source_lab_range_upper
    ),
  ADD CONSTRAINT biomarker_entries_source_range_has_unit
    CHECK (
      (source_lab_range_lower IS NULL AND source_lab_range_upper IS NULL)
      OR source_lab_range_unit IS NOT NULL
    );

COMMENT ON COLUMN public.biomarker_entries.unit IS
  'Unit of the normalized value used by the legacy client presentation.';
COMMENT ON COLUMN public.biomarker_entries.reported_value IS
  'Original value entered or imported before any client-side unit normalization.';
COMMENT ON COLUMN public.biomarker_entries.reported_unit IS
  'Original unit entered or imported with reported_value.';
COMMENT ON COLUMN public.biomarker_entries.source_lab_range_lower IS
  'Optional lower bound copied verbatim from the source laboratory report.';
COMMENT ON COLUMN public.biomarker_entries.source_lab_range_upper IS
  'Optional upper bound copied verbatim from the source laboratory report.';
COMMENT ON COLUMN public.biomarker_entries.source_lab_range_unit IS
  'Unit printed with the source laboratory interval.';
COMMENT ON COLUMN public.biomarker_entries.source_lab_range_reported_text IS
  'Optional source interval text retained for faithful display.';
COMMENT ON COLUMN public.biomarker_entries.source_lab_name IS
  'Optional laboratory name associated with the source interval.';

-- Existing clients inserted the immutable value row before these provenance
-- columns existed. This narrowly scoped bridge fills only NULL provenance for
-- the JWT owner and only when the immutable row identity still matches. It
-- cannot change value, biomarker, date, owner, source, or notes.
CREATE OR REPLACE FUNCTION public.enrich_biomarker_entry_provenance(p_entries jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_updated integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authenticated user required' USING ERRCODE = '42501';
  END IF;

  IF jsonb_typeof(p_entries) IS DISTINCT FROM 'array'
    OR jsonb_array_length(p_entries) > 1000 THEN
    RAISE EXCEPTION 'p_entries must be an array of at most 1000 entries'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_entries) AS entry(
      id text,
      biomarker_id text,
      value numeric,
      date text,
      unit text,
      reported_value numeric,
      reported_unit text,
      source_lab_range_lower numeric,
      source_lab_range_upper numeric,
      source_lab_range_unit text,
      source_lab_range_reported_text text,
      source_lab_name text
    )
    WHERE entry.id IS NULL
      OR btrim(entry.id) = ''
      OR entry.biomarker_id IS NULL
      OR btrim(entry.biomarker_id) = ''
      OR entry.value IS NULL
      OR entry.date IS NULL
      OR btrim(entry.date) = ''
      OR (entry.unit IS NOT NULL AND btrim(entry.unit) = '')
      OR (entry.reported_unit IS NOT NULL AND btrim(entry.reported_unit) = '')
      OR (entry.source_lab_range_unit IS NOT NULL AND btrim(entry.source_lab_range_unit) = '')
      OR (
        (entry.source_lab_range_lower IS NOT NULL OR entry.source_lab_range_upper IS NOT NULL)
        AND entry.source_lab_range_unit IS NULL
      )
      OR (
        entry.source_lab_range_lower IS NOT NULL
        AND entry.source_lab_range_upper IS NOT NULL
        AND entry.source_lab_range_lower > entry.source_lab_range_upper
      )
  ) THEN
    RAISE EXCEPTION 'invalid biomarker provenance entry' USING ERRCODE = '22023';
  END IF;

  UPDATE public.biomarker_entries AS stored
  SET
    unit = COALESCE(stored.unit, entry.unit),
    reported_value = COALESCE(stored.reported_value, entry.reported_value),
    reported_unit = COALESCE(stored.reported_unit, entry.reported_unit),
    source_lab_range_lower = COALESCE(stored.source_lab_range_lower, entry.source_lab_range_lower),
    source_lab_range_upper = COALESCE(stored.source_lab_range_upper, entry.source_lab_range_upper),
    source_lab_range_unit = COALESCE(stored.source_lab_range_unit, entry.source_lab_range_unit),
    source_lab_range_reported_text = COALESCE(
      stored.source_lab_range_reported_text,
      entry.source_lab_range_reported_text
    ),
    source_lab_name = COALESCE(stored.source_lab_name, entry.source_lab_name)
  FROM jsonb_to_recordset(p_entries) AS entry(
    id text,
    biomarker_id text,
    value numeric,
    date text,
    unit text,
    reported_value numeric,
    reported_unit text,
    source_lab_range_lower numeric,
    source_lab_range_upper numeric,
    source_lab_range_unit text,
    source_lab_range_reported_text text,
    source_lab_name text
  )
  WHERE stored.id = entry.id
    AND stored.user_id = v_user_id
    AND stored.biomarker_id = entry.biomarker_id
    AND stored.value = entry.value
    AND stored.date = entry.date
    AND (
      (stored.unit IS NULL AND entry.unit IS NOT NULL)
      OR (stored.reported_value IS NULL AND entry.reported_value IS NOT NULL)
      OR (stored.reported_unit IS NULL AND entry.reported_unit IS NOT NULL)
      OR (stored.source_lab_range_lower IS NULL AND entry.source_lab_range_lower IS NOT NULL)
      OR (stored.source_lab_range_upper IS NULL AND entry.source_lab_range_upper IS NOT NULL)
      OR (stored.source_lab_range_unit IS NULL AND entry.source_lab_range_unit IS NOT NULL)
      OR (
        stored.source_lab_range_reported_text IS NULL
        AND entry.source_lab_range_reported_text IS NOT NULL
      )
      OR (stored.source_lab_name IS NULL AND entry.source_lab_name IS NOT NULL)
    );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.enrich_biomarker_entry_provenance(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enrich_biomarker_entry_provenance(jsonb) TO authenticated;

COMMENT ON FUNCTION public.enrich_biomarker_entry_provenance(jsonb) IS
  'One-time owner-scoped enrichment of NULL biomarker provenance; immutable measurement fields cannot change.';
