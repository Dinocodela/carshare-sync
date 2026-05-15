import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface HostNotificationRequest {
  requestId: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const { requestId, message }: HostNotificationRequest = await req.json();
    if (!requestId) return jsonResponse({ error: "requestId is required" }, 400);

    // Look up the request and verify the caller is the client who created it.
    const { data: request, error: reqErr } = await admin
      .from("requests")
      .select("id, client_id, host_id, car_id")
      .eq("id", requestId)
      .maybeSingle();
    if (reqErr || !request) return jsonResponse({ error: "Request not found" }, 404);
    if (request.client_id !== user.id) return jsonResponse({ error: "Forbidden" }, 403);

    const [hostRes, clientRes, carRes] = await Promise.all([
      admin.from("profiles").select("first_name, last_name, email").eq("user_id", request.host_id).maybeSingle(),
      admin.from("profiles").select("first_name, last_name, email, phone").eq("user_id", request.client_id).maybeSingle(),
      admin.from("cars").select("make, model, year").eq("id", request.car_id).maybeSingle(),
    ]);

    const hostEmail = hostRes.data?.email;
    if (!hostEmail) return jsonResponse({ error: "Host email unavailable" }, 400);

    const hostName = hostRes.data?.first_name || "Host";
    const clientName = `${clientRes.data?.first_name ?? ""} ${clientRes.data?.last_name ?? ""}`.trim() || "Client";
    const clientPhone = clientRes.data?.phone;
    const clientEmail = clientRes.data?.email;
    const carDetails = carRes.data
      ? `${carRes.data.year ?? ""} ${carRes.data.make ?? ""} ${carRes.data.model ?? ""}`.trim()
      : "Vehicle";

    const safeMessage = String(message ?? "").slice(0, 2000);

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: [hostEmail],
      subject: "New Car Hosting Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#2563eb;border-bottom:2px solid #e5e7eb;padding-bottom:16px;">New Hosting Request</h1>
          <p>Hi ${hostName},</p>
          <p>You have received a new car hosting request from <strong>${clientName}</strong>.</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;color:#374151;">Client Contact Information:</h3>
            <p style="margin:8px 0;"><strong>Client:</strong> ${clientName}</p>
            ${clientPhone ? `<p style="margin:8px 0;"><strong>Phone:</strong> <a href="tel:${clientPhone}">${clientPhone}</a></p>` : ""}
            ${clientEmail ? `<p style="margin:8px 0;"><strong>Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>` : ""}
            <h3 style="margin-top:20px;color:#374151;">Car Details:</h3>
            <p style="margin:8px 0;"><strong>Vehicle:</strong> ${carDetails}</p>
            <h3 style="color:#374151;">Client Message:</h3>
            <p style="background:#fff;padding:16px;border-radius:6px;border-left:4px solid #2563eb;margin:0;">${safeMessage}</p>
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${Deno.env.get("APP_URL") || "https://teslys.app"}/host-requests" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Review Request</a>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error in send-host-notification:", emailResponse.error);
      return jsonResponse({ success: false, error: emailResponse.error }, 500);
    }

    try {
      await admin.functions.invoke("push-send", {
        body: {
          targetUserId: request.host_id,
          title: "New Hosting Request!",
          body: `${clientName} wants to host their ${carDetails}`,
          icon: "/favicon.ico",
          url: "/dashboard",
        },
      });
    } catch (pushError) {
      console.error("Push notification error:", pushError);
    }

    return jsonResponse({ success: true, emailResponse });
  } catch (error: any) {
    console.error("Error in send-host-notification:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});
