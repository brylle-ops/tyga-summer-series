import { Icon } from "@/components/Icons";
import { LockedTeaser, Pill, Screen, Segmented, Sky, Tick, TopNav } from "@/components/ui";
import { missions, nextWeek, thisWeek } from "@/lib/mock-data";

// Weekly missions — only this week's are shown; next week stays locked until Monday
export default function Missions() {
  const current = missions.filter((m) => m.week === thisWeek.no);
  return (
    <Screen tabs>
      <TopNav title="Missions" />
      <Segmented options={["This week", "Done"]} active="This week" />
      <div className="banner">
        <Sky hills={60} />
        <div className="txt">
          <div className="eyebrow" style={{ color: "var(--cream)" }}>Week {thisWeek.no} · {thisWeek.dates}</div>
          <div className="h1">{thisWeek.theme}</div>
        </div>
      </div>
      <div className="li">
        <div className="bar grow" style={{ background: "var(--char-3)" }}><i style={{ width: "50%" }} /></div>
        <span className="xs mute">2 of 4 · 30 pts</span>
      </div>
      {current.map((m) =>
        m.secret ? (
          <div key={m.title} className="mission locked">
            <span className="ico" style={{ width: 22, height: 22, background: "none", color: "var(--mute)" }}><Icon name="lock" /></span>
            <div className="grow"><b className="mute">{m.title}</b><span className="mute">{m.detail}</span></div>
            <span className="xs mute">{m.points}</span>
          </div>
        ) : (
          <div key={m.title} className={`mission ${m.done ? "cream-card" : "card"}`}>
            <Tick on={m.done} />
            <div className="grow"><b>{m.title}</b><span className="mute">{m.detail}</span></div>
            <Pill done={m.done}>{m.points}</Pill>
          </div>
        )
      )}
      {nextWeek && <LockedTeaser title={`Week ${nextWeek.no} missions`} when={`Unlocks ${nextWeek.unlocks}`} />}
    </Screen>
  );
}
