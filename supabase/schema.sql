-- ==============================================================================
-- CONTROL X — SUPABASE DATABASE SCHEMA MIGRATION
-- Migration: Create Profiles Table, RLS Policies, and User Sync Trigger
-- ==============================================================================

-- 1. Create the `profiles` table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'client', 'creator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Security Policies
-- Policy: Allow users to view only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 4. Automatically create a profile row whenever a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper timestamp auto-update trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- contact_messages — Public Inquiry Form Storage
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including unauthenticated visitors) to INSERT a new inquiry
CREATE POLICY "Public can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can SELECT contact messages
-- (Replace 'admin' with your actual admin role check as needed)
CREATE POLICY "Authenticated users can read contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Speed up admin inbox queries sorted by newest first
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON public.contact_messages (created_at DESC);

-- ==============================================================================
-- projects — Portfolio CMS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT NOT NULL,
  image_url    TEXT NOT NULL,
  live_url     TEXT,
  tag_line     TEXT NOT NULL DEFAULT '',  -- e.g. "AURA · Fall/Winter Collection"
  sort_order   SMALLINT NOT NULL DEFAULT 0,  -- controls display order (lower = first)
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public visitors can view published projects only
CREATE POLICY "Public can view published projects"
  ON public.projects
  FOR SELECT
  USING (is_published = true);

-- Speed up ordered public queries
CREATE INDEX IF NOT EXISTS projects_sort_order_idx
  ON public.projects (sort_order ASC, created_at DESC);

-- ==============================================================================
-- bookings — Fault-Tolerant Payment & Consultation State Machine
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idempotency_key UUID UNIQUE NOT NULL,
  cashfree_order_id TEXT UNIQUE,
  service_name TEXT NOT NULL DEFAULT '1-Hour Executive Consultation',
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'confirmed', 'failed', 'cancelled', 'refunded')),
  email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own bookings
CREATE POLICY "Users can insert own bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users / server client can update own bookings
CREATE POLICY "Users can update own bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update the updated_at timestamp on status changes
DROP TRIGGER IF EXISTS handle_bookings_updated_at ON public.bookings;
CREATE TRIGGER handle_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indices for performance
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_idempotency_key_idx ON public.bookings (idempotency_key);
CREATE INDEX IF NOT EXISTS bookings_cashfree_order_id_idx ON public.bookings (cashfree_order_id);

-- Enforce "One Active Booking" per user per service (ignoring Completed / Cancelled bookings)
DROP INDEX IF EXISTS idx_one_active_booking;
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_booking 
ON public.bookings (user_id, service_name) 
WHERE status IN ('draft', 'pending_payment', 'confirmed')
  AND (booking_status IS NULL OR booking_status NOT IN ('Completed', 'Cancelled'));

-- ==============================================================================
-- CRM EXTENSION — INSTRUCTION BLOCK 29 & 36
-- Run this entire block in Supabase SQL Editor
-- ==============================================================================

-- ── CRM Columns on contact_messages ───────────────────────────────────────────
ALTER TABLE public.contact_messages 
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ── CRM Columns on bookings ───────────────────────────────────────────────────
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'Not Contacted',
  ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'Confirmed',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Safely ensure constraint allows all contact status values
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_contact_status_check;
ALTER TABLE public.bookings 
  ADD CONSTRAINT bookings_contact_status_check 
  CHECK (contact_status IN ('Pending', 'Not Contacted', 'Contacted', 'No Response', 'Callback Required'));

-- Safely ensure booking status constraint allows operational statuses
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;
ALTER TABLE public.bookings 
  ADD CONSTRAINT bookings_booking_status_check 
  CHECK (booking_status IN ('Confirmed', 'Completed', 'Cancelled'));

-- ── Audit Trail ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.booking_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  action     TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  note       TEXT,
  admin_id   UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.booking_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view booking history"
  ON public.booking_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert booking history"
  ON public.booking_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS booking_history_booking_id_idx
  ON public.booking_history (booking_id, created_at DESC);

-- ── Customer Blocks (multi-identifier abuse prevention) ───────────────────────
CREATE TABLE IF NOT EXISTS public.customer_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  reason      TEXT NOT NULL,
  blocked_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocks"
  ON public.customer_blocks FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS customer_blocks_user_id_idx  ON public.customer_blocks (user_id);
CREATE INDEX IF NOT EXISTS customer_blocks_email_idx    ON public.customer_blocks (email);
CREATE INDEX IF NOT EXISTS customer_blocks_phone_idx    ON public.customer_blocks (phone);
CREATE INDEX IF NOT EXISTS customer_blocks_ip_idx       ON public.customer_blocks (ip_address);
