import Link from "next/link";
import { redirect } from "next/navigation";
import { Pill, Wordmark } from "@/components/ui";
import { redeemPerk } from "@/app/series/actions";
import { buildDashboard, type DashRow } from "@/lib/dashboard";
import { loadEveryone, seriesWeekNow } from "@/lib/series-data";
import { isStaff, supabaseReady } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const lastSeen = (d: string | null) => (d ? new Date(`${d}T12:00:00+11:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "—");
const textHref = (m: string) => `sms:${m.replace(/[^\d+]/g, "")}`;

// Amy's dashboard: who is on top, who is consistent, and who has earned (or nearly earned) a perk. Staff only.
export default async function Leaderboard() {
  if (!supabaseReady()) return <p style={{ padding: 24 }}>Connect Supabase to see live data.</p>;
  if (!(await isStaff())) redirect("/login");
  const week = seriesWeekNow();
  const [{ everyone, missions }, { data: reds }] = await Promise.all([
    loadEveryone(),
    createAdminClient().from("perk_redemptions").select("profile_id, perk_key"),
  ]);
  const d = buildDashboard(everyone, missions, week, new Set((reds ?? []).map((r) => `${r.profile_id}:${r.perk_key}`)));
  const top = d.rows.slice(0, 10);
  const readyTotal = d.perks.reduce((a, p) => a + p.ready.length, 0);

  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li">
            <Wordmark short size={26} />
            <span className="eyebrow" style={{ marginLeft: 10 }}>Leaderboard &amp; perks</span>
          </div>
          <div className="li" style={{ gap: 8, flexWrap: "wrap" }}>
            <Pill>{week >= 1 ? `Week ${week}` : "Starts Mon 7 Dec"}</Pill>
            <Link className="mini ghost" href="/admin">‹ Admin</Link>
            <a className="mini" href="/admin/leaderboard.csv">Download CSV</a>
          </div>
        </div>

        <div className="desk-grid">
          <div className="card kpi"><small>Participants</small><b>{d.rows.length}</b><small>named members signed up</small></div>
          <div className="card kpi"><small>At 3/3 this week</small><b>{d.hitThisWeek}</b><small>{d.rows.length ? Math.round((d.hitThisWeek / d.rows.length) * 100) : 0}% of participants</small></div>
          <div className="card kpi"><small>Average points</small><b>{d.avgPoints}</b><small>across everyone</small></div>
          <div className="cream-card kpi"><small style={{ color: "var(--ink-mute)" }}>Perks to hand out</small><b>{readyTotal}</b><small style={{ color: "var(--ink-mute)" }}>earned, not redeemed</small></div>

          <div className="card span4">
            <div className="li" style={{ marginBottom: 6 }}><b className="grow">Top 10</b><span className="xs mute">by points · full names are staff-only</span></div>
            {top.length === 0 ? <p className="sm mute">No members yet. They appear here once they sign up and add their name.</p> : (
              <div className="tablewrap"><table>
                <thead><tr><th>#</th><th>Member</th><th className="n">Points</th><th>Level</th><th className="n">This week</th><th className="n">Weeks at 3/3</th><th className="n">Streak</th><th>Last session</th></tr></thead>
                <tbody>
                  {top.map((r) => (
                    <tr key={r.id}>
                      <td>{r.rank}</td><td>{r.name}</td><td className="n"><b>{r.points}</b></td><td>{r.level} · {r.levelName}</td>
                      <td className="n">{r.sessionsThisWeek}/3</td><td className="n">{r.weeksHit3}</td><td className="n">{r.streak} wk</td><td>{lastSeen(r.lastSession)}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>

          {d.perks.map((p) => (
            <div className="card span2" key={p.key}>
              <div className="li" style={{ marginBottom: 6 }}>
                <b className="grow">{p.title}</b><Pill>Level {p.level}</Pill>
              </div>
              <PerkList title={`Earned, to hand out (${p.ready.length})`} rows={p.ready} perk={p.key} redeemable empty="Nobody has reached this level yet." />
              <PerkList title={`Close, within 25 pts (${p.close.length})`} rows={p.close} perk={p.key} empty="Nobody is close yet." showGap />
              {p.redeemed.length > 0 && <p className="xs mute" style={{ marginTop: 8 }}>Already redeemed: {p.redeemed.map((r) => r.name).join(", ")}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerkList({ title, rows, perk, redeemable = false, empty, showGap = false }: {
  title: string; rows: DashRow[]; perk: string; redeemable?: boolean; empty: string; showGap?: boolean;
}) {
  return (
    <div style={{ marginTop: 10 }}>
      <div className="eyebrow">{title}</div>
      {rows.length === 0 ? <p className="xs mute" style={{ marginTop: 4 }}>{empty}</p> : (
        <div className="tablewrap"><table><tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td className="n">{showGap ? `${r.pointsToNext} pts to go` : `${r.points} pts`}</td>
              <td>{r.mobile && <a className="mini ghost" href={textHref(r.mobile)}>Text</a>}</td>
              <td>{redeemable && (
                <form action={redeemPerk}>
                  <input type="hidden" name="profile" value={r.id} /><input type="hidden" name="perk" value={perk} />
                  <button className="mini" type="submit">Mark redeemed</button>
                </form>
              )}</td>
            </tr>
          ))}
        </tbody></table></div>
      )}
    </div>
  );
}
