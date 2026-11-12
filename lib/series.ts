// Summer Series rules: weeks, points, levels, streaks, leaderboard. Pure functions — no database here.

export const SERIES_START = new Date("2026-12-07T00:00:00+11:00"); // Monday week 1, Albury time
export const SERIES_WEEKS = 7;
const WEEK_MS = 7 * 86_400_000;

export const POINTS = { session: 5, threeOfThree: 20 } as const;

export type CheckinKind = "yard" | "run" | "workout" | "recovery" | "rest";
export const COUNTED: CheckinKind[] = ["yard", "run", "workout"];
export type Checkin = { day: string; kind: CheckinKind; status: "pending" | "confirmed" | "rejected" };
export type Mission = { id: number; week: number; points: number; double: boolean };

export const LEVELS = [
  { no: 1, name: "Show Up", note: "Registered and ready", at: 0 },
  { no: 2, name: "Build Momentum", note: "Unlocked: coffee upgrade", at: 50 },
  { no: 3, name: "Stay Consistent", note: "Unlocked: prize draw entry", at: 100 },
  { no: 4, name: "Maintain the Standard", note: "Unlocks: massage discount", at: 200 },
  { no: 5, name: "Summer Series Legend", note: "Unlocks: Recovery Room session", at: 300 },
];

/** Today's date in Albury as YYYY-MM-DD. */
export function alburyDay(now: Date): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
}

/** Series week (1–7) a YYYY-MM-DD day falls in; 0 before the series, 8+ after. */
export function weekOfDay(day: string): number {
  const t = new Date(`${day}T12:00:00+11:00`).getTime();
  return Math.floor((t - SERIES_START.getTime()) / WEEK_MS) + 1;
}

/** The current week, clamped to 0..7. `previewWeek` lets staff test the series before 7 Dec. */
export function currentWeek(now: Date, previewWeek?: string): number {
  const p = Number(previewWeek);
  if (previewWeek && Number.isInteger(p) && p >= 0 && p <= SERIES_WEEKS) return p;
  const w = Math.floor((now.getTime() - SERIES_START.getTime()) / WEEK_MS) + 1;
  return Math.max(0, Math.min(SERIES_WEEKS, w));
}

/** Counted session days per week: at most one counted session per day; pending Yard sessions don't count yet. */
export function sessionDaysByWeek(checkins: Checkin[]): Map<number, string[]> {
  const days = new Map<number, Set<string>>();
  for (const c of checkins) {
    if (!COUNTED.includes(c.kind) || c.status !== "confirmed") continue;
    const w = weekOfDay(c.day);
    if (w < 1 || w > SERIES_WEEKS) continue;
    if (!days.has(w)) days.set(w, new Set());
    days.get(w)!.add(c.day);
  }
  return new Map([...days].map(([w, s]) => [w, [...s].sort()]));
}

export function levelFor(points: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) if (points >= l.at) level = l;
  const next = LEVELS.find((l) => l.at > points);
  const pct = next ? Math.round(((points - level.at) / (next.at - level.at)) * 100) : 100;
  return { level: level.no, name: level.name, pointsToNext: next ? next.at - points : 0, pct };
}

export function memberStats(checkins: Checkin[], completedMissions: Mission[], week: number) {
  const byWeek = sessionDaysByWeek(checkins);
  let points = 0;
  for (const days of byWeek.values()) {
    points += days.length * POINTS.session;
    if (days.length >= 3) points += POINTS.threeOfThree;
  }
  for (const m of completedMissions) points += m.points * (m.double ? 2 : 1);

  const thisWeekDays = byWeek.get(week)?.length ?? 0;
  // Streak: consecutive 3/3 weeks, counting this week only once it's done.
  let streak = 0;
  for (let w = thisWeekDays >= 3 ? week : week - 1; w >= 1; w--) {
    if ((byWeek.get(w)?.length ?? 0) >= 3) streak++; else break;
  }
  return { points, sessionsThisWeek: Math.min(thisWeekDays, 3), hit3: thisWeekDays >= 3, streak, ...levelFor(points) };
}

export type Ranked = { id: string; name: string; initials: string; points: number; rank: number };

/** "Jess S." — first name and last initial only (privacy). */
export function shortName(first: string | null, last: string | null): { name: string; initials: string } {
  const f = (first ?? "").trim() || "Member";
  const l = (last ?? "").trim();
  return { name: l ? `${f} ${l[0].toUpperCase()}.` : f, initials: (f[0] + (l[0] ?? "")).toUpperCase() };
}

/** Highest points first; equal points share a rank (1, 2, 2, 4). */
export function rankEntries(entries: Omit<Ranked, "rank">[]): Ranked[] {
  const sorted = [...entries].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  return sorted.map((e, i) => ({ ...e, rank: i > 0 && sorted[i - 1].points === e.points ? 0 : i + 1 }))
    .map((e, i, arr) => ({ ...e, rank: e.rank || arr.slice(0, i).reverse().find((x) => x.rank)!.rank }));
}

/** Staff follow-up flags for one member. */
export function followUpFlags(checkins: Checkin[], today: string, holidayUntil: string | null, week: number): string[] {
  if (week < 1) return [];
  if (holidayUntil && holidayUntil >= today) return [`Away until ${holidayUntil}`];
  const counted = checkins.filter((c) => COUNTED.includes(c.kind) && c.status !== "rejected").map((c) => c.day).sort();
  const last = counted.at(-1);
  const flags: string[] = [];
  const daysSince = last ? Math.round((new Date(today).getTime() - new Date(last).getTime()) / 86_400_000) : Infinity;
  if (daysSince >= 7 && today >= alburyDay(new Date(SERIES_START.getTime() + 7 * 86_400_000))) flags.push("No session in 7 days");
  const dow = new Date(`${today}T12:00:00+11:00`).getUTCDay(); // 4 = Thursday
  const thisWeek = counted.filter((d) => weekOfDay(d) === week).length;
  if (thisWeek === 0 && (dow >= 4 || dow === 0)) flags.push("Behind this week");
  return flags;
}
