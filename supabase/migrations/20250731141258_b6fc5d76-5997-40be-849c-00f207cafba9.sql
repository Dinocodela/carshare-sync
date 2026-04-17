-- Add foreign key constraints between cars and profiles tables
ALTER TABLE public.cars 
ADD CONSTRAINT cars_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.cars 
ADD CONSTRAINT cars_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES public.profiles(user_id);