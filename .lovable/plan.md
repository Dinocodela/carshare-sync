# Tesla Eligibility Criteria & Gating

## Goal
Stop wasted signups/submissions by clearly showing which Teslas we currently accept, and blocking ineligible cars at the Add Car step with a helpful message.

## Accepted vehicles (single source of truth)
- Model X — 2022 and newer
- Cybertruck — 2024 and newer
- Model Y — 2026 and newer
- Model 3 — 2026 and newer
- Any other make/model, or a Tesla below the year cutoff → **not accepted right now**

Limited spots due to high demand.

## What we'll build

### 1. Shared criteria config + checker (`src/lib/eligibility.ts`)
- A single list of accepted `{ model, minYear }` rules and a `checkTeslaEligibility(make, model, year)` helper returning eligible/ineligible + reason.
- Reused by both the display notice and the form validation so the rules live in one place.

### 2. Upfront notice (before they invest time)
Add a compact "Currently accepting" panel listing the accepted models/years + limited-availability note on:
- **Get Started page** (`src/pages/GetStarted.tsx`) — placed near the hero/CTA so leads see it before registering.
- **Add Car page** (`src/pages/AddCar.tsx`) — a banner at the top of the form.

Copy example:
```text
We're currently at limited capacity due to high demand.
Right now we're only accepting:
• Model X (2022 & newer)
• Cybertruck (2024 & newer)
• Model Y (2026 & newer)
• Model 3 (2026 & newer)
```

### 3. Enforce on submit (`src/pages/AddCar.tsx`)
- On form submit, run `checkTeslaEligibility` on make/model/year **before** creating the car.
- If ineligible, block the insert and show a clear message (toast + inline note) explaining the current criteria and that we're at capacity — the car is not saved and no further action is taken.
- If eligible, continue with the existing create-car + agreement flow unchanged.
- Make the Model field a select limited to the accepted Tesla models (Model X, Model Y, Model 3, Cybertruck) and default Make to "Tesla" to reduce invalid entries.

## Out of scope / notes
- No database changes and no new "waitlist" status — per your decision this is a clear "here's what we accept" message, not a stored waitlist.
- Business logic stays minimal and confined to the eligibility helper + Add Car submit check.
