import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed. Use POST." }, 405);

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const body = await req.json();
    const tripValue = body.trip_value;
    if (!tripValue) return jsonResponse({ error: "trip_value is required" }, 400);

    // Step 1: fetch earnings + car ownership info
    const earningsRes = await admin
      .from("host_earnings")
      .select(
        "amount, commission, payment_status, payment_date, guest_name, gross_earnings, payment_source, trip_id, trip_idd, earning_period_end, host_id, car_id, delivery_address, cars!inner(client_id, host_id)"
      )
      .or(`trip_id.eq.${tripValue},trip_idd.eq.${tripValue}`);

    if (earningsRes.error) {
      console.error("Earnings query error:", earningsRes.error);
      return jsonResponse({ error: earningsRes.error.message }, 500);
    }

    const earnings = earningsRes.data || [];

    // Authorization: every returned earning must belong to the caller as host or car client.
    const unauthorized = earnings.some((e: any) => {
      const car = e.cars ?? {};
      return !(e.host_id === user.id || car.host_id === user.id || car.client_id === user.id);
    });
    if (unauthorized) return jsonResponse({ error: "Forbidden" }, 403);

    // Step 2: collect trip_ids and fetch their expenses
    const tripIds = [...new Set(earnings.map((e) => e.trip_id).filter(Boolean))];
    let expenses: any[] = [];
    if (tripIds.length > 0) {
      const expensesRes = await admin
        .from("host_expenses")
        .select("trip_id, amount, toll_cost, delivery_cost, carwash_cost, ev_charge_cost")
        .in("trip_id", tripIds);
      expenses = expensesRes.data || [];
    }

    const getTripExpenseBreakdown = (tripId: string | null) => {
      const breakdown = {
        ev_charge_cost: 0,
        toll_cost: 0,
        delivery_cost: 0,
        carwash_cost: 0,
        other_expenses: 0,
        total_expenses: 0,
      };
      if (!tripId) return breakdown;
      for (const exp of expenses.filter((e) => e.trip_id === tripId)) {
        breakdown.ev_charge_cost += exp.ev_charge_cost || 0;
        breakdown.toll_cost += exp.toll_cost || 0;
        breakdown.delivery_cost += exp.delivery_cost || 0;
        breakdown.carwash_cost += exp.carwash_cost || 0;
        // "Other expenses" = base expense amount not attributed to a specific category
        breakdown.other_expenses += exp.amount || 0;
      }
      breakdown.total_expenses =
        breakdown.ev_charge_cost +
        breakdown.toll_cost +
        breakdown.delivery_cost +
        breakdown.carwash_cost +
        breakdown.other_expenses;
      return breakdown;
    };

    const enriched = earnings.map((earning: any) => {
      const exp = getTripExpenseBreakdown(earning.trip_id);
      return {
        amount: earning.amount,
        commission: earning.commission,
        net_amount: (earning.amount || 0) - exp.total_expenses,
        total_expenses: exp.total_expenses,
        ev_charge_cost: exp.ev_charge_cost,
        toll_cost: exp.toll_cost,
        delivery_cost: exp.delivery_cost,
        carwash_cost: exp.carwash_cost,
        other_expenses: exp.other_expenses,
        payment_status: earning.payment_status,
        payment_date: earning.payment_date,
        guest_name: earning.guest_name,
        gross_earnings: earning.gross_earnings,
        payment_source: earning.payment_source,
        trip_id: earning.trip_id,
        trip_idd: earning.trip_idd,
        earning_period_end: earning.earning_period_end,
      };
    });

    return jsonResponse({ data: enriched, count: enriched.length });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
