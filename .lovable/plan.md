

## Automate Co-Host Agreement Signing

After a client adds a car, a full-screen scrollable modal will appear showing the complete co-host agreement. The client must read through it, type their full name as an e-signature, and accept before proceeding. The signed agreement is recorded in the database.

### Database

**New table: `signed_agreements`**
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users)
- `car_id` (uuid, references cars)
- `agreement_version` (text) — e.g. "2025-v1"
- `signer_name` (text) — typed e-signature
- `signed_at` (timestamptz, default now())
- `ip_address` (text, nullable)

RLS: Users can insert their own rows and read their own rows.

### New Component: `CoHostAgreementModal`

A Dialog/Sheet component (`src/components/agreements/CoHostAgreementModal.tsx`) that:

1. Displays the full contract text in a scrollable container (all 7 pages of content hardcoded as structured JSX — headings, bullet lists, tables for fees)
2. Has a "scroll to bottom" indicator that fades once the user scrolls near the end
3. Shows a text input at the bottom for the client to type their full legal name
4. Has an "I Agree & Sign" button that is only enabled when:
   - The user has scrolled to the bottom
   - The name field is not empty
5. On accept: inserts a row into `signed_agreements`, then navigates to `/my-cars`

### Changes to AddCar.tsx

After the car is successfully created (line ~217), instead of immediately navigating to `/my-cars`:
- Store the new car ID in state
- Open the `CoHostAgreementModal`
- The modal's onComplete callback navigates to `/my-cars`

### Flow

```text
Client adds car → Car saved → Agreement modal opens
→ Client scrolls through contract → Types name → Clicks "I Agree & Sign"
→ Record saved to signed_agreements → Navigate to /my-cars
```

### Technical Details

- Agreement content is rendered as structured JSX matching the uploaded PDF (Teslys obligations, owner obligations, fees table, claims, etc.)
- The fill-in-the-blank fields (owner name, vehicle info, earnings split) will be auto-populated from the car data and profile data
- The `agreement_version` field allows updating the contract later without affecting old signatures
- No external PDF rendering needed — pure React components for reliability and responsiveness

