import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EarningPayload {
  trip_id: string;
  trip_idd?: string;
  car_id: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  gross_earnings: number;
  earning_period_start: string;
  earning_period_end: string;
  client_profit_percentage?: number;
  host_profit_percentage?: number;
  payment_source?: string;
  payment_status?: string;
  date_paid?: string;
  earning_type?: string;
}

/**
 * Determine the best profit split for a client.
 * Priority: first_month_free (100/0) > military (85/15) > fleet_5plus (80/20) > standard (70/30)
 */
async function resolveProfitSplit(
  supabase: any,
  carId: string
): Promise<{ clientPct: number; hostPct: number }> {
  // Get the car owner (client_id)
  const { data: car } = await supabase
    .from("cars")
    .select("client_id")
    .eq("id", carId)
    .single();

  if (!car?.client_id) return { clientPct: 70, hostPct: 30 };

  const clientId = car.client_id;

  // Get the client's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("profit_program, promo_start_date, created_at")
    .eq("user_id", clientId)
    .single();

  if (!profile) return { clientPct: 70, hostPct: 30 };

  // 1. Check first_month_free promo
  if (profile.promo_start_date) {
    const promoStart = new Date(profile.promo_start_date);
    const now = new Date();
    const daysSincePromo = (now.getTime() - promoStart.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePromo <= 30) {
      console.log("Applying first_month_free split 100/0 for client:", clientId);
      return { clientPct: 100, hostPct: 0 };
    }
  }

  // 2. Check military program
  if (profile.profit_program === "military") {
    console.log("Applying military split 85/15 for client:", clientId);
    return { clientPct: 85, hostPct: 15 };
  }

  // 3. Check fleet discount (5+ cars)
  const { count: carCount } = await supabase
    .from("cars")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);

  if ((carCount || 0) >= 5) {
    console.log("Applying fleet_5plus split 80/20 for client:", clientId, "cars:", carCount);
    return { clientPct: 80, hostPct: 20 };
  }

  // 4. Standard
  return { clientPct: 70, hostPct: 30 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: EarningPayload = await req.json();

    // Validate required fields
    if (!payload.trip_id) {
      return new Response(JSON.stringify({ error: "trip_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!payload.car_id) {
      return new Response(JSON.stringify({ error: "car_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!payload.gross_earnings || payload.gross_earnings <= 0) {
      return new Response(JSON.stringify({ error: "gross_earnings must be a positive number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!payload.earning_period_start || !payload.earning_period_end) {
      return new Response(JSON.stringify({ error: "earning_period_start and earning_period_end are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Resolve dynamic split (only used when percentages are NOT explicitly provided)
    const dynamicSplit = await resolveProfitSplit(supabase, payload.car_id);

    const buildEarningData = (isInsert: boolean) => {
      const grossEarnings = parseFloat(String(payload.gross_earnings));
      const clientProfitPercentage = payload.client_profit_percentage !== undefined
        ? parseFloat(String(payload.client_profit_percentage)) : undefined;
      const hostProfitPercentage = payload.host_profit_percentage !== undefined
        ? parseFloat(String(payload.host_profit_percentage)) : undefined;

      const data: Record<string, unknown> = {
        host_id: user.id,
        trip_id: payload.trip_id,
        car_id: payload.car_id,
        gross_earnings: grossEarnings,
        amount: grossEarnings,
        earning_period_start: payload.earning_period_start,
        earning_period_end: payload.earning_period_end,
      };

      // Use explicit percentages if provided, otherwise use dynamic split
      const cPct = clientProfitPercentage ?? dynamicSplit.clientPct;
      const hPct = hostProfitPercentage ?? dynamicSplit.hostPct;
      data.commission = (grossEarnings * hPct) / 100;
      data.net_amount = (grossEarnings * cPct) / 100;
      data.client_profit_percentage = cPct;
      data.host_profit_percentage = hPct;

      if (payload.guest_name !== undefined) data.guest_name = payload.guest_name || null;
      if (payload.guest_phone !== undefined) data.guest_phone = payload.guest_phone || null;
      if (payload.guest_email !== undefined) data.guest_email = payload.guest_email || null;
      if (payload.trip_idd !== undefined) data.trip_idd = payload.trip_idd || null;
      if (payload.earning_type !== undefined) data.earning_type = payload.earning_type;
      if (payload.payment_source !== undefined) data.payment_source = payload.payment_source;
      if (payload.payment_status !== undefined) data.payment_status = payload.payment_status;
      if (payload.date_paid !== undefined) data.date_paid = payload.date_paid || null;

      if (isInsert) {
        if (!data.earning_type) data.earning_type = "hosting";
        if (!data.payment_source) data.payment_source = "Turo";
        if (!data.payment_status) data.payment_status = "pending";
      }

      return data;
    };

    // Check if earning with this trip_id already exists
    const { data: existingEarning } = await supabase
      .from("host_earnings")
      .select("id, host_id, payment_status")
      .eq("trip_id", payload.trip_id)
      .single();

    let data;
    let error;
    let action: "created" | "updated";

    if (existingEarning) {
      if (existingEarning.host_id !== user.id) {
        return new Response(JSON.stringify({ error: "Not authorized to update this earning" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (existingEarning.payment_status === "paid") {
        return new Response(JSON.stringify({ error: "Cannot update earnings that are already marked as paid" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const updateData = buildEarningData(false);
      const result = await supabase
        .from("host_earnings")
        .update(updateData)
        .eq("id", existingEarning.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
      action = "updated";
    } else {
      const insertData = buildEarningData(true);
      const result = await supabase
        .from("host_earnings")
        .insert(insertData)
        .select()
        .single();
      data = result.data;
      error = result.error;
      action = "created";
    }

    if (error) {
      console.error("Database error:", error.message);
      return new Response(JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(
      JSON.stringify({ success: true, earning: data, action }),
      { status: action === "created" ? 201 : 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
