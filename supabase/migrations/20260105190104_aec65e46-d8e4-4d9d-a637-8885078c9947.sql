-- Add guest contact info columns to host_earnings
ALTER TABLE public.host_earnings ADD COLUMN IF NOT EXISTS guest_phone text;
ALTER TABLE public.host_earnings ADD COLUMN IF NOT EXISTS guest_email text;