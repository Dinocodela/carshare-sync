DROP FUNCTION IF EXISTS public.get_host_claims_page(
  p_car_id uuid,
  p_claim_status text,
  p_claim_type text,
  p_date_from date,
  p_date_to date,
  p_limit integer,
  p_offset integer
);