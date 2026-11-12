// Square Checkout API — creates a one-time, Square-hosted checkout page for the $15 registration.
// Server-only: these env vars have no NEXT_PUBLIC_ prefix, so they never reach the browser.
// Docs: https://developer.squareup.com/reference/square/checkout-api/create-payment-link

const SQUARE_VERSION = "2026-09-16";
const PRICE_CENTS = 1500; // $15.00 AUD

export class SquareConfigError extends Error {}
export class SquareApiError extends Error {}

function config() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const env = process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  if (!token || !locationId) {
    throw new SquareConfigError("SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID must be set in .env.local");
  }
  const base = env === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
  return { token, locationId, base, siteUrl };
}

export type CheckoutInput = {
  /** Shown on the payment in Square, e.g. "Women's M · Cream" */
  note: string;
  /** Pre-fills the email on Square's page (optional until sign-in is wired up) */
  email?: string;
};

/** Builds the CreatePaymentLink request body. Exported so it can be checked without calling Square. */
export function buildPaymentLinkBody(input: CheckoutInput, locationId: string, siteUrl: string, idempotencyKey: string) {
  return {
    idempotency_key: idempotencyKey,
    quick_pay: {
      name: "TYGA 2026 Summer Series — Registration + singlet",
      price_money: { amount: PRICE_CENTS, currency: "AUD" },
      location_id: locationId,
    },
    payment_note: input.note.slice(0, 500),
    checkout_options: {
      redirect_url: `${siteUrl}/join/confirmed`,
      ask_for_shipping_address: false,
      accepted_payment_methods: { apple_pay: true, google_pay: true },
    },
    ...(input.email ? { pre_populated_data: { buyer_email: input.email } } : {}),
  };
}

/** Asks Square for a checkout page and returns its URL (plus Square's order id for matching later). */
export async function createSummerSeriesCheckout(input: CheckoutInput): Promise<{ url: string; orderId: string }> {
  const { token, locationId, base, siteUrl } = config();
  const res = await fetch(`${base}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildPaymentLinkBody(input, locationId, siteUrl, crypto.randomUUID())),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.payment_link?.url) {
    const detail = data?.errors?.map((e: { code?: string; detail?: string }) => `${e.code}: ${e.detail}`).join("; ");
    throw new SquareApiError(`Square returned ${res.status}${detail ? ` — ${detail}` : ""}`);
  }
  return { url: data.payment_link.url, orderId: data.payment_link.order_id };
}
