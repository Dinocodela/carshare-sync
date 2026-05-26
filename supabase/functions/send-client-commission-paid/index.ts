import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface CommissionPaidRequest {
  earningId: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const { earningId }: CommissionPaidRequest = await req.json();
    if (!earningId) return jsonResponse({ error: "earningId is required" }, 400);

    // 1) Fetch earning details
    const { data: earning, error: earningError } = await admin
      .from("host_earnings")
      .select(
        "id, car_id, host_id, gross_earnings, client_profit_percentage, payment_source, trip_id, guest_name, earning_period_start, earning_period_end, date_paid"
      )
      .eq("id", earningId)
      .maybeSingle();

    if (earningError || !earning) return jsonResponse({ error: "Failed to fetch earning" }, 400);

    // Authorization: only the recording host can trigger this notification.
    if (earning.host_id !== user.id) return jsonResponse({ error: "Forbidden" }, 403);

    // 2) Fetch trip expenses to calculate net profit
    let totalTripExpenses = 0;
    if (earning.trip_id) {
      const { data: expenses } = await admin
        .from("host_expenses")
        .select("total_expenses")
        .eq("trip_id", earning.trip_id);
      if (expenses?.length) {
        totalTripExpenses = expenses.reduce((sum, exp) => sum + (exp.total_expenses || 0), 0);
      }
    }

    // 3) Fetch car + client
    const { data: car, error: carError } = await admin
      .from("cars")
      .select("id, make, model, year, license_plate, vin_number, client_id")
      .eq("id", earning.car_id)
      .maybeSingle();
    if (carError || !car) return jsonResponse({ error: "Failed to fetch car" }, 400);

    // 4) Fetch client email from profiles (server-side; not from request body).
    const { data: clientProfile } = await admin
      .from("profiles")
      .select("email")
      .eq("user_id", car.client_id)
      .maybeSingle();
    const clientEmail = clientProfile?.email;
    if (!clientEmail) return jsonResponse({ error: "Failed to fetch client email" }, 400);

    const { data: hostProfile } = await admin
      .from("profiles")
      .select("first_name, last_name, company_name")
      .eq("user_id", earning.host_id)
      .maybeSingle();

    const hostName = hostProfile ? `${hostProfile.first_name ?? ""} ${hostProfile.last_name ?? ""}`.trim() : "Your Host";
    const hostCompany = hostProfile?.company_name ?? "TESLYS Partner";

    const grossEarnings = Number(earning.gross_earnings ?? 0);
    const clientProfitPercentage = Number(earning.client_profit_percentage ?? 70);
    const netProfit = grossEarnings - totalTripExpenses;
    const clientProfitAmount = (netProfit * clientProfitPercentage) / 100;
    const amount = clientProfitAmount.toFixed(2);
    const periodStart = new Date(earning.earning_period_start).toLocaleString("en-US");
    const periodEnd = new Date(earning.earning_period_end).toLocaleString("en-US");
    const paidDate = earning.date_paid ? new Date(earning.date_paid).toLocaleDateString("en-US") : "Today";

    const carDetails = `${car.year ?? ""} ${car.make ?? ""} ${car.model ?? ""}`.trim();
    const carIdents = [car.license_plate ? `Plate: ${car.license_plate}` : null, car.vin_number ? `VIN: ${car.vin_number.slice(-6)}` : null].filter(Boolean).join(" • ");

    const subject = `Commission Payment Completed${earning.trip_id ? ` - Trip #${earning.trip_id}` : ""}`;

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: [clientEmail],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#059669;border-bottom:2px solid #e5e7eb;padding-bottom:16px;">Commission Payment Completed</h1>
          <p>Hi there,</p>
          <p>We're happy to let you know that your commission payment has been <strong>completed</strong> by ${hostName} (${hostCompany}).</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;color:#374151;">Payment Summary</h3>
            <p style="margin:8px 0;"><strong>Amount Paid:</strong> $${amount}</p>
            <p style="margin:8px 0;"><strong>Payment Source:</strong> ${earning.payment_source || "N/A"}</p>
            <p style="margin:8px 0;"><strong>Date Paid:</strong> ${paidDate}</p>
            ${earning.trip_id ? `<p style="margin:8px 0;"><strong>Trip #:</strong> ${earning.trip_id}</p>` : ""}
            ${earning.guest_name ? `<p style="margin:8px 0;"><strong>Guest:</strong> ${earning.guest_name}</p>` : ""}
          </div>
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:20px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;color:#059669;">Rental Details</h3>
            <p style="margin:8px 0;"><strong>Vehicle:</strong> ${carDetails}</p>
            ${carIdents ? `<p style="margin:8px 0;"><strong>${carIdents}</strong></p>` : ""}
            <p style="margin:8px 0;"><strong>Period:</strong> ${periodStart} – ${periodEnd}</p>
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${Deno.env.get("APP_URL") || "https://teslys.app"}/client-analytics" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View My Earnings</a>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return jsonResponse({ success: false, error: emailResponse.error }, 500);
    }

    try {
      await admin.functions.invoke("push-send", {
        body: {
          targetUserId: car.client_id,
          title: "Commission Payment Received!",
          body: `$${amount} payment completed for your ${carDetails}`,
          icon: "/favicon.ico",
          url: "/client-analytics",
        },
      });
    } catch (pushError) {
      console.error("Push notification error:", pushError);
    }

    return jsonResponse({ success: true, emailResponse });
  } catch (error: any) {
    console.error("Error in send-client-commission-paid:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});
