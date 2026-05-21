ALTER TABLE public.host_earnings
ADD COLUMN IF NOT EXISTS pickup_address text,
ADD COLUMN IF NOT EXISTS return_address text;