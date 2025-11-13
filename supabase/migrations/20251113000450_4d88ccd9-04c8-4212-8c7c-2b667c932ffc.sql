-- Fix search_path for ensure_unsubscribe_token function
DROP FUNCTION IF EXISTS public.ensure_unsubscribe_token() CASCADE;

CREATE OR REPLACE FUNCTION public.ensure_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER ensure_unsubscribe_token_trigger
BEFORE INSERT OR UPDATE ON public.newsletter_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.ensure_unsubscribe_token();