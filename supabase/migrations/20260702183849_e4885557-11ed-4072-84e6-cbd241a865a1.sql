-- Add optional break_down JSON to host_earnings for detailed rental price disclosure
ALTER TABLE public.host_earnings
  ADD COLUMN IF NOT EXISTS break_down jsonb DEFAULT NULL;

-- Recreate the client-facing view to expose break_down (privacy-safe: no guest PII)
DROP VIEW public.client_visible_earnings;
CREATE VIEW public.client_visible_earnings
WITH (security_invoker = on) AS
SELECT id,
    host_id,
    car_id,
    booking_id,
    amount,
    commission,
    net_amount,
    earning_type,
    payment_status,
    payment_date,
    earning_period_start,
    earning_period_end,
    created_at,
    updated_at,
    gross_earnings,
    client_profit_percentage,
    host_profit_percentage,
    payment_source,
    date_paid,
    trip_id,
    trip_idd,
    daily_rate,
    nights,
    break_down,
        CASE
            WHEN NULLIF(btrim(guest_name), ''::text) IS NULL THEN NULL::text
            ELSE upper(concat("left"((regexp_split_to_array(btrim(guest_name), '\s+'::text))[1], 1),
            CASE
                WHEN array_length(regexp_split_to_array(btrim(guest_name), '\s+'::text), 1) > 1 THEN "left"((regexp_split_to_array(btrim(guest_name), '\s+'::text))[array_length(regexp_split_to_array(btrim(guest_name), '\s+'::text), 1)], 1)
                ELSE ''::text
            END))
        END AS guest_initials,
    pickup_address,
    return_address,
    delivery_address
   FROM host_earnings e
  WHERE (car_id IN ( SELECT c.id
           FROM cars c
          WHERE c.client_id = auth.uid())) OR (car_id IN ( SELECT ca.car_id
           FROM car_access ca
          WHERE ca.user_id = auth.uid()));

REVOKE ALL ON public.client_visible_earnings FROM anon;
GRANT SELECT ON public.client_visible_earnings TO authenticated;
GRANT ALL ON public.client_visible_earnings TO service_role;