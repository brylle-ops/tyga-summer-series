import "server-only";
import { redirect } from "next/navigation";
import * as mock from "@/lib/mock-data";
import { getCurrentMember, supabaseReady, type Profile } from "@/lib/session";
import {
  COUNTED, alburyDay, currentWeek, memberStats, rankEntries, sessionDaysByWeek, shortName, weekOfDay,
  type Checkin, type CheckinKind, type Mission,
} from "@/lib/series";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAll, groupBy } from "@/lib/paging";

const KIND_LABEL: Record<CheckinKind, string> = { yard: "Yard", run: "Run", workout: "Workout", recovery: "Recovery", rest: "Rest" };
export type MissionRow = Mission & { title: string; detail: string; is_secret: boolean; reveal_at: string | null };

const weekInfo = (no: number) => {
  const w = mock.seriesWeeks.find((x) => x.no === no);
  const start = new Date(Date.parse("2026-12-07T00:00:00+11:00") + (no - 1) * 7 * 86_400_000);
  const end = new Date(start.getTime() + 6 * 86_400_000);
  const f = (d: Date, m = false) => d.toLocaleDateString("en-AU", { day: "numeric", ...(m ? { month: "short" } : {}), timeZone: "Australia/Sydney" });
  return { no, theme: w?.theme ?? "", dates: no >= 1 ? `${f(start)}–${f(end, true)}` : "", unlocks: w?.unlocks ?? "" };
};

export function seriesWeekNow() {
  return currentWeek(new Date(), process.env.SERIES_PREVIEW_WEEK);
}

/** For series screens: the signed-in, paid member (staff always allowed). Null = example mode (no Supabase yet). */
export async function requireSeriesMember(): Promise<Profile | null> {
  if (!supabaseReady()) return null;
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  if (me.profile.role !== "staff" && me.registration?.payment_status !== "paid") {
    // Started joining but not finished: pick up where they left off.
    const r = me.registration;
    redirect(!me.profile.goal ? "/join/commit" : !r?.size ? "/join/singlet" : r.payment_status === "pending" ? "/join/confirmed" : "/join/checkout");
  }
  return me.profile;
}

type Everyone = { profile: Pick<Profile, "id" | "first_name" | "last_name" | "mobile" | "holiday_until">; checkins: Checkin[]; done: number[] }[];

/** Every paid member's activity (server only; screens only ever show first name + last initial). */
export async function loadEveryone(): Promise<{ everyone: Everyone; missions: MissionRow[] }> {
  const db = createAdminClient();
  const [regs, checkins, done, { data: missions }] = await Promise.all([
    fetchAll<{ profile_id: string; profiles: unknown }>((a, b) =>
      db.from("registrations").select("profile_id, profiles(id, first_name, last_name, mobile, holiday_until, role)").eq("payment_status", "paid").order("profile_id").range(a, b)),
    // Only sessions that can count, from the series start — keeps the load small.
    fetchAll<Checkin & { profile_id: string }>((a, b) =>
      db.from("checkins").select("profile_id, day, kind, status").in("kind", ["yard", "run", "workout"])
        .gte("day", "2026-12-07").order("id").range(a, b)),
    fetchAll<{ profile_id: string; mission_id: number }>((a, b) =>
      db.from("mission_completions").select("profile_id, mission_id").order("created_at").range(a, b)),
    db.from("missions").select("*").order("week").order("id"),
  ]);
  const checkinsBy = groupBy(checkins, (c) => c.profile_id);
  const doneBy = groupBy(done, (d) => d.profile_id);
  const everyone: Everyone = regs.map((r) => {
    const p = r.profiles as unknown as Profile;
    return { profile: p, checkins: checkinsBy.get(p.id) ?? [], done: (doneBy.get(p.id) ?? []).map((d) => Number(d.mission_id)) };
  });
  return { everyone, missions: (missions ?? []) as MissionRow[] };
}

/** Everything the member screens show, in the same shape as the example data. */
export async function loadMemberView(profile: Profile | null) {
  const week = profile ? seriesWeekNow() : mock.currentWeekNo;
  if (!profile) {
    return { real: false, week, weekInfo: { ...mock.thisWeek, unlocks: "" }, nextWeek: mock.nextWeek ? weekInfo(mock.nextWeek.no) : null,
      me: mock.me, missions: mock.missions.map((m, i) => ({ id: i, week: m.week, title: m.title, detail: m.detail, points: Number(m.points.replace(/\D/g, "")) || 0,
        secret: Boolean(m.secret), done: Boolean(m.done), double: false })),
      todays: [] as CheckinKind[], podium: mock.podium, leaderboard: mock.leaderboard, club: mock.clubThisWeek, holidayUntil: null as string | null };
  }
  const { everyone, missions } = await loadEveryone();
  const byId = new Map(missions.map((m) => [Number(m.id), m]));
  const statsFor = (e: Everyone[number]) => memberStats(e.checkins, e.done.map((id) => byId.get(id)).filter(Boolean) as Mission[], week);
  let mine = everyone.find((e) => e.profile.id === profile.id);
  if (!mine) {
    // Staff who haven't paid still get a view of their own activity.
    const { data: own } = await createAdminClient().from("checkins").select("day, kind, status").eq("profile_id", profile.id);
    mine = { profile, checkins: (own ?? []) as Checkin[], done: [] };
  }
  const ranked = rankEntries(everyone.map((e) => ({ id: e.profile.id, ...shortName(e.profile.first_name, e.profile.last_name), points: statsFor(e).points })));
  const s = statsFor(mine);
  const meRank = ranked.find((r) => r.id === profile.id);
  const days = sessionDaysByWeek(mine.checkins).get(week) ?? [];
  const pips = days.slice(0, 3).map((d) => KIND_LABEL[mine!.checkins.find((c) => c.day === d && COUNTED.includes(c.kind) && c.status === "confirmed")!.kind]);
  const today = alburyDay(new Date());
  const now = Date.now();

  return {
    real: true, week, weekInfo: { ...weekInfo(week), sessionsDone: s.sessionsThisWeek, pips }, nextWeek: week < 7 ? weekInfo(week + 1) : null,
    me: {
      firstName: profile.first_name || "there", ...shortName(profile.first_name, profile.last_name),
      shortName: shortName(profile.first_name, profile.last_name).name, points: s.points, rank: meRank?.rank ?? 0,
      participants: everyone.length, streakWeeks: s.streak, level: s.level, pointsToNext: s.pointsToNext, levelProgressPct: s.pct,
    },
    missions: missions.filter((m) => m.week <= week).map((m) => {
      const hidden = m.is_secret && (!m.reveal_at || Date.parse(m.reveal_at) > now);
      return { id: Number(m.id), week: m.week, title: hidden ? "Secret mission" : m.title, detail: hidden ? "Drops sometime this week" : m.detail,
        points: m.points, secret: hidden, done: mine!.done.includes(Number(m.id)), double: m.double };
    }),
    todays: mine.checkins.filter((c) => c.day === today).map((c) => c.kind),
    podium: [ranked[1], ranked[0], ranked[2]].filter(Boolean),
    leaderboard: ranked.slice(3, 10),
    club: everyone.filter((e) => (sessionDaysByWeek(e.checkins).get(week)?.length ?? 0) >= 3).length,
    holidayUntil: (profile as Profile & { holiday_until?: string | null }).holiday_until ?? null,
  };
}

export { weekOfDay };
