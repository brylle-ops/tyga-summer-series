import { describe, expect, it } from "vitest";
import { alburyDay, currentWeek, followUpFlags, levelFor, memberStats, rankEntries, shortName, weekOfDay, type Checkin } from "@/lib/series";

const c = (day: string, kind: Checkin["kind"] = "run", status: Checkin["status"] = "confirmed"): Checkin => ({ day, kind, status });

describe("weeks", () => {
  it("week boundaries are Monday midnight Albury time", () => {
    expect(weekOfDay("2026-12-06")).toBe(0);
    expect(weekOfDay("2026-12-07")).toBe(1);
    expect(weekOfDay("2026-12-13")).toBe(1);
    expect(weekOfDay("2026-12-14")).toBe(2);
    expect(currentWeek(new Date("2026-12-06T12:59:59Z"))).toBe(0); // 23:59:59 Sun AEDT
    expect(currentWeek(new Date("2026-12-06T13:00:00Z"))).toBe(1);
    expect(currentWeek(new Date("2027-03-01T00:00:00Z"))).toBe(7);
    expect(currentWeek(new Date("2026-11-12T00:00:00Z"), "3")).toBe(3);
    expect(currentWeek(new Date("2026-11-12T00:00:00Z"), "nope")).toBe(0);
  });
  it("albury day", () => expect(alburyDay(new Date("2026-12-07T13:30:00Z"))).toBe("2026-12-08"));
});

describe("points", () => {
  it("5 per session, one per day, pending yard doesn't count, +20 for 3/3", () => {
    const s = memberStats([
      c("2026-12-07"), c("2026-12-07", "workout"), // same day → one
      c("2026-12-08", "yard", "pending"),           // not yet
      c("2026-12-09", "yard"), c("2026-12-10"),
      c("2026-12-11", "recovery"), c("2026-12-12", "rest"),
    ], [], 1);
    expect(s.points).toBe(3 * 5 + 20);
    expect(s.sessionsThisWeek).toBe(3);
    expect(s.hit3).toBe(true);
    expect(s.streak).toBe(1);
  });
  it("missions add points, doubled when marked double", () => {
    expect(memberStats([], [{ id: 1, week: 1, points: 10, double: false }, { id: 2, week: 1, points: 20, double: true }], 1).points).toBe(50);
  });
  it("streak counts back from last week until a miss", () => {
    const three = (a: string, b: string, d: string) => [c(a), c(b), c(d)];
    const s = memberStats([...three("2026-12-07", "2026-12-08", "2026-12-09"), ...three("2026-12-14", "2026-12-15", "2026-12-16"), c("2026-12-21")], [], 3);
    expect(s.streak).toBe(2);
    expect(s.sessionsThisWeek).toBe(1);
  });
  it("levels", () => {
    expect(levelFor(0)).toMatchObject({ level: 1, pointsToNext: 50, pct: 0 });
    expect(levelFor(115)).toMatchObject({ level: 3, pointsToNext: 85, pct: 15 });
    expect(levelFor(400)).toMatchObject({ level: 5, pointsToNext: 0, pct: 100 });
  });
});

describe("leaderboard", () => {
  it("short names only", () => {
    expect(shortName("jess", "smith")).toEqual({ name: "jess S.", initials: "JS" });
    expect(shortName(null, null)).toEqual({ name: "Member", initials: "M" });
  });
  it("ties share a rank", () => {
    const r = rankEntries([{ id: "a", name: "A", initials: "A", points: 10 }, { id: "b", name: "B", initials: "B", points: 30 }, { id: "c", name: "C", initials: "C", points: 10 }, { id: "d", name: "D", initials: "D", points: 5 }]);
    expect(r.map((x) => [x.id, x.rank])).toEqual([["b", 1], ["a", 2], ["c", 2], ["d", 4]]);
  });
});

describe("follow-ups", () => {
  it("away members aren't chased", () => expect(followUpFlags([], "2026-12-24", "2026-12-30", 3)).toEqual(["Away until 2026-12-30"]));
  it("no session in 7 days and behind by Thursday", () =>
    expect(followUpFlags([c("2026-12-10")], "2026-12-24", null, 3)).toEqual(["No session in 7 days", "Behind this week"]));
  it("quiet before the series", () => expect(followUpFlags([], "2026-11-20", null, 0)).toEqual([]));
});
