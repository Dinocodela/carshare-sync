import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpensePayload {
  car_id: string;
  expense_type: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "yearly";
  provider_name?: string;
  policy_number?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
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
    if (!payload.car_id || !payload.expense_type || !payload.amount || !payload.frequency || !payload.start_date) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          required: ["car_id", "expense_type", "amount", "frequency", "start_date"]
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate expense_type
    const validTypes = ["insurance", "registration", "loan_payment", "lease_payment", "parking", "storage", "other"];
    if (!validTypes.includes(payload.expense_type)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid expense_type",
          valid_types: validTypes
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate frequency
    const validFrequencies = ["monthly", "quarterly", "yearly"];
    if (!validFrequencies.includes(payload.frequency)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid frequency",
          valid_frequencies: validFrequencies
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate amount is positive
    if (payload.amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Amount must be greater than 0" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the expense (RLS will verify car ownership)
    const { data, error } = await supabase
      .from("client_car_expenses")
      .insert({
        car_id: payload.car_id,
        client_id: user.id,
        expense_type: payload.expense_type,
        amount: payload.amount,
        frequency: payload.frequency,
        provider_name: payload.provider_name || null,
        policy_number: payload.policy_number || null,
        start_date: payload.start_date,
        end_date: payload.end_date || null,
        notes: payload.notes || null,
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
