import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const body = await req.json().catch(() => ({}));
    const investmentId: string | undefined = body?.investmentId;
    if (!investmentId) return jsonResponse({ error: "investmentId required" }, 400);

    // Load the investment (must belong to caller) + vehicle details
    const { data: investment, error: invErr } = await admin
      .from("investments")
      .select(
        "id, investor_id, amount, monthly_return, term_months, payment_method, status, vehicle_id"
      )
      .eq("id", investmentId)
      .maybeSingle();

    if (invErr || !investment) return jsonResponse({ error: "Investment not found" }, 404);
    if (investment.investor_id !== user.id) return jsonResponse({ error: "Forbidden" }, 403);

    const { data: vehicle } = await admin
      .from("investor_vehicles")
      .select("make, model, year, vin")
      .eq("id", investment.vehicle_id)
      .maybeSingle();

    const { data: profile } = await admin
      .from("profiles")
      .select("first_name, last_name, email, phone")
      .eq("user_id", user.id)
      .maybeSingle();

    const investorName =
      `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "New Investor";
    const investorEmail = profile?.email ?? user.email ?? "";
    const investorPhone = profile?.phone ?? "";
    const vehicleLabel = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : "Vehicle";

    const { data: admins } = await admin
      .from("profiles")
      .select("email")
      .eq("is_super_admin", true)
      .not("email", "is", null);

    const adminEmails = (admins ?? []).map((a: any) => a.email).filter(Boolean) as string[];
    if (adminEmails.length === 0) return jsonResponse({ error: "No admin emails found" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fmt = (n: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

    const results = await Promise.allSettled(
      adminEmails.map((to) =>
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-notification",
            recipientEmail: to,
            templateData: {
              kind: "investment",
              name: investorName,
              email: investorEmail,
              phone: investorPhone,
              vehicle: vehicleLabel,
              amount: fmt(Number(investment.amount)),
              monthlyReturn: fmt(Number(investment.monthly_return)),
              termMonths: investment.term_months,
              paymentMethod: investment.payment_method ?? "not specified",
              reviewUrl: "https://teslys.app/admin/investments",
            },
          },
        })
      )
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length === adminEmails.length) {
      console.error("All admin investment notifications failed", failed);
      return jsonResponse({ success: false, error: "Failed to enqueue notifications" }, 500);
    }
    return jsonResponse({ success: true, sent: adminEmails.length - failed.length });
  } catch (e: any) {
    console.error("notify-admin-new-investment error:", e);
    return jsonResponse({ error: e?.message ?? String(e) }, 500);
  }
});
