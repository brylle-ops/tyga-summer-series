import { redirect } from "next/navigation";
import { WithPhoto } from "@/components/Avatar";
import { avatarUrls } from "@/lib/avatars";
import { reviewCheckin } from "@/app/series/actions";
import { seriesDayNow } from "@/lib/series-data";
import { isStaff, supabaseReady } from "@/lib/session";
import { memberSearchFilter, sanitiseSearch, STAFF_KINDS } from "@/lib/staff-checkin";
import { createAdminClient } from "@/lib/supabase/admin";
import { staffLogCheckin } from "./actions";

const MESSAGES: Record<string, string> = { logged: "Session logged.", error: "That did not save. Try again.", exists: "That session is already logged for today. Approve or reject pending Yard sessions above." };
const LABEL: Record<string, string> = { yard: "Yard", run: "Run", workout: "Workout", recovery: "Recovery", rest: "Rest" };
const nameOf = (f: string | null, l: string | null, email: string) => [f, l].filter(Boolean).join(" ") || email;

// Staff desk: log a session for a member, and approve today's pending Yard check-ins. Staff only.
export default async function AdminCheckin({ searchParams }: { searchParams: Promise<{ q?: string; m?: string }> }) {
  if (!supabaseReady()) return <p style={{ padding: 24 }}>Connect Supabase to use check-in.</p>;
  if (!(await isStaff())) redirect("/home");
  const { q: rawQ, m } = await searchParams;
  const q = sanitiseSearch(rawQ);
  const filter = memberSearchFilter(q);
  const today = seriesDayNow();
  const db = createAdminClient();
  const [{ data: pendingRows }, matches] = await Promise.all([
    db.from("checkins").select("id, day, profile_id, profiles(first_name, last_name, email)").eq("status", "pending").eq("kind", "yard").order("day").order("id"),
    filter
      ? db.from("profiles").select("id, first_name, last_name, email").or(filter).order("first_name").limit(20)
      : Promise.resolve({ data: [] as { id: string; first_name: string | null; last_name: string | null; email: string }[] }),
  ]);
  const pending = (pendingRows ?? []).map((r) => {
    const p = r.profiles as unknown as { first_name: string | null; last_name: string | null; email: string } | null;
    return { id: Number(r.id), pid: r.profile_id as string, day: r.day as string, email: p?.email ?? "", name: nameOf(p?.first_name ?? null, p?.last_name ?? null, p?.email ?? "Member") };
  });
  const people = matches.data ?? [];
  const photos = await avatarUrls([...pending.map((p) => p.pid), ...people.map((p) => p.id)]);

  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top"><b>Check-in · {today}</b></div>
        <div style={{ padding: 16, display: "grid", gap: 16 }}>
          {m && MESSAGES[m] && <p className="notice" role="status">{MESSAGES[m]}</p>}

          <section className="card">
            <b>Yard check-ins to approve ({pending.length})</b>
            {pending.length === 0 ? <p className="sm mute" style={{ marginTop: 6 }}>Nothing waiting.</p> : (
              <div className="tablewrap"><table><tbody>
                {pending.map((p) => (
                  <tr key={p.id}><td><WithPhoto url={photos.get(p.pid)} name={p.name} /><div className="xs mute">{p.email} · {p.day}</div></td><td>
                    <form action={reviewCheckin} className="li" style={{ gap: 8, justifyContent: "flex-end" }}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="mini" style={{ minHeight: 44 }} name="decision" value="approve" type="submit">Approve</button>
                      <button className="mini ghost" style={{ minHeight: 44 }} name="decision" value="reject" type="submit">Reject</button>
                    </form>
                  </td></tr>
                ))}
              </tbody></table></div>
            )}
          </section>

          <section className="card" style={{ display: "grid", gap: 12 }}>
            <b>Log a session for a member</b>
            <form method="get" className="ck-search" role="search">
              <input name="q" defaultValue={q} placeholder="Name or email" aria-label="Search members by name or email" maxLength={40} autoComplete="off" />
              <button type="submit">Search</button>
            </form>
            {q && people.length === 0 && <p className="sm mute">No members match &ldquo;{q}&rdquo;.</p>}
            {people.map((p) => (
              <form key={p.id} action={staffLogCheckin} className="card" style={{ background: "#121110" }}>
                <input type="hidden" name="profile_id" value={p.id} />
                <input type="hidden" name="q" value={q} />
                <WithPhoto url={photos.get(p.id)} name={nameOf(p.first_name, p.last_name, p.email)}><b>{nameOf(p.first_name, p.last_name, p.email)}</b></WithPhoto>
                <div className="xs mute">{p.email}</div>
                <div className="ck-kinds">
                  {STAFF_KINDS.map((k) => (
                    <button key={k} name="kind" value={k} type="submit" className={k === "recovery" || k === "rest" ? "alt" : ""}>{LABEL[k]}</button>
                  ))}
                </div>
              </form>
            ))}
            <p className="xs mute">Logs for today. Staff-logged Yard sessions count straight away.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
