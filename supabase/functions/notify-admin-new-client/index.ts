import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/require-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.clientName ?? "").toString().trim() || "New Client";
    const email = (body.clientEmail ?? "").toString().trim();
    const phone = (body.clientPhone ?? "").toString().trim();

    if (!email) return jsonResponse({ error: "clientEmail is required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Post to Slack via Incoming Webhook (best-effort; never blocks the response).
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (slackWebhookUrl) {
      try {
        await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `:wave: *New client request*\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone || "—"}\n<https://teslys.app/admin/manage-accounts|Review account>`,
          }),
        });
      } catch (e) {
        console.warn("Slack webhook post failed:", e);
      }
    }

    const { data: admins } = await admin
      .from("profiles")
      .select("email")
      .eq("is_super_admin", true)
      .not("email", "is", null);

    const adminEmails = (admins ?? []).map((a: any) => a.email).filter(Boolean) as string[];
    if (adminEmails.length === 0) return jsonResponse({ success: true, sent: 0 });

    const results = await Promise.allSettled(
      adminEmails.map((to) =>
        admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-notification",
            recipientEmail: to,
            templateData: {
              kind: "client",
              name, email, phone,
              reviewUrl: "https://teslys.app/admin/manage-accounts",
            },
          },
        })
      )
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length === adminEmails.length) {
      console.error("All admin notifications failed", failed);
      return jsonResponse({ success: false, error: "Failed to enqueue notifications" }, 500);
    }
    return jsonResponse({ success: true, sent: adminEmails.length - failed.length });
  } catch (e: any) {
    console.error("notify-admin-new-client error:", e);
    return jsonResponse({ error: e?.message ?? String(e) }, 500);
  }
});
