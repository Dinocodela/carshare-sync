import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdatePayload {
  trip_id: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: UpdatePayload = await req.json();
    console.log("Received payload:", payload);

    if (!payload.trip_id) {
      return new Response(
        JSON.stringify({ error: "trip_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const updateData: Record<string, string | null> = {};
    if (payload.guest_name !== undefined) updateData.guest_name = payload.guest_name || null;
    if (payload.guest_phone !== undefined) updateData.guest_phone = payload.guest_phone || null;
    if (payload.guest_email !== undefined) updateData.guest_email = payload.guest_email || null;

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one field (guest_name, guest_phone, guest_email) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Updating trip_id:", payload.trip_id, "with data:", updateData);

    const { data, error } = await supabase
      .from("host_earnings")
      .update(updateData)
      .eq("trip_id", payload.trip_id)
      .select();

    if (error) {
      console.error("Update error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data || data.length === 0) {
      console.log("No record found for trip_id:", payload.trip_id);
      return new Response(
        JSON.stringify({ error: "No earning found with this trip_id", trip_id: payload.trip_id }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Updated successfully:", data.length, "record(s)");

    return new Response(
      JSON.stringify({ success: true, updated: data.length, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
