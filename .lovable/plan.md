

## Add "Rent A Tesla" Button to Index Page

Import and render the existing `RentATeslaLink` component on the Index/login page, identical to how it appears on the onboarding screens.

### Changes

**`src/pages/Index.tsx`**
- Add import: `import { RentATeslaLink } from "@/components/RentATeslaLink";`
- Render `<RentATeslaLink />` inside the page, right after the structured data tags and before the main `<div>`. This places the fixed-position button in the top-right corner.

No other files need changes -- the `RentATeslaLink` component already handles all styling and positioning.

