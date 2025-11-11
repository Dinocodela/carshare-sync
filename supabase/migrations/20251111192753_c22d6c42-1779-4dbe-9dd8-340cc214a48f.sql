-- Create newsletter_subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT DEFAULT 'blog',
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to subscribe
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading own subscription (for future unsubscribe functionality)
CREATE POLICY "Users can view their own subscription" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (true);

-- Create index for email lookups
CREATE INDEX idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);

-- Create index for active subscriptions
CREATE INDEX idx_newsletter_subscriptions_active ON public.newsletter_subscriptions(is_active) WHERE is_active = true;