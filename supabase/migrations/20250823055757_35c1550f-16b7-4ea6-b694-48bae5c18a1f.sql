-- Fix security definer function search path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix car_access policies that are causing infinite recursion
DROP POLICY IF EXISTS "Car owners can view access records for their cars" ON public.car_access;
DROP POLICY IF EXISTS "Users can view their own car access records" ON public.car_access;

-- Create non-recursive policies for car_access
CREATE POLICY "Users can view access records for their own cars" 
ON public.car_access 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Car owners can view access records" 
ON public.car_access 
FOR SELECT 
USING (granted_by = auth.uid());

-- Fix profiles policies to avoid recursion
DROP POLICY IF EXISTS "Shared car access users can view related profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());