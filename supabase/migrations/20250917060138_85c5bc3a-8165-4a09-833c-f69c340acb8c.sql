-- Add DELETE RLS policy for host_claims table to allow hosts to delete their own claims
CREATE POLICY "Hosts can delete their own claims" 
ON public.host_claims 
FOR DELETE 
USING (auth.uid() = host_id);