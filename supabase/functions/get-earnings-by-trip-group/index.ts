import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const tripValue = body.trip_value;

    if (!tripValue) {
      return new Response(
        JSON.stringify({ error: "trip_value is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch earnings and expenses in parallel
    const [earningsRes, expensesRes] = await Promise.all([
      supabase
        .from("host_earnings")
        .select("amount, commission, net_amount, payment_status, payment_date, guest_name, gross_earnings, payment_source, trip_id, trip_idd, earning_period_end, client_profit_percentage, host_profit_percentage")
        .or(`trip_id.eq.${tripValue},trip_idd.eq.${tripValue}`),
      supabase
        .from("host_expenses")
        .select("trip_id, amount, toll_cost, delivery_cost, carwash_cost, ev_charge_cost")
        .or(`trip_id.eq.${tripValue}`),
    ]);

    if (earningsRes.error) {
      console.error("Earnings query error:", earningsRes.error);
      return new Response(
        JSON.stringify({ error: earningsRes.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expenses = expensesRes.data || [];

    // Calculate trip expenses total for a given trip_id
    const getTripExpenses = (tripId: string | null): number => {
      if (!tripId) return 0;
      return expenses
        .filter((exp) => exp.trip_id === tripId)
        .reduce(
          (sum, exp) =>
            sum +
            (exp.amount || 0) +
            (exp.toll_cost || 0) +
            (exp.delivery_cost || 0) +
            (exp.carwash_cost || 0) +
            (exp.ev_charge_cost || 0),
          0
        );
    };

    // Enrich each earning with expense-adjusted net profit
    const enriched = (earningsRes.data || []).map((earning) => {
      const tripExpenses = getTripExpenses(earning.trip_id);
      const grossAmount = earning.amount || 0;
      const netAfterExpenses = grossAmount - tripExpenses;
      const clientPct = earning.client_profit_percentage || 70;
      const hostPct = earning.host_profit_percentage || 30;

      return {
        amount: earning.amount,
        commission: earning.commission,
        gross_earnings: earning.gross_earnings,
        guest_name: earning.guest_name,
        payment_status: earning.payment_status,
        payment_date: earning.payment_date,
        payment_source: earning.payment_source,
        trip_id: earning.trip_id,
        trip_idd: earning.trip_idd,
        earning_period_end: earning.earning_period_end,
        client_profit_percentage: clientPct,
        host_profit_percentage: hostPct,
        trip_expenses: tripExpenses,
        net_after_expenses: netAfterExpenses,
        client_profit: (netAfterExpenses * clientPct) / 100,
        host_profit: (netAfterExpenses * hostPct) / 100,
      };
    });

    return new Response(
      JSON.stringify({ data: enriched, count: enriched.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
