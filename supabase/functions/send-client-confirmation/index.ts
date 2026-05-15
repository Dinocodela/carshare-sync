import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ClientConfirmationRequest {
  requestId: string;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const { requestId, status }: ClientConfirmationRequest = await req.json();
    if (!requestId || !status) return jsonResponse({ error: "requestId and status are required" }, 400);

    // Look up the request and verify the caller is the host responding to it.
    const { data: request, error: reqErr } = await admin
      .from("requests")
      .select("id, client_id, host_id, car_id")
      .eq("id", requestId)
      .maybeSingle();
    if (reqErr || !request) return jsonResponse({ error: "Request not found" }, 404);
    if (request.host_id !== user.id) return jsonResponse({ error: "Forbidden" }, 403);

    const [hostRes, clientRes, carRes] = await Promise.all([
      admin.from("profiles").select("first_name, last_name, email, phone, company_name").eq("user_id", request.host_id).maybeSingle(),
      admin.from("profiles").select("first_name, last_name, email").eq("user_id", request.client_id).maybeSingle(),
      admin.from("cars").select("make, model, year").eq("id", request.car_id).maybeSingle(),
    ]);

    const clientEmail = clientRes.data?.email;
    if (!clientEmail) return jsonResponse({ error: "Client email unavailable" }, 400);

    const clientName = clientRes.data?.first_name || "there";
    const hostName = `${hostRes.data?.first_name ?? ""} ${hostRes.data?.last_name ?? ""}`.trim() || "Your Host";
    const hostCompany = hostRes.data?.company_name ?? "TESLYS Partner";
    const hostPhone = hostRes.data?.phone;
    const hostEmail = hostRes.data?.email;
    const carDetails = carRes.data
      ? `${carRes.data.year ?? ""} ${carRes.data.make ?? ""} ${carRes.data.model ?? ""}`.trim()
      : "your vehicle";

    const isAccepted = status === "accepted";
    const subject = isAccepted ? "Your Car Hosting Request Has Been Accepted!" : "Update on Your Car Hosting Request";

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: [clientEmail],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color:${isAccepted ? "#059669" : "#dc2626"};border-bottom:2px solid #e5e7eb;padding-bottom:16px;">
            ${isAccepted ? "🎉 Request Accepted!" : "Request Update"}
          </h1>
          <p>Hi ${clientName},</p>
          <p>${isAccepted
            ? `Great news! Your car hosting request has been <strong>accepted</strong> by ${hostName} from ${hostCompany}.`
            : `Your car hosting request has been updated by ${hostName} from ${hostCompany}.`}</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;">
            <p style="margin:8px 0;"><strong>Vehicle:</strong> ${carDetails}</p>
            <p style="margin:8px 0;"><strong>Host:</strong> ${hostName} (${hostCompany})</p>
            <p style="margin:8px 0;"><strong>Status:</strong> <span style="color:${isAccepted ? "#059669" : "#dc2626"};font-weight:bold;text-transform:capitalize;">${status}</span></p>
          </div>
          ${isAccepted ? `
            <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:20px;border-radius:8px;margin:20px 0;">
              <h3 style="margin-top:0;color:#059669;">Host Contact Information:</h3>
              <p style="margin:8px 0;"><strong>Host:</strong> ${hostName}</p>
              <p style="margin:8px 0;"><strong>Company:</strong> ${hostCompany}</p>
              ${hostPhone ? `<p style="margin:8px 0;"><strong>Phone:</strong> <a href="tel:${hostPhone}">${hostPhone}</a></p>` : ""}
              ${hostEmail ? `<p style="margin:8px 0;"><strong>Email:</strong> <a href="mailto:${hostEmail}">${hostEmail}</a></p>` : ""}
            </div>
          ` : ""}
          <div style="text-align:center;margin:30px 0;">
            <a href="${Deno.env.get("APP_URL") || "https://teslys.app"}/my-cars" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View My Cars</a>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return jsonResponse({ success: false, error: emailResponse.error }, 500);
    }

    if (isAccepted) {
      try {
        await admin.functions.invoke("push-send", {
          body: {
            targetUserId: request.client_id,
            title: "Car Request Accepted!",
            body: `Your ${carDetails} hosting request was accepted by ${hostName}`,
            icon: "/favicon.ico",
            url: "/my-cars",
          },
        });
      } catch (pushError) {
        console.error("Push notification error:", pushError);
      }
    }

    return jsonResponse({ success: true, emailResponse });
  } catch (error: any) {
    console.error("Error in send-client-confirmation:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});
