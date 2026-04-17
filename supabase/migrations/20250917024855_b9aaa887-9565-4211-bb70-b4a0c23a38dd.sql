-- Fix data inconsistency for Blue Model Y 2022
-- Update the car to be properly hosted by the correct user
UPDATE public.cars 
SET 
  host_id = '6951eaa2-1264-4a1a-a86d-817e462202c7',
  status = 'hosted',
  updated_at = now()
WHERE id = '2e5d626c-00ef-4265-aae3-3df4136d4741';

-- Update the request to have the correct host_id
UPDATE public.requests 
SET 
  host_id = '6951eaa2-1264-4a1a-a86d-817e462202c7',
  updated_at = now()
WHERE car_id = '2e5d626c-00ef-4265-aae3-3df4136d4741' 
AND status = 'accepted';