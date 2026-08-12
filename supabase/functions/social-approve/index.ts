import { corsHeaders, jsonResponse, requireSuperAdmin } from "../_shared/social-admin.ts";

/**
 * Approval is the compliance/legal audit trail, so it runs server-side:
 * the approver identity comes from the verified JWT, never from the client.
 * The checklist is never auto-ticked — every item must arrive as true.
 */
export const CHECKLIST_KEYS = [
  "brand_safe",
  "claims_substantiated",
  "no_pii",
  "media_rights_cleared",
  "pricing_accurate",
  "disclosures_present",
  "cta_link_verified",
  "accessibility_alt_text",
  "legal_reviewed",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;
  const { actor, admin } = auth;

  let body: {
    post_ids?: string[];
    checklist?: Record<string, boolean>;
    notes?: string;
    move_to_scheduled?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const postIds = Array.isArray(body.post_ids) ? body.post_ids : [];
  if (postIds.length === 0) return jsonResponse({ error: "post_ids is required" }, 400);
  if (postIds.length > 100) return jsonResponse({ error: "Too many posts in one request" }, 400);
  if (postIds.some((id) => !/^[0-9a-f-]{36}$/i.test(id))) {
    return jsonResponse({ error: "post_ids must all be uuids" }, 400);
  }

  const checklist = body.checklist ?? {};
  const missing = CHECKLIST_KEYS.filter((k) => checklist[k] !== true);
  if (missing.length > 0) {
    return jsonResponse(
      { error: "Compliance checklist incomplete", missing },
      400,
    );
  }

  const { data: posts, error: fetchError } = await admin
    .from("social_posts")
    .select("id,status,scheduled_at")
    .in("id", postIds);

  if (fetchError) return jsonResponse({ error: fetchError.message }, 500);

  const now = new Date().toISOString();
  const approved: string[] = [];
  const skipped: { id: string; reason: string }[] = [];

  for (const post of posts ?? []) {
    if (!["draft", "needs_review"].includes(post.status)) {
      skipped.push({ id: post.id, reason: `status_${post.status}` });
      continue;
    }

    const moveToScheduled = body.move_to_scheduled === true && !!post.scheduled_at;

    const { error: updateError } = await admin
      .from("social_posts")
      .update({
        status: moveToScheduled ? "scheduled" : "approved",
        approved_at: now,
        approver_user_id: actor.id,
      })
      .eq("id", post.id);

    if (updateError) {
      skipped.push({ id: post.id, reason: updateError.message });
      continue;
    }

    await admin.from("social_post_approvals").insert({
      post_id: post.id,
      approver_user_id: actor.id,
      approver_email: actor.email ?? null,
      checklist,
      notes: body.notes ?? null,
      approved_at: now,
    });

    approved.push(post.id);
  }

  return jsonResponse({ ok: true, approved, skipped });
});
