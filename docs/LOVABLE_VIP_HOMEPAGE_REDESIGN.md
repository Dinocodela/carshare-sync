# Teslys VIP Homepage Redesign

## Objective

Redesign the public Teslys homepage so first-time visitors immediately understand the two separate services:

1. **Rent a Tesla** — for drivers seeking daily, weekly, or monthly rentals.
2. **List My Tesla** — for Tesla owners seeking professional vehicle management and rental income.

The primary conversion problem is rental visitors entering the management/account flow. The rental path must remain visible without opening a navigation menu.

## Visual direction

- Mobile-first, premium and upscale.
- Feels like a private automotive concierge service rather than a generic SaaS page.
- Warm ivory background, deep navy, refined teal and restrained gold accents.
- Generous white space, subtle borders, restrained shadows and large tap targets.
- Luxury serif headings with clean sans-serif body copy.
- Avoid oversized sections, childish icon cards, bright blue UI, heavy gradients and generic stock-template layouts.

## Typography

- Display/headings: **Cormorant Garamond**, weights 400–600.
- UI/body: **Manrope**, weights 400–700.

## Brand colors

- Deep navy: `#03171D`
- Navy: `#07343A`
- Teal: `#07888B`
- Aqua: `#58CDD0`
- Warm ivory: `#FBF7F1`
- Warm white: `#FFFDFA`
- Ink: `#071A24`
- Body text: `#586473`
- Muted text: `#7A8490`
- Gold: `#B89555`
- Warm border: `#DED6CA`

## Homepage structure

### 1. Hero

- Teslys logo and wordmark.
- Small `VIP EXPERIENCE` badge.
- Heading: `Choose Your Teslys Experience`.
- Supporting copy: `Premium Teslas. Exceptional service. Effortless earnings.`
- Do not lead with passive-income-only copy because it makes rental visitors think they are on the wrong website.

### 2. Experience selector

Two primary cards, stacked on mobile and side-by-side on larger screens.

#### Rent a Tesla

- Label: `For drivers`
- Description: `Premium Teslas delivered ready to drive. Rent by the day, week, or month.`
- CTA: `Explore Rentals`
- Destination: `https://app.eonrides.com`
- This card receives the stronger visual treatment.

#### List My Tesla

- Label: `For owners`
- Description: `Turn your Tesla into passive income. We handle rentals, cleaning, and guests.`
- CTA: `Start Earning`
- Destination: current Teslys owner account/application flow.

### 3. Earnings CTA

- Heading: `Calculate Your Earnings`
- Supporting copy: `See your potential monthly income in minutes.`
- Destination: `/earnings-calculator`

### 4. Trust row

Keep compact on mobile:

- Fully Insured — Protected trips
- Concierge — Personal support
- Top Rated — Five-star care

### 5. Reviews and app download

- Keep the existing reviews functionality.
- Keep valid App Store and Google Play links.
- Restyle containers to match the premium design system.

## Wrong-funnel safeguard

Whenever a visitor enters the management/account experience, display a clear banner:

> Looking to rent a Tesla instead? You are currently in the vehicle-management experience.

CTA routes directly to `https://app.eonrides.com`.

## Responsive rules

### Mobile below 640px

- Horizontal padding: 18px.
- Cards stacked in one column.
- Main cards: minimum 330px high.
- CTA buttons: minimum 52px high.
- No horizontal overflow.
- Heading should remain readable on a 390px viewport.

### Tablet and desktop

- Maximum content width: approximately 1024px.
- Experience cards become two columns.
- Do not stretch mobile cards edge-to-edge across large screens.

## Functional constraints

- Preserve authentication, Supabase, tracking, native Capacitor behavior and current account routes.
- Preserve GTM intent event: `landing_intent_selected`.
- Preserve local storage key: `teslys_intent`.
- Do not change backend logic, registration behavior, dashboard routing or earnings calculator behavior.
- Rental CTA must never route into the management application.

## Assets to add during the visual-polish pass

Place optimized assets under `public/images/teslys/`:

- `teslys-luxury-hero.webp`
- `tesla-rental-black-transparent.webp`
- `teslys-key-fob.webp`
- `teslys-testimonial-property.webp`

Use WebP or AVIF, responsive `srcset`, meaningful alt text and lazy loading below the fold. Do not place important wording inside images.

## Acceptance criteria

1. Visitors can distinguish renting from listing within three seconds.
2. Rental access is visible without opening the mobile menu.
3. Rental visitors do not enter the management flow without seeing a correction route.
4. The page has no horizontal scrolling at 390px.
5. Buttons meet a minimum 44px tap target.
6. The two services remain visually distinct.
7. Existing authentication and account flows still function.
8. The design looks premium and restrained, not playful or template-driven.
