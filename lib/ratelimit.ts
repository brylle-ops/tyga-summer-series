import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestBlocked, verifyBlocked } from "@/lib/ratelimit-rules";

// Counted in the database (signin_attempts) so every server instance sees the same numbers.
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

/** found=true rows are code requests; found=false rows are failed code checks. Fails open if the table is unreachable. */
export async function loginRequestBlocked(email: string): Promise<boolean> {
  try {
    const db = createAdminClient();
    const [a, b] = await Promise.all([
      db.from("signin_attempts").select("id", { count: "exact", head: true }).eq("email", email).eq("found", true).gte("created_at", ago(10 * 60_000)),
      db.from("signin_attempts").select("id", { count: "exact", head: true }).eq("found", true).gte("created_at", ago(60_000)),
    ]);
    return requestBlocked(a.count ?? 0, b.count ?? 0);
  } catch (e) { console.error("[ratelimit] request check failed:", (e as Error).message); return false; }
}

export async function loginVerifyBlocked(email: string): Promise<boolean> {
  try {
    const { count } = await createAdminClient().from("signin_attempts").select("id", { count: "exact", head: true })
      .eq("email", email).eq("found", false).gte("created_at", ago(10 * 60_000));
    return verifyBlocked(count ?? 0);
  } catch (e) { console.error("[ratelimit] verify check failed:", (e as Error).message); return false; }
}

export async function recordLoginEvent(email: string, ok: boolean): Promise<void> {
  try { await createAdminClient().from("signin_attempts").insert({ email, found: ok }); }
  catch (e) { console.error("[ratelimit] could not record:", (e as Error).message); }
}
