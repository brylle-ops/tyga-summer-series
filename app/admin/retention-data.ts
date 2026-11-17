import "server-only";
import { redirect } from "next/navigation";
import { buildRetention, type RetentionProfile, type SessionDay } from "@/lib/retention";
import { fetchAll } from "@/lib/paging";
import { isStaff, supabaseReady } from "@/lib/session";
import { seriesDayNow, seriesWeekNow } from "@/lib/series-data";
import { createAdminClient } from "@/lib/supabase/admin";

/** Owner home numbers: who has gone quiet, plus how many Yard sessions wait for approval. Staff only. */
export async function loadRetention() {
  if (!supabaseReady()) return null;
  if (!(await isStaff())) redirect("/login");
  const db = createAdminClient();
  const [profiles, sessions, { count }, missionsWaiting] = await Promise.all([
    fetchAll<RetentionProfile>((a, b) =>
      db.from("profiles").select("id, first_name, last_name, role, holiday_until, created_at").order("id").range(a, b)),
    // Confirmed sessions and pending Yard sessions both count as activity.
    fetchAll<SessionDay>((a, b) =>
      db.from("checkins").select("profile_id, day").in("kind", ["yard", "run", "workout"]).in("status", ["confirmed", "pending"])
        .gte("day", "2026-12-07").order("id").range(a, b)),
    db.from("checkins").select("*", { count: "exact", head: true }).eq("status", "pending"),
    db.from("mission_completions").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return { ...buildRetention(profiles, sessions, seriesDayNow()), week: seriesWeekNow(), pending: count ?? 0,
    missionsPending: missionsWaiting.error ? 0 : missionsWaiting.count ?? 0 };
}
