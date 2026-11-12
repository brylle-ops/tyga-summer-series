import { describe, expect, it } from "vitest";
import { checkoutBlocker, paymentNote } from "@/lib/checkout";

const before = new Date("2026-11-20T00:00:00Z");
const after = new Date("2026-12-02T00:00:00Z");
const reg = (o = {}) => ({ fit: "women", colour: "cream", size: "M", payment_status: "unpaid", ...o }) as never;

describe("checkoutBlocker", () => {
  it("needs a singlet and size", () => {
    expect(checkoutBlocker(null, before)).toBe("no_singlet");
    expect(checkoutBlocker(reg({ colour: null }), before)).toBe("no_singlet");
    expect(checkoutBlocker(reg({ size: null }), before)).toBe("no_size");
  });
  it("stops paid, never on a date", () => {
    expect(checkoutBlocker(reg({ payment_status: "paid" }), before)).toBe("paid");
    expect(checkoutBlocker(reg(), after)).toBeNull();
  });
  it("lets unpaid and pending through", () => {
    expect(checkoutBlocker(reg(), before)).toBeNull();
    expect(checkoutBlocker(reg({ payment_status: "pending" }), before)).toBeNull();
    expect(checkoutBlocker(reg({ payment_status: "refunded" }), before)).toBeNull();
  });
});

describe("paymentNote", () => {
  it("is #no name · singlet", () => {
    expect(paymentNote({ member_no: 148, first_name: "Jess", last_name: "Smith", email: "j@x.com" } as never, reg() as never))
      .toBe("#148 Jess Smith · Women's M · Cream");
    expect(paymentNote({ member_no: 3, first_name: null, last_name: null, email: "j@x.com" } as never, reg({ fit: "men", colour: "charcoal", size: "XL" }) as never))
      .toBe("#3 j@x.com · Men's XL · Charcoal wash");
  });
});
