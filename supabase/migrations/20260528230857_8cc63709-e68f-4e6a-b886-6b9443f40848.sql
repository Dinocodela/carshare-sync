
-- Enums
CREATE TYPE public.investor_vehicle_status AS ENUM ('draft','available','funded','active','sold','retired');
CREATE TYPE public.investment_status AS ENUM ('pending','active','completed','sold','cancelled');
CREATE TYPE public.investment_payout_status AS ENUM ('pending','scheduled','paid','skipped');
CREATE TYPE public.investment_payout_method AS ENUM ('ach','wire','check','zelle','other');
CREATE TYPE public.investor_payout_method AS ENUM ('ach','wire','check','zelle');

-- investor_vehicles
CREATE TABLE public.investor_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL DEFAULT 'Tesla',
  model text NOT NULL,
  year integer NOT NULL,
  vin text,
  mileage integer,
  color text,
  condition text,
  location text,
  status public.investor_vehicle_status NOT NULL DEFAULT 'draft',
  purchase_price numeric(12,2) NOT NULL DEFAULT 50000,
  investment_amount numeric(12,2) NOT NULL DEFAULT 50000,
  monthly_return numeric(12,2) NOT NULL DEFAULT 1000,
  term_months integer NOT NULL DEFAULT 50,
  resale_upside_pct numeric(5,2) NOT NULL DEFAULT 50,
  estimated_resale_value numeric(12,2),
  photos text[] NOT NULL DEFAULT '{}',
  description text,
  highlights text[] NOT NULL DEFAULT '{}',
  available_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.investor_vehicles TO authenticated;
GRANT ALL ON public.investor_vehicles TO service_role;
ALTER TABLE public.investor_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investor_vehicles: investors browse available"
ON public.investor_vehicles FOR SELECT TO authenticated
USING (
  status IN ('available','funded','active','sold')
  AND public.has_workspace_role(auth.uid(), 'investor')
);

CREATE POLICY "investor_vehicles: super admin select all"
ON public.investor_vehicles FOR SELECT TO authenticated
USING (public.is_super(auth.uid()));

CREATE POLICY "investor_vehicles: super admin manage"
ON public.investor_vehicles FOR ALL TO authenticated
USING (public.is_super(auth.uid()))
WITH CHECK (public.is_super(auth.uid()));

CREATE TRIGGER trg_investor_vehicles_updated_at
BEFORE UPDATE ON public.investor_vehicles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- investments
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  vehicle_id uuid NOT NULL REFERENCES public.investor_vehicles(id) ON DELETE RESTRICT,
  amount numeric(12,2) NOT NULL DEFAULT 50000,
  monthly_return numeric(12,2) NOT NULL DEFAULT 1000,
  term_months integer NOT NULL DEFAULT 50,
  resale_upside_pct numeric(5,2) NOT NULL DEFAULT 50,
  start_date date,
  end_date date,
  months_completed integer NOT NULL DEFAULT 0,
  total_returns_paid numeric(12,2) NOT NULL DEFAULT 0,
  status public.investment_status NOT NULL DEFAULT 'pending',
  payment_method public.investment_payout_method,
  payment_reference text,
  notes text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  funded_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_investments_investor ON public.investments(investor_id);
CREATE INDEX idx_investments_vehicle ON public.investments(vehicle_id);

GRANT SELECT ON public.investments TO authenticated;
GRANT INSERT ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investments: investor select own"
ON public.investments FOR SELECT TO authenticated
USING (auth.uid() = investor_id);

CREATE POLICY "investments: investor request own"
ON public.investments FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = investor_id
  AND status = 'pending'
  AND public.has_workspace_role(auth.uid(), 'investor')
);

CREATE POLICY "investments: super admin select all"
ON public.investments FOR SELECT TO authenticated
USING (public.is_super(auth.uid()));

CREATE POLICY "investments: super admin manage"
ON public.investments FOR ALL TO authenticated
USING (public.is_super(auth.uid()))
WITH CHECK (public.is_super(auth.uid()));

CREATE TRIGGER trg_investments_updated_at
BEFORE UPDATE ON public.investments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- investment_payouts
CREATE TABLE public.investment_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  payout_month integer NOT NULL,
  amount numeric(12,2) NOT NULL,
  scheduled_date date NOT NULL,
  paid_date date,
  method public.investment_payout_method,
  reference text,
  status public.investment_payout_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(investment_id, payout_month)
);

CREATE INDEX idx_investment_payouts_investment ON public.investment_payouts(investment_id);

GRANT SELECT ON public.investment_payouts TO authenticated;
GRANT ALL ON public.investment_payouts TO service_role;
ALTER TABLE public.investment_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investment_payouts: investor select own"
ON public.investment_payouts FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.investments i
          WHERE i.id = investment_payouts.investment_id
            AND i.investor_id = auth.uid())
);

CREATE POLICY "investment_payouts: super admin manage"
ON public.investment_payouts FOR ALL TO authenticated
USING (public.is_super(auth.uid()))
WITH CHECK (public.is_super(auth.uid()));

CREATE TRIGGER trg_investment_payouts_updated_at
BEFORE UPDATE ON public.investment_payouts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- investment_resales
CREATE TABLE public.investment_resales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  resale_date date NOT NULL,
  resale_price numeric(12,2) NOT NULL,
  investor_upside_amount numeric(12,2) NOT NULL DEFAULT 0,
  payout_status public.investment_payout_status NOT NULL DEFAULT 'pending',
  paid_date date,
  method public.investment_payout_method,
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_investment_resales_investment ON public.investment_resales(investment_id);

GRANT SELECT ON public.investment_resales TO authenticated;
GRANT ALL ON public.investment_resales TO service_role;
ALTER TABLE public.investment_resales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investment_resales: investor select own"
ON public.investment_resales FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.investments i
          WHERE i.id = investment_resales.investment_id
            AND i.investor_id = auth.uid())
);

CREATE POLICY "investment_resales: super admin manage"
ON public.investment_resales FOR ALL TO authenticated
USING (public.is_super(auth.uid()))
WITH CHECK (public.is_super(auth.uid()));

CREATE TRIGGER trg_investment_resales_updated_at
BEFORE UPDATE ON public.investment_resales
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- investor_payout_settings
CREATE TABLE public.investor_payout_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL UNIQUE,
  preferred_method public.investor_payout_method NOT NULL DEFAULT 'ach',
  bank_name text,
  account_holder_name text,
  account_last4 text,
  routing_last4 text,
  check_mailing_address text,
  zelle_handle text,
  tax_full_name text,
  tax_address text,
  tax_id_last4 text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.investor_payout_settings TO authenticated;
GRANT ALL ON public.investor_payout_settings TO service_role;
ALTER TABLE public.investor_payout_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investor_payout_settings: investor own"
ON public.investor_payout_settings FOR SELECT TO authenticated
USING (auth.uid() = investor_id);

CREATE POLICY "investor_payout_settings: investor insert own"
ON public.investor_payout_settings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "investor_payout_settings: investor update own"
ON public.investor_payout_settings FOR UPDATE TO authenticated
USING (auth.uid() = investor_id)
WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "investor_payout_settings: super admin manage"
ON public.investor_payout_settings FOR ALL TO authenticated
USING (public.is_super(auth.uid()))
WITH CHECK (public.is_super(auth.uid()));

CREATE TRIGGER trg_investor_payout_settings_updated_at
BEFORE UPDATE ON public.investor_payout_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
