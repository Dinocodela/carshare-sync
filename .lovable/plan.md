

# Phase 5: Growth Programs, Insurance Partnership, and Backend Split Logic

## Overview

This phase covers four major initiatives: Bonzah insurance partnership for hosts, military member program, fleet discount, first-month free promo, and a reservation/booking system for hosts.

---

## 1. Bonzah Insurance Partnership (Host-facing)

**What**: A new section on the host Dashboard + a dedicated info page letting hosts know about the Bonzah rental insurance partnership. Hosts can either fill out a quick interest form (stored in DB) or contact agent Brandon Rockow directly.

**Implementation**:
- Create `src/pages/BonzahInsurance.tsx` -- informational page with Bonzah branding, benefits of rental insurance, and two CTAs:
  - "Request Setup" form (name, email, phone, car count) -- inserts into a new `insurance_inquiries` table
  - Direct contact info: Brandon Rockow, Tel: 515-726-6924, Mobile: 515-444-5669
- Add a banner/card on the host Dashboard linking to `/bonzah-insurance`
- Route in `App.tsx` under authenticated/approved/subscribed host routes

**Database**: New `insurance_inquiries` table (id, user_id, name, email, phone, car_count, status default 'pending', created_at). RLS: users insert own, super admins view all.

---

## 2. Military Program Landing Page + Backend Split

**What**: A public landing page at `/military` targeting active-duty members going on deployment. Teslys is veteran-owned and offers an 85/15 split (client keeps 85%, host gets 15%).

**Implementation**:
- Create `src/pages/MilitaryProgram.tsx` -- public page with:
  - Hero: "Veteran-Owned. Military-Ready." messaging
  - Value prop: earn money on your car during deployment, 85/15 split, full management
  - CTA to `/register/client` with `?program=military` UTM
  - SEO + structured data
- Route `/military` in `App.tsx`
- Update sitemap

**Backend split logic**:
- Add `profit_program` column (text, nullable) to `profiles` table -- values: `military`, `fleet_5plus`, `first_month_free`, or null (standard)
- Modify `create-host-earning` edge function to check the car owner's profile `profit_program` and override `client_profit_percentage`/`host_profit_percentage` accordingly:
  - `military` → 85/15
  - `fleet_5plus` → 80/20
  - `first_month_free` → 100/0 (only for earnings within first 30 days of profile creation)
  - default → 70/30

---

## 3. Fleet Discount (5+ Cars = 80/20 Split)

**What**: Clients with 5+ cars on the platform get an 80/20 split automatically.

**Implementation**:
- In the `create-host-earning` edge function, count the client's total cars. If >= 5, apply 80/20 split (unless military program gives better rate).
- Add a marketing section on the `/get-started` page mentioning the fleet discount
- Add to FAQ page

---

## 4. First Month Free Promo (Limited-Time)

**What**: New clients get 100% of earnings for their first month (no 30% host commission). Limited-time promotion.

**Implementation**:
- Add `promo_start_date` column to `profiles` (timestamp, nullable) -- set on registration when promo is active
- Create a `promotions` table: id, name, type ('first_month_free'), is_active, start_date, end_date, created_at
- In `create-host-earning`, check if client has `promo_start_date` set and earning falls within 30 days of it → apply 100/0 split
- Add promo banner on the landing page (Index.tsx) and `/get-started` when promo is active
- Add promo info to FAQ

---

## 5. Host Reservation System

**What**: Allow hosts to create and manage reservations for their clients' cars, enabling them to generate income by booking cars for guests.

**Implementation**:
- New `reservations` table: id, host_id, car_id, guest_name, guest_email, guest_phone, start_date, end_date, daily_rate, total_amount, status ('pending'/'confirmed'/'completed'/'cancelled'), notes, payment_source, created_at, updated_at
- RLS: hosts insert/update/view own, clients view reservations for their cars
- Create `src/pages/HostReservations.tsx` -- list + create reservations with a form
- Create `src/components/booking/ReservationForm.tsx` -- form for adding reservations (select car, guest info, dates, rate)
- Add `src/components/booking/AvailabilityCalendar.tsx` -- visual calendar showing existing bookings and available dates
- Route `/host-reservations` under host-authenticated routes
- Add nav link in sidebar for hosts

---

## 6. Split Priority Logic

When multiple programs apply, use the best rate for the client:
1. First month free (100/0) -- highest priority during promo period
2. Military (85/15)
3. Fleet 5+ (80/20)
4. Standard (70/30)

---

## Database Migrations Required

1. `profiles` table: add `profit_program` (text, nullable), `promo_start_date` (timestamptz, nullable)
2. New `insurance_inquiries` table
3. New `promotions` table
4. New `reservations` table

## Files to Create/Edit

| Action | File |
|--------|------|
| Create | `src/pages/BonzahInsurance.tsx` |
| Create | `src/pages/MilitaryProgram.tsx` |
| Create | `src/pages/HostReservations.tsx` |
| Create | `src/components/booking/ReservationForm.tsx` |
| Edit | `supabase/functions/create-host-earning/index.ts` -- add split override logic |
| Edit | `src/App.tsx` -- add routes |
| Edit | `src/pages/Dashboard.tsx` -- add Bonzah card for hosts |
| Edit | `src/pages/GetStarted.tsx` -- add fleet discount + promo sections |
| Edit | `src/pages/FAQ.tsx` -- add military, fleet, promo FAQs |
| Edit | `src/pages/Index.tsx` -- add promo banner |
| Edit | `src/components/layout/AppSidebar.tsx` -- add host reservations nav |
| Edit | `public/sitemap.xml` -- add new URLs |

