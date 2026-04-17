-- Update the car status to ready_for_return so we can see the post-approval features
UPDATE public.cars 
SET status = 'ready_for_return', updated_at = now()
WHERE id = '2ffaf7a4-3eb5-4b33-a3ca-b8b5e2c3c59b';