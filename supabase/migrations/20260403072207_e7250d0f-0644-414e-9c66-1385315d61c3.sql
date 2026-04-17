
CREATE TABLE public.signed_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  agreement_version text NOT NULL DEFAULT '2025-v1',
  signer_name text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text
);

ALTER TABLE public.signed_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own agreements"
  ON public.signed_agreements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own agreements"
  ON public.signed_agreements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all agreements"
  ON public.signed_agreements FOR SELECT
  TO authenticated
  USING (is_super(auth.uid()));
