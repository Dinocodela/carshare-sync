DROP POLICY IF EXISTS "Car hosts can update their cars" ON public.cars;

CREATE POLICY "Car hosts can update their cars"
ON public.cars
FOR UPDATE
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id OR host_id IS NULL);