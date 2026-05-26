import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("first_name, last_name, email, phone, role, company_name, services, location")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileErr || !profile) return jsonResponse({ error: "Profile not found" }, 404);
    if (profile.role !== "host") return jsonResponse({ error: "Forbidden" }, 403);

    const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "New Host";
    const email = profile.email ?? user.email ?? "";
    const phone = profile.phone ?? "";
    const company = profile.company_name ?? "";
    const services = Array.isArray(profile.services) ? profile.services.join(", ") : (profile.services ?? "");
    const coverage = profile.location ?? "";

    const { data: admins } = await admin
      .from("profiles")
      .select("email")
      .eq("is_super_admin", true)
      .not("email", "is", null);

    const adminEmails = (admins ?? []).map((a: any) => a.email).filter(Boolean) as string[];
    if (adminEmails.length === 0) return jsonResponse({ error: "No admin emails found" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results = await Promise.allSettled(
      adminEmails.map((to) =>
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-notification",
            recipientEmail: to,
            templateData: {
              kind: "host",
              name, email, phone, company, services, coverage,
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
    console.error("notify-admin-new-host error:", e);
    return jsonResponse({ error: e?.message ?? String(e) }, 500);
  }
});
