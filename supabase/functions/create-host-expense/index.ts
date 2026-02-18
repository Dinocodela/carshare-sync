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

    // Build data object with only provided fields
    const buildExpenseData = (isInsert: boolean) => {
      const data: Record<string, unknown> = {
        host_id: user.id,
        trip_id: payload.trip_id,
        expense_date: payload.expense_date,
      };

      // Only set fields that were explicitly provided in the payload
      if (payload.car_id !== undefined) data.car_id = payload.car_id || null;
      if (payload.guest_name !== undefined) data.guest_name = payload.guest_name || null;
      if (payload.ev_charge_cost !== undefined) data.ev_charge_cost = parseFloat(String(payload.ev_charge_cost)) || 0;
      if (payload.carwash_cost !== undefined) data.carwash_cost = parseFloat(String(payload.carwash_cost)) || 0;
      if (payload.delivery_cost !== undefined) data.delivery_cost = parseFloat(String(payload.delivery_cost)) || 0;
      if (payload.toll_cost !== undefined) data.toll_cost = parseFloat(String(payload.toll_cost)) || 0;
      if (payload.amount !== undefined) data.amount = parseFloat(String(payload.amount)) || 0;
      if (payload.description !== undefined) data.description = payload.description || null;

      // Set defaults only on insert
      if (isInsert) {
        data.expense_type = "general";
        if (data.amount === undefined) data.amount = 0;
      }

      return data;
    };

    console.log("Payload keys:", Object.keys(payload));

    // Check if expense with this trip_id already exists
    const { data: existingExpense } = await supabase
      .from("host_expenses")
      .select("id, host_id")
      .eq("trip_id", payload.trip_id)
      .single();

    let data;
    let error;
    let action: "created" | "updated";

    if (existingExpense) {
      // Verify ownership
      if (existingExpense.host_id !== user.id) {
        return new Response(
          JSON.stringify({ error: "Not authorized to update this expense" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updateData = buildExpenseData(false);
      console.log("Updating expense with fields:", Object.keys(updateData));

      const result = await supabase
        .from("host_expenses")
        .update(updateData)
        .eq("id", existingExpense.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
      action = "updated";
      console.log("Updated expense:", existingExpense.id);
    } else {
      const insertData = buildExpenseData(true);
      console.log("Creating expense with fields:", Object.keys(insertData));

      const result = await supabase
        .from("host_expenses")
        .insert(insertData)
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
