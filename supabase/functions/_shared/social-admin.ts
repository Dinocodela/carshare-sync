import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders, jsonResponse } from "./require-auth.ts";

export { corsHeaders, jsonResponse };

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

export interface AdminActor {
  id: string;
  email?: string;
}

/**
 * Verify the caller is signed in AND a super admin.
 * The Social module is strictly super-admin only.
 */
export async function requireSuperAdmin(
  req: Request,
): Promise<{ error: Response } | { actor: AdminActor; admin: SupabaseClient }> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: jsonResponse({ error: "Unauthorized" }, 401) };

  const admin = serviceClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  const { data: isSuper, error: roleError } = await admin.rpc("is_super", {
    uid: data.user.id,
  });
  if (roleError || !isSuper) {
    return { error: jsonResponse({ error: "Forbidden" }, 403) };
  }

  return {
    actor: { id: data.user.id, email: data.user.email ?? undefined },
    admin,
  };
}

/** Shared-secret guard for cron-triggered workers (no user JWT involved). */
export function isWorkerRequest(req: Request): boolean {
  const provided = req.headers.get("x-worker-secret");
  if (!provided) return false;
  const accepted = [
    Deno.env.get("SOCIAL_WORKER_SECRET"),
    Deno.env.get("WRAP_WORKER_SECRET"),
  ].filter(Boolean) as string[];
  return accepted.includes(provided);
}

export function requireWorkerSecret(req: Request): Response | null {
  const configured =
    Deno.env.get("SOCIAL_WORKER_SECRET") || Deno.env.get("WRAP_WORKER_SECRET");
  if (!configured) return jsonResponse({ error: "Worker secret not configured" }, 500);
  return isWorkerRequest(req) ? null : jsonResponse({ error: "Unauthorized" }, 401);
}

export async function writeAudit(
  admin: SupabaseClient,
  entry: {
    entity_type: string;
    entity_id?: string | null;
    action: string;
    actor_user_id?: string | null;
    actor_email?: string | null;
    before_state?: unknown;
    after_state?: unknown;
    metadata?: unknown;
  },
) {
  const { error } = await admin.from("social_audit_log").insert(entry);
  if (error) console.error("audit write failed:", error.message);
}

export async function notifySlack(text: string) {
  const url = Deno.env.get("SLACK_WEBHOOK_URL");
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.warn("slack notify failed:", (e as Error).message);
  }
}
