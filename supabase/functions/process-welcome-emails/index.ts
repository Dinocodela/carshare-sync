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

// Advanced personalization function
const personalizeContent = (content: string, user: any): string => {
  if (!content) return "";
  
  // Build personalization context
  const context = {
    user_first_name: user.first_name || '',
    user_last_name: user.last_name || '',
    user_full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    user_email: user.email || '',
    first_name: user.first_name || '', // Legacy support
    last_name: user.last_name || '', // Legacy support
    email: user.email || '', // Legacy support
    company_name: user.company_name || '',
    location: user.location || '',
    role: user.role || '',
    phone: user.phone || '',
    signup_source: user.signup_source || '',
    user_segment: user.user_segment || '',
    tags: (user.tags || []).join(', '),
    login_count: user.login_count || 0,
    last_login_at: user.last_login_at || '',
    account_status: user.account_status || '',
    is_subscribed: user.is_subscribed || false,
    ...user.custom_properties || {},
  };
  
  let result = content;
  
  // Process conditional blocks {{#if condition}}...{{/if}}
  const ifBlockRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
  result = result.replace(ifBlockRegex, (_match: string, condition: string, blockContent: string) => {
    const shouldShow = evaluateCondition(condition.trim(), context);
    return shouldShow ? blockContent : '';
  });
  
  // Process {{#unless condition}}...{{/unless}} blocks
  const unlessBlockRegex = /{{#unless\s+([^}]+)}}([\s\S]*?){{\/unless}}/g;
  result = result.replace(unlessBlockRegex, (_match: string, condition: string, blockContent: string) => {
    const shouldShow = !evaluateCondition(condition.trim(), context);
    return shouldShow ? blockContent : '';
  });
  
  // Replace all variables
  Object.entries(context).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, String(value || ''));
  });
  
  return result;
};

// Evaluate conditional expressions
const evaluateCondition = (condition: string, context: Record<string, any>): boolean => {
  try {
    const operators = ['==', '!=', '>', '<', '>=', '<=', 'includes', 'not includes'];
    
    let operator = '';
    let parts: string[] = [];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        operator = op;
        parts = condition.split(op).map(p => p.trim());
        break;
      }
    }
    
    if (!operator || parts.length !== 2) return false;
    
    const [leftSide, rightSide] = parts;
    const leftValue: any = context[leftSide];
    let rightValue: any = rightSide.replace(/^['"]|['"]$/g, '');
    
    if (!isNaN(Number(rightValue))) rightValue = Number(rightValue);
    if (rightValue === 'true') rightValue = true;
    if (rightValue === 'false') rightValue = false;
    
    switch (operator) {
      case '==': return leftValue == rightValue;
      case '!=': return leftValue != rightValue;
      case '>': return Number(leftValue) > Number(rightValue);
      case '<': return Number(leftValue) < Number(rightValue);
      case '>=': return Number(leftValue) >= Number(rightValue);
      case '<=': return Number(leftValue) <= Number(rightValue);
      case 'includes':
        if (Array.isArray(leftValue)) return leftValue.includes(rightValue);
        if (typeof leftValue === 'string') return leftValue.includes(rightValue);
        return false;
      case 'not includes':
        if (Array.isArray(leftValue)) return !leftValue.includes(rightValue);
        if (typeof leftValue === 'string') return !leftValue.includes(rightValue);
        return true;
      default: return false;
    }
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
};

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
        user:profiles(*)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);
    
    if (queueError) {
      throw new Error(`Failed to fetch queue: ${queueError.message}`);
    }

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

        let subject = step.subject;
        let htmlContent = step.html_content;
        let assignmentId: string | null = null;

        // Check for active A/B test
        const { data: activeTest } = await supabase
          .from("email_ab_tests")
          .select(`
            *,
            variants:email_ab_variants(*)
          `)
          .eq("step_id", step.id)
          .eq("status", "active")
          .single();

        if (activeTest && activeTest.variants && activeTest.variants.length > 0) {
          // Check if user already has an assignment
          let assignment = await supabase
            .from("email_ab_assignments")
            .select("*, variant:email_ab_variants(*)")
            .eq("test_id", activeTest.id)
            .eq("user_id", item.user_id)
            .single();

          if (!assignment.data) {
            // Assign variant based on traffic allocation
            const variants = activeTest.variants as any[];
            const random = Math.random() * 100;
            let cumulative = 0;
            let selectedVariant = variants[0];

            for (const variant of variants) {
              cumulative += variant.traffic_allocation;
              if (random <= cumulative) {
                selectedVariant = variant;
                break;
              }
            }

            // Create assignment
            const { data: newAssignment } = await supabase
              .from("email_ab_assignments")
              .insert({
                test_id: activeTest.id,
                variant_id: selectedVariant.id,
                user_id: item.user_id,
                queue_item_id: item.id,
              })
              .select("*, variant:email_ab_variants(*)")
              .single();

            assignment = newAssignment;
          }

          if (assignment.data) {
            assignmentId = assignment.data.id;
            const variant = assignment.data.variant as any;
            subject = variant.subject;
            htmlContent = variant.html_content;
          }
        }

        // Use advanced personalization
        subject = personalizeContent(subject, user);
        htmlContent = personalizeContent(htmlContent, user);

        // Add tracking pixel if A/B test is active
        if (assignmentId) {
          const trackingPixel = `<img src="${supabaseUrl}/functions/v1/track-email-event?a=${assignmentId}&e=open" width="1" height="1" style="display:none" />`;
          htmlContent = htmlContent.replace("</body>", `${trackingPixel}</body>`);
          
          // Replace links with tracked links
          htmlContent = htmlContent.replace(
            /href="([^"]+)"/g,
            `href="${supabaseUrl}/functions/v1/track-email-event?a=${assignmentId}&e=click&url=$1"`
          );
        }

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: "Teslys <onboarding@resend.dev>",
          to: [user.email],
          subject: subject,
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

        // Update assignment sent_at
        if (assignmentId) {
          await supabase
            .from("email_ab_assignments")
            .update({ sent_at: new Date().toISOString() })
            .eq("id", assignmentId);
        }

        successCount++;
        console.log(`Sent welcome email to: ${user.email}${assignmentId ? ` (A/B test assignment: ${assignmentId})` : ""}`);
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
