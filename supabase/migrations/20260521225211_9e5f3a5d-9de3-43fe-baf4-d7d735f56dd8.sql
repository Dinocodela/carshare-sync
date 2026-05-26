CREATE OR REPLACE FUNCTION public.get_host_claims_page(
  p_car_id uuid DEFAULT NULL,
  p_claim_status text DEFAULT NULL,
  p_claim_type text DEFAULT NULL,
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
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

  WITH filtered AS (
    SELECT *
    FROM public.host_claims
    WHERE host_id = v_user
      AND (p_car_id IS NULL OR car_id = p_car_id)
      AND (p_claim_status IS NULL OR claim_status = p_claim_status)
      AND (p_claim_type IS NULL OR claim_type = p_claim_type)
      AND (p_date_from IS NULL OR incident_date >= p_date_from)
      AND (p_date_to IS NULL OR incident_date <= p_date_to)
  ),
  page_rows AS (
    SELECT * FROM filtered
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset
  ),
  unfiltered AS (
    SELECT claim_type, claim_status, claim_amount, is_paid
    FROM public.host_claims
    WHERE host_id = v_user
  )
  SELECT jsonb_build_object(
    'rows', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC) FROM page_rows p), '[]'::jsonb),
    'total_count', (SELECT count(*) FROM filtered),
    'all_count', (SELECT count(*) FROM unfiltered),
    'pending_count', (SELECT count(*) FROM unfiltered WHERE claim_status = 'pending'),
    'approved_count', (SELECT count(*) FROM unfiltered WHERE claim_status = 'approved'),
    'total_amount', (SELECT COALESCE(SUM(claim_amount),0) FROM unfiltered),
    'paid_amount', (SELECT COALESCE(SUM(claim_amount),0) FROM unfiltered WHERE is_paid = true),
    'claim_types', COALESCE((SELECT jsonb_agg(DISTINCT claim_type) FROM unfiltered WHERE claim_type IS NOT NULL), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;