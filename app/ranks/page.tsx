import { Screen, Segmented, TopNav } from "@/components/ui";
import { clubThisWeek, leaderboard, me, podium } from "@/lib/mock-data";

// Leaderboard
export default function Ranks() {
  const [second, first, third] = podium;
  return (
    <Screen tabs>
      <TopNav title="Leaderboard" />
      <Segmented options={["Points", "3/3 Club"]} active="Points" />
      <div className="podium" style={{ marginTop: 6 }}>
        <div><div className="av">{second.initials}</div><b>{second.name}</b><span className="xs mute">{second.points}</span></div>
        <div className="p1"><div className="av" style={{ color: "var(--cream)" }}>{first.initials}</div><b>{first.name}</b><span className="xs" style={{ color: "var(--ink-mute)" }}>{first.points} pts</span></div>
        <div><div className="av">{third.initials}</div><b>{third.name}</b><span className="xs mute">{third.points}</span></div>
      </div>
      <div className="lb">
        {leaderboard.map((r) => (
          <div key={r.rank}>
            <span className="rk">{r.rank}</span><span className="av">{r.initials}</span>
            <span className="grow sm">{r.name}</span><span className="pts sm">{r.points}</span>
          </div>
        ))}
      </div>
      <div className="you">
        <span className="rk" style={{ width: 20, textAlign: "center", fontWeight: 700 }}>{me.rank}</span>
        <span className="av" style={{ color: "var(--cream)" }}>{me.initials}</span>
        <span className="grow sm"><b>You</b> · {me.shortName}</span>
        <span className="pts">{me.points}</span>
      </div>
      <div className="card sm">
        <b>3/3 Club this week: {clubThisWeek} members</b>
        <div className="mute xs" style={{ marginTop: 4 }}>
          Everyone who hits all three sessions goes in the weekly prize draw, however many points they have.
        </div>
      </div>
    </Screen>
  );
}
