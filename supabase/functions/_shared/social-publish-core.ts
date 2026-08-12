import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { decryptToken } from "./social-crypto.ts";
import { notifySlack, writeAudit } from "./social-admin.ts";

export const GRAPH_VERSION = "v21.0";
export const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export interface PublishResult {
  ok: boolean;
  reason?: string;
  post_id: string;
  ig_media_id?: string;
  permalink?: string;
  attempt_id?: string;
}

/** Fetch the connected IG account plus a decrypted access token. */
export async function getConnectedAccount(admin: SupabaseClient) {
  const { data: account } = await admin
    .from("social_accounts")
    .select("*")
    .eq("platform", "instagram")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!account || account.status !== "connected" || !account.ig_professional_account_id) {
    return { account: null, accessToken: null as string | null };
  }

  const { data: tokenRow } = await admin
    .from("social_tokens")
    .select("*")
    .eq("platform", "instagram")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!tokenRow) return { account, accessToken: null as string | null };

  const accessToken = await decryptToken(tokenRow);
  return { account, accessToken };
}

/** Short-lived signed URLs so Meta can fetch media from our private bucket. */
async function signedMediaUrls(admin: SupabaseClient, postId: string) {
  const { data: assets } = await admin
    .from("social_media_assets")
    .select("*")
    .eq("post_id", postId)
    .order("position", { ascending: true });

  if (!assets || assets.length === 0) return [];

  const signed: { url: string; kind: string }[] = [];
  for (const asset of assets) {
    // Assets can point at a public URL (static site file) instead of the private bucket.
    const path = asset.storage_path as string;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
      signed.push({
        url: path.startsWith("/") ? `${PUBLIC_SITE_URL}${path}` : path,
        kind: asset.kind ?? "image",
      });
      continue;
    }
    const { data, error } = await admin.storage
      .from("social-media")
      .createSignedUrl(path, 60 * 30);
    if (error || !data?.signedUrl) {
      throw new Error(`Could not sign media ${asset.storage_path}: ${error?.message}`);
    }
    signed.push({ url: data.signedUrl, kind: asset.kind ?? "image" });
  }
  return signed;
}

