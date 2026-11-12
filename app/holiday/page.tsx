import { Icon } from "@/components/Icons";
import { LockedTeaser, Pill, Screen, TopNav } from "@/components/ui";
import { hasMoreToCome, holidayFilters, holidayWorkouts, nextWeek, unlocked } from "@/lib/mock-data";

// Holiday Mode
export default function Holiday() {
  return (
    <Screen>
      <TopNav title="Holiday Mode" back="/home" />
      <div className="cream-card li">
        <span className="ico"><Icon name="plane" /></span>
        <div className="grow"><b>I&apos;m away</b><div className="sm mute">Until Sun 3 Jan · coaches can see you&apos;re travelling</div></div>
        <span className="toggle" role="switch" aria-checked="true" aria-label="Holiday Mode on" />
      </div>
      <div className="h2" style={{ marginTop: 4 }}>Workouts that count anywhere</div>
      <div className="chips">
        {holidayFilters.map((f, i) => <span key={f} className={`chip ${i === 0 ? "on" : ""}`}>{f}</span>)}
      </div>
      {unlocked(holidayWorkouts).sort((a, b) => b.week - a.week).map((w) => (
        <div key={w.title} className="li card" style={{ padding: "10px 12px" }}>
          <span className="ico"><Icon name={w.icon} /></span>
          <div className="grow"><b className="sm">{w.title}</b><div className="xs mute">{w.detail}</div></div>
          {w.recovery ? <span className="xs mute">{w.tag}</span> : <Pill>{w.tag}</Pill>}
        </div>
      ))}
      {hasMoreToCome(holidayWorkouts) && nextWeek && <LockedTeaser title={`Week ${nextWeek.no} holiday workouts`} when={`Unlocks ${nextWeek.unlocks}`} />}
    </Screen>
  );
}
