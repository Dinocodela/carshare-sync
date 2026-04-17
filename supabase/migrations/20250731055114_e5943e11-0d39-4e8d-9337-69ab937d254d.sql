-- Fix the specific car that has accepted request but still pending status
-- Car ID: 9de76266-4f08-42cc-a5ac-97e2f292b84d should be active since request was accepted

UPDATE cars 
SET status = 'active', updated_at = now()
WHERE id = '9de76266-4f08-42cc-a5ac-97e2f292b84d' 
AND status = 'pending';