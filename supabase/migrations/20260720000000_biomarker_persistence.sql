-- Governed Biomarker Persistence storage for authenticated and anonymous users.
-- Entries are append-only from the mobile client; duplicate IDs are retry-safe
-- through INSERT ... ON CONFLICT DO NOTHING semantics in biomarkerWriteService.

CREATE TABLE public.biomarker_entries (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid()
    REFERENCES auth.users(id) ON DELETE CASCADE,
  biomarker_id text NOT NULL,
  value numeric NOT NULL,
  date text NOT NULL,
  source text,
  notes text,
  CONSTRAINT biomarker_entries_id_not_blank CHECK (btrim(id) <> ''),
  CONSTRAINT biomarker_entries_biomarker_id_not_blank CHECK (btrim(biomarker_id) <> ''),
  CONSTRAINT biomarker_entries_date_not_blank CHECK (btrim(date) <> '')
);

COMMENT ON TABLE public.biomarker_entries IS
  'User-owned append-only biomarker entries synchronized from the Vitalspan application.';
COMMENT ON COLUMN public.biomarker_entries.id IS
  'Client-generated text identity preserved from the local StoredEntry contract.';
COMMENT ON COLUMN public.biomarker_entries.user_id IS
  'Owner derived from the authenticated JWT through auth.uid().';

CREATE INDEX biomarker_entries_user_date_idx
  ON public.biomarker_entries (user_id, date DESC);

ALTER TABLE public.biomarker_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own entries"
  ON public.biomarker_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users insert own entries"
  ON public.biomarker_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

REVOKE ALL ON TABLE public.biomarker_entries FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.biomarker_entries TO authenticated;

-- No UPDATE or DELETE grants or policies: persisted entries remain append-only.
