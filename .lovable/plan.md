# Teslys Shop — Dropshipping Storefront Plan

Goal: sell Tesla-related accessories as a standalone storefront on your existing Teslys site, with dropshipping so you never buy or hold inventory, and full ad-conversion tracking for Google + Meta.

## How dropshipping works here (no merch to buy)
Shopify is the engine: it holds the product catalog, cart, checkout, and orders. A dropshipping supplier app (DSers/AliExpress, Zendrop, or Spocket) connects to Shopify. When a customer buys, the order is auto-forwarded to the supplier who ships directly to the buyer. You never touch inventory. Supplier app connection is a one-time setup you do inside Shopify's admin (I'll guide you), and product importing/order routing is automated after that.

## Phase 1 — Enable Shopify (new store)
- Create a new Shopify development store (free while we build; you claim it later for a 30-day trial, paid plan needed only to go live and sell).
- After creation, offer the claim step (you can skip and keep building).

## Phase 2 — Product catalog
Seed the catalog with your Tesla accessory lineup:
- Phone mount, USB-C fast charger, MagSafe car charger, backseat phone/tablet holder
- Trunk organizer, travel cable organizer, center console organizer, cup holder organizer, car trash bin
- Neck pillows, windshield/glass-roof sunshade
- All-weather floor mats, trunk/frunk mats, seat-back protectors, door sill protectors
- Screen protector, mud flaps, wheel/rim protectors

Each product gets title, description, price, images, and variants (e.g. Model 3/Y/S/X fitment where relevant). Products can be created via Shopify, then refined; dropshipping supplier apps can also push their own product data/images in.

## Phase 3 — Standalone storefront in the app
Build a dedicated shop experience linked from the main Teslys site:
- `/shop` — product grid with category filters (charging, organization, protection, comfort, exterior)
- `/shop/:handle` — product detail with images, variant selector, add-to-cart
- Cart drawer + checkout handoff to Shopify's secure hosted checkout
- Reuse existing Teslys design tokens/components for a consistent look; add a clear entry point (nav link / CTA) from the main site so your existing traffic flows to the shop.

## Phase 4 — Ads + conversion tracking (Google & Meta)
So your ad spend is measurable:
- Meta Pixel + Conversions API events on product view, add-to-cart, initiate-checkout, purchase.
- Google Ads / GA4 tag with the same funnel events + purchase conversion.
- Reuse the existing UTM-capture pattern (already in the codebase) so campaign attribution persists into orders.
- GTM is already integrated — I'll wire the shop events through it where possible.
- Note: the most reliable purchase conversion fires from Shopify checkout; I'll set up the on-site funnel events and document the checkout-side conversion setup in your Shopify admin.

## Technical notes
- New store creation and the supplier/dropshipping app connection happen in Shopify's admin (steps I'll walk you through) — those can't be scripted from here.
- Storefront pages are React and deploy with the rest of the app; you control when to publish them.
- Physical-goods checkout, payments, shipping, and taxes are handled by Shopify + the supplier, not custom code.

## First step on approval
Enable Shopify (new store), then start seeding the product catalog and building the `/shop` pages.