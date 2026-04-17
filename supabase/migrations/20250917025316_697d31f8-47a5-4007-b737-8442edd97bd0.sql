-- Add missing guest_name column to host_claims table
ALTER TABLE public.host_claims 
ADD COLUMN IF NOT EXISTS guest_name TEXT;