-- Fix financial data security: Remove shared car access to earnings data

-- Remove the overly permissive policy that allows shared car access users to view earnings
DROP POLICY IF EXISTS "Shared users can view earnings for shared cars" ON public.host_earnings;

-- The remaining policies already provide appropriate access:
-- 1. "Hosts can view/create/update/delete their own earnings" (host_id = auth.uid())
-- 2. "Hosts and clients can view earnings for their cars" (car owners can see earnings for their cars)
-- This ensures only the host who earned the money and the car owner can see financial data

-- Let's also tighten the cars-related access to be more specific about financial vs operational data
-- But we'll keep the existing "Hosts and clients can view earnings for their cars" policy as it's appropriate