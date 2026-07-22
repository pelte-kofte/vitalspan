-- Auth Session Consistency: server ownership for mobile biomarker writes.
-- The authenticated JWT, never a client-supplied owner identifier, supplies
-- user_id. Existing RLS remains the final ownership enforcement boundary.

ALTER TABLE IF EXISTS public.biomarker_entries
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE IF EXISTS public.biomarker_entries ENABLE ROW LEVEL SECURITY;
