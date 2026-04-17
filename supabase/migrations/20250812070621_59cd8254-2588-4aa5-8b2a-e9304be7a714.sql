-- Add Turo-related fields to profiles for host integrations
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS turo_profile_url text,
  ADD COLUMN IF NOT EXISTS turo_reviews_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS turo_last_synced timestamp with time zone;