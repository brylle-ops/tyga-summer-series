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
    expect(safeNext("//evil.com")).toBe("/home");
    expect(safeNext("https://evil.com")).toBe("/home");
    expect(safeNext("/\\evil.com")).toBe("/home");
    expect(safeNext(null)).toBe("/home");
  });
});

import { afterEach } from "vitest";
import { allowNonMembers } from "@/lib/env";
describe("allowNonMembers", () => {
  afterEach(() => { delete process.env.ALLOW_NON_MEMBERS; });
  it("accepts true in any reasonable spelling", () => {
    for (const v of ["true", "TRUE", " true ", '"true"', "1", "yes"]) { process.env.ALLOW_NON_MEMBERS = v; expect(allowNonMembers()).toBe(true); }
  });
  it("is off by default and for false", () => {
    expect(allowNonMembers()).toBe(false);
    process.env.ALLOW_NON_MEMBERS = "false"; expect(allowNonMembers()).toBe(false);
  });
});
