import { Screen, SegLinks, TopNav } from "@/components/ui";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";

// Leaderboard (first name + last initial only)
export default async function Ranks({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const { me } = v;
  const [second, first, third] = v.podium;
  const club = tab === "club";
  return (
    <Screen tabs>
      <TopNav title="Leaderboard" />
      <SegLinks options={[{ label: "Points", href: "/ranks" }, { label: "3/3 Club", href: "/ranks?tab=club" }]} active={club ? "3/3 Club" : "Points"} />
      {club ? (
        <div className="card sm">
          <b>3/3 Club this week: {v.club} {v.club === 1 ? "member" : "members"}</b>
          <div className="mute xs" style={{ marginTop: 4 }}>
            Everyone who hits all three sessions goes in the weekly prize draw, however many points they have.
            {v.weekInfo.sessionsDone >= 3 ? " You're in this week!" : ` You're on ${v.weekInfo.sessionsDone}/3.`}
          </div>
        </div>
      ) : (
        <>
          {first && (
            <div className="podium" style={{ marginTop: 6 }}>
              <div>{second && <><div className="av">{second.initials}</div><b>{second.name}</b><span className="xs mute">{second.points}</span></>}</div>
              <div className="p1"><div className="av" style={{ color: "var(--cream)" }}>{first.initials}</div><b>{first.name}</b><span className="xs" style={{ color: "var(--ink-mute)" }}>{first.points} pts</span></div>
              <div>{third && <><div className="av">{third.initials}</div><b>{third.name}</b><span className="xs mute">{third.points}</span></>}</div>
            </div>
          )}
          <div className="lb">
            {v.leaderboard.map((r) => (
              <div key={r.name + r.rank}>
                <span className="rk">{r.rank}</span><span className="av">{r.initials}</span>
                <span className="grow sm">{r.name}</span><span className="pts sm">{r.points}</span>
              </div>
            ))}
          </div>
          {me.rank > 0 && (
            <div className="you">
              <span className="rk" style={{ width: 20, textAlign: "center", fontWeight: 700 }}>{me.rank}</span>
              <span className="av" style={{ color: "var(--cream)" }}>{me.initials}</span>
              <span className="grow sm"><b>You</b> · {me.shortName}</span>
              <span className="pts">{me.points}</span>
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
