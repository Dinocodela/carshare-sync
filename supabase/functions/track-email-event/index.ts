import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const assignmentId = url.searchParams.get("a");
    const eventType = url.searchParams.get("e"); // 'open' or 'click'

    if (!assignmentId || !eventType) {
      return new Response("Missing parameters", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user agent and IP
    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";

    // Update assignment record
    const updateField = eventType === "open" ? "opened_at" : "clicked_at";
    
    const { data: assignment } = await supabase
      .from("email_ab_assignments")
      .select("*")
      .eq("id", assignmentId)
      .single();

    if (assignment && !assignment[updateField]) {
      // Only update if not already tracked (first time)
      await supabase
        .from("email_ab_assignments")
        .update({ [updateField]: new Date().toISOString() })
        .eq("id", assignmentId);
    }

    // Log event
    await supabase
      .from("email_ab_events")
      .insert({
        assignment_id: assignmentId,
        event_type: eventType === "open" ? "opened" : "clicked",
        user_agent: userAgent,
        ip_address: ip,
        event_data: {
          url: url.toString(),
          timestamp: new Date().toISOString(),
        },
      });

    console.log(`Tracked ${eventType} event for assignment ${assignmentId}`);

    // Return transparent 1x1 pixel for opens, redirect for clicks
    if (eventType === "open") {
      const pixel = new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
        0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
        0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
        0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
        0x01, 0x00, 0x3b,
      ]);
      
      return new Response(pixel, {
        status: 200,
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...corsHeaders,
        },
      });
    } else {
      // For clicks, redirect to the actual URL
      const targetUrl = url.searchParams.get("url") || "/";
      return Response.redirect(targetUrl, 302);
    }
  } catch (error: any) {
    console.error("Error tracking email event:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
