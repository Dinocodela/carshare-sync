-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the welcome email processing job to run every 5 minutes
SELECT cron.schedule(
  'process-welcome-emails-every-5-minutes',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://texsltzecmvqprdjxtnh.supabase.co/functions/v1/process-welcome-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleHNsdHplY212cXByZGp4dG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTA0NTYsImV4cCI6MjA2OTQ4NjQ1Nn0.WNBXKASoTntVC7mF6yAoHc0_6UbMUp3Sv9NCm3AzCZ4"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);