-- Add DELETE policy for cars table to allow car owners to delete their own cars
CREATE POLICY "Car owners can delete their cars" 
ON public.cars 
FOR DELETE 
USING ((auth.uid() = client_id) OR (auth.uid() = host_id));