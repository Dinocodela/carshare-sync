import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is a super admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user: caller },
    } = await supabaseUser.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check caller is super admin
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", caller.id)
      .single();

    if (!callerProfile?.is_super_admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, reason } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update account status to approved
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        account_status: "approved",
        decided_at: new Date().toISOString(),
        decided_by: caller.id,
        decision_reason: reason || null,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the action
    await supabaseAdmin.from("account_request_history").insert({
      user_id: userId,
      action: "approved",
      acted_by: caller.id,
      reason: reason || null,
    });

    // Get user email and name for the notification
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("user_id", userId)
      .single();

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const userEmail = profile?.email || userData?.user?.email;
    const firstName = profile?.first_name || "there";

    const appUrl = Deno.env.get("APP_URL") || "https://teslys.app";

    // Send approval email
    if (userEmail) {
      try {
        await resend.emails.send({
          from: "TESLYS Platform <support@dinocodela.com>",
          to: [userEmail],
          subject: "Your TESLYS account has been approved 🎉",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #059669; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px;">
                🎉 Account Approved
              </h1>
              
              <p>Hi ${firstName},</p>
              
              <p>Your TESLYS account has been <strong>approved</strong>. You can now sign in and start using the app.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/dashboard" 
                   style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Open Dashboard
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px;">
                Best regards,<br>
                The TESLYS Platform Team
              </p>
              
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </div>
          `,
        });
        console.log("Approval email sent to", userEmail);
      } catch (emailErr) {
        console.error("Failed to send approval email:", emailErr);
        // Don't fail the approval if email fails
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in admin-approve-account:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
