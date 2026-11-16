import { Screen, SegLinks, TopNav } from "@/components/ui";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";

type Entry = { id?: string; name: string; initials: string; points: number; rank: number };

// Leaderboard: overall, or points earned this week only (first name + last initial only)
export default async function Ranks({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const { me } = v;
  const week = tab === "week";
  const board = v.weekBoard as Entry[];
  const [second, first, third] = week ? [board[1], board[0], board[2]] : v.podium;
  const list: Entry[] = week ? board.slice(3, 10) : v.leaderboard;
  const mine = week ? board.find((r) => r.id && r.id === (me as { id?: string }).id) : undefined;
  return (
    <Screen tabs>
      <TopNav title="Leaderboard" />
      <SegLinks options={[{ label: "Overall", href: "/ranks" }, { label: "This week", href: "/ranks?tab=week" }]} active={week ? "This week" : "Overall"} />
      {week && <p className="sm mute" style={{ margin: 0 }}>{v.week >= 1 ? `Points earned in Week ${v.week} only.` : "Week 1 starts Mon 7 Dec."}</p>}
      {!first ? <p className="notice">{week ? "Nobody has points this week yet. Be the first." : "No points yet. Log a session to get on the board."}</p> : (
        <div className="podium" style={{ marginTop: 6 }}>
          <div>{second && <><div className="av">{second.initials}</div><b>{second.name}</b><span className="xs mute">{second.points}</span></>}</div>
          <div className="p1"><div className="av" style={{ color: "var(--cream)" }}>{first.initials}</div><b>{first.name}</b><span className="xs" style={{ color: "var(--ink-mute)" }}>{first.points} pts</span></div>
          <div>{third && <><div className="av">{third.initials}</div><b>{third.name}</b><span className="xs mute">{third.points}</span></>}</div>
        </div>
      )}
      <div className="lb">
        {list.map((r) => (
          <div key={r.name + r.rank}>
            <span className="rk">{r.rank}</span><span className="av">{r.initials}</span>
            <span className="grow sm">{r.name}</span><span className="pts sm">{r.points}</span>
          </div>
        ))}
      </div>
      {!week && me.rank > 0 && (
        <div className="you">
          <span className="rk" style={{ width: 20, textAlign: "center", fontWeight: 700 }}>{me.rank}</span>
          <span className="av" style={{ color: "var(--cream)" }}>{me.initials}</span>
          <span className="grow sm"><b>You</b> · {me.shortName}</span>
          <span className="pts">{me.points}</span>
        </div>
      )}
      {week && mine && (
        <div className="you">
          <span className="rk" style={{ width: 20, textAlign: "center", fontWeight: 700 }}>{mine.rank}</span>
          <span className="av" style={{ color: "var(--cream)" }}>{mine.initials}</span>
          <span className="grow sm"><b>You</b> · {mine.name}</span>
          <span className="pts">{mine.points}</span>
        </div>
      )}
    </Screen>
  );
}
