-- Add incident_id column to host_claims table
ALTER TABLE public.host_claims
ADD COLUMN incident_id text;