import { describe, expect, it } from "vitest";
import { buildActivity, weekStrip } from "@/lib/activity";

const c = (day: string, kind: "yard" | "run" | "workout" | "recovery" | "rest", status: "confirmed" | "pending" = "confirmed") => ({ day, kind, status });

describe("buildActivity", () => {
  it("counts three sessions, adds the weekly bonus, and groups by week", () => {
    const w = buildActivity([c("2026-12-07", "run"), c("2026-12-08", "workout"), c("2026-12-09", "run"), c("2026-12-14", "run")], []);
    expect(w.map((x) => x.week)).toEqual([2, 1]); // newest week first
    const w1 = w[1];
    expect(w1.sessions).toBe(3);
    expect(w1.hit3).toBe(true);
    expect(w1.points).toBe(35);
    expect(w1.items.some((i) => i.state === "bonus")).toBe(true);
  });
  it("only the first counted session each day earns points", () => {
    const [w] = buildActivity([c("2026-12-07", "run"), c("2026-12-07", "workout")], []);
    expect(w.points).toBe(5);
    expect(w.items.filter((i) => i.state === "extra")).toHaveLength(1);
  });
  it("pending yard and recovery earn nothing yet", () => {
    const [w] = buildActivity([c("2026-12-07", "yard", "pending"), c("2026-12-08", "recovery")], []);
    expect(w.points).toBe(0);
    expect(w.items.map((i) => i.state).sort()).toEqual(["logged", "pending"]);
  });
  it("adds mission points, doubled when flagged", () => {
    const [w] = buildActivity([], [{ id: 1, week: 1, title: "Bring a friend", points: 10, double: true, at: "2026-12-08" }]);
    expect(w.points).toBe(20);
  });
});

describe("weekStrip", () => {
  it("marks each day of the week", () => {
    const s = weekStrip([c("2026-12-07", "run"), c("2026-12-08", "yard", "pending"), c("2026-12-09", "rest")], 1, "2026-12-09");
    expect(s.map((d) => d.state)).toEqual(["counted", "pending", "logged", "none", "none", "none", "none"]);
    expect(s[2].today).toBe(true);
    expect(s[3].future).toBe(true);
  });
});
