import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface MaintenanceNotification {
  carId: string;
  maintenanceType: string;
  scheduledDate: string;
  scheduledTime?: string;
  provider: string;
  estimatedCost?: number;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const { carId, maintenanceType, scheduledDate, scheduledTime, provider, estimatedCost, notes }: MaintenanceNotification = await req.json();
    if (!carId || !maintenanceType || !scheduledDate || !provider) {
      return jsonResponse({ error: "carId, maintenanceType, scheduledDate, and provider are required" }, 400);
    }

    // Verify caller is the assigned host of the car they're scheduling maintenance on.
    const { data: car, error: carErr } = await admin
      .from("cars")
      .select("make, model, year, client_id, host_id")
      .eq("id", carId)
      .maybeSingle();
    if (carErr || !car) return jsonResponse({ error: "Car not found" }, 404);
    if (car.host_id !== user.id) return jsonResponse({ error: "Forbidden" }, 403);

    const { data: clientProfile } = await admin
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("user_id", car.client_id)
      .maybeSingle();
    const clientEmail = clientProfile?.email;
    if (!clientEmail) return jsonResponse({ error: "Client email unavailable" }, 400);

    const clientName = `${clientProfile?.first_name ?? ""} ${clientProfile?.last_name ?? ""}`.trim() || "Client";
    const carDetails = `${car.year} ${car.make} ${car.model}`;
    const formattedDate = new Date(scheduledDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: [clientEmail],
      subject: `Maintenance Scheduled for Your ${car.make} ${car.model}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#2563eb;border-bottom:2px solid #e5e7eb;padding-bottom:16px;">Maintenance Scheduled</h1>
          <p>Hi ${clientName},</p>
          <p>We wanted to inform you that maintenance has been scheduled for your vehicle.</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;color:#374151;">Vehicle Information:</h3>
            <p style="margin:8px 0;color:#374151;"><strong>Vehicle:</strong> ${carDetails}</p>
            <h3 style="margin-top:20px;color:#374151;">Maintenance Details:</h3>
            <p style="margin:8px 0;"><strong>Type:</strong> ${maintenanceType}</p>
            <p style="margin:8px 0;"><strong>Scheduled Date:</strong> ${formattedDate}</p>
            ${scheduledTime ? `<p style="margin:8px 0;"><strong>Time:</strong> ${scheduledTime}</p>` : ""}
            <p style="margin:8px 0;"><strong>Service Provider:</strong> ${provider}</p>
            ${estimatedCost ? `<p style="margin:8px 0;"><strong>Estimated Cost:</strong> $${estimatedCost}</p>` : ""}
            ${notes ? `<h3 style="color:#374151;margin-top:20px;">Additional Notes:</h3><p style="background:#fff;padding:16px;border-radius:6px;border-left:4px solid #2563eb;margin:0;">${String(notes).slice(0, 2000)}</p>` : ""}
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${Deno.env.get("APP_URL") || "https://teslys.app"}/my-cars" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View My Cars</a>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error in send-maintenance-notification:", emailResponse.error);
      return jsonResponse({ success: false, error: emailResponse.error }, 500);
    }

    return jsonResponse({ success: true, emailResponse });
  } catch (error: any) {
    console.error("Error in send-maintenance-notification:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});
