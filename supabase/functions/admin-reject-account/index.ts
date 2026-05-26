import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      data: { user: caller },
      error: userErr,
    } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !caller) {
      console.error("getUser error:", userErr);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        account_status: "rejected",
        decided_at: new Date().toISOString(),
        decided_by: caller.id,
        decision_reason: reason || null,
      })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    await supabaseAdmin.from("account_request_history").insert({
      user_id: userId,
      action: "rejected",
      acted_by: caller.id,
      reason: reason || null,
    });

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, email")
      .eq("user_id", userId)
      .single();

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const userEmail = profile?.email || userData?.user?.email;
    const firstName = profile?.first_name || "there";

    if (userEmail) {
      try {
        await resend.emails.send({
          from: "TESLYS Platform <support@dinocodela.com>",
          to: [userEmail],
          subject: "Update on your TESLYS account application",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #b91c1c; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px;">
                Account Application Update
              </h1>
              <p>Hi ${firstName},</p>
              <p>Thank you for your interest in TESLYS. After reviewing your application, we are unable to approve your account at this time.</p>
              ${
                reason
                  ? `<div style="background:#fef2f2;border-left:4px solid #b91c1c;padding:12px 16px;border-radius:6px;margin:16px 0;"><strong>Reason:</strong> ${reason}</div>`
                  : ""
              }
              <p>If you believe this is a mistake or you'd like more information, please contact us at <a href="mailto:support@teslys.com">support@teslys.com</a>.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
              <p style="color:#6b7280;font-size:14px;">The TESLYS Platform Team</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("admin-reject-account error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
