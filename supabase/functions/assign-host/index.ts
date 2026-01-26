import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssignHostPayload {
  car_id: string;
  host_id: string;
  message?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Get authenticated user
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
    let payload: AssignHostPayload;
    try {
      payload = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Received payload:", JSON.stringify(payload));

    // Validate required fields
    if (!payload.car_id || typeof payload.car_id !== 'string') {
      return new Response(
        JSON.stringify({ error: "car_id is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.host_id || typeof payload.host_id !== 'string') {
      return new Response(
        JSON.stringify({ error: "host_id is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user owns this car
    const { data: car, error: carError } = await supabase
      .from("cars")
      .select("id, client_id, host_id, status, make, model, year")
      .eq("id", payload.car_id)
      .single();

    if (carError || !car) {
      console.error("Car lookup error:", carError?.message);
      return new Response(
        JSON.stringify({ error: "Car not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the authenticated user is the car owner
    if (car.client_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You are not authorized to assign a host to this car" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the car already has a host
    if (car.host_id) {
      return new Response(
        JSON.stringify({ error: "This car already has a host assigned. Remove the current host first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the host exists and is an approved host
    const { data: hostProfile, error: hostError } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, role, account_status")
      .eq("user_id", payload.host_id)
      .eq("role", "host")
      .eq("account_status", "approved")
      .single();

    if (hostError || !hostProfile) {
      console.error("Host lookup error:", hostError?.message);
      return new Response(
        JSON.stringify({ error: "Host not found or not approved" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a hosting request record for audit trail
    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .insert({
        car_id: payload.car_id,
        client_id: user.id,
        host_id: payload.host_id,
        message: payload.message || "Host assigned via API",
        status: "accepted",
      })
      .select()
      .single();

    if (requestError) {
      console.error("Request creation error:", requestError.message);
      return new Response(
        JSON.stringify({ error: "Failed to create hosting request record" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the car with the host assignment
    const { data: updatedCar, error: updateError } = await supabase
      .from("cars")
      .update({
        host_id: payload.host_id,
        status: "hosted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.car_id)
      .select()
      .single();

    if (updateError) {
      console.error("Car update error:", updateError.message);
      // Rollback the request if car update fails
      await supabase.from("requests").delete().eq("id", requestData.id);
      return new Response(
        JSON.stringify({ error: "Failed to assign host to car" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully assigned host", payload.host_id, "to car", payload.car_id);

    return new Response(
      JSON.stringify({
        success: true,
        car: updatedCar,
        request: requestData,
        host: {
          user_id: hostProfile.user_id,
          first_name: hostProfile.first_name,
          last_name: hostProfile.last_name,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
