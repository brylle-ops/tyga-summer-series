import { describe, expect, it } from "vitest";
import { approved, memberStats, type Mission } from "@/lib/series";

describe("mission approvals", () => {
  it("pending ticks do not count; confirmed and old rows (no status) do", () => {
    expect(approved({ status: "pending" })).toBe(false);
    expect(approved({ status: "confirmed" })).toBe(true);
    expect(approved({})).toBe(true);
  });

  it("only approved missions add points", () => {
    const missions = new Map<number, Mission>([[1, { id: 1, week: 1, points: 15, double: false }], [2, { id: 2, week: 1, points: 10, double: false }]]);
    const rows = [{ mission_id: 1, status: "confirmed" }, { mission_id: 2, status: "pending" }];
    const counted = rows.filter(approved).map((r) => missions.get(r.mission_id)!) ;
    expect(memberStats([], counted, 1).points).toBe(15);
  });
});
