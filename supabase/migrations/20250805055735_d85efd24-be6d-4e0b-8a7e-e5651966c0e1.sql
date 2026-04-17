-- Create client_car_expenses table for fixed monthly expenses
CREATE TABLE public.client_car_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL,
  client_id UUID NOT NULL,
  expense_type TEXT NOT NULL, -- insurance, loan_payment, registration, etc.
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  frequency TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly
  provider_name TEXT,
  policy_number TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_car_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for client access
CREATE POLICY "Clients can view their own car expenses" 
ON public.client_car_expenses 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create their own car expenses" 
ON public.client_car_expenses 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own car expenses" 
ON public.client_car_expenses 
FOR UPDATE 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own car expenses" 
ON public.client_car_expenses 
FOR DELETE 
USING (auth.uid() = client_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_car_expenses_updated_at
BEFORE UPDATE ON public.client_car_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_client_car_expenses_car_id ON public.client_car_expenses(car_id);
CREATE INDEX idx_client_car_expenses_client_id ON public.client_car_expenses(client_id);
CREATE INDEX idx_client_car_expenses_expense_type ON public.client_car_expenses(expense_type);