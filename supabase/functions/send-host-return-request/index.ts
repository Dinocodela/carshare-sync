import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ReturnRequestNotification {
  carId: string;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const { carId, message }: ReturnRequestNotification = await req.json();
    if (!carId) return jsonResponse({ error: "carId is required" }, 400);

    // Look up car and confirm caller is the owner (client) requesting return.
    const { data: car, error: carErr } = await admin
      .from("cars")
      .select("id, make, model, year, client_id, host_id")
      .eq("id", carId)
      .maybeSingle();
    if (carErr || !car) return jsonResponse({ error: "Car not found" }, 404);
    if (car.client_id !== user.id) return jsonResponse({ error: "Forbidden" }, 403);
    if (!car.host_id) return jsonResponse({ error: "Car has no assigned host" }, 400);

    const [hostRes, clientRes] = await Promise.all([
      admin.from("profiles").select("first_name, email").eq("user_id", car.host_id).maybeSingle(),
      admin.from("profiles").select("first_name, last_name, email, phone").eq("user_id", car.client_id).maybeSingle(),
    ]);

    const hostEmail = hostRes.data?.email;
    if (!hostEmail) return jsonResponse({ error: "Host email unavailable" }, 400);
    const hostName = hostRes.data?.first_name || "Host";
    const clientName = `${clientRes.data?.first_name ?? ""} ${clientRes.data?.last_name ?? ""}`.trim() || "Client";
    const clientPhone = clientRes.data?.phone;
    const clientEmail = clientRes.data?.email;
    const carDetails = `${car.year} ${car.make} ${car.model}`;
    const safeMessage = String(message ?? "").slice(0, 2000);

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: [hostEmail],
      subject: "Car Return Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#2563eb;border-bottom:2px solid #e5e7eb;padding-bottom:16px;">Car Return Request</h1>
          <p>Hi ${hostName},</p>
          <p><strong>${clientName}</strong> has requested to return the car they're currently hosting.</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;color:#374151;">Client Contact Information:</h3>
            <p style="margin:8px 0;"><strong>Client:</strong> ${clientName}</p>
            ${clientPhone ? `<p style="margin:8px 0;"><strong>Phone:</strong> <a href="tel:${clientPhone}">${clientPhone}</a></p>` : ""}
            ${clientEmail ? `<p style="margin:8px 0;"><strong>Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>` : ""}
            <h3 style="margin-top:20px;color:#374151;">Car Details:</h3>
            <p style="margin:8px 0;"><strong>Vehicle:</strong> ${carDetails}</p>
            ${safeMessage ? `<h3 style="color:#374151;">Client Message:</h3><p style="background:#fff;padding:16px;border-radius:6px;border-left:4px solid #2563eb;margin:0;">${safeMessage}</p>` : ""}
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${Deno.env.get("APP_URL") || "https://teslys.app"}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View Dashboard</a>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error in send-host-return-request:", emailResponse.error);
      return jsonResponse({ success: false, error: emailResponse.error }, 500);
    }

    return jsonResponse({ success: true, emailResponse });
  } catch (error: any) {
    console.error("Error in send-host-return-request:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});
