import { corsHeaders, jsonResponse, serviceClient } from "../_shared/social-admin.ts";

/**
 * Meta data-deletion callback.
 * Verifies the signed_request with the app secret, then erases the lead
 * and all interactions tied to that Instagram-scoped user id.
 */

function b64urlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function parseSignedRequest(
  signedRequest: string,
): Promise<{ valid: boolean; data: any }> {
  const secret = Deno.env.get("META_APP_SECRET");
  const [encodedSig, payload] = signedRequest.split(".");
  if (!secret || !encodedSig || !payload) return { valid: false, data: {} };

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    b64urlToBytes(encodedSig),
    new TextEncoder().encode(payload),
  );

  let data: any = {};
  try {
    data = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
  } catch {
    data = {};
  }
  return { valid, data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const admin = serviceClient();

  let signedRequest = "";
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    signedRequest = body?.signed_request ?? "";
  } else {
    const form = await req.formData().catch(() => null);
    signedRequest = (form?.get("signed_request") as string) ?? "";
  }

  const { valid, data } = await parseSignedRequest(signedRequest);
  const scopedUserId: string | null = data?.user_id ?? null;
  const confirmationCode = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

  const { data: request } = await admin
    .from("social_deletion_requests")
    .insert({
      platform: "instagram",
      kind: "data_deletion",
      ig_scoped_user_id: scopedUserId,
      confirmation_code: confirmationCode,
      signed_request_valid: valid,
      status: valid ? "processing" : "rejected",
    })
    .select()
    .single();

  if (!valid || !scopedUserId) {
    return jsonResponse({ error: "Invalid signed_request" }, 400);
  }

  try {
    const { data: leads } = await admin
      .from("social_leads")
      .select("id")
      .eq("ig_scoped_user_id", scopedUserId);

    const leadIds = (leads ?? []).map((l: { id: string }) => l.id);
    let interactionCount = 0;

    if (leadIds.length > 0) {
      const { count } = await admin
        .from("social_interactions")
        .select("id", { count: "exact", head: true })
        .in("lead_id", leadIds);
      interactionCount = count ?? 0;

      // interactions cascade on lead delete
      await admin.from("social_leads").delete().in("id", leadIds);
    }

    await admin
      .from("social_deletion_requests")
      .update({
        status: "completed",
        deleted_lead_count: leadIds.length,
        deleted_interaction_count: interactionCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    return jsonResponse({
      url: `https://teslys.app/privacy-center?deletion=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (e) {
    const message = (e as Error).message;
    await admin
      .from("social_deletion_requests")
      .update({ status: "failed", error_message: message })
      .eq("id", request.id);
    return jsonResponse({ error: message }, 500);
  }
});
