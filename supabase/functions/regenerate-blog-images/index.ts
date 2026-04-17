import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function generateAndUploadCover(
  supabase: any,
  apiKey: string,
  title: string,
  slug: string
): Promise<string | null> {
  const prompt = `Create a professional, cinematic blog cover image (16:9 landscape) for an article titled: "${title}". 
The image must visually represent the SPECIFIC topic of this article — not just a generic car photo. 
Think about what scene, setting, objects, or concept would best illustrate this topic.
For example: if about "tax strategies" show documents/calculator/financial setting; if about "fleet management" show multiple vehicles being organized; if about "guest experience" show a happy person receiving car keys.
Use modern editorial photography style with rich colors and cinematic lighting. 
Do NOT include any text, words, or watermarks in the image.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error(`Image gen failed for "${title}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    const base64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!base64Url) return null;

    // Upload to storage
    const matches = base64Url.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;

    const mimeType = matches[1];
    const base64Data = matches[2];
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const fileName = `blog-covers/${slug}-${Date.now()}.${ext}`;

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b: any) => b.name === "blog-images")) {
      await supabase.storage.createBucket("blog-images", { public: true });
    }

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, bytes, { contentType: mimeType, upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);

    return publicUrl?.publicUrl || null;
  } catch (err) {
    console.error(`Error generating image for "${title}":`, err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all posts that need new cover images (null or unsplash fallback)
    const { data: posts, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, title, slug, cover_image")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    const needsImage = (posts || []).filter(
      (p: any) =>
        !p.cover_image ||
        p.cover_image.includes("unsplash.com")
    );

    console.log(`Found ${needsImage.length} posts needing new cover images`);

    const results: any[] = [];

    for (const post of needsImage) {
      console.log(`Generating image for: "${post.title}"`);
      const imageUrl = await generateAndUploadCover(
        supabase,
        LOVABLE_API_KEY,
        post.title,
        post.slug
      );

      if (imageUrl) {
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update({ cover_image: imageUrl })
          .eq("id", post.id);

        results.push({
          title: post.title,
          success: !updateError,
          imageUrl,
        });
        console.log(`Updated cover for "${post.title}": ${imageUrl}`);
      } else {
        results.push({ title: post.title, success: false });
        console.log(`Failed to generate image for "${post.title}"`);
      }

      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 2000));
    }

    return new Response(
      JSON.stringify({ success: true, updated: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("regenerate-blog-images error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
