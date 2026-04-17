-- Add license plate and VIN number fields to cars table
ALTER TABLE public.cars 
ADD COLUMN license_plate TEXT,
ADD COLUMN vin_number TEXT;