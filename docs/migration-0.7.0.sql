-- Migration: 0.6.0 → 0.7.0
-- OSInt Vacation – M7 Landing Page & Self-Service Onboarding
-- Run this in the Supabase SQL Editor for EXISTING databases.
-- (Fresh installations: use schema.sql instead)

-- ── 1. Add onboarding_done column to profiles ────────────────────────────────
-- Tracks whether a user has completed the onboarding wizard.
-- Existing users are marked as done (they've already set up their account).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;

-- Mark all existing users as onboarding-complete so they don't see the wizard
UPDATE public.profiles SET onboarding_done = TRUE WHERE onboarding_done IS FALSE;

-- ── 2. Backfill: create profile rows for any auth users without one ──────────
-- Fixes the FK constraint issue if the trigger wasn't active when users signed up.
INSERT INTO public.profiles (id, email, onboarding_done)
  SELECT id, email, TRUE FROM auth.users
  ON CONFLICT (id) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────────────
-- SELECT COUNT(*) FROM public.profiles;
-- SELECT id, email, onboarding_done FROM public.profiles;
