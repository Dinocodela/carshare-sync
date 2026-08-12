CREATE TABLE public.tesla_deal_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  model_interest text,
  note text,
  source text NOT NULL DEFAULT 'wraps',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.tesla_deal_leads TO service_role;
GRANT SELECT ON public.tesla_deal_leads TO authenticated;

ALTER TABLE public.tesla_deal_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view tesla deal leads"
ON public.tesla_deal_leads
FOR SELECT
TO authenticated
USING (public.is_super(auth.uid()));