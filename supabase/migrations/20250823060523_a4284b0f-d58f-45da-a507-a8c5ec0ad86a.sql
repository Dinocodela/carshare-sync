-- Drop the problematic view
DROP VIEW IF EXISTS public.car_earnings_summary;

-- Drop the overly permissive policy that exposes detailed financial data
DROP POLICY IF EXISTS "Car owners and hosts can view earnings" ON public.host_earnings;

-- Create highly restrictive policy - ONLY hosts can see their own detailed earnings
CREATE POLICY "Hosts can view only their own earnings" 
ON public.host_earnings 
FOR SELECT 
USING (auth.uid() = host_id);

-- Create security definer function for car owners to get limited summary data
CREATE OR REPLACE FUNCTION public.get_car_earnings_summary(p_car_id uuid)
RETURNS TABLE (
  car_id uuid,
  total_trips bigint,
  total_owner_earnings numeric,
  last_earning_date date,
  pending_earnings_count bigint
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Verify the requesting user owns this car
  IF NOT EXISTS (
    SELECT 1 FROM cars c 
    WHERE c.id = p_car_id AND c.client_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to car earnings data';
  END IF;
  
  -- Return only aggregate summary data, no sensitive details
  RETURN QUERY
  SELECT 
    p_car_id as car_id,
    COUNT(*)::bigint as total_trips,
    COALESCE(SUM(he.client_profit_amount), 0) as total_owner_earnings,
    MAX(he.earning_period_end::date) as last_earning_date,
    COUNT(CASE WHEN he.payment_status = 'pending' THEN 1 END)::bigint as pending_earnings_count
  FROM host_earnings he
  WHERE he.car_id = p_car_id;
END;
$$;