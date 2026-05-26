-- Remove broad shared-user SELECT policies that exposed guest PII (phone/email)
-- and financial details to viewer-level shared users on cars.
DROP POLICY IF EXISTS "Shared users can view earnings for shared cars" ON public.host_earnings;
DROP POLICY IF EXISTS "Shared users can view expenses for shared cars" ON public.host_expenses;