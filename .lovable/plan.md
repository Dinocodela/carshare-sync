

## Plan: Mobile Responsiveness Audit & Fix

### Problem
The app has several mobile responsiveness issues, most notably:
1. **Onboarding Screen 3** — content overflows on small screens (icon clipped at top, app store badges + CTA + trust text cramped at bottom)
2. **Onboarding Screens 1 & 2** — spacing is generous but not optimized for very small screens (iPhone SE, 320px)
3. **General pages** — need verification that DashboardLayout pages, forms, and tables don't overflow on mobile

### Changes

**1. Fix OnboardingFlow container to allow scrolling on short screens**

File: `src/components/onboarding/OnboardingFlow.tsx`
- Change the screen content area from `flex-1 flex items-center justify-center` (which centers but clips) to allow vertical scroll on short viewports
- Use `min-h-0 flex-1 overflow-y-auto` so content scrolls instead of clipping

**2. Fix OnboardingScreen3 spacing for mobile**

File: `src/components/onboarding/OnboardingScreen3.tsx`
- Reduce `mb-8` to `mb-5` on the icon container
- Reduce `mb-6` on feature cards to `mb-4`
- Ensure the entire screen uses `py-6` padding instead of relying on `justify-center` which causes clipping when content exceeds viewport

**3. Fix all three onboarding screens to use flexible spacing**

Files: `OnboardingScreen1.tsx`, `OnboardingScreen2.tsx`, `OnboardingScreen3.tsx`
- Change from `h-full` + `justify-center` to `min-h-full` + `justify-center` with `py-8 sm:py-12` padding
- Reduce `mb-8` to `mb-5 sm:mb-8` for icon containers (responsive margin)
- This ensures content doesn't clip on small screens while still centering on larger ones

**4. Audit and fix DashboardLayout for small screens**

File: `src/components/layout/DashboardLayout.tsx`
- Already uses `pb-app-bottom` which accounts for bottom nav — this is correct
- Verify `pt-safe-top` is applied — already present

**5. Fix BottomNavBar dark mode support**

File: `src/components/layout/BottomNavBar.tsx`
- The nav hardcodes `bg-white/70` — should use `bg-background/70` for dark mode compatibility

**6. Ensure tables and wide content scroll horizontally on mobile**

File: `src/pages/HostCarManagement.tsx`
- Desktop tables already use `hidden md:block` with mobile card views — already handled
- Verify no horizontal overflow from fixed-width elements

### Summary of file changes
- `src/components/onboarding/OnboardingFlow.tsx` — scrollable screen container
- `src/components/onboarding/OnboardingScreen1.tsx` — responsive spacing
- `src/components/onboarding/OnboardingScreen2.tsx` — responsive spacing  
- `src/components/onboarding/OnboardingScreen3.tsx` — responsive spacing, fix clipping
- `src/components/layout/BottomNavBar.tsx` — dark mode bg fix

