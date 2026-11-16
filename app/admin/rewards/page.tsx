import Link from "next/link";
import { redirect } from "next/navigation";
import { Pill, Wordmark } from "@/components/ui";
import { weekRange } from "@/lib/activity";
import { KIND_LABEL, rankWeek, type Reward } from "@/lib/rewards";
import { loadRewards, weekScores } from "@/lib/rewards-data";
import { seriesWeekNow } from "@/lib/series-data";
import { isStaff, supabaseReady } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadAnnouncements } from "@/lib/announcements-data";
import { addReward, confirmWinners, deleteAnnouncement, drawWinner, markCollected, postAnnouncement, removeWinner, saveReward } from "./actions";

const MESSAGES: Record<string, string> = {
  saved: "Saved.", added: "Reward added. It stays hidden until you tick Published.", "winners-ok": "Winners confirmed. They'll see it in the app.",
  "drawn-ok": "Winner drawn. They'll see it in the app.", collected: "Marked as collected.", removed: "Winner removed.",
  invalid: "Check the details and try again.", error: "Something went wrong. Try again.", winners: "Pick between 1 and the allowed number of ranked members.",
  badimage: "Image must be a PNG, JPG or WebP under 2 MB.", uploaderror: "The image could not be uploaded. Try again.",
  posted: "Announcement posted.", deleted: "Announcement deleted.", annerror: "Announcements are not ready yet (run migration 0007), or something went wrong.",
  drawn: "This draw already has its winner(s).", noentries: "Nobody has entered this draw yet.",
};
const fmt = (d: string | null) => (d ? new Date(`${d}T12:00:00+11:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "");

// Staff: preload and edit the seven reward weeks, pick winners, track collection. Members never see drafts.
export default async function AdminRewards({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  if (!supabaseReady()) return <p style={{ padding: 24 }}>Connect Supabase to manage rewards.</p>;
  if (!(await isStaff())) redirect("/login");
  const { m } = await searchParams;
  const week = seriesWeekNow();
  const db = createAdminClient();
  const [rewards, { data: entries }, { data: winners }, redeemRes, announcements] = await Promise.all([
    loadRewards(),
    db.from("reward_entries").select("reward_id"),
    db.from("reward_winners").select("reward_id, profile_id, announced, collected_at"),
    db.from("reward_redemptions").select("reward_id, profile_id, redeemed_at").order("redeemed_at", { ascending: false }),
    loadAnnouncements(10),
  ]);
  if (redeemRes.error) console.error("[admin redemptions]", redeemRes.error.message);
  const redemptions = redeemRes.data ?? [];
  const names = new Map<string, string>();
  const ids = [...new Set([...(winners ?? []).map((w) => w.profile_id as string), ...redemptions.map((x) => x.profile_id as string)])];
  if (ids.length) {
    const { data: ps } = await db.from("profiles").select("id, first_name, last_name").in("id", ids);
    for (const p of ps ?? []) names.set(p.id as string, `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Member");
  }
  const entryCount = (id: number) => (entries ?? []).filter((e) => Number(e.reward_id) === id).length;
  const redeemedOf = (id: number) => redemptions.filter((x) => Number(x.reward_id) === id);
  const winnersOf = (id: number) => (winners ?? []).filter((w) => Number(w.reward_id) === id);
  const scoresCache = new Map<number, Awaited<ReturnType<typeof weekScores>>>();
  const scores = async (w: number) => { if (!scoresCache.has(w)) scoresCache.set(w, await weekScores(w)); return scoresCache.get(w)!; };

  const cards = await Promise.all(rewards.map(async (r) => ({ r, ranking: r.kind === "leaderboard" ? rankWeek(await scores(r.week), 1000) : null })));

  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li"><Wordmark short size={26} /><span className="eyebrow" style={{ marginLeft: 10 }}>Rewards &amp; perks</span></div>
          <div className="li" style={{ gap: 8, flexWrap: "wrap" }}>
            <Pill>{week >= 1 ? `Week ${week}` : "Starts Mon 7 Dec"}</Pill>
            <Link className="mini ghost" href="/admin">‹ Admin</Link>
          </div>
        </div>
        {m && MESSAGES[m] && <p className="notice" role="status">{MESSAGES[m]}</p>}
        <p className="sm mute">Each reward unlocks for members on its Monday at 12:00 am, but only if <b>Published</b> is ticked. Unpublished weeks show as COMING SOON.</p>

        <div className="desk-grid">
          {cards.map(({ r, ranking }) => (
            <div className="card span4" key={r.id} id={`r${r.id}`}>
              <div className="li" style={{ marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
                <b className="grow">Week {r.week} · {r.title}</b>
                <span className="xs mute">{weekRange(r.week)}</span>
                <Pill>{KIND_LABEL[r.kind]}</Pill>
                <Pill>{r.published ? (r.week <= week ? "Live" : "Scheduled") : "Draft"}</Pill>
              </div>

              <p className="xs mute" style={{ margin: "4px 0" }}>Entries: {entryCount(r.id)} · Redeemed: {redeemedOf(r.id).length}</p>
              {redeemedOf(r.id).length > 0 && (
                <details>
                  <summary className="xs" style={{ cursor: "pointer" }}>Who redeemed ({redeemedOf(r.id).length})</summary>
                  <ul className="xs" style={{ margin: "6px 0", paddingLeft: 18 }}>
                    {redeemedOf(r.id).map((x) => (
                      <li key={x.profile_id as string}>{names.get(x.profile_id as string) ?? "Member"} · {fmt(String(x.redeemed_at).slice(0, 10))}</li>
                    ))}
                  </ul>
                </details>
              )}

              <RewardForm r={r} />

              {r.kind === "leaderboard" && ranking && (
                <div style={{ marginTop: 12 }}>
                  <div className="eyebrow">Week {r.week} leaderboard · pick up to {r.winners_count} verified winners</div>
                  {r.week >= week && <p className="xs mute">Week {r.week} is still running. Confirm winners after the weekly cutoff.</p>}
                  {ranking.tiedAtCutoff.length > 0 && <p className="notice">Tie at the cutoff. Ranked by points, then sessions that week. You decide who gets the last place(s).</p>}
                  {winnersOf(r.id).length === 0 && ranking.rows.length > 0 && (
                    <form action={confirmWinners}>
                      <input type="hidden" name="id" value={r.id} />
                      <div className="tablewrap"><table>
                        <thead><tr><th></th><th>#</th><th>Member</th><th className="n">Points</th><th className="n">Sessions</th></tr></thead>
                        <tbody>
                          {ranking.rows.slice(0, r.winners_count + 5).map((x) => (
                            <tr key={x.id}>
                              <td><input type="checkbox" name="ids" value={x.id} defaultChecked={x.inTop && !ranking.tiedAtCutoff.includes(x.id)} aria-label={`Pick ${x.name}`} /></td>
                              <td>{x.rank}</td><td>{x.name}{ranking.tiedAtCutoff.includes(x.id) ? " (tied)" : ""}</td><td className="n">{x.points}</td><td className="n">{x.sessions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table></div>
                      <button className="mini" type="submit" style={{ marginTop: 8 }}>Confirm winners and notify</button>
                    </form>
                  )}
                  {ranking.rows.length === 0 && <p className="xs mute">No points scored in this week yet.</p>}
                </div>
              )}

              {r.kind === "draw" && (
                <div style={{ marginTop: 12 }}>
                  <div className="li"><b className="grow">{entryCount(r.id)} {entryCount(r.id) === 1 ? "entry" : "entries"}</b>
                    {winnersOf(r.id).length < r.winners_count && (
                      <form action={drawWinner}><input type="hidden" name="id" value={r.id} /><button className="mini" type="submit">Draw winner and notify</button></form>
                    )}
                  </div>
                </div>
              )}

              {winnersOf(r.id).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="eyebrow">Winners</div>
                  <div className="tablewrap"><table><tbody>
                    {winnersOf(r.id).map((w) => (
                      <tr key={w.profile_id as string}>
                        <td>{names.get(w.profile_id as string) ?? "Member"}</td>
                        <td>{w.collected_at ? `Collected ${fmt(String(w.collected_at).slice(0, 10))}` : "Not collected yet"}</td>
                        <td>
                          {!w.collected_at && (
                            <form action={markCollected}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="profile" value={w.profile_id as string} />
                              <button className="mini" type="submit">Mark collected</button></form>
                          )}
                        </td>
                        <td>
                          <form action={removeWinner}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="profile" value={w.profile_id as string} />
                            <button className="mini ghost" type="submit">Remove</button></form>
                        </td>
                      </tr>
                    ))}
                  </tbody></table></div>
                </div>
              )}
            </div>
          ))}

          <div className="card span4">
            <b>Announcements</b>
            <p className="xs mute">Shown to members in Notifications for 7 days (title up to 80, message up to 300 characters).</p>
            <form action={postAnnouncement} className="rform">
              <label>Title<input name="title" maxLength={80} required /></label>
              <label className="wide">Message<input name="body" maxLength={300} required /></label>
              <button className="mini" type="submit">Post announcement</button>
            </form>
            {announcements.length === 0 ? <p className="xs mute">No announcements yet.</p> : (
              <div className="tablewrap"><table><tbody>
                {announcements.map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.title}</b><br /><span className="xs mute">{a.body}</span></td>
                    <td className="xs">{fmt(a.created_at.slice(0, 10))}</td>
                    <td><form action={deleteAnnouncement}><input type="hidden" name="id" value={a.id} /><button className="mini ghost" type="submit">Delete</button></form></td>
                  </tr>
                ))}
              </tbody></table></div>
            )}
          </div>

          <div className="card span4">
            <b>Add a local business collaboration or extra reward</b>
            <p className="xs mute">Added as a draft. Edit it above and tick Published when it&apos;s ready.</p>
            <form action={addReward} className="rform">
              <label>Week<select name="week" defaultValue="3">{[1, 2, 3, 4, 5, 6, 7].map((w) => <option key={w} value={w}>Week {w}</option>)}</select></label>
              <label>Type<select name="kind" defaultValue="partner">{Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
              <label>Title<input name="title" maxLength={80} required /></label>
              <label>Business<input name="partner" maxLength={80} /></label>
              <label className="wide">Description<input name="description" maxLength={300} /></label>
              <button className="mini" type="submit">Add reward</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardForm({ r }: { r: Reward }) {
  return (
    <details>
      <summary className="mini ghost" style={{ display: "inline-block", cursor: "pointer" }}>Edit details</summary>
      <form action={saveReward} className="rform" encType="multipart/form-data">
        <input type="hidden" name="id" value={r.id} />
        <label>Title<input name="title" defaultValue={r.title} maxLength={80} required /></label>
        <label>Business / partner<input name="partner" defaultValue={r.partner} maxLength={80} /></label>
        <label className="wide">Description<input name="description" defaultValue={r.description} maxLength={300} /></label>
        <label className="wide">Eligibility<input name="eligibility" defaultValue={r.eligibility} maxLength={300} /></label>
        <label className="wide">How to enter / claim / redeem<input name="how_to" defaultValue={r.how_to} maxLength={300} /></label>
        <label>Discount / voucher code<input name="code" defaultValue={r.code ?? ""} maxLength={40} /></label>
        <label>Expires<input name="expires_on" type="date" defaultValue={r.expires_on ?? ""} /></label>
        <label>Winners<input name="winners_count" type="number" min={1} max={50} defaultValue={r.winners_count} /></label>
        <label className="wide">Logo / image link (https)<input name="image_url" type="url" defaultValue={r.image_url ?? ""} maxLength={500} placeholder="https://" /></label>
        <label className="wide">Upload logo / image (PNG, JPG or WebP, max 2 MB)<input name="image_file" type="file" accept="image/png,image/jpeg,image/webp" /></label>
        <label className="check"><input name="published" type="checkbox" defaultChecked={r.published} /> Published (unlocks on its Monday)</label>
        <button className="mini" type="submit">Save</button>
      </form>
    </details>
  );
}
