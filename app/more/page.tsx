import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon, type IconName } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { signOut } from "@/app/join/sign-in/actions";
import { getCurrentMember, supabaseReady } from "@/lib/session";

const ROWS: { href: string; icon: IconName; title: string; note: string }[] = [
  { href: "/series", icon: "sun", title: "Summer Series", note: "The singlet, details and rules" },
  { href: "/log", icon: "plus", title: "Log today", note: "Tick off what you did" },
  { href: "/activity", icon: "run", title: "My activity", note: "Your week and history" },
  { href: "/holiday", icon: "plane", title: "Holiday Mode", note: "Training away from The Yard?" },
  { href: "/nutrition", icon: "bowl", title: "Recipes", note: "Yard Fuel recipes and meal plan" },
  { href: "/shop", icon: "shirt", title: "Shop", note: "The Summer Series singlet" },
  { href: "/rules", icon: "info", title: "The Rules", note: "Your weekly commitment" },
  { href: "/points", icon: "star", title: "Points", note: "How to earn points" },
  { href: "/overview", icon: "calendar", title: "Series overview", note: "Dates and how it works" },
  { href: "/resources", icon: "leaf", title: "Summer resources", note: "Holiday workouts, recovery, more" },
];

// More: everything that isn't on the tab bar, plus the account and log out.
export default async function More() {
  const account = supabaseReady() ? await getCurrentMember() : null;
  if (supabaseReady() && !account) redirect("/login");
  return (
    <Screen tabs>
      <TopNav title="More" />
      <div className="more-hero">
        <div><b className="disp">Maintain the standard</b><small>TYGA · SUMMER SERIES 2026</small></div>
      </div>
      <div className="sheet">
        {ROWS.map((r) => (
          <Link key={r.href} href={r.href} className="srow">
            <span className="ico"><Icon name={r.icon} /></span>
            <span className="grow"><b>{r.title}</b><small>{r.note}</small></span>
            <span className="mute" aria-hidden="true">›</span>
          </Link>
        ))}
        {account?.profile.role === "staff" && (
          <Link href="/admin" className="srow">
            <span className="ico"><Icon name="user" /></span>
            <span className="grow"><b>Staff admin</b><small>Approvals, rewards, leaderboard</small></span>
            <span className="mute" aria-hidden="true">›</span>
          </Link>
        )}
      </div>
      {account && (
        <div className="account">
          <span className="xs mute">Signed in as {account.profile.email}</span>
          <form action={signOut}><button type="submit" className="mini ghost">Log out</button></form>
        </div>
      )}
    </Screen>
  );
}
