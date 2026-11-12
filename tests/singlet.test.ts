import { describe, expect, it } from "vitest";
import { fromUiFit, isGoal, isSingletLocked, parseSingletInput, singletLabel, toUiFit } from "@/lib/singlet";

describe("singlet rules", () => {
  it("locks at midnight AEDT on 1 Dec", () => {
    expect(isSingletLocked(new Date("2026-11-30T12:59:59Z"))).toBe(false); // 23:59:59 AEDT
    expect(isSingletLocked(new Date("2026-11-30T13:00:00Z"))).toBe(true);  // 00:00 1 Dec AEDT
  });
  it("labels", () => {
    expect(singletLabel("women", "cream", "M")).toBe("Women's M · Cream");
    expect(singletLabel("men", "charcoal", "XL")).toBe("Men's XL · Charcoal wash");
    expect(singletLabel("women", "cream")).toBe("Women's · Cream");
  });
  it("parses the singlet form", () => {
    const f = (o: Record<string, string>) => { const d = new FormData(); Object.entries(o).forEach(([k, v]) => d.set(k, v)); return d; };
    expect(parseSingletInput(f({ fit: "mens", colour: "cream", size: "XL" }))).toEqual({ fit: "men", colour: "cream", size: "XL" });
    expect(parseSingletInput(f({ fit: "women", colour: "charcoal", size: "2XL" }))).toEqual({ fit: "women", colour: "charcoal", size: "2XL" });
    expect(parseSingletInput(f({ fit: "kids", colour: "cream", size: "M" }))).toBeNull();
    expect(parseSingletInput(f({ fit: "women", size: "M" }))).toBeNull();
    expect(parseSingletInput(f({ fit: "women", colour: "cream", size: "XXL" }))).toBeNull();
  });
  it("maps the runner's fit names", () => {
    expect(fromUiFit("womens")).toBe("women"); expect(toUiFit("men")).toBe("mens");
  });
  it("only the four goals", () => {
    expect(isGoal("Keep my strength")).toBe(true);
    expect(isGoal("keep my strength")).toBe(false);
    expect(isGoal("Get rich")).toBe(false);
  });
});
