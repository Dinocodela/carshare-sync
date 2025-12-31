// Supabase Edge Function: push-send
// Sends a Web Push notification to the authenticated user's subscriptions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@^3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    let VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com";
    
    // Ensure VAPID subject is in correct format (must be URL or mailto:)
    if (VAPID_SUBJECT && !VAPID_SUBJECT.startsWith('mailto:') && !VAPID_SUBJECT.startsWith('https://')) {
      VAPID_SUBJECT = `mailto:${VAPID_SUBJECT}`;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing Supabase envs");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error("Missing VAPID keys");
      return new Response(JSON.stringify({ error: "VAPID not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    const body = await req.json().catch(() => ({}));
    let userId: string;
    
    // If targetUserId is provided, use it (for system notifications)
    // Otherwise, use the authenticated user's ID
    if (body.targetUserId) {
      userId = body.targetUserId;
    } else {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      userId = authData.user.id;
    }

    const title: string = body.title || "Test notification";
    const message: string = body.body || "Push notifications are working!";
    const icon: string | undefined = body.icon;
    const url: string | undefined = body.url;

    const { data: subs, error: subErr } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (subErr) {
      console.error("Failed to fetch subscriptions", subErr);
      return new Response(JSON.stringify({ error: "Failed to load subscriptions" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload = JSON.stringify({ title, body: message, icon, url });

    let sent = 0;
    let removed = 0;

    for (const s of subs || []) {
      const subscription = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      } as any;
      try {
        await webpush.sendNotification(subscription, payload);
        sent += 1;
      } catch (err: any) {
        const status = err?.statusCode || err?.status || 0;
        console.warn("Push error", status, err?.message);
        if (status === 404 || status === 410) {
          // Subscription no longer valid – remove it
          await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          removed += 1;
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, removed }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("Unexpected error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

Deno.serve(handler);
