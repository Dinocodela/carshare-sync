-- ============================================================
-- Finding 1: cars VIN / license plate exposure to requesters
-- Remove the overly-permissive UPDATE policy that allowed any user
-- with a pending request to read/update (and RETURNING-expose) car
-- rows including vin_number and license_plate. Request acceptance is
-- handled by the SECURITY DEFINER accept_hosting_request() function.
-- ============================================================
DROP POLICY IF EXISTS "Hosts can update cars when accepting requests" ON public.cars;

-- ============================================================
-- Finding 2: host_earnings guest PII exposure to clients
-- Remove direct client access to the base table (which exposes
-- guest_name, pickup_address, return_address) and replace it with a
-- privacy-safe view that excludes those PII columns.
-- ============================================================
DROP POLICY IF EXISTS "Clients can view earnings for their cars" ON public.host_earnings;

DROP VIEW IF EXISTS public.client_visible_earnings;
CREATE VIEW public.client_visible_earnings
WITH (security_invoker = off) AS
SELECT
  e.id,
  e.host_id,
  e.car_id,
  e.booking_id,
  e.amount,
  e.commission,
  e.net_amount,
  e.earning_type,
  e.payment_status,
  e.payment_date,
  e.earning_period_start,
  e.earning_period_end,
  e.created_at,
  e.updated_at,
  e.gross_earnings,
  e.client_profit_percentage,
  e.host_profit_percentage,
  e.payment_source,
  e.date_paid,
  e.trip_id,
  e.trip_idd
FROM public.host_earnings e
WHERE e.car_id IN (
        SELECT c.id FROM public.cars c WHERE c.client_id = auth.uid()
      )
   OR e.car_id IN (
        SELECT ca.car_id FROM public.car_access ca WHERE ca.user_id = auth.uid()
      );

REVOKE ALL ON public.client_visible_earnings FROM anon;
GRANT SELECT ON public.client_visible_earnings TO authenticated;
GRANT ALL ON public.client_visible_earnings TO service_role;

-- ============================================================
-- Finding 3: user_roles self-insert / privilege escalation
-- Remove write/grant access from anon and authenticated so no user
-- can self-insert a role row. Only super admins (via RLS policy) and
-- service_role can manage roles.
-- ============================================================
REVOKE ALL ON public.user_roles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;