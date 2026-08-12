import { corsHeaders, serviceClient, writeAudit } from "../_shared/social-admin.ts";
import { encryptToken } from "../_shared/social-crypto.ts";

const GRAPH = "https://graph.facebook.com/v21.0";

function redirectTo(path: string) {
  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: `https://teslys.app${path}` },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const admin = serviceClient();

  if (!code || !state) return redirectTo("/admin/social/settings?ig=missing_code");

  // Validate + consume the CSRF nonce
  const { data: stateRow } = await admin
    .from("social_oauth_states")
    .select("*")
    .eq("nonce", state)
    .maybeSingle();

  if (
    !stateRow ||
    stateRow.consumed_at ||
    new Date(stateRow.expires_at).getTime() < Date.now()
  ) {
    return redirectTo("/admin/social/settings?ig=invalid_state");
  }
  await admin
    .from("social_oauth_states")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", stateRow.id);

  const appId = Deno.env.get("META_APP_ID") ?? "";
  const appSecret = Deno.env.get("META_APP_SECRET") ?? "";
  const redirectUri = Deno.env.get("META_REDIRECT_URI") ?? "";

  try {
    // 1) code -> short-lived token
    const shortRes = await fetch(
      `${GRAPH}/oauth/access_token?${new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code,
      })}`,
    );
    const shortJson = await shortRes.json();
    if (!shortRes.ok) throw new Error(shortJson?.error?.message ?? "token exchange failed");

    // 2) short-lived -> long-lived token
    const longRes = await fetch(
      `${GRAPH}/oauth/access_token?${new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortJson.access_token,
      })}`,
    );
    const longJson = await longRes.json();
    if (!longRes.ok) throw new Error(longJson?.error?.message ?? "long-lived exchange failed");

    const accessToken: string = longJson.access_token;
    const expiresIn: number = longJson.expires_in ?? 60 * 60 * 24 * 60;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 3) resolve the Page + linked IG professional account
    const pagesRes = await fetch(
      `${GRAPH}/me/accounts?${new URLSearchParams({
        fields: "id,name,access_token,instagram_business_account{id,username}",
        access_token: accessToken,
      })}`,
    );
    const pagesJson = await pagesRes.json();
    if (!pagesRes.ok) throw new Error(pagesJson?.error?.message ?? "could not list pages");

    const page = (pagesJson.data ?? []).find((p: any) => p.instagram_business_account);
    if (!page) throw new Error("No Facebook Page with a linked Instagram professional account");

    const pageToken: string = page.access_token ?? accessToken;
    const igId: string = page.instagram_business_account.id;
    const igUsername: string | null = page.instagram_business_account.username ?? null;

    // 4) store the page token encrypted (page token is what publishing uses)
    const encrypted = await encryptToken(pageToken);
    await admin.from("social_tokens").insert({
      platform: "instagram",
      token_type: "page_long_lived",
      ...encrypted,
      scopes: [],
      expires_at: expiresAt,
      created_by: stateRow.actor_user_id,
    });

    // 5) reflect connection status
    const { data: existing } = await admin
      .from("social_accounts")
      .select("id")
      .eq("platform", "instagram")
      .limit(1)
      .maybeSingle();

    const payload = {
      platform: "instagram",
      ig_professional_account_id: igId,
      ig_username: igUsername,
      facebook_page_id: page.id,
      status: "connected" as const,
      connected_by: stateRow.actor_user_id,
      token_expires_at: expiresAt,
      token_last_refreshed_at: new Date().toISOString(),
      last_api_check_at: new Date().toISOString(),
      last_error: null,
      expiry_warning_sent_at: null,
    };

    if (existing) {
      await admin.from("social_accounts").update(payload).eq("id", existing.id);
    } else {
      await admin.from("social_accounts").insert(payload);
    }

    await writeAudit(admin, {
      entity_type: "account",
      action: "oauth_connected",
      actor_user_id: stateRow.actor_user_id,
      actor_email: stateRow.actor_email,
      metadata: { ig_username: igUsername, page_id: page.id },
    });

    return redirectTo("/admin/social/settings?ig=connected");
  } catch (e) {
    const message = (e as Error).message;
    console.error("oauth callback failed:", message);
    await admin
      .from("social_accounts")
      .update({ status: "error", last_error: message })
      .eq("platform", "instagram");
    return redirectTo(`/admin/social/settings?ig=error&message=${encodeURIComponent(message)}`);
  }
});
