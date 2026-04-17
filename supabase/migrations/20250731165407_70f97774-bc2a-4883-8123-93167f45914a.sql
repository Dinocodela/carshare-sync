-- Update host_expenses table with additional fields
ALTER TABLE public.host_expenses 
ADD COLUMN guest_name TEXT,
ADD COLUMN ev_charge_cost NUMERIC DEFAULT 0.00,
ADD COLUMN carwash_cost NUMERIC DEFAULT 0.00,
ADD COLUMN delivery_cost NUMERIC DEFAULT 0.00,
ADD COLUMN toll_cost NUMERIC DEFAULT 0.00,
ADD COLUMN total_expenses NUMERIC GENERATED ALWAYS AS (
  COALESCE(amount, 0) + COALESCE(ev_charge_cost, 0) + COALESCE(carwash_cost, 0) + 
  COALESCE(delivery_cost, 0) + COALESCE(toll_cost, 0)
) STORED,
ADD COLUMN receipt_urls TEXT[];

-- Update host_earnings table with additional fields
ALTER TABLE public.host_earnings
ADD COLUMN guest_name TEXT,
ADD COLUMN gross_earnings NUMERIC DEFAULT 0.00,
ADD COLUMN client_profit_percentage NUMERIC DEFAULT 30.00,
ADD COLUMN host_profit_percentage NUMERIC DEFAULT 70.00,
ADD COLUMN client_profit_amount NUMERIC GENERATED ALWAYS AS (
  COALESCE(gross_earnings, 0) * COALESCE(client_profit_percentage, 30) / 100
) STORED,
ADD COLUMN host_profit_amount NUMERIC GENERATED ALWAYS AS (
  COALESCE(gross_earnings, 0) * COALESCE(host_profit_percentage, 70) / 100
) STORED,
ADD COLUMN payment_source TEXT DEFAULT 'Turo',
ADD COLUMN date_paid DATE;

-- Update host_claims table with comprehensive tracking fields
ALTER TABLE public.host_claims
ADD COLUMN accident_description TEXT,
ADD COLUMN photos_taken BOOLEAN DEFAULT false,
ADD COLUMN claim_submitted_date DATE,
ADD COLUMN adjuster_name TEXT,
ADD COLUMN adjuster_contact TEXT,
ADD COLUMN approval_date DATE,
ADD COLUMN payout_amount NUMERIC,
ADD COLUMN autobody_shop_name TEXT,
ADD COLUMN shop_contact_info TEXT,
ADD COLUMN estimate_submitted_date DATE,
ADD COLUMN estimate_approved_date DATE,
ADD COLUMN repair_dropoff_date DATE,
ADD COLUMN estimated_completion_date DATE,
ADD COLUMN repair_status TEXT DEFAULT 'pending',
ADD COLUMN car_ready_pickup_date DATE,
ADD COLUMN actual_pickup_date DATE,
ADD COLUMN post_repair_inspection BOOLEAN DEFAULT false,
ADD COLUMN additional_notes TEXT,
ADD COLUMN final_status TEXT DEFAULT 'open';