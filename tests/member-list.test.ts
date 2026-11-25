import { describe, expect, it } from "vitest";
import { memberList } from "@/lib/member-list";

const people = [
  { id: "1", first_name: "Alex", last_name: "Reed", email: "alex@x.com", blocked_at: null },
  { id: "2", first_name: "Sam", last_name: "Reed", email: "sam@x.com", blocked_at: "2026-11-26T00:00:00Z" },
  { id: "3", first_name: null, last_name: null, email: "new@x.com" },
];
const ids = (blocked: boolean, q = "") => memberList(people, blocked, q).map((p) => p.id);

describe("memberList", () => {
  it("keeps blocked members out of the main list", () => {
    expect(ids(false)).toEqual(["1", "3"]);
  });
  it("shows only blocked members in the blocked view", () => {
    expect(ids(true)).toEqual(["2"]);
  });
  it("searches name or email within the chosen view", () => {
    expect(ids(false, " reed ")).toEqual(["1"]);
    expect(ids(true, "SAM@")).toEqual(["2"]);
    expect(ids(true, "alex")).toEqual([]);
  });
});
