import Link from "next/link";
import { Pill, Wordmark } from "@/components/ui";
import { lastSessionLabel } from "@/lib/retention";
import { loadRetention } from "./retention-data";

const SHOW = 25;

// Owner home: retention first. Who has gone quiet, then three big buttons and a short "More" list. Staff only (layout + loader).
export default async function Admin({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams;
  const d = await loadRetention();
  if (!d) return <p style={{ padding: 24 }}>Connect Supabase to see live data.</p>;
  const started = d.week >= 1;
  const rows = all === "1" ? d.rows : d.rows.slice(0, SHOW);
  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li"><Wordmark short size={26} /><span className="eyebrow" style={{ marginLeft: 10 }}>Owner</span></div>
          <Pill>{started ? `Week ${d.week}` : "Starts Mon 7 Dec"}</Pill>
        </div>

        <div className="pos-grid three" aria-label="Main tools">
          <Link prefetch={false} href="/admin/checkin" className="pos-tile big"><span className="t">Check-in</span></Link>
          <Link prefetch={false} href="/admin/leaderboard" className="pos-tile big"><span className="t">Leaderboard</span></Link>
          <Link prefetch={false} href="/admin/orders" className="pos-tile big"><span className="t">Orders &amp; shirts</span></Link>
        </div>

        <section className="needs" aria-labelledby="needs-h">
          <h2 id="needs-h">Needs attention</h2>
          {!started ? (
            <p className="note">The Series starts 7 Dec, retention tracking starts then. <span className="mute">{d.members} members so far.</span></p>
          ) : (
            <>
              <p className="summary">{d.members} members · {d.active} active this week · {d.needAttention} need attention</p>
              {d.rows.length === 0 ? <p className="note">Everyone has logged a session in the last 7 days. Nice work.</p> : (
                <ul className="quiet">
                  {rows.map((r) => (
                    <li key={r.id}><b>{r.name}</b><span>{lastSessionLabel(r)}</span></li>
                  ))}
                </ul>
              )}
              {all !== "1" && d.rows.length > SHOW && <Link prefetch={false} className="mini ghost" href="/admin?all=1">Show all {d.rows.length}</Link>}
            </>
          )}
        </section>

        <section className="more" aria-labelledby="more-h">
          <h2 id="more-h">More</h2>
          <ul>
            <li><Link prefetch={false} href="/admin/checkin">Yard approvals{d.pending > 0 && <span className="badge">{d.pending}</span>}</Link></li>
            <li><Link prefetch={false} href="/admin/rewards">Rewards</Link></li>
            <li><Link prefetch={false} href="/admin/missions">Missions</Link></li>
            <li><Link prefetch={false} href="/admin/members">Members</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
