import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing welcome email queue...");

    // Fetch pending emails that are due to be sent
    const { data: queueItems, error: queueError } = await supabase
      .from("welcome_email_queue")
      .select(`
        *,
        step:welcome_email_steps(*),
        user:profiles(email, first_name, last_name)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);

    if (queueError) {
      throw new Error(`Failed to fetch queue: ${queueError.message}`);
    }

    if (!queueItems || queueItems.length === 0) {
      console.log("No emails to send");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Processing ${queueItems.length} emails`);

    let successCount = 0;
    let failCount = 0;

    for (const item of queueItems) {
      try {
        const step = item.step as any;
        const user = item.user as any;

        if (!user?.email) {
          throw new Error("User email not found");
        }

        // Replace variables in content
        let htmlContent = step.html_content;
        htmlContent = htmlContent.replace(/{{first_name}}/g, user.first_name || "");
        htmlContent = htmlContent.replace(/{{last_name}}/g, user.last_name || "");
        htmlContent = htmlContent.replace(/{{email}}/g, user.email);

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: "Teslys <onboarding@resend.dev>",
          to: [user.email],
          subject: step.subject,
          html: htmlContent,
        });

        if (emailError) {
          throw emailError;
        }

        // Update queue item as sent
        await supabase
          .from("welcome_email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        successCount++;
        console.log(`Sent welcome email to: ${user.email}`);
      } catch (error) {
        // Update queue item as failed
        await supabase
          .from("welcome_email_queue")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", item.id);

        failCount++;
        console.error(`Failed to send email:`, error);
      }
    }

    console.log(`Processed: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: queueItems.length,
        sent: successCount,
        failed: failCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-welcome-emails function:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
