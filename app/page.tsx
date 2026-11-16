import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon, type IconName } from "@/components/Icons";
import { Screen } from "@/components/ui";
import { getCurrentMember } from "@/lib/session";

const FEATURES: { icon: IconName; label: string }[] = [
  { icon: "db", label: "TRAIN" },
  { icon: "run", label: "MOVE" },
  { icon: "bowl", label: "FUEL" },
  { icon: "trophy", label: "EARN" },
];

// Welcome: the Summer Series logo, the dates, what the series is, then sign in or shop the singlet.
export default async function Welcome() {
  if (await getCurrentMember()) redirect("/home"); // already signed in: never ask for a code again
  return (
    <Screen className="welcome">
      <div className="wlogo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/summer-series-logo.webp" width={900} height={1125} alt="TYGA Summer Series 2026. Maintain the standard." fetchPriority="high" />
      </div>
      <div className="wdates"><Icon name="calendar" /><span>MON 7 DEC – TUE 26 JAN<br /><small>7 WEEKS</small></span></div>
      <ul className="wfeat" aria-label="What's in the Series">
        {FEATURES.map((f) => (
          <li key={f.label}><Icon name={f.icon} /><b>{f.label}</b></li>
        ))}
      </ul>
      <div className="foot">
        <p className="xs" style={{ textAlign: "center", color: "rgba(250,250,250,.75)", margin: 0 }}>Free to join. Sign in with any email.</p>
        <Link href="/join/singlet" className="btn">Shop the Summer Series</Link>
        <Link href="/login" className="btn ghost" style={{ height: 46, fontSize: 14 }}>Sign-in</Link>
        <Link href="/overview" className="xs link" style={{ textAlign: "center", color: "rgba(250,250,250,.75)" }}>How the Series works ›</Link>
      </div>
    </Screen>
  );
}
