import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";
import { Pill, Screen } from "@/components/ui";
import ViewSwitch from "@/components/ViewSwitch";
import WeekStrip from "@/components/WeekStrip";
import { isFresh } from "@/lib/announcements";
import { loadAnnouncements } from "@/lib/announcements-data";
import { isReleased } from "@/lib/rewards";
import { loadMemberRewards } from "@/lib/rewards-data";
import { LEVELS } from "@/lib/series";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { avatarUrls } from "@/lib/avatars";
import Avatar from "@/components/Avatar";

const QUICK: { href: string; label: string; icon: IconName }[] = [
  { href: "/activity", label: "Activity", icon: "run" },
  { href: "/perks", label: "Rewards", icon: "gift" },
  { href: "/nutrition", label: "Nutrition", icon: "bowl" },
  { href: "/holiday", label: "Holiday", icon: "plane" },
  { href: "/points", label: "Points", icon: "star" },
];

const PILLARS: { href: string; label: string; icon: IconName }[] = [
  { href: "/log", label: "TRAIN", icon: "db" },
  { href: "/holiday", label: "MOVE", icon: "run" },
  { href: "/nutrition", label: "FUEL", icon: "bowl" },
  { href: "/points", label: "EARN", icon: "trophy" },
];

// Home dashboard
export default async function Home() {
  const profile = await requireSeriesMember();
  const [v, rv, news, photos] = await Promise.all([loadMemberView(profile), profile ? loadMemberRewards(profile.id) : null, loadAnnouncements(5), profile ? avatarUrls([profile.id]) : Promise.resolve(new Map<string, string>())]);
  const myPhoto = profile ? photos.get(profile.id) : undefined;
  const newNews = news.some((a) => isFresh(a.created_at));
  // Rewards banners: a win beats "new reward", and both go straight to the Rewards page.
  const won = rv ? rv.rewards.filter((r) => { const w = rv.ctx.won.get(r.id); return w?.announced && !w.collected; }) : [];
  const fresh = rv ? rv.rewards.filter((r) => isReleased(r, rv.ctx.week) && r.week === rv.ctx.week) : [];
  const { me, weekInfo: thisWeek } = v;
  const left = 3 - thisWeek.sessionsDone;
  const ringPct = Math.round((thisWeek.sessionsDone / 3) * 100);
  return (
    <Screen tabs className="dark">
      {profile?.role === "staff" && <ViewSwitch current="member" top />}
      <div className="htop">
        <Link href="/more" className="hbtn" aria-label="Menu"><span className="burger" aria-hidden="true" /></Link>
        <b className="htitle">TYGA</b>
        <Link href="/notifications" className={`hbtn ${won.length + fresh.length > 0 || newNews ? "dot" : ""}`} aria-label="Notifications"><Icon name="bell" /></Link>
      </div>
      <div className="hhero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/summer-series-logo.webp" width={900} height={1125} alt="TYGA Summer Series 2026. Maintain the standard." fetchPriority="high" />
      </div>
      <div className="wdates"><Icon name="calendar" /><span>MON 7 DEC – TUE 26 JAN<br /><small>7 WEEKS</small></span></div>
      <ul className="pillars" aria-label="The Series">
        {PILLARS.map((p) => (<li key={p.label}><Link href={p.href}><Icon name={p.icon} /><b>{p.label}</b></Link></li>))}
      </ul>
      <div className="hdr" style={{ justifyContent: "flex-start" }}>
        <Link href="/more" aria-label="Your photo"><Avatar url={myPhoto} initials={`${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase() || "?"} className="av av-lg" /></Link>
        <div>
          <div className="sm mute">Hey, {me.firstName}</div>
          <div className="h2">{v.week >= 1 ? <>Week {thisWeek.no} · <span className="script" style={{ fontSize: 22 }}>{thisWeek.theme}</span></> : "Series starts Mon 7 Dec"}</div>
        </div>
      </div>
      {profile && !myPhoto && (
        <Link href="/more" className="info-link"><span className="grow"><b className="disp sm-d">Add your photo</b><small style={{ display: "block", fontSize: 12 }}>Optional · shows on the leaderboard</small></span><span aria-hidden="true">›</span></Link>
      )}

      {won.length > 0 && (
        <Link href="/perks" className="reward-banner win">
          <Icon name="trophy" /><span><b>YOU&apos;RE A WINNER!</b> Head to your Summer Series rewards to see what you&apos;ve unlocked.</span>
        </Link>
      )}
      {won.length === 0 && fresh.length > 0 && (
        <Link href="/perks" className="reward-banner">
          <Icon name="gift" /><span><b>YOUR NEW SUMMER SERIES REWARD HAS UNLOCKED!</b> {fresh[0].title}{fresh.length > 1 ? ` + ${fresh.length - 1} more` : ""}. Tap to open.</span>
        </Link>
      )}

      <div className="cream-card">
        <div className="week-card">
          <div className="ring" style={{ "--p": ringPct } as React.CSSProperties}>
            <div><div><b>{thisWeek.sessionsDone}/3</b><small>THIS WEEK</small></div></div>
          </div>
          <div className="grow">
            <b style={{ fontSize: 15 }}>{v.week < 1 ? "Get ready for week 1" : left <= 0 ? `Week ${thisWeek.no} locked in!` : `${left} more to lock in week ${thisWeek.no}`}</b>
            {v.week >= 1 && left > 0 && <div className="sm mute" style={{ marginTop: 3 }}>Hit 3 by Sunday for <b style={{ color: "#6e5330" }}>+30 points</b></div>}
            {"pending" in thisWeek && thisWeek.pending > 0 && (
              <div className="xs" style={{ marginTop: 6, color: "#6e5330", fontWeight: 600 }}>
                {thisWeek.pending} Yard session{thisWeek.pending > 1 ? "s" : ""} waiting for the class roster. {thisWeek.pending > 1 ? "They count" : "It counts"} once confirmed.
              </div>
            )}
            <Link href="/activity" className="xs link" style={{ display: "block", width: "fit-content", marginTop: 6 }}>See all activity ›</Link>
          </div>
        </div>
      </div>

      {v.week >= 1 && <Link href="/log" className="btn">Log today&apos;s movement</Link>}

      <div className="strip-card">
        <div className="eyebrow">Your week</div>
        <WeekStrip strip={v.strip} />
      </div>

      <div className="stats">
        <Link href="/points"><b>{me.points}</b><small>points</small></Link>
        <Link href="/ranks"><b>#{me.rank}</b><small>of {me.participants}</small></Link>
        <Link href="/activity"><b>{me.streakWeeks} wks</b><small>streak</small></Link>
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
