-- Create a secure view for car owners with limited financial visibility
CREATE OR REPLACE VIEW public.car_earnings_summary AS
SELECT 
  he.car_id,
  COUNT(*) as total_trips,
  SUM(he.client_profit_amount) as total_owner_earnings,
  DATE_TRUNC('month', he.earning_period_start) as earnings_month,
  COUNT(CASE WHEN he.payment_status = 'paid' THEN 1 END) as paid_trips,
  COUNT(CASE WHEN he.payment_status = 'pending' THEN 1 END) as pending_trips
FROM host_earnings he
GROUP BY he.car_id, DATE_TRUNC('month', he.earning_period_start);

-- Enable RLS on the summary view
ALTER VIEW public.car_earnings_summary SET (security_barrier = true);

-- Drop the overly permissive policy that exposes detailed financial data
DROP POLICY IF EXISTS "Car owners and hosts can view earnings" ON public.host_earnings;

-- Create restrictive policy - only hosts can see their detailed earnings
CREATE POLICY "Hosts can view their own earnings only" 
ON public.host_earnings 
FOR SELECT 
USING (auth.uid() = host_id);

-- Keep existing policies for hosts to manage their earnings
-- (INSERT, UPDATE, DELETE policies remain unchanged as they already restrict to host_id)

-- Create policy for car owners to see only summary data through the view
CREATE POLICY "Car owners can view earnings summaries" 
ON public.car_earnings_summary 
FOR SELECT 
USING (car_id IN (
  SELECT id FROM public.cars 
  WHERE client_id = auth.uid()
));