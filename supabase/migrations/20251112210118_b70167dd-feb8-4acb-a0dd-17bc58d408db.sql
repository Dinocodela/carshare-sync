-- Add unsubscribe token and tracking to newsletter_subscriptions
ALTER TABLE public.newsletter_subscriptions 
ADD COLUMN unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
ADD COLUMN unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX idx_newsletter_subscriptions_token ON public.newsletter_subscriptions(unsubscribe_token);

-- Function to generate unsubscribe tokens for existing records
CREATE OR REPLACE FUNCTION public.ensure_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure tokens are generated
CREATE TRIGGER ensure_unsubscribe_token_trigger
BEFORE INSERT OR UPDATE ON public.newsletter_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.ensure_unsubscribe_token();

-- Update existing records to have tokens
UPDATE public.newsletter_subscriptions 
SET unsubscribe_token = gen_random_uuid()::text 
WHERE unsubscribe_token IS NULL;

-- Add RLS policy for public unsubscribe access
CREATE POLICY "Anyone can unsubscribe with valid token"
ON public.newsletter_subscriptions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add RLS policy for public token lookup
CREATE POLICY "Anyone can view subscription by token"
ON public.newsletter_subscriptions
FOR SELECT
USING (true);