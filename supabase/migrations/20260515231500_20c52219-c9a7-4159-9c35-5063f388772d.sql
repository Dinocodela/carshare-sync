CREATE POLICY "Shared users can view earnings for shared cars"
ON public.host_earnings
FOR SELECT
USING (auth.uid() IN (
  SELECT car_access.user_id
  FROM public.car_access
  WHERE car_access.car_id = host_earnings.car_id
));

CREATE POLICY "Shared users can view expenses for shared cars"
ON public.host_expenses
FOR SELECT
USING (auth.uid() IN (
  SELECT car_access.user_id
  FROM public.car_access
  WHERE car_access.car_id = host_expenses.car_id
));