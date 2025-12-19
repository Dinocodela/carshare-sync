-- Mark all earnings up until June 2025 as paid
UPDATE public.host_earnings 
SET payment_status = 'paid', 
    date_paid = COALESCE(date_paid, earning_period_end::date),
    updated_at = now()
WHERE earning_period_end <= '2025-06-30 23:59:59'
  AND payment_status != 'paid';