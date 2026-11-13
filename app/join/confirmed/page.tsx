import Link from "next/link";
import { redirect } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import { Screen, TopNav } from "@/components/ui";
import { me as example } from "@/lib/mock-data";
import { getCurrentMember, supabaseReady } from "@/lib/session";
import { singletLabel } from "@/lib/singlet";

// Singlet order status: paid, confirming, refunded, or no order yet.
export default async function Confirmed() {
  const member = await getCurrentMember();
  if (supabaseReady() && !member) redirect("/login?next=/join/confirmed");
  const reg = member?.registration;
  const status = member ? reg?.payment_status ?? "unpaid" : "paid"; // example mode shows the paid view

  if (status === "pending") {
    return (
      <Screen>
        <TopNav title="Your order" back="/shop" />
        <h1 className="h1" style={{ marginTop: 8 }}>Confirming your payment…</h1>
        <p className="sm mute">This usually takes a few seconds.</p>
        <AutoRefresh />
      </Screen>
    );
  }
  if (status === "refunded" || status === "unpaid") {
    return (
      <Screen>
        <TopNav title="Your order" back="/shop" />
        <h1 className="h1" style={{ marginTop: 8 }}>{status === "refunded" ? "Your singlet payment was refunded" : "No singlet order yet"}</h1>
        <p className="sm mute">{status === "refunded" ? "You can order again any time." : "The singlet is optional. You can still use the whole app."}</p>
        <div style={{ flex: 1 }} />
        <Link href="/shop" className="btn">{status === "refunded" ? "Order again" : "Shop the singlet"}</Link>
        <Link href="/home" className="btn ghost">Go to my dashboard</Link>
      </Screen>
    );
  }

  const label = reg?.fit && reg.colour ? singletLabel(reg.fit, reg.colour, reg.size) : `${example.singlet.fit} ${example.singlet.size} · ${example.singlet.colour}`;
  const photo = reg?.colour === "cream" ? "/img/singlet-cream-front.jpg" : "/img/singlet-charcoal-front.jpg";
  const name = member?.profile.first_name || example.firstName;
  return (
    <Screen>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <div className="eyebrow">Order confirmed</div>
        <h1 className="h1" style={{ marginTop: 6 }}>Thanks, {name}.</h1>
        <div className="script" style={{ fontSize: 28, marginTop: 2 }}>your singlet is on the way</div>
      </div>
      <div className="cream-card">
        <div className="order">
          <img src={photo} alt="" />
          <div className="grow">
            <b>TYGA Summer Series singlet</b>
            <div className="sm mute">{label}</div>
          </div>
        </div>
      </div>
      <p className="sm mute">Collect your singlet at The Yard from launch week. We&apos;ll have it ready with your name on it.</p>
      <div style={{ flex: 1 }} />
      <Link href="/home" className="btn">Go to my dashboard</Link>
    </Screen>
  );
}
