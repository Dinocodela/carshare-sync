-- Ensure the status constraint is properly applied for car status validation
-- Drop existing constraint if it exists and recreate it
ALTER TABLE public.cars 
DROP CONSTRAINT IF EXISTS cars_status_check;

-- Add the status constraint to ensure only valid statuses are used
ALTER TABLE public.cars 
ADD CONSTRAINT cars_status_check 
CHECK (status IN ('available', 'pending', 'hosted', 'ready_for_return', 'completed'));