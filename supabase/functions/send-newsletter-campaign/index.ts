import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated and is super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is super admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      throw new Error("Unauthorized: Super admin access required");
    }

    const { campaignId }: SendCampaignRequest = await req.json();

    if (!campaignId) {
      throw new Error("Campaign ID is required");
    }

    console.log(`Starting campaign send for campaign: ${campaignId}`);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status === "sent") {
      throw new Error("Campaign already sent");
    }

    // Update campaign status to sending
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscriptions")
      .select("id, email")
      .eq("is_active", true);

    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      await supabase
        .from("newsletter_campaigns")
        .update({ 
          status: "failed",
          recipient_count: 0,
          delivered_count: 0,
          failed_count: 0
        })
        .eq("id", campaignId);

      throw new Error("No active subscribers found");
    }

    console.log(`Sending to ${subscribers.length} subscribers`);

    let deliveredCount = 0;
    let failedCount = 0;

    // Send emails in batches
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (subscriber) => {
          try {
            // Send email via Resend
            const { error: emailError } = await resend.emails.send({
              from: "Teslys <onboarding@resend.dev>",
              to: [subscriber.email],
              subject: campaign.subject,
              html: campaign.content,
            });

            if (emailError) {
              throw emailError;
            }

            // Record successful send
            await supabase
              .from("newsletter_campaign_sends")
              .insert({
                campaign_id: campaignId,
                subscriber_id: subscriber.id,
                email: subscriber.email,
                status: "sent",
                sent_at: new Date().toISOString(),
              });

            deliveredCount++;
            console.log(`Sent to: ${subscriber.email}`);
          } catch (error) {
            // Record failed send
            await supabase
              .from("newsletter_campaign_sends")
              .insert({
                campaign_id: campaignId,
                subscriber_id: subscriber.id,
                email: subscriber.email,
                status: "failed",
                error_message: error.message,
              });

            failedCount++;
            console.error(`Failed to send to ${subscriber.email}:`, error);
          }
        })
      );
    }

    // Update campaign with final stats
    await supabase
      .from("newsletter_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: subscribers.length,
        delivered_count: deliveredCount,
        failed_count: failedCount,
      })
      .eq("id", campaignId);

    console.log(`Campaign completed: ${deliveredCount} delivered, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        recipientCount: subscribers.length,
        deliveredCount,
        failedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter-campaign function:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
