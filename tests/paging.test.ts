import { describe, expect, it } from "vitest";
import { fetchAll, groupBy } from "@/lib/paging";

describe("fetchAll", () => {
  it("reads past Supabase's 1,000-row limit", async () => {
    const rows = Array.from({ length: 2345 }, (_, i) => i);
    const got = await fetchAll<number>(async (a, b) => ({ data: rows.slice(a, b + 1), error: null }));
    expect(got.length).toBe(2345);
    expect(got.at(-1)).toBe(2344);
  });
  it("stops on an exact multiple and surfaces errors", async () => {
    const rows = Array.from({ length: 1000 }, (_, i) => i);
    expect((await fetchAll<number>(async (a, b) => ({ data: rows.slice(a, b + 1), error: null }))).length).toBe(1000);
    await expect(fetchAll(async () => ({ data: null, error: { message: "boom" } }))).rejects.toThrow("boom");
  });
});

describe("groupBy", () => {
  it("groups in one pass", () => {
    const g = groupBy([{ p: "a" }, { p: "b" }, { p: "a" }], (r) => r.p);
    expect(g.get("a")?.length).toBe(2);
    expect(g.get("b")?.length).toBe(1);
  });
});
