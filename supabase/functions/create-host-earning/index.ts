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

    // Parse values (profit amounts will be calculated on request, not stored)
    const grossEarnings = parseFloat(String(payload.gross_earnings));
    const clientProfitPercentage = parseFloat(String(payload.client_profit_percentage)) || 70;
    const hostProfitPercentage = parseFloat(String(payload.host_profit_percentage)) || 30;
    
    // Calculate amounts for backwards compatibility fields (amount, commission, net_amount)
    const clientProfitAmount = (grossEarnings * clientProfitPercentage) / 100;
    const hostProfitAmount = (grossEarnings * hostProfitPercentage) / 100;

    console.log("Calculated values:", { 
      grossEarnings, 
      clientProfitPercentage, 
      hostProfitPercentage
    });

    // Check if earning with this trip_id already exists
    const { data: existingEarning } = await supabase
      .from("host_earnings")
      .select("id, host_id, payment_status")
      .eq("trip_id", payload.trip_id)
      .single();

    let data;
    let error;
    let action: "created" | "updated";

    const earningData = {
      host_id: user.id,
      trip_id: payload.trip_id,
      car_id: payload.car_id,
      guest_name: payload.guest_name || null,
      guest_phone: payload.guest_phone || null,
      guest_email: payload.guest_email || null,
      earning_type: payload.earning_type || "hosting",
      gross_earnings: grossEarnings,
      amount: grossEarnings,
      commission: hostProfitAmount,
      net_amount: clientProfitAmount,
      client_profit_percentage: clientProfitPercentage,
      host_profit_percentage: hostProfitPercentage,
      payment_source: payload.payment_source || "Turo",
      earning_period_start: payload.earning_period_start,
      earning_period_end: payload.earning_period_end,
      payment_status: payload.payment_status || "pending",
      date_paid: payload.date_paid || null,
    };

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

      // Update existing earning
      const result = await supabase
        .from("host_earnings")
        .update(earningData)
        .eq("id", existingEarning.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
      action = "updated";
      console.log("Updated earning:", existingEarning.id);
    } else {
      // Insert new earning
      const result = await supabase
        .from("host_earnings")
        .insert(earningData)
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
