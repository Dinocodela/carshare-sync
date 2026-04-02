

## Plan: Add Collapsible Recent Trips and Recent Activity Sections

### What changes

1. **Add a "Recent Trips" collapsible section** above "Recent Activity" on the Dashboard. It will fetch the user's recent earnings (trips) directly from Supabase and display them as compact card items (similar to how RecentTrips works on the analytics page, but simplified for the dashboard).

2. **Make both "Recent Trips" and "Recent Activity" collapsible** using the existing `Collapsible` component from `@radix-ui/react-collapsible` (already in `src/components/ui/collapsible.tsx`). Each section gets a chevron toggle button that expands/collapses the content.

### Technical details

**File: `src/pages/Dashboard.tsx`**

- Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- Import `ChevronDown` icon (already imported as `ChevronRight`, add `ChevronDown`)
- Add two state variables: `tripsOpen` (default true) and `activityOpen` (default true)
- Add a new `useEffect` to fetch recent trips from `host_earnings` table (limited to 5), filtering by the user's car IDs (client) or host ID (host)
- Render a new "Recent Trips" collapsible section between Quick Actions and Recent Activity, showing trip ID, guest name, amount, status, and period in compact card format
- Wrap both "Recent Trips" and "Recent Activity" content in `Collapsible` with a clickable header that toggles open/closed with an animated chevron

### UI behavior
- Both sections default to open
- Tapping the section header toggles visibility with a smooth collapse animation
- Chevron icon rotates when expanded/collapsed

