import { corsHeaders, jsonResponse, serviceClient } from "../_shared/social-admin.ts";
import { getConnectedAccount, GRAPH_BASE } from "../_shared/social-publish-core.ts";

/** Constant-time-ish hex comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySignature(rawBody: string, header: string | null): Promise<boolean> {
  const secret = Deno.env.get("META_APP_SECRET");
  if (!secret || !header?.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)),
  );
  const hex = Array.from(sig)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return safeEqual(hex, header.slice("sha256=".length));
}

async function sendReply(
  channel: "comment" | "dm",
  targetId: string,
  message: string,
  accessToken: string,
  igUserId: string,
) {
  if (channel === "comment") {
    await fetch(`${GRAPH_BASE}/${targetId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ message, access_token: accessToken }),
    });
  } else {
    await fetch(`${GRAPH_BASE}/${igUserId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: targetId },
        message: { text: message },
        access_token: accessToken,
      }),
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);

  // Meta subscription verification handshake
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === Deno.env.get("META_WEBHOOK_VERIFY_TOKEN")) {
      return new Response(challenge ?? "", { status: 200, headers: corsHeaders });
    }
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const rawBody = await req.text();
  const valid = await verifySignature(rawBody, req.headers.get("x-hub-signature-256"));
  const admin = serviceClient();

  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = {};
  }

  const entry = payload?.entry?.[0] ?? {};
  const change = entry?.changes?.[0] ?? {};
  const messaging = entry?.messaging?.[0] ?? null;
  const field: string = change?.field ?? (messaging ? "messages" : "unknown");
  const value = change?.value ?? messaging ?? {};
  const eventId: string | null =
    value?.id ?? value?.comment_id ?? messaging?.message?.mid ?? entry?.id ?? null;

  // Always record the event (valid or not) for auditability, deduped by event_id.
  const { data: eventRow, error: insertError } = await admin
    .from("social_webhook_events")
    .insert({
      platform: "instagram",
      event_type: field,
      event_id: eventId,
      payload,
      signature_valid: valid,
      processed: false,
    })
    .select()
    .maybeSingle();

  // Duplicate delivery — already handled.
  if (insertError) return jsonResponse({ ok: true, deduped: true });
  if (!valid) return jsonResponse({ error: "Invalid signature" }, 401);

  try {
    const isComment = field === "comments";
    const isDm = field === "messages";
    if (!isComment && !isDm) {
      await admin
        .from("social_webhook_events")
        .update({ processed: true })
        .eq("id", eventRow!.id);
      return jsonResponse({ ok: true, ignored: field });
    }

    const scopedUserId: string | null = isComment
      ? value?.from?.id ?? null
      : messaging?.sender?.id ?? null;
    const username: string | null = isComment ? value?.from?.username ?? null : null;
    const text: string = (isComment ? value?.text : messaging?.message?.text) ?? "";
    const commentId: string | null = isComment ? value?.id ?? null : null;
    const igMediaId: string | null = isComment ? value?.media?.id ?? null : null;
    const now = new Date().toISOString();

    const { data: settings } = await admin
      .from("social_automation_settings")
      .select("*")
      .order("created_at")
      .limit(1)
      .maybeSingle();

    // Resolve the originating post, if we published it
    let postId: string | null = null;
    if (igMediaId) {
      const { data: post } = await admin
        .from("social_posts")
        .select("id,cta_keyword,destination_url")
        .eq("ig_media_id", igMediaId)
        .maybeSingle();
      postId = post?.id ?? null;
    }

    // Upsert the lead
    let leadId: string | null = null;
    if (scopedUserId) {
      const { data: existing } = await admin
        .from("social_leads")
        .select("id, first_interaction_at")
        .eq("ig_scoped_user_id", scopedUserId)
        .maybeSingle();

      if (existing) {
        await admin
          .from("social_leads")
          .update({ last_interaction_at: now, ig_username: username ?? undefined })
          .eq("id", existing.id);
        leadId = existing.id;
      } else {
        const { data: created } = await admin
          .from("social_leads")
          .insert({
            ig_scoped_user_id: scopedUserId,
            ig_username: username,
            source: isComment ? "comment" : "dm",
            stage: "new",
            first_interaction_at: now,
            last_interaction_at: now,
          })
          .select("id")
          .single();
        leadId = created?.id ?? null;
      }
    }

    await admin.from("social_interactions").insert({
      post_id: postId,
      lead_id: leadId,
      channel: isComment ? "comment" : "dm",
      direction: "inbound",
      message: text,
    });

    // Escalation detection
    const lowered = text.toLowerCase();
    const escalation = (settings?.escalation_categories ?? []).find((c: string) =>
      lowered.includes(c.toLowerCase()),
    );
    if (escalation && leadId) {
      await admin
        .from("social_leads")
        .update({ stage: "escalated", escalation_category: escalation })
        .eq("id", leadId);
    }

    // Auto-reply (only when settings allow and nothing was escalated)
    if (!escalation && settings) {
      const ctaKeyword: string | null =
        settings.default_cta_keyword ?? null;
      const matchedCta =
        ctaKeyword && lowered.includes(ctaKeyword.toLowerCase());

      const shouldReply =
        (matchedCta && settings.auto_reply_cta_comments) ||
        (!matchedCta && settings.auto_reply_faq);

      if (shouldReply) {
        const key = matchedCta
          ? isComment
            ? "cta_comment"
            : "cta_dm"
          : "faq_default";
        const { data: template } = await admin
          .from("social_reply_templates")
          .select("body")
          .eq("key", key)
          .eq("active", true)
          .maybeSingle();

        const { account, accessToken } = await getConnectedAccount(admin);
        if (template && account && accessToken && scopedUserId) {
          const body = template.body.replace(
            /\{\{destination_url\}\}/g,
            settings.default_destination_url ?? "https://teslys.app",
          );
          await sendReply(
            isComment ? "comment" : "dm",
            isComment ? commentId ?? scopedUserId : scopedUserId,
            body,
            accessToken,
            account.ig_professional_account_id,
          );
          await admin.from("social_interactions").insert({
            post_id: postId,
            lead_id: leadId,
            channel: isComment ? "comment" : "dm",
            direction: "outbound",
            message: body,
          });
          if (leadId) {
            await admin.from("social_leads").update({ stage: "contacted" }).eq("id", leadId);
          }
        }
      }
    }

    await admin.from("social_webhook_events").update({ processed: true }).eq("id", eventRow!.id);
    return jsonResponse({ ok: true });
  } catch (e) {
    const message = (e as Error).message;
    console.error("webhook processing failed:", message);
    await admin
      .from("social_webhook_events")
      .update({ processing_error: message })
      .eq("id", eventRow!.id);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
