import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidTuroUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    return u.hostname.includes("turo.com");
  } catch {
    return false;
  }
}

function extractRatingFromJsonLd(html: string): { rating?: number; reviews?: number } {
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html))) {
    const content = match[1].trim();
    try {
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const agg = item.aggregateRating || item["@graph"]?.find?.((x: any) => x.aggregateRating)?.aggregateRating;
        if (agg) {
          const ratingVal = parseFloat(String(agg.ratingValue ?? agg.rating ?? ""));
          const reviewCount = parseInt(String(agg.reviewCount ?? agg.ratingCount ?? "0"), 10);
          if (!Number.isNaN(ratingVal)) {
            return {
              rating: Math.max(0, Math.min(5, ratingVal)),
              reviews: Number.isNaN(reviewCount) ? undefined : reviewCount,
            };
          }
        }
      }
    } catch (_) {
      // ignore parse error and continue
    }
  }
  return {};
}

function fallbackExtract(html: string): { rating?: number; reviews?: number } {
  // Very loose fallbacks
  const ratingMatch = html.match(/"ratingValue"\s*:\s*"?(\d+(?:\.\d+)?)"?/i);
  const reviewsMatch = html.match(/"reviewCount"\s*:\s*"?(\d+)"?/i) || html.match(/"ratingCount"\s*:\s*"?(\d+)"?/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
  const reviews = reviewsMatch ? parseInt(reviewsMatch[1], 10) : undefined;
  if (rating !== undefined && !Number.isNaN(rating)) {
    return {
      rating: Math.max(0, Math.min(5, rating)),
      reviews: reviews && !Number.isNaN(reviews) ? reviews : undefined,
    };
  }
  return {};
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  try {
    const { url: overrideUrl } = (await req.json().catch(() => ({}))) as { url?: string };

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load profile to get stored URL if not provided
    let profileUrl = overrideUrl;
    if (!profileUrl) {
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("turo_profile_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profErr) {
        throw profErr;
      }
      profileUrl = prof?.turo_profile_url ?? undefined;
    }

    if (!profileUrl || !isValidTuroUrl(profileUrl)) {
      return new Response(JSON.stringify({ error: "A valid turo.com profile URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(profileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch profile (${response.status})` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = await response.text();
    let { rating, reviews } = extractRatingFromJsonLd(html);
    if (rating === undefined) {
      const fb = fallbackExtract(html);
      rating = fb.rating;
      reviews = reviews ?? fb.reviews;
    }

    if (rating === undefined) {
      return new Response(JSON.stringify({ error: "Unable to parse rating from Turo profile" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updErr } = await supabase
      .from("profiles")
      .update({
        rating,
        turo_reviews_count: reviews ?? 0,
        turo_last_synced: new Date().toISOString(),
        turo_profile_url: profileUrl,
      })
      .eq("user_id", user.id);

    if (updErr) throw updErr;

    return new Response(
      JSON.stringify({ success: true, rating, reviews: reviews ?? 0, url: profileUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("sync-turo-rating error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
