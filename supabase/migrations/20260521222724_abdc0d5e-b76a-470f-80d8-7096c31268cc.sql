CREATE OR REPLACE FUNCTION public.get_host_earnings_page(
  p_car_id uuid DEFAULT NULL,
  p_payment_source text DEFAULT NULL,
  p_payment_status text DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_trip_search text DEFAULT NULL,
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_result jsonb;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  WITH exp_sums AS (
    SELECT trip_id,
           SUM(
             COALESCE(amount,0) + COALESCE(toll_cost,0) + COALESCE(delivery_cost,0)
             + COALESCE(ev_charge_cost,0) + COALESCE(carwash_cost,0)
           ) AS total
    FROM public.host_expenses
    WHERE host_id = v_user AND trip_id IS NOT NULL
    GROUP BY trip_id
  ),
  filtered AS (
    SELECT e.*, COALESCE(s.total, 0) AS trip_expenses
    FROM public.host_earnings e
    LEFT JOIN exp_sums s ON s.trip_id = e.trip_id
    WHERE e.host_id = v_user
      AND (p_car_id IS NULL OR e.car_id = p_car_id)
      AND (p_payment_source IS NULL OR e.payment_source = p_payment_source)
      AND (p_payment_status IS NULL OR e.payment_status = p_payment_status)
      AND (p_date_from IS NULL OR e.earning_period_start >= p_date_from)
      AND (p_date_to IS NULL OR e.earning_period_start <= p_date_to)
      AND (
        p_trip_search IS NULL
        OR e.trip_id ILIKE '%' || p_trip_search || '%'
        OR e.trip_idd ILIKE '%' || p_trip_search || '%'
        OR e.guest_name ILIKE '%' || p_trip_search || '%'
      )
  ),
  page_rows AS (
    SELECT * FROM filtered
    ORDER BY earning_period_start DESC
    LIMIT p_limit OFFSET p_offset
  ),
  contact AS (
    SELECT c.earning_id, c.guest_email, c.guest_phone
    FROM public.host_earnings_guest_contact c
    WHERE c.earning_id IN (SELECT id FROM page_rows)
  ),
  page_with_contact AS (
    SELECT pr.*, ct.guest_email, ct.guest_phone
    FROM page_rows pr
    LEFT JOIN contact ct ON ct.earning_id = pr.id
  ),
  related_expenses AS (
    SELECT trip_id, amount, toll_cost, delivery_cost, ev_charge_cost, carwash_cost, expense_type, expense_date, id
    FROM public.host_expenses
    WHERE host_id = v_user
      AND trip_id IN (SELECT trip_id FROM page_rows WHERE trip_id IS NOT NULL)
  )
  SELECT jsonb_build_object(
    'rows', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.earning_period_start DESC) FROM page_with_contact p), '[]'::jsonb),
    'related_expenses', COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM related_expenses r), '[]'::jsonb),
    'total_count', (SELECT count(*) FROM filtered),
    'total_net', (SELECT COALESCE(SUM(amount - trip_expenses), 0) FROM filtered),
    'pending_net', (SELECT COALESCE(SUM(amount - trip_expenses), 0) FROM filtered WHERE payment_status = 'pending'),
    'this_month_net', (
      SELECT COALESCE(SUM(amount - trip_expenses), 0) FROM filtered
      WHERE date_trunc('month', earning_period_start) = date_trunc('month', now())
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_host_earnings_page(uuid, text, text, timestamptz, timestamptz, text, int, int) TO authenticated;