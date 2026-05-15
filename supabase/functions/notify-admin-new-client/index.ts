import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    // Resolve all client info server-side from the authenticated user's profile.
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("first_name, last_name, email, phone, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileErr || !profile) return jsonResponse({ error: "Profile not found" }, 404);
    if (profile.role !== "client") return jsonResponse({ error: "Forbidden" }, 403);

    const clientName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "New Client";
    const clientEmail = profile.email ?? user.email ?? "";
    const clientPhone = profile.phone ?? "";

    const { data: admins } = await admin
      .from("profiles")
      .select("email")
      .eq("is_super_admin", true)
      .not("email", "is", null);

    const adminEmails = (admins ?? []).map((a: any) => a.email).filter(Boolean) as string[];
    if (adminEmails.length === 0) return jsonResponse({ error: "No admin emails found" }, 400);

    const appUrl = Deno.env.get("APP_URL") || "https://teslys.app";

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: adminEmails,
      subject: `New Client Registration: ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#2563eb;border-bottom:2px solid #e5e7eb;padding-bottom:16px;">🆕 New Client Registered</h1>
          <p>A new client has just registered on the TESLYS platform.</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;">
            <p style="margin:8px 0;"><strong>Name:</strong> ${clientName}</p>
            <p style="margin:8px 0;"><strong>Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
            ${clientPhone ? `<p style="margin:8px 0;"><strong>Phone:</strong> <a href="tel:${clientPhone}">${clientPhone}</a></p>` : ""}
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${appUrl}/admin/manage-accounts" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Review Account</a>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return jsonResponse({ success: false, error: emailResponse.error }, 500);
    }
    return jsonResponse({ success: true });
  } catch (e: any) {
    console.error("notify-admin-new-client error:", e);
    return jsonResponse({ error: e?.message ?? String(e) }, 500);
  }
});
