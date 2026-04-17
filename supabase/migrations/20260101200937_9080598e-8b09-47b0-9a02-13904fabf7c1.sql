-- Add is_paid column to host_claims table
ALTER TABLE public.host_claims
ADD COLUMN is_paid boolean NOT NULL DEFAULT false;