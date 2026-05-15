import { corsHeaders, jsonResponse, requireAuth } from "../_shared/require-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed. Use POST." }, 405);

  const authResult = await requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user, admin } = authResult;

  try {
    const body = await req.json();
    const tripId = body.trip_id;
    if (!tripId) return jsonResponse({ error: "trip_id is required" }, 400);

    const { data, error } = await admin
      .from("host_earnings")
      .select("*, cars!inner(client_id, host_id)")
      .eq("trip_id", tripId)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return jsonResponse({ error: error.message }, 500);
    }

    if (!data) return jsonResponse({ data: null });

    // Authorization: caller must be the recording host, the assigned car host, or the car's client.
    const car = (data as any).cars ?? {};
    const isAuthorized =
      data.host_id === user.id ||
      car.host_id === user.id ||
      car.client_id === user.id;

    if (!isAuthorized) return jsonResponse({ error: "Forbidden" }, 403);

    // Strip the joined car object from the response payload.
    const { cars: _omit, ...earning } = data as any;
    return jsonResponse({ data: earning });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
