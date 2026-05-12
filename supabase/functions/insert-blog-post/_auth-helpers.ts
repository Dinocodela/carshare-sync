// Shared auth tests for blog management edge functions.
// Verifies that only super_admin or service-role callers are accepted.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

export const BLOG_FUNCTIONS = [
  { name: "insert-blog-post", body: { title: "x", slug: "x", content: "x" } },
  { name: "generate-blog-post", body: { topic: "x" } },
  { name: "regenerate-blog-images", body: {} },
];

async function call(fn: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  await res.text();
  return res.status;
}

export function registerBlogAuthTests(fn: string, body: unknown) {
  Deno.test(`${fn}: rejects missing Authorization header`, async () => {
    assertEquals(await call(fn, {}, body), 401);
  });

  Deno.test(`${fn}: rejects malformed Authorization header`, async () => {
    assertEquals(await call(fn, { Authorization: "NotBearer abc" }, body), 401);
  });

  Deno.test(`${fn}: rejects invalid bearer token`, async () => {
    assertEquals(await call(fn, { Authorization: "Bearer not-a-real-jwt" }, body), 401);
  });

  Deno.test(`${fn}: rejects anon key (not super_admin, not service_role)`, async () => {
    const status = await call(fn, { Authorization: `Bearer ${ANON_KEY}` }, body);
    if (status !== 401 && status !== 403) {
      throw new Error(`expected 401 or 403, got ${status}`);
    }
  });
}

export { call };
