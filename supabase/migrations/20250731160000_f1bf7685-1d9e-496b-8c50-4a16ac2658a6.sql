-- Create missing client profile for existing user
INSERT INTO public.profiles (user_id, role, first_name, last_name, phone)
VALUES (
  'ae7f8f2b-2b58-48b6-b9b4-45941c52ec73',
  'client',
  'Client',
  'User', 
  ''
)
ON CONFLICT (user_id) DO NOTHING;