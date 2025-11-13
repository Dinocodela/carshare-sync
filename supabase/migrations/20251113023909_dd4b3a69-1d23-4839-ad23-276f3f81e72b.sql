-- Create A/B test configuration table
CREATE TABLE IF NOT EXISTS public.email_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES public.welcome_email_steps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  test_type TEXT NOT NULL DEFAULT 'subject' CHECK (test_type IN ('subject', 'content', 'send_time', 'full')),
  traffic_split INTEGER NOT NULL DEFAULT 50 CHECK (traffic_split >= 0 AND traffic_split <= 100),
  min_sample_size INTEGER NOT NULL DEFAULT 100,
  confidence_level NUMERIC NOT NULL DEFAULT 95.0 CHECK (confidence_level >= 80 AND confidence_level <= 99.9),
  winner_variant_id UUID,
  winner_metric TEXT CHECK (winner_metric IN ('open_rate', 'click_rate', 'combined')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create A/B test variants table
CREATE TABLE IF NOT EXISTS public.email_ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.email_ab_tests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_control BOOLEAN NOT NULL DEFAULT false,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  send_delay_hours INTEGER DEFAULT 0,
  traffic_allocation INTEGER NOT NULL DEFAULT 50 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 100),
  sends_count INTEGER NOT NULL DEFAULT 0,
  opens_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  open_rate NUMERIC DEFAULT 0,
  click_rate NUMERIC DEFAULT 0,
  combined_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create A/B test assignments table (which user got which variant)
CREATE TABLE IF NOT EXISTS public.email_ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.email_ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.email_ab_variants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  queue_item_id UUID REFERENCES public.welcome_email_queue(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(test_id, user_id)
);

-- Create A/B test events table (detailed tracking)
CREATE TABLE IF NOT EXISTS public.email_ab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.email_ab_assignments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  event_data JSONB,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_ab_tests
CREATE POLICY "Super admins can manage tests"
  ON public.email_ab_tests
  FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

-- RLS Policies for email_ab_variants
CREATE POLICY "Super admins can manage variants"
  ON public.email_ab_variants
  FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

-- RLS Policies for email_ab_assignments
CREATE POLICY "Super admins can view assignments"
  ON public.email_ab_assignments
  FOR SELECT
  USING (is_super(auth.uid()));

CREATE POLICY "Users can view their own assignments"
  ON public.email_ab_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for email_ab_events
CREATE POLICY "Super admins can view events"
  ON public.email_ab_events
  FOR SELECT
  USING (is_super(auth.uid()));

CREATE POLICY "Anyone can insert tracking events"
  ON public.email_ab_events
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_ab_tests_step_id ON public.email_ab_tests(step_id);
CREATE INDEX idx_ab_tests_status ON public.email_ab_tests(status);
CREATE INDEX idx_ab_variants_test_id ON public.email_ab_variants(test_id);
CREATE INDEX idx_ab_assignments_test_user ON public.email_ab_assignments(test_id, user_id);
CREATE INDEX idx_ab_assignments_variant ON public.email_ab_assignments(variant_id);
CREATE INDEX idx_ab_events_assignment ON public.email_ab_events(assignment_id);
CREATE INDEX idx_ab_events_type ON public.email_ab_events(event_type);

-- Function to update variant statistics
CREATE OR REPLACE FUNCTION public.update_variant_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.email_ab_variants
    SET 
      sends_count = (
        SELECT COUNT(*) 
        FROM public.email_ab_assignments 
        WHERE variant_id = NEW.variant_id AND sent_at IS NOT NULL
      ),
      opens_count = (
        SELECT COUNT(*) 
        FROM public.email_ab_assignments 
        WHERE variant_id = NEW.variant_id AND opened_at IS NOT NULL
      ),
      clicks_count = (
        SELECT COUNT(*) 
        FROM public.email_ab_assignments 
        WHERE variant_id = NEW.variant_id AND clicked_at IS NOT NULL
      ),
      updated_at = now()
    WHERE id = NEW.variant_id;
    
    -- Calculate rates
    UPDATE public.email_ab_variants
    SET 
      open_rate = CASE WHEN sends_count > 0 THEN (opens_count::NUMERIC / sends_count::NUMERIC * 100) ELSE 0 END,
      click_rate = CASE WHEN sends_count > 0 THEN (clicks_count::NUMERIC / sends_count::NUMERIC * 100) ELSE 0 END,
      updated_at = now()
    WHERE id = NEW.variant_id;
    
    -- Calculate combined score (weighted: 60% open rate, 40% click rate)
    UPDATE public.email_ab_variants
    SET 
      combined_score = (open_rate * 0.6) + (click_rate * 0.4),
      updated_at = now()
    WHERE id = NEW.variant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update stats when assignments change
CREATE TRIGGER update_variant_stats_trigger
  AFTER INSERT OR UPDATE ON public.email_ab_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_variant_stats();

-- Function to auto-select winner
CREATE OR REPLACE FUNCTION public.auto_select_winner(p_test_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_test RECORD;
  v_winner RECORD;
  v_result JSONB;
BEGIN
  -- Get test details
  SELECT * INTO v_test FROM public.email_ab_tests WHERE id = p_test_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Test not found');
  END IF;
  
  IF v_test.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Test is not active');
  END IF;
  
  -- Check if minimum sample size reached
  IF (SELECT SUM(sends_count) FROM public.email_ab_variants WHERE test_id = p_test_id) < v_test.min_sample_size THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum sample size not reached');
  END IF;
  
  -- Select winner based on metric
  IF v_test.winner_metric = 'open_rate' THEN
    SELECT * INTO v_winner FROM public.email_ab_variants 
    WHERE test_id = p_test_id 
    ORDER BY open_rate DESC, sends_count DESC 
    LIMIT 1;
  ELSIF v_test.winner_metric = 'click_rate' THEN
    SELECT * INTO v_winner FROM public.email_ab_variants 
    WHERE test_id = p_test_id 
    ORDER BY click_rate DESC, sends_count DESC 
    LIMIT 1;
  ELSE -- combined
    SELECT * INTO v_winner FROM public.email_ab_variants 
    WHERE test_id = p_test_id 
    ORDER BY combined_score DESC, sends_count DESC 
    LIMIT 1;
  END IF;
  
  -- Update test with winner
  UPDATE public.email_ab_tests
  SET 
    winner_variant_id = v_winner.id,
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  WHERE id = p_test_id;
  
  v_result := jsonb_build_object(
    'success', true,
    'winner_id', v_winner.id,
    'winner_name', v_winner.name,
    'open_rate', v_winner.open_rate,
    'click_rate', v_winner.click_rate,
    'combined_score', v_winner.combined_score
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;