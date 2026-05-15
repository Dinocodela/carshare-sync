import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Verify the caller's JWT and return both the user and a service-role client.
 * Returns a Response on failure.
 */
export async function requireAuth(req: Request): Promise<
  | { error: Response }
  | { user: { id: string; email?: string }; admin: SupabaseClient }
> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: jsonResponse({ error: "Unauthorized" }, 401) };

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    console.error("requireAuth getUser error:", error?.message);
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }
  return { user: { id: data.user.id, email: data.user.email ?? undefined }, admin };
}
