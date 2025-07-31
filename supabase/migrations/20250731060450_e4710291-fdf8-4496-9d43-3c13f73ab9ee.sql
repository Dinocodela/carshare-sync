-- Check what the current status constraint allows
-- First let's see the current constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'cars_status_check';