import { COUNTED, POINTS, SERIES_START, weekOfDay, type Checkin, type CheckinKind } from "@/lib/series";

// The member's own history, Strava-style: a week strip plus a feed of everything they logged, newest first.

export type FeedState = "counted" | "pending" | "logged" | "extra" | "bonus" | "mission";
export type FeedItem = { id: string; day: string; kind: CheckinKind | "bonus" | "mission"; title: string; detail: string; points: number; state: FeedState };
export type WeekFeed = { week: number; label: string; sessions: number; points: number; hit3: boolean; items: FeedItem[] };
export type StripDay = { label: string; day: string; state: "counted" | "pending" | "logged" | "none"; today: boolean; future: boolean };
export type CompletedMission = { id: number; week: number; title: string; points: number; double: boolean; at: string };

const TITLE: Record<CheckinKind, string> = { yard: "Yard session", run: "Run", workout: "Workout", recovery: "Recovery", rest: "Rest day" };
const ZONE = "Australia/Sydney";

export const dayLabel = (day: string) =>
  new Date(`${day}T12:00:00+11:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: ZONE });

/** "7–13 Dec" for a series week. */
export function weekRange(week: number): string {
  const start = new Date(SERIES_START.getTime() + (week - 1) * 7 * 86_400_000 + 12 * 3_600_000);
  const end = new Date(start.getTime() + 6 * 86_400_000);
  const d = (x: Date, m: boolean) => x.toLocaleDateString("en-AU", { day: "numeric", ...(m ? { month: "short" } : {}), timeZone: ZONE });
  return `${d(start, false)}–${d(end, true)}`;
}

/** Everything the member logged, grouped by series week. Only the first counted session each day earns points. */
export function buildActivity(checkins: Checkin[], missions: CompletedMission[]): WeekFeed[] {
  const sorted = [...checkins].sort((a, b) => a.day.localeCompare(b.day) || a.kind.localeCompare(b.kind));
  const weeks = new Map<number, WeekFeed>();
  const feed = (w: number): WeekFeed => {
    if (!weeks.has(w)) weeks.set(w, { week: w, label: `Week ${w} · ${weekRange(w)}`, sessions: 0, points: 0, hit3: false, items: [] });
    return weeks.get(w)!;
  };
  const countedDays = new Set<string>();
  for (const c of sorted) {
    if (c.status === "rejected") continue;
    const w = weekOfDay(c.day);
    if (w < 1) continue;
    const f = feed(w);
    const id = `${c.day}:${c.kind}`;
    if (!COUNTED.includes(c.kind)) {
      f.items.push({ id, day: c.day, kind: c.kind, title: TITLE[c.kind], detail: "Logged, doesn't count to 3/3", points: 0, state: "logged" });
    } else if (c.status === "pending") {
      f.items.push({ id, day: c.day, kind: c.kind, title: TITLE[c.kind], detail: "Waiting for the class roster to confirm", points: 0, state: "pending" });
    } else if (countedDays.has(c.day)) {
      f.items.push({ id, day: c.day, kind: c.kind, title: TITLE[c.kind], detail: "Already counted today. One session a day counts", points: 0, state: "extra" });
    } else {
      countedDays.add(c.day);
      f.sessions += 1;
      f.points += POINTS.session;
      f.items.push({ id, day: c.day, kind: c.kind, title: TITLE[c.kind], detail: "Counts to your 3 a week", points: POINTS.session, state: "counted" });
      if (f.sessions === 3) {
        f.hit3 = true;
        f.points += POINTS.threeOfThree;
        f.items.push({ id: `${c.day}:bonus`, day: c.day, kind: "bonus", title: "3 of 3 this week", detail: "Weekly bonus", points: POINTS.threeOfThree, state: "bonus" });
      }
    }
  }
  for (const m of missions) {
    const f = feed(m.week);
    const pts = m.points * (m.double ? 2 : 1);
    f.points += pts;
    f.items.push({ id: `m${m.id}`, day: m.at, kind: "mission", title: m.title, detail: m.double ? "Mission · double points" : "Mission completed", points: pts, state: "mission" });
  }
  for (const f of weeks.values()) f.items.sort((a, b) => b.day.localeCompare(a.day) || (a.state === "bonus" ? -1 : 0));
  return [...weeks.values()].sort((a, b) => b.week - a.week);
}

/** Mon–Sun for one series week: what was logged on each day. */
export function weekStrip(checkins: Checkin[], week: number, today: string): StripDay[] {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  return labels.map((label, i) => {
    const t = SERIES_START.getTime() + ((Math.max(week, 1) - 1) * 7 + i) * 86_400_000 + 12 * 3_600_000;
    const day = new Date(t).toLocaleDateString("en-CA", { timeZone: ZONE });
    const here = checkins.filter((c) => c.day === day && c.status !== "rejected");
    const state: StripDay["state"] = here.some((c) => COUNTED.includes(c.kind) && c.status === "confirmed") ? "counted"
      : here.some((c) => COUNTED.includes(c.kind)) ? "pending" : here.length ? "logged" : "none";
    return { label, day, state, today: day === today, future: day > today };
  });
}
