

## Plan: Fix Calendar Popover + Numeric Zero Display

### Root Causes

**Calendar not working**: The `Popover` renders its content via a Portal (outside the Sheet/Dialog DOM). Radix Dialog (used by Sheet) is modal by default -- it intercepts clicks outside its content area. When the user clicks a calendar day, the Sheet treats it as an "outside click" and closes everything before the selection registers.

**Numeric zeros still showing**: The `NumericPlaceholderInput` component code is correct, but the `SheetContent` and `DialogContent` components don't pass `onInteractOutside` through. The zero issue may also be a stale build artifact -- the code analysis confirms all numeric fields correctly use `NumericPlaceholderInput`. To be safe, we'll add explicit `placeholder` props and verify every instance.

### Changes

**1. Fix Calendar inside Sheet/Dialog (root cause fix)**

Add `onInteractOutside` to every `SheetContent` and `DialogContent` that contains a Popover datepicker. This prevents the Sheet/Dialog from closing when the user clicks on the calendar popover portal:

```tsx
<SheetContent
  side="bottom"
  onInteractOutside={(e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-radix-popper-content-wrapper]')) {
      e.preventDefault();
    }
  }}
  className="..."
>
```

Apply to all 6 Sheet/Dialog instances that contain date pickers:
- Mobile Expense Sheet
- Desktop Expense Dialog  
- Mobile Earning Sheet
- Desktop Earning Dialog
- Mobile Claim Sheet
- Desktop Claim Dialog

**2. Ensure CalendarWidget always has `pointer-events-auto`**

Verify every `<CalendarWidget>` instance has `className="p-3 pointer-events-auto"` (10 instances total). Some may be missing the class.

**3. Verify NumericPlaceholderInput coverage**

Double-check all numeric form fields pass `value={field.value}` and `onChange={field.onChange}` correctly. The component already handles zero-hiding; if the issue persists after a clean build, the fix is confirmed as a build cache issue.

### Files Modified
- `src/pages/HostCarManagement.tsx` -- add `onInteractOutside` to 6 Sheet/Dialog containers, verify all CalendarWidget and NumericPlaceholderInput instances

### Technical Notes
- The `onInteractOutside` handler checks if the click target is inside a `[data-radix-popper-content-wrapper]` (the Popover portal container) and prevents the Sheet/Dialog from closing
- This is the standard Radix UI pattern for nested portals inside modal dialogs

