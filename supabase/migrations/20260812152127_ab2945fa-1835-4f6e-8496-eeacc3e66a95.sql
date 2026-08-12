INSERT INTO public.social_media_assets (post_id, storage_path, kind, mime_type, position, alt_text)
VALUES ('4088c69f-7fe3-47fa-aff1-45704dd27ba7', '/wraps/previews/Neon_Velocity-preview-v2.jpg', 'image', 'image/jpeg', 0, 'Neon Velocity digital Tesla wrap preview');

UPDATE public.social_posts
SET format = 'image', status = 'scheduled', last_error = NULL
WHERE id = '4088c69f-7fe3-47fa-aff1-45704dd27ba7';