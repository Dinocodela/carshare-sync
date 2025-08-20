-- Double-check and ensure all shared access to financial data is properly restricted

-- First, let's see what policies currently exist for host_earnings
-- (this is just for verification, the actual changes are below)

-- Ensure that ONLY car owners and hosts can access financial earnings data
-- Remove any remaining shared access policies
DROP POLICY IF EXISTS "Shared users can view earnings for shared cars" ON public.host_earnings;

-- Make sure the core financial access policy is correctly restrictive
DROP POLICY IF EXISTS "Hosts and clients can view earnings for their cars" ON public.host_earnings;

-- Recreate with explicit restrictions - only direct stakeholders
CREATE POLICY "Car owners and hosts can view earnings" 
ON public.host_earnings 
FOR SELECT 
USING (
  -- Host who earned the money
  auth.uid() = host_id 
  OR 
  -- Car owner whose car generated the earnings
  auth.uid() IN (
    SELECT c.client_id 
    FROM cars c 
    WHERE c.id = host_earnings.car_id
  )
);

-- Ensure similar restrictions apply to other financial/sensitive tables
-- Let's also check host_expenses table
DROP POLICY IF EXISTS "Shared users can view expenses for shared cars" ON public.host_expenses;

-- Remove shared access from client_car_expenses too  
DROP POLICY IF EXISTS "Shared users can view client car expenses for shared cars" ON public.client_car_expenses;

-- Remove shared access from claims data
DROP POLICY IF EXISTS "Shared users can view claims for shared cars" ON public.host_claims;