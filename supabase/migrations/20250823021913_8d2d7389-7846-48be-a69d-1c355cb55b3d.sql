-- Fix infinite recursion in RLS policies by removing circular dependencies

-- Drop existing problematic policies for cars table
DROP POLICY IF EXISTS "Car owners can view their cars" ON cars;
DROP POLICY IF EXISTS "Users involved in requests can view related cars" ON cars;  
DROP POLICY IF EXISTS "Users with car access can view shared cars" ON cars;

-- Drop existing problematic policies for car_access table
DROP POLICY IF EXISTS "Users can view car access they are involved in or owners" ON car_access;

-- Create new non-recursive policies for cars table
CREATE POLICY "Car owners and hosts can view their cars" 
ON cars FOR SELECT 
USING ((auth.uid() = client_id) OR (auth.uid() = host_id));

CREATE POLICY "Users involved in requests can view related cars" 
ON cars FOR SELECT 
USING (
  (auth.uid() IN (SELECT r.client_id FROM requests r WHERE r.car_id = cars.id)) 
  OR 
  (auth.uid() IN (SELECT r.host_id FROM requests r WHERE r.car_id = cars.id))
);

CREATE POLICY "Users with shared access can view cars" 
ON cars FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM car_access ca 
    WHERE ca.car_id = cars.id 
    AND ca.user_id = auth.uid()
  )
);

-- Create new non-recursive policies for car_access table  
CREATE POLICY "Users can view their own car access records" 
ON car_access FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = granted_by);

CREATE POLICY "Car owners can view access records for their cars"
ON car_access FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cars c 
    WHERE c.id = car_access.car_id 
    AND c.client_id = auth.uid()
  )
);