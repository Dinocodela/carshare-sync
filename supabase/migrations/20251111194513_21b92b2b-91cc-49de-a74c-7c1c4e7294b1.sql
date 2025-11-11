-- Create newsletter campaigns table
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  created_by UUID REFERENCES auth.users(id),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign tracking table
CREATE TABLE IF NOT EXISTS public.newsletter_campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.newsletter_subscriptions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaign_sends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_campaigns
CREATE POLICY "Super admins can view all campaigns"
  ON public.newsletter_campaigns
  FOR SELECT
  USING (public.is_super(auth.uid()));

CREATE POLICY "Super admins can create campaigns"
  ON public.newsletter_campaigns
  FOR INSERT
  WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "Super admins can update campaigns"
  ON public.newsletter_campaigns
  FOR UPDATE
  USING (public.is_super(auth.uid()));

CREATE POLICY "Super admins can delete campaigns"
  ON public.newsletter_campaigns
  FOR DELETE
  USING (public.is_super(auth.uid()));

-- RLS Policies for newsletter_campaign_sends
CREATE POLICY "Super admins can view all campaign sends"
  ON public.newsletter_campaign_sends
  FOR SELECT
  USING (public.is_super(auth.uid()));

CREATE POLICY "Super admins can insert campaign sends"
  ON public.newsletter_campaign_sends
  FOR INSERT
  WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "Super admins can update campaign sends"
  ON public.newsletter_campaign_sends
  FOR UPDATE
  USING (public.is_super(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at ON public.newsletter_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaign_sends_campaign_id ON public.newsletter_campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaign_sends_status ON public.newsletter_campaign_sends(status);

-- Trigger to update updated_at
CREATE TRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATE ON public.newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();