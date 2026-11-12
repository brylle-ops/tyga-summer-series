import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPaymentLinkBody, createSummerSeriesCheckout, SquareConfigError } from "@/lib/square";

function okFetch() {
  return vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({ payment_link: { url: "https://sq/pay", order_id: "ORD1" } }), { status: 200 }));
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("square checkout", () => {
  it("builds a $15 AUD quick pay body that returns to /join/confirmed", () => {
    const b = buildPaymentLinkBody({ note: "Women's M · Cream", email: "a@b.com" }, "LOC1", "https://tyga.example", "k");
    expect(b.quick_pay.price_money).toEqual({ amount: 1500, currency: "AUD" });
    expect(b.checkout_options.redirect_url).toBe("https://tyga.example/join/confirmed");
    expect(b.pre_populated_data?.buyer_email).toBe("a@b.com");
  });

  it("uses sandbox by default and production when asked", async () => {
    vi.stubEnv("SQUARE_ACCESS_TOKEN", "t"); vi.stubEnv("SQUARE_LOCATION_ID", "L");
    const f = okFetch(); vi.stubGlobal("fetch", f);
    await expect(createSummerSeriesCheckout({ note: "x" })).resolves.toEqual({ url: "https://sq/pay", orderId: "ORD1" });
    expect(String(f.mock.calls[0][0])).toContain("connect.squareupsandbox.com");
    vi.stubEnv("SQUARE_ENVIRONMENT", "production");
    await createSummerSeriesCheckout({ note: "x" });
    expect(String(f.mock.calls[1][0])).toContain("https://connect.squareup.com/");
  });

  it("reports Square's error code", async () => {
    vi.stubEnv("SQUARE_ACCESS_TOKEN", "t"); vi.stubEnv("SQUARE_LOCATION_ID", "L");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ errors: [{ code: "UNAUTHORIZED", detail: "bad" }] }), { status: 401 })));
    await expect(createSummerSeriesCheckout({ note: "x" })).rejects.toThrow(/401 — UNAUTHORIZED/);
  });

  it("refuses to run without a token", async () => {
    vi.stubEnv("SQUARE_ACCESS_TOKEN", ""); vi.stubEnv("SQUARE_LOCATION_ID", "L");
    await expect(createSummerSeriesCheckout({ note: "x" })).rejects.toBeInstanceOf(SquareConfigError);
  });
});
