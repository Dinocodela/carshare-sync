# Client push notifications on payment completed

## Goal
When a host marks a client's earning as **paid**, the client should get:
- An **email** — already working (`send-client-commission-paid`).
- A **push notification on their phone** (installed native app) — currently broken.

## Why it's broken today
1. `send-client-commission-paid` calls `push-send` using a **service-role** token. `push-send` runs `auth.getUser()` on that token, which is not a real user, so it returns **401** and no push is sent.
2. Even if that call succeeded, `push-send` only sends **Web Push** (VAPID → `push_subscriptions`). It never sends **native FCM** (→ `push_devices`), which is what the installed app relies on. FCM credentials already exist as secrets (`FCM_PROJECT_ID`, `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY`) but nothing uses them for sending.

## Changes

### 1. Add native FCM sending to `push-send`
- Add a helper that mints a Google OAuth access token from the service-account secrets (`FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY`, `FCM_PROJECT_ID`) and POSTs to the FCM HTTP v1 endpoint (`https://fcm.googleapis.com/v1/projects/{FCM_PROJECT_ID}/messages:send`).
- Look up the target user's rows in `push_devices` where `muted = false` and `revoked_at IS NULL`, and send each token an FCM message (title, body, and a `data.url` so tapping opens the right screen — reusing the existing `attachNotificationNavigation` handler).
- On FCM `404`/`UNREGISTERED` responses, delete the stale device token (mirrors the existing web-push cleanup).
- Keep the existing Web Push (`push_subscriptions`) delivery so browser/PWA users still work. The function sends to whatever the user has registered.

### 2. Allow trusted server-to-server calls to `push-send`
- Detect when the incoming `Authorization` bearer equals `SUPABASE_SERVICE_ROLE_KEY`. In that case, treat the call as trusted internal and honor `targetUserId` without requiring a signed-in user.
- Keep the current rule for normal callers: a regular user can only push to themselves; targeting another user still requires `is_super_admin`.
- This unblocks the payment flow while preserving the existing security posture (memory: `targetUserId` restricted to super-admins for end-user callers).

### 3. Payment flow stays as-is
- `send-client-commission-paid` already invokes `push-send` with `targetUserId: car.client_id` and a good title/body/url. No change needed there beyond it now succeeding. The email path is untouched.

## Verification
- Deploy `push-send`.
- Mark a test earning as **paid** for a client who has the app installed and notifications enabled, and confirm the phone receives the push (and the existing email still arrives).
- Check `push-send` edge logs for FCM send results / token cleanup.

## Notes
- Requires the client to have opened the installed app and enabled notifications (you confirmed this is done) so a row exists in `push_devices`.
- No schema/table changes — `push_devices` and `push_subscriptions` already exist. This is edge-function-only work.
