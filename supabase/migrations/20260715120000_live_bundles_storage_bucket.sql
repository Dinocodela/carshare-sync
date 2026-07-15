-- Private storage bucket for Capgo self-hosted live-update bundles.
--
-- Holds:
--   * latest.json          -> manifest { version, path, checksum, releasedAt, commit }
--   * <version>.zip         -> the built web bundle for each published version
--
-- The bucket is PRIVATE. Both writers (the CI/CD workflow) and the reader (the
-- `live-update` edge function) use the service-role key, which bypasses RLS, so
-- no anon/authenticated storage policies are required or wanted here — devices
-- never touch this bucket directly, they download via a short-lived signed URL
-- minted by the edge function.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'live-bundles',
  'live-bundles',
  false,
  52428800, -- 50 MiB, matches the project-wide storage limit
  ARRAY['application/zip', 'application/json']
)
ON CONFLICT (id) DO NOTHING;
