import {
  corsHeaders,
  jsonResponse,
  notifySlack,
  requireWorkerSecret,
  serviceClient,
  writeAudit,
} from "../_shared/social-admin.ts";
import { decryptToken, encryptToken } from "../_shared/social-crypto.ts";

const GRAPH = "https://graph.facebook.com/v21.0";
const REFRESH_WINDOW_DAYS = 10;
const WARN_WINDOW_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const denied = requireWorkerSecret(req);
  if (denied) return denied;

  const admin = serviceClient();

  const { data: account } = await admin
    .from("social_accounts")
    .select("*")
    .eq("platform", "instagram")
    .limit(1)
    .maybeSingle();

  if (!account || account.status === "disconnected") {
    return jsonResponse({ ok: true, skipped: "not_connected" });
  }

  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
  if (!expiresAt) return jsonResponse({ ok: true, skipped: "no_expiry_recorded" });

  const msLeft = expiresAt.getTime() - Date.now();
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);

  if (msLeft <= 0) {
    await admin
      .from("social_accounts")
      .update({ status: "expired", last_error: "Access token expired" })
      .eq("id", account.id);
    await notifySlack(":warning: Instagram token has EXPIRED — reconnect in Social → Settings.");
    return jsonResponse({ ok: true, status: "expired" });
  }

  if (daysLeft > REFRESH_WINDOW_DAYS) {
    return jsonResponse({ ok: true, skipped: "not_due", days_left: Math.round(daysLeft) });
  }

  const { data: tokenRow } = await admin
    .from("social_tokens")
    .select("*")
    .eq("platform", "instagram")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!tokenRow) return jsonResponse({ ok: false, error: "no_token_stored" }, 500);

  try {
    const current = await decryptToken(tokenRow);
    const res = await fetch(
      `${GRAPH}/oauth/access_token?${new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: Deno.env.get("META_APP_ID") ?? "",
        client_secret: Deno.env.get("META_APP_SECRET") ?? "",
        fb_exchange_token: current,
      })}`,
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? "refresh failed");

    const newExpiry = new Date(
      Date.now() + (json.expires_in ?? 60 * 60 * 24 * 60) * 1000,
    ).toISOString();
    const encrypted = await encryptToken(json.access_token);

    await admin.from("social_tokens").insert({
      platform: "instagram",
      token_type: tokenRow.token_type,
      ...encrypted,
      scopes: tokenRow.scopes ?? [],
      expires_at: newExpiry,
      created_by: tokenRow.created_by,
    });

    await admin
      .from("social_accounts")
      .update({
        status: "connected",
        token_expires_at: newExpiry,
        token_last_refreshed_at: new Date().toISOString(),
        last_error: null,
        expiry_warning_sent_at: null,
      })
      .eq("id", account.id);

    await writeAudit(admin, {
      entity_type: "account",
      entity_id: account.id,
      action: "token_refreshed",
      metadata: { expires_at: newExpiry },
    });

    return jsonResponse({ ok: true, refreshed: true, expires_at: newExpiry });
  } catch (e) {
    const message = (e as Error).message;
    await admin
      .from("social_accounts")
      .update({ status: "error", last_error: message })
      .eq("id", account.id);

    const alreadyWarned =
      account.expiry_warning_sent_at &&
      Date.now() - new Date(account.expiry_warning_sent_at).getTime() < 24 * 60 * 60 * 1000;

    if (daysLeft <= WARN_WINDOW_DAYS && !alreadyWarned) {
      await notifySlack(
        `:warning: Instagram token refresh failed (${Math.round(daysLeft)} days left): ${message}`,
      );
      await admin
        .from("social_accounts")
        .update({ expiry_warning_sent_at: new Date().toISOString() })
        .eq("id", account.id);
    }

    return jsonResponse({ ok: false, error: message }, 500);
  }
});
