import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function authorize(req: Request, supabase: any): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.replace("Bearer ", "");
  // Allow service-role callers (pg_cron / trusted backend)
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return null;
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (data.claims.role === "service_role") return null;
  const userId = data.claims.sub;
  const { data: prof } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("user_id", userId)
    .maybeSingle();
  if (!prof?.is_super_admin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authFail = await authorize(req, supabase);
    if (authFail) return authFail;

    const body = await req.json();
    const { _action, ...postData } = body;

    let result;

    if (_action === "update" && postData.slug) {
      const slug = postData.slug;
      delete postData.slug;
      const { data, error } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("slug", slug)
        .select();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(postData)
        .select();
      if (error) throw error;
      result = data;
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
