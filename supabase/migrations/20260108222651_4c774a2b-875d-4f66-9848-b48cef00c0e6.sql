-- Allow all authenticated users to view host profiles (so clients can select a host)
CREATE POLICY "Anyone can view host profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (role = 'host');