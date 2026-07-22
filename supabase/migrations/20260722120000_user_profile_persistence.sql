-- Durable, user-owned onboarding profile state.
-- AsyncStorage remains a session cache; this table is the cross-login/device truth.

CREATE TABLE public.user_profiles (
  user_id uuid PRIMARY KEY DEFAULT auth.uid()
    REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  age integer,
  sex text,
  goal text,
  conditions text[] NOT NULL DEFAULT ARRAY[]::text[],
  medications text[] NOT NULL DEFAULT ARRAY[]::text[],
  onboarding_complete boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_name_nonempty
    CHECK (name IS NULL OR btrim(name) <> ''),
  CONSTRAINT user_profiles_age_range
    CHECK (age IS NULL OR age BETWEEN 18 AND 120),
  CONSTRAINT user_profiles_sex_supported
    CHECK (sex IS NULL OR sex IN ('male', 'female')),
  CONSTRAINT user_profiles_goal_nonempty
    CHECK (goal IS NULL OR btrim(goal) <> ''),
  CONSTRAINT user_profiles_complete_shape
    CHECK (
      NOT onboarding_complete
      OR (
        name IS NOT NULL
        AND age IS NOT NULL
        AND sex IS NOT NULL
        AND goal IS NOT NULL
      )
    )
);

COMMENT ON TABLE public.user_profiles IS
  'Durable onboarding and account profile state owned by the authenticated user.';
COMMENT ON COLUMN public.user_profiles.user_id IS
  'Owner derived from the authenticated JWT through auth.uid().';

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY "users select own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users delete own profile"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_profiles TO authenticated;
