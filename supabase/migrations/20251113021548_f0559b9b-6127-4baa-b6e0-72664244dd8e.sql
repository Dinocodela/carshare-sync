-- Create welcome email sequences table
CREATE TABLE public.welcome_email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_role TEXT CHECK (target_role IN ('client', 'host', 'both')) NOT NULL DEFAULT 'both',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create welcome email steps table (each step is an email in the sequence)
CREATE TABLE public.welcome_email_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES public.welcome_email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  template_id UUID REFERENCES public.newsletter_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sequence_id, step_order)
);

-- Create welcome email queue table (tracks what needs to be sent)
CREATE TABLE public.welcome_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  step_id UUID NOT NULL REFERENCES public.welcome_email_steps(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES public.welcome_email_sequences(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_welcome_email_queue_scheduled ON public.welcome_email_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_welcome_email_queue_user ON public.welcome_email_queue(user_id);
CREATE INDEX idx_welcome_email_steps_sequence ON public.welcome_email_steps(sequence_id, step_order);

-- Enable RLS
ALTER TABLE public.welcome_email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_email_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_email_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for sequences
CREATE POLICY "Super admins can manage sequences"
  ON public.welcome_email_sequences
  FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

-- RLS policies for steps
CREATE POLICY "Super admins can manage steps"
  ON public.welcome_email_steps
  FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

-- RLS policies for queue
CREATE POLICY "Super admins can view queue"
  ON public.welcome_email_queue
  FOR SELECT
  USING (is_super(auth.uid()));

CREATE POLICY "Users can view their own queue items"
  ON public.welcome_email_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to enqueue welcome emails for new user
CREATE OR REPLACE FUNCTION public.enqueue_welcome_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sequence RECORD;
  v_step RECORD;
  v_user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role FROM public.profiles WHERE user_id = NEW.id;
  
  -- Find active sequences that match this user's role
  FOR v_sequence IN 
    SELECT * FROM public.welcome_email_sequences 
    WHERE is_active = true 
    AND (target_role = 'both' OR target_role = v_user_role)
  LOOP
    -- Enqueue all steps for this sequence
    FOR v_step IN
      SELECT * FROM public.welcome_email_steps
      WHERE sequence_id = v_sequence.id
      ORDER BY step_order
    LOOP
      INSERT INTO public.welcome_email_queue (
        user_id,
        step_id,
        sequence_id,
        scheduled_for,
        status
      ) VALUES (
        NEW.id,
        v_step.id,
        v_sequence.id,
        now() + (v_step.delay_days || ' days')::interval + (v_step.delay_hours || ' hours')::interval,
        'pending'
      );
    END LOOP;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to enqueue welcome emails when user is created
CREATE TRIGGER on_user_created_enqueue_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enqueue_welcome_emails();

-- Trigger to update updated_at
CREATE TRIGGER update_welcome_email_sequences_updated_at
  BEFORE UPDATE ON public.welcome_email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_welcome_email_steps_updated_at
  BEFORE UPDATE ON public.welcome_email_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_welcome_email_queue_updated_at
  BEFORE UPDATE ON public.welcome_email_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();