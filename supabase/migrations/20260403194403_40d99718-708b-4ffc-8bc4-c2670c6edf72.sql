
-- 1. Add profit_program and promo_start_date to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profit_program text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS promo_start_date timestamptz DEFAULT NULL;

-- 2. Create insurance_inquiries table
CREATE TABLE public.insurance_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  car_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own inquiries"
  ON public.insurance_inquiries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own inquiries"
  ON public.insurance_inquiries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all inquiries"
  ON public.insurance_inquiries FOR SELECT
  TO authenticated
  USING (is_super(auth.uid()));

-- 3. Create promotions table
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'first_month_free',
  is_active boolean NOT NULL DEFAULT true,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promotions"
  ON public.promotions FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Super admins can manage promotions"
  ON public.promotions FOR ALL
  TO authenticated
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

-- 4. Create reservations table
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text,
  guest_phone text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  daily_rate numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  payment_source text DEFAULT 'Direct',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can insert own reservations"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can view own reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can update own reservations"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete own reservations"
  ON public.reservations FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Clients can view reservations for their cars"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT client_id FROM public.cars WHERE id = reservations.car_id));
