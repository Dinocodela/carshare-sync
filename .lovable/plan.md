# Floating AI Analytics Assistant Bubble

Replace the inline AI Analytics Assistant card with a floating bubble pinned to the bottom-right corner of the analytics page. Tapping the bubble opens a chat panel. The "Saved chats" sidebar box is replaced with a compact "History" link that opens a small popover/drawer, freeing up horizontal space and making everything mobile-friendly.

## What changes for the user

- A round chat bubble with a sparkle/bot icon sits in the bottom-right corner of the Client Analytics page.
- Tapping the bubble opens the assistant:
  - On desktop: a floating chat panel anchored bottom-right (~400px wide, ~600px tall, with max-height respecting viewport).
  - On mobile: a full-height bottom sheet that slides up and fills the screen, with a clear close button.
- "Saved chats" is no longer a permanent side column. Instead, a small "History" link/button in the panel header opens a popover (desktop) or sheet (mobile) listing prior conversations, with tap-to-open and delete actions.
- A "New chat" action and the period/car context chip remain visible in the header, but compactly.
- The bubble shows a subtle pulse on first load and can be dismissed (panel closes) without losing the conversation.

## Layout

```text
Desktop (panel open)                Mobile (sheet open)
+-----------------------------+      +-----------------------+
| Sparkle  AI Assistant   x   |      | AI Assistant      x  |
| Context: Apr 2026 · Portfolio|     | Context chip         |
| [History]  [+ New]          |      | [History] [+ New]    |
|-----------------------------|      |-----------------------|
| messages...                 |      | messages...          |
|                             |      |                       |
|                             |      |                       |
|-----------------------------|      |-----------------------|
| suggestion chips            |      | suggestion chips     |
| [textarea]            [send]|      | [textarea]    [send] |
+-----------------------------+      +-----------------------+
              (bubble hidden while open)
```

## Technical changes

**`src/components/analytics/AnalyticsAssistant.tsx`** — major refactor:
- Wrap the component in a controlled `open` state. Render two pieces:
  1. A floating bubble button (`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-14 w-14 rounded-full shadow-lg`) shown when closed.
  2. The chat panel shown when open.
- Use `useIsMobile()` from `src/hooks/use-mobile.tsx` to switch container:
  - Mobile: `Sheet` from `@/components/ui/sheet` with `side="bottom"`, full height (`h-[92vh]`), rounded top.
  - Desktop: a `fixed bottom-20 right-4 sm:right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)]` card with the existing styling.
- Replace the left "Saved chats" `<aside>` column with a header "History" button. Clicking opens:
  - Desktop: `Popover` (`@/components/ui/popover`) anchored to the button, containing the existing scrollable list (max-h ~320px, w-72).
  - Mobile: a nested `Sheet` from the right (or a simple inline collapsible above the messages) — pick `Sheet side="right"` to stay consistent.
- Make message bubbles, suggestion chips, textarea, and send button stack cleanly on small widths: chips wrap, textarea uses `flex-1 min-w-0`, send button stays `shrink-0`. Reduce padding to `p-3 sm:p-4`.
- Keep all existing logic intact: `loadConversations`, `loadConversation`, `deleteConversation`, `sendMessage`, persistence to the edge function, error handling helper, welcome message, suggested questions.
- Continue receiving `selectedYear`, `selectedMonth`, `selectedCarId`, `selectedCarName` props so the bubble adapts to current dashboard context.

**`src/pages/ClientAnalytics.tsx`** — render once, not three times:
- Remove the three inline `<AnalyticsAssistant />` placements inside the tab contents (lines 237, 265, 301).
- Render a single `<AnalyticsAssistant />` once at the page level (just before `</PageContainer>` close, or directly inside `DashboardLayout`) so the floating bubble is always available regardless of active tab.
- Pass the currently selected year/month, plus `selectedCarId`/`selectedCarName` derived from the active tab/car selector (use the per-car values when on the per-car tab, otherwise leave the car props null for portfolio context).

**No backend changes** — the edge function (`supabase/functions/analytics-assistant`) and the `analytics_assistant_conversations` / `analytics_assistant_messages` tables are unchanged.

## Accessibility & polish

- Bubble button has `aria-label="Open AI Analytics Assistant"`.
- Panel/sheet has a visible close button and closes on Escape.
- Focus moves to the textarea when the panel opens (reuse the existing `inputRef.current?.focus()`).
- Bubble hidden while panel/sheet is open to avoid overlap.
- Respect safe areas on mobile (`pb-[env(safe-area-inset-bottom)]` on the bubble and sheet footer).

## Out of scope

- No changes to suggested questions, AI prompt, or saved-chat data model.
- No changes to other pages; the assistant remains exclusive to Client Analytics.
