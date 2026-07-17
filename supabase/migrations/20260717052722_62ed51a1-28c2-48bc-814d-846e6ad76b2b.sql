
CREATE TABLE public.car_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT car_blocks_end_after_start CHECK (end_at > start_at)
);

CREATE INDEX car_blocks_car_id_idx ON public.car_blocks(car_id);
CREATE INDEX car_blocks_range_idx ON public.car_blocks(car_id, start_at, end_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_blocks TO authenticated;
GRANT ALL ON public.car_blocks TO service_role;

ALTER TABLE public.car_blocks ENABLE ROW LEVEL SECURITY;

-- Helper: user can access car (owner, host, or shared)
CREATE OR REPLACE FUNCTION public.user_can_access_car(_user_id uuid, _car_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cars c
    WHERE c.id = _car_id
      AND (c.client_id = _user_id OR c.host_id = _user_id)
  ) OR EXISTS (
    SELECT 1 FROM public.car_access ca
    WHERE ca.car_id = _car_id AND ca.user_id = _user_id
  );
$$;

CREATE POLICY "Users can view blocks on cars they can access"
ON public.car_blocks FOR SELECT
TO authenticated
USING (
  public.user_can_access_car(auth.uid(), car_id)
  OR public.is_super(auth.uid())
);

CREATE POLICY "Users can create blocks on cars they can access"
ON public.car_blocks FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND (
    public.user_can_access_car(auth.uid(), car_id)
    OR public.is_super(auth.uid())
  )
);

CREATE POLICY "Users can update blocks on cars they can access"
ON public.car_blocks FOR UPDATE
TO authenticated
USING (
  public.user_can_access_car(auth.uid(), car_id)
  OR public.is_super(auth.uid())
)
WITH CHECK (
  public.user_can_access_car(auth.uid(), car_id)
  OR public.is_super(auth.uid())
);

CREATE POLICY "Users can delete blocks on cars they can access"
ON public.car_blocks FOR DELETE
TO authenticated
USING (
  public.user_can_access_car(auth.uid(), car_id)
  OR public.is_super(auth.uid())
);

CREATE TRIGGER update_car_blocks_updated_at
BEFORE UPDATE ON public.car_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
