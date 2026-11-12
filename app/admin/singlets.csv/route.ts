import { buildSingletGrid, toSupplierCsv } from "@/lib/admin-report";
import { isStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

// Supplier order download (staff only).
export async function GET() {
  if (!(await isStaff())) return new Response("Staff only", { status: 403 });
  const { data } = await createAdminClient().from("registrations").select("fit, colour, size, payment_status, amount_cents");
  return new Response(toSupplierCsv(buildSingletGrid(data ?? [])), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="tyga-singlets.csv"' },
  });
}
