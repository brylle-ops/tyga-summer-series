import { PERKS } from "@/lib/perks";
import { COUNTED, memberStats, rankEntries, sessionDaysByWeek, type Checkin, type Mission } from "@/lib/series";

export type DashMember = {
  profile: { id: string; first_name: string | null; last_name: string | null; mobile: string | null };
  checkins: Checkin[];
  done: number[];
};

export type DashRow = {
  id: string; name: string; mobile: string; rank: number; points: number;
  level: number; levelName: string; pointsToNext: number;
  sessionsThisWeek: number; weeksHit3: number; streak: number; lastSession: string | null;
};

export type PerkGroup = {
  key: string; title: string; level: number;
  ready: DashRow[];     // reached the level, not redeemed yet: hand these out
  close: DashRow[];     // one level short and within CLOSE_POINTS of it: worth a nudge
  redeemed: DashRow[];
};

export const CLOSE_POINTS = 25;

const fullName = (f: string | null, l: string | null) => [f, l].filter(Boolean).join(" ").trim() || "Member";

/** Staff view of everyone: ranking, consistency and which members have earned (or nearly earned) each perk. */
export function buildDashboard(everyone: DashMember[], missions: Mission[], week: number, redeemed: Set<string>) {
  const byId = new Map(missions.map((m) => [Number(m.id), m]));
  const base = everyone.map((e) => {
    const stats = memberStats(e.checkins, e.done.map((id) => byId.get(id)).filter(Boolean) as Mission[], week);
    const weeksHit3 = [...sessionDaysByWeek(e.checkins).values()].filter((d) => d.length >= 3).length;
    const last = e.checkins.filter((c) => COUNTED.includes(c.kind) && c.status === "confirmed").map((c) => c.day).sort().at(-1) ?? null;
    return { e, stats, weeksHit3, last, name: fullName(e.profile.first_name, e.profile.last_name) };
  });
  const ranks = new Map(rankEntries(base.map((b) => ({ id: b.e.profile.id, name: b.name, initials: "", points: b.stats.points }))).map((r) => [r.id, r.rank]));
  const rows: DashRow[] = base.map((b) => ({
    id: b.e.profile.id, name: b.name, mobile: b.e.profile.mobile ?? "", rank: ranks.get(b.e.profile.id) ?? 0, points: b.stats.points,
    level: b.stats.level, levelName: b.stats.name, pointsToNext: b.stats.pointsToNext,
    sessionsThisWeek: b.stats.sessionsThisWeek, weeksHit3: b.weeksHit3, streak: b.stats.streak, lastSession: b.last,
  })).sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));

  const perks: PerkGroup[] = PERKS.map((p) => {
    const got = (r: DashRow) => redeemed.has(`${r.id}:${p.key}`);
    return {
      key: p.key, title: p.title, level: p.level,
      ready: rows.filter((r) => r.level >= p.level && !got(r)),
      close: rows.filter((r) => r.level === p.level - 1 && r.pointsToNext <= CLOSE_POINTS),
      redeemed: rows.filter((r) => r.level >= p.level && got(r)),
    };
  });
  const hitThisWeek = rows.filter((r) => r.sessionsThisWeek >= 3).length;
  return {
    rows, perks, hitThisWeek,
    avgPoints: rows.length ? Math.round(rows.reduce((a, r) => a + r.points, 0) / rows.length) : 0,
  };
}

/** CSV cell safe to open in a spreadsheet: quotes escaped, formula characters defused. */
export function csvCell(v: string | number): string {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function leaderboardCsv(rows: DashRow[]): string {
  const head = ["Rank", "Name", "Mobile", "Points", "Level", "Sessions this week", "Weeks at 3/3", "Streak (weeks)", "Last session"];
  const lines = rows.map((r) => [r.rank, r.name, r.mobile, r.points, `${r.level} ${r.levelName}`, r.sessionsThisWeek, r.weeksHit3, r.streak, r.lastSession ?? ""].map(csvCell).join(","));
  return [head.join(","), ...lines].join("\r\n") + "\r\n";
}
