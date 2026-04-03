

## Add Company Address & Phone to Landing Page

Add the business address and phone number to the landing page footer and trust indicators section to reinforce legitimacy.

### Changes

**`src/pages/Index.tsx`**

1. Add a **MapPin** and **Phone** icon import from lucide-react
2. Add two new trust indicator items in the existing trust badges row: address and phone — or better, add a dedicated "Contact" section in the footer above the copyright line with:
   - 475 Washington Blvd, Marina Del Rey, CA 90292
   - (310) 699-0473
   - The phone number will be a clickable `tel:` link, address will link to Google Maps
3. Also update the `StructuredData` component's local business entry (if it has address fields) to include this address and phone for SEO

**Footer layout** will become:
```text
[Logo]
[Nav links: Privacy | Terms | SMS | Blog | Support]
[MapPin icon] 475 Washington Blvd, Marina Del Rey, CA 90292
[Phone icon] (310) 699-0473
© 2026 Teslys. All rights reserved.
```

This keeps the premium aesthetic while adding concrete business details that build trust.

