-- Fix the Blue Model Y 2022 to be properly hosted
-- Update the car to match the accepted request
UPDATE public.cars 
SET 
  host_id = '1bee30cc-abe2-484a-9a8a-f9199977a3ce',
  status = 'hosted',
  updated_at = now()
WHERE id = '2e5d626c-00ef-4265-aae3-3df4136d4741';