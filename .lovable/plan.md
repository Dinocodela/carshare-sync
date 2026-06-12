# Fix: "Invest in our fleet" link bounces back to login

## You're right — the link is broken

On the login screen, the **"Invest in our fleet"** card links to `/welcome/investor`. But that route currently sits **behind the authentication guard** (it requires being logged in, approved, AND subscribed). So a logged-out visitor who taps it gets immediately redirected back to the login/onboarding page. That's the loop you're seeing.

This is clearly unintended: the investor page is a **marketing/landing page** — it has a hero, "Reserve Your Spot" countdown, ROI calculator, testimonials, FAQ, and an **inquiry form** meant for prospective investors who don't have an account yet.

## The fix

Make the investor landing page publicly accessible and make its buttons behave sensibly for visitors who aren't logged in.

### 1. Make the route public
Move `/welcome/investor` out of the authenticated route group in `src/App.tsx` and place it with the other public routes (alongside the marketing/SEO pages), so it renders without requiring login.

### 2. Make the page handle logged-out visitors gracefully (`WelcomeInvestor.tsx`)
Right now several actions assume a logged-in user and would silently fail or bounce anonymous visitors:

- **"Back to app"** calls `switchWorkspace("client")`, which is a no-op when logged out. For anonymous visitors, send them to the home/login page (`/`) instead.
- **"Invest Now" / "Investor dashboard" / "See marketplace"** point to `/investor/marketplace`, which is also auth-gated and would bounce to login. For anonymous visitors, these should instead scroll to the **inquiry form** (or route to registration), so they can express interest without an account.
- **`markLandingSeen`** is a no-op when logged out — fine, no change needed.

The inquiry form itself already works for anonymous users (it submits `userId: null`), so prospects can submit interest directly.

Logged-in investor behavior stays exactly the same.

## Technical notes
- Only two files change: `src/App.tsx` (route placement) and `src/pages/welcome/WelcomeInvestor.tsx` (anonymous-user fallbacks for the nav/CTA buttons).
- No database, RLS, or edge-function changes.
- The `useWorkspace()` hook already tolerates a missing user (`availableRoles` empty, `switchWorkspace`/`markLandingSeen` early-return), so no hook changes are required.

## Verification
- Logged out: open login → tap "Invest in our fleet" → the investor landing page loads (no redirect). "Back to app" returns to login; CTAs scroll to the inquiry form; submitting the form works.
- Logged in as investor: page and dashboard/marketplace buttons behave as before.
