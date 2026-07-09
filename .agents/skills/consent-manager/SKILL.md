---
name: consent-manager
description: Drop-in Privacy & Consent Management System (cookie banner, Ketch-style preferences modal, gated tracking scripts, Privacy Center, Cookie Policy) for React + Vite + Tailwind + shadcn apps. Use when the user asks to add cookie consent, a privacy/consent manager, CCPA/CPRA/GDPR consent, or block analytics until consent.
---

# Consent Manager

A reusable, config-driven consent system. Only ONE file changes per project:
`src/config/consent.config.ts`. Everything else is portable as-is.

## What it does
- Non-blocking cookie banner on first visit (no backdrop, no scroll lock).
- Ketch-style preferences modal: intro copy, "Purposes" heading with inline
  Reject All / Accept All, one expandable row per purpose (shows "Legal Basis:"
  + toggle), "Always Active" for essentials, Save Choices button.
- Tracking scripts (GTM, GA4, Meta Pixel, etc.) load ONLY after consent for
  their category is granted. Idempotent + try/catch so a bad tag can't break the app.
- `/privacy-center` (manage prefs + data rights) and `/cookie-policy` pages.
- localStorage persistence: version, ISO timestamp, 6-month expiry, browserId.
  Re-prompts on version bump or expiry.

## How to install into a new project

1. Copy every file from `assets/` into `src/` preserving structure:
   - `assets/config/consent.config.ts`        → `src/config/consent.config.ts`
   - `assets/lib/consent/*`                    → `src/lib/consent/`
   - `assets/hooks/useConsent.tsx`             → `src/hooks/useConsent.tsx`
   - `assets/components/consent/*`             → `src/components/consent/`
   - `assets/pages/CookiePolicy.tsx`          → `src/pages/CookiePolicy.tsx`
   - `assets/pages/PrivacyCenter.tsx`         → `src/pages/PrivacyCenter.tsx`

2. Verify shadcn primitives exist: `dialog`, `switch`, `scroll-area`, `button`.
   If missing, add them (`npx shadcn@latest add dialog switch scroll-area button`).

3. Wrap the app root in `<ConsentProvider>` and mount `<ConsentManager />` once
   inside it (near the root, e.g. in `App.tsx`).
   ```tsx
   import { ConsentProvider } from "@/hooks/useConsent";
   import { ConsentManager } from "@/components/consent/ConsentManager";
   // <ConsentProvider> ...routes... <ConsentManager /> </ConsentProvider>
   ```

4. Add routes: `/privacy-center` → `PrivacyCenter`, `/cookie-policy` → `CookiePolicy`.
   Add footer links to both plus the Privacy Policy.

5. CRITICAL: Remove any hardcoded analytics/GTM/pixel `<script>` from `index.html`
   and from app code. Nothing may track before consent — all tags must run only
   through a `services[].load()` in the config.

6. Edit ONLY `src/config/consent.config.ts` for the new site:
   - `brand`: productName, companyName, websiteUrl, privacyEmail, supportEmail,
     address, effectiveDate.
   - `services`: add one entry per real tracking tag with its `load()` function
     and correct `category`. Delete GTM if the site doesn't use it.
   - `cookies`: update the cookie table rows to match the real tags.
   - `categories`: usually leave as-is (Analytics, Behavioral Advertising,
     Functional, Essential Services).
   - Bump `CONSENT_VERSION` only when categories/services materially change.

7. Typecheck/build. Confirm no tracking fires before Accept, and that Reject
   keeps tags off.

## Design
Uses the app's semantic design tokens (no hardcoded colors) so it inherits each
project's theme. The banner/modal use rounded-3xl + backdrop-blur; adjust to the
host app's visual language if needed, but keep tokens semantic.

## Reusability across projects
This system was built to drop into any React+Vite+Tailwind+shadcn site
(e.g. Teslys, Manifesting Bestie, BlurMyHouse, StreetPrivacy). Keep the config
as the single edit point — never fork the logic per project.
