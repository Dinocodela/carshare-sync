-- Drop the trigger first (if it exists)
DROP TRIGGER IF EXISTS set_earning_period_date_int_trigger ON public.host_earnings;

-- Drop the function
DROP FUNCTION IF EXISTS public.set_earning_period_date_int();

-- Remove the column
ALTER TABLE public.host_earnings DROP COLUMN IF EXISTS earning_period_date_int;