-- Create table for car access sharing
CREATE TABLE IF NOT EXISTS public.car_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  permission text NOT NULL DEFAULT 'viewer',
  granted_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT car_access_permission_check CHECK (permission IN ('viewer','editor')),
  CONSTRAINT car_access_unique UNIQUE (car_id, user_id)
);

-- Enable RLS
ALTER TABLE public.car_access ENABLE ROW LEVEL SECURITY;

-- Policies for car_access
CREATE POLICY "Users can view car access they are involved in or owners"
ON public.car_access
FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() = granted_by
  OR auth.uid() IN (
    SELECT client_id FROM public.cars WHERE public.cars.id = public.car_access.car_id
  )
);

CREATE POLICY "Only car owners can grant access"
ON public.car_access
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT client_id FROM public.cars WHERE public.cars.id = public.car_access.car_id
  )
);

CREATE POLICY "Only owners can update access"
ON public.car_access
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT client_id FROM public.cars WHERE public.cars.id = public.car_access.car_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT client_id FROM public.cars WHERE public.cars.id = public.car_access.car_id
  )
);

CREATE POLICY "Only owners can revoke access"
ON public.car_access
FOR DELETE
USING (
  auth.uid() IN (
    SELECT client_id FROM public.cars WHERE public.cars.id = public.car_access.car_id
  )
);

-- Trigger to keep updated_at current
DROP TRIGGER IF EXISTS update_car_access_updated_at ON public.car_access;
CREATE TRIGGER update_car_access_updated_at
BEFORE UPDATE ON public.car_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow shared users to view analytics/maintenance data for shared cars
CREATE POLICY "Shared users can view earnings for shared cars"
ON public.host_earnings
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.car_access WHERE public.car_access.car_id = public.host_earnings.car_id
  )
);

CREATE POLICY "Shared users can view expenses for shared cars"
ON public.host_expenses
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.car_access WHERE public.car_access.car_id = public.host_expenses.car_id
  )
);

CREATE POLICY "Shared users can view claims for shared cars"
ON public.host_claims
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.car_access WHERE public.car_access.car_id = public.host_claims.car_id
  )
);

CREATE POLICY "Shared users can view maintenance for shared cars"
ON public.maintenance_schedules
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.car_access WHERE public.car_access.car_id = public.maintenance_schedules.car_id
  )
);

-- Allow shared users to view client fixed expenses for shared cars (read-only)
CREATE POLICY "Shared users can view client car expenses for shared cars"
ON public.client_car_expenses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.car_access 
    WHERE public.car_access.car_id = public.client_car_expenses.car_id
      AND public.car_access.user_id = auth.uid()
  )
);
