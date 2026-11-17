import Link from "next/link";
import { WithPhoto } from "@/components/Avatar";
import { avatarUrls } from "@/lib/avatars";
import { redirect } from "next/navigation";
import { Pill, Wordmark } from "@/components/ui";
import { fetchAll } from "@/lib/paging";
import { COUNTED, memberStats, sessionDaysByWeek, type Mission } from "@/lib/series";
import { loadEveryone, seriesWeekNow } from "@/lib/series-data";
import { isStaff, supabaseReady } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

type P = { id: string; email: string; first_name: string | null; last_name: string | null; mobile: string | null; goal: string | null; role: string; created_at: string; holiday_until: string | null };
const day = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Sydney" }) : "—");

// Backend: everyone who has signed up, with their progress. Staff only; shows full names, emails and mobiles.
export default async function Members({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  if (!supabaseReady()) return <p style={{ padding: 24 }}>Connect Supabase to see members.</p>;
  if (!(await isStaff())) redirect("/login");
  const { q } = await searchParams;
  const week = seriesWeekNow();
  const db = createAdminClient();
  const [profiles, regs, { everyone, missions }] = await Promise.all([
    fetchAll<P>((a, b) => db.from("profiles").select("id, email, first_name, last_name, mobile, goal, role, created_at, holiday_until").order("created_at", { ascending: false }).range(a, b)),
    fetchAll<{ profile_id: string; payment_status: string; size: string | null }>((a, b) => db.from("registrations").select("profile_id, payment_status, size").order("profile_id").range(a, b)),
    loadEveryone(),
  ]);
  const byId = new Map(missions.map((m) => [Number(m.id), m]));
  const stats = new Map(everyone.map((e) => {
    const done = e.done.map((id) => byId.get(id)).filter(Boolean) as Mission[];
    const last = e.checkins.filter((c) => COUNTED.includes(c.kind) && c.status === "confirmed").map((c) => c.day).sort().at(-1) ?? null;
    return [e.profile.id, { ...memberStats(e.checkins, done, week), last, thisWeek: sessionDaysByWeek(e.checkins).get(week)?.length ?? 0 }];
  }));
  const reg = new Map(regs.map((r) => [r.profile_id, r]));
  const needle = (q ?? "").trim().toLowerCase();
  const rows = profiles.filter((p) => !needle || `${p.first_name ?? ""} ${p.last_name ?? ""} ${p.email}`.toLowerCase().includes(needle));
  const photos = await avatarUrls(rows.slice(0, 500).map((p) => p.id));

  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li"><Wordmark short size={26} /><span className="eyebrow" style={{ marginLeft: 10 }}>Members</span></div>
          <div className="li" style={{ gap: 8, flexWrap: "wrap" }}>
            <Pill>{profiles.length} signed up</Pill>
            <Pill>{profiles.filter((p) => p.first_name).length} named</Pill>
            <Pill>{regs.filter((r) => r.payment_status === "paid").length} singlets paid</Pill>
          </div>
        </div>
        <form className="li" style={{ gap: 8, margin: "4px 0 12px" }}>
          <input name="q" defaultValue={q ?? ""} placeholder="Search name or email" aria-label="Search members" style={{ flex: 1, height: 40, borderRadius: 10, border: "1px solid rgba(0,0,0,.2)", padding: "0 12px", font: "inherit" }} />
          <button className="mini" type="submit" style={{ height: 40 }}>Search</button>
        </form>
        <div className="card">
          <div className="tablewrap"><table>
            <thead><tr><th>Member</th><th>Email</th><th>Mobile</th><th>Goal</th><th className="n">Points</th><th className="n">This week</th><th>Last session</th><th>Singlet</th><th>Joined</th></tr></thead>
            <tbody>
              {rows.map((p) => {
                const s = stats.get(p.id);
                const r = reg.get(p.id);
                return (
                  <tr key={p.id}>
                    <td><WithPhoto url={photos.get(p.id)} name={`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "?"}><Link prefetch={false} href={`/admin/members/${p.id}`}>{`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "(no name yet)"}</Link></WithPhoto>{p.role === "staff" ? " · staff" : ""}</td>
                    <td>{p.email}</td><td>{p.mobile ?? "—"}</td><td>{p.goal ?? "—"}</td>
                    <td className="n"><b>{s?.points ?? 0}</b></td><td className="n">{s ? `${s.thisWeek}/3` : "—"}</td>
                    <td>{day(s?.last ?? null)}</td>
                    <td>{r?.payment_status === "paid" ? `Paid${r.size ? ` · ${r.size}` : ""}` : "—"}</td>
                    <td>{day(p.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
          {rows.length === 0 && <p className="sm mute">No members match.</p>}
        </div>
      </div>
    </div>
  );
}
