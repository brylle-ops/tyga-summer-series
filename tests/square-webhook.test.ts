import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { handleSquareWebhook, parseSquareEvent, verifySquareSignature, type WebhookStore } from "@/lib/square-webhook";

const KEY = "sig-key", URL = "https://tyga.example/api/square/webhook";
const sign = (body: string) => createHmac("sha256", KEY).update(URL + body).digest("base64");
const payment = (id: string, order: string, status = "COMPLETED", amount = 1500) =>
  JSON.stringify({ type: "payment.updated", data: { object: { payment: { id, order_id: order, status, amount_money: { amount, currency: "AUD" } } } } });
const refund = (paymentId: string, order: string, status = "COMPLETED") =>
  JSON.stringify({ type: "refund.updated", data: { object: { refund: { id: "R1", payment_id: paymentId, order_id: order, status } } } });

function memStore() {
  const regs = new Map<string, { profile_id: string; payment_status: string; square_payment_id: string | null; amount?: number }>();
  regs.set("ORD1", { profile_id: "p1", payment_status: "pending", square_payment_id: null });
  const recorded: { paymentId: string; duplicate: boolean }[] = [];
  let paidCalls = 0; let race = false;
  const store: WebhookStore = {
    async findRegistrationByOrder(o) { return regs.get(o) ?? null; },
    async markPaid(pid, paymentId, amount) { paidCalls++; if (race) return false; for (const r of regs.values()) if (r.profile_id === pid) Object.assign(r, { payment_status: "paid", square_payment_id: paymentId, amount }); return true; },
    async markRefunded(pid) { for (const r of regs.values()) if (r.profile_id === pid) r.payment_status = "refunded"; },
    async recordPayment(p) { recorded.push({ paymentId: p.paymentId, duplicate: p.duplicate }); },
  };
  return { store, regs, recorded, paid: () => paidCalls, setRace: () => { race = true; } };
}
const run = (body: string, s: ReturnType<typeof memStore>, sig: string | null = sign(body)) =>
  handleSquareWebhook(body, sig, { store: s.store, key: KEY, url: URL });

describe("signature", () => {
  it("accepts a correct signature only", () => {
    const b = payment("P1", "ORD1");
    expect(verifySquareSignature(b, sign(b), URL, KEY)).toBe(true);
    expect(verifySquareSignature(b + " ", sign(b), URL, KEY)).toBe(false);
    expect(verifySquareSignature(b, null, URL, KEY)).toBe(false);
    expect(verifySquareSignature(b, "short", URL, KEY)).toBe(false);
  });
});

describe("parseSquareEvent", () => {
  it("reads payments and refunds, ignores the rest", () => {
    expect(parseSquareEvent(JSON.parse(payment("P1", "ORD1")))).toEqual({ kind: "payment", paymentId: "P1", orderId: "ORD1", status: "COMPLETED", amountCents: 1500 });
    expect(parseSquareEvent(JSON.parse(refund("P1", "ORD1")))).toEqual({ kind: "refund", paymentId: "P1", orderId: "ORD1", status: "COMPLETED" });
    expect(parseSquareEvent({ type: "order.updated", data: {} })).toBeNull();
    expect(parseSquareEvent(null)).toBeNull();
  });
});

describe("handleSquareWebhook", () => {
  it("rejects bad signatures", async () => {
    const s = memStore(); const b = payment("P1", "ORD1");
    expect(await run(b, s, sign(b + "x"))).toEqual({ status: 401 });
    expect(await run(b, s, null)).toEqual({ status: 401 });
    expect(s.paid()).toBe(0);
  });
  it("marks a completed payment paid, once", async () => {
    const s = memStore(); const b = payment("P1", "ORD1");
    expect(await run(b, s)).toEqual({ status: 200 });
    expect(await run(b, s)).toEqual({ status: 200 });
    expect(s.paid()).toBe(1);
    expect(s.regs.get("ORD1")).toMatchObject({ payment_status: "paid", square_payment_id: "P1", amount: 1500 });
  });
  it("records a second payment on a paid order as a duplicate", async () => {
    const s = memStore();
    await run(payment("P1", "ORD1"), s);
    await run(payment("P2", "ORD1"), s);
    expect(s.regs.get("ORD1")?.square_payment_id).toBe("P1");
    expect(s.recorded.at(-1)).toEqual({ paymentId: "P2", duplicate: true });
  });
  it("doesn't mark unfinished payments paid", async () => {
    const s = memStore();
    await run(payment("P1", "ORD1", "APPROVED"), s);
    await run(payment("P1", "ORD1", "PENDING"), s);
    expect(s.paid()).toBe(0);
  });
  it("records unknown orders without failing", async () => {
    const s = memStore();
    expect(await run(payment("P9", "NOPE"), s)).toEqual({ status: 200 });
    expect(s.recorded).toEqual([{ paymentId: "P9", duplicate: false }]);
  });
  it("refunds", async () => {
    const s = memStore();
    await run(payment("P1", "ORD1"), s);
    await run(refund("P1", "ORD1"), s);
    expect(s.regs.get("ORD1")?.payment_status).toBe("refunded");
  });
  it("ignores a refund of the duplicate payment", async () => {
    const s = memStore();
    await run(payment("P1", "ORD1"), s);
    await run(payment("P2", "ORD1"), s);
    await run(refund("P2", "ORD1"), s);
    expect(s.regs.get("ORD1")?.payment_status).toBe("paid");
  });
  it("doesn't mark an underpayment paid", async () => {
    const s = memStore();
    await run(payment("P1", "ORD1", "COMPLETED", 100), s);
    expect(s.paid()).toBe(0);
  });
  it("flags the loser of two simultaneous payments", async () => {
    const s = memStore(); s.setRace();
    await run(payment("P2", "ORD1"), s);
    expect(s.recorded).toEqual([{ paymentId: "P2", duplicate: true }]);
  });
  it("ignores other events", async () => {
    const s = memStore(); const b = JSON.stringify({ type: "order.updated", data: {} });
    expect(await run(b, s)).toEqual({ status: 200 });
  });
});
