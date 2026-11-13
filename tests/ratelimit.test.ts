import { describe, expect, it } from "vitest";
import { LIMITS, requestBlocked, verifyBlocked } from "@/lib/ratelimit-rules";

describe("login limits", () => {
  it("blocks the 6th code request for one email in 10 minutes", () => {
    expect(requestBlocked(LIMITS.requestsPerEmail - 1, 0)).toBe(false);
    expect(requestBlocked(LIMITS.requestsPerEmail, 0)).toBe(true);
  });
  it("blocks a flood across the whole app", () => {
    expect(requestBlocked(0, LIMITS.requestsOverall - 1)).toBe(false);
    expect(requestBlocked(0, LIMITS.requestsOverall)).toBe(true);
  });
  it("blocks code guessing after 10 failures", () => {
    expect(verifyBlocked(9)).toBe(false);
    expect(verifyBlocked(10)).toBe(true);
  });
});
