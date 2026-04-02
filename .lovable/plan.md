

## Support Link: mailto with Spam Protection

### The Problem
The footer "Support" link currently navigates to `/support` (a full page). You want it to open the user's email app directly, but exposing a raw `mailto:` link invites spam bots.

### Recommended Approach: Obfuscated mailto (no `/support` page change needed)

Instead of a plain `mailto:` in the HTML, we'll construct the email address in JavaScript on click — this defeats most spam scrapers while still opening the user's mail app.

### Changes

**File: `src/pages/Index.tsx`** (footer section, ~line 267)

Replace the `<Link to="/support">Support</Link>` with a `<button>` that builds the mailto dynamically on click:

```tsx
<button
  onClick={() => {
    window.location.href = `mailto:${'support'}@${'teslys.com'}?subject=${encodeURIComponent('Teslys Support Request')}`;
  }}
  className="hover:text-foreground transition underline-offset-2 hover:underline"
>
  Support
</button>
```

This splits the email across string fragments so crawlers can't find `support@teslys.com` in the source. Clicking opens the user's default mail app with a pre-filled subject line.

No other files need changes. The `/support` page remains accessible for authenticated users via Settings.

