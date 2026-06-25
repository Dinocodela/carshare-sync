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
  e.trip_idd,
  CASE
    WHEN NULLIF(BTRIM(e.guest_name), '') IS NULL THEN NULL
    ELSE UPPER(
      CONCAT(
        LEFT((regexp_split_to_array(BTRIM(e.guest_name), '\s+'))[1], 1),
        CASE
          WHEN array_length(regexp_split_to_array(BTRIM(e.guest_name), '\s+'), 1) > 1
            THEN LEFT((regexp_split_to_array(BTRIM(e.guest_name), '\s+'))[array_length(regexp_split_to_array(BTRIM(e.guest_name), '\s+'), 1)], 1)
          ELSE ''
        END
      )
    )
  END AS guest_initials
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