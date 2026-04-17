import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClaimPayload {
  incident_id: string;
  car_id: string;
  trip_id?: string;
  guest_name?: string;
  payment_source?: string;
  claim_type: string;
  description: string;
  accident_description?: string;
  claim_amount?: number;
  incident_date: string;
  claim_status?: string;
  photos_taken?: boolean;
  is_paid?: boolean;
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

    // Create auth client to verify user
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
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

    // Create service role client for database operations (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const payload: ClaimPayload = await req.json();
    console.log("Received payload:", JSON.stringify(payload));

    // Validate required fields
    if (!payload.incident_id) {
      return new Response(
        JSON.stringify({ error: "incident_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.car_id) {
      return new Response(
        JSON.stringify({ error: "car_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.claim_type) {
      return new Response(
        JSON.stringify({ error: "claim_type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.description) {
      return new Response(
        JSON.stringify({ error: "description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.incident_date) {
      return new Response(
        JSON.stringify({ error: "incident_date is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if claim with this incident_id already exists
    const { data: existingClaim, error: fetchError } = await supabase
      .from("host_claims")
      .select("id, host_id")
      .eq("incident_id", payload.incident_id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing claim:", fetchError.message);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claimData = {
      host_id: user.id,
      car_id: payload.car_id,
      incident_id: payload.incident_id,
      trip_id: payload.trip_id || null,
      guest_name: payload.guest_name || null,
      payment_source: payload.payment_source || null,
      claim_type: payload.claim_type,
      description: payload.description,
      accident_description: payload.accident_description || null,
      claim_amount: payload.claim_amount || null,
      incident_date: payload.incident_date,
      claim_status: payload.claim_status || "pending",
      photos_taken: payload.photos_taken || false,
      is_paid: payload.is_paid || false,
    };

    let data;
    let isUpdate = false;

    if (existingClaim) {
      // Verify the existing claim belongs to this user
      if (existingClaim.host_id !== user.id) {
        console.error("User does not own this claim");
        return new Response(
          JSON.stringify({ error: "You do not have permission to update this claim" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update existing claim
      console.log("Updating existing claim:", existingClaim.id);
      const { data: updatedClaim, error: updateError } = await supabase
        .from("host_claims")
        .update(claimData)
        .eq("id", existingClaim.id)
        .select()
        .single();

      if (updateError) {
        console.error("Database update error:", updateError.message);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      data = updatedClaim;
      isUpdate = true;
      console.log("Updated claim:", data.id);
    } else {
      // Insert new claim
      console.log("Creating new claim with incident_id:", payload.incident_id);
      const { data: newClaim, error: insertError } = await supabase
        .from("host_claims")
        .insert(claimData)
        .select()
        .single();

      if (insertError) {
        console.error("Database insert error:", insertError.message);
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      data = newClaim;
      console.log("Created claim:", data.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        claim: data,
        action: isUpdate ? "updated" : "created"
      }),
      { status: isUpdate ? 200 : 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
