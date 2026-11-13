import { describe, expect, it } from "vitest";
import { seriesToday, weekOfDay } from "@/lib/series";

describe("seriesToday", () => {
  it("is the real Albury date when not previewing", () => {
    expect(seriesToday(new Date("2026-11-13T02:00:00Z"))).toBe("2026-11-13");
  });
  it("maps the real weekday into the preview week so check-ins count", () => {
    // Fri 13 Nov 2026 in Albury -> Friday of week 1 = 11 Dec
    const d = seriesToday(new Date("2026-11-13T02:00:00Z"), "1");
    expect(d).toBe("2026-12-11");
    expect(weekOfDay(d)).toBe(1);
    expect(weekOfDay(seriesToday(new Date("2026-11-13T02:00:00Z"), "3"))).toBe(3);
  });
  it("ignores a bad preview value", () => {
    expect(seriesToday(new Date("2026-11-13T02:00:00Z"), "abc")).toBe("2026-11-13");
    expect(seriesToday(new Date("2026-11-13T02:00:00Z"), "9")).toBe("2026-11-13");
  });
});
