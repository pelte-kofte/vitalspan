-- Biomarker Experience 2.0 keeps the existing row contract while allowing
-- users to correct or delete their own measurements. Ownership continues to
-- come exclusively from the authenticated JWT and is enforced by RLS.

CREATE POLICY "users update own entries"
  ON public.biomarker_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users delete own entries"
  ON public.biomarker_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT UPDATE, DELETE ON TABLE public.biomarker_entries TO authenticated;
