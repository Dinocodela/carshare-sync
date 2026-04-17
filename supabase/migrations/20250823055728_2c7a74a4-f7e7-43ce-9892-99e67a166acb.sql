-- Create security definer function to get current user role without RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies that might cause recursion
DROP POLICY IF EXISTS "Car owners and hosts can view their cars" ON public.cars;
DROP POLICY IF EXISTS "Users involved in requests can view related cars" ON public.cars;
DROP POLICY IF EXISTS "Users with shared access can view cars" ON public.cars;
DROP POLICY IF EXISTS "Car owners and hosts with requests can update cars" ON public.cars;

-- Create new non-recursive policies for cars table
CREATE POLICY "Car owners can view their cars" 
ON public.cars 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Car hosts can view their cars" 
ON public.cars 
FOR SELECT 
USING (auth.uid() = host_id);

CREATE POLICY "Users with car access can view shared cars" 
ON public.cars 
FOR SELECT 
USING (id IN (
  SELECT car_id FROM public.car_access 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Car owners can update their cars" 
ON public.cars 
FOR UPDATE 
USING (auth.uid() = client_id);

CREATE POLICY "Car hosts can update their cars" 
ON public.cars 
FOR UPDATE 
USING (auth.uid() = host_id);