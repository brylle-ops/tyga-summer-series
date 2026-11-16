import { describe, expect, it } from "vitest";
import { isFresh } from "@/lib/announcements";

const now = new Date("2026-12-10T00:00:00Z");

describe("isFresh", () => {
  it("is fresh under 7 days", () => {
    expect(isFresh("2026-12-04T00:00:01Z", now)).toBe(true);
    expect(isFresh("2026-12-10T00:00:00Z", now)).toBe(true);
  });
  it("is stale at 7 days or more", () => {
    expect(isFresh("2026-12-03T00:00:00Z", now)).toBe(false);
    expect(isFresh("2026-11-01T00:00:00Z", now)).toBe(false);
  });
  it("rejects future and invalid dates", () => {
    expect(isFresh("2026-12-11T00:00:00Z", now)).toBe(false);
    expect(isFresh("nope", now)).toBe(false);
  });
});
