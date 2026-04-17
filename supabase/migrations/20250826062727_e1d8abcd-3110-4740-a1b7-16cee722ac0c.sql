-- Add RLS policies for shared access users to view analytics data

-- Update host_earnings policies to include shared access users
CREATE POLICY "Shared users can view earnings for shared cars" 
ON host_earnings 
FOR SELECT 
USING (auth.uid() IN (
  SELECT car_access.user_id 
  FROM car_access 
  WHERE car_access.car_id = host_earnings.car_id
));

-- Update host_expenses policies to include shared access users  
CREATE POLICY "Shared users can view expenses for shared cars"
ON host_expenses
FOR SELECT
USING (auth.uid() IN (
  SELECT car_access.user_id
  FROM car_access
  WHERE car_access.car_id = host_expenses.car_id
));

-- Update host_claims policies to include shared access users
CREATE POLICY "Shared users can view claims for shared cars"
ON host_claims
FOR SELECT  
USING (auth.uid() IN (
  SELECT car_access.user_id
  FROM car_access
  WHERE car_access.car_id = host_claims.car_id
));