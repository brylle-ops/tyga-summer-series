import "server-only";
import { buildSingletGrid, paymentSummary } from "@/lib/admin-report";
import { adminKpis, payments as examplePayments, singletOrder as exampleOrder, singletSizes } from "@/lib/mock-data";
import { isStaff, supabaseReady } from "@/lib/session";
import { SIZES } from "@/lib/singlet";
import { createAdminClient } from "@/lib/supabase/admin";
import { followUps as exampleFollowUps } from "@/lib/mock-data";
import { loadEveryone, seriesWeekNow } from "@/lib/series-data";
import { alburyDay, followUpFlags, sessionDaysByWeek, shortName } from "@/lib/series";

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

/** Stage 2 admin: follow-ups, 3/3 last week, Yard sessions waiting for the roster. */
export async function loadSeriesAdmin() {
  const week = seriesWeekNow();
  if (!supabaseReady()) {
    return { real: false, week: 3, hit3Last: 97, pctHit: 66, pending: [] as { id: number; name: string; day: string }[], followUps: exampleFollowUps, lastSync: "Today 6:42am" };
  }
  if (!(await isStaff())) throw new Error("Staff only");
  const db = createAdminClient();
  const { everyone } = await loadEveryone();
  const today = alburyDay(new Date());
  const hit3Last = everyone.filter((e) => (sessionDaysByWeek(e.checkins).get(week - 1)?.length ?? 0) >= 3).length;
  const followUps = everyone.map((e) => {
    const flags = followUpFlags(e.checkins, today, e.profile.holiday_until ?? null, week);
    const last = e.checkins.filter((c) => c.status !== "rejected" && ["yard", "run", "workout"].includes(c.kind)).map((c) => c.day).sort().at(-1);
    return { name: shortName(e.profile.first_name, e.profile.last_name).name, last: last ?? "—",
      week: `${Math.min(3, sessionDaysByWeek(e.checkins).get(week)?.length ?? 0)}/3`, flags, away: Boolean(e.profile.holiday_until && e.profile.holiday_until >= today) };
  }).filter((f) => f.flags.length).sort((a, b) => b.flags.length - a.flags.length);
  const { data: pendingRows } = await db.from("checkins").select("id, day, profiles(first_name, last_name)").eq("status", "pending").order("day");
  const pending = (pendingRows ?? []).map((r) => {
    const p = r.profiles as unknown as { first_name: string | null; last_name: string | null };
    return { id: Number(r.id), day: r.day as string, name: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Member" };
  });
  const { data: sync } = await db.from("active_members").select("uploaded_at").order("uploaded_at", { ascending: false }).limit(1);
  const lastSync = sync?.[0]?.uploaded_at
    ? new Date(sync[0].uploaded_at).toLocaleString("en-AU", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" }) : "never";
  return { real: true, week, hit3Last, pctHit: everyone.length ? Math.round((hit3Last / everyone.length) * 100) : 0, pending, followUps, lastSync };
}
