import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Pill, Wordmark } from "@/components/ui";
import Avatar from "@/components/Avatar";
import { avatarUrls } from "@/lib/avatars";
import { approved, memberStats, pointsByWeek, sessionDaysByWeek, type Checkin, type Mission } from "@/lib/series";
import { loadEveryone, seriesWeekNow } from "@/lib/series-data";
import { isStaff, supabaseReady } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const KIND: Record<string, string> = { yard: "Yard session", run: "Run", workout: "Workout", recovery: "Recovery", rest: "Rest day" };
const STATUS: Record<string, string> = { confirmed: "Counted", pending: "Waiting for approval", rejected: "Rejected" };
const day = (d: string) => new Date(`${d}T12:00:00+11:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "Australia/Sydney" });

// Backend: one member's results — photo, points, sessions and missions (approved and waiting). Staff only.
export default async function MemberDetail({ params }: { params: Promise<{ id: string }> }) {
  if (!supabaseReady()) return <p style={{ padding: 24 }}>Connect Supabase to see members.</p>;
  if (!(await isStaff())) redirect("/login");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = createAdminClient();
  const [{ data: p }, { data: checkins }, { data: done }, { missions }, photos] = await Promise.all([
    db.from("profiles").select("*").eq("id", id).maybeSingle(),
    db.from("checkins").select("day, kind, status").eq("profile_id", id).order("day", { ascending: false }),
    db.from("mission_completions").select("*").eq("profile_id", id).order("created_at", { ascending: false }),
    loadEveryone(),
    avatarUrls([id]),
  ]);
  if (!p) notFound();
  const week = seriesWeekNow();
  const byId = new Map(missions.map((m) => [Number(m.id), m]));
  const rows = (done ?? []) as { mission_id: number; created_at: string; status?: string }[];
  const counted = rows.filter(approved).map((d) => byId.get(Number(d.mission_id))).filter(Boolean) as Mission[];
  const list = (checkins ?? []) as Checkin[];
  const s = memberStats(list, counted, week);
  const perWeek = pointsByWeek(list, counted);
  const sessions = sessionDaysByWeek(list);
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "(no name yet)";
  const initials = `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li"><Wordmark short size={26} /><span className="eyebrow" style={{ marginLeft: 10 }}>Member</span></div>
          <Link prefetch={false} href="/admin/members" className="mini ghost">All members</Link>
        </div>
        <div className="card li" style={{ gap: 14 }}>
          <Avatar url={photos.get(id)} initials={initials} className="av av-lg" />
          <div className="grow">
            <b style={{ fontSize: 18 }}>{name}</b>
            <div className="xs mute">{p.email}{p.mobile ? ` · ${p.mobile}` : ""}{p.goal ? ` · Goal: ${p.goal}` : ""}</div>
          </div>
          <div className="li" style={{ gap: 6, flexWrap: "wrap" }}>
            <Pill>{s.points} pts</Pill>
            <Pill>Level {s.level}</Pill>
            <Pill>{rows.filter((r) => !approved(r)).length} waiting</Pill>
          </div>
        </div>

        <div className="card">
          <b>Week by week</b>
          <div className="tablewrap"><table>
            <thead><tr><th>Week</th><th className="n">Sessions</th><th className="n">Points</th></tr></thead>
            <tbody>
              {Array.from({ length: Math.max(1, Math.min(7, week)) }, (_, i) => i + 1).map((w) => (
                <tr key={w}><td>Week {w}</td><td className="n">{Math.min(3, sessions.get(w)?.length ?? 0)}/3</td><td className="n">{perWeek.get(w) ?? 0}</td></tr>
              ))}
            </tbody>
          </table></div>
        </div>

        <div className="card">
          <b>Missions ({rows.length})</b>
          {rows.length === 0 ? <p className="sm mute">No missions ticked yet.</p> : (
            <div className="tablewrap"><table>
              <thead><tr><th>Mission</th><th className="n">Week</th><th className="n">Points</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const m = byId.get(Number(r.mission_id));
                  return (
                    <tr key={r.mission_id}>
                      <td>{m?.title ?? `#${r.mission_id}`}</td><td className="n">{m?.week ?? "—"}</td>
                      <td className="n">{m ? m.points * (m.double ? 2 : 1) : "—"}</td>
                      <td>{approved(r) ? "Approved" : <Link prefetch={false} href="/admin/missions">Waiting · review</Link>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          )}
        </div>

        <div className="card">
          <b>Sessions logged ({list.length})</b>
          {list.length === 0 ? <p className="sm mute">Nothing logged yet.</p> : (
            <div className="tablewrap"><table>
              <thead><tr><th>Day</th><th>What</th><th>Status</th></tr></thead>
              <tbody>
                {list.slice(0, 120).map((c, i) => (
                  <tr key={`${c.day}-${c.kind}-${i}`}><td>{day(c.day)}</td><td>{KIND[c.kind] ?? c.kind}</td><td>{STATUS[c.status] ?? c.status}</td></tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>
    </div>
  );
}
