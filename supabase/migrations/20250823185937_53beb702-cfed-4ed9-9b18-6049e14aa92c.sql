-- Add missing RLS policies for host car access and client earnings visibility

-- Allow hosts to view cars they are hosting
CREATE POLICY "Hosts can view cars they are hosting" 
ON public.cars 
FOR SELECT 
USING (auth.uid() = host_id);

-- Allow clients to view earnings data for their cars (through the secure function)
CREATE POLICY "Clients can view earnings for their cars" 
ON public.host_earnings 
FOR SELECT 
USING (auth.uid() IN (
  SELECT client_id FROM cars WHERE id = host_earnings.car_id
));

-- Allow shared access users to view cars shared with them
CREATE POLICY "Shared users can view shared cars" 
ON public.cars 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM car_access WHERE car_id = cars.id
));