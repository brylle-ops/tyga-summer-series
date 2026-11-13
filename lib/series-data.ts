import "server-only";
import { redirect } from "next/navigation";
import * as mock from "@/lib/mock-data";
import { getCurrentMember, supabaseReady, type Profile } from "@/lib/session";
import {
  COUNTED, alburyDay, currentWeek, seriesToday, memberStats, rankEntries, sessionDaysByWeek, shortName, weekOfDay,
  type Checkin, type CheckinKind, type Mission,
} from "@/lib/series";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAll, groupBy } from "@/lib/paging";
import { buildActivity, weekStrip, type CompletedMission } from "@/lib/activity";

const KIND_LABEL: Record<CheckinKind, string> = { yard: "Yard", run: "Run", workout: "Workout", recovery: "Recovery", rest: "Rest" };
export type MissionRow = Mission & { title: string; detail: string; is_secret: boolean; reveal_at: string | null };

const weekInfo = (no: number) => {
  const w = mock.seriesWeeks.find((x) => x.no === no);
  const start = new Date(Date.parse("2026-12-07T00:00:00+11:00") + (no - 1) * 7 * 86_400_000);
  const end = new Date(start.getTime() + 6 * 86_400_000);
  const f = (d: Date, m = false) => d.toLocaleDateString("en-AU", { day: "numeric", ...(m ? { month: "short" } : {}), timeZone: "Australia/Sydney" });
  return { no, theme: w?.theme ?? "", dates: no >= 1 ? `${f(start)}–${f(end, true)}` : "", unlocks: w?.unlocks ?? "" };
};

/** Today's series day (honours the preview week while testing). */
/** Testing-only preview week. Ignored once Square is in production, so nobody can unlock future weeks by accident. */
function previewWeek(): string | undefined {
  return process.env.SQUARE_ENVIRONMENT === "production" ? undefined : process.env.SERIES_PREVIEW_WEEK;
}

export function seriesDayNow() {
  return seriesToday(new Date(), previewWeek());
}

export function seriesWeekNow() {
  return currentWeek(new Date(), previewWeek());
}

/** For series screens: any signed-in member (no payment needed). New members add their name and goal first. Null = example mode. */
export async function requireSeriesMember(): Promise<Profile | null> {
  if (!supabaseReady()) return null;
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  if (me.profile.role !== "staff" && (!me.profile.goal || !me.profile.first_name || !me.profile.last_name)) redirect("/join/commit");
  return me.profile;
}

type Everyone = { profile: Pick<Profile, "id" | "first_name" | "last_name" | "mobile" | "holiday_until">; checkins: Checkin[]; done: number[] }[];

/** Every member's activity (server only; screens only ever show first name + last initial). */
type EveryoneData = { everyone: Everyone; missions: MissionRow[] };
let everyoneCache: { at: number; data: EveryoneData } | null = null;
const EVERYONE_TTL_MS = 20_000; // other members' numbers may be up to 20s old; your own are always fresh

export async function loadEveryone(): Promise<EveryoneData> {
  if (everyoneCache && Date.now() - everyoneCache.at < EVERYONE_TTL_MS) return everyoneCache.data;
  const data = await fetchEveryone();
  everyoneCache = { at: Date.now(), data };
  return data;
}

async function fetchEveryone(): Promise<EveryoneData> {
  const db = createAdminClient();
  const [regs, checkins, done, { data: missions }] = await Promise.all([
    fetchAll<{ profile_id: string; profiles: unknown }>((a, b) =>
      db.from("registrations").select("profile_id, profiles(id, first_name, last_name, mobile, holiday_until, role)").order("profile_id").range(a, b)),
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
  const everyone: Everyone = regs.filter((r) => {
    const p = r.profiles as unknown as (Profile | null);
    return p && p.role !== "staff" && Boolean(p.first_name); // only named, non-staff members are ranked
  }).map((r) => {
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
      strip: weekStrip([], 1, "2000-01-01"), todays: [] as CheckinKind[], podium: mock.podium, leaderboard: mock.leaderboard, club: mock.clubThisWeek, holidayUntil: null as string | null };
  }
  const { everyone, missions } = await loadEveryone();
  const byId = new Map(missions.map((m) => [Number(m.id), m]));
  const statsFor = (e: Everyone[number]) => memberStats(e.checkins, e.done.map((id) => byId.get(id)).filter(Boolean) as Mission[], week);
  // Your own sessions and missions are read fresh, so logging something shows up straight away.
  const db = createAdminClient();
  const [{ data: ownCheckins }, { data: ownDone }] = await Promise.all([
    db.from("checkins").select("day, kind, status").eq("profile_id", profile.id).gte("day", "2026-12-07"),
    db.from("mission_completions").select("mission_id").eq("profile_id", profile.id),
  ]);
  const mine: Everyone[number] = { profile, checkins: (ownCheckins ?? []) as Checkin[], done: (ownDone ?? []).map((d) => Number(d.mission_id)) };
  const ranked = rankEntries(everyone.map((e) => (e.profile.id === profile.id ? mine : e)).map((e) => ({ id: e.profile.id, ...shortName(e.profile.first_name, e.profile.last_name), points: statsFor(e).points })));
  const s = statsFor(mine);
  const meRank = ranked.find((r) => r.id === profile.id);
  const days = sessionDaysByWeek(mine.checkins).get(week) ?? [];
  const pips = days.slice(0, 3).map((d) => KIND_LABEL[mine!.checkins.find((c) => c.day === d && COUNTED.includes(c.kind) && c.status === "confirmed")!.kind]);
  const today = seriesDayNow();
  const now = Date.now();

  return {
    real: true, week, weekInfo: { ...weekInfo(week), sessionsDone: s.sessionsThisWeek, pips, pending: mine.checkins.filter((c) => c.kind === "yard" && c.status === "pending" && weekOfDay(c.day) === week).length }, nextWeek: week < 7 ? weekInfo(week + 1) : null,
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
    strip: weekStrip(mine.checkins, Math.max(week, 1), today),
    todays: mine.checkins.filter((c) => c.day === today).map((c) => c.kind),
    podium: [ranked[1], ranked[0], ranked[2]].filter(Boolean),
    leaderboard: ranked.slice(3, 10),
    club: everyone.filter((e) => (sessionDaysByWeek(e.checkins).get(week)?.length ?? 0) >= 3).length,
    holidayUntil: (profile as Profile & { holiday_until?: string | null }).holiday_until ?? null,
  };
}

export { weekOfDay };

/** The member's own history for the Activity screen (all kinds, newest first). Empty in example mode. */
export async function loadActivity(profile: Profile | null) {
  if (!profile) return { weeks: [] as ReturnType<typeof buildActivity> };
  const db = createAdminClient();
  const [{ data: rows }, { data: done }, { missions }] = await Promise.all([
    db.from("checkins").select("day, kind, status").eq("profile_id", profile.id).order("day"),
    db.from("mission_completions").select("mission_id, created_at").eq("profile_id", profile.id),
    loadEveryone(),
  ]);
  const byId = new Map(missions.map((m) => [Number(m.id), m]));
  const completed: CompletedMission[] = (done ?? []).flatMap((d) => {
    const m = byId.get(Number(d.mission_id));
    return m ? [{ id: m.id, week: m.week, title: m.title, points: m.points, double: m.double, at: alburyDay(new Date(d.created_at as string)) }] : [];
  });
  return { weeks: buildActivity((rows ?? []) as Checkin[], completed) };
}
