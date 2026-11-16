import { describe, expect, it } from "vitest";
import { canEnterDraw, canRedeem, isReleased, rankWeek, rewardState, type MemberRewardCtx, type Reward } from "@/lib/rewards";

const r = (o: Partial<Reward> = {}): Reward => ({
  id: 1, week: 2, kind: "discount", title: "10% off", partner: "", description: "", eligibility: "", how_to: "",
  code: null, image_url: null, expires_on: "2027-01-26", winners_count: 1, published: true, ...o,
});
const ctx = (o: Partial<MemberRewardCtx> = {}): MemberRewardCtx => ({ week: 2, today: "2026-12-15", entered: new Set(), won: new Map(), redeemed: new Set(), ...o });

describe("rewardState", () => {
  it("is locked until the Monday arrives and staff have published it", () => {
    expect(rewardState(r({ week: 3 }), ctx({ week: 2 }))).toBe("locked");
    expect(rewardState(r({ published: false }), ctx())).toBe("locked");
    expect(rewardState(r(), ctx({ week: 0 }))).toBe("locked");
    expect(isReleased(r(), 2)).toBe(true);
  });
  it("is available once released, with no points needed", () => {
    expect(rewardState(r(), ctx())).toBe("available");
  });
  it("draw: entered, then unlocked when won and announced, then redeemed when collected", () => {
    const draw = r({ kind: "draw" });
    expect(rewardState(draw, ctx({ entered: new Set([1]) }))).toBe("entered");
    expect(rewardState(draw, ctx({ won: new Map([[1, { announced: false, collected: false }]]) }))).toBe("available"); // not announced yet
    expect(rewardState(draw, ctx({ won: new Map([[1, { announced: true, collected: false }]]) }))).toBe("unlocked");
    expect(rewardState(draw, ctx({ won: new Map([[1, { announced: true, collected: true }]]) }))).toBe("redeemed");
  });
  it("discount: redeemed when used, expired after its date", () => {
    expect(rewardState(r(), ctx({ redeemed: new Set([1]) }))).toBe("redeemed");
    expect(rewardState(r({ expires_on: "2026-12-14" }), ctx())).toBe("expired");
    expect(rewardState(r({ expires_on: "2026-12-14" }), ctx({ redeemed: new Set([1]) }))).toBe("redeemed");
  });
});

describe("actions", () => {
  it("one entry per member, and only while the draw is open", () => {
    const draw = r({ kind: "draw" });
    expect(canEnterDraw(draw, ctx(), false)).toBe(true);
    expect(canEnterDraw(draw, ctx({ entered: new Set([1]) }), false)).toBe(false);
    expect(canEnterDraw(draw, ctx(), true)).toBe(false);
    expect(canEnterDraw(r({ week: 3 }), ctx(), false)).toBe(false);
  });
  it("only discounts and partner offers can be marked used", () => {
    expect(canRedeem(r(), ctx())).toBe(true);
    expect(canRedeem(r({ kind: "draw" }), ctx())).toBe(false);
    expect(canRedeem(r(), ctx({ redeemed: new Set([1]) }))).toBe(false);
  });
});

describe("rankWeek", () => {
  const s = (id: string, points: number, sessions = 3) => ({ id, name: id.toUpperCase(), points, sessions });
  it("takes the top N by points and ignores members with no points", () => {
    const w = rankWeek([s("a", 30), s("b", 45), s("c", 0), s("d", 15)], 2);
    expect(w.rows.map((x) => [x.id, x.inTop])).toEqual([["b", true], ["a", true], ["d", false]]);
    expect(w.tiedAtCutoff).toEqual([]);
  });
  it("breaks ties by sessions that week", () => {
    const w = rankWeek([s("a", 30, 3), s("b", 30, 5)], 1);
    expect(w.rows[0].id).toBe("b");
    expect(w.tiedAtCutoff).toEqual([]);
  });
  it("flags a tie that straddles the cutoff for staff to decide", () => {
    const w = rankWeek([s("a", 50), s("b", 30), s("c", 30)], 2);
    expect(w.tiedAtCutoff.sort()).toEqual(["b", "c"]);
  });
});
