import { describe, expect, it, vi } from "vitest";
import { checkMembership, safeNext } from "@/lib/signin";

const jess = { email: "jess@x.com", first_name: "Jess", last_name: "S", mobile: "" };

describe("checkMembership", () => {
  it("normalises before looking up", async () => {
    const lookup = vi.fn(async () => jess);
    expect(await checkMembership(" JESS@x.com", lookup)).toEqual({ status: "member", member: jess });
    expect(lookup).toHaveBeenCalledWith("jess@x.com");
  });
  it("unknown email is not a member", async () => {
    expect(await checkMembership("who@x.com", async () => null)).toEqual({ status: "not_member", email: "who@x.com" });
  });
  it("invalid email never hits the lookup", async () => {
    const lookup = vi.fn(async () => null);
    expect(await checkMembership("nope", lookup)).toEqual({ status: "invalid" });
    expect(lookup).not.toHaveBeenCalled();
  });
  it("non-members pass when sign-ups are open to everyone", async () => {
    expect(await checkMembership("who@x.com", async () => null, { allowNonMembers: true }))
      .toEqual({ status: "member", member: { email: "who@x.com", first_name: "", last_name: "", mobile: "" } });
  });
});

describe("safeNext", () => {
  it("allows same-site paths only", () => {
    expect(safeNext("/join/commit")).toBe("/join/commit");
    expect(safeNext("//evil.com")).toBe("/join/commit");
    expect(safeNext("https://evil.com")).toBe("/join/commit");
    expect(safeNext("/\\evil.com")).toBe("/join/commit");
    expect(safeNext(null)).toBe("/join/commit");
  });
});
