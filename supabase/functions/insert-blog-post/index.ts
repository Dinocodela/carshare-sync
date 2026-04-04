import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
