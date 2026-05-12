// Tests that blog management endpoints reject unauthorized callers.
// Only super_admin users or service-role tokens may invoke these functions.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTIONS = [
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
  await res.text(); // consume body to avoid resource leak
  return res.status;
}

for (const { name, body } of FUNCTIONS) {
  Deno.test(`${name}: rejects request with no Authorization header`, async () => {
    const status = await call(name, {}, body);
    assertEquals(status, 401, `expected 401, got ${status}`);
  });

  Deno.test(`${name}: rejects request with malformed Authorization header`, async () => {
    const status = await call(name, { Authorization: "NotBearer abc" }, body);
    assertEquals(status, 401, `expected 401, got ${status}`);
  });

  Deno.test(`${name}: rejects request with invalid bearer token`, async () => {
    const status = await call(name, { Authorization: "Bearer not-a-real-jwt" }, body);
    assertEquals(status, 401, `expected 401, got ${status}`);
  });

  Deno.test(`${name}: rejects anon key (authenticated but not super_admin)`, async () => {
    // The anon key is a valid JWT but its role is "anon", not "service_role",
    // and it has no profile row → should be Forbidden (403) or Unauthorized (401).
    const status = await call(name, { Authorization: `Bearer ${ANON_KEY}` }, body);
    if (status !== 401 && status !== 403) {
      throw new Error(`expected 401 or 403, got ${status}`);
    }
  });
}
