-- Fix RLS policy to allow hosts to update cars when accepting hosting requests
DROP POLICY IF EXISTS "Car owners can update their cars" ON public.cars;

CREATE POLICY "Car owners and hosts with requests can update cars" 
ON public.cars 
FOR UPDATE 
USING (
  (auth.uid() = client_id) 
  OR (auth.uid() = host_id) 
  OR EXISTS (
    SELECT 1 FROM public.requests 
    WHERE car_id = cars.id 
    AND host_id = auth.uid() 
    AND status IN ('pending', 'accepted')
  )
);