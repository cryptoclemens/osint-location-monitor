-- schema-rls-patch.sql – Auth & RLS supplement
-- Version: 0.2.0 | Created: 2026-03-10
--
-- Run this ONCE in the Supabase SQL Editor AFTER setting up the base schema
-- (docs/schema.sql) and BEFORE creating the first user account.
--
-- What this does:
--   1. Creates a trigger that automatically creates a profile row
--      when a new user signs up via Supabase Auth.
--   2. Ensures all required RLS policies are in place.
--   3. Adds a helper function for profile lookup by email.

-- ─────────────────────────────────────────────────────────────────────
-- 1. AUTO-CREATE PROFILE ON USER SIGNUP
-- ─────────────────────────────────────────────────────────────────────
-- Without this trigger, logging in works but creating a location would
-- fail because locations.user_id → profiles.id and no profile exists.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then re-create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- 2. BACKFILL: create profile rows for any users that already exist
--    (safe to run multiple times thanks to ON CONFLICT)
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 3. VERIFY RLS IS ENABLED (idempotent – safe to re-run)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts            ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 4. VERIFY POLICIES EXIST (skip if already created by schema.sql)
-- ─────────────────────────────────────────────────────────────────────

-- Profiles: each user can only see/edit their own row
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can manage own profile'
  ) THEN
    CREATE POLICY "Users can manage own profile"
      ON public.profiles FOR ALL USING (auth.uid() = id);
  END IF;
END $$;

-- Locations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'locations' AND policyname = 'Users can manage own locations'
  ) THEN
    CREATE POLICY "Users can manage own locations"
      ON public.locations FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Location categories (inherited via location ownership)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'location_categories' AND policyname = 'Users can manage own location categories'
  ) THEN
    CREATE POLICY "Users can manage own location categories"
      ON public.location_categories FOR ALL
      USING (location_id IN (
        SELECT id FROM public.locations WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

-- Alerts (read-only for users; service_role writes them via Python scripts)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'alerts' AND policyname = 'Users can view own alerts'
  ) THEN
    CREATE POLICY "Users can view own alerts"
      ON public.alerts FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- 5. HELPFUL: Check current policies (run to verify)
-- ─────────────────────────────────────────────────────────────────────
-- SELECT tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
