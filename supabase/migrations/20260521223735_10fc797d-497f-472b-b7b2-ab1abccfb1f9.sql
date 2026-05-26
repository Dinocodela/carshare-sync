CREATE OR REPLACE FUNCTION public.get_host_expenses_page(
  p_car_id uuid DEFAULT NULL,
  p_payment_source text DEFAULT NULL,
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL,
  p_trip_search text DEFAULT NULL,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
) RETURNS jsonb
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

  WITH source_trip_ids AS (
    SELECT DISTINCT trip_id
    FROM public.host_earnings
    WHERE host_id = v_user
      AND p_payment_source IS NOT NULL
      AND payment_source = p_payment_source
      AND trip_id IS NOT NULL
  ),
  filtered AS (
    SELECT e.*
    FROM public.host_expenses e
    WHERE e.host_id = v_user
      AND (p_car_id IS NULL OR e.car_id = p_car_id)
      AND (p_date_from IS NULL OR e.expense_date >= p_date_from)
      AND (p_date_to IS NULL OR e.expense_date <= p_date_to)
      AND (p_trip_search IS NULL OR e.trip_id ILIKE '%' || p_trip_search || '%')
      AND (
        p_payment_source IS NULL
        OR (e.trip_id IS NOT NULL AND e.trip_id IN (SELECT trip_id FROM source_trip_ids))
      )
  ),
  page_rows AS (
    SELECT * FROM filtered
    ORDER BY expense_date DESC, created_at DESC
    LIMIT p_limit OFFSET p_offset
  ),
  totals AS (
    SELECT
      COALESCE(SUM(
        COALESCE(amount,0) + COALESCE(toll_cost,0) + COALESCE(delivery_cost,0)
        + COALESCE(ev_charge_cost,0) + COALESCE(carwash_cost,0)
      ), 0) AS total_all,
      COALESCE(SUM(
        CASE WHEN date_trunc('month', expense_date) = date_trunc('month', now())
          THEN COALESCE(amount,0) + COALESCE(toll_cost,0) + COALESCE(delivery_cost,0)
               + COALESCE(ev_charge_cost,0) + COALESCE(carwash_cost,0)
          ELSE 0 END
      ), 0) AS total_this_month,
      count(*) AS total_count
    FROM filtered
  )
  SELECT jsonb_build_object(
    'rows', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.expense_date DESC, p.created_at DESC) FROM page_rows p), '[]'::jsonb),
    'total_count', (SELECT total_count FROM totals),
    'total_amount', (SELECT total_all FROM totals),
    'total_this_month', (SELECT total_this_month FROM totals)
  ) INTO v_result;

  RETURN v_result;
END;
$$;