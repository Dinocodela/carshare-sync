
-- Drop the existing host visibility policy and recreate it properly
DROP POLICY IF EXISTS "Anyone can view host profiles" ON public.profiles;

-- Create a proper policy for viewing host profiles
-- This allows any authenticated user to view profiles where role = 'host' AND account_status = 'approved'
CREATE POLICY "Authenticated users can view approved host profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'host' AND account_status = 'approved');
