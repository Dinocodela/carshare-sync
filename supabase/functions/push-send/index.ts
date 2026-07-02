// Supabase Edge Function: push-send
// Sends notifications to a user's registered devices:
//  - Web Push (VAPID) -> push_subscriptions
//  - Native FCM (HTTP v1) -> push_devices

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@^3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---- FCM (HTTP v1) helpers ----------------------------------------------

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function base64url(input: string | Uint8Array): string {
  let str = "";
  if (typeof input === "string") {
    str = btoa(input);
  } else {
    let binary = "";
    for (let i = 0; i < input.length; i++) binary += String.fromCharCode(input[i]);
    str = btoa(binary);
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getFcmAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey.replace(/\\n/g, "\n")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );

  const jwt = `${unsigned}.${base64url(new Uint8Array(signature))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`FCM token error ${res.status}: ${t}`);
  }
  const json = await res.json();
  return json.access_token as string;
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    let VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com";

    // Ensure VAPID subject is in correct format (must be URL or mailto:)
    if (VAPID_SUBJECT && !VAPID_SUBJECT.startsWith("mailto:") && !VAPID_SUBJECT.startsWith("https://")) {
      VAPID_SUBJECT = `mailto:${VAPID_SUBJECT}`;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing Supabase envs");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json().catch(() => ({}));
    let userId: string;

    // Detect trusted server-to-server calls (service-role bearer token).
    const authHeader = req.headers.get("Authorization") || "";
    const bearer = authHeader.replace(/^Bearer\s+/i, "");
    const isServiceRoleCall = !!SERVICE_ROLE_KEY && bearer === SERVICE_ROLE_KEY;

    if (isServiceRoleCall) {
      // Trusted internal caller (e.g. payment-completed flow). Honor targetUserId.
      if (!body.targetUserId) {
        return new Response(JSON.stringify({ error: "targetUserId required for internal calls" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      userId = body.targetUserId;
    } else {
      // Normal caller: authenticate the user.
      const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: authData, error: authErr } = await supabaseAuth.auth.getUser();
      if (authErr || !authData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // If targetUserId is provided, verify caller is a super admin.
      if (body.targetUserId && body.targetUserId !== authData.user.id) {
        const { data: profile, error: profileErr } = await supabaseAuth
          .from("profiles")
          .select("is_super_admin")
          .eq("user_id", authData.user.id)
          .single();

        if (profileErr || !profile?.is_super_admin) {
          return new Response(JSON.stringify({ error: "Unauthorized: only admins can target other users" }), {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        userId = body.targetUserId;
      } else {
        userId = authData.user.id;
      }
    }

    const title: string = body.title || "Test notification";
    const message: string = body.body || "Push notifications are working!";
    const icon: string | undefined = body.icon;
    const url: string | undefined = body.url;

    // Use a service-role client for reading device/subscription tables and cleanup.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

    let webSent = 0;
    let webRemoved = 0;
    let fcmSent = 0;
    let fcmRemoved = 0;

    // ---- Web Push (VAPID) -> push_subscriptions ----
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

      const { data: subs, error: subErr } = await admin
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", userId);

      if (subErr) {
        console.error("Failed to fetch subscriptions", subErr);
      } else {
        const payload = JSON.stringify({ title, body: message, icon, url });
        for (const s of subs || []) {
          const subscription = {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          } as any;
          try {
            await webpush.sendNotification(subscription, payload);
            webSent += 1;
          } catch (err: any) {
            const status = err?.statusCode || err?.status || 0;
            console.warn("Web push error", status, err?.message);
            if (status === 404 || status === 410) {
              await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
              webRemoved += 1;
            }
          }
        }
      }
    } else {
      console.warn("VAPID not configured; skipping web push");
    }

    // ---- Native FCM (HTTP v1) -> push_devices ----
    const FCM_PROJECT_ID = Deno.env.get("FCM_PROJECT_ID");
    const FCM_CLIENT_EMAIL = Deno.env.get("FCM_CLIENT_EMAIL");
    const FCM_PRIVATE_KEY = Deno.env.get("FCM_PRIVATE_KEY");

    if (FCM_PROJECT_ID && FCM_CLIENT_EMAIL && FCM_PRIVATE_KEY) {
      const { data: devices, error: devErr } = await admin
        .from("push_devices")
        .select("token")
        .eq("user_id", userId)
        .eq("muted", false)
        .is("revoked_at", null);

      if (devErr) {
        console.error("Failed to fetch devices", devErr);
      } else if (devices && devices.length > 0) {
        try {
          const accessToken = await getFcmAccessToken(FCM_CLIENT_EMAIL, FCM_PRIVATE_KEY);
          const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`;

          for (const d of devices) {
            const fcmMessage = {
              message: {
                token: d.token,
                notification: { title, body: message },
                data: url ? { url } : {},
                android: { priority: "high" },
                apns: {
                  payload: { aps: { sound: "default" } },
                },
              },
            };

            const resp = await fetch(fcmUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(fcmMessage),
            });

            if (resp.ok) {
              fcmSent += 1;
              await resp.text();
            } else {
              const errText = await resp.text();
              console.warn("FCM send error", resp.status, errText);
              // Remove stale/invalid tokens.
              if (resp.status === 404 || /UNREGISTERED|INVALID_ARGUMENT/.test(errText)) {
                await admin.from("push_devices").delete().eq("token", d.token);
                fcmRemoved += 1;
              }
            }
          }
        } catch (fcmErr) {
          console.error("FCM delivery failed", fcmErr);
        }
      }
    } else {
      console.warn("FCM not configured; skipping native push");
    }

    return new Response(
      JSON.stringify({ ok: true, webSent, webRemoved, fcmSent, fcmRemoved }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (e) {
    console.error("Unexpected error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

Deno.serve(handler);
