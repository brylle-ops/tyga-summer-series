import { redirect } from "next/navigation";
import { Pill, Wordmark } from "@/components/ui";
import { isStaff, supabaseReady } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import ConfirmButton from "@/components/ConfirmButton";
import { addMission, revokeCompletion } from "../../series/actions";
import { seriesWeekNow } from "@/lib/series-data";
import { seriesWeeks } from "@/lib/mock-data";

type C = { profile_id: string; mission_id: number; created_at: string; proof_path?: string | null };
const when = (d: string) => new Date(d).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });

// Backend: latest mission completions, with photo proof and a Revoke button. Staff only.
export default async function MissionCheck({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m: notice } = await searchParams;
  if (!supabaseReady()) return <p style={{ padding: 24 }}>Connect Supabase to see missions.</p>;
  if (!(await isStaff())) redirect("/login");
  const db = createAdminClient();
  let res = await db.from("mission_completions").select("profile_id, mission_id, created_at, proof_path").order("created_at", { ascending: false }).limit(100);
  if (res.error) {
    // proof_path column missing (migration 0007 not run yet): list without photos.
    console.error("[admin missions]", res.error.message);
    res = await db.from("mission_completions").select("profile_id, mission_id, created_at").order("created_at", { ascending: false }).limit(100) as typeof res;
  }
  const rows = (res.data ?? []) as C[];
  const pids = [...new Set(rows.map((r) => r.profile_id))];
  const mids = [...new Set(rows.map((r) => r.mission_id))];
  const [{ data: profiles }, { data: missions }] = await Promise.all([
    pids.length ? db.from("profiles").select("id, first_name, last_name, email").in("id", pids) : Promise.resolve({ data: [] }),
    mids.length ? db.from("missions").select("id, title, week, points, double").in("id", mids) : Promise.resolve({ data: [] }),
  ]);
  const pById = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const mById = new Map((missions ?? []).map((m) => [Number(m.id), m]));
  const urls = new Map<string, string>();
  await Promise.all(rows.filter((r) => r.proof_path).map(async (r) => {
    const { data, error } = await db.storage.from("proofs").createSignedUrl(r.proof_path as string, 600);
    if (error) console.error("[proof url]", error.message);
    else if (data) urls.set(r.proof_path as string, data.signedUrl);
  }));

  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li"><Wordmark short size={26} /><span className="eyebrow" style={{ marginLeft: 10 }}>Mission check</span></div>
          <Pill>{rows.length} latest</Pill>
        </div>
        {notice === "added" && <p className="notice" role="status">Mission added.</p>}
        {notice === "live" && <p className="notice" role="alert">That week has already started — pick a later week.</p>}
        {notice === "invalid" && <p className="notice" role="alert">Add a title, a week (1–7) and points (0–100).</p>}
        <form action={addMission} className="card" style={{ display: "grid", gap: 8 }}>
          <b>Add a mission</b>
          <span className="xs mute">For a week that hasn&apos;t started yet — it stays hidden until that Monday.</span>
          <div className="li" style={{ gap: 8 }}>
            <select name="week" required aria-label="Week" className="mini ghost">
              {seriesWeeks.filter((w) => w.no > seriesWeekNow()).map((w) => <option key={w.no} value={w.no}>Week {w.no}</option>)}
            </select>
            <input name="points" type="number" min={0} max={100} defaultValue={10} aria-label="Points" style={{ width: 70 }} className="mini ghost" />
            <label className="xs li" style={{ gap: 4 }}><input type="checkbox" name="double" /> 2× points</label>
          </div>
          <input name="title" required maxLength={80} placeholder="Mission title" aria-label="Mission title" className="mini ghost" style={{ textAlign: "left" }} />
          <input name="detail" maxLength={140} placeholder="Short detail (optional)" aria-label="Mission detail" className="mini ghost" style={{ textAlign: "left" }} />
          <button className="mini" type="submit">Add mission</button>
        </form>
        {notice === "revoked" && <p className="notice" role="status">Completion revoked.</p>}
        {notice === "error" && <p className="notice" role="alert">Could not revoke that completion. Please try again.</p>}
        <div className="card">
          <div className="tablewrap"><table>
            <thead><tr><th>Member</th><th>Mission</th><th className="n">Week</th><th>When</th><th className="n">Points</th><th>Photo</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const p = pById.get(r.profile_id);
                const m = mById.get(r.mission_id);
                const name = `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || p?.email || "(unknown)";
                const url = r.proof_path ? urls.get(r.proof_path) : undefined;
                return (
                  <tr key={`${r.profile_id}-${r.mission_id}`}>
                    <td>{name}</td><td>{m?.title ?? `#${r.mission_id}`}</td><td className="n">{m?.week ?? "—"}</td>
                    <td>{when(r.created_at)}</td>
                    <td className="n">{m ? m.points * (m.double ? 2 : 1) : "—"}</td>
                    <td>{url ? <a href={url} target="_blank" rel="noopener noreferrer">View photo</a> : "—"}</td>
                    <td>
                      <form action={revokeCompletion}>
                        <input type="hidden" name="profile" value={r.profile_id} />
                        <input type="hidden" name="mission" value={r.mission_id} />
                        <ConfirmButton className="mini" message="Revoke this completion? The member loses the points and any photo is deleted.">Revoke</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
          {rows.length === 0 && <p className="sm mute">No completions yet.</p>}
        </div>
      </div>
    </div>
  );
}
