-- Update earning_period_start and earning_period_end columns to timestamp with time zone
-- This allows storing both date and time information for more precise rental periods

ALTER TABLE public.host_earnings 
ALTER COLUMN earning_period_start TYPE timestamp with time zone 
USING earning_period_start::timestamp with time zone;

ALTER TABLE public.host_earnings 
ALTER COLUMN earning_period_end TYPE timestamp with time zone 
USING earning_period_end::timestamp with time zone;