## Plan

The AI Analytics Assistant UI is present, but the screenshot shows it is failing with “Edge Function returned a non-2xx status code.” I found the main cause: the database tables for saved assistant conversations/messages are not present in the live database, even though the migration file exists in the codebase. The edge function tries to insert into those tables before answering, so it fails immediately.

### What I will do

1. **Create/apply the missing chat history database schema**
   - Add the live database migration for:
     - `analytics_assistant_conversations`
     - `analytics_assistant_messages`
   - Keep Row Level Security enabled so users can only access their own saved chats.
   - Add indexes for fast loading by user and conversation.
   - Keep delete cascading so deleting a saved chat also deletes its messages.

2. **Harden the analytics assistant edge function**
   - Improve error logging so future backend failures show a useful message instead of `{}`.
   - Return clearer user-facing errors for database setup, AI rate limits, and AI credits.
   - Ensure every error response includes CORS headers.
   - Keep all analytics data access server-side and scoped to the authenticated user’s owned/shared cars only.

3. **Make saved chat behavior more reliable**
   - Ensure new questions create a conversation, save the user message, save the assistant answer, and refresh the “Saved chats” list.
   - Ensure loading old conversations continues to work from the sidebar.
   - Keep the existing UX: welcome message, suggested prompts, context chip, markdown AI responses, and delete saved chat.

4. **Deploy and validate**
   - Deploy the updated `analytics-assistant` edge function.
   - Test the function directly with an authenticated request if available.
   - Verify that the assistant can answer at least one analytics question and that the saved chat tables receive the conversation/messages.

### Technical details

- The current UI calls `supabase.functions.invoke("analytics-assistant")` from `src/components/analytics/AnalyticsAssistant.tsx`.
- The edge function currently inserts into `analytics_assistant_conversations` and `analytics_assistant_messages`, but the live database only has the existing analytics source tables (`cars`, `car_access`, `host_earnings`, `host_expenses`, `host_claims`, `client_car_expenses`).
- The fix requires applying the missing schema to Supabase and redeploying the edge function.
- I will preserve the financial rule already in project memory: do not use stored net profit amounts; true net profit remains dynamically calculated from earnings and fixed costs.