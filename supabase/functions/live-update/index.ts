// Supabase Edge Function: live-update
//
// Self-hosted endpoint for the @capgo/capacitor-updater plugin (updateUrl).
// The plugin POSTs the device + current-bundle info here on launch/resume. We
// read `latest.json` from the private `live-bundles` storage bucket, semver-
// compare the device's active bundle (`version_name`) against the published
// version, and — only when the published bundle is strictly newer — respond
// with { version, url, checksum } where `url` is a short-lived signed download
// URL. Otherwise we return a no-update response and the plugin does nothing.
//
// latest.json is the single source of truth for the OTA version; it is written
// by the CI/CD workflow (.github/workflows/live-update.yml). SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are injected automatically into edge functions.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "live-bundles";
const LATEST_PATH = "latest.json";
const SIGNED_URL_TTL_SECONDS = 600; // signed bundle URL validity

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface LatestManifest {
  version: string; // semver, e.g. "1.0.72"
  path: string; // object key inside the bucket, e.g. "1.0.72.zip"
  checksum: string; // sha256 (hex) of the zip
  releasedAt?: string;
  commit?: string;
}

// Minimal semver compare on major.minor.patch (prerelease/build metadata are
// ignored). Anything non-numeric (e.g. the native "builtin" bundle) parses to
// 0.0.0, so any real published version is treated as newer.
function parseSemver(v: string): [number, number, number] {
  const core = String(v ?? "").trim().replace(/^v/, "").split(/[-+]/)[0];
  const p = core.split(".").map((n) => parseInt(n, 10));
  return [0, 1, 2].map((i) => (Number.isFinite(p[i]) ? p[i] : 0)) as [number, number, number];
}

function isNewer(candidate: string, current: string): boolean {
  const a = parseSemver(candidate);
  const b = parseSemver(current);
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return false;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ message: "method not allowed" }, 405);

  // The plugin sends the currently active bundle version as `version_name`
  // ("builtin" for the shipped native bundle). Parse defensively.
  let currentVersion = "builtin";
  try {
    const body = await req.json();
    if (body && typeof body.version_name === "string" && body.version_name) {
      currentVersion = body.version_name;
    }
  } catch (_) {
    // missing/invalid body -> treat as builtin
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Read the manifest from the private bucket (service role bypasses RLS).
  const { data: blob, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(LATEST_PATH);
  if (dlErr || !blob) {
    return json({ message: "no bundle published" });
  }

  let manifest: LatestManifest;
  try {
    manifest = JSON.parse(await blob.text());
  } catch (_) {
    return json({ message: "invalid manifest" }, 500);
  }

  // Only offer an update when the published bundle is strictly newer.
  if (!manifest.version || !isNewer(manifest.version, currentVersion)) {
    return json({ message: "no new version available", version: currentVersion });
  }

  // Mint a short-lived signed URL for the private zip object.
  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(manifest.path, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed?.signedUrl) {
    return json({ message: "failed to sign bundle url" }, 500);
  }

  return json({
    version: manifest.version,
    url: signed.signedUrl,
    checksum: manifest.checksum,
  });
});
