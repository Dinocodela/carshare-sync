-- Update car status to include missing statuses for complete workflow
-- First, check if we need to create a custom type or if it's just a text field with default
-- Add the missing statuses: ready_for_return and completed

-- Since cars.status is currently just text, we don't need to modify an enum
-- The existing code already uses these statuses, so this is mainly documentation
-- But let's add a check constraint to ensure only valid statuses are used

ALTER TABLE public.cars 
DROP CONSTRAINT IF EXISTS cars_status_check;

ALTER TABLE public.cars 
ADD CONSTRAINT cars_status_check 
CHECK (status IN ('available', 'pending', 'hosted', 'ready_for_return', 'completed'));