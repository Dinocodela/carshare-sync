

## Plan: Fix Email Confirmation Redirect

### Problem
When a user signs up, the confirmation email link redirects to `lovableproject.com` (the Lovable editor preview) instead of the actual app. This happens because `emailRedirectTo` uses `window.location.origin`, which resolves to the preview URL during testing.

### Fix

**File: `src/hooks/useAuth.tsx`**

Change the `emailRedirectTo` from `window.location.origin` to the production URL `https://teslys.app/`. This ensures confirmation emails always redirect to the real app regardless of where the signup was initiated.

```typescript
// Before
const redirectUrl = `${window.location.origin}/`;

// After
const redirectUrl = "https://teslys.app/";
```

### Existing Flow (already works, just needs the correct redirect)
1. User clicks confirmation link → lands on `https://teslys.app/` with hash params
2. `AuthCallbackHandler` detects `type=signup` + `access_token` → redirects to `/email-confirmed`
3. `/email-confirmed` page shows "Email Confirmed! Your account is now under review"
4. User signs in → `RequirePending` guard sends them to `/account-pending` until admin approves

No other file changes needed — the post-confirmation pages already exist and show the correct "under review" messaging.

### Files Modified
- `src/hooks/useAuth.tsx` — hardcode production redirect URL

