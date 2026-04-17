-- Fix profile where last_name is null but first_name exists
UPDATE public.profiles 
SET last_name = 'Cuevas'
WHERE user_id = '4aeced9e-f510-459c-9a1f-3be0612ec0bd' 
  AND first_name = 'walter' 
  AND last_name IS NULL;