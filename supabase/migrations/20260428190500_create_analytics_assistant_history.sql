CREATE TABLE public.analytics_assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Analytics conversation',
  selected_year integer,
  selected_month integer,
  selected_car_id uuid,
  selected_car_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their analytics assistant conversations"
ON public.analytics_assistant_conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their analytics assistant conversations"
ON public.analytics_assistant_conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their analytics assistant conversations"
ON public.analytics_assistant_conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their analytics assistant conversations"
ON public.analytics_assistant_conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE public.analytics_assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.analytics_assistant_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their analytics assistant messages"
ON public.analytics_assistant_messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their analytics assistant messages"
ON public.analytics_assistant_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.analytics_assistant_conversations c
    WHERE c.id = analytics_assistant_messages.conversation_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their analytics assistant messages"
ON public.analytics_assistant_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX analytics_assistant_conversations_user_updated_idx
ON public.analytics_assistant_conversations (user_id, updated_at DESC);

CREATE INDEX analytics_assistant_messages_conversation_created_idx
ON public.analytics_assistant_messages (conversation_id, created_at ASC);

CREATE TRIGGER update_analytics_assistant_conversations_updated_at
BEFORE UPDATE ON public.analytics_assistant_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
