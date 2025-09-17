-- Fix security warning by correcting search_path syntax
CREATE OR REPLACE FUNCTION public.reject_hosting_request(p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_request requests%ROWTYPE;
  v_result json;
BEGIN
  -- Get the request with row lock
  SELECT * INTO v_request 
  FROM requests 
  WHERE id = p_request_id 
  AND host_id = auth.uid() 
  AND status = 'pending'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or not authorized';
  END IF;
  
  -- FIRST: Update car status (while request is still 'pending' for RLS)
  UPDATE cars 
  SET status = 'available', 
      host_id = NULL, 
      updated_at = now()
  WHERE id = v_request.car_id;
  
  -- SECOND: Update request status (after car is updated)
  UPDATE requests 
  SET status = 'rejected', updated_at = now()
  WHERE id = p_request_id;
  
  -- Return success result
  v_result := json_build_object(
    'success', true,
    'request_id', p_request_id,
    'car_id', v_request.car_id,
    'status', 'rejected'
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to reject hosting request: %', SQLERRM;
END;
$function$;