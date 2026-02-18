import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EarningPayload {
  trip_id: string;
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth for authentication check
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Create admin client for database operations (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Parse request body
    const payload: EarningPayload = await req.json();
    console.log("Received payload:", JSON.stringify(payload));

    // Validate required fields
    if (!payload.trip_id) {
      return new Response(
        JSON.stringify({ error: "trip_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.car_id) {
      return new Response(
        JSON.stringify({ error: "car_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.gross_earnings || payload.gross_earnings <= 0) {
      return new Response(
        JSON.stringify({ error: "gross_earnings must be a positive number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.earning_period_start || !payload.earning_period_end) {
      return new Response(
        JSON.stringify({ error: "earning_period_start and earning_period_end are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build data object with only provided fields
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

      // Calculate commission/net only when percentages are available
      const cPct = clientProfitPercentage ?? 70;
      const hPct = hostProfitPercentage ?? 30;
      data.commission = (grossEarnings * hPct) / 100;
      data.net_amount = (grossEarnings * cPct) / 100;

      if (clientProfitPercentage !== undefined) data.client_profit_percentage = clientProfitPercentage;
      if (hostProfitPercentage !== undefined) data.host_profit_percentage = hostProfitPercentage;
      if (payload.guest_name !== undefined) data.guest_name = payload.guest_name || null;
      if (payload.guest_phone !== undefined) data.guest_phone = payload.guest_phone || null;
      if (payload.guest_email !== undefined) data.guest_email = payload.guest_email || null;
      if (payload.earning_type !== undefined) data.earning_type = payload.earning_type;
      if (payload.payment_source !== undefined) data.payment_source = payload.payment_source;
      if (payload.payment_status !== undefined) data.payment_status = payload.payment_status;
      if (payload.date_paid !== undefined) data.date_paid = payload.date_paid || null;

      // Set defaults only on insert
      if (isInsert) {
        if (!data.earning_type) data.earning_type = "hosting";
        if (!data.payment_source) data.payment_source = "Turo";
        if (!data.payment_status) data.payment_status = "pending";
        if (data.client_profit_percentage === undefined) data.client_profit_percentage = 70;
        if (data.host_profit_percentage === undefined) data.host_profit_percentage = 30;
      }

      return data;
    };

    console.log("Payload keys:", Object.keys(payload));

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
      // Verify ownership
      if (existingEarning.host_id !== user.id) {
        return new Response(
          JSON.stringify({ error: "Not authorized to update this earning" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Prevent updates to paid earnings
      if (existingEarning.payment_status === "paid") {
        return new Response(
          JSON.stringify({ error: "Cannot update earnings that are already marked as paid" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updateData = buildEarningData(false);
      console.log("Updating earning with fields:", Object.keys(updateData));

      const result = await supabase
        .from("host_earnings")
        .update(updateData)
        .eq("id", existingEarning.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
      action = "updated";
      console.log("Updated earning:", existingEarning.id);
    } else {
      const insertData = buildEarningData(true);
      console.log("Creating earning with fields:", Object.keys(insertData));

      const result = await supabase
        .from("host_earnings")
        .insert(insertData)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
      action = "created";
      console.log("Created earning:", data?.id);
    }

    if (error) {
      console.error("Database error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, earning: data, action }),
      { status: action === "created" ? 201 : 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
