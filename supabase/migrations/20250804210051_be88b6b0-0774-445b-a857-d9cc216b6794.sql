-- Clean up all test data (run in this order to avoid foreign key issues)

-- 1. Delete all host claims
DELETE FROM public.host_claims;

-- 2. Delete all host expenses  
DELETE FROM public.host_expenses;

-- 3. Delete all host earnings
DELETE FROM public.host_earnings;

-- 4. Delete all requests
DELETE FROM public.requests;

-- 5. Delete all cars
DELETE FROM public.cars;

-- 6. Optional: Delete test user profiles (keep real ones if any)
-- Uncomment the line below if you want to delete all profiles
-- DELETE FROM public.profiles;

-- 7. Reset any sequences (if needed)
-- This ensures auto-generated IDs start fresh
-- Note: UUIDs don't use sequences, so this may not be necessary