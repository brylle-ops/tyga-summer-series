import Link from "next/link";
import { Pill, Wordmark } from "@/components/ui";
import { joinedLabel, lastSessionLabel, type AttentionRow } from "@/lib/retention";
import { loadRetention } from "../retention-data";

const CAP = 50;

// Retention: who is quiet, who has not started, who is active. Names only. Staff only (layout + loader).
export default async function Retention({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams;
  const d = await loadRetention();
  if (!d) return <p style={{ padding: 24 }}>Connect Supabase to see live data.</p>;
  const showAll = all === "1";
  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li"><Wordmark short size={26} /><span className="eyebrow" style={{ marginLeft: 10 }}>Retention</span></div>
          <div className="li" style={{ gap: 8, flexWrap: "wrap" }}>
            <Pill>{d.started ? `Week ${d.week}` : "Starts Mon 7 Dec"}</Pill>
            <Link prefetch={false} className="mini ghost" href="/admin">‹ Owner home</Link>
          </div>
        </div>
        <section className="needs">
          <p className="summary">
            {d.started
              ? `${d.members} members · ${d.active} active this week · ${d.needAttention} need attention`
              : `${d.members} members · ${d.waiting.length} signed up, waiting for 7 Dec`}
          </p>
        </section>
        {d.started ? (
          <>
            <Group title="Quiet" count={d.quiet.length} help="Message them this week — a quick hello keeps them in." rows={d.quiet} showAll={showAll} line={lastSessionLabel} warn />
            <Group title="Never logged" count={d.never.length} help="They joined but haven't trained yet. Ask what's getting in the way and help them log session one." rows={d.never} showAll={showAll} line={(r) => `Never logged · ${joinedLabel(r.joined)}`} warn />
            <Group title="Active this week" count={d.activeRows.length} help="Nothing to do. Give them a shout-out." rows={d.activeRows} showAll={showAll} line={lastSessionLabel} />
          </>
        ) : (
          <Group title="Signed up, waiting for 7 Dec" count={d.waiting.length} help="They're in. Tell them what's coming and get them excited for the first session." rows={d.waiting} showAll={showAll} line={(r) => joinedLabel(r.joined)} />
        )}
      </div>
    </div>
  );
}

function Group({ title, count, help, rows, showAll, line, warn = false }: {
  title: string; count: number; help: string; rows: AttentionRow[]; showAll: boolean; line: (r: AttentionRow) => string; warn?: boolean;
}) {
  const shown = showAll ? rows : rows.slice(0, CAP);
  return (
    <section className="needs" aria-label={title}>
      <h2>{title} <span className={warn && count > 0 ? "count warn" : "count"}>{count}</span></h2>
      <p className="note">What to do: {help}</p>
      {rows.length === 0 ? <p className="note mute">Nobody here right now.</p> : (
        <ul className="quiet">
          {shown.map((r) => <li key={r.id}><b>{r.name}</b><span>{line(r)}</span></li>)}
        </ul>
      )}
      {!showAll && rows.length > CAP && <Link prefetch={false} className="mini ghost" href="/admin/retention?all=1">Show all {rows.length}</Link>}
    </section>
  );
}
