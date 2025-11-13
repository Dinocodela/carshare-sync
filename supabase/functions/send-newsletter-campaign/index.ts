import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
  variables?: Record<string, string>;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

// Advanced personalization with conditional blocks
const personalizeContent = (content: string, context: Record<string, any>): string => {
  if (!content) return "";
  
  let result = content;
  
  // Process conditional blocks
  const ifBlockRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
  result = result.replace(ifBlockRegex, (_match: string, condition: string, blockContent: string) => {
    return blockContent; // Simplified for newsletter
  });
  
  // Replace variables
  Object.entries(context).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, String(value || ''));
  });
  
  return result;
};

// Legacy function for backward compatibility
const replaceVariables = (text: string, variables: Record<string, string>): string => {
  return personalizeContent(text, variables);
};

const generateHtmlFromTemplate = (sections: any[], variables: Record<string, string>): string => {
  const sectionHtml = sections.map(section => {
    switch (section.type) {
      case "header":
        return `
          <div style="background-color: ${section.content.backgroundColor || '#0EA5E9'}; padding: 20px; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0;">
              ${replaceVariables(section.content.logo || "Logo", variables)}
            </h1>
          </div>`;
      case "hero":
        return `
          <div style="background-color: ${section.content.backgroundColor || '#F0F9FF'}; padding: 40px 20px; text-align: center;">
            <h2 style="font-size: 32px; margin: 0 0 10px 0; color: #1a1a1a;">
              ${replaceVariables(section.content.title || "", variables)}
            </h2>
            <p style="font-size: 18px; margin: 0; color: #666;">
              ${replaceVariables(section.content.subtitle || "", variables)}
            </p>
          </div>`;
      case "text":
        return `
          <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.6; color: #333; white-space: pre-wrap;">
              ${replaceVariables(section.content.body || "", variables)}
            </p>
          </div>`;
      case "image":
        return `
          <div style="padding: 20px; text-align: center;">
            <img src="${replaceVariables(section.content.url || "", variables)}" 
                 alt="${replaceVariables(section.content.alt || "Image", variables)}" 
                 style="max-width: 100%; height: auto;" />
          </div>`;
      case "button":
        return `
          <div style="padding: 20px; text-align: center;">
            <a href="${replaceVariables(section.content.url || "#", variables)}" 
               style="display: inline-block; padding: 12px 24px; background-color: ${section.content.backgroundColor || '#0EA5E9'}; color: white; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
              ${replaceVariables(section.content.text || "Button", variables)}
            </a>
          </div>`;
      case "divider":
        return `<div style="padding: 20px;"><hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" /></div>`;
      case "footer":
        return `
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666;">
            <p style="margin: 0 0 10px 0;">${replaceVariables(section.content.text || "", variables)}</p>
            <p style="margin: 0; font-size: 12px;">
              <a href="#" style="color: #666; text-decoration: underline;">
                ${replaceVariables(section.content.unsubscribeText || "Unsubscribe", variables)}
              </a>
            </p>
          </div>`;
      default:
        return "";
    }
  }).join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          ${sectionHtml}
        </div>
      </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      throw new Error("Unauthorized: Super admin access required");
    }

    const { campaignId, variables = {} }: SendCampaignRequest = await req.json();

    if (!campaignId) {
      throw new Error("Campaign ID is required");
    }

    console.log(`Starting campaign send for campaign: ${campaignId}`);

    // Fetch campaign with template
    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select(`
        *,
        template:newsletter_templates(*)
      `)
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status === "sent") {
      throw new Error("Campaign already sent");
    }

    await supabase
      .from("newsletter_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscriptions")
      .select("id, email, unsubscribe_token")
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

    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (subscriber) => {
          try {
            // Personalize content with subscriber data
            const subscriberVariables = {
              ...variables,
              email: subscriber.email,
            };

            let subject: string;
            let htmlContent: string;

            if (campaign.template) {
              // Use template with variable substitution
              const template = campaign.template as any;
              subject = replaceVariables(template.subject_template, subscriberVariables);
              htmlContent = generateHtmlFromTemplate(template.html_content.sections, subscriberVariables);
            } else {
              // Fallback to campaign content
              subject = campaign.subject;
              htmlContent = campaign.content;
            }

            // Generate unsubscribe link
            const unsubscribeUrl = `https://teslys.app/unsubscribe?token=${subscriber.unsubscribe_token}`;
            
            // Add unsubscribe footer to HTML content
            const htmlWithUnsubscribe = htmlContent + `
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
                <p>You're receiving this email because you subscribed to the Teslys newsletter.</p>
                <p><a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from future emails</p>
              </div>
            `;

            const { error: emailError } = await resend.emails.send({
              from: "Teslys <onboarding@resend.dev>",
              to: [subscriber.email],
              subject: subject,
              html: htmlWithUnsubscribe,
            });

            if (emailError) {
              throw emailError;
            }

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