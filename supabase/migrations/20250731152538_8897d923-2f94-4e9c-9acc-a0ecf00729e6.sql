-- Fix RLS policy for car updates to allow hosts to clear associations during car return
-- Drop the existing update policy
DROP POLICY IF EXISTS "Car owners can update their cars" ON public.cars;

-- Create new update policy that allows hosts to clear associations when returning cars
CREATE POLICY "Car owners can update their cars" ON public.cars
FOR UPDATE USING (
  -- Allow if user is current client or host
  (auth.uid() = client_id OR auth.uid() = host_id)
  OR 
  -- Allow if user is the host and updating status to available (car return)
  (auth.uid() = host_id AND status = 'available')
);