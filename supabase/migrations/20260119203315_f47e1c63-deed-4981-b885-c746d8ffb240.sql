-- Drop the trigger function with CASCADE to remove all dependent triggers
DROP FUNCTION IF EXISTS public.validate_earning_dates() CASCADE;

-- Also drop the helper functions for conflict checking
DROP FUNCTION IF EXISTS public.check_earning_date_conflicts(uuid, timestamp with time zone, timestamp with time zone, uuid);
DROP FUNCTION IF EXISTS public.get_conflicting_earnings(uuid, timestamp with time zone, timestamp with time zone);