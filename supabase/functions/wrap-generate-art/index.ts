// Generates wrap artwork with Lovable AI. Super-admins only.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: isSuper } = await admin.rpc("is_super", { uid: user.id });
    if (!isSuper) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => null);
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt || prompt.length > 2000) {
      return json({ error: "A prompt of 1-2000 characters is required" }, 400);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "LOVABLE_API_KEY is not configured" }, 500);

    const fullPrompt =
      `Seamless flat 2D texture artwork for a vehicle livery, square composition, ` +
      `edge-to-edge design with no borders, no text, no logos, no car photo, ` +
      `no perspective or 3D rendering. Design brief: ${prompt}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error(`AI gateway failed [${res.status}]: ${details}`);
      return json({ error: "Image generation failed", details }, res.status);
    }

    const payload = await res.json();
    const b64 = payload?.data?.[0]?.b64_json;
    if (!b64) {
      console.error("No image in gateway response", JSON.stringify(payload).slice(0, 500));
      return json({ error: "Image generation returned no image" }, 502);
    }

    return json({ dataUrl: `data:image/png;base64,${b64}` });
  } catch (e) {
    console.error("wrap-generate-art error:", e);
    return json({ error: "Server error" }, 500);
  }
});
