import { createHmac, timingSafeEqual } from "node:crypto";

const PRICE_CENTS = 1500;

/** Square signs each webhook: base64 HMAC-SHA256 of (notification URL + raw body) with the subscription's key. */
export function verifySquareSignature(rawBody: string, signature: string | null, notificationUrl: string, signatureKey: string): boolean {
  if (!signature || !signatureKey) return false;
  const expected = createHmac("sha256", signatureKey).update(notificationUrl + rawBody).digest();
  const given = Buffer.from(signature, "base64");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export type PaymentEvent =
  | { kind: "payment"; paymentId: string; orderId: string; status: string; amountCents: number }
  | { kind: "refund"; paymentId: string; orderId: string; status: string };

export function parseSquareEvent(body: unknown): PaymentEvent | null {
  const b = body as { type?: string; data?: { object?: Record<string, Record<string, unknown>> } } | null;
  const obj = b?.data?.object;
  if (b?.type === "payment.created" || b?.type === "payment.updated") {
    const p = obj?.payment as { id?: string; order_id?: string; status?: string; amount_money?: { amount?: number } } | undefined;
    if (!p?.id || !p.order_id) return null;
    return { kind: "payment", paymentId: p.id, orderId: p.order_id, status: String(p.status), amountCents: Number(p.amount_money?.amount ?? 0) };
  }
  if (b?.type === "refund.created" || b?.type === "refund.updated") {
    const r = obj?.refund as { payment_id?: string; order_id?: string; status?: string } | undefined;
    if (!r?.payment_id || !r.order_id) return null;
    return { kind: "refund", paymentId: r.payment_id, orderId: r.order_id, status: String(r.status) };
  }
  return null;
}

export interface WebhookStore {
  findRegistrationByOrder(orderId: string): Promise<{ profile_id: string; payment_status: string; square_payment_id: string | null } | null>;
  /** Marks paid only if not already paid; returns false if someone else's payment got there first. */
  markPaid(profileId: string, paymentId: string, amountCents: number): Promise<boolean>;
  markRefunded(profileId: string): Promise<void>;
  recordPayment(p: { paymentId: string; orderId: string; status: string; amountCents: number; duplicate: boolean }): Promise<void>;
}

/** Applies one Square webhook. Safe to receive the same event twice, late, or for an order we don't know. */
export async function handleSquareWebhook(
  rawBody: string, signature: string | null, deps: { store: WebhookStore; key: string; url: string },
): Promise<{ status: number }> {
  if (!verifySquareSignature(rawBody, signature, deps.url, deps.key)) return { status: 401 };
  let body: unknown;
  try { body = JSON.parse(rawBody); } catch { return { status: 200 }; }
  const ev = parseSquareEvent(body);
  if (!ev) return { status: 200 };

  const reg = await deps.store.findRegistrationByOrder(ev.orderId);

  if (ev.kind === "payment") {
    let duplicate = Boolean(reg && reg.payment_status === "paid" && reg.square_payment_id && reg.square_payment_id !== ev.paymentId);
    const alreadyThis = reg?.payment_status === "paid" && reg.square_payment_id === ev.paymentId;
    if (reg && ev.status === "COMPLETED" && ev.amountCents >= PRICE_CENTS && !duplicate && !alreadyThis) {
      // Two payments landing at the same moment: only one can win; the other is flagged for a refund.
      if (!(await deps.store.markPaid(reg.profile_id, ev.paymentId, ev.amountCents))) duplicate = true;
    }
    await deps.store.recordPayment({ ...ev, duplicate });
    return { status: 200 };
  }

  if (reg && ev.status === "COMPLETED" && reg.square_payment_id === ev.paymentId) {
    await deps.store.markRefunded(reg.profile_id);
  }
  return { status: 200 };
}
