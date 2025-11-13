import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnsubscribeRequest {
  token: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === "POST") {
      // Handle unsubscribe request
      const { token }: UnsubscribeRequest = await req.json();

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Missing unsubscribe token" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      console.log("Processing unsubscribe for token:", token);

      // Find subscription by token
      const { data: subscription, error: findError } = await supabase
        .from("newsletter_subscriptions")
        .select("*")
        .eq("unsubscribe_token", token)
        .single();

      if (findError || !subscription) {
        console.error("Subscription not found:", findError);
        return new Response(
          JSON.stringify({ error: "Invalid unsubscribe token" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check if already unsubscribed
      if (!subscription.is_active) {
        console.log("Already unsubscribed:", subscription.email);
        return new Response(
          JSON.stringify({
            success: true,
            message: "You are already unsubscribed",
            email: subscription.email,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Unsubscribe user
      const { error: updateError } = await supabase
        .from("newsletter_subscriptions")
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("unsubscribe_token", token);

      if (updateError) {
        console.error("Error unsubscribing:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to unsubscribe" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      console.log("Successfully unsubscribed:", subscription.email);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Successfully unsubscribed from newsletter",
          email: subscription.email,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else if (req.method === "GET") {
      // Get subscription info by token (for displaying confirmation page)
      const url = new URL(req.url);
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Missing token parameter" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const { data: subscription, error } = await supabase
        .from("newsletter_subscriptions")
        .select("email, is_active, unsubscribed_at")
        .eq("unsubscribe_token", token)
        .single();

      if (error || !subscription) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(JSON.stringify(subscription), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in newsletter-unsubscribe function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
