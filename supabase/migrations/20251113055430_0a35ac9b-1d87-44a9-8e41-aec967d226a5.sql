-- Create email template gallery table
CREATE TABLE IF NOT EXISTS public.email_template_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('saas', 'ecommerce', 'service', 'general', 'onboarding', 'promotional')),
  industry TEXT NOT NULL,
  preview_image TEXT,
  thumbnail_image TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_template_gallery ENABLE ROW LEVEL SECURITY;

-- Everyone can view templates
CREATE POLICY "Anyone can view gallery templates"
  ON public.email_template_gallery
  FOR SELECT
  USING (true);

-- Super admins can manage templates
CREATE POLICY "Super admins can manage gallery templates"
  ON public.email_template_gallery
  FOR ALL
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));

-- Create indexes
CREATE INDEX idx_gallery_category ON public.email_template_gallery(category);
CREATE INDEX idx_gallery_industry ON public.email_template_gallery(industry);
CREATE INDEX idx_gallery_featured ON public.email_template_gallery(is_featured);
CREATE INDEX idx_gallery_tags ON public.email_template_gallery USING GIN(tags);

-- Insert sample templates
INSERT INTO public.email_template_gallery (name, description, category, industry, subject, html_content, tags, is_featured) VALUES
(
  'Welcome to Your SaaS Journey',
  'Clean and modern welcome email perfect for SaaS products. Highlights key features and next steps.',
  'saas',
  'SaaS',
  'Welcome to {{company_name}} - Let''s Get Started! 🚀',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', ''Roboto'', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome, {{first_name}}! 🎉</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We''re excited to have you on board</p>
    </div>
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
        Hi {{first_name}},
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
        Thank you for joining us! We''re thrilled to help you achieve your goals. Here''s what you can do next:
      </p>
      <div style="background: #f6f9fc; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333;">✨ Quick Start Guide</h3>
        <ul style="margin: 0; padding-left: 20px; color: #666666; line-height: 1.8;">
          <li>Complete your profile setup</li>
          <li>Explore our key features</li>
          <li>Connect your first integration</li>
          <li>Join our community</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Get Started Now
        </a>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 30px 0 0 0;">
        Need help? Reply to this email or check out our <a href="#" style="color: #667eea;">help center</a>.
      </p>
    </div>
    <div style="background: #f6f9fc; padding: 20px; text-align: center; border-top: 1px solid #e6e9ec;">
      <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
  ARRAY['welcome', 'onboarding', 'saas', 'modern'],
  true
),
(
  'E-Commerce Welcome & Discount',
  'Engaging welcome email for e-commerce with first purchase discount code. Perfect for online stores.',
  'ecommerce',
  'E-Commerce',
  'Welcome! Here''s 15% Off Your First Order 🎁',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', ''Roboto'', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="padding: 40px 30px; text-align: center;">
      <h1 style="color: #333333; margin: 0 0 10px 0; font-size: 32px; font-weight: bold;">Welcome, {{first_name}}!</h1>
      <p style="color: #666666; margin: 0; font-size: 16px;">Thanks for joining our family</p>
    </div>
    <div style="background: #ff6b6b; color: #ffffff; padding: 30px; text-align: center; margin: 0 30px; border-radius: 12px;">
      <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Your Exclusive Welcome Gift</p>
      <h2 style="margin: 0 0 20px 0; font-size: 42px; font-weight: bold;">15% OFF</h2>
      <div style="background: #ffffff; color: #ff6b6b; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 20px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">
        WELCOME15
      </div>
      <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.9;">Use this code at checkout</p>
    </div>
    <div style="padding: 40px 30px;">
      <h3 style="color: #333333; margin: 0 0 20px 0; font-size: 20px; text-align: center;">Why You''ll Love Shopping With Us</h3>
      <div style="margin: 30px 0;">
        <div style="display: table; width: 100%; margin-bottom: 20px;">
          <div style="display: table-cell; vertical-align: top; padding-right: 15px;">
            <div style="width: 40px; height: 40px; background: #ff6b6b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px;">✓</div>
          </div>
          <div style="display: table-cell; vertical-align: top;">
            <h4 style="margin: 0 0 5px 0; color: #333333; font-size: 16px;">Free Shipping</h4>
            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">On orders over $50</p>
          </div>
        </div>
        <div style="display: table; width: 100%; margin-bottom: 20px;">
          <div style="display: table-cell; vertical-align: top; padding-right: 15px;">
            <div style="width: 40px; height: 40px; background: #ff6b6b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px;">✓</div>
          </div>
          <div style="display: table-cell; vertical-align: top;">
            <h4 style="margin: 0 0 5px 0; color: #333333; font-size: 16px;">Easy Returns</h4>
            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">30-day return policy</p>
          </div>
        </div>
        <div style="display: table; width: 100%; margin-bottom: 20px;">
          <div style="display: table-cell; vertical-align: top; padding-right: 15px;">
            <div style="width: 40px; height: 40px; background: #ff6b6b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px;">✓</div>
          </div>
          <div style="display: table-cell; vertical-align: top;">
            <h4 style="margin: 0 0 5px 0; color: #333333; font-size: 16px;">Quality Products</h4>
            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">Carefully curated selection</p>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin: 40px 0 20px 0;">
        <a href="#" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Start Shopping
        </a>
      </div>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center;">
      <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Your Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
  ARRAY['welcome', 'discount', 'ecommerce', 'promotional'],
  true
),
(
  'Professional Services Welcome',
  'Elegant welcome email for service-based businesses. Establishes credibility and next steps.',
  'service',
  'Professional Services',
  'Welcome to {{company_name}} - Your Success Partner',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Georgia, serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="padding: 40px 30px; border-bottom: 3px solid #2c3e50;">
      <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: normal; text-align: center;">Welcome, {{first_name}}</h1>
    </div>
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 0 0 20px 0;">
        Dear {{first_name}},
      </p>
      <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 0 0 20px 0;">
        Thank you for choosing to work with us. We are committed to providing you with exceptional service and delivering outstanding results.
      </p>
      <div style="background: #f8f9fa; border-left: 4px solid #2c3e50; padding: 20px; margin: 30px 0;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2c3e50; font-weight: normal;">What Happens Next?</h3>
        <ol style="margin: 0; padding-left: 20px; color: #555555; line-height: 2;">
          <li>We''ll review your requirements in detail</li>
          <li>Schedule an initial consultation call</li>
          <li>Create a customized action plan</li>
          <li>Begin working toward your goals</li>
        </ol>
      </div>
      <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 30px 0 20px 0;">
        Our team will reach out within 24 hours to schedule your consultation. In the meantime, feel free to explore our resources or reach out with any questions.
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" style="display: inline-block; background: #2c3e50; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif;">
          Schedule Consultation
        </a>
      </div>
      <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 30px 0 0 0;">
        Best regards,<br>
        <strong>The {{company_name}} Team</strong>
      </p>
    </div>
    <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Need immediate assistance?</p>
      <p style="margin: 0; color: #999999; font-size: 13px;">
        Email: <a href="mailto:hello@yourcompany.com" style="color: #2c3e50; text-decoration: none;">hello@yourcompany.com</a><br>
        Phone: (555) 123-4567
      </p>
      <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px;">© 2025 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
  ARRAY['welcome', 'professional', 'service', 'consultation'],
  true
),
(
  'Minimalist Welcome',
  'Clean and simple welcome email. Works great for any industry that values simplicity.',
  'general',
  'General',
  'Welcome aboard, {{first_name}}!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', ''Roboto'', sans-serif;">
  <div style="max-width: 560px; margin: 60px auto; padding: 40px 20px;">
    <h1 style="color: #000000; margin: 0 0 30px 0; font-size: 32px; font-weight: 300; text-align: center;">
      Welcome, {{first_name}}
    </h1>
    <p style="font-size: 18px; line-height: 1.6; color: #333333; margin: 0 0 20px 0; text-align: center;">
      We''re glad you''re here.
    </p>
    <div style="border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; padding: 40px 0; margin: 40px 0; text-align: center;">
      <p style="font-size: 16px; line-height: 1.8; color: #666666; margin: 0 0 30px 0;">
        Thank you for joining us. We''re excited to help you get started and make the most of your experience.
      </p>
      <a href="#" style="display: inline-block; background: #000000; color: #ffffff; text-decoration: none; padding: 12px 30px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">
        Get Started
      </a>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #999999; margin: 30px 0 0 0; text-align: center;">
      Have questions? <a href="#" style="color: #000000; text-decoration: underline;">Get in touch</a>
    </p>
  </div>
</body>
</html>',
  ARRAY['welcome', 'minimalist', 'simple', 'clean'],
  true
);