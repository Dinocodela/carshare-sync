import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      hostName,
      hostEmail,
      hostPhone,
      companyName,
      services,
      coverageArea,
    } = await req.json();

    if (!hostEmail || !hostName) {
      return new Response(
        JSON.stringify({ error: "hostName and hostEmail are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: admins } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("is_super_admin", true)
      .not("email", "is", null);

    const adminEmails = (admins ?? [])
      .map((a) => a.email)
      .filter(Boolean) as string[];

    if (adminEmails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No admin emails found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const appUrl = Deno.env.get("APP_URL") || "https://teslys.app";

    await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: adminEmails,
      subject: `New Host Application: ${hostName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#7c3aed;border-bottom:2px solid #e5e7eb;padding-bottom:16px;">
            🏠 New Host Application
          </h1>
          <p>A new host has applied to join TESLYS and is awaiting your approval.</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;">
            <p style="margin:8px 0;"><strong>Name:</strong> ${hostName}</p>
            ${companyName ? `<p style="margin:8px 0;"><strong>Company:</strong> ${companyName}</p>` : ""}
            <p style="margin:8px 0;"><strong>Email:</strong> <a href="mailto:${hostEmail}">${hostEmail}</a></p>
            ${hostPhone ? `<p style="margin:8px 0;"><strong>Phone:</strong> <a href="tel:${hostPhone}">${hostPhone}</a></p>` : ""}
            ${services ? `<p style="margin:8px 0;"><strong>Services:</strong> ${services}</p>` : ""}
            ${coverageArea ? `<p style="margin:8px 0;"><strong>Coverage:</strong> ${coverageArea}</p>` : ""}
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${appUrl}/admin/manage-accounts" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
              Review Application
            </a>
          </div>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("notify-admin-new-host error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
