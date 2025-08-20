-- Fix critical security issues: Remove public access to sensitive personal data

-- 1. Remove the overly permissive policy on profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2. Create secure policies for profiles table that protect personal data
-- Policy 1: Users can view profiles of hosts managing their cars
CREATE POLICY "Clients can view their hosts' profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT c.client_id 
    FROM cars c 
    WHERE c.host_id = profiles.user_id
  )
);

-- Policy 2: Hosts can view profiles of clients whose cars they manage
CREATE POLICY "Hosts can view their clients' profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT c.host_id 
    FROM cars c 
    WHERE c.client_id = profiles.user_id
  )
);

-- Policy 3: Users can view profiles of people with shared car access
CREATE POLICY "Shared car access users can view related profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT ca.user_id 
    FROM car_access ca 
    JOIN cars c ON c.id = ca.car_id 
    WHERE c.client_id = profiles.user_id OR c.host_id = profiles.user_id
  ) OR
  profiles.user_id IN (
    SELECT ca.user_id 
    FROM car_access ca 
    JOIN cars c ON c.id = ca.car_id 
    WHERE c.client_id = auth.uid() OR c.host_id = auth.uid()
  )
);

-- Policy 4: Users involved in requests can view each other's profiles
CREATE POLICY "Request participants can view each other's profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT r.client_id 
    FROM requests r 
    WHERE r.host_id = profiles.user_id
  ) OR 
  auth.uid() IN (
    SELECT r.host_id 
    FROM requests r 
    WHERE r.client_id = profiles.user_id
  )
);

-- 3. Fix cars table security - remove public access and implement proper controls
DROP POLICY IF EXISTS "Users can view all cars" ON public.cars;

-- Create secure policies for cars table
CREATE POLICY "Car owners can view their cars" 
ON public.cars 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = host_id);

CREATE POLICY "Users with car access can view shared cars" 
ON public.cars 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT ca.user_id 
    FROM car_access ca 
    WHERE ca.car_id = cars.id
  )
);

CREATE POLICY "Users involved in requests can view related cars" 
ON public.cars 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT r.client_id 
    FROM requests r 
    WHERE r.car_id = cars.id
  ) OR 
  auth.uid() IN (
    SELECT r.host_id 
    FROM requests r 
    WHERE r.car_id = cars.id
  )
);