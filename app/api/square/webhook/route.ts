import { handleSquareWebhook, type WebhookStore } from "@/lib/square-webhook";
import { createAdminClient } from "@/lib/supabase/admin";

// Square → "this person paid / was refunded". Signature-checked; writes with the server key.
export async function POST(req: Request) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_URL;
  if (!key || !url) {
    console.error("[square webhook] SQUARE_WEBHOOK_SIGNATURE_KEY / SQUARE_WEBHOOK_URL not set");
    return new Response(null, { status: 503 });
  }
  const rawBody = await req.text(); // raw text: the signature covers the exact bytes
  const db = createAdminClient();

  const store: WebhookStore = {
    async findRegistrationByOrder(orderId) {
      const { data: order, error: orderError } = await db.from("checkout_orders").select("profile_id").eq("order_id", orderId).maybeSingle();
      if (orderError) throw orderError;
      if (!order) return null;
      const { data, error } = await db.from("registrations")
        .select("profile_id, payment_status, square_payment_id").eq("profile_id", order.profile_id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async markPaid(profileId, paymentId, amountCents) {
      const { data, error } = await db.from("registrations").update({
        payment_status: "paid", square_payment_id: paymentId, amount_cents: amountCents,
        paid_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq("profile_id", profileId).neq("payment_status", "paid").select("profile_id");
      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
    async markRefunded(profileId) {
      const { error } = await db.from("registrations")
        .update({ payment_status: "refunded", updated_at: new Date().toISOString() }).eq("profile_id", profileId);
      if (error) throw error;
    },
    async recordPayment(p) {
      const { error } = await db.from("square_payments").upsert({
        payment_id: p.paymentId, order_id: p.orderId, status: p.status, amount_cents: p.amountCents, duplicate: p.duplicate,
      });
      if (error) throw error;
    },
  };

  try {
    const { status } = await handleSquareWebhook(rawBody, req.headers.get("x-square-hmacsha256-signature"), { store, key, url });
    return new Response(null, { status });
  } catch (err) {
    console.error("[square webhook] failed:", err);
    return new Response(null, { status: 500 }); // Square retries later
  }
}
