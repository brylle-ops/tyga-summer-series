import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";
import { Pill, Screen } from "@/components/ui";
import WeekStrip from "@/components/WeekStrip";
import { LEVELS } from "@/lib/series";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";

const QUICK: { href: string; label: string; icon: IconName }[] = [
  { href: "/activity", label: "Activity", icon: "run" },
  { href: "/perks", label: "Perks", icon: "gift" },
  { href: "/nutrition", label: "Nutrition", icon: "bowl" },
  { href: "/holiday", label: "Holiday", icon: "plane" },
];

// Home dashboard
export default async function Home() {
  const v = await loadMemberView(await requireSeriesMember());
  const { me, weekInfo: thisWeek } = v;
  const left = 3 - thisWeek.sessionsDone;
  const ringPct = Math.round((thisWeek.sessionsDone / 3) * 100);
  return (
    <Screen tabs>
      <div className="hdr">
        <div>
          <div className="sm mute">Hey, {me.firstName}</div>
          <div className="h2">{v.week >= 1 ? <>Week {thisWeek.no} · <span className="script" style={{ fontSize: 22 }}>{thisWeek.theme}</span></> : "Series starts Mon 7 Dec"}</div>
        </div>
      </div>

      <div className="cream-card">
        <div className="week-card">
          <div className="ring" style={{ "--p": ringPct } as React.CSSProperties}>
            <div><div><b>{thisWeek.sessionsDone}/3</b><small>THIS WEEK</small></div></div>
          </div>
          <div className="grow">
            <b style={{ fontSize: 15 }}>{v.week < 1 ? "Get ready for week 1" : left <= 0 ? `Week ${thisWeek.no} locked in!` : `${left} more to lock in week ${thisWeek.no}`}</b>
            {v.week >= 1 && left > 0 && <div className="sm mute" style={{ marginTop: 3 }}>Hit 3 by Sunday for <b style={{ color: "#6e5330" }}>+20 bonus</b></div>}
            <Link href="/activity" className="xs link" style={{ display: "inline-block", marginTop: 6 }}>See all activity ›</Link>
          </div>
        </div>
      </div>

      <div className="strip-card">
        <div className="eyebrow">Your week</div>
        <WeekStrip strip={v.strip} />
      </div>

      <div className="stats">
        <div><b>{me.points}</b><small>points</small></div>
        <div><b>#{me.rank}</b><small>of {me.participants}</small></div>
        <div><b>{me.streakWeeks} wks</b><small>streak</small></div>
      </div>

      <Link href="/levels" className="card" style={{ textDecoration: "none", display: "block" }}>
        <div className="li">
          <div className="grow"><div className="xs mute">LEVEL {me.level}</div><b>{LEVELS[me.level - 1].name}</b></div>
          <span className="sm mute">{me.level >= LEVELS.length ? "Top level" : `${me.pointsToNext} pts to L${me.level + 1}`}</span>
        </div>
        <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${me.levelProgressPct}%` }} /></div>
      </Link>

      <div className="quick">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href}><span className="ico"><Icon name={q.icon} /></span>{q.label}</Link>
        ))}
      </div>

      {v.missions.filter((m) => m.week === v.week && m.double && !m.done).slice(0, 1).map((m) => (
        <Link key={m.id} href="/missions" className="li card" style={{ padding: "11px 13px", textDecoration: "none" }}>
          <span className="ico" style={{ background: "rgba(227,203,164,.14)", color: "var(--sun-2)" }}><Icon name="sun" /></span>
          <div className="grow"><b className="sm">Double points</b><div className="xs mute">{m.title}</div></div>
          <Pill>2×</Pill>
        </Link>
      ))}

      <Link href="/join/singlet" className="shop-promo">
        <img src="/img/shop-cream-front.webp" alt="" />
        <span><small>NEW · LIMITED EDITION</small><b>Summer Series singlet</b><em>$15 · Shop now ›</em></span>
      </Link>

      <Link href="/resources" className="li card" style={{ padding: "11px 13px", textDecoration: "none" }}>
        <span className="ico"><Icon name="leaf" /></span>
        <div className="grow"><b className="sm">Summer resources</b><div className="xs mute">Holiday workouts, recovery, more</div></div>
        <span className="mute">›</span>
      </Link>
    </Screen>
  );
}
