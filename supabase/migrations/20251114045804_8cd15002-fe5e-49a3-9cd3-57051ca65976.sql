-- Create email deliverability metrics table
CREATE TABLE IF NOT EXISTS public.email_deliverability_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_sent integer DEFAULT 0,
  total_delivered integer DEFAULT 0,
  total_bounced integer DEFAULT 0,
  hard_bounces integer DEFAULT 0,
  soft_bounces integer DEFAULT 0,
  spam_complaints integer DEFAULT 0,
  unsubscribes integer DEFAULT 0,
  opens integer DEFAULT 0,
  clicks integer DEFAULT 0,
  delivery_rate numeric GENERATED ALWAYS AS (
    CASE WHEN total_sent > 0 THEN (total_delivered::numeric / total_sent::numeric * 100) ELSE 0 END
  ) STORED,
  bounce_rate numeric GENERATED ALWAYS AS (
    CASE WHEN total_sent > 0 THEN (total_bounced::numeric / total_sent::numeric * 100) ELSE 0 END
  ) STORED,
  spam_rate numeric GENERATED ALWAYS AS (
    CASE WHEN total_sent > 0 THEN (spam_complaints::numeric / total_sent::numeric * 100) ELSE 0 END
  ) STORED,
  open_rate numeric GENERATED ALWAYS AS (
    CASE WHEN total_delivered > 0 THEN (opens::numeric / total_delivered::numeric * 100) ELSE 0 END
  ) STORED,
  click_rate numeric GENERATED ALWAYS AS (
    CASE WHEN total_delivered > 0 THEN (clicks::numeric / total_delivered::numeric * 100) ELSE 0 END
  ) STORED,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(date)
);

-- Create bounce events table
CREATE TABLE IF NOT EXISTS public.email_bounce_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  bounce_type text NOT NULL CHECK (bounce_type IN ('hard', 'soft', 'transient')),
  bounce_reason text,
  campaign_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Create spam complaint events table
CREATE TABLE IF NOT EXISTS public.email_spam_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  complaint_type text DEFAULT 'spam',
  campaign_id uuid,
  user_id uuid,
  feedback_type text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create DNS validation table
CREATE TABLE IF NOT EXISTS public.dns_records_validation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL DEFAULT 'teslys.app',
  record_type text NOT NULL CHECK (record_type IN ('SPF', 'DKIM', 'DMARC', 'MX')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('valid', 'invalid', 'warning', 'pending')),
  expected_value text,
  actual_value text,
  error_message text,
  last_checked_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(domain, record_type)
);

-- Create deliverability recommendations table
CREATE TABLE IF NOT EXISTS public.deliverability_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  category text NOT NULL CHECK (category IN ('dns', 'content', 'engagement', 'authentication', 'reputation')),
  is_resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bounce_events_email ON public.email_bounce_events(email);
CREATE INDEX IF NOT EXISTS idx_bounce_events_created ON public.email_bounce_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spam_complaints_email ON public.email_spam_complaints(email);
CREATE INDEX IF NOT EXISTS idx_spam_complaints_created ON public.email_spam_complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deliverability_metrics_date ON public.email_deliverability_metrics(date DESC);

-- Enable RLS
ALTER TABLE public.email_deliverability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_bounce_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_spam_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_records_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverability_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Super admin only)
CREATE POLICY "Super admins can view deliverability metrics"
  ON public.email_deliverability_metrics FOR SELECT
  USING (is_super(auth.uid()));

CREATE POLICY "Super admins can manage deliverability metrics"
  ON public.email_deliverability_metrics FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

CREATE POLICY "Super admins can view bounce events"
  ON public.email_bounce_events FOR SELECT
  USING (is_super(auth.uid()));

CREATE POLICY "Super admins can manage bounce events"
  ON public.email_bounce_events FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

CREATE POLICY "Super admins can view spam complaints"
  ON public.email_spam_complaints FOR SELECT
  USING (is_super(auth.uid()));

CREATE POLICY "Super admins can manage spam complaints"
  ON public.email_spam_complaints FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

CREATE POLICY "Super admins can view DNS validation"
  ON public.dns_records_validation FOR SELECT
  USING (is_super(auth.uid()));

CREATE POLICY "Super admins can manage DNS validation"
  ON public.dns_records_validation FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

CREATE POLICY "Super admins can view recommendations"
  ON public.deliverability_recommendations FOR SELECT
  USING (is_super(auth.uid()));

CREATE POLICY "Super admins can manage recommendations"
  ON public.deliverability_recommendations FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

-- Insert initial DNS records to validate
INSERT INTO public.dns_records_validation (domain, record_type, expected_value, status)
VALUES 
  ('teslys.app', 'SPF', 'v=spf1 include:_spf.resend.com ~all', 'pending'),
  ('teslys.app', 'DKIM', 'resend._domainkey.teslys.app', 'pending'),
  ('teslys.app', 'DMARC', 'v=DMARC1; p=none; rua=mailto:dmarc@teslys.app', 'pending'),
  ('teslys.app', 'MX', 'MX records configured', 'pending')
ON CONFLICT (domain, record_type) DO NOTHING;