"use server";

import { redirect } from "next/navigation";
import { checkoutBlocker, paymentNote } from "@/lib/checkout";
import { getCurrentMember, supabaseReady } from "@/lib/session";
import { createSummerSeriesCheckout, SquareConfigError } from "@/lib/square";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const BLOCKER_TO: Record<string, string> = {
  no_singlet: "/join/singlet", no_size: "/join/singlet", paid: "/join/confirmed", closed: "/join/checkout?error=closed",
};

// "Pay $15" → create a Square checkout page with the member's real details → send them there.
// Square sends them back to /join/confirmed; the webhook marks them paid.
export async function startCheckout(formData: FormData) {
  if (formData.get("terms") !== "on") redirect("/join/checkout?error=terms");

  let note = "TYGA Summer Series registration";
  let email: string | undefined;
  let profileId: string | null = null;

  if (!supabaseReady() && process.env.SQUARE_ENVIRONMENT === "production") redirect("/join/checkout?error=setup");

  if (supabaseReady()) {
    const me = await getCurrentMember();
    if (!me) redirect("/join/sign-in");
    const blocker = checkoutBlocker(me.registration, new Date());
    if (blocker) redirect(BLOCKER_TO[blocker]);
    const supabase = await createClient();
    await supabase.from("registrations").update({ terms_accepted_at: new Date().toISOString() }).eq("profile_id", me.profile.id);
    note = paymentNote(me.profile, me.registration!);
    email = me.profile.email;
    profileId = me.profile.id;
  }

  let url: string;
  try {
    const checkout = await createSummerSeriesCheckout({ note, email });
    url = checkout.url;
    if (profileId) {
      // Remember Square's order id so the webhook can match the payment to this member.
      const admin = createAdminClient();
      const { error: orderError } = await admin.from("checkout_orders").insert({ order_id: checkout.orderId, profile_id: profileId });
      if (orderError) throw orderError;
      const { error } = await admin.from("registrations")
        .update({ square_order_id: checkout.orderId, payment_status: "pending", updated_at: new Date().toISOString() })
        .eq("profile_id", profileId).neq("payment_status", "paid");
      if (error) throw error;
    }
  } catch (err) {
    console.error("[checkout] could not create Square checkout:", err);
    redirect(`/join/checkout?error=${err instanceof SquareConfigError ? "setup" : "square"}`);
  }
  redirect(url);
}
