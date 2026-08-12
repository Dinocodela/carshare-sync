import { corsHeaders, jsonResponse, requireSuperAdmin } from "../_shared/social-admin.ts";
import { publishPost } from "../_shared/social-publish-core.ts";

/**
 * Manual "Publish now" for admins.
 * Bypasses ONLY the scheduled-time gate — every other safeguard
 * (approval, checklist, media, connection, duplicate, active-attempt lock)
 * is enforced inside publishPost().
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;
  const { actor, admin } = auth;

  let body: { post_id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const postId = body.post_id;
  if (!postId || !/^[0-9a-f-]{36}$/i.test(postId)) {
    return jsonResponse({ error: "post_id must be a valid uuid" }, 400);
  }

  const result = await publishPost(admin, postId, actor.id, actor.email);
  return jsonResponse(result, result.ok ? 200 : 400);
});
