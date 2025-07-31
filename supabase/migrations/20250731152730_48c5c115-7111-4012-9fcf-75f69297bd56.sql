-- Fix RLS policy for car updates to properly handle car returns
-- Drop the existing update policy
DROP POLICY IF EXISTS "Car owners can update their cars" ON public.cars;

-- Create new update policy that allows car returns
CREATE POLICY "Car owners can update their cars" ON public.cars
FOR UPDATE USING (
  -- Allow if user is current client or host
  auth.uid() = client_id OR auth.uid() = host_id
);