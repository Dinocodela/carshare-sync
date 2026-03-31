

## Fix: Replace irrelevant "Hosted Cars Management" link on Client Analytics

### Problem
The Client Analytics banner contains a link to `/host-car-management`, which is a host-only page. Clients clicking it see "No cars currently hosted" -- confusing and unhelpful.

### What Will Change

**1 file: `src/pages/ClientAnalytics.tsx`**

- Replace the "Hosted Cars Management" link (pointing to `/host-car-management`) with a link to **`/my-cars`** labeled **"My Cars"**
- Update the surrounding copy to be client-appropriate, e.g.:
  > "Track your vehicle's performance and earnings. Manage your vehicles in **My Cars**."

This is a single-line text/link change -- no new components, no logic changes.

