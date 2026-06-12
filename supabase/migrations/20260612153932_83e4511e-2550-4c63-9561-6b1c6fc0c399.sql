ALTER TABLE public.profiles ALTER COLUMN active_workspace SET DEFAULT 'host'::workspace_role;

UPDATE public.profiles p
SET active_workspace = 'host'
WHERE p.active_workspace = 'client'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.user_id
      AND ur.role = 'host'
      AND ur.status = 'active'
  );