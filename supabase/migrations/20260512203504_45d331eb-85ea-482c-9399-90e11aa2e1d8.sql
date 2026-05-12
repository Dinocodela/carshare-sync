
-- 1) HOST PROFILES: restrict broad read, add safe RPC
DROP POLICY IF EXISTS "Authenticated users can view approved host profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.get_public_host_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  company_name text,
  location text,
  bio text,
  services text[],
  rating numeric,
  turo_reviews_count integer,
  turo_profile_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.user_id, p.first_name, p.last_name, p.company_name,
         p.location, p.bio, p.services, p.rating,
         p.turo_reviews_count, p.turo_profile_url
  FROM public.profiles p
  WHERE p.role = 'host' AND p.account_status = 'approved'
  ORDER BY p.rating DESC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_public_host_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_host_profiles() TO authenticated;

-- 2) GUEST CONTACT: move out of host_earnings
CREATE TABLE IF NOT EXISTS public.host_earnings_guest_contact (
  earning_id uuid PRIMARY KEY REFERENCES public.host_earnings(id) ON DELETE CASCADE,
  guest_email text,
  guest_phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.host_earnings_guest_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view their guest contact"
  ON public.host_earnings_guest_contact FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.host_earnings he
    WHERE he.id = host_earnings_guest_contact.earning_id
      AND he.host_id = auth.uid()
  ));

CREATE POLICY "Hosts can insert their guest contact"
  ON public.host_earnings_guest_contact FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.host_earnings he
    WHERE he.id = host_earnings_guest_contact.earning_id
      AND he.host_id = auth.uid()
  ));

CREATE POLICY "Hosts can update their guest contact"
  ON public.host_earnings_guest_contact FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.host_earnings he
    WHERE he.id = host_earnings_guest_contact.earning_id
      AND he.host_id = auth.uid()
  ));

CREATE POLICY "Hosts can delete their guest contact"
  ON public.host_earnings_guest_contact FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.host_earnings he
    WHERE he.id = host_earnings_guest_contact.earning_id
      AND he.host_id = auth.uid()
  ));

-- Backfill existing data
INSERT INTO public.host_earnings_guest_contact (earning_id, guest_email, guest_phone)
SELECT id, guest_email, guest_phone
FROM public.host_earnings
WHERE guest_email IS NOT NULL OR guest_phone IS NOT NULL
ON CONFLICT (earning_id) DO NOTHING;

ALTER TABLE public.host_earnings DROP COLUMN IF EXISTS guest_email;
ALTER TABLE public.host_earnings DROP COLUMN IF EXISTS guest_phone;

-- 3) NEWSLETTER: drop public unsubscribe policy
DROP POLICY IF EXISTS "Anyone can unsubscribe with valid token" ON public.newsletter_subscriptions;

-- 4) CAR IMAGES: require ownership path on upload
DROP POLICY IF EXISTS "Authenticated users can upload car images" ON storage.objects;

CREATE POLICY "Users can upload car images to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'car-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 5) EMAIL AB EVENTS: drop anonymous insert
DROP POLICY IF EXISTS "Anyone can insert tracking events" ON public.email_ab_events;
