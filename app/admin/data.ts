import "server-only";
import { buildSingletGrid, paymentSummary } from "@/lib/admin-report";
import { adminKpis, payments as examplePayments, singletOrder as exampleOrder, singletSizes } from "@/lib/mock-data";
import { isStaff, supabaseReady } from "@/lib/session";
import { SIZES } from "@/lib/singlet";
import { createAdminClient } from "@/lib/supabase/admin";

const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Sydney" }) : "—";

/** Real stage 1 numbers once Supabase is set up; the example data before that. (Page is staff-only via layout.) */
export async function loadAdminData() {
  if (!supabaseReady()) {
    return { real: false, registeredPaid: adminKpis.registeredPaid, pctOfActive: adminKpis.pctOfActive, payments: examplePayments,
      sizes: singletSizes, order: exampleOrder.map((r) => ({ ...r, total: r.counts.reduce((a, b) => a + b, 0) })), duplicates: 0, members: 0 };
  }
  if (!(await isStaff())) throw new Error("Staff only");
  const db = createAdminClient();
  const [{ data: regs }, { count: members }, { count: duplicates }] = await Promise.all([
    db.from("registrations").select("*, profiles(first_name, last_name, email, mobile)").order("updated_at", { ascending: false }),
    db.from("active_members").select("*", { count: "exact", head: true }),
    db.from("square_payments").select("*", { count: "exact", head: true }).eq("duplicate", true),
  ]);
  const list = regs ?? [];
  const sum = paymentSummary(list);
  const STATUS: Record<string, string> = { paid: "Paid", pending: "Started, not paid", unpaid: "Started, not paid", refunded: "Refunded" };
  const payments = list.filter((r) => r.payment_status !== "unpaid" || r.size).map((r) => {
    const p = r.profiles as { first_name: string | null; last_name: string | null; email: string; mobile: string | null } | null;
    return {
      name: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || p?.email || "—",
      mobile: p?.mobile ?? "",
      status: STATUS[r.payment_status],
      when: fmtDate(r.paid_at ?? r.updated_at),
      amount: r.payment_status === "paid" ? `$${((r.amount_cents ?? 0) / 100).toFixed(2)}` : "—",
    };
  });
  return {
    real: true, registeredPaid: sum.paid, pctOfActive: members ? Math.round((sum.paid / members) * 100) : 0,
    payments, sizes: [...SIZES], order: buildSingletGrid(list), duplicates: duplicates ?? 0, members: members ?? 0,
  };
}
