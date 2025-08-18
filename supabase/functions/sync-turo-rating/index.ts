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
  console.log(`[sync-turo-rating] Request received: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  try {
    const requestBody = await req.json().catch(() => ({}));
    console.log(`[sync-turo-rating] Request body:`, requestBody);
    
    const { turo_profile_url: overrideUrl } = requestBody as { turo_profile_url?: string };

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    
    console.log(`[sync-turo-rating] Auth check - User ID: ${user?.id}, Error: ${userError?.message}`);
    
    if (userError || !user) {
      console.error(`[sync-turo-rating] Authorization failed:`, userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load profile to get stored URL if not provided
    let profileUrl = overrideUrl;
    console.log(`[sync-turo-rating] Override URL provided: ${!!overrideUrl}`);
    
    if (!profileUrl) {
      console.log(`[sync-turo-rating] Loading profile URL from database`);
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("turo_profile_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profErr) {
        console.error(`[sync-turo-rating] Profile fetch error:`, profErr);
        throw profErr;
      }
      profileUrl = prof?.turo_profile_url ?? undefined;
      console.log(`[sync-turo-rating] Profile URL from DB: ${profileUrl}`);
    }

    if (!profileUrl) {
      console.error(`[sync-turo-rating] No profile URL available`);
      return new Response(JSON.stringify({ 
        error: "No Turo profile URL provided. Please set your Turo profile URL first." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!isValidTuroUrl(profileUrl)) {
      console.error(`[sync-turo-rating] Invalid Turo URL: ${profileUrl}`);
      return new Response(JSON.stringify({ 
        error: "Invalid Turo profile URL. Please provide a valid turo.com profile link." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`[sync-turo-rating] Fetching Turo profile: ${profileUrl}`);

    const response = await fetch(profileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    console.log(`[sync-turo-rating] Fetch response status: ${response.status}`);

    if (!response.ok) {
      console.error(`[sync-turo-rating] Fetch failed - Status: ${response.status}, StatusText: ${response.statusText}`);
      let errorMessage = `Failed to fetch Turo profile (${response.status})`;
      
      if (response.status === 404) {
        errorMessage = "Turo profile not found. Please check if the URL is correct and the profile is public.";
      } else if (response.status === 403) {
        errorMessage = "Access denied to Turo profile. The profile might be private or restricted.";
      } else if (response.status >= 500) {
        errorMessage = "Turo servers are currently unavailable. Please try again later.";
      }
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = await response.text();
    console.log(`[sync-turo-rating] HTML content length: ${html.length}`);
    console.log(`[sync-turo-rating] HTML contains "ratingValue": ${html.includes('ratingValue')}`);
    console.log(`[sync-turo-rating] HTML contains JSON-LD: ${html.includes('application/ld+json')}`);
    
    let { rating, reviews } = extractRatingFromJsonLd(html);
    console.log(`[sync-turo-rating] JSON-LD extraction result - Rating: ${rating}, Reviews: ${reviews}`);
    
    if (rating === undefined) {
      console.log(`[sync-turo-rating] JSON-LD failed, trying fallback extraction`);
      const fb = fallbackExtract(html);
      rating = fb.rating;
      reviews = reviews ?? fb.reviews;
      console.log(`[sync-turo-rating] Fallback extraction result - Rating: ${rating}, Reviews: ${reviews}`);
    }

    if (rating === undefined) {
      console.error(`[sync-turo-rating] No rating found in HTML content`);
      // Log a snippet of HTML for debugging
      const htmlSnippet = html.substring(0, 1000);
      console.log(`[sync-turo-rating] HTML snippet:`, htmlSnippet);
      
      return new Response(JSON.stringify({ 
        error: "Unable to find rating data in Turo profile. The profile structure may have changed or the profile may not have any reviews yet." 
      }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`[sync-turo-rating] Successfully extracted - Rating: ${rating}, Reviews: ${reviews}`);

    console.log(`[sync-turo-rating] Updating profile in database`);
    const { error: updErr } = await supabase
      .from("profiles")
      .update({
        rating,
        turo_reviews_count: reviews ?? 0,
        turo_last_synced: new Date().toISOString(),
        turo_profile_url: profileUrl,
      })
      .eq("user_id", user.id);

    if (updErr) {
      console.error(`[sync-turo-rating] Database update error:`, updErr);
      throw updErr;
    }
    
    console.log(`[sync-turo-rating] Successfully updated profile`);

    console.log(`[sync-turo-rating] Sync completed successfully`);
    return new Response(
      JSON.stringify({ success: true, rating, reviews: reviews ?? 0, url: profileUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[sync-turo-rating] Error occurred:", err);
    
    let errorMessage = "Internal server error occurred while syncing Turo data";
    if (err instanceof Error) {
      if (err.message.includes("fetch")) {
        errorMessage = "Network error while accessing Turo. Please check your internet connection and try again.";
      } else if (err.message.includes("timeout")) {
        errorMessage = "Request timed out. Turo servers may be slow. Please try again.";
      } else {
        errorMessage = err.message;
      }
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
