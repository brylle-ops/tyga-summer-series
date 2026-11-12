import { describe, expect, it } from "vitest";
import { buildSingletGrid, paymentSummary, toSupplierCsv } from "@/lib/admin-report";

const regs = [
  { fit: "women", colour: "cream", size: "M", payment_status: "paid", amount_cents: 1500 },
  { fit: "men", colour: "charcoal", size: "XL", payment_status: "paid", amount_cents: 1500 },
  { fit: "women", colour: "cream", size: "M", payment_status: "pending", amount_cents: null },
  { fit: "women", colour: "cream", size: "S", payment_status: "refunded", amount_cents: 1500 },
] as never[];

describe("admin report", () => {
  it("counts paid only", () => {
    const g = buildSingletGrid(regs);
    expect(g[0]).toEqual({ label: "Women's · Cream", counts: [0, 0, 1, 0, 0, 0, 0], total: 1 });
    expect(g[3].total).toBe(1);
  });
  it("supplier csv", () => {
    expect(toSupplierCsv(buildSingletGrid(regs))).toBe(
      "Fit,Colour,XS,S,M,L,XL,2XL,3XL,Total\r\nWomen's,Cream,0,0,1,0,0,0,0,1\r\nWomen's,Charcoal wash,0,0,0,0,0,0,0,0\r\n" +
      "Men's,Cream,0,0,0,0,0,0,0,0\r\nMen's,Charcoal wash,0,0,0,0,1,0,0,1\r\nTotal,,0,0,1,0,1,0,0,2\r\n");
  });
  it("summary", () => expect(paymentSummary(regs)).toEqual({ paid: 2, pendingOrUnpaid: 1, collectedCents: 3000 }));
});
