import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadEveryone, seriesDayNow, seriesWeekNow } from "@/lib/series-data";
import { pointsByWeek, sessionDaysByWeek, type Mission } from "@/lib/series";
import type { MemberRewardCtx, Reward, WeekScore } from "@/lib/rewards";

export async function loadRewards(): Promise<Reward[]> {
  const { data, error } = await createAdminClient().from("rewards").select("*").order("week").order("id");
  if (error) console.error("[rewards]", error.message);
  return ((data ?? []) as Reward[]).map((r) => ({ ...r, id: Number(r.id) }));
}

/** Everything the member Rewards & Perks screen needs: all rewards plus what this member has done with them. */
export async function loadMemberRewards(profileId: string) {
  const db = createAdminClient();
  const [rewards, { data: entries }, { data: wins }, { data: used }, { data: anyWinner }] = await Promise.all([
    loadRewards(),
    db.from("reward_entries").select("reward_id").eq("profile_id", profileId),
    db.from("reward_winners").select("reward_id, announced, collected_at").eq("profile_id", profileId),
    db.from("reward_redemptions").select("reward_id").eq("profile_id", profileId),
    db.from("reward_winners").select("reward_id"),
  ]);
  const ctx: MemberRewardCtx = {
    week: seriesWeekNow(),
    today: seriesDayNow(),
    entered: new Set((entries ?? []).map((e) => Number(e.reward_id))),
    won: new Map((wins ?? []).map((w) => [Number(w.reward_id), { announced: Boolean(w.announced), collected: Boolean(w.collected_at) }])),
    redeemed: new Set((used ?? []).map((u) => Number(u.reward_id))),
  };
  const drawClosed = new Set((anyWinner ?? []).map((w) => Number(w.reward_id)));
  return { rewards, ctx, drawClosed };
}

/** Everyone's points and counted sessions in one series week (full names: staff screens only). */
export async function weekScores(week: number): Promise<WeekScore[]> {
  const { everyone, missions } = await loadEveryone();
  const byId = new Map(missions.map((m) => [Number(m.id), m]));
  return everyone.map((e) => {
    const done = e.done.map((id) => byId.get(id)).filter(Boolean) as Mission[];
    return {
      id: e.profile.id,
      name: `${e.profile.first_name ?? ""} ${e.profile.last_name ?? ""}`.trim() || "Member",
      points: pointsByWeek(e.checkins, done).get(week) ?? 0,
      sessions: sessionDaysByWeek(e.checkins).get(week)?.length ?? 0,
    };
  });
}
