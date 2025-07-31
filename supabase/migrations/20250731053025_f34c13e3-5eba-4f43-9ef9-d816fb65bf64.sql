-- Add phone number to profiles table (required field)
ALTER TABLE public.profiles 
ADD COLUMN phone text NOT NULL DEFAULT '';

-- Update the default to NULL after adding the column
ALTER TABLE public.profiles 
ALTER COLUMN phone DROP DEFAULT;