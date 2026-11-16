import { describe, expect, it } from "vitest";
import { buildRetention, lastSessionLabel, type RetentionProfile } from "@/lib/retention";

const today = "2026-12-20";
const p = (id: string, o: Partial<RetentionProfile> = {}): RetentionProfile => ({
  id, first_name: id, last_name: "X", role: "member", holiday_until: null, created_at: "2026-12-01T00:00:00Z", ...o,
});
const s = (profile_id: string, day: string) => ({ profile_id, day });

describe("buildRetention", () => {
  it("treats 7 days ago as active and 8 days ago as quiet", () => {
    const r = buildRetention([p("a"), p("b")], [s("a", "2026-12-13"), s("b", "2026-12-12")], today);
    expect(r.rows.map((x) => x.id)).toEqual(["b"]);
    expect(r.active).toBe(1);
    expect(r.rows[0].daysAgo).toBe(8);
  });
  it("uses the latest session", () => {
    const r = buildRetention([p("a")], [s("a", "2026-12-01"), s("a", "2026-12-19")], today);
    expect(r.needAttention).toBe(0);
  });
  it("flags never-logged members only after 3 days since joining", () => {
    const r = buildRetention([p("old", { created_at: "2026-12-16T00:00:00Z" }), p("new", { created_at: "2026-12-17T00:00:00Z" })], [], today);
    expect(r.rows.map((x) => x.id)).toEqual(["old"]);
    expect(lastSessionLabel(r.rows[0])).toBe("Never logged");
  });
  it("ignores unnamed never-logged accounts but shows 'Unnamed member' for quiet ones", () => {
    const r = buildRetention([p("a", { first_name: null, last_name: null }), p("b", { first_name: null, last_name: null })], [s("b", "2026-12-01")], today);
    expect(r.rows.map((x) => [x.id, x.name])).toEqual([["b", "Unnamed member"]]);
  });
  it("excludes staff and members on holiday", () => {
    const r = buildRetention([p("st", { role: "staff" }), p("h", { holiday_until: "2026-12-20" }), p("h2", { holiday_until: "2026-12-19" })], [], today);
    expect(r.rows.map((x) => x.id)).toEqual(["h2"]);
    expect(r.members).toBe(2);
  });
  it("sorts longest quiet first, mixing never-logged by days since joining", () => {
    const r = buildRetention(
      [p("a"), p("b"), p("c", { created_at: "2026-12-08T00:00:00Z" })],
      [s("a", "2026-12-05"), s("b", "2026-12-10")], today);
    expect(r.rows.map((x) => x.id)).toEqual(["a", "c", "b"]);
  });
  it("formats the label", () => {
    expect(lastSessionLabel({ lastSession: "2026-12-08", daysAgo: 9 })).toBe("Last session: Tue 8 Dec (9 days ago)");
  });

  it("counts from the series start for people who joined earlier, with a 3-day grace", () => {
    const early = [p("n", { created_at: "2026-11-05T00:00:00Z" })];
    expect(buildRetention(early, [], "2026-12-09").rows).toEqual([]);
    expect(buildRetention(early, [], "2026-12-10").rows).toEqual([]);
    const r = buildRetention(early, [], "2026-12-11");
    expect(r.rows.map((x) => x.quietDays)).toEqual([4]);
  });
  it("counts from the join date for people who joined after the start", () => {
    const late = [p("n", { created_at: "2026-12-12T00:00:00Z" })];
    expect(buildRetention(late, [], "2026-12-15").rows).toEqual([]);
    expect(buildRetention(late, [], "2026-12-16").rows.length).toBe(1);
  });
  it("a pending-only session counts as activity", () => {
    const r = buildRetention([p("a")], [s("a", "2026-12-19")], today);
    expect(r.active).toBe(1);
    expect(r.needAttention).toBe(0);
  });
  it("holiday ending yesterday with a recent session is active, not flagged", () => {
    const r = buildRetention([p("a", { holiday_until: "2026-12-19" })], [s("a", "2026-12-18")], today);
    expect(r.active).toBe(1);
    expect(r.rows).toEqual([]);
  });

  it("before the series starts, lists named sign-ups as waiting, newest first, with no alarms", () => {
    const r = buildRetention(
      [p("a", { created_at: "2026-11-01T00:00:00Z" }), p("b", { created_at: "2026-11-10T00:00:00Z" }), p("u", { first_name: null }),
        p("st", { role: "staff" }), p("h", { holiday_until: "2026-12-01" })], [], "2026-11-17");
    expect(r.started).toBe(false);
    expect(r.waiting.map((x) => x.id)).toEqual(["b", "a"]);
    expect(r.waiting[0].joined).toBe("2026-11-10");
    expect(r.needAttention).toBe(0);
    expect(r.rows).toEqual([]);
  });
  it("splits quiet, never-logged and active groups once started", () => {
    const r = buildRetention([p("q"), p("n", { created_at: "2026-12-01T00:00:00Z" }), p("a")], [s("q", "2026-12-01"), s("a", "2026-12-19")], "2026-12-20");
    expect(r.quiet.map((x) => x.id)).toEqual(["q"]);
    expect(r.never.map((x) => x.id)).toEqual(["n"]);
    expect(r.activeRows.map((x) => x.id)).toEqual(["a"]);
    expect(r.waiting).toEqual([]);
  });
});
