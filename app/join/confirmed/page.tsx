import Link from "next/link";
import { Pill, Screen, Sky, Tick, Wordmark } from "@/components/ui";
import { redirect } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import { me as example } from "@/lib/mock-data";
import { getCurrentMember, supabaseReady } from "@/lib/session";
import { COLOUR_LABEL, singletLabel } from "@/lib/singlet";

const START = new Date("2026-12-07T00:00:00+11:00");

// You're in — member ticket, countdown, welcome mission
export default async function Confirmed() {
  const member = await getCurrentMember();
  if (supabaseReady() && !member) redirect("/login");
  const reg = member?.registration;
  if (member && reg?.payment_status !== "paid") {
    return (
      <Screen>
        <div className="h1" style={{ marginTop: 8 }}>
          {reg?.payment_status === "pending" ? "Confirming your payment…" : reg?.payment_status === "refunded" ? "Your registration was refunded" : "Not paid yet"}
        </div>
        {reg?.payment_status === "pending" ? <AutoRefresh /> : (
          <Link href="/join/checkout" className="btn">{reg?.payment_status === "refunded" ? "Join again · $15" : "Go to checkout"}</Link>
        )}
      </Screen>
    );
  }
  const p = member?.profile;
  const me = {
    firstName: p?.first_name || example.firstName,
    fullName: p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email : example.fullName,
    memberNo: p?.member_no ?? example.memberNo,
  };
  const fit = reg?.fit ? singletLabel(reg.fit, reg.colour ?? "cream", reg.size).split(" · ")[0] : `${example.singlet.fit} ${example.singlet.size}`;
  const colour = reg?.colour ? COLOUR_LABEL[reg.colour] : example.singlet.colour;
  const ms = Math.max(0, START.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000), hrs = Math.floor(ms / 3_600_000) % 24, mins = Math.floor(ms / 60_000) % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <Screen>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <div className="eyebrow">Registration confirmed</div>
        <div className="h1" style={{ marginTop: 6 }}>You&apos;re in, {me.firstName}.</div>
        <div className="script" style={{ fontSize: 28, marginTop: 2 }}>see you this summer</div>
      </div>
      <div className="ticket">
        <div className="top">
          <Sky background="radial-gradient(ellipse at 80% 78%,rgba(227,203,164,.3),transparent 55%),linear-gradient(180deg,#141414,#2a2622)" />
          <div className="wmwrap"><Wordmark short size={44} /></div>
        </div>
        <div className="cut" />
        <div className="info">
          <div><span className="xs mute">MEMBER</span><b>{me.fullName}</b></div>
          <div><span className="xs mute">NO.</span><b>#{me.memberNo}</b></div>
          <div><span className="xs mute">SINGLET</span><b>{fit}</b></div>
          <div><span className="xs mute">COLOUR</span><b>{colour}</b></div>
        </div>
      </div>
      <div className="eyebrow">Series starts in</div>
      <div className="count">
        <div><b>{days}</b><small>DAYS</small></div>
        <div><b>{pad(hrs)}</b><small>HRS</small></div>
        <div><b>{pad(mins)}</b><small>MIN</small></div>
      </div>
      <div className="cream-card mission">
        <Tick />
        <div className="grow"><b>Welcome mission</b><span className="mute">Book your first 3 sessions for 7–13 Dec</span></div>
        <Pill>+10</Pill>
      </div>
      <Link href="/home" className="btn ghost">Go to my dashboard</Link>
    </Screen>
  );
}
