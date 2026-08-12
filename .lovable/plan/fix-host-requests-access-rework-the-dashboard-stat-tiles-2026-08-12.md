# Fix host "Requests" access + rework the dashboard stat tiles

## What's happening with the Access Denied message

`/host-requests` checks `profiles.role === 'host'` directly and bounces anyone else back to the dashboard with "Only hosts can access this page." Your account isn't stored with `role = 'host'` (you operate in the host workspace as an admin), so the page rejects you even though you're viewing the host dashboard.

Fix: change the gate to allow anyone whose active workspace is host, who has the host workspace role, or who is a super-admin — instead of the single `profiles.role` string. Same behavior for real hosts, no more false rejection for you.

## Tile rework (host dashboard)

Today: Active / Requests / Hosted — where "Active" and "Hosted" both show 13 (same number, both are hosted cars), and Requests is almost always 0.

Proposed three tiles:

- **Hosted** — number of cars you host (keeps the existing tap-through to host car management)
- **Claims** — count of open claims (not paid, not closed), taps into the Claims tab of host car management
- **Requests** — kept, but only rendered when there is at least one pending request; when there are none the row shows just Hosted + Claims side by side

This removes the duplicate 13, surfaces something you actually act on, and keeps the requests entry point alive when it matters.

## Technical notes

- `src/pages/HostRequests.tsx`: replace the `profiles.role !== 'host'` redirect with a check using the workspace hook / `has_workspace_role` + `is_super`; keep the redirect for genuine non-hosts.
- `src/pages/Dashboard.tsx`: rebuild the host stat-tile array — drop `activeCars` duplicate, add a claims tile, conditionally include Requests when `pendingReqs > 0`; grid switches between 2 and 3 columns accordingly.
- Open-claims count: lightweight count query on `host_claims` for the host's cars where the claim isn't paid/closed, fetched in the existing dashboard data load.
- Claims tile navigates to `/host-car-management#claims`.
- Client (owner) dashboard is untouched.
