import Link from "next/link";
import { Icon } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember, supabaseReady } from "@/lib/session";

export const metadata = { title: "Summer Series · TYGA" };

// The Summer Series page: the singlet photo, the offer, and the way into the details. Public.
export default async function SummerSeries() {
  const signed = supabaseReady() && Boolean(await getCurrentMember());
  return (
    <Screen tabs={signed} className="sand">
      <TopNav title="Summer Series" back={signed ? "/more" : "/"} />
      <div className="photo-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/shop-backs.webp" alt="The Summer Series singlets, cream and charcoal wash, seen from the back" />
      </div>
      <div className="sheet pad" style={{ marginTop: -44, position: "relative" }}>
        <h2 className="disp">Join the Summer Series</h2>
        <p className="sm" style={{ margin: "4px 0 12px" }}>Free to join. Grab your exclusive singlet for $15.</p>
        <Link href="/join/singlet" className="btn">Shop the singlet →</Link>
      </div>
      <div className="sheet">
        <Link href="/join/singlet" className="srow">
          <span className="ico"><Icon name="shirt" /></span>
          <span className="grow"><h2 className="disp sm-d">Select your singlet</h2><small>Choose style &amp; size</small></span>
          <span className="mute" aria-hidden="true">›</span>
        </Link>
        <Link href="/overview" className="srow">
          <span className="ico"><Icon name="calendar" /></span>
          <span className="grow"><h2 className="disp sm-d">The details</h2><small>Dates, commitment &amp; how it works</small></span>
          <span className="mute" aria-hidden="true">›</span>
        </Link>
        <Link href="/rules" className="srow">
          <span className="ico"><Icon name="info" /></span>
          <span className="grow"><h2 className="disp sm-d">The rules</h2><small>Your weekly commitment</small></span>
          <span className="mute" aria-hidden="true">›</span>
        </Link>
      </div>
    </Screen>
  );
}
