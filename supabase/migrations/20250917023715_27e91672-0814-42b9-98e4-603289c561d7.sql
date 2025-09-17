-- Add RLS policy to allow hosts to update cars when accepting requests
CREATE POLICY "Hosts can update cars when accepting requests" 
ON public.cars 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.requests r 
    WHERE r.car_id = cars.id 
    AND r.host_id = auth.uid() 
    AND r.status = 'pending'
  )
);

-- Create secure function to handle hosting request acceptance
CREATE OR REPLACE FUNCTION public.accept_hosting_request(
  p_request_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request requests%ROWTYPE;
  v_car cars%ROWTYPE;
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
  
  -- Get the car
  SELECT * INTO v_car 
  FROM cars 
  WHERE id = v_request.car_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Car not found';
  END IF;
  
  -- Update request status
  UPDATE requests 
  SET status = 'accepted', updated_at = now()
  WHERE id = p_request_id;
  
  -- Update car status and assign host
  UPDATE cars 
  SET status = 'hosted', 
      host_id = auth.uid(), 
      updated_at = now()
  WHERE id = v_request.car_id;
  
  -- Return success result
  v_result := json_build_object(
    'success', true,
    'request_id', p_request_id,
    'car_id', v_request.car_id,
    'status', 'accepted'
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to accept hosting request: %', SQLERRM;
END;
$$;

-- Create secure function to handle hosting request rejection
CREATE OR REPLACE FUNCTION public.reject_hosting_request(
  p_request_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Update request status
  UPDATE requests 
  SET status = 'rejected', updated_at = now()
  WHERE id = p_request_id;
  
  -- Ensure car remains available
  UPDATE cars 
  SET status = 'available', 
      host_id = NULL, 
      updated_at = now()
  WHERE id = v_request.car_id;
  
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
$$;