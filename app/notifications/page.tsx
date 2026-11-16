import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { unlockLabel } from "@/lib/activity";
import { isFresh } from "@/lib/announcements";
import { loadAnnouncements } from "@/lib/announcements-data";
import { isReleased } from "@/lib/rewards";
import { loadMemberRewards } from "@/lib/rewards-data";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";

type Item = { icon: IconName; title: string; text: string; href: string; hot?: boolean };

// Notifications: everything new for this member, built from live data (no separate inbox to manage).
export default async function Notifications() {
  const profile = await requireSeriesMember();
  const [v, rv, news] = await Promise.all([loadMemberView(profile), profile ? loadMemberRewards(profile.id) : null, loadAnnouncements(5)]);
  const now = new Date();
  const items: Item[] = news.map((a) => ({ icon: "bell" as IconName, title: a.title, text: a.body, href: "/notifications", hot: isFresh(a.created_at, now) }));
  if (rv) {
    for (const r of rv.rewards) {
      const w = rv.ctx.won.get(r.id);
      if (w?.announced && !w.collected) {
        items.push({ icon: "trophy", title: "YOU'RE A WINNER!", text: `${r.title}. Head to your Summer Series rewards to see what you've unlocked.`, href: `/perks#r${r.id}`, hot: true });
      }
    }
    const fresh = rv.rewards.filter((r) => isReleased(r, rv.ctx.week) && r.week === rv.ctx.week);
    if (fresh.length) items.push({ icon: "gift", title: "YOUR NEW SUMMER SERIES REWARD HAS UNLOCKED!", text: fresh.map((r) => r.title).join(" · "), href: "/perks", hot: true });
  }
  if (v.week >= 1) {
    items.push({ icon: "target", title: `Week ${v.week} missions are live`, text: "Complete them before Sunday 11:59 pm.", href: "/missions" });
    const left = 3 - v.weekInfo.sessionsDone;
    if (left > 0) items.push({ icon: "plus", title: `${left} more session${left > 1 ? "s" : ""} to lock in the week`, text: "Hit 3 by Sunday for +30 points.", href: "/log" });
    else items.push({ icon: "check", title: `Week ${v.week} locked in`, text: "You've done your 3 sessions. Nice work.", href: "/activity" });
    const pending = "pending" in v.weekInfo ? v.weekInfo.pending : 0;
    if (pending > 0) items.push({ icon: "bell", title: `${pending} Yard session${pending > 1 ? "s" : ""} waiting`, text: "They count once the class roster confirms them.", href: "/activity" });
  } else {
    items.push({ icon: "calendar", title: "The Series starts Mon 7 Dec", text: "Rewards, missions and logging open at 12:00 am.", href: "/overview" });
  }
  if (v.nextWeek) items.push({ icon: "lock", title: `Week ${v.nextWeek.no} unlocks ${unlockLabel(v.nextWeek.no)}`, text: "A new reward and new missions arrive at 12:00 am.", href: "/perks" });

  return (
    <Screen tabs className="sand">
      <TopNav title="Notifications" back="/home" />
      <div className="sheet">
        {items.map((n) => (
          <Link key={`${n.title}-${n.text}`} href={n.href} className="srow">
            <span className="ico"><Icon name={n.icon} /></span>
            <span className="grow"><b>{n.title}</b><small>{n.text}</small></span>
            {n.hot && <span className="ptag">NEW</span>}
          </Link>
        ))}
      </div>
    </Screen>
  );
}
