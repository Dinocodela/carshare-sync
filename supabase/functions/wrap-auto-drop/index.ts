/**
 * Automated wrap drop pipeline.
 *
 * A drop is a state machine row in `wrap_drop_jobs`. Each call to this function
 * advances the oldest active job by exactly ONE stage, so no single request has
 * to wait out a 1-3 minute Veo render:
 *
 *   queued -> brief -> texture -> preview -> video -> listing -> scheduling -> done
 *
 * Modes:
 *   kickoff  — cron, daily: create one queued job for the next model in rotation
 *   tick     — cron, every few minutes: advance whatever is in flight
 *   run_now  — super admin, from Wrap Studio: create a job immediately
 */
import {
  corsHeaders,
  jsonResponse,
  notifySlack,
  isWorkerRequest,
  requireSuperAdmin,
  serviceClient,
  writeAudit,
} from "../_shared/social-admin.ts";
import { Jimp } from "https://esm.sh/jimp@1.6.0";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  WRAP_TEMPLATES,
  templateModelName,
  templateStyleNote,
  templateVehicleName,
} from "./templates.ts";
import { renderTitleOverlay } from "./overlay.ts";

const SITE_URL = "https://teslys.app";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MAX_PNG_BYTES = 1_000_000; // Tesla custom-wraps spec: keep the PNG under 1MB
const MAX_ATTEMPTS = 3;
const STALE_MINUTES = 120;

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
];

const apiKey = () => {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return key;
};

/* ------------------------------------------------------------------ AI calls */

async function aiText(prompt: string): Promise<string> {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`AI text failed [${res.status}]: ${await res.text()}`);
  const payload = await res.json();
  return payload?.choices?.[0]?.message?.content ?? "";
}

async function aiImage(prompt: string): Promise<Uint8Array> {
  const res = await fetch(`${GATEWAY}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!res.ok) throw new Error(`AI image failed [${res.status}]: ${await res.text()}`);
  const payload = await res.json();
  const b64 = payload?.data?.[0]?.b64_json;
  if (!b64) throw new Error("AI image returned no image");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/* -------------------------------------------------------------- image helpers */

const readImage = async (bytes: Uint8Array) =>
  // deno-lint-ignore no-explicit-any
  await (Jimp as any).fromBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
  );

const asBytes = (buf: ArrayBufferLike | Uint8Array) =>
  buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer);

/** Resize to the exact UV template size and squeeze the PNG under 1MB. */
async function toTexturePng(bytes: Uint8Array, width: number, height: number) {
  const img = await readImage(bytes);
  img.resize({ w: width, h: height });
  let out = asBytes(await img.getBuffer("image/png"));
  // PNG still too heavy? posterize progressively — flat livery art survives this
  // far better than photography, and Tesla rejects anything over 1MB.
  for (let bits = 5; out.byteLength > MAX_PNG_BYTES && bits >= 3; bits--) {
    const copy = await readImage(bytes);
    copy.resize({ w: width, h: height });
    copy.posterize(1 << bits);
    out = asBytes(await copy.getBuffer("image/png"));
  }
  if (out.byteLength > MAX_PNG_BYTES) {
    throw new Error(`Texture is ${out.byteLength} bytes, above the 1MB Tesla limit`);
  }
  return out;
}

/** Cover-crop to an aspect ratio and encode as JPEG. */
async function toJpeg(bytes: Uint8Array, width: number, height: number, quality = 88) {
  const img = await readImage(bytes);
  const scale = Math.max(width / img.width, height / img.height);
  img.resize({ w: Math.ceil(img.width * scale), h: Math.ceil(img.height * scale) });
  img.crop({
    x: Math.floor((img.width - width) / 2),
    y: Math.floor((img.height - height) / 2),
    w: width,
    h: height,
  });
  return asBytes(await img.getBuffer("image/jpeg", { quality }));
}

const toDataUrl = (bytes: Uint8Array, mime: string) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:${mime};base64,${btoa(binary)}`;
};

/**
 * Average luminance + detail level of the region the title sits on
 * (the lower third of the 1080x1920 hero), used to pick the contrast plan.
 */
function measureBackdrop(img: any): BackdropStats {
  const x0 = Math.floor(img.width * 0.08);
  const x1 = Math.ceil(img.width * 0.92);
  const y0 = Math.floor(img.height * 0.55);
  const y1 = Math.ceil(img.height * 0.94);
  const step = Math.max(1, Math.floor((x1 - x0) / 90));

  let n = 0;
  let sum = 0;
  let sumSq = 0;
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const { r, g, b } = Jimp.intToRGBA(img.getPixelColor(x, y));
      const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      sum += l;
      sumSq += l * l;
      n++;
    }
  }
  if (!n) return { luma: 0.32, variance: 0.18 };
  const luma = sum / n;
  const variance = Math.sqrt(Math.max(0, sumSq / n - luma * luma));
  return { luma, variance };
}

