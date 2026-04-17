-- Fix the specific car that has accepted request but still pending status  
-- Car ID: 72f12f7b-bca8-467d-aba9-324cb9fe1e0c should be completed since request was accepted
-- Set host_id to the accepting host: 1bee30cc-abe2-484a-9a8a-f9199977a3ce

UPDATE cars 
SET status = 'completed', 
    host_id = '1bee30cc-abe2-484a-9a8a-f9199977a3ce',
    updated_at = now()
WHERE id = '72f12f7b-bca8-467d-aba9-324cb9fe1e0c' 
AND status = 'pending';