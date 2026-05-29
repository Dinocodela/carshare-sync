CREATE TABLE public.investor_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  amount text,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.investor_inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investor_inquiries TO authenticated;
GRANT ALL ON public.investor_inquiries TO service_role;

ALTER TABLE public.investor_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an inquiry"
ON public.investor_inquiries
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Super admins can view inquiries"
ON public.investor_inquiries
FOR SELECT
USING (public.is_super(auth.uid()));
