import { redirect } from "next/navigation";
import { Pill, Wordmark } from "@/components/ui";
import { fetchAll } from "@/lib/paging";
import { isStaff, supabaseReady } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

type Reg = {
  profile_id: string; fit: string | null; colour: string | null; size: string | null;
  payment_status: "unpaid" | "pending" | "paid" | "refunded"; amount_cents: number | null; paid_at: string | null;
};
type P = { id: string; email: string; first_name: string | null; last_name: string | null; mobile: string | null };

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const when = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Sydney" }) : "—");

// Backend: who ordered singlets. Staff only (the admin layout also guards); shows names, emails and mobiles.
export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!supabaseReady()) return <p style={{ padding: 24 }}>Connect Supabase to see orders.</p>;
  if (!(await isStaff())) redirect("/login");
  const { status } = await searchParams;
  const showAll = status === "all";
  const db = createAdminClient();
  const [regs, profiles, { count: duplicates }] = await Promise.all([
    fetchAll<Reg>((a, b) => db.from("registrations").select("profile_id, fit, colour, size, payment_status, amount_cents, paid_at").order("profile_id").range(a, b)),
    fetchAll<P>((a, b) => db.from("profiles").select("id, email, first_name, last_name, mobile").order("id").range(a, b)),
    db.from("square_payments").select("*", { count: "exact", head: true }).eq("duplicate", true),
  ]);
  const byId = new Map(profiles.map((p) => [p.id, p]));

  const paid = regs.filter((r) => r.payment_status === "paid");
  const pending = regs.filter((r) => r.payment_status === "pending");
  const revenue = paid.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const perSize = SIZES.map((s) => ({ size: s, n: paid.filter((r) => r.size === s).length })).filter((x) => x.n > 0);

  const rows = regs
    .filter((r) => showAll || r.payment_status === "paid" || r.payment_status === "pending")
    .map((r) => ({ r, p: byId.get(r.profile_id) }))
    .sort((a, b) => (b.r.paid_at ?? "").localeCompare(a.r.paid_at ?? ""));

  return (
    <div className="admin-page">
      <div className="desk">
        <div className="desk-top">
          <div className="li"><Wordmark short size={26} /><span className="eyebrow" style={{ marginLeft: 10 }}>Orders</span></div>
          <div className="li" style={{ gap: 8, flexWrap: "wrap" }}>
            <Pill>{paid.length} paid</Pill>
            <Pill>{pending.length} pending</Pill>
            <Pill>{money(revenue)} revenue</Pill>
            <a className="mini" href="/admin/singlets.csv">Download supplier CSV</a>
          </div>
        </div>
        {(duplicates ?? 0) > 0 && <p className="notice" role="alert">{duplicates} paid twice — refund in Square.</p>}
        <div className="card" style={{ marginBottom: 12 }}>
          <b>Paid singlets by size</b>
          <p className="sm" style={{ marginTop: 6 }}>{perSize.length ? perSize.map((x) => `${x.size}: ${x.n}`).join(" · ") : "No paid orders yet."}</p>
        </div>
        <div className="li" style={{ gap: 8, margin: "4px 0 12px" }}>
          <a className={showAll ? "mini ghost" : "mini"} href="/admin/orders?status=paid">Paid + pending</a>
          <a className={showAll ? "mini" : "mini ghost"} href="/admin/orders?status=all">All</a>
        </div>
        <div className="card">
          <div className="tablewrap"><table>
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Fit</th><th>Colour</th><th>Size</th><th>Status</th><th className="n">Amount</th><th>Paid</th></tr></thead>
            <tbody>
              {rows.map(({ r, p }) => (
                <tr key={r.profile_id}>
                  <td>{`${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || "(no name yet)"}</td>
                  <td>{p?.email ?? "—"}</td><td>{p?.mobile ?? "—"}</td>
                  <td>{r.fit ?? "—"}</td><td>{r.colour ?? "—"}</td><td>{r.size ?? "—"}</td>
                  <td>{r.payment_status}</td>
                  <td className="n">{r.amount_cents != null ? money(r.amount_cents) : "—"}</td>
                  <td>{when(r.paid_at)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          {rows.length === 0 && <p className="sm mute">No orders to show.</p>}
        </div>
      </div>
    </div>
  );
}
