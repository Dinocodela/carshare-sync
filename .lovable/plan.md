

## Plan: Modernize the Add Car Screen

### What changes

Redesign `src/pages/AddCar.tsx` to match the trust-focused, glassmorphic UI used across Dashboard, Analytics, and My Cars screens.

### Key design elements

1. **Trust Banner** — Replace the current plain header with a gradient banner (matching other screens) featuring a Shield icon and trust signals like "Secure Upload", "Verified Listing", "Host Protected"

2. **Staggered entrance animations** — Add the same `useMounted` + `fadeIn` pattern used in My Cars and Analytics for all sections

3. **Multi-step visual progress** — Add a subtle step indicator at the top (Vehicle Info → Photos → Review) showing which section the user is filling out, giving a sense of guided safety

4. **Glassmorphic form sections** — Replace the single Card with grouped sections using `bg-card/80 backdrop-blur-sm rounded-2xl` containers:
   - **Vehicle Details** (make, model, year, mileage) with a Car icon header
   - **Identification** (color, location, license plate, VIN) with a Shield icon header  
   - **Photos** section with improved upload area
   - **Description** as an optional final section

5. **Enhanced image upload area** — Modernize the dashed upload zone with a gradient border effect, larger drop area, and better visual feedback for selected images (rounded-2xl thumbnails with smooth remove animations)

6. **Trust footer above submit** — A small row of trust badges (e.g., lock icon + "Your data is encrypted", shield + "Verified by Teslys") right above the action buttons to reinforce safety at the point of commitment

7. **Polished action buttons** — Full-width stacked on mobile, side-by-side on desktop, with the submit button using a subtle gradient or primary styling with a loading spinner

### Technical details

**File: `src/pages/AddCar.tsx`**
- Add `useState` + `useEffect` for mounted animation state (same `useMounted` pattern)
- Add `fadeIn` helper function for staggered delays
- Import `Shield`, `Lock`, `CheckCircle`, `Sparkles` icons
- Restructure JSX from single Card into multiple glassmorphic sections
- Keep all existing form logic, validation, image handling, and submission logic unchanged
- Only the visual presentation layer changes

### No other files affected
All changes are contained to `src/pages/AddCar.tsx`. The form schema, submit logic, camera capture, and image upload logic remain identical.

