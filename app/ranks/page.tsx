import { Screen, SegLinks, TopNav } from "@/components/ui";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";

type Entry = { id?: string; name: string; initials: string; points: number; rank: number };

// Leaderboard: overall, or points earned this week only (first name + last initial only)
export default async function Ranks({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const { me } = v;
  const week = tab === "week";
  const myId = (me as { id?: string }).id;
  // Overall comes as podium order [2nd, 1st, 3rd] plus the rest; put it back into one ranked list.
  const rows: Entry[] = week ? (v.weekBoard as Entry[]) : [v.podium[1], v.podium[0], v.podium[2], ...v.leaderboard].filter(Boolean) as Entry[];
  return (
    <Screen tabs>
      <TopNav title="Leaderboard" />
      <SegLinks options={[{ label: "Overall", href: "/ranks" }, { label: "This week", href: "/ranks?tab=week" }]} active={week ? "This week" : "Overall"} />
      {week && <p className="sm mute" style={{ margin: 0 }}>{v.week >= 1 ? `Points earned in Week ${v.week} only.` : "Week 1 starts Mon 7 Dec."}</p>}
      {rows.length === 0 ? <p className="notice">{week ? "Nobody has points this week yet. Be the first." : "No points yet. Log a session to get on the board."}</p> : (
        <div className="lbl">
          {rows.slice(0, 10).map((r, i) => (
            <div key={`${r.name}-${i}`} className={`lbrow ${r.id && r.id === myId ? "me" : ""}`}>
              <span className={`medal m${(r.rank ?? i + 1) <= 3 ? (r.rank ?? i + 1) : 0}`}>{r.rank ?? i + 1}</span>
              <span className="av">{r.initials}</span>
              <span className="grow"><b>{r.name}</b>{r.id && r.id === myId ? <small> · you</small> : null}</span>
              <span className="pts">{r.points} pts</span>
            </div>
          ))}
        </div>
      )}
      {!week && me.rank > 10 && (
        <div className="lbl"><div className="lbrow me"><span className="medal m0">{me.rank}</span><span className="av">{me.initials}</span><span className="grow"><b>{me.shortName}</b><small> · you</small></span><span className="pts">{me.points} pts</span></div></div>
      )}
    </Screen>
  );
}
