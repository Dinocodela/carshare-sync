-- Create maintenance_schedules table
CREATE TABLE public.maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL,
  host_id UUID NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  maintenance_type TEXT NOT NULL,
  provider_name TEXT,
  provider_contact TEXT,
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Hosts and clients can view maintenance for their cars" 
ON public.maintenance_schedules 
FOR SELECT 
USING (
  auth.uid() = host_id OR 
  auth.uid() IN (
    SELECT client_id FROM cars WHERE cars.id = maintenance_schedules.car_id
  )
);

CREATE POLICY "Hosts can create maintenance for their cars" 
ON public.maintenance_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their maintenance records" 
ON public.maintenance_schedules 
FOR UPDATE 
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their maintenance records" 
ON public.maintenance_schedules 
FOR DELETE 
USING (auth.uid() = host_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_maintenance_schedules_updated_at
BEFORE UPDATE ON public.maintenance_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();