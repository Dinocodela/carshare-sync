import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const phone = body?.phone ? String(body.phone).trim() : null;
    const amount = body?.amount ? String(body.amount).trim() : null;
    const message = body?.message ? String(body.message).trim() : null;
    const userId = body?.userId ? String(body.userId) : null;

    // Validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk || !amount) {
      return jsonResponse({ error: "Name, a valid email, and interested amount are required." }, 400);
    }
    if (name.length > 200 || email.length > 320 || (message?.length ?? 0) > 4000) {
      return jsonResponse({ error: "Input too long." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Save the inquiry
    const { data: inserted, error: insErr } = await supabase
      .from("investor_inquiries")
      .insert({ user_id: userId, name, email, phone, amount, message })
      .select("id")
      .maybeSingle();

    if (insErr) {
      console.error("Failed to save investor inquiry:", insErr);
      return jsonResponse({ error: "Failed to save inquiry" }, 500);
    }

    const inquiryId = inserted?.id ?? crypto.randomUUID();

    // 1) Confirmation email to the investor
    const investorConfirmation = supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "investor-inquiry-received",
        recipientEmail: email,
        idempotencyKey: `investor-inquiry-confirm-${inquiryId}`,
        templateData: { name, amount, message },
      },
    });

    // 2) Notification email to all super-admins
    const { data: admins } = await supabase
      .from("profiles")
      .select("email")
      .eq("is_super_admin", true)
      .not("email", "is", null);

    const adminEmails = (admins ?? [])
      .map((a: any) => a.email)
      .filter(Boolean) as string[];

    const adminNotifications = adminEmails.map((to) =>
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "admin-notification",
          recipientEmail: to,
          idempotencyKey: `investor-inquiry-admin-${inquiryId}-${to}`,
          templateData: {
            kind: "inquiry",
            name,
            email,
            phone: phone ?? "",
            amount,
            message: message ?? "",
            reviewUrl: "https://teslys.app/admin/investments",
          },
        },
      })
    );

    const results = await Promise.allSettled([investorConfirmation, ...adminNotifications]);
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length) {
      console.error("Some investor-inquiry emails failed to enqueue", failed);
    }

    return jsonResponse({ success: true, id: inquiryId });
  } catch (e: any) {
    console.error("submit-investor-inquiry error:", e);
    return jsonResponse({ error: e?.message ?? String(e) }, 500);
  }
});
