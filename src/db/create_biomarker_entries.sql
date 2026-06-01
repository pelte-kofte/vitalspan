-- Vitalspan Biomarker Entries Table
-- Maps to StoredEntry in src/screens/BiomarkerEntryScreen.tsx
-- Run once via Supabase SQL editor. Safe to re-run (IF NOT EXISTS / ON CONFLICT guards).

CREATE TABLE IF NOT EXISTS biomarker_entries (
  id               text PRIMARY KEY,
  user_id          uuid REFERENCES auth.users NOT NULL,
  biomarker_id     text NOT NULL,
  value            numeric NOT NULL,
  date             text NOT NULL,
  source           text,
  notes            text
);

ALTER TABLE biomarker_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own entries" ON biomarker_entries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users insert own entries" ON biomarker_entries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE policies: biomarker entries are append-only from the app.
