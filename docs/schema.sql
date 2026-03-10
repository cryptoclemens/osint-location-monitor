-- OSInt Location Monitor – Supabase Database Schema
-- Version: 0.1.0 | Created: 2026-03-10
-- Run this in the Supabase SQL Editor to set up the database.

-- ─────────────────────────────────────────────
-- USERS (handled by Supabase Auth, extended here)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- LOCATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,                     -- e.g. "Ferienhaus Toskana"
  address TEXT NOT NULL,                  -- Full address string
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  country_code CHAR(2),                   -- ISO 3166-1 alpha-2, e.g. "IT"
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- LOCATION CATEGORIES (which events to monitor per location)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.location_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'unwetter',       -- Storms, extreme weather
    'hochwasser',     -- Floods
    'feuer',          -- Fire / Wildfire
    'unruhen',        -- Political unrest
    'erdbeben'        -- Earthquake
  )),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(location_id, category)
);

-- ─────────────────────────────────────────────
-- ALERTS (log of all sent notifications)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source_url TEXT,                        -- Link to source article/data
  telegram_sent BOOLEAN DEFAULT FALSE,
  telegram_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own data
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own locations"
  ON public.locations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own location categories"
  ON public.location_categories FOR ALL
  USING (location_id IN (SELECT id FROM public.locations WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT USING (auth.uid() = user_id);

-- Service role (used by GitHub Actions scripts) can bypass RLS
-- This is handled automatically by using the SERVICE_KEY in scripts.

-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_location_id ON public.alerts(location_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_categories_location ON public.location_categories(location_id);
