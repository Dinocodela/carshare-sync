-- Fix the specific Tesla Y Blue Moon car and any similar cases
UPDATE cars 
SET status = 'available', 
    host_id = NULL, 
    updated_at = now()
WHERE id = '5ef80747-1938-490d-ae48-d61903f4c3dd'
  OR id IN (
    SELECT DISTINCT c.id 
    FROM cars c
    JOIN requests r ON r.car_id = c.id
    WHERE c.status = 'pending' 
    AND r.status = 'rejected'
  );

-- Verify the update worked
SELECT c.id, c.make, c.model, c.status, c.host_id, r.status as request_status
FROM cars c
LEFT JOIN requests r ON r.car_id = c.id
WHERE c.id = '5ef80747-1938-490d-ae48-d61903f4c3dd';