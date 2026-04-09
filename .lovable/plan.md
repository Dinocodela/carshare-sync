

# Set Up Daily Blog Post Cron Job

## Problem
The `generate-blog-post` edge function exists and works, but no `pg_cron` job was ever created to trigger it daily. Only 2 blog posts exist, last one from April 3rd.

## Solution
Insert a `pg_cron` job to call the `generate-blog-post` edge function daily at 12 PM EST (16:00 UTC).

## Implementation

**Run SQL via Supabase insert tool** (not migration, since it contains project-specific secrets):

```sql
SELECT cron.schedule(
  'generate-daily-blog-post',
  '0 16 * * *',
  $$
  SELECT net.http_post(
    url:='https://texsltzecmvqprdjxtnh.supabase.co/functions/v1/generate-blog-post',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleHNsdHplY212cXByZGp4dG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTA0NTYsImV4cCI6MjA2OTQ4NjQ1Nn0.WNBXKASoTntVC7mF6yAoHc0_6UbMUp3Sv9NCm3AzCZ4"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);
```

This schedules the function to run every day at 4 PM UTC (12 PM EST). No file changes needed — just the cron job insertion.

