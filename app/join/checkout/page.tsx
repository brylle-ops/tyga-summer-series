import { redirect } from "next/navigation";
import { Screen, TopNav } from "@/components/ui";
import { me as example } from "@/lib/mock-data";
import { getCurrentMember, supabaseReady } from "@/lib/session";
import { singletLabel } from "@/lib/singlet";
import { startCheckout } from "./actions";

const ERRORS: Record<string, string> = {
  setup: "Payments aren't set up yet — add the Square keys to .env.local (see README).",
  square: "We couldn't reach Square just now. Please try again in a moment.",
  terms: "Please accept the Summer Series terms.",
};

// Join · step 4: order summary, terms, then Square's hosted checkout
export default async function Checkout({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const me = await getCurrentMember();
  if (supabaseReady() && !me) redirect("/login?next=/join/checkout");
  const reg = me?.registration;
  if (reg?.payment_status === "paid") redirect("/join/confirmed");
  if (me && (!reg?.fit || !reg.colour || !reg.size)) redirect("/join/singlet");
  const label = reg?.fit && reg.colour
    ? singletLabel(reg.fit, reg.colour, reg.size)
    : `${example.singlet.fit} ${example.singlet.size} · ${example.singlet.colour}`;
  const photo = reg?.colour === "cream" ? "/img/singlet-cream-front.jpg" : "/img/singlet-charcoal-front.jpg";
  return (
    <Screen>
      <TopNav title="Checkout" back="/join/singlet" />
      <div className="cream-card">
        <div className="order">
          <img src={photo} alt="" />
          <div className="grow">
            <b>TYGA Summer Series singlet</b>
            <div className="sm mute">{label}</div>
          </div>
        </div>
        <div className="rows" style={{ marginTop: 10 }}>
          <div><span>Limited-edition singlet</span><span>$15.00</span></div>
          <div><span>Total</span><span>$15.00</span></div>
        </div>
      </div>
      <div className="card sm">
        <b style={{ fontSize: 14 }}>Before you pay</b>
        <ul className="mute" style={{ paddingLeft: 16, marginTop: 8, display: "grid", gap: 7, fontSize: 13 }}>
          <li>Your normal suspension and cancellation rights don&apos;t change.</li>
          <li>Collect your singlet at The Yard from launch week.</li>
          <li>Prize draws have their own eligibility rules.</li>
        </ul>
        <div className="xs link" style={{ marginTop: 8 }}>Read the full terms ›</div>
      </div>
      <form action={startCheckout} style={{ display: "contents" }}>
        <label className="check">
          <input type="checkbox" name="terms" required />
          <span>I accept the shop terms and the <a href="/privacy" className="link" target="_blank">privacy policy</a></span>
        </label>
        <div style={{ flex: 1 }} />
        {error && ERRORS[error] && <p className="notice" role="alert">{ERRORS[error]}</p>}
        <button type="submit" className="btn">Pay $15</button>
      </form>
      <p className="xs mute" style={{ textAlign: "center" }}>
        Card, Apple Pay or Google Pay · Secure checkout by Square
      </p>
    </Screen>
  );
}
