import { corsHeaders, jsonResponse, requireSuperAdmin, writeAudit } from "../_shared/social-admin.ts";

const AUTH_BASE = "https://www.facebook.com/v21.0/dialog/oauth";
const SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;
  const { actor, admin } = auth;

  const appId = Deno.env.get("META_APP_ID");
  const redirectUri = Deno.env.get("META_REDIRECT_URI");
  if (!appId || !redirectUri) {
    return jsonResponse({ error: "META_APP_ID / META_REDIRECT_URI not configured" }, 500);
  }

  // CSRF nonce, single use, 10 minute lifetime
  const nonce = crypto.randomUUID();
  const { error } = await admin.from("social_oauth_states").insert({
    nonce,
    redirect_uri: redirectUri,
    actor_user_id: actor.id,
    actor_email: actor.email ?? null,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (error) return jsonResponse({ error: error.message }, 500);

  await writeAudit(admin, {
    entity_type: "account",
    action: "oauth_started",
    actor_user_id: actor.id,
    actor_email: actor.email ?? null,
  });

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: nonce,
    scope: SCOPES.join(","),
    response_type: "code",
  });

  return jsonResponse({ url: `${AUTH_BASE}?${params}` });
});
