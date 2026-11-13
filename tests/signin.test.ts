import { describe, expect, it } from "vitest";
import { normaliseCode, safeNext } from "@/lib/signin";

describe("safeNext", () => {
  it("allows same-site paths only", () => {
    expect(safeNext("/join/commit")).toBe("/join/commit");
    expect(safeNext("//evil.com")).toBe("/home");
    expect(safeNext("https://evil.com")).toBe("/home");
    expect(safeNext("/\\evil.com")).toBe("/home");
    expect(safeNext("/\t/evil.com")).toBe("/home");
    expect(safeNext(null)).toBe("/home");
  });
});

describe("normaliseCode", () => {
  it("keeps 6-10 digits, ignores spaces", () => {
    expect(normaliseCode(" 123 456 ")).toBe("123456");
    expect(normaliseCode("12345")).toBeNull();
    expect(normaliseCode("12ab56")).toBeNull();
    expect(normaliseCode("")).toBeNull();
  });
});
