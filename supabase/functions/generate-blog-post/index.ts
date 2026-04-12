import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOPIC_AREAS = [
  "How to maximize passive income with Tesla rentals on Turo in 2026",
  "Best practices for managing a fleet of rental EVs",
  "Tesla Model 3 vs Model Y: which earns more on Turo?",
  "How to reduce maintenance costs on your Turo Tesla fleet",
  "Tax strategies every Turo host should know in 2026",
  "How co-hosting works and why it can double your earnings",
  "Insurance tips for Tesla Turo hosts to protect your investment",
  "How to price your Tesla competitively on Turo for maximum bookings",
  "The real cost of owning a Tesla for car sharing in 2026",
  "How EV incentives and rebates boost your rental car ROI",
  "Guest experience tips that lead to 5-star Turo reviews",
  "How to scale from 1 car to a 10-car Turo fleet",
  "Seasonal pricing strategies for Tesla Turo hosts",
  "Comparing Turo vs Getaround vs HyreCar for Tesla owners",
  "How to handle damage claims and protect your Tesla on Turo",
  "The ultimate checklist for onboarding a new Tesla to Turo",
  "Why professional co-hosting services pay for themselves",
  "How mileage tracking and expense logging boost your tax refund",
  "Electric vehicle rental market trends and projections for 2026-2027",
  "How to build a sustainable car-sharing business with Teslas",
  "Supercharging costs vs gas: the profitability edge of EV rentals",
  "How to automate your Turo business with smart tools",
  "Real host stories: lessons from running a Tesla fleet on Turo",
  "How to pick the right Tesla trim for maximum rental profit",
  "Understanding Turo's fee structure and how to keep more earnings",
  "Winter EV rental tips: battery management and guest communication",
  "How to market your Tesla listing to stand out on Turo",
  "The ROI breakdown: buying a Tesla specifically for Turo hosting",
  "Why fleet management software is a game-changer for Turo hosts",
  "How to set boundaries and rules for your Turo Tesla renters",
  "How to charge a rental Tesla: a complete Supercharger guide for hosts and guests",
  "Does your car insurance cover Tesla rentals? What every host needs to know",
  "Using your Tesla for Uber and rideshare: rental income vs ride income comparison",
  "Tesla Cybertruck rental market analysis: demand, pricing, and ROI projections",
  "Monthly vs daily Tesla rentals: which strategy earns more for hosts?",
  "Tesla Model X rental income guide: is the luxury SUV worth it for Turo?",
  "Tesla Model S Plaid on Turo: premium pricing strategies for performance sedans",
  "Las Vegas Tesla rental market: why Sin City is a goldmine for EV hosts",
  "Long-term Tesla rental strategies: how to attract 30-day renters",
  "Tesla rental cost breakdown: what renters pay and what hosts earn in 2026",
];

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1554744512-d6c603f27c54?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1617704548623-340376564e68?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1619317190042-b2cb44807416?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1625231334401-55e8e06a2e5e?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1562053913-4e2b3bcc6225?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1570733577524-3a047079e80d?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1516728043-d3e2c71a4907?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1462396881884-de2c07cb95ed?w=1600&h=900&fit=crop",
];

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

    // Get existing slugs to avoid duplicates
    const { data: existingPosts } = await supabase
      .from("blog_posts")
      .select("slug, title, cover_image")
      .order("created_at", { ascending: false })
      .limit(50);

    const existingTitles = (existingPosts || []).map((p) => p.title);
    const existingSlugs = (existingPosts || []).map((p) => p.slug);
    const usedImages = (existingPosts || []).map((p) => p.cover_image).filter(Boolean);

    // Pick an image not recently used, fallback to random
    const availableImages = COVER_IMAGES.filter((img) => !usedImages.includes(img));
    const coverImage = availableImages.length > 0
      ? availableImages[Math.floor(Math.random() * availableImages.length)]
      : COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];

    // Pick a random topic area
    const topic = TOPIC_AREAS[Math.floor(Math.random() * TOPIC_AREAS.length)];

    const systemPrompt = `You are a senior automotive industry analyst and content strategist for Teslys, a premium Tesla fleet management and co-hosting platform. Write authoritative, SEO-optimized blog articles about Tesla car sharing, Turo hosting, EV passive income, and fleet management.

STRICT RULES:
- Never use emojis in headings or anywhere in the article
- Use a professional, confident tone — like a senior economist writing for Bloomberg
- Short, punchy paragraphs (2-3 sentences max)
- Use bullet points liberally for scannability
- Include specific numbers, percentages, and data points (realistic estimates)
- Structure: Introduction → 6-8 sections with H2 headings → Strong CTA mentioning Teslys
- Each H2 section should have 2-4 paragraphs or bullet lists
- Total length: 1500-2200 words
- Naturally mention "Teslys" 2-3 times as the recommended co-hosting platform
- End with a CTA encouraging readers to sign up at Teslys

These titles already exist, DO NOT reuse them: ${existingTitles.slice(0, 20).join("; ")}

Return a valid JSON object with these exact keys:
- "title": SEO-optimized title (50-65 chars)
- "slug": URL-friendly slug (lowercase, hyphens, no special chars)
- "excerpt": compelling meta description (140-155 chars)
- "category": one of "Passive Income", "Fleet Management", "EV Insights", "Host Tips", "Market Analysis"
- "tags": array of 3-5 relevant tags
- "content": full HTML article body using <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote> tags. No <h1>. No inline styles.
- "author_name": "Teslys Team"`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Write a unique, in-depth blog article about: "${topic}". Make sure the angle and title are fresh and different from existing posts.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "publish_blog_post",
                description: "Publish a blog post with structured data",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    slug: { type: "string" },
                    excerpt: { type: "string" },
                    category: {
                      type: "string",
                      enum: [
                        "Passive Income",
                        "Fleet Management",
                        "EV Insights",
                        "Host Tips",
                        "Market Analysis",
                      ],
                    },
                    tags: { type: "array", items: { type: "string" } },
                    content: { type: "string" },
                    author_name: { type: "string" },
                  },
                  required: [
                    "title",
                    "slug",
                    "excerpt",
                    "category",
                    "tags",
                    "content",
                    "author_name",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "publish_blog_post" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const post = JSON.parse(toolCall.function.arguments);

    // Ensure slug is unique
    let finalSlug = post.slug;
    if (existingSlugs.includes(finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // Insert into database
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: post.title,
        slug: finalSlug,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags,
        content: post.content,
        cover_image: coverImage,
        author_name: post.author_name || "Teslys Team",
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    console.log(`Published blog post: "${post.title}" (${finalSlug})`);

    return new Response(
      JSON.stringify({ success: true, post: data?.[0] }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("generate-blog-post error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
