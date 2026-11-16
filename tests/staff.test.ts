import { describe, expect, it } from "vitest";
import { isStaffEmail, staffEmails } from "@/lib/staff";

describe("staff emails", () => {
  it("always includes the built-in owner", () => {
    expect(staffEmails("")).toEqual(["brylle@supersidekick.co"]);
  });
  it("adds env emails, lowercased and trimmed", () => {
    expect(staffEmails(" Sarah@Gym.com , ,amy@x.com ")).toEqual(["brylle@supersidekick.co", "sarah@gym.com", "amy@x.com"]);
  });
  it("matches case-insensitively", () => {
    expect(isStaffEmail("Brylle@SuperSidekick.co", "")).toBe(true);
    expect(isStaffEmail("sarah@gym.com", "SARAH@gym.com")).toBe(true);
  });
  it("rejects emails not listed", () => {
    expect(isStaffEmail("someone@else.com", "")).toBe(false);
  });
});
