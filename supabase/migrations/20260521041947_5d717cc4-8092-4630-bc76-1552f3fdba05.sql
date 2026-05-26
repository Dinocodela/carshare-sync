
-- 1) host_earnings INSERT: require car belongs to the host
DROP POLICY IF EXISTS "Hosts can create their own earnings" ON public.host_earnings;
CREATE POLICY "Hosts can create their own earnings"
ON public.host_earnings
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = host_id
  AND EXISTS (
    SELECT 1 FROM public.cars c
    WHERE c.id = host_earnings.car_id AND c.host_id = auth.uid()
  )
);

-- 2) host_claims INSERT: require car belongs to the host
DROP POLICY IF EXISTS "Hosts can create their own claims" ON public.host_claims;
CREATE POLICY "Hosts can create their own claims"
ON public.host_claims
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = host_id
  AND EXISTS (
    SELECT 1 FROM public.cars c
    WHERE c.id = host_claims.car_id AND c.host_id = auth.uid()
  )
);

-- 3) host_expenses INSERT: when car_id is provided, require it belongs to the host
DROP POLICY IF EXISTS "Hosts can create their own expenses" ON public.host_expenses;
CREATE POLICY "Hosts can create their own expenses"
ON public.host_expenses
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = host_id
  AND (
    car_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.cars c
      WHERE c.id = host_expenses.car_id AND c.host_id = auth.uid()
    )
  )
);

-- 4) account_request_history admin SELECT: use is_super() (profiles-based) for consistency
DROP POLICY IF EXISTS "history: admin select all" ON public.account_request_history;
CREATE POLICY "history: admin select all"
ON public.account_request_history
FOR SELECT
TO authenticated
USING (public.is_super(auth.uid()));