/** Burn the centred title lockup into the 1080x1920 hero frame. */
async function withTitleCard(
  heroJpeg: Uint8Array,
  card: { kicker: string; title: string; subtitle: string },
) {
  const base = await readImage(heroJpeg);
  const backdrop = measureBackdrop(base);
  const overlay = await readImage(await renderTitleOverlay(card, backdrop));
  base.composite(overlay, 0, 0);
  return asBytes(await base.getBuffer("image/jpeg", { quality: 92 }));
}


/* ---------------------------------------------------------------- job helpers */

type Job = Record<string, any>;

const patch = (admin: SupabaseClient, id: string, values: Record<string, unknown>) =>
  admin.from("wrap_drop_jobs").update(values).eq("id", id);

const download = async (admin: SupabaseClient, path: string) => {
  const res = await admin.storage.from("wraps").download(path);
  if (res.error || !res.data) throw new Error(`Could not read ${path}: ${res.error?.message}`);
  return new Uint8Array(await res.data.arrayBuffer());
};

/** Round-robin: the template that has gone longest without a drop. */
async function pickTemplateKey(admin: SupabaseClient) {
  const { data } = await admin
    .from("wrap_designs")
    .select("model_key, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const lastUsed = new Map<string, string>();
  for (const row of data ?? []) {
    if (!lastUsed.has(row.model_key)) lastUsed.set(row.model_key, row.created_at);
  }
  const unused = WRAP_TEMPLATES.filter((t) => !lastUsed.has(t.key));
  if (unused.length > 0) return unused[0].key;
  return [...WRAP_TEMPLATES]
    .sort((a, b) => (lastUsed.get(a.key) ?? "").localeCompare(lastUsed.get(b.key) ?? ""))[0].key;
}

/** Any super admin to attribute generated records to. */
async function systemActor(admin: SupabaseClient, preferred?: string | null) {
  if (preferred) return preferred;
  const { data } = await admin.from("admin_grants").select("user_id").limit(1).maybeSingle();
  return data?.user_id ?? null;
}

/* -------------------------------------------------------------------- stages */

async function stageBrief(admin: SupabaseClient, job: Job) {
  const template = WRAP_TEMPLATES.find((t) => t.key === job.template_key)!;
  const { data: existing } = await admin.from("wrap_designs").select("slug, title").limit(200);
  const taken = (existing ?? []).map((d) => d.slug).join(", ");

  const raw = await aiText(
    `You are the art director for Teslys, a luxury Tesla wrap studio. Invent ONE brand-new ` +
      `digital wrap design for the ${template.label}. ${job.theme ? `Theme requested: ${job.theme}. ` : ""}` +
      `It must be visually distinct from these existing slugs: ${taken || "none"}. ` +
      `Return JSON with keys: slug (lowercase kebab, one or two words), title (1-2 words, ` +
      `evocative, no "wrap" in it), description (one elegant sentence, max 140 chars, no hype ` +
      `claims), category (one of Featured, Minimal, Bold, Racing, Luxury, Matte), ` +
      `art_prompt (a detailed description of a FLAT 2D seamless livery texture: palette, motif, ` +
      `line work, finish — no car, no perspective, no text unless the design is lettering-based), ` +
      `paint_summary (a short phrase describing the finished paint job on a car, e.g. ` +
      `"obsidian marble with silver pinstripes").`,
  );
  let brief: Record<string, string>;
  try {
    brief = JSON.parse(raw.replace(/^```json\s*|```$/g, "").trim());
  } catch {
    throw new Error(`Design brief was not valid JSON: ${raw.slice(0, 200)}`);
  }
  brief.slug = (brief.slug ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (!brief.slug || !brief.title || !brief.art_prompt) {
    throw new Error("Design brief is missing required fields");
  }
  if ((existing ?? []).some((d) => d.slug === brief.slug)) {
    brief.slug = `${brief.slug}-${Date.now().toString(36).slice(-4)}`;
  }
  await patch(admin, job.id, { brief, status: "texture" });
}

async function stageTexture(admin: SupabaseClient, job: Job) {
  const template = WRAP_TEMPLATES.find((t) => t.key === job.template_key)!;
  const brief = job.brief;
  const png = await toTexturePng(
    await aiImage(
      `Seamless flat 2D texture artwork for a vehicle livery, edge-to-edge design with no ` +
        `borders, no car photo, no perspective, no 3D rendering, no watermark. Limited flat ` +
        `colour palette suitable for vinyl printing. Design brief: ${brief.art_prompt}`,
    ),
    template.width,
    template.height,
  );
  const path = `${template.key}/${brief.slug}.png`;
  const up = await admin.storage
    .from("wraps")
    .upload(path, png, { contentType: "image/png", upsert: true });
  if (up.error) throw new Error(up.error.message);
  await patch(admin, job.id, {
    status: "preview",
    asset_paths: { ...job.asset_paths, png: path, png_bytes: png.byteLength },
  });
}

async function stagePreview(admin: SupabaseClient, job: Job) {
  const template = WRAP_TEMPLATES.find((t) => t.key === job.template_key)!;
  const brief = job.brief;
  const car = templateVehicleName(template.key);
  const style = templateStyleNote(template.key);
  const look = brief.paint_summary ?? brief.art_prompt;

  const gallery = await toJpeg(
    await aiImage(
      `Photorealistic studio photograph of a ${car} finished in a custom wrap: ${look}. ` +
        `${style} Three-quarter front view, dark seamless studio cyclorama, soft cinematic ` +
        `rim lighting, glossy floor reflection, ultra sharp, no text, no logos, no people.`,
    ),
    1536,
    1024,
  );
  const galleryPath = `previews/${brief.slug}-preview.jpg`;
  const up1 = await admin.storage
    .from("wraps")
    .upload(galleryPath, gallery, { contentType: "image/jpeg", upsert: true });
  if (up1.error) throw new Error(up1.error.message);

  const hero = await toJpeg(
    await aiImage(
      `Vertical 9:16 photorealistic studio photograph of a ${car} finished in a custom wrap: ` +
        `${look}. ${style} Low front three-quarter hero angle, dark studio cyclorama, ` +
        `dramatic sweeping light bar reflections, glossy floor, ultra sharp, cinematic, ` +
        `no text, no logos, no people.`,
    ),
    1080,
    1920,
  );
  const heroPath = `previews/${brief.slug}-hero.jpg`;
  const up2 = await admin.storage
    .from("wraps")
    .upload(heroPath, hero, { contentType: "image/jpeg", upsert: true });
  if (up2.error) throw new Error(up2.error.message);

  // Title card burned into the reel's first frame. Never fail the drop over it.
  let titledPath: string | null = null;
  try {
    const titled = await withTitleCard(hero, {
      kicker: `${templateModelName(template.key)} · Free digital wrap`,
      title: brief.title,
      subtitle: 'Comment "WRAP" for the free download',
    });
    titledPath = `previews/${brief.slug}-hero-titled.jpg`;
    const up3 = await admin.storage
      .from("wraps")
      .upload(titledPath, titled, { contentType: "image/jpeg", upsert: true });
    if (up3.error) throw new Error(up3.error.message);
  } catch (e) {
    console.error("title overlay failed, using clean hero:", e);
    titledPath = null;
  }

  await patch(admin, job.id, {
    status: "video",
    asset_paths: {
      ...job.asset_paths,
      preview: galleryPath,
      hero: heroPath,
      ...(titledPath ? { hero_titled: titledPath } : {}),
    },
  });
}

async function stageVideo(admin: SupabaseClient, job: Job) {
  const brief = job.brief;

  // 1) create the Veo job the first time we reach this stage
  if (!job.video_job_id) {
    const hero = await download(
      admin,
      job.asset_paths.hero_titled ?? job.asset_paths.hero,
    );
    const res = await fetch(`${GATEWAY}/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/veo-3.1-lite",
        prompt:
          `Slow cinematic orbit around the parked ${templateVehicleName(job.template_key)} in ` +
          `the image, camera gliding from the front three-quarter to the side, studio lighting ` +
          `sweeping across the ${brief.paint_summary ?? "custom"} wrap, reflections rolling ` +
          `over the bodywork. The car stays still. Keep the existing typography overlay from ` +
          `the first frame perfectly static, sharp, centred and fully inside the frame for the ` +
          `whole clip — do not move, warp, re-render, crop or add any other text. No people.`,
        seconds: "8",
        size: "1080x1920",
        input_reference: toDataUrl(hero, "image/jpeg"),
      }),
    });
    if (!res.ok) throw new Error(`Video create failed [${res.status}]: ${await res.text()}`);
    const created = await res.json();
    if (!created?.id) throw new Error("Video create returned no job id");
    await patch(admin, job.id, { video_job_id: created.id });
    return; // poll on the next tick
  }

  // 2) poll
  const poll = await fetch(`${GATEWAY}/videos/${job.video_job_id}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!poll.ok) throw new Error(`Video poll failed [${poll.status}]: ${await poll.text()}`);
  const videoJob = await poll.json();
  if (videoJob.status === "failed") {
    throw new Error(videoJob?.error?.message ?? "Video generation failed");
  }
  if (videoJob.status !== "completed") return; // still rendering — try again next tick

  // 3) download and store before the gateway URL expires
  const content = await fetch(`${GATEWAY}/videos/${job.video_job_id}/content`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!content.ok) throw new Error(`Video download failed [${content.status}]`);
  const mp4 = new Uint8Array(await content.arrayBuffer());
  const path = `wraps/${job.brief.slug}-${job.id.slice(0, 8)}.mp4`;
  const up = await admin.storage
    .from("social-media")
    .upload(path, mp4, { contentType: "video/mp4", upsert: true });
  if (up.error) throw new Error(up.error.message);

  await patch(admin, job.id, {
    status: "listing",
    asset_paths: { ...job.asset_paths, video: path, video_bytes: mp4.byteLength },
  });
}

async function stageListing(admin: SupabaseClient, job: Job) {
  const template = WRAP_TEMPLATES.find((t) => t.key === job.template_key)!;
  const brief = job.brief;
  const createdBy = await systemActor(admin, job.triggered_by);

  const { data: design, error } = await admin
    .from("wrap_designs")
    .insert({
      slug: brief.slug,
      title: brief.title,
      description: brief.description ?? "",
      category: brief.category ?? "Featured",
      model_key: template.key,
      compatibility: template.compatibility,
      dimensions: `${template.width} x ${template.height}`,
      file_size: `${Math.round((job.asset_paths.png_bytes ?? 0) / 1024)} KB`,
      png_path: job.asset_paths.png,
      preview_path: job.asset_paths.preview,
      storage_kind: "storage",
      source_prompt: brief.art_prompt,
      published: true,
      created_by: createdBy,
    })
    .select()
    .single();
  if (error || !design) throw new Error(error?.message ?? "Could not create wrap design");

  await patch(admin, job.id, { status: "scheduling", design_id: design.id });
}

async function stageScheduling(admin: SupabaseClient, job: Job) {
  const brief = job.brief;
  const actor = await systemActor(admin, job.triggered_by);
  const now = new Date().toISOString();
  // Default: the next 9:00 AM Pacific (16:00/17:00 UTC), otherwise 15 minutes out.
  const nextNinePacific = () => {
    const target = new Date();
    target.setUTCHours(16, 0, 0, 0);
    if (target.getTime() <= Date.now() + 5 * 60_000) target.setUTCDate(target.getUTCDate() + 1);
    return target.toISOString();
  };
  const scheduledAt = job.scheduled_post_at ?? nextNinePacific();

  const modelName = templateModelName(job.template_key);
  const shownCar = templateVehicleName(job.template_key);
  const caption =
    `${brief.title} — a free digital wrap for your Tesla ${modelName}.\n\n` +
    `Shown on a ${shownCar}. Fits: ${WRAP_TEMPLATES.find((t) => t.key === job.template_key)?.compatibility ?? modelName}\n\n` +
    `Your Tesla deserves more than the same factory look.\n\n` +
    `Comment "WRAP" below and we'll send you the free link in your DMs.\n\n` +
    `More designs at ${SITE_URL}/wraps/${brief.slug}`;

  const { data: post, error: postError } = await admin
    .from("social_posts")
    .insert({
      title: `Wrap drop — ${brief.title}`,
      caption,
      hashtags: [
        "#tesla",
        `#tesla${modelName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        "#teslawrap",
        "#paintshop",
        "#teslacommunity",
        "#teslys",
      ],
      format: "reel",
      status: "scheduled",
      scheduled_at: scheduledAt,
      timezone: "America/Los_Angeles",
      campaign: "free-wraps",
      cta_keyword: "WRAP",
      destination_url: `${SITE_URL}/wraps/${brief.slug}`,
      ai_disclosure: true,
      created_by: actor,
      owner_user_id: actor,
      approved_at: now,
      approver_user_id: actor,
    })
    .select()
    .single();
  if (postError || !post) throw new Error(postError?.message ?? "Could not create post");

  const { error: assetError } = await admin.from("social_media_assets").insert({
    post_id: post.id,
    storage_path: job.asset_paths.video,
    kind: "video",
    mime_type: "video/mp4",
    bytes: job.asset_paths.video_bytes ?? 0,
    position: 0,
    alt_text: `${brief.title} digital wrap shown on a ${shownCar}`,
    created_by: actor,
  });
  if (assetError) throw new Error(assetError.message);

  const { error: approvalError } = await admin.from("social_post_approvals").insert({
    post_id: post.id,
    approver_user_id: actor,
    checklist: Object.fromEntries(CHECKLIST_KEYS.map((k) => [k, true])),
    notes: `Auto-approved by the daily wrap drop pipeline (job ${job.id})`,
    approved_at: now,
  });
  if (approvalError) throw new Error(approvalError.message);

  await writeAudit(admin, {
    entity_type: "post",
    entity_id: post.id,
    action: "scheduled_from_auto_wrap_drop",
    actor_user_id: actor,
    metadata: { job_id: job.id, slug: brief.slug, scheduled_at: scheduledAt },
  });

  await patch(admin, job.id, { status: "done", post_id: post.id });
  await notifySlack(
    `🎨 New wrap drop live: *${brief.title}* — ${SITE_URL}/wraps/${brief.slug}\n` +
      `Reel scheduled for ${scheduledAt}.`,
  );
}

const STAGES: Record<string, (a: SupabaseClient, j: Job) => Promise<void>> = {
  queued: async (a, j) => { await patch(a, j.id, { status: "brief" }); },
  brief: stageBrief,
  texture: stageTexture,
  preview: stagePreview,
  video: stageVideo,
  listing: stageListing,
  scheduling: stageScheduling,
};

/* ---------------------------------------------------------------- entrypoint */

async function createJob(
  admin: SupabaseClient,
  opts: { templateKey?: string; theme?: string; triggeredBy?: string | null; scheduledPostAt?: string | null },
) {
  const templateKey =
    opts.templateKey && WRAP_TEMPLATES.some((t) => t.key === opts.templateKey)
      ? opts.templateKey
      : await pickTemplateKey(admin);
  const { data, error } = await admin
    .from("wrap_drop_jobs")
    .insert({
      template_key: templateKey,
      theme: opts.theme ?? null,
      triggered_by: opts.triggeredBy ?? null,
      scheduled_post_at: opts.scheduledPostAt ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function tick(admin: SupabaseClient) {
  // Fail out anything that has been stuck too long.
  const staleBefore = new Date(Date.now() - STALE_MINUTES * 60_000).toISOString();
  await admin
    .from("wrap_drop_jobs")
    .update({ status: "failed", error: "Timed out" })
    .lt("created_at", staleBefore)
    .not("status", "in", "(done,failed)");

  const { data: job } = await admin
    .from("wrap_drop_jobs")
    .select("*")
    .not("status", "in", "(done,failed)")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!job) return { ok: true, idle: true };

  const stage = STAGES[job.status];
  if (!stage) {
    await patch(admin, job.id, { status: "failed", error: `Unknown stage ${job.status}` });
    return { ok: false, job_id: job.id };
  }

  try {
    await stage(admin, job);
    return { ok: true, job_id: job.id, from: job.status };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const attempts = (job.attempts ?? 0) + 1;
    const failed = attempts >= MAX_ATTEMPTS;
    await patch(admin, job.id, {
      attempts,
      error: message,
      ...(failed ? { status: "failed" } : {}),
    });
    console.error(`wrap-auto-drop ${job.status} failed:`, message);
    if (failed) {
      await notifySlack(
        `⚠️ Wrap drop failed at stage *${job.status}* (${job.template_key}): ${message}`,
      );
    }
    return { ok: false, job_id: job.id, stage: job.status, error: message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const mode = typeof body.mode === "string" ? body.mode : "tick";
  const isWorker = isWorkerRequest(req);

  let admin: SupabaseClient;
  let actorId: string | null = null;
  if (isWorker) {
    admin = serviceClient();
  } else {
    const auth = await requireSuperAdmin(req);
    if ("error" in auth) return auth.error;
    admin = auth.admin;
    actorId = auth.actor.id;
  }

  try {
    if (mode === "kickoff" || mode === "run_now") {
      const { data: active } = await admin
        .from("wrap_drop_jobs")
        .select("id")
        .not("status", "in", "(done,failed)")
        .limit(1);
      if (active && active.length > 0) {
        return jsonResponse({ ok: false, reason: "a_drop_is_already_running" }, 409);
      }
      const job = await createJob(admin, {
        templateKey: typeof body.template_key === "string" ? body.template_key : undefined,
        theme: typeof body.theme === "string" && body.theme.trim() ? body.theme.trim() : undefined,
        triggeredBy: actorId,
        scheduledPostAt:
          typeof body.scheduled_post_at === "string" ? body.scheduled_post_at : null,
      });
      // Get the first stage moving right away.
      await tick(admin);
      return jsonResponse({ ok: true, job_id: job.id, template_key: job.template_key });
    }
    return jsonResponse(await tick(admin));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("wrap-auto-drop error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
