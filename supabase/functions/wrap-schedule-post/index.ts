import { corsHeaders, jsonResponse, requireSuperAdmin, writeAudit } from "../_shared/social-admin.ts";

/**
 * Hand a published wrap design off to the Social scheduler.
 * Copies the wrap's social preview into the private `social-media` bucket,
 * creates a scheduled + pre-approved social post with the WRAP keyword CTA.
 */
const CHECKLIST_KEYS = [
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

const SITE_URL = "https://teslys.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;
  const { actor, admin } = auth;

  let body: {
    design_id?: string;
    scheduled_at?: string;
    caption?: string;
    hashtags?: string[];
    first_comment?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const designId = body.design_id;
  if (!designId || !/^[0-9a-f-]{36}$/i.test(designId)) {
    return jsonResponse({ error: "design_id must be a valid uuid" }, 400);
  }
  const scheduledAt = body.scheduled_at ? new Date(body.scheduled_at) : null;
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    return jsonResponse({ error: "scheduled_at must be a valid date" }, 400);
  }

  const { data: design, error: designError } = await admin
    .from("wrap_designs")
    .select("*")
    .eq("id", designId)
    .maybeSingle();
  if (designError) return jsonResponse({ error: designError.message }, 500);
  if (!design) return jsonResponse({ error: "Wrap design not found" }, 404);
  if (!design.preview_path) {
    return jsonResponse({ error: "This wrap has no preview image to post" }, 400);
  }

  // Storage-backed previews get copied into the private social bucket;
  // static previews are already publicly served and can be referenced directly.
  let storagePath = design.preview_path as string;
  let bytesLength = 0;
  if (design.storage_kind === "storage") {
    const download = await admin.storage.from("wraps").download(design.preview_path);
    if (download.error || !download.data) {
      return jsonResponse({ error: `Could not read wrap preview: ${download.error?.message}` }, 500);
    }
    const bytes = new Uint8Array(await download.data.arrayBuffer());
    bytesLength = bytes.byteLength;
    storagePath = `wraps/${design.slug}-${Date.now()}.jpg`;
    const upload = await admin.storage
      .from("social-media")
      .upload(storagePath, bytes, { contentType: "image/jpeg", upsert: true });
    if (upload.error) return jsonResponse({ error: upload.error.message }, 500);
  }

  const caption =
    body.caption?.trim() ||
    `${design.title} — a free digital wrap for your Tesla.\n\n` +
      `Comment "WRAP" below and we'll send you the free link in your DMs.\n\n` +
      `More designs at ${SITE_URL}/wraps/${design.slug}`;

  const hashtags = Array.isArray(body.hashtags) && body.hashtags.length > 0
    ? body.hashtags.slice(0, 30)
    : ["#tesla", "#teslawrap", "#paintshop", "#teslacommunity", "#teslys"];

  const now = new Date().toISOString();
  const checklist = Object.fromEntries(CHECKLIST_KEYS.map((k) => [k, true]));

  const { data: post, error: postError } = await admin
    .from("social_posts")
    .insert({
      title: `Wrap drop — ${design.title}`,
      caption,
      hashtags,
      format: "image",
      status: "scheduled",
      scheduled_at: scheduledAt.toISOString(),
      timezone: "America/Los_Angeles",
      campaign: "free-wraps",
      cta_keyword: "WRAP",
      destination_url: `${SITE_URL}/wraps/${design.slug}`,
      first_comment: body.first_comment ?? null,
      ai_disclosure: !!design.source_prompt,
      created_by: actor.id,
      owner_user_id: actor.id,
      approved_at: now,
      approver_user_id: actor.id,
    })
    .select()
    .single();

  if (postError || !post) {
    return jsonResponse({ error: postError?.message ?? "Could not create post" }, 500);
  }

  const { error: assetError } = await admin.from("social_media_assets").insert({
    post_id: post.id,
    storage_path: storagePath,
    kind: "image",
    mime_type: "image/jpeg",
    bytes: bytes.byteLength,
    position: 0,
    alt_text: `${design.title} digital Tesla wrap preview`,
    created_by: actor.id,
  });
  if (assetError) return jsonResponse({ error: assetError.message }, 500);

  const { error: approvalError } = await admin.from("social_post_approvals").insert({
    post_id: post.id,
    approver_user_id: actor.id,
    approver_email: actor.email ?? null,
    checklist,
    notes: `Scheduled from Wrap Studio for design ${design.slug}`,
    approved_at: now,
  });
  if (approvalError) return jsonResponse({ error: approvalError.message }, 500);

  await writeAudit(admin, {
    entity_type: "post",
    entity_id: post.id,
    action: "scheduled_from_wrap_studio",
    actor_user_id: actor.id,
    actor_email: actor.email ?? null,
    metadata: { design_id: design.id, slug: design.slug, scheduled_at: scheduledAt.toISOString() },
  });

  return jsonResponse({ ok: true, post_id: post.id, scheduled_at: scheduledAt.toISOString() });
});
