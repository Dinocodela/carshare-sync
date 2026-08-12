import {
  corsHeaders,
  jsonResponse,
  requireWorkerSecret,
  serviceClient,
} from "../_shared/social-admin.ts";
import { getConnectedAccount, publishPost } from "../_shared/social-publish-core.ts";

/**
 * Cron worker: publishes posts whose scheduled time has arrived.
 * The due-time gate lives here; all other safeguards live in publishPost().
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const denied = requireWorkerSecret(req);
  if (denied) return denied;

  const admin = serviceClient();

  const { account } = await getConnectedAccount(admin);
  if (!account) return jsonResponse({ ok: true, skipped: "account_not_connected" });

  const { data: settings } = await admin
    .from("social_automation_settings")
    .select("mode")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  // In review_required mode we still publish posts an admin explicitly scheduled;
  // auto_publish_approved additionally picks up approved-but-scheduled posts.
  const statuses =
    settings?.mode === "auto_publish_approved" ? ["scheduled", "approved"] : ["scheduled"];

  const { data: due, error } = await admin
    .from("social_posts")
    .select("id")
    .in("status", statuses)
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", new Date().toISOString())
    .not("approved_at", "is", null)
    .order("scheduled_at", { ascending: true })
    .limit(5);

  if (error) return jsonResponse({ ok: false, error: error.message }, 500);
  if (!due || due.length === 0) return jsonResponse({ ok: true, published: 0 });

  const results = [];
  for (const post of due) {
    results.push(await publishPost(admin, post.id, null, "scheduler"));
  }

  return jsonResponse({
    ok: true,
    processed: results.length,
    published: results.filter((r) => r.ok).length,
    results,
  });
});
