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

    // Check if expense with this trip_id already exists
    const { data: existingExpense } = await supabase
      .from("host_expenses")
      .select("id, host_id")
      .eq("trip_id", payload.trip_id)
      .single();

    let data;
    let error;
    let action: "created" | "updated";

    const expenseData = {
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
      description: payload.description || null,
      expense_date: payload.expense_date,
    };

    if (existingExpense) {
      // Verify ownership
      if (existingExpense.host_id !== user.id) {
        return new Response(
          JSON.stringify({ error: "Not authorized to update this expense" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update existing expense
      const result = await supabase
        .from("host_expenses")
        .update(expenseData)
        .eq("id", existingExpense.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
      action = "updated";
      console.log("Updated expense:", existingExpense.id);
    } else {
      // Insert new expense
      const result = await supabase
        .from("host_expenses")
        .insert(expenseData)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
      action = "created";
      console.log("Created expense:", data?.id);
    }

    if (error) {
      console.error("Database error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, expense: data, action }),
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