async function graph(path: string, params: Record<string, string>, method = "POST") {
  const body = new URLSearchParams(params);
  const url = method === "GET" ? `${GRAPH_BASE}${path}?${body}` : `${GRAPH_BASE}${path}`;
  const res = await fetch(url, {
    method,
    ...(method === "POST"
      ? { headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }
      : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Graph API ${res.status}`);
  }
  return json;
}

/**
 * Publish one post to Instagram.
 *
 * Safeguards enforced here regardless of trigger (manual or worker):
 * approved + checklist stamped, media present, account connected,
 * not already published, and only one active publish attempt per post.
 * The scheduled-time gate is applied by the CALLER (worker only).
 */
export async function publishPost(
  admin: SupabaseClient,
  postId: string,
  triggeredBy: string | null,
  actorEmail?: string | null,
): Promise<PublishResult> {
  const { data: post } = await admin
    .from("social_posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return { ok: false, reason: "post_not_found", post_id: postId };
  if (post.status === "published" || post.ig_media_id) {
    return { ok: false, reason: "already_published", post_id: postId };
  }
  if (!["approved", "scheduled", "failed"].includes(post.status)) {
    return { ok: false, reason: "not_approved", post_id: postId };
  }
  if (!post.approved_at || !post.approver_user_id) {
    return { ok: false, reason: "missing_approval", post_id: postId };
  }

  const { count: approvalCount } = await admin
    .from("social_post_approvals")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId)
    .not("approved_at", "is", null);
  if (!approvalCount) return { ok: false, reason: "missing_checklist", post_id: postId };

  const { account, accessToken } = await getConnectedAccount(admin);
  if (!account || !accessToken) {
    return { ok: false, reason: "account_not_connected", post_id: postId };
  }

  let media: { url: string; kind: string }[];
  try {
    media = await signedMediaUrls(admin, postId);
  } catch (e) {
    return { ok: false, reason: (e as Error).message, post_id: postId };
  }
  if (media.length === 0) return { ok: false, reason: "missing_media", post_id: postId };

  // Idempotency: unique key + partial unique index means a concurrent/duplicate
  // request loses the insert race and bails instead of double-publishing.
  const idempotencyKey = `${postId}:${post.scheduled_at ?? "manual"}:${post.updated_at}`;
  const { data: attempt, error: attemptError } = await admin
    .from("social_publish_attempts")
    .insert({
      post_id: postId,
      idempotency_key: idempotencyKey,
      status: "pending",
      attempt_count: 1,
      started_at: new Date().toISOString(),
      triggered_by: triggeredBy,
    })
    .select()
    .single();

  if (attemptError || !attempt) {
    return { ok: false, reason: "duplicate_or_locked", post_id: postId };
  }

  await admin.from("social_posts").update({ status: "publishing" }).eq("id", postId);

  const igUser = account.ig_professional_account_id as string;
  const caption = [post.caption, (post.hashtags ?? []).join(" ")]
    .filter((s: string) => s && s.trim().length > 0)
    .join("\n\n");

  try {
    // 1) Create the media container
    let containerId: string;
    if (post.format === "carousel") {
      const childIds: string[] = [];
      for (const item of media) {
        const child = await graph(`/${igUser}/media`, {
          image_url: item.url,
          is_carousel_item: "true",
          access_token: accessToken,
        });
        childIds.push(child.id);
      }
      const parent = await graph(`/${igUser}/media`, {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption,
        access_token: accessToken,
      });
      containerId = parent.id;
    } else if (post.format === "reel") {
      const created = await graph(`/${igUser}/media`, {
        media_type: "REELS",
        video_url: media[0].url,
        caption,
        access_token: accessToken,
      });
      containerId = created.id;
    } else {
      const created = await graph(`/${igUser}/media`, {
        image_url: media[0].url,
        caption,
        access_token: accessToken,
      });
      containerId = created.id;
    }

    await admin
      .from("social_publish_attempts")
      .update({ ig_container_id: containerId })
      .eq("id", attempt.id);

    // 2) Poll container status until FINISHED
    let ready = false;
    for (let i = 0; i < 30; i++) {
      const status = await graph(
        `/${containerId}`,
        { fields: "status_code,status", access_token: accessToken },
        "GET",
      );
      await admin
        .from("social_publish_attempts")
        .update({ last_polled_at: new Date().toISOString() })
        .eq("id", attempt.id);

      if (status.status_code === "FINISHED") {
        ready = true;
        break;
      }
      if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
        throw new Error(`Container ${status.status_code}: ${status.status ?? ""}`);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    if (!ready) throw new Error("Container did not finish processing in time");

    // 3) Publish
    const published = await graph(`/${igUser}/media_publish`, {
      creation_id: containerId,
      access_token: accessToken,
    });
    const mediaId = published.id as string;

    // 4) Permalink
    let permalink: string | null = null;
    try {
      const info = await graph(
        `/${mediaId}`,
        { fields: "permalink", access_token: accessToken },
        "GET",
      );
      permalink = info.permalink ?? null;
    } catch (_e) {
      permalink = null;
    }

    // 5) Optional first comment
    if (post.first_comment && post.first_comment.trim().length > 0) {
      try {
        await graph(`/${mediaId}/comments`, {
          message: post.first_comment,
          access_token: accessToken,
        });
      } catch (e) {
        console.warn("first comment failed:", (e as Error).message);
      }
    }

    const publishedAt = new Date().toISOString();
    await admin
      .from("social_posts")
      .update({
        status: "published",
        ig_media_id: mediaId,
        permalink,
        published_at: publishedAt,
        last_error: null,
      })
      .eq("id", postId);

    await admin
      .from("social_publish_attempts")
      .update({
        status: "succeeded",
        ig_media_id: mediaId,
        permalink,
        finished_at: publishedAt,
      })
      .eq("id", attempt.id);

    await writeAudit(admin, {
      entity_type: "post",
      entity_id: postId,
      action: "published",
      actor_user_id: triggeredBy,
      actor_email: actorEmail ?? null,
      metadata: { ig_media_id: mediaId, permalink },
    });

    return { ok: true, post_id: postId, ig_media_id: mediaId, permalink: permalink ?? undefined, attempt_id: attempt.id };
  } catch (e) {
    const message = (e as Error).message;
    await admin
      .from("social_posts")
      .update({ status: "failed", last_error: message })
      .eq("id", postId);
    await admin
      .from("social_publish_attempts")
      .update({
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", attempt.id);

    await writeAudit(admin, {
      entity_type: "post",
      entity_id: postId,
      action: "publish_failed",
      actor_user_id: triggeredBy,
      metadata: { error: message },
    });
    await notifySlack(`:x: Instagram publish failed for post ${postId}: ${message}`);

    return { ok: false, reason: message, post_id: postId, attempt_id: attempt.id };
  }
}
