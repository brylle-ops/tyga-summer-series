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
});
