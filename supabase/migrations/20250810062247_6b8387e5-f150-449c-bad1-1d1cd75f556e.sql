-- Drop overloaded date-only versions to remove RPC ambiguity
DROP FUNCTION IF EXISTS public.get_conflicting_earnings(uuid, date, date);
DROP FUNCTION IF EXISTS public.check_earning_date_conflicts(uuid, date, date, uuid);
