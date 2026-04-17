// Supabase Edge Function: get-vapid-public-key
// Public function to return the VAPID public key for the client

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const key = Deno.env.get("VAPID_PUBLIC_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "VAPID public key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ publicKey: key }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

Deno.serve(handler);
