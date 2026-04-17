-- Clean up the stuck request and reset car status
UPDATE requests SET status = 'declined', updated_at = now() WHERE id = '97ae08a8-4861-4002-92fe-c95597715099';
UPDATE cars SET status = 'available', updated_at = now() WHERE id = 'f059cd5e-1702-40b6-a41b-edc5789fcd2e';