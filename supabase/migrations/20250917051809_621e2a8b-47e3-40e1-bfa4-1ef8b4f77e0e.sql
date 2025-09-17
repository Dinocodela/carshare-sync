-- Switch user from host to client role
UPDATE public.profiles 
SET role = 'client', 
    updated_at = now()
WHERE user_id = 'ed05e222-869c-4967-ad98-4f9aeae38a09';