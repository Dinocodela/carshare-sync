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

    // Honeypot: bots fill hidden fields; real users leave them empty.
    if (body?.company_website) {
      return jsonResponse({ success: true });
    }

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const phone = body?.phone ? String(body.phone).trim() : null;
    const modelInterest = body?.model_interest
      ? String(body.model_interest).trim()
      : null;
    const note = body?.note ? String(body.note).trim() : null;
    const source = body?.source ? String(body.source).trim().slice(0, 80) : "wraps";

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk) {
      return jsonResponse({ error: "Name and a valid email are required." }, 400);
    }
    if (
      name.length > 200 ||
      email.length > 320 ||
      (phone?.length ?? 0) > 40 ||
      (modelInterest?.length ?? 0) > 80 ||
      (note?.length ?? 0) > 2000
    ) {
      return jsonResponse({ error: "Input too long." }, 400);
    }

    const utm = (key: string) =>
      body?.[key] ? String(body[key]).slice(0, 200) : null;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: allowed, error: rlErr } = await supabase.rpc(
      "check_and_record_rate_limit",
      {
        p_bucket: "tesla-deal-lead",
        p_identifier: ip,
        p_max: 5,
        p_window_seconds: 600,
      }
    );
    if (rlErr) {
      console.error("Rate limit check failed:", rlErr);
    } else if (allowed === false) {
      return jsonResponse({ error: "Too many requests. Please try again later." }, 429);
    }

    const { error: insErr } = await supabase.from("tesla_deal_leads").insert({
      name,
      email,
      phone,
      model_interest: modelInterest,
      note,
      source,
      utm_source: utm("utm_source"),
      utm_medium: utm("utm_medium"),
      utm_campaign: utm("utm_campaign"),
      utm_content: utm("utm_content"),
    });

    if (insErr) {
      console.error("Insert failed:", insErr);
      return jsonResponse({ error: "Could not save your request." }, 500);
    }

    const webhook = Deno.env.get("SLACK_WEBHOOK_URL");
    if (webhook) {
      const lines = [
        `*New Tesla purchase-discount lead* (${source})`,
        `*Name:* ${name}`,
        `*Email:* ${email}`,
        phone ? `*Phone:* ${phone}` : null,
        modelInterest ? `*Model:* ${modelInterest}` : null,
        note ? `*Note:* ${note}` : null,
        utm("utm_source") ? `*Source:* ${utm("utm_source")}` : null,
      ].filter(Boolean);
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: lines.join("\n") }),
        });
      } catch (e) {
        console.error("Slack post failed:", e);
      }
    } else {
      console.warn("SLACK_WEBHOOK_URL not set; skipping Slack post");
    }

    return jsonResponse({ success: true });
  } catch (e) {
    console.error("submit-tesla-deal-lead error:", e);
    return jsonResponse({ error: "Unexpected error." }, 500);
  }
});
