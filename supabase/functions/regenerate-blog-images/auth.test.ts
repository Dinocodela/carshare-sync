// Auth tests for regenerate-blog-images.
// Endpoint must only accept service-role tokens or super_admin user JWTs.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN = "regenerate-blog-images";

async function call(headers: Record<string, string>) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${FN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({}),
  });
  await res.text();
  return res.status;
}

Deno.test("regenerate-blog-images: rejects missing Authorization header", async () => {
  assertEquals(await call({}), 401);
});

Deno.test("regenerate-blog-images: rejects malformed Authorization header", async () => {
  assertEquals(await call({ Authorization: "NotBearer abc" }), 401);
});

Deno.test("regenerate-blog-images: rejects invalid bearer token", async () => {
  assertEquals(await call({ Authorization: "Bearer not-a-real-jwt" }), 401);
});

Deno.test("regenerate-blog-images: rejects anon key (not super_admin)", async () => {
  const status = await call({ Authorization: `Bearer ${ANON_KEY}` });
  if (status !== 401 && status !== 403) {
    throw new Error(`expected 401 or 403, got ${status}`);
  }
});
