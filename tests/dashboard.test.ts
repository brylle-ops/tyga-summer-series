import { describe, expect, it } from "vitest";
import { buildDashboard, csvCell, leaderboardCsv, type DashMember } from "@/lib/dashboard";

const mem = (id: string, first: string, days: string[], done: number[] = []): DashMember => ({
  profile: { id, first_name: first, last_name: "Smith", mobile: "0400" },
  checkins: days.map((day) => ({ day, kind: "run" as const, status: "confirmed" as const })), done,
});
const WEEK1 = ["2026-12-07", "2026-12-08", "2026-12-09"]; // 3 sessions = 15 + 20 bonus = 35 pts
const missions = [{ id: 1, week: 1, points: 60, double: false }];

describe("buildDashboard", () => {
  const everyone = [mem("a", "Amy", WEEK1, [1]), mem("b", "Bo", WEEK1), mem("c", "Cy", [])];
  const d = buildDashboard(everyone, missions, 1, new Set());

  it("ranks by points and counts consistency", () => {
    expect(d.rows.map((r) => [r.name, r.points, r.rank])).toEqual([["Amy Smith", 95, 1], ["Bo Smith", 35, 2], ["Cy Smith", 0, 3]]);
    expect(d.rows[0].weeksHit3).toBe(1);
    expect(d.hitThisWeek).toBe(2);
    expect(d.avgPoints).toBe(43);
  });
  it("finds who has earned or nearly earned each perk", () => {
    const coffee = d.perks.find((p) => p.key === "coffee")!; // level 2 = 50 pts
    expect(coffee.ready.map((r) => r.name)).toEqual(["Amy Smith"]);
    const draw = d.perks.find((p) => p.key === "draw")!;     // level 3 = 100 pts; Amy is 5 short
    expect(draw.close.map((r) => r.name)).toEqual(["Amy Smith"]);
    expect(draw.ready).toEqual([]);
  });
  it("moves redeemed perks out of the ready list", () => {
    const r = buildDashboard(everyone, missions, 1, new Set(["a:coffee"])).perks.find((p) => p.key === "coffee")!;
    expect(r.ready).toEqual([]);
    expect(r.redeemed.map((x) => x.name)).toEqual(["Amy Smith"]);
  });
});

describe("csv", () => {
  it("escapes quotes and defuses formulas", () => {
    expect(csvCell('Jo "J" Smith')).toBe('"Jo ""J"" Smith"');
    expect(csvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(csvCell("a,b")).toBe('"a,b"');
  });
  it("has a header and one line per member", () => {
    const rows = buildDashboard([mem("a", "Amy", WEEK1)], [], 1, new Set()).rows;
    const lines = leaderboardCsv(rows).trim().split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^Rank,Name,Mobile,Points/);
  });
});
