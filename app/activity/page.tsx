import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import WeekStrip from "@/components/WeekStrip";
import { dayLabel, type FeedItem } from "@/lib/activity";
import { loadActivity, loadMemberView, requireSeriesMember } from "@/lib/series-data";

export const metadata = { title: "Your activity · TYGA Summer Series" };

const ICON: Record<string, IconName> = { yard: "db", run: "run", workout: "flame", recovery: "leaf", rest: "bed", bonus: "star", mission: "target" };
const STATE_LABEL: Record<FeedItem["state"], string> = { counted: "Counted", pending: "Waiting", logged: "Logged", extra: "Same day", bonus: "Bonus", mission: "Mission" };

// Strava-style history: your week at a glance, then everything you've logged, newest first.
export default async function Activity() {
  const profile = await requireSeriesMember();
  const [v, a] = await Promise.all([loadMemberView(profile), loadActivity(profile)]);
  const { me } = v;
  return (
    <Screen tabs bodyStyle={{ gap: 12 }}>
      <TopNav title="Your activity" back="/home" />

      <div className="stats">
        <div><b>{v.weekInfo.sessionsDone}/3</b><small>this week</small></div>
        <div><b>{me.points}</b><small>points</small></div>
        <div><b>{me.streakWeeks} wks</b><small>streak</small></div>
      </div>

      <section className="card" aria-label="This week">
        <div className="li" style={{ marginBottom: 8 }}>
          <b className="grow">{v.week >= 1 ? `Week ${v.week}` : "Before the series"}</b>
          <Link href="/log" className="mini">Log today</Link>
        </div>
        <WeekStrip strip={v.strip} />
      </section>

      {a.weeks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 22 }}>
          <b>Nothing logged yet</b>
          <p className="sm mute" style={{ margin: "6px 0 12px" }}>Your sessions, runs and missions will show up here as you go.</p>
          <Link href="/log" className="btn">Log your first session</Link>
        </div>
      ) : a.weeks.map((w) => (
        <section key={w.week} aria-label={w.label}>
          <div className="wk-head">
            <b>{w.label}</b>
            <span className="xs mute">{w.sessions}/3 sessions · {w.points} pts{w.hit3 ? " · locked in" : ""}</span>
          </div>
          <div className="feed">
            {w.items.map((i) => (
              <div key={i.id} className={`feed-item ${i.state}`}>
                <span className="feed-ico"><Icon name={ICON[i.kind] ?? "check"} /></span>
                <div className="grow">
                  <b>{i.title}</b>
                  <small>{dayLabel(i.day)} · {i.detail}</small>
                </div>
                <span className="feed-pts">{i.points > 0 ? `+${i.points}` : STATE_LABEL[i.state]}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </Screen>
  );
}

