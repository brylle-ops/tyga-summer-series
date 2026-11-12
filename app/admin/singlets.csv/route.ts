import { buildSingletGrid, toSupplierCsv } from "@/lib/admin-report";
import { fetchAll } from "@/lib/paging";
import { isStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

// Supplier order download (staff only).
export async function GET() {
  if (!(await isStaff())) return new Response("Staff only", { status: 403 });
  const db = createAdminClient();
  const data = await fetchAll<Parameters<typeof buildSingletGrid>[0][number]>((a, b) =>
    db.from("registrations").select("fit, colour, size, payment_status, amount_cents").order("profile_id").range(a, b));
  return new Response(toSupplierCsv(buildSingletGrid(data)), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="tyga-singlets.csv"' },
  });
}
