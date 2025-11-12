-- Create email templates table
CREATE TABLE IF NOT EXISTS public.newsletter_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  subject_template text NOT NULL,
  html_content jsonb NOT NULL,
  preview_text text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  is_default boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

-- Super admins can view all templates
CREATE POLICY "Super admins can view all templates"
  ON public.newsletter_templates
  FOR SELECT
  USING (is_super(auth.uid()));

-- Super admins can create templates
CREATE POLICY "Super admins can create templates"
  ON public.newsletter_templates
  FOR INSERT
  WITH CHECK (is_super(auth.uid()));

-- Super admins can update templates
CREATE POLICY "Super admins can update templates"
  ON public.newsletter_templates
  FOR UPDATE
  USING (is_super(auth.uid()));

-- Super admins can delete templates
CREATE POLICY "Super admins can delete templates"
  ON public.newsletter_templates
  FOR DELETE
  USING (is_super(auth.uid()));

-- Add template_id to campaigns
ALTER TABLE public.newsletter_campaigns 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.newsletter_templates(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_templates_created_by ON public.newsletter_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_template_id ON public.newsletter_campaigns(template_id);

-- Insert default templates
INSERT INTO public.newsletter_templates (name, description, subject_template, html_content, is_default, preview_text) VALUES
(
  'Simple Announcement',
  'Clean and simple template for announcements',
  'Important Update from Teslys',
  '{"sections": [{"type": "header", "content": {"logo": "Teslys", "backgroundColor": "#0EA5E9"}}, {"type": "hero", "content": {"title": "{{title}}", "subtitle": "{{subtitle}}", "backgroundColor": "#F0F9FF"}}, {"type": "text", "content": {"body": "{{body}}"}}, {"type": "button", "content": {"text": "Learn More", "url": "https://teslys.app", "backgroundColor": "#0EA5E9"}}, {"type": "footer", "content": {"text": "© 2025 Teslys. All rights reserved.", "unsubscribeText": "Unsubscribe from these emails"}}]}'::jsonb,
  true,
  'Stay updated with the latest from Teslys'
),
(
  'Feature Highlight',
  'Showcase new features with image and description',
  'New Feature: {{feature_name}}',
  '{"sections": [{"type": "header", "content": {"logo": "Teslys", "backgroundColor": "#0EA5E9"}}, {"type": "text", "content": {"body": "Hi {{first_name}},"}}, {"type": "image", "content": {"url": "https://via.placeholder.com/600x300", "alt": "Feature preview"}}, {"type": "text", "content": {"body": "{{description}}"}}, {"type": "button", "content": {"text": "Try It Now", "url": "{{cta_url}}", "backgroundColor": "#0EA5E9"}}, {"type": "footer", "content": {"text": "© 2025 Teslys. All rights reserved.", "unsubscribeText": "Unsubscribe from these emails"}}]}'::jsonb,
  true,
  'Discover what is new in Teslys'
),
(
  'Newsletter',
  'Multi-section newsletter with multiple content blocks',
  'Teslys Monthly Update - {{month}}',
  '{"sections": [{"type": "header", "content": {"logo": "Teslys", "backgroundColor": "#0EA5E9"}}, {"type": "hero", "content": {"title": "Monthly Update", "subtitle": "{{month}} {{year}}", "backgroundColor": "#F0F9FF"}}, {"type": "text", "content": {"body": "Hi {{first_name}}, Here is what is new this month:"}}, {"type": "divider", "content": {}}, {"type": "text", "content": {"body": "**Section 1:** {{section1_content}}"}}, {"type": "divider", "content": {}}, {"type": "text", "content": {"body": "**Section 2:** {{section2_content}}"}}, {"type": "button", "content": {"text": "Read More", "url": "{{blog_url}}", "backgroundColor": "#0EA5E9"}}, {"type": "footer", "content": {"text": "© 2025 Teslys. All rights reserved.", "unsubscribeText": "Unsubscribe from these emails"}}]}'::jsonb,
  true,
  'Your monthly Teslys newsletter'
);