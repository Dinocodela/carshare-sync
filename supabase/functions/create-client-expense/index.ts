import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpensePayload {
  trip_id: string;
  car_id?: string;
  guest_name?: string;
  ev_charge_cost?: number;
  carwash_cost?: number;
  delivery_cost?: number;
  toll_cost?: number;
  amount?: number;
  description?: string;
  expense_date: string;
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

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Parse request body
    const payload: ExpensePayload = await req.json();
    console.log("Received payload:", JSON.stringify(payload));

    // Validate required fields
    if (!payload.trip_id) {
      return new Response(
        JSON.stringify({ error: "trip_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.expense_date) {
      return new Response(
        JSON.stringify({ error: "expense_date is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and calculate costs
    const evChargeCost = parseFloat(String(payload.ev_charge_cost)) || 0;
    const carwashCost = parseFloat(String(payload.carwash_cost)) || 0;
    const deliveryCost = parseFloat(String(payload.delivery_cost)) || 0;
    const tollCost = parseFloat(String(payload.toll_cost)) || 0;
    const baseAmount = parseFloat(String(payload.amount)) || 0;
    const totalExpenses = evChargeCost + carwashCost + deliveryCost + tollCost + baseAmount;

    console.log("Calculated costs:", { evChargeCost, carwashCost, deliveryCost, tollCost, baseAmount, totalExpenses });

    // Insert into host_expenses table
    const { data, error } = await supabase
      .from("host_expenses")
      .insert({
        host_id: user.id,
        trip_id: payload.trip_id,
        car_id: payload.car_id || null,
        guest_name: payload.guest_name || null,
        expense_type: "general",
        amount: baseAmount,
        ev_charge_cost: evChargeCost,
        carwash_cost: carwashCost,
        delivery_cost: deliveryCost,
        toll_cost: tollCost,
        total_expenses: totalExpenses,
        description: payload.description || null,
        expense_date: payload.expense_date,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Created expense:", data.id);

    return new Response(
      JSON.stringify({ success: true, expense: data }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
