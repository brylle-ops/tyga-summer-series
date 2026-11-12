import MemberUpload from "@/components/MemberUpload";
import { Pill, Wordmark } from "@/components/ui";
import { loadAdminData } from "./data";
import {
  adminKpis as k, followUps, holidayWorkouts, missions, nextPerks, resources, seriesWeeks,
} from "@/lib/mock-data";

// Staff admin (Sarah and the team). Buttons are not wired up yet.
export default async function Admin() {
  const d = await loadAdminData();
  const { payments, sizes: singletSizes, order: singletOrder } = d;
  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li">
            <Wordmark short size={26} />
            <span className="eyebrow" style={{ marginLeft: 10 }}>Admin</span>
          </div>
          <div className="li" style={{ gap: 8, flexWrap: "wrap" }}>
            <Pill>Week 3 · The Silly Season</Pill>
            <span className="xs mute">Roster last synced: {k.lastRosterSync}</span>
            {d.real ? <MemberUpload /> : <span className="xs mute">Example data until Supabase is set up</span>}
            <button className="mini ghost" type="button">Add mission</button>
            <button className="mini" type="button">Export report</button>
          </div>
        </div>

        <div className="desk-grid">
          <div className="card kpi"><small>Registered &amp; paid</small><b>{d.registeredPaid}</b><small>{d.pctOfActive}% of {d.real ? `${d.members} ` : ""}active members{d.duplicates ? ` · ${d.duplicates} paid twice — refund in Square` : ""}</small></div>
          <div className="card kpi"><small>Hit 3/3 last week</small><b>{k.hit3Last}</b><small>{k.pctOfParticipants}% of participants</small></div>
          <div className="card kpi"><small>Check-ins to approve</small><b style={{ color: "var(--sun-2)" }}>{k.toApprove}</b><small>Yard sessions vs roster</small></div>
          <div className="cream-card kpi"><small style={{ color: "var(--ink-mute)" }}>Need a follow-up</small><b>{k.followUps}</b><small style={{ color: "var(--ink-mute)" }}>see list below</small></div>

          <div className="card span2">
            <div className="li" style={{ marginBottom: 6 }}><b className="grow">Members needing a chat</b><span className="xs mute">most flags first</span></div>
            <div className="tablewrap"><table>
              <thead><tr><th>Member</th><th>Last session</th><th>Week</th><th>Why</th><th></th></tr></thead>
              <tbody>
                {followUps.map((f) => (
                  <tr key={f.name}>
                    <td>{f.name}</td><td>{f.last}</td><td>{f.week}</td>
                    <td>{f.flags.map((fl) => <span key={fl} className={`flag ${f.away ? "away" : ""}`}>{fl}</span>)}</td>
                    <td><button className="mini ghost" type="button">Text</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>

          <div className="card span2">
            <div className="li" style={{ marginBottom: 6 }}>
              <b className="grow">Singlet order</b><Pill>Cutoff 30 Nov</Pill>
              <a className="mini" href="/admin/singlets.csv" style={{ marginLeft: 8 }}>Supplier CSV</a>
            </div>
            <div className="tablewrap"><table>
              <thead><tr><th>Fit · colour</th>{singletSizes.map((s) => <th key={s} className="n">{s}</th>)}<th className="n">Total</th></tr></thead>
              <tbody>
                {singletOrder.map((r) => (
                  <tr key={r.label}>
                    <td>{r.label}</td>
                    {r.counts.map((c, i) => <td key={i} className="n">{c}</td>)}
                    <td className="n"><b>{r.total}</b></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <p className="xs mute" style={{ marginTop: 8 }}>Paid registrations only.</p>
          </div>

          <div className="card span4">
            <div className="li" style={{ marginBottom: 6, gap: 10, flexWrap: "wrap" }}>
              <b className="grow">Payments · Square</b>
              <span className="sm">Collected <b>{k.collected}</b></span>
              <span className="flag">{k.startedUnpaid} started, not paid</span>
            </div>
            <div className="tablewrap"><table>
              <thead><tr><th>Member</th><th>Status</th><th>Date</th><th className="n">Amount</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td><span className={`pill ${p.status === "Paid" ? "done" : ""}`}>{p.status}</span></td>
                    <td>{p.when}</td><td className="n">{p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>
      </div>

      <div className="sec"><b>Content calendar</b><span>Each week unlocks for members at 12:00am Monday. Anything not live yet can still be changed.</span></div>
      <div className="weeks">
        {seriesWeeks.map((w) => {
          const n = (items: { week: number }[]) => items.filter((i) => i.week === w.no).length;
          return (
            <div key={w.label} className="wk">
              <small>{w.label}</small>
              <b>{w.theme}</b>
              <span>{n(missions)} missions · {n(holidayWorkouts)} workouts<br />{n(nextPerks)} perks · {n(resources)} resources</span>
              <div className="li" style={{ marginTop: 10, justifyContent: "space-between" }}>
                <span title={w.status === "ready" ? "Done, hidden until it unlocks" : undefined} className={`pill ${w.status === "live" ? "tag-live" : w.status === "draft" ? "tag-draft" : ""}`}>
                  {w.status === "live" ? "Live" : w.status === "ready" ? "Ready" : "Draft"}
                </span>
                <button className="mini ghost" type="button">{w.status === "live" ? "View" : "Edit"}</button>
              </div>
            </div>
          );
        })}
        <div className="wk fin">
          <small>25–26 JAN</small>
          <b>Finale &amp; celebration</b>
          <span>Prizes · Australia Day</span>
        </div>
      </div>
    </div>
  );
}
