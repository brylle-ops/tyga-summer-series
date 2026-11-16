import { describe, expect, it } from "vitest";
import { isUuid, memberSearchFilter, parseKind, sanitiseSearch } from "@/lib/staff-checkin";

describe("staff check-in helpers", () => {
  it("strips filter syntax and wildcards", () => {
    expect(sanitiseSearch("amy),email.ilike.%")).toBe("amy email.ilike.");
    expect(sanitiseSearch("a%b*c_d(e)f,g")).toBe("a b c_d e f g");
    expect(sanitiseSearch(undefined)).toBe("");
  });
  it("caps length at 40", () => { expect(sanitiseSearch("x".repeat(100))).toHaveLength(40); });
  it("returns no filter for empty or junk-only input", () => {
    expect(memberSearchFilter("  %,() ")).toBeNull();
    expect(memberSearchFilter("Amy")).toBe("first_name.ilike.%Amy%,last_name.ilike.%Amy%,email.ilike.%Amy%");
  });
  it("never lets input add filter clauses", () => {
    const f = memberSearchFilter("x,role.eq.staff")!;
    expect(f.split(",")).toHaveLength(3);
  });
  it("validates uuid and kind", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("----------------------------------")).toBe(false);
    expect(parseKind("yard")).toBe("yard");
    expect(parseKind("swim")).toBeNull();
    expect(parseKind(null)).toBeNull();
  });
});
