import { createAdminClient } from "@/lib/supabase/admin";

// TEMPORARY diagnostic: pass/fail per query used by Home. Returns no data. Delete after use.
export const dynamic = "force-dynamic";
export async function GET() {
  const out: Record<string, string> = {};
  const env = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY", "NEXT_PUBLIC_SITE_URL", "SERIES_PREVIEW_WEEK"];
  for (const k of env) out[`env ${k}`] = process.env[k] ? "set" : "MISSING";
  try {
    const db = createAdminClient();
    const step = async (name: string, q: PromiseLike<{ error: { message: string } | null; data: unknown[] | null }>) => {
      const { error, data } = await q; out[name] = error ? `ERROR: ${error.message}` : `ok (${data?.length ?? 0} rows)`;
    };
    await step("profiles", db.from("profiles").select("id, first_name, last_name, mobile, holiday_until, role").limit(3));
    await step("registrations+profiles join", db.from("registrations").select("profile_id, profiles(id, first_name, last_name, mobile, holiday_until, role)").limit(3));
    await step("checkins", db.from("checkins").select("profile_id, day, kind, status").limit(3));
    await step("mission_completions", db.from("mission_completions").select("profile_id, mission_id").limit(3));
    await step("missions", db.from("missions").select("*").limit(3));
  } catch (e) { out.crash = (e as Error).message; }
  return Response.json(out);
}
